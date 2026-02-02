// js/index.js
// Main menu / landing page logic

import { onReady, log } from "./core/shared.js";
import {
  getCurrentPlayer,
  listProfiles,
  createProfileAndSetCurrent,
  setCurrentProfile,
  deleteProfile
} from "./core/player-data.js";

function updateWelcomeUI() {
  const player = getCurrentPlayer();

  // Top-left title
  const titleEl = document.querySelector(".hud-title");
  if (titleEl) {
    titleEl.textContent = player ? `🐾 StudyPups — ${player.playerName}` : "🐾 StudyPups";
  }

  // Welcome text in the dialogue box (optional)
  const menuText = document.getElementById("menuText");
  if (menuText) {
    menuText.textContent = player
      ? `Welcome back, ${player.playerName}! Ready to start your magical maths adventure?`
      : "Welcome! Ready to start your magical maths adventure?";
  }
}

function ensureProfileExists() {
  let player = getCurrentPlayer();
  if (player) return player;

  const name = prompt("Create a player profile!\n\nWhat name should we use?", "Player") || "Player";
  player = createProfileAndSetCurrent(name.trim() || "Player");
  updateWelcomeUI();
  return player;
}

function openProfilesMenu() {
  const profiles = listProfiles();

  // If no profiles exist yet, just create one
  if (!profiles.length) {
    alert("No profiles yet — let's make one!");
    ensureProfileExists();
    return;
  }

  // Build a simple menu list
  const lines = profiles.map((p, i) => `${i + 1}) ${p.playerName}`).join("\n");

  const choice = prompt(
    "Profiles\n\n" +
    lines +
    "\n\nType a number to switch profiles.\n" +
    "Type N to make a new profile.\n" +
    "Type D to delete a profile.",
    "1"
  );

  if (!choice) return;

  const c = choice.trim().toUpperCase();

  // New profile
  if (c === "N") {
    const name = prompt("New profile name:", "Player") || "Player";
    createProfileAndSetCurrent(name.trim() || "Player");
    updateWelcomeUI();
    return;
  }

  // Delete profile
  if (c === "D") {
    const delChoice = prompt(
      "Delete which profile?\n\n" + lines + "\n\nType a number:",
      "1"
    );
    if (!delChoice) return;
    const idx = Number(delChoice) - 1;
    if (Number.isNaN(idx) || idx < 0 || idx >= profiles.length) {
      alert("That number didn't match a profile.");
      return;
    }
    const target = profiles[idx];
    const ok = confirm(`Delete "${target.playerName}"?\n\n(This cannot be undone)`);
    if (!ok) return;

    deleteProfile(target.profileId);
    ensureProfileExists(); // make sure at least one exists
    updateWelcomeUI();
    return;
  }

  // Switch profile by number
  const idx = Number(c) - 1;
  if (Number.isNaN(idx) || idx < 0 || idx >= profiles.length) {
    alert("That choice didn’t match a profile.");
    return;
  }

  setCurrentProfile(profiles[idx].profileId);
  updateWelcomeUI();
}

onReady(() => {
  log("Menu loaded ✅");

  const enterBtn = document.getElementById("enterBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const profileBtn = document.getElementById("profileBtn");

  // Update UI on load
  updateWelcomeUI();

  enterBtn?.addEventListener("click", () => {
    ensureProfileExists();
    window.location.href = "tutorial.html";
  });

  settingsBtn?.addEventListener("click", () => {
    alert("Settings coming soon ✨");
  });

  profileBtn?.addEventListener("click", () => {
    openProfilesMenu();
  });
});
