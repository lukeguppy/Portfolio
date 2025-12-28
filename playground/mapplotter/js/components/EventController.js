/**
 * EventController - Handles event listeners and keyboard shortcuts
 * Extracted from app.js for separation of concerns
 */
class EventController {
    constructor(app) {
        this.app = app;
    }

    /**
     * Initialise all keyboard shortcuts
     */
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Skip if typing in an input field
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // If a modal is open, only handle Escape
            if (document.querySelector('.modal-overlay, .picker-overlay.active')) {
                if (e.key === 'Escape') {
                    // Modal will handle its own escape
                }
                return;
            }

            // Ctrl+S: Save configuration
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.app.ui.showSaveModal();
            }

            // Ctrl+Z: Undo
            if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                this.app.undoManager.undo();
            }

            // Ctrl+Y or Ctrl+Shift+Z: Redo
            if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
                e.preventDefault();
                this.app.undoManager.redo();
            }

            // Delete: Remove selected items
            if (e.key === 'Delete' && this.app.selectedItems.size > 0) {
                e.preventDefault();
                this.app.deleteSelected();
            }

            // Escape: Cancel custom pin mode
            if (e.key === 'Escape') {
                if (this.app.customPinMode) {
                    this.app.cancelCustomPinMode();
                }
                this.app.lightbox.close();
            }
        });
    }

    /**
     * Initialise all DOM event listeners
     */
    initDOMListeners() {
        this._initRadiusSlider();
        this._initUndoRedoButtons();
        this._initCustomPinInputs();
        this._initSaveLoadButtons();
        this._initThemeSettings();
        this.app.initSelectionListeners();
        this._initExportButton();
        this._initSidebarToggle();
        this._initMainTabs();
        this._initPinListActions(); // Event delegation for pin list
    }

    /**
     * Event delegation for pin list actions (toggle-selection, focus, delete, etc.)
     * Replaces inline onclick handlers with a single document listener
     */
    _initPinListActions() {
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = target.dataset.id;
            const type = target.dataset.type;

            switch (action) {
                case 'focus':
                    if (type === 'category') {
                        this.app.categoryManager.focus(id);
                    } else {
                        this.app.mapManager.focusPin(id);
                    }
                    break;

                case 'change-color':
                    if (type === 'category') {
                        this.app.categoryManager.changeColor(id);
                    } else {
                        this.app.customPinManager.changeColor(id);
                    }
                    break;

                case 'toggle-visibility':
                    if (type === 'category') {
                        this.app.categoryManager.toggleVisibility(id);
                    } else {
                        this.app.customPinManager.toggleVisibility(id);
                    }
                    break;

                case 'delete':
                    if (type === 'category') {
                        this.app.categoryManager.delete(id);
                    } else {
                        this.app.customPinManager.delete(id);
                    }
                    break;
            }
        });

        // Separate handler for checkbox change events
        document.addEventListener('change', (e) => {
            if (e.target.dataset.action === 'toggle-selection') {
                this.app.selectionManager.toggle(e.target.dataset.id, e.target.checked);
            }
        });
    }

    /**
     * Initialise radius slider sync
     */
    _initRadiusSlider() {
        const radiusSlider = document.getElementById('search-radius');
        const radiusInput = document.getElementById('radius-value');
        const visibilityBtn = document.getElementById('radius-visibility-btn');

        if (!radiusSlider || !radiusInput) return;

        const updateSliderVisuals = (val) => {
            const min = parseInt(radiusSlider.min);
            const max = parseInt(radiusSlider.max);
            val = Math.max(min, Math.min(max, parseInt(val) || min));
            const progress = ((val - min) / (max - min)) * 100;
            radiusSlider.style.setProperty('--progress', `${progress}%`);
        };

        // Sync slider -> input + update circle
        radiusSlider.addEventListener('input', () => {
            radiusInput.value = radiusSlider.value;
            updateSliderVisuals(radiusSlider.value);
            this.app.mapManager.updateRadiusCircle();
        });

        // Sync input -> slider + update circle
        radiusInput.addEventListener('input', () => {
            let val = parseInt(radiusInput.value) || 1;
            val = Math.max(1, Math.min(50, val));
            radiusSlider.value = val;
            updateSliderVisuals(val);
            this.app.mapManager.updateRadiusCircle();
        });

        // Visibility toggle button
        if (visibilityBtn) {
            visibilityBtn.addEventListener('click', () => {
                this.app.mapManager.toggleRadiusCircle();
            });
        }

        updateSliderVisuals(radiusSlider.value);
    }

    /**
     * Initialise undo/redo buttons
     */
    _initUndoRedoButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');

        if (undoBtn) undoBtn.addEventListener('click', () => this.app.undoManager.undo());
        if (redoBtn) redoBtn.addEventListener('click', () => this.app.undoManager.redo());
    }

    /**
     * Initialise custom pin input listeners
     */
    _initCustomPinInputs() {
        const customNameInput = document.getElementById('custom-pin-name-input');
        if (customNameInput) {
            customNameInput.addEventListener('input', () => this.app.validateCustomPinInput());
            customNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !document.getElementById('add-custom-pin-btn').disabled) {
                    this.app.startCustomPinMode();
                }
            });
        }

        const addCustomBtn = document.getElementById('add-custom-pin-btn');
        if (addCustomBtn) addCustomBtn.addEventListener('click', () => this.app.startCustomPinMode());

        const customQty = document.getElementById('custom-pin-quantity');
        if (customQty) customQty.addEventListener('input', () => this.app.validateCustomPinInput());
    }

    /**
     * Initialise save/load buttons
     */
    _initSaveLoadButtons() {
        const saveBtn = document.getElementById('save-btn');
        const loadBtn = document.getElementById('load-btn');
        const fileInput = document.getElementById('file-input');

        if (saveBtn) saveBtn.addEventListener('click', () => this.app.ui.showSaveModal());
        if (loadBtn) loadBtn.addEventListener('click', () => this.app.loadConfiguration());
        if (fileInput) fileInput.addEventListener('change', (e) => this.app.handleFileLoad(e));
    }

    /**
     * Initialise theme and settings buttons
     */
    _initThemeSettings() {
        const themeBtn = document.getElementById('theme-btn');
        if (themeBtn) themeBtn.addEventListener('click', () => this.app.toggleThemeModal());

        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', (e) => this.app.mapManager.changeMapTheme(e.currentTarget.dataset.theme));
        });

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) settingsBtn.addEventListener('click', () => this.app.ui.showSettingsModal());

        const themeClose = document.querySelector('#theme-modal .modal-close');
        if (themeClose) themeClose.addEventListener('click', () => this.app.toggleThemeModal());
    }

    /**
     * Initialise export button
     */
    _initExportButton() {
        const exportBtn = document.getElementById('export-image-btn');
        if (exportBtn) exportBtn.addEventListener('click', () => this.app.exportMapAsImage());
    }

    /**
     * Initialise sidebar toggle
     */
    _initSidebarToggle() {
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) sidebarToggle.addEventListener('click', () => this.app.toggleSidebar());
    }

    /**
     * Initialise main tab switching
     */
    _initMainTabs() {
        document.querySelectorAll('.main-tab').forEach(tab => {
            tab.addEventListener('click', () => this.app.switchMainTab(tab.dataset.mainTab));
        });
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EventController;
}
