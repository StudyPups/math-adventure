// js/shared.js
// Shared utilities used across all pages

// Short helper to grab elements safely
export function $(selector, root = document) {
  return root.querySelector(selector);
}

// Grab all matches
export function $all(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

// Run code once the page is ready
export function onReady(fn) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", fn);
  } else {
    fn();
  }
}

// Simple show/hide helpers for UI
export function show(el) {
  if (!el) return;
  el.hidden = false;
}

export function hide(el) {
  if (!el) return;
  el.hidden = true;
}

// Tiny debug logger you can turn off later
const DEBUG = true; // Set to false for production

export function log(...args) {
  if (DEBUG) {
    console.log("[StudyPups]", ...args);
  }
}

// --- Save/Load System (using localStorage) ---

const SAVE_KEY = "studypups_save";

export function loadGameState() {
  try {
    const saved = localStorage.getItem(SAVE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    log("Error loading save:", e);
    return null;
  }
}

export function saveGameState(state) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
    log("Game saved");
  } catch (e) {
    log("Error saving:", e);
  }
}

export function createNewGameState(playerName = "Player") {
  return {
    playerName,
    gems: 0,
    tutorialComplete: false,
    patternsComplete: false,
    inventory: [],
    studyPupsUnlocked: ["teddy"], // Start with Teddy
    lastPlayed: new Date().toISOString()
  };
}