import { journeyReveal } from '../main.js';

/* ───── Data ───── */
const instruments = [
  { id: 'preseed', abbr: 'P', name: 'Pre-Seed', color: 'var(--color-preseed)' },
  { id: 'seed', abbr: 'S', name: 'Seed', color: 'var(--color-seed)' },
  { id: 'series-a', abbr: 'A', name: 'Series A', color: 'var(--color-series-a)' },
  { id: 'grant', abbr: 'G', name: 'Grants', color: 'var(--color-grant)' },
];

/* ── Narrative-specific chart distributions ── */
const narrativeChartData = {
  'General Overview': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'grant', pct: 25 }, { instrument: 'preseed', pct: 40 },
        { instrument: 'seed', pct: 30 }, { instrument: 'series-a', pct: 5 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'preseed', pct: 35 }, { instrument: 'seed', pct: 40 },
        { instrument: 'series-a', pct: 20 }, { instrument: 'grant', pct: 5 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'seed', pct: 25 }, { instrument: 'series-a', pct: 45 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 15 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 55 }, { instrument: 'seed', pct: 20 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 15 },
      ]
    },
  ],
  'Grant-Focus': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'grant', pct: 55 }, { instrument: 'preseed', pct: 25 },
        { instrument: 'seed', pct: 15 }, { instrument: 'series-a', pct: 5 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'grant', pct: 40 }, { instrument: 'preseed', pct: 30 },
        { instrument: 'seed', pct: 22 }, { instrument: 'series-a', pct: 8 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'grant', pct: 35 }, { instrument: 'seed', pct: 30 },
        { instrument: 'series-a', pct: 20 }, { instrument: 'preseed', pct: 15 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'grant', pct: 30 }, { instrument: 'series-a', pct: 35 },
        { instrument: 'seed', pct: 20 }, { instrument: 'preseed', pct: 15 },
      ]
    },
  ],
  'PreSeed to Seed': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'preseed', pct: 55 }, { instrument: 'grant', pct: 20 },
        { instrument: 'seed', pct: 18 }, { instrument: 'series-a', pct: 7 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'seed', pct: 50 }, { instrument: 'preseed', pct: 25 },
        { instrument: 'grant', pct: 15 }, { instrument: 'series-a', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 60 }, { instrument: 'seed', pct: 20 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 10 },
      ]
    },
  ],
  'Seed-only': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'seed', pct: 60 }, { instrument: 'preseed', pct: 20 },
        { instrument: 'grant', pct: 12 }, { instrument: 'series-a', pct: 8 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'seed', pct: 45 }, { instrument: 'series-a', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 35 },
        { instrument: 'preseed', pct: 12 }, { instrument: 'grant', pct: 8 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 55 }, { instrument: 'seed', pct: 28 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 7 },
      ]
    },
  ],
  'Fast track to Series A': [
    {
      label: '1st Instrument', segments: [
        { instrument: 'preseed', pct: 40 }, { instrument: 'seed', pct: 35 },
        { instrument: 'grant', pct: 15 }, { instrument: 'series-a', pct: 10 },
      ]
    },
    {
      label: '2nd Instrument', segments: [
        { instrument: 'series-a', pct: 45 }, { instrument: 'seed', pct: 30 },
        { instrument: 'preseed', pct: 15 }, { instrument: 'grant', pct: 10 },
      ]
    },
    {
      label: '3rd Instrument', segments: [
        { instrument: 'series-a', pct: 60 }, { instrument: 'seed', pct: 22 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 8 },
      ]
    },
    {
      label: '4th Instrument', segments: [
        { instrument: 'series-a', pct: 70 }, { instrument: 'seed', pct: 15 },
        { instrument: 'preseed', pct: 10 }, { instrument: 'grant', pct: 5 },
      ]
    },
  ],
};

/* ── Narrative-specific paths ── */
const narrativePathsData = {
  'General Overview': [
    { rank: 1, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 2, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 4, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'Seed – Seed – Series A', steps: ['seed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '4 Months' },
  ],
  'Grant-Focus': [
    { rank: 1, name: 'Grant – Grant – PreSeed – Seed', steps: ['grant', 'grant', 'preseed', 'seed'], medianFirst: '2 Months', medianBetween: '3 Months' },
    { rank: 2, name: 'Grant – PreSeed – Grant – Seed', steps: ['grant', 'preseed', 'grant', 'seed'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 3, name: 'Grant – Seed – Grant – Series A', steps: ['grant', 'seed', 'grant', 'series-a'], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 4, name: 'Grant – Grant – Seed – Series A', steps: ['grant', 'grant', 'seed', 'series-a'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
  ],
  'PreSeed to Seed': [
    { rank: 1, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 2, name: 'PreSeed – Seed – Seed – Series A', steps: ['preseed', 'seed', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 3, name: 'PreSeed – PreSeed – Seed – Series A', steps: ['preseed', 'preseed', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '4 Months' },
    { rank: 4, name: 'Grant – PreSeed – Seed – Series A', steps: ['grant', 'preseed', 'seed', 'series-a'], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 5, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '3 Months', medianBetween: '7 Months' },
  ],
  'Seed-only': [
    { rank: 1, name: 'Seed – Seed – Series A', steps: ['seed', 'seed', 'series-a', null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 2, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '4 Months', medianBetween: '6 Months' },
    { rank: 3, name: 'Seed – Seed – Seed – Series A', steps: ['seed', 'seed', 'seed', 'series-a'], medianFirst: '4 Months', medianBetween: '4 Months' },
    { rank: 4, name: 'Seed – PreSeed – Series A', steps: ['seed', 'preseed', 'series-a', null], medianFirst: '4 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'PreSeed – Seed – Seed – Series A', steps: ['preseed', 'seed', 'seed', 'series-a'], medianFirst: '3 Months', medianBetween: '5 Months' },
  ],
  'Fast track to Series A': [
    { rank: 1, name: 'PreSeed – Series A', steps: ['preseed', 'series-a', null, null], medianFirst: '2 Months', medianBetween: '6 Months' },
    { rank: 2, name: 'Seed – Series A', steps: ['seed', 'series-a', null, null], medianFirst: '3 Months', medianBetween: '5 Months' },
    { rank: 3, name: 'PreSeed – Seed – Series A', steps: ['preseed', 'seed', 'series-a', null], medianFirst: '2 Months', medianBetween: '4 Months' },
    { rank: 4, name: 'Grant – PreSeed – Series A', steps: ['grant', 'preseed', 'series-a', null], medianFirst: '2 Months', medianBetween: '5 Months' },
    { rank: 5, name: 'Seed – Series A – Series A', steps: ['seed', 'series-a', 'series-a', null], medianFirst: '3 Months', medianBetween: '6 Months' },
  ],
};

/* ── Narrative-specific default stats ── */
const narrativeStats = {
  'General Overview': { medianFirst: '3 Months', medianBetween: '5 Months' },
  'Grant-Focus': { medianFirst: '2 Months', medianBetween: '4 Months' },
  'PreSeed to Seed': { medianFirst: '3 Months', medianBetween: '5 Months' },
  'Seed-only': { medianFirst: '4 Months', medianBetween: '5 Months' },
  'Fast track to Series A': { medianFirst: '3 Months', medianBetween: '5 Months' },
};

function getColor(id) {
  return instruments.find(i => i.id === id)?.color || '#ccc';
}

/* ───── Render ───── */
export function renderTypicalPaths(container) {
  let selectedPathIdx = null;
  let currentNarrative = 'General Overview';

  container.innerHTML = `
    <!-- PHASE 1: Hero Intro -->
    <div class="tab-intro" id="tp-intro">
      <div class="journey-step">
        <div class="tab-intro-content">
          <h1 class="tab-intro-headline">
            Refine your <strong>early-stage funding<br/>journey</strong> by learning from the<br/>proven paths and timing signals of<br/>founders like <span class="hero-accent">YOU</span>.
          </h1>
        </div>
      </div>

      <div class="journey-step">
        <div class="tab-intro-filters">
          <div class="hero-filter-group">
            <label class="hero-filter-label">Organisation Location:</label>
            <select class="hero-filter-select" id="tp-hero-country">
              <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option><option>United States</option><option>United Kingdom</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Industry:</label>
            <select class="hero-filter-select" id="tp-hero-industry">
              <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option><option>Deep Tech</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Paths:</label>
            <select class="hero-filter-select" id="tp-hero-paths">
              <option>Secured Series A</option><option>All Paths</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Narrative:</label>
            <select class="hero-filter-select" id="tp-hero-narrative">
              <option>General Overview</option><option>Grant-Focus</option><option>PreSeed to Seed</option><option>Seed-only</option><option>Fast track to Series A</option>
            </select>
          </div>
        </div>
      </div>

      <div class="journey-step">
        <button class="hero-cta" id="tp-start-btn">
          <span>Start your Journey…</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- PHASE 2: Main content (hidden until Start is clicked) -->
    <div class="tab-main-content hidden" id="tp-main">

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="tp-pfb">
          <div class="pfb-collapsed" id="tp-pfb-toggle">
            <div class="pfb-filter-values" id="tp-pfb-chips">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="tp-pfb-cv-country">Germany</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="tp-pfb-cv-industry">Tech / Software</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Paths:</span><span class="pfb-chip-value" id="tp-pfb-cv-paths">Secured Series A</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Narrative:</span><span class="pfb-chip-value" id="tp-pfb-cv-narrative">General Overview</span></div>
            </div>
            <div class="pfb-toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div class="pfb-expanded">
            <div class="pfb-dropdowns">
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Organisation Location:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-country">
                  <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option><option>United States</option><option>United Kingdom</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-industry">
                  <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option><option>Deep Tech</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Paths:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-paths">
                  <option>Secured Series A</option><option>All Paths</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Narrative:</label>
                <select class="pfb-dropdown-select" id="tp-pfb-narrative">
                  <option>General Overview</option><option>Grant-Focus</option><option>PreSeed to Seed</option><option>Seed-only</option><option>Fast track to Series A</option>
                </select>
              </div>
            </div>
            <div class="pfb-apply-row">
              <button class="pfb-apply-btn" id="tp-pfb-apply">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Grid: chart left, paths right -->
      <div class="journey-step">
        <div class="tp-grid">
          <div class="tp-chart-container">
            <div class="tp-chart-title">Distribution of first 4 financing Instruments:</div>
            <div class="legend" id="tp-legend"></div>
            <div class="tp-chart" id="tp-chart"></div>
          </div>
          <div class="tp-paths-container">
            <div class="tp-paths-title">Most Common Paths:</div>
            <div class="tp-paths-list" id="tp-paths-list"></div>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="journey-step">
        <div class="tp-stats-row">
          <div class="stat-card tp-stat-card">
            <div class="stat-icon tp-stat-icon">🚀</div>
            <div>
              <div class="stat-label">Median Time to first Round:</div>
              <div class="stat-value" id="tp-stat-first">${narrativeStats[currentNarrative].medianFirst}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card">
            <div class="stat-icon tp-stat-icon">⏱️</div>
            <div>
              <div class="stat-label">Median Time between Rounds:</div>
              <div class="stat-value" id="tp-stat-between">${narrativeStats[currentNarrative].medianBetween}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── "Start your Journey" → reveal main content ── */
  const introEl = document.getElementById('tp-intro');
  const mainEl = document.getElementById('tp-main');
  const startBtn = document.getElementById('tp-start-btn');
  const narrativeSelect = document.getElementById('tp-hero-narrative');

  /* ── Persistent Filter Bar elements ── */
  const pfb = document.getElementById('tp-pfb');
  const pfbToggle = document.getElementById('tp-pfb-toggle');
  const pfbApply = document.getElementById('tp-pfb-apply');
  const pfbCountry = document.getElementById('tp-pfb-country');
  const pfbIndustry = document.getElementById('tp-pfb-industry');
  const pfbPaths = document.getElementById('tp-pfb-paths');
  const pfbNarrative = document.getElementById('tp-pfb-narrative');

  /* ── Toggle expand/collapse ── */
  pfbToggle.addEventListener('click', () => {
    pfb.classList.toggle('expanded');
  });

  /* ── Sync intro → persistent bar and update chips ── */
  function syncIntroToPfb() {
    pfbCountry.value = document.getElementById('tp-hero-country').value;
    pfbIndustry.value = document.getElementById('tp-hero-industry').value;
    pfbPaths.value = document.getElementById('tp-hero-paths').value;
    pfbNarrative.value = document.getElementById('tp-hero-narrative').value;
    updateChips();
  }

  function updateChips() {
    document.getElementById('tp-pfb-cv-country').textContent = pfbCountry.value;
    document.getElementById('tp-pfb-cv-industry').textContent = pfbIndustry.value;
    document.getElementById('tp-pfb-cv-paths').textContent = pfbPaths.value;
    document.getElementById('tp-pfb-cv-narrative').textContent = pfbNarrative.value;
  }

  /* ── Apply Filters button ── */
  pfbApply.addEventListener('click', () => {
    currentNarrative = pfbNarrative.value;
    updateChips();
    pfb.classList.remove('expanded');
    rebuildContent();
  });

  startBtn.addEventListener('click', () => {
    currentNarrative = narrativeSelect.value;
    syncIntroToPfb();

    // Fade out intro
    introEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'translateY(-30px)';

    setTimeout(() => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');

      // Build chart & paths
      buildLegend();
      buildChart();
      buildPaths();

      // Start sequential reveal of main content
      journeyReveal(mainEl, 200, 500);
    }, 600);
  });

  /* ── Rebuild chart + paths when narrative changes ── */
  function rebuildContent() {
    selectedPathIdx = null;
    const chartEl = document.getElementById('tp-chart');
    const pathsList = document.getElementById('tp-paths-list');
    if (chartEl) chartEl.innerHTML = '';
    if (pathsList) pathsList.innerHTML = '';

    buildChart(true);
    buildPaths();

    const stats = narrativeStats[currentNarrative] || narrativeStats['General Overview'];
    updateStats(stats.medianFirst, stats.medianBetween);
  }

  /* ── Legend (only once) ── */
  function buildLegend() {
    const legendEl = document.getElementById('tp-legend');
    if (!legendEl || legendEl.children.length > 0) return;
    instruments.forEach(inst => {
      legendEl.innerHTML += `
        <div class="legend-item">
          <div class="legend-dot" style="background:${inst.color}"></div>
          ${inst.name} (${inst.abbr})
        </div>`;
    });
  }

  /* ── Chart builder ── */
  function buildChart(instant = false) {
    const chartEl = document.getElementById('tp-chart');
    const chartData = narrativeChartData[currentNarrative] || narrativeChartData['General Overview'];

    chartData.forEach((round, rIdx) => {
      const groupEl = document.createElement('div');
      groupEl.className = 'tp-bar-group';
      const stackEl = document.createElement('div');
      stackEl.className = 'tp-bar-stack';
      stackEl.dataset.col = rIdx;

      round.segments.forEach(seg => {
        const segEl = document.createElement('div');
        segEl.className = 'tp-bar-segment';
        segEl.dataset.instrument = seg.instrument;
        segEl.dataset.col = rIdx;
        segEl.dataset.pct = seg.pct;
        segEl.style.background = getColor(seg.instrument);
        segEl.style.height = '0%';
        segEl.title = `${instruments.find(i => i.id === seg.instrument)?.name}: ${seg.pct}%`;

        // Inline percentage label (shown on hover/highlight)
        const pctSpan = document.createElement('span');
        pctSpan.className = 'tp-seg-pct';
        pctSpan.textContent = seg.pct + '%';
        segEl.appendChild(pctSpan);

        const delay = instant ? 50 + rIdx * 80 : 600 + rIdx * 300;
        setTimeout(() => { segEl.style.height = seg.pct + '%'; }, delay);

        segEl.addEventListener('mouseenter', () => {
          if (selectedPathIdx !== null) return;
          document.querySelectorAll('.tp-bar-segment').forEach(s => {
            if (s.dataset.instrument === seg.instrument) s.classList.add('highlighted');
            else s.classList.add('dimmed');
          });
        });
        segEl.addEventListener('mouseleave', () => {
          if (selectedPathIdx !== null) return;
          document.querySelectorAll('.tp-bar-segment').forEach(s => s.classList.remove('highlighted', 'dimmed'));
        });

        stackEl.appendChild(segEl);
      });

      const labelEl = document.createElement('div');
      labelEl.className = 'tp-bar-label';
      labelEl.textContent = round.label;
      groupEl.appendChild(stackEl);
      groupEl.appendChild(labelEl);
      chartEl.appendChild(groupEl);
    });
  }

  /* ── Paths list builder ── */
  function buildPaths() {
    const pathsList = document.getElementById('tp-paths-list');
    const pathsData = narrativePathsData[currentNarrative] || narrativePathsData['General Overview'];

    pathsData.forEach((path, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'tp-path-card';
      cardEl.id = `tp-path-${idx}`;
      cardEl.innerHTML = `
        <div class="tp-rank">${path.rank}</div>
        <div class="tp-path-name">${path.name}</div>
        <button class="tp-path-detail-btn">Details</button>
      `;
      cardEl.addEventListener('click', () => selectPath(idx));
      pathsList.appendChild(cardEl);
    });
  }

  /* ── Path Selection ── */
  function selectPath(idx) {
    if (selectedPathIdx === idx) { deselectPath(); return; }
    selectedPathIdx = idx;
    const pathsData = narrativePathsData[currentNarrative] || narrativePathsData['General Overview'];
    const path = pathsData[idx];

    document.querySelectorAll('.tp-path-card').forEach((c, ci) => c.classList.toggle('selected', ci === idx));
    document.querySelectorAll('.tp-bar-segment').forEach(seg => {
      const col = parseInt(seg.dataset.col);
      const inst = seg.dataset.instrument;
      const pathInst = path.steps[col];
      if (pathInst && inst === pathInst) { seg.classList.add('highlighted'); seg.classList.remove('dimmed'); }
      else { seg.classList.remove('highlighted'); seg.classList.add('dimmed'); }
    });
    updateStats(path.medianFirst, path.medianBetween);
  }

  function deselectPath() {
    selectedPathIdx = null;
    const stats = narrativeStats[currentNarrative] || narrativeStats['General Overview'];
    document.querySelectorAll('.tp-path-card').forEach(c => c.classList.remove('selected'));
    document.querySelectorAll('.tp-bar-segment').forEach(s => s.classList.remove('highlighted', 'dimmed'));
    updateStats(stats.medianFirst, stats.medianBetween);
  }

  function updateStats(first, between) {
    const firstEl = document.getElementById('tp-stat-first');
    const betweenEl = document.getElementById('tp-stat-between');
    [firstEl, betweenEl].forEach(el => {
      if (!el) return;
      el.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      el.style.opacity = '0'; el.style.transform = 'translateY(6px)';
    });
    setTimeout(() => {
      if (firstEl) firstEl.textContent = first;
      if (betweenEl) betweenEl.textContent = between;
      [firstEl, betweenEl].forEach(el => {
        if (!el) return;
        el.style.opacity = '1'; el.style.transform = 'translateY(0)';
      });
    }, 260);
  }

  // Reveal the intro steps
  journeyReveal(introEl, 300, 500);
}
