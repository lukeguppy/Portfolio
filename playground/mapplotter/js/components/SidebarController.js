/**
 * SidebarController - Handles sidebar toggle and state persistence
 * Extracted from app.js for separation of concerns
 */
class SidebarController {
    constructor(app) {
        this.app = app;
        this.collapsed = false;
        this._initIcons();
        this._initMobileHandlers();
    }

    _initMobileHandlers() {
        const closeBtn = document.getElementById('sidebar-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    this.toggle();
                }
            });
        }

        const backdrop = document.getElementById('sidebar-backdrop');
        if (backdrop) {
            backdrop.addEventListener('click', () => {
                const sidebar = document.querySelector('.sidebar');
                if (sidebar && !sidebar.classList.contains('collapsed')) {
                    this.toggle();
                }
            });
        }
    }

    /**
     * Initialise sidebar icons from centrally defined Icons
     */
    _initIcons() {
        if (typeof Icons === 'undefined') return;

        const iconMap = {
            'settings-btn': Icons.settings,
            'theme-btn': Icons.map,
            'export-image-btn': Icons.image
        };

        const radiusSection = document.getElementById('radius-control-section');
        const searchTabs = document.querySelectorAll('.search-tab');

        searchTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const type = tab.dataset.type;
                if (radiusSection) {
                    radiusSection.style.display = type === 'custom' ? 'none' : 'block';
                }
            });
        });

        Object.entries(iconMap).forEach(([id, iconHtml]) => {
            const btn = document.getElementById(id);
            if (btn) {
                const iconSpan = btn.querySelector('.action-icon');
                if (iconSpan) iconSpan.innerHTML = iconHtml;
            }
        });
    }

    /**
     * Get the collapsed state
     */
    get isCollapsed() {
        return this.collapsed;
    }

    /**
     * Toggle the sidebar open/closed
     */
    toggle() {
        this.collapsed = !this.collapsed;

        const sidebar = document.querySelector('.sidebar');
        const toggleBtn = document.getElementById('sidebar-toggle');
        const mainContent = document.querySelector('.main-content');

        if (!sidebar || !mainContent) return;

        const backdrop = document.getElementById('sidebar-backdrop');
        if (this.collapsed) {
            sidebar.classList.remove('collapsed');
            toggleBtn?.classList.remove('collapsed');
            mainContent.classList.remove('sidebar-collapsed');
            backdrop?.classList.add('active');
        } else {
            sidebar.classList.add('collapsed');
            toggleBtn?.classList.add('collapsed');
            mainContent.classList.add('sidebar-collapsed');
            backdrop?.classList.remove('active');
        }

        // Save preference
        localStorage.setItem('explore-sidebar-collapsed', this.collapsed);

        // Trigger map resize to adjust to new container size
        setTimeout(() => {
            if (this.app.mapManager && this.app.mapManager.map) {
                this.app.mapManager.map.invalidateSize();
            }
        }, 300);
    }

    /**
     * Load saved sidebar state from localStorage
     */
    loadState() {
        const isMobile = window.innerWidth <= 768;
        const saved = localStorage.getItem('explore-sidebar-collapsed');
        const shouldBeHidden = saved !== null ? saved !== 'true' : isMobile;
        if (shouldBeHidden) {
            this.collapsed = true;
            this.toggle();
        }
    }

    /**
     * Force the sidebar to a specific state
     */
    setState(collapsed) {
        if (this.collapsed !== collapsed) {
            this.toggle();
        }
    }
}

// Export for Node.js/Jest testing (won't affect browser)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SidebarController;
}
