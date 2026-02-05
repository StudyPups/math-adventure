import { onReady, initGameMenu, log } from "../core/shared.js";
import { addTeddyHelperSprite } from "./teddy-helper.js";

const LOCATION_ID = "construction-site";
const BACKGROUND_IMAGE = "assets/images/backgrounds/construction-site-background-scene.png";

onReady(() => {
  log("Construction Site loaded");
  initGameMenu(LOCATION_ID);

  const backgroundLayer = document.getElementById("backgroundLayer");
  if (backgroundLayer) {
    backgroundLayer.style.backgroundImage = `url("${BACKGROUND_IMAGE}")`;
  }

  const characterLayer = document.getElementById("characterLayer");
  if (characterLayer) {
    const teddyWrap = document.createElement("div");
    teddyWrap.className = "teddy-helper";

    const teddy = addTeddyHelperSprite({
      className: "teddy-helper-sprite",
      alt: "Teddy helper",
    });

    teddyWrap.appendChild(teddy);
    characterLayer.appendChild(teddyWrap);
  }

  const speakerName = document.getElementById("speakerName");
  if (speakerName) {
    speakerName.textContent = "Teddy";
  }

  const dialogueText = document.getElementById("dialogueText");
  if (dialogueText) {
    dialogueText.textContent = "This area is being prepared!";
  }

  const dialogueLayer = document.getElementById("dialogueLayer");
  if (dialogueLayer) {
    dialogueLayer.hidden = false;
    dialogueLayer.classList.remove("hidden");
  }
});
