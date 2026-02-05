export const TEDDY_SHEET = "assets/images/characters/Teddy/teddy_idle_sheet.png";
export const TEDDY_FRAMES = 4;

export function addTeddyHelperSprite({
  className = "teddy-helper-sprite",
  alt = "Teddy",
  width,
} = {}) {
  const teddy = document.createElement("div");
  teddy.className = className;
  teddy.setAttribute("role", "img");
  teddy.setAttribute("aria-label", alt);
  teddy.style.backgroundImage = `url("${TEDDY_SHEET}")`;

  if (width) {
    teddy.style.width = width;
  }

  const img = new Image();
  img.onload = () => {
    const frameW = img.naturalWidth / TEDDY_FRAMES;
    const frameH = img.naturalHeight;
    teddy.style.aspectRatio = `${frameW} / ${frameH}`;
  };
  img.src = TEDDY_SHEET;

  return teddy;
}
