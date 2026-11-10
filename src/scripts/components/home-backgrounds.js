/**
 * Home Screen Background Engines (`home-backgrounds.js`)
 * 
 * Bespoke, High-Craft Background Engines for Luke Guppy's AI Portfolio:
 * 1. createMcpBusBackground: Live Model Context Protocol (MCP) socket bus
 * 2. createGptTokenStreamBackground: Autoregressive Next-Token Sampling & Softmax Distribution
 * 3. createAttentionWebBackground: Multi-Head Bipartite Attention Rays (Iconic Transformer Fan)
 * 4. createEmbeddingSpaceBackground: Latent Vector Embeddings & Semantic Cosine Space
 * 5. createAttentionMatrixBackground: Serene, Toned-Down Transformer Attention Heatmap
 *
 * Rules:
 * - Zero AI slop: no purple neon glows, no falling matrix rain, no generic floating blobs.
 * - Restrained, cohesive color layering: Deep Obsidian (#060912), Deep Iris (#818cf8), Warm Solar Amber (#f59e0b).
 * - Whisper-quiet hover: never harsh, never aggressive, zero intrusive text/labels.
 * - Zero CPU waste: RAF pauses when hidden, clean destroy() teardown.
 */

/* ==========================================================================
   SHARED UTILITIES
   ========================================================================== */

function setupCanvas(container) {
  if (!container) return null;
  container.innerHTML = '';

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.style.cssText = 'width:100%;height:100%;display:block;position:absolute;inset:0;pointer-events:auto;';
  container.appendChild(canvas);

  let width = 0;
  let height = 0;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = container.clientWidth || window.innerWidth;
    height = container.clientHeight || window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  return { canvas, ctx, getWidth: () => width, getHeight: () => height, resize };
}

/* ==========================================================================
   1. LIVE MCP SOCKET BUS (MODEL CONTEXT PROTOCOL)
   ========================================================================== */

export function createMcpBusBackground(container, options = {}) {
  const setup = setupCanvas(container);
  if (!setup) return { destroy: () => {} };
  const { canvas, ctx } = setup;

  let animId = null;
  let isRunning = true;
  let lastTime = performance.now();
  let opacityMultiplier = options.subtlety ?? 1.0;

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  };
  const onMouseLeave = () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', setup.resize);

  const PROTOCOL_CALLS = [
    'tools/call: alphasights.search',
    'resources/read: expert_dossier:94',
    'context/stream: chunk_14',
    'prompts/get: brief_summary',
    'status: 200 OK [14ms]',
    'tools/call: doc_extract',
    'sse: stream_open',
    'transport: stdio/rpc',
    'tokens: 4.8k / 128k',
    'cache: HIT [2ms]'
  ];

  let conduits = [];
  let packets = [];
  let junctionNodes = [];

  function buildBusTopology() {
    const w = setup.getWidth();
    const h = setup.getHeight();
    conduits = [];
    packets = [];
    junctionNodes = [];

    const yTracks = [
      Math.round(h * 0.12),
      Math.round(h * 0.24),
      Math.round(h * 0.38),
      Math.round(h * 0.54),
      Math.round(h * 0.70),
      Math.round(h * 0.86),
    ];

    const xTracks = [
      Math.round(w * 0.05),
      Math.round(w * 0.16),
      Math.round(w * 0.44),
      Math.round(w * 0.56),
      Math.round(w * 0.84),
      Math.round(w * 0.95),
    ];

    yTracks.forEach((y, i) => {
      conduits.push({
        x1: 0, y1: y, x2: w, y2: y, axis: 'h', id: `BUS_H${i + 1}`,
        tag: i === 0 ? 'mcp://alphasights.gateway/v1' : ''
      });
    });

    xTracks.forEach((x, i) => {
      conduits.push({
        x1: x, y1: 0, x2: x, y2: h, axis: 'v', id: `BUS_V${i + 1}`,
        tag: ''
      });
    });

    xTracks.forEach(x => {
      yTracks.forEach(y => {
        junctionNodes.push({ x, y, pulse: Math.random() * Math.PI * 2 });
      });
    });

    const packetCount = Math.min(16, Math.max(8, Math.floor(w / 90)));
    for (let i = 0; i < packetCount; i++) {
      const conduit = conduits[Math.floor(Math.random() * conduits.length)];
      const isHorizontal = conduit.axis === 'h';
      const speed = (0.35 + Math.random() * 0.6) * (Math.random() > 0.5 ? 1 : -1);

      packets.push({
        conduit,
        pos: Math.random() * (isHorizontal ? w : h),
        speed,
        length: 14 + Math.random() * 18,
        color: i % 3 === 0 ? '#fbbf24' : (i % 2 === 0 ? '#34d399' : '#38bdf8'),
        label: PROTOCOL_CALLS[i % PROTOCOL_CALLS.length],
        showLabel: i % 4 === 0
      });
    }
  }

  buildBusTopology();

  function loop(now) {
    if (!isRunning) return;
    const delta = Math.min(40, now - lastTime);
    lastTime = now;

    const w = setup.getWidth();
    const h = setup.getHeight();

    ctx.clearRect(0, 0, w, h);

    // Conduits
    conduits.forEach(conduit => {
      let dist = 9999;
      if (mouseActive) {
        dist = conduit.axis === 'h' ? Math.abs(mouseY - conduit.y1) : Math.abs(mouseX - conduit.x1);
      }
      const isNear = dist < 50;
      const baseAlpha = 0.05 * opacityMultiplier;
      const alpha = isNear ? (baseAlpha + 0.12 * opacityMultiplier) : baseAlpha;

      ctx.beginPath();
      ctx.moveTo(conduit.x1, conduit.y1);
      ctx.lineTo(conduit.x2, conduit.y2);
      ctx.strokeStyle = isNear ? `rgba(56, 189, 248, ${alpha})` : `rgba(148, 163, 184, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Junctions
    junctionNodes.forEach(node => {
      ctx.fillStyle = `rgba(148, 163, 184, ${0.1 * opacityMultiplier})`;
      ctx.fillRect(node.x - 2, node.y - 2, 4, 4);
    });

    // Packets
    packets.forEach(packet => {
      const isHorizontal = packet.conduit.axis === 'h';
      const maxDim = isHorizontal ? w : h;
      packet.pos += packet.speed * (delta / 16);

      if (packet.speed > 0 && packet.pos > maxDim + 30) packet.pos = -30;
      else if (packet.speed < 0 && packet.pos < -30) packet.pos = maxDim + 30;

      const px = isHorizontal ? packet.pos : packet.conduit.x1;
      const py = isHorizontal ? packet.conduit.y1 : packet.pos;

      ctx.beginPath();
      if (isHorizontal) {
        ctx.moveTo(px - packet.length * Math.sign(packet.speed), py);
        ctx.lineTo(px, py);
      } else {
        ctx.moveTo(px, py - packet.length * Math.sign(packet.speed));
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = packet.color;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.7 * opacityMultiplier;
      ctx.stroke();
      ctx.globalAlpha = 1.0;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(px, py, 1.25, 0, Math.PI * 2);
      ctx.fill();
    });

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    setSubtlety: (val) => { opacityMultiplier = val; },
    destroy: () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', setup.resize);
      if (container) container.innerHTML = '';
    }
  };
}

/* ==========================================================================
   2. DEEP SUBTLE NEURAL NETWORK (ORGANIC CASCADING SYNAPSES)
   ========================================================================== */

export function createDeepNeuralNetworkBackground(container, options = {}) {
  const setup = setupCanvas(container);
  if (!setup) return { destroy: () => {} };
  const { canvas, ctx } = setup;

  let animId = null;
  let isRunning = true;
  let lastTime = performance.now();
  let opacityMultiplier = options.subtlety ?? 1.0;

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  };
  const onMouseLeave = () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
    layers.forEach((layer) => {
      layer.forEach((node) => {
        node.isHovered = false;
      });
    });
  };

  const onClick = (e) => {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    layers.forEach((layer) => {
      layer.forEach((node) => {
        const d = Math.hypot(cx - node.x, cy - node.y);
        if (d < 24) {
          spawnMouseCascade(node);
        }
      });
    });
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave, { passive: true });
  canvas.addEventListener('click', onClick);

  // Cohesive multi-spectral palette matching Luke's portfolio and AI tokens
  const PALETTES = [
    // Teal / Cyan — matches site accent tokens and "@ AlphaSights" (#2dd4bf)
    { id: 'teal',    r: 45,  g: 212, b: 191, hex: '#2dd4bf', core: '#a7f3d0' },
    // Warm Amber — synaptic fire (#f59e0b)
    { id: 'amber',   r: 245, g: 158, b: 11,  hex: '#f59e0b', core: '#fef08a' },
    // Luminous Gold — high-potency transmission (#fbbf24)
    { id: 'gold',    r: 251, g: 191, b: 36,  hex: '#fbbf24', core: '#fef9c3' },
    // Electric Sky — neural flow (#38bdf8)
    { id: 'sky',     r: 56,  g: 189, b: 248, hex: '#38bdf8', core: '#e0f2fe' },
    // Soft Iris Violet — deep attention heads (#818cf8)
    { id: 'iris',    r: 129, g: 140, b: 248, hex: '#818cf8', core: '#ede9fe' },
    // Rose / Coral — peak activation flare (#f43f5e)
    { id: 'coral',   r: 244, g: 63,  b: 94,  hex: '#f43f5e', core: '#ffe4e6' },
    // Fresh Emerald — positive gradient update (#10b981)
    { id: 'emerald', r: 16,  g: 185, b: 129, hex: '#10b981', core: '#d1fae5' }
  ];

  function pickPalette() {
    // Curated distribution: signature teal & amber lead, with sky, iris, gold, coral accents
    const rand = Math.random();
    if (rand < 0.32) return PALETTES[0]; // teal
    if (rand < 0.60) return PALETTES[1]; // amber
    if (rand < 0.74) return PALETTES[2]; // gold
    if (rand < 0.85) return PALETTES[3]; // sky
    if (rand < 0.93) return PALETTES[4]; // iris
    if (rand < 0.97) return PALETTES[5]; // coral
    return PALETTES[6]; // emerald
  }

  const HOP_DURATION = 1250; // ms per layer transition (serene, calm, deliberate tempo)

  let layers = [];
  let connections = [];
  let outputBeams = [];
  let passes = [];
  let nextPassId = 0;
  let timeUntilNextAmbientPass = 350; // Prompt start on load

  function buildDeepNetwork() {
    const w = setup.getWidth();
    const h = setup.getHeight();
    layers = [];
    connections = [];
    outputBeams = [];

    // 4:6:8:8:8:6:4 architecture (7 layers)
    const isMobile = w < 768;
    const baseNodePattern = isMobile ? [4, 5, 6, 6, 6, 5, 4] : [4, 6, 8, 8, 8, 6, 4];
    const numLayers = baseNodePattern.length;
    const paddingX = Math.max(45, w * 0.075);
    const usableW = w - paddingX * 2;
    const layerSpacing = usableW / (numLayers - 1);

    // Deep learning layer progression: narrow inputs, expanding hidden, converging output
    const maxCount = Math.max(...baseNodePattern);
    const minCount = Math.min(...baseNodePattern);

    for (let l = 0; l < numLayers; l++) {
      const count = baseNodePattern[l];
      const layerNodes = [];

      // Organic layer contour: thinner 4-node layers grouped tightly in center (36% height), 8-node layers span 78% height
      const normThickness = (count - minCount) / (maxCount - minCount || 1);
      const layerSpan = h * (0.36 + normThickness * 0.42);
      const startY = (h - layerSpan) / 2;
      const vSpacing = count > 1 ? layerSpan / (count - 1) : 0;

      for (let i = 0; i < count; i++) {
        // Slight organic vertical jitter (+- 2.5px) for natural feel
        const jitter = Math.sin(l * 2.8 + i * 1.9) * 2.5;
        layerNodes.push({
          x: paddingX + layerSpacing * l,
          y: startY + vSpacing * i + jitter,
          normY: count > 1 ? i / (count - 1) : 0.5,
          layer: l,
          index: i,
          active: 0,
          isHovered: false,
          palette: PALETTES[1],
          targetSynapses: [],
          incomingSynapses: []
        });
      }
      layers.push(layerNodes);
    }

    // Inter-layer connectivity with genuine synaptic weight variance
    for (let l = 0; l < layers.length - 1; l++) {
      const curLayer = layers[l];
      const nextLayer = layers[l + 1];

      curLayer.forEach((n1) => {
        const sortedByDist = [...nextLayer].sort(
          (a, b) => Math.abs(a.normY - n1.normY) - Math.abs(b.normY - n1.normY)
        );

        // Pick 3 to 4 diverse targets: level, upward, downward, and cross
        const targets = new Set();
        targets.add(sortedByDist[0]); // Direct level

        const upTarget = nextLayer.find((n2) => n2.normY < n1.normY - 0.08);
        if (upTarget) targets.add(upTarget);

        const downTarget = nextLayer.find((n2) => n2.normY > n1.normY + 0.08);
        if (downTarget) targets.add(downTarget);

        const maxTargets = Math.min(nextLayer.length, Math.max(3, Math.floor(nextLayer.length * 0.55)));
        while (targets.size < maxTargets) {
          const rand = nextLayer[Math.floor(Math.random() * nextLayer.length)];
          targets.add(rand);
        }

        targets.forEach((n2) => {
          // Weight distribution: strong (w > 0.70), medium (0.40-0.70), weak (< 0.40)
          const weight = Math.min(1.0, Math.max(0.18, 0.20 + Math.random() * 0.80));
          const synapse = {
            from: n1,
            to: n2,
            weight,
            isStrong: weight > 0.70,
            isWeak: weight < 0.40,
            lastFiredTime: 0
          };

          n1.targetSynapses.push(synapse);
          n2.incomingSynapses.push(synapse);
          connections.push(synapse);
        });
      });
    }

    // Guarantee that every node in hidden/output layers has an incoming synapse
    for (let l = 1; l < layers.length; l++) {
      const prevLayer = layers[l - 1];
      const curLayer = layers[l];
      curLayer.forEach((node) => {
        if (node.incomingSynapses.length === 0) {
          let nearest = prevLayer[0];
          let minDist = 9999;
          prevLayer.forEach((pn) => {
            const d = Math.abs(pn.y - node.y);
            if (d < minDist) { minDist = d; nearest = pn; }
          });
          const synapse = {
            from: nearest,
            to: node,
            weight: 0.55,
            isStrong: false,
            isWeak: false,
            lastFiredTime: 0
          };
          nearest.targetSynapses.push(synapse);
          node.incomingSynapses.push(synapse);
          connections.push(synapse);
        }
      });
    }
  }

  buildDeepNetwork();

  const handleResize = () => {
    setup.resize();
    buildDeepNetwork();
    passes = [];
    outputBeams = [];
    timeUntilNextAmbientPass = 300;
  };
  window.addEventListener('resize', handleResize);

  // Spawn an ambient forward pass: activates 2-3 input nodes fanning out into a rich, braided cascade
  function spawnAmbientPass() {
    if (!layers.length || !layers[0].length) return;

    const inputLayer = layers[0];
    // Activate 2 or 3 input neurons (broad multi-pathway origin)
    const count = Math.random() < 0.40 ? 3 : 2;
    const shuffled = [...inputLayer].sort(() => Math.random() - 0.5);
    const activeNodes = shuffled.slice(0, count);

    const passPalette = pickPalette();
    const hopPulses = [];

    activeNodes.forEach((node, nodeIdx) => {
      node.active = 1.0;
      node.palette = passPalette;

      const sortedSyns = [...node.targetSynapses].sort((a, b) => b.weight - a.weight);
      // Fan out across 2 to 3 outgoing synapses per node
      const numSyns = (sortedSyns.length >= 3 && Math.random() < 0.45) ? 3 : 2;

      for (let s = 0; s < Math.min(numSyns, sortedSyns.length); s++) {
        const syn = sortedSyns[s];
        const isHero = nodeIdx === 0 && s === 0;
        const isSecondary = s === 1;

        let op, pal;
        if (isHero) {
          op = 0.72 + Math.random() * 0.22; // 0.72 - 0.94 (luminous hero lead)
          pal = passPalette;
        } else if (isSecondary) {
          op = 0.32 + Math.random() * 0.20; // 0.32 - 0.52 (secondary branch)
          pal = Math.random() < 0.60 ? passPalette : PALETTES[1];
        } else {
          op = 0.12 + Math.random() * 0.14; // 0.12 - 0.26 (subtle whisper filament)
          pal = Math.random() < 0.50 ? passPalette : PALETTES[0];
        }

        hopPulses.push({
          from: node,
          to: syn.to,
          synapse: syn,
          opacity: op,
          palette: pal,
          isHero,
          startX: node.x,
          startY: node.y,
          targetX: syn.to.x,
          targetY: syn.to.y
        });
      }
    });

    passes.push({
      id: nextPassId++,
      layer: 0,
      hopStartTime: performance.now(),
      pulses: hopPulses,
      palette: passPalette,
      isMouse: false,
      finished: false
    });
  }

  // Interactive mouse probe: hover or drag across any node sparks forward propagation
  function spawnMouseCascade(startNode) {
    if (!layers.length) return;

    if (startNode.layer >= layers.length - 1) {
      startNode.active = 1.0;
      startNode.palette = pickPalette();
      outputBeams.push({
        x: startNode.x,
        y: startNode.y,
        palette: startNode.palette,
        progress: 0,
        speed: 0.007 + Math.random() * 0.004,
        length: 45 + Math.random() * 35,
        opacity: 0.85,
        alpha: 0.65 * opacityMultiplier
      });
      return;
    }

    // Yield ambient passes so user interaction takes focus without clutter or clashing
    passes = passes.filter((p) => p.isMouse);

    const mousePalette = Math.random() < 0.5 ? PALETTES[0] : PALETTES[1];
    startNode.active = 1.0;
    startNode.palette = mousePalette;

    const sortedSyns = [...startNode.targetSynapses].sort((a, b) => b.weight - a.weight);
    const numSyns = Math.min(sortedSyns.length, 2 + (Math.random() < 0.4 ? 1 : 0));
    const hopPulses = [];

    for (let s = 0; s < numSyns; s++) {
      const syn = sortedSyns[s];
      const isHero = s === 0;
      const op = isHero ? (0.75 + Math.random() * 0.20) : (0.28 + Math.random() * 0.25);
      hopPulses.push({
        from: startNode,
        to: syn.to,
        synapse: syn,
        opacity: op,
        palette: mousePalette,
        isHero,
        startX: startNode.x,
        startY: startNode.y,
        targetX: syn.to.x,
        targetY: syn.to.y
      });
    }

    passes.push({
      id: nextPassId++,
      layer: startNode.layer,
      hopStartTime: performance.now(),
      pulses: hopPulses,
      palette: mousePalette,
      isMouse: true,
      finished: false
    });
  }

  function loop(now) {
    if (!isRunning) return;
    const delta = Math.min(40, now - lastTime);
    lastTime = now;

    const w = setup.getWidth();
    const h = setup.getHeight();

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Synaptic Substrate with Weight Variance (Quiet, architectural blueprint)
    connections.forEach((conn) => {
      ctx.beginPath();
      ctx.moveTo(conn.from.x, conn.from.y);
      ctx.lineTo(conn.to.x, conn.to.y);

      let alpha, strokeW, strokeColor;
      if (conn.isStrong) {
        alpha = (0.045 + (conn.weight - 0.70) * 0.06) * opacityMultiplier;
        strokeW = 0.8;
        strokeColor = `rgba(245, 158, 11, ${alpha})`;
      } else if (conn.isWeak) {
        alpha = 0.018 * opacityMultiplier;
        strokeW = 0.45;
        strokeColor = `rgba(148, 163, 184, ${alpha})`;
      } else {
        alpha = 0.032 * opacityMultiplier;
        strokeW = 0.6;
        strokeColor = `rgba(148, 163, 184, ${alpha})`;
      }

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeW;
      ctx.stroke();
    });

    // 2. Animate Synchronized Forward Passes (Fluid, zero dwell pause, multi-pathway)
    passes.forEach((pass) => {
      const elapsed = now - pass.hopStartTime;
      const progress = Math.min(1.0, elapsed / HOP_DURATION);

      // Draw all pulses for this hop (100% synchronized arrival)
      pass.pulses.forEach((p) => {
        const curX = p.startX + (p.targetX - p.startX) * progress;
        const curY = p.startY + (p.targetY - p.startY) * progress;

        // Soft wire illumination behind the pulse
        ctx.beginPath();
        ctx.moveTo(p.startX, p.startY);
        ctx.lineTo(curX, curY);
        const trailAlpha = (0.03 + p.opacity * 0.32) * opacityMultiplier;
        ctx.strokeStyle = `rgba(${p.palette.r}, ${p.palette.g}, ${p.palette.b}, ${trailAlpha})`;
        ctx.lineWidth = 0.6 + p.opacity * 1.4;
        ctx.stroke();

        // Traveling pulse bead halo (prominent signals > 0.45)
        if (p.opacity > 0.45) {
          ctx.fillStyle = `rgba(${p.palette.r}, ${p.palette.g}, ${p.palette.b}, ${0.20 * opacityMultiplier})`;
          ctx.beginPath();
          ctx.arc(curX, curY, 2.5 + p.opacity * 3.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Pulse bead body
        ctx.fillStyle = `rgba(${p.palette.r}, ${p.palette.g}, ${p.palette.b}, ${Math.min(1.0, 0.35 + p.opacity * 0.65)})`;
        ctx.beginPath();
        ctx.arc(curX, curY, 1.0 + p.opacity * 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner glowing core
        if (p.opacity > 0.55) {
          ctx.fillStyle = p.palette.core;
          ctx.beginPath();
          ctx.arc(curX, curY, (1.0 + p.opacity * 1.5) * 0.45, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // Synchronized Arrival & Instant Continuous Propagation (Zero Dwell Hitch!)
      if (elapsed >= HOP_DURATION) {
        // Destination nodes ignite immediately
        pass.pulses.forEach((p) => {
          p.to.active = Math.max(p.to.active, p.opacity);
          p.to.palette = p.palette;
        });

        if (pass.layer < layers.length - 2) {
          // Advance forward to next layer in the exact same frame — continuous momentum
          const nextLayer = pass.layer + 1;
          const nextActiveNodes = [...new Set(pass.pulses.map((p) => p.to))];
          const nextHopPulses = [];

          nextActiveNodes.forEach((node, nIdx) => {
            const sortedSyns = [...node.targetSynapses].sort((a, b) => b.weight - a.weight);
            // Each active node fans out across 2 synapses (or 1 for peripheral branches)
            const numSyns = (sortedSyns.length > 1 && (nIdx === 0 || Math.random() < 0.60)) ? 2 : 1;

            for (let s = 0; s < Math.min(numSyns, sortedSyns.length); s++) {
              const syn = sortedSyns[s];
              const isHero = nIdx === 0 && s === 0;
              let op, pal;
              if (isHero) {
                op = 0.68 + Math.random() * 0.25;
                pal = pass.palette;
              } else if (s === 0) {
                op = 0.30 + Math.random() * 0.22;
                pal = Math.random() < 0.60 ? pass.palette : PALETTES[1];
              } else {
                op = 0.12 + Math.random() * 0.15;
                pal = Math.random() < 0.50 ? pass.palette : PALETTES[0];
              }

              nextHopPulses.push({
                from: node,
                to: syn.to,
                synapse: syn,
                opacity: op,
                palette: pal,
                isHero,
                startX: node.x,
                startY: node.y,
                targetX: syn.to.x,
                targetY: syn.to.y
              });
            }
          });

          pass.layer = nextLayer;
          pass.hopStartTime = now;
          pass.pulses = nextHopPulses;
        } else {
          // Output layer reached: emit radiant inference prediction rays (slower, serene glide)
          pass.pulses.forEach((p) => {
            outputBeams.push({
              x: p.to.x,
              y: p.to.y,
              palette: p.palette,
              progress: 0,
              speed: 0.007 + Math.random() * 0.004,
              length: 42 + p.opacity * 50,
              opacity: p.opacity,
              alpha: (0.18 + p.opacity * 0.45) * opacityMultiplier
            });
          });

          pass.finished = true;
          // Organic breath after thought concludes before next wave can begin at Layer 0 (prevents overlapping clashes!)
          timeUntilNextAmbientPass = 800 + Math.random() * 450;
        }
      }
    });

    // Remove completed passes
    passes = passes.filter((p) => !p.finished);

    // 3. Ambient Scheduler: Only triggers when NO pass is in flight (completely prevents overlapping layer clashes!)
    if (passes.length === 0) {
      timeUntilNextAmbientPass -= delta;
      if (timeUntilNextAmbientPass <= 0) {
        spawnAmbientPass();
      }
    }

    // 4. Draw Output Inference Rays
    for (let b = outputBeams.length - 1; b >= 0; b--) {
      const beam = outputBeams[b];
      beam.progress += beam.speed * (delta / 16);
      const curX = beam.x + beam.progress * beam.length;
      const fade = Math.max(0, 1 - beam.progress);

      ctx.beginPath();
      ctx.moveTo(beam.x, beam.y);
      ctx.lineTo(curX, beam.y + Math.sin(beam.progress * 3.5) * 1.5);
      ctx.strokeStyle = `rgba(${beam.palette.r}, ${beam.palette.g}, ${beam.palette.b}, ${beam.alpha * fade})`;
      ctx.lineWidth = 0.7 + beam.opacity * 1.0;
      ctx.stroke();

      // Radiant tip
      ctx.fillStyle = `rgba(${beam.palette.r}, ${beam.palette.g}, ${beam.palette.b}, ${fade * 0.75})`;
      ctx.beginPath();
      ctx.arc(curX, beam.y, 1.0 + beam.opacity * 0.7, 0, Math.PI * 2);
      ctx.fill();

      if (beam.progress >= 1) {
        outputBeams.splice(b, 1);
      }
    }

    // 5. Draw Neurons & Check Mouse Probe
    const NODE_RADIUS = 2.8;

    layers.forEach((layer) => {
      layer.forEach((node) => {
        // Interactive mouse probe: fires EXACTLY ONCE on hover entrance; never spams while hovering
        if (mouseActive) {
          const d = Math.hypot(mouseX - node.x, mouseY - node.y);
          const HOVER_ENTER_RADIUS = 24;
          const HOVER_EXIT_RADIUS = 36; // Hysteresis buffer prevents jitter re-triggering

          if (d <= HOVER_ENTER_RADIUS) {
            if (!node.isHovered) {
              node.isHovered = true;
              spawnMouseCascade(node);
            }
          } else if (d > HOVER_EXIT_RADIUS) {
            node.isHovered = false;
          }
        } else {
          node.isHovered = false;
        }

        const isFiring = node.active > 0.02;
        const pal = node.palette || PALETTES[1];

        // Activation Halo Glow - ONLY for meaningful activations (> 0.15)
        if (node.active > 0.15) {
          const auraRad = NODE_RADIUS + node.active * 6.5;
          const auraGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, auraRad);
          auraGrad.addColorStop(0, `rgba(${pal.r}, ${pal.g}, ${pal.b}, ${node.active * 0.30 * opacityMultiplier})`);
          auraGrad.addColorStop(1, `rgba(${pal.r}, ${pal.g}, ${pal.b}, 0)`);
          ctx.fillStyle = auraGrad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, auraRad, 0, Math.PI * 2);
          ctx.fill();
        }

        if (isFiring) {
          // Smooth fade-out (~1100ms, matching slower tempo)
          node.active *= Math.pow(0.975, delta / 16);
        }

        // Neuron Body (Clearly defined circle)
        ctx.beginPath();
        ctx.arc(node.x, node.y, NODE_RADIUS, 0, Math.PI * 2);

        if (node.active > 0.25) {
          ctx.fillStyle = pal.core; // Bright glowing tinted core
          ctx.strokeStyle = `rgba(${pal.r}, ${pal.g}, ${pal.b}, ${Math.min(1.0, 0.35 + node.active * 0.6)})`;
        } else {
          ctx.fillStyle = '#080c16';
          ctx.strokeStyle = `rgba(148, 163, 184, ${0.30 * opacityMultiplier})`;
        }

        ctx.lineWidth = 1.0;
        ctx.fill();
        ctx.stroke();
      });
    });

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    setSubtlety: (val) => { opacityMultiplier = val; },
    destroy: () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      if (container) container.innerHTML = '';
    }
  };
}

/* ==========================================================================
   5. SERENE ATTENTION MATRIX (CLEAN, REFINED & TONED-DOWN HOVER)
   ========================================================================== */

export function createAttentionMatrixBackground(container, options = {}) {
  const setup = setupCanvas(container);
  if (!setup) return { destroy: () => {} };
  const { canvas, ctx } = setup;

  let animId = null;
  let isRunning = true;
  let lastTime = performance.now();
  let opacityMultiplier = options.subtlety ?? 1.0;

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  };
  const onMouseLeave = () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', setup.resize);

  const CELL_SIZE = 36;

  function loop(now) {
    if (!isRunning) return;
    const delta = Math.min(40, now - lastTime);
    lastTime = now;

    const w = setup.getWidth();
    const h = setup.getHeight();

    ctx.clearRect(0, 0, w, h);

    const cols = Math.ceil(w / CELL_SIZE);
    const rows = Math.ceil(h / CELL_SIZE);
    const timeSec = now * 0.0005; // Calm, meditative drift

    // Hairline Matrix Grid (Deep slate ground, zero text)
    ctx.strokeStyle = `rgba(148, 163, 184, ${0.04 * opacityMultiplier})`;
    ctx.lineWidth = 0.75;
    ctx.beginPath();

    for (let c = 0; c <= cols; c++) {
      const x = c * CELL_SIZE;
      ctx.moveTo(x, 0); ctx.lineTo(x, h);
    }
    for (let r = 0; r <= rows; r++) {
      const y = r * CELL_SIZE;
      ctx.moveTo(0, y); ctx.lineTo(w, y);
    }
    ctx.stroke();

    // Soft Harmonic Attention Weights
    const hoverCol = mouseActive ? Math.floor(mouseX / CELL_SIZE) : -999;
    const hoverRow = mouseActive ? Math.floor(mouseY / CELL_SIZE) : -999;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        const wave1 = Math.sin(c * 0.16 - timeSec * 0.9 + r * 0.12);
        const wave2 = Math.cos(r * 0.20 + timeSec * 0.6 - c * 0.10);
        const rawScore = (wave1 + wave2) * 0.5;

        // Very gentle mouse proximity boost (whisper-quiet)
        let mouseBoost = 0;
        if (mouseActive) {
          const dist = Math.hypot(c - hoverCol, r - hoverRow);
          if (dist < 3) mouseBoost = (1 - dist / 3) * 0.18;
        }

        const totalScore = rawScore + mouseBoost;

        if (totalScore > 0.38) {
          const t = Math.min(1, (totalScore - 0.38) / 0.62);
          const cellX = c * CELL_SIZE + 1;
          const cellY = r * CELL_SIZE + 1;
          const cellW = CELL_SIZE - 2;
          const cellH = CELL_SIZE - 2;

          let rVal = 129, gVal = 140, bVal = 248; // Deep Iris
          let alpha = (0.05 + t * 0.08) * opacityMultiplier;

          if (t > 0.7) {
            // Warm Amber peak
            const localT = (t - 0.7) / 0.3;
            rVal = Math.round(129 + localT * (245 - 129));
            gVal = Math.round(140 + localT * (158 - 140));
            bVal = Math.round(248 + localT * (11 - 248));
            alpha = (0.12 + localT * 0.08) * opacityMultiplier;
          }

          ctx.fillStyle = `rgba(${rVal}, ${gVal}, ${bVal}, ${alpha})`;
          ctx.fillRect(cellX, cellY, cellW, cellH);
        }
      }
    }

    // Toned-Down Hover: Delicate Hairline Outline on Active Cell Only (No Full Column, No Aggressive Glow)
    if (mouseActive && hoverCol >= 0 && hoverCol < cols && hoverRow >= 0 && hoverRow < rows) {
      const fx = hoverCol * CELL_SIZE;
      const fy = hoverRow * CELL_SIZE;

      ctx.strokeStyle = `rgba(245, 158, 11, ${0.4 * opacityMultiplier})`;
      ctx.lineWidth = 1;
      ctx.strokeRect(fx + 1, fy + 1, CELL_SIZE - 2, CELL_SIZE - 2);
    }

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    setSubtlety: (val) => { opacityMultiplier = val; },
    destroy: () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', setup.resize);
      if (container) container.innerHTML = '';
    }
  };
}

/* ==========================================================================
   6. TRANSFORMER SELF-ATTENTION HEADS (OPTION 3: MODERN LLM ARCHITECTURE)
   ========================================================================== */

export function createTransformerAttentionBackground(container, options = {}) {
  const setup = setupCanvas(container);
  if (!setup) return { destroy: () => {} };
  const { canvas, ctx } = setup;

  let animId = null;
  let isRunning = true;
  let lastTime = performance.now();
  let opacityMultiplier = options.subtlety ?? 1.0;

  let mouseX = -9999;
  let mouseY = -9999;
  let mouseActive = false;

  const onMouseMove = (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
    mouseActive = true;
  };
  const onMouseLeave = () => {
    mouseActive = false;
    mouseX = -9999;
    mouseY = -9999;
  };

  window.addEventListener('mousemove', onMouseMove, { passive: true });
  document.addEventListener('mouseleave', onMouseLeave, { passive: true });
  window.addEventListener('resize', setup.resize);

  // Multi-Head Attention Palettes
  const ATTENTION_HEADS = [
    { name: 'Syntactic Head', rgb: [45, 212, 191],  hex: '#2dd4bf', core: '#a7f3d0' }, // Teal / Cyan (Primary)
    { name: 'Semantic Head',  rgb: [245, 158, 11],  hex: '#f59e0b', core: '#fef08a' }, // Warm Amber
    { name: 'Context Head',   rgb: [129, 140, 248], hex: '#818cf8', core: '#e0e7ff' }, // Iris Violet
    { name: 'Entity Head',    rgb: [56, 189, 248],  hex: '#38bdf8', core: '#bae6fd' }, // Sky Cyan
  ];

  let tokens = [];
  let activeAttentionCycle = null;
  let nextAttentionCountdown = 500; // Trigger initial attention head quickly
  let headCycleIndex = 0;

  function buildTokenMatrix() {
    const w = setup.getWidth();
    const h = setup.getHeight();
    tokens = [];

    // Context sequence grid: 6 columns, 5 rows
    const isMobile = w < 768;
    const cols = isMobile ? 4 : 6;
    const rows = isMobile ? 4 : 5;

    const padX = Math.max(50, w * 0.08);
    const padY = Math.max(60, h * 0.12);
    const usableW = w - padX * 2;
    const usableH = h - padY * 2;
    const colSpacing = cols > 1 ? usableW / (cols - 1) : 0;
    const rowSpacing = rows > 1 ? usableH / (rows - 1) : 0;

    let idx = 0;
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Slight organic positional jitter (+- 4px) for architectural naturalness
        const jitterX = Math.sin(c * 1.7 + r * 2.3) * 4.0;
        const jitterY = Math.cos(c * 2.1 + r * 1.5) * 4.0;

        tokens.push({
          index: idx++,
          col: c,
          row: r,
          x: padX + colSpacing * c + jitterX,
          y: padY + rowSpacing * r + jitterY,
          active: 0,
          isQuery: false,
          isKey: false,
          palette: ATTENTION_HEADS[0]
        });
      }
    }
  }

  buildTokenMatrix();

  // Launch a generative self-attention computation between Query token and attended Key tokens
  function fireAttentionHead(customQueryToken = null) {
    if (!tokens.length) return;

    const head = ATTENTION_HEADS[headCycleIndex % ATTENTION_HEADS.length];
    headCycleIndex++;

    const queryToken = customQueryToken || tokens[Math.floor(Math.random() * tokens.length)];
    queryToken.active = 1.0;
    queryToken.isQuery = true;
    queryToken.palette = head;

    // Pick 3 to 4 attended Key tokens based on simulated attention weights
    const candidates = tokens.filter(t => t !== queryToken);
    // Sort candidates by combined proximity and contextual resonance
    const scored = candidates.map(t => {
      const dist = Math.hypot(t.x - queryToken.x, t.y - queryToken.y);
      const score = Math.max(0.1, 1 - (dist / Math.max(setup.getWidth(), 800))) * (0.4 + Math.random() * 0.6);
      return { token: t, score };
    }).sort((a, b) => b.score - a.score);

    const attendedKeys = scored.slice(0, 3 + Math.floor(Math.random() * 2));
    // Softmax-like normalized attention weights
    const totalScore = attendedKeys.reduce((acc, k) => acc + k.score, 0);
    const attentionRays = attendedKeys.map((k, kIdx) => {
      const normWeight = k.score / totalScore;
      k.token.active = Math.max(k.token.active, normWeight * 0.85);
      k.token.isKey = true;
      k.token.palette = head;

      return {
        keyToken: k.token,
        weight: normWeight,
        isPrimary: kIdx === 0,
        // Alpha and width scaled strictly by attention weight
        alpha: (0.12 + normWeight * 0.55) * opacityMultiplier,
        lineWidth: 0.6 + normWeight * 1.6,
        // Traveling Value packet progress (0 to 1)
        vectorProgress: 0,
        vectorSpeed: 0.016 + Math.random() * 0.006
      };
    });

    activeAttentionCycle = {
      head,
      queryToken,
      attentionRays,
      startTime: performance.now(),
      duration: 2200 // 2.2 seconds complete attention cycle
    };
  }

  function loop(now) {
    if (!isRunning) return;
    const delta = Math.min(40, now - lastTime);
    lastTime = now;

    const w = setup.getWidth();
    const h = setup.getHeight();

    ctx.clearRect(0, 0, w, h);

    // 1. Draw Latent Coordinate Substrate (Subtle Contextual Grid & Token Connectors)
    ctx.strokeStyle = `rgba(148, 163, 184, ${0.035 * opacityMultiplier})`;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < tokens.length; i++) {
      const t1 = tokens[i];
      // Connect to adjacent token in same column
      const downNeighbor = tokens.find(t => t.col === t1.col && t.row === t1.row + 1);
      if (downNeighbor) {
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(downNeighbor.x, downNeighbor.y);
        ctx.stroke();
      }
      // Connect to adjacent token in same row
      const rightNeighbor = tokens.find(t => t.row === t1.row && t.col === t1.col + 1);
      if (rightNeighbor) {
        ctx.beginPath();
        ctx.moveTo(t1.x, t1.y);
        ctx.lineTo(rightNeighbor.x, rightNeighbor.y);
        ctx.stroke();
      }
    }

    // 2. Animate and Draw Active Attention Head Cycle
    if (activeAttentionCycle) {
      const elapsed = now - activeAttentionCycle.startTime;
      const progress = Math.min(1.0, elapsed / activeAttentionCycle.duration);
      const head = activeAttentionCycle.head;
      const qToken = activeAttentionCycle.queryToken;

      // Draw attention beams (laser-crisp query-to-key connections)
      activeAttentionCycle.attentionRays.forEach((ray) => {
        const kToken = ray.keyToken;

        // Dynamic fade: fade in fast (0..0.2), hold (0.2..0.7), smooth ease-out fade (0.7..1.0)
        let rayFade = 1.0;
        if (progress < 0.2) rayFade = progress / 0.2;
        else if (progress > 0.7) rayFade = (1.0 - progress) / 0.3;

        // Attention beam
        ctx.beginPath();
        ctx.moveTo(qToken.x, qToken.y);
        ctx.lineTo(kToken.x, kToken.y);
        ctx.strokeStyle = `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, ${ray.alpha * rayFade})`;
        ctx.lineWidth = ray.lineWidth;
        ctx.stroke();

        // Traveling Value Vector Packet (flows from Key to Query token, synthesizing embedding)
        ray.vectorProgress = Math.min(1.0, ray.vectorProgress + ray.vectorSpeed * (delta / 16));
        if (ray.vectorProgress < 1.0 && rayFade > 0.2) {
          const vx = kToken.x + (qToken.x - kToken.x) * ray.vectorProgress;
          const vy = kToken.y + (qToken.y - kToken.y) * ray.vectorProgress;

          // Packet halo
          if (ray.isPrimary) {
            ctx.fillStyle = `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, ${0.25 * opacityMultiplier * rayFade})`;
            ctx.beginPath();
            ctx.arc(vx, vy, 4.5, 0, Math.PI * 2);
            ctx.fill();
          }

          // Packet bead
          ctx.fillStyle = ray.isPrimary ? head.core : `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, 0.85)`;
          ctx.beginPath();
          ctx.arc(vx, vy, 1.4 + ray.weight * 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // End of attention cycle
      if (progress >= 1.0) {
        activeAttentionCycle = null;
        nextAttentionCountdown = 3000 + Math.random() * 1500; // Calm 3.0s to 4.5s breathing pause
      }
    } else {
      // Idle pause: count down to next attention head evaluation
      nextAttentionCountdown -= delta;
      if (nextAttentionCountdown <= 0) {
        fireAttentionHead();
      }
    }

    // 3. Interactive Mouse Attention Probe
    let hoveredToken = null;
    if (mouseActive) {
      let minDist = 38;
      tokens.forEach((t) => {
        const d = Math.hypot(mouseX - t.x, mouseY - t.y);
        if (d < minDist) {
          minDist = d;
          hoveredToken = t;
        }
      });

      if (hoveredToken) {
        hoveredToken.active = 1.0;
        hoveredToken.isQuery = true;
        hoveredToken.palette = ATTENTION_HEADS[0]; // Interactive probe uses signature Teal

        // Project dynamic attention lines to the 4 nearest contextual tokens
        const nearby = tokens
          .filter(t => t !== hoveredToken)
          .map(t => ({ token: t, dist: Math.hypot(t.x - hoveredToken.x, t.y - hoveredToken.y) }))
          .sort((a, b) => a.dist - b.dist)
          .slice(0, 4);

        nearby.forEach((item, nIdx) => {
          const proximityWeight = Math.max(0.2, 1 - (item.dist / 320));
          const beamAlpha = (0.15 + proximityWeight * 0.45) * opacityMultiplier;

          ctx.beginPath();
          ctx.moveTo(hoveredToken.x, hoveredToken.y);
          ctx.lineTo(item.token.x, item.token.y);
          ctx.strokeStyle = `rgba(45, 212, 191, ${beamAlpha})`;
          ctx.lineWidth = nIdx === 0 ? 1.4 : 0.8;
          ctx.stroke();

          item.token.active = Math.max(item.token.active, proximityWeight * 0.6);
          item.token.palette = ATTENTION_HEADS[0];
        });
      }
    }

    // 4. Draw Contextual Tokens (Razor-sharp technical brackets & activation cores)
    const TOKEN_RADIUS = 3.2;

    tokens.forEach((node) => {
      const isFiring = node.active > 0.02;
      const head = node.palette || ATTENTION_HEADS[0];

      // Soft Attention Halo
      if (node.active > 0.15) {
        const auraRad = TOKEN_RADIUS + node.active * 7.5;
        const auraGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, auraRad);
        auraGrad.addColorStop(0, `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, ${node.active * 0.35 * opacityMultiplier})`);
        auraGrad.addColorStop(1, `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, 0)`);
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(node.x, node.y, auraRad, 0, Math.PI * 2);
        ctx.fill();
      }

      if (isFiring) {
        node.active *= 0.95; // Smooth decay
      }

      // Token Technical Anchor (Geometric outer bracket & inner core)
      if (node.isQuery && node.active > 0.25) {
        // Query Token: highlighted with bracket reticle
        ctx.strokeStyle = `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, ${node.active * 0.8})`;
        ctx.lineWidth = 1.0;
        ctx.strokeRect(node.x - 5, node.y - 5, 10, 10);

        ctx.fillStyle = head.core;
        ctx.beginPath();
        ctx.arc(node.x, node.y, TOKEN_RADIUS * 0.75, 0, Math.PI * 2);
        ctx.fill();
      } else if (node.active > 0.20) {
        // Attended Key Token
        ctx.beginPath();
        ctx.arc(node.x, node.y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = head.core;
        ctx.strokeStyle = `rgba(${head.rgb[0]}, ${head.rgb[1]}, ${head.rgb[2]}, ${node.active * 0.75})`;
        ctx.lineWidth = 1.0;
        ctx.fill();
        ctx.stroke();
      } else {
        // Resting Latent Token: subtle dark-slate circle with hairline rim
        ctx.beginPath();
        ctx.arc(node.x, node.y, TOKEN_RADIUS, 0, Math.PI * 2);
        ctx.fillStyle = '#080c16';
        ctx.strokeStyle = `rgba(148, 163, 184, ${0.28 * opacityMultiplier})`;
        ctx.lineWidth = 0.8;
        ctx.fill();
        ctx.stroke();
      }
    });

    animId = requestAnimationFrame(loop);
  }

  animId = requestAnimationFrame(loop);

  return {
    setSubtlety: (val) => { opacityMultiplier = val; },
    destroy: () => {
      isRunning = false;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('resize', setup.resize);
      if (container) container.innerHTML = '';
    }
  };
}
