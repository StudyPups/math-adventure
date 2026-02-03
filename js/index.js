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

/**
 * Show the joined class + letterbox in the top UI label.
 */
function renderJoinedClass() {
  const el = document.getElementById("joinedClassLabel");
  if (!el) return;

  const profileId = localStorage.getItem("studypups_current_profile_id");
  if (!profileId) {
    el.textContent = "";
    return;
  }

  const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);
  if (!code) {
    el.textContent = "📬 Post Office: P.O. Box";
    return;
  }

  const letterbox = localStorage.getItem(`studypups_letterbox_for_${profileId}`);

  if (letterbox) {
    el.textContent = `📬 Post Office: ${code} • House #${letterbox}`;
  } else {
    el.textContent = `📬 Post Office: ${code}`;
  }
}

function updateWelcomeUI() {
  const player = getCurrentPlayer();

  // Top-left title
  const titleEl = document.querySelector(".hud-title");
  if (titleEl) {
    titleEl.textContent = player ? `🐾 StudyPups — ${player.playerName}` : "🐾 StudyPups";
  }

  // Welcome text
  const menuText = document.getElementById("menuText");
  if (menuText) {
    menuText.textContent = player
      ? `Welcome back, ${player.playerName}! Ready to start your magical maths adventure?`
      : "Welcome! Ready to start your magical maths adventure?";
  }

  // Always update the Post Office label too
  renderJoinedClass();
}

function ensureProfileExists() {
  let player = getCurrentPlayer();
  if (player) return player;

  const name =
    prompt("Create a player profile!\n\nWhat name should we use?", "Player") || "Player";
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
    const delChoice = prompt("Delete which profile?\n\n" + lines + "\n\nType a number:", "1");
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

function generateClassCode() {
  // Example output: SP-4K7Q2D
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "SP-";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

// ---- Neighbourhood lookup (MVP) ----

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
    .select("letterbox_number")
    .eq("neighbourhood_id", neighbourhoodId)
    .eq("profile_id", profileId)
    .maybeSingle();

  if (existingErr) {
    console.error(existingErr);
    return null;
  }

  if (existing) {
    return existing.letterbox_number;
  }

  // 2) Count current members to assign next number
  const { count, error: countErr } = await supabase
    .from("neighbourhood_members")
    .select("*", { count: "exact", head: true })
    .eq("neighbourhood_id", neighbourhoodId);

  if (countErr) {
    console.error(countErr);
    return null;
  }

  const nextNumber = (count ?? 0) + 1;

  if (nextNumber > MAX_LETTERBOX) {
    alert(
      `This class is full (max ${MAX_LETTERBOX} students for MVP). Ask the teacher to create another class code.`
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

async function joinNeighbourhoodFlow() {
  const codeInput = window.prompt("Enter class code (e.g. SP-ABC123):");
  if (!codeInput) return;

  const cleaned = codeInput.trim().toUpperCase();

  const neighbourhood = await findNeighbourhoodByCode(cleaned);
  if (!neighbourhood) {
    window.alert("Sorry, that class code was not found.");
    return;
  }

  const profileId = localStorage.getItem("studypups_current_profile_id");
  if (!profileId) {
    window.alert("Please pick a profile first, then try again.");
    return;
  }

  // Create/confirm letterbox membership in Supabase
  const letterboxNumber = await ensureLetterboxNumber(neighbourhood.id, profileId);
  if (!letterboxNumber) return;

  // Save join info locally (per profile)
  localStorage.setItem(`studypups_neighbourhood_for_${profileId}`, neighbourhood.id);
  localStorage.setItem(`studypups_neighbourhood_code_for_${profileId}`, cleaned);
  localStorage.setItem(`studypups_letterbox_for_${profileId}`, String(letterboxNumber));

  alert(`Joined class ${cleaned}!\n\nYour house number is #${letterboxNumber}.`);
  updateWelcomeUI();

  console.log("Joined neighbourhood id:", neighbourhood.id, "for profile:", profileId);
}

async function leaveNeighbourhoodFlow() {
  const profileId = localStorage.getItem("studypups_current_profile_id");
  if (!profileId) {
    alert("Please choose a profile first.");
    return;
  }

  const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);
  const neighbourhoodId = localStorage.getItem(`studypups_neighbourhood_for_${profileId}`);

  if (!code || !neighbourhoodId) {
    alert("You are not currently joined to a class.");
    return;
  }

  const ok = confirm(`Leave class ${code}?\n\nThis removes your class link for this profile.`);
  if (!ok) return;

  const { error } = await supabase
    .from("neighbourhood_members")
    .delete()
    .eq("neighbourhood_id", neighbourhoodId)
    .eq("profile_id", profileId);

  if (error) {
    console.error(error);
    alert("Could not leave class (check console).");
    return;
  }

  // Clear local join info
  localStorage.removeItem(`studypups_neighbourhood_for_${profileId}`);
  localStorage.removeItem(`studypups_neighbourhood_code_for_${profileId}`);
  localStorage.removeItem(`studypups_letterbox_for_${profileId}`);

  alert("Left class.");
  updateWelcomeUI();
}

// TEMP: allow running from the browser console
window.joinNeighbourhoodFlow = joinNeighbourhoodFlow;
window.leaveNeighbourhoodFlow = leaveNeighbourhoodFlow;

// ---- Wire up UI events ----

onReady(() => {
  log("Menu loaded ✅");

  const enterBtn = document.getElementById("enterBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const profileBtn = document.getElementById("profileBtn");
  const postOfficeLabel = document.getElementById("joinedClassLabel");
  const createClassBtn = document.getElementById("createClassBtn");

  // Post Office click
  postOfficeLabel?.addEventListener("click", async () => {
    const profileId = localStorage.getItem("studypups_current_profile_id");
    if (!profileId) {
      alert("Please choose a profile first (click Profiles).");
      return;
    }

    const code = localStorage.getItem(`studypups_neighbourhood_code_for_${profileId}`);

    if (!code) {
      await joinNeighbourhoodFlow();
      return;
    }

    const choice = prompt(
      `📬 Post Office\n\nYou are in class: ${code}\n\n` +
        `Type:\n` +
        `1 = Open Post Office (Coming soon)\n` +
        `2 = Leave class\n`,
      "1"
    );

    if (!choice) return;

    if (choice.trim() === "2") {
      await leaveNeighbourhoodFlow();
    } else {
      alert("📬 Post Office\n\nComing soon!");
    }
  });

  // Create Class (Teacher)
  createClassBtn?.addEventListener("click", async () => {
    const ok = confirm("Teacher only: create a new class code?");
    if (!ok) return;

    const code = generateClassCode();

    const { data, error } = await supabase
      .from("neighbourhoods")
      .insert([{ class_code: code }])
      .select()
      .single();

    if (error) {
      console.error(error);
      alert("Could not create class. Check console for details.");
      return;
    }

   alert(`✅ Class created!\n\nClass code: ${data.class_code}`);


  });

  // Buttons
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

  // Initial UI
  updateWelcomeUI();
});
