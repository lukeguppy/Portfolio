/**
 * ConfigurationManager - Handles save/load configuration and local storage
 * Extracted from app.js for separation of concerns
 */
class ConfigurationManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Save current state to localStorage
     */
    saveToLocalStorage() {
        this.app.state.save();
    }

    /**
     * Load state from localStorage and restore markers
     */
    loadFromLocalStorage() {
        if (this.app.state.load()) {
            this.app.ui.updateUI();

            // Restore markers for categories
            this.app.state.categories.forEach(category => {
                category.pins.forEach(pin => {
                    this.app.mapManager.addMarker(pin, category.color, category.id);
                });
            });

            // Restore markers for custom pins
            this.app.state.customPins.forEach(pin => {
                this.app.mapManager.addMarker(pin, pin.color, null, true);
            });

            // Apply correct z-index ordering
            this.app.mapManager.updateMarkerZIndices();
            return true;
        }
        return false;
    }

    /**
     * Save configuration to a JSON file for download
     */
    saveToFile(filenameArgument) {
        const data = {
            version: '1.0',
            timestamp: new Date().toISOString(),
            mapState: {
                center: this.app.mapManager.map.getCenter(),
                zoom: this.app.mapManager.map.getZoom()
            },
            categories: this.app.categories,
            customPins: this.app.customPins
        };

        const filename = filenameArgument ?
            (filenameArgument.endsWith('.json') ? filenameArgument : `${filenameArgument}.json`)
            : `explore-${Date.now()}.json`;

        this.app.storage.downloadJSON(data, filename);
        this.app.ui.showNotification('Configuration saved', 'success');
    }

    /**
     * Trigger file input to load configuration
     */
    triggerLoad() {
        const fileInput = document.getElementById('file-input');
        if (fileInput) fileInput.click();
    }

    /**
     * Handle file input change event
     */
    handleFileLoad(event) {
        const file = event.target.files[0];
        if (!file) return;

        this.app.storage.readFileAsJSON(file)
            .then(data => {
                this.loadFromData(data);
                this.app.ui.showNotification('Configuration loaded', 'success');
            })
            .catch(err => {
                console.error('Load error', err);
                this.app.ui.showNotification('Failed to load file', 'error');
            });

        event.target.value = '';
    }

    /**
     * Load configuration from data object
     */
    loadFromData(data) {
        if (!data) return false;

        this.app.mapManager.clearMarkers();

        this.app.categories = data.categories || [];
        this.app.customPins = data.customPins || [];

        // Restore map view
        if (data.mapState) {
            this.app.mapManager.map.setView(data.mapState.center, data.mapState.zoom);
        }

        // Re-create markers for visible categories
        this.app.categories.forEach(cat => {
            if (cat.visible) {
                cat.pins.forEach(pin => {
                    const marker = this.app.mapManager.createMarker(pin, cat.color);
                    this.app.mapManager.markers.push(marker);
                });
            }
        });

        // Re-create markers for visible custom pins
        this.app.customPins.forEach(pin => {
            if (!pin.hidden) {
                const marker = this.app.mapManager.createMarker(pin, pin.color);
                this.app.mapManager.markers.push(marker);
            }
        });

        this.app.ui.updateUI();
        this.saveToLocalStorage(); // Persist loaded data
        return true;
    }

    /**
     * Build configuration data object for export
     */
    buildExportData() {
        return {
            version: '1.0',
            timestamp: new Date().toISOString(),
            mapState: {
                center: this.app.mapManager.map.getCenter(),
                zoom: this.app.mapManager.map.getZoom()
            },
            categories: this.app.categories,
            customPins: this.app.customPins
        };
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConfigurationManager;
}
