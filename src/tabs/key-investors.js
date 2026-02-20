import { journeyReveal } from '../main.js';

/* ── Investor data keyed by instrument ── */
const investorsByInstrument = {
  'Grants': [
    { rank: 1, name: 'HTGF', deals: 320, url: '#', medianTime: '4 Months' },
    { rank: 2, name: 'Exist', deals: 212, url: '#', medianTime: '3 Months' },
    { rank: 3, name: 'Synergy', deals: 103, url: '#', medianTime: '5 Months' },
    { rank: 4, name: 'ERC', deals: 67, url: '#', medianTime: '6 Months' },
    { rank: 5, name: 'DFG', deals: 47, url: '#', medianTime: '7 Months' },
  ],
  'PreSeed': [
    { rank: 1, name: 'Antler', deals: 285, url: '#', medianTime: '3 Months' },
    { rank: 2, name: 'Plug & Play', deals: 198, url: '#', medianTime: '4 Months' },
    { rank: 3, name: 'APX', deals: 142, url: '#', medianTime: '3 Months' },
    { rank: 4, name: 'Entrepreneur First', deals: 89, url: '#', medianTime: '5 Months' },
    { rank: 5, name: 'Seedcamp', deals: 61, url: '#', medianTime: '4 Months' },
  ],
  'Seed': [
    { rank: 1, name: 'Point Nine', deals: 310, url: '#', medianTime: '5 Months' },
    { rank: 2, name: 'Cherry Ventures', deals: 224, url: '#', medianTime: '4 Months' },
    { rank: 3, name: 'Earlybird', deals: 156, url: '#', medianTime: '5 Months' },
    { rank: 4, name: 'HV Capital', deals: 98, url: '#', medianTime: '6 Months' },
    { rank: 5, name: 'Creandum', deals: 72, url: '#', medianTime: '5 Months' },
  ],
  'Series A': [
    { rank: 1, name: 'Sequoia', deals: 425, url: '#', medianTime: '6 Months' },
    { rank: 2, name: 'Index Ventures', deals: 318, url: '#', medianTime: '7 Months' },
    { rank: 3, name: 'Atomico', deals: 187, url: '#', medianTime: '6 Months' },
    { rank: 4, name: 'Balderton', deals: 134, url: '#', medianTime: '8 Months' },
    { rank: 5, name: 'Northzone', deals: 89, url: '#', medianTime: '7 Months' },
  ],
  'Business Angels': [
    { rank: 1, name: 'Frank Thelen', deals: 142, url: '#', medianTime: '2 Months' },
    { rank: 2, name: 'Verena Pausder', deals: 98, url: '#', medianTime: '3 Months' },
    { rank: 3, name: 'Jens Begemann', deals: 74, url: '#', medianTime: '2 Months' },
    { rank: 4, name: 'Lea-Sophie Cramer', deals: 56, url: '#', medianTime: '3 Months' },
    { rank: 5, name: 'Florian Leibert', deals: 34, url: '#', medianTime: '4 Months' },
  ],
};

/* ── Podium layout order: 4th, 2nd, 1st, 3rd, 5th (visual positions left→right) ── */
const podiumOrder = [3, 1, 0, 2, 4]; // investor rank-1 indices per visual slot
const podiumHeightsPx = [110, 220, 290, 160, 70]; // pixel heights per visual position
/* Animation reveal order by RANK: 5th→4th→3rd→2nd→1st
   Rank 5 = visual pos 4, Rank 4 = visual pos 0, Rank 3 = visual pos 3,
   Rank 2 = visual pos 1, Rank 1 = visual pos 2 */
const revealSequence = [4, 0, 3, 1, 2]; // visual position indices, ordered by rank descending

function getInstrumentColor(instrument) {
  const map = {
    'Grants': 'var(--color-grant)',
    'PreSeed': 'var(--color-preseed)',
    'Seed': 'var(--color-seed)',
    'Series A': 'var(--color-series-a)',
    'Business Angels': 'var(--color-angel)',
  };
  return map[instrument] || 'var(--accent)';
}

/* ───── Render ───── */
export function renderKeyInvestors(container) {
  let currentInstrument = 'Grants';

  container.innerHTML = `
    <!-- PHASE 1: Hero Intro -->
    <div class="tab-intro" id="ki-intro">
      <div class="journey-step">
        <div class="tp-tab-title">Typical Investors</div>
      </div>

      <div class="journey-step">
        <div class="tab-intro-content">
          <h1 class="tab-intro-headline">
            Find the most prominent investors<br/>for your <strong>early-stage funding<br/>instruments</strong>.
          </h1>
        </div>
      </div>

      <div class="journey-step">
        <div class="tab-intro-filters">
          <div class="hero-filter-group">
            <label class="hero-filter-label">Organisation Location:</label>
            <select class="hero-filter-select" id="ki-hero-country">
              <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Industry:</label>
            <select class="hero-filter-select" id="ki-hero-industry">
              <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Instrument:</label>
            <select class="hero-filter-select" id="ki-hero-instrument">
              <option>Grants</option><option>PreSeed</option><option>Seed</option><option>Series A</option><option>Business Angels</option>
            </select>
          </div>
        </div>
      </div>

      <div class="journey-step">
        <button class="hero-cta" id="ki-start-btn">
          <span>Find Investors…</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- PHASE 2: Main content -->
    <div class="tab-main-content hidden" id="ki-main">

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ki-pfb">
          <div class="pfb-collapsed" id="ki-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ki-pfb-cv-country">Germany</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ki-pfb-cv-industry">Tech / Software</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Instrument:</span><span class="pfb-chip-value" id="ki-pfb-cv-instrument">Grants</span></div>
            </div>
            <div class="pfb-toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div class="pfb-expanded">
            <div class="pfb-dropdowns">
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Organisation Location:</label>
                <select class="pfb-dropdown-select" id="ki-pfb-country">
                  <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ki-pfb-industry">
                  <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Instrument:</label>
                <select class="pfb-dropdown-select" id="ki-pfb-instrument">
                  <option>Grants</option><option>PreSeed</option><option>Seed</option><option>Series A</option><option>Business Angels</option>
                </select>
              </div>
            </div>
            <div class="pfb-apply-row">
              <button class="pfb-apply-btn" id="ki-pfb-apply">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Median stat card -->
      <div class="journey-step">
        <div class="ki-median-card" id="ki-median-card">
          <div class="ki-median-title">Median Time until this Funding<br/>in your ecosystem:</div>
          <div class="ki-median-row">
            <div class="ki-median-icon">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div class="ki-median-value" id="ki-median-value">4 Months</div>
          </div>
        </div>
      </div>

      <!-- Siegertreppchen (podium) -->
      <div class="journey-step">
        <div class="podium-arena" id="ki-podium"></div>
      </div>
    </div>
  `;

  /* ── DOM refs ── */
  const introEl = document.getElementById('ki-intro');
  const mainEl = document.getElementById('ki-main');
  const pfb = document.getElementById('ki-pfb');
  const pfbToggle = document.getElementById('ki-pfb-toggle');
  const pfbApply = document.getElementById('ki-pfb-apply');
  const pfbCountry = document.getElementById('ki-pfb-country');
  const pfbIndustry = document.getElementById('ki-pfb-industry');
  const pfbInstrument = document.getElementById('ki-pfb-instrument');

  /* ── Toggle expand/collapse ── */
  pfbToggle.addEventListener('click', () => {
    pfb.classList.toggle('expanded');
  });

  /* ── Sync intro → persistent bar ── */
  function syncIntroToPfb() {
    pfbCountry.value = document.getElementById('ki-hero-country').value;
    pfbIndustry.value = document.getElementById('ki-hero-industry').value;
    pfbInstrument.value = document.getElementById('ki-hero-instrument').value;
    currentInstrument = pfbInstrument.value;
    updateChips();
  }

  function updateChips() {
    document.getElementById('ki-pfb-cv-country').textContent = pfbCountry.value;
    document.getElementById('ki-pfb-cv-industry').textContent = pfbIndustry.value;
    document.getElementById('ki-pfb-cv-instrument').textContent = pfbInstrument.value;
  }

  /* ── Apply filters ── */
  pfbApply.addEventListener('click', () => {
    currentInstrument = pfbInstrument.value;
    updateChips();
    pfb.classList.remove('expanded');
    buildPodium();
  });

  /* ── Start button ── */
  document.getElementById('ki-start-btn').addEventListener('click', () => {
    currentInstrument = document.getElementById('ki-hero-instrument').value;
    syncIntroToPfb();

    introEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'translateY(-30px)';

    setTimeout(() => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');
      journeyReveal(mainEl, 200, 400);
      setTimeout(() => buildPodium(), 600);
    }, 600);
  });

  /* ── Build Siegertreppchen (podium) ── */
  function buildPodium() {
    const podiumEl = document.getElementById('ki-podium');
    const investors = investorsByInstrument[currentInstrument] || investorsByInstrument['Grants'];
    const color = getInstrumentColor(currentInstrument);

    // Update median stat
    const medianEl = document.getElementById('ki-median-value');
    if (medianEl) {
      medianEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      medianEl.style.opacity = '0';
      medianEl.style.transform = 'translateY(6px)';
      setTimeout(() => {
        medianEl.textContent = investors[0].medianTime;
        medianEl.style.opacity = '1';
        medianEl.style.transform = 'translateY(0)';
      }, 260);
    }

    podiumEl.innerHTML = '';

    // Build all 5 columns first (visual order: 4th, 2nd, 1st, 3rd, 5th)
    const columns = [];
    podiumOrder.forEach((investorIdx, posIdx) => {
      const inv = investors[investorIdx];
      const heightPx = podiumHeightsPx[posIdx];

      const col = document.createElement('div');
      col.className = 'podium-column';

      // Investor info card (floats above the bar)
      const card = document.createElement('div');
      card.className = 'podium-investor-card';
      card.innerHTML = `
        <div class="podium-inv-header">
          <span class="podium-inv-name">${inv.name}</span>
          <a class="podium-inv-link" href="${inv.url}" target="_blank" title="View details">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
          </a>
        </div>
        <span class="podium-inv-badge" style="background:${color}">${currentInstrument}</span>
        <span class="podium-inv-deals">${inv.deals} Deals</span>
      `;

      // Bar (the podium step)
      const bar = document.createElement('div');
      bar.className = 'podium-bar';
      bar.style.setProperty('--podium-color', color);
      bar.style.height = heightPx + 'px'; // full height set upfront; scaleY(0) hides it

      const rankNum = document.createElement('span');
      rankNum.className = 'podium-rank-num';
      rankNum.textContent = inv.rank;
      bar.appendChild(rankNum);

      col.appendChild(card);
      col.appendChild(bar);
      podiumEl.appendChild(col);

      columns.push({ bar, card, heightPx, posIdx });
    });

    // Animate in countdown order: 5th → 4th → 3rd → 2nd → 1st
    revealSequence.forEach((visPosIdx, seqIdx) => {
      const { bar, card, heightPx } = columns[visPosIdx];
      const barDelay = 300 + seqIdx * 500;
      const cardDelay = barDelay + 650;

      setTimeout(() => {
        bar.classList.add('grown');
      }, barDelay);

      setTimeout(() => {
        card.classList.add('visible');
      }, cardDelay);
    });
  }

  // Reveal intro steps
  journeyReveal(introEl, 300, 500);
}
