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

  // clear current if needed
  const current = localStorage.getItem(CURRENT_PROFILE_KEY);
  if (current === profileId) localStorage.removeItem(CURRENT_PROFILE_KEY);
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
