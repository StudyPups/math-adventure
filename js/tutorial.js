import { onReady, log } from "./shared.js";
import { tutorialQuestions } from "../data/questions/tutorial-questions.js";

onReady(() => {
  log("Tutorial loaded ✅");

  // --- DOM Elements ---
  const skipBtn = document.getElementById("skipBtn");
  const continueBtn = document.getElementById("continueBtn");
  const tutorialText = document.getElementById("tutorialText");
  const questionBox = document.getElementById("questionBox");
  const qNumber = document.getElementById("qNumber");
  const qText = document.getElementById("qText");
  const qImage = document.getElementById("qImage");
  const answersEl = document.getElementById("answers");
  const vineProgress = document.getElementById("vineProgress");
  const feedbackLine = document.getElementById("feedbackLine");
  
  // Character & vine elements
  const teddyImg = document.getElementById("teddyImg");
  const fairyImg = document.getElementById("fairyImg");
  const tutorialScene = document.getElementById("tutorialScene");
  const vine1 = document.getElementById("vine1");
  const vine2 = document.getElementById("vine2");
  const vine3 = document.getElementById("vine3");
  const vines = [vine1, vine2, vine3];

  // --- Image paths (ALL PNG NOW!) ---
  const images = {
    teddy: {
      hopeful: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png",
      happy: "assets/images/characters/Teddy/tutorial-teddy-tongue.png",
      sad: "assets/images/characters/Teddy/teddy-wrong-answer.png",
      celebrate: "assets/images/characters/Teddy/teddy-jump-excited.png"
    },
    fairy: {
      help: "assets/images/characters/Fairy/fairy-help-request.png",
      thanks: "assets/images/characters/Fairy/fairy-thanks.png"
    }
  };

  // --- Game State ---
  const questions = tutorialQuestions;
  let index = -1;           // -1 = intro screen, 0+ = question index
  let locked = false;       // Prevents double-clicking answers
  let vinesRemaining = questions.length;
  let correctCount = 0;     // Track how many vines snapped

  // --- Helper Functions ---
  
  function setFeedback(msg = "") {
    if (!feedbackLine) return;
    feedbackLine.textContent = msg;
    feedbackLine.style.display = msg ? "block" : "none";
  }

  function renderVines() {
    if (!vineProgress) return;
    const dots = vineProgress.querySelectorAll(".vine-dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i < vinesRemaining);
    });
  }

  function snapVine(vineIndex) {
    // Snap the visual vine image
    if (vines[vineIndex]) {
      vines[vineIndex].classList.add("snapped");
    }
  }

  function setTeddyExpression(expression) {
    if (!teddyImg) return;
    
    // Remove animation classes
    teddyImg.classList.remove("happy", "sad");
    
    // Change image and add animation
    switch(expression) {
      case "happy":
        teddyImg.src = images.teddy.happy;
        teddyImg.classList.add("happy");
        break;
      case "sad":
        teddyImg.src = images.teddy.sad;
        teddyImg.classList.add("sad");
        break;
      case "celebrate":
        teddyImg.src = images.teddy.celebrate;
        teddyImg.classList.add("happy");
        break;
      default:
        teddyImg.src = images.teddy.hopeful;
    }
  }

  function setFairyExpression(expression) {
    if (!fairyImg) return;
    
    switch(expression) {
      case "thanks":
        fairyImg.src = images.fairy.thanks;
        break;
      default:
        fairyImg.src = images.fairy.help;
    }
  }

  function setContinue(label, enabled = true, visible = true) {
    continueBtn.textContent = label;
    continueBtn.disabled = !enabled;
    continueBtn.style.display = visible ? "inline-block" : "none";
  }

  // --- Screen Functions ---

  function showIntro() {
    setFeedback("");
    tutorialText.textContent =
      "Oh no! Vines are blocking the path! Answer questions to snap them and help Teddy reach the fairy.";
    questionBox.hidden = true;
    vinesRemaining = questions.length;
    correctCount = 0;
    
    // Reset visuals
    renderVines();
    vines.forEach(v => v && v.classList.remove("snapped"));
    setTeddyExpression("hopeful");
    setFairyExpression("help");
    tutorialScene.classList.remove("rescued");
    
    setContinue("Start", true, true);
  }

  function showQuestion() {
    setFeedback("");
    index += 1;

    // Check if tutorial is complete
    if (index >= questions.length) {
      showComplete();
      return;
    }

    const q = questions[index];

    // Reset Teddy to hopeful for new question
    setTeddyExpression("hopeful");

    // Update question number
    qNumber.textContent = `Question ${index + 1} of ${questions.length}`;
    
    // Update question text
    qText.textContent = q.stem?.text ?? "";

    // Handle question image (if any)
    if (qImage) {
      if (q.stem?.image) {
        qImage.src = q.stem.image;
        qImage.hidden = false;
      } else {
        qImage.hidden = true;
        qImage.removeAttribute("src");
      }
    }

    // Build answer buttons
    answersEl.innerHTML = "";
    locked = false;
    setContinue("Next", false, false); // Hide until answered

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "answer-option";
      btn.type = "button";

      // If option has an image
      if (opt.image) {
        const img = document.createElement("img");
        img.src = opt.image;
        img.alt = opt.text || "Answer option";
        img.className = "answer-image";
        btn.appendChild(img);
      }

      // If option has text
      if (opt.text) {
        const label = document.createElement("div");
        label.className = "answer-label";
        label.textContent = opt.text;
        btn.appendChild(label);
      }

      // Answer click handler
      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        const isCorrect = opt.id === q.correctId;

        // Get feedback messages (use defaults if not specified)
        const correctMsg = q.feedback?.correct ?? "That's right! A vine snaps! 🌿✨";
        const incorrectMsg = q.feedback?.incorrect ?? "Not quite — let's try another one.";

        if (isCorrect) {
          btn.classList.add("correct");
          tutorialText.textContent = "Amazing! *SNAP* — a vine breaks away!";
          setFeedback(correctMsg);
          
          // Snap the vine!
          snapVine(correctCount);
          correctCount++;
          vinesRemaining = Math.max(0, vinesRemaining - 1);
          renderVines();
          
          // Teddy is happy!
          setTeddyExpression("happy");
          
        } else {
          btn.classList.add("incorrect");
          tutorialText.textContent = "That's okay! Let's try the next one.";
          setFeedback(incorrectMsg);
          
          // Teddy is sad but encouraging
          setTeddyExpression("sad");
        }

        // Disable all answer buttons
        [...answersEl.children].forEach((b) => (b.disabled = true));
        
        // Show the Next button
        setContinue("Next", true, true);
      });

      answersEl.appendChild(btn);
    });

    questionBox.hidden = false;
  }

  function showComplete() {
    setFeedback("");
    questionBox.hidden = true;
    
    // Celebration visuals!
    tutorialScene.classList.add("rescued");
    setTeddyExpression("celebrate"); // Now has the magical collar!
    setFairyExpression("thanks");
    
    tutorialText.innerHTML = `
      🎉 <strong>You did it!</strong> 🎉<br><br>
      The fairy is free! As a thank you, she gives Teddy a <strong>magical collar</strong> 
      so you can understand him on your adventure!
    `;
    
    setContinue("Start Adventure! →", true, true);
    
    // Update vines to show all cleared
    renderVines();
  }

  // --- Event Listeners ---

  continueBtn.addEventListener("click", () => {
    if (index === -1) {
      // Was on intro screen, show first question
      showQuestion();
    } else if (index >= questions.length - 1 && vinesRemaining === 0) {
      // Tutorial complete, go to patterns page
      window.location.href = "patterns.html";
    } else if (index >= questions.length) {
      // Already on complete screen, go to patterns
      window.location.href = "patterns.html";
    } else {
      // Show next question
      showQuestion();
    }
  });

  skipBtn?.addEventListener("click", () => {
    window.location.href = "patterns.html";
  });

  // --- Initialize ---
  showIntro();
});