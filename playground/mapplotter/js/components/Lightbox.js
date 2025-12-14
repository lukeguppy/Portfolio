class Lightbox {
    constructor(app) {
        this.app = app; // Reference to main app for state
        this.state = null;
    }

    open(pinId, startIndex) {
        // Access data from App state
        const pin = this.app.customPins.find(p => p.id === pinId) ||
            this.app.categories.flatMap(c => c.pins).find(p => p.id === pinId);

        if (!pin || !pin.images) return;

        // Disable map keyboard to prevent panning underneath
        // Access map via mapManager
        const map = this.app.mapManager && this.app.mapManager.map;
        if (map && map.keyboard) {
            map.keyboard.disable();
        }

        this.state = {
            pinId: pinId,
            images: pin.images,
            currentIndex: startIndex
        };

        // Create lightbox if not exists
        let lightbox = document.getElementById('lightbox-overlay');
        if (!lightbox) {
            lightbox = document.createElement('div');
            lightbox.id = 'lightbox-overlay';
            lightbox.className = 'lightbox-overlay';

            // Close on background click
            lightbox.onclick = (e) => {
                if (e.target === lightbox) {
                    this.close();
                }
            };

            lightbox.innerHTML = `
                <button class="lightbox-close" id="lb-close">×</button>
                <button class="lightbox-nav prev" id="lb-prev">❮</button>
                <div class="lightbox-content">
                    <img id="lightbox-img" src="" alt="Property Image">
                </div>
                <button class="lightbox-nav next" id="lb-next">❯</button>
                <div class="lightbox-counter" id="lightbox-counter"></div>
            `;
            document.body.appendChild(lightbox);

            // Add listeners explicitly
            document.getElementById('lb-close').addEventListener('click', () => this.close());
            document.getElementById('lb-prev').addEventListener('click', (e) => {
                e.stopPropagation();
                this.rotate(-1);
            });
            document.getElementById('lb-next').addEventListener('click', (e) => {
                e.stopPropagation();
                this.rotate(1);
            });

            // Keyboard nav
            // Use CAPTURE phase (true) to intercept events before they reach the map
            document.addEventListener('keydown', (e) => {
                if (!this.state) return; // Only if lightbox is open

                if (e.key === 'Escape') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                }
                if (e.key === 'ArrowLeft') {
                    e.preventDefault(); // Stop map pan
                    e.stopPropagation();
                    this.rotate(-1);
                }
                if (e.key === 'ArrowRight') {
                    e.preventDefault(); // Stop map pan
                    e.stopPropagation();
                    this.rotate(1);
                }
            }, true);
        }

        this.updateImage();
        lightbox.classList.add('active');
    }

    close() {
        const lightbox = document.getElementById('lightbox-overlay');
        if (lightbox) {
            lightbox.classList.remove('active');
        }
        this.state = null;

        // Re-enable map keyboard
        const map = this.app.mapManager && this.app.mapManager.map;
        if (map && map.keyboard) {
            map.keyboard.enable();
        }
    }

    rotate(direction) {
        if (!this.state) return;

        const { images, currentIndex } = this.state;
        let newIndex = currentIndex + direction;

        if (newIndex < 0) newIndex = images.length - 1;
        if (newIndex >= images.length) newIndex = 0;

        this.state.currentIndex = newIndex;
        this.updateImage();
    }

    updateImage() {
        if (!this.state) return;

        const { images, currentIndex } = this.state;
        const img = document.getElementById('lightbox-img');
        const counter = document.getElementById('lightbox-counter');

        if (img) {
            img.style.opacity = '0.5';
            setTimeout(() => {
                img.src = images[currentIndex];
                img.style.opacity = '1';
            }, 150);
        }

        if (counter) {
            counter.textContent = `${currentIndex + 1} / ${images.length}`;
        }
    }

    rotateCarousel(pinId, direction) {
        const carousel = document.getElementById(`carousel-${pinId}`);
        if (!carousel) return;

        const images = carousel.querySelectorAll('.carousel-image');
        const dots = carousel.querySelectorAll('.carousel-dot');
        let activeIndex = 0;

        images.forEach((img, index) => {
            if (img.classList.contains('active')) {
                activeIndex = index;
                img.classList.remove('active');
            }
        });

        if (dots.length > 0) {
            dots[activeIndex].classList.remove('active');
        }

        let newIndex = activeIndex + direction;
        if (newIndex >= images.length) newIndex = 0;
        if (newIndex < 0) newIndex = images.length - 1;

        images[newIndex].classList.add('active');
        if (dots.length > 0) {
            dots[newIndex].classList.add('active');
        }
    }
}
