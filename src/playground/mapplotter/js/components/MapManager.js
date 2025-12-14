// Popup/Tooltip positioning thresholds to avoid header collision
const TOOLTIP_THRESHOLDS = {
    PROPERTY: 350, // Large card height (~280px) + Header (70px)
    DEFAULT: 100   // Text tooltip (~30px) + Header (70px)
};

class MapManager {
    constructor(app) {
        this.app = app;
        this.map = null;
        this.currentTileLayer = null;
        this.markers = [];
        this.radiusCircle = null;
        this.radiusVisible = false;
    }

    initMap() {
        // Try to load saved state
        const savedView = localStorage.getItem('map-view');
        let center = [51.505, -0.09];
        let zoom = 13;

        if (savedView) {
            try {
                const parsed = JSON.parse(savedView);
                if (parsed.center && parsed.zoom) {
                    center = parsed.center;
                    zoom = parsed.zoom;
                }
            } catch (e) {
                console.error('Failed to parse saved map view:', e);
            }
        }

        this.map = L.map('map', {
            center: center,
            zoom: zoom,
            zoomControl: false,
            attributionControl: false,
            // Smooth zooming
            zoomSnap: 0,              // No snapping - fully smooth
            zoomDelta: 0.5,           // Reasonable increment per scroll notch
            wheelDebounceTime: 100,   // Debounce wheel events (reduces jitter)
            wheelPxPerZoomLevel: 100, // Pixels of scroll per zoom level
            // Animation settings
            zoomAnimation: true,
            zoomAnimationThreshold: 4,
            fadeAnimation: true,
            markerZoomAnimation: true,
            // Prevent jarring behavior
            worldCopyJump: false,
            bounceAtZoomLimits: false,
            // Inertia for smoother panning
            inertia: true,
            inertiaDeceleration: 3000,
            inertiaMaxSpeed: 1500
        });

        // Initialize with saved theme or default
        const savedTheme = localStorage.getItem('map-theme') || 'satellite';

        // Track preferences for each mode (Context-Aware Persistence)
        // Defaults: Dark Mode -> 'dark', Light Mode -> 'osm'
        this.themeForDarkMode = localStorage.getItem('map-theme-dark-mode') || 'dark';
        this.themeForLightMode = localStorage.getItem('map-theme-light-mode') || 'osm';

        this.initializeTheme(savedTheme);

        // Track map movement state (to disable tooltips during pan/zoom)
        this.isMoving = false;

        this.map.on('movestart zoomstart', () => {
            this.isMoving = true;
            // Close any open tooltips when movement starts
            this.markers.forEach(m => {
                if (m.isTooltipOpen()) m.closeTooltip();
            });
        });

        this.map.on('moveend zoomend', () => {
            // Small delay before re-enabling tooltips
            setTimeout(() => { this.isMoving = false; }, 100);
        });

        // Save state on move
        this.map.on('moveend', () => {
            const view = {
                center: this.map.getCenter(),
                zoom: this.map.getZoom()
            };
            localStorage.setItem('map-view', JSON.stringify(view));
        });

        this.map.on('click', (e) => {
            if (this.app.customPinMode) {
                this.app.pendingCustomPin = e.latlng;
                this.app.showCustomPinModal();
            }
        });

        // Create custom zoom slider
        this.createZoomSlider();

        // Event delegation for popup actions (replaces inline onclick handlers)
        this.initPopupEventDelegation();
    }

    /**
     * Show or hide a specific item (pin) on the map
     */
    setItemVisibility(item, isVisible, color) {
        if (isVisible) {
            // Check if already exists to avoid duplicates
            if (this.markers.some(m => m.pinId === item.id)) return;

            const marker = this.createMarker(item, color);
            this.markers.push(marker);
        } else {
            const markerIndex = this.markers.findIndex(m => m.pinId === item.id);
            if (markerIndex !== -1) {
                this.markers[markerIndex].remove();
                this.markers.splice(markerIndex, 1);
            }
        }
    }

    /**
     * Setup event delegation for popup carousel and lightbox actions
     * Uses data-action attributes instead of inline onclick handlers
     */
    initPopupEventDelegation() {
        document.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset.action;

            if (!action) return;

            const pinId = target.dataset.pinId;

            switch (action) {
                case 'carousel-prev':
                    e.stopPropagation();
                    this.app.lightbox.rotateCarousel(pinId, -1);
                    break;
                case 'carousel-next':
                    e.stopPropagation();
                    this.app.lightbox.rotateCarousel(pinId, 1);
                    break;
                case 'lightbox-open':
                    const imageIndex = parseInt(target.dataset.imageIndex, 10) || 0;
                    this.app.lightbox.open(pinId, imageIndex);
                    break;
            }
        });
    }

    initializeTheme(theme) {
        this.changeMapTheme(theme);
    }

    /**
     * Smart Theme Sync: Matches Map Theme to UI Mode (Light/Dark)
     * Respects 'Neutral' themes (Satellite) and remembers user's last choice for each mode.
     */
    matchMapThemeToUIMode(isLightMode) {
        const currentTheme = localStorage.getItem('map-theme') || 'satellite';
        const type = this.getThemeType(currentTheme);

        // Rule 1: Neutral themes (Satellite) are persistent/sticky.
        // If the map is currently Neutral, toggling the UI shouldn't change the map.
        if (type === 'neutral') {
            return;
        }

        // Rule 2: Restore preference for the Target Mode
        if (isLightMode) {
            this.changeMapTheme(this.themeForLightMode);
        } else {
            this.changeMapTheme(this.themeForDarkMode);
        }
    }

    /**
     * Helper to classify theme types
     */
    getThemeType(theme) {
        const darkThemes = ['dark', 'dark_nolabels', 'dark_all', 'midnight']; // Add others as needed
        const lightThemes = ['light', 'light_all', 'light_nolabels', 'street', 'osm', 'voyager'];

        if (darkThemes.includes(theme)) return 'dark';
        if (lightThemes.includes(theme)) return 'light';
        return 'neutral'; // Satellite, Terrain, etc.
    }

    /**
     * Toggle the search radius circle visibility
     */
    toggleRadiusCircle() {
        this.radiusVisible = !this.radiusVisible;
        const btn = document.getElementById('radius-visibility-btn');

        if (this.radiusVisible) {
            this.updateRadiusCircle();
            if (btn) {
                btn.innerHTML = Icons.eye;
                btn.classList.add('active');
            }
            // Update circle when map moves
            this.map.on('move', this._boundUpdateRadius = () => this.updateRadiusCircle());
        } else {
            if (this.radiusCircle) {
                this.map.removeLayer(this.radiusCircle);
                this.radiusCircle = null;
            }
            if (btn) {
                btn.innerHTML = Icons.eyeOff;
                btn.classList.remove('active');
            }
            // Remove listener
            if (this._boundUpdateRadius) {
                this.map.off('move', this._boundUpdateRadius);
            }
        }
    }

    /**
     * Update the radius circle position and size
     */
    updateRadiusCircle() {
        if (!this.radiusVisible) return;

        const radiusInput = document.getElementById('radius-value');
        const radiusKm = radiusInput ? parseFloat(radiusInput.value) || 5 : 5;
        const radiusMeters = radiusKm * 1000;
        const center = this.map.getCenter();

        if (this.radiusCircle) {
            this.radiusCircle.setLatLng(center);
            this.radiusCircle.setRadius(radiusMeters);
        } else {
            this.radiusCircle = L.circle(center, {
                radius: radiusMeters,
                color: '#4ECDC4',
                weight: 2,
                opacity: 0.8,
                fillColor: '#4ECDC4',
                fillOpacity: 0.1,
                dashArray: '10, 10'
            }).addTo(this.map);
        }
    }

    changeMapTheme(theme) {
        if (this.currentTileLayer) {
            this.map.removeLayer(this.currentTileLayer);
        }
        if (this.labelLayer) {
            this.map.removeLayer(this.labelLayer);
            this.labelLayer = null;
        }

        let tileUrl;
        let attribution;
        let subdomains = 'abcd'; // Default for CartoDB
        let labelUrl = null;
        let maxNativeZoom = 19; // Default for OSM/Carto

        switch (theme) {
            case 'light':
            case 'light_all':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                break;
            case 'dark':
            case 'dark_nolabels':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                break;
            case 'dark_all':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                break;
            case 'street':
            case 'osm':
                tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
                subdomains = 'abc';
                break;
            case 'voyager':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                break;
            case 'light_nolabels':
                tileUrl = 'https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
                break;
            case 'satellite':
                tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
                attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
                subdomains = '';
                labelUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}';
                maxNativeZoom = 18; // Esri usually caps around 18
                break;
            case 'terrain':
                tileUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}';
                attribution = 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
                subdomains = '';
                maxNativeZoom = 18;
                break;
            default:
                tileUrl = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
                attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';
        }

        this.currentTileLayer = L.tileLayer(tileUrl, {
            attribution: attribution,
            subdomains: subdomains,
            maxNativeZoom: maxNativeZoom,
            maxZoom: 23,
            // Tile loading optimizations
            keepBuffer: 4,            // Keep 4 tiles beyond viewport (reduces black areas)
            updateWhenZooming: false, // Don't update tiles during zoom animation
            updateInterval: 100,      // Throttle tile updates during pan
            crossOrigin: true         // Better caching
        }).addTo(this.map);

        if (labelUrl) {
            this.labelLayer = L.tileLayer(labelUrl, {
                subdomains: subdomains,
                maxNativeZoom: maxNativeZoom,
                maxZoom: 23,
                zIndex: 100,
                keepBuffer: 4,
                updateWhenZooming: false,
                updateInterval: 100,
                crossOrigin: true
            }).addTo(this.map);
        }

        // Save preference logic
        localStorage.setItem('map-theme', theme);

        // Update context-aware preferences unless it's Neutral
        const type = this.getThemeType(theme);

        if (type !== 'neutral') {
            const isLightMode = document.body.classList.contains('light-mode');
            if (isLightMode) {
                this.themeForLightMode = theme;
                localStorage.setItem('map-theme-light-mode', theme);
            } else {
                this.themeForDarkMode = theme;
                localStorage.setItem('map-theme-dark-mode', theme);
            }
        }

        // Update active state in modal if it exists
        document.querySelectorAll('#theme-modal .theme-option').forEach(opt => {
            if (opt.dataset.theme === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    createZoomSlider() {
        const mapContainer = document.querySelector('.map-container');

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'zoom-slider-container';

        // Plus button
        const plusBtn = document.createElement('div');
        plusBtn.className = 'zoom-button plus';
        plusBtn.innerHTML = '+';
        plusBtn.addEventListener('click', () => {
            const currentZoom = this.map.getZoom();
            const maxZoom = this.map.getMaxZoom();
            if (currentZoom < maxZoom) {
                this.map.setZoom(currentZoom + 0.25, { animate: true, duration: 0.15 });
            }
        });

        // Track
        const track = document.createElement('div');
        track.className = 'zoom-slider-track';

        // Fill
        const fill = document.createElement('div');
        fill.className = 'zoom-slider-fill';

        // Thumb
        const thumb = document.createElement('div');
        thumb.className = 'zoom-slider-thumb';

        // Minus button
        const minusBtn = document.createElement('div');
        minusBtn.className = 'zoom-button minus';
        minusBtn.innerHTML = '−';
        minusBtn.addEventListener('click', () => {
            const currentZoom = this.map.getZoom();
            const minZoom = this.map.getMinZoom();
            if (currentZoom > minZoom) {
                this.map.setZoom(currentZoom - 0.25, { animate: true, duration: 0.15 });
            }
        });

        track.appendChild(fill);
        track.appendChild(thumb);
        sliderContainer.appendChild(plusBtn);
        sliderContainer.appendChild(track);
        sliderContainer.appendChild(minusBtn);
        mapContainer.appendChild(sliderContainer);

        // State
        let isDragging = false;

        const updateZoomFromThumb = (clientY) => {
            const rect = track.getBoundingClientRect();
            const y = clientY - rect.top;
            const percentage = Math.max(0, Math.min(1, 1 - (y / rect.height)));
            const zoom = this.map.getMinZoom() + (this.map.getMaxZoom() - this.map.getMinZoom()) * percentage;
            this.map.setZoom(zoom, { animate: true, duration: 0.15 });
        };

        const updateThumbPosition = () => {
            const zoomRange = this.map.getMaxZoom() - this.map.getMinZoom();
            const currentZoom = this.map.getZoom() - this.map.getMinZoom();
            const percentage = currentZoom / zoomRange;
            const thumbPosition = percentage * 100;

            thumb.style.bottom = `${thumbPosition}%`;
            fill.style.height = `${thumbPosition}%`;
        };

        // Mouse events
        thumb.addEventListener('mousedown', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                updateZoomFromThumb(e.clientY);
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Touch events
        thumb.addEventListener('touchstart', (e) => {
            isDragging = true;
            e.preventDefault();
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging) {
                updateZoomFromThumb(e.touches[0].clientY);
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Track click to jump to position
        track.addEventListener('click', (e) => {
            if (e.target === track || e.target === fill) {
                updateZoomFromThumb(e.clientY);
            }
        });

        // Update thumb when map zoom changes
        this.map.on('zoomend', updateThumbPosition);

        // Initial position
        updateThumbPosition();
    }

    /**
     * Focus the map on a specific pin and open its popup
     */
    focusPin(pinId) {
        const pin = this.app.getPinById(pinId);
        if (!pin) return;

        if (pin.hidden) {
            this.app.ui.showNotification('Pin is hidden', 'info');
            return;
        }

        const marker = this.markers.find(m => m.pinId === pinId);
        if (marker) {
            this.map.flyTo(pin.position, 16, {
                animate: true,
                duration: 1.5
            });
            setTimeout(() => {
                marker.openPopup();
            }, 1500);
        }
    }

    /**
     * Update pin visibility on the map (show/hide marker)
     */
    updatePinVisibility(pin) {
        if (pin.hidden) {
            this.removeMarker(pin.id);
        } else {
            const marker = this.createMarker(pin, pin.color);
            this.markers.push(marker);
        }
    }

    addMarker(pin, color, categoryId) {
        const marker = this.createMarker(pin, color);
        this.markers.push(marker);
        return marker;
    }

    removeMarker(pinId) {
        const markerIndex = this.markers.findIndex(m => m.pinId === pinId);
        if (markerIndex !== -1) {
            this.markers[markerIndex].remove();
            this.markers.splice(markerIndex, 1);
        }
    }

    createMarker(pin, color) {
        // Create icon using PopupBuilder
        const icon = L.divIcon({
            className: 'custom-marker',
            html: PopupBuilder.buildMarkerIcon(color),
            iconSize: [24, 24],
            iconAnchor: [12, 12]
        });

        const marker = L.marker(pin.position, { icon }).addTo(this.map);

        // Build popup content using PopupBuilder
        const categoryName = pin.type === 'business' ? this.getCategoryName(pin.category) : null;
        const popupContent = PopupBuilder.build(pin, categoryName);

        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup',
            closeButton: true,
            autoPanPadding: [20, 20]
        });

        // Tooltip configuration
        const tooltipOptions = {
            permanent: false,
            direction: 'top',
            className: 'custom-popup-tooltip',
            opacity: 1,
            offset: [0, -12]
        };

        marker.bindTooltip(popupContent, tooltipOptions);

        // Mouseover: Close all other tooltips, flip if near top of screen
        // Mouseover: Close all other tooltips, flip if near top of screen
        marker.on('mouseover', (e) => {
            if (this.isMoving) return;

            // Close others cleanly using Leaflet API
            this.markers.forEach(m => {
                if (m !== marker && m.isTooltipOpen()) m.closeTooltip();
            });

            // Flip tooltip direction based on screen position
            const map = marker._map || this.map;
            const tooltip = marker.getTooltip();
            if (!map || !tooltip) return;

            const containerPoint = map.latLngToContainerPoint(e.latlng);
            let direction = 'top';
            let offset = [0, -12];
            let className = 'custom-popup-tooltip';

            // DYNAMIC THRESHOLD CALCULATION
            const pin = this.app.getPinById(marker.pinId);
            const isProperty = pin && pin.type === 'property';

            let flipThreshold;

            if (isProperty) {
                // Properties use fixed safe zone (images might not be loaded yet)
                const tooltipEl = tooltip.getElement();
                flipThreshold = tooltipEl ? tooltipEl.offsetHeight : TOOLTIP_THRESHOLDS.PROPERTY;
            } else {
                // Regular pins: Calculate based on ACTUAL content height
                const tooltipEl = tooltip.getElement();
                const tooltipHeight = tooltipEl ? tooltipEl.offsetHeight : 40; // Fallback 40px
                const headerHeight = 70;
                const buffer = 20; // Extra padding
                flipThreshold = headerHeight + tooltipHeight + buffer;
            }

            // 3. Flip if too close to top (clip into header)
            if (containerPoint.y < flipThreshold) {
                direction = 'bottom';
                offset = [0, 12];
                className += ' tooltip-flipped';
            }

            // Apply updates
            let needsUpdate = false;
            if (tooltip.options.direction !== direction) {
                tooltip.options.direction = direction;
                tooltip.options.offset = offset;
                tooltip.options.className = className;
                needsUpdate = true;
            }

            // Ensure it's open (Leaflet handles this, but if we closed it or need refresh)
            if (needsUpdate && marker.isTooltipOpen()) {
                marker.closeTooltip();
                marker.openTooltip();
            } else if (!marker.isTooltipOpen()) {
                marker.openTooltip();
            }
        });

        // Popupopen: Remove tooltips and close other popups
        marker.on('popupopen', () => {
            document.querySelectorAll('.leaflet-tooltip').forEach(el => el.remove());
            marker.unbindTooltip();
            this.markers.forEach(m => {
                if (m !== marker && m.isPopupOpen()) m.closePopup();
            });
        });

        marker.on('popupclose', () => {
            marker.bindTooltip(popupContent, tooltipOptions);
        });

        marker.pinId = pin.id;
        return marker;
    }

    updateMarkerZIndices() {
        // Start with a high Z-index
        let currentZIndex = 10000;

        // 1. Categories (rendered first in list, so should be on top)
        this.app.categories.forEach(category => {
            if (!category.visible) return;

            category.pins.forEach(pin => {
                const marker = this.markers.find(m => m.pinId === pin.id);
                if (marker) {
                    marker.setZIndexOffset(currentZIndex--);
                }
            });
        });

        // 2. Custom Pins
        this.app.customPins.forEach(pin => {
            if (pin.hidden) return;

            const marker = this.markers.find(m => m.pinId === pin.id);
            if (marker) {
                marker.setZIndexOffset(currentZIndex--);
            }
        });
    }

    getCategoryName(categoryId) {
        const category = this.app.categories.find(cat => cat.id === categoryId);
        return category ? category.name : 'Unknown';
    }

    clearMarkers() {
        this.markers.forEach(marker => marker.remove());
        this.markers = [];
    }
}
