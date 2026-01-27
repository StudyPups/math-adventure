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

  // --- Game State ---
  const questions = tutorialQuestions;
  let index = -1;           // -1 = intro screen, 0+ = question index
  let locked = false;       // Prevents double-clicking answers
  let vinesRemaining = questions.length;

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
    renderVines();
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
          tutorialText.textContent = "Nice! *Snap* — one vine breaks!";
          setFeedback(correctMsg);
          vinesRemaining = Math.max(0, vinesRemaining - 1);
          renderVines();
        } else {
          btn.classList.add("incorrect");
          tutorialText.textContent = "That's okay! We'll keep trying.";
          setFeedback(incorrectMsg);
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
    tutorialText.textContent = "🎉 Amazing! You cleared all the vines! Teddy can reach the fairy now!";
    questionBox.hidden = true;
    setContinue("Continue Adventure", true, true);
    
    // Update vines to show all cleared
    renderVines();
  }

  // --- Event Listeners ---

  continueBtn.addEventListener("click", () => {
    if (index === -1) {
      // Was on intro screen, show first question
      showQuestion();
    } else if (index >= questions.length - 1 && vinesRemaining === 0) {
      // Tutorial complete, go to next page
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