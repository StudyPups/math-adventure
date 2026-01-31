// js/farm.js
// Game engine for Buttercup's Farm location
// NOW WITH: Error tracking, hint popups, and gem celebrations! 🎉

import { onReady, log, saveGameState, loadGameState, createNewGameState } from "./shared.js";
import { farmScenes, getScene, STARTING_SCENE } from "../data/farm-scenes.js";

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