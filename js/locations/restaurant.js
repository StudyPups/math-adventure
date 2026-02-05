import { onReady } from "../core/shared.js";
import { addTeddyHelperSprite } from "./teddy-helper.js";

onReady(() => {
  const bg = document.getElementById("backgroundLayer");
  const characters = document.getElementById("characterLayer");

  if (bg) {
    bg.style.backgroundImage =
      'url("assets/images/backgrounds/kitchen-background-scene.png")';
  }

  if (!characters) return;

  // Zara NPC
  const zara = document.createElement("div");
  zara.className = "zara-sprite";
  zara.setAttribute("aria-label", "Chef Zara");
  zara.style.backgroundImage =
    'url("assets/images/characters/Chef-Zara/zara-neutral.png")';
  characters.appendChild(zara);

  // Teddy helper (decor)
  const teddyWrap = document.createElement("div");
  teddyWrap.className = "teddy-decor";

  const teddy = addTeddyHelperSprite({
    className: "teddy-decor-sprite teddy-helper-sprite",
    alt: "Teddy",
  });

  teddyWrap.appendChild(teddy);
  characters.appendChild(teddyWrap);
});
