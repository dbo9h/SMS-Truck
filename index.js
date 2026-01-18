// Pure HTML/JS User App - No Lua Required
// Works like doggo's trucking calculator

const state = {
    automationActive: false,
    executingActions: false,
    cache: {
        menu_open: false,
        menu_choices: [],
        prompt: false,
        trigger_dtcdump: null,
        trigger_dtctake: null,
        notification: null
    },
    config: {
        autoDump: true,
        autoTake: false,
        autoCloseMenu: true,
        interactionDelay: 500
    },
    lastDumpTrigger: null,
    lastTakeTrigger: null
};

// Constants
const NUI_RETRIES = 50;
const NUI_TIMEOUT = 100;
const NUI_EXTRA_DELAY = 200;

// Initialize
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    setupEventListeners();
    log("Automation app loaded", "info");
    
    // Notify parent we're ready
    window.parent.postMessage({
        type: "automationReady"
    }, "*");
});

// Load settings from localStorage
function loadSettings() {
    const saved = localStorage.getItem("automation_settings");
    if (saved) {
        try {
            Object.assign(state.config, JSON.parse(saved));
            updateUI();
        } catch (e) {
            console.error("Failed to load settings:", e);
        }
    }
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem("automation_settings", JSON.stringify(state.config));
}

// Update UI from state
function updateUI() {
    document.getElementById("autoDump").checked = state.config.autoDump;
    document.getElementById("autoTake").checked = state.config.autoTake;
    document.getElementById("autoCloseMenu").checked = state.config.autoCloseMenu;
    document.getElementById("interactionDelay").value = state.config.interactionDelay;
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById("autoDump").addEventListener("change", (e) => {
        state.config.autoDump = e.target.checked;
        saveSettings();
    });
    
    document.getElementById("autoTake").addEventListener("change", (e) => {
        state.config.autoTake = e.target.checked;
        saveSettings();
    });
    
    document.getElementById("autoCloseMenu").addEventListener("change", (e) => {
        state.config.autoCloseMenu = e.target.checked;
        saveSettings();
    });
    
    document.getElementById("interactionDelay").addEventListener("input", (e) => {
        state.config.interactionDelay = parseInt(e.target.value);
        saveSettings();
    });
}

// Toggle submenu
function toggleSubmenu(header) {
    const content = header.nextElementSibling;
    const toggle = header.querySelector(".submenu-toggle");
    
    if (content.classList.contains("collapsed")) {
        content.classList.remove("collapsed");
        toggle.textContent = "▼";
    } else {
        content.classList.add("collapsed");
        toggle.textContent = "▶";
    }
}

// Toggle automation
function toggleAutomation() {
    state.automationActive = !state.automationActive;
    
    const statusEl = document.getElementById("automationStatus");
    if (state.automationActive) {
        statusEl.textContent = "Stop Automation";
        statusEl.parentElement.classList.add("active");
        log("Automation started", "info");
    } else {
        statusEl.textContent = "Start Automation";
        statusEl.parentElement.classList.remove("active");
        log("Automation stopped", "info");
    }
}

// Clear log
function clearLog() {
    document.getElementById("logContent").innerHTML = "";
}

// Listen for messages from game client
window.addEventListener("message", (event) => {
    const data = event.data;
    
    if (!data || Object.keys(data).length === 0) return;
    
    try {
        // Update cache
        if (data.menu_choices !== undefined) {
            state.cache.menu_choices = typeof data.menu_choices === "string" 
                ? JSON.parse(data.menu_choices || "[]") 
                : (data.menu_choices || []);
        }
        if (data.menu_open !== undefined) state.cache.menu_open = data.menu_open;
        if (data.prompt !== undefined) state.cache.prompt = data.prompt;
        if (data.notification !== undefined) state.cache.notification = data.notification;
        
        // Update status display
        updateStatusDisplay();
        
        // Handle triggers (like doggo's app)
        if (state.automationActive) {
            if (data.trigger_dtcdump != null && data.trigger_dtcdump !== state.lastDumpTrigger) {
                console.log(`nuiDump: ${data.trigger_dtcdump} ${typeof data.trigger_dtcdump} ${state.lastDumpTrigger} ${typeof state.lastDumpTrigger}`);
                state.lastDumpTrigger = data.trigger_dtcdump;
                if (state.config.autoDump) {
                    executeDump();
                }
            }
            
            if (data.trigger_dtctake != null && data.trigger_dtctake !== state.lastTakeTrigger) {
                console.log(`nuiTake: ${data.trigger_dtctake} ${typeof data.trigger_dtctake} ${state.lastTakeTrigger} ${typeof state.lastTakeTrigger}`);
                state.lastTakeTrigger = data.trigger_dtctake;
                if (state.config.autoTake) {
                    executeTake();
                }
            }
        }
        
        // Store all cache values
        for (let [key, value] of Object.entries(data)) {
            if (key === "menu_choices") {
                state.cache[key] = typeof value === "string" ? JSON.parse(value || "[]") : (value || []);
            } else {
                state.cache[key] = value;
            }
        }
    } catch (error) {
        console.error("Error handling message:", error);
    }
});

// Update status display
function updateStatusDisplay() {
    document.getElementById("menuStatus").textContent = state.cache.menu_open ? "Yes" : "No";
    document.getElementById("executingStatus").textContent = state.executingActions ? "Yes" : "No";
}

// Execute dump action (like doggo's Fe function)
async function executeDump() {
    if (state.executingActions) {
        log("Already executing actions, skipping dump...", "warn");
        return;
    }
    
    log("Executing dump action...", "info");
    document.getElementById("lastAction").textContent = "Dump";
    
    try {
        state.executingActions = true;
        
        // Wait for menu to open
        await waitFor(() => state.cache.menu_open, NUI_RETRIES, NUI_TIMEOUT);
        
        // Find dump option (common names)
        const dumpOptions = ["Dump Cargo", "Dump", "Empty Trunk", "Dump Items"];
        let dumpOption = null;
        
        for (const option of dumpOptions) {
            if (hasMenuOption(option)) {
                dumpOption = option;
                break;
            }
        }
        
        if (!dumpOption) {
            log("Dump option not found in menu", "error");
            return;
        }
        
        // Select dump option
        await selectMenuOption(dumpOption, 0);
        
        // Wait for prompt if needed
        if (state.cache.prompt) {
            await waitFor(() => state.cache.prompt, NUI_RETRIES, NUI_TIMEOUT);
            await submitValue(999999); // Max amount
        }
        
        // Close menu if configured
        if (state.config.autoCloseMenu && state.cache.menu_open) {
            await sleep(NUI_EXTRA_DELAY);
            await closeMenu();
        }
        
        log("Dump action completed", "success");
    } catch (error) {
        log(`Dump action failed: ${error}`, "error");
    } finally {
        state.executingActions = false;
    }
}

// Execute take action (like doggo's Ve function)
async function executeTake() {
    if (state.executingActions) {
        log("Already executing actions, skipping take...", "warn");
        return;
    }
    
    log("Executing take action...", "info");
    document.getElementById("lastAction").textContent = "Take";
    
    try {
        state.executingActions = true;
        
        // Wait for menu to open
        await waitFor(() => state.cache.menu_open, NUI_RETRIES, NUI_TIMEOUT);
        
        // Find take option (common names)
        const takeOptions = ["Take to Trunk", "Take", "Load to Trunk", "Store in Trunk"];
        let takeOption = null;
        
        for (const option of takeOptions) {
            if (hasMenuOption(option)) {
                takeOption = option;
                break;
            }
        }
        
        if (!takeOption) {
            log("Take option not found in menu", "error");
            return;
        }
        
        // Select take option
        await selectMenuOption(takeOption, 0);
        
        // Wait for prompt if needed
        if (state.cache.prompt) {
            await waitFor(() => state.cache.prompt, NUI_RETRIES, NUI_TIMEOUT);
            await submitValue(999999); // Max amount
        }
        
        // Close menu if configured
        if (state.config.autoCloseMenu && state.cache.menu_open) {
            await sleep(NUI_EXTRA_DELAY);
            await closeMenu();
        }
        
        log("Take action completed", "success");
    } catch (error) {
        log(`Take action failed: ${error}`, "error");
    } finally {
        state.executingActions = false;
    }
}

// Wait for condition (like doggo's Ue function)
function waitFor(condition, retries = NUI_RETRIES, timeout = NUI_TIMEOUT) {
    return new Promise((resolve, reject) => {
        let attempts = 0;
        const check = setInterval(() => {
            attempts++;
            if (condition()) {
                clearInterval(check);
                setTimeout(() => resolve(true), NUI_EXTRA_DELAY);
            } else if (attempts >= retries) {
                clearInterval(check);
                reject("Timeout waiting for condition");
            }
        }, timeout);
    });
}

// Check if menu has option (like doggo's menu matching)
function hasMenuOption(text) {
    if (!state.cache.menu_choices || !Array.isArray(state.cache.menu_choices)) {
        return false;
    }
    
    return state.cache.menu_choices.some(choice => {
        if (!choice || !choice[0]) return false;
        // Strip HTML tags and entities (like doggo does)
        const cleanText = choice[0].replace(/(<.+?>)|(&#.+?;)/g, "");
        return cleanText === text;
    });
}

// Select menu option (like doggo's Nr function)
async function selectMenuOption(choice, mod = 0) {
    // Find the exact menu choice
    const menuChoice = state.cache.menu_choices.find(c => {
        if (!c || !c[0]) return false;
        const cleanText = c[0].replace(/(<.+?>)|(&#.+?;)/g, "");
        return cleanText === choice;
    });
    
    if (!menuChoice) {
        throw new Error(`Menu option "${choice}" not found`);
    }
    
    // Send menu choice (like doggo's forceMenuChoice)
    window.parent.postMessage({
        type: "forceMenuChoice",
        choice: menuChoice[0],
        mod: mod || 0
    }, "*");
    
    await sleep(NUI_EXTRA_DELAY);
}

// Submit value (like doggo's _r function)
async function submitValue(value) {
    window.parent.postMessage({
        type: "forceSubmitValue",
        value: value.toString()
    }, "*");
    
    await sleep(NUI_EXTRA_DELAY);
}

// Close menu (like doggo's q function)
async function closeMenu() {
    if (state.executingActions) {
        window.parent.postMessage({
            type: "forceMenuBack"
        }, "*");
        await sleep(NUI_EXTRA_DELAY);
    }
}

// Sleep helper
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Log message (like doggo's E function but for console)
function log(message, type = "info") {
    const logContent = document.getElementById("logContent");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.insertBefore(entry, logContent.firstChild);
    
    // Keep only last 100 entries
    while (logContent.children.length > 100) {
        logContent.removeChild(logContent.lastChild);
    }
    
    // Also send notification to game (like doggo)
    window.parent.postMessage({
        type: "notification",
        text: `~b~[Automation]~w~ ${message}`
    }, "*");
}

// Make functions available globally (like doggo does)
window.toggleAutomation = toggleAutomation;
window.clearLog = clearLog;
window.toggleSubmenu = toggleSubmenu;
