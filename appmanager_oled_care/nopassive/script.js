/*
 * OLED Burn-in Protection Script
 * 
 * This script creates a blur overlay that masks static UI elements (like "Passive Mode")
 * to prevent burn-in on OLED displays. The blur effect is animated to prevent static pixels.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Default settings
const DEFAULT_CONFIG = {
    enabled: true,
    posX: 0,
    posY: 0,
    width: 300,
    height: 100,
    blurIntensity: 5,
    blurOpacity: 0.3,
    animationSpeed: 2,
};

// Animation settings (loaded from localStorage or defaults)
let CONFIG = {
    enabled: true,
    posX: 0,
    posY: 0,
    width: 300,
    height: 100,
    blurIntensity: 5,
    blurOpacity: 0.3,
    animationSpeed: 2,
};

// Preset locations (common FiveM UI positions)
const PRESETS = {
    passiveMode: {
        posX: window.innerWidth / 2 - 90 || 800,
        posY: window.innerHeight / 2 - -650 || 500,
        width: 170,
        height: 40,
    },
    fullscreen: {
        posX: 0,
        posY: 0,
        width: window.innerWidth || 1920,
        height: window.innerHeight || 1080,
    }
};

// ============================================================================
// CANVAS SETUP
// ============================================================================

const canvas = document.getElementById('protectionCanvas');
const ctx = canvas.getContext('2d', {
    alpha: true,
    desynchronized: true
});

// Animation state
let frameCount = 0;
let blurOffset = 0;

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Load settings from localStorage
 */
function loadSettings() {
    const saved = localStorage.getItem('oledProtectionSettings');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            CONFIG = { ...CONFIG, ...parsed };
            updateCanvasSize();
            updateCanvasBlur();
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
    }
}

/**
 * Save settings to localStorage
 */
function saveSettings() {
    const toSave = {
        enabled: CONFIG.enabled,
        posX: CONFIG.posX,
        posY: CONFIG.posY,
        width: CONFIG.width,
        height: CONFIG.height,
        blurIntensity: CONFIG.blurIntensity,
        blurOpacity: CONFIG.blurOpacity,
        animationSpeed: CONFIG.animationSpeed,
    };
    localStorage.setItem('oledProtectionSettings', JSON.stringify(toSave));
}

/**
 * Update canvas position and size based on CONFIG
 */
function updateCanvasSize() {
    const width = Math.max(CONFIG.width || 50, 50);
    const height = Math.max(CONFIG.height || 50, 50);
    
    canvas.style.left = (CONFIG.posX || 0) + 'px';
    canvas.style.top = (CONFIG.posY || 0) + 'px';
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;
}

/**
 * Update canvas blur filter
 */
function updateCanvasBlur() {
    canvas.style.filter = `blur(${CONFIG.blurIntensity}px)`;
    canvas.style.webkitFilter = `blur(${CONFIG.blurIntensity}px)`;
    canvas.style.backdropFilter = `blur(${CONFIG.blurIntensity}px)`;
    canvas.style.webkitBackdropFilter = `blur(${CONFIG.blurIntensity}px)`;
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

/**
 * Main animation loop
 * Renders blur overlay to mask static UI elements and prevent burn-in
 */
function animate() {
    if (!CONFIG.enabled) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(animate);
        return;
    }

    if (canvas.width === 0 || canvas.height === 0) {
        requestAnimationFrame(animate);
        return;
    }

    // Clear previous frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update blur offset for subtle movement
    blurOffset += CONFIG.animationSpeed * 0.1;
    if (blurOffset > 100) blurOffset = 0;

    // Create animated semi-transparent overlay with slight movement
    // This masks the static "Passive Mode" text and prevents burn-in
    const layers = 2;
    for (let i = 0; i < layers; i++) {
        const offset = Math.sin(blurOffset * 0.1 + i) * 1;
        const opacity = CONFIG.blurOpacity / layers;
        
        ctx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
        ctx.fillRect(
            offset,
            Math.cos(blurOffset * 0.15 + i) * 1,
            canvas.width,
            canvas.height
        );
    }

    // Additional overlay for better masking
    ctx.globalAlpha = CONFIG.blurOpacity;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1.0;

    requestAnimationFrame(animate);
}

// ============================================================================
// UI CONTROLS
// ============================================================================

function initUI() {
    const panel = document.getElementById('controlPanel');
    const toggleBtn = document.getElementById('togglePanel');
    const enableCheckbox = document.getElementById('enableAnimation');
    const posXSlider = document.getElementById('posX');
    const posYSlider = document.getElementById('posY');
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    const blurIntensitySlider = document.getElementById('blurIntensity');
    const blurOpacitySlider = document.getElementById('blurOpacity');
    const animationSpeedSlider = document.getElementById('animationSpeed');
    const presetPassive = document.getElementById('presetPassive');
    const presetFullscreen = document.getElementById('presetFullscreen');
    const resetBtn = document.getElementById('resetSettings');

    const togglePanel = () => {
        panel.classList.toggle('active');
    };
    
    globalTogglePanel = togglePanel;
    toggleBtn.addEventListener('click', togglePanel);

    document.getElementById('closePanel').addEventListener('click', () => {
        panel.classList.remove('active');
    });

    // Enable/disable animation
    enableCheckbox.checked = CONFIG.enabled;
    enableCheckbox.addEventListener('change', (e) => {
        CONFIG.enabled = e.target.checked;
        saveSettings();
    });

    // Position X
    posXSlider.value = CONFIG.posX;
    posXSlider.max = window.innerWidth || 1920;
    document.getElementById('posXValue').textContent = CONFIG.posX;
    posXSlider.addEventListener('input', (e) => {
        CONFIG.posX = parseInt(e.target.value);
        document.getElementById('posXValue').textContent = CONFIG.posX;
        updateCanvasSize();
        saveSettings();
    });

    // Position Y
    posYSlider.value = CONFIG.posY;
    posYSlider.max = window.innerHeight || 1080;
    document.getElementById('posYValue').textContent = CONFIG.posY;
    posYSlider.addEventListener('input', (e) => {
        CONFIG.posY = parseInt(e.target.value);
        document.getElementById('posYValue').textContent = CONFIG.posY;
        updateCanvasSize();
        saveSettings();
    });

    // Width
    widthSlider.value = CONFIG.width;
    widthSlider.max = window.innerWidth || 1920;
    document.getElementById('widthValue').textContent = CONFIG.width;
    widthSlider.addEventListener('input', (e) => {
        CONFIG.width = parseInt(e.target.value);
        document.getElementById('widthValue').textContent = CONFIG.width;
        updateCanvasSize();
        saveSettings();
    });

    // Height
    heightSlider.value = CONFIG.height;
    heightSlider.max = window.innerHeight || 1080;
    document.getElementById('heightValue').textContent = CONFIG.height;
    heightSlider.addEventListener('input', (e) => {
        CONFIG.height = parseInt(e.target.value);
        document.getElementById('heightValue').textContent = CONFIG.height;
        updateCanvasSize();
        saveSettings();
    });

    // Blur Intensity
    blurIntensitySlider.value = CONFIG.blurIntensity;
    document.getElementById('blurValue').textContent = CONFIG.blurIntensity;
    blurIntensitySlider.addEventListener('input', (e) => {
        CONFIG.blurIntensity = parseInt(e.target.value);
        document.getElementById('blurValue').textContent = CONFIG.blurIntensity;
        updateCanvasBlur();
        saveSettings();
    });

    // Blur Opacity
    blurOpacitySlider.value = CONFIG.blurOpacity * 100;
    document.getElementById('opacityValue').textContent = Math.round(CONFIG.blurOpacity * 100);
    blurOpacitySlider.addEventListener('input', (e) => {
        CONFIG.blurOpacity = parseFloat(e.target.value) / 100;
        document.getElementById('opacityValue').textContent = Math.round(parseFloat(e.target.value));
        saveSettings();
    });

    // Animation Speed
    animationSpeedSlider.value = CONFIG.animationSpeed;
    document.getElementById('speedValue').textContent = CONFIG.animationSpeed;
    animationSpeedSlider.addEventListener('input', (e) => {
        CONFIG.animationSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = CONFIG.animationSpeed;
        saveSettings();
    });

    // Preset: Passive Mode
    presetPassive.addEventListener('click', () => {
        CONFIG.posX = PRESETS.passiveMode.posX;
        CONFIG.posY = PRESETS.passiveMode.posY;
        CONFIG.width = PRESETS.passiveMode.width;
        CONFIG.height = PRESETS.passiveMode.height;
        
        posXSlider.value = CONFIG.posX;
        posYSlider.value = CONFIG.posY;
        widthSlider.value = CONFIG.width;
        heightSlider.value = CONFIG.height;
        
        document.getElementById('posXValue').textContent = CONFIG.posX;
        document.getElementById('posYValue').textContent = CONFIG.posY;
        document.getElementById('widthValue').textContent = CONFIG.width;
        document.getElementById('heightValue').textContent = CONFIG.height;
        
        updateCanvasSize();
        saveSettings();
    });

    // Preset: Fullscreen
    presetFullscreen.addEventListener('click', () => {
        CONFIG.posX = 0;
        CONFIG.posY = 0;
        CONFIG.width = window.innerWidth || 1920;
        CONFIG.height = window.innerHeight || 1080;
        
        posXSlider.max = window.innerWidth || 1920;
        posYSlider.max = window.innerHeight || 1080;
        widthSlider.max = window.innerWidth || 1920;
        heightSlider.max = window.innerHeight || 1080;
        
        posXSlider.value = CONFIG.posX;
        posYSlider.value = CONFIG.posY;
        widthSlider.value = CONFIG.width;
        heightSlider.value = CONFIG.height;
        
        document.getElementById('posXValue').textContent = CONFIG.posX;
        document.getElementById('posYValue').textContent = CONFIG.posY;
        document.getElementById('widthValue').textContent = CONFIG.width;
        document.getElementById('heightValue').textContent = CONFIG.height;
        
        updateCanvasSize();
        saveSettings();
    });

    // Reset to defaults
    resetBtn.addEventListener('click', () => {
        CONFIG = { ...CONFIG, ...DEFAULT_CONFIG };
        CONFIG.width = 300;
        CONFIG.height = 100;
        
        enableCheckbox.checked = CONFIG.enabled;
        posXSlider.value = CONFIG.posX;
        posYSlider.value = CONFIG.posY;
        widthSlider.value = CONFIG.width;
        heightSlider.value = CONFIG.height;
        blurIntensitySlider.value = CONFIG.blurIntensity;
        blurOpacitySlider.value = CONFIG.blurOpacity * 100;
        animationSpeedSlider.value = CONFIG.animationSpeed;
        
        document.getElementById('posXValue').textContent = CONFIG.posX;
        document.getElementById('posYValue').textContent = CONFIG.posY;
        document.getElementById('widthValue').textContent = CONFIG.width;
        document.getElementById('heightValue').textContent = CONFIG.height;
        document.getElementById('blurValue').textContent = CONFIG.blurIntensity;
        document.getElementById('opacityValue').textContent = Math.round(CONFIG.blurOpacity * 100);
        document.getElementById('speedValue').textContent = CONFIG.animationSpeed;
        
        updateCanvasSize();
        updateCanvasBlur();
        saveSettings();
    });
}

// ============================================================================
// GLOBAL F4 KEY HANDLER
// ============================================================================

let globalTogglePanel = null;
let f4Pressed = false;

(function() {
    const handleF4KeyDown = (e) => {
        const isF4 = e.key === 'F4' || 
                     e.code === 'F4' || 
                     e.keyCode === 115 ||
                     (e.which === 115);
        
        if (isF4 && !f4Pressed) {
            f4Pressed = true;
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (globalTogglePanel) {
                globalTogglePanel();
            }
            return false;
        }
    };
    
    const handleF4KeyUp = (e) => {
        const isF4 = e.key === 'F4' || 
                     e.code === 'F4' || 
                     e.keyCode === 115 ||
                     (e.which === 115);
        
        if (isF4) {
            f4Pressed = false;
            e.preventDefault();
            e.stopPropagation();
        }
    };
    
    if (document.body) {
        document.body.addEventListener('keydown', handleF4KeyDown, true);
        document.body.addEventListener('keyup', handleF4KeyUp, true);
    }
    document.addEventListener('keydown', handleF4KeyDown, true);
    document.addEventListener('keyup', handleF4KeyUp, true);
    window.addEventListener('keydown', handleF4KeyDown, true);
    window.addEventListener('keyup', handleF4KeyUp, true);
})();

// ============================================================================
// EVENT LISTENERS
// ============================================================================

function initialize() {
    const defaultWidth = window.innerWidth || 1920;
    const defaultHeight = window.innerHeight || 1080;
    
    if (!CONFIG.width || CONFIG.width === 0) {
        CONFIG.width = 300;
    }
    if (!CONFIG.height || CONFIG.height === 0) {
        CONFIG.height = 100;
    }
    
    loadSettings();
    
    if (!CONFIG.width || CONFIG.width === 0) {
        CONFIG.width = 300;
    }
    if (!CONFIG.height || CONFIG.height === 0) {
        CONFIG.height = 100;
    }
    
    updateCanvasSize();
    updateCanvasBlur();
    initUI();
    animate();
}

if (document.readyState === 'loading') {
    window.addEventListener('load', initialize);
} else {
    initialize();
}

window.addEventListener('resize', () => {
    const posXSlider = document.getElementById('posX');
    const posYSlider = document.getElementById('posY');
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    if (posXSlider) {
        posXSlider.max = window.innerWidth || 1920;
        posYSlider.max = window.innerHeight || 1080;
        widthSlider.max = window.innerWidth || 1920;
        heightSlider.max = window.innerHeight || 1080;
    }
});
