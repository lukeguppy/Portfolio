/* ==========================================================================
   PRODUCTION HOME PAGE SCRIPT — DIRECTION 07: CINEMATIC GENESIS
   Laser collision, single-actor caret genesis, fluid typing handoff,
   interactive live agent briefing, auto-complete scroll snap, and neural net.
   ========================================================================== */

// Lock scroll restoration to top
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);
if (window.location.hash) {
  history.replaceState(null, '', window.location.pathname + window.location.search);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------------- DATASET FOR INTERACTIVE BRIEFING ---------------- */
const BRIEFINGS = {
  intro: {
    prompt: 'Tell me about Luke',
    thinking: 'Synthesising profile telemetry...',
    status: 'Synthesised profile overview in 14ms',
    summary: 'Luke Guppy is an <strong>AI Software Engineer at AlphaSights</strong>, specialising in production AI systems, agentic workflow orchestration, and scalable cloud platforms.',
    bullets: [
      { title: 'Current Focus', detail: 'Designing and deploying autonomous agent systems and LLM integrations that accelerate high-stakes knowledge search.' },
      { title: 'Tactical Systems', detail: 'Previously engineered safety-critical avionics and mission management software in C++ at Leonardo Helicopters.' },
      { title: 'Academic Research', detail: 'First-Class Honours from University of Warwick; trained deep reinforcement learning agents for autonomous driving.' },
    ],
  },
  alphasights: {
    prompt: 'What does Luke do at AlphaSights?',
    thinking: 'Synthesising AlphaSights systems telemetry...',
    status: 'Synthesised production AI architecture in 18ms',
    summary: 'At AlphaSights, Luke engineers production-grade AI platforms that connect commercial clients with subject-matter experts worldwide.',
    bullets: [
      { title: 'Agentic Workflows', detail: 'Building multi-step reasoning pipelines that automate expert matching and research analysis.' },
      { title: 'Production Reliability', detail: 'Hardening LLM latency, implementing guardrails, and managing resilient microservices at enterprise scale.' },
    ],
  },
  experience: {
    prompt: 'What is Luke\'s engineering background?',
    thinking: 'Synthesising engineering trajectory...',
    status: 'Synthesised systems & avionics trajectory in 22ms',
    summary: 'Luke\'s background combines high-reliability systems engineering with modern artificial intelligence.',
    bullets: [
      { title: 'AlphaSights (2024—Present)', detail: 'AI Software Engineer leading agent workflows and LLM applications.' },
      { title: 'Leonardo Helicopters (2022—2023)', detail: 'Developed high-throughput C++ services, gRPC pipelines, and Dockerised tactical planning infrastructure.' },
      { title: 'University of Warwick (2020—2024)', detail: 'BSc Computer Science with First-Class Honours, specialising in Machine Learning and Systems.' },
    ],
  },
  projects: {
    prompt: 'What projects has Luke built?',
    thinking: 'Synthesising research & project archives...',
    status: 'Synthesised technical systems & research in 16ms',
    summary: 'Luke has engineered technical systems across deep reinforcement learning, language models, network protocols, and interactive tools.',
    bullets: [
      { title: 'Autonomous Driving Dissertation (PPO)', detail: 'Trained a continuous-action Proximal Policy Optimisation agent in Unity and C# capable of navigating multi-lane road networks.' },
      { title: 'Transformer & Systems Architecture', detail: 'Engineered a next-token predictor Transformer from scratch, dynamic-pricing engine, and C++/NS-3 network simulator.' },
      { title: 'Interactive Web Playground', detail: 'Created algorithmic browser implementations of Wordle solvers, Chess engines, and spatial physics simulations.' },
    ],
  },
};

/* ---------------- THE SINGLE-ACTOR CINEMATIC CHOREOGRAPHY ---------------- */
async function runCinematicOrchestration() {
  const beamL = document.getElementById('beam-left');
  const beamR = document.getElementById('beam-right');
  const theCursor = document.getElementById('the-cursor');
  const introCol = document.getElementById('hero-intro-col');
  const hTitleText = document.getElementById('hero-title-text');
  const hRole = document.getElementById('hero-role');
  const hRoleText = document.getElementById('hero-role-text');
  const hBio = document.getElementById('hero-bio');
  const hBioText = document.getElementById('hero-bio-text');
  const chatCol = document.getElementById('chat-terminal-col');
  const siteHeader = document.getElementById('site-header');
  const neuralCanvas = document.getElementById('neural-canvas');
  const composerBox = document.querySelector('.chat-composer');
  const scrollCue = document.getElementById('scroll-cue');

  if (!introCol || !theCursor) return;

  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  // 1. Initial Positioning:
  // Translate introCol so that it sits dead-center in the viewport while typing
  const restingRect = introCol.getBoundingClientRect();
  const targetCenterX = (screenW / 2) - (restingRect.width / 2);
  const targetCenterY = (screenH / 2) - 80;

  const deltaX = targetCenterX - restingRect.left;
  const deltaY = targetCenterY - restingRect.top;

  introCol.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

  // Align laser beams with vertical center of the title
  const initialCaretRect = theCursor.getBoundingClientRect();
  const meetY = initialCaretRect.top + (initialCaretRect.height / 2);

  if (beamL && beamR) {
    beamL.style.top = `${meetY}px`;
    beamR.style.top = `${meetY}px`;

    // 2. STAGE I: LASER BEAMS MEET IN THE MIDDLE (0.0s - 0.7s)
    await sleep(150);
    beamL.style.transition = 'width 650ms cubic-bezier(0.16, 1, 0.3, 1)';
    beamR.style.transition = 'width 650ms cubic-bezier(0.16, 1, 0.3, 1)';
    beamL.style.width = '50%';
    beamR.style.width = '50%';

    await sleep(650);

    // 3. COLLISION: BEAMS MEET AND MORPH INTO THE VERTICAL CARET
    beamL.style.transition = 'opacity 200ms ease';
    beamR.style.transition = 'opacity 200ms ease';
    beamL.style.opacity = '0';
    beamR.style.opacity = '0';
  }

  // The vertical caret opens vertically from the exact collision seam
  theCursor.classList.add('is-opening');
  await sleep(240);
  theCursor.classList.remove('is-opening');
  theCursor.classList.add('is-blinking');

  // ANTICIPATION: Blinks 2 calm cycles in dead center (~2.1s)
  await sleep(2100);

  // 4. TYPE NAME — CONTINUOUS FLOW WITH CRISP 0.2s PAUSES
  theCursor.classList.remove('is-blinking');
  theCursor.classList.add('is-typing');

  const nameStr = 'Luke Guppy';
  for (let i = 1; i <= nameStr.length; i++) {
    hTitleText.textContent = nameStr.slice(0, i);
    await sleep(22 + (i % 2) * 10);
  }

  // Quick 0.2s breath, then move directly to subtitle
  await sleep(200);

  // 5. MOVE DOWN TO SUBTITLE
  hRole.appendChild(theCursor);
  theCursor.classList.add('is-typing');
  await sleep(80);

  const roleStr = 'AI Software Engineer @ AlphaSights';
  for (let i = 1; i <= roleStr.length; i++) {
    hRoleText.textContent = roleStr.slice(0, i);
    await sleep(18 + (i % 2) * 8);
  }

  // Quick 0.2s breath, then move directly to description
  await sleep(200);

  // 6. MOVE DOWN TO DESCRIPTION
  hBio.appendChild(theCursor);
  theCursor.classList.add('is-typing');
  await sleep(80);

  const bioStr = 'Software Engineer on the AI team at AlphaSights, building internal and external AI chat systems, agent tools, client-facing MCP servers, and AI jobs for data processing that shape the company’s AI foundations.';
  
  for (let i = 2; i <= bioStr.length + 1; i += 2) {
    hBioText.textContent = bioStr.slice(0, Math.min(i, bioStr.length));
    await sleep(8 + (i % 3) * 3);
  }
  hBioText.textContent = bioStr;

  // Quick 0.2s breath, then begin seamless spatial handoff
  await sleep(200);

  // 7. THE SPATIAL HANDOFF: INTRO MOVES TO LEFT SIDE, CHATBOT TRANSITIONS IN ON RIGHT
  introCol.style.transition = 'transform 950ms cubic-bezier(0.16, 1, 0.3, 1)';
  introCol.style.transform = 'translate(0px, 0px)';
  introCol.classList.add('is-docked');

  // Concurrently: Chatbot enters on right, nav drops, neural canvas blooms
  if (chatCol) chatCol.classList.add('is-visible');
  if (siteHeader) siteHeader.classList.add('is-visible');
  if (neuralCanvas) neuralCanvas.classList.add('is-active');

  await sleep(850);

  // 8. THE ONE CURSOR FLIES FROM BIO ACROSS TO CHATBOT PROMPT INPUT
  const startRect = theCursor.getBoundingClientRect();
  const targetRect = composerBox.getBoundingClientRect();

  theCursor.classList.remove('is-blinking');
  theCursor.style.position = 'fixed';
  theCursor.style.left = `${startRect.left}px`;
  theCursor.style.top = `${startRect.top}px`;
  theCursor.style.width = '3px';
  theCursor.style.height = `${startRect.height}px`;
  theCursor.style.zIndex = '1000';
  theCursor.classList.add('is-teal');
  document.body.appendChild(theCursor);

  await sleep(30);

  // Smooth flight across the gap into composer bar
  theCursor.style.transition = 'all 600ms cubic-bezier(0.16, 1, 0.3, 1)';
  theCursor.style.left = `${targetRect.left + 39}px`;
  theCursor.style.top = `${targetRect.top + (targetRect.height - 18) / 2}px`;
  theCursor.style.height = '1.1rem';

  await sleep(600);

  // 9. DOCKS & BREATHES BRIEFLY IN CHATBOT INPUT BEFORE TYPING
  theCursor.style.position = '';
  theCursor.style.left = '';
  theCursor.style.top = '';
  theCursor.style.transition = '';
  theCursor.style.zIndex = '';
  theCursor.style.height = '1em';
  theCursor.style.verticalAlign = '-2px';
  composerBox.appendChild(theCursor);
  theCursor.classList.add('is-blinking');

  await sleep(300);

  // 10. TYPES THE PROMPT (SOLID WHILE TYPING)
  theCursor.classList.remove('is-blinking');
  theCursor.classList.add('is-typing');

  initLiveAgent(document.querySelector('[data-agent-root]'), theCursor, scrollCue);
}

/* ---------------- NEURAL NETWORK CANVAS ---------------- */
function createNeuralNet(canvas) {
  if (!canvas) return;
  const o = {
    layers: [6, 9, 13, 16, 17, 16, 13, 9, 6],
    nodeRGB: '148,163,184', nodeAlpha: 0.38, nodeR: 1.7,
    pulseRGB: ['45,212,191', '245,158,11'],
    hop: 1050,
  };
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, layers = [], conns = [], passes = [], last = performance.now();

  function build() {
    layers = [];
    conns = [];
    const pattern = o.layers;
    const px = W * 0.03, sp = (W - px * 2) / (pattern.length - 1);
    const maxCount = Math.max(...pattern);
    const globalYPadding = H * 0.08;
    const usableH = H - (globalYPadding * 2);

    for (let c = 0; c < pattern.length; c++) {
      const count = pattern[c];
      const yStep = usableH / (maxCount + 1);
      const colHeight = (count - 1) * yStep;
      const startY = (H - colHeight) / 2;
      const colNodes = [];
      const colX = px + c * sp;

      for (let r = 0; r < count; r++) {
        const jX = (Math.sin(c * 17 + r * 13) * sp * 0.12);
        const jY = (Math.cos(c * 19 + r * 7) * yStep * 0.15);
        colNodes.push({
          x: colX + jX,
          y: startY + r * yStep + jY,
          baseX: colX + jX,
          baseY: startY + r * yStep + jY,
          c, r
        });
      }
      layers.push(colNodes);
    }

    for (let c = 0; c < layers.length - 1; c++) {
      const curr = layers[c], nxt = layers[c + 1];
      for (const a of curr) {
        const sorted = nxt.slice().sort((p, q) => Math.hypot(p.x - a.x, p.y - a.y) - Math.hypot(q.x - a.x, q.y - a.y));
        const connectCount = Math.min(sorted.length, Math.floor(sorted.length * 0.5) + (a.r % 2));
        for (let i = 0; i < connectCount; i++) {
          conns.push({ a, b: sorted[i] });
        }
      }
    }
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.clientWidth || window.innerWidth;
    H = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.floor(W * dpr);
    canvas.height = Math.floor(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
  }

  function spawnPass() {
    if (!layers.length) return;
    const path = [];
    let cur = layers[0][Math.floor(Math.random() * layers[0].length)];
    path.push(cur);

    for (let c = 0; c < layers.length - 1; c++) {
      const candidates = conns.filter(k => k.a === cur).map(k => k.b);
      if (!candidates.length) break;
      cur = candidates[Math.floor(Math.random() * candidates.length)];
      path.push(cur);
    }
    if (path.length > 2) {
      passes.push({
        path,
        prog: 0,
        spd: 0.00065 + Math.random() * 0.00035,
        color: o.pulseRGB[Math.random() < 0.7 ? 0 : 1]
      });
    }
  }

  let mouseX = -9999, mouseY = -9999;
  window.addEventListener('pointermove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  }, { passive: true });

  function tick(now) {
    const dt = now - last;
    last = now;

    if (Math.random() < dt / o.hop) {
      spawnPass();
    }

    ctx.clearRect(0, 0, W, H);

    // Dynamic mouse push & gentle sway
    for (const col of layers) {
      for (const n of col) {
        const dMouse = Math.hypot(n.baseX - mouseX, n.baseY - mouseY);
        let pushX = 0, pushY = 0;
        if (dMouse < 180) {
          const factor = (1 - dMouse / 180) * 18;
          const angle = Math.atan2(n.baseY - mouseY, n.baseX - mouseX);
          pushX = Math.cos(angle) * factor;
          pushY = Math.sin(angle) * factor;
        }
        const sway = Math.sin(now * 0.0012 + n.c + n.r) * 1.5;
        n.x = n.baseX + pushX;
        n.y = n.baseY + pushY + sway;
      }
    }

    // Hairline connection matrix
    ctx.lineWidth = 1;
    for (const { a, b } of conns) {
      ctx.strokeStyle = `rgba(${o.nodeRGB}, 0.09)`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    // Forward telemetry pulses
    for (let i = passes.length - 1; i >= 0; i--) {
      const p = passes[i];
      p.prog += p.spd * dt;
      if (p.prog >= p.path.length - 1) {
        passes.splice(i, 1);
        continue;
      }
      const seg = Math.floor(p.prog);
      const frac = p.prog - seg;
      const n1 = p.path[seg];
      const n2 = p.path[seg + 1];
      const curX = n1.x + (n2.x - n1.x) * frac;
      const curY = n1.y + (n2.y - n1.y) * frac;

      ctx.save();
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgb(${p.color})`;
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curY, 2.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Telemetry nodes
    for (const col of layers) {
      for (const n of col) {
        ctx.fillStyle = `rgba(${o.nodeRGB}, ${o.nodeAlpha})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, o.nodeR, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  for (let i = 0; i < 3; i++) spawnPass();
  requestAnimationFrame(tick);
}

/* ---------------- INTERACTIVE LIVE AGENT ENGINE ---------------- */
function initLiveAgent(root, liveCursor, scrollCue) {
  if (!root) return;
  const promptInput = root.querySelector('[data-agent-input]');
  const userQ = root.querySelector('[data-agent-q]');
  const statusBar = root.querySelector('[data-agent-status]');
  const statusText = root.querySelector('[data-agent-status-text]');
  const summary = root.querySelector('[data-agent-summary]');
  const bullets = root.querySelector('[data-agent-bullets]');
  const chips = root.querySelectorAll('[data-agent-chip]');
  let runId = 0;
  let isIntroComplete = false;

  async function typePrompt(text, currentRun) {
    promptInput.textContent = '';
    if (liveCursor) promptInput.appendChild(liveCursor);
    for (let i = 1; i <= text.length; i++) {
      if (currentRun !== runId) return false;
      promptInput.textContent = text.slice(0, i);
      if (liveCursor) promptInput.appendChild(liveCursor);
      await sleep(18 + (i % 2) * 12);
    }
    await sleep(240);
    return true;
  }

  async function play(key) {
    const d = BRIEFINGS[key];
    if (!d) return;
    const currentRun = ++runId;

    if (liveCursor) {
      liveCursor.classList.remove('is-blinking');
      liveCursor.classList.add('is-typing');
    }

    const typedOk = await typePrompt(d.prompt, currentRun);
    if (!typedOk) return;

    userQ.textContent = d.prompt;
    userQ.hidden = false;
    promptInput.textContent = '';
    if (liveCursor) promptInput.appendChild(liveCursor);

    summary.innerHTML = '';
    bullets.innerHTML = '';

    statusBar.hidden = false;
    statusText.textContent = d.thinking;
    await sleep(280);
    if (currentRun !== runId) return;

    statusText.textContent = d.status;

    // Stream summary text
    for (let i = 2; i <= d.summary.length + 1; i += 2) {
      if (currentRun !== runId) return;
      summary.innerHTML = d.summary.slice(0, Math.min(i, d.summary.length)) + '<span class="the-cursor is-typing" style="display:inline-block"></span>';
      await sleep(10);
    }
    summary.innerHTML = d.summary;

    // Stream bullet rows
    for (const b of d.bullets) {
      if (currentRun !== runId) return;
      const row = document.createElement('div');
      row.className = 'chat-bullet-row';
      row.innerHTML = `<div class="chat-bullet-title">${b.title}</div><p class="chat-bullet-detail">${b.detail}</p>`;
      bullets.appendChild(row);
      await sleep(60);
    }

    // Only after the full intro animation finishes: unlock scrolling!
    if (!isIntroComplete) {
      isIntroComplete = true;
      document.documentElement.classList.remove('is-locked');
      document.body.classList.remove('is-locked');
      if (scrollCue) scrollCue.classList.add('is-shown');
    }
  }

  let isAnimatingScroll = false;
  const scrollUpCue = document.getElementById('scroll-up-cue');

  function updateCuesForCurrentSection() {
    if (!isIntroComplete || isAnimatingScroll) return;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const vh = window.innerHeight;
    
    // In Hero section
    if (scrollY < vh * 0.35) {
      if (scrollCue) scrollCue.classList.add('is-shown');
      if (scrollUpCue) scrollUpCue.classList.remove('is-shown');
    } else if (scrollY > vh * 0.65) {
      // In Section 2 (Explore)
      if (scrollCue) scrollCue.classList.remove('is-shown');
      if (scrollUpCue) scrollUpCue.classList.add('is-shown');
    } else {
      // Transitioning: hide both
      if (scrollCue) scrollCue.classList.remove('is-shown');
      if (scrollUpCue) scrollUpCue.classList.remove('is-shown');
    }
  }

  window.addEventListener('scroll', updateCuesForCurrentSection, { passive: true });

  function smoothScrollToElement(target, duration = 850, onComplete) {
    if (!target) return;
    const startY = window.pageYOffset || document.documentElement.scrollTop;
    let targetTop = 0;
    if (target !== document.body && target !== document.documentElement) {
      targetTop = target.getBoundingClientRect().top + startY;
    }
    const diff = targetTop - startY;
    if (Math.abs(diff) < 2) return;
    const startTime = performance.now();

    // 1. Immediately hide BOTH chevrons upon click!
    isAnimatingScroll = true;
    if (scrollCue) scrollCue.classList.remove('is-shown');
    if (scrollUpCue) scrollUpCue.classList.remove('is-shown');

    // Temporarily suspend CSS snap during programmatic animated pan
    document.documentElement.style.scrollSnapType = 'none';

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // EaseInOutCubic: gentle departure, smooth glide, cushioned arrival
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      window.scrollTo(0, startY + diff * ease);

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        // Restore native snap once motion has completed and settled
        setTimeout(() => {
          document.documentElement.style.scrollSnapType = '';
          isAnimatingScroll = false;
          // 2. Only AFTER animation finishes: reveal the destination chevron!
          if (typeof onComplete === 'function') {
            onComplete();
          } else {
            updateCuesForCurrentSection();
          }
        }, 80);
      }
    }

    requestAnimationFrame(step);
  }

  if (scrollCue) {
    scrollCue.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.getElementById('explore');
      smoothScrollToElement(target, 900, () => {
        if (scrollUpCue) scrollUpCue.classList.add('is-shown');
      });
    });
  }

  if (scrollUpCue) {
    scrollUpCue.addEventListener('click', (e) => {
      e.preventDefault();
      smoothScrollToElement(document.body, 900, () => {
        if (scrollCue) scrollCue.classList.add('is-shown');
      });
    });
  }

  // Auto-complete full-page scroll animation on any wheel nudge
  let isWheelLocked = false;
  window.addEventListener('wheel', (e) => {
    if (!isIntroComplete || isAnimatingScroll || isWheelLocked) return;

    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const vh = window.innerHeight;

    // In Hero section, scrolling down -> auto-complete down to Section 2
    if (scrollY < vh * 0.25 && e.deltaY > 10) {
      isWheelLocked = true;
      const target = document.getElementById('explore');
      smoothScrollToElement(target, 900, () => {
        if (scrollUpCue) scrollUpCue.classList.add('is-shown');
        setTimeout(() => { isWheelLocked = false; }, 200);
      });
    }
    // In Section 2, scrolling up -> auto-complete up to Hero
    else if (scrollY > vh * 0.75 && e.deltaY < -10) {
      isWheelLocked = true;
      smoothScrollToElement(document.body, 900, () => {
        if (scrollCue) scrollCue.classList.add('is-shown');
        setTimeout(() => { isWheelLocked = false; }, 200);
      });
    }
  }, { passive: true });

  // Smooth scroll for any in-page anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    if (anchor.id === 'scroll-cue' || anchor.id === 'scroll-up-cue') return;
    anchor.addEventListener('click', (e) => {
      const hash = anchor.getAttribute('href');
      if (!hash || hash === '#') return;
      const target = document.querySelector(hash);
      if (target) {
        e.preventDefault();
        smoothScrollToElement(target, 850);
      }
    });
  });

  chips.forEach((c) => c.addEventListener('click', () => {
    chips.forEach((x) => x.classList.toggle('is-active', x === c));
    play(c.dataset.agentChip);
  }));

  play('intro');
}

// Initialize on DOM load
createNeuralNet(document.getElementById('neural-canvas'));
if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', runCinematicOrchestration);
} else {
  runCinematicOrchestration();
}
