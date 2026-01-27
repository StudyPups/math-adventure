export const tutorialQuestions = [
  {
    id: "tut-1",
    stem: {
      text: "Warm-up: What is 7 × 6?"
    },
    options: [
      { id: "a", text: "36" },
      { id: "b", text: "42" },
      { id: "c", text: "48" },
      { id: "d", text: "56" }
    ],
    correctId: "b",
     feedback: {
    correct: "That’s right! The vines are snapping!",
    incorrect: "Think about 7 groups of 6."
  }
  },

  {
    id: "tut-2",
    stem: {
      text: "Which shape could have been Sam’s shape?",
      image: "assets/naplan/q8-shapes.jpg"   // <-- you’ll add this file later
    },
    options: [
      { id: "a", image: "assets/naplan/q8-a.jpg" },
      { id: "b", image: "assets/naplan/q8-b.jpg" },
      { id: "c", image: "assets/naplan/q8-c.jpg" },
      { id: "d", image: "assets/naplan/q8-d.jpg" }
    ],
    correctId: "b",
  },
];
