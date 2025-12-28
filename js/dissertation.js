document.addEventListener('DOMContentLoaded', () => {

    // ================================================
    // 1. HERO TEXT GLITCH & TYPING
    // ================================================
    const glitchText = document.querySelector('.glitch-text');
    if (glitchText) {
        // Simple random character swap effect on hover or interval
        // Pre-calculate frames for performance and "staggered" feel
        const target = glitchText.dataset.text;
        const totalFrames = 25;
        const frames = [];
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890@#$%^&*';

        // Initial random state
        let currentText = Array(target.length).fill('').map(() => chars[Math.floor(Math.random() * chars.length)]);

        for (let i = 0; i < totalFrames; i++) {
            const progress = i / totalFrames;
            const resolveCount = Math.floor(progress * target.length);

            const frame = currentText.map((char, index) => {
                if (index < resolveCount) {
                    return target[index]; // Resolved char
                }
                // Staggered Scramble: 30% chance to change a noise character per frame
                if (Math.random() < 0.3) {
                    return chars[Math.floor(Math.random() * chars.length)];
                }
                return char; // Keep previous noise (sticky)
            }).join('');

            frames.push(frame);
            currentText = frame.split(''); // Update state for next frame
        }

        // Playback
        let frameIndex = 0;
        const glitchEffect = () => {
            const interval = setInterval(() => {
                if (frameIndex >= frames.length) {
                    clearInterval(interval);
                    glitchText.innerText = target; // Ensure final state
                    document.querySelector('.dissertation-hero').classList.add('glitch-complete');
                    return;
                }

                glitchText.innerText = frames[frameIndex];
                frameIndex++;
            }, 50);
        };

        // Run once on load
        setTimeout(glitchEffect, 1000);
    }

    // ================================================
    // 2. PIPELINE SCROLL LOGIC
    // ================================================
    const pipelineSection = document.querySelector('.system-pipeline');
    const trackLine = document.querySelector('.track-line');
    const trackHead = document.querySelector('.track-head');
    const modules = document.querySelectorAll('.pipeline-module');

    if (pipelineSection && trackLine) {

        let visualProgress = 0;
        let targetProgress = 0;
        let isAnimating = false;

        // Linear Interpolation: active value moves 10% towards target each frame
        const lerp = (start, end, factor) => start + (end - start) * factor;

        const updateVisuals = () => {
            // Check if settled
            if (Math.abs(targetProgress - visualProgress) < 0.0001) {
                visualProgress = targetProgress;
                isAnimating = false;
            } else {
                visualProgress = lerp(visualProgress, targetProgress, 0.15);
                requestAnimationFrame(updateVisuals);
            }

            // --- Draw Logic (using visualProgress) ---
            const rect = pipelineSection.getBoundingClientRect();
            const sectionHeight = rect.height;

            // Update line height via scaleY
            trackLine.style.transform = `scaleY(${visualProgress})`;

            // Calculate line tip position
            const lineLength = sectionHeight * visualProgress;

            // Update head
            trackHead.style.transform = `translate(-50%, ${lineLength}px) translateY(-50%)`;

            // Check modules
            const lineTipAbsY = rect.top + lineLength;

            modules.forEach(module => {
                const moduleRect = module.getBoundingClientRect();
                const moduleTop = moduleRect.top;

                if (lineTipAbsY >= moduleTop + 25) {
                    module.classList.add('active');
                } else {
                    module.classList.remove('active');
                }
            });
        };

        const calculateTarget = () => {
            const rect = pipelineSection.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const sectionTop = rect.top;
            const sectionHeight = rect.height;

            const startOffset = viewportHeight * 0.4;
            const totalScrollable = sectionHeight - startOffset;
            const scrolled = -sectionTop + startOffset;

            let p = scrolled / totalScrollable;
            p = Math.max(0, Math.min(1, p));

            targetProgress = p;

            if (!isAnimating) {
                isAnimating = true;
                updateVisuals();
            }
        };

        window.addEventListener('scroll', calculateTarget, { passive: true });
        window.addEventListener('resize', calculateTarget);
        calculateTarget();
    }

    // ================================================
    // 3. PARALLAX GRID BACKGROUND
    // ================================================
    const heroGrid = document.querySelector('.hero-bg-grid');
    if (heroGrid) {
        window.addEventListener('scroll', () => {
            const scrolled = window.scrollY;
            if (scrolled < window.innerHeight) {
                // Move grid slightly slower than scroll to create depth
                heroGrid.style.transform = `perspective(1000px) rotateX(60deg) scale(2) translateY(${scrolled * 0.5}px)`;
            }
        }, { passive: true });
    }

    // ================================================
    // 4. MOUSE HALO EFFECT ON CARDS (Cool interaction)
    // ================================================
    const techCards = document.querySelectorAll('.deploy-card, .module-content');

    techCards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255, 255, 255, 0.03), transparent 80%), var(--tech-card-bg, rgba(19, 20, 31, 0.8))`;
            card.style.borderImage = `radial-gradient(circle at ${x}px ${y}px, var(--tech-accent), transparent 70%) 1`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = '';
            card.style.borderImage = '';
        });
    });

    // ================================================
    // 5. NEURAL NETWORK VISUALIZATION
    // ================================================
    const canvas = document.getElementById('brain-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Configuration
        const layers = [2, 5, 5, 5, 2]; // Input, 3x Hidden, Output
        const nodes = []; // Store node positions
        const pulses = []; // Store active pulses
        const nodeRadius = 4;

        function resizeCanvas() {
            // Use parent width but fix height to canvas CSS height/content
            const rect = canvas.getBoundingClientRect();
            width = rect.width;
            height = rect.height;
            // Set internal resolution to match display size
            canvas.width = width;
            canvas.height = height;
            initNodes();
        }

        function initNodes() {
            nodes.length = 0;
            // Use fixed padding to ensure centering and max width usage
            const paddingX = width * 0.1; // 10% padding on each side
            const usableWidth = width - (paddingX * 2);
            const layerSpacing = layers.length > 1 ? usableWidth / (layers.length - 1) : 0;

            layers.forEach((count, layerIndex) => {
                // x = startPadding + (index * stride)
                const x = paddingX + (layerSpacing * layerIndex);
                const layerNodes = [];
                const vSpacing = height / (count + 1);

                for (let i = 0; i < count; i++) {
                    layerNodes.push({
                        x: x,
                        y: vSpacing * (i + 1),
                        layer: layerIndex,
                        active: 0 // For flash effect
                    });
                }
                nodes.push(layerNodes);
            });
        }

        function spawnPulse() {
            // Pick a random start node from input layer
            const startLayerIdx = 0;
            if (nodes[startLayerIdx].length === 0) return;
            const startNodeIdx = Math.floor(Math.random() * nodes[startLayerIdx].length);
            const startNode = nodes[startLayerIdx][startNodeIdx];

            // Pick a random target in next layer
            const endLayerIdx = 1;
            if (nodes[endLayerIdx].length === 0) return;
            const endNodeIdx = Math.floor(Math.random() * nodes[endLayerIdx].length);
            const endNode = nodes[endLayerIdx][endNodeIdx];

            pulses.push({
                x: startNode.x,
                y: startNode.y,
                targetX: endNode.x,
                targetY: endNode.y,
                progress: 0,
                speed: 0.05 + Math.random() * 0.05,
                nextTargetLayer: 2, // Layer after hidden
                currentEndNode: endNode // To trigger flash
            });

            // Flash start node
            startNode.active = 1;
        }

        function fireInput() {
            // activate random sensors in input layer
            const inputLayer = nodes[0];
            // Pick 1-2 random active inputs
            const activeCount = 1 + Math.floor(Math.random() * 2);

            for (let i = 0; i < activeCount; i++) {
                const node = inputLayer[Math.floor(Math.random() * inputLayer.length)];
                node.active = 1;
                // Trigger propagation from this node
                propagate(node);
            }
        }

        function propagate(sourceNode) {
            const currentLayerIdx = sourceNode.layer;
            const nextLayerIdx = currentLayerIdx + 1;

            if (nextLayerIdx >= layers.length) return; // Output layer has no next

            const nextLayer = nodes[nextLayerIdx];

            // Send signal to ALL nodes in next layer
            nextLayer.forEach(targetNode => {
                // Random weight for "connection strength"
                // Bias towards some connections being stronger
                const weight = Math.random();

                // Only visualize if weight is significant enough to reduce clutter
                // But user asked for "all of them", so we send all, but brightness varies

                pulses.push({
                    x: sourceNode.x,
                    y: sourceNode.y,
                    startX: sourceNode.x,
                    startY: sourceNode.y,
                    targetX: targetNode.x,
                    targetY: targetNode.y,
                    targetNode: targetNode, // Keep ref to activate
                    progress: 0,
                    speed: 0.04 + (Math.random() * 0.02), // Slight speed var
                    strength: weight
                });
            });
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);

            // 1. Draw Static Connections (faint)
            ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
            ctx.lineWidth = 1;

            for (let l = 0; l < nodes.length - 1; l++) {
                const currentLayer = nodes[l];
                const nextLayer = nodes[l + 1];

                currentLayer.forEach(n1 => {
                    nextLayer.forEach(n2 => {
                        ctx.beginPath();
                        ctx.moveTo(n1.x, n1.y);
                        ctx.lineTo(n2.x, n2.y);
                        ctx.stroke();
                    });
                });
            }

            // 2. Update & Draw Pulses
            ctx.fillStyle = '#00f3ff';

            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += p.speed;

                const curX = p.startX + (p.targetX - p.startX) * p.progress;
                const curY = p.startY + (p.targetY - p.startY) * p.progress;

                // Draw pulse
                const brightness = 0.2 + (p.strength * 0.8); // Min 0.2, Max 1.0
                ctx.fillStyle = `rgba(0, 243, 255, ${brightness})`;

                ctx.beginPath();
                // Size also varies slightly by strength
                const size = 1.5 + (p.strength * 1.5);
                ctx.arc(curX, curY, size, 0, Math.PI * 2);
                ctx.fill();

                // Check arrival
                if (p.progress >= 1) {
                    // Activate target node based on incoming signal strength
                    p.targetNode.active = Math.min(1, p.targetNode.active + (p.strength * 0.5));

                    // Propagate further if "signal" is strong enough to trigger firing
                    // This creates a nice filtering effect where checking deeper layers is scarce
                    if (p.strength > 0.3) {
                        propagate(p.targetNode);
                    }

                    pulses.splice(i, 1);
                }
            }

            // 3. Draw Nodes
            nodes.forEach(layer => {
                layer.forEach(node => {
                    // Draw node
                    ctx.beginPath();
                    ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
                    ctx.fillStyle = '#0b0c15';
                    ctx.fill();

                    // Border / Glow
                    if (node.active > 0.01) {
                        ctx.strokeStyle = `rgba(0, 243, 255, ${node.active})`;
                        ctx.shadowBlur = 10 * node.active;
                        ctx.shadowColor = '#00f3ff';
                        ctx.fillStyle = `rgba(0, 243, 255, ${node.active})`;
                        ctx.fill(); // Fill on flash

                        // Decay
                        node.active *= 0.9;
                    } else {
                        ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
                        ctx.shadowBlur = 0;
                        ctx.fillStyle = '#0b0c15';
                    }

                    ctx.lineWidth = 1;
                    ctx.stroke();

                    // Reset shadow
                    ctx.shadowBlur = 0;
                });
            });

            requestAnimationFrame(draw);
        }

        // Init
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
        resizeCanvas();
        draw();

        // Fire inputs on a timer for consistent pacing
        setInterval(() => {
            if (nodes.length > 0) fireInput();
        }, 1200);
    }


    // ================================================
    // 6. CUSTOM PDF RENDERING CONTROLLER
    // ================================================
    class PDFController {
        constructor(container) {
            this.container = container;
            this.zoomLevel = 1.0;
            this.baseWidth = 800; // Default document width
            this.pdfDoc = null;
            this.pdfjsLib = null;

            // UI Elements
            this.zoomInBtn = document.getElementById('zoom-in');
            this.zoomOutBtn = document.getElementById('zoom-out');
            this.zoomDisplay = document.getElementById('zoom-value');

            this.init();
        }

        async init() {
            try {
                const basePath = this.container.dataset.baseUrl || '/';
                const libPath = `${basePath}js/pdf.mjs`;
                const workerPath = `${basePath}js/pdf.worker.mjs`;
                const pdfPath = `${basePath}dissertation.pdf`;

                // Import Library
                this.pdfjsLib = await import(libPath);
                this.pdfjsLib.GlobalWorkerOptions.workerSrc = workerPath;

                // Load Document
                const loadingTask = this.pdfjsLib.getDocument(pdfPath);
                this.pdfDoc = await loadingTask.promise;

                // Clear Loading
                const loader = this.container.querySelector('.pdf-loading');
                if (loader) loader.remove();

                // Setup Controls
                if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => this.changeZoom(0.2));
                if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => this.changeZoom(-0.2));

                // Initial Render
                this.renderAllPages();

            } catch (error) {
                console.error('PDF Init Error:', error);
                this.container.innerHTML = `<div class="error-msg" style="color:var(--tech-accent); padding:2rem; text-align:center;">SYSTEM FAILURE: ${error.message}</div>`;
            }
        }

        changeZoom(delta) {
            const newZoom = Math.round((this.zoomLevel + delta) * 10) / 10;
            if (newZoom >= 0.6 && newZoom <= 3.0) {
                this.zoomLevel = newZoom;
                this.updateUI();
                this.renderAllPages();
            }
        }

        updateUI() {
            if (this.zoomDisplay) {
                this.zoomDisplay.textContent = `${Math.round(this.zoomLevel * 100)}%`;
            }
        }

        async renderAllPages() {
            // Remove existing pages, keep controls
            const pages = this.container.querySelectorAll('.pdf-page-wrapper');
            pages.forEach(p => p.remove());

            for (let pageNum = 1; pageNum <= this.pdfDoc.numPages; pageNum++) {
                await this.renderPage(pageNum);
            }
        }

        async renderPage(pageNum) {
            const page = await this.pdfDoc.getPage(pageNum);

            // Container
            const wrapper = document.createElement('div');
            wrapper.className = 'pdf-page-wrapper';
            this.container.appendChild(wrapper);

            // Canvas
            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            wrapper.appendChild(canvas);

            // Annotations (Links)
            const annotationLayerDiv = document.createElement('div');
            annotationLayerDiv.className = 'annotationLayer';
            wrapper.appendChild(annotationLayerDiv);

            // Scaling Logic
            const viewportPadding = 40;
            const containerWidth = this.container.clientWidth - viewportPadding;

            // Standard width logic: 800px base or container width if smaller
            const standardWidth = Math.min(containerWidth, 800);
            const targetWidth = standardWidth * this.zoomLevel;

            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const scale = targetWidth / unscaledViewport.width;
            const viewport = page.getViewport({ scale: scale });

            // Set dimensions
            const outputScale = window.devicePixelRatio || 1;

            canvas.width = Math.floor(viewport.width * outputScale);
            canvas.height = Math.floor(viewport.height * outputScale);

            canvas.style.width = `${Math.floor(viewport.width)}px`;
            canvas.style.height = `${Math.floor(viewport.height)}px`;

            wrapper.style.width = `${Math.floor(viewport.width)}px`;
            wrapper.style.height = `${Math.floor(viewport.height)}px`;

            // Render Canvas
            const renderContext = {
                canvasContext: canvas.getContext('2d'),
                viewport: viewport,
                transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : null
            };

            await page.render(renderContext).promise;

            // Render Annotations
            const annotations = await page.getAnnotations();

            if (annotations.length > 0) {
                annotations.forEach(annotation => {
                    // 1. External Links
                    if (annotation.subtype === 'Link' && annotation.url) {
                        const link = document.createElement('a');
                        link.href = annotation.url;
                        link.target = '_blank';
                        link.title = annotation.url;

                        const rect = viewport.convertToViewportRectangle(annotation.rect);
                        // [xMin, yMin, xMax, yMax]
                        const x = rect[0];
                        const y = rect[1];
                        const w = rect[2] - rect[0];
                        const h = rect[3] - rect[1];

                        link.style.left = `${x}px`;
                        link.style.top = `${y}px`;
                        link.style.width = `${w}px`;
                        link.style.height = `${h}px`;
                        link.style.position = 'absolute';

                        annotationLayerDiv.appendChild(link);
                    }

                    // 2. Internal Links (Destinations)
                    else if (annotation.subtype === 'Link' && annotation.dest) {
                        const link = document.createElement('a');
                        link.style.cursor = 'pointer';
                        link.title = "Go to section";

                        const rect = viewport.convertToViewportRectangle(annotation.rect);
                        const x = rect[0];
                        const y = rect[1];
                        const w = rect[2] - rect[0];
                        const h = rect[3] - rect[1];

                        link.style.left = `${x}px`;
                        link.style.top = `${y}px`;
                        link.style.width = `${w}px`;
                        link.style.height = `${h}px`;
                        link.style.position = 'absolute';

                        link.addEventListener('click', async (e) => {
                            e.preventDefault();
                            let dest = annotation.dest;
                            if (typeof dest === 'string') {
                                dest = await this.pdfDoc.getDestination(dest);
                            }
                            if (dest) {
                                const pageIndex = await this.pdfDoc.getPageIndex(dest[0]);
                                const targetWrapper = this.container.querySelectorAll('.pdf-page-wrapper')[pageIndex];
                                if (targetWrapper) {
                                    targetWrapper.scrollIntoView({ behavior: 'smooth' });
                                }
                            }
                        });

                        annotationLayerDiv.appendChild(link);
                    }
                });
            }
        }
    }

    const pdfContainer = document.getElementById('pdf-container');
    if (pdfContainer) {
        new PDFController(pdfContainer);
    }

});
