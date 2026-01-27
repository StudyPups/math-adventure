// data/questions/tutorial-questions.js
// These are the tutorial questions for the "vine rescue" sequence
// Start with simple questions to build confidence!

export const tutorialQuestions = [
  {
    id: "tut-1",
    stem: {
      text: "🌿 Vine 1: What is 7 × 6?"
    },
    options: [
      { id: "a", text: "36" },
      { id: "b", text: "42" },
      { id: "c", text: "48" },
      { id: "d", text: "56" }
    ],
    correctId: "b",
    feedback: {
      correct: "Yes! 7 × 6 = 42. The first vine snaps! 🌿✨",
      incorrect: "Not quite. Try thinking: 7 groups of 6..."
    }
  },

  {
    id: "tut-2",
    stem: {
      text: "🌿 Vine 2: What comes next in this pattern?\n2, 4, 6, 8, ___"
    },
    options: [
      { id: "a", text: "9" },
      { id: "b", text: "10" },
      { id: "c", text: "11" },
      { id: "d", text: "12" }
    ],
    correctId: "b",
    feedback: {
      correct: "That's it! The pattern adds 2 each time. Another vine breaks! 🌿✨",
      incorrect: "Look at what's being added each time: 2→4→6→8..."
    }
  },

  {
    id: "tut-3",
    stem: {
      text: "🌿 Vine 3: If you have 12 cookies and share them equally between 3 friends, how many does each friend get?"
    },
    options: [
      { id: "a", text: "3" },
      { id: "b", text: "4" },
      { id: "c", text: "6" },
      { id: "d", text: "9" }
    ],
    correctId: "b",
    feedback: {
      correct: "Perfect! 12 ÷ 3 = 4 cookies each. The last vine snaps! 🌿🎉",
      incorrect: "Think: 12 split into 3 equal groups..."
    }
  }
];