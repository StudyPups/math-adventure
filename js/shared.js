// js/shared.js
// Shared utilities for StudyPups game

/**
 * Wrapper for DOMContentLoaded - ensures DOM is ready
 */
export function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

/**
 * Simple logger (can be disabled in production)
 */
const DEBUG = true;
export function log(...args) {
  if (DEBUG) {
    console.log("[StudyPups]", ...args);
  }
}

/**
 * LocalStorage key for game saves
 */
const SAVE_KEY = "studypups_save";

/**
 * Create a fresh game state
 */
export function createNewGameState() {
  return {
    playerName: "",
    tutorialComplete: false,
    currentSection: "tutorial",
    
    progress: {
      sectionsCompleted: [],
      questionsCompleted: [],
      studyPupsUnlocked: []
    },
    
    stats: {
      totalGlimmers: 0,
      glimmersSpent: 0,
      totalCorrect: 0,
      totalAttempts: 0,
      hintsUsed: 0,
      timeSpentMinutes: 0
    },
    
    inventory: {
      items: [],
      equippedItems: {}
    },
    
    settings: {
      soundEnabled: true,
      musicEnabled: true
    },
    
    lastPlayed: new Date().toISOString(),
    createdAt: new Date().toISOString()
  };
}

/**
 * Save game state to localStorage
 */
export function saveGameState(state) {
  try {
    state.lastPlayed = new Date().toISOString();
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    log("Game saved ✅");
    return true;
  } catch (error) {
    console.error("Failed to save game:", error);
    return false;
  }
}

/**
 * Load game state from localStorage
 */
export function loadGameState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    if (saved) {
      const state = JSON.parse(saved);
      log("Game loaded ✅", state.playerName || "(no name yet)");
      return state;
    }
    return null;
  } catch (error) {
    console.error("Failed to load game:", error);
    return null;
  }
}

/**
 * Clear saved game (for testing/reset)
 */
export function clearGameState() {
  try {
    localStorage.removeItem(SAVE_KEY);
    log("Game data cleared");
    return true;
  } catch (error) {
    console.error("Failed to clear game:", error);
    return false;
  }
}

/**
 * Check if this is a new player (no save exists)
 */
export function isNewPlayer() {
  return !localStorage.getItem(SAVE_KEY);
}
// ============================================
// GAME MENU SYSTEM
// Add this to the END of shared.js
// Creates a map/menu overlay accessible from any page
// ============================================

/**
 * Initialize the game menu on any page
 * Call this in your onReady() or at page load
 * 
 * @param {string} currentPage - The current page identifier (e.g., "farm", "tutorial")
 */
export function initGameMenu(currentPage = "") {
  // Don't add menu if it already exists
  if (document.getElementById("menuOverlay")) return;
  
  // Define all game locations
  const locations = [
    {
      id: "tutorial",
      href: "tutorial.html",
      icon: "🌲",
      name: "Whispering Woods",
      desc: "Patterns & Sequences",
      badge: "Tutorial",
      locked: false
    },
    {
      id: "farm",
      href: "farm.html",
      icon: "🌻",
      name: "Buttercup's Farm",
      desc: "Multiplication & Grouping",
      badge: "Available",
      locked: false
    },
    {
      id: "cafe",
      href: "#",
      icon: "☕",
      name: "Cozy Cafe",
      desc: "Money & Decimals",
      badge: "🔒 Coming Soon",
      locked: true
    },
    {
      id: "restaurant",
      href: "#",
      icon: "🍽️",
      name: "Riverside Restaurant",
      desc: "Measurement",
      badge: "🔒 Coming Soon",
      locked: true
    }
  ];
  
  // Build location HTML
  const locationsHTML = locations.map(loc => {
    const isCurrent = loc.id === currentPage;
    const classes = [
      "menu-location",
      isCurrent ? "current" : "",
      loc.locked ? "locked" : ""
    ].filter(Boolean).join(" ");
    
    const tag = loc.locked ? "div" : "a";
    const href = loc.locked ? "" : `href="${loc.href}"`;
    const badge = isCurrent ? "You are here" : loc.badge;
    
    return `
      <${tag} ${href} class="${classes}">
        <span class="menu-location-icon">${loc.icon}</span>
        <div class="menu-location-info">
          <div class="menu-location-name">${loc.name}</div>
          <div class="menu-location-desc">${loc.desc}</div>
        </div>
        <span class="menu-location-badge">${badge}</span>
      </${tag}>
    `;
  }).join("");
  
  // Create menu button
  const menuBtn = document.createElement("button");
  menuBtn.id = "menuBtn";
  menuBtn.className = "menu-btn";
  menuBtn.title = "Menu";
  menuBtn.innerHTML = "☰";
  
  // Create menu overlay
  const menuOverlay = document.createElement("div");
  menuOverlay.id = "menuOverlay";
  menuOverlay.className = "menu-overlay";
  menuOverlay.innerHTML = `
    <div class="menu-panel">
      <div class="menu-header">
        <span class="menu-title">🗺️ Complexa Meadows</span>
        <button class="menu-close" id="menuClose">✕</button>
      </div>
      
      <div class="menu-locations">
        ${locationsHTML}
      </div>
      
      <div class="menu-footer">
        <button class="menu-footer-btn secondary" disabled>
          👤 Switch Profile (Coming Soon)
        </button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(menuBtn);
  document.body.appendChild(menuOverlay);
  
  // Event listeners
  menuBtn.addEventListener("click", () => {
    menuOverlay.classList.add("open");
  });
  
  menuOverlay.querySelector("#menuClose").addEventListener("click", () => {
    menuOverlay.classList.remove("open");
  });
  
  // Click outside to close
  menuOverlay.addEventListener("click", (e) => {
    if (e.target === menuOverlay) {
      menuOverlay.classList.remove("open");
    }
  });
  
  // Escape key to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menuOverlay.classList.contains("open")) {
      menuOverlay.classList.remove("open");
    }
  });
  
  log("Game menu initialized ✅");
}