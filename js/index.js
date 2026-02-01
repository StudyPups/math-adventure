// js/index.js
// Main menu / landing page logic

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "./shared.js";

onReady(() => {
  log("Menu loaded ✅");

  const enterBtn = document.getElementById("enterBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const profileBtn = document.getElementById("profileBtn");

  enterBtn?.addEventListener("click", () => {
    window.location.href = "tutorial.html";
  });

  settingsBtn?.addEventListener("click", () => {
    alert("Settings coming soon ✨");
  });

  profileBtn?.addEventListener("click", () => {
    alert("Profiles coming soon ✨");
  });
});