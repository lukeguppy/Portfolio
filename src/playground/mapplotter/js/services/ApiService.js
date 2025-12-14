class ApiService {
    async searchWithNominatim(query, center, radiusKm) {
        // Use a bounded query to prioritize local results
        const boundedQuery = `${query} near ${center.lat.toFixed(4)},${center.lng.toFixed(4)}`;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(boundedQuery)}&limit=50&addressdetails=1`, {
                headers: {
                    'User-Agent': 'MapPlotter/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Nominatim returned ${data.length} results`);

            // Filter by distance
            const results = data.filter(item => {
                if (!item.lat || !item.lon) return false;

                const distance = this.calculateDistance(
                    center.lat, center.lng,
                    parseFloat(item.lat), parseFloat(item.lon)
                );

                return distance <= radiusKm;
            });

            console.log(`Nominatim filtered to ${results.length} results within ${radiusKm}km`);

            return results.map(item => ({
                lat: parseFloat(item.lat),
                lon: parseFloat(item.lon),
                display_name: item.display_name,
                tags: { name: item.display_name },
                type: 'nominatim'
            }));

        } catch (error) {
            console.error('Nominatim search failed:', error);
            throw error;
        }
    }

    async searchOverpassDirect(query, center, radiusKm) {
        // Escape apostrophes for Overpass QL
        const escapedQuery = query.replace(/'/g, "\\'");

        // Try exact name match first, then case-insensitive
        const nameQueries = [
            `name="${escapedQuery}"`,  // Exact match (Fastest)
            `name~"${escapedQuery}"`, // Contains match (Slower)
            `name~"${escapedQuery}",i` // Case-insensitive match (Correct Overpass Syntax)
        ];

        for (const nameQuery of nameQueries) {
            try {
                const results = await this.searchOverpassTag(nameQuery, center, radiusKm);
                if (results.length > 0) {
                    console.log(`Name search "${nameQuery}" found ${results.length} results`);
                    return results;
                }
            } catch (error) {
                console.log(`Query "${nameQuery}" failed: ${error.message}`);
                continue;
            }
        }

        return [];
    }

    async searchOverpassTag(tag, center, radiusKm) {
        const radiusMeters = radiusKm * 1000;
        const lat = center.lat;
        const lng = center.lng;

        // Try both nodes, ways, and relations for better coverage
        const overpassQuery = `[out:json][timeout:15];
(
  node[${tag}](around:${radiusMeters},${lat},${lng});
  way[${tag}](around:${radiusMeters},${lat},${lng});
  relation[${tag}](around:${radiusMeters},${lat},${lng});
);
out center;`; // Use 'out center' to get single coordinate for Ways/Relations

        console.log(`Overpass query: ${overpassQuery}`);

        try {
            // AbortController for fetch timeout (20s)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 20000);

            const response = await fetch('https://overpass-api.de/api/interpreter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'data=' + encodeURIComponent(overpassQuery),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                // If it's a 400, it's likely a query syntax error (bad regex)
                if (response.status === 400) {
                    throw new Error('Overpass Syntax Error (400)');
                }
                throw new Error(`Overpass API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.remark && (data.remark.includes('runtime error') || data.remark.includes('timed out'))) {
                throw new Error(`Query timed out: ${data.remark}. Try reducing search radius or simpler search term.`);
            }

            const results = [];

            if (data.elements) {
                console.log(`Processing ${data.elements.length} elements from Overpass response`);
                data.elements.forEach(element => {
                    let lat, lon;

                    // With 'out center', both Nodes and Ways/Relations usually have 'lat'/'lon' or 'center'
                    if (element.lat && element.lon) {
                        lat = element.lat;
                        lon = element.lon;
                    } else if (element.center) {
                        lat = element.center.lat;
                        lon = element.center.lon;
                    } else {
                        // Skip elements without coordinates
                        return;
                    }

                    const result = {
                        lat: lat,
                        lon: lon,
                        tags: element.tags || {},
                        type: element.type,
                        display_name: this.formatOverpassResult(element)
                    };

                    results.push(result);
                });
            }

            return results;

        } catch (error) {
            console.error('Overpass API error:', error);
            throw error;
        }
    }



    formatOverpassResult(element) {
        const tags = element.tags || {};

        // Use name if available
        if (tags.name) {
            return tags.name;
        }

        // If no name, try to construct from address parts
        const parts = [];
        if (tags['addr:housenumber']) parts.push(tags['addr:housenumber']);
        if (tags['addr:street']) parts.push(tags['addr:street']);
        if (tags['addr:city']) parts.push(tags['addr:city']);

        if (parts.length > 0) {
            return parts.join(', ');
        }

        // Fallback to type
        const typeNames = {
            'node': 'Location',
            'way': 'Area',
            'relation': 'Region'
        };

        return typeNames[element.type] || 'Location';
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const d = R * c; // Distance in km
        return d;
    }

    deg2rad(deg) {
        return deg * (Math.PI / 180);
    }
}
