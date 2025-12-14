class ColorPicker {
    constructor(app) {
        this.app = app;
        this.activeItem = null;
        this.activeType = null;
        this.render();
    }

    render() {
        const overlay = document.createElement('div');
        overlay.className = 'picker-overlay';
        overlay.id = 'color-picker-overlay';

        overlay.innerHTML = `
            <div class="picker-modal">
                <div class="picker-header">
                    <h3>Choose Color</h3>
                    <button class="picker-close">&times;</button>
                </div>
                
                <div class="picker-body">
                    <div class="picker-grid" id="picker-grid"></div>
                    
                    <div class="picker-divider">Custom Wheel</div>
                    
                    <div class="picker-wheel-container">
                        <canvas id="picker-wheel-canvas" width="200" height="200"></canvas>
                    </div>

                    <div class="picker-custom-row">
                        <div class="picker-preview" id="picker-preview"></div>
                        <input type="text" class="picker-hex-input" id="picker-hex-input" placeholder="#RRGGBB" maxlength="7">
                        <button class="picker-save-btn" id="picker-save-btn">Set</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        this.overlay = overlay;
        this.grid = overlay.querySelector('#picker-grid');
        this.hexInput = overlay.querySelector('#picker-hex-input');
        this.preview = overlay.querySelector('#picker-preview');
        this.closeBtn = overlay.querySelector('.picker-close');
        this.saveBtn = overlay.querySelector('#picker-save-btn');
        this.canvas = overlay.querySelector('#picker-wheel-canvas');
        this.ctx = this.canvas.getContext('2d');

        // Draw the wheel once
        this.drawWheel();

        // Event Listeners
        this.closeBtn.onclick = () => this.close();
        this.overlay.onclick = (e) => {
            if (e.target === this.overlay) this.close();
        };

        this.hexInput.oninput = (e) => this.handleHexInput(e.target.value);
        this.saveBtn.onclick = () => this.applyCustomColor();

        // Canvas Drag Interaction
        let isDragging = false;
        const pick = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            this.pickColorFromCanvas(x, y);
        };

        this.canvas.onmousedown = (e) => { isDragging = true; pick(e); };
        window.addEventListener('mousemove', (e) => {
            if (isDragging && this.overlay.classList.contains('active')) pick(e);
        });
        window.addEventListener('mouseup', () => { isDragging = false; });
    }

    drawWheel() {
        const width = this.canvas.width;
        const height = this.canvas.height;
        const cx = width / 2;
        const cy = height / 2;
        const radius = width / 2;

        // Draw multiple gradients to create full color spectrum
        const gradient = this.ctx.createConicGradient(0, cx, cy);
        gradient.addColorStop(0, "red");
        gradient.addColorStop(0.17, "yellow");
        gradient.addColorStop(0.33, "lime");
        gradient.addColorStop(0.5, "cyan");
        gradient.addColorStop(0.66, "blue");
        gradient.addColorStop(0.83, "magenta");
        gradient.addColorStop(1, "red");

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();

        // White radial gradient (center out) for saturation - improved blend
        const whiteGrad = this.ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        whiteGrad.addColorStop(0, "white");
        whiteGrad.addColorStop(1, "transparent");
        this.ctx.fillStyle = whiteGrad;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.fill();
    }

    pickColorFromCanvas(x, y) {
        // Bounds check
        if (x < 0 || x > this.canvas.width || y < 0 || y > this.canvas.height) return;

        const pixel = this.ctx.getImageData(x, y, 1, 1).data;
        // pixel is [r, g, b, a]
        const r = pixel[0].toString(16).padStart(2, '0');
        const g = pixel[1].toString(16).padStart(2, '0');
        const b = pixel[2].toString(16).padStart(2, '0');
        const hex = `#${r}${g}${b}`.toUpperCase();

        this.updateCustomUI(hex);
    }

    open(id, type = 'category') {
        let item;
        if (type === 'category') {
            item = this.app.categories.find(c => c.id === id);
        } else {
            item = this.app.customPins.find(p => p.id === id);
        }

        if (!item) return;

        this.activeItem = item;
        this.activeType = type;
        this.overlay.classList.add('active');
        this.populateGrid();
        this.updateCustomUI(item.color);

        // Add ESC handler
        this.boundEscHandler = (e) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                e.stopImmediatePropagation();
                this.close();
            }
        };
        document.addEventListener('keydown', this.boundEscHandler, { capture: true });
    }

    close() {
        this.overlay.classList.remove('active');
        this.activeItem = null;
        this.activeType = null;

        if (this.boundEscHandler) {
            document.removeEventListener('keydown', this.boundEscHandler, { capture: true });
            this.boundEscHandler = null;
        }
    }

    populateGrid() {
        this.grid.innerHTML = '';
        CATEGORY_COLORS.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'picker-swatch';
            swatch.style.background = color;

            if (this.activeItem &&
                color.toLowerCase() === this.activeItem.color.toLowerCase()) {
                swatch.classList.add('active');
            }

            swatch.onclick = () => {
                this.saveColor(color);
            };

            this.grid.appendChild(swatch);
        });
    }

    handleHexInput(hex) {
        if (!hex.startsWith('#')) hex = '#' + hex;
        // Basic hex validation
        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            this.preview.style.background = hex;
        }
    }

    updateCustomUI(color) {
        this.hexInput.value = color;
        this.preview.style.background = color;
    }

    applyCustomColor() {
        let hex = this.hexInput.value;
        if (!hex.startsWith('#')) hex = '#' + hex;

        if (/^#[0-9A-F]{6}$/i.test(hex)) {
            this.saveColor(hex);
        } else {
            this.app.ui.showNotification('Invalid Hex Color', 'error');
        }
    }

    saveColor(color) {
        if (!this.activeItem) return;

        this.activeItem.color = color;

        if (this.activeType === 'category') {
            // Update all markers in category
            this.activeItem.pins.forEach(pin => {
                this.updateMarker(pin.id, color);
            });
        } else {
            // Update single marker
            this.updateMarker(this.activeItem.id, color);
        }

        this.app.ui.updateUI(); // Updates sidebar dots
        this.app.saveToLocalStorage();
        this.close();
    }

    updateMarker(pinId, color) {
        const marker = this.app.mapManager.markers.find(m => m.pinId === pinId);
        if (marker) {
            const pinEl = marker.getElement().querySelector('.marker-pin');
            if (pinEl) pinEl.style.background = color;
        }
    }
}
