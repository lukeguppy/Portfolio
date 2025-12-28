/**
 * SelectionManager - Handles multi-select operations on pins
 * Extracted from app.js for separation of concerns
 */
class SelectionManager {
    constructor(app) {
        this.app = app;
        this.selectedItems = new Set();
    }

    /**
     * Get the set of selected item IDs
     */
    get items() {
        return this.selectedItems;
    }

    /**
     * Get the count of selected items
     */
    get count() {
        return this.selectedItems.size;
    }

    /**
     * Toggle selection of an item
     */
    toggle(id, checked) {
        if (checked) {
            this.selectedItems.add(id);
        } else {
            this.selectedItems.delete(id);
        }
        this.app.ui.updateSelectionUI();
    }

    /**
     * Clear all selections
     */
    clear() {
        this.selectedItems.clear();
        this.app.ui.updateSelectionUI();

        // Remove visual selection from markers
        document.querySelectorAll('.pin-marker.selected').forEach(el =>
            el.classList.remove('selected')
        );

        const bar = document.getElementById('selection-bar');
        if (bar) bar.classList.remove('active');
    }

    /**
     * Hide all selected pins
     */
    hideSelected() {
        this.selectedItems.forEach(id => {
            const pin = this.app.getPinById(id);
            if (pin && !pin.hidden) {
                pin.hidden = true;
                this.app.mapManager.updatePinVisibility(pin);
            }
        });
        this.app.ui.showNotification(`${this.selectedItems.size} items hidden`);
        this.clear();
    }

    /**
     * Show all selected pins
     */
    showSelected() {
        this.selectedItems.forEach(id => {
            const pin = this.app.getPinById(id);
            if (pin && pin.hidden) {
                pin.hidden = false;
                this.app.mapManager.updatePinVisibility(pin);
            }
        });
        this.app.ui.showNotification(`${this.selectedItems.size} items shown`);
        this.clear();
    }

    /**
     * Delete all selected pins
     */
    deleteSelected() {
        const count = this.selectedItems.size;
        if (confirm(`Delete ${count} items?`)) {
            this.app.undoManager.saveState('Delete items');
            let deletedCount = 0;

            this.selectedItems.forEach(id => {
                if (this.app.removePin(id)) deletedCount++;
            });

            this.clear();

            if (deletedCount > 0) {
                this.app.ui.showNotification(`${deletedCount} items deleted`, 'success');
                this.app.saveConfiguration();
            }
        }
    }

    /**
     * Group selected pins into a new category
     */
    groupSelected() {
        const count = this.selectedItems.size;
        if (count === 0) return;

        ModalHelper.input(
            `Group ${count} Items`,
            'Enter group name...',
            (name) => {
                const safeColours = [
                    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                    '#F7DC6F', '#BB8FCE', '#82E0AA', '#F1948A', '#85C1E9'
                ];
                const randomColour = safeColours[Math.floor(Math.random() * safeColours.length)];

                const newCategory = {
                    id: generateId('cat'),
                    name: name.trim(),
                    color: randomColour,
                    pins: [],
                    visible: true
                };

                this.selectedItems.forEach(id => {
                    const pin = this.app.getPinById(id);
                    if (pin) {
                        // Remove from old location
                        this.app.removePin(id, true);
                        // Add to new category
                        pin.category = newCategory.id;
                        pin.color = newCategory.color;
                        newCategory.pins.push(pin);
                    }
                });

                // Add category to state
                this.app.state.addCategory(newCategory);

                // Update markers physically
                newCategory.pins.forEach(pin => {
                    this.app.mapManager.removeMarker(pin.id);
                    const marker = this.app.mapManager.createMarker(pin, pin.color);
                    this.app.mapManager.markers.push(marker);
                });

                this.clear();
                this.app.ui.showNotification(`Group "${name}" created with ${count} items`, 'success');
            },
            { buttonText: 'Create Group' }
        );
    }

    /**
     * Initialise selection button listeners
     */
    initListeners() {
        const groupBtn = document.getElementById('group-selected-btn');
        if (groupBtn) groupBtn.addEventListener('click', () => this.groupSelected());

        const hideBtn = document.getElementById('hide-selected-btn');
        if (hideBtn) hideBtn.addEventListener('click', () => this.hideSelected());

        const showBtn = document.getElementById('show-selected-btn');
        if (showBtn) showBtn.addEventListener('click', () => this.showSelected());

        const delBtn = document.getElementById('delete-selected-btn');
        if (delBtn) delBtn.addEventListener('click', () => this.deleteSelected());

        const clearBtn = document.getElementById('clear-selection-btn');
        if (clearBtn) clearBtn.addEventListener('click', () => this.clear());
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SelectionManager;
}
