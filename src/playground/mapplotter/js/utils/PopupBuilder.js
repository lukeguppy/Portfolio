/**
 * PopupBuilder - Generates HTML for map marker popups and tooltips
 * Extracts templating logic from MapManager for cleaner separation
 */
class PopupBuilder {
    /**
     * Build complete popup HTML for a pin
     * @param {Object} pin - Pin data object
     * @param {string} categoryName - Category name for business pins
     * @returns {string} HTML string
     */
    static build(pin, categoryName = null) {
        if (pin.type === 'property') {
            return PopupBuilder._buildPropertyPopup(pin, categoryName);
        } else {
            return PopupBuilder._buildStandardPopup(pin, categoryName);
        }
    }

    /**
     * Build standard popup (New Design)
     */
    static _buildStandardPopup(pin, categoryName) {
        const title = PopupBuilder._getDisplayTitle(pin);

        // Check if we have content
        const hasAddress = pin.address && pin.address !== title && pin.address !== 'Address not available';
        const hasDescription = !!pin.description;
        const hasContent = hasAddress || hasDescription;

        const headerStyle = !hasContent ? 'border-bottom: none; margin-bottom: 0; padding-bottom: 0;' : '';

        return `
            <div class="popup-standard">
                <div class="popup-standard-header" style="${headerStyle}">
                    <div class="popup-standard-title">${title}</div>
                    ${categoryName ? `<span class="popup-standard-badge">${categoryName}</span>` : ''}
                </div>
                ${hasContent ? `
                <div class="popup-standard-content">
                    ${hasAddress ?
                    `<div class="popup-standard-row">
                            <span class="icon">📍</span>
                            <span>${pin.address}</span>
                        </div>` : ''}
                    
                    ${hasDescription ?
                    `<div class="popup-standard-row description">
                            <span>${pin.description}</span>
                        </div>` : ''}
                </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Build property/Rightmove popup (Original Design)
     */
    static _buildPropertyPopup(pin, categoryName) {
        let html = '<div class="popup-content" style="min-width: 260px;">';

        // Image Carousel
        if (pin.images && pin.images.length > 0) {
            html += PopupBuilder.buildCarousel(pin);
        }

        // Title
        html += PopupBuilder.buildTitle(pin);

        // Price
        if (pin.price) {
            html += `<div class="popup-price" style="font-size: 15px; margin-bottom: 8px;">${pin.price}</div>`;
        }

        // Address (if different from title)
        const displayTitle = PopupBuilder._getDisplayTitle(pin);
        if (pin.address && pin.address !== displayTitle) {
            html += `<div class="popup-address">${pin.address}</div>`;
        }

        // Meta info
        html += PopupBuilder.buildMeta(pin, categoryName);

        // Link
        if (pin.url) {
            html += PopupBuilder.buildLink(pin);
        }

        html += '</div>';
        return html;
    }

    /**
     * Build image carousel HTML
     */
    static buildCarousel(pin) {
        if (!pin.images || pin.images.length === 0) return '';

        const images = pin.images.map((img, index) => `
            <img src="${img}" 
                class="carousel-image ${index === 0 ? 'active' : ''}" 
                data-index="${index}"
                data-action="lightbox-open"
                data-pin-id="${pin.id}"
                data-image-index="${index}"
                style="cursor: zoom-in;">
        `).join('');

        const controls = pin.images.length > 1 ? `
            <button class="carousel-btn prev" data-action="carousel-prev" data-pin-id="${pin.id}">❮</button>
            <button class="carousel-btn next" data-action="carousel-next" data-pin-id="${pin.id}">❯</button>
            <div class="carousel-dots">
                ${pin.images.map((_, index) => `
                    <div class="carousel-dot ${index === 0 ? 'active' : ''}" id="dot-${pin.id}-${index}"></div>
                `).join('')}
            </div>
        ` : '';

        return `
            <div class="popup-carousel" id="carousel-${pin.id}">
                <div class="carousel-image-container">
                    ${images}
                </div>
                ${controls}
            </div>
        `;
    }

    /**
     * Build title section
     */
    static buildTitle(pin) {
        const displayTitle = PopupBuilder._getDisplayTitle(pin);
        return `<strong class="popup-title" style="font-size: 18px; margin-top: 4px;">${displayTitle}</strong>`;
    }

    /**
     * Build meta info section
     */
    static buildMeta(pin, categoryName = null) {
        const items = [];

        if (pin.description && pin.description !== pin.address) {
            items.push(`<div>${pin.description}</div>`);
        }

        if (pin.type === 'business' && categoryName) {
            items.push(`<div>Category: ${categoryName}</div>`);
        }

        if (items.length === 0) return '';
        return `<div class="popup-meta">${items.join('')}</div>`;
    }

    /**
     * Build external link
     */
    static buildLink(pin) {
        if (!pin.url) return '';
        return `
            <a href="${pin.url}" target="_blank" class="popup-link">
                <span>View on Rightmove</span>
                <span style="font-size: 14px">↗</span>
            </a>
        `;
    }

    /**
     * Build marker icon HTML
     */
    static buildMarkerIcon(colour) {
        const opacity = localStorage.getItem('marker-opacity') || '1';
        return `
            <div style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                cursor: pointer;
            ">
                <div class="marker-pin" style="
                    background: ${colour};
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    opacity: ${opacity};
                    box-shadow: 0 0 0 2px white, 0 3px 6px rgba(0,0,0,0.4);
                    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s;
                    pointer-events: none;
                "></div>
            </div>
        `;
    }

    /**
     * Get display title for a pin
     * @private
     */
    static _getDisplayTitle(pin) {
        let title = pin.name;
        if (!title || title.startsWith('file://') || (pin.price && (pin.name === pin.price || pin.name.includes('£')))) {
            title = pin.address || 'Pinned Location';
        }
        return title;
    }
}
