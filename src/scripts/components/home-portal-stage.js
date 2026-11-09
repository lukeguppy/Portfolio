/**
 * Interactive Destination Stage on the Home page (`#home-stage-canvas`).
 * Renders bespoke visualisations matching the 4 sections:
 *   1. 'about'        (Experience): Clean Vertical Chronological Career & Education Timeline
 *   2. 'dissertation' (Dissertation): Causally accurate PPO Autonomous Overtaking
 *   3. 'playground'   (Playground): Authentic 5-game preview (Wordle Solver,
 *                                   Block Blast, Chess, Countries Quiz, Map Plotter)
 *   4. 'contact'      (Contact Me): Real clickable links panel (`[data-stage-contact]`)
 */
export function initHomePortalStage(root) {
  if (!root) return;

  const canvas = root.querySelector('#home-stage-canvas');
  const experiencePanel = root.querySelector('[data-stage-experience]');
  const contactPanel = root.querySelector('[data-stage-contact]');
  const copyBtn = root.querySelector('[data-home-copy-email]');
  const items = root.querySelectorAll('[data-portal-scene]');

  if (!canvas || !items.length) return;
  const ctx = canvas.getContext('2d');

  // Wire up one-click email copy in the Contact Me stage view
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.getAttribute('data-home-copy-email') || 'lukewguppy@gmail.com';
      try {
        await navigator.clipboard.writeText(email);
      } catch {
        const temp = document.createElement('textarea');
        temp.value = email;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        temp.remove();
      }
      copyBtn.textContent = 'Copied';
      setTimeout(() => {
        copyBtn.textContent = 'Copy';
      }, 2000);
    });
  }

  // Preload real SVG chess pieces for the Chess preview tile
  const chessSprites = {};
  const pieceNames = ['wK', 'wQ', 'wR', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bN', 'bP'];
  pieceNames.forEach((code) => {
    const img = new Image();
    img.src = `/Portfolio/images/chess-pieces/${code}.svg`;
    chessSprites[code] = img;
  });

  let activeScene = 'about';
  let width = 0;
  let height = 0;
  let dpr = 1;
  let t = 0;
  let pointer = { x: 0.5, y: 0.5, active: false };

  const frameEl = canvas.parentElement;
  let switchTimer = null;

  // Reveal the Explore section smoothly when scrolled into view
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            root.classList.add('is-visible');
            io.unobserve(root);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(root);
  } else {
    root.classList.add('is-visible');
  }

  function resize() {
    const rect = (frameEl || canvas).getBoundingClientRect();
    width = Math.max(320, rect.width);
    height = Math.max(300, rect.height);
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function applyScene(scene) {
    activeScene = scene;
    const isAbout = scene === 'about';
    const isContact = scene === 'contact';
    const usesCanvas = !isAbout && !isContact;

    canvas.hidden = !usesCanvas;
    if (experiencePanel) {
      experiencePanel.hidden = !isAbout;
    }
    if (contactPanel) {
      contactPanel.hidden = !isContact;
    }
    if (usesCanvas) {
      resize();
      startLoop();
    }
  }

  function setScene(scene, immediate = false) {
    if (scene === activeScene && !immediate) return;

    items.forEach((el) => {
      el.classList.toggle('is-active', el.dataset.portalScene === scene);
    });

    if (immediate || !frameEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyScene(scene);
      return;
    }

    if (switchTimer) clearTimeout(switchTimer);
    frameEl.classList.add('is-switching');

    switchTimer = setTimeout(() => {
      applyScene(scene);
      requestAnimationFrame(() => {
        frameEl.classList.remove('is-switching');
      });
    }, 110);
  }

  items.forEach((el) => {
    const scene = el.dataset.portalScene;
    el.addEventListener('mouseenter', () => setScene(scene));
    el.addEventListener('focus', () => setScene(scene));
  });

  canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = (e.clientY - r.top) / r.height;
    pointer.active = true;
  });

  canvas.addEventListener('mouseleave', () => {
    pointer.active = false;
  });

  // =========================================================================
  // 1. Experience Scene: Clean Vertical Chronological Timeline (No dot, no pills)
  // =========================================================================
  function drawAboutScene() {
    const spineX = 36;
    const contentX = 62;

    const entries = [
      {
        company: 'AlphaSights',
        role: 'Software Engineer I — AI Team',
        period: 'Feb 2026 – Present',
        color: '#2dd4bf',
        y: 36,
        phases: [
          {
            label: 'AI Processes II (Jun 2026 – Present)',
            desc: 'External AI chat, client-facing MCP server & AI data jobs',
          },
          {
            label: 'AI Processes I (Mar – Jun 2026)',
            desc: 'Engineered and scaled the internal AI chat platform',
          },
        ],
      },
      {
        company: 'Leonardo Helicopters',
        role: 'Graduate Software Engineer',
        period: 'Aug 2024 – Jan 2026',
        color: '#38bdf8',
        y: 184,
        phases: [
          {
            label: 'Autonomy, Technology & Innovation',
            desc: 'Optimisation solvers, Python ROS2/Docker RL drone sims & behaviour trees',
          },
          {
            label: 'Tactical Processing',
            desc: 'C++/Docker mission management system & gRPC multi-system services',
          },
        ],
      },
      {
        company: 'University of Warwick',
        role: 'BSc Computer Science (1st Class Honours)',
        period: 'Graduated',
        color: '#94a3b8',
        y: 332,
        phases: [
          {
            label: 'Final Year Dissertation',
            desc: 'Deep Reinforcement Learning (PPO) autonomous driving in C# & Unity',
          },
        ],
      },
    ];

    const topNodeY = entries[0].y + 6;
    const botNodeY = entries[entries.length - 1].y + 6;

    // Clean static vertical timeline spine (no animated dot!)
    const spineGrad = ctx.createLinearGradient(0, topNodeY, 0, botNodeY);
    spineGrad.addColorStop(0, '#2dd4bf');
    spineGrad.addColorStop(0.5, '#38bdf8');
    spineGrad.addColorStop(1, 'rgba(148, 163, 184, 0.35)');
    ctx.strokeStyle = spineGrad;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(spineX, topNodeY);
    ctx.lineTo(spineX, botNodeY);
    ctx.stroke();

    entries.forEach((m, idx) => {
      const isPrimary = idx === 0;
      const nodeY = m.y + 6;

      // Spine node circle
      ctx.beginPath();
      ctx.arc(spineX, nodeY, isPrimary ? 5.5 : 4.5, 0, Math.PI * 2);
      ctx.fillStyle = isPrimary ? m.color : '#090d19';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = m.color;
      ctx.stroke();

      // Header row: Company + Role on left, Period on right
      ctx.font = '600 13.5px "Overpass Variable", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(m.company, contentX, m.y + 10);

      const compW = ctx.measureText(m.company).width;
      ctx.font = '500 12px "Overpass Variable", sans-serif';
      ctx.fillStyle = m.color;
      ctx.fillText(`·  ${m.role}`, contentX + compW + 8, m.y + 10);

      ctx.font = '500 10.5px "JetBrains Mono Variable", monospace';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.textAlign = 'right';
      ctx.fillText(m.period, width - 26, m.y + 10);

      // Vertically stacked chronological phases
      ctx.textAlign = 'left';
      m.phases.forEach((ph, pIdx) => {
        const py = m.y + 34 + pIdx * 44;

        // Left vertical accent rule for each phase
        ctx.strokeStyle = isPrimary ? 'rgba(45, 212, 191, 0.45)' : 'rgba(148, 163, 184, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(contentX + 2, py - 10);
        ctx.lineTo(contentX + 2, py + 20);
        ctx.stroke();

        ctx.font = '600 11.5px "Overpass Variable", sans-serif';
        ctx.fillStyle = 'rgba(248, 250, 252, 0.95)';
        ctx.fillText(ph.label, contentX + 12, py);

        ctx.font = '400 11px "Overpass Variable", sans-serif';
        ctx.fillStyle = 'rgba(148, 163, 184, 0.9)';
        ctx.fillText(ph.desc, contentX + 12, py + 17, width - contentX - 38);
      });

      // Subtle divider between entries
      if (idx < entries.length - 1) {
        const divY = m.y + 128;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(contentX, divY);
        ctx.lineTo(width - 26, divY);
        ctx.stroke();
      }
    });
  }

  // =========================================================================
  // 2. Dissertation Scene: Causally Accurate PPO Autonomous Overtaking
  // =========================================================================
  function smoothstep(edge0, edge1, x) {
    const cl = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return cl * cl * (3 - 2 * cl);
  }

  function drawDissertationScene() {
    const roadTop = height * 0.2;
    const roadBottom = height * 0.8;
    const roadH = roadBottom - roadTop;
    const topLaneY = roadTop + roadH * 0.26;
    const bottomLaneY = roadTop + roadH * 0.74;

    ctx.fillStyle = 'rgba(13, 20, 36, 0.85)';
    ctx.fillRect(0, roadTop, width, roadH);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.28)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, roadTop);
    ctx.lineTo(width, roadTop);
    ctx.moveTo(0, roadBottom);
    ctx.lineTo(width, roadBottom);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([20, 16]);
    ctx.lineDashOffset = (t * 165) % 36;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.beginPath();
    ctx.moveTo(0, height * 0.5);
    ctx.lineTo(width, height * 0.5);
    ctx.stroke();
    ctx.restore();

    const egoX = width * 0.28;
    const cycleSpan = width + 260;
    const obsX = width + 130 - ((t * 92) % cycleSpan);
    const obsY = topLaneY;
    const carHalfL = 22;
    const carHalfW = 11;

    const distX = obsX - egoX;

    let evade = 0;
    let heading = 0;
    if (distX <= 145 && distX >= 68) {
      evade = smoothstep(145, 68, distX);
      heading = Math.sin(evade * Math.PI) * 0.22;
    } else if (distX < 68 && distX > -82) {
      evade = 1;
      heading = 0;
    } else if (distX <= -82 && distX >= -165) {
      evade = 1 - smoothstep(-82, -165, distX);
      heading = -Math.sin(evade * Math.PI) * 0.2;
    }

    const egoY = topLaneY + evade * (bottomLaneY - topLaneY);

    ctx.save();
    ctx.setLineDash([4, 4]);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(egoX + carHalfL, egoY);
    for (let step = 1; step <= 12; step++) {
      const fx = egoX + step * 16;
      const futureDist = obsX - fx;
      let fEvade = 0;
      if (futureDist <= 145 && futureDist >= 68) fEvade = smoothstep(145, 68, futureDist);
      else if (futureDist < 68 && futureDist > -82) fEvade = 1;
      else if (futureDist <= -82 && futureDist >= -165) fEvade = 1 - smoothstep(-82, -165, futureDist);
      const fy = topLaneY + fEvade * (bottomLaneY - topLaneY);
      ctx.lineTo(fx, fy);
    }
    ctx.stroke();
    ctx.restore();

    const rays = [
      { ang: -0.52, range: 195 },
      { ang: -0.39, range: 200 },
      { ang: -0.26, range: 205 },
      { ang: -0.13, range: 210 },
      { ang: 0, range: 215 },
      { ang: 0.13, range: 210 },
      { ang: 0.26, range: 205 },
      { ang: 0.39, range: 200 },
      { ang: 0.52, range: 195 },
      { ang: -1.15, range: 82 },
      { ang: -1.57, range: 78 },
      { ang: -2.05, range: 82 },
    ];

    let anyRayHit = false;
    rays.forEach(({ ang, range }) => {
      const a = heading + ang;
      let hitDist = range;
      let hitType = 'none';

      for (let d = 14; d <= range; d += 3) {
        const rx = egoX + Math.cos(a) * d;
        const ry = egoY + Math.sin(a) * d;

        if (
          rx >= obsX - carHalfL &&
          rx <= obsX + carHalfL &&
          ry >= obsY - carHalfW &&
          ry <= obsY + carHalfW
        ) {
          hitDist = d;
          hitType = 'car';
          anyRayHit = true;
          break;
        }
        if (ry <= roadTop || ry >= roadBottom) {
          hitDist = d;
          hitType = 'kerb';
          break;
        }
      }

      const ex = egoX + Math.cos(a) * hitDist;
      const ey = egoY + Math.sin(a) * hitDist;

      ctx.beginPath();
      ctx.moveTo(egoX, egoY);
      ctx.lineTo(ex, ey);
      if (hitType === 'car') {
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.88)';
        ctx.lineWidth = 1.9;
      } else {
        ctx.strokeStyle = 'rgba(45, 212, 191, 0.28)';
        ctx.lineWidth = 1;
      }
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ex, ey, hitType === 'car' ? 3.6 : 2, 0, Math.PI * 2);
      ctx.fillStyle = hitType === 'car' ? '#f59e0b' : '#2dd4bf';
      ctx.fill();
    });

    ctx.save();
    ctx.fillStyle = 'rgba(244, 63, 94, 0.88)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(obsX - carHalfL, obsY - carHalfW, carHalfL * 2, carHalfW * 2, 5);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(egoX, egoY);
    ctx.rotate(heading);
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.roundRect(-carHalfL, -carHalfW, carHalfL * 2, carHalfW * 2, 5);
    ctx.fill();
    ctx.fillStyle = '#06101e';
    ctx.beginPath();
    ctx.roundRect(4, -carHalfW + 3, 11, carHalfW * 2 - 6, 2);
    ctx.fill();
    ctx.restore();

    let policyState = 'Cruising in lane 1';
    let stateColor = '#2dd4bf';
    if (distX <= 205 && distX > 145 && anyRayHit) {
      policyState = 'Sensor detection: obstacle ahead';
      stateColor = '#f59e0b';
    } else if (distX <= 145 && distX >= 68) {
      policyState = 'Overtaking: changing lane';
      stateColor = '#f59e0b';
    } else if (distX < 68 && distX > -82) {
      policyState = 'Passing: side-sensor clearance check';
      stateColor = '#38bdf8';
    } else if (distX <= -82 && distX >= -165) {
      policyState = 'Clearance confirmed: merging back';
      stateColor = '#38bdf8';
    }

    ctx.font = '500 10.5px "JetBrains Mono Variable", monospace';
    ctx.fillStyle = stateColor;
    ctx.textAlign = 'left';
    ctx.fillText(`PPO Agent: ${policyState}`, 18, roadTop - 14);
  }

  // =========================================================================
  // 3. Playground Scene: Authentic 5-Game Preview
  // =========================================================================
  // Compact world land polygons (lon/lat in degrees) for Countries Quiz globe
  const CONTINENTS = [
    // North America
    {
      center: [-100, 42],
      pts: [
        [-125, 54], [-98, 58], [-76, 46], [-82, 26], [-98, 19], [-117, 33],
      ],
    },
    // South America
    {
      center: [-58, -18],
      pts: [
        [-76, 7], [-50, 2], [-37, -12], [-53, -33], [-67, -48], [-73, -18],
      ],
    },
    // Europe
    {
      center: [14, 48],
      pts: [
        [-7, 38], [4, 45], [14, 57], [30, 58], [27, 42], [12, 38],
      ],
    },
    // Africa
    {
      center: [20, 4],
      pts: [
        [-15, 15], [10, 33], [35, 25], [46, 8], [33, -25], [18, -33], [8, 4],
      ],
    },
    // Asia
    {
      center: [88, 36],
      pts: [
        [42, 42], [72, 54], [116, 50], [134, 35], [106, 15], [76, 14], [52, 26],
      ],
    },
    // Australia
    {
      center: [134, -25],
      pts: [
        [115, -22], [136, -14], [151, -26], [143, -37], [118, -33],
      ],
    },
  ];

  function drawMapPin(x, y, color, scale = 1) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = color;
    ctx.strokeStyle = '#061018';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(0, -9, 6, Math.PI, 0, false);
    ctx.bezierCurveTo(6, -5, 2, -2, 0, 0);
    ctx.bezierCurveTo(-2, -2, -6, -5, -6, -9);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, -9, 2.2, 0, Math.PI * 2);
    ctx.fillStyle = '#061018';
    ctx.fill();
    ctx.restore();
  }

  function drawPlaygroundScene() {
    const pad = 16;
    const gap = 10;
    const topRowH = (height - pad * 2 - gap) * 0.52;
    const botRowH = (height - pad * 2 - gap) * 0.48;
    const topColW = (width - pad * 2 - gap * 2) / 3;
    const botColW = (width - pad * 2 - gap) / 2;

    const cards = [
      { id: 'wordle', title: 'Wordle Solver', x: pad, y: pad, w: topColW, h: topRowH },
      { id: 'block', title: 'Block Blast', x: pad + topColW + gap, y: pad, w: topColW, h: topRowH },
      { id: 'chess', title: 'Chess', x: pad + (topColW + gap) * 2, y: pad, w: topColW, h: topRowH },
      { id: 'globe', title: 'Countries Quiz', x: pad, y: pad + topRowH + gap, w: botColW, h: botRowH },
      { id: 'map', title: 'Map Plotter', x: pad + botColW + gap, y: pad + topRowH + gap, w: botColW, h: botRowH },
    ];

    const px = pointer.x * width;
    const py = pointer.y * height;

    cards.forEach((c) => {
      const hovered = pointer.active && px >= c.x && px <= c.x + c.w && py >= c.y && py <= c.y + c.h;

      ctx.fillStyle = hovered ? '#111a2e' : '#0b1120';
      ctx.strokeStyle = hovered ? 'rgba(45, 212, 191, 0.65)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = hovered ? 1.4 : 1;
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 8);
      ctx.fill();
      ctx.stroke();

      ctx.font = '600 11.5px "Overpass Variable", sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.fillText(c.title, c.x + 12, c.y + 20);

      const vx = c.x + 10;
      const vy = c.y + 28;
      const vw = c.w - 20;
      const vh = c.h - 36;

      if (c.id === 'wordle') {
        const cols = 5;
        const rows = 3;
        const cell = Math.min((vw - 12) / cols, (vh - 12) / rows, 22);
        const gridW = cols * cell + (cols - 1) * 3.5;
        const gridH = rows * cell + (rows - 1) * 3.5;
        const startX = vx + (vw - gridW) * 0.5;
        const startY = vy + (vh - gridH) * 0.5;

        const colors = [
          ['#538d4e', '#3a3a3c', '#b59f3b', '#3a3a3c', '#b59f3b'],
          ['#538d4e', '#3a3a3c', '#538d4e', '#538d4e', '#538d4e'],
          ['#538d4e', '#538d4e', '#538d4e', '#538d4e', '#538d4e'],
        ];
        const words = ['SALET', 'CRANE', 'SHINE'];

        for (let r = 0; r < rows; r++) {
          for (let col = 0; col < cols; col++) {
            const cxCell = startX + col * (cell + 3.5);
            const cyCell = startY + r * (cell + 3.5);
            ctx.fillStyle = colors[r][col];
            ctx.beginPath();
            ctx.roundRect(cxCell, cyCell, cell, cell, 3);
            ctx.fill();

            ctx.font = '700 10px "Overpass Variable", sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(words[r][col], cxCell + cell * 0.5, cyCell + cell * 0.68);
          }
        }
      } else if (c.id === 'block') {
        // Authentic Block Blast board with a calm, unhurried ~5.5s cycle
        const gridN = 6;
        const boardSize = Math.min(vw - 8, vh - 8, 92);
        const cell = boardSize / gridN;
        const bx = vx + (vw - boardSize) * 0.5;
        const by = vy + (vh - boardSize) * 0.5;

        ctx.fillStyle = '#0f0f28';
        ctx.strokeStyle = '#00f0ff';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.roundRect(bx, by, boardSize, boardSize, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0, 240, 255, 0.14)';
        ctx.lineWidth = 0.7;
        for (let i = 1; i < gridN; i++) {
          ctx.beginPath();
          ctx.moveTo(bx + i * cell, by);
          ctx.lineTo(bx + i * cell, by + boardSize);
          ctx.moveTo(bx, by + i * cell);
          ctx.lineTo(bx + boardSize, by + i * cell);
          ctx.stroke();
        }

        const placed = [
          { r: 0, c: 0, color: '#ff3366' },
          { r: 1, c: 0, color: '#ff3366' },
          { r: 2, c: 0, color: '#ff3366' },
          { r: 2, c: 1, color: '#ff3366' },
          { r: 4, c: 0, color: '#3366ff' },
          { r: 4, c: 1, color: '#3366ff' },
          { r: 5, c: 0, color: '#3366ff' },
          { r: 5, c: 1, color: '#3366ff' },
          { r: 0, c: 3, color: '#ffcc00' },
          { r: 0, c: 4, color: '#ffcc00' },
          { r: 0, c: 5, color: '#ffcc00' },
          { r: 1, c: 4, color: '#ffcc00' },
          { r: 3, c: 0, color: '#9933ff' },
          { r: 3, c: 1, color: '#9933ff' },
          { r: 3, c: 2, color: '#9933ff' },
          { r: 3, c: 3, color: '#9933ff' },
        ];

        // Slowed down cycle: 0.18 (~5.5 seconds per cycle instead of frantic loop)
        const cycle = (t * 0.18) % 1;
        const isClearing = cycle > 0.65 && cycle < 0.82;
        const isCleared = cycle >= 0.82;

        placed.forEach((b) => {
          const isRow3 = b.r === 3;
          if (isRow3 && isCleared) return;
          ctx.fillStyle = isRow3 && isClearing ? '#ffffff' : b.color;
          ctx.beginPath();
          ctx.roundRect(bx + b.c * cell + 1, by + b.r * cell + 1, cell - 2, cell - 2, 2);
          ctx.fill();
        });

        if (!isCleared) {
          const dropRaw = Math.min(1, cycle / 0.55);
          const dropProgress = dropRaw * dropRaw * (3 - 2 * dropRaw);
          const dropOffset = (1 - dropProgress) * 14;
          for (let cCol = 4; cCol <= 5; cCol++) {
            ctx.fillStyle = isClearing ? '#ffffff' : '#33ff66';
            ctx.beginPath();
            ctx.roundRect(
              bx + cCol * cell + 1,
              by + 3 * cell + 1 + dropOffset,
              cell - 2,
              cell - 2,
              2,
            );
            ctx.fill();
          }
        }
      } else if (c.id === 'chess') {
        // Authentic wooden chessboard with a 100% legal, unobstructed Queen move along column 0
        const cols = 4;
        const boardSize = Math.min(vw - 8, vh - 8, 92);
        const cell = boardSize / cols;
        const bx = vx + (vw - boardSize) * 0.5;
        const by = vy + (vh - boardSize) * 0.5;

        ctx.fillStyle = '#2d1b0e';
        ctx.beginPath();
        ctx.roundRect(bx - 3, by - 3, boardSize + 6, boardSize + 6, 4);
        ctx.fill();

        for (let r = 0; r < cols; r++) {
          for (let col = 0; col < cols; col++) {
            ctx.fillStyle = (r + col) % 2 === 0 ? '#e8cfa4' : '#8f5e36';
            ctx.fillRect(bx + col * cell, by + r * cell, cell, cell);
          }
        }

        // White Queen (`wQ`) slides legally along the completely empty column 0 from (3, 0) to (0, 0)
        // delivering a clean back-rank check to Black King (`bK`) at (0, 3).
        const cycle = (t * 0.25) % 1;
        let slide = 0;
        if (cycle < 0.35) {
          const u = cycle / 0.35;
          slide = u * u * (3 - 2 * u);
        } else if (cycle < 0.65) {
          slide = 1;
        } else if (cycle < 0.9) {
          const u = (cycle - 0.65) / 0.25;
          slide = 1 - u * u * (3 - 2 * u);
        }
        const qCol = 0;
        const qRow = 3 - slide * 3;

        // Highlight origin (3, 0) and destination (0, 0) squares
        ctx.fillStyle = 'rgba(45, 212, 191, 0.28)';
        ctx.fillRect(bx + 0 * cell, by + 3 * cell, cell, cell);
        ctx.fillRect(bx + 0 * cell, by + 0 * cell, cell, cell);

        const piecesToDraw = [
          { code: 'bK', r: 0, c: 3 },
          { code: 'bP', r: 1, c: 2 },
          { code: 'bP', r: 1, c: 3 },
          { code: 'wP', r: 2, c: 3 },
          { code: 'wK', r: 3, c: 2 },
          { code: 'wQ', r: qRow, c: qCol },
        ];

        piecesToDraw.forEach((p) => {
          const img = chessSprites[p.code];
          const pxPiece = bx + p.c * cell + 1.5;
          const pyPiece = by + p.r * cell + 1.5;
          const sz = cell - 3;
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.drawImage(img, pxPiece, pyPiece, sz, sz);
          } else {
            ctx.beginPath();
            ctx.arc(pxPiece + sz * 0.5, pyPiece + sz * 0.5, sz * 0.35, 0, Math.PI * 2);
            ctx.fillStyle = p.code.startsWith('w') ? '#f8fafc' : '#1e293b';
            ctx.fill();
          }
        });
      } else if (c.id === 'globe') {
        // Countries Quiz: Front-hemisphere-culled orthographic globe (zero back-side bleed-through)
        const gcx = vx + vw * 0.5;
        const gcy = vy + vh * 0.52;
        const r = Math.min(vw * 0.36, vh * 0.45);

        // Ocean sphere
        ctx.beginPath();
        ctx.arc(gcx, gcy, r, 0, Math.PI * 2);
        ctx.fillStyle = '#162238';
        ctx.fill();
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.32)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        ctx.save();
        ctx.beginPath();
        ctx.arc(gcx, gcy, r - 1, 0, Math.PI * 2);
        ctx.clip();

        const rotLon = (t * 16) % 360;
        const quizColors = ['#4ade80', '#facc15', '#4ade80', '#ef4444'];
        const activeContinent = Math.floor(t * 0.6) % CONTINENTS.length;

        CONTINENTS.forEach((cont, cIdx) => {
          // Check if continent centroid is on the front hemisphere
          const cLon = (((cont.center[0] + rotLon + 540) % 360) - 180) * (Math.PI / 180);
          const cLat = cont.center[1] * (Math.PI / 180);
          const centerZ = Math.cos(cLat) * Math.cos(cLon);

          // Strict front-hemisphere culling: never draw continents on the back of the globe
          if (centerZ <= 0.08) return;

          ctx.beginPath();
          cont.pts.forEach(([lon, lat], pIdx) => {
            const relLon = ((lon + rotLon + 540) % 360) - 180;
            // Clamp longitude to [-88, 88] degrees so horizon vertices stay on the outer limb
            const clampedLon = Math.max(-88, Math.min(88, relLon));
            const radLon = (clampedLon * Math.PI) / 180;
            const radLat = (lat * Math.PI) / 180;
            const xProj = gcx + r * Math.cos(radLat) * Math.sin(radLon);
            const yProj = gcy - r * Math.sin(radLat);
            if (pIdx === 0) ctx.moveTo(xProj, yProj);
            else ctx.lineTo(xProj, yProj);
          });
          ctx.closePath();

          const isGuessed = cIdx <= activeContinent;
          ctx.fillStyle = isGuessed
            ? quizColors[cIdx % quizColors.length]
            : 'rgba(255, 255, 255, 0.18)';
          ctx.strokeStyle = 'rgba(15, 23, 42, 0.75)';
          ctx.lineWidth = 0.8;
          ctx.fill();
          ctx.stroke();
        });
        ctx.restore();
      } else if (c.id === 'map') {
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(vx, vy, vw, vh, 6);
        ctx.clip();

        ctx.fillStyle = '#071414';
        ctx.fillRect(vx, vy, vw, vh);

        ctx.strokeStyle = 'rgba(20, 184, 166, 0.14)';
        ctx.lineWidth = 0.8;
        const step = 18;
        for (let gx = vx; gx < vx + vw; gx += step) {
          ctx.beginPath();
          ctx.moveTo(gx, vy);
          ctx.lineTo(gx, vy + vh);
          ctx.stroke();
        }
        for (let gy = vy; gy < vy + vh; gy += step) {
          ctx.beginPath();
          ctx.moveTo(vx, gy);
          ctx.lineTo(vx + vw, gy);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(vx, vy + vh * 0.65);
        ctx.bezierCurveTo(
          vx + vw * 0.35,
          vy + vh * 0.45,
          vx + vw * 0.55,
          vy + vh * 0.78,
          vx + vw,
          vy + vh * 0.32,
        );
        ctx.stroke();

        const compX = vx + vw - 20;
        const compY = vy + 18;
        ctx.strokeStyle = 'rgba(255, 200, 100, 0.5)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(compX, compY, 10, 0, Math.PI * 2);
        ctx.stroke();

        ctx.save();
        ctx.translate(compX, compY);
        ctx.rotate(Math.sin(t * 1.4) * 0.15);
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(0, -8);
        ctx.lineTo(-2.5, 0);
        ctx.lineTo(2.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#2d7dd2';
        ctx.beginPath();
        ctx.moveTo(0, 8);
        ctx.lineTo(-2.5, 0);
        ctx.lineTo(2.5, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        const pins = [
          { x: vx + vw * 0.22, y: vy + vh * 0.62, color: '#2dd4bf' },
          { x: vx + vw * 0.48, y: vy + vh * 0.44, color: '#f59e0b' },
          { x: vx + vw * 0.72, y: vy + vh * 0.7, color: '#38bdf8' },
          { x: vx + vw * 0.36, y: vy + vh * 0.8, color: '#f43f5e' },
        ];
        pins.forEach((pin, idx) => {
          const bounce = idx === Math.floor(t * 1.1) % pins.length ? 1.16 : 1;
          drawMapPin(pin.x, pin.y, pin.color, bounce);
        });

        ctx.restore();
      }
    });
  }

  let isIntersecting = false;
  let rafId = null;

  function frame() {
    if (!isIntersecting) {
      rafId = null;
      return;
    }
    t += 0.016;
    if (activeScene === 'dissertation' || activeScene === 'playground') {
      ctx.clearRect(0, 0, width, height);
      if (activeScene === 'dissertation') drawDissertationScene();
      else if (activeScene === 'playground') drawPlaygroundScene();
    }
    rafId = requestAnimationFrame(frame);
  }

  function startLoop() {
    if (!rafId && isIntersecting && (activeScene === 'dissertation' || activeScene === 'playground')) {
      rafId = requestAnimationFrame(frame);
    }
  }

  if ('IntersectionObserver' in window) {
    const stageObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isIntersecting = entry.isIntersecting;
          if (isIntersecting) {
            startLoop();
          } else if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
          }
        });
      },
      { threshold: 0.05 },
    );
    stageObserver.observe(root);
  } else {
    isIntersecting = true;
    startLoop();
  }

  resize();
  window.addEventListener('resize', resize, { passive: true });
  setScene('about', true);
}
