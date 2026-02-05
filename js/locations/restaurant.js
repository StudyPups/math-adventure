// js/locations/restaurant.js
// Game engine for Riverside Restaurant location
// Position-based progression with measurement math

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "../core/shared.js";
import { addGlimmers, getCurrentPlayer, setGlimmers } from "../core/player-data.js";
import { restaurantScenes, getScene, STARTING_SCENE, RESTAURANT_POSITIONS, POSITION_ORDER, getNextPosition } from "../../data/restaurant-scenes.js";
import { addTeddyHelperSprite } from "./teddy-helper.js";

// ============================================
// POSITION PROGRESS TRACKING
// ============================================

const positionProgress = {
  currentPosition: null,
  questionsAnswered: 0,
  correctAnswers: 0,
  currentStreak: 0,
  bestStreak: 0,
  isQualified: false,
  isPracticeMode: false
};

function resetPositionProgress(positionId) {
  positionProgress.currentPosition = positionId;
  positionProgress.questionsAnswered = 0;
  positionProgress.correctAnswers = 0;
  positionProgress.currentStreak = 0;
  positionProgress.bestStreak = 0;
  positionProgress.isQualified = false;
}

function recordAnswer(isCorrect) {
  positionProgress.questionsAnswered++;
  if (isCorrect) {
    positionProgress.correctAnswers++;
    positionProgress.currentStreak++;
    positionProgress.bestStreak = Math.max(positionProgress.bestStreak, positionProgress.currentStreak);
  } else {
    positionProgress.currentStreak = 0;
  }
}

function checkQualification(positionId) {
  const position = RESTAURANT_POSITIONS[positionId];
  if (!position) return { qualified: false, canContinue: true };

  const { questionsRequired, correctRequired, streakRequired } = position;

  // Check if qualified
  const hasEnoughCorrect = positionProgress.correctAnswers >= correctRequired;
  const hasStreak = positionProgress.bestStreak >= streakRequired;
  const hasAnsweredAll = positionProgress.questionsAnswered >= questionsRequired;

  if (hasEnoughCorrect && hasStreak) {
    return { qualified: true, canContinue: false };
  }

  // Check if they can still qualify
  const remainingQuestions = questionsRequired - positionProgress.questionsAnswered;
  const neededCorrect = correctRequired - positionProgress.correctAnswers;

  if (remainingQuestions < neededCorrect) {
    // Can't qualify this round, but can continue practicing
    return { qualified: false, canContinue: true, failed: true };
  }

  return { qualified: false, canContinue: true };
}

// ============================================
// DAILY COMPLETION TRACKING
// ============================================

function getDailyKey(positionId) {
  const today = new Date().toISOString().split('T')[0];
  return `restaurant_${positionId}_${today}`;
}

function getDailyCompletions(positionId) {
  const key = getDailyKey(positionId);
  return parseInt(localStorage.getItem(key) || '0', 10);
}

function incrementDailyCompletion(positionId) {
  const key = getDailyKey(positionId);
  const current = getDailyCompletions(positionId);
  localStorage.setItem(key, String(current + 1));
}

function canEarnRewardsToday(positionId) {
  const MAX_DAILY_COMPLETIONS = 3;
  return getDailyCompletions(positionId) < MAX_DAILY_COMPLETIONS;
}

// ============================================
// PLAYER PROGRESS PERSISTENCE
// ============================================

function getPlayerRestaurantProgress() {
  const player = getCurrentPlayer();
  if (!player) {
    return {
      unlockedPositions: ["kitchen-hand"],
      qualifications: []
    };
  }
  if (!player.restaurantProgress) {
    player.restaurantProgress = {
      unlockedPositions: ["kitchen-hand"],
      qualifications: []
    };
    savePlayerProgress(player);
  }
  return player.restaurantProgress;
}

function savePlayerProgress(player) {
  const players = JSON.parse(localStorage.getItem("studypups_players") || "[]");
  const index = players.findIndex(p => p.id === player.id);
  if (index !== -1) {
    players[index] = player;
    localStorage.setItem("studypups_players", JSON.stringify(players));
  }
}

function unlockPosition(positionId) {
  const player = getCurrentPlayer();
  if (!player) return;

  const progress = getPlayerRestaurantProgress();
  if (!progress.unlockedPositions.includes(positionId)) {
    progress.unlockedPositions.push(positionId);
    player.restaurantProgress = progress;
    savePlayerProgress(player);
  }
}

function addQualification(positionId) {
  const player = getCurrentPlayer();
  if (!player) return;

  const progress = getPlayerRestaurantProgress();
  if (!progress.qualifications.includes(positionId)) {
    progress.qualifications.push(positionId);
    player.restaurantProgress = progress;
    savePlayerProgress(player);

    // Unlock next position
    const nextPosition = getNextPosition(positionId);
    if (nextPosition) {
      unlockPosition(nextPosition);
    }
  }
}

function hasQualification(positionId) {
  const progress = getPlayerRestaurantProgress();
  return progress.qualifications.includes(positionId);
}

function isPositionUnlocked(positionId) {
  const progress = getPlayerRestaurantProgress();
  return progress.unlockedPositions.includes(positionId);
}

// ============================================
// TEDDY HELPER SYSTEM
// ============================================

let teddyHelper = {
  element: null,
  isVisible: false,
  currentHintLevel: 0,
};

let currentPuzzleForHints = null;
let currentPuzzleFactory = null;

const TEDDY_ENCOURAGEMENTS = [
  { text: "You've got this! I believe in you!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "Go for it! You're doing great!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
  { text: "I knew you could figure it out!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "That's the spirit! Give it a try!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
];

const TEDDY_WRONG_ANSWER_LINES = [
  "That one was tricky - let's try again!",
  "Same idea, new numbers!",
  "You're learning - that's what matters.",
  "Nice try! Let's have another go.",
  "Shake it off - you can do this!"
];

function getRandomEncouragement() {
  return TEDDY_ENCOURAGEMENTS[Math.floor(Math.random() * TEDDY_ENCOURAGEMENTS.length)];
}

function getRandomWrongAnswerLine() {
  return TEDDY_WRONG_ANSWER_LINES[Math.floor(Math.random() * TEDDY_WRONG_ANSWER_LINES.length)];
}

function resetHintLevel() {
  teddyHelper.currentHintLevel = 0;
}

function showDecorativeTeddy() {
  if (document.getElementById("teddyDecor")) return;

  const teddyContainer = document.createElement("div");
  teddyContainer.id = "teddyDecor";
  teddyContainer.className = "teddy-decor";

  const teddySprite = addTeddyHelperSprite({
    className: "teddy-decor-sprite teddy-helper-sprite",
    alt: "Teddy",
    width: "var(--teddy-decor-size)",
  });

  teddyContainer.appendChild(teddySprite);
  document.getElementById("gameScreen").appendChild(teddyContainer);
}

function hideDecorativeTeddy() {
  const teddy = document.getElementById("teddyDecor");
  if (teddy) teddy.remove();
}

function showTeddyHelper() {
  hideTeddyHelper();
  hideDecorativeTeddy();
  resetHintLevel();

  const teddyContainer = document.createElement("div");
  teddyContainer.id = "teddyHelper";
  teddyContainer.className = "teddy-helper";

  const teddySprite = addTeddyHelperSprite({
    className: "teddy-helper-sprite",
    alt: "Teddy - Click for help!",
    width: "var(--teddy-helper-size)",
  });

  const label = document.createElement("div");
  label.className = "teddy-helper-label";
  label.innerHTML = `<span class="label-text">Tap me!</span>`;

  const glow = document.createElement("div");
  glow.className = "teddy-collar-glow";

  teddyContainer.appendChild(glow);
  teddyContainer.appendChild(teddySprite);
  teddyContainer.appendChild(label);

  teddyContainer.addEventListener("click", () => {
    if (currentPuzzleForHints) {
      showProgressiveHintOverlay(currentPuzzleForHints);
    }
  });

  document.getElementById("gameScreen").appendChild(teddyContainer);

  teddyHelper.element = teddyContainer;
  teddyHelper.isVisible = true;
}

function hideTeddyHelper() {
  if (teddyHelper.element) {
    teddyHelper.element.remove();
    teddyHelper.element = null;
  }
  teddyHelper.isVisible = false;
  showDecorativeTeddy();
}

// ============================================
// PROGRESSIVE HINT SYSTEM
// ============================================

function showProgressiveHintOverlay(puzzle) {
  const existingOverlay = document.getElementById("hintOverlay");
  if (existingOverlay) existingOverlay.remove();

  teddyHelper.element?.classList.add("teddy-helping");

  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  overlay.id = "hintOverlay";

  const backdrop = document.createElement("div");
  backdrop.className = "hint-overlay-backdrop";
  backdrop.addEventListener("click", () => closeHintOverlay(false));
  overlay.appendChild(backdrop);

  const hintBox = document.createElement("div");
  hintBox.className = `hint-box level-${teddyHelper.currentHintLevel + 1}`;
  hintBox.id = "hintBox";

  buildHintContent(hintBox, puzzle, teddyHelper.currentHintLevel);

  overlay.appendChild(hintBox);
  document.body.appendChild(overlay);
}

function buildHintContent(hintBox, puzzle, level) {
  const maxLevel = 2;

  hintBox.innerHTML = "";
  hintBox.className = `hint-box level-${level + 1}`;

  const headerConfig = getHeaderConfig(level);
  const header = document.createElement("div");
  header.className = "hint-box-header";
  header.innerHTML = `
    <span class="hint-box-icon">${headerConfig.icon}</span>
    <span class="hint-box-title">${headerConfig.title}</span>
  `;
  hintBox.appendChild(header);

  const content = document.createElement("div");
  content.className = "hint-box-content";

  if (level >= 1) {
    const teddyContainer = document.createElement("div");
    teddyContainer.className = "hint-teddy-container";
    const teddyImg = document.createElement("img");
    teddyImg.src = "assets/images/characters/Teddy/teddy-focus-up.png";
    teddyImg.alt = "Teddy helping";
    teddyImg.className = "hint-teddy casting";
    teddyContainer.appendChild(teddyImg);
    content.appendChild(teddyContainer);
  }

  const problemBox = document.createElement("div");
  problemBox.className = "hint-pattern-box";
  problemBox.id = "patternBox";

  const questionDisplay = document.createElement("div");
  questionDisplay.className = "hint-instruction";
  questionDisplay.textContent = puzzle.question || "Solve this problem:";
  problemBox.appendChild(questionDisplay);

  content.appendChild(problemBox);

  const explanation = document.createElement("div");
  explanation.className = "hint-explanation";
  explanation.innerHTML = getMeasurementHint(puzzle, level);
  content.appendChild(explanation);

  // Level 2: Show the answer
  if (level === 2) {
    const correctOption = puzzle.options.find(opt => opt.id === puzzle.correctId);
    if (correctOption) {
      const finalCalc = document.createElement("div");
      finalCalc.className = "hint-final-calc";
      finalCalc.innerHTML = `
        <div class="hint-final-calc-label">The answer is:</div>
        <div class="hint-final-calc-text"><strong>${correctOption.text}</strong></div>
      `;
      content.appendChild(finalCalc);
    }
  }

  hintBox.appendChild(content);

  const buttons = document.createElement("div");
  buttons.className = "hint-buttons";

  const gotItBtn = document.createElement("button");
  gotItBtn.className = "hint-btn hint-btn-primary";
  gotItBtn.textContent = "Got it!";

  const moreHintsAvailable = level < maxLevel;
  gotItBtn.addEventListener("click", () => {
    closeHintOverlay(moreHintsAvailable);
  });
  buttons.appendChild(gotItBtn);

  if (moreHintsAvailable) {
    const nextHintBtn = document.createElement("button");
    nextHintBtn.className = "hint-btn hint-btn-next-level";
    nextHintBtn.textContent = level === 0 ? "Show me how" : "Just tell me";
    nextHintBtn.addEventListener("click", () => {
      teddyHelper.currentHintLevel = level + 1;
      buildHintContent(hintBox, puzzle, level + 1);
    });
    buttons.appendChild(nextHintBtn);
  }

  hintBox.appendChild(buttons);
}

function getHeaderConfig(level) {
  switch (level) {
    case 0: return { icon: "💭", title: "Let's figure this out..." };
    case 1: return { icon: "✨", title: "Here's how to solve it!" };
    case 2: return { icon: "💪", title: "You've got this!" };
    default: return { icon: "💡", title: "Here's a hint!" };
  }
}

function getMeasurementHint(puzzle, level) {
  const baseHint = puzzle.hintOnWrong || "Think about the conversion carefully!";

  switch (level) {
    case 0:
      return `This is a <span class="keyword">measurement</span> question!<br><br>
              <strong>Tip:</strong> ${baseHint}`;
    case 1:
      return `<span class="keyword">Conversion tip:</span><br><br>
              ${baseHint}<br><br>
              <strong>Remember:</strong> 1 kg = 1000 g, 1 L = 1000 mL`;
    case 2:
      return `You're so close! The answer is shown above.<br><br>
              <strong>Look for it</strong> in the answer choices!`;
    default:
      return baseHint;
  }
}

function closeHintOverlay(showEncouragement = false) {
  const overlay = document.getElementById("hintOverlay");
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
      overlay.remove();
      if (showEncouragement && teddyHelper.isVisible) {
        showTeddySideBubble({ text: getRandomEncouragement().text });
      }
      teddyHelper.element?.classList.remove("teddy-helping");
    }, 200);
  }
}

function showTeddySideBubble(encouragement) {
  if (!teddyHelper.element) return;

  const existingBubble = teddyHelper.element.querySelector(".teddy-side-bubble");
  if (existingBubble) existingBubble.remove();

  const bubble = document.createElement("div");
  bubble.className = "teddy-side-bubble";
  bubble.textContent = encouragement.text;
  teddyHelper.element.appendChild(bubble);

  setTimeout(() => {
    bubble.classList.add("fade-out");
    setTimeout(() => bubble.remove(), 300);
  }, 1500);
}

function showWrongAnswerEncouragement() {
  if (!teddyHelper.isVisible || !teddyHelper.element) return;
  showTeddySideBubble({ text: getRandomWrongAnswerLine() });
}

function onCorrectAnswer() {
  const label = teddyHelper.element?.querySelector(".label-text");
  if (label) {
    label.textContent = "You did it!";
  }
  teddyHelper.element?.classList.add("teddy-celebrating");
}

// ============================================
// MAIN GAME ENGINE
// ============================================

onReady(() => {
  log("Restaurant Engine loaded");
  initGameMenu("restaurant");

  const gameScreen = document.getElementById("gameScreen");
  const backgroundLayer = document.getElementById("backgroundLayer");
  const characterLayer = document.getElementById("characterLayer");
  const dialogueLayer = document.getElementById("dialogueLayer");
  const speakerName = document.getElementById("speakerName");
  const dialogueText = document.getElementById("dialogueText");
  const puzzleBox = document.getElementById("puzzleBox");
  const choicesContainer = document.getElementById("choicesContainer");
  const gemCount = document.getElementById("gemCount");

  let gameState = loadGameState() || createNewGameState();
  let currentSceneId = STARTING_SCENE;
  let errorCount = 0;

  updateGemDisplay();

  // Check if returning player with progress
  const progress = getPlayerRestaurantProgress();
  if (progress.qualifications.length > 0) {
    // Returning player - go to position select
    currentSceneId = "position-select";
  }

  function showScene(sceneId) {
    const scene = getScene(sceneId);
    if (!scene) {
      log("Scene not found:", sceneId);
      return;
    }

    currentSceneId = sceneId;
    log("Showing scene:", sceneId, "| Layout:", scene.layout);

    clearUI();
    errorCount = 0;
    resetHintLevel();

    if (scene.background) {
      backgroundLayer.style.backgroundImage = `url('${scene.background}')`;
    }

    hideTeddyHelper();

    // Handle position puzzle scenes - reset progress if starting new
    if (scene.positionId && scene.layout === "puzzle") {
      if (positionProgress.currentPosition !== scene.positionId) {
        resetPositionProgress(scene.positionId);
        positionProgress.isPracticeMode = !canEarnRewardsToday(scene.positionId);
      }
    }

    switch (scene.layout) {
      case "scene":
        renderSceneLayout(scene);
        break;
      case "dialogue":
        renderDialogueLayout(scene);
        break;
      case "puzzle":
        renderPuzzleLayout(scene);
        break;
      case "progress-check":
        renderProgressCheck(scene);
        break;
      case "certificate":
        renderCertificate(scene);
        break;
      case "position-select":
        renderPositionSelect(scene);
        break;
      case "transition":
        renderTransition(scene);
        return;
      case "open-menu":
        if (window.openGameMenu) {
          window.openGameMenu();
        }
        return;
      default:
        renderDialogueLayout(scene);
    }
  }

  function clearUI() {
    characterLayer.innerHTML = "";
    choicesContainer.innerHTML = "";
    puzzleBox.innerHTML = "";
    puzzleBox.hidden = true;
    speakerName.textContent = "";
    dialogueText.textContent = "";
    dialogueText.className = "dialogue-text";
    dialogueLayer.classList.remove("dialogue-mode", "scene-mode", "hidden");
    dialogueLayer.hidden = false;
  }

  function renderSceneLayout(scene) {
    dialogueLayer.classList.add("scene-mode");

    if (scene.characters) {
      renderCharacters(scene.characters);
    }

    if (scene.dialogue && typeof scene.dialogue === "object") {
      dialogueLayer.classList.remove("scene-mode");
      dialogueLayer.classList.add("dialogue-mode");
      if (scene.dialogue.speaker) {
        speakerName.textContent = scene.dialogue.speaker;
      }
      dialogueText.innerHTML = formatDialogue(scene.dialogue.text);
    }

    if (scene.choices) {
      renderChoices(scene.choices);
    }
  }

  function renderDialogueLayout(scene) {
    dialogueLayer.classList.add("dialogue-mode");

    if (scene.speaker && scene.speaker.image) {
      renderCharacters([{
        id: "speaker",
        image: scene.speaker.image,
        position: scene.speaker.position || "stage-center",
        size: "large"
      }]);
      speakerName.textContent = scene.speaker.name || "";
    }

    if (scene.dialogue) {
      const text = typeof scene.dialogue === "string" ? scene.dialogue : scene.dialogue.text;
      dialogueText.innerHTML = formatDialogue(text);
    }

    if (scene.choices) {
      renderChoices(scene.choices);
    }
  }

  function renderPuzzleLayout(scene) {
    dialogueLayer.classList.add("dialogue-mode");

    if (scene.speaker && scene.speaker.image) {
      renderCharacters([{
        id: "speaker",
        image: scene.speaker.image,
        position: "stage-left",
        size: "medium"
      }]);
      speakerName.textContent = scene.speaker.name || "";
    }

    const puzzleData = (typeof scene.puzzle === "function") ? scene.puzzle() : scene.puzzle;

    currentPuzzleFactory = (typeof scene.puzzle === "function") ? scene.puzzle : null;
    currentPuzzleForHints = puzzleData;

    if (scene.dialogue || puzzleData?.dialogue) {
      const text = scene.dialogue || puzzleData.dialogue;
      dialogueText.innerHTML = formatDialogue(text);
    }

    // Show progress indicator
    if (scene.positionId) {
      const position = RESTAURANT_POSITIONS[scene.positionId];
      if (position) {
        showProgressIndicator(position);
      }
    }

    if (scene.puzzle) {
      renderPuzzle(puzzleData, scene.positionId);
      showTeddyHelper();
    }
  }

  function showProgressIndicator(position) {
    const existing = document.getElementById("progressIndicator");
    if (existing) existing.remove();

    const indicator = document.createElement("div");
    indicator.id = "progressIndicator";
    indicator.className = "progress-indicator";

    const total = position.questionsRequired;
    const answered = positionProgress.questionsAnswered;
    const correct = positionProgress.correctAnswers;
    const streak = positionProgress.currentStreak;

    indicator.innerHTML = `
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${(answered / total) * 100}%"></div>
      </div>
      <div class="progress-stats">
        <span>Question ${Math.min(answered + 1, total)} of ${total}</span>
        <span>Correct: ${correct}/${position.correctRequired}</span>
        <span>Streak: ${streak}${streak >= position.streakRequired ? ' ✓' : ''}</span>
      </div>
    `;

    puzzleBox.parentNode.insertBefore(indicator, puzzleBox);
  }

  function renderProgressCheck(scene) {
    const result = checkQualification(scene.positionId);

    if (result.qualified) {
      // Mark as qualified and unlock next
      addQualification(scene.positionId);
      incrementDailyCompletion(scene.positionId);
      showScene(scene.onComplete);
    } else if (positionProgress.questionsAnswered >= RESTAURANT_POSITIONS[scene.positionId].questionsRequired) {
      // Finished all questions but didn't qualify
      showNotQualifiedScene(scene.positionId);
    } else {
      // Continue with more questions
      showScene(scene.onContinue);
    }
  }

  function showNotQualifiedScene(positionId) {
    dialogueLayer.classList.add("dialogue-mode");

    renderCharacters([{
      id: "speaker",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "stage-left",
      size: "medium"
    }]);
    speakerName.textContent = "Chef Zara";

    const position = RESTAURANT_POSITIONS[positionId];
    const correct = positionProgress.correctAnswers;
    const needed = position.correctRequired;
    const streak = positionProgress.bestStreak;
    const streakNeeded = position.streakRequired;

    let message = "You've completed all the tasks, but ";
    if (correct < needed) {
      message += `you need ${needed} correct answers (you got ${correct}). `;
    }
    if (streak < streakNeeded) {
      message += `You also need a streak of ${streakNeeded} in a row (your best was ${streak}). `;
    }
    message += "Don't worry - practice makes perfect! Want to try again?";

    dialogueText.innerHTML = formatDialogue(message);

    const retryBtn = document.createElement("button");
    retryBtn.className = "btn btn-choice";
    retryBtn.textContent = "Try Again";
    retryBtn.addEventListener("click", () => {
      resetPositionProgress(positionId);
      showScene(`${positionId.replace('-', '-')}-puzzle`);
    });

    const backBtn = document.createElement("button");
    backBtn.className = "btn btn-choice";
    backBtn.textContent = "Take a Break";
    backBtn.addEventListener("click", () => showScene("position-select"));

    choicesContainer.appendChild(retryBtn);
    choicesContainer.appendChild(backBtn);
  }

  function renderCertificate(scene) {
    dialogueLayer.classList.add("dialogue-mode");
    puzzleBox.hidden = false;
    puzzleBox.innerHTML = "";

    const certificate = document.createElement("div");
    certificate.className = "certificate";
    certificate.innerHTML = `
      <div class="certificate-border">
        <div class="certificate-header">Certificate of Achievement</div>
        <div class="certificate-title">${scene.title}</div>
        <div class="certificate-message">${formatDialogue(scene.message)}</div>
        <div class="certificate-signature">
          <div class="signature-line"></div>
          <div class="signature-name">Chef Zara</div>
          <div class="signature-title">Head Chef, Riverside Restaurant</div>
        </div>
      </div>
    `;

    puzzleBox.appendChild(certificate);

    const continueBtn = document.createElement("button");
    continueBtn.className = "btn btn-choice btn-primary-large";
    continueBtn.textContent = "Continue";
    continueBtn.addEventListener("click", () => showScene(scene.nextScene));

    choicesContainer.appendChild(continueBtn);
  }

  function renderPositionSelect(scene) {
    dialogueLayer.classList.add("dialogue-mode");

    if (scene.speaker && scene.speaker.image) {
      renderCharacters([{
        id: "speaker",
        image: scene.speaker.image,
        position: "stage-left",
        size: "medium"
      }]);
      speakerName.textContent = scene.speaker.name || "";
    }

    if (scene.dialogue) {
      dialogueText.innerHTML = formatDialogue(scene.dialogue);
    }

    const progress = getPlayerRestaurantProgress();

    POSITION_ORDER.forEach((positionId) => {
      const position = RESTAURANT_POSITIONS[positionId];
      const isUnlocked = progress.unlockedPositions.includes(positionId);
      const isQualified = progress.qualifications.includes(positionId);
      const isImplemented = position.generator !== null;

      const btn = document.createElement("button");
      btn.className = "btn btn-choice position-btn";

      let statusIcon = "";
      if (isQualified) statusIcon = " ✓";
      else if (!isUnlocked) statusIcon = " 🔒";
      else if (!isImplemented) statusIcon = " (Coming Soon)";

      btn.textContent = `${position.displayName}${statusIcon}`;

      if (!isUnlocked || !isImplemented) {
        btn.disabled = true;
        btn.classList.add("locked");
      } else {
        const puzzleSceneId = `${positionId}-puzzle`;
        btn.addEventListener("click", () => {
          if (!canEarnRewardsToday(positionId) && isQualified) {
            positionProgress.isPracticeMode = true;
          }
          resetPositionProgress(positionId);
          showScene(puzzleSceneId);
        });
      }

      choicesContainer.appendChild(btn);
    });

    // Add navigation options
    const divider = document.createElement("div");
    divider.className = "choice-divider";
    divider.textContent = "— or —";
    choicesContainer.appendChild(divider);

    const shopBtn = document.createElement("button");
    shopBtn.className = "btn btn-choice";
    shopBtn.textContent = "Visit Melody's Shop";
    shopBtn.addEventListener("click", () => showScene("goto-shop"));
    choicesContainer.appendChild(shopBtn);

    const mapBtn = document.createElement("button");
    mapBtn.className = "btn btn-choice";
    mapBtn.textContent = "Explore the Map";
    mapBtn.addEventListener("click", () => {
      if (window.openGameMenu) window.openGameMenu();
    });
    choicesContainer.appendChild(mapBtn);
  }

  function renderTransition(scene) {
    saveGameState(gameState);

    gameScreen.innerHTML = `
      <div class="transition-screen">
        <div class="transition-text">${scene.transitionText || "Loading..."}</div>
        <div class="loading-paw">🐾</div>
      </div>
    `;

    setTimeout(() => {
      window.location.href = scene.destination || "index.html";
    }, 1500);
  }

  function renderCharacters(characters) {
    characters.forEach((char) => {
      const container = document.createElement("div");
      container.className = `character-container pos-${char.position} size-${char.size || "medium"}`;

      const img = document.createElement("img");
      img.src = char.image;
      img.alt = char.id;
      img.className = "character-sprite";

      img.onerror = () => log("Failed to load:", char.image);

      container.appendChild(img);
      characterLayer.appendChild(container);
    });
  }

  function renderChoices(choices) {
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      btn.className = choice.style === "primary-large" ? "btn btn-primary-large" : "btn btn-choice";
      btn.textContent = choice.text;
      btn.addEventListener("click", () => {
        if (choice.next) showScene(choice.next);
      });
      choicesContainer.appendChild(btn);
    });
  }

  function renderPuzzle(puzzle, positionId) {
    puzzleBox.hidden = false;
    puzzleBox.innerHTML = "";
    currentPuzzleForHints = puzzle;

    const questionEl = document.createElement("div");
    questionEl.className = "puzzle-question";
    questionEl.textContent = puzzle.question;
    puzzleBox.appendChild(questionEl);

    const optionsEl = document.createElement("div");
    optionsEl.className = "puzzle-options";

    puzzle.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn";
      btn.textContent = opt.text;
      btn.addEventListener("click", () => {
        handlePuzzleAnswer(opt.id, puzzle, btn, optionsEl, positionId);
      });
      optionsEl.appendChild(btn);
    });

    puzzleBox.appendChild(optionsEl);
  }

  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl, positionId) {
    const isCorrect = selectedId === puzzle.correctId;

    optionsEl.querySelectorAll("button").forEach((btn) => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      onCorrectAnswer();

      recordAnswer(true);

      // Award gems if not in practice mode
      if (puzzle.reward && !positionProgress.isPracticeMode) {
        awardGems(puzzle.reward);
      }

      setTimeout(() => {
        if (puzzle.onCorrect) showScene(puzzle.onCorrect);
      }, 1500);

    } else {
      selectedBtn.classList.add("incorrect");
      recordAnswer(false);
      errorCount++;
      showWrongAnswerEncouragement();

      setTimeout(() => {
        const refreshedPuzzle = regeneratePuzzle(puzzle, positionId);
        if (errorCount === 1) {
          showHintOffer(refreshedPuzzle);
        } else if (errorCount >= 3) {
          showProgressiveHintOverlay(refreshedPuzzle);
        }
      }, 1500);
    }
  }

  function regeneratePuzzle(puzzle, positionId) {
    let newPuzzle = null;

    if (typeof currentPuzzleFactory === "function") {
      newPuzzle = currentPuzzleFactory();
    } else {
      return puzzle;
    }

    if (!newPuzzle) return puzzle;

    newPuzzle = {
      ...newPuzzle,
      onCorrect: puzzle.onCorrect
    };

    currentPuzzleForHints = newPuzzle;

    // Update dialogue
    if (newPuzzle.dialogue) {
      dialogueText.innerHTML = formatDialogue(newPuzzle.dialogue);
    }

    renderPuzzle(newPuzzle, positionId);

    if (!teddyHelper.isVisible) {
      showTeddyHelper();
    }

    return newPuzzle;
  }

  function showHintOffer(puzzle) {
    if (document.getElementById("hintPopup")) return;

    const popup = document.createElement("div");
    popup.id = "hintPopup";
    popup.className = "hint-popup";
    popup.innerHTML = `
      <div class="hint-popup-content">
        <p>Need a hint?</p>
        <div class="hint-popup-buttons">
          <button class="btn btn-hint-yes">Yes please!</button>
          <button class="btn btn-hint-no">I'll try again</button>
        </div>
      </div>
    `;

    puzzleBox.appendChild(popup);

    popup.querySelector(".btn-hint-yes").addEventListener("click", () => {
      popup.remove();
      showProgressiveHintOverlay(puzzle);
    });

    popup.querySelector(".btn-hint-no").addEventListener("click", () => {
      popup.remove();
      showTeddySideBubble({ text: getRandomEncouragement().text });
    });
  }

  function awardGems(amount) {
    const total = addGlimmers(amount) ?? 0;
    log(`Awarded ${amount} gems! Total: ${total}`);
    updateGemDisplay();
    celebrateGems(amount);
  }

  function celebrateGems(amount) {
    const gemIcon = document.querySelector(".gem-display");
    if (!gemIcon) return;

    gemIcon.classList.add("gem-earned");

    const plusText = document.createElement("div");
    plusText.className = "gem-plus-text";
    plusText.textContent = `+${amount}`;

    const rect = gemIcon.getBoundingClientRect();
    plusText.style.position = "fixed";
    plusText.style.left = `${rect.left + 30}px`;
    plusText.style.top = `${rect.top}px`;
    plusText.style.zIndex = "9999";

    document.body.appendChild(plusText);

    setTimeout(() => {
      gemIcon.classList.remove("gem-earned");
      plusText.remove();
    }, 1500);
  }

  function formatDialogue(text) {
    if (!text) return "";
    let formatted = text.replace(/{playerName}/g, gameState.playerName || "friend");
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/✨([^✨]+)✨/g, '<span class="sparkle">$1</span>');
    return formatted;
  }

  function updateGemDisplay() {
    const player = getCurrentPlayer();
    const count = player?.glimmers || 0;
    if (gemCount) {
      gemCount.textContent = count;
    }
  }

  // Start the game
  showScene(currentSceneId);
});

// Map/Menu button handler
const homeBtn = document.getElementById("homeBtn");
homeBtn?.addEventListener("click", () => {
  if (window.openGameMenu) {
    window.openGameMenu();
  }
});
