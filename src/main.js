import './style.css';
import { initParticles } from './particles.js';
import { renderTypicalPaths } from './tabs/typical-paths.js';
import { renderPathSimulator } from './tabs/path-simulator.js';
import { renderKeyInvestors } from './tabs/key-investors.js';
import { renderIntlCapital } from './tabs/intl-capital.js';

// Coach messages per tab
const coachMessages = {
  'typical-paths': `Hey, I am Jessica your personal Incubator expert....`,
  'path-simulator': `Let's build <strong>your personal funding path</strong>. First choose your filters, then pick instruments step by step.`,
  'key-investors': `Here are the <strong>top investors</strong> for your selected filters, ranked by relevance and timing.`,
  'intl-capital': `This console simulates your <strong>probability of attracting international capital</strong>. Toggle instruments and adjust the timeline.`,
};

let currentTab = 'typical-paths';

const tabRenderers = {
  'typical-paths': renderTypicalPaths,
  'path-simulator': renderPathSimulator,
  'key-investors': renderKeyInvestors,
  'intl-capital': renderIntlCapital,
};

function switchTab(tabId) {
  if (tabId === currentTab) return;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
    btn.setAttribute('aria-selected', btn.dataset.tab === tabId);
  });

  const contentEl = document.getElementById('tab-content');
  contentEl.classList.add('fade-out');

  setTimeout(() => {
    currentTab = tabId;
    contentEl.innerHTML = '';
    contentEl.classList.remove('fade-out');
    contentEl.classList.add('fade-in');

    if (tabRenderers[tabId]) {
      tabRenderers[tabId](contentEl);
    }

    const coachText = document.getElementById('coach-text');
    if (coachText) coachText.innerHTML = coachMessages[tabId] || '';

    setTimeout(() => contentEl.classList.remove('fade-in'), 500);
  }, 280);
}

/**
 * Sequential journey reveal — reveals .journey-step elements one after another.
 * @param {HTMLElement} container - parent container
 * @param {number} baseDelay - delay before first step (ms)
 * @param {number} stepDelay - delay between each step (ms)
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

  // Render first tab immediately
  const contentEl = document.getElementById('tab-content');
  renderTypicalPaths(contentEl);

  // Tab nav
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
});
