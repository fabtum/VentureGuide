/**
 * Local AI Incubator Expert (Jessica) logic.
 * Reacts to UI events contextually based on the Antigravity System Prompt.
 * Now supports minimized mode with floating avatar and speech bubble notifications.
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
let isPanelOpen = false;

// --- Gemini API ---
<<<<<<< HEAD
const GEMINI_API_KEY = 'xxx';
=======
const GEMINI_API_KEY = 'xyz';
>>>>>>> 5760d56 (Refactor intl-capital: Rounded tabs, scrollable investor lists, dynamic titles, layout fixes)
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

// Keep conversation history for contextual replies
const chatHistory = [];
const MAX_HISTORY = 20;
const SYSTEM_PROMPT = `You are Jessica, an experienced AI Incubator Expert and startup funding coach. You dont have to introduce yourself.

Style rules:
- Keep replies SHORT and engaging — max 2-4 sentences + bullet points if needed.
- Use emojis naturally to keep the tone warm and energetic 🚀💡🎯
- Use bullet points for lists instead of long paragraphs.
- End each reply with exactly ONE targeted follow-up question to learn more about the user.
- Respond in the same language the user writes in (German, English, etc.).
- Be warm, encouraging, and feel like a trusted mentor — not a generic chatbot.

Tab navigation — guide the user immediately to the right tool when a user texts something similar:
- When they want to see how peers got funded or compare paths or unsure about financing types/stages or want to plan their path→ suggest "Check out the **Most Common Paths** tab! 📊 or Try the **Funding Type Distribution** tab! 🛤️"
- When they want to find investors or have questions about investors → suggest "Head over to the **Typical Investors** tab! 🔍"
- When they ask about international or cross-border funding → suggest "Take a look at the **International Capital** tab! 🌍

Content rules:
- Provide actionable, well-founded advice on startup funding, venture capital, grants/accelerators, and fundraising strategy.
- ALL insights and paths in this webapp are based on a dataset covering funding events between January 2020 and December 2025.
- ONLY rely on established, verifiable knowledge. If unsure, say so honestly — never hallucinate or make up data.
- Reference the conversation history to build on previous exchanges and avoid repeating yourself."`;

async function callGeminiAPI(userMessage) {
    // Add user message to history
    chatHistory.push({ role: 'user', parts: [{ text: userMessage }] });
    // Trim history to last 4 messages
    while (chatHistory.length > MAX_HISTORY) chatHistory.shift();

    const body = {
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: chatHistory,
        generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7,
        }
    };

    const MAX_RETRIES = 3;
    let lastError = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(GEMINI_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            // Handle rate limiting with retry
            if (res.status === 429) {
                const waitMs = Math.pow(2, attempt + 1) * 1000; // 2s, 4s, 8s
                console.warn(`Gemini API rate limited (429). Retrying in ${waitMs}ms... (attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
                continue;
            }

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                console.error(`Gemini API HTTP ${res.status}:`, errData);
                lastError = `HTTP ${res.status}`;
                continue;
            }

            const data = await res.json();
            console.log('Gemini API response:', data);
            const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!reply) {
                console.warn('Gemini API: no text in response', data);
                return "I couldn't generate a response. Could you rephrase your question?";
            }
            // Add AI reply to history
            chatHistory.push({ role: 'model', parts: [{ text: reply }] });
            while (chatHistory.length > MAX_HISTORY) chatHistory.shift();
            return reply;
        } catch (err) {
            console.error('Gemini API fetch error:', err);
            lastError = err.message;
        }
    }

    return `I'm currently experiencing high demand. Please wait a moment and try again. (${lastError || 'rate limited'})`;
}

/**
 * Convert basic Markdown from Gemini responses to HTML.
 * Handles **bold**, *italic*, bullet lists, and newlines.
 */
function formatMarkdown(text) {
    if (!text) return text;
    let html = text;
    // Bold: **text** → <strong>text</strong>
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Italic: *text* → <em>text</em>  (but not inside <strong>)
    html = html.replace(/(?<!<\/?\w)\*(.+?)\*/g, '<em>$1</em>');
    // Bullet lists: lines starting with - or •
    html = html.replace(/^\s*[-•]\s+(.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/gs, '<ul>$1</ul>');
    // Clean up nested <ul> tags from multiple replacements
    html = html.replace(/<\/ul>\s*<ul>/g, '');
    // Newlines → <br/>
    html = html.replace(/\n/g, '<br/>');
    return html;
}

function postUserMessage(text) {
    if (!messagesContainer) return;
    const bubble = document.createElement('div');
    bubble.className = 'coach-bubble user-bubble';
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    bubble.innerHTML = `
    <div class="user-bubble-content">
      <div class="user-bubble-text">
        <p>${text}</p>
        <span class="bubble-time">${timeString}</span>
      </div>
    </div>
  `;
    messagesContainer.appendChild(bubble);
    requestAnimationFrame(() => {
        bubble.classList.add('slide-up-fade');
        scrollToBottom();
    });
}

function showTypingIndicator() {
    if (!messagesContainer) return null;
    const indicator = document.createElement('div');
    indicator.className = 'coach-bubble ai-bubble typing-indicator';
    indicator.innerHTML = `
    <div class="ai-bubble-content">
      <img src="/jessica-avatar.png" class="ai-avatar" alt="Jessica" />
      <div class="ai-bubble-text">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>
  `;
    messagesContainer.appendChild(indicator);
    scrollToBottom();
    return indicator;
}

async function handleUserInput(text) {
    if (!text.trim()) return;
    postUserMessage(text);
    const indicator = showTypingIndicator();
    const reply = await callGeminiAPI(text);
    if (indicator) indicator.remove();
    postCoachMessage(formatMarkdown(reply), 0);
}

// --- Coach Panel Toggle ---
function openPanel() {
    isPanelOpen = true;
    document.body.classList.add('coach-open');
    const panel = document.getElementById('coach-panel-aside');
    if (panel) {
        panel.classList.add('open');
        // Re-trigger animation
        panel.style.animation = 'none';
        panel.offsetHeight; // force reflow
        panel.style.animation = '';
    }
    // Hide speech bubble when panel is open
    const bubble = document.getElementById('coach-speech-bubble');
    if (bubble) bubble.classList.add('hidden');
    // Scroll to bottom of messages
    scrollToBottom();
}

function closePanel() {
    isPanelOpen = false;
    document.body.classList.remove('coach-open');
    const panel = document.getElementById('coach-panel-aside');
    if (panel) panel.classList.remove('open');
}

function togglePanel() {
    if (isPanelOpen) closePanel();
    else openPanel();
}

// --- Speech Bubble ---
export function showSpeechBubble(text) {
    if (isPanelOpen) return; // Don't show bubble if panel is open
    const bubble = document.getElementById('coach-speech-bubble');
    const textEl = document.getElementById('coach-speech-text');
    if (!bubble || !textEl) return;

    // Render HTML directly instead of stripping it so bold tags and breaks show up
    textEl.innerHTML = text;

    bubble.classList.remove('hidden');
    // Re-trigger animation
    bubble.style.animation = 'none';
    bubble.offsetHeight; // force reflow
    bubble.style.animation = '';

    // Auto-hide after 8 seconds
    if (showSpeechBubble._timer) clearTimeout(showSpeechBubble._timer);
    showSpeechBubble._timer = setTimeout(() => hideSpeechBubble(), 8000);
}

function hideSpeechBubble() {
    const bubble = document.getElementById('coach-speech-bubble');
    if (bubble) bubble.classList.add('hidden');
}

export function initAIExpert() {
    messagesContainer = document.getElementById('coach-messages');

    // --- FAB click → toggle panel ---
    const fab = document.getElementById('coach-fab');
    if (fab) fab.addEventListener('click', () => openPanel());

    // --- Panel close button ---
    const closeBtn = document.getElementById('coach-panel-close');
    if (closeBtn) closeBtn.addEventListener('click', () => closePanel());

    // --- Speech bubble close button ---
    const speechClose = document.getElementById('coach-speech-close');
    if (speechClose) speechClose.addEventListener('click', (e) => {
        e.stopPropagation();
        hideSpeechBubble();
    });

    // --- Click on speech bubble → open panel ---
    const speechBubble = document.getElementById('coach-speech-bubble');
    if (speechBubble) speechBubble.addEventListener('click', () => openPanel());

    // --- Chat input handling ---
    const chatInput = document.getElementById('coach-input');
    const chatSend = document.getElementById('coach-send');

    if (chatInput && chatSend) {
        const submitMessage = () => {
            const text = chatInput.value.trim();
            if (!text) return;
            chatInput.value = '';
            handleUserInput(text);
        };

        chatSend.addEventListener('click', submitMessage);
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                submitMessage();
            }
        });
    }
}

/**
 * Trigger the welcome message after the landing page transition.
 * Called from main.js once the app shell is visible.
 */
export function triggerWelcomeMessage() {
    const welcomeText = "Here's what you can explore:<br/><ul><li>📊 <strong>Typical Paths</strong> — See how peers got funded and filter by Series A paths</li><li>🛤️ <strong>Path Simulator</strong> — Build your own funding journey step by step</li><li>🔍 <strong>Key Investors</strong> — Find the right investors for your stage and ecosystem</li><li>🌍 <strong>International Capital</strong> — Discover what peers did to attract cross-border investment</li></ul><br/>Feel free to ask me anything — I'll point you to the right tab! 🚀<br/><br/><strong>What is your name?</strong>";

    if (!sessionStorage.getItem('expertIntroduced')) {
        postCoachMessage(welcomeText, 800);
        sessionStorage.setItem('expertIntroduced', 'true');
    } else {
        // Message already in chat, just pop the speech bubble
        setTimeout(() => showSpeechBubble(welcomeText), 500);
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
        setTimeout(() => {
            messagesContainer.appendChild(bubble);
            requestAnimationFrame(() => {
                bubble.classList.remove('hidden');
                bubble.classList.add('slide-up-fade');
                scrollToBottom();
            });
            // Show speech bubble notification if panel is closed
            showSpeechBubble(text);
        }, delay);
    } else {
        messagesContainer.appendChild(bubble);
        requestAnimationFrame(() => {
            bubble.classList.remove('hidden');
            bubble.classList.add('slide-up-fade');
            scrollToBottom();
        });
        // Show speech bubble notification if panel is closed
        showSpeechBubble(text);
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
        'typical-paths': "Here you can see the typical funding sequences of your peers and compare different paths towards Series A.",
        'path-simulator': "Here you can build your own funding journey step-by-step and see the total time and peer distribution for your path.",
        'key-investors': "Here you can find and select the most prominent investors for your ecosystem and funding types.",
        'intl-capital': "Here you can see what peers from your ecosystem did to attract international capital."
    };

    // Only post intro if they haven't been on this tab recently
    postCoachMessage(tabIntroMsgs[tabId] || "Ready when you are.", 800);
}

/**
 * Called from Typical Paths tab when a path is selected
 */
export function handlePathSelection(pathString, seriesARate) {
    const msg = `
    You chose the path <strong>${pathString}</strong>.<br/><br/>
    At the bottom you can see the median times of this path.
  `;
    postCoachMessage(msg, 600);
}

/**
 * Called from Path Simulator when a Stage is added
 */
export function handleSimulatorStepAdded(instrumentName, currentStepNum, cumulativeMonths) {
    let msg = `So far you're simulating a path up to <strong>${instrumentName}</strong> (Step ${currentStepNum}) at month ${cumulativeMonths}.`;

    if (cumulativeMonths > 36 && currentStepNum <= 2) {
        msg += `<br/><br/>That's quite a long time for early stages. At the bottom you can see the total time for this path and exactly how many peers in your ecosystem chose this path.`;
    } else if (cumulativeMonths < 12 && currentStepNum >= 3) {
        msg += `<br/><br/><strong>Very fast pacing!</strong> At the bottom you can see the total time for this path and exactly how many peers in your ecosystem chose this path.`;
    } else {
        msg += `<br/><br/>At the bottom you can see the total time for this path and exactly how many peers in your ecosystem chose this path.`;
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
    <strong>Details:</strong> At the bottom you can see the median time until this funding in your ecosystem.
  `;
    postCoachMessage(msg, 400);
}

/**
 * Called from International Capital when probability changes
 */
export function handleProbabilityChange(probability, activeInstrumentsList, monthsCount) {
    const instrStr = activeInstrumentsList.length > 0 ? activeInstrumentsList.join(' + ') : 'no active stages';

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
    Adjust your stages or timeline to see how it impacts your probability.
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
