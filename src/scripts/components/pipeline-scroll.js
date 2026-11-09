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

  // 4. Hero Autonomous Lidar Perception Radar Canvas
  if (heroRadarCanvas) {
    const ctx = heroRadarCanvas.getContext('2d');
    if (ctx) {
      let width = 0;
      let height = 0;
      let dpr = 1;
      let pointerX = 0.5;
      let pointerY = 0.5;
      let sweepAngle = 0;

      const blips = [
        { dist: 85, angle: -0.45, speed: 0.002, size: 3.5 },
        { dist: 145, angle: 0.32, speed: -0.003, size: 4 },
        { dist: 190, angle: -0.22, speed: 0.0015, size: 4.5 },
        { dist: 225, angle: 0.55, speed: -0.002, size: 3.5 },
        { dist: 110, angle: 1.15, speed: 0.001, size: 3 },
        { dist: 175, angle: -1.25, speed: -0.0015, size: 3.5 },
        { dist: 260, angle: -0.1, speed: 0.0025, size: 5 },
      ];

      const resizeRadar = () => {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = heroRadarCanvas.offsetWidth || window.innerWidth;
        height = heroRadarCanvas.offsetHeight || window.innerHeight;
        heroRadarCanvas.width = Math.floor(width * dpr);
        heroRadarCanvas.height = Math.floor(height * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };

      resizeRadar();
      window.addEventListener('resize', resizeRadar, { passive: true });
      window.addEventListener(
        'pointermove',
        (e) => {
          pointerX = e.clientX / Math.max(1, window.innerWidth);
          pointerY = e.clientY / Math.max(1, window.innerHeight);
        },
        { passive: true },
      );

      const renderRadar = () => {
        sweepAngle += 0.024;
        ctx.clearRect(0, 0, width, height);

        const vh = Math.max(1, window.innerHeight);

        // Smoothly fade out the radar as the user scrolls down towards Phase 01
        const heroOpacity = Math.max(0, 1 - smoothScrollY / (vh * 0.72));
        heroRadarCanvas.style.opacity = heroOpacity.toFixed(3);
        heroRadarCanvas.style.transform = `translate3d(0, ${(smoothScrollY * 0.3).toFixed(2)}px, 0)`;

        if (heroOpacity > 0.01) {
          const cx = width * 0.5 + (pointerX - 0.5) * 36;
          const cy = height * 0.54 + (pointerY - 0.5) * 24;

          // Subtle ambient radial glow behind the vehicle
          const radGrad = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(width, height) * 0.45);
          radGrad.addColorStop(0, 'rgba(45, 212, 191, 0.07)');
          radGrad.addColorStop(0.6, 'rgba(15, 23, 42, 0.02)');
          radGrad.addColorStop(1, 'rgba(5, 7, 12, 0)');
          ctx.fillStyle = radGrad;
          ctx.fillRect(0, 0, width, height);

          // Concentric Lidar Range Rings
          const rings = [75, 150, 225, 300];
          const labels = ['25m', '50m', '75m', '100m'];

          rings.forEach((r, idx) => {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = idx === 1 ? 'rgba(45, 212, 191, 0.18)' : 'rgba(148, 163, 184, 0.08)';
            ctx.lineWidth = 1;
            ctx.stroke();

            // Metric Range Label
            ctx.font = '500 9.5px "JetBrains Mono Variable", monospace';
            ctx.fillStyle = 'rgba(148, 163, 184, 0.45)';
            ctx.textAlign = 'left';
            ctx.fillText(labels[idx], cx + r + 4, cy - 2);
          });

          // Polar Crosshair Spokes
          const numSpokes = 8;
          ctx.strokeStyle = 'rgba(148, 163, 184, 0.06)';
          ctx.lineWidth = 1;
          for (let i = 0; i < numSpokes; i++) {
            const ang = (i * Math.PI) / 4;
            ctx.beginPath();
            ctx.moveTo(cx - Math.cos(ang) * 310, cy - Math.sin(ang) * 310);
            ctx.lineTo(cx + Math.cos(ang) * 310, cy + Math.sin(ang) * 310);
            ctx.stroke();
          }

          // Forward Autonomous Trajectory Horizon Arc (+/- 45 deg)
          ctx.save();
          ctx.beginPath();
          ctx.setLineDash([4, 6]);
          ctx.arc(cx, cy, 270, -Math.PI * 0.75, -Math.PI * 0.25);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.28)';
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();

          // Rotating Lidar Sweep Line & Phosphor Wedge
          const sweepLen = 310;
          const sweepX = cx + Math.cos(sweepAngle) * sweepLen;
          const sweepY = cy + Math.sin(sweepAngle) * sweepLen;

          const sweepGrad = ctx.createRadialGradient(cx, cy, 5, cx, cy, sweepLen);
          sweepGrad.addColorStop(0, 'rgba(45, 212, 191, 0.22)');
          sweepGrad.addColorStop(1, 'rgba(45, 212, 191, 0)');

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.arc(cx, cy, sweepLen, sweepAngle - 0.35, sweepAngle);
          ctx.closePath();
          ctx.fillStyle = sweepGrad;
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(cx, cy);
          ctx.lineTo(sweepX, sweepY);
          ctx.strokeStyle = 'rgba(45, 212, 191, 0.55)';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Obstacle detection blips
          blips.forEach((b) => {
            b.angle += b.speed;
            const bx = cx + Math.cos(b.angle) * b.dist;
            const by = cy + Math.sin(b.angle) * b.dist;

            // Compute angular distance from sweep beam
            let diff = (sweepAngle - b.angle) % (Math.PI * 2);
            if (diff < 0) diff += Math.PI * 2;
            const hit = diff < 0.45;
            const intensity = hit ? 1 : Math.max(0.2, 1 - diff * 0.35);

            ctx.beginPath();
            ctx.arc(bx, by, b.size, 0, Math.PI * 2);
            ctx.fillStyle = hit ? '#facc15' : `rgba(45, 212, 191, ${intensity.toFixed(2)})`;
            ctx.shadowBlur = hit ? 10 : 0;
            ctx.shadowColor = '#facc15';
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          // Ego Agent Vehicle Indicator at Origin
          ctx.fillStyle = '#2dd4bf';
          ctx.beginPath();
          ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, Math.PI * 2);
          ctx.stroke();
        }

        requestAnimationFrame(renderRadar);
      };

      requestAnimationFrame(renderRadar);
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
