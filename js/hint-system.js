// ============================================================
// MAGICAL HINT SYSTEM - StudyPups (Enhanced)
// 
// Drop-in replacement for the hint functions in tutorial.js
// 
// Three levels of progressive hints:
//   Level 0: "Let's figure this out..." - Question marks (?)
//   Level 1: "Here's the pattern!" - Fairy reveals the rule (+2)
//   Level 2: "You've got this!" - Final calculation help
//
// NEW: Teddy encouragement when player chooses "Got it!" 🎉
// ============================================================

// Track current hint level for each puzzle attempt
let currentHintLevel = 0;

// Encouraging messages from Teddy when player tries without more hints
const TEDDY_ENCOURAGEMENTS = [
  { text: "You've got this! I believe in you! 🐕", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "Go for it! You're doing great!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
  { text: "I knew you could figure it out!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "That's the spirit! Give it a try!", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" },
  { text: "Woof! You're so brave!", image: "assets/images/characters/Teddy/teddy-tongue.png" },
  { text: "I'm cheering for you! 🐾", image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png" }
];

// Reset hint level when moving to a new puzzle
function resetHintLevel() {
  currentHintLevel = 0;
}

/**
 * Get a random encouragement from Teddy
 */
function getRandomEncouragement() {
  const index = Math.floor(Math.random() * TEDDY_ENCOURAGEMENTS.length);
  return TEDDY_ENCOURAGEMENTS[index];
}

/**
 * Show the magical hint overlay
 * @param {Object} puzzle - The puzzle data with pattern and hints
 */
function showHintOverlay(puzzle) {
  // Create overlay container
  const overlay = document.createElement("div");
  overlay.className = "hint-overlay";
  overlay.id = "hintOverlay";
  
  // Backdrop (blurred background)
  const backdrop = document.createElement("div");
  backdrop.className = "hint-overlay-backdrop";
  backdrop.addEventListener("click", () => closeHintOverlay(false)); // Click outside = no encouragement
  overlay.appendChild(backdrop);
  
  // Hint box
  const hintBox = document.createElement("div");
  hintBox.className = `hint-box level-${currentHintLevel + 1}`;
  hintBox.id = "hintBox";
  
  // Build content based on current level
  buildMagicalHintContent(hintBox, puzzle, currentHintLevel);
  
  overlay.appendChild(hintBox);
  document.body.appendChild(overlay);
}

/**
 * Build the hint content with magical fairy transformation
 * @param {HTMLElement} hintBox - The container element
 * @param {Object} puzzle - Puzzle data
 * @param {number} level - Current hint level (0, 1, or 2)
 */
function buildMagicalHintContent(hintBox, puzzle, level) {
  const pattern = puzzle.pattern || {};
  const hints = puzzle.hints || [];
  const maxLevel = Math.min(hints.length - 1, 2); // Cap at 3 levels (0, 1, 2)
  
  // Clear existing content
  hintBox.innerHTML = "";
  hintBox.className = `hint-box level-${level + 1}`;
  
  // === HEADER (changes per level) ===
  const header = document.createElement("div");
  header.className = "hint-box-header";
  
  const headerConfig = getHeaderConfig(level);
  header.innerHTML = `
    <span class="hint-box-icon">${headerConfig.icon}</span>
    <span class="hint-box-title">${headerConfig.title}</span>
  `;
  hintBox.appendChild(header);
  
  // === SCROLLABLE CONTENT ===
  const content = document.createElement("div");
  content.className = "hint-box-content";
  
  // Fairy magic container (fairy appears on level 1+)
  if (level >= 1) {
    const fairyContainer = document.createElement("div");
    fairyContainer.className = "fairy-magic-container";
    
    const fairyImg = document.createElement("img");
    fairyImg.src = "assets/images/characters/Fairy/fairy-grant-reward.png";
    fairyImg.alt = "Melody the fairy";
    fairyImg.className = "hint-fairy casting";
    fairyContainer.appendChild(fairyImg);
    
    content.appendChild(fairyContainer);
  }
  
  // Pattern display box
  const patternBox = document.createElement("div");
  patternBox.className = "hint-pattern-box";
  patternBox.id = "patternBox";
  
  // Instruction text
  const instruction = document.createElement("div");
  instruction.className = "hint-instruction";
  instruction.textContent = puzzle.instruction || "Find the next number:";
  patternBox.appendChild(instruction);
  
  // The visual pattern (numbers with operators between)
  const patternVisual = createMagicalPatternVisual(pattern, level);
  patternBox.appendChild(patternVisual);
  
  content.appendChild(patternBox);
  
  // Explanation text
  const explanation = document.createElement("div");
  explanation.className = "hint-explanation";
  explanation.innerHTML = getExplanationText(level, pattern, hints);
  content.appendChild(explanation);
  
  // Final calculation (Level 2 only)
  if (level === 2 && pattern.numbers) {
    const lastNum = pattern.numbers[pattern.numbers.length - 1];
    const ruleNum = extractRuleNumber(pattern.operator);
    
    const finalCalc = document.createElement("div");
    finalCalc.className = "hint-final-calc";
    finalCalc.innerHTML = `
      <div class="hint-final-calc-label">Just one more step:</div>
      <div class="hint-final-calc-text">${lastNum} ${getOperatorSymbol(pattern.operator)} ${ruleNum} = ?</div>
    `;
    content.appendChild(finalCalc);
  }
  
  hintBox.appendChild(content);
  
  // === BUTTONS ===
  const buttons = document.createElement("div");
  buttons.className = "hint-buttons";
  
  // "Got it!" button - always present, now triggers encouragement if more hints available
  const gotItBtn = document.createElement("button");
  gotItBtn.className = "hint-btn hint-btn-primary";
  gotItBtn.textContent = "Got it!";
  
  // Show encouragement if there were more hints available (player chose to try on their own!)
  const moreHintsAvailable = level < maxLevel;
  gotItBtn.addEventListener("click", () => {
    closeHintOverlay(moreHintsAvailable);
  });
  buttons.appendChild(gotItBtn);
  
  // "Next level hint" button - only if more hints available
  if (moreHintsAvailable) {
    const nextHintBtn = document.createElement("button");
    nextHintBtn.className = "hint-btn hint-btn-next-level";
    nextHintBtn.textContent = getNextHintButtonText(level);
    nextHintBtn.addEventListener("click", () => {
      triggerMagicalTransformation(puzzle, level + 1);
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
      return { icon: "✨", title: "Here's the pattern!" };
    case 2:
      return { icon: "💪", title: "You've got this!" };
    default:
      return { icon: "💡", title: "Here's a hint!" };
  }
}

/**
 * Get the "next hint" button text based on current level
 */
function getNextHintButtonText(level) {
  switch (level) {
    case 0:
      return "✨ Show me the pattern";
    case 1:
      return "🤔 Help me solve it";
    default:
      return "Another hint?";
  }
}

/**
 * Get explanation text based on level
 */
function getExplanationText(level, pattern, hints) {
  // Use custom hints if provided in puzzle data
  if (hints[level] && hints[level].explanation) {
    return hints[level].explanation;
  }
  
  // Default explanations
  switch (level) {
    case 0:
      return `Look at how the numbers change. What's happening between each one?<br><br>
              <strong>Tip:</strong> Are they getting <span class="keyword">bigger</span> or <span class="keyword">smaller</span>? By how much?`;
    
    case 1:
      const rule = pattern.operator || "+?";
      return `The <span class="keyword">rule</span> is: <strong>${rule}</strong> each time!<br><br>
              A rule tells you what to do to get the next number in the pattern.`;
    
    case 2:
      return `You're so close! Use the rule to work out the last number.<br><br>
              <strong>Take your time</strong> – you've totally got this! 🌟`;
    
    default:
      return "Think about the pattern...";
  }
}

/**
 * Create the visual pattern display
 * Shows numbers with operators between them
 * Level 0: ? marks (mystery)
 * Level 1+: Revealed operators (+2, +5, etc.)
 */
function createMagicalPatternVisual(pattern, level) {
  const container = document.createElement("div");
  container.className = "hint-pattern-visual";
  container.id = "patternVisual";
  
  if (!pattern.numbers) {
    container.textContent = "Pattern not available";
    return container;
  }
  
  pattern.numbers.forEach((num, index) => {
    // Add number
    const numSpan = document.createElement("span");
    numSpan.className = "hint-pattern-number";
    numSpan.textContent = num;
    container.appendChild(numSpan);
    
    // Add operator after each number
    const opSpan = document.createElement("span");
    opSpan.className = "hint-pattern-operator";
    
    if (level === 0) {
      // Level 0: Mystery operators
      opSpan.classList.add("mystery");
      opSpan.textContent = "?";
    } else {
      // Level 1+: Revealed operators
      opSpan.classList.add("revealed");
      opSpan.textContent = pattern.operator || "+?";
    }
    
    container.appendChild(opSpan);
  });
  
  // Add the blank/answer spot at the end
  const blankSpan = document.createElement("span");
  blankSpan.className = "hint-pattern-blank";
  blankSpan.textContent = "?";
  container.appendChild(blankSpan);
  
  return container;
}

/**
 * Trigger the magical transformation animation
 * Fairy appears, sparkles fly, operators transform!
 */
function triggerMagicalTransformation(puzzle, newLevel) {
  currentHintLevel = newLevel;
  
  const hintBox = document.getElementById("hintBox");
  const patternBox = document.getElementById("patternBox");
  
  // Add sparkle effect to pattern box
  patternBox.classList.add("sparkling");
  
  // Create sparkle particles
  createSparkles(patternBox, 8);
  
  // After sparkle animation, rebuild content with new level
  setTimeout(() => {
    buildMagicalHintContent(hintBox, puzzle, newLevel);
  }, 400);
}

/**
 * Create sparkle particle effects
 */
function createSparkles(container, count) {
  const sparkleContainer = document.createElement("div");
  sparkleContainer.className = "hint-sparkle-container";
  
  for (let i = 0; i < count; i++) {
    const sparkle = document.createElement("div");
    sparkle.className = "hint-sparkle";
    
    // Random position within container
    sparkle.style.left = `${20 + Math.random() * 60}%`;
    sparkle.style.top = `${30 + Math.random() * 40}%`;
    
    // Slight delay for staggered effect
    sparkle.style.animationDelay = `${i * 0.08}s`;
    
    sparkleContainer.appendChild(sparkle);
  }
  
  container.appendChild(sparkleContainer);
  
  // Remove sparkles after animation
  setTimeout(() => {
    sparkleContainer.remove();
  }, 1200);
}

/**
 * Show Teddy's encouragement popup
 * A brief, celebratory moment before returning to the puzzle
 */
function showTeddyEncouragement() {
  const encouragement = getRandomEncouragement();
  
  // Create encouragement popup
  const popup = document.createElement("div");
  popup.className = "teddy-encouragement-popup";
  popup.id = "teddyEncouragement";
  
  popup.innerHTML = `
    <div class="teddy-encouragement-content">
      <img 
        src="${encouragement.image}" 
        alt="Teddy cheering" 
        class="teddy-encouragement-sprite bounce-in"
        onerror="this.style.display='none'"
      >
      <div class="teddy-encouragement-bubble pop-in">
        <span class="teddy-encouragement-text">${encouragement.text}</span>
      </div>
    </div>
  `;
  
  document.body.appendChild(popup);
  
  // Auto-dismiss after a moment
  setTimeout(() => {
    popup.classList.add("fade-out");
    setTimeout(() => {
      popup.remove();
    }, 300);
  }, 1500);
  
  // Also allow click to dismiss early
  popup.addEventListener("click", () => {
    popup.classList.add("fade-out");
    setTimeout(() => {
      popup.remove();
    }, 300);
  });
}

/**
 * Close the hint overlay
 * @param {boolean} showEncouragement - Whether to show Teddy's encouragement
 */
function closeHintOverlay(showEncouragement = false) {
  const overlay = document.getElementById("hintOverlay");
  if (overlay) {
    // Fade out animation
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 0.2s ease";
    setTimeout(() => {
      overlay.remove();
      
      // Show Teddy encouragement AFTER the hint closes
      if (showEncouragement) {
        showTeddyEncouragement();
      }
    }, 200);
  }
}

/**
 * Helper: Extract the number from an operator string
 * e.g., "+2" -> 2, "-5" -> 5, "×3" -> 3
 */
function extractRuleNumber(operator) {
  if (!operator) return "?";
  const match = operator.match(/\d+/);
  return match ? match[0] : "?";
}

/**
 * Helper: Get just the operator symbol
 * e.g., "+2" -> "+", "-5" -> "-", "×3" -> "×"
 */
function getOperatorSymbol(operator) {
  if (!operator) return "+";
  const symbol = operator.charAt(0);
  // Convert common variations
  if (symbol === "x" || symbol === "*") return "×";
  if (symbol === "/") return "÷";
  return symbol;
}

// ============================================================
// EXPORT FOR USE IN TUTORIAL.JS AND PATTERNS.JS
// 
// To use this, add these lines near the top of your JS file:
//   import { showHintOverlay, closeHintOverlay, resetHintLevel } 
//     from './hint-system.js';
//
// Or copy these functions directly into your file.
// ============================================================

export { 
  showHintOverlay, 
  closeHintOverlay, 
  resetHintLevel,
  currentHintLevel,
  showTeddyEncouragement  // Export in case you want to trigger manually
};