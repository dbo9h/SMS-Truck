// Waypoint Toggle App - Simple back-and-forth automation

const state = {
    automationActive: false,
    playerCoords: null,
    factoryCoords: null,
    beginningCoords: null,
    currentTarget: null, // 'factory' or 'beginning'
    checkInterval: null
};

const ARRIVAL_DISTANCE = 50; // Distance in units to consider "arrived" (increased for more range)
const CHECK_INTERVAL = 1000; // Check distance every 1 second

// OLED Protection
let autoHideTimer = null;
let positionShiftTimer = null;
let lastActivityTime = Date.now();
const AUTO_HIDE_DELAY = 30000; // 30 seconds
const POSITION_SHIFT_INTERVAL = 300000; // 5 minutes

// Drag functionality
let isDragging = false;
let currentX;
let currentY;
let initialX;
let initialY;
let xOffset = 0;
let yOffset = 0;

// Initialize app
document.addEventListener("DOMContentLoaded", () => {
    loadSettings();
    loadOLEDSettings();
    loadMiniMode();
    setupDragListeners();
    log("Waypoint Toggle app loaded", "info");

    // Request data from game
    setTimeout(() => {
        window.parent.postMessage({ type: "getData" }, "*");
        log("Requested game data", "info");
    }, 250);
});

// Setup drag listeners
function setupDragListeners() {
    const container = document.querySelector(".container");

    container.addEventListener("mousedown", dragStart);
    document.addEventListener("mousemove", drag);
    document.addEventListener("mouseup", dragEnd);
}

function dragStart(e) {
    // Only drag if clicking on header or container background
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
        return;
    }

    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    isDragging = true;
    resetActivityTimer();
}

function drag(e) {
    if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;

        setTranslate(currentX, currentY, document.querySelector(".container"));
    }
}

function dragEnd(e) {
    initialX = currentX;
    initialY = currentY;
    isDragging = false;
}

function setTranslate(xPos, yPos, el) {
    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
}

// Load saved coordinates from localStorage
function loadSettings() {
    const saved = localStorage.getItem("waypoint_toggle_settings");
    if (saved) {
        try {
            const data = JSON.parse(saved);
            state.factoryCoords = data.factoryCoords || null;
            state.beginningCoords = data.beginningCoords || null;
            updateUI();
        } catch (e) {
            console.error("Failed to load settings:", e);
        }
    }
}

// Save coordinates to localStorage
function saveSettings() {
    const data = {
        factoryCoords: state.factoryCoords,
        beginningCoords: state.beginningCoords
    };
    localStorage.setItem("waypoint_toggle_settings", JSON.stringify(data));
}

// Update UI displays
function updateUI() {
    // Update coordinate displays
    if (state.factoryCoords) {
        document.getElementById("factoryDisplay").textContent =
            `X: ${state.factoryCoords.x.toFixed(1)}, Y: ${state.factoryCoords.y.toFixed(1)}`;
    }

    if (state.beginningCoords) {
        document.getElementById("beginningDisplay").textContent =
            `X: ${state.beginningCoords.x.toFixed(1)}, Y: ${state.beginningCoords.y.toFixed(1)}`;
    }

    // Update current position
    if (state.playerCoords) {
        document.getElementById("currentPos").textContent =
            `X: ${state.playerCoords.x.toFixed(1)}, Y: ${state.playerCoords.y.toFixed(1)}`;
    }

    // Update current target
    if (state.currentTarget) {
        document.getElementById("currentTarget").textContent =
            state.currentTarget === 'factory' ? 'Factory' : 'Beginning';
    }

    // Update distance
    if (state.playerCoords && state.currentTarget) {
        const targetCoords = state.currentTarget === 'factory' ? state.factoryCoords : state.beginningCoords;
        if (targetCoords) {
            const dist = getDistance(state.playerCoords, targetCoords);
            document.getElementById("distance").textContent = dist.toFixed(1) + " units";
        }
    }

    // Update mini mode info panel
    if (typeof updateMiniInfo === "function") {
        updateMiniInfo();
    }
}

// Capture factory location
function captureFactory() {
    if (!state.playerCoords) {
        log("No player coordinates available yet", "error");
        return;
    }

    state.factoryCoords = {
        x: state.playerCoords.x,
        y: state.playerCoords.y
    };

    saveSettings();
    updateUI();
    log(`Factory captured: ${state.factoryCoords.x.toFixed(1)}, ${state.factoryCoords.y.toFixed(1)}`, "success");
    resetActivityTimer();
}

// Capture beginning location
function captureBeginning() {
    if (!state.playerCoords) {
        log("No player coordinates available yet", "error");
        return;
    }

    state.beginningCoords = {
        x: state.playerCoords.x,
        y: state.playerCoords.y
    };

    saveSettings();
    updateUI();
    log(`Beginning captured: ${state.beginningCoords.x.toFixed(1)}, ${state.beginningCoords.y.toFixed(1)}`, "success");
    resetActivityTimer();
}

// Toggle automation on/off
function toggleAutomation() {
    if (!state.factoryCoords || !state.beginningCoords) {
        log("Please capture both Factory and Beginning locations first!", "error");
        return;
    }

    state.automationActive = !state.automationActive;

    const btn = document.getElementById("automationBtn");

    if (state.automationActive) {
        btn.textContent = "⏹️ Stop Automation";
        btn.classList.add("active");
        startAutomation();
    } else {
        btn.textContent = "▶️ Start Automation";
        btn.classList.remove("active");
        stopAutomation();
    }
    resetActivityTimer();
}

// Start automation
function startAutomation() {
    // Set initial target to Factory
    state.currentTarget = 'factory';
    setWaypoint(state.factoryCoords);
    log("Automation started - heading to Factory", "success");
    document.getElementById("status").textContent = "Running";

    // Mini mode status
    const miniStatus = document.getElementById("miniStatus");
    const miniStatusValue = document.getElementById("miniStatusValue");
    if (miniStatus && miniStatusValue) {
        miniStatus.classList.remove("status-idle");
        miniStatus.classList.add("status-running");
        miniStatusValue.textContent = "Running";
    }

    // Start checking distance
    state.checkInterval = setInterval(checkDistance, CHECK_INTERVAL);
}

// Stop automation
function stopAutomation() {
    if (state.checkInterval) {
        clearInterval(state.checkInterval);
        state.checkInterval = null;
    }

    state.currentTarget = null;
    log("Automation stopped", "info");
    document.getElementById("status").textContent = "Idle";
    document.getElementById("currentTarget").textContent = "None";
    document.getElementById("distance").textContent = "-";

    // Mini mode reset
    const miniStatus = document.getElementById("miniStatus");
    const miniStatusValue = document.getElementById("miniStatusValue");
    if (miniStatus && miniStatusValue) {
        miniStatus.classList.remove("status-running");
        miniStatus.classList.add("status-idle");
        miniStatusValue.textContent = "Idle";
    }
    const miniTarget = document.getElementById("miniTarget");
    const miniDistance = document.getElementById("miniDistance");
    const miniPos = document.getElementById("miniPos");
    if (miniTarget) miniTarget.textContent = "None";
    if (miniDistance) miniDistance.textContent = "-";
    if (miniPos && state.playerCoords) {
        miniPos.textContent = state.playerCoords.x.toFixed(0) + ", " + state.playerCoords.y.toFixed(0);
    }
}

// Check distance and switch waypoint when arrived
function checkDistance() {
    if (!state.playerCoords || !state.currentTarget) return;

    const targetCoords = state.currentTarget === 'factory' ? state.factoryCoords : state.beginningCoords;
    const distance = getDistance(state.playerCoords, targetCoords);

    // Update UI
    updateUI();

    // Check if arrived
    if (distance < ARRIVAL_DISTANCE) {
        // Switch target
        if (state.currentTarget === 'factory') {
            state.currentTarget = 'beginning';
            setWaypoint(state.beginningCoords);
            log(`Arrived at Factory! Switching to Beginning`, "success");
        } else {
            state.currentTarget = 'factory';
            setWaypoint(state.factoryCoords);
            log(`Arrived at Beginning! Switching to Factory`, "success");
        }

        updateUI();
    }
}

// Set waypoint on map
function setWaypoint(coords) {
    window.parent.postMessage({
        type: "setWaypoint",
        x: coords.x,
        y: coords.y
    }, "*");

    console.log("[DEBUG] Set waypoint:", coords);
}

// Calculate distance between two points
function getDistance(coord1, coord2) {
    if (!coord1 || !coord2) return Infinity;
    const dx = coord1.x - coord2.x;
    const dy = coord1.y - coord2.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Listen for game data
window.addEventListener("message", (event) => {
    // CRITICAL: Data is sent in event.data.data, NOT event.data!
    const evt = event.data;
    const data = evt.data || {};

    if (!data || Object.keys(data).length === 0) return;

    // Update player coordinates
    if (data.pos_x !== undefined && data.pos_y !== undefined) {
        state.playerCoords = {
            x: parseFloat(data.pos_x),
            y: parseFloat(data.pos_y)
        };
        updateUI();
    }
});

// Logging function
function log(message, type = "info") {
    const logDiv = document.getElementById("log");
    const entry = document.createElement("div");
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;

    logDiv.insertBefore(entry, logDiv.firstChild);

    // Keep only last 50 entries
    while (logDiv.children.length > 50) {
        logDiv.removeChild(logDiv.lastChild);
    }
}

// Clear log
function clearLog() {
    document.getElementById("log").innerHTML = "";
    resetActivityTimer();
}

// ========== OLED Protection Functions ==========

function updateOpacity(value) {
    const container = document.querySelector(".container");
    container.style.opacity = value / 100;
    document.getElementById("opacityValue").textContent = value + "%";
    localStorage.setItem("uiOpacity", value);
    resetActivityTimer();
}

function toggleAutoHide(enabled) {
    if (enabled) {
        startAutoHideTimer();
        log("Auto-hide enabled (30s idle)", "info");
    } else {
        stopAutoHideTimer();
        showUI();
        log("Auto-hide disabled", "info");
    }
    localStorage.setItem("autoHide", enabled);
}

function togglePositionShift(enabled) {
    if (enabled) {
        startPositionShift();
        log("Position shift enabled (5min)", "info");
    } else {
        stopPositionShift();
        log("Position shift disabled", "info");
    }
    localStorage.setItem("positionShift", enabled);
}

function resetActivityTimer() {
    lastActivityTime = Date.now();
    showUI();

    if (document.getElementById("autoHide") && document.getElementById("autoHide").checked) {
        startAutoHideTimer();
    }
}

function startAutoHideTimer() {
    stopAutoHideTimer();
    autoHideTimer = setInterval(() => {
        const idleTime = Date.now() - lastActivityTime;
        if (idleTime >= AUTO_HIDE_DELAY) {
            hideUI();
        }
    }, 1000);
}

function stopAutoHideTimer() {
    if (autoHideTimer) {
        clearInterval(autoHideTimer);
        autoHideTimer = null;
    }
}

function hideUI() {
    const container = document.querySelector(".container");
    container.classList.add("fading", "hidden");
}

function showUI() {
    const container = document.querySelector(".container");
    container.classList.remove("hidden");
    setTimeout(() => container.classList.remove("fading"), 500);
}

function startPositionShift() {
    stopPositionShift();
    positionShiftTimer = setInterval(() => {
        shiftPosition();
    }, POSITION_SHIFT_INTERVAL);
}

function stopPositionShift() {
    if (positionShiftTimer) {
        clearInterval(positionShiftTimer);
        positionShiftTimer = null;
    }
}

function shiftPosition() {
    // Shift position by 5-15 pixels randomly to prevent burn-in
    const shiftX = Math.floor(Math.random() * 10) - 5;
    const shiftY = Math.floor(Math.random() * 10) - 5;

    xOffset += shiftX;
    yOffset += shiftY;

    setTranslate(xOffset, yOffset, document.querySelector(".container"));
    log(`Position shifted (${shiftX}, ${shiftY}) for OLED protection`, "info");
}

// Load OLED settings
function loadOLEDSettings() {
    const opacity = localStorage.getItem("uiOpacity") || "90";
    const autoHide = localStorage.getItem("autoHide") === "true";
    const positionShift = localStorage.getItem("positionShift") === "true";

    document.getElementById("opacitySlider").value = opacity;
    updateOpacity(opacity);

    document.getElementById("autoHide").checked = autoHide;
    if (autoHide) toggleAutoHide(true);

    document.getElementById("positionShift").checked = positionShift;
    if (positionShift) togglePositionShift(true);
}

// Track user activity
document.addEventListener("mousemove", resetActivityTimer);
document.addEventListener("mousedown", resetActivityTimer);
document.addEventListener("keypress", resetActivityTimer);


// ========== Mini Mode ==========

function toggleMiniMode() {
    const container = document.querySelector('.container');
    const isMini = container.classList.toggle('mini-mode');
    localStorage.setItem('miniMode', isMini);
    log(isMini ? 'Mini mode enabled' : 'Mini mode disabled', 'info');
    if (typeof updateMiniInfo === 'function') {
        updateMiniInfo();
    }
    if (typeof resetActivityTimer === 'function') resetActivityTimer();
}

function loadMiniMode() {
    const isMini = localStorage.getItem('miniMode') === 'true';
    if (isMini) {
        document.querySelector('.container').classList.add('mini-mode');
    }
}

function updateMiniInfo() {
    if (state.playerCoords) {
        document.getElementById('miniPos').textContent = state.playerCoords.x.toFixed(0) + ', ' + state.playerCoords.y.toFixed(0);
    }
    if (state.currentTarget) {
        document.getElementById('miniTarget').textContent = state.currentTarget === 'factory' ? 'Factory' : 'Beginning';
        const targetCoords = state.currentTarget === 'factory' ? state.factoryCoords : state.beginningCoords;
        if (targetCoords && state.playerCoords) {
            const dist = getDistance(state.playerCoords, targetCoords);
            document.getElementById('miniDistance').textContent = dist.toFixed(0);
        }
    }
}
