import { onReady, log } from "./shared.js";
import { tutorialQuestions } from "../data/questions/tutorial-questions.js";

onReady(() => {
  log("Tutorial loaded ✅");

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

  const questions = tutorialQuestions;

  let index = -1;
  let locked = false;
  let vinesRemaining = questions.length;

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

  function showIntro() {
    setFeedback("");
    tutorialText.textContent =
      "Hi! Let’s rescue Teddy. Answer questions to snap the vines.";
    questionBox.hidden = true;
    vinesRemaining = questions.length;
    renderVines();
    setContinue("Start", true, true);
  }

  function showQuestion() {
    setFeedback("");
    index += 1;

    if (index >= questions.length) {
      setFeedback("You did it! 🎉");
      tutorialText.textContent = "You did it! Teddy is free 🎉";
      questionBox.hidden = true;
      setContinue("Continue", true, true);
      return;
    }

    const q = questions[index];

    qNumber.textContent = `Question ${index + 1}/${questions.length}`;
    qText.textContent = q.stem?.text ?? "";

    if (qImage) {
      if (q.stem?.image) {
        qImage.src = q.stem.image;
        qImage.hidden = false;
      } else {
        qImage.hidden = true;
        qImage.removeAttribute("src");
      }
    }

    answersEl.innerHTML = "";
    locked = false;

    setContinue("Next", false, false);

    q.options.forEach((opt) => {
      const btn = document.createElement("button");
      btn.className = "answer-option";
      btn.type = "button";

      if (opt.image) {
        const img = document.createElement("img");
        img.src = opt.image;
        img.alt = opt.text || "Answer option";
        img.className = "answer-image";
        btn.appendChild(img);
      }

      if (opt.text) {
        const label = document.createElement("div");
        label.className = "answer-label";
        label.textContent = opt.text;
        btn.appendChild(label);
      }

      btn.addEventListener("click", () => {
        if (locked) return;
        locked = true;

        const isCorrect = opt.id === q.correctId;

        if (isCorrect) {
          btn.classList.add("correct");
          setFeedback(q.feedback.correct);
          setFeedback("✅ Correct — vine snapped!");
          vinesRemaining = Math.max(0, vinesRemaining - 1);
          renderVines();
        } else {
          btn.classList.add("incorrect");
        setFeedback(q.feedback.incorrect);
          setFeedback("❌ Not quite — try the next one.");
        }

        [...answersEl.children].forEach((b) => (b.disabled = true));
        setContinue("Next", true, true);
      });

      answersEl.appendChild(btn);
    });

    questionBox.hidden = false;
  }

  continueBtn.addEventListener("click", () => {
    if (index >= questions.length) {
      window.location.href = "patterns.html";
      return;
    }
    showQuestion();
  });

  skipBtn?.addEventListener("click", () => {
    window.location.href = "patterns.html";
  });

  showIntro();
});
