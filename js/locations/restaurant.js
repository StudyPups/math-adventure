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
  characters.appendChild(zara);

  const sheetSrc = "assets/images/characters/Chef-Zara/zara-neutral.png";
  const img = new Image();
  img.onload = () => {
    const frames = 4;
    const frameW = img.naturalWidth / frames;
    const frameH = img.naturalHeight;
    zara.style.setProperty("--frames", frames);
    zara.style.setProperty("--sheetW", img.naturalWidth);
    zara.style.setProperty("--sheetH", img.naturalHeight);
    zara.style.setProperty("--frameW", frameW);
    zara.style.setProperty("--frameH", frameH);
    zara.style.backgroundImage = `url("${sheetSrc}")`;
    zara.style.aspectRatio = `${frameW} / ${frameH}`;
  };
  img.src = sheetSrc;

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
