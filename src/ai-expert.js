/**
 * Local AI Incubator Expert (Jessica) logic.
 * Reacts to UI events contextually based on the Antigravity System Prompt.
 */

// User context state
const userContext = {
    industry: 'Tech / Software',
    country: 'Germany',
    stage: 'Idea / Pre-Seed',
    irlLevel: 2, // Approximate IRL 1-9
};

// --- DOM References ---
let messagesContainer = null;
let currentTabId = 'typical-paths';

export function initAIExpert() {
    messagesContainer = document.getElementById('coach-messages');

    // Initial greeting context message (only once per session)
    if (!sessionStorage.getItem('expertIntroduced')) {
        setTimeout(() => {
            postCoachMessage(
                "I see you're building a Tech/Software startup in Germany. To start, are you currently validating your problem-solution fit (IRL 1-3), or already testing your MVP in the market?",
                1000
            );
            sessionStorage.setItem('expertIntroduced', 'true');
        }, 1500);
    }
}

/**
 * Appends a message bubble to the coach panel
 * @param {string} text The message content (HTML allowed)
 * @param {number} delay Optional typing delay simulation
 */
export function postCoachMessage(text, delay = 0) {
    if (!messagesContainer) return;

    const bubble = document.createElement('div');
    bubble.className = 'coach-bubble ai-bubble hidden';

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.innerHTML = `
    <div class="ai-bubble-content">
      <img src="/jessica-avatar.png" class="ai-avatar" alt="Jessica" />
      <div class="ai-bubble-text">
        <p>${text}</p>
        <span class="bubble-time">${timeString}</span>
      </div>
    </div>
  `;

    if (delay > 0) {
        // Show a typing indicator first? For now, we just delay insertion.
        setTimeout(() => {
            messagesContainer.appendChild(bubble);
            requestAnimationFrame(() => {
                bubble.classList.remove('hidden');
                bubble.classList.add('slide-up-fade');
                scrollToBottom();
            });
        }, delay);
    } else {
        messagesContainer.appendChild(bubble);
        requestAnimationFrame(() => {
            bubble.classList.remove('hidden');
            bubble.classList.add('slide-up-fade');
            scrollToBottom();
        });
    }
}

function scrollToBottom() {
    if (messagesContainer) {
        messagesContainer.scrollTo({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
        });
    }
}

// --- Event Handlers from Tabs ---

/**
 * Called when a tab changes
 */
export function handleTabSwitch(tabId) {
    currentTabId = tabId;
    const tabIntroMsgs = {
        'typical-paths': "Let's look at typical funding sequences. Notice anything surprising compared to your assumptions?",
        'path-simulator': "Here you can build your own path step-by-step. Let's see how your planned timeline holds up.",
        'key-investors': "Let's find the right investors. What criteria are most important for your lead investor right now?",
        'intl-capital': "International capital requires a strong foundation. Let's toggle your instruments and test your probability."
    };

    // Only post intro if they haven't been on this tab recently
    postCoachMessage(tabIntroMsgs[tabId] || "Ready when you are.", 800);
}

/**
 * Called from Typical Paths tab when a path is selected
 */
export function handlePathSelection(pathString, seriesARate) {
    // Example pathString: "Grant → Pre-Seed → Seed"
    const msg = `
    You chose the path <strong>${pathString}</strong>.<br/><br/>
    This sequence is often used to extend runway non-dilutively early on. It has a Series A conversion rate of ~${seriesARate}%.<br/>
    <br/>
    <strong>Question:</strong> How realistic is that timeline for you given your current customer traction? Are you moving fast enough to hit those subsequent milestones?
  `;
    postCoachMessage(msg, 600);
}

/**
 * Called from Path Simulator when an instrument is added
 */
export function handleSimulatorStepAdded(instrumentName, currentStepNum, cumulativeMonths) {
    let msg = `So far you're simulating a path up to <strong>${instrumentName}</strong> (Step ${currentStepNum}) at month ${cumulativeMonths}.`;

    if (cumulativeMonths > 36 && currentStepNum <= 2) {
        msg += `<br/><br/>That's quite a long time for early stages. Does this timing match your product and hiring plans, or is there a risk of losing momentum?`;
    } else if (cumulativeMonths < 12 && currentStepNum >= 3) {
        msg += `<br/><br/><strong>Very fast pacing!</strong> What would need to be true in your sales or product roadmap to keep this highly aggressive velocity realistic?`;
    } else {
        msg += `<br/><br/>Based on this trajectory, what is the single most important metric you need to de-risk before the next round?`;
    }

    postCoachMessage(msg, 500);
}

/**
 * Called from Key Investors when a card is clicked
 */
export function handleInvestorSelection(investorName, investorStage, rank) {
    const msg = `
    You clicked on <strong>${investorName}</strong> as a top ${investorStage} partner.<br/><br/>
    They typically look for strong early signs of product-market fit and a scalable acquisition model at this stage.<br/><br/>
    <strong>Preparation:</strong> Which milestone would you need to hit in the next 3–6 months to be credible to them? Do you have evidence that fits their portfolio pattern?
  `;
    postCoachMessage(msg, 400);
}

/**
 * Called from International Capital when probability changes
 */
export function handleProbabilityChange(probability, activeInstrumentsList, monthsCount) {
    const instrStr = activeInstrumentsList.length > 0 ? activeInstrumentsList.join(' + ') : 'no active instruments';

    let sentiment = '';
    if (probability > 70) {
        sentiment = "That's a very strong signal for international funds.";
    } else if (probability < 30) {
        sentiment = "The likelihood is quite low in this configuration.";
    } else {
        sentiment = "You're in the middle of the pack.";
    }

    const msg = `
    You're simulating a scenario with <strong>${instrStr}</strong> at month ${monthsCount}.<br/><br/>
    The model estimates a <strong>${probability}% likelihood</strong> of attracting international capital. ${sentiment}<br/><br/>
    If you wanted to push this into the 'high likelihood' zone, which instrument or timeline adjustment would be most realistic for your actual plan?
  `;
    postCoachMessage(msg, 500);
}

/**
 * Expose a function to update user context from UI (like filter dropdowns)
 */
export function updateContext(key, value) {
    userContext[key] = value;
    console.log('AI Expert Context updated:', userContext);
}
