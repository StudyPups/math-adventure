// js/farm.js
// Game engine for Buttercup's Farm location
// Reuses the same scene-based system as tutorial.js

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
  
  // Initialize gem display
  updateGemDisplay();

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

  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl) {
    const isCorrect = selectedId === puzzle.correctId;

    optionsEl.querySelectorAll("button").forEach((btn) => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      
      // Award glimmers!
      if (puzzle.reward) {
        gameState.stats.totalGlimmers = (gameState.stats.totalGlimmers || 0) + puzzle.reward;
        updateGemDisplay();
        saveGameState(gameState);
        log("Awarded", puzzle.reward, "glimmers! Total:", gameState.stats.totalGlimmers);
      }
      
      setTimeout(() => {
        if (puzzle.onCorrect) showScene(puzzle.onCorrect);
      }, 1000);
    } else {
      selectedBtn.classList.add("incorrect");

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