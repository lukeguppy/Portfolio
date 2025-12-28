/**
 * UndoManager - Manages undo/redo state history
 * Stores snapshots of application state for reverting changes
 */
class UndoManager {
    constructor(app) {
        this.app = app;
        this.undoStack = [];
        this.redoStack = [];
        this.maxHistory = 50;
        this.isRestoring = false;

        // Update button states on init
        setTimeout(() => this.updateButtons(), 100);
    }

    /**
     * Save current state to undo stack
     * @param {string} actionName - Description of the action (e.g., "Add pin", "Delete category")
     */
    saveState(actionName = 'Change') {
        if (this.isRestoring) return;

        const snapshot = {
            categories: JSON.parse(JSON.stringify(this.app.categories)),
            customPins: JSON.parse(JSON.stringify(this.app.customPins)),
            actionName: actionName,
            timestamp: Date.now()
        };

        this.undoStack.push(snapshot);

        // Limit stack size
        if (this.undoStack.length > this.maxHistory) {
            this.undoStack.shift();
        }

        // Clear redo stack on new action
        this.redoStack = [];

        this.updateButtons();
    }

    /**
     * Undo last action
     */
    undo() {
        if (!this.canUndo()) {
            return false;
        }

        // Save current state to redo stack with the action name we're undoing
        const lastAction = this.undoStack[this.undoStack.length - 1];
        const currentState = {
            categories: JSON.parse(JSON.stringify(this.app.categories)),
            customPins: JSON.parse(JSON.stringify(this.app.customPins)),
            actionName: lastAction.actionName,
            timestamp: Date.now()
        };
        this.redoStack.push(currentState);

        // Restore previous state
        const snapshot = this.undoStack.pop();
        this.restoreState(snapshot);
        this.app.ui.showNotification(`Undone: ${snapshot.actionName}`, 'info');
        this.updateButtons();
        return true;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (!this.canRedo()) {
            return false;
        }

        // Save current state to undo stack
        const lastRedo = this.redoStack[this.redoStack.length - 1];
        const currentState = {
            categories: JSON.parse(JSON.stringify(this.app.categories)),
            customPins: JSON.parse(JSON.stringify(this.app.customPins)),
            actionName: lastRedo.actionName,
            timestamp: Date.now()
        };
        this.undoStack.push(currentState);

        // Restore redo state
        const snapshot = this.redoStack.pop();
        this.restoreState(snapshot);
        this.app.ui.showNotification(`Redone: ${snapshot.actionName}`, 'info');
        this.updateButtons();
        return true;
    }

    /**
     * Restore a snapshot to current state
     */
    restoreState(snapshot) {
        this.isRestoring = true;

        // Clear current markers
        this.app.mapManager.clearMarkers();

        // Restore data
        this.app.state.categories = snapshot.categories;
        this.app.state.customPins = snapshot.customPins;

        // Recreate markers
        this.app.state.categories.forEach(category => {
            if (category.visible) {
                category.pins.forEach(pin => {
                    const marker = this.app.mapManager.createMarker(pin, category.color);
                    this.app.mapManager.markers.push(marker);
                });
            }
        });

        this.app.state.customPins.forEach(pin => {
            if (!pin.hidden) {
                const marker = this.app.mapManager.createMarker(pin, pin.color);
                this.app.mapManager.markers.push(marker);
            }
        });

        // Update UI & State
        this.app.mapManager.updateMarkerZIndices();
        this.app.state._onChange();

        this.isRestoring = false;
    }

    /**
     * Update button disabled states and tooltips
     */
    updateButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) {
            undoBtn.disabled = !this.canUndo();
            if (this.canUndo()) {
                const lastAction = this.undoStack[this.undoStack.length - 1];
                undoBtn.title = `Undo: ${lastAction.actionName} (Ctrl+Z)`;
            } else {
                undoBtn.title = 'Nothing to undo';
            }
        }

        if (redoBtn) {
            redoBtn.disabled = !this.canRedo();
            if (this.canRedo()) {
                const lastRedo = this.redoStack[this.redoStack.length - 1];
                redoBtn.title = `Redo: ${lastRedo.actionName} (Ctrl+Y)`;
            } else {
                redoBtn.title = 'Nothing to redo';
            }
        }
    }

    canUndo() {
        return this.undoStack.length > 0;
    }

    canRedo() {
        return this.redoStack.length > 0;
    }

    clear() {
        this.undoStack = [];
        this.redoStack = [];
        this.updateButtons();
    }
}
