import './style.css';
import { initParticles } from './particles.js';
import { renderTypicalPaths } from './tabs/typical-paths.js';
import { renderPathSimulator } from './tabs/path-simulator.js';
import { renderKeyInvestors } from './tabs/key-investors.js';
import { renderIntlCapital } from './tabs/intl-capital.js';

import { initAIExpert, handleTabSwitch } from './ai-expert.js';

/* Tab ordering for directional slides */
const tabOrder = ['typical-paths', 'path-simulator', 'key-investors', 'intl-capital'];
let currentTab = 'typical-paths';

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

  // Landing → App: tunnel zoom transition
  enterBtn.addEventListener('click', () => {
    landingPage.classList.add('tunnel-out');

    setTimeout(() => {
      landingPage.style.display = 'none';
      appShell.classList.remove('hidden');
      appShell.classList.add('tunnel-in');

      // Render first tab
      const contentEl = document.getElementById('tab-content');
      renderTypicalPaths(contentEl);

      // Tab nav
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
      });

      // Clean up
      setTimeout(() => appShell.classList.remove('tunnel-in'), 900);
    }, 800);
  });
});
