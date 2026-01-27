// js/shared.js

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
export function log(...args) {
  console.log("[StudyPups]", ...args);
}
