/**
 * Vector Flowfield Canvas (`#flowfield-canvas`).
 * Generates continuous, organic mathematical streamlines (latent space & aerodynamics),
 * with a calm reading zone on the left, subtle teal pulses, and smooth pointer deflection.
 */
export function initVectorFlowfield(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = 1;
  let isVisible = true;
  let rafId = null;

  const pointer = { x: -9999, y: -9999, vx: 0, vy: 0, lastX: 0, lastY: 0, active: false };

  // Lightweight 2D Perlin-like pseudo-random noise generator for silky laminar flow
  const perm = new Uint8Array(512);
  const pVals = new Uint8Array(256);
  for (let i = 0; i < 256; i++) pVals[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.sin(i * 12.9898 + 78.233) * 43758.5453 % 1 * (i + 1) + (i + 1)) % (i + 1);
    const tmp = pVals[i];
    pVals[i] = pVals[j];
    pVals[j] = tmp;
  }
  for (let i = 0; i < 512; i++) perm[i] = pVals[i & 255];

  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(t, a, b) { return a + t * (b - a); }
  function grad(hash, x, y) {
    const h = hash & 7;
    const u = h < 4 ? x : y;
    const v = h < 4 ? y : x;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  function noise2D(x, y) {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    const xf = x - Math.floor(x);
    const yf = y - Math.floor(y);
    const u = fade(xf);
    const v = fade(yf);
    const A = perm[X] + Y;
    const B = perm[X + 1] + Y;
    return lerp(v,
      lerp(u, grad(perm[A], xf, yf), grad(perm[B], xf - 1, yf)),
      lerp(u, grad(perm[A + 1], xf, yf - 1), grad(perm[B + 1], xf - 1, yf - 1))
    );
  }

  // Streamline particle structure
  const NUM_PARTICLES = Math.min(220, Math.max(120, Math.floor(window.innerWidth / 8)));
  const particles = [];

  function resetParticle(p) {
    // Bias particles toward the right 60% of viewport, leaving the left calm
    const minX = width * 0.28;
    p.x = minX + Math.random() * (width - minX + 60);
    p.y = Math.random() * height;
    p.prevX = p.x;
    p.prevY = p.y;
    p.speed = 0.85 + Math.random() * 1.1;
    p.life = Math.floor(140 + Math.random() * 260);
    p.age = 0;
    p.isTeal = Math.random() < 0.35;
    p.hasPulse = Math.random() < 0.15;
    p.pulseT = 0;
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    if (particles.length === 0) {
      for (let i = 0; i < NUM_PARTICLES; i++) {
        const p = {};
        resetParticle(p);
        p.age = Math.floor(Math.random() * p.life);
        particles.push(p);
      }
    }
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });

  window.addEventListener(
    'pointermove',
    (e) => {
      const x = e.clientX;
      const y = e.clientY;
      pointer.vx = (x - pointer.lastX) * 0.2;
      pointer.vy = (y - pointer.lastY) * 0.2;
      pointer.x = x;
      pointer.y = y;
      pointer.lastX = x;
      pointer.lastY = y;
      pointer.active = true;
    },
    { passive: true },
  );

  window.addEventListener('pointerleave', () => {
    pointer.active = false;
  });

  let time = 0;

  function render() {
    time += 0.0028;

    // Semi-transparent clearing for graceful streamline fading
    ctx.fillStyle = 'rgba(8, 12, 20, 0.055)';
    ctx.fillRect(0, 0, width, height);

    const scale = 0.0018;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.age++;

      if (p.age >= p.life || p.x > width + 40 || p.x < width * 0.28 || p.y < -40 || p.y > height + 40) {
        resetParticle(p);
      }

      // Sample curl noise angle
      const angle = noise2D(p.x * scale, p.y * scale + time) * Math.PI * 2.8;
      let vx = Math.cos(angle) * p.speed;
      let vy = Math.sin(angle) * p.speed * 0.7;

      // Pointer hydrodynamic deflection
      if (pointer.active) {
        const dx = p.x - pointer.x;
        const dy = p.y - pointer.y;
        const distSq = dx * dx + dy * dy;
        const radiusSq = 220 * 220;
        if (distSq < radiusSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / 220) * 1.8;
          vx += (dx / dist) * force + pointer.vx * 0.15;
          vy += (dy / dist) * force + pointer.vy * 0.15;
        }
      }

      const nextX = p.x + vx;
      const nextY = p.y + vy;

      // Calm zone calculation: fade out smoothly toward left edge so reading text has 100% clarity
      const leftBoundary = width * 0.38;
      const calmFactor = Math.max(0, Math.min(1, (p.x - leftBoundary) / (width * 0.22)));

      // Life fade in/out
      const lifeFactor = Math.sin((p.age / p.life) * Math.PI);
      const alpha = lifeFactor * calmFactor * (p.isTeal ? 0.32 : 0.16);

      if (alpha > 0.01) {
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nextX, nextY);
        ctx.strokeStyle = p.isTeal
          ? `rgba(45, 212, 191, ${alpha.toFixed(3)})`
          : `rgba(148, 163, 184, ${alpha.toFixed(3)})`;
        ctx.lineWidth = p.isTeal ? 1.4 : 1.0;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Traveling token pulse along streamline
        if (p.hasPulse && calmFactor > 0.3) {
          p.pulseT = (p.pulseT + 0.04) % 1;
          const px = p.x + (nextX - p.x) * p.pulseT;
          const py = p.y + (nextY - p.y) * p.pulseT;
          ctx.beginPath();
          ctx.arc(px, py, 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(94, 234, 212, ${(alpha * 2.2).toFixed(3)})`;
          ctx.fill();
        }
      }

      p.prevX = p.x;
      p.prevY = p.y;
      p.x = nextX;
      p.y = nextY;
    }

    if (isVisible && !isReducedMotion) {
      rafId = requestAnimationFrame(render);
    }
  }

  // Draw initial base frame immediately
  ctx.fillStyle = '#080c14';
  ctx.fillRect(0, 0, width, height);

  if (isReducedMotion) {
    // Render a single static atmospheric capture for reduced motion preference
    for (let step = 0; step < 60; step++) {
      render();
    }
    return;
  }

  // IntersectionObserver to pause loop when scrolled past hero
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible && !rafId) {
            rafId = requestAnimationFrame(render);
          } else if (!isVisible && rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
  } else {
    rafId = requestAnimationFrame(render);
  }
}
