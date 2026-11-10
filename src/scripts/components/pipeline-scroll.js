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
              occupantCarId: null,
              occupantUntil: 0,
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

      function normalizeAngle(a) {
        while (a > Math.PI) a -= Math.PI * 2;
        while (a < -Math.PI) a += Math.PI * 2;
        return a;
      }

      // 12 Outer Spawn Portals for continuous off-screen circulation (British LHD)
      function getSpawnPortals(w, h) {
        if (!X_STREETS.length || !Y_STREETS.length) return [];
        const portals = [];
        // Westbound entries from East (bottom lane of each avenue)
        Y_STREETS.forEach((y) => {
          portals.push({ x: w + 45, y: y + LANE_OFF, dir: 2, angle: Math.PI });
        });
        // Eastbound entries from West (top lane of each avenue)
        Y_STREETS.forEach((y) => {
          portals.push({ x: -45, y: y - LANE_OFF, dir: 0, angle: 0 });
        });
        // Southbound entries from North (right lane of each street)
        X_STREETS.forEach((x) => {
          portals.push({ x: x + LANE_OFF, y: -45, dir: 1, angle: Math.PI / 2 });
        });
        // Northbound entries from South (left lane of each street)
        X_STREETS.forEach((x) => {
          portals.push({ x: x - LANE_OFF, y: h + 45, dir: 3, angle: -Math.PI / 2 });
        });
        return portals;
      }

      // Cubic Bezier curve helpers for smooth curved turning round corners
      function evalCubicBezier(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        const t2 = t * t;
        const t3 = t2 * t;
        return {
          x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
          y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
        };
      }

      function evalCubicBezierTangent(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        const mt2 = mt * mt;
        const t2 = t * t;
        return {
          x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
          y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y),
        };
      }

      function getTurnBezier(intObj, fromDir, toDir) {
        const X0 = intObj.x;
        const Y0 = intObj.y;
        const H = HALF_ROAD; // 19
        const L = LANE_OFF;  // 9.5

        let p0 = { x: 0, y: 0 };
        let p3 = { x: 0, y: 0 };

        const isLeft = (fromDir + 3) % 4 === toDir;
        // k=13 keeps right turns tight to the center, never clipping waiting lanes
        const k = isLeft ? 6.0 : 13.0;

        // Entry point P0 at intersection boundary in incoming lane
        if (fromDir === 0) p0 = { x: X0 - H, y: Y0 - L };
        else if (fromDir === 1) p0 = { x: X0 + L, y: Y0 - H };
        else if (fromDir === 2) p0 = { x: X0 + H, y: Y0 + L };
        else if (fromDir === 3) p0 = { x: X0 - L, y: Y0 + H };

        // Exit point P3 at intersection boundary in target lane
        if (toDir === 0) p3 = { x: X0 + H, y: Y0 - L };
        else if (toDir === 1) p3 = { x: X0 + L, y: Y0 + H };
        else if (toDir === 2) p3 = { x: X0 - H, y: Y0 + L };
        else if (toDir === 3) p3 = { x: X0 - L, y: Y0 - H };

        const d0 = DIRS[fromDir];
        const d3 = DIRS[toDir];
        const p1 = { x: p0.x + d0.dx * k, y: p0.y + d0.dy * k };
        const p2 = { x: p3.x - d3.dx * k, y: p3.y - d3.dy * k };
        const length = isLeft ? 16 : 38;

        return { p0, p1, p2, p3, length, isLeft };
      }

      // 15-step Continuous Autonomous Circuit for Luke's Ego Vehicle (100% on-screen perpetual loop)
      const EGO_ROUTE = [
        { xi: 1, yi: 1, fromDir: 0, action: 'straight', toDir: 0 },
        { xi: 2, yi: 1, fromDir: 0, action: 'right', toDir: 1 },
        { xi: 2, yi: 2, fromDir: 1, action: 'right', toDir: 2 },
        { xi: 1, yi: 2, fromDir: 2, action: 'straight', toDir: 2 },
        { xi: 0, yi: 2, fromDir: 2, action: 'right', toDir: 3 },
        { xi: 0, yi: 1, fromDir: 3, action: 'straight', toDir: 3 },
        { xi: 0, yi: 0, fromDir: 3, action: 'right', toDir: 0 },
        { xi: 1, yi: 0, fromDir: 0, action: 'straight', toDir: 0 },
        { xi: 2, yi: 0, fromDir: 0, action: 'right', toDir: 1 },
        { xi: 2, yi: 1, fromDir: 1, action: 'right', toDir: 2 },
        { xi: 1, yi: 1, fromDir: 2, action: 'straight', toDir: 2 },
        { xi: 0, yi: 1, fromDir: 2, action: 'left', toDir: 1 },
        { xi: 0, yi: 2, fromDir: 1, action: 'left', toDir: 0 },
        { xi: 1, yi: 2, fromDir: 0, action: 'left', toDir: 3 },
        { xi: 1, yi: 1, fromDir: 3, action: 'right', toDir: 0 },
      ];

      // British Traffic Rules: Determine planned maneuver for a vehicle at an intersection
      function getCarManeuver(car, intObj) {
        if (car.isEgo) {
          const wp = EGO_ROUTE[car.routeIndex];
          if (wp && wp.xi === intObj.xi && wp.yi === intObj.yi) {
            if (wp.toDir === car.dir) return { maneuver: 'straight', toDir: wp.toDir };
            if ((car.dir + 3) % 4 === wp.toDir) return { maneuver: 'left', toDir: wp.toDir };
            return { maneuver: 'right', toDir: wp.toDir };
          }
          return { maneuver: 'straight', toDir: car.dir };
        }

        // Environment vehicles: planned intention
        if (car.plannedTurnDir === undefined || car.plannedTurnInt !== intObj) {
          const atWest = intObj.xi === 0 && car.dir === 2;
          const atEast = intObj.xi === 2 && car.dir === 0;
          const atNorth = intObj.yi === 0 && car.dir === 3;
          const atSouth = intObj.yi === 2 && car.dir === 1;

          let targetDir = car.dir;
          if (atWest) {
            targetDir = intObj.yi === 0 ? 1 : (intObj.yi === 2 ? 3 : (Math.random() < 0.5 ? 1 : 3));
          } else if (atEast) {
            targetDir = intObj.yi === 0 ? 1 : (intObj.yi === 2 ? 3 : (Math.random() < 0.5 ? 1 : 3));
          } else if (atNorth) {
            targetDir = intObj.xi === 0 ? 0 : (intObj.xi === 2 ? 2 : (Math.random() < 0.5 ? 0 : 2));
          } else if (atSouth) {
            targetDir = intObj.xi === 0 ? 0 : (intObj.xi === 2 ? 2 : (Math.random() < 0.5 ? 0 : 2));
          } else {
            const rnd = Math.random();
            if (rnd < 0.25) targetDir = (car.dir + 1) % 4; // Right turn
            else if (rnd < 0.50) targetDir = (car.dir + 3) % 4; // Left turn
            else targetDir = car.dir; // Straight
          }
          car.plannedTurnDir = targetDir;
          car.plannedTurnInt = intObj;
        }

        const toDir = car.plannedTurnDir;
        if (toDir === car.dir) return { maneuver: 'straight', toDir };
        if ((car.dir + 3) % 4 === toDir) return { maneuver: 'left', toDir };
        return { maneuver: 'right', toDir };
      }

      // British Right-of-Way Rules (Highway Code Rule 174 Box Junction & Priority):
      // 1. Straight-through traffic has Priority over vehicles turning across traffic.
      // 2. Left turns (near-side) do not cross opposing traffic, so they do NOT yield to the other side.
      // 3. Right turns (across oncoming lane) MUST yield to oncoming straight and left-turn traffic ON THE SAME ROAD!
      // 4. Yellow Box Junction rule: If ANY vehicle is turning inside the box, vehicles must wait behind the stop line.
      function shouldYieldAtIntersection(carA, intObj) {
        // Yellow Box Rule: If junction is reserved by another vehicle, approaching vehicles MUST wait
        if (intObj.occupantCarId !== null && intObj.occupantCarId !== carA.id) {
          return true;
        }

        // If another vehicle is physically inside the junction box, yield
        for (let i = 0; i < vehicles.length; i++) {
          const carB = vehicles[i];
          if (carB.id === carA.id || carB.isOffscreen) continue;
          const distBToCenter = Math.hypot(carB.x - intObj.x, carB.y - intObj.y);
          if (distBToCenter < HALF_ROAD + 2) {
            return true;
          }
        }

        const { maneuver: maneuverA } = getCarManeuver(carA, intObj);
        const currentDir = DIRS[carA.dir];
        const oppositeDir = (carA.dir + 2) % 4;

        // Right-turn Yielding: if Car A is turning right across oncoming traffic,
        // Car A MUST yield to oncoming vehicles traveling straight or left ON THE EXACT SAME ROAD!
        if (maneuverA === 'right') {
          for (let i = 0; i < vehicles.length; i++) {
            const carB = vehicles[i];
            if (carB.id === carA.id || carB.isOffscreen) continue;

            if (carB.dir === oppositeDir) {
              // Crucial Fix: carB MUST be on the exact same road corridor, not another avenue!
              const lateralDist = currentDir.isNS
                ? Math.abs(carB.x - intObj.x)
                : Math.abs(carB.y - intObj.y);

              if (lateralDist < HALF_ROAD + 8) {
                const dOpp = DIRS[oppositeDir];
                const distBAlong = (intObj.x - carB.x) * dOpp.dx + (intObj.y - carB.y) * dOpp.dy;

                // If oncoming vehicle on this road is approaching within 95px:
                if (distBAlong > -5 && distBAlong < 95) {
                  const { maneuver: maneuverB } = getCarManeuver(carB, intObj);
                  if (maneuverB === 'straight' || maneuverB === 'left') {
                    return true; // Yield to oncoming traffic on this road
                  }
                }
              }
            }
          }
        }

        // Straight traffic and left turns have right-of-way!
        return false;
      }

      // 11 Vehicles: Vehicle 0 is Luke's PPO Agent (Ego), Vehicles 1-10 are Traffic
      const vehicles = [
        {
          id: 0,
          isEgo: true,
          color: '#2dd4bf',
          length: 24,
          width: 12,
          x: 0,
          y: 0,
          dir: 0,
          angle: 0,
          speed: 28,
          maxSpeed: 30,
          isBraking: false,
          isTurning: false,
          turnT: 0,
          turnBezier: null,
          routeIndex: 0,
          hasTurnedInInt: false,
          turnSignal: null,
          isOffscreen: false,
          respawnAt: 0,
          stuckDuration: 0,
        },
        { id: 1, isEgo: false, color: '#475569', length: 22, width: 11, x: 0, y: 0, dir: 0, angle: 0, speed: 25, maxSpeed: 28, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 2, isEgo: false, color: '#334155', length: 22, width: 11, x: 0, y: 0, dir: 2, angle: Math.PI, speed: 26, maxSpeed: 29, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 3, isEgo: false, color: '#64748b', length: 22, width: 11, x: 0, y: 0, dir: 2, angle: Math.PI, speed: 25, maxSpeed: 27, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 4, isEgo: false, color: '#38495e', length: 22, width: 11, x: 0, y: 0, dir: 0, angle: 0, speed: 27, maxSpeed: 30, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 5, isEgo: false, color: '#1e293b', length: 22, width: 11, x: 0, y: 0, dir: 2, angle: Math.PI, speed: 25, maxSpeed: 28, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 6, isEgo: false, color: '#4b5563', length: 22, width: 11, x: 0, y: 0, dir: 1, angle: Math.PI / 2, speed: 26, maxSpeed: 29, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 7, isEgo: false, color: '#374151', length: 22, width: 11, x: 0, y: 0, dir: 3, angle: -Math.PI / 2, speed: 25, maxSpeed: 28, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 8, isEgo: false, color: '#2b394d', length: 22, width: 11, x: 0, y: 0, dir: 1, angle: Math.PI / 2, speed: 24, maxSpeed: 27, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 9, isEgo: false, color: '#526071', length: 22, width: 11, x: 0, y: 0, dir: 3, angle: -Math.PI / 2, speed: 26, maxSpeed: 29, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
        { id: 10, isEgo: false, color: '#1f2937', length: 22, width: 11, x: 0, y: 0, dir: 1, angle: Math.PI / 2, speed: 25, maxSpeed: 28, isBraking: false, isTurning: false, turnT: 0, turnBezier: null, hasTurnedInInt: false, turnSignal: null, isOffscreen: false, respawnAt: 0, stuckDuration: 0 },
      ];

      function resetVehiclePositions() {
        if (!X_STREETS.length || !Y_STREETS.length) return;

        // Ego Car: Middle Avenue between West and Center streets, heading East
        vehicles[0].x = X_STREETS[0] + 50;
        vehicles[0].y = Y_STREETS[1] - LANE_OFF;
        vehicles[0].dir = 0;
        vehicles[0].angle = 0;
        vehicles[0].routeIndex = 0;
        vehicles[0].isTurning = false;
        vehicles[0].turnBezier = null;
        vehicles[0].hasTurnedInInt = false;

        // Car 1: North Avenue, Eastbound, between West and Center
        vehicles[1].x = X_STREETS[0] + 45;
        vehicles[1].y = Y_STREETS[0] - LANE_OFF;
        vehicles[1].dir = 0;
        vehicles[1].angle = 0;

        // Car 2: North Avenue, Westbound, between East and Center
        vehicles[2].x = X_STREETS[2] - 50;
        vehicles[2].y = Y_STREETS[0] + LANE_OFF;
        vehicles[2].dir = 2;
        vehicles[2].angle = Math.PI;

        // Car 3: Central Avenue, Westbound, between Center and West
        vehicles[3].x = X_STREETS[1] - 60;
        vehicles[3].y = Y_STREETS[1] + LANE_OFF;
        vehicles[3].dir = 2;
        vehicles[3].angle = Math.PI;

        // Car 4: South Avenue, Eastbound, between West and Center
        vehicles[4].x = X_STREETS[0] + 70;
        vehicles[4].y = Y_STREETS[2] - LANE_OFF;
        vehicles[4].dir = 0;
        vehicles[4].angle = 0;

        // Car 5: South Avenue, Westbound, between East and Center
        vehicles[5].x = X_STREETS[2] - 65;
        vehicles[5].y = Y_STREETS[2] + LANE_OFF;
        vehicles[5].dir = 2;
        vehicles[5].angle = Math.PI;

        // Car 6: West Street, Southbound, between North and Middle
        vehicles[6].x = X_STREETS[0] + LANE_OFF;
        vehicles[6].y = Y_STREETS[0] + 55;
        vehicles[6].dir = 1;
        vehicles[6].angle = Math.PI / 2;

        // Car 7: West Street, Northbound, between South and Middle
        vehicles[7].x = X_STREETS[0] - LANE_OFF;
        vehicles[7].y = Y_STREETS[2] - 55;
        vehicles[7].dir = 3;
        vehicles[7].angle = -Math.PI / 2;

        // Car 8: Center Street, Southbound, between North and Middle
        vehicles[8].x = X_STREETS[1] + LANE_OFF;
        vehicles[8].y = Y_STREETS[0] + 65;
        vehicles[8].dir = 1;
        vehicles[8].angle = Math.PI / 2;

        // Car 9: Center Street, Northbound, between South and Middle
        vehicles[9].x = X_STREETS[1] - LANE_OFF;
        vehicles[9].y = Y_STREETS[2] - 65;
        vehicles[9].dir = 3;
        vehicles[9].angle = -Math.PI / 2;

        // Car 10: East Street, Southbound, between Middle and South
        vehicles[10].x = X_STREETS[2] + LANE_OFF;
        vehicles[10].y = Y_STREETS[1] + 55;
        vehicles[10].dir = 1;
        vehicles[10].angle = Math.PI / 2;

        for (let i = 0; i < vehicles.length; i++) {
          vehicles[i].isTurning = false;
          vehicles[i].turnBezier = null;
          vehicles[i].hasTurnedInInt = false;
          vehicles[i].isOffscreen = false;
          vehicles[i].respawnAt = 0;
          vehicles[i].stuckDuration = 0;
          vehicles[i].turnSignal = null;
        }
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
          // 4. UPDATE VEHICLE DYNAMICS (British LHD, Smooth Bezier Turns, Non-Collision)
          // -------------------------------------------------------------
          // A. Clean up stale intersection occupancy leases
          intersections.forEach((intObj) => {
            if (intObj.occupantCarId !== null) {
              const occupant = vehicles.find((v) => v.id === intObj.occupantCarId);
              if (!occupant || occupant.isOffscreen || simTimeSec > intObj.occupantUntil) {
                intObj.occupantCarId = null;
              } else {
                const distToCenter = Math.hypot(occupant.x - intObj.x, occupant.y - intObj.y);
                if (distToCenter > HALF_ROAD + 14 && !occupant.isTurning) {
                  intObj.occupantCarId = null;
                }
              }
            }
          });

          // B. Offscreen Despawn & 3-6s Random Respawn Cycle (Prompt #9)
          vehicles.forEach((car) => {
            if (car.isEgo) return; // Luke's RL agent stays 100% on screen forever

            // If car drove off canvas: despawn and set 3-6s timer
            if (!car.isOffscreen && (car.x < -60 || car.x > width + 60 || car.y < -60 || car.y > height + 60)) {
              car.isOffscreen = true;
              car.respawnAt = simTimeSec + 3.0 + Math.random() * 3.0; // 3 to 6 seconds random delay
              car.x = -9999;
              car.y = -9999;
              car.speed = 0;
              car.isTurning = false;
              car.turnBezier = null;
              car.hasTurnedInInt = false;
              car.stuckDuration = 0;
            }

            // If timer expired: find an unobstructed portal and respawn driving in
            if (car.isOffscreen && simTimeSec >= car.respawnAt) {
              const portals = getSpawnPortals(width, height);
              const clearPortals = portals.filter((p) => {
                return !vehicles.some((v) => !v.isOffscreen && Math.hypot(v.x - p.x, v.y - p.y) < 75);
              });
              if (clearPortals.length > 0) {
                const portal = clearPortals[Math.floor(Math.random() * clearPortals.length)];
                car.isOffscreen = false;
                car.x = portal.x;
                car.y = portal.y;
                car.dir = portal.dir;
                car.angle = portal.angle;
                car.speed = 22 + Math.random() * 4;
                car.maxSpeed = 26 + Math.random() * 4;
                car.isBraking = false;
                car.isTurning = false;
                car.turnBezier = null;
                car.hasTurnedInInt = false;
                car.stuckDuration = 0;
                car.plannedTurnDir = undefined;
                car.plannedTurnInt = undefined;
              }
            }
          });

          // C. Update Dynamics for All Active On-Screen Vehicles
          vehicles.forEach((car) => {
            if (car.isOffscreen) return;

            let targetSpeed = car.maxSpeed;
            let brakeReason = false;

            // Headway Check: only check vehicles in the same path/lane
            if (car.isTurning) {
              // Turning vehicles hold junction mutex; only slow down if destination lane is backed up ahead
              const dTarget = DIRS[car.targetDir];
              vehicles.forEach((other) => {
                if (other.id === car.id || other.isOffscreen) return;
                if (other.dir === car.targetDir) {
                  const dx = other.x - car.x;
                  const dy = other.y - car.y;
                  const fwd = dx * dTarget.dx + dy * dTarget.dy;
                  const lat = Math.abs(dx * dTarget.dy - dy * dTarget.dx);
                  if (fwd > 0 && fwd < 42 && lat < 11) {
                    targetSpeed = Math.min(targetSpeed, other.speed * 0.7);
                    brakeReason = true;
                  }
                }
              });
            } else {
              // Cruising straight: only follow vehicles heading in the same lane corridor
              vehicles.forEach((other) => {
                if (other.id === car.id || other.isOffscreen) return;
                const angleDiff = Math.abs(normalizeAngle(car.angle - other.angle));
                if (angleDiff < 0.6) {
                  const dx = other.x - car.x;
                  const dy = other.y - car.y;
                  const fwd = dx * Math.cos(car.angle) + dy * Math.sin(car.angle);
                  const lat = Math.abs(-dx * Math.sin(car.angle) + dy * Math.cos(car.angle));

                  if (fwd > 0 && fwd < 54 && lat < 11) {
                    if (fwd < 27) {
                      targetSpeed = 0;
                      brakeReason = true;
                      if (fwd < 23) car.speed = 0;
                    } else {
                      targetSpeed = Math.min(targetSpeed, Math.max(0, other.speed * 0.85));
                      brakeReason = true;
                    }
                  }
                }
              });
            }

            // Intersection Entry & Traffic Signal Logic (only if not already mid-turn)
            if (!car.isTurning) {
              const currentDir = DIRS[car.dir];

              intersections.forEach((intObj) => {
                const dxToInt = intObj.x - car.x;
                const dyToInt = intObj.y - car.y;
                const distAlongDir = dxToInt * currentDir.dx + dyToInt * currentDir.dy;
                const lateralDist = Math.abs(dxToInt * currentDir.dy - dyToInt * currentDir.dx);

                // Approaching intersection from incoming lane
                if (distAlongDir > 0 && distAlongDir < 90 && lateralDist < 14) {
                  const signal = getSignalState(intObj, simTimeSec);
                  const isGreen = currentDir.isNS ? signal === 'NS_GREEN' : signal === 'EW_GREEN';
                  const mustYield = shouldYieldAtIntersection(car, intObj);
                  const boxOccupied = intObj.occupantCarId !== null && intObj.occupantCarId !== car.id;

                  const stopLineDist = HALF_ROAD + 2; // 21px from center
                  const safeStopDist = stopLineDist + (car.length / 2) + 3; // 35px from center (front bumper 3px behind stop line)

                  if (!isGreen || mustYield || boxOccupied) {
                    const distToStopPoint = distAlongDir - safeStopDist;
                    if (distToStopPoint <= 3) {
                      targetSpeed = 0;
                      brakeReason = true;
                      if (distToStopPoint <= 0) car.speed = 0;
                    } else if (distToStopPoint < 55) {
                      targetSpeed = Math.min(targetSpeed, (distToStopPoint / 45) * car.maxSpeed);
                      brakeReason = true;
                    }
                  }

                  // Intersection Decision Point: entrance boundary (distAlongDir <= HALF_ROAD + 4)
                  if (distAlongDir <= HALF_ROAD + 4 && distAlongDir > 0 && !car.hasTurnedInInt) {
                    if (isGreen && !mustYield && !boxOccupied) {
                      car.hasTurnedInInt = true;
                      const { toDir: targetDir } = getCarManeuver(car, intObj);

                      if (car.isEgo) {
                        car.routeIndex = (car.routeIndex + 1) % EGO_ROUTE.length;
                      }

                      // Claim exclusive junction occupancy
                      intObj.occupantCarId = car.id;
                      intObj.occupantUntil = simTimeSec + 3.5;

                      if (targetDir !== car.dir) {
                        // Start smooth Bezier corner turn!
                        car.isTurning = true;
                        car.turnBezier = getTurnBezier(intObj, car.dir, targetDir);
                        car.turnT = 0;
                        car.targetDir = targetDir;
                        car.turnSignal = (car.dir + 3) % 4 === targetDir ? 'left' : 'right';
                      }
                    }
                  }
                }

                // Reset once comfortably exited
                const distToCenter = Math.hypot(car.x - intObj.x, car.y - intObj.y);
                if (car.hasTurnedInInt && distToCenter > HALF_ROAD + 14) {
                  car.hasTurnedInInt = false;
                  car.plannedTurnDir = undefined;
                  if (intObj.occupantCarId === car.id) {
                    intObj.occupantCarId = null;
                  }
                }
              });
            }

            // Pointer Avoidance
            if (pointerActive) {
              const px = pointerX - car.x;
              const py = pointerY - car.y;
              const fDist = px * Math.cos(car.angle) + py * Math.sin(car.angle);
              const lDist = Math.abs(-px * Math.sin(car.angle) + py * Math.cos(car.angle));
              if (fDist > 0 && fDist < 55 && lDist < 18) {
                targetSpeed = 0;
                brakeReason = true;
              }
            }

            // Cap speed slightly during turn for natural cornering
            if (car.isTurning) {
              targetSpeed = Math.min(targetSpeed, 20);
            }

            // Fail-safe Anti-Deadlock Watchdog (Guarantees zero persistent lockups)
            if (car.speed < 1 && car.isBraking) {
              car.stuckDuration = (car.stuckDuration || 0) + dt;
              if (car.stuckDuration > 1.8) {
                if (car.isTurning) {
                  car.speed = 18;
                  car.isBraking = false;
                  car.stuckDuration = 0;
                } else {
                  const nearInt = intersections.find(
                    (intObj) => Math.hypot(car.x - intObj.x, car.y - intObj.y) < HALF_ROAD + 20
                  );
                  if (nearInt) {
                    const signal = getSignalState(nearInt, simTimeSec);
                    const isGreen = DIRS[car.dir].isNS ? signal === 'NS_GREEN' : signal === 'EW_GREEN';
                    if (isGreen) {
                      nearInt.occupantCarId = car.id;
                      car.speed = 18;
                      car.isBraking = false;
                      car.stuckDuration = 0;
                    }
                  }
                }
              }
            } else {
              car.stuckDuration = 0;
            }

            // Smooth Acceleration / Deceleration
            if (car.speed > targetSpeed) {
              car.speed = Math.max(targetSpeed, car.speed - 60 * dt);
              car.isBraking = brakeReason || car.speed < 12;
            } else {
              car.speed = Math.min(targetSpeed, car.speed + 25 * dt);
              car.isBraking = false;
            }

            // Position Integration (Cruising vs Turning along Bezier Arc)
            if (car.isTurning && car.turnBezier) {
              const bz = car.turnBezier;
              car.turnT += (car.speed * dt) / bz.length;

              if (car.turnT >= 1) {
                // Completed turn smoothly into new lane
                car.turnT = 1;
                car.x = bz.p3.x;
                car.y = bz.p3.y;
                car.dir = car.targetDir;
                car.angle = DIRS[car.targetDir].angle;
                car.isTurning = false;
                car.turnBezier = null;
                car.turnSignal = null;
              } else {
                const pt = evalCubicBezier(bz.p0, bz.p1, bz.p2, bz.p3, car.turnT);
                const tang = evalCubicBezierTangent(bz.p0, bz.p1, bz.p2, bz.p3, car.turnT);
                car.x = pt.x;
                car.y = pt.y;
                car.angle = Math.atan2(tang.y, tang.x);
              }
            } else {
              // Cruising straight in lane
              const currentDir = DIRS[car.dir];
              car.x += currentDir.dx * car.speed * dt;
              car.y += currentDir.dy * car.speed * dt;
              car.angle = currentDir.angle;
            }
          });

          // -------------------------------------------------------------
          // 5. ACCURATE LIDAR SENSOR RAYCASTING (Matches Dissertation Specs)
          // -------------------------------------------------------------
          const ego = vehicles[0];
          const egoAngle = ego.angle;
          const egoBumperX = ego.x + Math.cos(egoAngle) * (ego.length / 2);
          const egoBumperY = ego.y + Math.sin(egoAngle) * (ego.length / 2);

          const lidarEndpoints = [];
          let closeObstacleWarning = false;

          rayAngles.forEach((relAngle) => {
            const rayAngle = egoAngle + relAngle;
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
                if (other.isOffscreen) continue;
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

            // Draw Laser Ray Line (NO darkening between lasers!)
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
              ctx.shadowColor = ctx.fillStyle;
              ctx.shadowBlur = 6;
              ctx.fill();
              ctx.shadowBlur = 0;
            }
          });

          // -------------------------------------------------------------
          // 6. RENDER ALL VEHICLES (Clean, NO Dark Wedge, NO Orange Dot)
          // -------------------------------------------------------------
          vehicles.forEach((car) => {
            if (car.isOffscreen) return;
            ctx.save();
            ctx.translate(car.x, car.y);
            ctx.rotate(car.angle);

            const len = car.length;
            const w = car.width;

            // Vehicle Body
            ctx.beginPath();
            ctx.roundRect(-len / 2, -w / 2, len, w, 3.5);
            ctx.fillStyle = car.color;
            ctx.fill();
            ctx.strokeStyle = car.isEgo ? '#5eead4' : 'rgba(255, 255, 255, 0.18)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Cockpit / Windshield
            ctx.fillStyle = car.isEgo ? '#042f2e' : '#0a0f1d';
            ctx.beginPath();
            ctx.roundRect(1, -w / 2 + 2.5, 6, w - 5, 1.5);
            ctx.fill();

            // Headlights (Clean LED points on bumper corners — ZERO dark wedge)
            ctx.fillStyle = car.isEgo ? '#99f6e4' : '#f8fafc';
            ctx.fillRect(len / 2 - 1.5, -w * 0.4, 2, 2);
            ctx.fillRect(len / 2 - 1.5, w * 0.4 - 2, 2, 2);

            // Tail / Brake Lights (Red LEDs)
            const brakeGlow = car.isBraking;
            ctx.fillStyle = brakeGlow ? '#f43f5e' : 'rgba(244, 63, 94, 0.35)';
            ctx.fillRect(-len / 2 - 0.5, -w * 0.42, 2, brakeGlow ? 3 : 2);
            ctx.fillRect(-len / 2 - 0.5, w * 0.42 - (brakeGlow ? 3 : 2), 2, brakeGlow ? 3 : 2);

            // Turn Signal Indicator (blinking amber LED on turning side)
            if (car.isTurning && car.turnSignal) {
              const blink = Math.floor(simTimeSec * 5) % 2 === 0;
              if (blink) {
                ctx.fillStyle = '#f59e0b';
                const sigY = car.turnSignal === 'left' ? -w * 0.42 : w * 0.42 - 2;
                ctx.fillRect(len * 0.1, sigY, 2.5, 2);
              }
            }

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
