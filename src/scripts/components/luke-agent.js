/**
 * Choreographed AI Briefing Terminal (`[data-luke-agent]`).
 *
 * Self-playing showcase (no fake free-text input, zero internal scrolling):
 * Presents clear, recruiter-focused answers about Luke's role on the AI team
 * at AlphaSights, his background at Leonardo Helicopters and the University of
 * Warwick, and his technical projects.
 */
export function initLukeAgent(root) {
  if (!root) return;

  const promptTextEl = root.querySelector('[data-agent-prompt-text]');
  const promptCursorEl = root.querySelector('[data-agent-prompt-cursor]');
  const thinkingEl = root.querySelector('[data-agent-thinking]');
  const summaryEl = root.querySelector('[data-agent-summary]');
  const dossierEl = root.querySelector('[data-agent-dossier]');
  const chips = root.querySelectorAll('[data-agent-chip]');

  if (!promptTextEl || !summaryEl || !dossierEl) return;

  const BRIEFINGS = {
    intro: {
      prompt: 'Tell me about Luke',
      summary:
        'Luke Guppy is an AI Software Engineer at AlphaSights with a First-Class Computer Science degree from the University of Warwick, specialising in backend AI systems, MCP servers, and workflow automation.',
      highlights: [
        'AI Software Engineer at AlphaSights',
        'First-Class Computer Science degree',
        'University of Warwick',
      ],
      bullets: [
        {
          title: 'Current role at AlphaSights',
          detail:
            'Building internal and external AI chat systems, client-facing MCP servers, custom tools, and AI jobs for data processing.',
        },
        {
          title: 'Previous experience at Leonardo Helicopters',
          detail:
            'Graduate Software Engineer building reinforcement learning simulations, optimisation solvers, and C++/Docker mission systems.',
        },
        {
          title: 'Core languages & technologies',
          detail:
            'Python, TypeScript, C++, C#, SQL, Docker, and modern LLM & MCP frameworks.',
        },
      ],
    },

    alphasights: {
      prompt: 'What does Luke build on the AI Team at AlphaSights?',
      summary:
        'On the AI team at AlphaSights, Luke engineers the backend platforms, tool integrations, and data workflows that power internal operations and client-facing AI products.',
      highlights: [
        'AI team at AlphaSights',
        'internal operations',
        'client-facing AI products',
      ],
      bullets: [
        {
          title: 'Internal & external AI chat platforms',
          detail:
            'Developed the internal AI chat platform and now designs and implements the external-facing AI chat alongside its custom tool integrations.',
        },
        {
          title: 'Client-facing MCP server & tooling',
          detail:
            'Designing and implementing the client-facing Model Context Protocol (MCP) server to expose structured tools and data across external workflows.',
        },
        {
          title: 'AI workflows & data processing jobs',
          detail:
            'Building AI jobs for automated data processing and evaluating new AI capabilities to shape the company’s core AI foundations.',
        },
      ],
    },

    experience: {
      prompt: 'What is his background before AlphaSights?',
      summary:
        'Before joining AlphaSights, Luke spent 18 months as a Graduate Software Engineer at Leonardo Helicopters after graduating with First-Class Honours in Computer Science from the University of Warwick.',
      highlights: [
        'Graduate Software Engineer at Leonardo Helicopters',
        'First-Class Honours in Computer Science',
        'University of Warwick',
      ],
      bullets: [
        {
          title: 'Leonardo Helicopters — Autonomy',
          detail:
            'Implemented task-assignment optimisation solvers, built Python ROS2/Docker drone simulations for reinforcement learning, and designed behaviour tree architectures.',
        },
        {
          title: 'Leonardo Helicopters — Tactical Processing',
          detail:
            'Developed a C++/Docker mission management system with decision-tree infrastructure and built gRPC services for multi-system communication.',
        },
        {
          title: 'University of Warwick — BSc Computer Science (1st)',
          detail:
            'Graduated with First-Class Honours; engineered a PPO deep reinforcement learning agent in C# and Unity for autonomous urban driving.',
        },
      ],
    },

    projects: {
      prompt: 'What projects has Luke built?',
      summary:
        'Luke has built technical projects spanning deep reinforcement learning, transformer architectures, combinatorial optimisation, network simulation, and interactive browser apps.',
      highlights: [
        'deep reinforcement learning',
        'transformer architectures',
        'combinatorial optimisation',
      ],
      bullets: [
        {
          title: 'Autonomous Navigation Dissertation (C#, Unity, PPO)',
          detail:
            'Trained a Proximal Policy Optimisation reinforcement learning agent to control an autonomous vehicle through multi-lane traffic and intersections.',
        },
        {
          title: 'AI & Systems Projects (Python, C++, C#)',
          detail:
            'Built a scaled-down Transformer next-token predictor, an AI dynamic-pricing scheduler, a C++/NS-3 delay-tolerant network simulator, and a C#/WPF wave diffraction simulator.',
        },
        {
          title: 'Interactive Browser Playground (JavaScript)',
          detail:
            'Created interactive web versions of a Wordle Solver, Chess, Countries Quiz, Map Plotter, and Block Blast.',
        },
      ],
    },
  };

  let runToken = 0;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function formatHighlightedText(text, highlights = []) {
    let html = escapeHtml(text);
    highlights.forEach((phrase) => {
      const escaped = escapeHtml(phrase);
      html = html.replace(escaped, `<strong>${escaped}</strong>`);
    });
    return html;
  }

  async function playBriefing(key) {
    const token = ++runToken;
    const data = BRIEFINGS[key] || BRIEFINGS.intro;

    root.classList.add('is-streaming');
    promptTextEl.textContent = '';
    if (promptCursorEl) {
      promptCursorEl.hidden = false;
      promptCursorEl.style.display = 'inline-block';
    }
    if (thinkingEl) thinkingEl.hidden = true;
    summaryEl.innerHTML = '';
    dossierEl.innerHTML = '';

    await sleep(200);
    if (token !== runToken) return;

    const promptStr = data.prompt;
    for (let i = 1; i <= promptStr.length; i++) {
      if (token !== runToken) return;
      promptTextEl.textContent = promptStr.slice(0, i);
      await sleep(28 + (i % 3) * 8);
    }

    await sleep(140);
    if (token !== runToken) return;

    if (promptCursorEl) {
      promptCursorEl.hidden = true;
      promptCursorEl.style.display = 'none';
    }
    if (thinkingEl) thinkingEl.hidden = false;

    await sleep(340);
    if (token !== runToken) return;

    if (thinkingEl) thinkingEl.hidden = true;

    const summaryText = data.summary;
    const stepSize = 3;
    for (let i = stepSize; i <= summaryText.length; i += stepSize) {
      if (token !== runToken) return;
      const slice = summaryText.slice(0, i);
      summaryEl.innerHTML =
        formatHighlightedText(slice, data.highlights) +
        '<span class="stream-cursor" aria-hidden="true"></span>';
      await sleep(12);
    }
    summaryEl.innerHTML = formatHighlightedText(summaryText, data.highlights);

    await sleep(120);
    if (token !== runToken) return;

    for (const item of data.bullets) {
      if (token !== runToken) return;

      const rowEl = document.createElement('div');
      rowEl.className = 'dossier-bullet';

      const titleEl = document.createElement('strong');
      titleEl.className = 'dossier-bullet__title';
      titleEl.textContent = item.title;

      const detailEl = document.createElement('p');
      detailEl.className = 'dossier-bullet__detail';

      rowEl.appendChild(titleEl);
      rowEl.appendChild(detailEl);
      dossierEl.appendChild(rowEl);

      const text = item.detail;
      for (let i = 5; i <= text.length; i += 5) {
        if (token !== runToken) return;
        detailEl.innerHTML =
          escapeHtml(text.slice(0, i)) +
          '<span class="stream-cursor" aria-hidden="true"></span>';
        await sleep(9);
      }
      detailEl.textContent = text;

      await sleep(60);
    }

    if (token !== runToken) return;
    root.classList.remove('is-streaming');
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const key = chip.dataset.agentChip || 'intro';
      chips.forEach((c) => c.classList.toggle('is-active', c === chip));
      playBriefing(key);
    });
  });

  playBriefing('intro');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
