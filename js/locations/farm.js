// js/farm.js
// Game engine for Buttercup's Farm location
// NOW WITH: 3-tier progressive hints matching tutorial + Teddy encouragement! 🎉

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "../core/shared.js";
import { addGlimmers, getCurrentPlayer, setGlimmers } from "../core/player-data.js";
import { farmScenes, getScene, STARTING_SCENE } from "../../data/farm-scenes.js";
import { getTopicById } from "../maths/topic-registry.js";


// ============================================
// TEDDY HELPER SYSTEM - ENHANCED WITH 3-TIER HINTS
// ============================================

// --- TEDDY HELPER STATE ---
let teddyHelper = {
  element: null,
  isVisible: false,
  currentPose: 0,
  idleInterval: null,
  currentHintLevel: 0,  // Track hint level (0, 1, 2)
  hasAttempted: false,
};

// --- PUZZLE REGEN STATE ---
let currentPuzzleForHints = null;
let currentPuzzleFactory = null;
let currentSceneDialogueTemplate = "";

// Teddy's idle poses
const TEDDY_IDLE_POSES = [
  "teddy-wait.png",
  "teddy-listen.png",
  "teddy-hopeful.png",
  "teddy-lookup.png"
];

// Teddy's helping pose
const TEDDY_HELPING_POSE = "teddy-focus-up.png";

// Teddy's celebration poses
const TEDDY_CELEBRATION_POSES = [
  "teddy-leap-joy.png",
  "teddy-jump-excited.png",
  "teddy-tongue.png"
];

// Encouraging messages when player chooses "Got it!" with more hints available
const TEDDY_ENCOURAGEMENTS = [
  { text: "You've got this! I believe in you! 🐕", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "Go for it! You're doing great!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
  { text: "I knew you could figure it out!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "That's the spirit! Give it a try!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
  { text: "Woof! You're so brave!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "I'm cheering for you! 🐾", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" }
];

const TEDDY_WRONG_ANSWER_LINES = [
  "That one was tricky — let’s try different numbers!",
  "Same idea, new number!",
  "You’re learning — that’s what matters.",
  "Nice try! Let’s have another go.",
  "Shake it off — you can do this!"
];

/**
 * Get a random encouragement from Teddy
 */
function getRandomEncouragement() {
  const index = Math.floor(Math.random() * TEDDY_ENCOURAGEMENTS.length);
  return TEDDY_ENCOURAGEMENTS[index];
}

function getRandomWrongAnswerLine() {
  return TEDDY_WRONG_ANSWER_LINES[Math.floor(Math.random() * TEDDY_WRONG_ANSWER_LINES.length)];
}

/**
 * Reset hint level for new puzzle
 */
function resetHintLevel() {
  teddyHelper.currentHintLevel = 0;
  teddyHelper.hasAttempted = false;
}

// Teddy's fun responses when clicked (not during puzzles)
const TEDDY_FUN_RESPONSES = [
  { text: "Woof! Is that a treat?! 🦴", pose: "teddy-tongue.png" },
  { text: "Walkies?! Did someone say walkies?!", pose: "teddy-jump-excited.png" },
  { text: "I love exploring the farm! 🌻", pose: "teddy-tongue.png" },
  { text: "*happy tail wags*", pose: "tutorial-teddy-hopeful.png" },
  { text: "You're doing great! Keep going!", pose: "teddy-tongue.png" },
  { text: "Farmer Buttercup is so nice!", pose: "tutorial-teddy-hopeful.png" },
  { text: "I can smell hay! And... is that pie?! 🥧", pose: "teddy-tongue.png" },
  { text: "*rolls over for belly rubs*", pose: "teddy-leap-joy.png" },
  { text: "Best. Day. Ever!", pose: "teddy-jump-excited.png" },
  { text: "Boop! 🐾", pose: "teddy-tongue.png" },
  { text: "Did you know I love maths AND treats?", pose: "tutorial-teddy-hopeful.png" },
  { text: "Adventure time with my favourite human!", pose: "teddy-tongue.png" },
];

/**
 * Show decorative Teddy (always visible, clickable for fun responses!)
 */
function showDecorativeTeddy() {
  // Don't add if already exists
  if (document.getElementById("teddyDecor")) return;
  
  const teddyContainer = document.createElement("div");
  teddyContainer.id = "teddyDecor";
  teddyContainer.className = "teddy-decor";
  
  const teddyImg = document.createElement("img");
  teddyImg.src = "assets/images/characters/Teddy/teddy-wait.png";
  teddyImg.alt = "Teddy";
  teddyImg.className = "teddy-decor-sprite";
  teddyImg.draggable = false;
  
  teddyImg.onerror = () => {
    console.error("❌ Failed to load decorative Teddy");
  };
  
  teddyContainer.appendChild(teddyImg);
  
  // Click handler for fun responses!
  teddyContainer.addEventListener("click", () => {
    showTeddyFunResponse(teddyImg);
  });
  
  document.getElementById("gameScreen").appendChild(teddyContainer);
  
  console.log("🐕 Decorative Teddy is here!");
}

/**
 * Show a fun response when Teddy is clicked (not during puzzles)
 */
function showTeddyFunResponse(teddyImg) {
  // Pick a random response
  const response = TEDDY_FUN_RESPONSES[Math.floor(Math.random() * TEDDY_FUN_RESPONSES.length)];
  
  // Change Teddy's pose
  const originalPose = teddyImg.src;
  teddyImg.src = `assets/images/characters/Teddy/${response.pose}`;
  teddyImg.classList.add("teddy-excited");
  
  // Remove existing speech bubble if any
  const existingBubble = document.querySelector(".teddy-fun-bubble");
  if (existingBubble) existingBubble.remove();
  
  // Create speech bubble
  const bubble = document.createElement("div");
  bubble.className = "teddy-fun-bubble";
  bubble.textContent = response.text;
  
  // Position near Teddy
  const teddyContainer = document.getElementById("teddyDecor");
  teddyContainer.appendChild(bubble);
  
  // Reset after a moment
  setTimeout(() => {
    bubble.classList.add("fade-out");
    setTimeout(() => {
      bubble.remove();
      teddyImg.src = originalPose;
      teddyImg.classList.remove("teddy-excited");
    }, 300);
  }, 2000);
}

/**
 * Hide decorative Teddy
 */
function hideDecorativeTeddy() {
  const teddy = document.getElementById("teddyDecor");
  if (teddy) teddy.remove();
}

/**
 * Show Teddy helper beside the puzzle box (clickable for hints)
 */
function showTeddyHelper() {
  hideTeddyHelper();
  
  // Also hide the decorative one - helper takes over
  hideDecorativeTeddy();
  
  // Reset state for new puzzle
  resetHintLevel();
  teddyHelper.currentPose = 0;
  
  const teddyContainer = document.createElement("div");
  teddyContainer.id = "teddyHelper";
  teddyContainer.className = "teddy-helper";
  
  const teddyImg = document.createElement("img");
  teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[0]}`;
  teddyImg.alt = "Teddy - Click for help!";
  teddyImg.className = "teddy-helper-sprite";
  teddyImg.draggable = false;
  
  teddyImg.onerror = () => {
    console.error("❌ Failed to load Teddy:", teddyImg.src);
  };
  
  const label = document.createElement("div");
  label.className = "teddy-helper-label";
  label.innerHTML = `<span class="label-text">Tap me!</span>`;
  
  const glow = document.createElement("div");
  glow.className = "teddy-collar-glow";
  
  teddyContainer.appendChild(glow);
  teddyContainer.appendChild(teddyImg);
  teddyContainer.appendChild(label);
  
  // Click handler
  teddyContainer.addEventListener("click", () => {
    if (currentPuzzleForHints) {
      showProgressiveHintOverlay(currentPuzzleForHints);
    }
  });
  
  // Hover effects
  teddyContainer.addEventListener("mouseenter", () => {
    teddyImg.src = `assets/images/characters/Teddy/teddy-tongue.png`;
    label.querySelector(".label-text").textContent = "I can help!";
  });
  
  teddyContainer.addEventListener("mouseleave", () => {
    if (!document.querySelector(".hint-overlay")) {
      teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[teddyHelper.currentPose]}`;
      label.querySelector(".label-text").textContent = "Tap me!";
    }
  });
  
  document.getElementById("gameScreen").appendChild(teddyContainer);
  
  teddyHelper.element = teddyContainer;
  teddyHelper.isVisible = true;
  
  startIdleAnimation();
  console.log("🐕 Teddy Helper is ready!");
}

/**
 * Hide Teddy helper (and bring back decorative Teddy)
 */
function hideTeddyHelper() {
  if (teddyHelper.element) {
    teddyHelper.element.remove();
    teddyHelper.element = null;
  }
  teddyHelper.isVisible = false;
  stopIdleAnimation();
  
  // Bring back the decorative Teddy
  showDecorativeTeddy();
}

// ============================================
// 3-TIER PROGRESSIVE HINT SYSTEM (matching tutorial)
// ============================================

/**
 * Show the progressive hint overlay - NOW WITH 3 LEVELS!
 */
function showProgressiveHintOverlay(puzzle) {
  // Remove existing overlay
  const existingOverlay = document.getElementById("hintOverlay");
  if (existingOverlay) existingOverlay.remove();
  
  // Stop Teddy's idle animation
  stopIdleAnimation();
  
  // Update Teddy's appearance
  const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
  if (teddyImg) {
    teddyImg.src = `assets/images/characters/Teddy/${TEDDY_HELPING_POSE}`;
  }
  
  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  overlay.id = "hintOverlay";
  
  // Backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "hint-overlay-backdrop";
  backdrop.addEventListener("click", () => closeHintOverlay(false));
  overlay.appendChild(backdrop);
  
  // Hint box
  const hintBox = document.createElement("div");
  hintBox.className = `hint-box level-${teddyHelper.currentHintLevel + 1}`;
  hintBox.id = "hintBox";
  
  // Build content
  buildHintContent(hintBox, puzzle, teddyHelper.currentHintLevel);
  
  overlay.appendChild(hintBox);
  document.body.appendChild(overlay);
}

/**
 * Build hint content based on current level
 */
function buildHintContent(hintBox, puzzle, level) {
  const maxLevel = 2; // 3 levels: 0, 1, 2
  
  hintBox.innerHTML = "";
  hintBox.className = `hint-box level-${level + 1}`;
  
  // === HEADER ===
  const header = document.createElement("div");
  header.className = "hint-box-header";
  
  const headerConfig = getHeaderConfig(level);
  header.innerHTML = `
    <span class="hint-box-icon">${headerConfig.icon}</span>
    <span class="hint-box-title">${headerConfig.title}</span>
  `;
  hintBox.appendChild(header);
  
  // === CONTENT ===
  const content = document.createElement("div");
  content.className = "hint-box-content";
  
  // Show Teddy on level 1+
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
  
  // Problem display box
  const problemBox = document.createElement("div");
  problemBox.className = "hint-pattern-box";
  problemBox.id = "patternBox";
  
  // Show the question
  const questionDisplay = document.createElement("div");
  questionDisplay.className = "hint-instruction";
  questionDisplay.textContent = puzzle.question || "Solve this problem:";
  problemBox.appendChild(questionDisplay);
  
  // Visual representation for multiplication
  if (puzzle.type === "multiplication") {
    const visual = createMultiplicationVisual(puzzle, level);
    problemBox.appendChild(visual);
  }
  
  content.appendChild(problemBox);
  
  // Explanation text
  const explanation = document.createElement("div");
  explanation.className = "hint-explanation";
  explanation.innerHTML = getMultiplicationHint(puzzle, level);
  content.appendChild(explanation);
  
  // Final calculation (Level 2 only)
  if (level === 2) {
    const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      const [_, num1, num2] = match;
      const answer = parseInt(num1) * parseInt(num2);
      
      const finalCalc = document.createElement("div");
      finalCalc.className = "hint-final-calc";
      finalCalc.innerHTML = `
        <div class="hint-final-calc-label">The answer is:</div>
        <div class="hint-final-calc-text">${num1} × ${num2} = <strong>${answer}</strong></div>
      `;
      content.appendChild(finalCalc);
    }
  }
  
  hintBox.appendChild(content);
  
  // === BUTTONS ===
  const buttons = document.createElement("div");
  buttons.className = "hint-buttons";
  
  // "Got it!" button
  const gotItBtn = document.createElement("button");
  gotItBtn.className = "hint-btn hint-btn-primary";
  gotItBtn.textContent = "Got it!";
  
  const moreHintsAvailable = level < maxLevel;
  gotItBtn.addEventListener("click", () => {
    closeHintOverlay(moreHintsAvailable);
  });
  buttons.appendChild(gotItBtn);
  
  // "More help" button - only if more hints available
  if (moreHintsAvailable) {
    const nextHintBtn = document.createElement("button");
    nextHintBtn.className = "hint-btn hint-btn-next-level";
    nextHintBtn.textContent = getNextHintButtonText(level);
    nextHintBtn.addEventListener("click", () => {
      triggerHintTransformation(puzzle, level + 1);
    });
    buttons.appendChild(nextHintBtn);
  }
  
  hintBox.appendChild(buttons);
}

/**
 * Get header configuration based on level
 */
function getHeaderConfig(level) {
  switch (level) {
    case 0:
      return { icon: "💭", title: "Let's figure this out..." };
    case 1:
      return { icon: "✨", title: "Here's how to solve it!" };
    case 2:
      return { icon: "💪", title: "You've got this!" };
    default:
      return { icon: "💡", title: "Here's a hint!" };
  }
}

/**
 * Get the "next hint" button text
 */
function getNextHintButtonText(level) {
  switch (level) {
    case 0:
      return "✨ Show me how";
    case 1:
      return "🤔 Just tell me";
    default:
      return "More help?";
  }
}

/**
 * Create visual representation for multiplication problems
 */
function createMultiplicationVisual(puzzle, level) {
  const container = document.createElement("div");
  container.className = "hint-pattern-visual multiplication-visual";
  
  const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
  if (!match) {
    container.textContent = puzzle.question;
    return container;
  }
  
  const [_, num1, num2] = match;
  const groups = parseInt(num1);
  const itemsPerGroup = parseInt(num2);
  
  if (level === 0) {
    // Level 0: Just show the problem with question marks
    container.innerHTML = `
      <div class="mult-problem">
        <span class="mult-num">${num1}</span>
        <span class="mult-op">×</span>
        <span class="mult-num">${num2}</span>
        <span class="mult-op">=</span>
        <span class="mult-answer mystery">?</span>
      </div>
    `;
  } else {
    // Level 1+: Show skip counting visualization
    const skipCounts = [];
    for (let i = 1; i <= groups; i++) {
      skipCounts.push(itemsPerGroup * i);
    }
    
    container.innerHTML = `
      <div class="mult-problem">
        <span class="mult-num">${num1}</span>
        <span class="mult-op">×</span>
        <span class="mult-num">${num2}</span>
        <span class="mult-op">=</span>
        <span class="mult-answer">${level === 2 ? skipCounts[skipCounts.length - 1] : '?'}</span>
      </div>
      <div class="skip-count-visual">
        <div class="skip-count-label">Count by ${itemsPerGroup}s:</div>
        <div class="skip-count-numbers">
          ${skipCounts.map((n, i) => `<span class="skip-num ${i === skipCounts.length - 1 ? 'highlight' : ''}">${n}</span>`).join(' → ')}
        </div>
      </div>
    `;
  }
  
  return container;
}

/**
 * Get hint text for multiplication problems
 */
function getMultiplicationHint(puzzle, level) {
  const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
  
  if (!match) {
    // Fallback to puzzle's built-in hint
    return puzzle.hintOnWrong || "Think about the problem carefully!";
  }
  
  const [_, num1, num2] = match;
  const groups = parseInt(num1);
  const itemsPerGroup = parseInt(num2);
  
  switch (level) {
    case 0:
      return `This is a <span class="keyword">multiplication</span> question!<br><br>
              <strong>Tip:</strong> Think of it as ${groups} groups with ${itemsPerGroup} in each group. How many altogether?`;
    
    case 1:
      return `<span class="keyword">Skip counting</span> makes multiplication easy!<br><br>
              Count by <strong>${itemsPerGroup}s</strong>, and do it <strong>${groups} times</strong>.<br>
              Look at the numbers above - the last one is your answer!`;
    
    case 2:
      const answer = groups * itemsPerGroup;
      return `You're so close! The answer is shown above.<br><br>
              <strong>Look for ${answer}</strong> in the answer choices! 🌟`;
    
    default:
      return puzzle.hintOnWrong || "You can do this!";
  }
}

/**
 * Trigger transformation to next hint level
 */
function triggerHintTransformation(puzzle, newLevel) {
  teddyHelper.currentHintLevel = newLevel;
  
  const hintBox = document.getElementById("hintBox");
  const patternBox = document.getElementById("patternBox");
  
  // Add sparkle effect
  if (patternBox) {
    patternBox.classList.add("sparkling");
    createSparkles(patternBox, 8);
  }
  
  // Rebuild content after animation
  setTimeout(() => {
    buildHintContent(hintBox, puzzle, newLevel);
  }, 400);
}

/**
 * Create sparkle particles
 */
function createSparkles(container, count) {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.className = "hint-sparkle-container";
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "hint-sparkle";
    sparkle.style.left = `${20 + Math.random() * 60}%`;
    sparkle.style.top = `${30 + Math.random() * 40}%`;
    sparkle.style.animationDelay = `${i * 0.08}s`;
    sparkleContainer.appendChild(sparkle);
  }
  
  container.appendChild(sparkleContainer);
  
  setTimeout(() => {
    sparkleContainer.remove();
  }, 1200);
}

/**
 * Show Teddy's encouragement popup
 */
function showTeddyEncouragement() {
  const encouragement = getRandomEncouragement();
  if (teddyHelper.isVisible && teddyHelper.element) {
    showTeddySideBubble({ text: encouragement.text });
  }
}

function showTeddySideBubble(encouragement) {
  if (!teddyHelper.element) return false;

  const existingBubble = teddyHelper.element.querySelector(".teddy-side-bubble");
  if (existingBubble) existingBubble.remove();

  const bubble = document.createElement("div");
  bubble.className = "teddy-side-bubble";
  bubble.textContent = encouragement.text;
  teddyHelper.element.appendChild(bubble);

  setTimeout(() => {
    bubble.classList.add("fade-out");
    setTimeout(() => {
      bubble.remove();
    }, 300);
  }, 1500);

  bubble.addEventListener("click", (event) => {
    event.stopPropagation();
    bubble.classList.add("fade-out");
    setTimeout(() => {
      bubble.remove();
    }, 300);
  });

  return true;
}

function showWrongAnswerEncouragement() {
  if (!teddyHelper.isVisible || !teddyHelper.element) return;
  showTeddySideBubble({ text: getRandomWrongAnswerLine() });
}

/**
 * Close the hint overlay
 */
function closeHintOverlay(showEncouragement = false) {
  const overlay = document.getElementById("hintOverlay");
  if (overlay) {
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
      overlay.remove();
      
      // Show encouragement AFTER overlay closes
      if (showEncouragement) {
        showTeddyEncouragement();
      }
      
      // Return Teddy to idle
      startIdleAnimation();
      const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
      if (teddyImg) {
        teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[0]}`;
      }
      const label = teddyHelper.element?.querySelector(".label-text");
      if (label) {
        label.textContent = "Tap me!";
      }
    }, 200);
  }
}

/**
 * Called when player gets correct answer
 */
function onCorrectAnswer() {
  stopIdleAnimation();
  
  const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
  if (teddyImg) {
    const celebrationPose = TEDDY_CELEBRATION_POSES[Math.floor(Math.random() * TEDDY_CELEBRATION_POSES.length)];
    teddyImg.src = `assets/images/characters/Teddy/${celebrationPose}`;
  }
  
  const label = teddyHelper.element?.querySelector(".label-text");
  if (label) {
    label.textContent = "You did it! 🎉";
  }
  
  teddyHelper.element?.classList.add("teddy-celebrating");
}

// ============================================
// IDLE ANIMATION
// ============================================

function startIdleAnimation() {
  teddyHelper.idleInterval = setInterval(() => {
    if (!teddyHelper.isVisible) return;
    
    teddyHelper.currentPose = (teddyHelper.currentPose + 1) % TEDDY_IDLE_POSES.length;
    
    const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
    if (teddyImg && !document.getElementById("hintOverlay")) {
      teddyImg.style.opacity = "0.8";
      setTimeout(() => {
        teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[teddyHelper.currentPose]}`;
        teddyImg.style.opacity = "1";
      }, 150);
    }
  }, 4000);
}

function stopIdleAnimation() {
  if (teddyHelper.idleInterval) {
    clearInterval(teddyHelper.idleInterval);
    teddyHelper.idleInterval = null;
  }
}


// ============================================
// MAIN GAME ENGINE
// ============================================

onReady(() => {
  log("Farm Engine loaded ✅");
  initGameMenu("farm");

  // --- DOM Elements ---
  const gameScreen = document.getElementById("gameScreen");
  const backgroundLayer = document.getElementById("backgroundLayer");
  const characterLayer = document.getElementById("characterLayer");
  const dialogueLayer = document.getElementById("dialogueLayer");
  const speakerName = document.getElementById("speakerName");
  const dialogueText = document.getElementById("dialogueText");
  const puzzleBox = document.getElementById("puzzleBox");
  const choicesContainer = document.getElementById("choicesContainer");
  const gemCount = document.getElementById("gemCount");

  // --- Game State ---
  let gameState = loadGameState() || createNewGameState();
  let currentSceneId = STARTING_SCENE;
  const practiceSession = {
    topicId: null
  };
  let practiceIntroState = null;
  
  // --- ERROR TRACKING ---
  let currentQuestionId = null;
  let errorCount = 0;
  
  // Initialize gem display
  updateGemDisplay();

  // Clear GEMS with 'R' for testing
  document.addEventListener('keydown', (e) => {
    if (e.key === 'R') {
      if (confirm('Reset gems?')) {
        setGlimmers(0);
        updateGemDisplay();
      }
    }
  });

  // --- Main Scene Renderer ---
  
  function showScene(sceneId) {
    const scene = getScene(sceneId);
    if (!scene) {
      log("Scene not found:", sceneId);
      return;
    }

    currentSceneId = sceneId;
    log("Showing scene:", sceneId, "| Layout:", scene.layout);

    clearUI();
    resetErrorTracking();

    if (scene.background) {
      backgroundLayer.style.backgroundImage = `url('${scene.background}')`;
    }

    // Show decorative Teddy (always present as a friend!)
    // Will be replaced by helper Teddy during puzzles
    hideTeddyHelper();  // This now also shows decorative Teddy

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
      case "practice-select":
        renderPracticeSelectLayout(scene);
        break;
      case "practice-topic-start":
        renderPracticeTopicStartLayout();
        break;
      case "transition":
        renderTransition(scene);
        return;
      default:
        renderDialogueLayout(scene);
    }

    if (scene.autoNext) {
      setTimeout(() => {
        showScene(scene.autoNext);
      }, scene.autoNextDelay || 1500);
    }
  }

  // --- ERROR TRACKING ---
  
  function resetErrorTracking() {
    currentQuestionId = null;
    errorCount = 0;
    resetHintLevel();
    log("Error tracking reset");
  }
  
  function trackError(questionId) {
    if (questionId !== currentQuestionId) {
      currentQuestionId = questionId;
      errorCount = 0;
    }
    errorCount++;
    log(`Error #${errorCount} on question: ${questionId}`);
    return errorCount;
  }

  // --- Clear UI ---
  
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

  // --- SCENE LAYOUT ---
  
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

    if (scene.choices && !scene.autoNext) {
      renderChoices(scene.choices);
    }
    
    if (!scene.choices && !scene.dialogue && !scene.autoNext) {
      dialogueLayer.classList.add("hidden");
    }
  }

  // --- DIALOGUE LAYOUT ---
  
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
      const text = typeof scene.dialogue === "string" 
        ? scene.dialogue 
        : scene.dialogue.text;
      dialogueText.innerHTML = formatDialogue(text);
    }

    if (scene.choices) {
      renderChoices(scene.choices);
    }
  }

  function renderPracticeSelectLayout(scene) {
    dialogueLayer.classList.add("dialogue-mode");
    puzzleBox.hidden = true;
    puzzleBox.innerHTML = "";

    if (scene.dialogue) {
      dialogueText.innerHTML = formatDialogue(scene.dialogue);
    }

    const topics = typeof scene.practiceTopics === "function"
      ? scene.practiceTopics()
      : scene.practiceTopics;

    if (!topics?.length) {
      dialogueText.innerHTML = formatDialogue("No practice topics are available right now.");
      return;
    }

    topics.forEach((topic) => {
      const btn = document.createElement("button");
      btn.className = "btn btn-choice";
      btn.textContent = topic.name;

      btn.addEventListener("click", () => {
        window.__studypupsPracticeTopicId = topic.id;
        practiceSession.topicId = topic.id;
        showScene(scene.nextSceneAfterPick || "practice-loop");
      });

      choicesContainer.appendChild(btn);
    });
  }

  function renderPracticeTopicStartLayout() {
    dialogueLayer.classList.add("dialogue-mode");
    puzzleBox.hidden = true;
    puzzleBox.innerHTML = "";

    const topicId = practiceSession.topicId || window.__studypupsPracticeTopicId;
    const topic = getTopicById(topicId);

    const heading = topic
      ? `Today’s topic: ${topic.displayName}`
      : "Today’s topic";
    const prompt = "Want to jump in or do a quick reminder first?";

    dialogueText.innerHTML = formatDialogue(`${heading}<br><br>${prompt}`);

    const jumpBtn = document.createElement("button");
    jumpBtn.className = "btn btn-choice";
    jumpBtn.textContent = "Jump straight in";
    jumpBtn.addEventListener("click", () => {
      showScene("practice-loop");
    });

    const remindBtn = document.createElement("button");
    remindBtn.className = "btn btn-choice";
    remindBtn.textContent = "Remind me first";
    remindBtn.addEventListener("click", () => {
      if (topic?.intro) {
        startPracticeIntro(topic);
      } else {
        showScene("practice-loop");
      }
    });

    choicesContainer.appendChild(jumpBtn);
    choicesContainer.appendChild(remindBtn);
  }

  // --- PUZZLE LAYOUT ---
  
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

  const puzzleData = (typeof scene.puzzle === "function")
    ? scene.puzzle()
    : scene.puzzle;

  currentPuzzleFactory = (typeof scene.puzzle === "function") ? scene.puzzle : null;
  currentSceneDialogueTemplate = scene.dialogue || puzzleData?.dialogue || "";
  currentPuzzleForHints = puzzleData;

  if (scene.dialogue || puzzleData?.dialogue) {
    const text = scene.dialogue || puzzleData.dialogue;
    dialogueText.innerHTML = formatDialogue(text);
  }

  if (scene.puzzle) {
    renderPuzzle(puzzleData);
    showTeddyHelper();
  }
}


  // --- TRANSITION ---
  
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

  // --- PRACTICE INTRO ---

  function startPracticeIntro(topic) {
    practiceIntroState = {
      stepIndex: 0,
      discoveredFactors: []
    };
    renderPracticeIntroStep(topic);
  }

  function renderPracticeIntroStep(topic) {
    const step = topic?.intro?.steps?.[practiceIntroState.stepIndex];
    if (!step) {
      renderPracticeIntroComplete();
      return;
    }

    clearUI();
    dialogueLayer.classList.add("dialogue-mode");
    puzzleBox.hidden = false;

    if (!teddyHelper.isVisible) {
      showTeddyHelper();
    }

    if (step.type === "teddyText") {
      dialogueText.innerHTML = formatDialogue(step.text);
      showTeddySideBubble({ text: step.text });
      renderIntroNextButton();
      return;
    }

    if (step.type === "factorTest") {
      renderFactorTestStep(step.number);
    }
  }

  function renderFactorTestStep(number) {
    practiceIntroState.discoveredFactors = [];

    dialogueText.innerHTML = formatDialogue(`Click all the factors of ${number}.`);

    const prompt = document.createElement("div");
    prompt.className = "puzzle-question";
    prompt.textContent = `Click all the factors of ${number}`;
    puzzleBox.appendChild(prompt);

    const optionsEl = document.createElement("div");
    optionsEl.className = "puzzle-options";

    const candidates = buildFactorCandidates(number);
    candidates.forEach((value) => {
      const btn = document.createElement("button");
      btn.className = "answer-btn factor-btn";
      btn.textContent = String(value);
      btn.addEventListener("click", () => handleFactorSelection(btn, number, value));
      optionsEl.appendChild(btn);
    });

    puzzleBox.appendChild(optionsEl);

    const checkBtn = document.createElement("button");
    checkBtn.className = "btn btn-choice";
    checkBtn.textContent = "Check";
    checkBtn.addEventListener("click", () => {
      const summary = evaluateFactorSelection(number);
      showTeddySideBubble({ text: summary.message });
      showIntroNextButtonAfterCheck(checkBtn);
    });

    choicesContainer.appendChild(checkBtn);
  }

  function buildFactorCandidates(number) {
    const maxCandidate = Math.min(12, Math.floor(number / 2));
    const candidates = [];
    for (let value = 1; value <= maxCandidate; value += 1) {
      candidates.push(value);
    }
    if (!candidates.includes(number)) {
      candidates.push(number);
    }
    return candidates;
  }

  function handleFactorSelection(button, number, value) {
    if (button.disabled) return;

    if (number % value === 0) {
      button.classList.add("correct");
      button.disabled = true;
      if (!practiceIntroState.discoveredFactors.includes(value)) {
        practiceIntroState.discoveredFactors.push(value);
      }
    } else {
      button.classList.add("incorrect");
      showTeddySideBubble({ text: "Not quite — try one that divides evenly." });
      setTimeout(() => {
        button.classList.remove("incorrect");
      }, 600);
    }
  }

  function evaluateFactorSelection(number) {
    const factors = practiceIntroState.discoveredFactors;
    const hasOnlyTwo = factors.length === 2 && factors.includes(1) && factors.includes(number);

    if (hasOnlyTwo) {
      return { isPrime: true, message: "Only two factors! That’s prime." };
    }

    return { isPrime: false, message: "More than two factors. Not prime." };
  }

  function renderIntroNextButton() {
    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-choice";
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      practiceIntroState.stepIndex += 1;
      renderPracticeIntroStep(getTopicById(practiceSession.topicId));
    });
    choicesContainer.appendChild(nextBtn);
  }

  function showIntroNextButtonAfterCheck(checkBtn) {
    checkBtn.disabled = true;

    const nextBtn = document.createElement("button");
    nextBtn.className = "btn btn-choice";
    nextBtn.textContent = "Next";
    nextBtn.addEventListener("click", () => {
      practiceIntroState.stepIndex += 1;
      renderPracticeIntroStep(getTopicById(practiceSession.topicId));
    });
    choicesContainer.appendChild(nextBtn);
  }

  function renderPracticeIntroComplete() {
    clearUI();
    dialogueLayer.classList.add("dialogue-mode");
    puzzleBox.hidden = true;
    dialogueText.innerHTML = formatDialogue("You’re ready! Let’s practise.");
    showTeddySideBubble({ text: "You’re ready! Let’s practise." });

    const startBtn = document.createElement("button");
    startBtn.className = "btn btn-choice";
    startBtn.textContent = "Let’s practise!";
    startBtn.addEventListener("click", () => {
      showScene("practice-loop");
    });
    choicesContainer.appendChild(startBtn);
  }

  // --- HELPERS ---

  function renderCharacters(characters) {
    characters.forEach((char) => {
      const container = document.createElement("div");
      container.className = `character-container pos-${char.position} size-${char.size || "medium"}`;

      const img = document.createElement("img");
      img.src = char.image;
      img.alt = char.id;
      img.className = "character-sprite";

      if (char.animation) {
        img.classList.add(`anim-${char.animation}`);
      }

      img.onerror = () => log("Failed to load:", char.image);

      container.appendChild(img);
      characterLayer.appendChild(container);
    });
  }

  function renderChoices(choices) {
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      
      if (choice.style === "primary-large") {
        btn.className = "btn btn-primary-large";
      } else {
        btn.className = "btn btn-choice";
      }
      
      btn.textContent = choice.text;

      btn.addEventListener("click", () => {
        if (choice.next) showScene(choice.next);
      });

      choicesContainer.appendChild(btn);
    });
  }

  function renderPuzzle(puzzle) {
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
        handlePuzzleAnswer(opt.id, puzzle, btn, optionsEl);
      });

      optionsEl.appendChild(btn);
    });

    puzzleBox.appendChild(optionsEl);
  }

  function updatePuzzleDialogue(puzzle) {
    const text = puzzle?.dialogue || currentSceneDialogueTemplate;
    if (text) {
      dialogueText.innerHTML = formatDialogue(text);
    }
  }

  function regeneratePuzzle(puzzle) {
    let newPuzzle = null;

    if (typeof puzzle?.regenerate === "function") {
      newPuzzle = puzzle.regenerate();
    } else if (typeof currentPuzzleFactory === "function") {
      newPuzzle = currentPuzzleFactory();
    } else {
      newPuzzle = buildFallbackMultiplicationPuzzle(puzzle);
    }

    if (!newPuzzle) return puzzle;

    newPuzzle = {
      ...newPuzzle,
      onCorrect: newPuzzle.onCorrect ?? puzzle.onCorrect,
      reward: newPuzzle.reward ?? puzzle.reward,
      regenerate: newPuzzle.regenerate ?? puzzle.regenerate
    };

    currentPuzzleForHints = newPuzzle;
    updatePuzzleDialogue(newPuzzle);
    renderPuzzle(newPuzzle);
    if (!teddyHelper.isVisible) {
      showTeddyHelper();
    }

    return newPuzzle;
  }

  function buildFallbackMultiplicationPuzzle(puzzle) {
    if (!puzzle?.question) return puzzle;

    const parsed = parseMultiplicationQuestion(puzzle.question);
    if (!parsed) return puzzle;

    const { left, right, leftLabel, rightLabel } = parsed;
    const { a, b } = getNewMultiplicationNumbers(left, right);
    const options = buildMultiplicationOptions(a, b);
    const correctAnswer = a * b;
    const correctIndex = options.indexOf(correctAnswer);
    const updatedDialogue = buildDialogueFromTemplate(currentSceneDialogueTemplate, a, b);

    const questionParts = [
      `${a}`,
      leftLabel,
      "×",
      `${b}`,
      rightLabel
    ].filter(Boolean);

    return {
      ...puzzle,
      question: `${questionParts.join(" ")} = ?`,
      dialogue: updatedDialogue || puzzle.dialogue,
      options: options.map((value, index) => ({
        id: String.fromCharCode(97 + index),
        text: String(value)
      })),
      correctId: String.fromCharCode(97 + correctIndex),
      hintOnWrong: `Try counting by ${b}s, ${a} times.`
    };
  }

  function parseMultiplicationQuestion(question) {
    const match = question.match(/(\d+)\s*([^×x\d]*)[×x]\s*(\d+)\s*([^=]*)=/i);
    if (!match) return null;

    return {
      left: parseInt(match[1], 10),
      leftLabel: match[2]?.trim(),
      right: parseInt(match[3], 10),
      rightLabel: match[4]?.trim()
    };
  }

  function buildDialogueFromTemplate(template, a, b) {
    if (!template) return "";

    let count = 0;
    return template.replace(/\d+/g, (match) => {
      count += 1;
      if (count === 1) return String(a);
      if (count === 2) return String(b);
      return match;
    });
  }

  function getNewMultiplicationNumbers(previousA, previousB) {
    let a = previousA;
    let b = previousB;
    let attempts = 0;

    while (attempts < 12 && a === previousA && b === previousB) {
      a = Math.floor(Math.random() * 9) + 2;
      b = Math.floor(Math.random() * 9) + 2;
      attempts += 1;
    }

    return { a, b };
  }

  function buildMultiplicationOptions(a, b) {
    const correct = a * b;
    const options = new Set([correct]);
    const candidates = [
      a + b,
      correct + b,
      correct - b,
      correct + a,
      correct - a,
      (a + 1) * b,
      (a - 1) * b,
      a * (b + 1),
      a * (b - 1),
      correct + 1,
      correct - 1,
      correct + 2,
      correct - 2
    ];

    for (const value of candidates) {
      if (options.size >= 4) break;
      if (value > 0) options.add(value);
    }

    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const candidate = Math.random() > 0.5 ? correct + offset : correct - offset;
      if (candidate > 0) options.add(candidate);
    }

    return Array.from(options).sort(() => Math.random() - 0.5);
  }

  // --- PUZZLE ANSWER HANDLER ---
  
  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl) {
    const isCorrect = selectedId === puzzle.correctId;
    const questionId = currentSceneId;

    optionsEl.querySelectorAll("button").forEach((btn) => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      
      // Teddy celebrates!
      onCorrectAnswer();
      
      if (puzzle.reward) {
        awardGems(puzzle.reward);
      }
      
      setTimeout(() => {
        if (puzzle.onCorrect) showScene(puzzle.onCorrect);
      }, 1500);
      
    } else {
      selectedBtn.classList.add("incorrect");
      const currentErrors = trackError(questionId);
      showWrongAnswerEncouragement();

      setTimeout(() => {
        const refreshedPuzzle = regeneratePuzzle(puzzle);
        if (currentErrors === 1) {
          // First error: offer hint (after regeneration)
          showHintOffer(refreshedPuzzle);
        } else if (currentErrors >= 3) {
          // Third error: show hint automatically (after regeneration)
          showProgressiveHintOverlay(refreshedPuzzle);
        }
      }, 1500);
    }
  }
  
  // --- HINT OFFER POPUP ---
  
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
      // Show brief encouragement
      showTeddyEncouragement();
    });
  }

  // --- GEM SYSTEM ---
  
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

  // --- Start ---
  showScene(STARTING_SCENE);
});

// Map/Menu button handler
const homeBtn = document.getElementById("homeBtn");
homeBtn?.addEventListener("click", () => {
  if (window.openGameMenu) {
    window.openGameMenu();
  } else {
    console.warn("Game menu not initialized");
  }
});
