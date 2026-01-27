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