import { journeyReveal } from '../main.js';
import { handleSimulatorStepAdded, updateContext } from '../ai-expert.js';
import { getGlobalFilters, setGlobalFilters } from '../global-filters.js';

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
  grant: [
    { id: 'seed', pct: 60, time: '2 mo', share: '60%' },
    { id: 'preseed', pct: 28, time: '3 mo', share: '28%' },
    { id: 'series-a', pct: 12, time: '9 mo', share: '12%' },
  ],
};

const investorsByInstrument = {
  'grant': [
    { name: 'HTGF', deals: 320 },
    { name: 'Exist', deals: 212 },
    { name: 'Synergy', deals: 103 },
    { name: 'ERC', deals: 67 },
    { name: 'DFG', deals: 47 },
  ],
  'preseed': [
    { name: 'Antler', deals: 285 },
    { name: 'Plug & Play', deals: 198 },
    { name: 'APX', deals: 142 },
    { name: 'Entrepreneur First', deals: 89 },
    { name: 'Seedcamp', deals: 61 },
  ],
  'seed': [
    { name: 'Point Nine', deals: 310 },
    { name: 'Cherry Ventures', deals: 224 },
    { name: 'Earlybird', deals: 156 },
    { name: 'HV Capital', deals: 98 },
    { name: 'Creandum', deals: 72 },
  ],
  'series-a': [
    { name: 'Sequoia', deals: 425 },
    { name: 'Index Ventures', deals: 318 },
    { name: 'Atomico', deals: 187 },
    { name: 'Balderton', deals: 134 },
    { name: 'Northzone', deals: 89 },
  ],
};

function getInst(id) { return instruments.find(i => i.id === id) || { name: id, color: '#ccc' }; }

/* ───── Render ───── */
export function renderPathSimulator(container) {
  const chosenPath = []; // { id, name, color, time, share }
  const filters = getGlobalFilters();

  container.innerHTML = `
    <style>
      /* 1. Sprechblase (Tooltip) nach unten öffnen */
      .info-icon-wrapper .info-tooltip {
        bottom: auto !important; 
        top: calc(100% + 12px) !important;
      }
      
      /* 2. Schienen in die Mitte und deutlich weiter auseinander */
      .track-wrapper {
        position: relative;
        padding-top: 32px !important; /* Abstand nach oben etwas verringert (vorher 40px) */
      }
      .track-rail--top {
        bottom: auto !important;
        top: calc(50% - 24px) !important; 
      }
      .track-rail--bottom {
        bottom: auto !important;
        top: calc(50% + 24px) !important; 
      }
      
      /* 3. Monate absolut und exakt mittig zwischen den Schienen positionieren */
      .track-gap {
        position: relative !important;
        display: flex !important;
      }
      .track-gap-val {
        position: absolute !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important; 
        z-index: 10 !important;
        background-color: var(--bg-surface, #ffffff) !important;
        padding: 4px 10px !important;
        border-radius: 12px !important;
        border: 1.5px solid var(--accent, #4F46E5) !important;
        color: var(--accent, #4F46E5) !important;
        font-weight: 600 !important;
        font-size: 13px !important;
        line-height: 1 !important;
        white-space: nowrap !important;
      }
    </style>

    <!-- No intro — main content directly -->
    <div class="tab-main-content" id="ps-main">

      <div class="journey-step">
        <div class="persistent-filter-bar" id="ps-pfb">
          <div class="pfb-collapsed" id="ps-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ps-pfb-cv-country">${filters.location}</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ps-pfb-cv-industry">${filters.industry}</span></div>
              <div class="pfb-filter-chip" style="margin-left: var(--sp-2);">
                <span class="pfb-chip-label" style="text-transform: none;">Show ONLY paths that led to a Series A Round</span>
                <label class="toggle-switch">
                  <input type="checkbox" id="ps-pfb-seriesa-toggle-collapsed">
                  <span class="toggle-slider"></span>
                </label>
              </div>
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
                  <option value="" disabled>Choose Location</option>
                  <option>Austria</option><option>China</option><option>Finland</option><option>France</option><option>Germany</option><option>India</option><option>Switzerland</option><option>United Kingdom</option><option>United States</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ps-pfb-industry">
                  <option value="" disabled>Choose Industry</option>
                  <option>Consumer Goods</option><option>Energy / Resources</option><option>Finance / Consulting</option><option>Health / Biotechnology</option><option>Media / Entertainment</option><option>Mobility / Infrastructure</option><option>Tech / Software</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label" style="text-transform: none;">Show ONLY paths that led to a Series A Round</label>
                <div style="margin-top: 4px;">
                  <label class="toggle-switch">
                    <input type="checkbox" id="ps-pfb-seriesa-toggle-expanded">
                    <span class="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="journey-step">
        <div class="ps-dist-panel" id="ps-dist-panel">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div class="ps-dist-title" id="ps-dist-title">Choose your 1st Funding Type</div>
            <div class="info-icon-wrapper">
              <div class="info-icon">i</div>
              <div class="info-tooltip">
                <strong>Funding Types:</strong>
                <ul>
                  <li><strong>Pre-Seed / Seed / Series A</strong> — Dilutive capital, mainly from VCs and angel investors.</li>
                  <li><strong>Grants</strong> — Non-dilutive funding available at all stages; can also be non-monetary support.</li>
                </ul>
                The percentages show the share of peers who chose each Funding Type at this step. Times shown are the median durations between the corresponding Funding Types in your ecosystem.
              </div>
            </div>
          </div>
          <div style="display: flex; align-items: stretch; gap: 24px;">
            <div class="ps-dist-bars" id="ps-dist-bars" style="flex: 1;"></div>
            <div class="ps-finish-btn-container" style="display: flex; flex-direction: column;">
               <button class="ps-big-finish sleeper-bar--disabled" id="sleeper-bar-finish" style="flex: 1; min-width: 140px; border-radius: var(--radius-md); font-family: var(--font); font-size: var(--fs-md); font-weight: 600; display: flex; align-items: center; justify-content: center; cursor: pointer;">
                 Finish
               </button>
            </div>
          </div>
        </div>
      </div>

      <div class="journey-step">
        <div class="track-wrapper" id="track-wrapper">
          <div class="track-sleepers">
            <div class="track-rail track-rail--top"></div>
            <div class="track-rail track-rail--bottom"></div>
            <div class="track-sleeper track-sleeper--start">
              <div class="sleeper-header">Start</div>
              <div class="sleeper-bar sleeper-bar--empty">
                <span class="sleeper-num">0</span>
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
              <div class="sleeper-header">${['1st', '2nd', '3rd', '4th'][n - 1]} Stage</div>
              <div class="sleeper-bar sleeper-bar--empty" id="sleeper-bar-${n}">
                <span class="sleeper-num">${n}</span>
              </div>
              <div class="sleeper-meta">
                <span class="sleeper-meta-val" id="sleeper-share-${n}"></span>
              </div>
            </div>
            `).join('')}

          </div>
          
          <div class="ps-result-container" id="ps-result-container" style="display:none; padding: 24px; padding-top: 32px; flex-wrap: wrap; gap: 24px; align-items: center;">
             <div class="ps-result-stats" id="ps-result-stats" style="display: flex; gap: 24px; flex: 1;"></div>
             <div class="ps-result-actions" id="ps-result-actions" style="display: flex; gap: 16px; align-items: stretch;">
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
      </div>
      
      <div class="journey-step" id="ps-investors-section" style="display:none; margin-top: 24px;">
        <div style="display: flex; gap: 24px; overflow-x: auto; padding-bottom: 12px;" id="ps-investors-list">
        </div>
      </div>
    </div>
  `;

  const mainEl = document.getElementById('ps-main');

  /* ── Persistent Filter Bar ── */
  const psPfb = document.getElementById('ps-pfb');
  const psPfbToggle = document.getElementById('ps-pfb-toggle');
  const psPfbCountry = document.getElementById('ps-pfb-country');
  const psPfbIndustry = document.getElementById('ps-pfb-industry');
  const toggleCollapsed = document.getElementById('ps-pfb-seriesa-toggle-collapsed');
  const toggleExpanded = document.getElementById('ps-pfb-seriesa-toggle-expanded');

  /* ───── Core Functions ───── */
  function getSeededRandom(seedStr) {
    let h = 0;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
    }
    return function () {
      h = Math.imul(h ^ h >>> 16, 2246822507);
      h = Math.imul(h ^ h >>> 13, 3266489909);
      return (h ^= h >>> 16) >>> 0;
    }
  }

  /* Pre-fill from global filters */
  psPfbCountry.value = filters.location;
  psPfbIndustry.value = filters.industry;

  psPfbToggle.addEventListener('click', () => {
    psPfb.classList.toggle('expanded');
  });

  function updatePsChips() {
    document.getElementById('ps-pfb-cv-country').textContent = psPfbCountry.value;
    document.getElementById('ps-pfb-cv-industry').textContent = psPfbIndustry.value;
  }

  function handlePsFilterChange() {
    updatePsChips();
    psPfb.classList.remove('expanded');

    // Sync location/industry back to global store
    setGlobalFilters({ location: psPfbCountry.value, industry: psPfbIndustry.value });

    // Reset simulator UI
    for (let i = chosenPath.length; i >= 1; i--) {
      clearSleeper(i);
    }
    chosenPath.length = 0;

    const resultEl = document.getElementById('ps-result-stats');
    const actionsEl = document.getElementById('ps-result-actions');
    if (resultEl) { resultEl.style.display = 'none'; resultEl.innerHTML = ''; }
    if (actionsEl) actionsEl.style.display = 'none';

    const distPanel = document.getElementById('ps-dist-panel');
    if (distPanel) distPanel.style.display = '';

    const finishBar = document.getElementById('sleeper-bar-finish');
    if (finishBar) finishBar.classList.add('sleeper-bar--disabled');

    // Re-render the first step distribution with new filters (mock)
    renderDistribution();
  }

  /* Listeners mapping */
  psPfbCountry.addEventListener('change', handlePsFilterChange);
  psPfbIndustry.addEventListener('change', handlePsFilterChange);

  /* Sync toggles */
  toggleCollapsed.addEventListener('change', (e) => {
    toggleExpanded.checked = e.target.checked;
    handlePsFilterChange();
  });
  toggleExpanded.addEventListener('change', (e) => {
    toggleCollapsed.checked = e.target.checked;
    handlePsFilterChange();
  });

  /* ── Distribution renderer ── */
  function renderDistribution() {
    const step = chosenPath.length;
    if (step >= 4) {
      document.getElementById('ps-dist-bars').innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding:var(--sp-6); font-size:var(--fs-sm);">
          🎉 Path complete! Click Finish to export your path and see potential investors.
        </div>`;
      document.getElementById('ps-dist-title').textContent = 'All steps selected';
      return;
    }

    const lastId = step === 0 ? 'start' : chosenPath[step - 1].id;
    const dist = distributions[lastId] || distributions.start;
    const ordinals = ['1st', '2nd', '3rd', '4th'];
    document.getElementById('ps-dist-title').textContent =
      step === 0
        ? `Choose your ${ordinals[step]} Funding Type`
        : `After ${chosenPath[step - 1].name} — choose your ${ordinals[step]} Funding Type`;

    const distBars = document.getElementById('ps-dist-bars');
    distBars.innerHTML = `
      <div class="ps-dist-header" style="padding: 0 var(--sp-4) var(--sp-2) var(--sp-4);">
        <div style="width: 24px; flex-shrink: 0;"></div>
        <div class="ps-dist-label">Type</div>
        <div class="ps-dist-bar-title">Share of peers that chose that Funding Type</div>
        <div class="ps-dist-time">Median Time</div>
      </div>
    `;

    // Apply variance based on filters
    const isSeriesA = document.getElementById('ps-pfb-seriesa-toggle-collapsed')?.checked;
    const seedStr = (psPfbCountry?.value || '') + (psPfbIndustry?.value || '') + isSeriesA + step;
    const rand = getSeededRandom(seedStr);

    let variedDist = dist.map(item => ({ ...item }));
    let remaining = 100;

    // Vary percentages slightly
    variedDist.forEach((item, idx) => {
      if (idx === variedDist.length - 1) {
        item.pct = remaining;
      } else {
        // Boost seed/series A if toggle is on
        let baseVariance = (rand() % 15) - 7; // -7 to +7%
        if (isSeriesA && (item.id === 'series-a' || item.id === 'seed')) {
          baseVariance += 10;
        }
        let newPct = Math.max(1, item.pct + baseVariance);
        if (newPct > remaining - (variedDist.length - 1 - idx)) {
          newPct = Math.max(1, remaining - (variedDist.length - 1 - idx));
        }
        item.pct = newPct;
        remaining -= newPct;
      }
    });

    // Sort descending by new pct
    variedDist.sort((a, b) => b.pct - a.pct);

    variedDist.forEach((item, idx) => {
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
    chosenPath.push({ id: item.id, name: info.name, color: info.color, time: item.time, share: item.pct + '%' });

    const n = step + 1;
    fillSleeper(n, info, item);

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
      bar.innerHTML = `
        <span class="sleeper-label">${info.name}</span>
        <div class="sleeper-remove-icon" title="Remove Stage">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </div>
      `;
      bar.style.cursor = 'pointer';
      bar.onclick = () => undoFrom(n);
    }
    if (shareEl) shareEl.textContent = item.pct + '%';
    if (gapEl) { gapEl.textContent = item.time; gapEl.classList.add('visible'); }
  }

  /* ── Undo: click a filled sleeper to remove it and all after it ── */
  function undoFrom(fromStep) {
    while (chosenPath.length >= fromStep) {
      const removedStep = chosenPath.length;
      chosenPath.pop();
      clearSleeper(removedStep);
    }

    const distPanel = document.getElementById('ps-dist-panel');
    const resultContainer = document.getElementById('ps-result-container');
    const investorsSection = document.getElementById('ps-investors-section');
    if (distPanel) distPanel.style.display = '';
    if (resultContainer) resultContainer.style.display = 'none';
    if (investorsSection) investorsSection.style.display = 'none';

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

      const distPanel = document.getElementById('ps-dist-panel');
      if (distPanel) distPanel.style.display = 'none';

      if (typeof window.confetti === 'function') {
        window.confetti({
          particleCount: 200,
          spread: 160,
          origin: { y: 0.6 },
          colors: ['#4F46E5', '#10B981', '#F59E0B', '#F43F5E', '#3B82F6'],
          zIndex: 9999
        });
      }

      let totalMonths = 0;
      chosenPath.forEach(s => { totalMonths += parseInt(s.time) || 0; });

      const baseCount = [820, 540, 310, 180];
      const randomOffset = Math.floor(Math.random() * 80) - 40;
      const startupCount = (baseCount[chosenPath.length - 1] || 200) + randomOffset;

      const pathStr = chosenPath.map(s => s.name).join(' → ');

      const resultContainer = document.getElementById('ps-result-container');
      const resultEl = document.getElementById('ps-result-stats');
      const actionsEl = document.getElementById('ps-result-actions');
      if (resultContainer && resultEl && actionsEl) {
        resultContainer.style.display = 'flex';
        resultEl.innerHTML = `
          <div class="stat-card tp-stat-card" style="flex: 1; border: 1px solid var(--accent-light); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);">
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
          <div class="stat-card tp-stat-card" style="flex: 1; border: 1px solid var(--accent-light); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.1);">
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
        resultEl.style.display = 'flex';
        actionsEl.style.display = 'flex';
        resultEl.classList.add('revealed');
      }

      renderInvestorsModule();

      handleSimulatorStepAdded(pathStr, chosenPath.length, totalMonths);
    });
  }

  /* ── Render Investors Module ── */
  function renderInvestorsModule() {
    const listEl = document.getElementById('ps-investors-list');
    const sectionEl = document.getElementById('ps-investors-section');
    if (!listEl || !sectionEl) return;

    // Ordered set of modules
    const types = [
      { id: 'grant', title: 'Grant Investors', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>', color: 'var(--color-grant)' },
      { id: 'preseed', title: 'PreSeed Investors', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><line x1="12" y1="2" x2="12" y2="4"></line><line x1="12" y1="20" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="6.34" y2="6.34"></line><line x1="17.66" y1="17.66" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="4" y2="12"></line><line x1="20" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="6.34" y2="17.66"></line><line x1="17.66" y1="4.93" x2="19.07" y2="6.34"></line></svg>', color: 'var(--color-preseed)' },
      { id: 'seed', title: 'Seed Investors', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>', color: 'var(--color-seed)' },
      { id: 'series-a', title: 'Series A Investors', icon: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>', color: 'var(--color-series-a)' }
    ];

    const chosenIds = chosenPath.map(p => p.id);
    let html = '';

    types.forEach(type => {
      const isChosen = chosenIds.includes(type.id);
      const investors = investorsByInstrument[type.id] || [];

      let listHtml = '';
      if (isChosen) {
        investors.forEach((inv, i) => {
          listHtml += `
            <div style="display:flex; gap: 12px; margin-bottom: 12px; color: var(--text-muted); font-size: 13px;">
              <div style="width: 16px; font-weight: 500;">${i + 1}.</div>
              <div style="flex: 1;">${inv.name} – ${inv.deals} deals</div>
            </div>
          `;
        });
      } else {
        for (let i = 0; i < 5; i++) {
          listHtml += `
            <div style="display:flex; gap: 12px; margin-bottom: 12px; color: var(--text-muted); font-size: 13px; opacity: 0.5;">
              <div style="width: 16px; font-weight: 500;">${i + 1}.</div>
              <div style="flex: 1;">——</div>
            </div>
          `;
        }
      }

      html += `
        <div class="ps-investor-card" style="flex: 1; min-width: 200px; background: #fff; border-radius: var(--radius-lg); padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); ${isChosen ? 'border: 1px solid var(--accent); box-shadow: 0 4px 12px rgba(79, 70, 229, 0.15);' : 'border: 1px solid var(--border); opacity: 0.8;'}">
          <div style="display:flex; align-items:center; gap: 12px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border-light);">
            <div style="width: 40px; height: 40px; border-radius: var(--radius-md); border: 1px solid ${type.color}; color: ${type.color}; display: flex; align-items: center; justify-content: center; background: #fff;">
              ${type.icon}
            </div>
            <div style="font-weight: 700; color: ${type.color}; font-size: 14px;">
              ${type.title}
            </div>
          </div>
          ${listHtml}
        </div>
      `;
    });

    listEl.innerHTML = html;
    sectionEl.style.display = 'block';
  }

  /* ── Retry handler ── */
  function setupRetryButton() {
    const retryBtn = document.getElementById('ps-retry-btn');
    if (!retryBtn) return;

    retryBtn.addEventListener('click', () => {
      for (let i = chosenPath.length; i >= 1; i--) {
        clearSleeper(i);
      }
      chosenPath.length = 0;

      const resultContainer = document.getElementById('ps-result-container');
      const investorsSection = document.getElementById('ps-investors-section');
      if (resultContainer) resultContainer.style.display = 'none';
      if (investorsSection) investorsSection.style.display = 'none';

      const distPanel = document.getElementById('ps-dist-panel');
      if (distPanel) distPanel.style.display = '';

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

  // Init content immediately
  journeyReveal(mainEl, 200, 600);

  const trackRevealDelay = 1600;
  const pieces = document.querySelectorAll('.track-wrapper .track-sleeper, .track-wrapper .track-gap');
  pieces.forEach((el, i) => {
    setTimeout(() => el.classList.add('rolled-in'), trackRevealDelay + i * 200);
  });

  const wrapper = document.getElementById('track-wrapper');
  setTimeout(() => wrapper.classList.add('rails-visible'), trackRevealDelay);

  renderDistribution();

  setupFinishButton();
  setupRetryButton();
  setupExportButton();
}