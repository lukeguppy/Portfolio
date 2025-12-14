
class MapPlotter {
    constructor() {
        // Services & Components
        this.api = new ApiService();
        this.storage = new StorageService();

        // Initialize Theme
        if (localStorage.getItem('theme-mode') === 'light') {
            document.body.classList.add('light-mode');
        }

        this.rightmove = new RightmoveService();
        this.state = new StateManager(this);
        this.mapManager = new MapManager(this);
        this.dragDropManager = new DragDropManager(this);
        this.searchController = new SearchController(this);
        this.ui = new UIManager(this);
        this.lightbox = new Lightbox(this);
        this.colorPicker = new ColorPicker(this);
        this.undoManager = new UndoManager(this);
        this.exportController = new ExportController(this);
        this.selectionManager = new SelectionManager(this);
        this.customPinManager = new CustomPinManager(this);
        this.categoryManager = new CategoryManager(this);
        this.configManager = new ConfigurationManager(this);
        this.eventController = new EventController(this);
        this.sidebarController = new SidebarController(this);

        window.app = this;
        this.init();
    }

    // --- Proxy Getters/Setters (backward compatibility) ---
    get categories() { return this.state.categories; }
    set categories(val) { this.state.categories = val; }
    get customPins() { return this.state.customPins; }
    set customPins(val) { this.state.customPins = val; }
    get selectedItems() { return this.selectionManager.items; }
    get customPinMode() { return this.customPinManager.isActive; }
    get pendingCustomPin() { return this.customPinManager.pendingCustomPin; }
    set pendingCustomPin(val) { this.customPinManager.pendingCustomPin = val; }
    get pendingCustomPinName() { return this.customPinManager.pendingCustomPinName; }
    get sidebarCollapsed() { return this.sidebarController.isCollapsed; }
    set sidebarCollapsed(val) { this.sidebarController.collapsed = val; }

    // --- Initialization ---
    async init() {
        // Restore active tab immediately to prevent flicker
        const savedTab = localStorage.getItem('mapplotter-active-tab');
        if (savedTab) {
            this.switchMainTab(savedTab);
        }

        this.mapManager.initMap();
        this.eventController.initKeyboardShortcuts();
        this.eventController.initDOMListeners();
        this.ui.initCategoryDropdown();
        this.dragDropManager.setupDragContainer();
        this.sidebarController.loadState();
        this.configManager.loadFromLocalStorage();

        // Apply saved settings
        const savedOpacity = localStorage.getItem('marker-opacity') || '1';
        setTimeout(() => {
            document.querySelectorAll('.marker-pin').forEach(pin => {
                pin.style.setProperty('opacity', savedOpacity, 'important');
            });
        }, 100);
        document.documentElement.style.setProperty('--sidebar-opacity',
            localStorage.getItem('sidebar-opacity') || '1');
    }

    // --- State Queries ---
    getPinById(id) { return this.state.getPinById(id); }
    removePin(id, keepMarker = false) { return this.state.removePin(id, keepMarker); }

    // --- Selection (used by SelectionManager and EventController) ---
    initSelectionListeners() { this.selectionManager.initListeners(); }
    hideSelected() { this.selectionManager.hideSelected(); }
    showSelected() { this.selectionManager.showSelected(); }
    deleteSelected() { this.selectionManager.deleteSelected(); }
    clearSelection() { this.selectionManager.clear(); }
    groupSelected() { this.selectionManager.groupSelected(); }

    // --- Custom Pin Mode (used by EventController) ---
    validateCustomPinInput() { this.customPinManager.validateInput(); }
    startCustomPinMode() { this.customPinManager.startMode(); }
    showCustomPinModal() { this.customPinManager.showConfirmModal(); }
    cancelCustomPinMode() { this.customPinManager.cancelMode(); }

    // --- Sidebar (used by EventController) ---
    toggleSidebar() { this.sidebarController.toggle(); }

    // --- Tab Switching (used by EventController) ---
    switchMainTab(tabName) {
        document.querySelectorAll('.main-tab').forEach(t => t.classList.remove('active'));
        document.querySelector(`.main-tab[data-main-tab="${tabName}"]`)?.classList.add('active');
        document.querySelectorAll('.main-tab-content').forEach(c => c.classList.remove('active'));
        document.getElementById(`${tabName}-tab-content`)?.classList.add('active');

        // Save state
        localStorage.setItem('mapplotter-active-tab', tabName);
    }

    // --- Storage (used by EventController and ConfigurationManager) ---
    saveToLocalStorage() { this.configManager.saveToLocalStorage(); }
    loadFromLocalStorage() { return this.configManager.loadFromLocalStorage(); }
    loadConfiguration() { this.configManager.triggerLoad(); }
    handleFileLoad(event) { this.configManager.handleFileLoad(event); }

    // --- UI (used by EventController and other managers) ---
    toggleThemeModal() { this.ui.showThemeModal(); }
    showNotification(msg, type) { this.ui.showNotification(msg, type); }

    // --- Export (used by EventController) ---
    async exportMapAsImage() { return this.exportController.exportMapAsImage(); }

    // --- Coordination Methods ---
    clearAll() {
        this.ui.showConfirmModal(
            'Clear All Pins',
            'Are you sure you want to clear all pins and categories? This action cannot be undone.',
            () => {
                this.state.clearAllWithUndo();
                this.ui.updateUI();
                this.ui.showNotification('Cleared all pins', 'success');
            }
        );
    }
}

// Initialize
window.app = new MapPlotter();