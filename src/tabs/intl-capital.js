import { journeyReveal } from '../main.js';

/* ── Instrument channels ── */
const channels = [
  { id: 'preseed', label: 'PreSeed', color: 'var(--color-preseed)', weight: 19 },
  { id: 'seed', label: 'Seed', color: 'var(--color-seed)', weight: 9 },
  { id: 'series', label: 'Series A', color: 'var(--color-series-a)', weight: 7 },
  { id: 'grant', label: 'Grant', color: 'var(--color-grant)', weight: 29 },
  { id: 'angel', label: 'Angel', color: 'var(--color-angel)', weight: 5 },
];

/* ── Probability calculation ── */
function calcProbability(channelStates) {
  let total = 0;
  channelStates.forEach((state, i) => {
    if (!state.active) return;
    const base = channels[i].weight;
    // Months decay: more months → lower contribution
    // 0 months = full weight, 60 months = ~25% of weight
    const decay = Math.max(0.25, 1 - (state.months / 80));
    total += base * decay;
  });
  return Math.min(95, Math.round(total));
}

function getMeterSegments(prob) {
  // 5 VU segments: green-green-yellow-orange-red
  const thresholds = [20, 40, 60, 80, 100];
  return thresholds.map((t, i) => {
    const segMin = i === 0 ? 0 : thresholds[i - 1];
    const fill = prob >= t ? 1 : prob > segMin ? (prob - segMin) / (t - segMin) : 0;
    return fill;
  });
}

/* ───── Render ───── */
export function renderIntlCapital(container) {
  // Channel states: active + months
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

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ic-pfb">
          <div class="pfb-collapsed" id="ic-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ic-pfb-cv-country">Germany</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ic-pfb-cv-industry">Tech / Software</span></div>
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
            </div>
            <div class="pfb-apply-row">
              <button class="pfb-apply-btn" id="ic-pfb-apply">Apply Filters</button>
            </div>
          </div>
        </div>
      </div>

      <!-- DJ Mixing Console -->
      <div class="journey-step">
        <div class="dj-console">
          <!-- Header strip -->
          <div class="dj-header">
            <div class="dj-header-left">Your Financing<br/>Instrument Mix:</div>
            <div class="dj-header-center">Months since founded:</div>
            <div class="dj-header-right">US-VC<br/>Likelihood:</div>
          </div>

          <div class="dj-body">
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
                  <div class="dj-ch-fader-area">
                    <div class="dj-fader-track">
                      <div class="dj-fader-fill" id="dj-fill-${ch.id}"></div>
                      <input type="range" class="dj-fader" id="dj-fader-${ch.id}" min="0" max="60" value="0" disabled data-idx="${i}" />
                    </div>
                    <span class="dj-ch-months" id="dj-months-${ch.id}">–</span>
                    <span class="dj-ch-months-label">Months</span>
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Right: VU Meter -->
            <div class="dj-vu-area">
              <div class="dj-vu-meter" id="dj-vu-meter">
                ${[0, 1, 2, 3, 4].map(i => `<div class="dj-vu-seg" id="dj-vu-seg-${i}"></div>`).join('')}
              </div>
              <div class="dj-vu-value" id="dj-vu-value">0%</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  /* ── DOM refs ── */
  const introEl = document.getElementById('ic-intro');
  const mainEl = document.getElementById('ic-main');
  const pfb = document.getElementById('ic-pfb');
  const pfbToggle = document.getElementById('ic-pfb-toggle');
  const pfbApply = document.getElementById('ic-pfb-apply');

  /* ── PFB toggle ── */
  pfbToggle.addEventListener('click', () => pfb.classList.toggle('expanded'));

  /* ── PFB sync & apply ── */
  function syncIntroToPfb() {
    document.getElementById('ic-pfb-country').value = document.getElementById('ic-hero-country').value;
    document.getElementById('ic-pfb-industry').value = document.getElementById('ic-hero-industry').value;
    updateChips();
  }
  function updateChips() {
    document.getElementById('ic-pfb-cv-country').textContent = document.getElementById('ic-pfb-country').value;
    document.getElementById('ic-pfb-cv-industry').textContent = document.getElementById('ic-pfb-industry').value;
  }
  pfbApply.addEventListener('click', () => {
    updateChips();
    pfb.classList.remove('expanded');
  });

  /* ── Update VU meter ── */
  function updateVU() {
    const prob = calcProbability(channelStates);
    const segments = getMeterSegments(prob);

    // Update VU segments (bottom=green, top=red)
    segments.forEach((fill, i) => {
      const seg = document.getElementById(`dj-vu-seg-${i}`);
      if (!seg) return;
      seg.style.transform = `scaleY(${fill})`;
      seg.classList.toggle('lit', fill > 0);
    });

    // Update value display
    const valueEl = document.getElementById('dj-vu-value');
    if (valueEl) valueEl.textContent = prob + '%';
  }

  /* ── Channel toggles ── */
  channels.forEach((ch, i) => {
    const toggle = document.getElementById(`dj-toggle-${ch.id}`);
    const fader = document.getElementById(`dj-fader-${ch.id}`);
    const monthsDisplay = document.getElementById(`dj-months-${ch.id}`);
    const fillBar = document.getElementById(`dj-fill-${ch.id}`);
    const channelEl = document.getElementById(`dj-ch-${ch.id}`);

    // Toggle on/off
    toggle.addEventListener('click', () => {
      channelStates[i].active = !channelStates[i].active;
      toggle.classList.toggle('on', channelStates[i].active);
      channelEl.classList.toggle('active', channelStates[i].active);
      fader.disabled = !channelStates[i].active;

      if (channelStates[i].active) {
        channelStates[i].months = 0;
        fader.value = 0;
        monthsDisplay.textContent = '0';
        fillBar.style.width = '0%';
      } else {
        channelStates[i].months = 0;
        fader.value = 0;
        monthsDisplay.textContent = '–';
        fillBar.style.width = '0%';
      }
      updateVU();
    });

    // Fader input
    fader.addEventListener('input', () => {
      const val = parseInt(fader.value);
      channelStates[i].months = val;
      monthsDisplay.textContent = val;
      fillBar.style.width = (val / 60 * 100) + '%';
      updateVU();
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

  journeyReveal(introEl, 300, 500);
}
