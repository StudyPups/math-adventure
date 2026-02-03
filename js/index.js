// js/index.js
// Main menu / landing page logic

import { supabase } from "./core/backend.js";
console.log("Supabase client ready:", !!supabase);

import { onReady, log } from "./core/shared.js";


import {
  getCurrentPlayer,
  listProfiles,
  createProfileAndSetCurrent,
  setCurrentProfile,
  deleteProfile
} from "./core/player-data.js";


 function renderJoinedClass() {
  const el = document.getElementById("joinedClassLabel");
  if (!el) return;

  const profileId = localStorage.getItem("studypups_current_profile_id");
  if (!profileId) {
    el.textContent = "";
    return;
  }

  const code = localStorage.getItem(
    `studypups_neighbourhood_code_for_${profileId}`
  );

  if (!code) {
    el.textContent = "📬 Post Office: P.O. Box";
    return;
  }

  el.textContent = `📬 Post Office: ${code}`;
}



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
      // Always update the Post Office label too
renderJoinedClass();
       
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
  renderJoinedClass();
  log("Menu loaded ✅");

  const enterBtn = document.getElementById("enterBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const profileBtn = document.getElementById("profileBtn");

    const postOfficeLabel = document.getElementById("joinedClassLabel");

  postOfficeLabel?.addEventListener("click", async () => {
    // Make sure a profile exists first
    const profileId = localStorage.getItem("studypups_current_profile_id");
    if (!profileId) {
      alert("Please choose a profile first (click Profiles).");
      return;
    }

    // Are we already joined?
    const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);

    if (!code) {
      // Not joined yet → run the join flow
      await joinNeighbourhoodFlow();
    } else {
      // Joined already → show a simple placeholder screen
      alert(`📬 Post Office\n\nYou are in class: ${code}\n\n(Coming soon!)`);
    }
  });


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



// ---- Neighbourhood lookup (test only) ----

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

  console.log("Neighbourhood found:", data);
  return data;
}

async function joinNeighbourhoodFlow() {
  const code = window.prompt("Enter class code (e.g. TEST123):");
  if (!code) return;

  const neighbourhood = await findNeighbourhoodByCode(code.trim());
  if (!neighbourhood) {
    window.alert("Sorry, that class code was not found.");
    return;
  }

  const profileId = localStorage.getItem("studypups_current_profile_id");
  if (!profileId) {
    window.alert("Please pick a profile first, then try again.");
    return;
  }

  // Save the joined neighbourhood id for THIS profile (local for now)
  localStorage.setItem(
    `studypups_neighbourhood_for_${profileId}`,
    neighbourhood.id
  );
  
// ✅ ALSO save the class code for the label
const cleaned = code.trim().toUpperCase();
localStorage.setItem(`studypups_neighbourhood_code_for_${profileId}`, cleaned);
alert(`Joined class ${cleaned}!`);
  renderJoinedClass();
  console.log("Joined neighbourhood id:", neighbourhood.id, "for profile:", profileId);
}

// TEMP: allow running from the browser console
window.joinNeighbourhoodFlow = joinNeighbourhoodFlow;


// TEMP test (remove later)
//findNeighbourhoodByCode("TEST123");
