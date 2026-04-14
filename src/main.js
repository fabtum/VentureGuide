import './style.css';
import { initParticles } from './particles.js';
import { renderTypicalPaths } from './tabs/typical-paths.js';
import { renderPathSimulator } from './tabs/path-simulator.js';
import { renderKeyInvestors } from './tabs/key-investors.js';
import { renderIntlCapital } from './tabs/intl-capital.js';
import { setGlobalFilters } from './global-filters.js';

import { initAIExpert, handleTabSwitch, triggerWelcomeMessage } from './ai-expert.js';
import { updateContext } from './ai-expert.js';

/* Tab ordering for directional slides */
const tabOrder = ['path-simulator', 'typical-paths', 'key-investors', 'intl-capital'];
let currentTab = 'path-simulator';

const tabRenderers = {
  'typical-paths': renderTypicalPaths,
  'path-simulator': renderPathSimulator,
  'key-investors': renderKeyInvestors,
  'intl-capital': renderIntlCapital,
};

function switchTab(tabId) {
  if (tabId === currentTab) return;

  const oldIdx = tabOrder.indexOf(currentTab);
  const newIdx = tabOrder.indexOf(tabId);
  const direction = newIdx > oldIdx ? 'left' : 'right'; // slide out direction

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
  });

  const contentEl = document.getElementById('tab-content');

  // Slide old content out
  contentEl.classList.remove('slide-in-left', 'slide-in-right');
  contentEl.classList.add(`slide-out-${direction}`);

  setTimeout(() => {
    currentTab = tabId;
    contentEl.innerHTML = '';

    // Remove old animation, add slide-in from opposite side
    contentEl.classList.remove('slide-out-left', 'slide-out-right');
    const enterDir = direction === 'left' ? 'right' : 'left';
    contentEl.classList.add(`slide-in-${enterDir}`);

    if (tabRenderers[tabId]) {
      tabRenderers[tabId](contentEl);
    }

    handleTabSwitch(tabId);

    // Clean up animation classes
    setTimeout(() => contentEl.classList.remove('slide-in-left', 'slide-in-right'), 500);
  }, 350);
}

/**
 * Sequential journey reveal — reveals .journey-step elements one after another.
 */
export function journeyReveal(container, baseDelay = 300, stepDelay = 500) {
  const steps = container.querySelectorAll('.journey-step');
  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('revealed');
    }, baseDelay + i * stepDelay);
  });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initAIExpert();

  const landingPage = document.getElementById('landing-page');
  const appShell = document.getElementById('app-shell');
  const enterBtn = document.getElementById('landing-enter-btn');

  // Landing → App: tunnel zoom transition with validation
  enterBtn.addEventListener('click', () => {
    const countrySel = document.getElementById('landing-country');
    const countryValEl = document.getElementById('landing-country-val');
    const industrySel = document.getElementById('landing-industry');
    const industryValEl = document.getElementById('landing-industry-val');

    let isValid = true;

    if (!countrySel.value) {
      countrySel.style.transition = 'outline 0.2s';
      countrySel.style.outline = '2px solid #d946ef';
      if (countryValEl) countryValEl.style.display = 'flex';
      isValid = false;
      setTimeout(() => {
        countrySel.style.outline = 'none';
        if (countryValEl) countryValEl.style.display = 'none';
      }, 3000);
    }

    if (!industrySel.value) {
      industrySel.style.transition = 'outline 0.2s';
      industrySel.style.outline = '2px solid #d946ef';
      if (industryValEl) industryValEl.style.display = 'flex';
      isValid = false;
      setTimeout(() => {
        industrySel.style.outline = 'none';
        if (industryValEl) industryValEl.style.display = 'none';
      }, 3000);
    }

    if (!isValid) return;

    // Set global filters
    setGlobalFilters({
      location: countrySel.value,
      industry: industrySel.value,
    });
    updateContext('country', countrySel.value);
    updateContext('industry', industrySel.value);

    landingPage.classList.add('tunnel-out');

    setTimeout(() => {
      landingPage.style.display = 'none';
      appShell.classList.remove('hidden');
      appShell.classList.add('tunnel-in');

      // Render first tab
      const contentEl = document.getElementById('tab-content');
      renderPathSimulator(contentEl);

      // Tab nav
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
      });

      // Clean up
      setTimeout(() => {
        appShell.classList.remove('tunnel-in');
        // Show Funding Types modal after entering
        showFundingTypesModal();
      }, 900);
    }, 800);
  });

  // ── Funding Types Modal ──
  const ftOverlay = document.getElementById('ft-modal-overlay');
  const ftCloseBtn = document.getElementById('ft-modal-close');
  const ftGotItBtn = document.getElementById('ft-modal-got-it');
  const ftOpenBtn = document.getElementById('funding-types-btn');

  function showFundingTypesModal() {
    ftOverlay.classList.remove('hidden');
  }

  function hideFundingTypesModal() {
    ftOverlay.classList.add('hidden');
    // Trigger Jessica's welcome message after the modal is dismissed
    triggerWelcomeMessage();
  }

  ftCloseBtn.addEventListener('click', hideFundingTypesModal);
  ftGotItBtn.addEventListener('click', hideFundingTypesModal);
  ftOverlay.addEventListener('click', (e) => {
    if (e.target === ftOverlay) hideFundingTypesModal();
  });

  // Reopen from navbar button
  ftOpenBtn.addEventListener('click', () => {
    ftOverlay.classList.remove('hidden');
  });
});
