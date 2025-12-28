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
            const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
            const data = await response.json();
            this.worldData = data;
            // Filter out Antarctica and Kosvo/Somaliland if desired
            const ignored = ["Antarctica", "Somaliland", "Kosovo"];
            this.countries = data.features.filter(d => !ignored.includes(d.properties.name));

            this.countries.forEach(c => {
                // Political Merges:
                // We force IDs to be the English Names to ensure "Northern Cyprus" (merged to "Cyprus")
                // matches the main "Cyprus" (which would otherwise default to ISO "CYP").

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
                } else {
                    // Use Name as ID for everything to ensure consistency
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
        if (!this.context || !this.worldData) return; // Just return, loop continues via startRenderLoop wrapper

        const ctx = this.context;
        // Don't clear rect if we want trails? No, we want clean.
        ctx.clearRect(0, 0, this.width, this.height);

        // 1. Draw Water
        ctx.beginPath();
        this.path({ type: "Sphere" });
        ctx.fillStyle = COLOURS.water;
        ctx.fill();

        // 2. Draw Countries (Batched)
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

        // Special
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
                ctx.lineWidth = 0.5;
                ctx.strokeStyle = COLOURS.stroke;
                ctx.stroke();
            }
        });

        // 3. Draw Atmosphere
        ctx.beginPath();
        this.path({ type: "Sphere" });
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // NO recursive requestAnimationFrame here - handled by startRenderLoop logic
    }
}

