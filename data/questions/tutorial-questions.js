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
    correctId: "b"
  },

  {
    id: "tut-2",
    stem: {
      text: "Which shape could have been Sam’s shape?",
      image: "assets/naplan/q8-shapes.png"   // <-- you’ll add this file later
    },
    options: [
      { id: "a", image: "assets/naplan/q8-a.png" },
      { id: "b", image: "assets/naplan/q8-b.png" },
      { id: "c", image: "assets/naplan/q8-c.png" },
      { id: "d", image: "assets/naplan/q8-d.png" }
    ],
    correctId: "b"
  }
];
