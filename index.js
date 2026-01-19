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
        keybindsEnabled: true,
        playerCoords: null
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

let getDataRequestCount = 0;
let lastMessageTime = null;
let getDataInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    setupEventListeners();
    log("Automation app loaded", "info");

    // Request data from game client (critical for receiving pos_x, pos_y, pos_z)
    function requestGameData() {
        console.log("[DEBUG] Sending getData request #" + (++getDataRequestCount));
        window.parent.postMessage({ type: "getData" }, "*");
        log(`getData request sent (#${getDataRequestCount})`, "info");
    }

    setTimeout(() => {
        requestGameData();

        // Register triggers for automation
        console.log("[DEBUG] Registering triggers");
        window.parent.postMessage({
            type: "registerTrigger",
            trigger: "dtcdump",
            name: "Auto Dump"
        }, "*");

        window.parent.postMessage({
            type: "registerTrigger",
            trigger: "dtctake",
            name: "Auto Take"
        }, "*");

        log("Triggers registered", "info");

        // Send getData periodically every 5 seconds to ensure we get data
        getDataInterval = setInterval(() => {
            if (!state.cache.playerCoords) {
                console.log("[DEBUG] Still no coordinates, requesting again...");
                requestGameData();
            }
        }, 5000);
    }, 250);
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

    // Update input fields
    if (state.config.storageCoords) {
        document.getElementById("storageX").value = state.config.storageCoords.x || "";
        document.getElementById("storageY").value = state.config.storageCoords.y || "";
        document.getElementById("storageZ").value = state.config.storageCoords.z || "";
    }

    if (state.config.quarryCoords) {
        document.getElementById("quarryX").value = state.config.quarryCoords.x || "";
        document.getElementById("quarryY").value = state.config.quarryCoords.y || "";
        document.getElementById("quarryZ").value = state.config.quarryCoords.z || "";
    }
}

// Save coordinates from input fields
function saveCoords() {
    const storageX = parseFloat(document.getElementById("storageX").value);
    const storageY = parseFloat(document.getElementById("storageY").value);
    const storageZ = parseFloat(document.getElementById("storageZ").value);

    const quarryX = parseFloat(document.getElementById("quarryX").value);
    const quarryY = parseFloat(document.getElementById("quarryY").value);
    const quarryZ = parseFloat(document.getElementById("quarryZ").value);

    if (!isNaN(storageX) && !isNaN(storageY) && !isNaN(storageZ)) {
        state.config.storageCoords = { x: storageX, y: storageY, z: storageZ };
        log(`Storage coordinates saved: ${storageX}, ${storageY}, ${storageZ}`, "success");
    }

    if (!isNaN(quarryX) && !isNaN(quarryY) && !isNaN(quarryZ)) {
        state.config.quarryCoords = { x: quarryX, y: quarryY, z: quarryZ };
        log(`Quarry coordinates saved: ${quarryX}, ${quarryY}, ${quarryZ}`, "success");
    }

    saveSettings();
    updateCoordsDisplay();
}

// Get current player location (uses current player coords from cache)
async function getCurrentLocation(type) {
    // Wait for coordinates if not available yet (up to 5 seconds)
    if (!state.cache.playerCoords) {
        log("Waiting for player coordinates...", "info");
        let attempts = 0;
        while (!state.cache.playerCoords && attempts < 50) {
            await sleep(100);
            attempts++;
        }

        if (!state.cache.playerCoords) {
            log("Coordinates not received. The game may not be sending pos_x, pos_y, pos_z data yet.", "error");
            log("Try moving around in-game or check if the app is receiving game data.", "info");
            return;
        }
    }

    const coords = state.cache.playerCoords;

    if (type === "storage") {
        state.config.storageCoords = { x: coords.x, y: coords.y, z: coords.z };
        document.getElementById("storageX").value = coords.x.toFixed(2);
        document.getElementById("storageY").value = coords.y.toFixed(2);
        document.getElementById("storageZ").value = coords.z.toFixed(2);
        saveSettings();
        updateCoordsDisplay();
        log(`Storage coordinates captured: ${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(2)}`, "success");
    } else if (type === "quarry") {
        state.config.quarryCoords = { x: coords.x, y: coords.y, z: coords.z };
        document.getElementById("quarryX").value = coords.x.toFixed(2);
        document.getElementById("quarryY").value = coords.y.toFixed(2);
        document.getElementById("quarryZ").value = coords.z.toFixed(2);
        saveSettings();
        updateCoordsDisplay();
        log(`Quarry coordinates captured: ${coords.x.toFixed(2)}, ${coords.y.toFixed(2)}, ${coords.z.toFixed(2)}`, "success");
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

    // Coordinate input listeners
    ["storageX", "storageY", "storageZ", "quarryX", "quarryY", "quarryZ"].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                saveCoords();
            });
        }
    });
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

// Get distance between two coordinates
function getDistance(coord1, coord2) {
    if (!coord1 || !coord2) return Infinity;
    const dx = coord1.x - coord2.x;
    const dy = coord1.y - coord2.y;
    const dz = coord1.z - coord2.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

async function moveToLocation(coords) {
    if (!coords || !coords.x || !coords.y || !coords.z) {
        throw new Error("Invalid coordinates");
    }

    // Use setWaypoint command (TTycoon API)
    window.parent.postMessage({
        type: "setWaypoint",
        x: coords.x,
        y: coords.y
    }, "*");

    // Wait until player is near destination (within 5 units)
    let attempts = 0;
    while (attempts < 100) {
        await sleep(500);
        if (state.cache.playerCoords) {
            const distance = getDistance(state.cache.playerCoords, coords);
            if (distance < 5) {
                log(`Arrived at destination (distance: ${distance.toFixed(2)})`, "success");
                return;
            }
        }
        attempts++;
    }

    log("Movement timeout - continuing anyway", "warn");
}


function clearLog() {
    document.getElementById("logContent").innerHTML = "";
}

window.addEventListener("message", (event) => {
    // CRITICAL: Data is sent in event.data.data, NOT event.data!
    const evt = event.data;
    const data = evt.data || {};

    if (!data || Object.keys(data).length === 0) return;

    try {
        // Auto-detect player coordinates from game data (pos_x, pos_y, pos_z)
        // Check for pos_x, pos_y, pos_z (TTycoon format)
        if (data.pos_x !== undefined && data.pos_y !== undefined && data.pos_z !== undefined) {
            const newCoords = {
                x: parseFloat(data.pos_x),
                y: parseFloat(data.pos_y),
                z: parseFloat(data.pos_z)
            };

            // Only update if coordinates actually changed (avoid unnecessary updates)
            if (!state.cache.playerCoords ||
                state.cache.playerCoords.x !== newCoords.x ||
                state.cache.playerCoords.y !== newCoords.y ||
                state.cache.playerCoords.z !== newCoords.z) {
                state.cache.playerCoords = newCoords;
                updateStatusDisplay(); // Update position display
            }

            // Auto-detect storage/quarry when player is near (within 5 units)
            if (state.config.storageCoords) {
                const dist = getDistance(state.cache.playerCoords, state.config.storageCoords);
                if (dist < 5 && state.currentStep !== "dumping") {
                    // Player is at storage
                }
            }

            if (state.config.quarryCoords) {
                const dist = getDistance(state.cache.playerCoords, state.config.quarryCoords);
                if (dist < 5 && state.currentStep !== "collecting") {
                    // Player is at quarry
                }
            }
        }

        // Handle automatic coordinate updates from game
        if (data.storageCoords) {
            state.config.storageCoords = data.storageCoords;
            document.getElementById("storageX").value = data.storageCoords.x || "";
            document.getElementById("storageY").value = data.storageCoords.y || "";
            document.getElementById("storageZ").value = data.storageCoords.z || "";
            saveSettings();
            updateCoordsDisplay();
            log("Storage coordinates updated automatically", "success");
        }

        if (data.quarryCoords) {
            state.config.quarryCoords = data.quarryCoords;
            document.getElementById("quarryX").value = data.quarryCoords.x || "";
            document.getElementById("quarryY").value = data.quarryCoords.y || "";
            document.getElementById("quarryZ").value = data.quarryCoords.z || "";
            saveSettings();
            updateCoordsDisplay();
            log("Quarry coordinates updated automatically", "success");
        }

        // Handle current location response
        if (data.currentLocation && data.locationType) {
            const coords = data.currentLocation;
            if (data.locationType === "storage") {
                state.config.storageCoords = coords;
                document.getElementById("storageX").value = coords.x || "";
                document.getElementById("storageY").value = coords.y || "";
                document.getElementById("storageZ").value = coords.z || "";
                saveSettings();
                updateCoordsDisplay();
                log(`Storage coordinates set from current location: ${coords.x}, ${coords.y}, ${coords.z}`, "success");
            } else if (data.locationType === "quarry") {
                state.config.quarryCoords = coords;
                document.getElementById("quarryX").value = coords.x || "";
                document.getElementById("quarryY").value = coords.y || "";
                document.getElementById("quarryZ").value = coords.z || "";
                saveSettings();
                updateCoordsDisplay();
                log(`Quarry coordinates set from current location: ${coords.x}, ${coords.y}, ${coords.z}`, "success");
            }
        }

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
            } else if (key !== "storageCoords" && key !== "quarryCoords" && key !== "currentLocation" && key !== "locationType") {
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
    const currentPos = document.getElementById("currentPos");

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

    if (currentPos && state.cache.playerCoords) {
        const c = state.cache.playerCoords;
        currentPos.textContent = `${c.x.toFixed(1)}, ${c.y.toFixed(1)}, ${c.z.toFixed(1)}`;
    } else if (currentPos) {
        currentPos.textContent = "Waiting for data...";
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
window.saveCoords = saveCoords;
window.getCurrentLocation = getCurrentLocation;
