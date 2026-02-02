// js/generators/multiplication.js
// --------------------------------
// Simple multiplication question generator
// (Farm version – beginner friendly)
// --------------------------------

export function makeFarmMultiplicationPuzzle() {
  const a = Math.floor(Math.random() * 6) + 2; // 2–7
  const b = Math.floor(Math.random() * 6) + 2; // 2–7

  const correctAnswer = a * b;

  const options = [
    correctAnswer,
    correctAnswer + a,
    correctAnswer - b,
    correctAnswer + 2
  ].sort(() => Math.random() - 0.5);

  const correctIndex = options.indexOf(correctAnswer);

  return {
    type: "multiplication",
    dialogue: `I've got ${a} pens, and each pen needs ${b} sheep. How many sheep do I need altogether?`,
    question: `${a} × ${b} = ?`,
    options: options.map((value, index) => ({
      id: String.fromCharCode(97 + index), // a, b, c, d
      text: String(value)
    })),
    correctId: String.fromCharCode(97 + correctIndex),
    hintOnWrong: `Try counting by ${b}s, ${a} times.`,
    reward: 2
  };
}
