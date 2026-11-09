/**
 * Interactive Engineering Workbench (`[data-projects-workbench]`) on About Me.
 *
 * Uses ONLY the verbatim project titles, tech tags, and descriptions from Luke's site:
 * 1. LLM Token Predictor (Python): A scaled-down transformer system implementing next word prediction capabilities.
 * 2. AI Scheduling (Python): Optimisation algorithms for dynamic pricing using discount criteria.
 * 3. Final Year Dissertation (C#, Unity, PPO): Built a PPO deep reinforcement learning agent to control a car navigating a custom Unity simulation.
 * 4. Wave Diffraction Simulator (C#, WPF): Interactive wave diffraction pattern simulation with visualisation.
 * 5. Delay-Tolerant Networking (C++, NS3): Routing protocols for mobile nodes in intermittent connectivity.
 * 6. 3D Browser Game (JavaScript, THREE.js): Browser-based 3D game using THREE.js for interactive environments.
 */
export function initProjectsStage() {
  const root = document.querySelector('[data-projects-workbench]');
  const canvas = document.getElementById('projects-stage-canvas');
  if (!root || !canvas) return;
  if (canvas.dataset.stageInitialized === 'true') return;
  canvas.dataset.stageInitialized = 'true';

  const ctx = canvas.getContext('2d');
  const tabs = root.querySelectorAll('[data-project-tab]');
  const tagsEl = root.querySelector('[data-wb-tags]');
  const titleEl = root.querySelector('[data-wb-title]');
  const skillsEl = root.querySelector('[data-wb-skills]');
  const descEl = root.querySelector('[data-wb-desc]');
  const controlsEl = root.querySelector('[data-wb-controls]');
  const linksEl = root.querySelector('[data-wb-links]');
  const hudTitleEl = root.querySelector('[data-wb-hud-title]');
  const hudReadoutEl = root.querySelector('[data-wb-hud-readout]');
  const captionEl = root.querySelector('[data-wb-caption]');


  let isWorkbenchVisible = true;
  let workbenchRafId = null;

  const state = {
    mode: 'llm',
    // 1. LLM Token Predictor state
    llmTemp: 0.7,
    llmContextIdx: 0,
    llmSampledIdx: 0,
    // 2. AI Comedy Show Scheduling state
    schedRevenueWeight: 0.85,
    schedAttendanceLoad: 0.9,
    schedClashSimulated: false,
    schedAnnealProgress: 1.0,
    schedAnnealing: false,
    schedShowCombos: true,
    // 3. Dissertation state
    ppoSpeedTarget: 0.8,
    // 4. Wave Diffraction state
    waveLambda: 520,
    waveSlitDist: 3.2,
    // 5. Packet Security Inspector state
    pktIdx: 0,
    pktScanProgress: 0,
    pktPauseTimer: 0,
    pktAutoStream: true,
    pktLastScanTime: 0,
    pktScannedCount: 0,
    pktThreatsBlocked: 0,
    // 6. 3D Rooftop Parkour Game state
    parkourSpeed: 1.2,
    parkourAction: 'run',
    parkourActionTimer: 0,
  };

  // 10 Packets stream for Network Security Inspector: 7 clean packets, 3 distinct attack vectors
  const PACKET_STREAM = [
    {
      id: 'PKT-101',
      src: '192.168.1.45',
      dst: '10.0.0.8',
      proto: 'TCP',
      port: '443',
      flags: 'ACK, PSH',
      ttl: 64,
      payload: 'GET /api/v2/stream HTTP/2',
      threat: null,
    },
    {
      id: 'PKT-102',
      src: '172.16.4.12',
      dst: '10.0.0.12',
      proto: 'UDP',
      port: '53',
      flags: 'NONE',
      ttl: 128,
      payload: 'DNS QUERY: auth.cluster.internal',
      threat: null,
    },
    {
      id: 'PKT-103',
      src: '45.142.12.89',
      dst: '10.0.0.2',
      proto: 'TCP',
      port: '443',
      flags: 'SYN',
      ttl: 32,
      payload: '[UNACKNOWLEDGED SYN BURST 48k pps]',
      threat: {
        type: 'DDOS_SYN_FLOOD',
        label: 'TCP SYN Flood (DDoS)',
        field: 'flags',
        desc: 'Abnormal burst of unacknowledged SYN packets exhausting connection backlog',
        action: 'DROP & RATE-LIMIT',
        color: '#ef4444',
      },
    },
    {
      id: 'PKT-104',
      src: '192.168.2.80',
      dst: '10.0.0.5',
      proto: 'TCP',
      port: '8080',
      flags: 'ACK',
      ttl: 64,
      payload: 'POST /v1/messages {"status":"alive"}',
      threat: null,
    },
    {
      id: 'PKT-105',
      src: '10.2.14.9',
      dst: '10.0.0.1',
      proto: 'TCP',
      port: '50051',
      flags: 'ACK, PSH',
      ttl: 64,
      payload: 'gRPC stream /Services.Telemetry/Ping',
      threat: null,
    },
    {
      id: 'PKT-106',
      src: '10.0.0.1',
      dst: '10.0.0.3',
      proto: 'TCP',
      port: '80',
      flags: 'SYN',
      ttl: 48,
      payload: 'HTTP/1.1 Ingress stream (Spoofed Source)',
      threat: {
        type: 'IP_SPOOFING',
        label: 'IP Spoofing / Martian Ingress',
        field: 'network',
        desc: 'Ingress packet on WAN interface claiming internal gateway source IP (10.0.0.1)',
        action: 'DROP & BCP-38 FILTER',
        color: '#f59e0b',
      },
    },
    {
      id: 'PKT-107',
      src: '192.168.1.18',
      dst: '10.0.0.6',
      proto: 'TCP',
      port: '443',
      flags: 'ACK',
      ttl: 64,
      payload: 'TLS 1.3 ApplicationData [1420 bytes]',
      threat: null,
    },
    {
      id: 'PKT-108',
      src: '10.0.0.4',
      dst: '10.0.0.4',
      proto: 'TCP',
      port: '80',
      flags: 'SYN',
      ttl: 64,
      payload: '[LAND ATTACK: SRC 10.0.0.4:80 == DST 10.0.0.4:80]',
      threat: {
        type: 'LAND_ATTACK',
        label: 'LAND Attack (Self-Loopback DoS)',
        field: 'transport',
        desc: 'Source IP & port identical to Destination IP & port with SYN flag',
        action: 'DROP & BLACKLIST',
        color: '#ef4444',
      },
    },
    {
      id: 'PKT-109',
      src: '172.16.8.90',
      dst: '10.0.0.8',
      proto: 'UDP',
      port: '443',
      flags: 'NONE',
      ttl: 64,
      payload: 'QUIC Initial handshake token [1200B]',
      threat: null,
    },
    {
      id: 'PKT-110',
      src: '192.168.1.202',
      dst: '10.0.0.9',
      proto: 'TCP',
      port: '22',
      flags: 'ACK, PSH',
      ttl: 64,
      payload: 'SSH-2.0-OpenSSH_9.3 Encrypted Session',
      threat: null,
    },
  ];

  const PROJECTS = {
    llm: {
      title: 'LLM Token Predictor',
      tags: ['Python'],
      skills: ['Python', 'PyTorch', 'Transformers', 'Softmax Sampling'],
      desc: 'A scaled-down transformer system implementing next word prediction capabilities.',
      hudTitle: 'Transformer Next-Word Prediction',
      caption: 'Drag the Temperature slider or switch context to watch the softmax next-word probabilities update live.',
      hasLinks: false,
      renderControls() {
        return `
          <div class="wb-control-row">
            <label class="wb-label" for="wb-llm-temp">
              <span>Sampling Temperature</span>
              <strong id="wb-llm-temp-val">${state.llmTemp.toFixed(2)}</strong>
            </label>
            <input id="wb-llm-temp" type="range" min="0.2" max="1.8" step="0.05" value="${state.llmTemp}" class="wb-slider">
          </div>
          <div class="wb-control-actions">
            <button type="button" class="wb-btn" data-wb-action="llm-context">Switch Context Prompt</button>
            <button type="button" class="wb-btn wb-btn--accent" data-wb-action="llm-sample">Sample Next Word</button>
          </div>
        `;
      },
    },

    scheduling: {
      title: 'AI Show Scheduling',
      tags: ['Python', 'CSP / AI'],
      skills: ['Python', 'Constraint Satisfaction (CSP)', 'Simulated Annealing', 'Combinatorial Optimisation'],
      desc: 'Constraint satisfaction and combinatorial optimisation solver for comedy festival scheduling—maximising ticket revenue and dynamic pricing discounts by pairing compatible double-bill shows while strictly satisfying performer clash and venue capacity constraints.',
      hudTitle: 'Comedy Festival Schedule & Income Optimisation',
      caption: 'Adjust Revenue Weight and Capacity to observe the simulated annealing solver resolving performer clashes and pairing compatible shows into dynamic combo passes.',
      hasLinks: false,
      renderControls() {
        return `
          <div class="wb-control-row">
            <label class="wb-label" for="wb-sched-rev">
              <span>Revenue Optimisation Weight</span>
              <strong id="wb-sched-rev-val">${Math.round(state.schedRevenueWeight * 100)}%</strong>
            </label>
            <input id="wb-sched-rev" type="range" min="0.4" max="1.0" step="0.05" value="${state.schedRevenueWeight}" class="wb-slider">
          </div>
          <div class="wb-control-row">
            <label class="wb-label" for="wb-sched-cap">
              <span>Festival Attendance Load</span>
              <strong id="wb-sched-cap-val">${Math.round(state.schedAttendanceLoad * 100)}%</strong>
            </label>
            <input id="wb-sched-cap" type="range" min="0.5" max="1.2" step="0.05" value="${state.schedAttendanceLoad}" class="wb-slider">
          </div>
          <div class="wb-control-actions">
            <button type="button" class="wb-btn wb-btn--accent" data-wb-action="sched-solve">Run Annealing Solver</button>
            <button type="button" class="wb-btn" data-wb-action="sched-clash">Simulate Clash</button>
            <button type="button" class="wb-btn" data-wb-action="sched-combos">${state.schedShowCombos ? 'Hide Combo Passes' : 'Show Combo Passes'}</button>
          </div>
        `;
      },
    },

    dissertation: {
      title: 'Final Year Dissertation',
      tags: ['C#', 'Unity', 'PPO'],
      skills: ['Unity', 'C#', 'Deep Reinforcement Learning', 'PPO', 'ML-Agents'],
      desc: 'Built a PPO deep reinforcement learning agent to control a car navigating a custom Unity simulation.',
      hudTitle: 'PPO Autonomous Vehicle Ray-Cast Simulation',
      caption: 'Adjust target velocity weight to observe the PPO agent balancing speed maintenance against obstacle avoidance.',
      hasLinks: true,
      renderControls() {
        return `
          <div class="wb-control-row">
            <label class="wb-label" for="wb-ppo-speed">
              <span>Velocity Reward Weight</span>
              <strong id="wb-ppo-speed-val">${state.ppoSpeedTarget.toFixed(2)}</strong>
            </label>
            <input id="wb-ppo-speed" type="range" min="0.3" max="1.4" step="0.05" value="${state.ppoSpeedTarget}" class="wb-slider">
          </div>
        `;
      },
    },

    diffraction: {
      title: 'Wave Diffraction Simulator',
      tags: ['C#', 'WPF'],
      skills: ['JavaScript', 'Canvas API', 'Wave Optics', 'Numerical Interference'],
      desc: 'Interactive wave diffraction pattern simulation with visualisation.',
      hudTitle: 'Double-Slit Wave Diffraction & Intensity Envelope',
      caption: 'Adjust wavelength (nm) and slit separation to compute the interference fringes and intensity profile.',
      hasLinks: false,
      renderControls() {
        return `
          <div class="wb-control-row">
            <label class="wb-label" for="wb-wave-lambda">
              <span>Wavelength (λ)</span>
              <strong id="wb-wave-lambda-val">${state.waveLambda} nm</strong>
            </label>
            <input id="wb-wave-lambda" type="range" min="420" max="680" step="10" value="${state.waveLambda}" class="wb-slider">
          </div>
          <div class="wb-control-row">
            <label class="wb-label" for="wb-wave-slit">
              <span>Slit Separation</span>
              <strong id="wb-wave-slit-val">${state.waveSlitDist.toFixed(1)}×</strong>
            </label>
            <input id="wb-wave-slit" type="range" min="1.5" max="5.5" step="0.2" value="${state.waveSlitDist}" class="wb-slider">
          </div>
        `;
      },
    },

    dtn: {
      title: 'Packet Security Inspector',
      tags: ['C / C++', 'NS-3', 'Networking'],
      skills: ['NS-3', 'C / C++', 'TCP/IP Protocols', 'Packet Inspection', 'Ingress Filtering'],
      desc: 'Deep packet inspection and ingress filtering engine that disassembles incoming network frames—analyzing IP/TCP headers and connection state flags to intercept TCP SYN floods, spoofed IP source addresses, and LAND self-loopback attacks in real time.',
      hudTitle: 'Network Packet Disassembly & Threat Detection',
      caption: 'Real-time packet inspection pipeline. Watch the scanner parse IP/TCP headers, validating clean traffic (7/10) and intercepting attack vectors (SYN Flood, IP Spoofing, and LAND Attacks). Note: This is an interactive visual representation of the project.',
      hasLinks: false,
      renderControls() {
        return `
          <div class="wb-control-actions">
            <button type="button" class="wb-btn wb-btn--accent" data-wb-action="pkt-next">Inspect Next Packet</button>
            <button type="button" class="wb-btn" data-wb-action="pkt-attack">Inject Attack Vector</button>
            <button type="button" class="wb-btn" data-wb-action="pkt-toggle">${state.pktAutoStream ? 'Pause Stream' : 'Resume Auto-Stream'}</button>
          </div>
        `;
      },
    },

    game3d: {
      title: '3D Parkour Game',
      tags: ['JavaScript', 'THREE.js'],
      skills: ['JavaScript', 'Three.js', 'WebGL', '3D Kinematics', 'Procedural Generation'],
      desc: 'Fast-paced first-person 3D rooftop parkour game built in Three.js and WebGL—featuring first-person momentum physics, procedural rooftop courses, wall-running velocity rails, and kinetic obstacle vaulting.',
      hudTitle: 'First-Person 3D Rooftop Parkour',
      caption: 'First-person procedural 3D rooftop runner. Look with the mouse, sprint across asphalt rooftops, leap over street chasms, and wall-run along skyscraper facades.',
      hasLinks: false,
      renderControls() {
        return `
          <div class="wb-control-row">
            <label class="wb-label" for="wb-parkour-speed">
              <span>Parkour Velocity</span>
              <strong id="wb-parkour-speed-val">${state.parkourSpeed.toFixed(1)}×</strong>
            </label>
            <input id="wb-parkour-speed" type="range" min="0.6" max="2.4" step="0.1" value="${state.parkourSpeed}" class="wb-slider">
          </div>
          <div class="wb-control-actions">
            <button type="button" class="wb-btn wb-btn--accent" data-wb-action="parkour-leap">Trigger Gap Leap</button>
            <button type="button" class="wb-btn" data-wb-action="parkour-wallrun">Trigger Wall-Run</button>
            <button type="button" class="wb-btn" data-wb-action="parkour-vault">Trigger Ledge Vault</button>
          </div>
        `;
      },
    },
  };

  const LLM_CONTEXTS = [
    {
      tokens: ['The', 'neural', 'network', 'learns', 'to'],
      candidates: [
        { word: 'predict', logit: 3.1 },
        { word: 'optimise', logit: 2.5 },
        { word: 'generalise', logit: 2.1 },
        { word: 'encode', logit: 1.6 },
        { word: 'classify', logit: 1.2 },
        { word: 'converge', logit: 0.8 },
      ],
    },
    {
      tokens: ['Self', 'attention', 'layers', 'compute', 'token'],
      candidates: [
        { word: 'weights', logit: 3.3 },
        { word: 'embeddings', logit: 2.7 },
        { word: 'representations', logit: 2.0 },
        { word: 'gradients', logit: 1.4 },
        { word: 'contexts', logit: 1.0 },
        { word: 'distributions', logit: 0.7 },
      ],
    },
    {
      tokens: ['Dynamic', 'pricing', 'models', 'balance', 'slot'],
      candidates: [
        { word: 'demand', logit: 3.0 },
        { word: 'discounts', logit: 2.6 },
        { word: 'capacity', logit: 2.1 },
        { word: 'schedules', logit: 1.5 },
        { word: 'utilisation', logit: 1.1 },
        { word: 'revenue', logit: 0.7 },
      ],
    },
  ];

  // Mobile nodes for DTN simulation
  const dtnNodes = Array.from({ length: 9 }, (_, i) => ({
    x: 0.15 + (i % 3) * 0.32 + (Math.random() - 0.5) * 0.08,
    y: 0.22 + Math.floor(i / 3) * 0.28 + (Math.random() - 0.5) * 0.08,
    vx: (Math.random() - 0.5) * 0.0022,
    vy: (Math.random() - 0.5) * 0.0022,
    hasBundle: i === 0,
  }));

  function bindControlEvents() {
    const tempInput = controlsEl.querySelector('#wb-llm-temp');
    if (tempInput) {
      tempInput.addEventListener('input', (e) => {
        state.llmTemp = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-llm-temp-val');
        if (val) val.textContent = state.llmTemp.toFixed(2);
        updateReadout();
      });
    }

    const schedRevInput = controlsEl.querySelector('#wb-sched-rev');
    if (schedRevInput) {
      schedRevInput.addEventListener('input', (e) => {
        state.schedRevenueWeight = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-sched-rev-val');
        if (val) val.textContent = `${Math.round(state.schedRevenueWeight * 100)}%`;
        updateReadout();
      });
    }

    const schedCapInput = controlsEl.querySelector('#wb-sched-cap');
    if (schedCapInput) {
      schedCapInput.addEventListener('input', (e) => {
        state.schedAttendanceLoad = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-sched-cap-val');
        if (val) val.textContent = `${Math.round(state.schedAttendanceLoad * 100)}%`;
        updateReadout();
      });
    }

    const ppoInput = controlsEl.querySelector('#wb-ppo-speed');
    if (ppoInput) {
      ppoInput.addEventListener('input', (e) => {
        state.ppoSpeedTarget = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-ppo-speed-val');
        if (val) val.textContent = state.ppoSpeedTarget.toFixed(2);
        updateReadout();
      });
    }

    const lambdaInput = controlsEl.querySelector('#wb-wave-lambda');
    if (lambdaInput) {
      lambdaInput.addEventListener('input', (e) => {
        state.waveLambda = parseInt(e.target.value, 10);
        const val = controlsEl.querySelector('#wb-wave-lambda-val');
        if (val) val.textContent = `${state.waveLambda} nm`;
        updateReadout();
      });
    }

    const slitInput = controlsEl.querySelector('#wb-wave-slit');
    if (slitInput) {
      slitInput.addEventListener('input', (e) => {
        state.waveSlitDist = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-wave-slit-val');
        if (val) val.textContent = `${state.waveSlitDist.toFixed(1)}×`;
        updateReadout();
      });
    }

    const parkourSpeedInput = controlsEl.querySelector('#wb-parkour-speed');
    if (parkourSpeedInput) {
      parkourSpeedInput.addEventListener('input', (e) => {
        state.parkourSpeed = parseFloat(e.target.value);
        const val = controlsEl.querySelector('#wb-parkour-speed-val');
        if (val) val.textContent = `${state.parkourSpeed.toFixed(1)}×`;
        updateReadout();
      });
    }

    controlsEl.querySelectorAll('[data-wb-action]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.wbAction;
        if (act === 'llm-context') {
          state.llmContextIdx = (state.llmContextIdx + 1) % LLM_CONTEXTS.length;
          state.llmSampledIdx = 0;
        } else if (act === 'llm-sample') {
          state.llmSampledIdx = (state.llmSampledIdx + 1) % 4;
        } else if (act === 'sched-solve') {
          state.schedAnnealing = true;
          state.schedAnnealProgress = 0;
          state.schedClashSimulated = false;
        } else if (act === 'sched-clash') {
          state.schedClashSimulated = true;
          state.schedAnnealing = false;
          state.schedAnnealProgress = 1.0;
        } else if (act === 'sched-combos') {
          state.schedShowCombos = !state.schedShowCombos;
          btn.textContent = state.schedShowCombos ? 'Hide Combo Passes' : 'Show Combo Passes';
        } else if (act === 'pkt-next') {
          state.pktIdx = (state.pktIdx + 1) % PACKET_STREAM.length;
          state.pktScanProgress = 0;
          state.pktPauseTimer = 0;
          PACKET_STREAM.forEach((p) => (p._threatPaused = false));
        } else if (act === 'pkt-attack') {
          // Jump to next attack packet in the stream
          const nextAttackIdx = PACKET_STREAM.findIndex(
            (p, idx) => idx > state.pktIdx && p.threat !== null,
          );
          state.pktIdx = nextAttackIdx !== -1 ? nextAttackIdx : 2;
          state.pktScanProgress = 0;
          state.pktPauseTimer = 0;
          PACKET_STREAM.forEach((p) => (p._threatPaused = false));
        } else if (act === 'pkt-toggle') {
          state.pktAutoStream = !state.pktAutoStream;
          btn.textContent = state.pktAutoStream ? 'Pause Stream' : 'Resume Auto-Stream';
        } else if (act === 'parkour-leap') {
          state.parkourAction = 'jump';
          state.parkourActionTimer = 1.2;
        } else if (act === 'parkour-wallrun') {
          state.parkourAction = 'wallrun';
          state.parkourActionTimer = 1.4;
        } else if (act === 'parkour-vault') {
          state.parkourAction = 'vault';
          state.parkourActionTimer = 1.0;
        }
      });
    });
  }

  function updateReadout() {
    if (!hudReadoutEl) return;
    if (state.mode === 'llm') {
      hudReadoutEl.textContent = `Temperature = ${state.llmTemp.toFixed(2)}`;
    } else if (state.mode === 'scheduling') {
      const revenue = Math.round(18650 * state.schedRevenueWeight * state.schedAttendanceLoad);
      const clashes = state.schedClashSimulated ? 1 : 0;
      hudReadoutEl.textContent = `Projected Revenue: £${revenue.toLocaleString()} · Clashes: ${clashes}`;
    } else if (state.mode === 'dissertation') {
      hudReadoutEl.textContent = `Velocity Weight = ${state.ppoSpeedTarget.toFixed(2)}`;
    } else if (state.mode === 'diffraction') {
      hudReadoutEl.textContent = `λ = ${state.waveLambda}nm, d = ${state.waveSlitDist.toFixed(1)}×`;
    } else if (state.mode === 'dtn') {
      const curPkt = PACKET_STREAM[state.pktIdx];
      hudReadoutEl.textContent = `Packet ${state.pktIdx + 1}/10: ${curPkt.id} [${curPkt.proto}] · ${curPkt.threat ? 'THREAT INTERCEPTED' : 'CLEAN TRAFFIC'}`;
    } else if (state.mode === 'game3d') {
      hudReadoutEl.textContent = `Speed: ${state.parkourSpeed.toFixed(1)}× · Stance: ${state.parkourAction.toUpperCase()}`;
    }
  }

  const panelEl = root.querySelector('[data-wb-panel]');
  let switchTimer = null;

  function applyModeContent(mode) {
    state.mode = mode;
    const p = PROJECTS[mode];

    if (tagsEl) {
      tagsEl.innerHTML = p.tags.map((tag) => `<span>${tag}</span>`).join('');
    }
    if (titleEl) titleEl.textContent = p.title;
    if (skillsEl && p.skills) {
      skillsEl.innerHTML = p.skills
        .map((s) => `<span class="wb-skill">${s}</span>`)
        .join('<span class="wb-skill-sep" aria-hidden="true"> · </span>');
    }
    if (descEl) descEl.textContent = p.desc;
    if (hudTitleEl) hudTitleEl.textContent = p.hudTitle;
    if (captionEl) captionEl.textContent = p.caption;
    if (linksEl) linksEl.hidden = !p.hasLinks;
    if (controlsEl) {
      controlsEl.innerHTML = p.renderControls();
      bindControlEvents();
    }
    updateReadout();
  }

  function setMode(mode, immediate = false) {
    if (!PROJECTS[mode]) return;
    startWorkbenchLoop();
    if (mode === state.mode && !immediate) return;

    tabs.forEach((t) => {
      const active = t.dataset.projectTab === mode;
      t.classList.toggle('is-active', active);
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      if (!immediate && active && t.parentElement) {
        const container = t.parentElement;
        const targetLeft = t.offsetLeft - (container.clientWidth - t.clientWidth) / 2;
        container.scrollTo({ left: targetLeft, behavior: 'smooth' });
      }
    });

    if (immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      applyModeContent(mode);
      return;
    }

    if (switchTimer) clearTimeout(switchTimer);
    if (panelEl) panelEl.classList.add('is-switching');
    canvas.classList.add('is-switching');

    switchTimer = setTimeout(() => {
      applyModeContent(mode);
      requestAnimationFrame(() => {
        if (panelEl) panelEl.classList.remove('is-switching');
        canvas.classList.remove('is-switching');
      });
    }, 140);
  }

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => setMode(tab.dataset.projectTab));
  });

  // Canvas Setup & Render Loop
  let w = 0;
  let h = 0;
  let t = 0;
  const pointer = { x: 0.5, y: 0.5 };

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    w = Math.round(rect.width);
    h = Math.round(rect.height);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }

    canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.clientX - r.left) / r.width;
    pointer.y = (e.clientY - r.top) / r.height;
  });

  canvas.addEventListener('touchmove', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.touches[0].clientX - r.left) / r.width;
    pointer.y = (e.touches[0].clientY - r.top) / r.height;
  }, { passive: true });

  canvas.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches[0]) return;
    const r = canvas.getBoundingClientRect();
    pointer.x = (e.touches[0].clientX - r.left) / r.width;
    pointer.y = (e.touches[0].clientY - r.top) / r.height;
  }, { passive: true });

  window.addEventListener('resize', resize, { passive: true });
  resize();
  setMode('llm', true);

  // 1. LLM Token Predictor Visualisation
  function drawLlm() {
    const ctxData = LLM_CONTEXTS[state.llmContextIdx];
    const tokens = ctxData.tokens;
    const temp = Math.max(0.15, state.llmTemp);

    // Compute temperature-scaled softmax probabilities
    const scaled = ctxData.candidates.map((c) => Math.exp(c.logit / temp));
    const sum = scaled.reduce((a, b) => a + b, 0);
    const probs = ctxData.candidates.map((c, idx) => ({
      word: c.word,
      p: scaled[idx] / sum,
    }));

    // Left side: Context tokens & causal self-attention arcs
    const leftX = 32;
    const spacingY = (h - 70) / tokens.length;

    tokens.forEach((tok, i) => {
      const y = 44 + i * spacingY;
      // Draw attention arc from each token to the final query token
      const lastY = 44 + (tokens.length - 1) * spacingY;
      if (i < tokens.length - 1) {
        const attnWeight = (i + 1) / tokens.length;
        ctx.strokeStyle = `rgba(45, 212, 191, ${(0.14 + attnWeight * 0.38).toFixed(2)})`;
        ctx.lineWidth = 1 + attnWeight * 1.6;
        ctx.beginPath();
        ctx.moveTo(leftX + 86, y);
        ctx.quadraticCurveTo(leftX + 135, (y + lastY) * 0.5, leftX + 86, lastY);
        ctx.stroke();
      }

      ctx.fillStyle = i === tokens.length - 1 ? 'rgba(45, 212, 191, 0.18)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = i === tokens.length - 1 ? '#2dd4bf' : 'rgba(255, 255, 255, 0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(leftX, y - 13, 84, 26, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '500 12px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(tok, leftX + 42, y + 4);
    });

    // Right side: Softmax Probability Distribution
    const barStartX = Math.min(235, w * 0.44);
    const maxBarW = Math.max(80, w - barStartX - 65);
    const rowH = (h - 64) / probs.length;

    probs.forEach((item, idx) => {
      const y = 42 + idx * rowH;
      const isSelected = idx === state.llmSampledIdx;

      ctx.fillStyle = isSelected ? '#ffffff' : 'rgba(226, 232, 240, 0.8)';
      ctx.font = isSelected ? '600 12px "JetBrains Mono Variable", monospace' : '400 12px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(item.word, barStartX - 12, y + 4);

      // Bar track
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.beginPath();
      ctx.roundRect(barStartX, y - 8, maxBarW, 16, 4);
      ctx.fill();

      // Bar fill
      const fillW = Math.max(4, item.p * maxBarW);
      ctx.fillStyle = isSelected ? '#2dd4bf' : 'rgba(56, 189, 248, 0.45)';
      ctx.beginPath();
      ctx.roundRect(barStartX, y - 8, fillW, 16, 4);
      ctx.fill();

      // Percentage readout
      ctx.fillStyle = isSelected ? '#2dd4bf' : 'rgba(148, 163, 184, 0.9)';
      ctx.textAlign = 'left';
      ctx.fillText(`${(item.p * 100).toFixed(1)}%`, barStartX + fillW + 8, y + 4);
    });
  }

  // 2. AI Comedy Show Scheduling & Income Optimisation
  function drawScheduling() {
    const venues = [
      { name: 'Main Hall', cap: 400, basePrice: 28 },
      { name: 'The Attic', cap: 180, basePrice: 22 },
      { name: 'Cellar Club', cap: 110, basePrice: 18 },
      { name: 'Studio 3', cap: 80, basePrice: 14 },
    ];
    const times = ['18:00', '19:30', '21:00', '22:30'];

    // Simulated Annealing progress
    if (state.schedAnnealing) {
      state.schedAnnealProgress = Math.min(1.0, state.schedAnnealProgress + 0.025);
      if (state.schedAnnealProgress >= 1.0) {
        state.schedAnnealing = false;
        state.schedClashSimulated = false;
      }
    }

    const isClashing = state.schedClashSimulated && state.schedAnnealProgress >= 1.0;

    // Show schedule matrix (Titles tightly sized to fit grid columns cleanly)
    const acts = [
      // 18:00
      { venue: 0, time: 0, title: 'Main Showcase', genre: 'Stand-Up', draw: 0.95 },
      { venue: 1, time: 0, title: 'Fringe Preview', genre: 'Preview', draw: 0.88, comboId: 'B' },
      { venue: 2, time: 0, title: 'New Act Gala', genre: 'Showcase', draw: 0.78 },
      { venue: 3, time: 0, title: 'Sketch WIP', genre: 'Work in Prog', draw: 0.7 },
      // 19:30
      {
        venue: 0,
        time: 1,
        title: 'James & Ed Duo',
        genre: 'Improv',
        draw: 1.0,
        performer: 'James A.',
        comboId: 'A',
      },
      {
        venue: 1,
        time: 1,
        title: isClashing ? 'James A. Solo' : 'Rose Matafeo',
        genre: 'Solo Hour',
        draw: 0.92,
        performer: isClashing ? 'James A.' : 'Rose M.',
        clash: isClashing,
      },
      { venue: 2, time: 1, title: 'Dark Comedy', genre: 'Stand-Up', draw: 0.85, comboId: 'B' },
      { venue: 3, time: 1, title: 'Open Mic Finals', genre: 'Competition', draw: 0.75 },
      // 21:00 (Peak headliners)
      { venue: 0, time: 2, title: 'Headliner Gala', genre: 'Gala Special', draw: 1.0 },
      {
        venue: 1,
        time: 2,
        title: isClashing ? 'Rose Matafeo' : 'James A. Solo',
        genre: 'Headliner',
        draw: 0.95,
        performer: 'James A.',
        comboId: 'A',
      },
      { venue: 2, time: 2, title: 'Roast Battle', genre: 'Panel Roast', draw: 0.9, comboId: 'C' },
      { venue: 3, time: 2, title: 'Late Cabaret', genre: 'Variety', draw: 0.8 },
      // 22:30
      { venue: 0, time: 3, title: 'Festival Late Jam', genre: 'Improv Jam', draw: 0.9 },
      { venue: 1, time: 3, title: 'Secret Guest', genre: 'Special Set', draw: 0.92 },
      { venue: 2, time: 3, title: 'Cellar Improv', genre: 'Late Improv', draw: 0.85, comboId: 'C' },
      { venue: 3, time: 3, title: 'Closing Crowd', genre: 'Open Stage', draw: 0.7 },
    ];

    const padLeft = 48;
    const padTop = 44;
    const gridW = w - padLeft - 16;
    const gridH = h - padTop - 26;
    const colW = gridW / venues.length;
    const rowH = gridH / times.length;

    // Header Status Bar
    const baseRev = 21450;
    const revPenalty = isClashing ? 4200 : 0;
    const comboBonus = state.schedShowCombos && !isClashing ? 3850 : 0;
    const totalRev = Math.round(
      (baseRev - revPenalty + comboBonus) * state.schedRevenueWeight * state.schedAttendanceLoad,
    );

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, w, h);

    // Top Header Banner (Rigidly partitioned so left text can NEVER touch right badge)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(0, 0, w, 32);

    // Right Badge: Box-Office Revenue
    const revBadgeW = 142;
    const revBadgeX = w - revBadgeW - 12;
    ctx.fillStyle = 'rgba(45, 212, 191, 0.12)';
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(revBadgeX, 5, revBadgeW, 22, 3);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '700 9.5px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`BOX-OFFICE: £${totalRev.toLocaleString()}`, revBadgeX + revBadgeW * 0.5, 19);

    // Left Title: Strictly clipped to end at least 15px BEFORE the right badge
    ctx.save();
    ctx.beginPath();
    ctx.rect(padLeft, 0, Math.max(10, revBadgeX - padLeft - 15), 32);
    ctx.clip();

    ctx.font = '700 9.5px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = isClashing ? '#f59e0b' : '#2dd4bf';

    const headerMsg = isClashing
      ? '⚠️ CONSTRAINT CLASH: [James A.] double-booked at 19:30!'
      : state.schedAnnealing
        ? 'ANNEALING SOLVER RUNNING... REARRANGING SLOTS'
        : state.schedShowCombos
          ? '✓ FEASIBLE SCHEDULE · 3 COMBO PASSES ACTIVE'
          : '✓ FEASIBLE SCHEDULE · 0 CLASHES · REVENUE MAXIMISED';

    ctx.fillText(headerMsg, padLeft, 20);
    ctx.restore();

    // Venue Column Headers
    venues.forEach((v, c) => {
      const vx = padLeft + c * colW;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.fillRect(vx + 2, padTop - 18, colW - 4, 15);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 9.5px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${v.name.toUpperCase()} (${v.cap})`, vx + colW * 0.5, padTop - 7);
    });

    // Time Row Headers
    times.forEach((tStr, r) => {
      const ty = padTop + r * rowH + rowH * 0.5;
      ctx.fillStyle = '#64748b';
      ctx.font = '500 9.5px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'right';
      ctx.fillText(tStr, padLeft - 8, ty + 3);
    });

    // Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    for (let c = 0; c <= venues.length; c++) {
      const x = padLeft + c * colW;
      ctx.beginPath();
      ctx.moveTo(x, padTop);
      ctx.lineTo(x, padTop + gridH);
      ctx.stroke();
    }
    for (let r = 0; r <= times.length; r++) {
      const y = padTop + r * rowH;
      ctx.beginPath();
      ctx.moveTo(padLeft, y);
      ctx.lineTo(padLeft + gridW, y);
      ctx.stroke();
    }

    // Render scheduled show cards with strict boundary clipping so text NEVER bleeds across columns
    acts.forEach((act) => {
      const x = padLeft + act.venue * colW + 2;
      const y = padTop + act.time * rowH + 2;
      const cardW = colW - 4;
      const cardH = rowH - 4;

      const v = venues[act.venue];
      const slotPrice = Math.round(
        v.basePrice * act.draw * state.schedRevenueWeight * state.schedAttendanceLoad,
      );
      const slotRev = Math.round(slotPrice * v.cap * 0.88);
      const isConflict = act.clash || (isClashing && act.venue === 0 && act.time === 1);

      // Card Background & Border
      ctx.fillStyle = isConflict
        ? 'rgba(239, 68, 68, 0.22)'
        : act.comboId && state.schedShowCombos && !isClashing
          ? act.comboId === 'A'
            ? 'rgba(45, 212, 191, 0.15)'
            : 'rgba(245, 158, 11, 0.12)'
          : act.venue === 0
            ? 'rgba(45, 212, 191, 0.09)'
            : 'rgba(56, 189, 248, 0.07)';

      ctx.strokeStyle = isConflict
        ? '#ef4444'
        : act.comboId && state.schedShowCombos && !isClashing
          ? act.comboId === 'A'
            ? 'rgba(45, 212, 191, 0.65)'
            : 'rgba(245, 158, 11, 0.6)'
          : act.venue === 0
            ? 'rgba(45, 212, 191, 0.35)'
            : 'rgba(56, 189, 248, 0.22)';
      ctx.lineWidth = isConflict ? 1.8 : 1;

      ctx.beginPath();
      ctx.roundRect(x, y, cardW, cardH, 4);
      ctx.fill();
      ctx.stroke();

      // STRICT CLIPPING TO CARD BOUNDARY: Prevents any text from overflowing into adjacent columns
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(x + 2, y + 2, cardW - 4, cardH - 4, 3);
      ctx.clip();

      // Row 1: Show Title
      ctx.fillStyle = isConflict ? '#fca5a5' : '#f8fafc';
      ctx.font = '600 9px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(act.title, x + 5, y + 13);

      // Row 2: Genre or Performer Tag
      ctx.fillStyle = isConflict ? '#ef4444' : '#94a3b8';
      ctx.font = '500 7.5px "JetBrains Mono Variable", monospace';
      ctx.fillText(act.performer ? `by ${act.performer}` : act.genre, x + 5, y + 23);

      // Row 3: Revenue & Price per Seat
      ctx.fillStyle = isConflict ? '#ef4444' : '#2dd4bf';
      ctx.font = '600 8.5px "JetBrains Mono Variable", monospace';
      ctx.fillText(isConflict ? '⚠️ CLASH' : `+£${(slotRev / 1000).toFixed(1)}k`, x + 5, y + 34);

      ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
      ctx.textAlign = 'right';
      ctx.fillText(`£${slotPrice}/seat`, x + cardW - 5, y + 34);

      ctx.restore();
    });

    // 1. Render Dynamic Pricing Combo Arcs connecting compatible shows (Double-Bill discounts)
    if (state.schedShowCombos && !isClashing) {
      const combos = [
        // Combo A: Main Hall (19:30 James & Ed Duo) ⟷ The Attic (21:00 James A. Solo)
        {
          from: { v: 0, r: 1 },
          to: { v: 1, r: 2 },
          label: '-15% COMBO',
          color: '#2dd4bf',
          boost: '+32% FILL',
        },
        // Combo B: The Attic (18:00 Fringe Preview) ⟷ Cellar Club (19:30 Dark Comedy)
        {
          from: { v: 1, r: 0 },
          to: { v: 2, r: 1 },
          label: '-20% EARLY',
          color: '#f59e0b',
          boost: '+28% FILL',
        },
        // Combo C: Cellar Club (21:00 Roast Battle) ⟷ Cellar Club (22:30 Cellar Improv)
        {
          from: { v: 2, r: 2 },
          to: { v: 2, r: 3 },
          label: '-10% LATE',
          color: '#a855f7',
          boost: '+22% FILL',
        },
      ];

      combos.forEach((c) => {
        const x1 = padLeft + c.from.v * colW + colW * 0.5;
        const y1 = padTop + c.from.r * rowH + rowH * 0.5;
        const x2 = padLeft + c.to.v * colW + colW * 0.5;
        const y2 = padTop + c.to.r * rowH + rowH * 0.5;

        // Draw curved connector arc
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1.6;
        ctx.setLineDash([4, 3]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const midX = (x1 + x2) * 0.5 + (c.from.v === c.to.v ? 24 : 0);
        const midY = (y1 + y2) * 0.5;
        ctx.quadraticCurveTo(midX, midY, x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);

        // Animated traveling energy pulse along arc
        const pFrac = (t * 0.75 + (c.label.length * 0.2)) % 1.0;
        const pulseX = (1 - pFrac) * (1 - pFrac) * x1 + 2 * (1 - pFrac) * pFrac * midX + pFrac * pFrac * x2;
        const pulseY = (1 - pFrac) * (1 - pFrac) * y1 + 2 * (1 - pFrac) * pFrac * midY + pFrac * pFrac * y2;

        ctx.fillStyle = c.color;
        ctx.beginPath();
        ctx.arc(pulseX, pulseY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Discount Tag at midpoint
        ctx.fillStyle = '#0f172a';
        ctx.strokeStyle = c.color;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - 34, midY - 8, 68, 15, 3);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = c.color;
        ctx.font = '700 7.5px "JetBrains Mono Variable", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(c.label, midX, midY + 3);
      });
    }

    // 2. Draw animated clash connector if in conflict
    if (isClashing) {
      const c1X = padLeft + 0.5 * colW;
      const c1Y = padTop + 1.5 * rowH;
      const c2X = padLeft + 1.5 * colW;
      const c2Y = padTop + 1.5 * rowH;

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2.2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(c1X, c1Y);
      ctx.quadraticCurveTo((c1X + c2X) * 0.5, c1Y - 24, c2X, c2Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc((c1X + c2X) * 0.5, c1Y - 18, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Clash Warning Callout
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect((c1X + c2X) * 0.5 - 62, c1Y - 36, 124, 18, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '700 8px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('⚠️ DOUBLE-BOOKED [James A.]', (c1X + c2X) * 0.5, c1Y - 24);
    }
  }

  // 3. Final Year Dissertation Visualisation (Causally Accurate PPO Overtaking)
  function smoothstep(edge0, edge1, x) {
    const cl = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return cl * cl * (3 - 2 * cl);
  }

  function drawDissertation() {
    const roadTop = h * 0.2;
    const roadBot = h * 0.8;
    const roadH = roadBot - roadTop;
    const topLaneY = roadTop + roadH * 0.26;
    const bottomLaneY = roadTop + roadH * 0.74;

    // Road asphalt and curbs
    ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
    ctx.fillRect(0, roadTop, w, roadH);

    ctx.fillStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.fillRect(0, roadTop - 4, w, 4);
    ctx.fillRect(0, roadBot, w, 4);

    ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, roadTop);
    ctx.lineTo(w, roadTop);
    ctx.moveTo(0, roadBot);
    ctx.lineTo(w, roadBot);
    ctx.stroke();

    ctx.save();
    ctx.setLineDash([18, 16]);
    ctx.lineDashOffset = (t * 165 * state.ppoSpeedTarget) % 34;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();
    ctx.restore();

    const egoX = Math.max(52, w * 0.25);
    const cycleSpan = Math.max(340, w + 140);
    const obsX = w + 30 - ((t * 115 * state.ppoSpeedTarget) % cycleSpan);
    const obsY = topLaneY;
    const carHalfL = 22;
    const carHalfW = 11;

    const distX = obsX - egoX;

    // 1. Forward rays detect obstacle at distX <= 205 while still cruising in topLaneY
    // 2. Lane change initiates at distX <= 145 and completes by distX = 68
    // 3. Holds passing lane (bottomLaneY) across [-82, 68] until rear bumper clears obstacle
    // 4. Smoothly merges back into topLaneY across [-165, -82]
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

    const maxRayRange = Math.min(215, Math.max(140, w * 0.65));
    const rays = [
      { ang: -0.52, range: maxRayRange * 0.9 },
      { ang: -0.39, range: maxRayRange * 0.95 },
      { ang: -0.26, range: maxRayRange * 0.98 },
      { ang: 0, range: maxRayRange },
      { ang: 0.13, range: maxRayRange },
      { ang: 0.26, range: maxRayRange * 0.98 },
      { ang: 0.39, range: maxRayRange * 0.95 },
      { ang: 0.52, range: maxRayRange * 0.9 },
      { ang: -1.15, range: 75 },
      { ang: -1.57, range: 70 },
      { ang: -2.05, range: 75 },
    ];

    rays.forEach(({ ang, range }) => {
      const a = heading + ang;
      let hitDist = range;
      let hitCar = false;
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
          hitCar = true;
          break;
        }
        if (ry <= roadTop || ry >= roadBot) {
          hitDist = d;
          break;
        }
      }
      const ex = egoX + Math.cos(a) * hitDist;
      const ey = egoY + Math.sin(a) * hitDist;

      ctx.beginPath();
      ctx.moveTo(egoX, egoY);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = hitCar ? 'rgba(245, 158, 11, 0.85)' : 'rgba(45, 212, 191, 0.32)';
      ctx.lineWidth = hitCar ? 1.9 : 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ex, ey, hitCar ? 3.5 : 2, 0, Math.PI * 2);
      ctx.fillStyle = hitCar ? '#f59e0b' : '#2dd4bf';
      ctx.fill();
    });

    // Obstacle vehicle
    ctx.fillStyle = 'rgba(244, 63, 94, 0.88)';
    ctx.beginPath();
    ctx.roundRect(obsX - carHalfL, obsY - carHalfW, carHalfL * 2, carHalfW * 2, 5);
    ctx.fill();

    // PPO autonomous agent vehicle
    ctx.save();
    ctx.translate(egoX, egoY);
    ctx.rotate(heading);
    ctx.fillStyle = '#2dd4bf';
    ctx.beginPath();
    ctx.roundRect(-carHalfL, -carHalfW, carHalfL * 2, carHalfW * 2, 5);
    ctx.fill();
    ctx.restore();

    // PPO Telemetry HUD
    const hudW = Math.min(270, w - 24);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(12, 10, hudW, 26, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#2dd4bf';
    const stateLabel = evade > 0.05 ? (evade >= 0.95 ? 'LANE CHANGE [HOLD]' : 'PPO EVADING') : 'CRUISING [TOP LANE]';
    ctx.fillText(`PPO VEL: ${(state.ppoSpeedTarget * 45).toFixed(1)} KM/H · ${stateLabel}`, 18, 26);
  }

  // 4. Wave Diffraction Simulator Visualisation
  function drawDiffraction() {
    const slitX = 56;
    const sep = state.waveSlitDist * 18;
    const s1Y = h * 0.5 - sep * 0.5;
    const s2Y = h * 0.5 + sep * 0.5;
    const k = (700 - state.waveLambda) * 0.00045 + 0.14;

    // Spectral hue from wavelength (420nm blue/violet -> 680nm red)
    const hue = Math.round(260 - ((state.waveLambda - 420) / 260) * 255);

    // Barrier wall with 2 slits
    ctx.strokeStyle = 'rgba(226, 232, 240, 0.55)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(slitX, 16);
    ctx.lineTo(slitX, s1Y - 8);
    ctx.moveTo(slitX, s1Y + 8);
    ctx.lineTo(slitX, s2Y - 8);
    ctx.moveTo(slitX, s2Y + 8);
    ctx.lineTo(slitX, h - 16);
    ctx.stroke();

    // Expanding cylindrical wave crests from both slits
    for (let r = (t * 48) % 24; r < w * 0.65; r += 24) {
      ctx.strokeStyle = `hsla(${hue}, 88%, 62%, ${Math.max(0.06, 0.42 - r / (w * 0.85))})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(slitX, s1Y, r, -Math.PI * 0.46, Math.PI * 0.46);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(slitX, s2Y, r, -Math.PI * 0.46, Math.PI * 0.46);
      ctx.stroke();
    }

    // Far-field intensity envelope on the right screen
    const screenX = w - 95;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(screenX, 20);
    ctx.lineTo(screenX, h - 20);
    ctx.stroke();

    ctx.beginPath();
    for (let y = 24; y < h - 24; y += 2) {
      const d1 = Math.hypot(screenX - slitX, y - s1Y);
      const d2 = Math.hypot(screenX - slitX, y - s2Y);
      const phaseDiff = (d2 - d1) * k;
      const env = Math.exp(-Math.pow((y - h * 0.5) / (h * 0.34), 2));
      const intensity = Math.pow(Math.cos(phaseDiff), 2) * env;
      const px = screenX + intensity * 68;
      if (y === 24) ctx.moveTo(px, y);
      else ctx.lineTo(px, y);
    }
    ctx.strokeStyle = `hsl(${hue}, 92%, 65%)`;
    ctx.lineWidth = 2.2;
    ctx.stroke();
  }

  // 5. Packet Security Inspector (Disassembly & Attack Vector Detection)
  function drawDtn() {
    ctx.fillStyle = '#0b1120';
    ctx.fillRect(0, 0, w, h);

    const curPkt = PACKET_STREAM[state.pktIdx];
    const isAttack = curPkt.threat !== null;
    const threatLayerIdx = curPkt.threat?.type === 'IP_SPOOFING'
      ? 1
      : curPkt.threat?.type === 'DDOS_SYN_FLOOD' || curPkt.threat?.type === 'LAND_ATTACK'
        ? 2
        : -1;
    const threatTriggerNorm = threatLayerIdx !== -1 ? (threatLayerIdx + 0.38) / 4 : 2.0;

    // Auto-advance packet inspection progress with pause on detected threat
    if (state.pktAutoStream) {
      if (isAttack && !curPkt._threatPaused && state.pktScanProgress >= threatTriggerNorm) {
        if (state.pktPauseTimer <= 0) {
          state.pktPauseTimer = 3.0; // Freeze for 3.0 seconds so user can see and process
        } else {
          state.pktPauseTimer -= 0.016; // ~60fps step
          state.pktScanProgress = threatTriggerNorm; // Lock beam to the compromised layer
          if (state.pktPauseTimer <= 0) {
            curPkt._threatPaused = true;
          }
        }
      } else {
        state.pktScanProgress += 0.0032;
        if (state.pktScanProgress >= 1.25) {
          state.pktScanProgress = 0;
          state.pktPauseTimer = 0;
          curPkt._threatPaused = false;
          state.pktIdx = (state.pktIdx + 1) % PACKET_STREAM.length;
          updateReadout();
        }
      }
    }

    const scanYNorm = Math.min(1.0, state.pktScanProgress);
    const hasHitThreat = isAttack && scanYNorm >= threatTriggerNorm;

    // Header Status Bar (Clean separated bounds so left and right text never collide)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.fillRect(0, 0, w, 32);

    ctx.font = '700 10.5px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = hasHitThreat ? '#ef4444' : '#2dd4bf';
    ctx.fillText(
      hasHitThreat
        ? `⚠️ ALERT: [${curPkt.threat.type}] ON ${curPkt.id}`
        : '✓ INGRESS PACKET INSPECTOR (L2-L7 DEEP SCAN)',
      16,
      20,
    );

    ctx.textAlign = 'right';
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 10px "JetBrains Mono Variable", monospace';
    ctx.fillText(
      `STREAM: ${state.pktIdx + 1}/10 (7 CLEAN · 3 BLOCKED)`,
      w - 16,
      20,
    );

    // Left Pane: Ingress Packet Queue (10 packets)
    // Packets are NEVER marked as ALERT before being inspected and reached!
    const queueX = 14;
    const queueY = 42;
    const queueW = 118;
    const queueH = h - 54;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(queueX, queueY, queueW, queueH, 6);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#64748b';
    ctx.fillText('INGRESS QUEUE', queueX + 10, queueY + 16);

    const rowH = (queueH - 24) / 10;
    PACKET_STREAM.forEach((pkt, i) => {
      const py = queueY + 22 + i * rowH;
      const isActive = i === state.pktIdx;
      const isPast = i < state.pktIdx;
      const hasThreat = pkt.threat !== null;

      let statusBadge = 'QUEUE';
      let statusColor = '#64748b';

      if (isPast) {
        statusBadge = hasThreat ? 'ALERT' : 'PASS';
        statusColor = hasThreat ? '#ef4444' : '#10b981';
      } else if (isActive) {
        statusBadge = hasHitThreat ? 'ALERT' : 'SCAN';
        statusColor = hasHitThreat ? '#ef4444' : '#2dd4bf';
      } else {
        statusBadge = 'QUEUE';
        statusColor = '#475569';
      }

      if (isActive) {
        ctx.fillStyle = hasHitThreat ? 'rgba(239, 68, 68, 0.22)' : 'rgba(45, 212, 191, 0.18)';
        ctx.strokeStyle = hasHitThreat ? '#ef4444' : '#2dd4bf';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(queueX + 4, py - 1, queueW - 8, rowH - 2, 3);
        ctx.fill();
        ctx.stroke();
      }

      ctx.font = `${isActive ? '700' : '500'} 8.5px "JetBrains Mono Variable", monospace`;
      ctx.textAlign = 'left';
      ctx.fillStyle = isActive ? '#f8fafc' : isPast && hasThreat ? '#fca5a5' : '#94a3b8';
      ctx.fillText(`${pkt.id}`, queueX + 8, py + 10);

      ctx.textAlign = 'right';
      ctx.font = '700 8px "JetBrains Mono Variable", monospace';
      ctx.fillStyle = statusColor;
      ctx.fillText(statusBadge, queueX + queueW - 8, py + 10);
    });

    // Center Pane: Packet Disassembly Chamber
    const chamberX = queueX + queueW + 12;
    const chamberY = 42;
    const chamberW = w - chamberX - 16;
    const chamberH = h - 54;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = hasHitThreat ? 'rgba(239, 68, 68, 0.4)' : 'rgba(45, 212, 191, 0.25)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.roundRect(chamberX, chamberY, chamberW, chamberH, 6);
    ctx.fill();
    ctx.stroke();

    // Chamber title
    ctx.font = '700 9.5px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#94a3b8';
    ctx.fillText(`DEEP DISASSEMBLY & PROTOCOL PARSER: ${curPkt.id}`, chamberX + 12, chamberY + 18);

    // 4 Layer Blocks: L2, L3, L4, L7
    const layers = [
      {
        tag: 'LAYER 2: FRAME (ETHERNET II, 802.3)',
        row1: 'Type: 0x0800 (IPv4) · FCS: 0x9A4E21BC · Frame: 1,514 B',
        row2: 'Src MAC: 52:54:00:1A:8F:22  →  Dst: 52:54:00:99:BC:01',
        isFlagged: false,
      },
      {
        tag: 'LAYER 3: NETWORK (IPv4 HEADER, RFC 791)',
        row1: `Src: ${curPkt.src}  →  Dst: ${curPkt.dst}  ·  TTL: ${curPkt.ttl}`,
        row2: curPkt.threat?.type === 'IP_SPOOFING'
          ? 'Src: 10.0.0.1 [MARTIAN INGRESS: GATEWAY IP ON WAN] · Chk: 0x2B81'
          : curPkt.threat?.type === 'LAND_ATTACK'
            ? 'Src IP: 10.0.0.4 == Dst IP: 10.0.0.4 [HOST SELF-TARGETED]'
            : `TotalLen: 84 B  ·  Proto: ${curPkt.proto === 'UDP' ? '17 (UDP)' : '6 (TCP)'}  ·  Chk: 0x2B81`,
        isFlagged: curPkt.threat?.type === 'IP_SPOOFING',
        threatNote: curPkt.threat?.type === 'IP_SPOOFING' ? '⚠️ IP SPOOFING DETECTED' : null,
      },
      {
        tag: `LAYER 4: TRANSPORT (${curPkt.proto} SEGMENT)`,
        row1: curPkt.threat?.type === 'LAND_ATTACK'
          ? `SrcPort: ${curPkt.port}  →  DstPort: ${curPkt.port} [LOOPBACK EXPLOIT]`
          : `SrcPort: 49152  →  DstPort: ${curPkt.port}  ·  Win: 64,240 B`,
        row2: curPkt.threat?.type === 'DDOS_SYN_FLOOD'
          ? 'Flags: [SYN] FLOOD (48,000 pps burst, backlog exhaustion)'
          : curPkt.threat?.type === 'LAND_ATTACK'
            ? 'Flags: [SYN] · LOOPBACK RECURSION EXPLOIT · Win: 0'
            : `Flags: [${curPkt.flags}]  ·  Seq: 0x3A9F  ·  Ack: 0x10B4`,
        isFlagged: curPkt.threat?.type === 'DDOS_SYN_FLOOD' || curPkt.threat?.type === 'LAND_ATTACK',
        threatNote: curPkt.threat?.type === 'DDOS_SYN_FLOOD'
          ? '⚠️ TCP SYN FLOOD'
          : curPkt.threat?.type === 'LAND_ATTACK'
            ? '⚠️ LAND ATTACK (SRC==DST)'
            : null,
      },
      {
        tag: 'LAYER 7: APPLICATION PAYLOAD',
        row1: `Payload Stream (${curPkt.payload.length} Bytes Decoded):`,
        row2: `"${curPkt.payload}"`,
        isFlagged: false,
        threatNote: null,
      },
    ];

    const blockH = (chamberH - 74) / 4;
    const startY = chamberY + 28;

    layers.forEach((layer, idx) => {
      const ly = startY + idx * (blockH + 4);
      const isScanned = scanYNorm > (idx + 0.35) / 4;
      // ONLY turn red if this specific layer is the one with the threat AND the laser has reached it!
      const highlight = isScanned && layer.isFlagged;

      ctx.fillStyle = highlight
        ? 'rgba(239, 68, 68, 0.18)'
        : isScanned
          ? 'rgba(45, 212, 191, 0.06)'
          : 'rgba(255, 255, 255, 0.02)';
      ctx.strokeStyle = highlight
        ? '#ef4444'
        : isScanned
          ? 'rgba(45, 212, 191, 0.35)'
          : 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = highlight ? 1.6 : 1;

      ctx.beginPath();
      ctx.roundRect(chamberX + 8, ly, chamberW - 16, blockH, 4);
      ctx.fill();
      ctx.stroke();

      // Clip text to box interior
      ctx.save();
      ctx.beginPath();
      ctx.rect(chamberX + 12, ly + 2, chamberW - 24, blockH - 4);
      ctx.clip();

      // Layer Tag
      ctx.font = '700 8.5px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = highlight ? '#f87171' : isScanned ? '#2dd4bf' : '#64748b';
      ctx.fillText(layer.tag, chamberX + 14, ly + 13);

      // Threat flag note if active
      if (layer.threatNote && isScanned) {
        ctx.fillStyle = '#ef4444';
        ctx.font = '700 8.5px "JetBrains Mono Variable", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(layer.threatNote, chamberX + chamberW - 20, ly + 13);
      }

      // Layer Row 1 & Row 2
      ctx.font = '500 8.5px "JetBrains Mono Variable", monospace';
      ctx.textAlign = 'left';
      ctx.fillStyle = highlight ? '#fca5a5' : '#cbd5e1';
      ctx.fillText(layer.row1, chamberX + 14, ly + 25);

      ctx.fillStyle = highlight ? '#ef4444' : '#94a3b8';
      ctx.fillText(layer.row2, chamberX + 14, ly + 36);

      ctx.restore();
    });

    // Laser Scanning Beam: strictly CYAN until it physically hits the faulted layer!
    if (scanYNorm <= 1.0) {
      const beamY = startY + scanYNorm * ((blockH + 4) * 4);
      const beamColor = hasHitThreat ? 'rgba(239, 68, 68, 0.95)' : 'rgba(45, 212, 191, 0.85)';

      const grad = ctx.createLinearGradient(chamberX + 8, beamY, chamberX + chamberW - 8, beamY);
      grad.addColorStop(0, 'rgba(45, 212, 191, 0)');
      grad.addColorStop(0.5, beamColor);
      grad.addColorStop(1, 'rgba(45, 212, 191, 0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(chamberX + 8, beamY);
      ctx.lineTo(chamberX + chamberW - 8, beamY);
      ctx.stroke();

      // Laser dot scanner head
      ctx.fillStyle = hasHitThreat ? '#ef4444' : '#2dd4bf';
      ctx.beginPath();
      ctx.arc(chamberX + chamberW * 0.5, beamY, 3.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bottom Verdict Bar (With strict boundary clipping so it NEVER overflows)
    const verdictY = chamberY + chamberH - 24;
    ctx.fillStyle = hasHitThreat
      ? 'rgba(239, 68, 68, 0.16)'
      : 'rgba(45, 212, 191, 0.12)';
    ctx.strokeStyle = hasHitThreat ? '#ef4444' : '#2dd4bf';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(chamberX + 8, verdictY, chamberW - 16, 20, 3);
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.beginPath();
    ctx.rect(chamberX + 12, verdictY + 1, chamberW - 24, 18);
    ctx.clip();

    ctx.font = '700 9px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';

    if (state.pktPauseTimer > 0 && isAttack) {
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(
        `🚨 ANOMALY STRIKE: [${curPkt.threat.label.toUpperCase()}] · PAUSED FOR REVIEW (${state.pktPauseTimer.toFixed(1)}s)`,
        chamberX + 16,
        verdictY + 14,
      );
    } else if (scanYNorm < 0.85) {
      ctx.fillStyle = '#5eead4';
      ctx.fillText(
        `SCANNING IN PROGRESS... [${Math.round(scanYNorm * 100)}%]`,
        chamberX + 16,
        verdictY + 14,
      );
    } else if (isAttack) {
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(
        `🚨 ALERT: ${curPkt.threat.label.toUpperCase()} · ACTION: ${curPkt.threat.action}`,
        chamberX + 16,
        verdictY + 14,
      );
    } else {
      ctx.fillStyle = '#5eead4';
      ctx.fillText(
        `✓ VERDICT: INTEGRITY VERIFIED · 0 ANOMALIES · FORWARDED`,
        chamberX + 16,
        verdictY + 14,
      );
    }

    ctx.restore();
  }

  // 6. First-Person 3D Rooftop Parkour Game Engine (WebGL/Canvas Perspective)
  function drawGame3d() {
    const speed = state.parkourSpeed;
    const loopSpan = 440;
    const zPos = (t * speed * 75) % loopSpan;

    // Autonomous athletic parkour choreography synchronized with course geometry
    let currentAction = 'run';
    let autoJumpP = 0;
    let autoVaultP = 0;

    if (zPos >= 130 && zPos < 220) {
      // Zone 2: Airborne gap leap soaring over the street chasm between buildings
      currentAction = 'jump';
      autoJumpP = (zPos - 130) / 90;
    } else if (zPos >= 245 && zPos < 285) {
      // Zone 3: Athletic hurdle vault over the HVAC chiller obstacle
      currentAction = 'vault';
      autoVaultP = (zPos - 245) / 40;
    } else if (zPos >= 305 && zPos < 385) {
      // Zone 4: Skyscraper glass wall-run along the left facade
      currentAction = 'wallrun';
    } else {
      currentAction = 'run';
    }

    // Manual button overrides if user clicked a control action
    if (state.parkourActionTimer > 0) {
      state.parkourActionTimer -= 0.016;
      currentAction = state.parkourAction;
    } else {
      state.parkourAction = currentAction;
    }

    // Camera Kinematics (Calm, stable athletic perspective with subtle breathing motion)
    const calmBobY = currentAction === 'run' ? Math.sin(t * 4.2) * 1.8 : 0;
    const calmBobX = currentAction === 'run' ? Math.cos(t * 2.1) * 1.2 : 0;

    // Smooth mouse look
    const camYaw = (pointer.x - 0.5) * 0.28;
    const camPitch = (pointer.y - 0.5) * 0.18;

    let camRoll = 0;
    let camY = 32 + calmBobY;
    const cx = w * 0.5 + calmBobX + camYaw * 70;
    const cy = h * 0.44 + camPitch * 50;
    const fov = 290;

    if (currentAction === 'wallrun') {
      camRoll = -0.22; // 13° bank into the left glass skyscraper
      camY = 22;
    } else if (currentAction === 'jump') {
      const p = state.parkourActionTimer > 0 ? 1.0 - state.parkourActionTimer / 1.2 : autoJumpP;
      camY = 32 - Math.sin(p * Math.PI) * 62; // Smooth parabolic arc soaring upward
      camRoll = Math.sin(p * Math.PI) * 0.04;
    } else if (currentAction === 'vault') {
      const p = state.parkourActionTimer > 0 ? 1.0 - state.parkourActionTimer / 1.0 : autoVaultP;
      camY = 32 - Math.sin(p * Math.PI) * 28;
      camRoll = (p - 0.5) * 0.08;
    }

    function project3D(x, y, z) {
      const rx = x * Math.cos(camRoll) - (y - camY) * Math.sin(camRoll);
      const ry = x * Math.sin(camRoll) + (y - camY) * Math.cos(camRoll);
      const clampedZ = Math.max(14, z);
      const scale = fov / clampedZ;
      return {
        x: cx + rx * scale,
        y: cy + ry * scale,
        scale,
        z: clampedZ,
      };
    }

    // 1. Twilight City Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.55);
    skyGrad.addColorStop(0, '#040711');
    skyGrad.addColorStop(0.6, '#091325');
    skyGrad.addColorStop(1, '#13223e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Distant Skyline Skyscrapers
    const towers = [
      { x: -380, w: 85, h: 160, z: 620 },
      { x: -270, w: 60, h: 220, z: 600 },
      { x: -180, w: 95, h: 140, z: 580 },
      { x: -70, w: 75, h: 260, z: 560 },
      { x: 30, w: 90, h: 190, z: 580 },
      { x: 135, w: 65, h: 270, z: 550 },
      { x: 215, w: 80, h: 175, z: 590 },
      { x: 310, w: 70, h: 230, z: 620 },
    ];

    towers.forEach((tower) => {
      const p = project3D(tower.x, 0, tower.z);
      const tw = tower.w * p.scale;
      const th = tower.h * p.scale;
      const ty = p.y - th;

      ctx.fillStyle = '#060d1b';
      ctx.fillRect(p.x - tw * 0.5, ty, tw, th);

      // Lit office window dots
      ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
      for (let wy = ty + 12; wy < p.y - 6; wy += 9) {
        for (let wx = p.x - tw * 0.42; wx < p.x + tw * 0.42; wx += 8) {
          if ((Math.sin(wx * 4.1 + wy * 1.9) + 1) * 0.5 > 0.62) {
            ctx.fillRect(wx, wy, 2, 2);
          }
        }
      }
    });

    // 3. Street Chasm Lights Far Below (Between Rooftops)
    const chasmProj = project3D(0, 320, 340);
    ctx.fillStyle = 'rgba(2, 6, 18, 0.95)';
    ctx.fillRect(0, chasmProj.y - 40, w, h - chasmProj.y + 40);

    // Night street traffic headlights & taillights streaming far below
    for (let i = 0; i < 16; i++) {
      const tx = ((i * 47 + t * 140) % (w + 120)) - 60;
      const ty = chasmProj.y + ((i * 19) % 36);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(239, 68, 68, 0.45)';
      ctx.fillRect(tx, ty, 14, 2);
    }

    // 4. Procedural 3D Rooftops with Exact Gap Alignment
    // Deck 1: Rooftop A (starts at 0, ends cleanly at 130 where chasm begins)
    // Gap: 130 to 220 (90 units of open night air above traffic - athlete leaps across!)
    // Deck 2: Rooftop B (starts at 220, extends through 440)
    const deck1Start = 0 - zPos;
    const deck1End = 130 - zPos;
    const deck2Start = 220 - zPos;
    const deck2End = 440 - zPos;

    const decks = [
      { z0: deck1Start, z1: deck1End },
      { z0: deck2Start, z1: deck2End },
      { z0: deck1Start + loopSpan, z1: deck1End + loopSpan },
      { z0: deck2Start + loopSpan, z1: deck2End + loopSpan },
    ];

    decks.forEach((deck) => {
      if (deck.z1 < 16 || deck.z0 > 750) return;
      const dZ0 = Math.max(16, deck.z0);
      const dZ1 = Math.min(700, deck.z1);
      const halfW = 86;
      const roofLevel = 60;

      const p0L = project3D(-halfW, roofLevel, dZ0);
      const p0R = project3D(halfW, roofLevel, dZ0);
      const p1L = project3D(-halfW, roofLevel, dZ1);
      const p1R = project3D(halfW, roofLevel, dZ1);

      // Asphalt Roof Deck Polygon
      ctx.fillStyle = '#0b1120';
      ctx.beginPath();
      ctx.moveTo(p0L.x, p0L.y);
      ctx.lineTo(p1L.x, p1L.y);
      ctx.lineTo(p1R.x, p1R.y);
      ctx.lineTo(p0R.x, p0R.y);
      ctx.closePath();
      ctx.fill();

      // Gravel / Tile Grate Lines
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
      ctx.lineWidth = 1;
      for (let gz = Math.ceil(dZ0 / 28) * 28; gz <= dZ1; gz += 28) {
        const gl = project3D(-halfW, roofLevel, gz);
        const gr = project3D(halfW, roofLevel, gz);
        ctx.beginPath();
        ctx.moveTo(gl.x, gl.y);
        ctx.lineTo(gr.x, gr.y);
        ctx.stroke();
      }

      // Parapet Railings (Right edge)
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.7)';
      ctx.lineWidth = Math.max(1, 2.4 * p0R.scale);
      ctx.beginPath();
      ctx.moveTo(p0R.x, p0R.y);
      ctx.lineTo(p1R.x, p1R.y);
      ctx.stroke();

      // Hazard Ledge facing the chasm
      if (deck.z1 > 18 && deck.z1 < 600) {
        const lipP0L = project3D(-halfW, roofLevel, dZ1);
        const lipP0R = project3D(halfW, roofLevel, dZ1);
        const lipP1L = project3D(-halfW, roofLevel + 35, dZ1);
        const lipP1R = project3D(halfW, roofLevel + 35, dZ1);

        ctx.fillStyle = '#060a12';
        ctx.beginPath();
        ctx.moveTo(lipP0L.x, lipP0L.y);
        ctx.lineTo(lipP0R.x, lipP0R.y);
        ctx.lineTo(lipP1R.x, lipP1R.y);
        ctx.lineTo(lipP1L.x, lipP1L.y);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2 * lipP0L.scale;
        ctx.beginPath();
        ctx.moveTo(lipP0L.x, lipP0L.y);
        ctx.lineTo(lipP0R.x, lipP0R.y);
        ctx.stroke();
      }
    });

    // 5. Approaching 3D Rooftop HVAC Chiller Unit (Vault Obstacle at z=265)
    const obsRelZ = 265 - zPos;
    const obsZ = obsRelZ < -20 ? obsRelZ + loopSpan : obsRelZ;
    if (obsZ > 18 && obsZ < 450) {
      const obsH = 22;
      const obsTop = 60 - obsH;

      const oFL = project3D(-14, 60, obsZ);
      const oFR = project3D(14, 60, obsZ);
      const oTL = project3D(-14, obsTop, obsZ);
      const oTR = project3D(14, obsTop, obsZ);

      const oBL = project3D(-14, 60, obsZ + 32);
      const oBR = project3D(14, 60, obsZ + 32);
      const oBTL = project3D(-14, obsTop, obsZ + 32);
      const oBTR = project3D(14, obsTop, obsZ + 32);

      // HVAC Front Face
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(oFL.x, oFL.y);
      ctx.lineTo(oFR.x, oFR.y);
      ctx.lineTo(oTR.x, oTR.y);
      ctx.lineTo(oTL.x, oTL.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Top Face
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(oTL.x, oTL.y);
      ctx.lineTo(oTR.x, oTR.y);
      ctx.lineTo(oBTR.x, oBTR.y);
      ctx.lineTo(oBTL.x, oBTL.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Cooling fan grill
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.2 * oTL.scale;
      ctx.beginPath();
      ctx.arc((oTL.x + oTR.x) * 0.5, (oTL.y + oFL.y) * 0.5, 9 * oTL.scale, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 6. Left Wall-Running Skyscraper Glass Curtain & Hologram Velocity Rails
    const wallX = -86;
    const wallZ0 = 16;
    const wallZ1 = 450;
    const wallTop = -80;
    const wallBot = 60;

    const w0T = project3D(wallX, wallTop, wallZ0);
    const w0B = project3D(wallX, wallBot, wallZ0);
    const w1T = project3D(wallX, wallTop, wallZ1);
    const w1B = project3D(wallX, wallBot, wallZ1);

    // Wall glass surface
    ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';
    ctx.beginPath();
    ctx.moveTo(w0T.x, w0T.y);
    ctx.lineTo(w1T.x, w1T.y);
    ctx.lineTo(w1B.x, w1B.y);
    ctx.lineTo(w0B.x, w0B.y);
    ctx.closePath();
    ctx.fill();

    // Wall velocity rails
    ctx.strokeStyle = state.parkourAction === 'wallrun' ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)';
    ctx.lineWidth = state.parkourAction === 'wallrun' ? 2.5 : 1.4;
    for (let wy = wallTop + 24; wy < wallBot; wy += 38) {
      const wl0 = project3D(wallX, wy, wallZ0);
      const wl1 = project3D(wallX, wy, wallZ1);
      ctx.beginPath();
      ctx.moveTo(wl0.x, wl0.y);
      ctx.lineTo(wl1.x, wl1.y);
      ctx.stroke();
    }

    // Wall-run sparks if actively wall-running
    if (state.parkourAction === 'wallrun') {
      const sparkOrigin = project3D(wallX + 4, 34, 42);
      ctx.fillStyle = '#38bdf8';
      for (let s = 0; s < 12; s++) {
        const sx = sparkOrigin.x + (Math.random() - 0.2) * 45;
        const sy = sparkOrigin.y + (Math.random() - 0.5) * 32;
        ctx.fillRect(sx, sy, 2.5, 2.5);
      }
    }

    // 7. Kinetic Jump Pad on Landing Roof
    const padZ = (320 - zPos + loopSpan) % loopSpan;
    if (padZ > 24 && padZ < 400) {
      const padProj = project3D(0, 60, padZ);
      const rad = 28 * padProj.scale;
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 2 * padProj.scale;
      ctx.beginPath();
      ctx.ellipse(padProj.x, padProj.y, rad, rad * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();

      const pulseR = rad * (0.4 + (t * 2.2) % 0.6);
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
      ctx.beginPath();
      ctx.ellipse(padProj.x, padProj.y, pulseR, pulseR * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8. FIRST-PERSON RUNNER ARMS / HANDS (Mirror's Edge Athletic Perspective)
    // No goofy 2D stick figures! You see the runner's arms interacting physically with the world.
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const leftArmX = w * 0.22;
    const rightArmX = w * 0.78;
    const baseArmY = h + 15;

    if (state.parkourAction === 'wallrun') {
      // Left arm reaches out and presses flat onto the glowing wall rail!
      const contactX = w * 0.26;
      const contactY = h * 0.58;

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 22;
      ctx.beginPath();
      ctx.moveTo(w * 0.12, baseArmY);
      ctx.quadraticCurveTo(w * 0.16, h * 0.74, contactX, contactY);
      ctx.stroke();

      // Glove & Cyan Knuckle Band
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 14;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(contactX, contactY, 6, 0, Math.PI * 2);
      ctx.fill();

      // Right arm balances out in air
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(rightArmX + 30, baseArmY);
      ctx.lineTo(w * 0.74, h * 0.72);
      ctx.stroke();
    } else if (state.parkourAction === 'jump') {
      // Both arms reach forward into the night sky flying over the chasm!
      const jumpP = 1.0 - state.parkourActionTimer / 1.2;
      const reachY = h * 0.48 + Math.sin(jumpP * Math.PI) * 18;

      // Left arm
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(leftArmX - 10, baseArmY);
      ctx.quadraticCurveTo(w * 0.28, reachY + 45, w * 0.34, reachY);
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(w * 0.34, reachY, 5, 0, Math.PI * 2);
      ctx.fill();

      // Right arm
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 18;
      ctx.beginPath();
      ctx.moveTo(rightArmX + 10, baseArmY);
      ctx.quadraticCurveTo(w * 0.72, reachY + 45, w * 0.66, reachY);
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 12;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(w * 0.66, reachY, 5, 0, Math.PI * 2);
      ctx.fill();
    } else if (state.parkourAction === 'vault') {
      // Hands plant down onto the obstacle and push off
      const vaultP = 1.0 - state.parkourActionTimer / 1.0;
      const plantY = h * 0.65 - Math.sin(vaultP * Math.PI) * 20;

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(leftArmX, baseArmY);
      ctx.lineTo(w * 0.36, plantY);
      ctx.moveTo(rightArmX, baseArmY);
      ctx.lineTo(w * 0.64, plantY);
      ctx.stroke();

      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 13;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(w * 0.36, plantY, 6, 0, Math.PI * 2);
      ctx.arc(w * 0.64, plantY, 6, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Normal Sprint: Hands pump at the lower corners with calm athletic rhythm
      const leftPump = Math.sin(t * 4.2);
      const rightPump = -leftPump;

      const ly = h * 0.82 + leftPump * 16;
      const ry = h * 0.82 + rightPump * 16;

      // Left Arm & Glove
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(w * 0.14, baseArmY);
      ctx.quadraticCurveTo(w * 0.22, ly + 25, w * 0.26, ly);
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 13;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(w * 0.26, ly, 5.5, 0, Math.PI * 2);
      ctx.fill();

      // Right Arm & Glove
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 20;
      ctx.beginPath();
      ctx.moveTo(w * 0.86, baseArmY);
      ctx.quadraticCurveTo(w * 0.78, ry + 25, w * 0.74, ry);
      ctx.stroke();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 13;
      ctx.stroke();

      ctx.fillStyle = '#2dd4bf';
      ctx.beginPath();
      ctx.arc(w * 0.74, ry, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 9. Radial Velocity Streaks & Wind Particles
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
    ctx.lineWidth = 1;
    for (let p = 0; p < 14; p++) {
      const pAng = (p / 14) * Math.PI * 2 + t * 0.6;
      const pDist = 95 + ((p * 27 + t * 450 * speed) % 260);
      const px = cx + Math.cos(pAng) * pDist;
      const py = cy + Math.sin(pAng) * pDist * 0.65;
      const pLen = 16 * speed;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + Math.cos(pAng) * pLen, py + Math.sin(pAng) * pLen * 0.65);
      ctx.stroke();
    }

    // 10. High-Tech Parkour Telemetry HUD
    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(14, 14, 230, 26, 4);
    ctx.fill();
    ctx.stroke();

    ctx.font = '700 9px "JetBrains Mono Variable", monospace';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(
      `VELOCITY: ${(speed * 28).toFixed(1)} KM/H · [${currentAction.toUpperCase()}]`,
      22,
      30,
    );

    // Momentum bar
    const barX = Math.min(Math.max(14, w - 105), 252);
    const barW = Math.max(30, Math.min(95, w - barX - 14));
    const barH = 11;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(barX, 22, barW, barH);
    ctx.fillStyle = '#2dd4bf';
    ctx.fillRect(barX, 22, barW * Math.min(1.0, speed / 2.0), barH);
    ctx.strokeStyle = 'rgba(45, 212, 191, 0.4)';
    ctx.strokeRect(barX, 22, barW, barH);
  }

  function loop() {
    t += 0.016;

    // Guaranteed hardware-level clear of entire physical canvas buffer
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Re-apply crisp DPR coordinate system
    const dpr = Math.max(window.devicePixelRatio || 1, 1);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    try {
      if (state.mode === 'llm') drawLlm();
      else if (state.mode === 'scheduling') drawScheduling();
      else if (state.mode === 'dissertation') drawDissertation();
      else if (state.mode === 'diffraction') drawDiffraction();
      else if (state.mode === 'dtn') drawDtn();
      else drawGame3d();
    } catch (err) {
      console.error('Error drawing project stage:', state.mode, err);
    }

    if (isWorkbenchVisible) {
      workbenchRafId = requestAnimationFrame(loop);
    } else {
      workbenchRafId = null;
    }
  }
  function startWorkbenchLoop() {
    if (!workbenchRafId && isWorkbenchVisible) {
      workbenchRafId = requestAnimationFrame(loop);
    }
  }

  if ('IntersectionObserver' in window) {
    const wbObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isWorkbenchVisible = entry.isIntersecting;
          if (isWorkbenchVisible) {
            startWorkbenchLoop();
          } else if (workbenchRafId) {
            cancelAnimationFrame(workbenchRafId);
            workbenchRafId = null;
          }
        });
      },
      { threshold: 0.05 },
    );
    wbObserver.observe(root);
  } else {
    startWorkbenchLoop();
  }
}
