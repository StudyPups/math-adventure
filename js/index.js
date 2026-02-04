// js/index.js
// Main menu / landing page logic - Simplified Navigation

import { supabase } from "./core/backend.js";
console.log("Supabase client ready:", !!supabase);

import { onReady, log } from "./core/shared.js";

import {
  getCurrentPlayer,
  listProfiles,
  createProfileAndSetCurrent,
  setCurrentProfile,
  deleteProfile,
  updateProfileName
} from "./core/player-data.js";

// ============================================================
// STATE
// ============================================================

let pendingProfileName = "";

// ============================================================
// UI HELPERS
// ============================================================

/**
 * Get the neighbourhood display text for a profile
 */
function getNeighbourhoodDisplay(profileId) {
  if (!profileId) return "No neighbourhood";

  const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);
  const letterbox = localStorage.getItem(`studypups_letterbox_for_${profileId}`);

  if (!code) {
    return "P.O. Box (No neighbourhood)";
  }

  if (letterbox) {
    return `${code} • House #${letterbox}`;
  }

  return code;
}

/**
 * Update the status bar at the bottom of the welcome screen
 */
function updateStatusDisplay() {
  const statusText = document.getElementById("statusText");
  const statusIcon = document.getElementById("statusDisplay")?.querySelector(".status-icon");

  if (!statusText) return;

  const player = getCurrentPlayer();

  if (player) {
    const neighbourhood = getNeighbourhoodDisplay(player.profileId);
    statusText.textContent = `${player.playerName} • ${neighbourhood}`;
    if (statusIcon) statusIcon.textContent = "📬";
  } else {
    statusText.textContent = "Welcome, adventurer!";
    if (statusIcon) statusIcon.textContent = "📬";
  }
}

/**
 * Render the profile list in the modal
 */
function renderProfileList() {
  const profileList = document.getElementById("profileList");
  if (!profileList) return;

  const profiles = listProfiles();
  const currentId = localStorage.getItem("studypups_current_profile_id");

  if (profiles.length === 0) {
    profileList.innerHTML = `
      <div class="profile-empty">
        <div class="profile-empty-icon">🎒</div>
        <p>No profiles yet!</p>
        <p>Create one to start your adventure.</p>
      </div>
    `;
    return;
  }

  profileList.innerHTML = profiles.map(p => {
    const isSelected = p.profileId === currentId;
    const neighbourhood = getNeighbourhoodDisplay(p.profileId);
    const initial = (p.playerName || "P")[0].toUpperCase();

    return `
      <div class="profile-item ${isSelected ? 'selected' : ''}" data-profile-id="${p.profileId}">
        <div class="profile-avatar">${initial}</div>
        <div class="profile-info">
          <div class="profile-name">${escapeHtml(p.playerName)}</div>
          <div class="profile-neighbourhood">${escapeHtml(neighbourhood)}</div>
        </div>
        <button class="profile-play-btn" data-action="play" data-profile-id="${p.profileId}">
          Play
        </button>
      </div>
    `;
  }).join("");
}

/**
 * Update settings modal with current profile info
 */
function updateSettingsDisplay() {
  const profileDisplay = document.getElementById("currentProfileDisplay");
  if (!profileDisplay) return;

  const player = getCurrentPlayer();
  const nameEl = profileDisplay.querySelector(".profile-name");
  const neighbourhoodEl = profileDisplay.querySelector(".profile-neighbourhood");

  if (player) {
    nameEl.textContent = player.playerName;
    neighbourhoodEl.textContent = getNeighbourhoodDisplay(player.profileId);
  } else {
    nameEl.textContent = "Not logged in";
    neighbourhoodEl.textContent = "—";
  }
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}

// ============================================================
// MODAL MANAGEMENT
// ============================================================

function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.hidden = false;
  }
}

function hideModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.hidden = true;
  }
}

function showStep(stepId) {
  // Hide all steps
  document.querySelectorAll(".modal-step").forEach(step => {
    step.hidden = true;
  });
  // Show the requested step
  const step = document.getElementById(stepId);
  if (step) {
    step.hidden = false;
  }
}

// ============================================================
// PROFILE MODAL FLOWS
// ============================================================

function openProfileModal() {
  renderProfileList();
  showStep("stepSelectProfile");
  showModal("profileModal");
}

function closeProfileModal() {
  hideModal("profileModal");
  pendingProfileName = "";
}

function startCreateProfile() {
  pendingProfileName = "";
  const nameInput = document.getElementById("newProfileName");
  if (nameInput) {
    nameInput.value = "";
  }
  document.getElementById("confirmCreateProfile").disabled = true;
  showStep("stepCreateProfile");
}

function goToNeighbourhoodStep() {
  const nameInput = document.getElementById("newProfileName");
  pendingProfileName = (nameInput?.value || "Player").trim();

  // Clear the neighbourhood code input
  const codeInput = document.getElementById("neighbourhoodCode");
  if (codeInput) codeInput.value = "";

  showStep("stepJoinNeighbourhood");
}

function startGame(profileId) {
  if (profileId) {
    setCurrentProfile(profileId);
  }
  updateStatusDisplay();
  closeProfileModal();

  // Navigate to tutorial
  window.location.href = "tutorial.html";
}

// ============================================================
// NEIGHBOURHOOD JOINING
// ============================================================

async function findNeighbourhoodByCode(code) {
  const { data, error } = await supabase
    .from("neighbourhoods")
    .select("*")
    .eq("class_code", code)
    .single();

  if (error) {
    console.error("Neighbourhood not found:", error.message);
    return null;
  }

  return data;
}

const MAX_LETTERBOX = 50;

async function ensureLetterboxNumber(neighbourhoodId, profileId) {
  // 1) Are we already a member?
  const { data: existing, error: existingErr } = await supabase
    .from("neighbourhood_members")
    .select("letterbox_number, is_active")
    .eq("neighbourhood_id", neighbourhoodId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existing) {
    // If they existed but were inactive, reactivate
    if (existing.is_active === false) {
      const { error: reactErr } = await supabase
        .from("neighbourhood_members")
        .update({ is_active: true })
        .eq("neighbourhood_id", neighbourhoodId)
        .eq("profile_id", profileId);

      if (reactErr) {
        console.error(reactErr);
        return null;
      }
    }
    return existing.letterbox_number;
  }

  // 2) Count current members to assign next number
  const { count, error: countErr } = await supabase
    .from("neighbourhood_members")
    .select("*", { count: "exact", head: true })
    .eq("neighbourhood_id", neighbourhoodId)
    .eq("is_active", true);

  if (countErr) {
    console.error(countErr);
    return null;
  }

  const nextNumber = (count ?? 0) + 1;

  if (nextNumber > MAX_LETTERBOX) {
    alert(
      `This class is full (max ${MAX_LETTERBOX} students). Ask the teacher to create another class code.`
    );
    return null;
  }

  // 3) Insert membership row
  const { data: inserted, error: insertErr } = await supabase
    .from("neighbourhood_members")
    .insert([
      {
        neighbourhood_id: neighbourhoodId,
        profile_id: profileId,
        letterbox_number: nextNumber
      }
    ])
    .select("letterbox_number")
    .single();

  if (insertErr) {
    console.error(insertErr);
    return null;
  }

  return inserted.letterbox_number;
}

async function joinNeighbourhoodAndStart() {
  const codeInput = document.getElementById("neighbourhoodCode");
  const code = (codeInput?.value || "").trim().toUpperCase();

  if (!code) {
    alert("Please enter a class code, or click 'Use a P.O. Box' if you don't have one.");
    return;
  }

  // Create the profile first
  const profile = createProfileAndSetCurrent(pendingProfileName || "Player");

  // Try to join the neighbourhood
  const neighbourhood = await findNeighbourhoodByCode(code);
  if (!neighbourhood) {
    alert("Sorry, that class code was not found. Check with your teacher and try again.");
    // Still start the game, just without a neighbourhood
    startGame(profile.profileId);
    return;
  }

  // Get letterbox number
  const letterboxNumber = await ensureLetterboxNumber(neighbourhood.id, profile.profileId);
  if (!letterboxNumber) {
    // Something went wrong, but still start
    startGame(profile.profileId);
    return;
  }

  // Save join info locally
  localStorage.setItem(`studypups_neighbourhood_for_${profile.profileId}`, neighbourhood.id);
  localStorage.setItem(`studypups_neighbourhood_code_for_${profile.profileId}`, code);
  localStorage.setItem(`studypups_letterbox_for_${profile.profileId}`, String(letterboxNumber));

  alert(`Welcome to ${code}!\n\nYour house number is #${letterboxNumber}.`);
  startGame(profile.profileId);
}

function usePOBoxAndStart() {
  // Create profile without neighbourhood
  const profile = createProfileAndSetCurrent(pendingProfileName || "Player");
  startGame(profile.profileId);
}

// ============================================================
// SETTINGS MODAL
// ============================================================

function openSettingsModal() {
  updateSettingsDisplay();
  showModal("settingsModal");
}

function closeSettingsModal() {
  hideModal("settingsModal");
}

function logout() {
  const ok = confirm("Log out?\n\nThis will clear the current profile selection. Your profiles will still be saved on this device.");
  if (!ok) return;

  localStorage.removeItem("studypups_current_profile_id");
  updateStatusDisplay();
  updateSettingsDisplay();
  closeSettingsModal();
}

// ============================================================
// PROFILE MANAGEMENT
// ============================================================

function deleteCurrentProfile() {
  const player = getCurrentPlayer();
  if (!player) {
    alert("No profile is currently selected.");
    return;
  }

  const ok = confirm(
    `Delete profile "${player.playerName}"?\n\n` +
    "This will permanently remove all progress, inventory, and settings for this profile.\n\n" +
    "This action cannot be undone!"
  );

  if (!ok) return;

  deleteProfile(player.profileId);
  updateStatusDisplay();
  updateSettingsDisplay();
  closeSettingsModal();

  alert("Profile deleted successfully.");
}

function openChangeNameModal() {
  const player = getCurrentPlayer();
  if (!player) {
    alert("No profile is currently selected.");
    return;
  }

  // Pre-fill with current name
  const changeNameInput = document.getElementById("changeNameInput");
  if (changeNameInput) {
    changeNameInput.value = player.playerName;
  }

  // Enable/disable the confirm button based on input
  const confirmBtn = document.getElementById("confirmChangeNameBtn");
  if (confirmBtn) {
    confirmBtn.disabled = !player.playerName;
  }

  closeSettingsModal();
  showStep("stepChangeName");
  showModal("profileModal");
}

function confirmChangeName() {
  const player = getCurrentPlayer();
  if (!player) return;

  const changeNameInput = document.getElementById("changeNameInput");
  const newName = (changeNameInput?.value || "").trim();

  if (!newName) {
    alert("Please enter a name.");
    return;
  }

  updateProfileName(player.profileId, newName);
  updateStatusDisplay();

  closeProfileModal();
  alert(`Name changed to "${newName}"!`);
}

// ============================================================
// VOLUME CONTROLS
// ============================================================

function initVolumeControls() {
  const musicSlider = document.getElementById("musicVolume");
  const sfxSlider = document.getElementById("sfxVolume");
  const musicValue = document.getElementById("musicValue");
  const sfxValue = document.getElementById("sfxValue");

  // Load saved values
  const savedMusic = localStorage.getItem("studypups_music_volume") || "70";
  const savedSfx = localStorage.getItem("studypups_sfx_volume") || "80";

  if (musicSlider) {
    musicSlider.value = savedMusic;
    if (musicValue) musicValue.textContent = `${savedMusic}%`;

    musicSlider.addEventListener("input", () => {
      const val = musicSlider.value;
      if (musicValue) musicValue.textContent = `${val}%`;
      localStorage.setItem("studypups_music_volume", val);
    });
  }

  if (sfxSlider) {
    sfxSlider.value = savedSfx;
    if (sfxValue) sfxValue.textContent = `${savedSfx}%`;

    sfxSlider.addEventListener("input", () => {
      const val = sfxSlider.value;
      if (sfxValue) sfxValue.textContent = `${val}%`;
      localStorage.setItem("studypups_sfx_volume", val);
    });
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

onReady(() => {
  log("Menu loaded (simplified navigation)");

  // --- Main Interactions ---

  // Backpack click - open profile modal
  const backpack = document.getElementById("backpackContainer");
  backpack?.addEventListener("click", () => {
    openProfileModal();
  });

  // Settings button click - open settings
  const settingsBtn = document.getElementById("settingsBtn");
  settingsBtn?.addEventListener("click", () => {
    openSettingsModal();
  });

  // --- Profile Modal ---

  const closeProfileBtn = document.getElementById("closeProfileModal");
  closeProfileBtn?.addEventListener("click", closeProfileModal);

  // Create new profile button
  const createNewBtn = document.getElementById("createNewProfileBtn");
  createNewBtn?.addEventListener("click", startCreateProfile);

  // Shared device login button
  const sharedDeviceBtn = document.getElementById("sharedDeviceBtn");
  sharedDeviceBtn?.addEventListener("click", () => {
    showStep("stepSharedLogin");
  });

  // Back buttons
  document.getElementById("backToProfiles")?.addEventListener("click", () => {
    showStep("stepSelectProfile");
  });

  document.getElementById("backToCreate")?.addEventListener("click", () => {
    showStep("stepCreateProfile");
  });

  document.getElementById("backFromShared")?.addEventListener("click", () => {
    showStep("stepSelectProfile");
  });

  document.getElementById("backFromChangeName")?.addEventListener("click", () => {
    closeProfileModal();
    openSettingsModal();
  });

  // Profile name input
  const nameInput = document.getElementById("newProfileName");
  const confirmCreateBtn = document.getElementById("confirmCreateProfile");

  nameInput?.addEventListener("input", () => {
    const hasName = (nameInput.value || "").trim().length > 0;
    if (confirmCreateBtn) {
      confirmCreateBtn.disabled = !hasName;
    }
  });

  confirmCreateBtn?.addEventListener("click", goToNeighbourhoodStep);

  // Also allow Enter key
  nameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !confirmCreateBtn?.disabled) {
      goToNeighbourhoodStep();
    }
  });

  // Change name input
  const changeNameInput = document.getElementById("changeNameInput");
  const confirmChangeNameBtn = document.getElementById("confirmChangeNameBtn");

  changeNameInput?.addEventListener("input", () => {
    const hasName = (changeNameInput.value || "").trim().length > 0;
    if (confirmChangeNameBtn) {
      confirmChangeNameBtn.disabled = !hasName;
    }
  });

  confirmChangeNameBtn?.addEventListener("click", confirmChangeName);

  // Allow Enter key for change name
  changeNameInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !confirmChangeNameBtn?.disabled) {
      confirmChangeName();
    }
  });

  // Join neighbourhood
  document.getElementById("joinNeighbourhoodBtn")?.addEventListener("click", joinNeighbourhoodAndStart);

  // Use P.O. Box
  document.getElementById("usePOBoxBtn")?.addEventListener("click", usePOBoxAndStart);

  // Profile list click handling (event delegation)
  const profileList = document.getElementById("profileList");
  profileList?.addEventListener("click", (e) => {
    const playBtn = e.target.closest("[data-action='play']");
    if (playBtn) {
      const profileId = playBtn.dataset.profileId;
      startGame(profileId);
      return;
    }

    // Click on profile item selects it
    const profileItem = e.target.closest(".profile-item");
    if (profileItem) {
      const profileId = profileItem.dataset.profileId;
      startGame(profileId);
    }
  });

  // --- Settings Modal ---

  document.getElementById("closeSettingsModal")?.addEventListener("click", closeSettingsModal);
  document.getElementById("closeSettingsBtn")?.addEventListener("click", closeSettingsModal);

  document.getElementById("switchProfileBtn")?.addEventListener("click", () => {
    closeSettingsModal();
    openProfileModal();
  });

  document.getElementById("changeNameBtn")?.addEventListener("click", openChangeNameModal);

  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  document.getElementById("deleteProfileBtn")?.addEventListener("click", deleteCurrentProfile);

  // --- Login (stub) ---
  const loginUsername = document.getElementById("loginUsername");
  const loginPassword = document.getElementById("loginPassword");
  const loginBtn = document.getElementById("loginBtn");

  function checkLoginFields() {
    const hasUsername = (loginUsername?.value || "").trim().length > 0;
    const hasPassword = (loginPassword?.value || "").trim().length > 0;
    if (loginBtn) {
      loginBtn.disabled = !(hasUsername && hasPassword);
    }
  }

  loginUsername?.addEventListener("input", checkLoginFields);
  loginPassword?.addEventListener("input", checkLoginFields);

  loginBtn?.addEventListener("click", () => {
    alert("Login feature coming soon!\n\nFor now, profiles are saved locally to this device.");
  });

  // --- Volume Controls ---
  initVolumeControls();

  // --- Initial UI Update ---
  updateStatusDisplay();

  // Close modals when clicking outside
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.hidden = true;
      }
    });
  });
});
