/**
 * Animated PPO Neural Network Canvas (`#brain-canvas`).
 * Restores the original cascading forward-pass propagation:
 * `fireInput()` activates 1–2 input neurons and `propagate()` fans out weighted
 * pulses to all neurons in the next layer, cascading through the network when
 * `strength > 0.3`.
 */
export function initBrainCanvas(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Input (2), 3x Hidden (5, 5, 5), Output (2)
  const layers = [2, 5, 5, 5, 2];
  const nodes = [];
  const pulses = [];
  const nodeRadius = 4;

  let width = 0;
  let height = 0;

  function initNodes() {
    nodes.length = 0;
    const paddingX = width * 0.1;
    const usableWidth = width - paddingX * 2;
    const layerSpacing = layers.length > 1 ? usableWidth / (layers.length - 1) : 0;

    layers.forEach((count, layerIndex) => {
      const x = paddingX + layerSpacing * layerIndex;
      const layerNodes = [];
      const vSpacing = height / (count + 1);

      for (let i = 0; i < count; i++) {
        layerNodes.push({
          x,
          y: vSpacing * (i + 1),
          layer: layerIndex,
          active: 0,
        });
      }
      nodes.push(layerNodes);
    });
  }

  function resizeCanvas() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(280, rect.width);
    height = Math.max(180, rect.height);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initNodes();
  }

  function propagate(sourceNode) {
    const currentLayerIdx = sourceNode.layer;
    const nextLayerIdx = currentLayerIdx + 1;

    if (nextLayerIdx >= layers.length) return;

    const nextLayer = nodes[nextLayerIdx];

    // Fan out signal to ALL nodes in the next layer with varying synaptic weight
    nextLayer.forEach((targetNode) => {
      const weight = Math.random();

      pulses.push({
        x: sourceNode.x,
        y: sourceNode.y,
        startX: sourceNode.x,
        startY: sourceNode.y,
        targetX: targetNode.x,
        targetY: targetNode.y,
        targetNode,
        progress: 0,
        speed: 0.04 + Math.random() * 0.02,
        strength: weight,
      });
    });
  }

  function fireInput() {
    if (!nodes.length) return;
    const inputLayer = nodes[0];
    if (!inputLayer || !inputLayer.length) return;

    // Activate 1–2 random sensors in the input layer
    const activeCount = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < activeCount; i++) {
      const node = inputLayer[Math.floor(Math.random() * inputLayer.length)];
      node.active = 1;
      propagate(node);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);

    // 1. Draw static synaptic connections
    ctx.strokeStyle = 'rgba(0, 243, 255, 0.1)';
    ctx.lineWidth = 1;

    for (let l = 0; l < nodes.length - 1; l++) {
      const currentLayer = nodes[l];
      const nextLayer = nodes[l + 1];

      currentLayer.forEach((n1) => {
        nextLayer.forEach((n2) => {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y);
          ctx.lineTo(n2.x, n2.y);
          ctx.stroke();
        });
      });
    }

    // 2. Update & draw cascading pulses
    for (let i = pulses.length - 1; i >= 0; i--) {
      const p = pulses[i];
      p.progress += p.speed;

      const curX = p.startX + (p.targetX - p.startX) * p.progress;
      const curY = p.startY + (p.targetY - p.startY) * p.progress;

      const brightness = 0.2 + p.strength * 0.8;
      ctx.fillStyle = `rgba(0, 243, 255, ${brightness})`;

      ctx.beginPath();
      const size = 1.5 + p.strength * 1.5;
      ctx.arc(curX, curY, size, 0, Math.PI * 2);
      ctx.fill();

      if (p.progress >= 1) {
        p.targetNode.active = Math.min(1, p.targetNode.active + p.strength * 0.5);

        // Propagate further if signal strength exceeds firing threshold
        if (p.strength > 0.3) {
          propagate(p.targetNode);
        }

        pulses.splice(i, 1);
      }
    }

    // 3. Draw nodes & activation flash
    nodes.forEach((layer) => {
      layer.forEach((node) => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, nodeRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#0b0c15';
        ctx.fill();

        if (node.active > 0.01) {
          ctx.strokeStyle = `rgba(0, 243, 255, ${node.active})`;
          ctx.shadowBlur = 10 * node.active;
          ctx.shadowColor = '#00f3ff';
          ctx.fillStyle = `rgba(0, 243, 255, ${node.active})`;
          ctx.fill();

          node.active *= 0.9;
        } else {
          ctx.strokeStyle = 'rgba(0, 243, 255, 0.5)';
          ctx.shadowBlur = 0;
          ctx.fillStyle = '#0b0c15';
        }

        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });
    });

    if (isBrainVisible) {
      brainRafId = requestAnimationFrame(draw);
    } else {
      brainRafId = null;
    }
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });
  resizeCanvas();

  let isBrainVisible = true;
  let brainRafId = null;
  let brainIntervalId = null;

  function startBrainLoop() {
    if (!brainRafId && isBrainVisible) {
      brainRafId = requestAnimationFrame(draw);
    }
    if (!brainIntervalId && isBrainVisible) {
      fireInput();
      brainIntervalId = window.setInterval(() => {
        if (nodes.length > 0 && isBrainVisible) fireInput();
      }, 1200);
    }
  }

  function stopBrainLoop() {
    if (brainRafId) {
      cancelAnimationFrame(brainRafId);
      brainRafId = null;
    }
    if (brainIntervalId) {
      clearInterval(brainIntervalId);
      brainIntervalId = null;
    }
  }

  if ('IntersectionObserver' in window) {
    const brainObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isBrainVisible = entry.isIntersecting;
          if (isBrainVisible) {
            startBrainLoop();
          } else {
            stopBrainLoop();
          }
        });
      },
      { threshold: 0.05 },
    );
    brainObserver.observe(canvas);
  } else {
    startBrainLoop();
  }
}
