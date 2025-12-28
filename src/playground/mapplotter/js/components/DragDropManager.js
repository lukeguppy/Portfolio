/**
 * DragDropManager - Handles drag and drop reordering of categories and pins
 * Manages the visual drag ghost and syncs the new order to the state
 */
class DragDropManager {
    constructor(app) {
        this.app = app;
        this.dragGhost = null;
        this.dragGhostFrame = null;
        this.activeDragHandler = null;
        this.ghostOffsetX = 0;
        this.ghostOffsetY = 0;
    }

    addDragEventListeners(item) {
        item.addEventListener('dragstart', (e) => {
            const rect = item.getBoundingClientRect();
            const clone = item.cloneNode(true);

            // Allow pointer events to pass through so drag events continue on source
            clone.classList.add('drag-ghost');
            clone.style.position = 'fixed';
            // User fix: Set exact initial position instead of 0,0 + transform
            clone.style.top = `${rect.top}px`;
            clone.style.left = `${rect.left}px`;
            clone.style.transform = 'scale(1.05)'; // Only scale, no translate
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.zIndex = '10000';
            clone.style.pointerEvents = 'none';
            clone.style.boxShadow = '0 10px 20px rgba(0,0,0,0.3)';
            clone.style.margin = '0';
            clone.style.opacity = '1';

            document.body.appendChild(clone);
            this.dragGhost = clone;

            // Calculate offset to keep it under cursor properly
            this.ghostOffsetX = e.clientX - rect.left;
            this.ghostOffsetY = e.clientY - rect.top;

            // Hide Native Ghost
            const emptyImg = new Image();
            emptyImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            e.dataTransfer.setDragImage(emptyImg, 0, 0);

            // Setup Global Tracking (Capture Mode, GPU)
            this.startDragTracking();

            // Make original transparent ("hole") immediately
            requestAnimationFrame(() => {
                item.classList.add('dragging');
                document.body.classList.add('dragging-global');
            });
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            document.body.classList.remove('dragging-global');

            this.cleanupDrag();
            this.syncDataOrder();

            // Cleanup transforms
            document.querySelectorAll('.category-item').forEach(el => {
                el.classList.remove('animating');
                el.style.transform = '';
            });
        });
    }

    startDragTracking() {
        this.activeDragHandler = (ev) => {
            ev.preventDefault();
            // Decouple render from event using rAF
            if (this.dragGhost && !this.dragGhostFrame) {
                this.dragGhostFrame = requestAnimationFrame(() => {
                    const x = ev.clientX - this.ghostOffsetX;
                    const y = ev.clientY - this.ghostOffsetY;
                    if (this.dragGhost) {
                        // Use top/left for positioning to remain robust against transform compounding
                        this.dragGhost.style.top = `${y}px`;
                        this.dragGhost.style.left = `${x}px`;
                    }
                    this.dragGhostFrame = null;
                });
            }
        };
        window.addEventListener('dragover', this.activeDragHandler, true);
    }

    cleanupDrag() {
        if (this.dragGhost) {
            this.dragGhost.remove();
            this.dragGhost = null;
        }
        if (this.dragGhostFrame) {
            cancelAnimationFrame(this.dragGhostFrame);
            this.dragGhostFrame = null;
        }
        if (this.activeDragHandler) {
            window.removeEventListener('dragover', this.activeDragHandler, true);
            this.activeDragHandler = null;
        }
    }

    setupDragContainer() {
        const container = document.getElementById('categories-list');
        if (!container || container.dataset.dragInitialised) return;

        container.addEventListener('dragover', (e) => {
            e.preventDefault();

            const afterElement = this.getDragAfterElement(container, e.clientY);
            const draggable = document.querySelector('.dragging');

            if (!draggable) return;

            // --- FLIP Animation ---
            // 1. First: Capture positions of all items
            const siblings = [...container.querySelectorAll('.category-item:not(.dragging)')];
            const positions = new Map();
            siblings.forEach(el => positions.set(el, el.getBoundingClientRect().top));

            // 2. Last: Perform the DOM move
            if (afterElement == null) {
                container.appendChild(draggable);
            } else {
                container.insertBefore(draggable, afterElement);
            }

            // 3. Invert: Calculate change and apply transform
            siblings.forEach(el => {
                const newTop = el.getBoundingClientRect().top;
                const oldTop = positions.get(el);

                if (oldTop !== newTop) {
                    const delta = oldTop - newTop;
                    el.style.transform = `translateY(${delta}px)`;
                    el.classList.remove('animating'); // Disable transition for instant snap
                }
            });

            // 4. Play: Animate to zero
            requestAnimationFrame(() => {
                siblings.forEach(el => {
                    const newTop = el.getBoundingClientRect().top;
                    const oldTop = positions.get(el);

                    if (oldTop !== newTop) {
                        el.classList.add('animating'); // Enable transition
                        el.style.transform = '';
                    }
                });
            });
        });

        container.dataset.dragInitialised = 'true';
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.category-item:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    syncDataOrder() {
        const container = document.getElementById('categories-list');
        if (!container) return;

        const newOrderIds = Array.from(container.children).map(child => child.dataset.id);

        const newCategories = [];
        const newCustomPins = [];

        newOrderIds.forEach(id => {
            const cat = this.app.categories.find(c => c.id === id); // Uses app proxy getter
            if (cat) newCategories.push(cat);
            else {
                const pin = this.app.customPins.find(p => p.id === id); // Uses app proxy getter
                if (pin) newCustomPins.push(pin);
            }
        });

        // Use StateManager to save
        this.app.state.setOrder(newCategories, newCustomPins);

        Array.from(container.children).forEach((child, index) => {
            child.dataset.index = index;
        });
    }
}
