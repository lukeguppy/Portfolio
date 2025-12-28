class UIManager {
    constructor(app) {
        this.app = app;
    }

    showConfirmModal(title, message, onConfirm) {
        ModalHelper.confirm(title, message, onConfirm);
    }

    updateUI() {
        this.updateResultsSection();
        this.updateCategoriesList();
        this.app.mapManager.updateMarkerZIndices();
        this.updatePinCountBadge();
    }

    updatePinCountBadge() {
        const totalPins = this.app.categories.reduce((sum, cat) => sum + cat.pins.length, 0) + this.app.customPins.length;
        const badge = document.getElementById('pin-count-badge');
        if (badge) {
            badge.textContent = totalPins;
        }
    }

    initCategoryDropdown() {
        const select = document.getElementById('category-select');
        if (!select) return;

        // Clear existing options except first
        select.innerHTML = '<option value="">Select category...</option>';

        if (typeof COMMON_CATEGORIES !== 'undefined') {
            Object.keys(COMMON_CATEGORIES).sort().forEach(key => {
                const cat = COMMON_CATEGORIES[key];
                const option = document.createElement('option');
                option.value = key;
                option.textContent = cat.label;
                select.appendChild(option);
            });
        }
    }

    updateResultsSection() {
        // Results section is now static in the Pins tab
        // Just ensure drag listeners are set up when there are items
        const hasCategories = this.app.categories.length > 0;
        const hasCustomPins = this.app.customPins.length > 0;

        if ((hasCategories || hasCustomPins) && this.app.dragDropManager) {
            this.app.dragDropManager.setupDragContainer();
        }
    }

    updateCategoriesList() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        // Safety init
        if (!this.app.selectedItems) {
            this.app.selectedItems = new Set();
        }

        container.innerHTML = '';

        // Add category pins
        this.app.categories.forEach((category, index) => {
            container.appendChild(this.renderPinItem(category, 'category', index));
        });

        // Add custom pins
        this.app.customPins.forEach((pin, index) => {
            container.appendChild(this.renderPinItem(pin, 'custom', index));
        });
    }

    renderPinItem(data, type, index) {
        const isSelected = this.app.selectedItems.has(data.id);
        const isCategory = type === 'category';
        const isVisible = isCategory ? data.visible : !data.hidden;
        const subText = isCategory ? `${data.pins.length} pins` : 'Custom Pin';

        const item = document.createElement('div');
        item.className = `category-item ${isSelected ? 'selected' : ''}`;
        item.draggable = true;
        item.dataset.type = type;
        item.dataset.id = data.id;
        item.dataset.index = index;

        if (!isVisible) {
            item.classList.add('custom-pin-hidden');
        }

        item.innerHTML = `
            <div class="drag-handle">⋮⋮</div>
            <div style="display: flex; align-items: center;">
                <input type="checkbox" class="pin-checkbox"
                    data-action="toggle-selection" data-id="${data.id}"
                    ${isSelected ? 'checked' : ''}>
            </div>
            <div class="category-info">
                <div class="category-color clickable" style="background: ${data.color}" 
                    data-action="change-color" data-id="${data.id}" data-type="${type}"
                    title="Click to change color"></div>
                <div>
                    <div class="category-name clickable-text" 
                        data-action="focus" data-id="${data.id}" data-type="${type}"
                        title="Zoom to location">${data.name}</div>
                    <div class="category-count">${subText}</div>
                </div>
            </div>
            <div class="category-actions">
                <button class="btn-inset-circle ${isVisible ? 'active' : ''}" data-action="toggle-visibility" data-id="${data.id}" data-type="${type}"
                    title="${isVisible ? 'Hide' : 'Show'}">
                    ${isVisible ? Icons.eye : Icons.eyeOff}
                </button>
                <button class="btn-inset-circle delete" data-action="delete" data-id="${data.id}" data-type="${type}"
                    title="Delete">
                    ${Icons.trash}
                </button>
            </div>
        `;

        this.app.dragDropManager.addDragEventListeners(item);
        return item;
    }

    updateSelectionUI() {
        const bar = document.getElementById('selection-bar');
        const count = bar.querySelector('.selection-count');
        const countVal = this.app.selectedItems.size;

        const countText = countVal === 1 ? '1 item' : `${countVal} items`;
        count.textContent = `${countText} selected`;

        if (countVal > 0) {
            bar.classList.add('active');
        } else {
            bar.classList.remove('active');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 90px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 3000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;

        const colours = {
            success: '#6BCF7F',
            error: '#FF6B6B',
            warning: '#FFD93D',
            info: '#4ECDC4'
        };
        notification.style.background = colours[type] || colours.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        document.body.removeChild(notification);
                    }
                }, 300);
            }
        }, 3000);
    }

    showSearchLoading(show) {
        const searchButton = document.getElementById('search-businesses-btn');
        const searchInput = document.getElementById('business-search');

        if (searchButton && searchInput) {
            if (show) {
                searchButton.innerHTML = '<div class="btn-spinner"></div>';
                searchButton.disabled = true;
                searchButton.classList.add('loading');
                searchInput.disabled = true;
            } else {
                searchButton.innerHTML = 'Search';
                searchButton.disabled = false;
                searchButton.classList.remove('loading');
                searchInput.disabled = false;
            }
        }
    }

    showCategorySearchLoading(isLoading) {
        const btn = document.getElementById('search-category-btn');
        if (isLoading) {
            btn.innerHTML = '<div class="btn-spinner"></div>';
            btn.disabled = true;
        } else {
            btn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                Find
            `;
            btn.disabled = false;
        }
    }

    showSaveModal() {
        ModalHelper.input(
            'Save Configuration',
            'Enter filename...',
            (filename) => {
                this.app.saveConfiguration(filename);
            },
            { buttonText: 'Save' }
        );
    }

    showConfirmModal(title, message, onConfirm, onCancel = null) {
        ModalHelper.confirm(title, message, onConfirm, onCancel);
    }



    // Updated showCustomPinModal
    showCustomPinModal(pinName, onConfirm, onCancel) {
        this.showConfirmModal(
            'Confirm Pin Location',
            `Place pin for "<strong>${pinName}</strong>"?`,
            onConfirm,
            onCancel
        );
    }

    showThemeModal() {
        const currentTheme = localStorage.getItem('map-theme') || 'satellite';

        const themeGridHTML = `
            <div class="theme-grid">
                <div class="theme-option ${currentTheme === 'satellite' ? 'active' : ''}" data-theme="satellite">
                    <div class="theme-preview satellite-preview"></div>
                    <span>Satellite</span>
                </div>
                <div class="theme-option ${currentTheme === 'osm' ? 'active' : ''}" data-theme="osm">
                    <div class="theme-preview osm-preview"></div>
                    <span>OSM</span>
                </div>
                <div class="theme-option ${currentTheme === 'dark_all' ? 'active' : ''}" data-theme="dark_all">
                    <div class="theme-preview dark-preview"></div>
                    <span>Dark</span>
                </div>
                <div class="theme-option ${currentTheme === 'dark_nolabels' ? 'active' : ''}" data-theme="dark_nolabels">
                    <div class="theme-preview minimal-dark-preview"></div>
                    <span>Minimal Dark</span>
                </div>
                <div class="theme-option ${currentTheme === 'light_all' ? 'active' : ''}" data-theme="light_all">
                    <div class="theme-preview light-preview"></div>
                    <span>Light</span>
                </div>
                <div class="theme-option ${currentTheme === 'light_nolabels' ? 'active' : ''}" data-theme="light_nolabels">
                    <div class="theme-preview minimal-light-preview"></div>
                    <span>Minimal Light</span>
                </div>
                <div class="theme-option ${currentTheme === 'voyager' ? 'active' : ''}" data-theme="voyager">
                    <div class="theme-preview voyager-preview"></div>
                    <span>Voyager</span>
                </div>
                <div class="theme-option ${currentTheme === 'terrain' ? 'active' : ''}" data-theme="terrain">
                    <div class="theme-preview terrain-preview"></div>
                    <span>Terrain</span>
                </div>
            </div>
        `;

        const { overlay, close } = ModalHelper.create({
            title: 'Map Theme',
            content: themeGridHTML,
            width: '680px'
        });

        const themeOptions = overlay.querySelectorAll('.theme-option');
        themeOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                const theme = opt.dataset.theme;
                this.app.mapManager.changeMapTheme(theme);
                themeOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                close();
            });
        });
    }
    showSettingsModal() {
        const currentOpacity = localStorage.getItem('marker-opacity') || '0.7';
        const isLightMode = document.body.classList.contains('light-mode');

        const settingsHTML = `
            <div class="setting-item">
                <label>Light Mode</label>
                <div class="light-mode-control">
                    <!-- Animated Day/Night Toggle -->
                    <!-- Animated Day/Night CSS Toggle (User Provided) -->
                    <label class="theme-switch">
                        <input type="checkbox" id="light-mode-toggle" ${isLightMode ? 'checked' : ''}>
                        <div class="tdnn">
                            <div class="moon"></div>
                            <div class="stars"></div>
                            <!-- Added specifically for 'with clouds' request -->
                            <div class="clouds"></div>
                        </div>
                    </label>
                </div>
            </div>
            <div class="setting-item">
                <label>Marker Opacity</label>
                <div class="opacity-control">
                    <input type="range" id="marker-opacity" class="settings-slider" min="0.1" max="1" step="0.1" value="${currentOpacity}">
                    <input type="number" id="opacity-value" class="opacity-value-display" min="0.1" max="1" step="0.1" value="${currentOpacity}">
                </div>
            </div>
            <div class="setting-item">
                <label>Sidebar Opacity</label>
                <div class="opacity-control">
                    <input type="range" id="sidebar-opacity-input" class="settings-slider" min="0.5" max="1.0" step="0.05" value="${localStorage.getItem('sidebar-opacity') || '1'}">
                    <input type="number" id="sidebar-opacity-value" class="opacity-value-display" min="0.5" max="1.0" step="0.05" value="${localStorage.getItem('sidebar-opacity') || '1'}">
                </div>
            </div>
            <div class="setting-item" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <button id="clear-all-btn" class="btn btn-danger full-width">${Icons.trash} Clear All Pins</button>
            </div>
        `;

        const { overlay, close } = ModalHelper.create({
            title: 'Settings',
            content: settingsHTML,
            width: '400px'
        });

        const lightModeToggle = overlay.querySelector('#light-mode-toggle');
        const opacityInput = overlay.querySelector('#marker-opacity');
        const opacityValue = overlay.querySelector('#opacity-value');

        // Sync markers to saved opacity on modal open
        document.querySelectorAll('.marker-pin').forEach(pin => {
            pin.style.setProperty('opacity', currentOpacity, 'important');
        });

        lightModeToggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.body.classList.add('light-mode');
                localStorage.setItem('theme-mode', 'light');
                this.app.mapManager.matchMapThemeToUIMode(true); // Sync Map
            } else {
                document.body.classList.remove('light-mode');
                localStorage.setItem('theme-mode', 'dark');
                this.app.mapManager.matchMapThemeToUIMode(false); // Sync Map
            }
        });

        // Marker Opacity: Slider -> Input
        opacityInput.addEventListener('input', (e) => {
            const val = e.target.value;
            opacityValue.value = val;
            localStorage.setItem('marker-opacity', val);
            document.querySelectorAll('.marker-pin').forEach(pin => {
                pin.style.setProperty('opacity', val, 'important');
            });
        });

        // Marker Opacity: Input -> Slider
        opacityValue.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (val < 0.1) val = 0.1;
            if (val > 1) val = 1;
            opacityInput.value = val;
            localStorage.setItem('marker-opacity', val);
            document.querySelectorAll('.marker-pin').forEach(pin => {
                pin.style.setProperty('opacity', val, 'important');
            });
        });

        const sidebarOpacityInput = overlay.querySelector('#sidebar-opacity-input');
        const sidebarOpacityValue = overlay.querySelector('#sidebar-opacity-value');

        // Sidebar Opacity: Slider -> Input
        sidebarOpacityInput.addEventListener('input', (e) => {
            const val = e.target.value;
            sidebarOpacityValue.value = val;
            localStorage.setItem('sidebar-opacity', val);
            document.documentElement.style.setProperty('--sidebar-opacity', val);
        });

        // Sidebar Opacity: Input -> Slider
        sidebarOpacityValue.addEventListener('input', (e) => {
            let val = parseFloat(e.target.value);
            if (val < 0.5) val = 0.5;
            if (val > 1.0) val = 1.0;
            sidebarOpacityInput.value = val;
            localStorage.setItem('sidebar-opacity', val);
            document.documentElement.style.setProperty('--sidebar-opacity', val);
        });

        // Clear All Pins button
        const clearBtn = overlay.querySelector('#clear-all-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                close();
                this.app.clearAll();
            });
        }
    }
}
