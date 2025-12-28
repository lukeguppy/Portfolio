/**
 * CategoryManager - Handles category CRUD operations
 * Extracted from app.js for separation of concerns
 */
class CategoryManager {
    constructor(app) {
        this.app = app;
    }

    /**
     * Get all categories
     */
    getAll() {
        return this.app.categories;
    }

    /**
     * Get a category by ID
     */
    getById(id) {
        return this.app.categories.find(c => c.id === id);
    }

    /**
     * Change the colour of a category
     */
    changeColor(categoryId) {
        if (this.app.colorPicker) {
            this.app.colorPicker.open(categoryId, 'category');
        } else {
            console.error('ColorPicker not initialised');
        }
    }

    /**
     * Toggle visibility of a category and all its pins
     */
    toggleVisibility(categoryId) {
        const category = this.getById(categoryId);
        if (!category) return;

        category.visible = !category.visible;
        category.pins.forEach(pin => {
            this.app.mapManager.setItemVisibility(pin, category.visible, category.color);
        });
    }

    /**
     * Delete a category and all its pins
     */
    delete(id) {
        ModalHelper.confirm(
            'Delete Category',
            'Are you sure you want to delete this category?',
            () => {
                this.app.undoManager.saveState('Delete category');
                const category = this.app.state.getCategory(id);
                if (category) {
                    // Remove all markers for pins in this category
                    category.pins.forEach(pin => {
                        this.app.mapManager.removeMarker(pin.id);
                    });

                    this.app.state.deleteCategory(id);
                    this.app.selectedItems.delete(id);
                }
            }
        );
    }

    /**
     * Focus view on a category (fit all its pins in view)
     */
    focus(categoryId) {
        const category = this.getById(categoryId);
        if (!category) return;

        if (!category.visible) {
            this.app.ui.showNotification('Category is hidden', 'info');
            return;
        }

        if (category.pins.length === 0) {
            this.app.ui.showNotification('Category is empty', 'info');
            return;
        }

        // Create bounds from all pins in category
        const bounds = L.latLngBounds([]);
        category.pins.forEach(pin => {
            bounds.extend(pin.position);
        });

        this.app.mapManager.map.flyToBounds(bounds, {
            padding: [50, 50],
            animate: true,
            duration: 1.5
        });
    }

    /**
     * Rename a category
     */
    rename(categoryId, newName) {
        const category = this.getById(categoryId);
        if (category && newName && newName.trim()) {
            this.app.undoManager.saveState('Rename category');
            category.name = newName.trim();
            // Trigger state change manually since we modified a property directly
            this.app.state._onChange();
            return true;
        }
        return false;
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CategoryManager;
}
