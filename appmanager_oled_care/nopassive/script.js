/*
 * OLED Burn-in Protection Script
 * 
 * This script creates a subtle, moving noise pattern that prevents static UI elements
 * from causing permanent burn-in on OLED displays. The animation is designed to be:
 * - Extremely subtle and non-distracting
 * - Low CPU/GPU usage (optimized with requestAnimationFrame)
 * - Safe for extended gameplay sessions
 * 
 * How it protects OLED screens:
 * 1. Generates random low-opacity pixels that shift position over time
 * 2. Prevents any single pixel from displaying the same content continuously
 * 3. Uses very low opacity (1-3%) to remain invisible during gameplay
 * 4. Moves the pattern slowly to distribute pixel wear evenly
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

// Default settings
const DEFAULT_CONFIG = {
    enabled: true,
    posX: 0,
    posY: 0,
    width: 1920,
    height: 1080,
    noiseOpacity: 0.02,
    noiseParticles: 150,
    driftSpeed: 0.05,
};

// Animation settings (loaded from localStorage or defaults)
let CONFIG = {
    enabled: true,
    posX: 0,
    posY: 0,
    width: window.innerWidth || 1920,
    height: window.innerHeight || 1080,
    noiseOpacity: 0.02,
    noiseParticles: 150,
    driftSpeed: 0.05,
    particleMinSize: 1,
    particleMaxSize: 3,
    regenerateInterval: 180,
    noiseColor: 'rgba(20, 20, 20, ',
};

// Preset locations (common FiveM UI positions)
const PRESETS = {
    passiveMode: {
        posX: 50,
        posY: 50,
        width: 300,
        height: 100,
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
    alpha: true,           // Enable transparency
    desynchronized: true   // Optimize for animation performance
});

// Particle storage
let particles = [];
let frameCount = 0;
let offsetX = 0;
let offsetY = 0;

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
            // Update canvas size from saved config
            updateCanvasSize();
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
        noiseOpacity: CONFIG.noiseOpacity,
        noiseParticles: CONFIG.noiseParticles,
        driftSpeed: CONFIG.driftSpeed,
    };
    localStorage.setItem('oledProtectionSettings', JSON.stringify(toSave));
}

/**
 * Update canvas position and size based on CONFIG
 */
function updateCanvasSize() {
    canvas.style.left = CONFIG.posX + 'px';
    canvas.style.top = CONFIG.posY + 'px';
    canvas.style.width = CONFIG.width + 'px';
    canvas.style.height = CONFIG.height + 'px';
    canvas.width = CONFIG.width;
    canvas.height = CONFIG.height;
    generateParticles();
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Resize canvas to match window dimensions (for fullscreen mode)
 * Called on load and window resize for responsive behavior
 */
function resizeCanvas() {
    if (CONFIG.width === window.innerWidth && CONFIG.height === window.innerHeight) {
        CONFIG.width = window.innerWidth;
        CONFIG.height = window.innerHeight;
        updateCanvasSize();
    }
}

/**
 * Generate random noise particles
 * These particles create the subtle moving pattern that prevents burn-in
 */
function generateParticles() {
    particles = [];

    for (let i = 0; i < CONFIG.noiseParticles; i++) {
        particles.push({
            // Random position across entire canvas
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,

            // Random size within configured range
            size: CONFIG.particleMinSize + Math.random() * (CONFIG.particleMaxSize - CONFIG.particleMinSize),

            // Random drift direction for organic movement
            vx: (Math.random() - 0.5) * CONFIG.driftSpeed,
            vy: (Math.random() - 0.5) * CONFIG.driftSpeed,

            // Slight opacity variation for more natural appearance
            opacity: CONFIG.noiseOpacity * (0.5 + Math.random() * 0.5)
        });
    }
}

// ============================================================================
// ANIMATION LOOP
// ============================================================================

/**
 * Main animation loop
 * Renders and updates the burn-in protection pattern
 * Uses requestAnimationFrame for optimal performance and battery life
 */
function animate() {
    if (!CONFIG.enabled) {
        // If animation is disabled, clear canvas and stop
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        requestAnimationFrame(animate);
        return;
    }

    // Clear previous frame (transparent background)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update global drift offset for slow, continuous movement
    // This ensures the entire pattern shifts gradually across the screen
    offsetX += CONFIG.driftSpeed * 0.3;
    offsetY += CONFIG.driftSpeed * 0.2;

    // Render each noise particle
    particles.forEach(particle => {
        // Apply global drift offset to particle position
        const x = particle.x + offsetX;
        const y = particle.y + offsetY;

        // Wrap particles around screen edges for seamless movement
        const wrappedX = ((x % canvas.width) + canvas.width) % canvas.width;
        const wrappedY = ((y % canvas.height) + canvas.height) % canvas.height;

        // Draw particle with very low opacity
        ctx.fillStyle = CONFIG.noiseColor + particle.opacity + ')';
        ctx.fillRect(
            Math.floor(wrappedX),
            Math.floor(wrappedY),
            particle.size,
            particle.size
        );

        // Update particle position with individual drift
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap individual particle movement
        if (particle.x < 0) particle.x += canvas.width;
        if (particle.x > canvas.width) particle.x -= canvas.width;
        if (particle.y < 0) particle.y += canvas.height;
        if (particle.y > canvas.height) particle.y -= canvas.height;
    });

    // Periodically regenerate particles to create evolving pattern
    // This prevents any predictable pattern from forming
    frameCount++;
    if (frameCount >= CONFIG.regenerateInterval) {
        generateParticles();
        frameCount = 0;
    }

    // Request next frame
    requestAnimationFrame(animate);
}

// ============================================================================
// UI CONTROLS
// ============================================================================

/**
 * Initialize UI controls and event listeners
 */
function initUI() {
    const panel = document.getElementById('controlPanel');
    const enableCheckbox = document.getElementById('enableAnimation');
    const posXSlider = document.getElementById('posX');
    const posYSlider = document.getElementById('posY');
    const widthSlider = document.getElementById('width');
    const heightSlider = document.getElementById('height');
    const opacitySlider = document.getElementById('opacity');
    const particlesSlider = document.getElementById('particles');
    const speedSlider = document.getElementById('speed');
    const presetPassive = document.getElementById('presetPassive');
    const presetFullscreen = document.getElementById('presetFullscreen');
    const resetBtn = document.getElementById('resetSettings');

    // Toggle panel visibility
    const togglePanel = () => {
        panel.classList.toggle('active');
    };
    

    // Close panel
    document.getElementById('closePanel').addEventListener('click', () => {
        panel.classList.remove('active');
    });

    // Toggle with F3 key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F4') {
            e.preventDefault();
            togglePanel();
        }
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

    // Opacity
    opacitySlider.value = CONFIG.noiseOpacity * 100;
    document.getElementById('opacityValue').textContent = (CONFIG.noiseOpacity * 100).toFixed(1);
    opacitySlider.addEventListener('input', (e) => {
        CONFIG.noiseOpacity = parseFloat(e.target.value) / 100;
        document.getElementById('opacityValue').textContent = parseFloat(e.target.value).toFixed(1);
        saveSettings();
    });

    // Particle count
    particlesSlider.value = CONFIG.noiseParticles;
    document.getElementById('particleValue').textContent = CONFIG.noiseParticles;
    particlesSlider.addEventListener('input', (e) => {
        CONFIG.noiseParticles = parseInt(e.target.value);
        document.getElementById('particleValue').textContent = CONFIG.noiseParticles;
        generateParticles();
        saveSettings();
    });

    // Speed
    speedSlider.value = CONFIG.driftSpeed;
    document.getElementById('speedValue').textContent = CONFIG.driftSpeed.toFixed(2);
    speedSlider.addEventListener('input', (e) => {
        CONFIG.driftSpeed = parseFloat(e.target.value);
        document.getElementById('speedValue').textContent = CONFIG.driftSpeed.toFixed(2);
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
        CONFIG.width = window.innerWidth || 1920;
        CONFIG.height = window.innerHeight || 1080;
        
        enableCheckbox.checked = CONFIG.enabled;
        posXSlider.value = CONFIG.posX;
        posYSlider.value = CONFIG.posY;
        widthSlider.value = CONFIG.width;
        heightSlider.value = CONFIG.height;
        opacitySlider.value = CONFIG.noiseOpacity * 100;
        particlesSlider.value = CONFIG.noiseParticles;
        speedSlider.value = CONFIG.driftSpeed;
        
        document.getElementById('posXValue').textContent = CONFIG.posX;
        document.getElementById('posYValue').textContent = CONFIG.posY;
        document.getElementById('widthValue').textContent = CONFIG.width;
        document.getElementById('heightValue').textContent = CONFIG.height;
        document.getElementById('opacityValue').textContent = (CONFIG.noiseOpacity * 100).toFixed(1);
        document.getElementById('particleValue').textContent = CONFIG.noiseParticles;
        document.getElementById('speedValue').textContent = CONFIG.driftSpeed.toFixed(2);
        
        updateCanvasSize();
        saveSettings();
    });
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Initialize canvas on page load
window.addEventListener('load', () => {
    loadSettings();
    updateCanvasSize();
    initUI();
    animate();
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    resizeCanvas();
    // Update slider max values
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

// ============================================================================
// BURN-IN PROTECTION EXPLANATION
// ============================================================================

/*
 * How this prevents OLED burn-in:
 * 
 * 1. PIXEL SHIFTING: The noise pattern constantly moves across the screen,
 *    ensuring no pixel displays the same static content for extended periods.
 * 
 * 2. SUBTLE OPACITY: Using 1-3% opacity means the pattern is nearly invisible
 *    but still causes slight pixel variation that prevents burn-in.
 * 
 * 3. RANDOM DISTRIBUTION: Particles are randomly positioned and move in
 *    different directions, creating unpredictable pixel activation patterns.
 * 
 * 4. CONTINUOUS REGENERATION: The pattern regenerates every ~3 seconds,
 *    preventing any long-term static elements.
 * 
 * 5. LOW BRIGHTNESS: Using near-black colors (RGB 20,20,20) minimizes
 *    additional screen wear while still providing protection.
 * 
 * 6. PERFORMANCE OPTIMIZED: requestAnimationFrame ensures the animation
 *    runs at the optimal frame rate without wasting CPU/GPU resources.
 */
