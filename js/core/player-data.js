// js/core/player-data.js
// ============================================================
// PLAYER DATA LAYER
// Currently uses localStorage - ready to swap to backend later
// ============================================================

const PLAYER_KEY = "studypups_player";

/**
 * Create a new player profile
 */
export function createNewPlayer(name = "") {
  return {
    // Identity
    playerName: name,
    houseNumber: null,        // Assigned by teacher (future)
    neighbourhood: null,      // Classroom code (future)
    
    // Progress
    tutorialComplete: false,
    currentLocation: "tutorial",
    
    // Currency & Items
    glimmers: 0,
    inventory: [],
    equippedItems: {},
    
    // Stats
    totalCorrect: 0,
    totalAttempts: 0,
    hintsUsed: 0,
    
    // Timestamps
    createdAt: new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  };
}

/**
 * Get current player (or null if none)
 */
export function getCurrentPlayer() {
  try {
    const data = localStorage.getItem(PLAYER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("Failed to load player:", error);
    return null;
  }
}

/**
 * Save player data
 */
export function savePlayer(playerData) {
  try {
    playerData.lastPlayed = new Date().toISOString();
    localStorage.setItem(PLAYER_KEY, JSON.stringify(playerData));
    return true;
  } catch (error) {
    console.error("Failed to save player:", error);
    return false;
  }
}

/**
 * Check if a player exists
 */
export function hasExistingPlayer() {
  return localStorage.getItem(PLAYER_KEY) !== null;
}

/**
 * Delete player data (for reset/testing)
 */
export function deletePlayer() {
  localStorage.removeItem(PLAYER_KEY);
}

// ============================================================
// FUTURE: Neighbourhood/Classroom Functions (Phase 3+)
// These are placeholders - will connect to backend later
// ============================================================

/**
 * Join a neighbourhood (classroom)
 * @param {string} classCode - Teacher's classroom code
 */
export function joinNeighbourhood(classCode) {
  // TODO: API call to join classroom
  // TODO: Get assigned house number
  console.log("joinNeighbourhood - not yet implemented");
  return null;
}

/**
 * Get neighbours (classmates) for street view
 */
export function getNeighbours() {
  // TODO: API call to get classmates' public profiles
  console.log("getNeighbours - not yet implemented");
  return [];
}

/**
 * Check letterbox for mail
 */
export function checkLetterbox() {
  // TODO: API call to get messages
  console.log("checkLetterbox - not yet implemented");
  return [];
}