class GlobeAutomation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.context = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // Configuration
        this.baseScale = Math.min(this.width, this.height) / 2.5;
        this.globeColor = '#1e293b';
        this.waterColor = '#0b1426';
        this.landColor = 'rgba(255, 255, 255, 0.16)';
        this.strokeColor = 'rgba(148, 163, 184, 0.22)';

        // State
        this.countries = [];
        this.unfilledDependencies = [];
        this.filledCountries = new Map(); // Country Object -> Color string
        this.currentCountry = null;
        this.isVisible = true;

        // Master Animation Loop State
        this.isRotating = false;
        this.rotateStart = null;
        this.rotateDuration = 1400;
        this.startRotate = [0, 0];
        this.targetRotate = [0, 0];
        this.rotateCallback = null;
        this.waitTimer = null;

        // D3 Setup
        this.projection = d3.geoOrthographic()
            .scale(this.baseScale)
            .translate([this.width / 2, this.height / 2])
            .clipAngle(90);

        this.path = d3.geoPath()
            .projection(this.projection)
            .context(this.context);

        this.init();
    }

    async init() {
        this.resize();
        window.addEventListener('resize', () => this.resize(), { passive: true });

        // Pause animation when scrolled out of view on playground
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach((e) => {
                    this.isVisible = e.isIntersecting;
                });
            }, { threshold: 0.05 });
            observer.observe(this.canvas);
        }

        try {
            let data;
            try {
                data = await d3.json('/Portfolio/playground/countries-quiz/world.geojson');
            } catch {
                try {
                    data = await d3.json('./playground/countries-quiz/world.geojson');
                } catch {
                    data = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
                }
            }
            const ignored = ["Antarctica", "French Southern and Antarctic Lands"];
            this.countries = data.features.filter(d => !ignored.includes(d.properties.name));

            // Pre-calculate spherical centroids once on load to avoid heavy geometry math per frame
            this.countries.forEach(c => {
                c._centroid = d3.geoCentroid(c);
            });

            this.resetGame();

            // Start ONE unified frame loop
            this.startMasterLoop();
            this.scheduleNextTurn(600);
        } catch (error) {
            // Ignore network errors if offline
        }
    }

    resize() {
        const parent = this.canvas.parentElement;
        this.width = parent ? parent.offsetWidth : window.innerWidth;
        this.height = parent ? parent.offsetHeight : window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.baseScale = Math.min(this.width, this.height) / 2.2;

        this.projection
            .scale(this.baseScale)
            .translate([this.width / 2, this.height / 2]);
    }

    getRandomColor() {
        const rand = Math.random();
        if (rand < 0.60) return '#4ade80'; // Green
        else if (rand < 0.85) return '#facc15'; // Yellow
        return '#ef4444'; // Red
    }

    resetGame() {
        this.filledCountries.clear();

        const shuffled = [...this.countries].sort(() => Math.random() - 0.5);
        const preFillCount = Math.floor(shuffled.length / 3);

        const toFill = shuffled.slice(0, preFillCount);
        this.unfilledDependencies = shuffled.slice(preFillCount);

        toFill.forEach(country => {
            this.filledCountries.set(country, this.getRandomColor());
        });
    }

    scheduleNextTurn(delayMs) {
        if (this.waitTimer) clearTimeout(this.waitTimer);
        this.waitTimer = setTimeout(() => {
            this.nextTurn();
        }, delayMs);
    }

    nextTurn() {
        if (this.unfilledDependencies.length === 0) {
            this.scheduleNextTurn(1800);
            this.resetGame();
            return;
        }

        const nextCountry = this.unfilledDependencies.pop();
        this.currentCountry = nextCountry;

        // Smooth flight to target country centroid
        const target = [-nextCountry._centroid[0], -nextCountry._centroid[1]];
        this.startRotateTo(target, () => {
            this.filledCountries.set(nextCountry, this.getRandomColor());
            this.scheduleNextTurn(1000);
        });
    }

    startRotateTo(targetRotate, callback) {
        this.startRotate = this.projection.rotate();
        this.targetRotate = targetRotate;
        this.rotateStart = performance.now();
        this.isRotating = true;
        this.rotateCallback = callback;
    }

    startMasterLoop() {
        const tick = (now) => {
            requestAnimationFrame(tick);
            if (!this.isVisible) return; // Zero CPU/GPU work when portal is not visible

            // 1. Frame-synchronized rotation update
            if (this.isRotating) {
                const elapsed = now - this.rotateStart;
                const t = Math.min(1.0, elapsed / this.rotateDuration);
                const ease = d3.easeCubicInOut(t);

                const current = d3.interpolate(this.startRotate, this.targetRotate)(ease);
                this.projection.rotate(current);

                if (t >= 1.0) {
                    this.projection.rotate(this.targetRotate);
                    this.isRotating = false;
                    const cb = this.rotateCallback;
                    this.rotateCallback = null;
                    if (cb) cb();
                }
            } else {
                // Subtle organic idle drift while waiting between countries
                const rot = this.projection.rotate();
                this.projection.rotate([rot[0] + 0.02, rot[1]]);
            }

            // 2. High-performance batched render
            this.renderFrame();
        };

        requestAnimationFrame(tick);
    }

    renderFrame() {
        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);

        const cx = this.width / 2;
        const cy = this.height / 2;
        const rad = this.baseScale;

        // 1. Solid opaque base sphere to prevent any transparency clipping
        ctx.beginPath();
        ctx.arc(cx, cy, rad, 0, Math.PI * 2);
        ctx.fillStyle = '#080e1c';
        ctx.fill();

        // 2. Spherical radial gradient for ocean
        const oceanGrad = ctx.createRadialGradient(
            cx, cy, rad * 0.15,
            cx, cy, rad
        );
        oceanGrad.addColorStop(0, '#101d38');
        oceanGrad.addColorStop(0.75, '#0a1426');
        oceanGrad.addColorStop(1, '#050a14');

        ctx.beginPath();
        this.path({ type: "Sphere" });
        ctx.fillStyle = oceanGrad;
        ctx.fill();

        // 3. Batched Draw: Base Unfilled Countries & Color Buckets
        // Fast hemisphere culling using precomputed centroids
        const rot = this.projection.rotate();
        const centerLon = -rot[0];
        const centerLat = -rot[1];
        const maxAng = Math.PI / 2 + 0.35; // Front visible hemisphere + margin

        const baseFeatures = [];
        const greenFeatures = [];
        const yellowFeatures = [];
        const redFeatures = [];

        for (let i = 0; i < this.countries.length; i++) {
            const country = this.countries[i];
            // Skip backface countries completely (saves ~50% path computation)
            if (d3.geoDistance([centerLon, centerLat], country._centroid) > maxAng) {
                continue;
            }

            const color = this.filledCountries.get(country);
            if (!color) {
                baseFeatures.push(country);
            } else if (color === '#4ade80') {
                greenFeatures.push(country);
            } else if (color === '#facc15') {
                yellowFeatures.push(country);
            } else if (color === '#ef4444') {
                redFeatures.push(country);
            } else {
                baseFeatures.push(country);
            }
        }

        // Batch 1: Unfilled land (1 draw call)
        if (baseFeatures.length > 0) {
            ctx.beginPath();
            this.path({ type: "FeatureCollection", features: baseFeatures });
            ctx.fillStyle = this.landColor;
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }

        // Batch 2: Green countries (1 draw call)
        if (greenFeatures.length > 0) {
            ctx.beginPath();
            this.path({ type: "FeatureCollection", features: greenFeatures });
            ctx.fillStyle = '#4ade80';
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }

        // Batch 3: Yellow countries (1 draw call)
        if (yellowFeatures.length > 0) {
            ctx.beginPath();
            this.path({ type: "FeatureCollection", features: yellowFeatures });
            ctx.fillStyle = '#facc15';
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }

        // Batch 4: Red countries (1 draw call)
        if (redFeatures.length > 0) {
            ctx.beginPath();
            this.path({ type: "FeatureCollection", features: redFeatures });
            ctx.fillStyle = '#ef4444';
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = this.strokeColor;
            ctx.stroke();
        }

        // Rim outline removed per user instruction
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GlobeAutomation('quiz-bg-canvas');
});
