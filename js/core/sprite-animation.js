// js/core/sprite-animation.js
// Sprite Sheet Animation System for StudyPups
// Supports layered sprites (base + accessories) with CSS-based frame animation

// ============================================================
// SPRITE CONFIGURATION
// ============================================================

/**
 * Default sprite sheet configurations
 * Each pup/accessory can override these
 */
export const SPRITE_DEFAULTS = {
  frameCount: 4,
  frameDuration: 400, // ms per frame
  frameWidth: 1, // Will be calculated as percentage (100% / frameCount)
  aspectRatio: "1 / 1"
};

/**
 * Animation state configurations
 * Maps state names to their sprite sheet and timing
 */
export const ANIMATION_STATES = {
  idle: {
    frameCount: 4,
    frameDuration: 500,
    loop: true
  },
  walk: {
    frameCount: 4,
    frameDuration: 150,
    loop: true
  },
  wag: {
    frameCount: 4,
    frameDuration: 200,
    loop: true
  },
  sleep: {
    frameCount: 2,
    frameDuration: 1000,
    loop: true
  },
  happy: {
    frameCount: 4,
    frameDuration: 300,
    loop: false
  }
};

// ============================================================
// SPRITE ELEMENT CREATION
// ============================================================

/**
 * Creates an animated sprite container with layers
 * @param {Object} config - Sprite configuration
 * @param {string} config.id - Unique identifier for this sprite
 * @param {string} config.baseSheet - URL to base sprite sheet image
 * @param {string} config.state - Initial animation state (idle, walk, sleep, etc.)
 * @param {number} config.frameCount - Number of frames in the sheet
 * @param {Object} config.accessories - Optional accessory layers { slot: sheetUrl }
 * @param {string} config.size - CSS size class (helper, home-pup, room-pup)
 * @returns {HTMLElement} The sprite container element
 */
export function createAnimatedSprite(config) {
  const {
    id,
    baseSheet,
    state = "idle",
    frameCount = 4,
    accessories = {},
    size = "home-pup"
  } = config;

  // Create container
  const container = document.createElement("div");
  container.className = `sprite-container sprite-${size}`;
  container.dataset.spriteId = id;
  container.dataset.state = state;
  container.dataset.frameCount = frameCount;

  // Create base layer
  const baseLayer = document.createElement("div");
  baseLayer.className = "sprite-layer sprite-base";
  baseLayer.style.backgroundImage = `url('${baseSheet}')`;
  baseLayer.style.animationName = `spriteFrames${frameCount}`;
  container.appendChild(baseLayer);

  // Create accessory layers
  Object.entries(accessories).forEach(([slot, sheetUrl]) => {
    if (sheetUrl) {
      const accessoryLayer = document.createElement("div");
      accessoryLayer.className = `sprite-layer sprite-accessory sprite-${slot}`;
      accessoryLayer.dataset.slot = slot;
      accessoryLayer.style.backgroundImage = `url('${sheetUrl}')`;
      accessoryLayer.style.animationName = `spriteFrames${frameCount}`;
      container.appendChild(accessoryLayer);
    }
  });

  return container;
}

/**
 * Creates a helper sprite (fixed position, used during puzzles)
 * @param {Object} config - Sprite configuration
 * @returns {HTMLElement} The helper sprite element
 */
export function createHelperSprite(config) {
  const sprite = createAnimatedSprite({
    ...config,
    size: "helper"
  });
  sprite.classList.add("sprite-helper");
  return sprite;
}

/**
 * Creates a room/home pup sprite (absolute positioned, wandering)
 * @param {Object} config - Sprite configuration
 * @returns {HTMLElement} The room pup sprite element
 */
export function createRoomPupSprite(config) {
  const sprite = createAnimatedSprite({
    ...config,
    size: "room-pup"
  });
  sprite.classList.add("sprite-room-pup");
  return sprite;
}

// ============================================================
// SPRITE STATE MANAGEMENT
// ============================================================

/**
 * Changes the animation state of a sprite
 * @param {HTMLElement} spriteContainer - The sprite container element
 * @param {string} newState - New animation state
 * @param {Object} stateConfig - State configuration (from pup data)
 */
export function setSpriteState(spriteContainer, newState, stateConfig = {}) {
  if (!spriteContainer) return;

  const currentState = spriteContainer.dataset.state;
  if (currentState === newState) return;

  spriteContainer.dataset.state = newState;

  // Get state-specific settings
  const config = stateConfig[newState] || ANIMATION_STATES[newState] || ANIMATION_STATES.idle;

  // Update all layers
  const layers = spriteContainer.querySelectorAll(".sprite-layer");
  layers.forEach(layer => {
    // Update sprite sheet if state has different sheet
    if (config.sheet && layer.classList.contains("sprite-base")) {
      layer.style.backgroundImage = `url('${config.sheet}')`;
    }

    // Update animation timing
    const duration = (config.frameCount || 4) * (config.frameDuration || 400);
    layer.style.animationDuration = `${duration}ms`;
    layer.style.animationName = `spriteFrames${config.frameCount || 4}`;
    layer.style.animationIterationCount = config.loop ? "infinite" : "1";

    // Restart animation
    layer.style.animation = "none";
    // Force reflow
    void layer.offsetHeight;
    layer.style.animation = "";
  });

  // Add state class
  spriteContainer.classList.remove("state-idle", "state-walk", "state-wag", "state-sleep", "state-happy");
  spriteContainer.classList.add(`state-${newState}`);
}

/**
 * Pauses sprite animation
 * @param {HTMLElement} spriteContainer - The sprite container element
 */
export function pauseSprite(spriteContainer) {
  if (!spriteContainer) return;
  spriteContainer.classList.add("sprite-paused");
}

/**
 * Resumes sprite animation
 * @param {HTMLElement} spriteContainer - The sprite container element
 */
export function resumeSprite(spriteContainer) {
  if (!spriteContainer) return;
  spriteContainer.classList.remove("sprite-paused");
}

// ============================================================
// ACCESSORY MANAGEMENT
// ============================================================

/**
 * Equips an accessory to a sprite
 * @param {HTMLElement} spriteContainer - The sprite container element
 * @param {string} slot - Accessory slot (neck, head, back, etc.)
 * @param {string} sheetUrl - URL to accessory sprite sheet
 */
export function equipAccessory(spriteContainer, slot, sheetUrl) {
  if (!spriteContainer) return;

  // Remove existing accessory in this slot
  unequipAccessory(spriteContainer, slot);

  if (!sheetUrl) return;

  // Get frame count from container
  const frameCount = parseInt(spriteContainer.dataset.frameCount) || 4;

  // Create new accessory layer
  const accessoryLayer = document.createElement("div");
  accessoryLayer.className = `sprite-layer sprite-accessory sprite-${slot}`;
  accessoryLayer.dataset.slot = slot;
  accessoryLayer.style.backgroundImage = `url('${sheetUrl}')`;
  accessoryLayer.style.animationName = `spriteFrames${frameCount}`;

  // Sync with base layer animation
  const baseLayer = spriteContainer.querySelector(".sprite-base");
  if (baseLayer) {
    accessoryLayer.style.animationDuration = baseLayer.style.animationDuration || "2000ms";
  }

  spriteContainer.appendChild(accessoryLayer);
}

/**
 * Removes an accessory from a sprite
 * @param {HTMLElement} spriteContainer - The sprite container element
 * @param {string} slot - Accessory slot to remove
 */
export function unequipAccessory(spriteContainer, slot) {
  if (!spriteContainer) return;

  const existing = spriteContainer.querySelector(`.sprite-${slot}`);
  if (existing) {
    existing.remove();
  }
}

/**
 * Gets all equipped accessories on a sprite
 * @param {HTMLElement} spriteContainer - The sprite container element
 * @returns {Object} Map of slot to element
 */
export function getEquippedAccessories(spriteContainer) {
  if (!spriteContainer) return {};

  const accessories = {};
  const layers = spriteContainer.querySelectorAll(".sprite-accessory");
  layers.forEach(layer => {
    const slot = layer.dataset.slot;
    if (slot) {
      accessories[slot] = layer;
    }
  });
  return accessories;
}

// ============================================================
// SPRITE SHEET UTILITIES
// ============================================================

/**
 * Preloads sprite sheet images for faster display
 * @param {string[]} urls - Array of sprite sheet URLs
 * @returns {Promise} Resolves when all images are loaded
 */
export function preloadSpriteSheets(urls) {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(new Error(`Failed to load: ${url}`));
      img.src = url;
    });
  });
  return Promise.all(promises);
}

/**
 * Generates CSS keyframes for a given frame count
 * This is useful for dynamically supporting different frame counts
 * @param {number} frameCount - Number of frames
 * @returns {string} CSS keyframes rule
 */
export function generateFrameKeyframes(frameCount) {
  const stepPercent = 100 / frameCount;
  let keyframes = `@keyframes spriteFrames${frameCount} {\n`;

  for (let i = 0; i < frameCount; i++) {
    const startPercent = i * stepPercent;
    const endPercent = (i + 1) * stepPercent;
    const position = (i / frameCount) * 100;

    keyframes += `  ${startPercent.toFixed(2)}% { background-position: ${position}% 0; }\n`;

    // Hold frame until next
    if (i < frameCount - 1) {
      keyframes += `  ${(endPercent - 0.01).toFixed(2)}% { background-position: ${position}% 0; }\n`;
    }
  }

  keyframes += `  100% { background-position: 0% 0; }\n`;
  keyframes += `}`;

  return keyframes;
}

/**
 * Injects dynamic keyframes into the document
 * @param {number[]} frameCounts - Array of frame counts to support
 */
export function injectSpriteKeyframes(frameCounts = [2, 3, 4, 6, 8]) {
  // Check if already injected
  if (document.getElementById("sprite-keyframes")) return;

  const style = document.createElement("style");
  style.id = "sprite-keyframes";

  let css = "";
  frameCounts.forEach(count => {
    css += generateFrameKeyframes(count) + "\n\n";
  });

  style.textContent = css;
  document.head.appendChild(style);
}

// ============================================================
// INITIALIZATION
// ============================================================

/**
 * Initialize the sprite animation system
 * Call this on page load
 */
export function initSpriteSystem() {
  // Inject keyframe animations for common frame counts
  injectSpriteKeyframes([2, 3, 4, 6, 8]);

  console.log("[Sprite] Animation system initialized");
}

// Auto-initialize if DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSpriteSystem);
} else {
  initSpriteSystem();
}
