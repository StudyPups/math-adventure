// js/farm.js
// Game engine for Buttercup's Farm location
// NOW WITH: Error tracking, hint popups, and gem celebrations! 🎉

import { onReady, log, saveGameState, loadGameState, createNewGameState } from "./shared.js";
import { farmScenes, getScene, STARTING_SCENE } from "../data/farm-scenes.js";

// ============================================
// TEDDY HELPER SYSTEM
// "Help is always available" - The core of StudyPups
// ============================================
//
// This creates an always-visible Teddy beside the puzzle box
// who can be clicked ANYTIME to get help - before even trying!
//
// Features:
// - Teddy is always visible during puzzles
// - Cycles through idle poses (subtle, not distracting)
// - Collar has a soft glow (brighter when hint available)
// - Click Teddy anytime to get help
// - Different responses based on situation
//
// ============================================

// --- TEDDY HELPER STATE ---
let teddyHelper = {
  element: null,           // The Teddy DOM element
  isVisible: false,
  currentPose: 0,
  idleInterval: null,      // For cycling poses
  hintsUsed: 0,            // Track how much help needed
  hasAttempted: false,     // Has player tried answering yet?
};

// Teddy's idle poses (calm, attentive, not distracting)
const TEDDY_IDLE_POSES = [
  "teddy-wait.png",
  "teddy-listen.png",
  "teddy-hopeful.png",
  "teddy-lookup.png"
];

// Teddy's helping pose (when showing hints)
const TEDDY_HELPING_POSE = "teddy-focus-up.png";

// Teddy's celebration poses
const TEDDY_CELEBRATION_POSES = [
  "teddy-leap-joy.png",
  "teddy-jump-excited.png",
  "teddy-tongue.png"
];

// ============================================
// MAIN FUNCTIONS - Add these to farm.js
// ============================================

/**
 * Show Teddy beside the puzzle box
 * Call this when rendering a puzzle layout
 */
function showTeddyHelper(puzzle) {
  // Remove existing Teddy if present
  hideTeddyHelper();
  
  // Reset state for new puzzle
  teddyHelper.hintsUsed = 0;
  teddyHelper.hasAttempted = false;
  teddyHelper.currentPose = 0;
  
  // Create Teddy container
  const teddyContainer = document.createElement("div");
  teddyContainer.id = "teddyHelper";
  teddyContainer.className = "teddy-helper";
  
  // Create the image
  const teddyImg = document.createElement("img");
  teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[0]}`;
  teddyImg.alt = "Teddy - Click for help!";
  teddyImg.className = "teddy-helper-sprite";
  teddyImg.draggable = false;
  
  // Error handling
  teddyImg.onerror = () => {
    console.error("❌ Failed to load Teddy:", teddyImg.src);
    teddyImg.alt = "🐕 Teddy";
  };
  
  // Create the "Need help?" label
  const label = document.createElement("div");
  label.className = "teddy-helper-label";
  label.innerHTML = `<span class="label-text">Tap me!</span>`;
  
  // Create collar glow element (for animation)
  const glow = document.createElement("div");
  glow.className = "teddy-collar-glow";
  
  // Assemble
  teddyContainer.appendChild(glow);
  teddyContainer.appendChild(teddyImg);
  teddyContainer.appendChild(label);
  
  // Click handler - THIS IS THE KEY FEATURE
  teddyContainer.addEventListener("click", () => {
    onTeddyClick(puzzle);
  });
  
  // Add hover effect
  teddyContainer.addEventListener("mouseenter", () => {
    teddyImg.src = `assets/images/characters/Teddy/teddy-tongue.png`;
    label.querySelector(".label-text").textContent = "I can help!";
  });
  
  teddyContainer.addEventListener("mouseleave", () => {
    if (!document.querySelector(".teddy-hint-panel")) {
      teddyImg.src = `assets/images/characters/Teddy/${TEDDY_IDLE_POSES[teddyHelper.currentPose]}`;
      label.querySelector(".label-text").textContent = "Tap me!";
    }
  });
  
  // Add to page - position beside puzzle box
  const puzzleBox = document.getElementById("puzzleBox");
  if (puzzleBox && puzzleBox.parentElement) {
    puzzleBox.parentElement.appendChild(teddyContainer);
  } else {
    document.getElementById("gameScreen").appendChild(teddyContainer);
  }
  
  teddyHelper.element = teddyContainer;
  teddyHelper.isVisible = true;
  
  // Start idle animation (subtle pose cycling)
  startIdleAnimation();
  
  console.log("🐕 Teddy Helper is ready!");
}

/**
 * Hide Teddy (call when leaving puzzle)
 */
function hideTeddyHelper() {
  if (teddyHelper.element) {
    teddyHelper.element.remove();
    teddyHelper.element = null;
  }
  teddyHelper.isVisible = false;
  stopIdleAnimation();
}

/**
 * Handle Teddy being clicked
 * This is where the magic happens!
 */
function onTeddyClick(puzzle) {
  console.log("🐕 Teddy clicked! Hints used:", teddyHelper.hintsUsed);
  
  // Stop idle animation while helping
  stopIdleAnimation();
  
  // Change to helping pose
  const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
  if (teddyImg) {
    teddyImg.src = `assets/images/characters/Teddy/${TEDDY_HELPING_POSE}`;
  }
  
  // Update label
  const label = teddyHelper.element?.querySelector(".label-text");
  if (label) {
    label.textContent = "Here to help!";
  }
  
  // Increase glow while helping
  teddyHelper.element?.classList.add("teddy-helping");
  
  // Show the hint panel
  showTeddyHintPanel(puzzle);
  
  // Track hint usage
  teddyHelper.hintsUsed++;
}

/**
 * Show Teddy's hint panel (speech bubble with help)
 */
function showTeddyHintPanel(puzzle) {
  // Remove existing panel
  const existingPanel = document.querySelector(".teddy-hint-panel");
  if (existingPanel) existingPanel.remove();
  
  // Create hint panel
  const panel = document.createElement("div");
  panel.className = "teddy-hint-panel";
  
  // Choose message based on situation
  let hintMessage = "";
  let hintTitle = "";
  
  if (!teddyHelper.hasAttempted) {
    // Player hasn't tried yet - give encouragement + starting hint
    hintTitle = "Let's figure this out together! 🌟";
    hintMessage = getStartingHint(puzzle);
  } else if (teddyHelper.hintsUsed === 1) {
    // First hint after attempting
    hintTitle = "Good try! Here's a tip:";
    hintMessage = puzzle.hintOnWrong || "Look at the numbers carefully. What do you notice?";
  } else if (teddyHelper.hintsUsed === 2) {
    // Second hint - more specific
    hintTitle = "You're getting closer! 💪";
    hintMessage = getDetailedHint(puzzle);
  } else {
    // Third+ hint - very specific guidance
    hintTitle = "Almost there! Let me show you:";
    hintMessage = getStepByStepHint(puzzle);
  }
  
  panel.innerHTML = `
    <div class="hint-panel-content">
      <div class="hint-panel-header">${hintTitle}</div>
      <div class="hint-panel-message">${hintMessage}</div>
      <button class="hint-panel-close">Got it! ✨</button>
    </div>
  `;
  
  // Close button handler
  panel.querySelector(".hint-panel-close").addEventListener("click", () => {
    closeTeddyHintPanel();
  });
  
  // Click outside to close
  panel.addEventListener("click", (e) => {
    if (e.target === panel) {
      closeTeddyHintPanel();
    }
  });
  
  // Add to page
  document.getElementById("gameScreen").appendChild(panel);
  
  // Animate in
  requestAnimationFrame(() => {
    panel.classList.add("panel-visible");
  });
}

/**
 * Close the hint panel
 */
function closeTeddyHintPanel() {
  const panel = document.querySelector(".teddy-hint-panel");
  if (panel) {
    panel.classList.remove("panel-visible");
    setTimeout(() => panel.remove(), 300);
  }
  
  // Return Teddy to idle
  teddyHelper.element?.classList.remove("teddy-helping");
  startIdleAnimation();
  
  // Update label
  const label = teddyHelper.element?.querySelector(".label-text");
  if (label) {
    label.textContent = "Tap me!";
  }
}

/**
 * Called when player attempts an answer
 */
function onPlayerAttempt() {
  teddyHelper.hasAttempted = true;
  
  // Make Teddy's glow slightly brighter after attempt
  // (subtle indication that help is available)
  teddyHelper.element?.classList.add("hint-available");
}

/**
 * Called when player gets correct answer
 */
function onCorrectAnswer() {
  stopIdleAnimation();
  
  // Teddy celebrates!
  const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
  if (teddyImg) {
    const celebrationPose = TEDDY_CELEBRATION_POSES[Math.floor(Math.random() * TEDDY_CELEBRATION_POSES.length)];
    teddyImg.src = `assets/images/characters/Teddy/${celebrationPose}`;
  }
  
  // Update label
  const label = teddyHelper.element?.querySelector(".label-text");
  if (label) {
    label.textContent = "You did it! 🎉";
  }
  
  // Add celebration class for extra effects
  teddyHelper.element?.classList.add("teddy-celebrating");
}

// ============================================
// HINT CONTENT GENERATORS
// ============================================

function getStartingHint(puzzle) {
  // Provide a gentle starting point based on puzzle type
  if (puzzle.type === "multiplication") {
    const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      const [_, num1, num2] = match;
      return `This is a multiplication question! We need to find ${num1} groups of ${num2}.<br><br>
              <strong>Try this:</strong> Count by ${num2}s... how many times? ${num1} times!`;
    }
  }
  
  // Default starting hint
  return puzzle.hintOnWrong || "Take your time and read the question carefully. What numbers do you see?";
}

function getDetailedHint(puzzle) {
  if (puzzle.type === "multiplication") {
    const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      const [_, num1, num2] = match;
      const sequence = [];
      for (let i = 1; i <= parseInt(num1); i++) {
        sequence.push(parseInt(num2) * i);
      }
      return `Count by ${num2}s: <strong>${sequence.join(", ")}</strong><br><br>
              The last number is your answer!`;
    }
  }
  
  return puzzle.hintOnWrong || "Look at each answer choice. Which one makes sense?";
}

function getStepByStepHint(puzzle) {
  if (puzzle.type === "multiplication") {
    const match = puzzle.question.match(/(\d+)\s*[×x]\s*(\d+)/);
    if (match) {
      const [_, num1, num2] = match;
      const answer = parseInt(num1) * parseInt(num2);
      return `${num1} × ${num2} = <strong>${answer}</strong><br><br>
              Look for ${answer} in the answer choices!`;
    }
  }
  
  // For other types, give the answer hint
  return "The answer is one of the choices - take your best guess!";
}

// ============================================
// IDLE ANIMATION
// ============================================

function startIdleAnimation() {
  // Cycle through idle poses every 4 seconds (subtle, not distracting)
  teddyHelper.idleInterval = setInterval(() => {
    if (!teddyHelper.isVisible) return;
    
    teddyHelper.currentPose = (teddyHelper.currentPose + 1) % TEDDY_IDLE_POSES.length;
    
    const teddyImg = teddyHelper.element?.querySelector(".teddy-helper-sprite");
    if (teddyImg) {
      // Subtle fade transition
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
// EXPORT (if using modules)
// ============================================
// export { showTeddyHelper, hideTeddyHelper, onPlayerAttempt, onCorrectAnswer };


onReady(() => {
  log("Farm Engine loaded ✅");

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
  
  // --- ERROR TRACKING (per question) ---
  let currentQuestionId = null;
  let errorCount = 0;
  
  // Initialize gem display
  updateGemDisplay();

   // --- Clear GEMS with 'R' temporary for testing phase ---

  document.addEventListener('keydown', (e) => {
  if (e.key === 'R') {
    if (confirm('Reset gems?')) {
      gameState.stats.totalGlimmers = 0;
      updateGemDisplay();
      saveGameState(gameState);
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

    // Reset everything
    clearUI();
    
    // RESET ERROR TRACKING when showing new scene
    resetErrorTracking();

    // Set background
    if (scene.background) {
      backgroundLayer.style.backgroundImage = `url('${scene.background}')`;
    }

    // Route to layout handler
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
      case "transition":
        renderTransition(scene);
        return;
      default:
        renderDialogueLayout(scene);
    }

    // Handle auto-advance
    if (scene.autoNext) {
      setTimeout(() => {
        showScene(scene.autoNext);
      }, scene.autoNextDelay || 1500);
    }
  }

  // --- ERROR TRACKING FUNCTIONS ---
  
  function resetErrorTracking() {
    currentQuestionId = null;
    errorCount = 0;
    log("Error tracking reset");
  }
  
  function trackError(questionId) {
    // If this is a new question, reset counter
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
    
    // Reset dialogue layer mode
    dialogueLayer.classList.remove("dialogue-mode", "scene-mode", "hidden");
    dialogueLayer.hidden = false;
  }

  // --- SCENE LAYOUT ---
  
  function renderSceneLayout(scene) {
    dialogueLayer.classList.add("scene-mode");
    
    if (scene.characters) {
      renderCharacters(scene.characters);
    }

    // Handle dialogue object
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

    if (scene.dialogue) {
      dialogueText.innerHTML = formatDialogue(scene.dialogue);
    }

    if (scene.puzzle) {
      renderPuzzle(scene.puzzle);
       showTeddyHelper(scene.puzzle);
    }
  }

  // --- TRANSITION ---
  
  function renderTransition(scene) {
    // Save progress before leaving
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

  // --- UPDATED PUZZLE ANSWER HANDLER ---
  
  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl) {
    const isCorrect = selectedId === puzzle.correctId;
    const questionId = currentSceneId; // Use scene ID as question identifier

    // Disable all buttons during feedback
    optionsEl.querySelectorAll("button").forEach((btn) => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      
      // Award glimmers with celebration!
      if (puzzle.reward) {
        awardGems(puzzle.reward);
      }
      
      // Move to next scene after success
      setTimeout(() => {
        if (puzzle.onCorrect) showScene(puzzle.onCorrect);
      }, 1500); // Give time to see the gem celebration
      
    } else {
      // WRONG ANSWER - Track the error
      selectedBtn.classList.add("incorrect");
      const currentErrors = trackError(questionId);
      
      if (currentErrors === 1) {
        // FIRST ERROR: Show "Would you like a hint?" popup
        showHintPopup(puzzle);
      } else if (currentErrors >= 3) {
        // THIRD ERROR: Show hint automatically
        showHintText(puzzle);
      }
      
      // Re-enable non-incorrect buttons after a moment
      setTimeout(() => {
        optionsEl.querySelectorAll("button").forEach((btn) => {
          if (!btn.classList.contains("incorrect")) {
            btn.disabled = false;
          }
        });
      }, 1000);
    }
  }
  
  // --- HINT POPUP (Error 1) ---
  
  function showHintPopup(puzzle) {
    // Check if popup already exists
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
    
    // "Yes" button - show the hint
    popup.querySelector(".btn-hint-yes").addEventListener("click", () => {
      popup.remove();
      showHintText(puzzle);
    });
    
    // "No" button - close and show waiting Teddy
    popup.querySelector(".btn-hint-no").addEventListener("click", () => {
      popup.remove();
      showWaitingTeddy();
    });
  }
  
  // --- OPTIONAL: Show Teddy waiting patiently ---
  
  function showWaitingTeddy() {
    // Check if already shown
    if (puzzleBox.querySelector(".teddy-waiting")) return;
    
    const waitingEl = document.createElement("div");
    waitingEl.className = "teddy-waiting";
    waitingEl.innerHTML = `
      <img src="assets/images/characters/Teddy/teddy-wait.png" alt="Teddy waiting" class="teddy-wait-sprite">
    `;
    
    puzzleBox.appendChild(waitingEl);
    
    // Remove after 2 seconds (just a brief encouragement)
    setTimeout(() => {
      waitingEl.style.opacity = "0";
      setTimeout(() => waitingEl.remove(), 300);
    }, 2000);
  }
  
  // --- HINT TEXT (Error 1 after "yes" or Error 3 automatic) ---
  
  function showHintText(puzzle) {
    let hintEl = puzzleBox.querySelector(".puzzle-hint");
    
    if (!hintEl) {
      hintEl = document.createElement("div");
      hintEl.className = "puzzle-hint";
      puzzleBox.appendChild(hintEl);
    }
    
    // Choose Teddy image based on error count
    let teddyImage = "teddy-focus-up.png"; // Default: focused and ready to help
    
    if (errorCount >= 3) {
      teddyImage = "teddy-hopeful.png"; // Third error: encouraging
    } else if (errorCount >= 5) {
      teddyImage = "teddy-wrong-answer.png"; // Many errors: sympathetic
    }
    
    // Show Teddy with the hint!
    hintEl.innerHTML = `
      <div class="hint-with-teddy">
        <img src="assets/images/characters/Teddy/${teddyImage}" alt="Teddy" class="hint-teddy">
        <div class="hint-bubble">
          ${puzzle.hintOnWrong || "Try again! You can do this!"}
        </div>
      </div>
    `;
  }

  // --- GEM CELEBRATION SYSTEM! 🎉 ---
  
  function awardGems(amount) {
    // Update game state
    gameState.stats.totalGlimmers = (gameState.stats.totalGlimmers || 0) + amount;
    saveGameState(gameState);
    
    log(`Awarded ${amount} gems! Total: ${gameState.stats.totalGlimmers}`);
    
    // Update display with animation
    updateGemDisplay();
    celebrateGems(amount);
  }
  
  function celebrateGems(amount) {
    const gemIcon = document.querySelector(".gem-counter");
    if (!gemIcon) return;
    
    // Add bounce/shine animation
    gemIcon.classList.add("gem-earned");
    
    // Create floating "+X" text
    const plusText = document.createElement("div");
    plusText.className = "gem-plus-text";
    plusText.textContent = `+${amount}`;
    
    // Position it near the gem counter
    const rect = gemIcon.getBoundingClientRect();
    plusText.style.position = "fixed";
    plusText.style.left = `${rect.left + 30}px`;
    plusText.style.top = `${rect.top}px`;
    plusText.style.zIndex = "9999";
    
    document.body.appendChild(plusText);
    
    // Clean up after animation
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
    const count = gameState.stats.totalGlimmers || 0;
    if (gemCount) {
      gemCount.textContent = count;
    }
  }

  // --- Start ---
  showScene(STARTING_SCENE);
});

// Home button click handler
const homeBtn = document.getElementById("homeBtn");
homeBtn?.addEventListener("click", () => {
  if (confirm("Return to the main menu?")) {
    window.location.href = "index.html";
  }
});