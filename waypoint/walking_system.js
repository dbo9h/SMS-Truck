
// ========== WASD Walking System ==========

let walkingState = {
    active: false,
    target: null,
    currentKeys: [],
    lastDistance: Infinity,
    checkInterval: null,
    spaceInterval: null,
    directionTestMode: false,
    testingKey: null
};

const WALK_CHECK_INTERVAL = 500; // Check distance every 500ms
const SPACE_PRESS_INTERVAL = 5000; // Press space every 5 seconds
const DIRECTION_TEST_TIME = 1000; // Test each direction for 1 second

function walkToFactory() {
    if (!state.factoryCoords) {
        log('Factory coordinates not set!', 'error');
        return;
    }
    startWalking(state.factoryCoords, 'Factory');
}

function walkToBeginning() {
    if (!state.beginningCoords) {
        log('Beginning coordinates not set!', 'error');
        return;
    }
    startWalking(state.beginningCoords, 'Beginning');
}

function startWalking(targetCoords, targetName) {
    if (walkingState.active) {
        stopWalking();
    }

    walkingState.active = true;
    walkingState.target = targetCoords;
    walkingState.lastDistance = Infinity;
    walkingState.currentKeys = [];

    log(`Starting to walk to ${targetName}...`, 'info');

    // Start with W key (forward)
    pressKeys(['w']);
    walkingState.currentKeys = ['w'];

    // Check distance regularly
    walkingState.checkInterval = setInterval(checkWalkingProgress, WALK_CHECK_INTERVAL);

    // Press space every 5 seconds
    walkingState.spaceInterval = setInterval(() => {
        sendKeyPress('space');
        log('Pressed Space (jump)', 'info');
    }, SPACE_PRESS_INTERVAL);
}

function stopWalking() {
    if (!walkingState.active) return;

    // Release all keys
    releaseAllKeys();

    // Clear intervals
    if (walkingState.checkInterval) {
        clearInterval(walkingState.checkInterval);
        walkingState.checkInterval = null;
    }

    if (walkingState.spaceInterval) {
        clearInterval(walkingState.spaceInterval);
        walkingState.spaceInterval = null;
    }

    walkingState.active = false;
    walkingState.target = null;
    walkingState.currentKeys = [];
    walkingState.lastDistance = Infinity;

    log('Stopped walking', 'info');
}

function checkWalkingProgress() {
    if (!walkingState.active || !walkingState.target || !state.playerCoords) return;

    const currentDistance = getDistance(state.playerCoords, walkingState.target);

    // Check if we arrived (within 10 units)
    if (currentDistance < 10) {
        log(`Arrived at destination!`, 'success');
        stopWalking();
        return;
    }

    // Check if distance is decreasing
    if (currentDistance < walkingState.lastDistance - 1) {
        // Good! We're getting closer, keep current keys
        walkingState.lastDistance = currentDistance;
        log(`Walking... Distance: ${currentDistance.toFixed(1)} units`, 'info');
    } else {
        // Not getting closer, try different direction
        log(`Not getting closer (${currentDistance.toFixed(1)}), trying new direction...`, 'warn');
        tryNewDirection();
    }
}

function tryNewDirection() {
    // Release current keys
    releaseAllKeys();

    // Try different key combinations
    const directions = [
        ['w'],           // Forward
        ['s'],           // Backward
        ['a'],           // Left
        ['d'],           // Right
        ['w', 'a'],      // Forward-Left
        ['w', 'd'],      // Forward-Right
        ['s', 'a'],      // Backward-Left
        ['s', 'd']       // Backward-Right
    ];

    // Find a direction we haven't tried yet, or cycle through
    let nextDirection = directions[Math.floor(Math.random() * directions.length)];

    // Prefer directions we haven't used recently
    for (const dir of directions) {
        const dirStr = dir.join(',');
        const currentStr = walkingState.currentKeys.join(',');
        if (dirStr !== currentStr) {
            nextDirection = dir;
            break;
        }
    }

    walkingState.currentKeys = nextDirection;
    walkingState.lastDistance = Infinity; // Reset to give new direction a chance
    pressKeys(nextDirection);

    log(`Trying direction: ${nextDirection.join('+')}`, 'info');
}

function pressKeys(keys) {
    keys.forEach(key => {
        sendKeyDown(key);
    });
}

function releaseAllKeys() {
    const allKeys = ['w', 'a', 's', 'd'];
    allKeys.forEach(key => {
        sendKeyUp(key);
    });
}

function sendKeyDown(key) {
    window.parent.postMessage({
        type: 'keyDown',
        key: key
    }, '*');
}

function sendKeyUp(key) {
    window.parent.postMessage({
        type: 'keyUp',
        key: key
    }, '*');
}

function sendKeyPress(key) {
    window.parent.postMessage({
        type: 'keyPress',
        key: key
    }, '*');
}
