// js/core/player-data.js
// ============================================================
// PLAYER DATA LAYER (LOCAL MVP)
// Multi-profile localStorage version, designed to swap to backend later
// ============================================================

const CURRENT_PROFILE_KEY = "studypups_current_profile_id";
const PROFILES_INDEX_KEY = "studypups_profiles_index";
const PROFILE_KEY_PREFIX = "studypups_profile_";

function uid() {
  // good enough for local IDs
  return "p_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function profileKey(profileId) {
  return `${PROFILE_KEY_PREFIX}${profileId}`;
}

/**
 * Create a new player profile object
 */
export function createNewPlayer(name = "") {
  const now = new Date().toISOString();

  return {
    // Identity
    profileId: uid(),
    playerName: name || "Player",
    houseNumber: null,        // Assigned by teacher (future)
    neighbourhood: null,      // Classroom code (future)

    // Progress
    tutorialComplete: false,
    currentLocation: "tutorial",
    schoolYearLevel: 6,

    // Suggested save shape for your map/levels:
    unlockedLocations: ["tutorial"], // e.g. ["tutorial","farm","shop"]

    // New future-proof progress system
    progress: {
      locations: {},  // farm/cafe/etc will be created automatically
      mastery: {}     // foundation check flags live here
    },

    // Currency & Items
    glimmers: 0,
    inventory: [],            // [{ itemId, qty }]
    equippedItems: {},        // { slotName: itemId }
    homeLayout: {},           // your future "decorate home" state

    // Stats
    totalCorrect: 0,
    totalAttempts: 0,
    hintsUsed: 0,

    // Timestamps
    createdAt: now,
    lastPlayed: now
  };
}

/**
 * List all local profiles (for your Profiles button UI)
 */
export function listProfiles() {
  return loadJSON(PROFILES_INDEX_KEY, []);
}

/**
 * Create + persist a profile, set as current
 */
export function createProfileAndSetCurrent(name) {
  const profile = createNewPlayer(name);
  const index = listProfiles();
  index.push({
    profileId: profile.profileId,
    playerName: profile.playerName,
    lastPlayed: profile.lastPlayed
  });
  saveJSON(PROFILES_INDEX_KEY, index);
  saveJSON(profileKey(profile.profileId), profile);
  localStorage.setItem(CURRENT_PROFILE_KEY, profile.profileId);
  return profile;
}

/**
 * Set current profile by ID
 */
export function setCurrentProfile(profileId) {
  localStorage.setItem(CURRENT_PROFILE_KEY, profileId);
  return getCurrentPlayer();
}

/**
 * Get current player (or null if none)
 */
export function getCurrentPlayer() {
  const profileId = localStorage.getItem(CURRENT_PROFILE_KEY);
  if (!profileId) return null;
  return loadJSON(profileKey(profileId), null);
}

/**
 * Save player data
 */
export function savePlayer(playerData) {
  try {
    playerData.lastPlayed = new Date().toISOString();

    // update index metadata too
    const index = listProfiles();
    const i = index.findIndex(p => p.profileId === playerData.profileId);
    if (i !== -1) {
      index[i].playerName = playerData.playerName;
      index[i].lastPlayed = playerData.lastPlayed;
      saveJSON(PROFILES_INDEX_KEY, index);
    }

    saveJSON(profileKey(playerData.profileId), playerData);
    return true;
  } catch (error) {
    console.error("Failed to save player:", error);
    return false;
  }
}

/**
 * Delete a profile
 */
export function deleteProfile(profileId) {
  // remove profile
  localStorage.removeItem(profileKey(profileId));

  // remove from index
  const index = listProfiles().filter(p => p.profileId !== profileId);
  saveJSON(PROFILES_INDEX_KEY, index);

  // remove associated neighbourhood data
  localStorage.removeItem(`studypups_neighbourhood_for_${profileId}`);
  localStorage.removeItem(`studypups_neighbourhood_code_for_${profileId}`);
  localStorage.removeItem(`studypups_letterbox_for_${profileId}`);
  localStorage.removeItem(`studypups_save_${profileId}`);

  // clear current if needed
  const current = localStorage.getItem(CURRENT_PROFILE_KEY);
  if (current === profileId) localStorage.removeItem(CURRENT_PROFILE_KEY);
}

/**
 * Update a profile's player name
 */
export function updateProfileName(profileId, newName) {
  const profile = loadJSON(profileKey(profileId), null);
  if (!profile) return null;

  profile.playerName = newName || "Player";
  profile.lastPlayed = new Date().toISOString();

  // Update profile data
  saveJSON(profileKey(profileId), profile);

  // Update index metadata
  const index = listProfiles();
  const i = index.findIndex(p => p.profileId === profileId);
  if (i !== -1) {
    index[i].playerName = profile.playerName;
    index[i].lastPlayed = profile.lastPlayed;
    saveJSON(PROFILES_INDEX_KEY, index);
  }

  return profile;
}

/**
 * Currency helpers (prevents accidental negative or crazy values)
 */
export function addGlimmers(amount) {
  const p = getCurrentPlayer();
  if (!p) return null;
  const add = Math.max(0, Number(amount) || 0);
  p.glimmers = Math.max(0, (Number(p.glimmers) || 0) + add);
  savePlayer(p);
  return p.glimmers;
}

export function spendGlimmers(amount) {
  const p = getCurrentPlayer();
  if (!p) return { ok: false, reason: "no-profile" };
  const cost = Math.max(0, Number(amount) || 0);
  const bal = Number(p.glimmers) || 0;
  if (bal < cost) return { ok: false, reason: "insufficient-funds" };
  p.glimmers = bal - cost;
  savePlayer(p);
  return { ok: true, balance: p.glimmers };
}

export function setGlimmers(amount) {
  const p = getCurrentPlayer();
  if (!p) return null;
  const value = Math.max(0, Number(amount) || 0);
  p.glimmers = value;
  savePlayer(p);
  return p.glimmers;
}

export function setSchoolYearLevel(yearLevel) {
  const p = getCurrentPlayer();
  if (!p) return null;
  const normalized = Math.max(3, Math.min(7, Number(yearLevel) || 6));
  p.schoolYearLevel = normalized;
  savePlayer(p);
  return p.schoolYearLevel;
}

export function addInventoryItem(itemId, qty = 1, meta = {}) {
  const p = getCurrentPlayer();
  if (!p || !itemId) return null;
  const amount = Math.max(0, Number(qty) || 0);
  if (!p.inventory) p.inventory = [];

  const existingItem = p.inventory.find(item => item.itemId === itemId);
  if (existingItem) {
    existingItem.qty = (Number(existingItem.qty) || 0) + amount;
    Object.entries(meta).forEach(([key, value]) => {
      if (key === "seenInInventory") {
        if (existingItem.seenInInventory === true) return;
        if (existingItem.seenInInventory === undefined) {
          existingItem.seenInInventory = value;
        }
        return;
      }
      if (existingItem[key] === undefined) {
        existingItem[key] = value;
      }
    });
  } else {
    p.inventory.push({
      itemId,
      qty: amount,
      ...meta
    });
  }

  savePlayer(p);
  return p.inventory;
}

/**
 * Record a level attempt + award logic hooks
 * You can tune these rules without changing the rest of the game.
 */
export function recordLevelAttempt({ locationId, levelId, correct, attempts = 1, hintsUsed = 0, baseReward = 0 }) {
  const p = getCurrentPlayer();
  if (!p) return null;

  // stats
  p.totalAttempts += Number(attempts) || 0;
  p.totalCorrect += correct ? 1 : 0;
  p.hintsUsed += Number(hintsUsed) || 0;

  // progress bucket
p.progress.locations[locationId] ||= { highestLevelUnlocked: 1, levels: {} };
const loc = p.progress.locations[locationId];

  loc.levels[levelId] ||= { firstCompletedAt: null, bestScore: 0, attempts: 0, completions: 0 };

  const lvl = loc.levels[levelId];
  lvl.attempts += 1;

  // example reward rules:
  // - first completion gives full reward
  // - repeats give smaller reward
  // - incorrect gives 0
  let reward = 0;
  if (correct) {
    const firstTime = !lvl.firstCompletedAt;
    reward = firstTime ? baseReward : Math.floor(baseReward * 0.2); // 20% on repeats
    lvl.completions += 1;
    if (firstTime) lvl.firstCompletedAt = new Date().toISOString();

    // unlock next level (simple example)
    loc.highestLevelUnlocked = Math.max(loc.highestLevelUnlocked, Number(levelId) + 1 || loc.highestLevelUnlocked);
  }

  p.glimmers = Math.max(0, (Number(p.glimmers) || 0) + reward);
  savePlayer(p);
return { reward, glimmers: p.glimmers, progress: p.progress.locations[locationId] };

}
