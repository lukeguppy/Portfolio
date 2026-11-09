/**
 * Powers the About Me page:
 * 1. Scroll-scrubbed 3D depth & parallax chapter transitions (About Me -> Experience -> Other Projects)
 * 2. Exact first-dot-to-last-dot normalized vertical Experience Timeline with 120Hz exponential smoothing
 * 3. Full-viewport interactive background canvas (`#about-bg-container`)
 */
export function initTimelineScroll() {
  initAboutBackground();

  const heroSection = document.querySelector('[data-about-hero]');
  const heroTitle = heroSection?.querySelector('.about-hero__title');
  const heroLead = heroSection?.querySelector('.about-hero__lead');
  const heroPillars = heroSection?.querySelector('.about-hero__pillars');
  const scrollCue = document.querySelector('[data-about-scroll-cue]');

  const expSection = document.getElementById('experience');
  const expHeader = document.querySelector('.experience-header');
  const projectsSection = document.getElementById('projects');
  const projectsHeader = projectsSection?.querySelector('.section-header');
  const projectsWorkbench = projectsSection?.querySelector('[data-projects-workbench]');

  const timeline = document.querySelector('[data-experience-timeline]');
  const spine = timeline?.querySelector('.timeline-spine');
  const spineFill = document.querySelector('[data-spine-fill]');
  const spineHead = document.querySelector('[data-spine-head]');
  const expCards = [...document.querySelectorAll('[data-exp-card]')];
  const dots = [...document.querySelectorAll('.timeline-dot')];

  if (!timeline || !spine || !spineFill || !spineHead || !expCards.length) return;

  let firstDotY = 14;
  let lastDotY = 200;
  let spineSpan = 186;
  let timelineDocTop = 0;
  let cardLayout = [];

  // Framerate-independent smoothed state
  let smoothScrollY = window.scrollY;
  let currentProgress = 0;
  let lastTime = performance.now();

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function scrollEnterProgress(rectTop, startY, endY) {
    const raw = (startY - rectTop) / Math.max(1, startY - endY);
    const t = clamp(raw, 0, 1);
    return t * t * (3 - 2 * t);
  }

  function measureLayout() {
    const tlRect = timeline.getBoundingClientRect();
    timelineDocTop = tlRect.top + window.scrollY;

    cardLayout = expCards.map((card, i) => {
      const top = card.offsetTop + 14;
      if (dots[i]) {
        dots[i].style.top = `${top}px`;
      }
      return {
        el: card,
        dotEl: dots[i],
        top,
        docTop: timelineDocTop + card.offsetTop,
        ratio: 0,
      };
    });

    firstDotY = cardLayout[0]?.top ?? 14;
    lastDotY = cardLayout[cardLayout.length - 1]?.top ?? Math.max(100, timeline.offsetHeight - 40);
    spineSpan = Math.max(1, lastDotY - firstDotY);

    // Anchor the spine track strictly between the first and last dot centers
    spine.style.top = `${firstDotY}px`;
    spine.style.height = `${spineSpan}px`;

    cardLayout.forEach((item) => {
      item.ratio = clamp((item.top - firstDotY) / spineSpan, 0, 1);
    });
  }

  measureLayout();
  window.addEventListener('resize', measureLayout, { passive: true });
  window.addEventListener('load', measureLayout, { once: true });

  function tick(now) {
    const dt = Math.min(0.064, Math.max(0.001, (now - lastTime) / 1000));
    lastTime = now;

    const rawScrollY = window.scrollY;
    const vh = Math.max(1, window.innerHeight);

    if (scrollCue) {
      scrollCue.classList.toggle('is-hidden', rawScrollY > 36);
    }

    // Exponential smoothing for fluid 120Hz tracking with zero jumpiness
    const decay = 1 - Math.exp(-14 * dt);
    smoothScrollY += (rawScrollY - smoothScrollY) * decay;

    // -------------------------------------------------------------------------
    // 1. HERO PARALLAX & DEPTH RECESSION (Active only on scroll down)
    // -------------------------------------------------------------------------
    if (smoothScrollY > 12) {
      const heroExitP = clamp(smoothScrollY / (vh * 0.68), 0, 1);
      if (heroTitle) {
        const y = smoothScrollY * 0.34;
        const scale = 1 - heroExitP * 0.12;
        const op = 1 - heroExitP;
        heroTitle.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        heroTitle.style.opacity = op.toFixed(3);
      }
      if (heroLead) {
        const y = smoothScrollY * 0.22;
        const scale = 1 - heroExitP * 0.08;
        const op = clamp(1 - heroExitP * 1.1, 0, 1);
        heroLead.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        heroLead.style.opacity = op.toFixed(3);
      }
      if (heroPillars) {
        const y = smoothScrollY * 0.12;
        const scale = 1 - heroExitP * 0.06;
        const op = clamp(1 - heroExitP * 1.2, 0, 1);
        heroPillars.style.transform = `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        heroPillars.style.opacity = op.toFixed(3);
      }
    } else {
      if (heroTitle && heroTitle.style.transform) heroTitle.style.transform = '';
      if (heroLead && heroLead.style.transform) heroLead.style.transform = '';
      if (heroPillars && heroPillars.style.transform) heroPillars.style.transform = '';
    }

    // -------------------------------------------------------------------------
    // 2. EXPERIENCE SECTION HEADER & DIVIDER REVEAL
    // -------------------------------------------------------------------------
    if (expSection && expHeader) {
      const expRelTop = timelineDocTop - 80 - smoothScrollY;
      const enterP = scrollEnterProgress(expRelTop, vh * 0.9, vh * 0.5);
      expSection.style.setProperty('--rule-scale', enterP.toFixed(4));

      if (enterP >= 0.999) {
        expHeader.style.transform = 'none';
        expHeader.style.opacity = '1';
      } else {
        const yOffset = (1 - enterP) * 56;
        const scale = 0.88 + enterP * 0.12;
        expHeader.style.transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        expHeader.style.opacity = enterP.toFixed(3);
      }
    }

    // -------------------------------------------------------------------------
    // 3. TIMELINE SPINE FILL & INDICATOR CIRCLE (Ultra-smooth 120Hz tracking)
    // -------------------------------------------------------------------------
    const focalY = vh * 0.54;
    const firstDotViewportY = (timelineDocTop + firstDotY) - smoothScrollY;
    const targetProgress = clamp((focalY - firstDotViewportY) / spineSpan, 0, 1);
    currentProgress += (targetProgress - currentProgress) * decay;

    spineFill.style.transform = `scaleY(${currentProgress.toFixed(4)})`;
    const headY = currentProgress * spineSpan;
    spineHead.style.transform = `translate3d(-50%, ${headY.toFixed(2)}px, 0) translateY(-50%)`;

    // -------------------------------------------------------------------------
    // 4. TIMELINE ENTRIES — 3D Perspective Scroll Entrance + Active Focus
    // -------------------------------------------------------------------------
    let activeCardIdx = 0;
    cardLayout.forEach((item, idx) => {
      const reached = idx === 0 || currentProgress >= item.ratio - 0.02;
      if (reached) activeCardIdx = idx;
      if (item.dotEl) {
        item.dotEl.classList.toggle('is-active', reached);
      }
    });

    cardLayout.forEach((item, idx) => {
      const cardRelTop = item.docTop - smoothScrollY;
      const enterP = scrollEnterProgress(cardRelTop, vh * 0.92, vh * 0.52);
      const isFocused = idx === activeCardIdx;

      item.el.classList.toggle('is-active', isFocused);

      if (enterP >= 0.999) {
        item.el.style.transform = 'none';
        item.el.style.opacity = '1';
      } else {
        const yOffset = (1 - enterP) * 64;
        const scale = 0.91 + enterP * 0.09;
        const rotX = (1 - enterP) * 12;
        item.el.style.transform = `perspective(1100px) rotateX(${rotX.toFixed(2)}deg) translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
        item.el.style.opacity = enterP.toFixed(3);
      }
    });

    // -------------------------------------------------------------------------
    // 5. Other Projects: Staggered Header & 3D Workbench Unfold
    // -------------------------------------------------------------------------
    if (projectsSection) {
      const projDocTop = projectsSection.offsetTop;
      const projRelTop = projDocTop - smoothScrollY;
      const nearBottom = vh + rawScrollY >= document.documentElement.scrollHeight - 40;
      const headP = nearBottom ? 1 : scrollEnterProgress(projRelTop, vh * 0.9, vh * 0.52);
      projectsSection.style.setProperty('--rule-scale', headP.toFixed(4));

      if (projectsHeader) {
        if (headP >= 0.999) {
          projectsHeader.style.transform = 'none';
          projectsHeader.style.opacity = '1';
        } else {
          const yOffset = (1 - headP) * 56;
          const scale = 0.88 + headP * 0.12;
          projectsHeader.style.transform = `translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          projectsHeader.style.opacity = headP.toFixed(3);
        }
      }

      if (projectsWorkbench) {
        const wbDocTop = projectsWorkbench.offsetTop + projDocTop;
        const wbRelTop = wbDocTop - smoothScrollY;
        const wbP = nearBottom ? 1 : scrollEnterProgress(wbRelTop, vh * 0.92, vh * 0.48);

        if (wbP >= 0.999) {
          projectsWorkbench.style.transform = 'none';
          projectsWorkbench.style.opacity = '1';
        } else {
          const yOffset = (1 - wbP) * 72;
          const scale = 0.91 + wbP * 0.09;
          const rotX = (1 - wbP) * 14;
          projectsWorkbench.style.transform = `perspective(1200px) rotateX(${rotX.toFixed(2)}deg) translate3d(0, ${yOffset.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`;
          projectsWorkbench.style.opacity = wbP.toFixed(3);
        }
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

function initAboutBackground() {
  const container = document.getElementById('about-bg-container');
  if (!container) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText = 'width:100%;height:100%;display:block;';
  container.appendChild(canvas);

  let width = 0;
  let height = 0;
  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;
  let lastMouseX = -9999;
  let lastMouseY = -9999;
  let mouseVx = 0;
  let mouseVy = 0;
  let mouseSpeed = 0;
  let lastMoveTime = performance.now();

  const NODE_COUNT = 48;
  const nodes = [];

  function initNodes() {
    nodes.length = 0;
    for (let i = 0; i < NODE_COUNT; i++) {
      const angle = (i / NODE_COUNT) * Math.PI * 2 + (i % 3) * 0.4;
      const speed = 0.22 + (i % 4) * 0.07;
      nodes.push({
        x: Math.random() * (width || 1200),
        y: Math.random() * (height || 800),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        driftVx: Math.cos(angle) * speed,
        driftVy: Math.sin(angle) * speed,
        ambientSpeed: speed,
        r: 1.25 + (i % 3) * 0.45,
        lastDist: 9999,
        deflected: false,
        boost: 0,
      });
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (nodes.length === 0) {
      initNodes();
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'pointermove',
    (e) => {
      const now = performance.now();
      const dt = Math.max(1, now - lastMoveTime);
      if (lastMouseX !== -9999) {
        const rawVx = ((e.clientX - lastMouseX) / dt) * 16.6;
        const rawVy = ((e.clientY - lastMouseY) / dt) * 16.6;
        mouseVx = mouseVx * 0.35 + rawVx * 0.65;
        mouseVy = mouseVy * 0.35 + rawVy * 0.65;
        mouseSpeed = Math.hypot(mouseVx, mouseVy);
      }
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      lastMoveTime = now;
      mouseX = e.clientX;
      mouseY = e.clientY;
      mouseActive = true;
    },
    { passive: true },
  );
  window.addEventListener(
    'pointerleave',
    () => {
      mouseActive = false;
      mouseSpeed = 0;
      mouseVx = 0;
      mouseVy = 0;
      lastMouseX = -9999;
      lastMouseY = -9999;
    },
    { passive: true },
  );

  resize();

  function frame() {
    ctx.clearRect(0, 0, width, height);

    // If mouse stops moving, decay its speed quickly so gravity goes to zero
    if (performance.now() - lastMoveTime > 45) {
      mouseVx *= 0.86;
      mouseVy *= 0.86;
      mouseSpeed = Math.hypot(mouseVx, mouseVy);
    }

    // -------------------------------------------------------------------------
    // HYBRID: CONSTELLATION WEAVER + MOVEMENT-ONLY CELESTIAL GRAVITATIONAL WAKE
    // -------------------------------------------------------------------------
    // 1. Constellation Weaver: dynamic cyan lines attach from the cursor to nearby stars.
    // 2. Movement Gravity: gentle gravitational draw + slipstream wake active ONLY
    //    while the mouse is in motion. When mouse stops, gravity drops to zero,
    //    and stars smoothly relax to their calm ambient drift with zero clumping.
    const weaverRadius = 220;

    // 1. Update star physics (Movement-only gravity + serene drift relaxation)
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      if (mouseActive && mouseSpeed > 0.15) {
        const dx = mouseX - n.x;
        const dy = mouseY - n.y;
        const dist = Math.hypot(dx, dy);

        if (dist < weaverRadius) {
          const proximity = 1 - dist / weaverRadius;
          const nx = dx / (dist || 1);
          const ny = dy / (dist || 1);

          // Soft anti-clumping cushion: prevents stars from ever clustering or knotting
          if (dist < 65) {
            const push = (1 - dist / 65) * 0.45;
            n.vx -= nx * push;
            n.vy -= ny * push;
          } else {
            // Movement-Only Gravitational Inward Draw
            const pull = Math.pow(proximity, 1.2) * Math.min(mouseSpeed * 0.042, 0.45);
            n.vx += nx * pull;
            n.vy += ny * pull;

            // Celestial Slipstream: sweeps stars along cursor trajectory
            const wake = proximity * 0.028;
            n.vx += mouseVx * wake;
            n.vy += mouseVy * wake;
          }
        }
      }

      // Smooth relaxation: quickly eases velocities back to serene cosmic cruise
      // (Fast damping prevents slingshots, bouncing, or ping-ponging)
      n.vx += (n.driftVx - n.vx) * 0.055;
      n.vy += (n.driftVy - n.vy) * 0.055;

      // Integrate position
      n.x += n.vx;
      n.y += n.vy;

      // Wrap boundaries seamlessly with 35px margin
      const margin = 35;
      if (n.x < -margin) n.x = width + margin;
      if (n.x > width + margin) n.x = -margin;
      if (n.y < -margin) n.y = height + margin;
      if (n.y > height + margin) n.y = -margin;
    }

    // 2. Render Constellation Lines between Stars
    const maxLineDist = 135;
    ctx.lineWidth = 0.8;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < maxLineDist) {
          let alpha = (1 - d / maxLineDist) * 0.085;
          let isNearCursor = false;
          if (mouseActive) {
            const midX = (a.x + b.x) * 0.5;
            const midY = (a.y + b.y) * 0.5;
            const dMid = Math.hypot(midX - mouseX, midY - mouseY);
            if (dMid < weaverRadius) {
              isNearCursor = true;
              alpha = (1 - d / maxLineDist) * (0.1 + (1 - dMid / weaverRadius) * 0.22);
            }
          }
          ctx.strokeStyle = isNearCursor
            ? `rgba(45, 212, 191, ${alpha.toFixed(3)})`
            : `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // 3. Weave Constellation Lines from Cursor (Prime Star) to Nearby Stars
    if (mouseActive) {
      const nearNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        const d = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (d < weaverRadius) {
          nearNodes.push({ node: p, dist: d });
        }
      }

      // Sort by proximity and connect up to the closest 6 stars
      nearNodes.sort((a, b) => a.dist - b.dist);
      const connections = Math.min(nearNodes.length, 6);

      for (let i = 0; i < connections; i++) {
        const item = nearNodes[i];
        const lineAlpha = (1 - item.dist / weaverRadius) * 0.32;
        ctx.strokeStyle = `rgba(45, 212, 191, ${lineAlpha.toFixed(3)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(mouseX, mouseY);
        ctx.lineTo(item.node.x, item.node.y);
        ctx.stroke();
      }

      // Subtle Prime Star core at cursor
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.72)';
      ctx.fill();
    }

    // 4. Render Stars
    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      if (mouseActive) {
        const dToMouse = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (dToMouse < weaverRadius) {
          const proximity = 1 - dToMouse / weaverRadius;
          ctx.fillStyle = `rgba(45, 212, 191, ${(0.45 + proximity * 0.5).toFixed(3)})`;
        } else {
          ctx.fillStyle = 'rgba(148, 163, 184, 0.42)';
        }
      } else {
        ctx.fillStyle = 'rgba(148, 163, 184, 0.42)';
      }
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}
