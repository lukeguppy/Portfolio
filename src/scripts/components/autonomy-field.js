/**
 * Full-viewport Interactive Neural Embedding & Attention Field (`#autonomy-canvas`).
 * Subtle latent-space nodes drift across a dark coordinate field, forming dynamic
 * attention connections and responding smoothly to pointer proximity.
 */
export function initAutonomyField(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let w = 0;
  let h = 0;
  let dpr = 1;
  let nodes = [];
  let pulses = [];
  const pointer = { x: -9999, y: -9999, active: false };

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(26, Math.min(54, Math.floor((w * h) / 34000)));
    if (nodes.length === 0) {
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.36,
          vy: (Math.random() - 0.5) * 0.36,
          r: 1.4 + Math.random() * 1.4,
          phase: Math.random() * Math.PI * 2,
        });
      }
    }
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener(
    'mousemove',
    (e) => {
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
    },
    { passive: true },
  );
  window.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  resize();

  let tick = 0;
  function render() {
    tick += 0.015;
    ctx.clearRect(0, 0, w, h);

    // Update node positions
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      n.x += n.vx;
      n.y += n.vy;

      if (n.x < 0) n.x = w;
      if (n.x > w) n.x = 0;
      if (n.y < 0) n.y = h;
      if (n.y > h) n.y = 0;

      if (pointer.active) {
        const dx = pointer.x - n.x;
        const dy = pointer.y - n.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 48000 && d2 > 4) {
          const d = Math.sqrt(d2);
          n.x -= (dx / d) * 0.35;
          n.y -= (dy / d) * 0.35;
        }
      }
    }

    // Draw attention edges between nearby embedding nodes
    const maxDist = 175;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < maxDist * maxDist) {
          const dist = Math.sqrt(d2);
          const alpha = (1 - dist / maxDist) * 0.14;
          ctx.strokeStyle = `rgba(45, 212, 191, ${alpha.toFixed(3)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();

          if (Math.random() < 0.0005 && pulses.length < 10) {
            pulses.push({ a, b, t: 0 });
          }
        }
      }
    }

    // Draw travelling token / signal pulses along edges
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.t += 0.022;
      if (p.t >= 1) {
        pulses.splice(i, 1);
        continue;
      }
      const px = p.a.x + (p.b.x - p.a.x) * p.t;
      const py = p.a.y + (p.b.y - p.a.y) * p.t;
      ctx.fillStyle = 'rgba(45, 212, 191, 0.75)';
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw nodes
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const glow = 0.35 + 0.25 * Math.sin(tick + n.phase);
      ctx.fillStyle = `rgba(226, 232, 240, ${glow.toFixed(2)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }

    if (isVisible) {
      rafId = requestAnimationFrame(render);
    } else {
      rafId = null;
    }
  }

  let isVisible = true;
  let rafId = null;

  function startLoop() {
    if (!rafId && isVisible) {
      rafId = requestAnimationFrame(render);
    }
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisible = entry.isIntersecting;
          if (isVisible) {
            startLoop();
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { threshold: 0.05 },
    );
    observer.observe(canvas);
  } else {
    startLoop();
  }
}
