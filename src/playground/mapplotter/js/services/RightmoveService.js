class RightmoveService {
    async fetchData(url) {
        // Try multiple proxies
        const proxies = [
            `https://corsproxy.io/?${encodeURIComponent(url)}`,
            `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
        ];

        let html = null;
        let diffError = null;

        for (const proxyUrl of proxies) {
            try {
                const response = await fetch(proxyUrl);

                if (!response.ok) throw new Error(`Proxy error: ${response.status}`);

                if (proxyUrl.includes('allorigins')) {
                    const data = await response.json();
                    html = data.contents;
                } else {
                    html = await response.text();
                }

                if (html) break;
            } catch (e) {
                console.warn(`Proxy failed:`, e);
                diffError = e;
            }
        }

        if (!html) {
            throw new Error('All proxies failed to fetch content. ' + (diffError ? diffError.message : ''));
        }

        // Strategy 1: Look for window.PAGE_MODEL
        const marker = 'window.PAGE_MODEL =';
        const markerIndex = html.indexOf(marker);

        if (markerIndex !== -1) {
            try {
                const startIndex = html.indexOf('{', markerIndex);
                if (startIndex !== -1) {
                    const jsonStr = extractJsonObject(html, startIndex);
                    if (jsonStr) {
                        const model = JSON.parse(jsonStr);
                        const p = model.propertyData;

                        if (p) {
                            return {
                                location: {
                                    latitude: p.location.latitude,
                                    longitude: p.location.longitude
                                },
                                price: p.prices.primaryPrice,
                                address: p.address.displayAddress,
                                images: p.images.map(img => img.url),
                                description: p.text && p.text.description ? p.text.description.substring(0, 200) + '...' : '',
                                url: url
                            };
                        }
                    }
                }
            } catch (e) {
                // Failed to parse PAGE_MODEL
            }
        }

        // Strategy 2: JSON-LD
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const scripts = doc.querySelectorAll('script[type="application/ld+json"]');

        for (const script of scripts) {
            try {
                const json = JSON.parse(script.textContent);
                const items = Array.isArray(json) ? json : [json];

                for (const item of items) {
                    const type = item['@type'];
                    const isResidence = type === 'Residence' ||
                        type === 'SingleFamilyResidence' ||
                        type === 'Apartment' ||
                        type === 'Place' ||
                        (Array.isArray(type) && type.includes('Residence'));

                    if (isResidence && item.geo) {
                        return {
                            location: {
                                latitude: parseFloat(item.geo.latitude),
                                longitude: parseFloat(item.geo.longitude)
                            },
                            price: '£' + (item.price || 'Unknown'),
                            address: item.address.streetAddress || item.name || 'Rightmove Property',
                            images: item.image ? (Array.isArray(item.image) ? item.image : [item.image]) : [],
                            url: url
                        };
                    }
                }
            } catch (e) {
                // JSON-LD parse error
            }
        }

        // Strategy 3: Meta tags
        try {
            const getMeta = (name) => {
                const tag = doc.querySelector(`meta[property="${name}"]`) || doc.querySelector(`meta[name="${name}"]`);
                return tag ? tag.content : null;
            };

            const lat = getMeta('og:latitude') || getMeta('place:location:latitude');
            const lon = getMeta('og:longitude') || getMeta('place:location:longitude');
            const title = getMeta('og:title');
            const image = getMeta('og:image');

            if (lat && lon) {
                return {
                    location: {
                        latitude: parseFloat(lat),
                        longitude: parseFloat(lon)
                    },
                    price: 'See Listing',
                    address: title || 'Rightmove Property',
                    images: image ? [image] : [],
                    url: url
                };
            }
        } catch (e) { /* Meta tag parse error */ }

        return null;
    }
}
