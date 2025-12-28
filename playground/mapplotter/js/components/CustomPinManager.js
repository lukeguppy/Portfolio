/**
 * CustomPinManager - Handles custom pin mode and pin creation
 * Extracted from app.js for separation of concerns
 */
class CustomPinManager {
    constructor(app) {
        this.app = app;
        this.customPinMode = false;
        this.pendingCustomPin = null;
        this.pendingCustomPinName = null;
    }

    /**
     * Check if currently in custom pin placement mode
     */
    get isActive() {
        return this.customPinMode;
    }

    /**
     * Validate the custom pin input field and update button state
     */
    validateInput() {
        const nameInput = document.getElementById('custom-pin-name-input');
        const btn = document.getElementById('add-custom-pin-btn');
        if (btn && nameInput) {
            btn.disabled = !nameInput.value.trim();
        }
    }

    /**
     * Start custom pin placement mode
     */
    startMode() {
        const nameInput = document.getElementById('custom-pin-name-input');
        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) return false;

        this.customPinMode = true;
        this.pendingCustomPinName = name;

        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.cursor = 'crosshair';
        }

        this.app.ui.showNotification('Click on the map to place the pin', 'info');
        return true;
    }

    /**
     * Set the pending pin location (called when user clicks map)
     */
    setPendingLocation(latlng) {
        this.pendingCustomPin = latlng;
    }

    /**
     * Show the confirmation modal for pin placement
     */
    showConfirmModal() {
        if (!this.pendingCustomPin || !this.pendingCustomPinName) return;

        this.app.ui.showCustomPinModal(
            this.pendingCustomPinName,
            () => {
                // Confirm
                this.addPin(this.pendingCustomPin, this.pendingCustomPinName);
                this.pendingCustomPin = null;
                this.pendingCustomPinName = null;
                this.cancelMode();
            },
            () => {
                // Cancel
                this.cancelMode();
            }
        );
    }

    /**
     * Add a custom pin to the map
     */
    addPin(latlng, name) {
        this.app.undoManager.saveState('Add custom pin');

        const pin = {
            id: generateId('pin'),
            position: [latlng.lat, latlng.lng],
            name: name,
            type: 'custom',
            category: 'custom',
            color: typeof DEFAULT_PIN_COLOR !== 'undefined' ? DEFAULT_PIN_COLOR : '#4ECDC4',
            hidden: false
        };

        this.app.customPins.push(pin);
        const marker = this.app.mapManager.createMarker(pin, pin.color);
        this.app.mapManager.markers.push(marker);

        // Clear input
        const nameInput = document.getElementById('custom-pin-name-input');
        if (nameInput) nameInput.value = '';
        this.validateInput();

        this.cancelMode();
        this.app.ui.showNotification('Custom pin added', 'success');

        return pin;
    }

    /**
     * Cancel custom pin placement mode
     */
    cancelMode() {
        this.customPinMode = false;
        this.pendingCustomPin = null;
        this.pendingCustomPinName = null;

        const mapContainer = document.querySelector('.map-container');
        if (mapContainer) {
            mapContainer.style.cursor = 'default';
        }

        // Remove any open modals
        document.querySelectorAll('.modal').forEach(m => m.remove());
    }

    /**
     * Change the colour of a custom pin
     */
    changeColor(pinId) {
        if (this.app.colorPicker) {
            this.app.colorPicker.open(pinId, 'pin');
        } else {
            // Fallback colour picker
            const pin = this.app.customPins.find(p => p.id === pinId);
            if (!pin) return;

            const input = document.createElement('input');
            input.type = 'color';
            input.value = pin.color;
            input.onchange = (e) => {
                pin.color = e.target.value;
                const marker = this.app.mapManager.markers.find(m => m.pinId === pin.id);
                if (marker) {
                    const pinEl = marker.getElement().querySelector('.marker-pin');
                    if (pinEl) pinEl.style.background = pin.color;
                }
                // Trigger state change
                this.app.state._onChange();
            };
            input.click();
        }
    }
    /**
     * Toggle visibility of a custom pin
     */
    toggleVisibility(pinId) {
        const pin = this.app.customPins.find(p => p.id === pinId);
        if (!pin) return;

        pin.hidden = !pin.hidden;
        this.app.mapManager.setItemVisibility(pin, !pin.hidden, pin.color);
        // Trigger state change
        this.app.state._onChange();
    }

    /**
     * Delete a custom pin
     */
    delete(pinId) {
        ModalHelper.confirm(
            'Delete Pin',
            'Are you sure you want to delete this pin?',
            () => {
                this.app.undoManager.saveState('Delete custom pin');
                this.app.mapManager.removeMarker(pinId);

                const idx = this.app.customPins.findIndex(p => p.id === pinId);
                if (idx > -1) {
                    this.app.customPins.splice(idx, 1);
                    this.app.selectedItems.delete(pinId);
                }

                this.app.ui.showNotification('Pin deleted', 'success');
            }
        );
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CustomPinManager;
}
