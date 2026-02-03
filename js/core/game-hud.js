// js/core/game-hud.js
// Shared HUD functionality for all game pages

import { getCurrentPlayer } from "./player-data.js";

/**
 * Get the neighbourhood display text for a profile
 */
export function getNeighbourhoodDisplay(profileId) {
  if (!profileId) return "P.O. Box";

  const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);
  const letterbox = localStorage.getItem(`studypups_letterbox_for_${profileId}`);

  if (!code) {
    return "P.O. Box";
  }

  if (letterbox) {
    return `${code} • House #${letterbox}`;
  }

  return code;
}

/**
 * Update the game menu header with current player info
 */
export function updateGameMenuHeader() {
  const header = document.getElementById("gameMenuHeader");
  if (!header) return;

  const player = getCurrentPlayer();

  const avatar = header.querySelector(".menu-player-avatar");
  const name = header.querySelector(".menu-player-name");
  const neighbourhood = header.querySelector(".menu-player-neighbourhood");

  if (player) {
    if (avatar) avatar.textContent = (player.playerName || "P")[0].toUpperCase();
    if (name) name.textContent = player.playerName || "Player";
    if (neighbourhood) neighbourhood.textContent = getNeighbourhoodDisplay(player.profileId);
  } else {
    if (avatar) avatar.textContent = "?";
    if (name) name.textContent = "Guest";
    if (neighbourhood) neighbourhood.textContent = "No profile";
  }
}

/**
 * Update gem display
 */
export function updateGemDisplay(count) {
  const gemCount = document.getElementById("gemCount");
  if (gemCount) {
    gemCount.textContent = count || "0";
  }
}

/**
 * Show/hide mail badge
 */
export function setMailBadge(hasUnread) {
  const badge = document.getElementById("mailBadge");
  if (badge) {
    badge.hidden = !hasUnread;
  }
}

/**
 * Initialize the HUD event listeners
 */
export function initGameHUD() {
  // Menu button
  const menuBtn = document.getElementById("menuBtn");
  const menuOverlay = document.getElementById("gameMenuOverlay");
  const closeMenuBtn = document.getElementById("closeGameMenu");

  if (menuBtn && menuOverlay) {
    menuBtn.addEventListener("click", () => {
      updateGameMenuHeader();
      menuOverlay.hidden = false;
    });

    closeMenuBtn?.addEventListener("click", () => {
      menuOverlay.hidden = true;
    });

    // Close when clicking outside
    menuOverlay.addEventListener("click", (e) => {
      if (e.target === menuOverlay) {
        menuOverlay.hidden = true;
      }
    });
  }

  // Mailbox button
  const mailboxBtn = document.getElementById("mailboxBtn");
  const mailboxOverlay = document.getElementById("mailboxOverlay");
  const closeMailboxBtn = document.getElementById("closeMailbox");

  if (mailboxBtn && mailboxOverlay) {
    mailboxBtn.addEventListener("click", () => {
      mailboxOverlay.hidden = false;
    });

    closeMailboxBtn?.addEventListener("click", () => {
      mailboxOverlay.hidden = true;
    });

    // Close when clicking outside
    mailboxOverlay.addEventListener("click", (e) => {
      if (e.target === mailboxOverlay) {
        mailboxOverlay.hidden = true;
      }
    });
  }

  // Settings button in menu
  const gameSettingsBtn = document.getElementById("gameSettingsBtn");
  gameSettingsBtn?.addEventListener("click", () => {
    alert("Settings coming soon!");
  });

  // Explore neighbourhood button
  const exploreNeighbourhoodBtn = document.getElementById("exploreNeighbourhoodBtn");
  exploreNeighbourhoodBtn?.addEventListener("click", () => {
    alert("Visit Neighbours feature coming soon!\n\nYou'll be able to see other players' homes and send them messages.");
  });

  // Switch profile button in game menu
  const switchProfileGameBtn = document.getElementById("switchProfileGameBtn");
  switchProfileGameBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  // Initialize gem display from player data
  const player = getCurrentPlayer();
  if (player) {
    updateGemDisplay(player.glimmers || 0);
  }

  // ESC key to close menus
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (menuOverlay && !menuOverlay.hidden) {
        menuOverlay.hidden = true;
      }
      if (mailboxOverlay && !mailboxOverlay.hidden) {
        mailboxOverlay.hidden = true;
      }
    }
  });
}

// Export for convenience
export default {
  getNeighbourhoodDisplay,
  updateGameMenuHeader,
  updateGemDisplay,
  setMailBadge,
  initGameHUD
};
