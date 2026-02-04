// js/locations/home.js
// Game engine for the Home scene
// Features: Room customization, pup care, social visits, letterbox

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "../core/shared.js";
import { getCurrentPlayer, savePlayer } from "../core/player-data.js";
import {
  WALL_STYLES,
  FLOOR_STYLES,
  FREE_STARTER_ITEMS,
  HOME_ITEM_PROPERTIES,
  PLACEMENT_ZONES,
  STUDYPUPS,
  FEEDING_CONFIG,
  PRESET_MESSAGES,
  HOME_TUTORIAL,
  TEDDY_HOME_DIALOGUES,
  getWallStyle,
  getFloorStyle,
  getAvailableWalls,
  getAvailableFloors,
  canPlaceInZone,
  getHomeItemProperties,
  getFeedingMessage,
  getRandomTeddyDialogue,
  getItemHint,
  getStudyPup,
  containsBannedWords,
  createDefaultHomeState,
  getAccessorySheetUrl
} from "../../data/home-scenes.js";
import { SHOP_ITEMS, getItem } from "../../data/shop-scenes.js";
import {
  createAnimatedSprite,
  setSpriteState,
  equipAccessory,
  unequipAccessory,
  preloadSpriteSheets,
  initSpriteSystem
} from "../core/sprite-animation.js";

// ============================================================
// HOME STATE
// ============================================================

let homeState = {
  // Mode
  isEditMode: false,
  isVisiting: false,
  visitingPlayerId: null,

  // Drag state
  isDragging: false,
  draggedItem: null,
  draggedElement: null,
  dragStartPos: { x: 0, y: 0 },
  dragOffset: { x: 0, y: 0 },

  // Selection
  selectedItem: null,
  selectedPlacementItemId: null,

  // Edit panel
  activeTab: "interior",

  // Letterbox
  activeLetterboxTab: "inbox",
  selectedPreset: null,
  selectedStationery: null,
  sendingTo: null,

  // Pups
  pupAnimationFrames: {},

  // Tutorial
  tutorialStep: 0,
  tutorialActive: false
};

// Cache DOM elements
let elements = {};

// ============================================================
// MAIN INITIALIZATION
// ============================================================

onReady(() => {
  log("Home Engine loaded");
  initGameMenu("home");

  // Initialize sprite animation system
  initSpriteSystem();

  // Cache DOM elements
  cacheElements();

  // Load game state
  const gameState = loadGameState() || createNewGameState();
  const player = getCurrentPlayer();

  // Initialize home state if needed
  if (!gameState.homeState) {
    gameState.homeState = createDefaultHomeState();
    saveGameState(gameState);
  }

  // Preload sprite sheets for smoother animations
  preloadPupSpriteSheets();

  // Initialize UI
  initializeHome(gameState, player);

  // Setup event listeners
  setupEventListeners(gameState);

  // Update displays
  updateGemDisplay(player);
  updateFeedingDisplay(gameState.homeState.feeding);

  // Initialize helper sprite with equipped accessories
  initializeHelperSprite(gameState);

  // Check if first visit - show tutorial
  if (gameState.homeState.firstVisit) {
    setTimeout(() => startTutorial(gameState), 500);
  }

  // Start pup animations
  startPupAnimations(gameState.homeState.pups);

  // Check feeding status
  checkFeedingStatus(gameState);

  log("Home initialized");
});

// ============================================================
// DOM CACHING
// ============================================================

function cacheElements() {
  elements = {
    // Room layers
    roomContainer: document.getElementById("roomContainer"),
    roomBackWall: document.getElementById("roomBackWall"),
    roomSideWall: document.getElementById("roomSideWall"),
    roomFloor: document.getElementById("roomFloor"),
    placedItemsLayer: document.getElementById("placedItemsLayer"),
    studypupsLayer: document.getElementById("studypupsLayer"),
    dropPreview: document.getElementById("dropPreview"),

    // Zones
    wallDecorZone: document.getElementById("wallDecorZone"),
    floorZone: document.getElementById("floorZone"),
    sideWallDecorZone: document.getElementById("sideWallDecorZone"),

    // Feeding
    feedingStation: document.getElementById("feedingStation"),
    foodBowl: document.getElementById("foodBowl"),
    waterBowl: document.getElementById("waterBowl"),
    bowlFill: document.getElementById("bowlFill"),
    waterFill: document.getElementById("waterFill"),
    feedingReminder: document.getElementById("feedingReminder"),

    // HUD
    modeToggleBtn: document.getElementById("modeToggleBtn"),
    socialBtn: document.getElementById("socialBtn"),
    letterboxBtn: document.getElementById("letterboxBtn"),
    letterCount: document.getElementById("letterCount"),
    gemCount: document.getElementById("gemCount"),

    // Edit panel
    editPanel: document.getElementById("editPanel"),
    editPanelClose: document.getElementById("editPanelClose"),
    wallOptions: document.getElementById("wallOptions"),
    floorOptions: document.getElementById("floorOptions"),
    furnitureGrid: document.getElementById("furnitureGrid"),
    decorGrid: document.getElementById("decorGrid"),
    pupItemsGrid: document.getElementById("pupItemsGrid"),
    profileInventoryList: document.getElementById("profileInventoryList"),

    // Teddy
    teddyHelper: document.getElementById("teddyHelper"),
    teddySprite: document.getElementById("teddySprite"),
    teddySpeech: document.getElementById("teddySpeech"),
    teddySpeechText: document.getElementById("teddySpeechText"),
    teddySpeechBtn: document.getElementById("teddySpeechBtn"),

    // Modals
    pupModal: document.getElementById("pupModal"),
    visitModal: document.getElementById("visitModal"),
    letterboxModal: document.getElementById("letterboxModal"),
    itemTooltip: document.getElementById("itemTooltip"),
    visitingBanner: document.getElementById("visitingBanner"),
    tutorialOverlay: document.getElementById("tutorialOverlay")
  };
}

// ============================================================
// HOME INITIALIZATION
// ============================================================

function initializeHome(gameState, player) {
  const hs = gameState.homeState;

  // Apply wall and floor styles
  applyWallStyle(hs.wallStyle);
  applyFloorStyle(hs.floorStyle);

  // Render placed items
  const profilePlacements = getProfilePlacements(player);
  syncGameStatePlacements(gameState, profilePlacements);
  renderPlacedItems(profilePlacements);

  // Render pups
  renderStudyPups(hs.pups, gameState);

  // Build edit panel options
  buildWallOptions(hs);
  buildFloorOptions(hs);
  buildInventoryGrids(player, profilePlacements);
  renderProfileInventoryList(player);

  // Update letterbox count
  updateLetterboxCount(hs.receivedMessages);
}

// ============================================================
// ROOM STYLING
// ============================================================

function applyWallStyle(wallId) {
  const style = getWallStyle(wallId);
  if (!style) return;

  if (style.gradient) {
    elements.roomBackWall.style.background = style.gradient;
  } else if (style.pattern) {
    elements.roomBackWall.style.background = style.pattern;
  } else if (style.color) {
    elements.roomBackWall.style.background = style.color;
  }

  // Apply side wall variant (slightly darker)
  if (style.color) {
    elements.roomSideWall.style.background = `linear-gradient(90deg, ${darkenColor(style.color, 10)} 0%, ${style.color} 100%)`;
  }
}

function applyFloorStyle(floorId) {
  const style = getFloorStyle(floorId);
  if (!style) return;

  if (style.gradient) {
    elements.roomFloor.style.background = style.gradient;
  } else if (style.pattern) {
    elements.roomFloor.style.background = style.pattern;
  } else if (style.color) {
    elements.roomFloor.style.background = style.color;
  }
}

function darkenColor(hex, percent) {
  // Simple hex color darkener
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max((num >> 16) - amt, 0);
  const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
  const B = Math.max((num & 0x0000FF) - amt, 0);
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

// ============================================================
// PROFILE PLACEMENTS
// ============================================================

function getProfilePlacements(player) {
  if (!player) return [];
  if (!player.homeLayout) player.homeLayout = {};
  if (!Array.isArray(player.homeLayout.placedItems)) {
    player.homeLayout.placedItems = [];
  }
  return player.homeLayout.placedItems;
}

function saveProfilePlacements(placements) {
  const player = getCurrentPlayer();
  if (!player) return;
  if (!player.homeLayout) player.homeLayout = {};
  player.homeLayout.placedItems = placements;
  savePlayer(player);
}

function syncGameStatePlacements(gameState, placements) {
  if (!gameState.homeState) {
    gameState.homeState = createDefaultHomeState();
  }
  gameState.homeState.placedItems = placements.map(item => normalizePlacement(item));
  saveGameState(gameState);
}

function normalizePlacement(item) {
  if (!item) return item;
  const x = item.x ?? item.position?.x ?? 50;
  const y = item.y ?? item.position?.y ?? 50;
  return {
    ...item,
    x,
    y,
    position: { x, y },
    instanceId: item.instanceId || `${item.itemId}-${Math.floor(x * 100)}-${Math.floor(y * 100)}`
  };
}

// ============================================================
// PLACED ITEMS RENDERING
// ============================================================

function renderPlacedItems(placedItems) {
  elements.placedItemsLayer.innerHTML = "";

  placedItems.forEach(item => {
    const itemEl = createPlacedItemElement(normalizePlacement(item));
    elements.placedItemsLayer.appendChild(itemEl);
  });
}

function createPlacedItemElement(item) {
  const el = document.createElement("div");
  el.className = "placed-item";
  el.dataset.instanceId = item.instanceId;
  el.dataset.itemId = item.itemId;
  el.dataset.zone = item.zone;

  // Get item data
  let itemData = FREE_STARTER_ITEMS.find(i => i.id === item.itemId);
  if (!itemData) {
    const shopItem = getItem(item.itemId);
    const homeProps = getHomeItemProperties(item.itemId);
    if (shopItem && homeProps) {
      itemData = { ...shopItem, ...homeProps };
    }
  }

  if (!itemData) {
    itemData = { icon: "❓", name: "Unknown", size: { width: 50, height: 50 } };
  }

  // Set size
  el.style.width = `${itemData.size?.width || 50}px`;
  el.style.height = `${itemData.size?.height || 50}px`;

  // Set position
  el.style.left = `${item.position.x}%`;
  el.style.top = `${item.position.y}%`;
  el.style.transform = "translate(-50%, -50%)";

  // Add size class
  const area = (itemData.size?.width || 50) * (itemData.size?.height || 50);
  if (area < 3000) el.classList.add("small");
  else if (area > 8000) el.classList.add("large");

  // Inner content
  el.innerHTML = `<span class="placed-item-icon">${itemData.icon}</span>`;

  // Store item data for later
  el._itemData = itemData;

  return el;
}

// ============================================================
// SPRITE SHEET PRELOADING
// ============================================================

/**
 * Preloads sprite sheets for all unlocked pups
 * This prevents flickering when animations start
 */
function preloadPupSpriteSheets() {
  const sheetsToLoad = [];

  // Collect all sprite sheet URLs from STUDYPUPS
  Object.values(STUDYPUPS).forEach(pup => {
    if (pup.spriteSheets) {
      Object.values(pup.spriteSheets).forEach(config => {
        if (config.sheet) {
          sheetsToLoad.push(config.sheet);
        }
      });
    }
  });

  // Preload all sheets (non-blocking)
  if (sheetsToLoad.length > 0) {
    preloadSpriteSheets(sheetsToLoad)
      .then(() => log("Sprite sheets preloaded"))
      .catch(err => log("Some sprite sheets failed to load:", err));
  }
}

/**
 * Initializes the helper sprite (Teddy in corner) with proper state and accessories
 */
function initializeHelperSprite(gameState) {
  const spriteContainer = document.getElementById("teddySprite");
  const fallbackImg = document.getElementById("teddySpriteFallback");

  if (!spriteContainer) return;

  // Get current helper pup (default to teddy)
  const currentHelper = gameState.settings?.currentHelper || "teddy";
  const pupData = getStudyPup(currentHelper);

  if (!pupData || !pupData.spriteSheets?.idle) {
    // Show fallback image if no sprite sheets
    if (fallbackImg) {
      fallbackImg.style.display = "";
      spriteContainer.style.display = "none";
    }
    return;
  }

  // Update sprite container with correct sprite sheet
  const baseLayer = spriteContainer.querySelector(".sprite-base");
  if (baseLayer && pupData.spriteSheets.idle.sheet) {
    baseLayer.style.backgroundImage = `url('${pupData.spriteSheets.idle.sheet}')`;
    const frameCount = pupData.spriteSheets.idle.frameCount || 4;
    baseLayer.style.backgroundSize = `${frameCount * 100}% 100%`;
  }

  // Apply equipped accessories for the helper
  const equippedItems = gameState.inventory?.equippedItems?.[currentHelper] || {};

  Object.entries(equippedItems).forEach(([slot, itemId]) => {
    if (itemId) {
      const accessoryUrl = getAccessorySheetUrl(itemId, "idle");
      const slotLayer = spriteContainer.querySelector(`.sprite-${slot}`);

      if (slotLayer && accessoryUrl) {
        slotLayer.style.backgroundImage = `url('${accessoryUrl}')`;
        slotLayer.style.display = "";
        slotLayer.dataset.itemId = itemId;
      }
    }
  });

  // Hide fallback, show sprite
  if (fallbackImg) {
    fallbackImg.style.display = "none";
  }
  spriteContainer.style.display = "";

  log("Helper sprite initialized with accessories");
}

/**
 * Equips an accessory to the helper sprite
 * @param {string} slot - Accessory slot (neck, head, etc.)
 * @param {string} itemId - Shop item ID
 */
function equipHelperAccessory(slot, itemId) {
  const spriteContainer = document.getElementById("teddySprite");
  if (!spriteContainer) return;

  const slotLayer = spriteContainer.querySelector(`.sprite-${slot}`);
  if (!slotLayer) return;

  if (itemId) {
    const accessoryUrl = getAccessorySheetUrl(itemId, "idle");
    if (accessoryUrl) {
      slotLayer.style.backgroundImage = `url('${accessoryUrl}')`;
      slotLayer.style.display = "";
      slotLayer.dataset.itemId = itemId;
    }
  } else {
    // Unequip
    slotLayer.style.display = "none";
    slotLayer.style.backgroundImage = "";
    delete slotLayer.dataset.itemId;
  }

  // Save to game state
  const gameState = loadGameState();
  const currentHelper = gameState.settings?.currentHelper || "teddy";

  if (!gameState.inventory) gameState.inventory = {};
  if (!gameState.inventory.equippedItems) gameState.inventory.equippedItems = {};
  if (!gameState.inventory.equippedItems[currentHelper]) {
    gameState.inventory.equippedItems[currentHelper] = {};
  }

  gameState.inventory.equippedItems[currentHelper][slot] = itemId || null;
  saveGameState(gameState);
}

// Make equip function globally accessible for UI
window.equipHelperAccessory = equipHelperAccessory;

// ============================================================
// STUDYPUPS RENDERING & ANIMATION
// ============================================================

function renderStudyPups(pups, gameState) {
  elements.studypupsLayer.innerHTML = "";

  const unlockedPups = gameState.progress?.studyPupsUnlocked || ["teddy"];

  unlockedPups.forEach(pupId => {
    const pupState = pups[pupId];
    if (!pupState || !pupState.isHome) return;

    const pupData = getStudyPup(pupId);
    if (!pupData) return;

    const pupEl = createPupElement(pupId, pupData, pupState);
    elements.studypupsLayer.appendChild(pupEl);
  });
}

function createPupElement(pupId, pupData, pupState) {
  const el = document.createElement("div");
  el.className = "home-pup";
  el.dataset.pupId = pupId;

  // Position
  el.style.left = `${pupState.position.x}%`;
  el.style.top = `${pupState.position.y}%`;
  el.style.transform = "translate(-50%, -50%)";

  // Determine initial state
  const initialState = pupState.energy < 20 ? "sleep" : "idle";

  // Check if pup has sprite sheets configured
  if (pupData.spriteSheets && pupData.spriteSheets[initialState]) {
    const sheetConfig = pupData.spriteSheets[initialState];

    // Create animated sprite container
    const spriteContainer = document.createElement("div");
    spriteContainer.className = `sprite-container sprite-home-pup state-${initialState}`;
    spriteContainer.dataset.spriteId = pupId;
    spriteContainer.dataset.state = initialState;
    spriteContainer.dataset.frameCount = sheetConfig.frameCount || 4;
    spriteContainer.dataset.fallback = pupData.fallbackEmoji || "🐕";

    // Create base layer
    const baseLayer = document.createElement("div");
    baseLayer.className = "sprite-layer sprite-base";
    baseLayer.style.backgroundImage = `url('${sheetConfig.sheet}')`;
    // Adjust background-size based on frame count
    baseLayer.style.backgroundSize = `${(sheetConfig.frameCount || 4) * 100}% 100%`;
    spriteContainer.appendChild(baseLayer);

    // Create accessory layers (initially hidden)
    const accessorySlots = ["neck", "head", "back", "face"];
    accessorySlots.forEach(slot => {
      const accessoryLayer = document.createElement("div");
      accessoryLayer.className = `sprite-layer sprite-accessory sprite-${slot}`;
      accessoryLayer.dataset.slot = slot;
      accessoryLayer.style.display = "none";
      accessoryLayer.style.backgroundSize = `${(sheetConfig.frameCount || 4) * 100}% 100%`;
      spriteContainer.appendChild(accessoryLayer);
    });

    el.appendChild(spriteContainer);

    // Apply equipped accessories from game state
    const gameState = loadGameState();
    const equippedItems = gameState?.inventory?.equippedItems?.[pupId] || {};
    Object.entries(equippedItems).forEach(([slot, itemId]) => {
      if (itemId) {
        const accessoryUrl = getAccessorySheetUrl(itemId, initialState);
        if (accessoryUrl) {
          const slotLayer = spriteContainer.querySelector(`.sprite-${slot}`);
          if (slotLayer) {
            slotLayer.style.backgroundImage = `url('${accessoryUrl}')`;
            slotLayer.style.display = "";
          }
        }
      }
    });

    // Store reference for animations
    el._spriteContainer = spriteContainer;
  } else {
    // Fallback to static image
    el.innerHTML = `
      <img
        src="${pupData.sprite}"
        alt="${pupData.name}"
        class="home-pup-sprite"
        onerror="this.parentElement.innerHTML='<span style=\\"font-size:60px\\">${pupData.fallbackEmoji || '🐕'}</span>'"
      >
    `;
  }

  // Check if sleeping (low energy)
  if (pupState.energy < 20) {
    el.classList.add("sleeping");
  }

  return el;
}

function startPupAnimations(pups) {
  // Cancel existing animations
  Object.values(homeState.pupAnimationFrames).forEach(id => cancelAnimationFrame(id));
  homeState.pupAnimationFrames = {};

  // Start wandering for each pup
  Object.entries(pups).forEach(([pupId, pupState]) => {
    if (pupState.isHome && pupState.energy >= 20) {
      schedulePupWander(pupId, pupState);
    }
  });
}

function schedulePupWander(pupId, pupState) {
  // Random delay before next movement (5-15 seconds)
  const delay = 5000 + Math.random() * 10000;

  setTimeout(() => {
    const pupEl = document.querySelector(`[data-pup-id="${pupId}"]`);
    if (!pupEl || homeState.isEditMode) return;

    // Generate new position within bounds
    const newX = 25 + Math.random() * 50; // 25% to 75%
    const newY = 55 + Math.random() * 30; // 55% to 85% (floor area)

    // Get pup data for sprite sheets
    const pupData = getStudyPup(pupId);

    // Change to walk state if using sprite sheets
    const spriteContainer = pupEl._spriteContainer || pupEl.querySelector(".sprite-container");
    if (spriteContainer && pupData?.spriteSheets?.walk) {
      changePupSpriteState(spriteContainer, "walk", pupData);
    }

    // Animate movement
    pupEl.classList.add("walking");
    pupEl.style.transition = "left 2s ease, top 2s ease";
    pupEl.style.left = `${newX}%`;
    pupEl.style.top = `${newY}%`;

    // Update state
    pupState.position = { x: newX, y: newY };

    setTimeout(() => {
      pupEl.classList.remove("walking");
      pupEl.style.transition = "";

      // Return to idle state
      if (spriteContainer && pupData?.spriteSheets?.idle) {
        changePupSpriteState(spriteContainer, "idle", pupData);
      }

      // Save position
      const gameState = loadGameState();
      if (gameState?.homeState?.pups?.[pupId]) {
        gameState.homeState.pups[pupId].position = { x: newX, y: newY };
        saveGameState(gameState);
      }

      // Schedule next wander
      schedulePupWander(pupId, pupState);
    }, 2000);
  }, delay);
}

/**
 * Changes the sprite state of a pup (idle, walk, sleep, etc.)
 * Updates the sprite sheet and animation timing
 */
function changePupSpriteState(spriteContainer, newState, pupData) {
  if (!spriteContainer || !pupData?.spriteSheets) return;

  const stateConfig = pupData.spriteSheets[newState];
  if (!stateConfig) return;

  const currentState = spriteContainer.dataset.state;
  if (currentState === newState) return;

  spriteContainer.dataset.state = newState;

  // Update state class
  spriteContainer.classList.remove("state-idle", "state-walk", "state-wag", "state-sleep", "state-happy");
  spriteContainer.classList.add(`state-${newState}`);

  // Update base layer sprite sheet
  const baseLayer = spriteContainer.querySelector(".sprite-base");
  if (baseLayer && stateConfig.sheet) {
    baseLayer.style.backgroundImage = `url('${stateConfig.sheet}')`;
    baseLayer.style.backgroundSize = `${(stateConfig.frameCount || 4) * 100}% 100%`;

    // Update animation timing
    const duration = (stateConfig.frameCount || 4) * (stateConfig.frameDuration || 400);
    baseLayer.style.animationDuration = `${duration}ms`;
  }

  // Update accessory layers to match state
  const accessoryLayers = spriteContainer.querySelectorAll(".sprite-accessory");
  accessoryLayers.forEach(layer => {
    if (layer.style.display !== "none") {
      // Get the item ID from data attribute (if stored)
      const itemId = layer.dataset.itemId;
      if (itemId) {
        const accessoryUrl = getAccessorySheetUrl(itemId, newState);
        if (accessoryUrl) {
          layer.style.backgroundImage = `url('${accessoryUrl}')`;
        }
      }

      // Update animation timing to match base
      const duration = (stateConfig.frameCount || 4) * (stateConfig.frameDuration || 400);
      layer.style.animationDuration = `${duration}ms`;
      layer.style.backgroundSize = `${(stateConfig.frameCount || 4) * 100}% 100%`;
    }
  });
}

// ============================================================
// EDIT PANEL
// ============================================================

function buildWallOptions(homeState) {
  const container = elements.wallOptions;
  container.innerHTML = "";

  const availableWalls = getAvailableWalls(homeState.unlockedWalls || []);

  Object.values(WALL_STYLES).forEach(wall => {
    const isUnlocked = wall.free || (homeState.unlockedWalls || []).includes(wall.id);
    const isSelected = homeState.wallStyle === wall.id;

    const option = document.createElement("div");
    option.className = `option-item ${isSelected ? "selected" : ""} ${!isUnlocked ? "locked" : ""}`;
    option.dataset.wallId = wall.id;

    // Background preview
    if (wall.gradient) {
      option.style.background = wall.gradient;
    } else if (wall.color) {
      option.style.background = wall.color;
    }

    option.innerHTML = `
      <span class="option-item-icon">${wall.icon}</span>
      <span class="option-item-name">${wall.name}</span>
    `;

    if (isUnlocked) {
      option.addEventListener("click", () => selectWall(wall.id));
    }

    container.appendChild(option);
  });
}

function buildFloorOptions(homeState) {
  const container = elements.floorOptions;
  container.innerHTML = "";

  Object.values(FLOOR_STYLES).forEach(floor => {
    const isUnlocked = floor.free || (homeState.unlockedFloors || []).includes(floor.id);
    const isSelected = homeState.floorStyle === floor.id;

    const option = document.createElement("div");
    option.className = `option-item ${isSelected ? "selected" : ""} ${!isUnlocked ? "locked" : ""}`;
    option.dataset.floorId = floor.id;

    // Background preview
    if (floor.gradient) {
      option.style.background = floor.gradient;
    } else if (floor.color) {
      option.style.background = floor.color;
    }

    option.innerHTML = `
      <span class="option-item-icon">${floor.icon}</span>
      <span class="option-item-name">${floor.name}</span>
    `;

    if (isUnlocked) {
      option.addEventListener("click", () => selectFloor(floor.id));
    }

    container.appendChild(option);
  });
}

function selectWall(wallId) {
  const gameState = loadGameState();
  gameState.homeState.wallStyle = wallId;
  saveGameState(gameState);

  applyWallStyle(wallId);

  // Update selection UI
  document.querySelectorAll("#wallOptions .option-item").forEach(opt => {
    opt.classList.toggle("selected", opt.dataset.wallId === wallId);
  });

  showTeddySpeech("Ooh, I love the new walls! 🏠");
}

function selectFloor(floorId) {
  const gameState = loadGameState();
  gameState.homeState.floorStyle = floorId;
  saveGameState(gameState);

  applyFloorStyle(floorId);

  // Update selection UI
  document.querySelectorAll("#floorOptions .option-item").forEach(opt => {
    opt.classList.toggle("selected", opt.dataset.floorId === floorId);
  });

  showTeddySpeech("New floors! Time to do zoomies! 🐕");
}

function buildInventoryGrids(player, placedItems) {
  const inventory = player?.inventory || [];
  const placedIds = new Set((placedItems || []).map(i => i.itemId));

  // Furniture (floor items with placement type furniture, pet-bed, etc.)
  const furnitureItems = inventory.filter(inv => {
    const props = getHomeItemProperties(inv.itemId);
    return props && ["furniture", "pet-bed", "rug"].includes(props.type);
  });
  buildInventoryGrid(elements.furnitureGrid, furnitureItems, placedIds, "emptyFurniture");

  // Decor (wall items, lights, etc.)
  const decorItems = inventory.filter(inv => {
    const props = getHomeItemProperties(inv.itemId);
    return props && ["poster", "frame", "window", "lights", "wall-decor", "plant-floor"].includes(props.type);
  });
  buildInventoryGrid(elements.decorGrid, decorItems, placedIds, "emptyDecor");

  // Pup items (food, accessories for pups)
  const pupItems = inventory.filter(inv => {
    const shopItem = getItem(inv.itemId);
    return shopItem && (shopItem.category === "food" || shopItem.forPups);
  });
  buildInventoryGrid(elements.pupItemsGrid, pupItems, placedIds, "emptyPupItems");
}

function buildInventoryGrid(container, items, placedIds, emptyId) {
  container.innerHTML = "";

  const emptyEl = document.getElementById(emptyId);

  if (items.length === 0) {
    if (emptyEl) emptyEl.style.display = "block";
    return;
  }

  if (emptyEl) emptyEl.style.display = "none";

  items.forEach(inv => {
    const shopItem = getItem(inv.itemId);
    if (!shopItem) return;

    const itemEl = document.createElement("div");
    itemEl.className = "inventory-item";
    itemEl.dataset.itemId = inv.itemId;

    if (placedIds.has(inv.itemId)) {
      itemEl.classList.add("placed");
    }

    itemEl.innerHTML = `
      <span class="inventory-item-icon">${shopItem.icon}</span>
      <span class="inventory-item-name">${shopItem.name}</span>
      ${inv.qty > 1 ? `<span class="inventory-item-qty">x${inv.qty}</span>` : ""}
    `;

    // Make draggable
    itemEl.draggable = true;
    itemEl.addEventListener("dragstart", (e) => handleInventoryDragStart(e, inv.itemId));
    itemEl.addEventListener("dragend", handleDragEnd);

    container.appendChild(itemEl);
  });
}

function renderProfileInventoryList(player) {
  if (!elements.profileInventoryList) return;
  const inventory = player?.inventory || [];

  elements.profileInventoryList.innerHTML = "";

  if (inventory.length === 0) {
    elements.profileInventoryList.textContent = "No items yet.";
    return;
  }

  inventory.forEach(inv => {
    const itemRow = document.createElement("button");
    itemRow.type = "button";
    itemRow.className = "inventory-list-item";
    itemRow.dataset.itemId = inv.itemId;
    itemRow.textContent = `${inv.itemId} x${inv.qty}`;

    itemRow.addEventListener("click", () => {
      homeState.selectedPlacementItemId = inv.itemId;
      elements.profileInventoryList.querySelectorAll(".inventory-list-item").forEach(el => {
        el.classList.toggle("selected", el.dataset.itemId === inv.itemId);
      });
      showTeddySpeech(`Selected ${inv.itemId}! Tap the room to place it.`);
    });

    elements.profileInventoryList.appendChild(itemRow);
  });
}

// ============================================================
// DRAG AND DROP SYSTEM
// ============================================================

function handleInventoryDragStart(e, itemId) {
  if (!homeState.isEditMode) return;

  homeState.isDragging = true;
  homeState.draggedItem = { itemId, isNew: true };

  e.target.classList.add("dragging");

  // Set drag image
  const shopItem = getItem(itemId);
  if (shopItem) {
    const ghost = document.createElement("div");
    ghost.textContent = shopItem.icon;
    ghost.style.fontSize = "48px";
    ghost.style.position = "absolute";
    ghost.style.top = "-1000px";
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 24, 24);
    setTimeout(() => ghost.remove(), 0);
  }

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", itemId);
}

function handlePlacedItemDragStart(e, instanceId) {
  if (!homeState.isEditMode) return;

  homeState.isDragging = true;

  const player = getCurrentPlayer();
  const placedItem = getProfilePlacements(player).find(i => i.instanceId === instanceId);

  if (placedItem) {
    homeState.draggedItem = { ...placedItem, isNew: false };
    e.target.classList.add("dragging");

    const rect = e.target.getBoundingClientRect();
    homeState.dragOffset = {
      x: e.clientX - rect.left - rect.width / 2,
      y: e.clientY - rect.top - rect.height / 2
    };
  }

  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", instanceId);
}

function handleDragOver(e) {
  if (!homeState.isDragging || !homeState.isEditMode) return;

  e.preventDefault();
  e.dataTransfer.dropEffect = "move";

  // Show drop preview
  showDropPreview(e);
}

function showDropPreview(e) {
  const preview = elements.dropPreview;
  const roomRect = elements.roomContainer.getBoundingClientRect();

  // Calculate position as percentage
  const x = ((e.clientX - roomRect.left) / roomRect.width) * 100;
  const y = ((e.clientY - roomRect.top) / roomRect.height) * 100;

  // Determine zone
  const zone = getZoneAtPosition(x, y);

  // Check if valid placement
  let isValid = false;
  if (homeState.draggedItem) {
    const itemId = homeState.draggedItem.itemId;
    let itemType;

    const starterItem = FREE_STARTER_ITEMS.find(i => i.id === itemId);
    if (starterItem) {
      itemType = starterItem.type;
    } else {
      const props = getHomeItemProperties(itemId);
      if (props) itemType = props.type;
    }

    if (itemType && zone) {
      isValid = canPlaceInZone(itemType, zone);
    }
  }

  // Position preview
  preview.style.left = `${x}%`;
  preview.style.top = `${y}%`;
  preview.style.width = "60px";
  preview.style.height = "60px";
  preview.style.transform = "translate(-50%, -50%)";

  preview.className = `drop-preview visible ${isValid ? "valid" : "invalid"}`;
}

function getZoneAtPosition(x, y) {
  // Side wall zone (left 15%)
  if (x < 15) {
    return "side-wall";
  }

  // Floor zone (bottom 35%)
  if (y > 65) {
    return "floor";
  }

  // Wall zone (top 65%, after side wall)
  return "wall";
}

function handleDrop(e) {
  if (!homeState.isDragging || !homeState.isEditMode) return;

  e.preventDefault();

  const preview = elements.dropPreview;
  preview.classList.remove("visible");

  const roomRect = elements.roomContainer.getBoundingClientRect();
  const x = ((e.clientX - roomRect.left) / roomRect.width) * 100;
  const y = ((e.clientY - roomRect.top) / roomRect.height) * 100;

  const zone = getZoneAtPosition(x, y);

  // Validate placement
  const itemId = homeState.draggedItem?.itemId;
  let itemType;
  const starterItem = FREE_STARTER_ITEMS.find(i => i.id === itemId);
  if (starterItem) {
    itemType = starterItem.type;
  } else {
    const props = getHomeItemProperties(itemId);
    if (props) itemType = props.type;
  }

  if (!canPlaceInZone(itemType, zone)) {
    showTeddySpeech("That doesn't go there! Try a different spot.");
    handleDragEnd();
    return;
  }

  // Place item
  const player = getCurrentPlayer();
  if (!player) return;
  const placements = getProfilePlacements(player).map(item => normalizePlacement(item));

  if (homeState.draggedItem.isNew) {
    // New item from inventory
    const instanceId = `${itemId}-${Date.now()}`;
    placements.push({
      itemId,
      instanceId,
      x,
      y,
      position: { x, y },
      zone
    });
    showTeddySpeech("Nice! That looks great there! ✨");
  } else {
    // Moving existing item
    const existing = placements.find(
      i => i.instanceId === homeState.draggedItem.instanceId
    );
    if (existing) {
      existing.x = x;
      existing.y = y;
      existing.position = { x, y };
      existing.zone = zone;
    }
  }

  saveProfilePlacements(placements);
  syncGameStatePlacements(loadGameState() || createNewGameState(), placements);
  renderPlacedItems(placements);
  buildInventoryGrids(player, placements);

  handleDragEnd();
}

function handleDragEnd() {
  homeState.isDragging = false;
  homeState.draggedItem = null;

  elements.dropPreview.classList.remove("visible");

  document.querySelectorAll(".dragging").forEach(el => el.classList.remove("dragging"));
}

function handleRoomClick(e) {
  if (!homeState.isEditMode || homeState.isDragging) return;
  if (!homeState.selectedPlacementItemId) return;
  if (e.target.closest(".placed-item") || e.target.closest(".home-pup")) return;

  const roomRect = elements.roomContainer.getBoundingClientRect();
  const x = ((e.clientX - roomRect.left) / roomRect.width) * 100;
  const y = ((e.clientY - roomRect.top) / roomRect.height) * 100;
  const zone = getZoneAtPosition(x, y);

  const itemId = homeState.selectedPlacementItemId;
  let itemType;
  const starterItem = FREE_STARTER_ITEMS.find(i => i.id === itemId);
  if (starterItem) {
    itemType = starterItem.type;
  } else {
    const props = getHomeItemProperties(itemId);
    if (props) itemType = props.type;
  }

  if (!canPlaceInZone(itemType, zone)) {
    showTeddySpeech("That doesn't go there! Try a different spot.");
    return;
  }

  const player = getCurrentPlayer();
  if (!player) return;
  const placements = getProfilePlacements(player).map(item => normalizePlacement(item));
  const instanceId = `${itemId}-${Date.now()}`;

  placements.push({
    itemId,
    instanceId,
    x,
    y,
    position: { x, y },
    zone
  });

  saveProfilePlacements(placements);
  syncGameStatePlacements(loadGameState() || createNewGameState(), placements);
  renderPlacedItems(placements);
  buildInventoryGrids(player, placements);
}

// ============================================================
// ITEM INTERACTION
// ============================================================

function handleItemClick(e) {
  const itemEl = e.target.closest(".placed-item");
  if (!itemEl) return;

  if (homeState.isEditMode) {
    // Select item for editing
    selectPlacedItem(itemEl);
  } else {
    // Show tooltip
    showItemTooltip(itemEl, e);
  }
}

function selectPlacedItem(itemEl) {
  // Deselect previous
  document.querySelectorAll(".placed-item.selected").forEach(el => {
    el.classList.remove("selected");
  });

  itemEl.classList.add("selected");
  homeState.selectedItem = itemEl.dataset.instanceId;

  // Make draggable
  itemEl.draggable = true;
  itemEl.addEventListener("dragstart", (e) =>
    handlePlacedItemDragStart(e, itemEl.dataset.instanceId)
  );
}

function showItemTooltip(itemEl, e) {
  const itemData = itemEl._itemData;
  if (!itemData) return;

  const tooltip = elements.itemTooltip;
  tooltip.querySelector("#tooltipIcon").textContent = itemData.icon;
  tooltip.querySelector("#tooltipName").textContent = itemData.name;
  tooltip.querySelector("#tooltipHint").textContent = getItemHint(itemData.id || itemEl.dataset.itemId);

  // Position near click
  tooltip.style.left = `${e.clientX + 10}px`;
  tooltip.style.top = `${e.clientY + 10}px`;
  tooltip.classList.add("visible");

  // Hide after delay
  setTimeout(() => {
    tooltip.classList.remove("visible");
  }, 3000);
}

// ============================================================
// FEEDING SYSTEM
// ============================================================

function updateFeedingDisplay(feeding) {
  const foodPercent = (feeding.foodLevel / FEEDING_CONFIG.foodBowlMax) * 100;
  const waterPercent = (feeding.waterLevel / FEEDING_CONFIG.waterBowlMax) * 100;

  elements.bowlFill.style.height = `${foodPercent}%`;
  elements.waterFill.style.height = `${waterPercent}%`;

  // Add warning classes
  elements.foodBowl.classList.toggle("low", foodPercent <= FEEDING_CONFIG.warningThreshold && foodPercent > FEEDING_CONFIG.criticalThreshold);
  elements.foodBowl.classList.toggle("empty", foodPercent <= FEEDING_CONFIG.criticalThreshold);

  elements.waterBowl.classList.toggle("low", waterPercent <= FEEDING_CONFIG.warningThreshold && waterPercent > FEEDING_CONFIG.criticalThreshold);
  elements.waterBowl.classList.toggle("empty", waterPercent <= FEEDING_CONFIG.criticalThreshold);

  // Show reminder if needed
  if (foodPercent <= FEEDING_CONFIG.warningThreshold || waterPercent <= FEEDING_CONFIG.warningThreshold) {
    const message = foodPercent <= FEEDING_CONFIG.criticalThreshold
      ? getFeedingMessage("foodEmpty")
      : getFeedingMessage("foodLow");
    elements.feedingReminder.textContent = message;
    elements.feedingReminder.classList.add("show");
  } else {
    elements.feedingReminder.classList.remove("show");
  }
}

function checkFeedingStatus(gameState) {
  const feeding = gameState.homeState.feeding;
  const now = new Date();
  const lastFed = new Date(feeding.lastFedAt);
  const lastWatered = new Date(feeding.lastWateredAt);

  // Calculate depletion
  const hoursSinceFood = (now - lastFed) / (1000 * 60 * 60);
  const hoursSinceWater = (now - lastWatered) / (1000 * 60 * 60);

  const depletionRate = 100 / FEEDING_CONFIG.depletionIntervalHours;

  feeding.foodLevel = Math.max(0, 100 - (hoursSinceFood * depletionRate));
  feeding.waterLevel = Math.max(0, 100 - (hoursSinceWater * depletionRate));

  // Reset daily free refills
  const today = now.toISOString().split('T')[0];
  if (feeding.lastRefillResetDate !== today) {
    feeding.freeRefillsUsedToday = 0;
    feeding.lastRefillResetDate = today;
  }

  saveGameState(gameState);
  updateFeedingDisplay(feeding);

  // Check for pup escape (if not fed for X days)
  const daysSinceFood = hoursSinceFood / 24;
  if (daysSinceFood >= FEEDING_CONFIG.escapeAfterDays) {
    handlePupEscape(gameState);
  }
}

function handlePupEscape(gameState) {
  // For now, just show a warning - full escape mechanics can be added later
  showTeddySpeech("I was so hungry I almost went exploring! Please feed me! 🥺");

  // Reset food level to prevent repeated warnings
  gameState.homeState.feeding.foodLevel = 10;
  gameState.homeState.feeding.lastFedAt = new Date().toISOString();
  saveGameState(gameState);
}

function refillBowl(type) {
  const gameState = loadGameState();
  const feeding = gameState.homeState.feeding;

  // Check free refills
  if (feeding.freeRefillsUsedToday >= FEEDING_CONFIG.freeRefillsPerDay) {
    showTeddySpeech("You've used your free refills today! Come back tomorrow!");
    return;
  }

  if (type === "food") {
    feeding.foodLevel = FEEDING_CONFIG.foodBowlMax;
    feeding.lastFedAt = new Date().toISOString();
    showTeddySpeech(getFeedingMessage("bowlsFull"));
  } else {
    feeding.waterLevel = FEEDING_CONFIG.waterBowlMax;
    feeding.lastWateredAt = new Date().toISOString();
    showTeddySpeech("Ahh, refreshing! 💧");
  }

  feeding.freeRefillsUsedToday++;
  saveGameState(gameState);
  updateFeedingDisplay(feeding);
}

// ============================================================
// PUP INTERACTION
// ============================================================

function handlePupClick(pupId) {
  const gameState = loadGameState();
  const pupState = gameState.homeState.pups[pupId];
  const pupData = getStudyPup(pupId);

  if (!pupState || !pupData) return;

  // Show pup modal
  document.getElementById("pupModalName").textContent = pupData.name;
  document.getElementById("pupHappiness").style.width = `${pupState.happiness}%`;
  document.getElementById("pupEnergy").style.width = `${pupState.energy}%`;

  elements.pupModal.classList.add("show");
}

function petPup() {
  const gameState = loadGameState();
  const pups = gameState.homeState.pups;

  // Pet the first active pup (teddy for now)
  const pupId = Object.keys(pups)[0];
  if (!pupId) return;

  pups[pupId].happiness = Math.min(100, pups[pupId].happiness + 10);
  pups[pupId].lastPetAt = new Date().toISOString();

  saveGameState(gameState);

  // Update UI
  document.getElementById("pupHappiness").style.width = `${pups[pupId].happiness}%`;

  showTeddySpeech("*happy tail wags* I love pets! 💕");
}

function giveTreat() {
  const gameState = loadGameState();
  const player = getCurrentPlayer();
  if (!player) return;

  // Check if player has treats
  const treats = player?.inventory?.filter(i => {
    const item = getItem(i.itemId);
    return item?.category === "food" && i.qty > 0;
  });

  if (!treats || treats.length === 0) {
    showTeddySpeech("You don't have any treats! Visit Melody's shop! 🏪");
    return;
  }

  // Use first available treat
  const treatInv = treats[0];
  treatInv.qty--;
  if (treatInv.qty <= 0) {
    player.inventory = player.inventory.filter(i => i.itemId !== treatInv.itemId);
  }

  // Increase happiness
  const pups = gameState.homeState.pups;
  const pupId = Object.keys(pups)[0];
  if (pupId) {
    pups[pupId].happiness = Math.min(100, pups[pupId].happiness + 20);
    pups[pupId].energy = Math.min(100, pups[pupId].energy + 10);
  }

  saveGameState(gameState);
  savePlayer(player);

  // Update UI
  if (pupId) {
    document.getElementById("pupHappiness").style.width = `${pups[pupId].happiness}%`;
    document.getElementById("pupEnergy").style.width = `${pups[pupId].energy}%`;
  }

  showTeddySpeech(getFeedingMessage("treatGiven"));
}

// ============================================================
// SOCIAL FEATURES
// ============================================================

function openVisitModal() {
  // For now, show placeholder - backend integration needed for real neighbors
  elements.visitModal.classList.add("show");

  // Check for neighborhood
  const profileId = localStorage.getItem("studypups_current_profile_id");
  const neighbourhoodId = localStorage.getItem(`studypups_neighbourhood_for_${profileId}`);

  if (!neighbourhoodId) {
    document.getElementById("noNeighbors").style.display = "block";
    document.getElementById("neighborsList").innerHTML = "";
  } else {
    document.getElementById("noNeighbors").style.display = "none";
    // Load neighbors from backend (placeholder for now)
    loadNeighbors(neighbourhoodId);
  }
}

function loadNeighbors(neighbourhoodId) {
  // Placeholder - will need backend integration
  const neighborsList = document.getElementById("neighborsList");
  neighborsList.innerHTML = `
    <div class="neighbor-item" onclick="visitNeighbor('demo')">
      <div class="neighbor-avatar">🏠</div>
      <div class="neighbor-info">
        <div class="neighbor-name">Demo Friend</div>
        <div class="neighbor-status">Last visited: Today</div>
      </div>
    </div>
  `;
}

// ============================================================
// LETTERBOX
// ============================================================

function openLetterboxModal() {
  elements.letterboxModal.classList.add("show");
  switchLetterboxTab("inbox");
}

function switchLetterboxTab(tab) {
  homeState.activeLetterboxTab = tab;

  // Update tab UI
  document.querySelectorAll(".letterbox-tab").forEach(t => {
    t.classList.toggle("active", t.dataset.tab === tab);
  });

  document.querySelectorAll(".letterbox-content").forEach(c => {
    c.classList.toggle("active", c.dataset.tab === tab);
  });

  // Load tab content
  const gameState = loadGameState();
  const player = getCurrentPlayer();

  if (tab === "inbox") {
    renderInbox(gameState.homeState.receivedMessages);
  } else if (tab === "send") {
    renderSendTab(player);
  } else if (tab === "memory") {
    renderMemoryBook(gameState.homeState.memoryBook);
  }
}

function renderInbox(messages) {
  const list = document.getElementById("messagesList");
  const empty = document.getElementById("noMessages");

  if (!messages || messages.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = messages.map((msg, idx) => `
    <div class="message-item ${msg.read ? '' : 'unread'}">
      <div class="message-avatar">${msg.senderAvatar || '👤'}</div>
      <div class="message-content">
        <div class="message-from">${msg.senderName}</div>
        <div class="message-text">${msg.text}</div>
        <div class="message-time">${formatTimeAgo(msg.sentAt)}</div>
      </div>
      <div class="message-actions">
        <button class="message-action-btn save" onclick="saveToMemory(${idx})">💾 Save</button>
        <button class="message-action-btn delete" onclick="deleteMessage(${idx})">🗑️</button>
      </div>
    </div>
  `).join("");
}

function renderSendTab(player) {
  // Build presets
  const presetGrid = document.getElementById("presetGrid");
  presetGrid.innerHTML = PRESET_MESSAGES.map(preset => `
    <div class="preset-item ${homeState.selectedPreset === preset.id ? 'selected' : ''}"
         data-preset-id="${preset.id}"
         onclick="selectPreset('${preset.id}')">
      ${preset.icon} ${preset.text}
    </div>
  `).join("");

  // Build stationery from inventory
  const stationeryGrid = document.getElementById("stationeryGrid");
  const stationery = player?.inventory?.filter(i => {
    const item = getItem(i.itemId);
    return item?.category === "stationery" && i.qty > 0;
  }) || [];

  if (stationery.length === 0) {
    stationeryGrid.innerHTML = `
      <div style="color: #999; font-size: 12px;">
        No stationery! <a href="shop.html">Buy some</a>
      </div>
    `;
  } else {
    stationeryGrid.innerHTML = stationery.map(inv => {
      const item = getItem(inv.itemId);
      return `
        <div class="stationery-item ${homeState.selectedStationery === inv.itemId ? 'selected' : ''}"
             data-stationery-id="${inv.itemId}"
             onclick="selectStationery('${inv.itemId}')">
          ${item.icon}
        </div>
      `;
    }).join("");
  }

  updateSendButton();
}

function renderMemoryBook(memories) {
  const list = document.getElementById("memoryList");
  const empty = document.getElementById("noMemories");

  if (!memories || memories.length === 0) {
    list.innerHTML = "";
    empty.style.display = "block";
    return;
  }

  empty.style.display = "none";
  list.innerHTML = memories.map(mem => `
    <div class="memory-item">
      <div class="memory-icon">${mem.icon || '💌'}</div>
      <div class="memory-content">
        <div class="memory-text">${mem.text}</div>
        <div class="memory-from">From: ${mem.senderName}</div>
        <div class="memory-date">${formatDate(mem.savedAt)}</div>
      </div>
    </div>
  `).join("");
}

// Make functions globally accessible for onclick handlers
window.selectPreset = function(presetId) {
  homeState.selectedPreset = presetId;
  document.querySelectorAll(".preset-item").forEach(p => {
    p.classList.toggle("selected", p.dataset.presetId === presetId);
  });
  updateSendButton();
};

window.selectStationery = function(stationeryId) {
  homeState.selectedStationery = stationeryId;
  document.querySelectorAll(".stationery-item").forEach(s => {
    s.classList.toggle("selected", s.dataset.stationeryId === stationeryId);
  });
  updateSendButton();
};

window.saveToMemory = function(msgIndex) {
  const gameState = loadGameState();
  const msg = gameState.homeState.receivedMessages[msgIndex];
  if (!msg) return;

  gameState.homeState.memoryBook.push({
    ...msg,
    savedAt: new Date().toISOString()
  });

  // Remove from inbox
  gameState.homeState.receivedMessages.splice(msgIndex, 1);
  saveGameState(gameState);

  renderInbox(gameState.homeState.receivedMessages);
  showTeddySpeech("Saved to your Memory Book! 📖");
};

window.deleteMessage = function(msgIndex) {
  const gameState = loadGameState();
  gameState.homeState.receivedMessages.splice(msgIndex, 1);
  saveGameState(gameState);

  renderInbox(gameState.homeState.receivedMessages);
};

function updateSendButton() {
  const sendBtn = document.getElementById("sendMessageBtn");
  const recipientSelect = document.getElementById("sendToSelect");

  const hasRecipient = recipientSelect.value !== "";
  const hasMessage = homeState.selectedPreset !== null;
  const hasStationery = homeState.selectedStationery !== null;

  sendBtn.disabled = !(hasRecipient && hasMessage && hasStationery);
}

function updateLetterboxCount(messages) {
  const unread = (messages || []).filter(m => !m.read).length;
  elements.letterCount.textContent = unread || "";
  elements.letterCount.dataset.count = unread;

  if (unread > 0) {
    elements.letterboxBtn.classList.add("has-new");
  } else {
    elements.letterboxBtn.classList.remove("has-new");
  }
}

// ============================================================
// TUTORIAL
// ============================================================

function startTutorial(gameState) {
  homeState.tutorialActive = true;
  homeState.tutorialStep = 0;

  elements.tutorialOverlay.style.display = "block";
  showTutorialStep(0);
}

function showTutorialStep(step) {
  const tutorial = HOME_TUTORIAL.steps[step];
  if (!tutorial) {
    endTutorial();
    return;
  }

  const textEl = document.getElementById("tutorialText");
  textEl.textContent = tutorial.text;

  // Highlight element if specified
  if (tutorial.highlight) {
    const highlightEl = document.querySelector(tutorial.highlight);
    if (highlightEl) {
      const rect = highlightEl.getBoundingClientRect();
      const spotlight = document.getElementById("tutorialSpotlight");
      spotlight.style.left = `${rect.left - 10}px`;
      spotlight.style.top = `${rect.top - 10}px`;
      spotlight.style.width = `${rect.width + 20}px`;
      spotlight.style.height = `${rect.height + 20}px`;
    }
  }
}

function nextTutorialStep() {
  homeState.tutorialStep++;
  if (homeState.tutorialStep >= HOME_TUTORIAL.steps.length) {
    endTutorial();
  } else {
    showTutorialStep(homeState.tutorialStep);
  }
}

function endTutorial() {
  homeState.tutorialActive = false;
  elements.tutorialOverlay.style.display = "none";

  const gameState = loadGameState();
  gameState.homeState.tutorialComplete = true;
  gameState.homeState.firstVisit = false;
  saveGameState(gameState);

  showTeddySpeech("Let's make this place our own! 🏠✨");
}

// ============================================================
// TEDDY SPEECH
// ============================================================

function showTeddySpeech(text) {
  elements.teddySpeechText.textContent = text;
  elements.teddySpeech.classList.add("show");
}

function hideTeddySpeech() {
  elements.teddySpeech.classList.remove("show");
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners(gameState) {
  // Mode toggle
  elements.modeToggleBtn?.addEventListener("click", () => {
    toggleEditMode();
  });

  // Edit panel close
  elements.editPanelClose?.addEventListener("click", () => {
    toggleEditMode(false);
  });

  // Edit tabs
  document.querySelectorAll(".edit-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = tab.dataset.tab;
      homeState.activeTab = tabId;

      document.querySelectorAll(".edit-tab").forEach(t => t.classList.toggle("active", t.dataset.tab === tabId));
      document.querySelectorAll(".edit-tab-content").forEach(c => c.classList.toggle("active", c.dataset.tab === tabId));
    });
  });

  // Drag and drop zones
  elements.roomContainer?.addEventListener("dragover", handleDragOver);
  elements.roomContainer?.addEventListener("drop", handleDrop);
  elements.roomContainer?.addEventListener("dragleave", () => {
    elements.dropPreview.classList.remove("visible");
  });
  elements.roomContainer?.addEventListener("click", handleRoomClick);

  // Placed items click
  elements.placedItemsLayer?.addEventListener("click", handleItemClick);

  // Pups click
  elements.studypupsLayer?.addEventListener("click", (e) => {
    const pupEl = e.target.closest(".home-pup");
    if (pupEl) {
      handlePupClick(pupEl.dataset.pupId);
    }
  });

  // Feeding bowls
  elements.foodBowl?.addEventListener("click", () => refillBowl("food"));
  elements.waterBowl?.addEventListener("click", () => refillBowl("water"));

  // Social button
  elements.socialBtn?.addEventListener("click", openVisitModal);

  // Letterbox button
  elements.letterboxBtn?.addEventListener("click", openLetterboxModal);

  // Letterbox tabs
  document.querySelectorAll(".letterbox-tab").forEach(tab => {
    tab.addEventListener("click", () => switchLetterboxTab(tab.dataset.tab));
  });

  // Teddy helper
  elements.teddySprite?.addEventListener("click", () => {
    const dialogue = getRandomTeddyDialogue();
    showTeddySpeech(dialogue.text);
  });

  elements.teddySpeechBtn?.addEventListener("click", hideTeddySpeech);

  // Pup modal
  document.getElementById("pupModalBackdrop")?.addEventListener("click", () => {
    elements.pupModal.classList.remove("show");
  });
  document.getElementById("pupModalClose")?.addEventListener("click", () => {
    elements.pupModal.classList.remove("show");
  });
  document.getElementById("petPupBtn")?.addEventListener("click", petPup);
  document.getElementById("giveTreatBtn")?.addEventListener("click", giveTreat);

  // Visit modal
  document.getElementById("visitModalBackdrop")?.addEventListener("click", () => {
    elements.visitModal.classList.remove("show");
  });
  document.getElementById("visitModalClose")?.addEventListener("click", () => {
    elements.visitModal.classList.remove("show");
  });
  document.getElementById("visitBackBtn")?.addEventListener("click", () => {
    elements.visitModal.classList.remove("show");
  });

  // Letterbox modal
  document.getElementById("letterboxModalBackdrop")?.addEventListener("click", () => {
    elements.letterboxModal.classList.remove("show");
  });
  document.getElementById("letterboxModalClose")?.addEventListener("click", () => {
    elements.letterboxModal.classList.remove("show");
  });

  // Tutorial
  document.getElementById("tutorialNext")?.addEventListener("click", nextTutorialStep);

  // Map button
  document.getElementById("homeBtn")?.addEventListener("click", () => {
    if (window.openGameMenu) {
      window.openGameMenu();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      elements.pupModal.classList.remove("show");
      elements.visitModal.classList.remove("show");
      elements.letterboxModal.classList.remove("show");
      elements.itemTooltip.classList.remove("visible");

      if (homeState.isEditMode) {
        toggleEditMode(false);
      }

      if (homeState.tutorialActive) {
        endTutorial();
      }
    }
  });
}

// ============================================================
// EDIT MODE
// ============================================================

function toggleEditMode(force = null) {
  homeState.isEditMode = force !== null ? force : !homeState.isEditMode;

  elements.roomContainer.classList.toggle("edit-mode", homeState.isEditMode);
  elements.editPanel.classList.toggle("open", homeState.isEditMode);
  elements.modeToggleBtn.classList.toggle("active", homeState.isEditMode);
  elements.modeToggleBtn.textContent = homeState.isEditMode ? "✓ Done" : "🎨 Decorate";

  if (homeState.isEditMode) {
    showTeddySpeech("Drag items to move them! Click walls or floors to change them!");

    // Refresh inventory grids
    const player = getCurrentPlayer();
    const placements = getProfilePlacements(player);
    buildInventoryGrids(player, placements);
  } else {
    // Deselect any selected items
    document.querySelectorAll(".placed-item.selected").forEach(el => {
      el.classList.remove("selected");
    });
    homeState.selectedItem = null;
    homeState.selectedPlacementItemId = null;
  }
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function updateGemDisplay(player) {
  const count = player?.glimmers || 0;
  if (elements.gemCount) {
    elements.gemCount.textContent = count;
  }
}

function formatTimeAgo(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now - date;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

// Export for potential external use
window.homeState = homeState;
