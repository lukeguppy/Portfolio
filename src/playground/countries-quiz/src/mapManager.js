import * as d3 from 'd3';
import { COLOURS } from './constants.js';

export class MapManager {
    constructor(canvasId) {
        this.canvasId = canvasId;
        this.canvas = null;
        this.context = null;
        this.width = 0;
        this.height = 0;

        // D3 Geo objects
        this.projection = null;
        this.path = null;

        // Data
        this.worldData = null;
        this.countries = [];

        // State
        this.currentRotation = [0, 0];
        this.countryStates = new Map();
        this.renderLoopId = null;
        this.animationId = null; // Track the active zoom/flight animation
    }

    async init() {
        this.canvas = document.getElementById(this.canvasId);
        this.context = this.canvas.getContext('2d');

        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Setup Projection
        this.projection = d3.geoOrthographic()
            .scale(this.height / 2.5)
            .translate([this.width / 2, this.height / 2])
            .clipAngle(90);

        this.path = d3.geoPath()
            .projection(this.projection)
            .context(this.context);

        // Add touch/mouse drag handler
        const drag = d3.drag()
            .on('start', () => {
                if (this.animationId) {
                    cancelAnimationFrame(this.animationId);
                    this.animationId = null;
                }
            })
            .on('drag', (event) => {
                const rotate = this.projection.rotate();
                const k = 75 / this.projection.scale();
                this.projection.rotate([
                    rotate[0] + event.dx * k,
                    Math.max(-85, Math.min(85, rotate[1] - event.dy * k))
                ]);
            });
        d3.select(this.canvas).call(drag);

        await this.loadWorldData();

        // Start ONE single render loop
        this.startRenderLoop();
    }

    startRenderLoop() {
        if (this.renderLoopId) cancelAnimationFrame(this.renderLoopId);

        const loop = (time) => {
            this.render(time);
            this.renderLoopId = requestAnimationFrame(loop);
        };
        this.renderLoopId = requestAnimationFrame(loop);
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.baseScale = Math.min(this.width, this.height) / 2.5;
        this.focusScale = this.baseScale * 1.5;

        if (this.projection) {
            this.projection
                .scale(this.baseScale)
                .translate([this.width / 2, this.height / 2]);
        }
    }

    async loadWorldData() {
        try {
            // Load clean, local curated GeoJSON (offline, fast, accurate borders)
            const isGhPages = window.location.pathname.startsWith('/Portfolio');
            const prefix = isGhPages ? '/Portfolio' : '';
            let response;
            try {
                response = await fetch('./world.geojson');
                if (!response.ok) throw new Error('Local fetch failed');
            } catch {
                try {
                    response = await fetch(${prefix}/playground/countries-quiz/world.geojson);
                    if (!response.ok) throw new Error('Prefix fetch failed');
                } catch {
                    response = await fetch('/playground/countries-quiz/world.geojson');
                }
            }
            const data = await response.json();
            this.worldData = data;
            // Only filter out uninhabited polar lands; Kosovo and all recognized nations remain
            const ignored = ["Antarctica", "French Southern and Antarctic Lands"];
            this.countries = data.features.filter(d => !ignored.includes(d.properties.name));

            this.countries.forEach(c => {
                const rawName = c.properties.name;

                if (rawName === "Northern Cyprus") {
                    c.id = "Cyprus";
                    c.name = "Cyprus";
                } else if (rawName === "Somaliland") {
                    c.id = "Somalia";
                    c.name = "Somalia";
                } else if (rawName === "West Bank" || rawName.includes("Gaza")) {
                    c.id = "Palestine";
                    c.name = "Palestine";
                } else if (rawName === "England") {
                    c.id = "United Kingdom";
                    c.name = "United Kingdom";
                } else if (rawName === "USA") {
                    c.id = "United States of America";
                    c.name = "United States of America";
                } else if (rawName === "Burma") {
                    c.id = "Myanmar";
                    c.name = "Myanmar";
                } else {
                    c.id = rawName;
                    c.name = rawName;
                }
            });

        } catch (e) {
            console.error("Failed to load map data", e);
        }
    }

    zoomToCountry(countryId) {
        const country = this.countries.find(c => c.id === countryId);
        if (!country) return;

        // CANCEL previous animation to prevent fighting/stutter
        if (this.animationId) cancelAnimationFrame(this.animationId);

        const centroid = d3.geoCentroid(country);
        const targetRotate = [-centroid[0], -centroid[1]];
        const startRotate = this.projection.rotate();

        // Distance & Zoom Calcs
        const p1 = [-startRotate[0], -startRotate[1]];
        const p2 = centroid;
        const distanceRad = d3.geoDistance(p1, p2);
        const distanceDeg = distanceRad * (180 / Math.PI);

        const bounds = d3.geoBounds(country);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const span = Math.max(1, Math.max(Math.abs(dx), Math.abs(dy)));

        let targetZoom = this.baseScale * (40 / span);
        targetZoom = Math.max(this.baseScale, Math.min(this.baseScale * 12, targetZoom));

        const startScale = this.projection.scale();
        const flightScale = this.baseScale;

        const duration = 1200 + distanceDeg * 10;
        const start = performance.now();

        const animate = (time) => {
            const elapsed = time - start;
            const t = Math.min(1, elapsed / duration);
            const easeT = d3.easeCubicInOut(t);

            // Update Model (Projection)
            this.projection.rotate(d3.interpolate(startRotate, targetRotate)(easeT));

            // Zoom Model
            const linearBase = startScale + (targetZoom - startScale) * easeT;

            let currentScale = linearBase;
            if (distanceDeg > 45) {
                if (t < 0.5) {
                    const slide = d3.easeCubicOut(t * 2);
                    currentScale = startScale + (flightScale - startScale) * slide;
                } else {
                    const slide = d3.easeCubicIn((t - 0.5) * 2);
                    currentScale = flightScale + (targetZoom - flightScale) * slide;
                }
            }

            this.projection.scale(currentScale);

            if (t < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                // Snap to final
                this.projection.rotate(targetRotate);
                this.projection.scale(targetZoom);
                this.animationId = null;
            }
            // NO RENDER CALL HERE - Main loop handles it
        };

        this.animationId = requestAnimationFrame(animate);
    }

    highlightCountry(countryId, status) {
        // Store state in Map
        this.countryStates.set(countryId, status);

        let colour = COLOURS.default;

        if (status === 'selected') colour = COLOURS.active;
        else if (status === 'correct') colour = COLOURS.correct;
        else if (status === 'partial') colour = COLOURS.partial;
        else if (status === 'wrong') colour = COLOURS.wrong;
        else if (status === 'skipped') colour = COLOURS.skipped;

        // D3 update
        // (Note: We primarily use Canvas render loop, but keeping this if we switch back or for testing)
        if (this.svg) {
            this.svg.selectAll('path')
                .filter(d => d.id === countryId)
                .transition().duration(200)
                .attr('fill', colour);
        }
    }

    render(time) {
        if (!this.context || !this.worldData) return;

        const ctx = this.context;
        ctx.clearRect(0, 0, this.width, this.height);

        const currentScale = this.projection.scale();
        const [tx, ty] = this.projection.translate();

        // 1. Solid opaque base sphere to prevent any transparency clipping
        ctx.beginPath();
        ctx.arc(tx, ty, currentScale, 0, Math.PI * 2);
        ctx.fillStyle = '#080e1c';
        ctx.fill();

        // 2. Spherical radial gradient for ocean matching the playground globe
        const oceanGrad = ctx.createRadialGradient(
            tx, ty, currentScale * 0.15,
            tx, ty, currentScale
        );
        oceanGrad.addColorStop(0, '#101d38');
        oceanGrad.addColorStop(0.75, '#0a1426');
        oceanGrad.addColorStop(1, '#050a14');

        ctx.beginPath();
        this.path({ type: "Sphere" });
        ctx.fillStyle = oceanGrad;
        ctx.fill();

        // 3. Draw Default Countries (Batched)
        ctx.beginPath();
        let hasDefault = false;
        this.countries.forEach(feature => {
            const isSpecial = this.countryStates.has(feature.id);
            const status = isSpecial ? this.countryStates.get(feature.id) : 'default';
            if (!isSpecial || status === 'default') {
                this.path(feature);
                hasDefault = true;
            }
        });

        if (hasDefault) {
            ctx.fillStyle = COLOURS.default;
            ctx.fill();
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = COLOURS.stroke;
            ctx.stroke();
        }

        // 4. Draw Active / Guessed Countries
        this.countries.forEach(feature => {
            const status = this.countryStates.get(feature.id);
            if (status && status !== 'default') {
                ctx.beginPath();
                this.path(feature);
                switch (status) {
                    case 'selected': ctx.fillStyle = COLOURS.active; break;
                    case 'correct': ctx.fillStyle = COLOURS.correct; break;
                    case 'partial': ctx.fillStyle = COLOURS.partial; break;
                    case 'wrong': ctx.fillStyle = COLOURS.wrong; break;
                    case 'skipped': ctx.fillStyle = COLOURS.skipped; break;
                    default: ctx.fillStyle = COLOURS.default;
                }
                ctx.fill();
                ctx.lineWidth = status === 'selected' ? 1.4 : 0.6;
                ctx.strokeStyle = status === 'selected' ? '#ffffff' : COLOURS.stroke;
                ctx.stroke();
            }
        });
    }
}

