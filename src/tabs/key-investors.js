import { journeyReveal } from '../main.js';
import { postCoachMessage, updateContext } from '../ai-expert.js';
import { getGlobalFilters, setGlobalFilters } from '../global-filters.js';

/* ── Investor data keyed by instrument ── */
const investorsByInstrument = {
  'Grants': [
    { rank: 1, name: 'HTGF', deals: 320, url: '#', medianTime: '4 Months' },
    { rank: 2, name: 'Exist', deals: 212, url: '#', medianTime: '3 Months' },
    { rank: 3, name: 'Synergy', deals: 103, url: '#', medianTime: '5 Months' },
    { rank: 4, name: 'ERC', deals: 67, url: '#', medianTime: '6 Months' },
    { rank: 5, name: 'DFG', deals: 47, url: '#', medianTime: '7 Months' },
    { rank: 6, name: 'EIT Health', deals: 42, url: '#', medianTime: '4 Months' },
    { rank: 7, name: 'Horizon Europe', deals: 38, url: '#', medianTime: '8 Months' },
    { rank: 8, name: 'BMBF', deals: 33, url: '#', medianTime: '6 Months' },
    { rank: 9, name: 'BMWK', deals: 29, url: '#', medianTime: '5 Months' },
    { rank: 10, name: 'EIC Accelerator', deals: 21, url: '#', medianTime: '7 Months' },
  ],
  'PreSeed': [
    { rank: 1, name: 'Antler', deals: 285, url: '#', medianTime: '3 Months' },
    { rank: 2, name: 'Plug & Play', deals: 198, url: '#', medianTime: '4 Months' },
    { rank: 3, name: 'APX', deals: 142, url: '#', medianTime: '3 Months' },
    { rank: 4, name: 'Entrepreneur First', deals: 89, url: '#', medianTime: '5 Months' },
    { rank: 5, name: 'Seedcamp', deals: 61, url: '#', medianTime: '4 Months' },
    { rank: 6, name: 'SFC Capital', deals: 55, url: '#', medianTime: '5 Months' },
    { rank: 7, name: 'Techstars', deals: 49, url: '#', medianTime: '3 Months' },
    { rank: 8, name: '500 Startups', deals: 44, url: '#', medianTime: '4 Months' },
    { rank: 9, name: 'Founders Factory', deals: 38, url: '#', medianTime: '5 Months' },
    { rank: 10, name: 'Speedinvest', deals: 31, url: '#', medianTime: '4 Months' },
  ],
  'Seed': [
    { rank: 1, name: 'Point Nine', deals: 310, url: '#', medianTime: '5 Months' },
    { rank: 2, name: 'Cherry Ventures', deals: 224, url: '#', medianTime: '4 Months' },
    { rank: 3, name: 'Earlybird', deals: 156, url: '#', medianTime: '5 Months' },
    { rank: 4, name: 'HV Capital', deals: 98, url: '#', medianTime: '6 Months' },
    { rank: 5, name: 'Creandum', deals: 72, url: '#', medianTime: '5 Months' },
    { rank: 6, name: 'LocalGlobe', deals: 68, url: '#', medianTime: '4 Months' },
    { rank: 7, name: 'Kima Ventures', deals: 61, url: '#', medianTime: '3 Months' },
    { rank: 8, name: 'Hoxton Ventures', deals: 53, url: '#', medianTime: '5 Months' },
    { rank: 9, name: 'Project A', deals: 48, url: '#', medianTime: '6 Months' },
    { rank: 10, name: 'Paua Ventures', deals: 41, url: '#', medianTime: '4 Months' },
  ],
  'Series A': [
    { rank: 1, name: 'Sequoia', deals: 425, url: '#', medianTime: '6 Months' },
    { rank: 2, name: 'Index Ventures', deals: 318, url: '#', medianTime: '7 Months' },
    { rank: 3, name: 'Atomico', deals: 187, url: '#', medianTime: '6 Months' },
    { rank: 4, name: 'Balderton', deals: 134, url: '#', medianTime: '8 Months' },
    { rank: 5, name: 'Northzone', deals: 89, url: '#', medianTime: '7 Months' },
    { rank: 6, name: 'Accel', deals: 77, url: '#', medianTime: '6 Months' },
    { rank: 7, name: 'Lightspeed', deals: 68, url: '#', medianTime: '8 Months' },
    { rank: 8, name: 'EQT Ventures', deals: 59, url: '#', medianTime: '7 Months' },
    { rank: 9, name: 'Lakestar', deals: 51, url: '#', medianTime: '6 Months' },
    { rank: 10, name: 'Dawn Capital', deals: 42, url: '#', medianTime: '7 Months' },
  ],
};

function getInstrumentColor(instrument) {
  const map = {
    'Grants': 'var(--color-grant)',
    'PreSeed': 'var(--color-preseed)',
    'Seed': 'var(--color-seed)',
    'Series A': 'var(--color-series-a)',
  };
  return map[instrument] || 'var(--accent)';
}

function getRequiredStage(instrument, seedIndex) {
  const variations = {
    'Grants': ['Pre-Seed', 'Seed', 'Series A', 'Variable'],
    'PreSeed': ['Pre-Seed', 'Variable'],
    'Seed': ['Pre-Seed', 'Seed'],
    'Series A': ['Pre-Seed', 'Seed', 'Series A']
  };
  const list = variations[instrument] || ['Variable'];
  return list[seedIndex % list.length];
}

function shuffleInvestors(investors, seedStr) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) hash = (hash << 5) - hash + seedStr.charCodeAt(i);
  hash = Math.abs(hash);

  const randomized = investors.map((inv, idx) => {
    // Generate a pseudo-random variation between 0.4 and 1.2 based on hash
    const localHash = (hash + (idx + 1) * 37) % 100;
    const variation = 0.4 + (localHash / 100);

    let newDeals = Math.floor(inv.deals * variation);
    if (newDeals < 5) newDeals = 5;

    return { ...inv, deals: newDeals };
  });

  // Sort descending by deals so Rank 1 always has the most 
  randomized.sort((a, b) => b.deals - a.deals);

  // Re-assign ranks 1..N based on new sorted order
  return randomized.map((inv, i) => ({ ...inv, rank: i + 1 }));
}

/* ───── Render ───── */
export function renderKeyInvestors(container) {
  let currentInstrument = 'Grants';
  let selectedInvestorIdx = null;
  const filters = getGlobalFilters();

  container.innerHTML = `
    <div class="tab-main-content" id="ki-main">
      <style>
        #ki-investors-list .tp-path-detail.visible {
          max-height: 220px !important;
        }
      </style>
      
      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ki-pfb">
          <div class="pfb-collapsed" id="ki-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ki-pfb-cv-country">${filters.location}</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ki-pfb-cv-industry">${filters.industry}</span></div>
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
                  <option value="" disabled>Choose Location</option>
                  <option>Austria</option><option>China</option><option>Finland</option><option>France</option><option>Germany</option><option>India</option><option>Switzerland</option><option>United Kingdom</option><option>United States</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ki-pfb-industry">
                  <option value="" disabled>Choose Industry</option>
                  <option>Consumer Goods</option><option>Energy / Resources</option><option>Finance / Consulting</option><option>Health / Biotechnology</option><option>Media / Entertainment</option><option>Mobility / Infrastructure</option><option>Tech / Software</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Full-width list section -->
      <div class="journey-step">
        <div class="tp-paths-container" style="position: relative; z-index: 99;">
          <div class="tp-title-card" style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: var(--sp-2);">
              <span class="tp-paths-title" style="margin-bottom: 0;">These are the most prominent investors in your ecosystem.</span>
            </div>
            
            <div class="pfb-dropdown-group" style="display: flex; flex-direction: row; align-items: center; gap: var(--sp-2); margin: 0;">
              <span class="pfb-dropdown-label" style="margin: 0; padding: 0;">Choose your Funding Type:</span>
              <select class="pfb-dropdown-select" id="ki-instrument-select" style="padding-top: var(--sp-1); padding-bottom: var(--sp-1); border-color: var(--accent-lighter);">
                <option value="Grants" selected>Grants</option>
                <option value="PreSeed">Pre-Seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
              </select>
            </div>
          </div>
          <div class="tp-paths-list tp-paths-list--bordered" id="ki-investors-list"></div>
        </div>
      </div>
    </div>
  `;

  /* ── Filter Bar Toggle & Auto-Apply ── */
  const pfb = document.getElementById('ki-pfb');
  const pfbToggle = document.getElementById('ki-pfb-toggle');
  const pfbCountry = document.getElementById('ki-pfb-country');
  const pfbIndustry = document.getElementById('ki-pfb-industry');

  // Pre-fill selects from global filters
  pfbCountry.value = filters.location;
  pfbIndustry.value = filters.industry;

  pfbToggle.addEventListener('click', () => {
    pfb.classList.toggle('expanded');
  });

  function handleFilterChange() {
    const loc = pfbCountry.value;
    const ind = pfbIndustry.value;
    document.getElementById('ki-pfb-cv-country').textContent = loc;
    document.getElementById('ki-pfb-cv-industry').textContent = ind;
    setGlobalFilters({ location: loc, industry: ind });
    buildInvestorsList();
  }

  pfbCountry.addEventListener('change', handleFilterChange);
  pfbIndustry.addEventListener('change', handleFilterChange);

  const instrumentSelect = document.getElementById('ki-instrument-select');

  instrumentSelect.addEventListener('change', (e) => {
    currentInstrument = e.target.value;
    buildInvestorsList();
  });

  function getActiveInvestors() {
    let baseInvestors = investorsByInstrument[currentInstrument] || [];
    const seedStr = (document.getElementById('ki-pfb-country')?.value || '') +
      (document.getElementById('ki-pfb-industry')?.value || '');
    return shuffleInvestors(baseInvestors, seedStr);
  }

  function buildInvestorDetail(investor, idx) {
    const requiredStage = getRequiredStage(currentInstrument, idx);

    return `
      <div class="tp-path-detail">
        <div class="tp-stats-row">
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Number of Deals:</div>
              <div class="stat-value">${investor.deals}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <!-- Clock Icon -->
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 6v6l4 2"/>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Median Time until Funding since founded:</div>
              <div class="stat-value">${investor.medianTime}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Required Stage:</div>
              <div class="stat-value" style="font-size: 1.25rem;">${requiredStage}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function buildInvestorsList() {
    selectedInvestorIdx = null;
    const investorsList = document.getElementById('ki-investors-list');
    investorsList.innerHTML = '';

    const color = getInstrumentColor(currentInstrument);
    const investors = getActiveInvestors();

    investors.forEach((investor, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'tp-path-card';
      cardEl.id = `ki-investor-${idx}`;

      const badgeHTML = `<div style="font-size: 0.875rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; white-space: nowrap; color: ${color}; background: color-mix(in srgb, ${color} 10%, transparent); display: inline-flex; align-items: center; justify-content: center;">${investor.name}</div>`;

      cardEl.innerHTML = `
        <div class="tp-path-header">
          <div class="tp-rank">${investor.rank}</div>
          <div class="tp-path-name" style="display:flex; align-items:center;">${badgeHTML}</div>
          <button class="tp-path-detail-btn" id="ki-investor-btn-${idx}">Details</button>
        </div>
      `;

      cardEl.querySelector('.tp-path-header').addEventListener('click', () => selectInvestor(idx));
      investorsList.appendChild(cardEl);
    });
  }

  function selectInvestor(idx) {
    if (selectedInvestorIdx === idx) { deselectInvestor(); return; }

    if (selectedInvestorIdx !== null) {
      deselectInvestor(true);
    }

    selectedInvestorIdx = idx;
    const investors = getActiveInvestors();
    const investor = investors[idx];

    const cardEl = document.getElementById(`ki-investor-${idx}`);
    cardEl.classList.add('selected');

    const btn = document.getElementById(`ki-investor-btn-${idx}`);
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    const detailHTML = buildInvestorDetail(investor, idx);
    cardEl.insertAdjacentHTML('beforeend', detailHTML);

    const detail = cardEl.querySelector('.tp-path-detail');
    requestAnimationFrame(() => {
      detail.classList.add('visible');
    });

    updateContext({ selectedInvestor: investor.name, instrument: currentInstrument });
  }

  function deselectInvestor(skipReset = false) {
    if (selectedInvestorIdx !== null) {
      const cardEl = document.getElementById(`ki-investor-${selectedInvestorIdx}`);
      if (cardEl) {
        cardEl.classList.remove('selected');
        const btn = document.getElementById(`ki-investor-btn-${selectedInvestorIdx}`);
        if (btn) btn.innerHTML = 'Details';
        const detail = cardEl.querySelector('.tp-path-detail');
        if (detail) {
          detail.classList.remove('visible');
          setTimeout(() => detail.remove(), 300);
        }
      }
    }
    if (!skipReset) {
      selectedInvestorIdx = null;
      updateContext({ selectedInvestor: null });
    }
  }

  // Initial render
  buildInvestorsList();
  journeyReveal(document.getElementById('ki-main'), 200, 400);

  setTimeout(() => {
    postCoachMessage('If you have any questions about a specific investor or something is unclear, feel free to ask me! 😊', 0);
  }, 2000);
}
