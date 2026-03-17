import { journeyReveal } from '../main.js';
import { handleProbabilityChange, updateContext } from '../ai-expert.js';

/* ── Instrument channels with median months ── */
const channels = [
  { id: 'preseed', label: 'Pre-Seed', color: 'var(--color-preseed)', weight: 19, medianMonths: 3 },
  { id: 'seed', label: 'Seed', color: 'var(--color-seed)', weight: 9, medianMonths: 6 },
  { id: 'series', label: 'Series A', color: 'var(--color-series-a)', weight: 7, medianMonths: 12 },
  { id: 'grant', label: 'Grant', color: 'var(--color-grant)', weight: 29, medianMonths: 2 },
];

/* ── Bucket data: fill %, top investors ── */
const bucketData = [
  {
    id: 'preseed', label: 'Pre-Seed', fill: 38, medianTime: '3 mo',
    color: 'var(--color-preseed)', rawColor: '#818CF8',
    investors: [
      { name: 'Speedinvest', deals: 34 },
      { name: 'Cherry Ventures', deals: 28 },
      { name: 'Antler', deals: 22 },
      { name: 'Plug and Play', deals: 19 },
      { name: 'High-Tech Gründerfonds', deals: 17 },
    ]
  },
  {
    id: 'seed', label: 'Seed', fill: 32, medianTime: '6 mo',
    color: 'var(--color-seed)', rawColor: '#F59E0B',
    investors: [
      { name: 'Earlybird', deals: 41 },
      { name: 'Point Nine Capital', deals: 35 },
      { name: 'HV Capital', deals: 29 },
      { name: 'Creandum', deals: 24 },
      { name: 'La Famiglia', deals: 18 },
    ]
  },
  {
    id: 'series', label: 'Series A', fill: 21, medianTime: '12 mo',
    color: 'var(--color-series-a)', rawColor: '#F43F5E',
    investors: [
      { name: 'Insight Partners', deals: 52 },
      { name: 'Index Ventures', deals: 44 },
      { name: 'Balderton Capital', deals: 38 },
      { name: 'General Catalyst', deals: 31 },
      { name: 'Atomico', deals: 26 },
    ]
  },
  {
    id: 'grant', label: 'Grant', fill: 9, medianTime: '2 mo',
    color: 'var(--color-grant)', rawColor: '#10B981',
    investors: [
      { name: 'EXIST', deals: 67 },
      { name: 'HTGF Grant', deals: 54 },
      { name: 'EU Horizon', deals: 41 },
      { name: 'BMBF Förderprogramm', deals: 33 },
      { name: 'KfW', deals: 28 },
    ]
  },
];

/* ── Probability calculation ── */
function calcProbability(channelStates) {
  let total = 0;
  channelStates.forEach((state, i) => {
    if (!state.active) return;
    const base = channels[i].weight;
    const decay = Math.max(0.25, 1 - (state.months / 80));
    total += base * decay;
  });
  return Math.min(95, Math.round(total));
}

/* ───── Render ───── */
export function renderIntlCapital(container) {
  const channelStates = channels.map(() => ({ active: false, months: 0 }));

  container.innerHTML = `
    <!-- PHASE 1: Hero Intro -->
    <div class="tab-intro" id="ic-intro">
      <div class="journey-step">
        <div class="tab-intro-content">
          <h1 class="tab-intro-headline">
            Increase your chance of getting<br/><strong>international capital</strong> by sending<br/>the right signals.
          </h1>
        </div>
      </div>

      <div class="journey-step">
        <div class="tab-intro-filters">
          <div class="hero-filter-group">
            <label class="hero-filter-label">Organisation Location:</label>
            <select class="hero-filter-select" id="ic-hero-country">
              <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Industry:</label>
            <select class="hero-filter-select" id="ic-hero-industry">
              <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
            </select>
          </div>
          <div class="hero-filter-group">
            <label class="hero-filter-label">Investor Location:</label>
            <select class="hero-filter-select" id="ic-hero-investor-loc">
              <option>USA</option><option>China</option><option>India</option><option>UK</option><option>Japan</option>
            </select>
          </div>
        </div>
      </div>

      <div class="journey-step">
        <button class="hero-cta" id="ic-start-btn">
          <span>Get international capital…</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>

    <!-- PHASE 2: Main content -->
    <div class="tab-main-content hidden" id="ic-main">

      <!-- Persistent Collapsible Filter Bar (always visible) -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ic-pfb">
          <div class="pfb-collapsed" id="ic-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ic-pfb-cv-country">Germany</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ic-pfb-cv-industry">Tech / Software</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Investor Location:</span><span class="pfb-chip-value" id="ic-pfb-cv-investor-loc">USA</span></div>
            </div>
            <div class="pfb-toggle-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
          </div>
          <div class="pfb-expanded">
            <div class="pfb-dropdowns">
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Organisation Location:</label>
                <select class="pfb-dropdown-select" id="ic-pfb-country">
                  <option>Germany</option><option>Finland</option><option>Austria</option><option>Switzerland</option><option>France</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ic-pfb-industry">
                  <option>Tech / Software</option><option>Consumer Goods</option><option>Energy / Resources</option><option>Mobility / Infrastructure</option><option>Health / Biotechnology</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Investor Location:</label>
                <select class="pfb-dropdown-select" id="ic-pfb-investor-loc">
                  <option>USA</option><option>China</option><option>India</option><option>UK</option><option>Japan</option>
                </select>
              </div>
            </div>
            <div class="pfb-apply-row">
              <button class="pfb-apply-btn" id="ic-pfb-apply">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Domestic Funding Question -->
      <div class="journey-step">
        <div class="ic-domestic-question" id="ic-domestic-question">
          <h3 class="ic-domestic-question-text">Do you plan to get domestic funding beforehand?</h3>
          <div class="ic-domestic-buttons">
            <button class="ic-domestic-btn ic-domestic-btn--yes" id="ic-domestic-yes">Yes</button>
            <button class="ic-domestic-btn ic-domestic-btn--no" id="ic-domestic-no">No</button>
          </div>
        </div>
      </div>

      <!-- YES section: DJ Console only (hidden until Yes is clicked) -->
      <div class="ic-yes-section hidden" id="ic-yes-section">
        <div class="journey-step">
          <div class="dj-console dj-console--compact">
            <!-- Header strip -->
            <div class="dj-header">
              <div class="dj-header-left">Your previous domestic<br/>Financing-Instrument-Mix:</div>
              <div class="dj-header-center">Median months since founded<br/>until that instrument:</div>
              <div class="dj-header-right">Path similarity to peers that<br/>received intl. investment later:</div>
            </div>

            <div class="dj-body dj-body--compact">
              <!-- Left + Center: Channel strips -->
              <div class="dj-channels">
                ${channels.map((ch, i) => `
                  <div class="dj-channel" id="dj-ch-${ch.id}" data-idx="${i}">
                    <div class="dj-ch-toggle-area">
                      <button class="dj-ch-toggle" id="dj-toggle-${ch.id}" data-idx="${i}" aria-label="Toggle ${ch.label}">
                        <span class="dj-toggle-knob"></span>
                      </button>
                      <span class="dj-ch-label">${ch.label}:</span>
                    </div>
                    <div class="dj-ch-fader-area dj-ch-fader-area--compact">
                      <div class="dj-fader-track dj-fader-track--compact">
                        <div class="dj-fader-fill" id="dj-fill-${ch.id}"></div>
                      </div>
                      <span class="dj-ch-months" id="dj-months-${ch.id}">–</span>
                      <span class="dj-ch-months-label">Months</span>
                    </div>
                  </div>
                `).join('')}
              </div>

              <!-- Right: Needle Gauge -->
              <div class="dj-gauge-area">
                <div class="dj-gauge" id="dj-gauge">
                  <svg viewBox="0 0 200 120" class="dj-gauge-svg">
                    <!-- Background arc segments -->
                    <path d="M 20 110 A 80 80 0 0 1 100 30" stroke="rgba(0,0,0,0.08)" stroke-width="14" fill="none" stroke-linecap="round"/>
                    <path d="M 100 30 A 80 80 0 0 1 180 110" stroke="rgba(0,0,0,0.08)" stroke-width="14" fill="none" stroke-linecap="round"/>
                    <!-- Colored arc (fills based on value) -->
                    <path d="M 20 110 A 80 80 0 0 1 180 110" stroke="rgba(0,0,0,0.04)" stroke-width="14" fill="none" stroke-linecap="round" id="dj-gauge-bg"/>
                    <path d="M 20 110 A 80 80 0 0 1 180 110" stroke="url(#gaugeGrad)" stroke-width="14" fill="none" stroke-linecap="round" id="dj-gauge-arc"
                      stroke-dasharray="251.2" stroke-dashoffset="251.2" style="visibility:hidden;"/>
                    <!-- Gradient -->
                    <defs>
                      <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#6366f1"/>
                        <stop offset="50%" stop-color="#818cf8"/>
                        <stop offset="100%" stop-color="#4ade80"/>
                      </linearGradient>
                    </defs>
                    <!-- Needle -->
                    <line x1="100" y1="110" x2="100" y2="40" stroke="#1a1a2e" stroke-width="3" stroke-linecap="round" id="dj-gauge-needle"
                      transform="rotate(-90, 100, 110)" style="transition: transform 1s cubic-bezier(0.34, 1.56, 0.64, 1);"/>
                    <!-- Center dot -->
                    <circle cx="100" cy="110" r="6" fill="#1a1a2e"/>
                  </svg>
                </div>
                <div class="dj-gauge-value" id="dj-gauge-value">0%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Funding Stage Buckets (hidden until a choice is made) -->
      <div class="ic-buckets-wrapper hidden" id="ic-buckets-wrapper">
        <div class="journey-step">
          <div class="ic-buckets-section" id="ic-buckets-section">
            <div class="ic-buckets-header-row" id="ic-buckets-toggle">
              <h3 class="ic-buckets-title">Those are the stages international investors typically invest in.</h3>
              <svg class="ic-buckets-chevron" id="ic-buckets-chevron" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </div>
            <div class="ic-buckets-collapsible hidden" id="ic-buckets-collapsible">
          <div class="ic-buckets-row" id="ic-buckets-row">
            ${bucketData.map((b, i) => `
              <div class="ic-bucket" id="ic-bucket-${b.id}" data-idx="${i}">
                <div class="ic-bucket-container">
                  <div class="ic-bucket-glass">
                    <div class="ic-bucket-liquid" id="ic-liquid-${b.id}" style="--bucket-color: ${b.rawColor}; --fill-pct: ${b.fill}%;">
                      <div class="ic-bucket-wave"></div>
                      <div class="ic-bubble" style="--bubble-size: 6px; --bubble-left: 20%; --bubble-delay: 0s; --bubble-duration: 3s;"></div>
                      <div class="ic-bubble" style="--bubble-size: 4px; --bubble-left: 45%; --bubble-delay: 0.8s; --bubble-duration: 2.5s;"></div>
                      <div class="ic-bubble" style="--bubble-size: 8px; --bubble-left: 70%; --bubble-delay: 1.5s; --bubble-duration: 3.5s;"></div>
                      <div class="ic-bubble" style="--bubble-size: 5px; --bubble-left: 35%; --bubble-delay: 2.2s; --bubble-duration: 2.8s;"></div>
                      <div class="ic-bubble" style="--bubble-size: 7px; --bubble-left: 80%; --bubble-delay: 0.5s; --bubble-duration: 3.2s;"></div>
                      <div class="ic-bubble" style="--bubble-size: 10px; --bubble-left: 55%; --bubble-delay: 1.8s; --bubble-duration: 4s;"></div>
                    </div>
                    <div class="ic-bucket-pct">${b.fill}%</div>
                  </div>
                </div>
                <div class="ic-bucket-label" style="color: ${b.rawColor}">${b.label}</div>
              </div>
            `).join('')}
          </div>

          <!-- Detail panel (hidden by default) -->
          <div class="ic-bucket-detail" id="ic-bucket-detail" style="display:none;">
            <div class="ic-detail-header" id="ic-detail-header"></div>
            <div class="ic-detail-investors" id="ic-detail-investors"></div>
            <div class="ic-detail-meta" id="ic-detail-meta"></div>
          </div>
          </div>
        </div>
      </div>
      </div>

    </div>
  `;

  /* ── DOM refs ── */
  const introEl = document.getElementById('ic-intro');
  const mainEl = document.getElementById('ic-main');
  const domesticQuestion = document.getElementById('ic-domestic-question');
  const yesSection = document.getElementById('ic-yes-section');
  const bucketsWrapper = document.getElementById('ic-buckets-wrapper');
  const pfb = document.getElementById('ic-pfb');
  const pfbToggle = document.getElementById('ic-pfb-toggle');
  const pfbApply = document.getElementById('ic-pfb-apply');

  /* ── PFB toggle ── */
  pfbToggle.addEventListener('click', () => pfb.classList.toggle('expanded'));

  /* ── PFB sync & apply ── */
  function syncIntroToPfb() {
    document.getElementById('ic-pfb-country').value = document.getElementById('ic-hero-country').value;
    document.getElementById('ic-pfb-industry').value = document.getElementById('ic-hero-industry').value;
    document.getElementById('ic-pfb-investor-loc').value = document.getElementById('ic-hero-investor-loc').value;
    updateChips();
  }
  function updateChips() {
    document.getElementById('ic-pfb-cv-country').textContent = document.getElementById('ic-pfb-country').value;
    document.getElementById('ic-pfb-cv-industry').textContent = document.getElementById('ic-pfb-industry').value;
    document.getElementById('ic-pfb-cv-investor-loc').textContent = document.getElementById('ic-pfb-investor-loc').value;
  }
  pfbApply.addEventListener('click', () => {
    updateChips();
    pfb.classList.remove('expanded');
  });

  /* ── Update needle gauge ── */
  function updateGauge() {
    const prob = calcProbability(channelStates);

    // Update needle rotation: -90deg (0%) to +90deg (100%)
    const angle = -90 + (prob / 100) * 180;
    const needle = document.getElementById('dj-gauge-needle');
    if (needle) needle.setAttribute('transform', `rotate(${angle}, 100, 110)`);

    // Update arc fill
    const arc = document.getElementById('dj-gauge-arc');
    if (arc) {
      const totalLength = 251.2;
      const offset = totalLength - (prob / 100) * totalLength;
      arc.setAttribute('stroke-dashoffset', offset);
      // Hide arc at 0% to avoid green dot artifact from round linecap
      arc.style.visibility = prob > 0 ? 'visible' : 'hidden';
    }

    // Update value display
    const valueEl = document.getElementById('dj-gauge-value');
    if (valueEl) valueEl.textContent = prob + '%';

    return prob;
  }

  // Debounced AI Expert hook
  let aiHookTimeout = null;
  function triggerAIEvaluation() {
    clearTimeout(aiHookTimeout);
    aiHookTimeout = setTimeout(() => {
      const prob = calcProbability(channelStates);
      const activeInstr = channelStates.filter(c => c.active).map((c, i) => channels[i].label);
      const totalMonths = channelStates.reduce((acc, c) => acc + (c.active ? c.months : 0), 0);
      handleProbabilityChange(prob, activeInstr, totalMonths);
    }, 1000);
  }

  /* ── Channel toggles (auto-set median months, read-only fader) ── */
  channels.forEach((ch, i) => {
    const toggle = document.getElementById(`dj-toggle-${ch.id}`);
    const monthsDisplay = document.getElementById(`dj-months-${ch.id}`);
    const fillBar = document.getElementById(`dj-fill-${ch.id}`);
    const channelEl = document.getElementById(`dj-ch-${ch.id}`);

    toggle.addEventListener('click', () => {
      channelStates[i].active = !channelStates[i].active;
      toggle.classList.toggle('on', channelStates[i].active);
      channelEl.classList.toggle('active', channelStates[i].active);

      if (channelStates[i].active) {
        // Auto-set to median months
        channelStates[i].months = ch.medianMonths;
        monthsDisplay.textContent = ch.medianMonths;
        fillBar.style.width = (ch.medianMonths / 60 * 100) + '%';
      } else {
        channelStates[i].months = 0;
        monthsDisplay.textContent = '–';
        fillBar.style.width = '0%';
      }
      updateGauge();
    });
  });

  /* ── Bucket interactions ── */
  let activeBucket = null;

  function animateBucketFills() {
    bucketData.forEach((b) => {
      const liquid = document.getElementById(`ic-liquid-${b.id}`);
      if (liquid) {
        setTimeout(() => {
          liquid.style.height = b.fill + '%';
        }, 300);
      }
    });
  }

  function expandBucket(idx) {
    const b = bucketData[idx];
    const bucketsRow = document.getElementById('ic-buckets-row');
    const detailPanel = document.getElementById('ic-bucket-detail');

    // Mark active
    activeBucket = idx;
    bucketsRow.classList.add('ic-buckets-row--expanded');

    // Hide all buckets except this one
    bucketData.forEach((ob, oi) => {
      const el = document.getElementById(`ic-bucket-${ob.id}`);
      const liquid = document.getElementById(`ic-liquid-${ob.id}`);
      if (oi === idx) {
        el.classList.add('ic-bucket--active');
        // Agitate water on the active bucket
        if (liquid) {
          liquid.classList.add('agitated');
          setTimeout(() => liquid.classList.remove('agitated'), 1200);
        }
      } else {
        el.classList.add('ic-bucket--hidden');
      }
    });

    // Populate detail panel
    const headerEl = document.getElementById('ic-detail-header');
    const investorsEl = document.getElementById('ic-detail-investors');
    const metaEl = document.getElementById('ic-detail-meta');

    headerEl.innerHTML = '';

    investorsEl.innerHTML = `
      <div class="ic-detail-grid">
        <!-- Left: Median Time card -->
        <div class="ic-detail-card">
          <div class="ic-detail-card-icon" style="color: ${b.rawColor}">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
          </div>
          <div class="ic-detail-card-value" style="color: ${b.rawColor}">${b.medianTime}</div>
          <div class="ic-detail-card-label">Median Time to Funding</div>
        </div>

        <!-- Right: Top 5 investors -->
        ${b.investors.map((inv, rank) => `
          <div class="ic-detail-card">
            <div class="ic-detail-card-icon ic-detail-rank" style="background: ${b.rawColor}">${rank + 1}</div>
            <div class="ic-detail-card-value" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
              ${inv.name}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: var(--text-muted);">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                <polyline points="15 3 21 3 21 9"></polyline>
                <line x1="10" y1="14" x2="21" y2="3"></line>
              </svg>
            </div>
            <div class="ic-detail-card-label">${inv.deals} deals</div>
          </div>
        `).join('')}
      </div>
    `;

    metaEl.innerHTML = '';

    detailPanel.style.display = 'flex';
    setTimeout(() => detailPanel.classList.add('ic-detail--visible'), 50);

  }

  function collapseBucket() {
    const bucketsRow = document.getElementById('ic-buckets-row');
    const detailPanel = document.getElementById('ic-bucket-detail');

    // Agitate water on the active bucket before collapsing
    if (activeBucket !== null) {
      const b = bucketData[activeBucket];
      const liquid = document.getElementById(`ic-liquid-${b.id}`);
      if (liquid) {
        liquid.classList.add('agitated');
        setTimeout(() => liquid.classList.remove('agitated'), 1200);
      }
    }

    activeBucket = null;
    bucketsRow.classList.remove('ic-buckets-row--expanded');
    detailPanel.classList.remove('ic-detail--visible');

    bucketData.forEach((ob) => {
      const el = document.getElementById(`ic-bucket-${ob.id}`);
      el.classList.remove('ic-bucket--active', 'ic-bucket--hidden');
    });

    setTimeout(() => { detailPanel.style.display = 'none'; }, 400);
  }

  // Bind bucket clicks
  bucketData.forEach((b, i) => {
    const el = document.getElementById(`ic-bucket-${b.id}`);
    el.addEventListener('click', () => {
      if (activeBucket === i) {
        collapseBucket();
      } else {
        if (activeBucket !== null) collapseBucket();
        setTimeout(() => expandBucket(i), activeBucket !== null ? 450 : 0);
      }
    });
  });

  /* ── Start button ── */
  document.getElementById('ic-start-btn').addEventListener('click', () => {
    syncIntroToPfb();
    introEl.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    introEl.style.opacity = '0';
    introEl.style.transform = 'translateY(-30px)';

    setTimeout(() => {
      introEl.style.display = 'none';
      mainEl.classList.remove('hidden');
      journeyReveal(mainEl, 200, 400);
    }, 600);
  });

  /* ── Yes / No domestic funding buttons ── */
  let currentChoice = null; // 'yes' | 'no' | null
  const yesBtn = document.getElementById('ic-domestic-yes');
  const noBtn = document.getElementById('ic-domestic-no');
  const bucketsCollapsible = document.getElementById('ic-buckets-collapsible');
  const bucketsChevron = document.getElementById('ic-buckets-chevron');
  const bucketsToggleRow = document.getElementById('ic-buckets-toggle');
  let bucketsExpanded = false;
  let bucketsFilled = false;

  function applyChoice(choice) {
    currentChoice = choice;

    // Update button states
    yesBtn.classList.toggle('active', choice === 'yes');
    noBtn.classList.toggle('active', choice === 'no');

    if (choice === 'yes') {
      // Show DJ console
      yesSection.classList.remove('hidden');
      journeyReveal(yesSection, 150, 300);
    } else {
      // Hide DJ console
      yesSection.classList.add('hidden');
    }

    // Always show the statement + chevron row
    bucketsWrapper.classList.remove('hidden');
    journeyReveal(bucketsWrapper, 150, 300);

    // Auto-expand buckets if choice is 'no'
    if (choice === 'no' && !bucketsExpanded) {
      setTimeout(() => bucketsToggleRow.click(), 400); // Small delay for visual flow
    }
  }

  yesBtn.addEventListener('click', () => applyChoice('yes'));
  noBtn.addEventListener('click', () => applyChoice('no'));

  // Buckets chevron toggle
  bucketsToggleRow.addEventListener('click', () => {
    bucketsExpanded = !bucketsExpanded;
    bucketsChevron.classList.toggle('rotated', bucketsExpanded);

    if (bucketsExpanded) {
      bucketsCollapsible.classList.remove('hidden');
      if (!bucketsFilled) {
        bucketsFilled = true;
        setTimeout(() => animateBucketFills(), 300);
      }
    } else {
      bucketsCollapsible.classList.add('hidden');
    }
  });

  journeyReveal(introEl, 300, 500);
}
