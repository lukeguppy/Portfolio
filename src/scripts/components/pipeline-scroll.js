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

  // 4. Hero Tactical GTA Minimap City Grid & Real Lidar Agent Simulation (British LHD)
  if (heroRadarCanvas) {
    const ctx = heroRadarCanvas.getContext('2d');
    if (ctx) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let pointerX = -9999;
      let pointerY = -9999;
      let pointerActive = false;

      // British Road Dimensions
      const ROAD_W = 38;
      const HALF_ROAD = 19;
      const LANE_OFF = 9.5;

      let X_STREETS = [];
      let Y_STREETS = [];
      let buildings = [];
      let intersections = [];

      function rebuildCityLayout() {
        X_STREETS = [
          Math.round(width * 0.18),
          Math.round(width * 0.50),
          Math.round(width * 0.82),
        ];
        Y_STREETS = [
          Math.round(height * 0.22),
          Math.round(height * 0.50),
          Math.round(height * 0.78),
        ];

        // Building blocks strictly bounded between streets so NO building ever overlaps any road:
        buildings = [];
        const xBounds = [
          { min: 0, max: X_STREETS[0] - HALF_ROAD - 12 },
          { min: X_STREETS[0] + HALF_ROAD + 12, max: X_STREETS[1] - HALF_ROAD - 12 },
          { min: X_STREETS[1] + HALF_ROAD + 12, max: X_STREETS[2] - HALF_ROAD - 12 },
          { min: X_STREETS[2] + HALF_ROAD + 12, max: width },
        ];
        const yBounds = [
          { min: 0, max: Y_STREETS[0] - HALF_ROAD - 12 },
          { min: Y_STREETS[0] + HALF_ROAD + 12, max: Y_STREETS[1] - HALF_ROAD - 12 },
          { min: Y_STREETS[1] + HALF_ROAD + 12, max: Y_STREETS[2] - HALF_ROAD - 12 },
          { min: Y_STREETS[2] + HALF_ROAD + 12, max: height },
        ];

        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const bx = xBounds[c].min;
            const bw = xBounds[c].max - xBounds[c].min;
            const by = yBounds[r].min;
            const bh = yBounds[r].max - yBounds[r].min;
            if (bw > 16 && bh > 16) {
              buildings.push({ x: bx, y: by, w: bw, h: bh });
            }
          }
        }

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

      // British Left-Hand Traffic:
      // 0: Eastbound (+X) -> Top lane (y = Y - LANE_OFF), angle 0
      // 1: Southbound (+Y) -> Right lane (x = X + LANE_OFF), angle PI/2
      // 2: Westbound (-X) -> Bottom lane (y = Y + LANE_OFF), angle PI
      // 3: Northbound (-Y) -> Left lane (x = X - LANE_OFF), angle -PI/2
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
        },
      ];

      function resetVehiclePositions() {
        if (!X_STREETS.length || !Y_STREETS.length) return;

        // Ego Car: Eastbound on North Avenue
        vehicles[0].x = X_STREETS[0] - 60;
        vehicles[0].y = Y_STREETS[0] - LANE_OFF;
        vehicles[0].dir = 0;
        vehicles[0].angle = 0;

        // Car 1: Southbound on Central Street
        vehicles[1].x = X_STREETS[1] + LANE_OFF;
        vehicles[1].y = Y_STREETS[0] - 50;
        vehicles[1].dir = 1;
        vehicles[1].angle = Math.PI / 2;

        // Car 2: Westbound on South Avenue
        vehicles[2].x = X_STREETS[2] + 60;
        vehicles[2].y = Y_STREETS[2] + LANE_OFF;
        vehicles[2].dir = 2;
        vehicles[2].angle = Math.PI;

        // Car 3: Northbound on East Street
        vehicles[3].x = X_STREETS[2] - LANE_OFF;
        vehicles[3].y = Y_STREETS[2] + 70;
        vehicles[3].dir = 3;
        vehicles[3].angle = -Math.PI / 2;

        // Car 4: Eastbound on Central Avenue
        vehicles[4].x = X_STREETS[0] + 80;
        vehicles[4].y = Y_STREETS[1] - LANE_OFF;
        vehicles[4].dir = 0;
        vehicles[4].angle = 0;

        // Car 5: Westbound on North Avenue
        vehicles[5].x = X_STREETS[1] + 120;
        vehicles[5].y = Y_STREETS[0] + LANE_OFF;
        vehicles[5].dir = 2;
        vehicles[5].angle = Math.PI;
      }

      // 9 Lidar Rays (-40° to +40°)
      const rayAngles = [-0.65, -0.45, -0.28, -0.14, 0, 0.14, 0.28, 0.45, 0.65];
      const maxRange = 135;

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

      let lastSimTime = performance.now();

      // Main City Simulation Render Loop
      const renderCitySim = (now) => {
        const dt = Math.min(0.05, Math.max(0.001, (now - lastSimTime) / 1000));
        lastSimTime = now;
        const simTimeSec = now / 1000;

        ctx.clearRect(0, 0, width, height);

        const vh = Math.max(1, window.innerHeight);
        const rawScroll = window.scrollY;

        // Smooth cubic Hermite crossfade — zero transform modification, ZERO jitter
        const fadeEnd = vh * 0.55;
        const norm = clamp(rawScroll / fadeEnd, 0, 1);
        const heroOpacity = 1 - norm * norm * (3 - 2 * norm);
        heroRadarCanvas.style.opacity = heroOpacity.toFixed(3);
        heroRadarCanvas.style.visibility = heroOpacity <= 0.005 ? 'hidden' : 'visible';

        // Synchronize Highway perspective canvas crossfade
        if (bgCanvas) {
          const bgFadeStart = vh * 0.18;
          const bgFadeEnd = vh * 0.60;
          const bgNorm = clamp((rawScroll - bgFadeStart) / (bgFadeEnd - bgFadeStart), 0, 1);
          const bgOpacity = bgNorm * bgNorm * (3 - 2 * bgNorm);
          bgCanvas.style.opacity = bgOpacity.toFixed(3);
          bgCanvas.style.visibility = bgOpacity <= 0.005 ? 'hidden' : 'visible';
        }

        if (heroOpacity > 0.005 && X_STREETS.length === 3 && Y_STREETS.length === 3) {
          // -------------------------------------------------------------
          // 1. RENDER BRITISH CITY STREETS (Tarmac, Curbs, Centerlines)
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
          // 2. RENDER INTERSECTIONS (British LHD Stop Lines, Crosswalks, Signals)
          // -------------------------------------------------------------
          intersections.forEach((intObj) => {
            const signal = getSignalState(intObj, simTimeSec);

            // Clear junction box
            ctx.fillStyle = 'rgba(14, 22, 38, 0.85)';
            ctx.fillRect(intObj.x - HALF_ROAD, intObj.y - HALF_ROAD, ROAD_W, ROAD_W);

            const drawZebra = (x1, y1, x2, y2) => {
              ctx.save();
              ctx.setLineDash([2, 4]);
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
              ctx.restore();
            };

            // Zebra crosswalks behind stop lines
            drawZebra(intObj.x - HALF_ROAD - 8, intObj.y - HALF_ROAD, intObj.x - HALF_ROAD - 8, intObj.y);
            drawZebra(intObj.x + HALF_ROAD + 8, intObj.y, intObj.x + HALF_ROAD + 8, intObj.y + HALF_ROAD);
            drawZebra(intObj.x - HALF_ROAD, intObj.y + HALF_ROAD + 8, intObj.x, intObj.y + HALF_ROAD + 8);
            drawZebra(intObj.x, intObj.y - HALF_ROAD - 8, intObj.x + HALF_ROAD, intObj.y - HALF_ROAD - 8);

            // Stop Lines (Solid White, 2px)
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.lineWidth = 2;

            // Eastbound Stop Line (West approach on top lane)
            ctx.beginPath();
            ctx.moveTo(intObj.x - HALF_ROAD - 2, intObj.y - HALF_ROAD);
            ctx.lineTo(intObj.x - HALF_ROAD - 2, intObj.y);
            ctx.stroke();

            // Westbound Stop Line (East approach on bottom lane)
            ctx.beginPath();
            ctx.moveTo(intObj.x + HALF_ROAD + 2, intObj.y);
            ctx.lineTo(intObj.x + HALF_ROAD + 2, intObj.y + HALF_ROAD);
            ctx.stroke();

            // Northbound Stop Line (South approach on left lane)
            ctx.beginPath();
            ctx.moveTo(intObj.x - HALF_ROAD, intObj.y + HALF_ROAD + 2);
            ctx.lineTo(intObj.x, intObj.y + HALF_ROAD + 2);
            ctx.stroke();

            // Southbound Stop Line (North approach on right lane)
            ctx.beginPath();
            ctx.moveTo(intObj.x, intObj.y - HALF_ROAD - 2);
            ctx.lineTo(intObj.x + HALF_ROAD, intObj.y - HALF_ROAD - 2);
            ctx.stroke();

            // Traffic Light LED Indicators at the curbs
            const nsColor = signal === 'NS_GREEN' ? '#22c55e' : (signal === 'NS_YELLOW' ? '#f59e0b' : '#ef4444');
            const ewColor = signal === 'EW_GREEN' ? '#22c55e' : (signal === 'EW_YELLOW' ? '#f59e0b' : '#ef4444');

            // Eastbound LED (top-left curb)
            ctx.beginPath();
            ctx.arc(intObj.x - HALF_ROAD - 5, intObj.y - HALF_ROAD - 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = ewColor;
            ctx.fill();

            // Westbound LED (bottom-right curb)
            ctx.beginPath();
            ctx.arc(intObj.x + HALF_ROAD + 5, intObj.y + HALF_ROAD + 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = ewColor;
            ctx.fill();

            // Northbound LED (bottom-left curb)
            ctx.beginPath();
            ctx.arc(intObj.x - HALF_ROAD - 5, intObj.y + HALF_ROAD + 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = nsColor;
            ctx.fill();

            // Southbound LED (top-right curb)
            ctx.beginPath();
            ctx.arc(intObj.x + HALF_ROAD + 5, intObj.y - HALF_ROAD - 5, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = nsColor;
            ctx.fill();
          });

          // -------------------------------------------------------------
          // 3. RENDER TACTICAL CITY BLOCKS (Pure Geometry, ZERO Text Labels)
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

            // Inset Rooftop Blueprint Geometry
            if (b.w > 60 && b.h > 60) {
              ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
              ctx.lineWidth = 1;
              ctx.strokeRect(b.x + 14, b.y + 14, b.w - 28, b.h - 28);
            }
          });

          // -------------------------------------------------------------
          // 4. UPDATE VEHICLE DYNAMICS (British LHD, Guaranteed on-road)
          // -------------------------------------------------------------
          vehicles.forEach((car, i) => {
            const currentDir = DIRS[car.dir];
            let targetSpeed = car.maxSpeed;
            let brakeReason = false;

            // Anti-Collision Headway
            vehicles.forEach((other, j) => {
              if (i === j) return;
              const ox = other.x - car.x;
              const oy = other.y - car.y;
              const forwardDist = ox * currentDir.dx + oy * currentDir.dy;
              const lateralDist = Math.abs(ox * currentDir.dy - oy * currentDir.dx);

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

            // Intersection Approach & Traffic Signal Yielding (British LHD)
            intersections.forEach((intObj) => {
              const dxToInt = intObj.x - car.x;
              const dyToInt = intObj.y - car.y;
              const distAlongDir = dxToInt * currentDir.dx + dyToInt * currentDir.dy;
              const lateralDist = Math.abs(dxToInt * currentDir.dy - dyToInt * currentDir.dx);

              if (distAlongDir > 0 && distAlongDir < 85 && lateralDist < 14) {
                const signal = getSignalState(intObj, simTimeSec);
                const isGreen = currentDir.isNS ? signal === 'NS_GREEN' : signal === 'EW_GREEN';

                if (!isGreen) {
                  // British LHD: Stop line is (HALF_ROAD + 2) from intersection center.
                  // Car front bumper is (car.length / 2) = 12px ahead of car center.
                  // We halt 14px BEFORE the stop line so lidar rays cast forward and continuously strike the red stop bar.
                  const stopThreshold = HALF_ROAD + 2 + (car.length / 2) + 14; // 19 + 2 + 12 + 14 = 47px
                  const distToStopPoint = distAlongDir - stopThreshold;

                  if (distToStopPoint <= 4) {
                    targetSpeed = 0;
                    brakeReason = true;
                    if (distToStopPoint <= 0) {
                      car.speed = 0;
                    }
                  } else if (distToStopPoint < 55) {
                    targetSpeed = Math.min(targetSpeed, (distToStopPoint / 45) * car.maxSpeed);
                    brakeReason = true;
                  }
                }
              }
            });

            // Pointer Avoidance
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

            // Handle Intersection Passage & Turning (British LHD)
            intersections.forEach((intObj) => {
              const dx = car.x - intObj.x;
              const dy = car.y - intObj.y;
              const distAlongTravel = dx * currentDir.dx + dy * currentDir.dy;
              const distLateral = Math.abs(dx * currentDir.dy - dy * currentDir.dx);

              // Car reaches the intersection center
              if (Math.abs(distAlongTravel) < 7 && distLateral <= HALF_ROAD + 2 && !car.hasTurnedInInt) {
                car.hasTurnedInInt = true;

                // Decision: Boundary vs Interior
                const atWest = intObj.xi === 0 && car.dir === 2;
                const atEast = intObj.xi === 2 && car.dir === 0;
                const atNorth = intObj.yi === 0 && car.dir === 3;
                const atSouth = intObj.yi === 2 && car.dir === 1;

                if (atWest) {
                  car.dir = intObj.yi === 0 ? 1 : (intObj.yi === 2 ? 3 : (Math.random() < 0.5 ? 1 : 3));
                } else if (atEast) {
                  car.dir = intObj.yi === 0 ? 1 : (intObj.yi === 2 ? 3 : (Math.random() < 0.5 ? 1 : 3));
                } else if (atNorth) {
                  car.dir = intObj.xi === 0 ? 0 : (intObj.xi === 2 ? 2 : (Math.random() < 0.5 ? 0 : 2));
                } else if (atSouth) {
                  car.dir = intObj.xi === 0 ? 0 : (intObj.xi === 2 ? 2 : (Math.random() < 0.5 ? 0 : 2));
                } else {
                  const rnd = Math.random();
                  if (rnd < 0.25) {
                    car.dir = (car.dir + 1) % 4; // Turn Right
                  } else if (rnd < 0.50) {
                    car.dir = (car.dir + 3) % 4; // Turn Left
                  }
                }

                // Snap strictly to the British Left-Hand Lane for the new direction
                if (car.dir === 0) { car.y = intObj.y - LANE_OFF; car.angle = DIRS[0].angle; }
                else if (car.dir === 2) { car.y = intObj.y + LANE_OFF; car.angle = DIRS[2].angle; }
                else if (car.dir === 1) { car.x = intObj.x + LANE_OFF; car.angle = DIRS[1].angle; }
                else if (car.dir === 3) { car.x = intObj.x - LANE_OFF; car.angle = DIRS[3].angle; }
              } else if (Math.hypot(dx, dy) > HALF_ROAD + 8) {
                car.hasTurnedInInt = false;
              }
            });

            // Boundary Reversal & Lane Clamping: cars NEVER leave the street network
            if (car.dir === 0 && car.x > X_STREETS[2] + 40) {
              car.dir = 2; // reverse to Westbound
              const nearestY = Y_STREETS.reduce((prev, curr) => Math.abs(curr - car.y) < Math.abs(prev - car.y) ? curr : prev);
              car.y = nearestY + LANE_OFF; // snap to Westbound bottom lane
            } else if (car.dir === 2 && car.x < X_STREETS[0] - 40) {
              car.dir = 0; // reverse to Eastbound
              const nearestY = Y_STREETS.reduce((prev, curr) => Math.abs(curr - car.y) < Math.abs(prev - car.y) ? curr : prev);
              car.y = nearestY - LANE_OFF; // snap to Eastbound top lane
            } else if (car.dir === 1 && car.y > Y_STREETS[2] + 40) {
              car.dir = 3; // reverse to Northbound
              const nearestX = X_STREETS.reduce((prev, curr) => Math.abs(curr - car.x) < Math.abs(prev - car.x) ? curr : prev);
              car.x = nearestX - LANE_OFF; // snap to Northbound left lane
            } else if (car.dir === 3 && car.y < Y_STREETS[0] - 40) {
              car.dir = 1; // reverse to Southbound
              const nearestX = X_STREETS.reduce((prev, curr) => Math.abs(curr - car.x) < Math.abs(prev - car.x) ? curr : prev);
              car.x = nearestX + LANE_OFF; // snap to Southbound right lane
            }
          });

          // -------------------------------------------------------------
          // 5. ACCURATE LIDAR SENSOR RAYCASTING (Matches Dissertation Specs)
          // -------------------------------------------------------------
          const ego = vehicles[0];
          const egoDir = DIRS[ego.dir];
          const egoBumperX = ego.x + egoDir.dx * (ego.length / 2);
          const egoBumperY = ego.y + egoDir.dy * (ego.length / 2);

          const lidarEndpoints = [];
          let closeObstacleWarning = false;

          rayAngles.forEach((relAngle) => {
            const rayAngle = ego.angle + relAngle;
            const rCos = Math.cos(rayAngle);
            const rSin = Math.sin(rayAngle);

            let bestDist = maxRange;
            let hitType = 'none';

            // Ray-stepping: checks obstacles at 2.5px resolution
            for (let d = 4; d <= maxRange; d += 2.5) {
              const rx = egoBumperX + rCos * d;
              const ry = egoBumperY + rSin * d;

              // Check 1: Hit any traffic vehicle
              for (let vIdx = 1; vIdx < vehicles.length; vIdx++) {
                const other = vehicles[vIdx];
                const ox = rx - other.x;
                const oy = ry - other.y;
                const cosA = Math.cos(other.angle);
                const sinA = Math.sin(other.angle);
                const lx = ox * cosA + oy * sinA;
                const ly = -ox * sinA + oy * cosA;
                if (Math.abs(lx) <= other.length / 2 + 1 && Math.abs(ly) <= other.width / 2 + 1) {
                  bestDist = d;
                  hitType = 'car';
                  break;
                }
              }
              if (hitType !== 'none') break;

              // Check 2: Hit pointer obstacle
              if (pointerActive) {
                const pdx = rx - pointerX;
                const pdy = ry - pointerY;
                if (pdx * pdx + pdy * pdy < 14 * 14) {
                  bestDist = d;
                  hitType = 'obstacle';
                  break;
                }
              }

              // Check 3: Hit active RED/YELLOW stop lines
              for (let iIdx = 0; iIdx < intersections.length; iIdx++) {
                const intObj = intersections[iIdx];
                const signal = getSignalState(intObj, simTimeSec);

                if (ego.dir === 0) { // Eastbound: top lane (traveling +X, stopping at west side)
                  const isRed = signal === 'NS_GREEN' || signal === 'NS_YELLOW' || signal === 'ALL_RED';
                  const stopLineX = intObj.x - HALF_ROAD - 2;
                  if (isRed && Math.abs(rx - stopLineX) <= 3.5 && ry >= intObj.y - HALF_ROAD - 2 && ry <= intObj.y + 2) {
                    bestDist = d;
                    hitType = 'signal';
                    break;
                  }
                } else if (ego.dir === 2) { // Westbound: bottom lane (traveling -X, stopping at east side)
                  const isRed = signal === 'NS_GREEN' || signal === 'NS_YELLOW' || signal === 'ALL_RED';
                  const stopLineX = intObj.x + HALF_ROAD + 2;
                  if (isRed && Math.abs(rx - stopLineX) <= 3.5 && ry >= intObj.y - 2 && ry <= intObj.y + HALF_ROAD + 2) {
                    bestDist = d;
                    hitType = 'signal';
                    break;
                  }
                } else if (ego.dir === 3) { // Northbound: left lane (traveling -Y, stopping at south side)
                  const isRed = signal === 'EW_GREEN' || signal === 'EW_YELLOW' || signal === 'ALL_RED';
                  const stopLineY = intObj.y + HALF_ROAD + 2;
                  if (isRed && Math.abs(ry - stopLineY) <= 3.5 && rx >= intObj.x - HALF_ROAD - 2 && rx <= intObj.x + 2) {
                    bestDist = d;
                    hitType = 'signal';
                    break;
                  }
                } else if (ego.dir === 1) { // Southbound: right lane (traveling +Y, stopping at north side)
                  const isRed = signal === 'EW_GREEN' || signal === 'EW_YELLOW' || signal === 'ALL_RED';
                  const stopLineY = intObj.y - HALF_ROAD - 2;
                  if (isRed && Math.abs(ry - stopLineY) <= 3.5 && rx >= intObj.x - 2 && rx <= intObj.x + HALF_ROAD + 2) {
                    bestDist = d;
                    hitType = 'signal';
                    break;
                  }
                }
              }
              if (hitType !== 'none') break;

              // Check 4: Hit road kerb boundary (outside street corridors)
              let onH = false;
              for (let yi = 0; yi < Y_STREETS.length; yi++) {
                if (Math.abs(ry - Y_STREETS[yi]) <= HALF_ROAD) { onH = true; break; }
              }
              let onV = false;
              for (let xi = 0; xi < X_STREETS.length; xi++) {
                if (Math.abs(rx - X_STREETS[xi]) <= HALF_ROAD) { onV = true; break; }
              }

              if (!onH && !onV) {
                bestDist = d;
                hitType = 'kerb';
                break;
              }
            }

            const endX = egoBumperX + rCos * bestDist;
            const endY = egoBumperY + rSin * bestDist;
            const isHit = hitType !== 'none';

            if (isHit && bestDist < 48) {
              closeObstacleWarning = true;
            }

            lidarEndpoints.push({ x: endX, y: endY, isHit, hitType, dist: bestDist });

            // Draw Laser Ray Line
            ctx.beginPath();
            ctx.moveTo(egoBumperX, egoBumperY);
            ctx.lineTo(endX, endY);
            if (hitType === 'car' || hitType === 'obstacle') {
              ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
              ctx.lineWidth = 1.6;
            } else if (hitType === 'signal') {
              ctx.strokeStyle = 'rgba(244, 63, 94, 0.85)';
              ctx.lineWidth = 1.5;
            } else if (hitType === 'kerb') {
              ctx.strokeStyle = 'rgba(45, 212, 191, 0.6)';
              ctx.lineWidth = 1.1;
            } else {
              ctx.strokeStyle = 'rgba(45, 212, 191, 0.18)';
              ctx.lineWidth = 0.8;
            }
            ctx.stroke();

            // ONLY draw a hit dot if the ray actually collided!
            if (isHit) {
              ctx.beginPath();
              ctx.arc(endX, endY, hitType === 'signal' ? 2.8 : (hitType === 'car' ? 3.2 : 2.2), 0, Math.PI * 2);
              ctx.fillStyle = hitType === 'car' || hitType === 'obstacle'
                ? '#f59e0b'
                : (hitType === 'signal' ? '#f43f5e' : '#2dd4bf');
              ctx.fill();
            }
          });

          // Fill Lidar Field-of-View Cone
          if (lidarEndpoints.length > 0) {
            ctx.beginPath();
            ctx.moveTo(egoBumperX, egoBumperY);
            lidarEndpoints.forEach((pt) => ctx.lineTo(pt.x, pt.y));
            ctx.closePath();
            ctx.fillStyle = closeObstacleWarning
              ? 'rgba(245, 158, 11, 0.05)'
              : 'rgba(45, 212, 191, 0.035)';
            ctx.fill();
          }

          // -------------------------------------------------------------
          // 6. RENDER ALL VEHICLES (Clean, NO Orange Dot)
          // -------------------------------------------------------------
          vehicles.forEach((car) => {
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.rotate(car.angle);

            const len = car.length;
            const w = car.width;

            // Headlight beams
            const headGrad = ctx.createLinearGradient(len / 2, 0, len / 2 + 28, 0);
            headGrad.addColorStop(0, car.isEgo ? 'rgba(45, 212, 191, 0.3)' : 'rgba(255, 255, 255, 0.18)');
            headGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = headGrad;
            ctx.beginPath();
            ctx.moveTo(len / 2, -w * 0.4);
            ctx.lineTo(len / 2 + 28, -w * 0.9);
            ctx.lineTo(len / 2 + 28, w * 0.9);
            ctx.lineTo(len / 2, w * 0.4);
            ctx.closePath();
            ctx.fill();

            // Vehicle Body
            ctx.beginPath();
            ctx.roundRect(-len / 2, -w / 2, len, w, 3.5);
            ctx.fillStyle = car.color;
            ctx.fill();
            ctx.strokeStyle = car.isEgo ? '#5eead4' : 'rgba(255, 255, 255, 0.2)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Cockpit / Windshield
            ctx.fillStyle = car.isEgo ? '#042f2e' : '#0f172a';
            ctx.beginPath();
            ctx.roundRect(1, -w / 2 + 2.5, 6, w - 5, 1.5);
            ctx.fill();

            // Headlights
            ctx.fillStyle = car.isEgo ? '#99f6e4' : '#f8fafc';
            ctx.fillRect(len / 2 - 1.5, -w * 0.4, 2, 2);
            ctx.fillRect(len / 2 - 1.5, w * 0.4 - 2, 2, 2);

            // Tail / Brake Lights (Red LEDs)
            const brakeGlow = car.isBraking;
            ctx.fillStyle = brakeGlow ? '#f43f5e' : 'rgba(244, 63, 94, 0.4)';
            ctx.fillRect(-len / 2 - 0.5, -w * 0.42, 2, brakeGlow ? 3 : 2);
            ctx.fillRect(-len / 2 - 0.5, w * 0.42 - (brakeGlow ? 3 : 2), 2, brakeGlow ? 3 : 2);

            ctx.restore();
          });

          // -------------------------------------------------------------
          // 7. SOFT EDGE VIGNETTE FADE (Fades all 4 outer edges into #080c14)
          // -------------------------------------------------------------
          const fadeW = Math.round(width * 0.12);
          const fadeH = Math.round(height * 0.14);

          // Top edge fade
          const gradTop = ctx.createLinearGradient(0, 0, 0, fadeH);
          gradTop.addColorStop(0, '#080c14');
          gradTop.addColorStop(1, 'rgba(8, 12, 20, 0)');
          ctx.fillStyle = gradTop;
          ctx.fillRect(0, 0, width, fadeH);

          // Bottom edge fade
          const gradBottom = ctx.createLinearGradient(0, height - fadeH, 0, height);
          gradBottom.addColorStop(0, 'rgba(8, 12, 20, 0)');
          gradBottom.addColorStop(1, '#080c14');
          ctx.fillStyle = gradBottom;
          ctx.fillRect(0, height - fadeH, width, fadeH);

          // Left edge fade
          const gradLeft = ctx.createLinearGradient(0, 0, fadeW, 0);
          gradLeft.addColorStop(0, '#080c14');
          gradLeft.addColorStop(1, 'rgba(8, 12, 20, 0)');
          ctx.fillStyle = gradLeft;
          ctx.fillRect(0, 0, fadeW, height);

          // Right edge fade
          const gradRight = ctx.createLinearGradient(width - fadeW, 0, width, 0);
          gradRight.addColorStop(0, 'rgba(8, 12, 20, 0)');
          gradRight.addColorStop(1, '#080c14');
          ctx.fillStyle = gradRight;
          ctx.fillRect(width - fadeW, 0, fadeW, height);
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
