/**
 * Authentic Multiplayer Figma Collaborative Construction Sequence.
 *
 * Strict Physical Causality:
 * 1. Cursors are real workers. Nothing ever happens by itself.
 * 2. Text boxes appear only when a cursor moves there and clicks to create/select them.
 * 3. Text types strictly following the cursor and caret character by character.
 * 4. Styles, fonts, and bolding only apply AFTER a cursor physically drags across the text to highlight/select it.
 * 5. Resizing happens physically with the cursor attached to the handle, dragging it frame-by-frame.
 * 6. Wireframe card frames and left accent strokes are drawn by cursors moving along the path.
 * 7. When done, each cursor glides completely off the physical monitor edges in distinct divergent directions.
 */

export function initFigmaBuilder() {
  const introEl = document.querySelector('.about-hero__intro');
  if (!introEl) return;

  runConstruction(introEl);
}

function runConstruction(introEl) {
  // Capture content from native DOM
  const nativeTitleMain = introEl.querySelector('.about-hero__title > span:first-child');
  const nativeTitleSub = introEl.querySelector('.about-hero__subtitle');
  const nativeLead = introEl.querySelector('.about-hero__lead');

  const titleText = nativeTitleMain?.textContent.trim() || 'About Me';
  const subtitleText = nativeTitleSub?.textContent.trim() || 'AI Software Engineer @ AlphaSights';
  const leadFullText = nativeLead?.textContent.trim() || '';

  const boldWords = nativeLead
    ? [...nativeLead.querySelectorAll('strong')].map((s) => s.textContent.trim()).filter(Boolean)
    : ['AlphaSights'];

  const pillarData = [
    {
      id: 'alphasights',
      meta: 'Feb 2026 – Present',
      title: 'AlphaSights',
      subtitle: 'Software Engineer I',
      desc: 'Building external & internal AI chat platforms, client-facing MCP servers, and AI workflow jobs on the AI team.',
      startDate: '2026-02-01',
      endDate: 'present',
      accent: 'var(--accent)',
      color: '#2dd4bf',
    },
    {
      id: 'leonardo',
      meta: 'Aug 2024 – Jan 2026',
      title: 'Leonardo Helicopters',
      subtitle: 'Graduate Software Engineer',
      desc: 'Autonomy and Tactical Processing—RL drone sims, solvers, and C++/Docker mission systems.',
      startDate: '2024-08-01',
      endDate: '2026-01-31',
      accent: '#38bdf8',
      color: '#38bdf8',
    },
    {
      id: 'warwick',
      meta: 'Sep 2021 – Jul 2024',
      title: 'University of Warwick',
      subtitle: 'BSc Computer Science (1st Class Hons)',
      desc: 'Final-year dissertation on PPO deep reinforcement learning for autonomous driving in Unity.',
      startDate: '2021-09-01',
      endDate: '2024-07-31',
      accent: '#f59e0b',
      color: '#f59e0b',
    },
  ];

  // Activate building state on container
  introEl.classList.add('figma-building');

  // Remove any previous stage or cursors layer
  const existingStage = introEl.querySelector('.figma-stage');
  if (existingStage) existingStage.remove();
  const existingCursors = document.querySelector('.figma-cursors-layer');
  if (existingCursors) existingCursors.remove();

  // Create clean Figma stage overlay
  const stage = document.createElement('div');
  stage.className = 'figma-stage';
  stage.innerHTML = `
    <!-- Multiplayer Cursors Layer (scrolls naturally with the section) -->
    <div class="figma-cursors-layer">
      <div class="figma-cursor cursor-teal" style="--cursor-color: #2dd4bf">
        <svg class="figma-cursor__icon" width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1L7 20L10.5 13L17 11.5L1 1Z" fill="#2dd4bf" stroke="#06101e" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="figma-cursor cursor-sky" style="--cursor-color: #38bdf8">
        <svg class="figma-cursor__icon" width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1L7 20L10.5 13L17 11.5L1 1Z" fill="#38bdf8" stroke="#06101e" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="figma-cursor cursor-amber" style="--cursor-color: #f59e0b">
        <svg class="figma-cursor__icon" width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1L7 20L10.5 13L17 11.5L1 1Z" fill="#f59e0b" stroke="#06101e" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <div class="figma-cursor cursor-purple" style="--cursor-color: #a78bfa">
        <svg class="figma-cursor__icon" width="18" height="22" viewBox="0 0 18 22" fill="none">
          <path d="M1 1L7 20L10.5 13L17 11.5L1 1Z" fill="#a78bfa" stroke="#06101e" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>

    <div class="figma-stage__wrap">
      <!-- Title & Subtitle Group -->
      <div class="figma-stage__title-group">
        <div class="figma-box figma-box--title" style="--box-color: #2dd4bf">
          <span class="figma-handle handle-tl"></span>
          <span class="figma-handle handle-tr"></span>
          <span class="figma-handle handle-bl"></span>
          <span class="figma-handle handle-br"></span>
          <span class="figma-stage__title-text"></span>
        </div>

        <div class="figma-box figma-box--subtitle" style="--box-color: #38bdf8">
          <span class="figma-handle handle-tl"></span>
          <span class="figma-handle handle-tr"></span>
          <span class="figma-handle handle-bl"></span>
          <span class="figma-handle handle-br"></span>
          <span class="figma-stage__subtitle-text"></span>
        </div>
      </div>

      <!-- Lead Paragraph Group (natural full measure 58rem) -->
      <div class="figma-stage__lead-group" style="max-width: 58rem">
        <div class="figma-box figma-box--lead" style="--box-color: #f59e0b">
          <span class="figma-handle handle-tl"></span>
          <span class="figma-handle handle-tr"></span>
          <span class="figma-handle handle-bl"></span>
          <span class="figma-handle handle-br"></span>
          <p class="figma-stage__lead-text"></p>
        </div>
      </div>

      <!-- Interactive Dynamic Chronology Timeline Stage -->
      <div class="figma-stage__timeline-stage" data-timeline-stage></div>

      <!-- Pillars 3-Column Strip -->
      <div class="figma-stage__pillars-group">
        <div class="figma-pillars-frame" style="--box-color: #a78bfa">
          <span class="figma-handle handle-tl"></span>
          <span class="figma-handle handle-tr"></span>
          <span class="figma-handle handle-bl"></span>
          <span class="figma-handle handle-br"></span>
        </div>

        ${pillarData
          .map(
            (p, i) => `
          <div class="figma-stage__pillar" id="f-pillar-${i}" style="--pillar-color: ${p.color}">
            <div class="figma-card-layer figma-card-layer--meta" style="--box-color: ${p.color}">
              <span class="figma-handle handle-tl"></span>
              <span class="figma-handle handle-tr"></span>
              <span class="figma-handle handle-bl"></span>
              <span class="figma-handle handle-br"></span>
              <span class="figma-stage__pillar-meta"></span>
            </div>

            <div class="figma-card-layer figma-card-layer--title" style="--box-color: ${p.color}">
              <span class="figma-handle handle-tl"></span>
              <span class="figma-handle handle-tr"></span>
              <span class="figma-handle handle-bl"></span>
              <span class="figma-handle handle-br"></span>
              <strong class="figma-stage__pillar-title"></strong>
            </div>

            <div class="figma-card-layer figma-card-layer--subtitle" style="--box-color: ${p.color}">
              <span class="figma-handle handle-tl"></span>
              <span class="figma-handle handle-tr"></span>
              <span class="figma-handle handle-bl"></span>
              <span class="figma-handle handle-br"></span>
              <span class="figma-stage__pillar-subtitle"></span>
            </div>

            <div class="figma-card-layer figma-card-layer--desc" style="--box-color: ${p.color}">
              <span class="figma-handle handle-tl"></span>
              <span class="figma-handle handle-tr"></span>
              <span class="figma-handle handle-bl"></span>
              <span class="figma-handle handle-br"></span>
              <p class="figma-stage__pillar-desc"></p>
            </div>
          </div>
        `,
          )
          .join('')}
      </div>
    </div>
  `;

  introEl.appendChild(stage);

  // References to stage elements
  const cursorTeal = stage.querySelector('.cursor-teal');
  const cursorSky = stage.querySelector('.cursor-sky');
  const cursorAmber = stage.querySelector('.cursor-amber');
  const cursorPurple = stage.querySelector('.cursor-purple');

  const boxTitle = stage.querySelector('.figma-box--title');
  const textTitle = boxTitle.querySelector('.figma-stage__title-text');

  const boxSubtitle = stage.querySelector('.figma-box--subtitle');
  const textSubtitle = boxSubtitle.querySelector('.figma-stage__subtitle-text');

  const leadGroup = stage.querySelector('.figma-stage__lead-group');
  const boxLead = stage.querySelector('.figma-box--lead');
  const textLead = boxLead.querySelector('.figma-stage__lead-text');

  const pillarsFrame = stage.querySelector('.figma-pillars-frame');
  const pillarEls = [0, 1, 2].map((i) => stage.querySelector(`#f-pillar-${i}`));
  const timelineStage = stage.querySelector('.figma-stage__timeline-stage');

  let isComplete = false;

  // ---------------------------------------------------------------------------
  // ASYNC ACTOR PRIMITIVES (STRICT CAUSALITY)
  // ---------------------------------------------------------------------------

  const pause = (ms) =>
    new Promise((resolve) => {
      if (isComplete) return resolve();
      setTimeout(resolve, ms);
    });

  function setPos(cursor, x, y) {
    if (!cursor) return;
    cursor.style.transition = 'none';
    cursor.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  function moveCursor(cursor, targetX, targetY, duration = 320) {
    return new Promise((resolve) => {
      if (isComplete || !cursor) return resolve();
      cursor.style.transition = `transform ${duration}ms cubic-bezier(0.18, 0.9, 0.28, 1)`;
      cursor.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
      setTimeout(resolve, duration + 20);
    });
  }

  function moveCursorToEl(cursor, targetEl, offsetX = 0, offsetY = 0, duration = 320) {
    if (isComplete || !targetEl || !cursor) return Promise.resolve();

    return new Promise((resolve) => {
      const startTime = performance.now();
      const parent = cursor.parentElement || stage;
      const pRectInitial = parent.getBoundingClientRect();
      const cRectInitial = cursor.getBoundingClientRect();
      const startX = cRectInitial.left - pRectInitial.left;
      const startY = cRectInitial.top - pRectInitial.top;

      cursor.style.transition = 'none';

      function step(now) {
        if (isComplete) return resolve();
        const progress = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);

        const curParent = parent.getBoundingClientRect();
        const curTarget = targetEl.getBoundingClientRect();
        const targetX = curTarget.left - curParent.left + offsetX;
        const targetY = curTarget.top - curParent.top + offsetY;

        const curX = startX + (targetX - startX) * ease;
        const curY = startY + (targetY - startY) * ease;

        cursor.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          const fParent = parent.getBoundingClientRect();
          const fTarget = targetEl.getBoundingClientRect();
          cursor.style.transform = `translate3d(${(fTarget.left - fParent.left + offsetX).toFixed(1)}px, ${(fTarget.top - fParent.top + offsetY).toFixed(1)}px, 0)`;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });
  }

  // Live element-locked pause: keeps cursor locked to its target element even if elements above grow or shift layout
  function pauseOnEl(cursor, targetEl, offsetX = 0, offsetY = 0, ms = 120) {
    if (isComplete || !cursor || !targetEl) return pause(ms);
    return new Promise((resolve) => {
      const startTime = performance.now();
      const parent = cursor.parentElement || stage;
      function step(now) {
        if (isComplete || now - startTime >= ms) return resolve();
        const curParent = parent.getBoundingClientRect();
        const curTarget = targetEl.getBoundingClientRect();
        cursor.style.transition = 'none';
        cursor.style.transform = `translate3d(${(curTarget.left - curParent.left + offsetX).toFixed(1)}px, ${(curTarget.top - curParent.top + offsetY).toFixed(1)}px, 0)`;
        requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  async function clickCursor(cursor) {
    if (isComplete || !cursor) return;
    const cur = cursor.style.transform;
    cursor.style.transform = `${cur} scale(0.86)`;
    await pause(80);
    cursor.style.transform = cur;
    await pause(60);
  }

  // Type text character-by-character; cursor stays completely STILL where it clicked to focus!
  async function typeInto(textEl, fullText, charDelay = 18, stepSize = 1) {
    if (isComplete || !textEl) return;
    for (let i = stepSize; i <= fullText.length; i += stepSize) {
      if (isComplete) break;
      textEl.innerHTML = `${fullText.slice(0, i)}<span class="figma-caret"></span>`;
      await pause(charDelay);
    }
    if (!isComplete) textEl.textContent = fullText;
  }

  // Drag-Selection: cursor physically sweeps across text from left to right, highlighting it as it moves!
  async function dragSelectText(cursor, textEl, selColor = 'rgba(45, 212, 191, 0.35)', duration = 220) {
    if (isComplete || !textEl || !cursor) return;
    const text = textEl.textContent;
    const len = text.length;

    // 1. Move to start of text with live coordinate tracking
    await moveCursorToEl(cursor, textEl, 2, textEl.offsetHeight * 0.45, 200);
    await clickCursor(cursor);
    await pauseOnEl(cursor, textEl, 2, textEl.offsetHeight * 0.45, 130); // Human pause before starting drag

    // 2. Drag across text from left to right, expanding selection highlight
    const startTime = performance.now();
    await new Promise((resolve) => {
      function step(now) {
        if (isComplete) return resolve();
        const progress = Math.min(1, (now - startTime) / duration);
        const charsSelected = Math.max(1, Math.round(progress * len));

        textEl.innerHTML = `<span class="figma-selection" style="--sel-bg: ${selColor}">${text.slice(0, charsSelected)}</span>${text.slice(charsSelected)}`;

        const sel = textEl.querySelector('.figma-selection');
        if (sel) {
          const curStage = stage.getBoundingClientRect();
          const selRect = sel.getBoundingClientRect();
          cursor.style.transition = 'none';
          cursor.style.transform = `translate3d(${(selRect.right - curStage.left + 2).toFixed(1)}px, ${(selRect.top - curStage.top + selRect.height * 0.45).toFixed(1)}px, 0)`;
        }

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          textEl.innerHTML = `<span class="figma-selection" style="--sel-bg: ${selColor}">${text}</span>`;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    const finalSel = textEl.querySelector('.figma-selection') || textEl;
    await pauseOnEl(cursor, finalSel, finalSel.offsetWidth + 2, finalSel.offsetHeight * 0.45, 150); // Human pause with text highlighted
  }

  // Corner / Handle Drag Resize: cursor is physically locked to the handle during the entire drag!
  async function dragHandleResize(cursor, containerEl, handleEl, fromRem, toRem, duration = 400) {
    if (isComplete || !containerEl || !handleEl || !cursor) return;

    // 1. Move cursor to handle
    await moveCursorToEl(cursor, handleEl, 2, 4, 240);
    await clickCursor(cursor);

    // 2. Drag handle frame-by-frame
    const startTime = performance.now();
    await new Promise((resolve) => {
      function step(now) {
        if (isComplete) return resolve();
        const progress = Math.min(1, (now - startTime) / duration);
        const ease = 1 - Math.pow(1 - progress, 3);
        const curRem = fromRem + (toRem - fromRem) * ease;
        containerEl.style.maxWidth = `${curRem.toFixed(2)}rem`;

        const sRect = stage.getBoundingClientRect();
        const hRect = handleEl.getBoundingClientRect();
        cursor.style.transition = 'none';
        cursor.style.transform = `translate3d(${(hRect.left - sRect.left + 2).toFixed(1)}px, ${(hRect.top - sRect.top + 4).toFixed(1)}px, 0)`;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          containerEl.style.maxWidth = `${toRem}rem`;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    await pause(70);
  }

  // Frame Drag Draw: cursor moves to top-left, clicks, and drags diagonally across to draw the dashed frame box!
  async function dragDrawCard(cursor, pillarEl, duration = 300) {
    if (isComplete || !pillarEl || !cursor) return;
    await moveCursorToEl(cursor, pillarEl, 0, 0, 260);
    await clickCursor(cursor);

    pillarEl.classList.add('has-frame', 'is-wireframe-active');
    const parent = cursor.parentElement || stage;
    const isLocal = parent === pillarEl;
    const targetX = isLocal
      ? pillarEl.offsetWidth - 10
      : pillarEl.getBoundingClientRect().right - stage.getBoundingClientRect().left - 10;
    const targetY = isLocal
      ? pillarEl.offsetHeight - 10
      : pillarEl.getBoundingClientRect().bottom - stage.getBoundingClientRect().top - 10;

    // Drag cursor down and right across the card to form the wireframe frame
    await moveCursor(cursor, targetX, targetY, duration);
    pillarEl.classList.remove('is-wireframe-active');
    await pause(60);
  }

  // Left Accent Border: cursor slides down the left stroke, applying the accent color
  async function dragDrawLeftAccent(cursor, pillarEl, accentColor, duration = 280) {
    if (isComplete || !pillarEl || !cursor) return;
    await moveCursorToEl(cursor, pillarEl, -2, 0, 240);
    await clickCursor(cursor);

    pillarEl.style.borderLeftColor = accentColor;
    pillarEl.classList.remove('has-frame');

    const parent = cursor.parentElement || stage;
    const isLocal = parent === pillarEl;
    const targetX = isLocal
      ? -2
      : pillarEl.getBoundingClientRect().left - stage.getBoundingClientRect().left - 2;
    const targetY = isLocal
      ? pillarEl.offsetHeight
      : pillarEl.getBoundingClientRect().bottom - stage.getBoundingClientRect().top;

    await moveCursor(cursor, targetX, targetY, duration);
    await pause(60);
  }

  // Off-screen Glide: cleanly flies completely off the monitor edges in distinct divergent directions
  async function glideOffscreen(cursor, direction = 'right', duration = 800) {
    if (!cursor) return;
    const sRect = stage.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let targetX = vw - sRect.left + 280;
    let targetY = -sRect.top - 240;

    if (direction === 'left' || direction === 'top-left') {
      targetX = -sRect.left - 280;
      targetY = -sRect.top - 240;
    } else if (direction === 'top-right') {
      targetX = vw - sRect.left + 280;
      targetY = -sRect.top - 240;
    } else if (direction === 'bottom-left') {
      targetX = -sRect.left - 280;
      targetY = vh - sRect.top + 280;
    } else if (direction === 'bottom-right') {
      targetX = vw - sRect.left + 280;
      targetY = vh - sRect.top + 280;
    }

    cursor.style.transition = `transform ${duration}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${duration}ms ease-out`;
    cursor.style.transform = `translate3d(${targetX.toFixed(1)}px, ${targetY.toFixed(1)}px, 0)`;
    cursor.style.opacity = '0';
    await pause(duration + 40);
    try {
      cursor.remove();
    } catch (_) {}
  }

  // ---------------------------------------------------------------------------
  // INITIAL POSITIONS (OUTSIDE MONITOR BOUNDARIES)
  // ---------------------------------------------------------------------------

  const initSRect = stage.getBoundingClientRect();
  setPos(cursorTeal, -initSRect.left - 160, -initSRect.top - 160);
  setPos(cursorSky, window.innerWidth - initSRect.left + 160, -initSRect.top - 160);
  setPos(cursorAmber, -initSRect.left - 160, (window.innerHeight - initSRect.top) * 0.45);
  setPos(cursorPurple, window.innerWidth - initSRect.left + 160, (window.innerHeight - initSRect.top) * 0.8);

  function finishImmediately() {
    if (isComplete) return;
    isComplete = true;

    boxTitle.classList.remove('is-active');
    boxSubtitle.classList.remove('is-active');
    boxLead.classList.remove('is-active');
    pillarsFrame.classList.remove('is-active');

    pillarEls.forEach((pel, i) => {
      pel.classList.remove('has-frame', 'is-wireframe-active');
      pel.style.borderLeftColor = pillarData[i].accent;
      pel.querySelector('.figma-card-layer--meta').classList.remove('is-active');
      pel.querySelector('.figma-stage__pillar-meta').classList.add('is-formatted');
      pel.querySelector('.figma-stage__pillar-meta').textContent = pillarData[i].meta;

      pel.querySelector('.figma-card-layer--title').classList.remove('is-active');
      pel.querySelector('.figma-stage__pillar-title').classList.add('is-formatted');
      pel.querySelector('.figma-stage__pillar-title').textContent = pillarData[i].title;

      pel.querySelector('.figma-card-layer--subtitle').classList.remove('is-active');
      pel.querySelector('.figma-stage__pillar-subtitle').classList.add('is-formatted');
      pel.querySelector('.figma-stage__pillar-subtitle').textContent = pillarData[i].subtitle;

      pel.querySelector('.figma-card-layer--desc').classList.remove('is-active');
      pel.querySelector('.figma-stage__pillar-desc').classList.add('is-formatted');
      pel.querySelector('.figma-stage__pillar-desc').textContent = pillarData[i].desc;
    });

    textTitle.style.fontFamily = 'var(--font-display)';
    textTitle.style.fontSize = 'clamp(3.25rem, 5.6vw, 4.9rem)';
    textTitle.style.fontWeight = '600';
    textTitle.style.letterSpacing = '-0.03em';
    textTitle.style.color = 'var(--text)';
    textTitle.textContent = titleText;

    textSubtitle.style.fontFamily = 'var(--font-display)';
    textSubtitle.style.fontSize = 'clamp(1.3rem, 2.05vw, 1.8rem)';
    textSubtitle.style.fontWeight = '500';
    textSubtitle.style.color = 'var(--accent)';
    textSubtitle.textContent = subtitleText;

    leadGroup.style.maxWidth = '58rem';
    textLead.style.color = 'var(--text-quiet)';
    textLead.innerHTML = nativeLead ? nativeLead.innerHTML : leadFullText;

    if (timelineStage) {
      renderTimelineSvg(timelineStage, true);
    }

    stage.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    stage.querySelectorAll('.figma-handle').forEach((el) => el.remove());
    stage.querySelector('.figma-cursors-layer')?.remove();
  }

  // Smooth typography size interpolation without Chromium clamp() 0-size jitter
  function animateFontGrowth(el, applyStyles, duration = 300) {
    if (!el) return;
    const startPx = parseFloat(window.getComputedStyle(el).fontSize) || 16;
    applyStyles();
    const endPx = parseFloat(window.getComputedStyle(el).fontSize) || startPx;
    if (Math.abs(endPx - startPx) > 0.5 && typeof el.animate === 'function') {
      el.animate(
        [
          { fontSize: `${startPx}px` },
          { fontSize: `${endPx}px` },
        ],
        {
          duration,
          easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
          fill: 'none',
        },
      );
    }
  }

  // ---------------------------------------------------------------------------
  // ACT 1 & ACT 2: TITLE, SUBTITLE & LEAD PARAGRAPH (CURated BY PURPLE ARCHITECT)
  // ---------------------------------------------------------------------------

  async function buildTitle() {
    await pause(120);
    // 1. Purple moves to Title box location
    await moveCursorToEl(cursorPurple, boxTitle, 16, 12, 240);
    await clickCursor(cursorPurple);

    // 2. Click creates active bounding box
    boxTitle.classList.add('is-active');

    // 3. Types draft title (cursor stays completely STILL at click position!)
    await typeInto(textTitle, titleText, 22);
    await pause(140); // Human pause after typing before selecting

    // 4. Drags across text to highlight/select it (with human pauses)
    await dragSelectText(cursorPurple, textTitle, 'rgba(167, 139, 250, 0.35)', 200);

    // 5. Applies 64px display font while highlighted with smooth growing animation
    animateFontGrowth(textTitle, () => {
      textTitle.style.fontFamily = 'var(--font-display)';
      textTitle.style.fontSize = 'clamp(3.25rem, 5.6vw, 4.9rem)';
      textTitle.style.fontWeight = '600';
      textTitle.style.letterSpacing = '-0.03em';
      textTitle.style.color = 'var(--text)';
    }, 320);
    await pause(160); // Human pause observing newly applied font

    // 6. Clicks outside to deselect
    await clickCursor(cursorPurple);
    textTitle.textContent = titleText;
    boxTitle.classList.remove('is-active');
    await pause(100);
  }

  async function buildSubtitle() {
    await pause(100);
    // 1. Purple moves to Subtitle box location
    await moveCursorToEl(cursorPurple, boxSubtitle, 12, 8, 200);
    await clickCursor(cursorPurple);

    // 2. Click creates active bounding box
    boxSubtitle.classList.add('is-active');

    // 3. Types draft subtitle (cursor stays STILL!)
    await typeInto(textSubtitle, subtitleText, 14);
    await pause(130); // Human pause after typing before selecting

    // 4. Drags across text to highlight/select it
    await dragSelectText(cursorPurple, textSubtitle, 'rgba(167, 139, 250, 0.35)', 200);

    // 5. Applies font and accent color with smooth growing animation
    animateFontGrowth(textSubtitle, () => {
      textSubtitle.style.fontFamily = 'var(--font-display)';
      textSubtitle.style.fontSize = 'clamp(1.3rem, 2.05vw, 1.8rem)';
      textSubtitle.style.fontWeight = '500';
      textSubtitle.style.color = 'var(--accent)';
    }, 280);
    await pause(160); // Human pause observing applied color

    // 6. Clicks outside to deselect
    await clickCursor(cursorPurple);
    textSubtitle.textContent = subtitleText;
    boxSubtitle.classList.remove('is-active');
    await pause(100);
  }

  async function buildLeadParagraph() {
    await pause(100);
    // 1. Purple moves to Lead paragraph location
    await moveCursorToEl(cursorPurple, boxLead, 12, 10, 220);
    await clickCursor(cursorPurple);

    // 2. Click creates active bounding box
    boxLead.classList.add('is-active');

    // 3. Streams draft text (cursor stays STILL at 12, 10 while typing occurs!)
    await typeInto(textLead, leadFullText, 9, 2);
    textLead.style.color = 'var(--text-quiet)';
    await pause(120);

    // 4. Physical humanized bolding:
    // Move to start of word -> Click -> Human pause -> Drag to select -> Human pause -> Apply bold -> Pause
    if (boldWords.length > 0) {
      for (const word of boldWords) {
        if (isComplete) break;
        const safeWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Wrap word in a clean, unstyled span to locate its exact physical position (NOT highlighted yet!)
        textLead.innerHTML = textLead.innerHTML.replace(
          new RegExp(`(${safeWord})`, 'g'),
          '<span class="figma-target-word" style="background: transparent">$1</span>',
        );

        const targetSpan = textLead.querySelector('.figma-target-word');
        if (targetSpan) {
          // A. Move cursor to the physical start of the word with live element tracking
          await moveCursorToEl(cursorPurple, targetSpan, 0, targetSpan.offsetHeight * 0.5, 220);
          await clickCursor(cursorPurple);
          await pauseOnEl(cursorPurple, targetSpan, 0, targetSpan.offsetHeight * 0.5, 140); // Human pause before starting drag

          // B. Drag across the word from left to right: highlight emerges progressively behind the cursor!
          const wordLen = word.length;
          const dragDuration = 200;
          const dStart = performance.now();

          await new Promise((resolve) => {
            function step(now) {
              if (isComplete) return resolve();
              const progress = Math.min(1, (now - dStart) / dragDuration);
              const charsSelected = Math.max(1, Math.round(progress * wordLen));

              targetSpan.innerHTML = `<span class="figma-selection" style="--sel-bg: rgba(167, 139, 250, 0.35)">${word.slice(0, charsSelected)}</span>${word.slice(charsSelected)}`;

              const sel = targetSpan.querySelector('.figma-selection');
              if (sel) {
                const curStage = stage.getBoundingClientRect();
                const selRect = sel.getBoundingClientRect();
                cursorPurple.style.transition = 'none';
                cursorPurple.style.transform = `translate3d(${(selRect.right - curStage.left + 2).toFixed(1)}px, ${(selRect.top - curStage.top + selRect.height * 0.5).toFixed(1)}px, 0)`;
              }

              if (progress < 1) {
                requestAnimationFrame(step);
              } else {
                targetSpan.innerHTML = `<span class="figma-selection" style="--sel-bg: rgba(167, 139, 250, 0.35)">${word}</span>`;
                resolve();
              }
            }
            requestAnimationFrame(step);
          });

          // C. Human pause after drag-selection before keyboard shortcut / bold click (locked to selection)
          const selFinal = targetSpan.querySelector('.figma-selection') || targetSpan;
          await pauseOnEl(cursorPurple, selFinal, selFinal.offsetWidth + 2, selFinal.offsetHeight * 0.5, 180);

          // D. Turn bold!
          const uniqueId = `figma-bold-${Date.now()}`;
          targetSpan.outerHTML = `<strong class="figma-just-bolded ${uniqueId}">${word}</strong>`;
          const boldEl = textLead.querySelector(`.${uniqueId}`);

          // E. Human pause observing the bold word before deselecting (locked to bold element)
          if (boldEl) {
            await pauseOnEl(cursorPurple, boldEl, boldEl.offsetWidth + 2, boldEl.offsetHeight * 0.5, 160);
          } else {
            await pause(160);
          }
        }
      }
    }

    // 5. Clicks outside to deselect
    await clickCursor(cursorPurple);
    boxLead.classList.remove('is-active');
  }

  // ---------------------------------------------------------------------------
  // ACT 3: THE 3 EXPERIENCE CARDS (FAST & CONCURRENT BY BRAND-MATCHED CURSORS)
  // ---------------------------------------------------------------------------

  async function buildCard(cardIndex, collaboratorCursor) {
    const p = pillarData[cardIndex];
    const pel = pillarEls[cardIndex];
    const metaBox = pel.querySelector('.figma-card-layer--meta');
    const metaText = metaBox.querySelector('.figma-stage__pillar-meta');
    const titleBox = pel.querySelector('.figma-card-layer--title');
    const titleEl = titleBox.querySelector('.figma-stage__pillar-title');
    const subtitleBox = pel.querySelector('.figma-card-layer--subtitle');
    const subtitleEl = subtitleBox.querySelector('.figma-stage__pillar-subtitle');
    const descBox = pel.querySelector('.figma-card-layer--desc');
    const descEl = descBox.querySelector('.figma-stage__pillar-desc');

    // 0. Physically attach collaborator cursor directly to this card
    // When elements above grow or wrap, the card moves down in layout flow,
    // and the cursor (being a child of pel) sticks vertically in 100% natural lockstep!
    pel.style.position = 'relative';
    pel.appendChild(collaboratorCursor);
    collaboratorCursor.style.transition = 'none';
    collaboratorCursor.style.transform = 'translate3d(0px, 0px, 0)';

    // 1. Move to Column and drag diagonally to draw wireframe frame
    await dragDrawCard(collaboratorCursor, pel, 240);
    await pause(100);

    // 2. Move to Date badge -> Click -> Type (cursor still) -> Drag to select -> Format to uppercase mono
    await moveCursorToEl(collaboratorCursor, metaBox, 6, 4, 180);
    await clickCursor(collaboratorCursor);
    metaBox.classList.add('is-active');
    await typeInto(metaText, p.meta, 14);
    await pause(110);
    await dragSelectText(collaboratorCursor, metaText, p.color + '55', 180);
    metaText.classList.add('is-formatted');
    metaText.textContent = p.meta;
    await pause(140);
    await clickCursor(collaboratorCursor);
    metaBox.classList.remove('is-active');
    await pause(90);

    // 3. Move to Title -> Click -> Type (cursor still) -> Drag to select -> Format to display bold
    await moveCursorToEl(collaboratorCursor, titleBox, 8, 5, 180);
    await clickCursor(collaboratorCursor);
    titleBox.classList.add('is-active');
    await typeInto(titleEl, p.title, 14);
    await pause(110);
    await dragSelectText(collaboratorCursor, titleEl, p.color + '55', 180);
    animateFontGrowth(titleEl, () => {
      titleEl.classList.add('is-formatted');
      titleEl.textContent = p.title;
    }, 240);
    await pause(140);
    await clickCursor(collaboratorCursor);
    titleBox.classList.remove('is-active');
    await pause(90);

    // 4. Move to Subtitle -> Click -> Type (cursor still) -> Drag to select -> Format to medium sans
    await moveCursorToEl(collaboratorCursor, subtitleBox, 8, 4, 180);
    await clickCursor(collaboratorCursor);
    subtitleBox.classList.add('is-active');
    await typeInto(subtitleEl, p.subtitle, 12);
    await pause(110);
    await dragSelectText(collaboratorCursor, subtitleEl, p.color + '55', 180);
    subtitleEl.classList.add('is-formatted');
    subtitleEl.textContent = p.subtitle;
    await pause(140);
    await clickCursor(collaboratorCursor);
    subtitleBox.classList.remove('is-active');
    await pause(90);

    // 5. Move to Description -> Click -> Stream description copy (cursor still)
    await moveCursorToEl(collaboratorCursor, descBox, 8, 6, 180);
    await clickCursor(collaboratorCursor);
    descBox.classList.add('is-active');
    await typeInto(descEl, p.desc, 10, 2);
    await pause(120);
    descEl.classList.add('is-formatted');
    await pause(100);
    descBox.classList.remove('is-active');
    await pause(100);

    // 6. Move to left border and drag down the accent colored stroke
    await dragDrawLeftAccent(collaboratorCursor, pel, p.accent, 220);
    await pause(120);

    // 7. Reparent back to .figma-cursors-layer for Act 4 (timeline drawing)
    // IMPORTANT: Cursor stays at the BOTTOM of the card's left accent line (no teleporting to top)!
    // In Act 4, it will glide UP the line to the top before drawing the stem to the timeline.
    const pRect = pel.getBoundingClientRect();
    const sRect = stage.getBoundingClientRect();
    stage.querySelector('.figma-cursors-layer').appendChild(collaboratorCursor);
    collaboratorCursor.style.transition = 'none';
    const curX = pRect.left - sRect.left - 2;
    const curY = pRect.bottom - sRect.top;
    collaboratorCursor.style.transform = `translate3d(${curX.toFixed(1)}px, ${curY.toFixed(1)}px, 0)`;
  }

  // ---------------------------------------------------------------------------
  // ACT 4: DYNAMIC CHRONOLOGY TIMELINE & BRACKET CONNECTORS
  // ---------------------------------------------------------------------------

  function renderTimelineSvg(timelineContainer, isInstant = false) {
    if (!timelineContainer) return null;
    const now = new Date();

    const parsedData = pillarData.map((p, idx) => {
      const s = new Date(p.startDate).getTime();
      const e = p.endDate === 'present' ? now.getTime() : new Date(p.endDate).getTime();
      return { ...p, idx, startTime: s, endTime: e };
    });

    const minTime = new Date('2021-09-01').getTime(); // Sep 1, 2021 origin (Warwick university start)
    const maxTime = now.getTime(); // Live Present
    const totalSpan = maxTime - minTime;

    const stageRect = timelineContainer.getBoundingClientRect();
    const width = Math.max(320, stageRect.width || 880);
    const height = 58;

    // Time to X: Left is Present (0), Right is Past (width)
    const timeToX = (t) => {
      const ratio = Math.max(0, Math.min(1, (maxTime - t) / totalSpan));
      return ratio * width;
    };

    // Clean interior year markers: 2022, 2023, 2024, 2025, 2026...
    // Starts at Sep 2021 with NO redundant 2021 or SEP 2021 text label (zero collisions)
    const currentYear = now.getFullYear();
    const years = [];
    for (let y = 2022; y <= currentYear; y++) {
      const t = new Date(y, 0, 1).getTime();
      const rawX = timeToX(t);

      let anchor = 'middle';
      let labelX = rawX;

      if (rawX < 24) {
        anchor = 'start';
        labelX = 4;
      }

      years.push({ year: y, x: rawX, labelX, anchor });
    }

    // Measure actual card positions relative to timeline stage
    const brackets = parsedData.map((p) => {
      const pel = pillarEls[p.idx];
      const pRect = pel ? pel.getBoundingClientRect() : { left: stageRect.left, right: stageRect.right };
      const cardLeft = Math.max(0, pRect.left - stageRect.left);
      const cardRight = Math.min(width, pRect.right - stageRect.left);

      // Newer date is left, older date is right
      const timeXLeft = timeToX(p.endTime);
      const timeXRight = timeToX(p.startTime);

      return {
        ...p,
        timeXLeft,
        timeXRight,
        cardLeft,
        cardRight,
      };
    });

    const rulerY = 14;
    const bottomY = height - 2; // 56px

    const yearMarkup = years
      .map(
        (y) => `
        <g class="figma-timeline-year" data-year="${y.year}" data-x="${y.x.toFixed(1)}">
          <line class="figma-timeline-tick ${isInstant ? 'is-revealed' : ''}" x1="${y.x.toFixed(1)}" y1="${rulerY - 4}" x2="${y.x.toFixed(1)}" y2="${rulerY + 5}" stroke="#475569" stroke-width="1.2" />
          <text class="figma-timeline-label ${isInstant ? 'is-revealed' : ''}" x="${y.labelX.toFixed(1)}" y="${rulerY - 6}" text-anchor="${y.anchor}" font-family="var(--font-mono)" font-size="9" fill="#64748b" letter-spacing="0.04em">${y.year}</text>
        </g>
      `,
      )
      .join('');

    // Segmented Chrono-Bar segments (Progressively drawn from timeXRight to timeXLeft)
    // Initially x2 = timeXRight (0 length). As cursor sweeps, x2 extends towards timeXLeft.
    const segmentsMarkup = brackets
      .map((b) => {
        const x1 = b.timeXLeft.toFixed(1);
        const x2 = b.timeXRight.toFixed(1);
        const strokeColor = b.id === 'alphasights' ? 'url(#figma-fade-alphasights)' : b.color;
        const initialX2 = isInstant ? x1 : x2;
        const revealedClass = isInstant ? 'is-revealed' : '';
        return `
        <line class="figma-chrono-segment ${revealedClass}" id="segment-${b.id}" data-x1="${x1}" data-x2="${x2}" x1="${x2}" y1="${rulerY}" x2="${initialX2}" y2="${rulerY}" stroke="${strokeColor}" stroke-width="2.5" stroke-linecap="round" />
        <circle class="figma-chrono-node ${revealedClass}" id="node-${b.id}" cx="${x2}" cy="${rulerY}" r="2.2" fill="${b.color}" />
      `;
      })
      .join('');

    // Suspended Card Stems (Clean architectural stems connecting each card's left border to its timeline start date)
    const stemsMarkup = brackets
      .map((b) => {
        const startX = b.cardLeft;
        const targetX = b.timeXRight;
        const d =
          Math.abs(startX - targetX) < 4
            ? `M ${startX.toFixed(1)} ${bottomY} L ${targetX.toFixed(1)} ${rulerY}`
            : `M ${startX.toFixed(1)} ${bottomY} C ${startX.toFixed(1)} 32, ${targetX.toFixed(1)} 32, ${targetX.toFixed(1)} ${rulerY}`;
        const revealedClass = isInstant ? 'is-revealed' : '';

        return `
        <g class="figma-timeline-stem-group ${revealedClass}" id="bracket-${b.id}">
          <path class="figma-timeline-bracket ${revealedClass}" d="${d}" stroke="${b.color}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="${startX.toFixed(1)}" cy="${bottomY}" r="2" fill="${b.color}" />
        </g>
      `;
      })
      .join('');

    timelineContainer.innerHTML = `
      <svg class="figma-timeline-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="figma-base-fade" x1="0%" y1="0%" x2="55px" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#334155" stop-opacity="0" />
            <stop offset="100%" stop-color="#334155" stop-opacity="0.85" />
          </linearGradient>
          <linearGradient id="figma-fade-alphasights" x1="0%" y1="0%" x2="45px" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#2dd4bf" stop-opacity="0.15" />
            <stop offset="100%" stop-color="#2dd4bf" stop-opacity="1" />
          </linearGradient>
        </defs>

        <!-- Base Timeline Ruler -->
        <path class="figma-timeline-ruler ${isInstant ? 'is-revealed' : ''}" d="M ${width} ${rulerY} L 0 ${rulerY}" stroke="url(#figma-base-fade)" stroke-width="1.5" stroke-linecap="round" />

        <!-- Segmented Chrono-Bar (Dynamic Proportions) -->
        ${segmentsMarkup}

        <!-- Dynamic Year Ticks -->
        ${yearMarkup}

        <!-- Suspended Card Stems -->
        ${stemsMarkup}
      </svg>
    `;

    return {
      svg: timelineContainer.querySelector('.figma-timeline-svg'),
      rulerPath: timelineContainer.querySelector('.figma-timeline-ruler'),
      yearGroups: [...timelineContainer.querySelectorAll('.figma-timeline-year')],
      brackets,
      width,
      rulerY,
    };
  }

  async function animateTimelineDrawing(timelineData) {
    if (!timelineData || isComplete) return;

    const { rulerPath, yearGroups, brackets, width, rulerY } = timelineData;
    const stageRect = stage.getBoundingClientRect();
    const tRect = timelineStage.getBoundingClientRect();
    const stageOffsetY = tRect.top - stageRect.top;

    // 1. Purple draws the base ruler baseline and reveals the interior year ticks (2022-2026)
    const rulerLen = rulerPath.getTotalLength();
    rulerPath.style.strokeDasharray = `${rulerLen}`;
    rulerPath.style.strokeDashoffset = `${rulerLen}`;
    rulerPath.classList.add('is-drawing');

    await moveCursor(cursorPurple, tRect.left - stageRect.left + width, stageOffsetY + rulerY, 240);
    await clickCursor(cursorPurple);

    const baseDuration = 480;
    const baseStart = performance.now();

    await new Promise((resolve) => {
      function step(now) {
        if (isComplete) return resolve();
        const p = Math.min(1, (now - baseStart) / baseDuration);
        const currentX = width * (1 - p);

        rulerPath.style.strokeDashoffset = `${currentX.toFixed(1)}`;

        // Purple leads the ruler stroke
        cursorPurple.style.transition = 'none';
        cursorPurple.style.transform = `translate3d(${(tRect.left - stageRect.left + currentX).toFixed(1)}px, ${(stageOffsetY + rulerY - 2).toFixed(1)}px, 0)`;

        // Reveal year ticks as cursor sweeps past them
        yearGroups.forEach((yg) => {
          const yX = parseFloat(yg.getAttribute('data-x'));
          if (currentX <= yX) {
            yg.querySelectorAll('.figma-timeline-tick, .figma-timeline-label').forEach((el) =>
              el.classList.add('is-revealed'),
            );
          }
        });

        if (p < 1) {
          requestAnimationFrame(step);
        } else {
          rulerPath.style.strokeDashoffset = '0';
          rulerPath.classList.remove('is-drawing');
          rulerPath.classList.add('is-revealed');
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    // Purple finishes ruler at left (x = 0) and glides off
    glideOffscreen(cursorPurple, 'top-left', 700);

    // 2. Collaborators draw their OWN timeline section in their OWN brand color!
    // Amber cursor -> Warwick (Card 2)
    // Sky cursor -> Leonardo (Card 1)
    // Teal cursor -> AlphaSights (Card 0)
    //
    // Physical flow:
    // 1) Cursor is resting at the BOTTOM of the card's vertical accent line (no teleporting!)
    // 2) Glides smoothly UP the left border to the top of the card
    // 3) Traces the bracket curve UP to the timeline ruler, drawing the curve progressively
    // 4) Sweeps along the timeline ruler, drawing the colored section progressively as it moves
    // 5) Glides offscreen
    const drawCardTimeline = async (collaboratorCursor, b, exitDirection) => {
      if (isComplete || !collaboratorCursor) return;

      const groupEl = timelineStage.querySelector(`#bracket-${b.id}`);
      const pathEl = groupEl?.querySelector('.figma-timeline-bracket');
      const segEl = timelineStage.querySelector(`#segment-${b.id}`);
      const nodeEl = timelineStage.querySelector(`#node-${b.id}`);

      // STEP A: Cursor is currently at the BOTTOM of the card's left accent line.
      // Smoothly move UP along the card's left edge to the card's top:
      const cardTopX = tRect.left - stageRect.left + b.cardLeft;
      const cardTopY = stageOffsetY + 56;
      await moveCursor(collaboratorCursor, cardTopX, cardTopY, 220);
      await clickCursor(collaboratorCursor);

      // STEP B: Trace bracket curve UP to the timeline ruler at b.timeXRight
      if (pathEl) {
        const bLen = pathEl.getTotalLength();
        pathEl.style.strokeDasharray = `${bLen}`;
        pathEl.style.strokeDashoffset = `${bLen}`;
        pathEl.classList.add('is-drawing');
        groupEl.classList.add('is-revealed');

        const bStart = performance.now();
        const bDuration = 320;

        await new Promise((resolve) => {
          function step(now) {
            if (isComplete) return resolve();
            const p = Math.min(1, (now - bStart) / bDuration);
            pathEl.style.strokeDashoffset = `${bLen * (1 - p)}`;

            // Cursor follows the tip of the drawn curve up to the timeline!
            const pt = pathEl.getPointAtLength(bLen * p);
            collaboratorCursor.style.transition = 'none';
            collaboratorCursor.style.transform = `translate3d(${(tRect.left - stageRect.left + pt.x).toFixed(1)}px, ${(stageOffsetY + pt.y).toFixed(1)}px, 0)`;

            if (p < 1) {
              requestAnimationFrame(step);
            } else {
              pathEl.style.strokeDashoffset = '0';
              pathEl.classList.remove('is-drawing');
              pathEl.classList.add('is-revealed');
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      }

      // STEP C: Cursor is now at b.timeXRight on the timeline!
      // Draw the colored chrono-bar segment progressively from xRight to xLeft right under cursor tip
      if (segEl) {
        segEl.classList.add('is-revealed');
        if (nodeEl) nodeEl.classList.add('is-revealed');

        const xRight = b.timeXRight;
        const xLeft = b.timeXLeft;
        const segWidth = Math.max(1, xRight - xLeft);
        const sStart = performance.now();
        const sDuration = Math.max(200, Math.min(420, segWidth * 2.4));

        await new Promise((resolve) => {
          function step(now) {
            if (isComplete) return resolve();
            const p = Math.min(1, (now - sStart) / sDuration);
            const currentX = xRight - (xRight - xLeft) * p;

            // Physical length extension in exact lockstep with cursor tip
            segEl.setAttribute('x2', currentX.toFixed(1));

            collaboratorCursor.style.transition = 'none';
            collaboratorCursor.style.transform = `translate3d(${(tRect.left - stageRect.left + currentX).toFixed(1)}px, ${(stageOffsetY + rulerY - 2).toFixed(1)}px, 0)`;

            if (p < 1) {
              requestAnimationFrame(step);
            } else {
              segEl.setAttribute('x2', xLeft.toFixed(1));
              resolve();
            }
          }
          requestAnimationFrame(step);
        });
      }

      await pause(70);
      await glideOffscreen(collaboratorCursor, exitDirection, 650);
    };

    // Staggered choreography: Warwick (Amber) -> Leonardo (Sky) -> AlphaSights (Teal)
    // Follows natural chronological order from right (past) to left (present)
    const pWarwick = drawCardTimeline(cursorAmber, brackets[2], 'right');
    await pause(140);
    const pLeonardo = drawCardTimeline(cursorSky, brackets[1], 'bottom-left');
    await pause(140);
    const pAlphaSights = drawCardTimeline(cursorTeal, brackets[0], 'top-left');

    await Promise.all([pWarwick, pLeonardo, pAlphaSights]);
  }

  // ---------------------------------------------------------------------------
  // MASTER ORCHESTRATION PIPELINE
  // ---------------------------------------------------------------------------

  async function runMaster() {
    if (isComplete) return;

    // 1. Lead Designer (Purple) kicks off: Title -> Subtitle -> Lead
    const pLeadWork = (async () => {
      await buildTitle();
      await buildSubtitle();
      await buildLeadParagraph();
    })();

    // 2. Card 0 (AlphaSights - Teal) built by cursorTeal starting at 0.2s!
    const pCard0 = (async () => {
      await pause(200);
      return buildCard(0, cursorTeal);
    })();

    // 3. Card 1 (Leonardo Helicopters - Sky Blue) built by cursorSky starting at 0.35s!
    const pCard1 = (async () => {
      await pause(350);
      return buildCard(1, cursorSky);
    })();

    // 4. Card 2 (Warwick - Amber) built by cursorAmber starting at 0.5s!
    const pCard2 = (async () => {
      await pause(500);
      return buildCard(2, cursorAmber);
    })();

    // Wait for all collaborators to finish their cards & lead copy
    await Promise.all([pLeadWork, pCard0, pCard1, pCard2]);
    if (isComplete) return;

    // 5. Draw Chronology Timeline & Card Brackets
    const timelineData = renderTimelineSvg(timelineStage, false);
    if (timelineData) {
      await animateTimelineDrawing(timelineData);
    }
    if (isComplete) return;

    // Clean completion: remove any remaining handles or active classes
    stage.querySelectorAll('.is-active').forEach((el) => el.classList.remove('is-active'));
    stage.querySelectorAll('.figma-handle').forEach((el) => el.remove());
  }

  // Responsive re-anchoring of timeline bracket curves on resize
  window.addEventListener(
    'resize',
    () => {
      if (timelineStage) {
        renderTimelineSvg(timelineStage, true);
      }
    },
    { passive: true },
  );

  runMaster().catch((err) => {
    console.error('Figma builder sequence error:', err);
    finishImmediately();
  });
}
