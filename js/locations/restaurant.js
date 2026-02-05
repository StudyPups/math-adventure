import { onReady } from "../core/shared.js";

onReady(() => {
  const bg = document.getElementById("backgroundLayer");
  const characters = document.getElementById("characterLayer");

  if (bg) {
    bg.style.backgroundImage =
      'url("assets/images/backgrounds/kitchen-background-scene.png")';
  }

  if (!characters) return;

  // Zara NPC
  const zara = document.createElement("img");
  zara.src = "assets/images/characters/Chef-Zara/zara-neutral.png";
  zara.alt = "Chef Zara";
  zara.className = "npc-zara";
  characters.appendChild(zara);

  // Teddy helper (decor)
  const teddyWrap = document.createElement("div");
  teddyWrap.className = "teddy-decor";

  const teddy = document.createElement("img");
  teddy.src = "assets/images/characters/Teddy/teddy-wait.png";
  teddy.alt = "Teddy";
  teddy.className = "teddy-decor-sprite";

  teddyWrap.appendChild(teddy);
  characters.appendChild(teddyWrap);
});
