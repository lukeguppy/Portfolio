/**
 * Shared Constellation & Neural Network Background (`network-background.js`).
 * Renders an organic, quiet constellation network with gentle ambient drift,
 * node proximity lines, and a subtle celestial cursor gravitational wake.
 * Zero random flowfield lines, zero blurry neon spotlight blobs.
 */
export function initNetworkBackground(containerId = 'about-bg-container', options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  // Prevent multiple canvases inside the same container
  container.innerHTML = '';

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

  const NODE_COUNT = options.nodeCount || 48;
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
      });
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
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

  let animFrameId = null;

  function frame() {
    ctx.clearRect(0, 0, width, height);

    if (performance.now() - lastMoveTime > 45) {
      mouseVx *= 0.86;
      mouseVy *= 0.86;
      mouseSpeed = Math.hypot(mouseVx, mouseVy);
    }

    const weaverRadius = 220;

    // 1. Update node physics
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

          if (dist < 65) {
            const push = (1 - dist / 65) * 0.45;
            n.vx -= nx * push;
            n.vy -= ny * push;
          } else {
            const pull = Math.pow(proximity, 1.2) * Math.min(mouseSpeed * 0.042, 0.45);
            n.vx += nx * pull;
            n.vy += ny * pull;

            const wake = proximity * 0.028;
            n.vx += mouseVx * wake;
            n.vy += mouseVy * wake;
          }
        }
      }

      n.vx += (n.driftVx - n.vx) * 0.055;
      n.vy += (n.driftVy - n.vy) * 0.055;

      n.x += n.vx;
      n.y += n.vy;

      const margin = 35;
      if (n.x < -margin) n.x = width + margin;
      if (n.x > width + margin) n.x = -margin;
      if (n.y < -margin) n.y = height + margin;
      if (n.y > height + margin) n.y = -margin;
    }

    // 2. Render connecting lines between nodes
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

    // 3. Weave connections from cursor to nearby nodes
    if (mouseActive) {
      const nearNodes = [];
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        const d = Math.hypot(p.x - mouseX, p.y - mouseY);
        if (d < weaverRadius) {
          nearNodes.push({ node: p, dist: d });
        }
      }

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

      // Cursor prime core
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(45, 212, 191, 0.72)';
      ctx.fill();
    }

    // 4. Render nodes
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

    animFrameId = requestAnimationFrame(frame);
  }

  animFrameId = requestAnimationFrame(frame);

  return () => {
    if (animFrameId) cancelAnimationFrame(animFrameId);
  };
}
