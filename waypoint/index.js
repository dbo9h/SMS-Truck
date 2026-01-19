// Waypoint Toggle App - Simple back-and-forth automation

const state = {
    automationActive: false,
    playerCoords: null,
    factoryCoords: null,
    beginningCoords: null,
    currentTarget: null, // 'factory' or 'beginning'
    checkInterval: null
};

const ARRIVAL_DISTANCE = 10; // Distance in units to consider "arrived"
const CHECK_INTERVAL = 1000; // Check distance every 1 second

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
}

// Start automation
function startAutomation() {
    // Set initial target to Factory
    state.currentTarget = 'factory';
    setWaypoint(state.factoryCoords);
    log("Automation started - heading to Factory", "success");
    document.getElementById("status").textContent = "Running";

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
}
