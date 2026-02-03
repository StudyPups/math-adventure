// js/teacher.js
// Teacher dashboard (MVP - read-only)

import { supabase } from "./core/backend.js";

async function findNeighbourhoodByCode(code) {
  const cleaned = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from("neighbourhoods")
    .select("id, class_code")
    .eq("class_code", cleaned)
    .single();

  if (error) return null;
  return data;
}

async function listMembers(neighbourhoodId) {
  const { data, error } = await supabase
    .from("neighbourhood_members")
    .select("letterbox_number, is_active, joined_at")
    .eq("neighbourhood_id", neighbourhoodId)
    .order("letterbox_number", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

function renderMembers(container, members) {
  container.innerHTML = "";

  if (!members.length) {
    container.innerHTML = `<div class="small">No students have joined yet.</div>`;
    return;
  }

  for (const m of members) {
    const active = m.is_active !== false; // default true if null
    const tagText = active ? "Active" : "Inactive";

    const row = document.createElement("div");
    row.className = "list-item";

    row.innerHTML = `
      <div><strong>House #${m.letterbox_number}</strong></div>
      <div class="tag">${tagText}</div>
    `;

    container.appendChild(row);
  }
}

function setStatus(el, msg) {
  el.textContent = msg;
}

document.addEventListener("DOMContentLoaded", () => {
  const codeInput = document.getElementById("classCode");
  const loadBtn = document.getElementById("loadBtn");
  const backBtn = document.getElementById("backBtn");
  const statusEl = document.getElementById("status");
  const resultsEl = document.getElementById("results");

  backBtn?.addEventListener("click", () => {
    window.location.href = "index.html";
  });

  loadBtn?.addEventListener("click", async () => {
    const code = codeInput?.value || "";
    resultsEl.innerHTML = "";

    if (!code.trim()) {
      setStatus(statusEl, "Please enter a class code.");
      return;
    }

    setStatus(statusEl, "Loading…");

    // 1) Find the class row
    const neighbourhood = await findNeighbourhoodByCode(code);
    if (!neighbourhood) {
      setStatus(statusEl, "Class code not found.");
      return;
    }

    // 2) Load members
    try {
      const members = await listMembers(neighbourhood.id);

      const activeCount = members.filter((m) => m.is_active !== false).length;
      setStatus(
        statusEl,
        `Class ${neighbourhood.class_code}: ${activeCount} active member(s)`
      );

      renderMembers(resultsEl, members);
    } catch (err) {
      console.error(err);
      setStatus(statusEl, "Could not load members. Check console.");
    }
  });
});
