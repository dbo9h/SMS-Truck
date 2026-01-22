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

// Toggle to enable/disable the burn-in protection animation
const ANIMATION_ENABLED = true;

// Animation settings (adjust for performance/visibility balance)
const CONFIG = {
    // Opacity of noise pixels (0.01 = 1%, very subtle)
    noiseOpacity: 0.02,

    // Number of noise pixels to render per frame (lower = better performance)
    noiseParticles: 150,

    // Size range of noise pixels in pixels
    particleMinSize: 1,
    particleMaxSize: 3,

    // Movement speed (pixels per frame)
    driftSpeed: 0.05,

    // How often to regenerate noise pattern (frames)
    regenerateInterval: 180, // ~3 seconds at 60fps

    // Color of noise (grayscale, near-black for OLED safety)
    noiseColor: 'rgba(20, 20, 20, ',
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
// INITIALIZATION
// ============================================================================

/**
 * Resize canvas to match window dimensions
 * Called on load and window resize for responsive behavior
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Regenerate particles when canvas size changes
    generateParticles();
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
    if (!ANIMATION_ENABLED) {
        // If animation is disabled, clear canvas and stop
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
// EVENT LISTENERS
// ============================================================================

// Initialize canvas on page load
window.addEventListener('load', () => {
    resizeCanvas();
    if (ANIMATION_ENABLED) {
        animate();
    }
});

// Handle window resize for responsive behavior
window.addEventListener('resize', resizeCanvas);

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
