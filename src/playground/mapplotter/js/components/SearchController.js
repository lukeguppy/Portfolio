class SearchController {
    constructor(app) {
        this.app = app;
        this.isSearching = false; // Prevent double submission
        this.initEventListeners();
    }

    initEventListeners() {
        // Location Search
        const searchBtn = document.getElementById('search-btn');
        if (searchBtn) searchBtn.addEventListener('click', () => this.searchLocation());

        const locInput = document.getElementById('location-search');
        if (locInput) {
            locInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchLocation();
            });
            // Initialise Autosuggest
            this.initAutosuggest();
        }

        // Search Tabs
        document.querySelectorAll('.search-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchSearchTab(e.currentTarget.dataset.type));
        });

        // Category Search
        const catBtn = document.getElementById('search-category-btn');
        if (catBtn) catBtn.addEventListener('click', () => this.searchCategory());

        // Business Search
        const busBtn = document.getElementById('search-businesses-btn');
        if (busBtn) busBtn.addEventListener('click', () => this.searchBusinesses());

        const busInput = document.getElementById('business-search');
        if (busInput) busInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.searchBusinesses();
        });

        // Rightmove
        const rmBtn = document.getElementById('add-rightmove-btn');
        if (rmBtn) rmBtn.addEventListener('click', () => this.addRightmovePin());

        // Close suggestions on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                const suggestions = document.querySelector('.search-suggestions');
                if (suggestions) suggestions.classList.remove('active');
            }
        });
    }

    initAutosuggest() {
        const input = document.getElementById('location-search');
        const container = document.querySelector('.search-container');
        if (!input || !container) return;

        // Create specific suggestions container if not exists
        let suggestionsList = container.querySelector('.search-suggestions');
        if (!suggestionsList) {
            suggestionsList = document.createElement('div');
            suggestionsList.className = 'search-suggestions';
            container.appendChild(suggestionsList);
        }

        let debounceTimer;

        input.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            clearTimeout(debounceTimer);

            if (query.length < 3) {
                suggestionsList.classList.remove('active');
                return;
            }

            debounceTimer = setTimeout(() => this.fetchSuggestions(query, suggestionsList), 300);
        });
    }

    async fetchSuggestions(query, container) {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
            if (!response.ok) return;
            const data = await response.json();

            if (data.length === 0) {
                container.classList.remove('active');
                return;
            }

            container.innerHTML = data.map(item => `
                <div class="suggestion-item" data-lat="${item.lat}" data-lon="${item.lon}" data-name="${item.display_name}">
                    <span class="suggestion-icon">📍</span>
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.display_name}</span>
                </div>
            `).join('');

            container.classList.add('active');

            // Add Click Listeners
            container.querySelectorAll('.suggestion-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent document click from closing immediately before logic
                    const lat = parseFloat(item.dataset.lat);
                    const lon = parseFloat(item.dataset.lon);
                    const name = item.dataset.name;

                    // Update Map
                    this.app.mapManager.map.setView([lat, lon], 14);

                    // Update Input
                    const input = document.getElementById('location-search');
                    input.value = name;

                    // Close Suggestions
                    container.classList.remove('active');

                    // Optional: Add a temporary marker or highlight?
                    // app.ui.showNotification(...)
                });
            });

        } catch (error) {
            console.error('Autosuggest error:', error);
        }
    }

    async searchLocation() {
        if (this.isSearching) return;

        const queryInput = document.getElementById('location-search');
        const query = queryInput.value.trim();
        const searchBtn = document.getElementById('search-btn');

        if (!query) return;

        this.isSearching = true;
        const originalText = searchBtn.innerHTML;
        searchBtn.innerHTML = '<div class="btn-spinner"></div>';
        searchBtn.disabled = true;
        queryInput.disabled = true;

        try {
            // Using direct fetch as per previous implementation to ensure compatibility
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data.length > 0) {
                const result = data[0];
                if (result.lat && result.lon) {
                    this.app.mapManager.map.setView([result.lat, result.lon], 13);
                    this.app.ui.showNotification(`Location found: ${result.display_name}`, 'success');
                }
            } else {
                this.app.ui.showNotification('Location not found', 'error');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.app.ui.showNotification('Search failed. Please check your connection.', 'error');
        } finally {
            this.isSearching = false;
            searchBtn.innerHTML = originalText;
            searchBtn.disabled = false;
            queryInput.disabled = false;
        }
    }

    async searchBusinesses() {
        if (this.isSearching) return;

        const query = document.getElementById('business-search').value.trim();
        const radius = document.getElementById('search-radius').value;

        if (!query) {
            this.app.ui.showNotification('Please enter a business to search for', 'warning');
            return;
        }

        this.isSearching = true;
        this.app.ui.showSearchLoading(true);

        try {
            const center = this.app.mapManager.map.getCenter();
            const searchRadiusKm = parseInt(radius) || 5;

            const results = await this.app.api.searchOverpassDirect(query, center, searchRadiusKm);

            if (results.length === 0) {
                this.app.ui.showNotification(`No ${query} found within ${searchRadiusKm}km.`, 'warning');
                return;
            }

            const categoryName = query.charAt(0).toUpperCase() + query.slice(1);

            // Smart Colour Selection
            const usedColours = new Set(this.app.state.getCategories().map(c => c.color));
            const availableColours = CATEGORY_COLOURS.filter(c => !usedColours.has(c));
            const colourPool = availableColours.length > 0 ? availableColours : CATEGORY_COLOURS;
            const randomColour = colourPool[Math.floor(Math.random() * colourPool.length)];

            // Use StateManager
            const category = {
                id: generateId('cat'),
                name: categoryName,
                color: randomColour,
                searchTerm: query.toLowerCase(),
                visible: true,
                pins: results.map(result => ({
                    id: generateId('pin'),
                    position: [parseFloat(result.lat), parseFloat(result.lon)],
                    name: result.display_name ? result.display_name.split(',')[0] : 'Unknown Location',
                    address: result.display_name || 'Address not available',
                    type: 'business'
                }))
            };

            category.pins.forEach(p => p.category = category.id);

            // Save state for undo
            this.app.undoManager.saveState(`Add ${categoryName} category`);

            // Update State
            this.app.state.addCategory(category);

            // Update Map
            category.pins.forEach(pin => {
                this.app.mapManager.addMarker(pin, category.color, category.id);
            });

            document.getElementById('business-search').value = '';
            document.getElementById('business-search').value = '';

            this.app.ui.showNotification(`Added ${category.pins.length} ${categoryName} locations`, 'success');

            this.app.ui.showNotification(`Added ${category.pins.length} ${categoryName} locations`, 'success');

        } catch (error) {
            console.error('Business search error:', error);
            this.app.ui.showNotification('Business search failed.', 'error');
        } finally {
            this.isSearching = false;
            this.app.ui.showSearchLoading(false);
        }
    }

    async searchCategory() {
        if (this.isSearching) return;

        const select = document.getElementById('category-select');
        const categoryKey = select.value;
        const radius = document.getElementById('search-radius').value;

        if (!categoryKey) return;

        const catDef = COMMON_CATEGORIES[categoryKey];
        const categoryName = select.options[select.selectedIndex].text;

        this.isSearching = true;
        this.app.ui.showCategorySearchLoading(true);

        try {
            const center = this.app.mapManager.map.getCenter();
            const searchRadiusKm = parseInt(radius) || 5;
            // CORRECTED TAG QUERY WITH QUOTES
            const tagQuery = `"${catDef.key}"="${catDef.value}"`;

            const results = await this.app.api.searchOverpassTag(tagQuery, center, searchRadiusKm);

            if (results.length === 0) {
                this.app.ui.showNotification(`No ${categoryName} found nearby.`, 'warning');
                return;
            }

            const randomColour = CATEGORY_COLOURS[Math.floor(Math.random() * CATEGORY_COLOURS.length)];

            const category = {
                id: generateId('cat'),
                name: categoryName,
                color: randomColour,
                searchTerm: categoryKey,
                visible: true,
                pins: results.map(result => ({
                    id: generateId('pin'),
                    position: [parseFloat(result.lat), parseFloat(result.lon)],
                    name: result.display_name,
                    address: result.display_name,
                    type: 'business'
                }))
            };

            category.pins.forEach(p => p.category = category.id);

            // Save state for undo
            this.app.undoManager.saveState(`Add ${categoryName} category`);

            // Update State
            this.app.state.addCategory(category);

            // Update Map
            category.pins.forEach(pin => {
                this.app.mapManager.addMarker(pin, category.color, category.id);
            });

            category.pins.forEach(pin => {
                this.app.mapManager.addMarker(pin, category.color, category.id);
            });

            this.app.ui.showNotification(`Added ${category.pins.length} ${categoryName} locations`, 'success');

        } catch (error) {
            console.error('Category search error:', error);
            this.app.ui.showNotification('Category search failed.', 'error');
        } finally {
            this.isSearching = false;
            this.app.ui.showCategorySearchLoading(false);
        }
    }

    async addRightmovePin() {
        const urlInput = document.getElementById('rightmove-url');
        const url = urlInput.value.trim();

        if (!url) {
            this.app.ui.showNotification('Please enter a Rightmove URL', 'warning');
            return;
        }

        if (!url.includes('rightmove.co.uk/properties')) {
            this.app.ui.showNotification('Invalid Rightmove URL', 'error');
            return;
        }

        try {
            const propertyData = await this.app.rightmove.fetchData(url);

            if (propertyData) {
                const pin = {
                    id: generateId('pin'),
                    name: propertyData.address || 'Rightmove Property',
                    position: [propertyData.location.latitude, propertyData.location.longitude],
                    color: '#26D07C',
                    address: propertyData.address,
                    url: url,
                    price: propertyData.price,
                    images: propertyData.images || [],
                    description: propertyData.address,
                    type: 'property',
                    hidden: false
                };

                // Add to Custom Pins state
                this.app.undoManager.saveState('Add Rightmove property');
                this.app.state.addCustomPin(pin);

                // Add to Map
                this.app.mapManager.addMarker(pin, pin.color, null, true);

                // Add to Map
                this.app.mapManager.addMarker(pin, pin.color, null, true);

                urlInput.value = '';
                this.app.ui.showNotification('Property added successfully', 'success');
            }
        } catch (error) {
            console.error('Rightmove error:', error);
            this.app.ui.showNotification('Failed to fetch property data', 'error');
        }
    }

    switchSearchTab(type) {
        document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.search-tab[data-type="${type}"]`);
        if (activeTab) activeTab.classList.add('active');

        document.querySelectorAll('.search-panel').forEach(p => p.classList.remove('active'));
        const activePanel = document.getElementById(`${type}-panel`);
        if (activePanel) activePanel.classList.add('active');
    }
}
