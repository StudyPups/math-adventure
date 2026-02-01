// js/tutorial.js
// Scene-based tutorial engine for StudyPups
// Two modes: dialogue-mode (floating card) vs scene-mode (just buttons)

import { showHintOverlay, closeHintOverlay, resetHintLevel } from './hint-system.js';

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "./shared.js";
import { tutorialScenes, getScene, STARTING_SCENE } from "../data/tutorial-scenes.js";

onReady(() => {
  log("Tutorial Engine loaded ✅");

  // --- DOM Elements ---
  const gameScreen = document.getElementById("gameScreen");
  const backgroundLayer = document.getElementById("backgroundLayer");
  const characterLayer = document.getElementById("characterLayer");
  const environmentLayer = document.getElementById("environmentLayer");
  const vineContainer = document.getElementById("vineContainer");
  const helperLayer = document.getElementById("helperLayer");
  const puzzleLayer = document.getElementById("puzzleLayer");
  const puzzleBox = document.getElementById("puzzleBox");
  const dialogueLayer = document.getElementById("dialogueLayer");
  const speakerInfo = document.getElementById("speakerInfo");
  const speakerName = document.getElementById("speakerName");
  const dialogueText = document.getElementById("dialogueText");
  const vineProgress = document.getElementById("vineProgress");
  const inputBox = document.getElementById("inputBox");
  const choicesContainer = document.getElementById("choicesContainer");
  const skipBtn = document.getElementById("skipBtn");

  // --- Game State ---
  let gameState = loadGameState() || createNewGameState();
  let currentSceneId = STARTING_SCENE;
  let vinesSnapped = 0;
  const TOTAL_VINES = 3;
  
  // Dialogue pagination state
  let dialoguePages = [];
  let currentDialoguePage = 0;
  let pendingChoices = null;
  
  // Max characters per dialogue page (keeps text from overwhelming screen)
  const MAX_DIALOGUE_LENGTH = 150;

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
      case "reward":
        renderRewardLayout(scene);
        break;
      case "gem-demo":
        renderGemDemoLayout(scene);
        break;
      case "transition":
        renderTransition(scene);
        return;
      default:
        renderDialogueLayout(scene);
    }

    // Handle vine snapping
    if (scene.vineSnap) {
      snapVine(scene.vineSnap);
    }

    // Handle auto-advance
    if (scene.autoNext) {
      setTimeout(() => {
        showScene(scene.autoNext);
      }, scene.autoNextDelay || 1500);
    }
  }

  // --- Clear UI ---
  
  function clearUI() {
    characterLayer.innerHTML = "";
    environmentLayer.innerHTML = "";
    helperLayer.innerHTML = "";
    helperLayer.hidden = true;
    choicesContainer.innerHTML = "";
    puzzleBox.innerHTML = "";
    puzzleLayer.hidden = true;
    inputBox.innerHTML = "";
    inputBox.hidden = true;
    vineContainer.hidden = true;
    vineProgress.hidden = true;
    speakerName.textContent = "";
    dialogueText.textContent = "";
    dialogueText.className = "dialogue-text";
    
    // Reset dialogue layer mode
    dialogueLayer.classList.remove("dialogue-mode", "scene-mode", "hidden");
    dialogueLayer.hidden = false;
    
    // Remove click hints
    const hint = document.querySelector(".click-hint");
    if (hint) hint.remove();
    
    // Re-add vine container to environment layer (it gets cleared)
    environmentLayer.appendChild(vineContainer);
  }

  // --- SCENE LAYOUT ---
  // No dialogue card - just floating buttons over the scene
  
  function renderSceneLayout(scene) {
    // Use scene-mode (no card, just buttons)
    dialogueLayer.classList.add("scene-mode");
    
    // Show environment elements FIRST (behind characters)
    if (scene.environmentElements) {
      renderEnvironmentElements(scene.environmentElements);
    }
    
    // Show characters
    if (scene.characters) {
      renderCharacters(scene.characters);
    }

    // Handle action dialogue (like *woof woof*)
    if (scene.dialogue && typeof scene.dialogue === "object") {
      // Actually show dialogue card for action text
      dialogueLayer.classList.remove("scene-mode");
      dialogueLayer.classList.add("dialogue-mode");
      
      if (scene.dialogue.style === "action") {
        dialogueText.innerHTML = formatDialogue(scene.dialogue.text);
        dialogueText.classList.add("action-style");
      } else {
        if (scene.dialogue.speaker) {
          speakerName.textContent = scene.dialogue.speaker;
        }
        dialogueText.innerHTML = formatDialogue(scene.dialogue.text);
      }
    }

    // Show choices (if not auto-advancing)
    if (scene.choices && !scene.autoNext) {
      renderChoices(scene.choices);
    }
    
    // Hide dialogue layer entirely if no choices and no dialogue
    if (!scene.choices && !scene.dialogue && !scene.autoNext) {
      dialogueLayer.classList.add("hidden");
    }
  }

  // --- DIALOGUE LAYOUT ---
  // Character big, floating dialogue card at bottom
  
  function renderDialogueLayout(scene) {
    // Use dialogue-mode (floating card)
    dialogueLayer.classList.add("dialogue-mode");
    
    // Show character BIG behind dialogue
    if (scene.speaker && scene.speaker.image) {
      renderCharacters([{
        id: "speaker",
        image: scene.speaker.image,
        position: scene.speaker.position || "stage-center",
        size: "large"
      }]);
      
      // Show speaker name in dialogue
      speakerName.textContent = scene.speaker.name || "";
    }

    // Handle text input
    if (scene.input) {
      renderInput(scene.input);
    }

    // Show dialogue text with pagination support
    if (scene.dialogue) {
      const text = typeof scene.dialogue === "string" 
        ? scene.dialogue 
        : scene.dialogue.text;
      
      // Use pagination system
      setDialogue(text, scene.choices, !!scene.input);
    } else if (scene.choices) {
      // No dialogue, just show choices
      renderChoices(scene.choices, !!scene.input);
    }
  }

  // --- PUZZLE LAYOUT ---
  // Clean, focused layout: just the puzzle + clickable helper for hints
  // NO dialogue box during puzzles - much less overwhelming!
  
  function renderPuzzleLayout(scene) {
    // Hide dialogue layer entirely during puzzles
    dialogueLayer.classList.add("hidden");
    
    // Reset hint level for new puzzle
    resetHintLevel();
    
    // Show vines and progress
    vineContainer.hidden = false;
    vineProgress.hidden = false;
    updateVineProgress();

    // Show helper character (clickable for hints) - pass puzzle for hint data
    if (scene.helper && scene.puzzle) {
      renderHelper(scene.helper, scene.puzzle);
    }

    // Show puzzle immediately (no pagination needed)
    if (scene.puzzle) {
      puzzleLayer.hidden = false;
      renderPuzzle(scene.puzzle);
    }
  }

 /**
   * Render clickable helper character with "Need help?" label
   */
  function renderHelper(helper, puzzle) {
    helperLayer.hidden = false;
    helperLayer.innerHTML = "";
    
    const container = document.createElement("div");
    container.className = `helper-container pos-${helper.position || "left"}`;
    
    // Character sprite
    const sprite = document.createElement("img");
    sprite.src = helper.image;
    sprite.alt = "Helper";
    sprite.className = "helper-sprite";
    sprite.onerror = () => log("Failed to load helper:", helper.image);
    container.appendChild(sprite);
    
    // "Need help?" label below fairy
    const label = document.createElement("div");
    label.className = "helper-label";
    label.textContent = "Need help?";
    container.appendChild(label);
    
    // Click handler to show hint overlay
    container.addEventListener("click", () => {
      showHintOverlay(puzzle);
    });
    
    helperLayer.appendChild(container);
  }



  // --- REWARD LAYOUT ---
  
  function renderRewardLayout(scene) {
    dialogueLayer.classList.add("dialogue-mode");
    
    // Show reward in character area
    const rewardEl = document.createElement("div");
    rewardEl.className = "reward-display";
    rewardEl.innerHTML = `
      <img 
        src="${scene.rewardImage}" 
        alt="${scene.rewardName}" 
        class="reward-image"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-block';"
      >
      <div class="reward-placeholder" style="display: none;">🎁</div>
      <div class="reward-name">${scene.rewardName}</div>
    `;
    characterLayer.appendChild(rewardEl);

    if (scene.speaker) {
      speakerName.textContent = scene.speaker.name;
    }

    if (scene.dialogue) {
      dialogueText.innerHTML = formatDialogue(scene.dialogue);
    }

    if (scene.choices) {
      renderChoices(scene.choices);
    }
  }

  // --- GEM DEMO LAYOUT ---
  
  function renderGemDemoLayout(scene) {
    dialogueLayer.classList.add("scene-mode");
    
    // Show clickable character
    if (scene.characters) {
      scene.characters.forEach((char) => {
        const container = document.createElement("div");
        container.className = `character-container pos-${char.position} size-${char.size || "large"}`;

        const img = document.createElement("img");
        img.src = char.image;
        img.alt = char.id;
        img.className = "character-sprite character-clickable";

        img.addEventListener("click", () => {
          if (scene.onGemClick) {
            showScene(scene.onGemClick);
          }
        });

        container.appendChild(img);
        characterLayer.appendChild(container);
      });
    }

    // Add click hint
    const hint = document.createElement("div");
    hint.className = "click-hint";
    hint.textContent = "👆 Click on Teddy's gem!";
    gameScreen.appendChild(hint);
  }

  // --- TRANSITION ---
  
  function renderTransition(scene) {
    gameState.tutorialComplete = true;
    gameState.lastPlayed = new Date().toISOString();
    saveGameState(gameState);

    gameScreen.innerHTML = `
      <div class="transition-screen">
        <div class="transition-text">${scene.transitionText || "Loading..."}</div>
        <div class="loading-paw">🐾</div>
      </div>
    `;

    setTimeout(() => {
      window.location.href = scene.destination || "patterns.html";
    }, 1500);
  }

  // --- HELPERS ---

  /**
   * Render environment elements (rocks, props, etc.)
   * These appear BEHIND characters (lower z-index)
   */
  function renderEnvironmentElements(elements) {
    elements.forEach((element) => {
      const container = document.createElement("div");
      container.className = `environment-element pos-${element.position}`;
      container.id = `env-${element.id}`;

      const img = document.createElement("img");
      img.src = element.image;
      img.alt = element.id;
      img.className = `${element.id}-sprite`;  // e.g., "rock-sprite"
      
      img.onerror = () => log("Failed to load environment element:", element.image);

      container.appendChild(img);
      environmentLayer.appendChild(container);
    });
  }

  /**
   * Render character sprites
   */
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

  function renderChoices(choices, hasInput = false) {
    choices.forEach((choice) => {
      const btn = document.createElement("button");
      
      if (choice.style === "primary-large") {
        btn.className = "btn btn-primary-large";
      } else {
        btn.className = "btn btn-choice";
      }
      
      btn.textContent = choice.text;

      if (choice.requiresInput && hasInput) {
        btn.disabled = true;
        btn.dataset.requiresInput = "true";
      }

      btn.addEventListener("click", () => {
        if (choice.next) showScene(choice.next);
      });

      choicesContainer.appendChild(btn);
    });
  }

  function renderInput(config) {
    inputBox.hidden = false;

    const input = document.createElement("input");
    input.type = config.type || "text";
    input.placeholder = config.placeholder || "Type here...";
    input.className = "text-input";
    input.maxLength = config.maxLength || 20;

    input.addEventListener("input", () => {
      const value = input.value.trim();
      if (config.saveAs) gameState[config.saveAs] = value;

      document.querySelectorAll('[data-requires-input="true"]').forEach((btn) => {
        btn.disabled = value.length === 0;
      });
    });

    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && input.value.trim().length > 0) {
        const btn = choicesContainer.querySelector(".btn:not(:disabled)");
        if (btn) btn.click();
      }
    });

    inputBox.appendChild(input);
    setTimeout(() => input.focus(), 100);
  }

  function renderPuzzle(puzzle) {
    puzzleBox.innerHTML = "";

    // Instruction line (e.g., "Find the next number in the pattern")
    if (puzzle.instruction) {
      const instructionEl = document.createElement("div");
      instructionEl.className = "puzzle-instruction";
      instructionEl.textContent = puzzle.instruction;
      puzzleBox.appendChild(instructionEl);
    }

    // The actual question
    const questionEl = document.createElement("div");
    questionEl.className = "puzzle-question";
    questionEl.textContent = puzzle.question;
    puzzleBox.appendChild(questionEl);

    // Answer options
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

  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl) {
    const isCorrect = selectedId === puzzle.correctId;

    optionsEl.querySelectorAll("button").forEach((btn) => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      setTimeout(() => {
        if (puzzle.onCorrect) showScene(puzzle.onCorrect);
      }, 1000);
    } else {
      selectedBtn.classList.add("incorrect");

      // Only add hint if one doesn't already exist
      let hintEl = puzzleBox.querySelector(".puzzle-hint");
      if (!hintEl) {
        hintEl = document.createElement("div");
        hintEl.className = "puzzle-hint";
        puzzleBox.appendChild(hintEl);
      }
      hintEl.textContent = puzzle.hintOnWrong || "Try again!";

      setTimeout(() => {
        optionsEl.querySelectorAll("button").forEach((btn) => {
          if (!btn.classList.contains("incorrect")) btn.disabled = false;
        });
      }, 1000);
    }
  }

  function formatDialogue(text) {
    if (!text) return "";
    let formatted = text.replace(/{playerName}/g, gameState.playerName || "friend");
    formatted = formatted.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    formatted = formatted.replace(/✨([^✨]+)✨/g, '<span class="sparkle">$1</span>');
    return formatted;
  }

  /**
   * Split long dialogue into pages at sentence boundaries
   * Returns array of text chunks
   */
  function splitDialogueIntoPages(text) {
    if (!text || text.length <= MAX_DIALOGUE_LENGTH) {
      return [text];
    }
    
    const pages = [];
    // Split on sentence endings (. ! ?) followed by space
    const sentences = text.split(/(?<=[.!?])\s+/);
    let currentPage = "";
    
    for (const sentence of sentences) {
      // If adding this sentence would exceed limit, start new page
      if (currentPage.length + sentence.length > MAX_DIALOGUE_LENGTH && currentPage.length > 0) {
        pages.push(currentPage.trim());
        currentPage = sentence;
      } else {
        currentPage += (currentPage ? " " : "") + sentence;
      }
    }
    
    // Don't forget the last page
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    
    return pages.length > 0 ? pages : [text];
  }

  /**
   * Show current page of dialogue with "continue" button if more pages
   */
  function showDialoguePage() {
    const pageText = dialoguePages[currentDialoguePage];
    dialogueText.innerHTML = formatDialogue(pageText);
    
    // Remove any existing continue button
    const existingContinue = dialogueLayer.querySelector(".dialogue-continue");
    if (existingContinue) existingContinue.remove();
    
    // If there are more pages, show continue indicator instead of choices
    if (currentDialoguePage < dialoguePages.length - 1) {
      choicesContainer.innerHTML = "";  // Hide choices until last page
      
      const continueDiv = document.createElement("div");
      continueDiv.className = "dialogue-continue";
      
      const continueBtn = document.createElement("button");
      continueBtn.className = "dialogue-continue-btn";
      continueBtn.textContent = "▼ Tap to continue...";
      continueBtn.addEventListener("click", () => {
        currentDialoguePage++;
        showDialoguePage();
      });
      
      continueDiv.appendChild(continueBtn);
      dialogueLayer.insertBefore(continueDiv, choicesContainer);
    } else {
      // Last page - show the choices
      if (pendingChoices) {
        renderChoices(pendingChoices.choices, pendingChoices.hasInput);
      }
    }
  }

  /**
   * Initialize dialogue with pagination support
   */
  function setDialogue(text, choices = null, hasInput = false) {
    dialoguePages = splitDialogueIntoPages(text);
    currentDialoguePage = 0;
    pendingChoices = choices ? { choices, hasInput } : null;
    showDialoguePage();
  }

  function snapVine(vineNumber) {
    vinesSnapped = Math.max(vinesSnapped, vineNumber);
    for (let i = 1; i <= vinesSnapped; i++) {
      const vine = document.getElementById(`vine${i}`);
      if (vine) vine.classList.add("snapped");
    }
    updateVineProgress();
    log("Vines snapped:", vinesSnapped, "/", TOTAL_VINES);
  }

  function updateVineProgress() {
    const dots = vineProgress.querySelectorAll(".vine-dot");
    dots.forEach((dot, index) => {
      const vineNum = index + 1;
      dot.classList.remove("active", "cleared");
      if (vineNum <= vinesSnapped) {
        dot.classList.add("cleared");
      } else if (vineNum === vinesSnapped + 1) {
        dot.classList.add("active");
      }
    });
  }

  // --- Event Listeners ---

  const homeBtn = document.getElementById("homeBtn");

  homeBtn?.addEventListener("click", () => {
    if (confirm("Return to the main menu?")) {
      window.location.href = "index.html";
    }
  });

  skipBtn?.addEventListener("click", () => {
    if (confirm("Skip the tutorial? You can always replay it later!")) {
      gameState.tutorialComplete = true;
      saveGameState(gameState);
      window.location.href = "patterns.html";
    }
  });

  // --- Start ---
  showScene(STARTING_SCENE);
});