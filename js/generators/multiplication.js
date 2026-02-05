// js/generators/multiplication.js
// --------------------------------
// Simple multiplication question generator
// (Farm version – beginner friendly)
// --------------------------------

export function makeFarmMultiplicationPuzzle() {
  const a = Math.floor(Math.random() * 6) + 2; // 2–7
  const b = Math.floor(Math.random() * 6) + 2; // 2–7

  const correctAnswer = a * b;
  const options = buildOptions(a, b, correctAnswer);

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

function buildOptions(a, b, correctAnswer) {
  const options = new Set([correctAnswer]);
  const candidates = [
    a + b,
    correctAnswer + b,
    correctAnswer - b,
    correctAnswer + a,
    correctAnswer - a,
    (a + 1) * b,
    (a - 1) * b,
    a * (b + 1),
    a * (b - 1),
    correctAnswer + 1,
    correctAnswer - 1,
    correctAnswer + 2,
    correctAnswer - 2
  ];

  for (const value of candidates) {
    if (options.size >= 4) break;
    if (value > 0) options.add(value);
  }

  while (options.size < 4) {
    const offset = Math.floor(Math.random() * 5) + 1;
    const candidate = Math.random() > 0.5 ? correctAnswer + offset : correctAnswer - offset;
    if (candidate > 0) options.add(candidate);
  }

  return Array.from(options).sort(() => Math.random() - 0.5);
}
