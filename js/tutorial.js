// js/tutorial.js
// Scene-based tutorial engine for StudyPups

import { onReady, log, saveGameState, loadGameState, createNewGameState } from "./shared.js";
import { tutorialScenes, getScene, STARTING_SCENE } from "../data/tutorial-scenes.js";

onReady(() => {
  log("Tutorial Engine loaded ✅");

  // --- DOM Elements ---
  const sceneContainer = document.getElementById("sceneContainer");
  const dialoguePanel = document.getElementById("dialoguePanel");
  const speakerName = document.getElementById("speakerName");
  const speakerPortrait = document.getElementById("speakerPortrait");
  const dialogueText = document.getElementById("dialogueText");
  const choicesContainer = document.getElementById("choicesContainer");
  const characterStage = document.getElementById("characterStage");
  const vineDisplay = document.getElementById("vineDisplay");
  const puzzleBox = document.getElementById("puzzleBox");
  const inputBox = document.getElementById("inputBox");
  const skipBtn = document.getElementById("skipBtn");

  // --- Game State ---
  let gameState = loadGameState() || createNewGameState();
  let currentSceneId = STARTING_SCENE;
  let vinesSnapped = 0;

  // --- Core Functions ---

  function showScene(sceneId) {
    const scene = getScene(sceneId);
    if (!scene) {
      log("Scene not found:", sceneId);
      return;
    }

    currentSceneId = sceneId;
    log("Showing scene:", sceneId);

    // Clear previous content
    choicesContainer.innerHTML = "";
    puzzleBox.hidden = true;
    inputBox.hidden = true;

    // Handle different layout types
    switch (scene.layout) {
      case "scene":
        showSceneLayout(scene);
        break;
      case "dialogue":
        showDialogueLayout(scene);
        break;
      case "puzzle":
        showPuzzleLayout(scene);
        break;
      case "reward":
        showRewardLayout(scene);
        break;
      case "gem-demo":
        showGemDemoLayout(scene);
        break;
      case "transition":
        handleTransition(scene);
        break;
      default:
        showDialogueLayout(scene);
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

  // --- Layout Functions ---

  function showSceneLayout(scene) {
    // Show characters on stage
    characterStage.innerHTML = "";
    characterStage.hidden = false;

    if (scene.characters) {
      scene.characters.forEach(char => {
        const charEl = document.createElement("div");
        charEl.className = `character-container position-${char.position}`;
        
        const img = document.createElement("img");
        img.src = char.image;
        img.alt = char.id;
        img.className = `character-img size-${char.size || 'medium'}`;
        
        if (char.animation) {
          img.classList.add(`anim-${char.animation}`);
        }
        
        charEl.appendChild(img);
        characterStage.appendChild(charEl);
      });
    }

    // Handle scene dialogue (action text)
if (scene.dialogue && typeof scene.dialogue === 'object') {
  dialoguePanel.hidden = false;
  speakerPortrait.hidden = true;
  speakerName.textContent = scene.dialogue.speaker || "";
  dialogueText.innerHTML = formatDialogue(scene.dialogue.text);
  dialogueText.className = scene.dialogue.style === 'action' ? 'action-text' : '';
} else if (scene.choices) {
  // No dialogue text, but we have choices - show the panel for buttons!
  dialoguePanel.hidden = false;
  speakerPortrait.hidden = true;
  speakerName.textContent = "";
  dialogueText.innerHTML = "";
} else if (!scene.autoNext) {
  dialoguePanel.hidden = true;
}

    // Show choices
    if (scene.choices && !scene.autoNext) {
      showChoices(scene.choices);
    }
  }

  function showDialogueLayout(scene) {
    characterStage.hidden = true;
    dialoguePanel.hidden = false;

    // Show speaker
    if (scene.speaker) {
      speakerName.textContent = scene.speaker.name || "???";
      if (scene.speaker.image) {
        speakerPortrait.src = scene.speaker.image;
        speakerPortrait.hidden = false;
      } else {
        speakerPortrait.hidden = true;
      }
    }

    // Show dialogue with text replacement
    dialogueText.innerHTML = formatDialogue(scene.dialogue);
    dialogueText.className = '';

    // Handle text input
    if (scene.input) {
      showInputBox(scene.input);
    }

    // Show choices
    if (scene.choices) {
      showChoices(scene.choices, scene.input);
    }
  }

  function showPuzzleLayout(scene) {
    // Show speaker/fairy giving instruction
    if (scene.speaker) {
      speakerName.textContent = scene.speaker.name || "???";
      speakerPortrait.src = scene.speaker.image;
      speakerPortrait.hidden = false;
    }
    
    dialoguePanel.hidden = false;
    dialogueText.innerHTML = formatDialogue(scene.dialogue);

    // Show puzzle
    puzzleBox.hidden = false;
    puzzleBox.innerHTML = "";

    const puzzle = scene.puzzle;

    // Question display
    const questionEl = document.createElement("div");
    questionEl.className = "puzzle-question";
    questionEl.textContent = puzzle.question;
    puzzleBox.appendChild(questionEl);

    // Answer options
    const optionsEl = document.createElement("div");
    optionsEl.className = "puzzle-options";

    puzzle.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.className = "answer-option";
      btn.textContent = opt.text;
      
      btn.addEventListener("click", () => {
        handlePuzzleAnswer(opt.id, puzzle, btn, optionsEl);
      });

      optionsEl.appendChild(btn);
    });

    puzzleBox.appendChild(optionsEl);

    // Hint display area
    const hintEl = document.createElement("div");
    hintEl.className = "puzzle-hint";
    hintEl.id = "puzzleHint";
    hintEl.hidden = true;
    puzzleBox.appendChild(hintEl);
  }

  function showRewardLayout(scene) {
    characterStage.hidden = false;
    characterStage.innerHTML = "";

    // Show reward item
    const rewardEl = document.createElement("div");
    rewardEl.className = "reward-display";
    rewardEl.innerHTML = `
      <img src="${scene.rewardImage}" alt="${scene.rewardName}" class="reward-image" 
           onerror="this.src=''; this.alt='✨ ${scene.rewardName} ✨'; this.className='reward-placeholder';">
      <div class="reward-name">${scene.rewardName}</div>
    `;
    characterStage.appendChild(rewardEl);

    // Show dialogue
    if (scene.speaker) {
      dialoguePanel.hidden = false;
      speakerName.textContent = scene.speaker.name;
      speakerPortrait.src = scene.speaker.image;
      speakerPortrait.hidden = false;
      dialogueText.innerHTML = formatDialogue(scene.dialogue);
    }

    if (scene.choices) {
      showChoices(scene.choices);
    }
  }

  function showGemDemoLayout(scene) {
    characterStage.hidden = false;
    characterStage.innerHTML = "";

    // Show Teddy with clickable gem
    if (scene.characters) {
      scene.characters.forEach(char => {
        const charEl = document.createElement("div");
        charEl.className = `character-container position-${char.position} gem-demo`;
        
        const img = document.createElement("img");
        img.src = char.image;
        img.alt = char.id;
        img.className = `character-img size-${char.size || 'large'} clickable-gem`;
        
        // Make the whole character clickable for the gem demo
        img.addEventListener("click", () => {
          showScene(scene.onGemClick);
        });
        
        charEl.appendChild(img);
        characterStage.appendChild(charEl);
      });
    }

    // Show instruction
    dialoguePanel.hidden = false;
    speakerName.textContent = "";
    speakerPortrait.hidden = true;
    dialogueText.innerHTML = `<em>${scene.instruction}</em>`;
    dialogueText.className = "instruction-text";

    // Add pulsing hint
    const hint = document.createElement("div");
    hint.className = "click-hint";
    hint.textContent = "👆 Click on Teddy!";
    characterStage.appendChild(hint);
  }

  function handleTransition(scene) {
    // Show transition screen
    sceneContainer.innerHTML = `
      <div class="transition-screen">
        <div class="transition-text">${scene.transitionText}</div>
        <div class="loading-paw">🐾</div>
      </div>
    `;

    // Save game state before leaving
    gameState.tutorialComplete = true;
    saveGameState(gameState);

    // Navigate after delay
    setTimeout(() => {
      window.location.href = scene.destination || "patterns.html";
    }, 1500);
  }

  // --- Helper Functions ---

  function formatDialogue(text) {
    if (!text) return "";
    
    // Replace {playerName} with actual name
    let formatted = text.replace(/{playerName}/g, gameState.playerName || "friend");
    
    // Make *text* italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Make ✨text✨ sparkly
    formatted = formatted.replace(/✨([^✨]+)✨/g, '<span class="sparkle">$1</span>');
    
    return formatted;
  }

  function showChoices(choices, hasInput = false) {
    choicesContainer.innerHTML = "";

    choices.forEach(choice => {
      const btn = document.createElement("button");
      btn.className = choice.style === 'primary-large' ? 'btn primary large' : 'btn choice-btn';
      btn.textContent = choice.text;

      if (choice.requiresInput && hasInput) {
        btn.disabled = true;
        btn.dataset.requiresInput = "true";
      }

      btn.addEventListener("click", () => {
        if (choice.next) {
          showScene(choice.next);
        }
      });

      choicesContainer.appendChild(btn);
    });
  }

  function showInputBox(inputConfig) {
    inputBox.hidden = false;
    inputBox.innerHTML = "";

    const input = document.createElement("input");
    input.type = inputConfig.type || "text";
    input.placeholder = inputConfig.placeholder || "";
    input.className = "name-input";
    input.maxLength = 20;

    input.addEventListener("input", () => {
      // Save the value
      if (inputConfig.saveAs) {
        gameState[inputConfig.saveAs] = input.value.trim();
      }

      // Enable/disable buttons that require input
      const requiresInputBtns = choicesContainer.querySelectorAll('[data-requires-input="true"]');
      requiresInputBtns.forEach(btn => {
        btn.disabled = input.value.trim().length === 0;
      });
    });

    inputBox.appendChild(input);
    
    // Focus the input
    setTimeout(() => input.focus(), 100);
  }

  function handlePuzzleAnswer(selectedId, puzzle, selectedBtn, optionsEl) {
    const isCorrect = selectedId === puzzle.correctId;
    const hintEl = document.getElementById("puzzleHint");

    // Disable all buttons
    optionsEl.querySelectorAll("button").forEach(btn => btn.disabled = true);

    if (isCorrect) {
      selectedBtn.classList.add("correct");
      hintEl.hidden = true;
      
      // Show success and move to next scene
      setTimeout(() => {
        if (puzzle.onCorrect) {
          showScene(puzzle.onCorrect);
        }
      }, 1000);
    } else {
      selectedBtn.classList.add("incorrect");
      
      // Show hint
      hintEl.textContent = puzzle.hintOnWrong;
      hintEl.hidden = false;

      // Re-enable buttons after a moment (except the wrong one)
      setTimeout(() => {
        optionsEl.querySelectorAll("button").forEach(btn => {
          if (!btn.classList.contains("incorrect")) {
            btn.disabled = false;
          }
        });
      }, 1000);
    }
  }

  function snapVine(vineNumber) {
    vinesSnapped = Math.max(vinesSnapped, vineNumber);
    
    // Update vine display
    for (let i = 1; i <= vinesSnapped; i++) {
      const vine = document.getElementById(`vine${i}`);
      if (vine) {
        vine.classList.add("snapped");
      }
    }

    // Update progress dots
    const dots = document.querySelectorAll(".vine-dot");
    dots.forEach((dot, index) => {
      dot.classList.toggle("active", index >= vinesSnapped);
    });
  }

  // --- Event Listeners ---

  skipBtn?.addEventListener("click", () => {
    if (confirm("Skip the tutorial? You can always replay it later!")) {
      window.location.href = "patterns.html";
    }
  });

  // --- Initialize ---
  showScene(STARTING_SCENE);
});