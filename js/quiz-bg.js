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
        this.waterColor = 'rgba(56, 189, 248, 0.05)';
        this.landColor = 'rgba(255, 255, 255, 0.1)';
        this.strokeColor = 'rgba(148, 163, 184, 0.1)';

        // Colors for filling (Green, Yellow, Red)
        this.fillColors = [
            '#4ade80', // Green
            '#facc15', // Yellow
            '#ef4444'  // Red
        ];

        // State
        this.countries = [];
        this.unfilledDependencies = [];
        this.filledCountries = new Map(); // ID -> Color
        this.currentCountry = null;

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
        window.addEventListener('resize', () => this.resize());

        // Load Data (Same source as the main app)
        try {
            const data = await d3.json('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');

            // Filter
            const ignored = ["Antarctica", "Somaliland", "Kosovo"];
            this.countries = data.features.filter(d => !ignored.includes(d.properties.name));

            this.resetGame();

            // Start Loop
            this.animate();
            this.nextTurn();

        } catch (error) {
            console.error("Failed to load globe data:", error);
        }
    }

    resize() {
        this.width = this.canvas.parentElement.offsetWidth;
        this.height = this.canvas.parentElement.offsetHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.baseScale = Math.min(this.width, this.height) / 2.2; // Slightly larger for background

        this.projection
            .scale(this.baseScale)
            .translate([this.width / 2, this.height / 2]);
    }

    resetGame() {
        this.filledCountries.clear();
        // Shuffle countries to create a random order list
        this.unfilledDependencies = [...this.countries].sort(() => Math.random() - 0.5);
    }

    nextTurn() {
        if (this.unfilledDependencies.length === 0) {
            // Reset if full
            setTimeout(() => {
                this.resetGame();
                this.nextTurn();
            }, 2000);
            return;
        }

        const nextCountry = this.unfilledDependencies.pop();
        this.currentCountry = nextCountry;

        // 1. Rotate to country
        this.rotateTo(nextCountry, () => {
            // 2. Color it
            // Weighted Random: 60% Green, 25% Yellow, 15% Red
            const rand = Math.random();
            let color;
            if (rand < 0.60) color = '#4ade80'; // Green
            else if (rand < 0.85) color = '#facc15'; // Yellow (0.60 + 0.25)
            else color = '#ef4444'; // Red

            this.filledCountries.set(nextCountry.id || nextCountry.properties.name, color);

            // 3. Wait and repeat
            setTimeout(() => {
                this.nextTurn();
            }, 1000); // Stay on country for 1s
        });
    }

    rotateTo(country, callback) {
        const centroid = d3.geoCentroid(country);
        const targetRotate = [-centroid[0], -centroid[1]];
        const startRotate = this.projection.rotate();

        const duration = 1500; // 1.5s rotation
        const start = performance.now();

        const animateRotation = (time) => {
            const elapsed = time - start;
            const t = Math.min(1, elapsed / duration);
            const ease = d3.easeCubicInOut(t);

            this.projection.rotate(d3.interpolate(startRotate, targetRotate)(ease));

            if (t < 1) {
                requestAnimationFrame(animateRotation);
            } else {
                if (callback) callback();
            }
        };

        requestAnimationFrame(animateRotation);
    }

    animate() {
        const render = () => {
            this.context.clearRect(0, 0, this.width, this.height);

            // Water
            this.context.beginPath();
            this.path({ type: "Sphere" });
            this.context.fillStyle = this.waterColor;
            this.context.fill();

            // All Countries (Base)
            this.context.beginPath();
            this.path({ type: "FeatureCollection", features: this.countries });
            this.context.fillStyle = this.landColor;
            this.context.fill();
            this.context.lineWidth = 0.5;
            this.context.strokeStyle = this.strokeColor;
            this.context.stroke();

            // Filled Countries
            this.filledCountries.forEach((color, id) => {
                const country = this.countries.find(c => (c.id || c.properties.name) === id);
                if (country) {
                    this.context.beginPath();
                    this.path(country);
                    this.context.fillStyle = color;
                    this.context.fill();
                    this.context.stroke();
                }
            });

            // Atmosphere / Outline
            this.context.beginPath();
            this.path({ type: "Sphere" });
            this.context.lineWidth = 1;
            this.context.strokeStyle = 'rgba(255, 255, 255, 0.15)';
            this.context.stroke();

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    new GlobeAutomation('quiz-bg-canvas');
});
