import { journeyReveal } from '../main.js';
import { handleSimulatorStepAdded, updateContext } from '../ai-expert.js';

/* ───── Data (no Convertible) ───── */
const instruments = [
  { id: 'preseed', name: 'Pre-Seed', color: 'var(--color-preseed)', time: '3 mo', share: '32%' },
  { id: 'seed', name: 'Seed', color: 'var(--color-seed)', time: '5 mo', share: '22%' },
  { id: 'series-a', name: 'Series A', color: 'var(--color-series-a)', time: '8 mo', share: '18%' },
  { id: 'grant', name: 'Grant', color: 'var(--color-grant)', time: '2 mo', share: '28%' },
];

const distributions = {
  start: [
    { id: 'preseed', pct: 40, time: '3 mo', share: '40%' },
    { id: 'grant', pct: 28, time: '2 mo', share: '28%' },
    { id: 'seed', pct: 26, time: '5 mo', share: '26%' },
    { id: 'series-a', pct: 6, time: '10 mo', share: '6%' },
  ],
  grant: [
    { id: 'preseed', pct: 46, time: '4 mo', share: '46%' },
    { id: 'seed', pct: 41, time: '6 mo', share: '41%' },
    { id: 'grant', pct: 8, time: '2 mo', share: '8%' },
    { id: 'series-a', pct: 5, time: '12 mo', share: '5%' },
  ],
  preseed: [
    { id: 'seed', pct: 50, time: '5 mo', share: '50%' },
    { id: 'series-a', pct: 37, time: '10 mo', share: '37%' },
    { id: 'grant', pct: 8, time: '2 mo', share: '8%' },
    { id: 'preseed', pct: 5, time: '3 mo', share: '5%' },
  ],
  seed: [
    { id: 'series-a', pct: 67, time: '8 mo', share: '67%' },
    { id: 'seed', pct: 22, time: '6 mo', share: '22%' },
    { id: 'preseed', pct: 6, time: '3 mo', share: '6%' },
    { id: 'grant', pct: 5, time: '2 mo', share: '5%' },
  ],
  'series-a': [
    { id: 'series-a', pct: 65, time: '12 mo', share: '65%' },
    { id: 'seed', pct: 25, time: '6 mo', share: '25%' },
    { id: 'preseed', pct: 6, time: '3 mo', share: '6%' },
    { id: 'grant', pct: 4, time: '2 mo', share: '4%' },
  ],
};

function getInst(id) { return instruments.find(i => i.id === id) || { name: id, color: '#ccc' }; }

/* ───── Render ───── */
export function renderPathSimulator(container) {
  const chosenPath = []; // { id, name, color, time, share }

  container.innerHTML = `
    <!-- PHASE 1: Intro -->
    <div class="tab-intro" id="ps-intro">
      <div class="journey-step">
        <div class="tab-intro-content">
          <h1 class="tab-intro-headline">
            Validate/simulate your <strong>early-stage<br/>funding path</strong>.
          </h1>
        </div>
      </div>
      <div class="journey-step">
        <div class="tab-intro-filters">
          <div class="hero-filter-group">
            <label class="hero-filter-label">Organisation Location:</label>
            <select class="hero-filter-select" id="ps-hero-country">
              <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Industry:</label>
            <select class="hero-filter-select" id="ps-hero-industry">
              <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Paths:</label>
            <select class="hero-filter-select" id="ps-hero-paths">
              <option>Secured Series A</option><option>All Paths</option>
            </select>
          </div>
        </div>
      </div>
      <div class="journey-step">
        <button class="hero-cta" id="ps-start-btn">
          <span>Simulate your Path…</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- PHASE 2: Track + selection -->
    <div class="tab-main-content hidden" id="ps-main">

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ps-pfb">
          <div class="pfb-collapsed" id="ps-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ps-pfb-cv-country">Germany</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ps-pfb-cv-industry">Tech / Software</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Paths:</span><span class="pfb-chip-value" id="ps-pfb-cv-paths">Secured Series A</span></div>
            </div>
            <div class="pfb-toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div class="pfb-expanded">
            <div class="pfb-dropdowns">
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Organisation Location:</label>
                <select class="pfb-dropdown-select" id="ps-pfb-country">
                  <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ps-pfb-industry">
                  <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Paths:</label>
                <select class="pfb-dropdown-select" id="ps-pfb-paths">
                  <option>Secured Series A</option><option>All Paths</option>
                </select>
              </div>
            </div>
            <div class="pfb-apply-row">
              <button class="pfb-apply-btn" id="ps-pfb-apply">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution Picker -->
      <div class="journey-step">
        <div class="ps-dist-panel" id="ps-dist-panel">
          <div class="ps-dist-title" id="ps-dist-title">Choose your 1st funding instrument</div>
          <div class="ps-dist-bars" id="ps-dist-bars"></div>
        </div>
      </div>

      <!-- TRAIN TRACK -->
      <div class="journey-step">
        <div class="track-wrapper" id="track-wrapper">
          <!-- Two horizontal rails -->
          <div class="track-rail track-rail--top"></div>
          <div class="track-rail track-rail--bottom"></div>

          <!-- Sleepers (ties) -->
          <div class="track-sleepers">
            <!-- Start sleeper -->
            <div class="track-sleeper track-sleeper--start">
              <div class="sleeper-bar sleeper-bar--filled" style="--sleeper-color: var(--accent)">
                <span class="sleeper-label">Start</span>
              </div>
              <div class="sleeper-meta">
                <span class="sleeper-meta-val sleeper-meta-label">Share</span>
              </div>
            </div>

            ${[1, 2, 3, 4].map(n => `
            <div class="track-gap" id="track-gap-${n}">
              <span class="track-gap-val" id="gap-months-${n}"></span>
            </div>
            <div class="track-sleeper" id="sleeper-${n}">
              <div class="sleeper-header">${['1st', '2nd', '3rd', '4th'][n - 1]} Instrument</div>
              <div class="sleeper-bar sleeper-bar--empty" id="sleeper-bar-${n}">
                <span class="sleeper-num">${n}</span>
              </div>
              <div class="sleeper-meta">
                <span class="sleeper-meta-val" id="sleeper-share-${n}"></span>
              </div>
            </div>
            `).join('')}

            <!-- Finish sleeper (integrated into the track) -->
            <div class="track-gap" id="track-gap-finish"></div>
            <div class="track-sleeper track-sleeper--finish" id="sleeper-finish">
              <div class="sleeper-header">&nbsp;</div>
              <div class="sleeper-bar sleeper-bar--finish sleeper-bar--disabled" id="sleeper-bar-finish">
                <span class="sleeper-label">Finish</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Result Stats (hidden until Finish is clicked) -->
      <div class="journey-step">
        <div class="ps-result-stats" id="ps-result-stats" style="display:none;"></div>
        <div class="ps-result-actions" id="ps-result-actions" style="display:none;">
          <button class="hero-cta ps-retry-btn" id="ps-retry-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            <span>Retry</span>
          </button>
          <button class="hero-cta ps-export-btn" id="ps-export-btn" style="background: var(--bg-surface); color: var(--accent); border: 1px solid var(--accent);">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            <span>Export PDF</span>
          </button>
        </div>
      </div>
    </div>
  `;

  /* ── Start button ── */
  const introEl = document.getElementById('ps-intro');
  const mainEl = document.getElementById('ps-main');

  /* ── Persistent Filter Bar ── */
  const psPfb = document.getElementById('ps-pfb');
  const psPfbToggle = document.getElementById('ps-pfb-toggle');
  const psPfbApply = document.getElementById('ps-pfb-apply');
  const psPfbCountry = document.getElementById('ps-pfb-country');
  const psPfbIndustry = document.getElementById('ps-pfb-industry');
  const psPfbPaths = document.getElementById('ps-pfb-paths');

  psPfbToggle.addEventListener('click', () => {
    psPfb.classList.toggle('expanded');
  });

  function syncPsIntroToPfb() {
    psPfbCountry.value = document.getElementById('ps-hero-country').value;
    psPfbIndustry.value = document.getElementById('ps-hero-industry').value;
    psPfbPaths.value = document.getElementById('ps-hero-paths').value;
    updatePsChips();
  }

  function updatePsChips() {
    document.getElementById('ps-pfb-cv-country').textContent = psPfbCountry.value;
    document.getElementById('ps-pfb-cv-industry').textContent = psPfbIndustry.value;
    document.getElementById('ps-pfb-cv-paths').textContent = psPfbPaths.value;
  }

  psPfbApply.addEventListener('click', () => {
    updatePsChips();
    psPfb.classList.remove('expanded');
  });

  document.getElementById('ps-start-btn').addEventListener('click', () => {
    syncPsIntroToPfb();
    updateContext('industry', document.getElementById('ps-hero-industry').value);
    updateContext('country', document.getElementById('ps-hero-country').value);

    introEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'translateY(-30px)';

    setTimeout(() => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');
      journeyReveal(mainEl, 200, 600);

      // Staggered roll-out of ALL sleepers & gaps
      // The track is the 3rd .journey-step (index 2), so journeyReveal shows it at
      // baseDelay(200) + 2*stepDelay(600) = 1400ms. We wait until AFTER that
      // so the parent is visible before child animations begin.
      const trackRevealDelay = 1600; // slightly after parent becomes visible
      const pieces = document.querySelectorAll('.track-wrapper .track-sleeper, .track-wrapper .track-gap');
      pieces.forEach((el, i) => {
        setTimeout(() => el.classList.add('rolled-in'), trackRevealDelay + i * 200);
      });

      // Roll out rails in sync with the sleepers
      const wrapper = document.getElementById('track-wrapper');
      setTimeout(() => wrapper.classList.add('rails-visible'), trackRevealDelay);

      renderDistribution();
    }, 600);
  });

  /* ── Distribution renderer ── */
  function renderDistribution() {
    const step = chosenPath.length;
    if (step >= 4) {
      document.getElementById('ps-dist-bars').innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding:var(--sp-6); font-size:var(--fs-sm);">
          🎉 Path complete! Review your full journey below.
        </div>`;
      document.getElementById('ps-dist-title').textContent = 'All steps selected';
      return;
    }

    const lastId = step === 0 ? 'start' : chosenPath[step - 1].id;
    const dist = distributions[lastId] || distributions.start;
    const ordinals = ['1st', '2nd', '3rd', '4th'];
    document.getElementById('ps-dist-title').textContent =
      step === 0
        ? `Choose your ${ordinals[step]} funding instrument`
        : `After ${chosenPath[step - 1].name} — choose your ${ordinals[step]} instrument`;

    const distBars = document.getElementById('ps-dist-bars');
    distBars.innerHTML = `
      <div class="ps-dist-header">
        <div class="ps-dist-label">Type</div>
        <div class="ps-dist-bar-title">Share of peers that chose that instrument</div>
        <div class="ps-dist-time">Median Time</div>
      </div>
    `;

    dist.forEach((item, idx) => {
      const info = getInst(item.id);
      const row = document.createElement('div');
      row.className = 'ps-dist-row';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-12px)';
      row.innerHTML = `
        <div class="ps-dist-plus">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        </div>
        <div class="ps-dist-label">${info.name}</div>
        <div class="ps-dist-bar-track">
          <div class="ps-dist-bar-fill" style="width:0%; background:${info.color}">
            <span class="ps-dist-bar-text">${item.pct}%</span>
          </div>
        </div>
        <div class="ps-dist-time">${item.time}</div>
      `;
      row.addEventListener('click', () => selectInstrument(item));
      distBars.appendChild(row);

      setTimeout(() => {
        row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        row.style.opacity = '1';
        row.style.transform = 'translateX(0)';
        row.querySelector('.ps-dist-bar-fill').style.width = item.pct + '%';
      }, 200 + idx * 120);
    });
  }

  /* ── Select instrument → fill sleeper ── */
  function selectInstrument(item) {
    const step = chosenPath.length;
    if (step >= 4) return;
    const info = getInst(item.id);
    chosenPath.push({ id: item.id, name: info.name, color: info.color, time: item.time, share: item.share || item.pct + '%' });

    const n = step + 1;
    fillSleeper(n, info, item);

    // Enable Finish sleeper when at least one instrument is chosen
    const finishBar = document.getElementById('sleeper-bar-finish');
    if (finishBar) finishBar.classList.remove('sleeper-bar--disabled');

    setTimeout(() => renderDistribution(), 400);
  }

  function fillSleeper(n, info, item) {
    const bar = document.getElementById(`sleeper-bar-${n}`);
    const shareEl = document.getElementById(`sleeper-share-${n}`);
    const gapEl = document.getElementById(`gap-months-${n}`);

    if (bar) {
      bar.classList.remove('sleeper-bar--empty');
      bar.classList.add('sleeper-bar--filled');
      bar.style.setProperty('--sleeper-color', info.color);
      bar.innerHTML = `<span class="sleeper-label">${info.name}</span>`;
      bar.style.cursor = 'pointer';
      bar.onclick = () => undoFrom(n);
    }
    if (shareEl) shareEl.textContent = item.share || item.pct + '%';
    if (gapEl) { gapEl.textContent = item.time; gapEl.classList.add('visible'); }
  }

  /* ── Undo: click a filled sleeper to remove it and all after it ── */
  function undoFrom(fromStep) {
    // Remove from this step onward
    while (chosenPath.length >= fromStep) {
      const removedStep = chosenPath.length;
      chosenPath.pop();
      clearSleeper(removedStep);
    }

    // Re-show distribution panel and hide results
    const distPanel = document.getElementById('ps-dist-panel');
    const resultEl = document.getElementById('ps-result-stats');
    const actionsEl = document.getElementById('ps-result-actions');
    if (distPanel) distPanel.style.display = '';
    if (resultEl) { resultEl.style.display = 'none'; resultEl.innerHTML = ''; }
    if (actionsEl) actionsEl.style.display = 'none';

    // Toggle Finish sleeper disabled state
    const finishBar = document.getElementById('sleeper-bar-finish');
    if (finishBar) {
      if (chosenPath.length > 0) finishBar.classList.remove('sleeper-bar--disabled');
      else finishBar.classList.add('sleeper-bar--disabled');
    }

    renderDistribution();
  }

  function clearSleeper(n) {
    const bar = document.getElementById(`sleeper-bar-${n}`);
    const shareEl = document.getElementById(`sleeper-share-${n}`);
    const gapEl = document.getElementById(`gap-months-${n}`);

    if (bar) {
      bar.classList.remove('sleeper-bar--filled');
      bar.classList.add('sleeper-bar--empty');
      bar.style.removeProperty('--sleeper-color');
      bar.innerHTML = `<span class="sleeper-num">${n}</span>`;
      bar.style.cursor = '';
      bar.onclick = null;
    }
    if (shareEl) shareEl.textContent = '';
    if (gapEl) { gapEl.textContent = ''; gapEl.classList.remove('visible'); }
  }

  /* ── Finish button handler ── */
  function setupFinishButton() {
    const finishBar = document.getElementById('sleeper-bar-finish');
    if (!finishBar) return;

    finishBar.addEventListener('click', () => {
      if (chosenPath.length === 0 || finishBar.classList.contains('sleeper-bar--disabled')) return;

      // Hide the distribution panel
      const distPanel = document.getElementById('ps-dist-panel');
      if (distPanel) distPanel.style.display = 'none';

      // Confetti!
      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#3B82F6'],
          zIndex: 9999
        });
      }

      // Calculate stats
      let totalMonths = 0;
      chosenPath.forEach(s => { totalMonths += parseInt(s.time) || 0; });

      // Shorter paths get higher startup counts
      const baseCount = [820, 540, 310, 180];
      const randomOffset = Math.floor(Math.random() * 80) - 40;
      const startupCount = (baseCount[chosenPath.length - 1] || 200) + randomOffset;

      // Build the path string
      const pathStr = chosenPath.map(s => s.name).join(' → ');

      // Show result stats
      const resultEl = document.getElementById('ps-result-stats');
      if (resultEl) {
        resultEl.style.display = 'flex';
        resultEl.innerHTML = `
          <div class="stat-card tp-stat-card">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 6v6l4 2"></path>
              </svg>
            </div>
            <div>
              <div class="stat-label">Cumulative Time:</div>
              <div class="stat-value">${totalMonths} Months</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div>
              <div class="stat-label">Startups in your ecosystem that chose this path:</div>
              <div class="stat-value">${startupCount}</div>
            </div>
          </div>
        `;
        resultEl.classList.add('revealed');
      }

      // Show action buttons
      const actionsEl = document.getElementById('ps-result-actions');
      if (actionsEl) actionsEl.style.display = 'flex';

      // Send summary to AI coach
      handleSimulatorStepAdded(pathStr, chosenPath.length, totalMonths);
    });
  }

  /* ── Retry handler ── */
  function setupRetryButton() {
    const retryBtn = document.getElementById('ps-retry-btn');
    if (!retryBtn) return;

    retryBtn.addEventListener('click', () => {
      // Clear all sleepers
      for (let i = chosenPath.length; i >= 1; i--) {
        clearSleeper(i);
      }
      chosenPath.length = 0;

      // Hide results and actions
      const resultEl = document.getElementById('ps-result-stats');
      const actionsEl = document.getElementById('ps-result-actions');
      if (resultEl) { resultEl.style.display = 'none'; resultEl.innerHTML = ''; }
      if (actionsEl) actionsEl.style.display = 'none';

      // Re-show distribution panel
      const distPanel = document.getElementById('ps-dist-panel');
      if (distPanel) distPanel.style.display = '';

      // Reset Finish sleeper to disabled
      const finishBar = document.getElementById('sleeper-bar-finish');
      if (finishBar) finishBar.classList.add('sleeper-bar--disabled');

      renderDistribution();
    });
  }

  /* ── Export PDF handler ── */
  function setupExportButton() {
    const exportBtn = document.getElementById('ps-export-btn');
    if (!exportBtn) return;

    exportBtn.addEventListener('click', () => {
      if (chosenPath.length === 0) return;

      let totalMonths = 0;
      chosenPath.forEach(s => { totalMonths += parseInt(s.time) || 0; });
      const pathStr = chosenPath.map(s => s.name).join(' → ');

      // Build a simple printable HTML and use browser print
      const printContent = `
        <!DOCTYPE html>
        <html><head><title>VentureGuide - Path Export</title>
        <style>
          body { font-family: 'Inter', 'Segoe UI', sans-serif; padding: 40px; color: #1a1a2e; }
          h1 { color: #4F46E5; font-size: 24px; margin-bottom: 8px; }
          h2 { font-size: 18px; color: #64748b; font-weight: 400; margin-bottom: 32px; }
          .path-box { background: #f8f6ff; border: 1px solid #e0daf5; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
          .path-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
          .path-value { font-size: 20px; font-weight: 700; color: #1a1a2e; }
          .stats { display: flex; gap: 24px; margin-top: 24px; }
          .stat { flex: 1; background: #f1f5f9; border-radius: 12px; padding: 20px; }
          .stat-label { font-size: 12px; color: #64748b; margin-bottom: 4px; }
          .stat-val { font-size: 28px; font-weight: 700; color: #4F46E5; }
          .steps { margin-top: 24px; }
          .step { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
          .step-num { width: 28px; height: 28px; border-radius: 50%; background: #4F46E5; color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 14px; flex-shrink: 0; }
          .step-name { font-weight: 600; }
          .step-time { color: #64748b; margin-left: auto; }
          .footer { margin-top: 40px; font-size: 12px; color: #94a3b8; }
        </style></head><body>
          <h1>VentureGuide</h1>
          <h2>Simulated Funding Path Export</h2>
          <div class="path-box">
            <div class="path-label">Selected Path</div>
            <div class="path-value">${pathStr}</div>
          </div>
          <div class="steps">
            ${chosenPath.map((s, i) => `
              <div class="step">
                <div class="step-num">${i + 1}</div>
                <div class="step-name">${s.name}</div>
                <div class="step-time">${s.time}</div>
              </div>
            `).join('')}
          </div>
          <div class="stats">
            <div class="stat">
              <div class="stat-label">Cumulative Time</div>
              <div class="stat-val">${totalMonths} Months</div>
            </div>
            <div class="stat">
              <div class="stat-label">Steps</div>
              <div class="stat-val">${chosenPath.length}</div>
            </div>
          </div>
          <div class="footer">Generated by VentureGuide · ${new Date().toLocaleDateString()}</div>
        </body></html>
      `;

      const printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 300);
    });
  }

  setupFinishButton();
  setupRetryButton();
  setupExportButton();
  journeyReveal(introEl, 300, 500);
}
