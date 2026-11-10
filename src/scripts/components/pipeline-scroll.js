/**
 * Scroll-driven vertical pipeline spine (`track-line` + `track-head`),
 * module activation, cipher text decode, 3D perspective telemetry background
 * canvas (`#dissertation-bg-canvas`), and hero autonomous perception radar (`#hero-radar-canvas`).
 *
 * Uses continuous 120Hz exponential smoothing identical to the Experience timeline
 * on About Me for liquid-smooth scrolling and physical tactile parity.
 */
export function initPipelineScroll() {
  const pipelineSection = document.querySelector('.system-pipeline');
  const pipelineTrack = document.querySelector('.pipeline-track');
  const trackLine = document.querySelector('.track-line');
  const trackHead = document.querySelector('.track-head');
  const modules = [...document.querySelectorAll('.pipeline-module')];
  const scrollCue = document.querySelector('[data-diss-scroll-cue]');
  const bgCanvas = document.getElementById('dissertation-bg-canvas');
  const heroRadarCanvas = document.getElementById('hero-radar-canvas');

  // 1. Cipher decode effect on hero title ("Autonomous")
  const glitchEl = document.querySelector('.glitch-text');
  if (glitchEl) {
    const finalText = glitchEl.getAttribute('data-text') || 'Autonomous';
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*';
    let iteration = 0;
    const interval = window.setInterval(() => {
      glitchEl.textContent = finalText
        .split('')
        .map((ch, idx) => {
          if (idx < iteration) return finalText[idx];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      if (iteration >= finalText.length) {
        window.clearInterval(interval);
        glitchEl.textContent = finalText;
      }
      iteration += 1 / 3;
    }, 32);
  }

  let activePhase = 'overview';
  let scrollProgress = 0;
  let smoothScrollY = window.scrollY;
  let currentProgress = 0;
  let lastTime = performance.now();

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  // 2. Measure Spine & Module Anchors
  let pipelineDocTop = 0;
  let firstMarkerY = 0;
  let lastMarkerY = 0;
  let trackSpan = 1;
  let moduleLayout = [];

  function measureLayout() {
    if (!pipelineSection || !modules.length) return;
    const scrollY = window.scrollY;
    const sectionRect = pipelineSection.getBoundingClientRect();
    pipelineDocTop = sectionRect.top + scrollY;

    moduleLayout = modules.map((mod) => {
      const marker = mod.querySelector('.module-marker');
      const markerRect = marker ? marker.getBoundingClientRect() : mod.getBoundingClientRect();
      const markerCenterDocY = markerRect.top + scrollY + markerRect.height / 2;
      const relY = markerCenterDocY - pipelineDocTop;
      const modRect = mod.getBoundingClientRect();
      const modCenterDocY = modRect.top + scrollY + modRect.height / 2;
      return {
        el: mod,
        marker,
        relY,
        docY: markerCenterDocY,
        docCenterY: modCenterDocY,
      };
    });

    firstMarkerY = moduleLayout[0]?.relY ?? 0;
    lastMarkerY = moduleLayout[moduleLayout.length - 1]?.relY ?? Math.max(100, sectionRect.height - 40);
    trackSpan = Math.max(1, lastMarkerY - firstMarkerY);

    if (pipelineTrack) {
      pipelineTrack.style.top = `${firstMarkerY.toFixed(2)}px`;
      pipelineTrack.style.height = `${trackSpan.toFixed(2)}px`;
      pipelineTrack.style.bottom = 'auto';
    }
  }

  measureLayout();
  window.addEventListener('resize', measureLayout, { passive: true });
  window.addEventListener('load', measureLayout, { once: true });

  // 3. Continuous 120Hz Animation Loop
  function tick(now) {
    const dt = Math.min(0.064, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    const rawScrollY = window.scrollY;
    const vh = Math.max(1, window.innerHeight);

    if (scrollCue) {
      scrollCue.classList.toggle('hero-scroll-indicator--hidden', rawScrollY > 36);
    }

    // Exponential smoothing for fluid 120Hz tracking with zero jumpiness
    const decay = 1 - Math.exp(-14 * dt);
    smoothScrollY += (rawScrollY - smoothScrollY) * decay;

    // Track spine progress strictly from first marker to last marker
    const scanLineDocY = smoothScrollY + vh * 0.52;
    const firstDotDocY = pipelineDocTop + firstMarkerY;
    const targetRatio = clamp((scanLineDocY - firstDotDocY) / trackSpan, 0, 1);
    const progressDecay = 1 - Math.exp(-16 * dt);
    currentProgress += (targetRatio - currentProgress) * progressDecay;
    scrollProgress = currentProgress;

    if (trackLine && trackHead) {
      trackLine.style.transform = `scaleY(${currentProgress.toFixed(4)})`;
      const headTranslateY = (trackSpan * currentProgress).toFixed(2);
      trackHead.style.transform = `translate3d(-50%, ${headTranslateY}px, 0) translateY(-50%)`;
    }

    const lineTipDocY = firstDotDocY + trackSpan * currentProgress;

    moduleLayout.forEach((item) => {
      const isActive = lineTipDocY >= item.docY - 12;
      item.el.classList.toggle('active', isActive);
      if (isActive) {
        activePhase = item.el.dataset.phase || activePhase;
      }

      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        item.el.style.transform = 'none';
        item.el.style.opacity = '1';
      } else {
        const distFromVp = item.docCenterY - (smoothScrollY + vh * 0.5);
        const enterNorm = clamp(1 - (distFromVp / (vh * 0.65)), 0, 1);
        const ease = enterNorm * enterNorm * (3 - 2 * enterNorm);
        const parallaxOffset = clamp(distFromVp * 0.035, -16, 16);
        item.el.style.transform = `translate3d(0, ${parallaxOffset.toFixed(2)}px, 0)`;
        item.el.style.opacity = (0.5 + 0.5 * ease).toFixed(3);
      }
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);

  // 4. Hero Tactical GTA Minimap City Grid & Real Lidar Agent Simulation
  if (heroRadarCanvas) {
    const ctx = heroRadarCanvas.getContext('2d');
    if (ctx) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let pointerX = -9999;
      let pointerY = -9999;
      let pointerActive = false;

      // Street Grid Dimensions
      const ROAD_W = 38;
      const HALF_ROAD = 19;
      const LANE_OFF = 9.5;

      let X_STREETS = [];
      let Y_STREETS = [];
      let buildings = [];
      let wallSegments = [];
      let intersections = [];

      function rebuildCityLayout() {
        X_STREETS = [
          Math.round(width * 0.16),
          Math.round(width * 0.50),
          Math.round(width * 0.84),
        ];
        Y_STREETS = [
          Math.round(height * 0.22),
          Math.round(height * 0.50),
          Math.round(height * 0.78),
        ];

        // Tactical City Blocks (Buildings)
        buildings = [
          // 4 Inner Quadrant Blocks
          {
            x: X_STREETS[0] + HALF_ROAD + 16,
            y: Y_STREETS[0] + HALF_ROAD + 16,
            w: Math.max(20, (X_STREETS[1] - X_STREETS[0]) - ROAD_W - 32),
            h: Math.max(20, (Y_STREETS[1] - Y_STREETS[0]) - ROAD_W - 32),
            name: 'DISTRICT 01',
          },
          {
            x: X_STREETS[1] + HALF_ROAD + 16,
            y: Y_STREETS[0] + HALF_ROAD + 16,
            w: Math.max(20, (X_STREETS[2] - X_STREETS[1]) - ROAD_W - 32),
            h: Math.max(20, (Y_STREETS[1] - Y_STREETS[0]) - ROAD_W - 32),
            name: 'DISTRICT 02',
          },
          {
            x: X_STREETS[0] + HALF_ROAD + 16,
            y: Y_STREETS[1] + HALF_ROAD + 16,
            w: Math.max(20, (X_STREETS[1] - X_STREETS[0]) - ROAD_W - 32),
            h: Math.max(20, (Y_STREETS[2] - Y_STREETS[1]) - ROAD_W - 32),
            name: 'DISTRICT 03',
          },
          {
            x: X_STREETS[1] + HALF_ROAD + 16,
            y: Y_STREETS[1] + HALF_ROAD + 16,
            w: Math.max(20, (X_STREETS[2] - X_STREETS[1]) - ROAD_W - 32),
            h: Math.max(20, (Y_STREETS[2] - Y_STREETS[1]) - ROAD_W - 32),
            name: 'DISTRICT 04',
          },
          // Perimeter Blocks
          {
            x: 8,
            y: Y_STREETS[0] + HALF_ROAD + 16,
            w: Math.max(20, X_STREETS[0] - HALF_ROAD - 24),
            h: Math.max(20, (Y_STREETS[2] - Y_STREETS[0]) - 32),
            name: 'WEST TOWER',
          },
          {
            x: X_STREETS[2] + HALF_ROAD + 16,
            y: Y_STREETS[0] + HALF_ROAD + 16,
            w: Math.max(20, width - (X_STREETS[2] + HALF_ROAD + 24)),
            h: Math.max(20, (Y_STREETS[2] - Y_STREETS[0]) - 32),
            name: 'EAST HUB',
          },
          {
            x: X_STREETS[0] + HALF_ROAD + 16,
            y: 8,
            w: Math.max(20, (X_STREETS[2] - X_STREETS[0]) - ROAD_W - 32),
            h: Math.max(20, Y_STREETS[0] - HALF_ROAD - 24),
            name: 'NORTH COMPLEX',
          },
          {
            x: X_STREETS[0] + HALF_ROAD + 16,
            y: Y_STREETS[2] + HALF_ROAD + 16,
            w: Math.max(20, (X_STREETS[2] - X_STREETS[0]) - ROAD_W - 32),
            h: Math.max(20, height - (Y_STREETS[2] + HALF_ROAD + 24)),
            name: 'SOUTH PLAZA',
          },
        ];

        // Wall segments for raycasting
        wallSegments = [];
        buildings.forEach((b) => {
          if (b.w <= 0 || b.h <= 0) return;
          wallSegments.push({ x1: b.x, y1: b.y, x2: b.x + b.w, y2: b.y });
          wallSegments.push({ x1: b.x + b.w, y1: b.y, x2: b.x + b.w, y2: b.y + b.h });
          wallSegments.push({ x1: b.x + b.w, y1: b.y + b.h, x2: b.x, y2: b.y + b.h });
          wallSegments.push({ x1: b.x, y1: b.y + b.h, x2: b.x, y2: b.y });
        });

        // 9 Intersections (3x3)
        intersections = [];
        X_STREETS.forEach((x, xi) => {
          Y_STREETS.forEach((y, yi) => {
            intersections.push({
              x,
              y,
              xi,
              yi,
              phaseOffset: ((xi * 2.3 + yi * 2.9) % 8.8),
            });
          });
        });
      }

      function getSignalState(intObj, timeSec) {
        const t = (timeSec + intObj.phaseOffset) % 8.8;
        if (t < 3.6) return 'NS_GREEN';
        if (t < 4.4) return 'NS_YELLOW';
        if (t < 4.8) return 'ALL_RED';
        if (t < 7.8) return 'EW_GREEN';
        if (t < 8.4) return 'EW_YELLOW';
        return 'ALL_RED';
      }

      // Vehicles Structure
      // Direction types: 0: East (+X), 1: South (+Y), 2: West (-X), 3: North (-Y)
      const DIRS = [
        { angle: 0, dx: 1, dy: 0, isNS: false },
        { angle: Math.PI / 2, dx: 0, dy: 1, isNS: true },
        { angle: Math.PI, dx: -1, dy: 0, isNS: false },
        { angle: -Math.PI / 2, dx: 0, dy: -1, isNS: true },
      ];

      // 6 Agent Cars: Car 0 is Luke's PPO Agent (Ego), Cars 1-5 are traffic
      const vehicles = [
        {
          isEgo: true,
          color: '#2dd4bf',
          length: 24,
          width: 12,
          x: 0,
          y: 0,
          dir: 0,
          angle: 0,
          speed: 28,
          maxSpeed: 32,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 0, sIdx: 0 },
        },
        {
          isEgo: false,
          color: '#475569',
          length: 22,
          width: 11,
          x: 0,
          y: 0,
          dir: 1,
          angle: Math.PI / 2,
          speed: 26,
          maxSpeed: 30,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 1, sIdx: 1 },
        },
        {
          isEgo: false,
          color: '#334155',
          length: 22,
          width: 11,
          x: 0,
          y: 0,
          dir: 2,
          angle: Math.PI,
          speed: 27,
          maxSpeed: 31,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 2, sIdx: 0 },
        },
        {
          isEgo: false,
          color: '#64748b',
          length: 22,
          width: 11,
          x: 0,
          y: 0,
          dir: 3,
          angle: -Math.PI / 2,
          speed: 25,
          maxSpeed: 29,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 0, sIdx: 2 },
        },
        {
          isEgo: false,
          color: '#38495e',
          length: 22,
          width: 11,
          x: 0,
          y: 0,
          dir: 0,
          angle: 0,
          speed: 27,
          maxSpeed: 30,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 1, sIdx: 0 },
        },
        {
          isEgo: false,
          color: '#1e293b',
          length: 22,
          width: 11,
          x: 0,
          y: 0,
          dir: 2,
          angle: Math.PI,
          speed: 26,
          maxSpeed: 30,
          isBraking: false,
          stuckTimer: 0,
          route: { type: 'street', idx: 0, sIdx: 1 },
        },
      ];

      function resetVehiclePositions() {
        if (!X_STREETS.length || !Y_STREETS.length) return;

        // Ego Car starts Eastbound on North Avenue
        vehicles[0].x = X_STREETS[0] - 60;
        vehicles[0].y = Y_STREETS[0] + LANE_OFF;
        vehicles[0].dir = 0;
        vehicles[0].angle = 0;

        // Car 1: Southbound on Central Street
        vehicles[1].x = X_STREETS[1] - LANE_OFF;
        vehicles[1].y = Y_STREETS[0] - 50;
        vehicles[1].dir = 1;
        vehicles[1].angle = Math.PI / 2;

        // Car 2: Westbound on South Avenue
        vehicles[2].x = X_STREETS[2] + 60;
        vehicles[2].y = Y_STREETS[2] - LANE_OFF;
        vehicles[2].dir = 2;
        vehicles[2].angle = Math.PI;

        // Car 3: Northbound on East Street
        vehicles[3].x = X_STREETS[2] + LANE_OFF;
        vehicles[3].y = Y_STREETS[2] + 70;
        vehicles[3].dir = 3;
        vehicles[3].angle = -Math.PI / 2;

        // Car 4: Eastbound on Central Avenue
        vehicles[4].x = X_STREETS[0] + 80;
        vehicles[4].y = Y_STREETS[1] + LANE_OFF;
        vehicles[4].dir = 0;
        vehicles[4].angle = 0;

        // Car 5: Westbound on North Avenue
        vehicles[5].x = X_STREETS[1] + 120;
        vehicles[5].y = Y_STREETS[0] - LANE_OFF;
        vehicles[5].dir = 2;
        vehicles[5].angle = Math.PI;
      }

      // 9 Lidar Rays (-40° to +40°)
      const LIDAR_ANGLES = [-0.698, -0.524, -0.349, -0.175, 0, 0.175, 0.349, 0.524, 0.698];
      const MAX_LIDAR_RANGE = 145;

      const resizeRadar = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = heroRadarCanvas.offsetWidth || window.innerWidth;
        height = heroRadarCanvas.offsetHeight || window.innerHeight;
        heroRadarCanvas.width = Math.floor(width * dpr);
        heroRadarCanvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        rebuildCityLayout();
        resetVehiclePositions();
      };

      resizeRadar();
      window.addEventListener('resize', resizeRadar, { passive: true });
      window.addEventListener(
        'pointermove',
        (e) => {
          const rect = heroRadarCanvas.getBoundingClientRect();
          pointerX = e.clientX - rect.left;
          pointerY = e.clientY - rect.top;
          pointerActive = true;
        },
        { passive: true },
      );
      window.addEventListener('pointerleave', () => {
        pointerActive = false;
        pointerX = -9999;
        pointerY = -9999;
      });

      // Exact Ray-Segment Intersection
      function intersectRaySegment(px, py, dx, dy, x1, y1, x2, y2) {
        const sx = x2 - x1;
        const sy = y2 - y1;
        const denom = dx * sy - dy * sx;
        if (Math.abs(denom) < 1e-6) return null;

        const u = ((px - x1) * dy - (py - y1) * dx) / denom;
        const t = ((x1 - px) * sy - (y1 - py) * sx) / (dy * sx - dx * sy);

        if (t >= 0 && u >= 0 && u <= 1) {
          const dist = Math.hypot(sx, sy) || 1;
          return {
            t,
            x: px + t * dx,
            y: py + t * dy,
            nx: -sy / dist,
            ny: sx / dist,
          };
        }
        return null;
      }

      let lastSimTime = performance.now();

      // Main City Simulation Render Loop
      const renderCitySim = (now) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastSimTime) / 1000));
        lastSimTime = now;
        const simTimeSec = now / 1000;

        ctx.clearRect(0, 0, width, height);

        const vh = Math.max(1, window.innerHeight);
        // Smoothly fade out as user scrolls toward Phase 01
        const heroOpacity = Math.max(0, 1 - smoothScrollY / (vh * 0.72));
        heroRadarCanvas.style.opacity = heroOpacity.toFixed(3);
        heroRadarCanvas.style.transform = `translate3d(0, ${(smoothScrollY * 0.22).toFixed(2)}px, 0)`;

        if (heroOpacity > 0.01 && X_STREETS.length === 3 && Y_STREETS.length === 3) {
          // -------------------------------------------------------------
          // 1. RENDER CITY STREETS (Tarmac, Curbs, Centerlines, Crosswalks)
          // -------------------------------------------------------------
          // Draw Horizontal Avenues
          Y_STREETS.forEach((y) => {
            // Tarmac
            ctx.fillStyle = 'rgba(12, 19, 34, 0.75)';
            ctx.fillRect(0, y - HALF_ROAD, width, ROAD_W);

            // Sidewalk Curbs
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, y - HALF_ROAD);
            ctx.lineTo(width, y - HALF_ROAD);
            ctx.moveTo(0, y + HALF_ROAD);
            ctx.lineTo(width, y + HALF_ROAD);
            ctx.stroke();

            // Dashed Centerline
            ctx.save();
            ctx.setLineDash([5, 8]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
            ctx.restore();
          });

          // Draw Vertical Streets
          X_STREETS.forEach((x) => {
            // Tarmac
            ctx.fillStyle = 'rgba(12, 19, 34, 0.75)';
            ctx.fillRect(x - HALF_ROAD, 0, ROAD_W, height);

            // Sidewalk Curbs
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.22)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x - HALF_ROAD, 0);
            ctx.lineTo(x - HALF_ROAD, height);
            ctx.moveTo(x + HALF_ROAD, 0);
            ctx.lineTo(x + HALF_ROAD, height);
            ctx.stroke();

            // Dashed Centerline
            ctx.save();
            ctx.setLineDash([5, 8]);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
            ctx.restore();
          });

          // -------------------------------------------------------------
          // 2. RENDER INTERSECTIONS (Stop Lines, Crosswalks, Traffic Lights)
          // -------------------------------------------------------------
          intersections.forEach((intObj) => {
            const signal = getSignalState(intObj, simTimeSec);

            // Clear intersection box
            ctx.fillStyle = 'rgba(14, 22, 38, 0.85)';
            ctx.fillRect(intObj.x - HALF_ROAD, intObj.y - HALF_ROAD, ROAD_W, ROAD_W);

            // Zebra Crosswalks & Stop Bars
            const drawZebra = (x1, y1, x2, y2, isHoriz) => {
              ctx.save();
              ctx.setLineDash([2, 4]);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              ctx.restore();
            };

            // North entry (heading South)
            drawZebra(intObj.x - HALF_ROAD, intObj.y - HALF_ROAD - 8, intObj.x, intObj.y - HALF_ROAD - 8, true);
            // South entry (heading North)
            drawZebra(intObj.x, intObj.y + HALF_ROAD + 8, intObj.x + HALF_ROAD, intObj.y + HALF_ROAD + 8, true);
            // West entry (heading East)
            drawZebra(intObj.x - HALF_ROAD - 8, intObj.y, intObj.x - HALF_ROAD - 8, intObj.y + HALF_ROAD, false);
            // East entry (heading West)
            drawZebra(intObj.x + HALF_ROAD + 8, intObj.y - HALF_ROAD, intObj.x + HALF_ROAD + 8, intObj.y, false);

            // Stop Lines (Solid White, 2px)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
            ctx.lineWidth = 2;
            // North stop line
            ctx.beginPath();
            ctx.moveTo(intObj.x - HALF_ROAD, intObj.y - HALF_ROAD - 2);
            ctx.lineTo(intObj.x, intObj.y - HALF_ROAD - 2);
            ctx.stroke();
            // South stop line
            ctx.beginPath();
            ctx.moveTo(intObj.x, intObj.y + HALF_ROAD + 2);
            ctx.lineTo(intObj.x + HALF_ROAD, intObj.y + HALF_ROAD + 2);
            ctx.stroke();
            // West stop line
            ctx.beginPath();
            ctx.moveTo(intObj.x - HALF_ROAD - 2, intObj.y);
            ctx.lineTo(intObj.x - HALF_ROAD - 2, intObj.y + HALF_ROAD);
            ctx.stroke();
            // East stop line
            ctx.beginPath();
            ctx.moveTo(intObj.x + HALF_ROAD + 2, intObj.y - HALF_ROAD);
            ctx.lineTo(intObj.x + HALF_ROAD + 2, intObj.y);
            ctx.stroke();

            // Traffic Light LED Indicators at the curbs
            const nsColor = signal === 'NS_GREEN' ? '#22c55e' : (signal === 'NS_YELLOW' ? '#f59e0b' : '#ef4444');
            const ewColor = signal === 'EW_GREEN' ? '#22c55e' : (signal === 'EW_YELLOW' ? '#f59e0b' : '#ef4444');

            // North/South LED (top-left curb)
            ctx.beginPath();
            ctx.arc(intObj.x - HALF_ROAD - 5, intObj.y - HALF_ROAD - 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = nsColor;
            ctx.shadowColor = nsColor;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;

            // East/West LED (bottom-right curb)
            ctx.beginPath();
            ctx.arc(intObj.x + HALF_ROAD + 5, intObj.y + HALF_ROAD + 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = ewColor;
            ctx.shadowColor = ewColor;
            ctx.shadowBlur = 6;
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // -------------------------------------------------------------
          // 3. RENDER TACTICAL CITY BLOCKS (Buildings, Rooftops, Blueprint)
          // -------------------------------------------------------------
          buildings.forEach((b) => {
            if (b.w <= 0 || b.h <= 0) return;

            // Main Building Mass
            ctx.fillStyle = 'rgba(9, 15, 27, 0.9)';
            ctx.fillRect(b.x, b.y, b.w, b.h);

            // Perimeter Hairline
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.16)';
            ctx.lineWidth = 1;
            ctx.strokeRect(b.x, b.y, b.w, b.h);

            // Inset Rooftop Blueprint Details
            if (b.w > 60 && b.h > 60) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
              ctx.lineWidth = 1;
              ctx.strokeRect(b.x + 14, b.y + 14, b.w - 28, b.h - 28);

              // Small rooftop structure / helipad / HVAC
              const hw = Math.min(30, b.w * 0.28);
              const hh = Math.min(24, b.h * 0.28);
              ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
              ctx.fillRect(b.x + b.w / 2 - hw / 2, b.y + b.h / 2 - hh / 2, hw, hh);
              ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)';
              ctx.strokeRect(b.x + b.w / 2 - hw / 2, b.y + b.h / 2 - hh / 2, hw, hh);
            }

            // Minimalist Block Label
            if (b.name && b.w > 90) {
              ctx.font = '8px monospace';
              ctx.fillStyle = 'rgba(148, 163, 184, 0.25)';
              ctx.fillText(b.name, b.x + 8, b.y + 14);
            }
          });

          // -------------------------------------------------------------
          // 4. UPDATE VEHICLE DYNAMICS (Physics, Intersections, Safe Headway)
          // -------------------------------------------------------------
          vehicles.forEach((car, i) => {
            const currentDir = DIRS[car.dir];
            let targetSpeed = car.maxSpeed;
            let brakeReason = false;

            // A. Anti-Collision Headway (Cars NEVER drive through each other)
            vehicles.forEach((other, j) => {
              if (i === j) return;
              const ox = other.x - car.x;
              const oy = other.y - car.y;
              // Projection along travel direction
              const forwardDist = ox * currentDir.dx + oy * currentDir.dy;
              const lateralDist = Math.abs(ox * currentDir.dy - oy * currentDir.dx);

              // If other car is ahead in the same street corridor
              if (forwardDist > 0 && forwardDist < 52 && lateralDist < 16) {
                if (forwardDist < 24) {
                  targetSpeed = 0;
                  brakeReason = true;
                } else {
                  targetSpeed = Math.min(targetSpeed, other.speed * 0.85);
                  brakeReason = true;
                }
              }
            });

            // B. Intersection Approach & Traffic Signal Yielding
            intersections.forEach((intObj) => {
              const dxToInt = intObj.x - car.x;
              const dyToInt = intObj.y - car.y;
              const distAlongDir = dxToInt * currentDir.dx + dyToInt * currentDir.dy;
              const lateralDist = Math.abs(dxToInt * currentDir.dy - dyToInt * currentDir.dx);

              // Approaching this intersection along the corridor
              if (distAlongDir > 0 && distAlongDir < 65 && lateralDist < 14) {
                const signal = getSignalState(intObj, simTimeSec);
                const isGreen = currentDir.isNS ? signal === 'NS_GREEN' : signal === 'EW_GREEN';

                if (!isGreen) {
                  // Must stop at the stop line before the intersection!
                  const distToStop = distAlongDir - (HALF_ROAD + 4);
                  if (distToStop > 0) {
                    if (distToStop < 10) {
                      targetSpeed = 0;
                      brakeReason = true;
                    } else {
                      targetSpeed = Math.min(targetSpeed, (distToStop / 45) * car.maxSpeed);
                      brakeReason = true;
                    }
                  }
                }
              }
            });

            // C. Pointer Avoidance (If user places cursor directly ahead of car)
            if (pointerActive) {
              const px = pointerX - car.x;
              const py = pointerY - car.y;
              const fDist = px * currentDir.dx + py * currentDir.dy;
              const lDist = Math.abs(px * currentDir.dy - py * currentDir.dx);
              if (fDist > 0 && fDist < 55 && lDist < 22) {
                targetSpeed = 0;
                brakeReason = true;
              }
            }

            // Smooth Acceleration / Deceleration
            if (car.speed > targetSpeed) {
              car.speed = Math.max(targetSpeed, car.speed - 50 * dt);
              car.isBraking = brakeReason || car.speed < 12;
            } else {
              car.speed = Math.min(targetSpeed, car.speed + 25 * dt);
              car.isBraking = false;
            }

            // Integrate Position
            car.x += currentDir.dx * car.speed * dt;
            car.y += currentDir.dy * car.speed * dt;
            car.angle = currentDir.angle;

            // Handle Intersection Passage & Turning
            intersections.forEach((intObj) => {
              const d = Math.hypot(car.x - intObj.x, car.y - intObj.y);
              if (d < 5 && !car.hasTurnedInInt) {
                car.hasTurnedInInt = true;

                // Decision: Check if near boundary edges
                const atWest = intObj.xi === 0 && car.dir === 2;
                const atEast = intObj.xi === 2 && car.dir === 0;
                const atNorth = intObj.yi === 0 && car.dir === 3;
                const atSouth = intObj.yi === 2 && car.dir === 1;

                if (atWest) {
                  car.dir = intObj.yi === 0 ? 1 : 3;
                } else if (atEast) {
                  car.dir = intObj.yi === 0 ? 1 : 3;
                } else if (atNorth) {
                  car.dir = intObj.xi === 0 ? 0 : 2;
                } else if (atSouth) {
                  car.dir = intObj.xi === 0 ? 0 : 2;
                } else {
                  // Internal Intersection: 65% Straight, 17.5% Right, 17.5% Left
                  const rnd = Math.random();
                  if (rnd < 0.20) {
                    car.dir = (car.dir + 1) % 4; // Turn Right
                  } else if (rnd < 0.40) {
                    car.dir = (car.dir + 3) % 4; // Turn Left
                  }
                }

                // Snap to correct lane offset for the new direction
                if (car.dir === 0) car.y = intObj.y + LANE_OFF;
                else if (car.dir === 2) car.y = intObj.y - LANE_OFF;
                else if (car.dir === 1) car.x = intObj.x - LANE_OFF;
                else if (car.dir === 3) car.x = intObj.x + LANE_OFF;
              } else if (d > 20) {
                car.hasTurnedInInt = false;
              }
            });

            // Boundary Wrap to ensure cars never leave the screen
            if (car.x < -30) car.x = width + 20;
            if (car.x > width + 30) car.x = -20;
            if (car.y < -30) car.y = height + 20;
            if (car.y > height + 30) car.y = -20;
          });

          // -------------------------------------------------------------
          // 5. REAL 9-RAY LIDAR SENSOR SIMULATION (Ego Vehicle)
          // -------------------------------------------------------------
          const ego = vehicles[0];
          const egoDir = DIRS[ego.dir];
          const egoBumperX = ego.x + egoDir.dx * (ego.length / 2);
          const egoBumperY = ego.y + egoDir.dy * (ego.length / 2);

          const lidarHitPoints = [];
          let closeObstacleWarning = false;

          LIDAR_ANGLES.forEach((relAngle) => {
            const rayAngle = ego.angle + relAngle;
            const rDx = Math.cos(rayAngle);
            const rDy = Math.sin(rayAngle);

            let closestDist = MAX_LIDAR_RANGE;
            let hitX = egoBumperX + rDx * MAX_LIDAR_RANGE;
            let hitY = egoBumperY + rDy * MAX_LIDAR_RANGE;
            let didHit = false;
            let hitNorm = { nx: 0, ny: 0 };

            // A. Test against all Building Walls
            wallSegments.forEach((seg) => {
              const res = intersectRaySegment(egoBumperX, egoBumperY, rDx, rDy, seg.x1, seg.y1, seg.x2, seg.y2);
              if (res && res.t < closestDist) {
                closestDist = res.t;
                hitX = res.x;
                hitY = res.y;
                didHit = true;
                hitNorm = { nx: res.nx, ny: res.ny };
              }
            });

            // B. Test against all Other Vehicles
            for (let vIdx = 1; vIdx < vehicles.length; vIdx++) {
              const other = vehicles[vIdx];
              const oDir = DIRS[other.dir];
              const hl = other.length / 2;
              const hw = other.width / 2;
              const cosA = Math.cos(other.angle);
              const sinA = Math.sin(other.angle);

              // 4 corners of the vehicle box
              const c1 = { x: other.x + hl * cosA - hw * sinA, y: other.y + hl * sinA + hw * cosA };
              const c2 = { x: other.x - hl * cosA - hw * sinA, y: other.y - hl * sinA + hw * cosA };
              const c3 = { x: other.x - hl * cosA + hw * sinA, y: other.y - hl * sinA - hw * cosA };
              const c4 = { x: other.x + hl * cosA + hw * sinA, y: other.y + hl * sinA - hw * cosA };

              const boxSegs = [
                { x1: c1.x, y1: c1.y, x2: c2.x, y2: c2.y },
                { x1: c2.x, y1: c2.y, x2: c3.x, y2: c3.y },
                { x1: c3.x, y1: c3.y, x2: c4.x, y2: c4.y },
                { x1: c4.x, y1: c4.y, x2: c1.x, y2: c1.y },
              ];

              boxSegs.forEach((bSeg) => {
                const res = intersectRaySegment(egoBumperX, egoBumperY, rDx, rDy, bSeg.x1, bSeg.y1, bSeg.x2, bSeg.y2);
                if (res && res.t < closestDist) {
                  closestDist = res.t;
                  hitX = res.x;
                  hitY = res.y;
                  didHit = true;
                  hitNorm = { nx: res.nx, ny: res.ny };
                }
              });
            }

            // C. Test against User Pointer
            if (pointerActive) {
              const pDist = Math.hypot(pointerX - egoBumperX, pointerY - egoBumperY);
              if (pDist < MAX_LIDAR_RANGE) {
                const toPointerAngle = Math.atan2(pointerY - egoBumperY, pointerX - egoBumperX);
                let aDiff = Math.abs(rayAngle - toPointerAngle);
                while (aDiff > Math.PI) aDiff = Math.abs(aDiff - Math.PI * 2);
                if (aDiff < 0.15 && pDist < closestDist) {
                  closestDist = pDist;
                  hitX = pointerX;
                  hitY = pointerY;
                  didHit = true;
                }
              }
            }

            if (closestDist < 48) {
              closeObstacleWarning = true;
            }

            lidarHitPoints.push({ x: hitX, y: hitY, didHit, dist: closestDist, norm: hitNorm });

            // Render Individual Lidar Laser Beam
            ctx.beginPath();
            ctx.moveTo(egoBumperX, egoBumperY);
            ctx.lineTo(hitX, hitY);
            if (didHit) {
              const isAlert = closestDist < 48;
              ctx.strokeStyle = isAlert ? 'rgba(245, 158, 11, 0.85)' : 'rgba(45, 212, 191, 0.45)';
              ctx.lineWidth = isAlert ? 1.4 : 0.9;
            } else {
              ctx.strokeStyle = 'rgba(45, 212, 191, 0.15)';
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();

            // Render Exact Collision Hit Blip
            if (didHit) {
              const isAlert = closestDist < 48;
              ctx.beginPath();
              ctx.arc(hitX, hitY, isAlert ? 2.8 : 2.0, 0, Math.PI * 2);
              ctx.fillStyle = isAlert ? '#f59e0b' : '#2dd4bf';
              ctx.shadowColor = isAlert ? '#f59e0b' : '#2dd4bf';
              ctx.shadowBlur = isAlert ? 8 : 4;
              ctx.fill();
              ctx.shadowBlur = 0;

              // Tangent surface reflection tick mark
              if (hitNorm.nx !== 0 || hitNorm.ny !== 0) {
                ctx.beginPath();
                ctx.moveTo(hitX - hitNorm.ny * 4, hitY + hitNorm.nx * 4);
                ctx.lineTo(hitX + hitNorm.ny * 4, hitY - hitNorm.nx * 4);
                ctx.strokeStyle = isAlert ? 'rgba(245, 158, 11, 0.6)' : 'rgba(45, 212, 191, 0.5)';
                ctx.lineWidth = 1.2;
                ctx.stroke();
              }
            }
          });

          // Fill Lidar Perception Field-of-View Cone
          if (lidarHitPoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(egoBumperX, egoBumperY);
            lidarHitPoints.forEach((hp) => ctx.lineTo(hp.x, hp.y));
            ctx.closePath();
            ctx.fillStyle = closeObstacleWarning
              ? 'rgba(245, 158, 11, 0.05)'
              : 'rgba(45, 212, 191, 0.04)';
            ctx.fill();
          }

          // -------------------------------------------------------------
          // 6. RENDER ALL VEHICLES (Headlights, Chassis, Brake Lights)
          // -------------------------------------------------------------
          vehicles.forEach((car) => {
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.rotate(car.angle);

            const len = car.length;
            const w = car.width;

            // Headlight beams casting onto tarmac
            const headGrad = ctx.createLinearGradient(len / 2, 0, len / 2 + 30, 0);
            headGrad.addColorStop(0, car.isEgo ? 'rgba(45, 212, 191, 0.32)' : 'rgba(255, 255, 255, 0.22)');
            headGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.moveTo(len / 2, -w * 0.4);
            ctx.lineTo(len / 2 + 30, -w * 0.9);
            ctx.lineTo(len / 2 + 30, w * 0.9);
            ctx.lineTo(len / 2, w * 0.4);
            ctx.closePath();
            ctx.fill();

            // Vehicle Body
            ctx.beginPath();
            ctx.roundRect(-len / 2, -w / 2, len, w, 2.5);
            ctx.fillStyle = car.color;
            ctx.fill();
            ctx.strokeStyle = car.isEgo ? '#5eead4' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Cockpit / Windshield
            ctx.fillStyle = car.isEgo ? '#042f2e' : '#0f172a';
            ctx.beginPath();
            ctx.roundRect(-len * 0.15, -w * 0.35, len * 0.45, w * 0.7, 1.5);
            ctx.fill();

            // Ego Vehicle Mounted Lidar Scanner Dome
            if (car.isEgo) {
              ctx.beginPath();
              ctx.arc(-len * 0.05, 0, 2.5, 0, Math.PI * 2);
              ctx.fillStyle = closeObstacleWarning ? '#f59e0b' : '#2dd4bf';
              ctx.shadowColor = closeObstacleWarning ? '#f59e0b' : '#2dd4bf';
              ctx.shadowBlur = 5;
              ctx.fill();
              ctx.shadowBlur = 0;
            }

            // Headlights (Twin White / Cyan dots)
            ctx.fillStyle = car.isEgo ? '#99f6e4' : '#f8fafc';
            ctx.fillRect(len / 2 - 1.5, -w * 0.4, 2, 2);
            ctx.fillRect(len / 2 - 1.5, w * 0.4 - 2, 2, 2);

            // Tail / Brake Lights (Twin Red LEDs)
            const brakeGlow = car.isBraking;
            ctx.fillStyle = brakeGlow ? '#ef4444' : 'rgba(239, 68, 68, 0.5)';
            if (brakeGlow) {
              ctx.shadowColor = '#ef4444';
              ctx.shadowBlur = 8;
            }
            ctx.fillRect(-len / 2 - 0.5, -w * 0.42, 2, brakeGlow ? 3 : 2);
            ctx.fillRect(-len / 2 - 0.5, w * 0.42 - (brakeGlow ? 3 : 2), 2, brakeGlow ? 3 : 2);
            ctx.shadowBlur = 0;

            ctx.restore();
          });

          // -------------------------------------------------------------
          // 7. GTA MINIMAP HUD OVERLAYS & TELEMETRY
          // -------------------------------------------------------------
          // Top-Left Coordinates & Status
          ctx.font = '9px monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.4)';
          ctx.fillText('GPS MINIMAP // AUTONOMOUS SIMULATION', 20, 24);

          // Top-Right Heading & Sensors
          const egoDeg = Math.round(((ego.angle * 180) / Math.PI + 360) % 360);
          const hdgText = `HDG ${egoDeg.toString().padStart(3, '0')}° · 9-RAY LIDAR ${closeObstacleWarning ? 'PROX ALERT' : 'ACTIVE'}`;
          ctx.textAlign = 'right';
          ctx.fillStyle = closeObstacleWarning ? '#f59e0b' : 'rgba(45, 212, 191, 0.55)';
          ctx.fillText(hdgText, width - 20, 24);
          ctx.textAlign = 'left';

          // Road Labels along Curbs
          ctx.font = '8px monospace';
          ctx.fillStyle = 'rgba(148, 163, 184, 0.2)';
          ctx.fillText('AVENUE NORTH', X_STREETS[0] + 28, Y_STREETS[0] - HALF_ROAD - 3);
          ctx.fillText('PPO BOULEVARD', X_STREETS[0] + 28, Y_STREETS[1] - HALF_ROAD - 3);
          ctx.fillText('AVENUE SOUTH', X_STREETS[0] + 28, Y_STREETS[2] - HALF_ROAD - 3);
        }

        requestAnimationFrame(renderCitySim);
      };

      requestAnimationFrame(renderCitySim);
    }
  }

  // 5. Radial cursor spotlight on cards
  const cards = document.querySelectorAll('.deploy-card, .module-content');
  cards.forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.background = `radial-gradient(420px circle at ${x}px ${y}px, rgba(45, 212, 191, 0.08), transparent 75%), rgba(13, 19, 33, 0.82)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.background = '';
    });
  });

  // 6. Full-viewport Interactive Highway Telemetry Canvas
  if (bgCanvas) {
    const ctx = bgCanvas.getContext('2d');
    if (ctx) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let pointerX = 0.5;
      let pointerY = 0.4;

      const resize = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = window.innerWidth;
        height = window.innerHeight;
        bgCanvas.width = Math.floor(width * dpr);
        bgCanvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resize();
      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener(
        'pointermove',
        (e) => {
          pointerX = e.clientX / Math.max(1, width);
          pointerY = e.clientY / Math.max(1, height);
        },
        { passive: true },
      );

      // Ambient telemetry nodes drifting along lane trajectories
      const pulses = Array.from({ length: 28 }, (_, i) => ({
        lane: (i % 7) - 3,
        z: (i / 28) * 1000,
        speed: 1.8 + (i % 4) * 0.55,
        hue: i % 5 === 0 ? '56, 189, 248' : '45, 212, 191',
      }));

      let t = 0;
      const renderBg = () => {
        t += 0.014;

        // Smooth transition: Telemetry canvas fades in smoothly as user approaches Phase 01
        const teleOpacity = Math.max(0, Math.min(1, (smoothScrollY - height * 0.18) / (height * 0.46)));
        bgCanvas.style.opacity = teleOpacity.toFixed(3);
        bgCanvas.style.visibility = teleOpacity <= 0.005 ? 'hidden' : 'visible';

        ctx.clearRect(0, 0, width, height);

        // Horizon shifts slightly with scroll and pointer
        const horizonY = height * (0.38 - Math.min(0.14, smoothScrollY / 5000)) + (pointerY - 0.5) * 28;
        const vanishX = width * 0.5 + (pointerX - 0.5) * 65;

        // Subtle ambient glow near active phase side
        const phaseSide =
          activePhase === 'environment' || activePhase === 'logic' ? width * 0.72 : width * 0.28;
        const grad = ctx.createRadialGradient(
          phaseSide,
          height * 0.52,
          20,
          phaseSide,
          height * 0.52,
          Math.max(width, height) * 0.52,
        );
        grad.addColorStop(0, 'rgba(45, 212, 191, 0.065)');
        grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.025)');
        grad.addColorStop(1, 'rgba(5, 7, 12, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);

        // Perspective longitudinal lane lines
        const numLanes = 9;
        ctx.lineWidth = 1;
        for (let i = -numLanes; i <= numLanes; i++) {
          const spreadBottom = i * (width * 0.14);
          const spreadTop = i * 18;
          ctx.strokeStyle =
            i === 0 ? 'rgba(45, 212, 191, 0.14)' : 'rgba(148, 163, 184, 0.045)';
          ctx.beginPath();
          ctx.moveTo(vanishX + spreadTop, horizonY);
          ctx.lineTo(vanishX + spreadBottom, height + 40);
          ctx.stroke();
        }

        // Perspective transverse depth lines scrolling forward with page scroll
        const scrollOffset = ((smoothScrollY * 0.45 + t * 24) % 80) / 80;
        const depthSteps = 12;
        for (let d = 0; d < depthSteps; d++) {
          const norm = (d + scrollOffset) / depthSteps;
          const easeD = norm * norm;
          const y = horizonY + easeD * (height - horizonY + 40);
          const alpha = Math.sin(norm * Math.PI) * 0.075;
          ctx.strokeStyle = `rgba(45, 212, 191, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // Streaming telemetry pulses along perspective lanes
        pulses.forEach((p) => {
          p.z = (p.z + p.speed + scrollProgress * 1.4) % 1000;
          const norm = p.z / 1000;
          const easeD = norm * norm;
          const y = horizonY + easeD * (height - horizonY + 20);
          const x =
            vanishX + p.lane * 18 * (1 - easeD) + p.lane * (width * 0.14) * easeD;
          const radius = 1 + easeD * 2.2;
          const alpha = Math.sin(norm * Math.PI) * 0.42;

          ctx.fillStyle = `rgba(${p.hue}, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        });

        requestAnimationFrame(renderBg);
      };

      requestAnimationFrame(renderBg);
    }
  }
}
