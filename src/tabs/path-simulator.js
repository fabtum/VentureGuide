import { journeyReveal } from '../main.js';

/* ───── Data (no Convertible) ───── */
const instruments = [
  { id: 'preseed', name: 'Pre-Seed', color: 'var(--color-preseed)', time: '3 mo', share: '32%' },
  { id: 'seed', name: 'Seed', color: 'var(--color-seed)', time: '5 mo', share: '22%' },
  { id: 'series-a', name: 'Series A', color: 'var(--color-series-a)', time: '8 mo', share: '18%' },
  { id: 'grant', name: 'Grant', color: 'var(--color-grant)', time: '2 mo', share: '28%' },
  { id: 'angel', name: 'Angel', color: 'var(--color-angel)', time: '4 mo', share: '12%' },
];

const distributions = {
  start: [
    { id: 'preseed', pct: 32, time: '3 mo', share: '32%' },
    { id: 'grant', pct: 28, time: '2 mo', share: '28%' },
    { id: 'seed', pct: 22, time: '5 mo', share: '22%' },
    { id: 'angel', pct: 12, time: '4 mo', share: '12%' },
    { id: 'series-a', pct: 6, time: '10 mo', share: '6%' },
  ],
  grant: [
    { id: 'preseed', pct: 40, time: '4 mo', share: '40%' },
    { id: 'seed', pct: 30, time: '6 mo', share: '30%' },
    { id: 'angel', pct: 17, time: '3 mo', share: '17%' },
    { id: 'grant', pct: 8, time: '2 mo', share: '8%' },
    { id: 'series-a', pct: 5, time: '12 mo', share: '5%' },
  ],
  preseed: [
    { id: 'seed', pct: 42, time: '5 mo', share: '42%' },
    { id: 'series-a', pct: 28, time: '10 mo', share: '28%' },
    { id: 'angel', pct: 17, time: '4 mo', share: '17%' },
    { id: 'grant', pct: 8, time: '2 mo', share: '8%' },
    { id: 'preseed', pct: 5, time: '3 mo', share: '5%' },
  ],
  seed: [
    { id: 'series-a', pct: 55, time: '8 mo', share: '55%' },
    { id: 'seed', pct: 22, time: '6 mo', share: '22%' },
    { id: 'angel', pct: 12, time: '3 mo', share: '12%' },
    { id: 'preseed', pct: 6, time: '3 mo', share: '6%' },
    { id: 'grant', pct: 5, time: '2 mo', share: '5%' },
  ],
  angel: [
    { id: 'seed', pct: 40, time: '5 mo', share: '40%' },
    { id: 'preseed', pct: 30, time: '3 mo', share: '30%' },
    { id: 'series-a', pct: 17, time: '9 mo', share: '17%' },
    { id: 'angel', pct: 8, time: '4 mo', share: '8%' },
    { id: 'grant', pct: 5, time: '2 mo', share: '5%' },
  ],
  'series-a': [
    { id: 'series-a', pct: 55, time: '12 mo', share: '55%' },
    { id: 'seed', pct: 25, time: '6 mo', share: '25%' },
    { id: 'angel', pct: 10, time: '4 mo', share: '10%' },
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

      <!-- TRAIN TRACK -->
      <div class="journey-step">
        <div class="track-wrapper" id="track-wrapper">
          <!-- Two horizontal rails -->
          <div class="track-rail track-rail--top"></div>
          <div class="track-rail track-rail--bottom"></div>

          <!-- Sleepers (ties) -->
          <div class="track-sleepers">
            <!-- Start sleeper -->
            <div class="track-sleeper track-sleeper--start rolled-in">
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
          </div>

          <!-- Cumulative strip under the track -->
          <div class="track-cumulative" id="track-cumulative"></div>
        </div>
      </div>

      <!-- Distribution Picker -->
      <div class="journey-step">
        <div class="ps-dist-panel" id="ps-dist-panel">
          <div class="ps-dist-title" id="ps-dist-title">Choose your 1st funding instrument</div>
          <div class="ps-dist-bars" id="ps-dist-bars"></div>
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

    introEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'translateY(-30px)';

    setTimeout(() => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');
      journeyReveal(mainEl, 200, 600);

      // Staggered roll-out of sleepers & gaps
      const pieces = document.querySelectorAll('.track-gap, .track-sleeper:not(.track-sleeper--start)');
      pieces.forEach((el, i) => {
        setTimeout(() => el.classList.add('rolled-in'), 500 + i * 180);
      });

      // Roll out rails
      const wrapper = document.getElementById('track-wrapper');
      setTimeout(() => wrapper.classList.add('rails-visible'), 300);

      renderDistribution();
    }, 600);
  });

  /* ── Distribution renderer ── */
  function renderDistribution() {
    const step = chosenPath.length;
    if (step >= 4) {
      document.getElementById('ps-dist-bars').innerHTML = `
        <div style="text-align:center; color:var(--text-muted); padding:var(--sp-6); font-size:var(--fs-sm);">
          🎉 Path complete! Review your full journey above.
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
    distBars.innerHTML = '';

    dist.forEach((item, idx) => {
      const info = getInst(item.id);
      const row = document.createElement('div');
      row.className = 'ps-dist-row';
      row.style.opacity = '0';
      row.style.transform = 'translateX(-12px)';
      row.innerHTML = `
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
    updateSummary();
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
    updateSummary();
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

  /* ── Cumulative strip ── */
  function updateSummary() {
    const strip = document.getElementById('track-cumulative');
    if (!strip) return;

    if (chosenPath.length === 0) {
      strip.innerHTML = '';
      strip.style.display = 'none';
      return;
    }

    strip.style.display = 'flex';
    let totalMonths = 0;
    chosenPath.forEach(s => { totalMonths += parseInt(s.time) || 0; });

    strip.innerHTML = `
      <span class="cumul-label">⏱️ Cumulative: <strong>${totalMonths} months</strong></span>
      ${chosenPath.length === 4 ? '<span class="ps-prob-badge">Path complete</span>' : ''}
    `;
  }

  journeyReveal(introEl, 300, 500);
}
