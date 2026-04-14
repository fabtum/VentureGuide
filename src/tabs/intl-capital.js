import { journeyReveal } from '../main.js';
import { getGlobalFilters, setGlobalFilters } from '../global-filters.js';

/* ── Seeded Random Generator ── */
function getSeededRandom(seedStr) {
  let h = 0;
  for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(31, h) + seedStr.charCodeAt(i) | 0;
  }
  return function() {
      h = Math.imul(h ^ (h >>> 16), 2246822507);
      h = Math.imul(h ^ (h >>> 13), 3266489909);
      return (h ^= h >>> 16) >>> 0;
  };
}

/* ───── Render ───── */
export function renderIntlCapital(container) {
  const filters = getGlobalFilters();
  const allLocations = ['Austria', 'China', 'Finland', 'France', 'Germany', 'India', 'Switzerland', 'United Kingdom', 'United States'];

  // Seed for both Domestic (Overlapping) and Intl (Pie)
  const seedStr = filters.location + filters.industry + (filters.investorLocation || '');
  const rand = getSeededRandom(seedStr);

  const bucketData = [
    { 
      id: 'nothing', label: 'Nothing', 
      fill: Math.floor(40 + (rand() % 21)), rawColor: '#9CA3AF'
    },
    { 
      id: 'preseed', label: 'Pre-Seed', medianTime: '3 mo',
      fill: Math.floor(10 + (rand() % 30)), rawColor: '#818CF8',
      investors: [
        { name: 'Speedinvest', deals: 34 },
        { name: 'Cherry Ventures', deals: 28 },
        { name: 'Antler', deals: 22 },
        { name: 'Plug and Play', deals: 19 },
        { name: 'High-Tech Gründerfonds', deals: 17 }
      ]
    },
    { 
      id: 'seed', label: 'Seed', medianTime: '6 mo',
      fill: Math.floor(5 + (rand() % 30)), rawColor: '#F59E0B',
      investors: [
        { name: 'Earlybird', deals: 41 },
        { name: 'Point Nine Capital', deals: 35 },
        { name: 'HV Capital', deals: 29 },
        { name: 'Creandum', deals: 24 },
        { name: 'La Famiglia', deals: 18 }
      ]
    },
    { 
      id: 'series', label: 'Series A', medianTime: '12 mo',
      fill: Math.floor(1 + (rand() % 20)), rawColor: '#F43F5E',
      investors: [
        { name: 'Insight Partners', deals: 52 },
        { name: 'Index Ventures', deals: 44 },
        { name: 'Balderton Capital', deals: 38 },
        { name: 'General Catalyst', deals: 31 },
        { name: 'Atomico', deals: 26 }
      ]
    },
    { 
      id: 'grant', label: 'Grants', medianTime: '2 mo',
      fill: Math.floor(10 + (rand() % 30)), rawColor: '#10B981',
      investors: [
        { name: 'EXIST', deals: 67 },
        { name: 'HTGF Grant', deals: 54 },
        { name: 'EU Horizon', deals: 41 },
        { name: 'BMBF Förderprogramm', deals: 33 },
        { name: 'KfW', deals: 28 }
      ]
    }
  ];

  const pieBase = [
    { id: 'preseed', w: Math.floor(20 + rand() % 20) },
    { id: 'seed', w: Math.floor(15 + rand() % 25) },
    { id: 'series', w: Math.floor(10 + rand() % 15) },
    { id: 'grant', w: Math.floor(5 + rand() % 15) }
  ];
  const pieTotalW = pieBase.reduce((s, x) => s + x.w, 0);
  const pieData = pieBase.map(slice => {
    const p = Math.round((slice.w / pieTotalW) * 100);
    const bucketRef = bucketData.find(b => b.id === slice.id);
    return { ...bucketRef, pct: p };
  });
  const piePctSum = pieData.reduce((s, x) => s + x.pct, 0);
  if (piePctSum !== 100) pieData[0].pct += (100 - piePctSum);

  const html = `<div class="tab-main-content" id="ic-main">
      <style>
        #ic-pie-detail-investors .tp-path-detail.visible { max-height: 220px !important; }
      </style>

      <!-- Persistent Collapsible Filter Bar -->
      <div class="journey-step">
        <div class="persistent-filter-bar" id="ic-pfb">
          <div class="pfb-collapsed" id="ic-pfb-toggle">
            <div class="pfb-filter-values">
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Organisation Location:</span><span class="pfb-chip-value" id="ic-pfb-cv-country">${filters.location}</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Industry:</span><span class="pfb-chip-value" id="ic-pfb-cv-industry">${filters.industry}</span></div>
              <div class="pfb-filter-chip"><span class="pfb-chip-label">Investor Location:</span><span class="pfb-chip-value" id="ic-pfb-cv-investor-loc">Choose Location</span></div>
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
                  <option value="" disabled>Choose Location</option>
                  <option>Austria</option><option>China</option><option>Finland</option><option>France</option><option>Germany</option><option>India</option><option>Switzerland</option><option>United Kingdom</option><option>United States</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Industry:</label>
                <select class="pfb-dropdown-select" id="ic-pfb-industry">
                  <option value="" disabled>Choose Industry</option>
                  <option>Consumer Goods</option><option>Energy / Resources</option><option>Finance / Consulting</option><option>Health / Biotechnology</option><option>Media / Entertainment</option><option>Mobility / Infrastructure</option><option>Tech / Software</option>
                </select>
              </div>
              <div class="pfb-dropdown-group">
                <label class="pfb-dropdown-label">Investor Location:</label>
                <select class="pfb-dropdown-select" id="ic-pfb-investor-loc">
                  <option value="">Choose Location</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Landing Page (Bars) -->
      <div id="ic-landing">
        <div class="journey-step">
          <div class="tp-paths-container" style="position: relative; z-index: 99;">
            <div class="tp-title-card" style="display: flex; align-items: center; justify-content: space-between;">
              <span class="tp-paths-title" style="margin-bottom: 0; padding-left: 20px;">Country share of international investments in your ecosystem.</span>
            </div>
            <div class="tp-paths-list" style="padding: 12px 0 24px 0;">
              <div id="ic-countries-bars" style="display: flex; flex-direction: column; gap: 8px;"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detail Page (Tabs + Visuals) -->
      <div id="ic-detail" class="hidden">
        <div class="journey-step">
          <div style="display: flex; justify-content: center; margin-bottom: 32px;">
            <nav class="tab-nav">
              <button class="tab-btn active" id="ic-tab-domestic">Domestic Funding Beforehand</button>
              <button class="tab-btn" id="ic-tab-intl">International Investments</button>
            </nav>
          </div>
        </div>

        <!-- 1) DOMESTIC VIEW -->
        <div id="ic-domestic-view" class="ic-buckets-wrapper" style="position: relative; z-index: 100;">
          <div class="journey-step">
            <div class="ic-buckets-section">
              <div class="ic-buckets-header-row" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h3 class="ic-buckets-title" id="ic-dom-title" style="max-width: 800px; margin-bottom: 6px;">These domestic funding instruments were utilized by peers before receiving international investment from investors in your selected country.</h3>
                <p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 24px;">Click on the relevant bucket to be forwarded to the Typical Investors tab.</p>
              </div>
              
              <div class="ic-buckets-content">
                <div class="ic-buckets-row" style="margin-bottom: 0;">
                  ${bucketData.map((b, i) => `
                    <div class="ic-bucket" id="ic-bucket-${b.id}" data-idx="${i}" style="cursor: pointer; position: relative;">
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
                          <div class="ic-bucket-pct" id="ic-pct-${b.id}">${b.fill}%</div>
                        </div>
                      </div>
                      <div class="ic-bucket-label" style="color: ${b.rawColor}">${b.label}</div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 2) INTL VIEW -->
        <div id="ic-intl-view" class="hidden" style="position: relative; z-index: 100;">
          <div class="journey-step">
            <div class="ic-buckets-section">
              <div class="ic-buckets-header-row" style="display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
                <h3 class="ic-buckets-title" id="ic-intl-title" style="max-width: 800px; margin-bottom: 6px;">These are the funding types preferred by investors from the selected country in your ecosystem.</h3>
                <p style="font-size: var(--fs-sm); color: var(--text-muted); margin-bottom: 24px;">Click on the funding type to see the investors from abroad.</p>
              </div>

              <!-- Flex gap ensures responsive side-by-side -->
              <div id="ic-pie-row" style="transition: all 0.6s ease; display: flex; align-items: flex-start; justify-content: center; gap: 48px; flex-wrap: wrap;">
                
                <!-- PIE CHART WRAPPER -->
                <div class="ic-pie-wrapper" style="transition: transform 0.6s ease; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; position: relative;">
                  <svg width="340" height="340" viewBox="-1.2 -1.2 2.4 2.4" style="transform: rotate(-90deg);" id="ic-pie-svg"></svg>
                  <div class="ic-pie-legend" style="display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 20px; width: 340px;">
                    ${pieData.map((p, i) => `
                      <div style="display: flex; align-items: center; gap: 6px; cursor: pointer;" id="ic-pie-leg-${p.id}">
                        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${p.rawColor}"></div>
                        <span style="font-size: var(--fs-sm); color: var(--text-color);">${p.label}</span>
                      </div>
                    `).join('')}
                  </div>
                </div>

                <!-- DETAIL PANEL (Typical Investors Style) -->
                <div id="ic-pie-detail" style="display:none; flex: 2; min-width: 600px; width: 100%; background: var(--bg-surface); border: 1px solid var(--border); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); overflow: hidden; align-self: flex-start;">
                  <div id="ic-pie-detail-header" style="padding: 16px 20px; background: var(--surface-hover); border-bottom: 1px solid var(--border);"></div>
                  <!-- Exact CSS Class from Key Investors -->
                  <div class="tp-paths-list tp-paths-list--bordered" id="ic-pie-detail-investors" style="padding: 0; max-height: 340px; overflow-y: auto;"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  container.innerHTML = html;

  /* ── DOM refs ── */
  const mainEl = document.getElementById('ic-main');
  const landingEl = document.getElementById('ic-landing');
  const detailEl = document.getElementById('ic-detail');

  const pfb = document.getElementById('ic-pfb');
  const pfbToggle = document.getElementById('ic-pfb-toggle');
  const pfbCountry = document.getElementById('ic-pfb-country');
  const pfbIndustry = document.getElementById('ic-pfb-industry');
  const pfbInvestorLoc = document.getElementById('ic-pfb-investor-loc');

  const tabDomesticBtn = document.getElementById('ic-tab-domestic');
  const tabIntlBtn = document.getElementById('ic-tab-intl');
  const domesticView = document.getElementById('ic-domestic-view');
  const intlView = document.getElementById('ic-intl-view');

  pfbCountry.value = filters.location;
  pfbIndustry.value = filters.industry;

  pfbToggle.addEventListener('click', () => pfb.classList.toggle('expanded'));

  function updateInvestorOptions(defaultVal = '') {
    const orgLocVal = pfbCountry.value;
    let selectedVal = pfbInvestorLoc.value || defaultVal;
    if (selectedVal === orgLocVal) selectedVal = "";
    pfbInvestorLoc.innerHTML = '<option value="">Choose Location</option>';
    if (!orgLocVal) return;
    allLocations.forEach(loc => {
      if (loc !== orgLocVal) {
        const opt = document.createElement('option');
        opt.value = loc; opt.textContent = loc;
        if (loc === selectedVal) opt.selected = true;
        pfbInvestorLoc.appendChild(opt);
      }
    });
    if (!selectedVal) pfbInvestorLoc.options[0].selected = true;
  }

  function switchTab(viewId) {
    if (viewId === 'domestic') {
      tabIntlBtn.classList.remove('active');
      tabDomesticBtn.classList.add('active');
      intlView.classList.add('hidden');
      domesticView.classList.remove('hidden');
      journeyReveal(domesticView, 50, 200);
      bucketData.forEach(ob => {
        const l = document.getElementById(`ic-liquid-${ob.id}`);
        if(l) l.style.height = '0%';
      });
      bucketsAnimated = false;
      setTimeout(() => animateBucketFills(), 200);
    } else {
      tabDomesticBtn.classList.remove('active');
      tabIntlBtn.classList.add('active');
      domesticView.classList.add('hidden');
      intlView.classList.remove('hidden');
      journeyReveal(intlView, 50, 200);
      drawPieChart();
    }
  }

  tabDomesticBtn.addEventListener('click', () => switchTab('domestic'));
  tabIntlBtn.addEventListener('click', () => switchTab('intl'));

  /* ── Draw SVG Pie Chart ── */
  let activePieSlice = null;
  function drawPieChart() {
    const svg = document.getElementById('ic-pie-svg');
    if (!svg) return;
    let cumulativePct = 0;
    function getCoordsForPct(pct) {
      const x = Math.cos(2 * Math.PI * pct);
      const y = Math.sin(2 * Math.PI * pct);
      return [x, y];
    }
    svg.innerHTML = '';
    pieData.forEach((slice, i) => {
      const startPct = cumulativePct / 100;
      const endPct = (cumulativePct + slice.pct) / 100;
      cumulativePct += slice.pct;
      const [startX, startY] = getCoordsForPct(startPct);
      const [endX, endY] = getCoordsForPct(endPct);
      const largeArcFlag = slice.pct > 50 ? 1 : 0;
      
      const pathData = `M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
      const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pathEl.setAttribute('d', pathData);
      pathEl.setAttribute('fill', slice.rawColor);
      pathEl.setAttribute('stroke', '#ffffff');
      pathEl.setAttribute('stroke-width', '0.015');
      pathEl.style.cursor = 'pointer';
      pathEl.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
      pathEl.id = `ic-pie-path-${slice.id}`;
      pathEl.addEventListener('mouseenter', () => pathEl.style.opacity = '0.8');
      pathEl.addEventListener('mouseleave', () => pathEl.style.opacity = '1');
      const toggleFn = () => {
        if (activePieSlice === slice.id) collapsePie(); else expandPie(slice);
      };
      pathEl.addEventListener('click', toggleFn);
      const legEl = document.getElementById(`ic-pie-leg-${slice.id}`);
      if (legEl) legEl.addEventListener('click', toggleFn);
      svg.appendChild(pathEl);

      // Label Text inside Pie
      if (slice.pct >= 5) {
        const textPct = startPct + (slice.pct / 200);
        const textRadius = 0.65;
        const textX = Math.cos(2 * Math.PI * textPct) * textRadius;
        const textY = Math.sin(2 * Math.PI * textPct) * textRadius;
        const textEl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        textEl.setAttribute('x', textX);
        textEl.setAttribute('y', textY);
        textEl.setAttribute('text-anchor', 'middle');
        textEl.setAttribute('transform', `rotate(90, ${textX}, ${textY})`);
        textEl.setAttribute('fill', '#ffffff');
        textEl.setAttribute('font-size', '0.14');
        textEl.setAttribute('font-weight', 'bold');
        textEl.setAttribute('font-family', 'sans-serif');
        textEl.setAttribute('pointer-events', 'none');
        textEl.setAttribute('dy', '0.05');
        textEl.textContent = `${slice.pct}%`;
        svg.appendChild(textEl);
      }
    });
  }

  let selectedPieInvestorIdx = null;

  function buildPieInvestorDetail(inv, sliceObj) {
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
              <div class="stat-value">${Math.floor(inv.deals * 0.4)}</div>
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
              <div class="stat-label">Median Time until Funding:</div>
              <div class="stat-value">${sliceObj.medianTime}</div>
            </div>
          </div>
          <div class="stat-card tp-stat-card active">
            <div class="stat-icon tp-stat-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
              </svg>
            </div>
            <div style="flex:1;">
              <div class="stat-label">Stage Context:</div>
              <div class="stat-value" style="font-size: 1.25rem;">${sliceObj.label}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  function deselectPieInvestor(skipReset = false) {
    if (selectedPieInvestorIdx !== null) {
      const cardEl = document.getElementById(`ic-inv-card-${selectedPieInvestorIdx}`);
      if (cardEl) {
        cardEl.classList.remove('selected');
        const btn = document.getElementById(`ic-inv-btn-${selectedPieInvestorIdx}`);
        if (btn) btn.innerHTML = 'Details';
        const detail = cardEl.querySelector('.tp-path-detail');
        if (detail) {
          detail.classList.remove('visible');
          setTimeout(() => detail.remove(), 300);
        }
      }
    }
    if (!skipReset) selectedPieInvestorIdx = null;
  }

  function selectPieInvestor(idx, inv, sliceObj) {
    if (selectedPieInvestorIdx === idx) { deselectPieInvestor(); return; }
    if (selectedPieInvestorIdx !== null) { deselectPieInvestor(true); }

    selectedPieInvestorIdx = idx;
    
    const cardEl = document.getElementById(`ic-inv-card-${idx}`);
    cardEl.classList.add('selected');
    const btn = document.getElementById(`ic-inv-btn-${idx}`);
    if (btn) btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';

    const detailHTML = buildPieInvestorDetail(inv, sliceObj);
    cardEl.insertAdjacentHTML('beforeend', detailHTML);

    const detail = cardEl.querySelector('.tp-path-detail');
    requestAnimationFrame(() => {
      detail.classList.add('visible');
    });
  }

  function expandPie(sliceObj) {
    activePieSlice = sliceObj.id;
    selectedPieInvestorIdx = null;
    const panel = document.getElementById('ic-pie-detail');
    const header = document.getElementById('ic-pie-detail-header');
    const investorsList = document.getElementById('ic-pie-detail-investors');
    
    // Highlight wedge
    pieData.forEach(p => {
      const pth = document.getElementById(`ic-pie-path-${p.id}`);
      if(pth) {
        pth.style.opacity = p.id === sliceObj.id ? '1' : '0.4';
        pth.style.transform = p.id === sliceObj.id ? 'scale(1.02)' : 'scale(1)';
      }
    });
    
    header.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 600; font-size: 1.1rem; color: ${sliceObj.rawColor}">Foreign Investors for ${sliceObj.label}</span>
        <button id="ic-pie-close" style="background: var(--surface-alt); border: 1px solid var(--border); border-radius: var(--radius-sm); cursor: pointer; color: var(--text-color); padding: 4px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    `;
    
    document.getElementById('ic-pie-close').addEventListener('click', collapsePie);
    
    // Build list
    investorsList.innerHTML = '';
    const color = sliceObj.rawColor;
    
    sliceObj.investors.forEach((inv, j) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'tp-path-card';
      cardEl.id = `ic-inv-card-${j}`;
      
      const badgeHTML = `<div style="font-size: 0.875rem; font-weight: 600; padding: 4px 12px; border-radius: 6px; white-space: nowrap; color: ${color}; background: color-mix(in srgb, ${color} 10%, transparent); display: inline-flex; align-items: center; justify-content: center;">${inv.name}</div>`;

      cardEl.innerHTML = `
        <div class="tp-path-header">
          <div class="tp-rank">${j + 1}</div>
          <div class="tp-path-name" style="display:flex; align-items:center;">${badgeHTML}</div>
          <button class="tp-path-detail-btn" id="ic-inv-btn-${j}">Details</button>
        </div>
      `;

      cardEl.querySelector('.tp-path-header').addEventListener('click', () => selectPieInvestor(j, inv, sliceObj));
      investorsList.appendChild(cardEl);
    });
    
    panel.style.display = 'block';
  }

  function collapsePie() {
    activePieSlice = null;
    const panel = document.getElementById('ic-pie-detail');
    panel.style.display = 'none';
    pieData.forEach(p => {
      const pth = document.getElementById(`ic-pie-path-${p.id}`);
      if(pth) { pth.style.opacity = '1'; pth.style.transform = 'scale(1)'; }
    });
  }

  /* ── Handles Arrays ── */
  let bucketsAnimated = false;
  function animateBucketFills() {
    if (bucketsAnimated) return;
    bucketsAnimated = true;
    const currentSeed = pfbCountry.value + pfbIndustry.value + (pfbInvestorLoc.value || '');
    const currentRand = getSeededRandom(currentSeed);
    bucketData[0].fill = Math.floor(40 + (currentRand() % 21));
    bucketData[1].fill = Math.floor(10 + (currentRand() % 30));
    bucketData[2].fill = Math.floor(5 + (currentRand() % 30));
    bucketData[3].fill = Math.floor(1 + (currentRand() % 20));
    bucketData[4].fill = Math.floor(10 + (currentRand() % 30));
    bucketData.forEach((b) => {
      const liquid = document.getElementById(`ic-liquid-${b.id}`);
      const pctEl = document.getElementById(`ic-pct-${b.id}`);
      if (liquid) {
        if (pctEl) pctEl.textContent = b.fill + '%';
        setTimeout(() => { liquid.style.height = Math.min(b.fill, 100) + '%'; }, 100);
      }
    });

    // Rebuild Pie Chart dynamically as well
    const pieBaseDyn = [
      { id: 'preseed', w: Math.floor(20 + currentRand() % 20) },
      { id: 'seed', w: Math.floor(15 + currentRand() % 25) },
      { id: 'series', w: Math.floor(10 + currentRand() % 15) },
      { id: 'grant', w: Math.floor(5 + currentRand() % 15) }
    ];
    const pTw = pieBaseDyn.reduce((s, x) => s + x.w, 0);
    pieData.length = 0; // Clear it
    pieBaseDyn.forEach(slice => {
      const p = Math.round((slice.w / pTw) * 100);
      const bucketRef = bucketData.find(b => b.id === slice.id);
      pieData.push({...bucketRef, pct: p});
    });
    const piePctSum = pieData.reduce((s, x) => s + x.pct, 0);
    if (piePctSum !== 100) pieData[0].pct += (100 - piePctSum);

    if (!intlView.classList.contains('hidden')) drawPieChart();
  }

  bucketData.forEach((b) => {
    const el = document.getElementById(`ic-bucket-${b.id}`);
    if (el && b.id !== 'nothing') {
      el.addEventListener('click', () => {
        const typicalInvestorsTabBtn = document.querySelector('[data-tab="key-investors"]');
        if (typicalInvestorsTabBtn) typicalInvestorsTabBtn.click();
      });
    }
  });

  function handleFilterChange() {
    updateInvestorOptions();
    setGlobalFilters({ location: pfbCountry.value, industry: pfbIndustry.value, investorLocation: pfbInvestorLoc.value });
    document.getElementById('ic-pfb-cv-country').textContent = pfbCountry.value;
    document.getElementById('ic-pfb-cv-industry').textContent = pfbIndustry.value;
    if(activePieSlice !== null) collapsePie();
    if (pfbInvestorLoc.value) {
      document.getElementById('ic-pfb-cv-investor-loc').textContent = pfbInvestorLoc.value;
      const domTitle = document.getElementById('ic-dom-title');
      if (domTitle) domTitle.innerHTML = `These domestic funding instruments were utilized by peers before receiving international investment from <span style="color: var(--accent); white-space: nowrap;">${pfbInvestorLoc.value}</span>.`;
      const intlTitle = document.getElementById('ic-intl-title');
      if (intlTitle) intlTitle.innerHTML = `These are the funding types, in which investors from <span style="color: var(--accent); white-space: nowrap;">${pfbInvestorLoc.value}</span> invest in your ecosystem.`;
      landingEl.style.display = 'none';
      detailEl.classList.remove('hidden');
      bucketsAnimated = false;
      bucketData.forEach((ob) => {
        const l = document.getElementById(`ic-liquid-${ob.id}`);
        if(l) l.style.height = '0%';
      });
      setTimeout(() => animateBucketFills(), 50);
    } else {
      document.getElementById('ic-pfb-cv-investor-loc').textContent = 'Choose Location';
      detailEl.classList.add('hidden');
      landingEl.style.display = 'block';
      renderCountryBars();
    }
  }

  pfbCountry.addEventListener('change', handleFilterChange);
  pfbIndustry.addEventListener('change', handleFilterChange);
  pfbInvestorLoc.addEventListener('change', handleFilterChange);

  function renderCountryBars() {
    const barsContainer = document.getElementById('ic-countries-bars');
    barsContainer.innerHTML = '';
    const filterCountry = pfbCountry.value || ''; 
    let availableLocs = allLocations.filter(loc => loc !== filterCountry);
    const randBar = getSeededRandom(filterCountry + (pfbIndustry.value || ''));
    const baseWeights = { 'United States': 100, 'China': 80, 'United Kingdom': 65, 'France': 45, 'Germany': 40, 'Switzerland': 30, 'Finland': 20, 'Austria': 15, 'India': 10 };
    const scoredLocs = availableLocs.map(loc => ({ loc: loc, score: (baseWeights[loc] || 10) + (randBar() % 41) - 20 }));
    scoredLocs.sort((a, b) => b.score - a.score);
    const selectedCountries = scoredLocs.slice(0, 6).map(s => s.loc);
    let remaining = 100;
    const barData = selectedCountries.map((c, idx) => {
      if (idx === selectedCountries.length - 1) return { loc: c, pct: remaining };
      let alloc = Math.floor(remaining * (0.35 + (randBar() % 20)/100)); 
      if (alloc < 5) alloc = 5;
      remaining -= alloc;
      return { loc: c, pct: alloc };
    });
    barData.sort((a,b) => b.pct - a.pct);
    barData.forEach((item, idx) => {
       const row = document.createElement('div');
       row.className = 'ps-dist-row'; 
       row.style.opacity = '0';
       row.style.transform = 'translateX(-12px)';
       row.innerHTML = `<div class="ps-dist-plus" style="border-radius: 50%; color: var(--accent); background: var(--surface-hover);">
           <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
             <polyline points="20 6 9 17 4 12"></polyline>
           </svg>
         </div>
         <div class="ps-dist-label" style="min-width: 140px; margin-left: 12px; font-weight: 500;">${item.loc}</div>
         <div class="ps-dist-bar-track" style="flex: 1;">
           <div class="ps-dist-bar-fill" style="width:0%; background: var(--accent);">
             <span class="ps-dist-bar-text">${item.pct}%</span>
           </div>
         </div>`;
       row.addEventListener('click', () => {
         pfbInvestorLoc.value = item.loc;
         handleFilterChange();
       });
       barsContainer.appendChild(row);
       setTimeout(() => {
         row.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
         row.style.opacity = '1';
         row.style.transform = 'translateX(0)';
         row.querySelector('.ps-dist-bar-fill').style.width = item.pct + '%';
       }, 50 + idx * 80);
    });
  }

  updateInvestorOptions(filters.investorLocation);
  if (pfbInvestorLoc.value) {
    document.getElementById('ic-pfb-cv-investor-loc').textContent = pfbInvestorLoc.value;
    const domTitle = document.getElementById('ic-dom-title');
    if (domTitle) domTitle.innerHTML = `These domestic funding instruments were utilized by peers before receiving international investment from <span style="color: var(--accent); white-space: nowrap;">${pfbInvestorLoc.value}</span>.`;
    const intlTitle = document.getElementById('ic-intl-title');
    if (intlTitle) intlTitle.innerHTML = `These are the funding types, in which investors from <span style="color: var(--accent); white-space: nowrap;">${pfbInvestorLoc.value}</span> invest in your ecosystem.`;
    landingEl.style.display = 'none';
    detailEl.classList.remove('hidden');
    bucketsAnimated = false;
    setTimeout(() => animateBucketFills(), 300);
  } else {
    document.getElementById('ic-pfb-cv-investor-loc').textContent = 'Choose Location';
    renderCountryBars();
  }
  journeyReveal(mainEl, 200, 400);
}