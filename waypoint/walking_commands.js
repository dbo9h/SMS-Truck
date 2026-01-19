
// ========== Walking System with sendCommand ==========

let walkingState = {
    active: false,
    target: null,
    targetName: '',
    checkInterval: null,
    moveInterval: null,
    spaceInterval: null,
    lastDistance: Infinity,
    currentDirection: 'w',
    stuckCounter: 0
};

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
    walkingState.targetName = targetName;
    walkingState.lastDistance = Infinity;
    walkingState.stuckCounter = 0;

    log(`Starting to walk to ${targetName}...`, 'info');

    // Send move forward command
    sendMoveCommand('w');

    // Check progress every 500ms
    walkingState.checkInterval = setInterval(checkWalkingProgress, 500);

    // Keep moving forward
    walkingState.moveInterval = setInterval(() => {
        sendMoveCommand(walkingState.currentDirection);
    }, 100);

    // Press space every 5 seconds
    walkingState.spaceInterval = setInterval(() => {
        window.parent.postMessage({
            type: 'sendCommand',
            command: '+jump'
        }, '*');
        setTimeout(() => {
            window.parent.postMessage({
                type: 'sendCommand',
                command: '-jump'
            }, '*');
        }, 100);
    }, 5000);
}

function stopWalking() {
    if (!walkingState.active) return;

    // Stop all movement
    window.parent.postMessage({
        type: 'sendCommand',
        command: '-moveforward'
    }, '*');
    window.parent.postMessage({
        type: 'sendCommand',
        command: '-moveback'
    }, '*');
    window.parent.postMessage({
        type: 'sendCommand',
        command: '-moveleft'
    }, '*');
    window.parent.postMessage({
        type: 'sendCommand',
        command: '-moveright'
    }, '*');

    if (walkingState.checkInterval) clearInterval(walkingState.checkInterval);
    if (walkingState.moveInterval) clearInterval(walkingState.moveInterval);
    if (walkingState.spaceInterval) clearInterval(walkingState.spaceInterval);

    walkingState.active = false;
    walkingState.target = null;

    log('Stopped walking', 'info');
}

function checkWalkingProgress() {
    if (!walkingState.active || !walkingState.target || !state.playerCoords) return;

    const currentDistance = getDistance(state.playerCoords, walkingState.target);

    // Arrived?
    if (currentDistance < 10) {
        log(`Arrived at ${walkingState.targetName}!`, 'success');
        stopWalking();
        return;
    }

    // Check if getting closer
    if (currentDistance < walkingState.lastDistance - 0.5) {
        // Good progress
        walkingState.lastDistance = currentDistance;
        walkingState.stuckCounter = 0;
        log(`Walking to ${walkingState.targetName}... ${currentDistance.toFixed(1)} units`, 'info');
    } else {
        // Not making progress, try different direction
        walkingState.stuckCounter++;
        if (walkingState.stuckCounter > 3) {
            log('Stuck! Trying new direction...', 'warn');
            tryNewDirection();
            walkingState.stuckCounter = 0;
            walkingState.lastDistance = currentDistance;
        }
    }
}

function tryNewDirection() {
    const directions = ['w', 's', 'a', 'd'];
    const currentIndex = directions.indexOf(walkingState.currentDirection);
    const nextIndex = (currentIndex + 1) % directions.length;
    walkingState.currentDirection = directions[nextIndex];

    log(`Trying direction: ${walkingState.currentDirection.toUpperCase()}`, 'info');
}

function sendMoveCommand(direction) {
    const commands = {
        'w': ['+moveforward', '-moveback', '-moveleft', '-moveright'],
        's': ['+moveback', '-moveforward', '-moveleft', '-moveright'],
        'a': ['+moveleft', '-moveforward', '-moveback', '-moveright'],
        'd': ['+moveright', '-moveforward', '-moveback', '-moveleft']
    };

    const cmds = commands[direction];
    if (cmds) {
        cmds.forEach(cmd => {
            window.parent.postMessage({
                type: 'sendCommand',
                command: cmd
            }, '*');
        });
    }
}
