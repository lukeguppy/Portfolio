class StateManager {
    constructor(app) {
        this.app = app;
        this.categories = [];
        this.customPins = [];
        // Autosave trigger
        this.autoSaveEnabled = true;
        this.listeners = [];
    }

    subscribe(callback) {
        this.listeners.push(callback);
    }

    notifyListeners() {
        this.listeners.forEach(callback => callback());
    }

    // ... (rest of class)

    // --- Persistence ---
    _onChange() {
        if (this.autoSaveEnabled) {
            this.save();
        }
        this.notifyListeners();
    }
    // --- Accessors ---
    getCategories() { return this.categories; }
    getCustomPins() { return this.customPins; }

    // --- CRUD Category ---
    addCategory(category) {
        this.categories.push(category);
        this._onChange();
        return category;
    }

    deleteCategory(id) {
        this.categories = this.categories.filter(c => c.id !== id);
        this._onChange();
    }

    getCategory(id) {
        return this.categories.find(c => c.id === id);
    }

    // --- CRUD Custom Pin ---
    addCustomPin(pin) {
        this.customPins.push(pin);
        this._onChange();
        return pin;
    }

    deleteCustomPin(id) {
        this.customPins = this.customPins.filter(p => p.id !== id);
        this._onChange();
    }

    getCustomPin(id) {
        return this.customPins.find(p => p.id === id);
    }

    /**
     * Get any pin by ID (searches custom pins and category pins)
     */
    getPinById(id) {
        // Check custom pins first
        let pin = this.customPins.find(p => p.id === id);
        if (pin) return pin;

        // Check category pins
        for (const cat of this.categories) {
            pin = cat.pins.find(p => p.id === id);
            if (pin) return pin;
        }
        return null;
    }

    /**
     * Remove a pin by ID from either custom pins or categories
     * @param {string} id - Pin ID
     * @param {boolean} keepMarker - If true, don't remove map marker
     * @returns {boolean} - True if pin was found and removed
     */
    removePin(id, keepMarker = false) {
        // Check custom pins
        const customIndex = this.customPins.findIndex(p => p.id === id);
        if (customIndex > -1) {
            if (!keepMarker && this.app.mapManager) {
                this.app.mapManager.removeMarker(id);
            }
            this.customPins.splice(customIndex, 1);
            this._onChange();
            return true;
        }

        // Check categories
        for (const cat of this.categories) {
            const pinIndex = cat.pins.findIndex(p => p.id === id);
            if (pinIndex > -1) {
                if (!keepMarker && this.app.mapManager) {
                    this.app.mapManager.removeMarker(id);
                }
                cat.pins.splice(pinIndex, 1);
                this._onChange();
                return true;
            }
        }
        return false;
    }

    // --- Bulk Operations ---
    clearAll() {
        this.categories = [];
        this.customPins = [];
        this._onChange();
    }

    /**
     * Clear all pins with undo support - orchestrates clearing markers, state, and selection
     */
    clearAllWithUndo() {
        this.app.undoManager.saveState('Clear all');
        this.app.mapManager.clearMarkers();
        this.clearAll();
        this.app.selectionManager.clear();
    }

    setOrder(newCategories, newCustomPins) {
        // Called by drag/drop manager to sync order
        if (newCategories) this.categories = newCategories;
        if (newCustomPins) this.customPins = newCustomPins;
        this.save();
        // Update marker z-indices to reflect new order
        if (this.app.mapManager) {
            this.app.mapManager.updateMarkerZIndices();
        }
    }

    // --- Persistence ---
    _onChange() {
        if (this.autoSaveEnabled) {
            this.save();
        }
        this.notifyListeners();
    }

    save() {
        const data = {
            categories: this.categories,
            customPins: this.customPins,
            version: 1,
            timestamp: new Date().toISOString()
        };
        this.app.storage.saveToLocalStorage('map_plotter_data', data);
    }

    load() {
        const data = this.app.storage.loadFromLocalStorage('map_plotter_data');
        if (data) {
            this.categories = data.categories || [];
            this.customPins = data.customPins || [];
            return true;
        }
        return false;
    }

    // Import/Export Logic
    exportData() {
        const data = {
            categories: this.categories,
            customPins: this.customPins,
            exportDate: new Date().toISOString()
        };
        return JSON.stringify(data, null, 2);
    }

    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (data.categories || data.customPins) {
                this.categories = data.categories || [];
                this.customPins = data.customPins || [];
                this._onChange();
                return true;
            }
        } catch (e) {
            console.error('Import failed', e);
        }
        return false;
    }
}
