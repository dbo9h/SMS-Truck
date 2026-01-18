// Pure HTML/JS User App - Works exactly like doggo's trucking calculator

const state = {
    automationActive: false,
    executingActions: false,
    automationLoop: false,
    currentStep: null,
    cache: {
        menu_open: false,
        menu_choices: [],
        prompt: false,
        trigger_dtcdump: null,
        trigger_dtctake: null,
        trigger_dtcexecute: null,
        trigger_dtccustom: null,
        notification: null,
        job: null,
        keybindsEnabled: true
    },
    config: {
        autoDump: true,
        autoTake: true,
        autoCloseMenu: true,
        interactionDelay: 500,
        loopDelay: 2000,
        storageCoords: null,
        quarryCoords: null
    }
};

const NUI_RETRIES = 300;
const NUI_TIMEOUT = 10;
const NUI_EXTRA_DELAY = 10;

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    setupEventListeners();
    log("Automation app loaded", "info");
    window.parent.postMessage({ type: "automationReady" }, "*");
});

function loadSettings() {
    const saved = localStorage.getItem("automation_settings");
    if (saved) {
        try {
            const loaded = JSON.parse(saved);
            Object.assign(state.config, loaded);
            if (loaded.storageCoords && typeof loaded.storageCoords === 'object') {
                state.config.storageCoords = loaded.storageCoords;
            }
            if (loaded.quarryCoords && typeof loaded.quarryCoords === 'object') {
                state.config.quarryCoords = loaded.quarryCoords;
            }
            updateUI();
        } catch (e) {
            console.error("Failed to load settings:", e);
        }
    }
}

function saveSettings() {
    localStorage.setItem("automation_settings", JSON.stringify(state.config));
}

function updateUI() {
    document.getElementById("autoDump").checked = state.config.autoDump;
    document.getElementById("autoTake").checked = state.config.autoTake;
    document.getElementById("autoCloseMenu").checked = state.config.autoCloseMenu;
    document.getElementById("interactionDelay").value = state.config.interactionDelay;
    if (document.getElementById("loopDelay")) {
        document.getElementById("loopDelay").value = state.config.loopDelay;
    }
    updateCoordsDisplay();
}

function updateCoordsDisplay() {
    const info = document.getElementById("coordsInfo");
    if (info) {
        const storage = state.config.storageCoords 
            ? `${state.config.storageCoords.x}, ${state.config.storageCoords.y}, ${state.config.storageCoords.z}`
            : "Not set";
        const quarry = state.config.quarryCoords
            ? `${state.config.quarryCoords.x}, ${state.config.quarryCoords.y}, ${state.config.quarryCoords.z}`
            : "Not set";
        info.innerHTML = `Storage: ${storage}<br>Quarry: ${quarry}`;
    }
}

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
    
    const loopDelayEl = document.getElementById("loopDelay");
    if (loopDelayEl) {
        loopDelayEl.addEventListener("input", (e) => {
            state.config.loopDelay = parseInt(e.target.value);
            saveSettings();
        });
    }
}

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

function toggleAutomation() {
    state.automationActive = !state.automationActive;
    
    const statusEl = document.getElementById("automationStatus");
    if (state.automationActive) {
        statusEl.textContent = "Stop Automation";
        statusEl.parentElement.classList.add("active");
        log("Automation started", "info");
        
        if (state.config.storageCoords && state.config.quarryCoords) {
            startAutomationLoop();
        } else {
            log("Set storage and quarry coordinates first!", "warn");
        }
    } else {
        statusEl.textContent = "Start Automation";
        statusEl.parentElement.classList.remove("active");
        state.automationLoop = false;
        log("Automation stopped", "info");
    }
}

async function startAutomationLoop() {
    if (state.automationLoop) return;
    
    state.automationLoop = true;
    log("Starting automation loop...", "info");
    
    while (state.automationLoop && state.automationActive) {
        try {
            state.currentStep = "moving_to_storage";
            log("Moving to storage...", "info");
            await moveToLocation(state.config.storageCoords);
            await sleep(state.config.loopDelay);
            
            state.currentStep = "dumping";
            log("Dumping cargo...", "info");
            await executeDump();
            await sleep(state.config.loopDelay);
            
            state.currentStep = "moving_to_quarry";
            log("Moving to quarry...", "info");
            await moveToLocation(state.config.quarryCoords);
            await sleep(state.config.loopDelay);
            
            state.currentStep = "collecting";
            log("Collecting items...", "info");
            await executeTake();
            await sleep(state.config.loopDelay);
            
            log("Loop completed, starting again...", "success");
            await sleep(state.config.loopDelay);
            
        } catch (error) {
            log(`Loop error: ${error}`, "error");
            await sleep(state.config.loopDelay * 2);
        }
    }
    
    state.currentStep = null;
}

async function moveToLocation(coords) {
    if (!coords || !coords.x || !coords.y || !coords.z) {
        throw new Error("Invalid coordinates");
    }
    
    window.parent.postMessage({
        type: "moveToLocation",
        coords: { x: coords.x, y: coords.y, z: coords.z }
    }, "*");
    
    await sleep(5000);
}

function setStorageCoords() {
    const input = prompt("Enter Storage coordinates (format: x,y,z):\nExample: 100.0,200.0,30.0");
    if (!input) return;
    
    const parts = input.split(",").map(s => parseFloat(s.trim()));
    if (parts.length === 3 && !parts.some(isNaN)) {
        state.config.storageCoords = { x: parts[0], y: parts[1], z: parts[2] };
        saveSettings();
        updateCoordsDisplay();
        log(`Storage coordinates set: ${parts[0]}, ${parts[1]}, ${parts[2]}`, "success");
    } else {
        log("Invalid coordinates format. Use: x,y,z", "error");
    }
}

function setQuarryCoords() {
    const input = prompt("Enter Quarry coordinates (format: x,y,z):\nExample: 200.0,300.0,30.0");
    if (!input) return;
    
    const parts = input.split(",").map(s => parseFloat(s.trim()));
    if (parts.length === 3 && !parts.some(isNaN)) {
        state.config.quarryCoords = { x: parts[0], y: parts[1], z: parts[2] };
        saveSettings();
        updateCoordsDisplay();
        log(`Quarry coordinates set: ${parts[0]}, ${parts[1]}, ${parts[2]}`, "success");
    } else {
        log("Invalid coordinates format. Use: x,y,z", "error");
    }
}

function clearLog() {
    document.getElementById("logContent").innerHTML = "";
}

window.addEventListener("message", (event) => {
    const data = event.data;
    
    if (!data || Object.keys(data).length === 0) return;
    
    try {
        if (state.cache.keybindsEnabled && state.cache.job === "trucker" && state.automationActive) {
            if (data.trigger_dtcexecute != null && data.trigger_dtcexecute !== state.cache.trigger_dtcexecute) {
                console.log(`nuiExecute: ${data.trigger_dtcexecute} ${typeof data.trigger_dtcexecute} ${state.cache.trigger_dtcexecute} ${typeof state.cache.trigger_dtcexecute}`);
                state.cache.trigger_dtcexecute = data.trigger_dtcexecute;
            } else if (data.trigger_dtcdump != null && data.trigger_dtcdump !== state.cache.trigger_dtcdump) {
                console.log(`nuiDump: ${data.trigger_dtcdump} ${typeof data.trigger_dtcdump} ${state.cache.trigger_dtcdump} ${typeof state.cache.trigger_dtcdump}`);
                state.cache.trigger_dtcdump = data.trigger_dtcdump;
                if (state.config.autoDump) {
                    executeDump();
                }
            } else if (data.trigger_dtctake != null && data.trigger_dtctake !== state.cache.trigger_dtctake) {
                console.log(`nuiTake: ${data.trigger_dtctake} ${typeof data.trigger_dtctake} ${state.cache.trigger_dtctake} ${typeof state.cache.trigger_dtctake}`);
                state.cache.trigger_dtctake = data.trigger_dtctake;
                if (state.config.autoTake) {
                    executeTake();
                }
            } else if (data.trigger_dtccustom != null && data.trigger_dtccustom !== state.cache.trigger_dtccustom) {
                console.log(`nuiCustom: ${data.trigger_dtccustom} ${typeof data.trigger_dtccustom} ${state.cache.trigger_dtccustom} ${typeof state.cache.trigger_dtccustom}`);
                state.cache.trigger_dtccustom = data.trigger_dtccustom;
            }
        }
        
        for (let [key, value] of Object.entries(data)) {
            if (key === "menu_choices") {
                state.cache[key] = typeof value === "string" ? JSON.parse(value || "[]") : (value || []);
            } else {
                state.cache[key] = value;
            }
        }
        
        updateStatusDisplay();
        
    } catch (error) {
        console.error("Error handling message:", error);
    }
});

function updateStatusDisplay() {
    const menuStatus = document.getElementById("menuStatus");
    const executingStatus = document.getElementById("executingStatus");
    const lastAction = document.getElementById("lastAction");
    
    if (menuStatus) menuStatus.textContent = state.cache.menu_open ? "Yes" : "No";
    if (executingStatus) executingStatus.textContent = state.executingActions ? "Yes" : "No";
    
    if (lastAction && state.currentStep) {
        const stepNames = {
            "moving_to_storage": "Moving to Storage",
            "dumping": "Dumping",
            "moving_to_quarry": "Moving to Quarry",
            "collecting": "Collecting"
        };
        lastAction.textContent = stepNames[state.currentStep] || "None";
    }
}

async function executeDump() {
    if (state.executingActions) {
        log("Already executing actions, skipping dump...", "warn");
        return false;
    }
    
    console.log("Executing NUI dump...");
    document.getElementById("lastAction").textContent = "Dump";
    
    try {
        state.executingActions = true;
        const dumpActions = buildDumpActions();
        
        if (!dumpActions || dumpActions.length === 0) {
            log("No valid actions to execute", "error");
            return false;
        }
        
        const success = await executeActions(dumpActions, true);
        
        if (success) {
            log("Successfully executed dump actions", "success");
            return true;
        } else {
            log("Dump actions failed", "error");
            return false;
        }
    } catch (error) {
        log(`Error in dump: ${error?.message || error}`, "error");
        console.error("Error in executeDump:", error);
        return false;
    } finally {
        state.executingActions = false;
    }
}

function buildDumpActions() {
    const dumpPaths = [
        [{ action: "Dump from Trunk", mod: 0 }],
        [{ action: "Dump Cargo", mod: 0 }],
        [{ action: "Empty Trunk", mod: 0 }],
        [{ action: "Dump", mod: 0 }]
    ];
    
    for (const path of dumpPaths) {
        if (hasMenuOption(path[0].action)) {
            return [{ actions: path, amount: 0 }];
        }
    }
    
    return [];
}

async function executeTake() {
    if (state.executingActions) {
        log("Already executing actions, skipping take...", "warn");
        return false;
    }
    
    console.log("Executing NUI take...");
    document.getElementById("lastAction").textContent = "Take";
    
    try {
        state.executingActions = true;
        const takeActions = buildTakeActions();
        
        if (!takeActions || takeActions.length === 0) {
            log("No valid actions to execute", "error");
            return false;
        }
        
        const success = await executeActions(takeActions, true);
        
        if (success) {
            log("Successfully executed take actions", "success");
            return true;
        } else {
            log("Take actions failed", "error");
            return false;
        }
    } catch (error) {
        log(`Error in take: ${error?.message || error}`, "error");
        console.error("Error in executeTake:", error);
        return false;
    } finally {
        state.executingActions = false;
    }
}

function buildTakeActions() {
    const takePaths = [
        [{ action: "Take to Trunk", mod: 0 }],
        [{ action: "Take", mod: 0 }],
        [{ action: "Load to Trunk", mod: 0 }],
        [{ action: "Store in Trunk", mod: 0 }]
    ];
    
    for (const path of takePaths) {
        if (hasMenuOption(path[0].action)) {
            return [{ actions: path, amount: 0 }];
        }
    }
    
    return [];
}

async function executeActions(actions, closeMenu = true) {
    try {
        if (state.executingActions && !closeMenu) {
            throw new Error("Already executing NUI actions");
        }
        
        state.executingActions = true;
        
        for (const actionSet of actions) {
            for (const action of actionSet.actions) {
                await waitFor(() => {
                    return state.cache.menu_open && 
                           (state.cache.menu_choices ?? []).findIndex(choice => {
                               if (!choice || !choice[0]) return false;
                               const cleanText = choice[0].replace(/(<.+?>)|(&#.+?;)/g, "");
                               return cleanText === action.action;
                           }) !== -1;
                }, NUI_RETRIES, NUI_TIMEOUT);
                
                const menuChoice = state.cache.menu_choices.find(choice => {
                    if (!choice || !choice[0]) return false;
                    const cleanText = choice[0].replace(/(<.+?>)|(&#.+?;)/g, "");
                    return cleanText === action.action;
                });
                
                if (menuChoice) {
                    await selectMenuOption(menuChoice[0], action.mod || 0);
                }
            }
            
            if (actionSet.amount > 0) {
                await waitFor(() => state.cache.prompt === true, NUI_RETRIES, NUI_TIMEOUT);
                await submitValue(actionSet.amount);
            }
            
            await sleep(NUI_EXTRA_DELAY);
            
            if (closeMenu && state.cache.menu_open) {
                await closeMenu();
            }
        }
        
        await sleep(NUI_TIMEOUT);
        if (closeMenu && state.cache.menu_open) {
            await closeMenu();
        }
        
        return true;
    } catch (error) {
        log(`Error in executeActions: ${error?.message || error}`, "error");
        console.error("Error in executeActions:", error);
        return false;
    } finally {
        state.executingActions = false;
    }
}

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

function hasMenuOption(text) {
    if (!state.cache.menu_choices || !Array.isArray(state.cache.menu_choices)) {
        return false;
    }
    
    return state.cache.menu_choices.some(choice => {
        if (!choice || !choice[0]) return false;
        const cleanText = choice[0].replace(/(<.+?>)|(&#.+?;)/g, "");
        return cleanText === text;
    });
}

async function selectMenuOption(choice, mod = 0) {
    const menuChoice = state.cache.menu_choices.find(c => {
        if (!c || !c[0]) return false;
        const cleanText = c[0].replace(/(<.+?>)|(&#.+?;)/g, "");
        return cleanText === choice;
    });
    
    if (!menuChoice) {
        throw new Error(`Menu option "${choice}" not found`);
    }
    
    window.parent.postMessage({
        type: "forceMenuChoice",
        choice: menuChoice[0],
        mod: mod || 0
    }, "*");
    
    await sleep(NUI_EXTRA_DELAY);
}

async function submitValue(value) {
    window.parent.postMessage({
        type: "forceSubmitValue",
        value: value.toString()
    }, "*");
    
    await sleep(NUI_EXTRA_DELAY);
}

async function closeMenu() {
    if (state.executingActions) {
        window.parent.postMessage({
            type: "forceMenuBack"
        }, "*");
        await sleep(NUI_EXTRA_DELAY);
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function log(message, type = "info") {
    const logContent = document.getElementById("logContent");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    logContent.insertBefore(entry, logContent.firstChild);
    
    while (logContent.children.length > 100) {
        logContent.removeChild(logContent.lastChild);
    }
    
    window.parent.postMessage({
        type: "notification",
        text: `~b~[Automation]~w~ ${message}`
    }, "*");
}

window.toggleAutomation = toggleAutomation;
window.clearLog = clearLog;
window.toggleSubmenu = toggleSubmenu;
window.setStorageCoords = setStorageCoords;
window.setQuarryCoords = setQuarryCoords;
