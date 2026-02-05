import { isPrime, sample, shuffle, unique } from "../utils.js";

const PRIME_MIN = 2;
const PRIME_MAX = 50;
const PRIME_QUESTION = "Which of these numbers is PRIME?";

const COMPOSITE_POOL = [
  4, 6, 8, 9, 10, 12, 14, 15, 16, 18,
  20, 21, 22, 24, 25, 26, 27, 28, 30, 32,
  33, 34, 35, 36, 38, 39, 40, 42, 44, 45,
  46, 48, 49, 50
];

function getPrimesInRange(min, max) {
  const primes = [];
  for (let n = min; n <= max; n += 1) {
    if (isPrime(n)) primes.push(n);
  }
  return primes;
}

function buildPrimeOptions(correctPrime) {
  const wrongOptions = new Set();
  const nearby = [correctPrime - 2, correctPrime - 1, correctPrime + 1, correctPrime + 2]
    .filter((value) => value >= PRIME_MIN && value <= PRIME_MAX && !isPrime(value));

  nearby.forEach((value) => wrongOptions.add(value));

  if (Math.random() < 0.35) {
    wrongOptions.add(1);
  }

  while (wrongOptions.size < 3) {
    const candidate = sample(COMPOSITE_POOL);
    if (candidate !== undefined && candidate !== correctPrime && !isPrime(candidate)) {
      wrongOptions.add(candidate);
    }
  }

  const wrongList = Array.from(wrongOptions);
  return shuffle(unique([correctPrime, ...wrongList.slice(0, 3)])).slice(0, 4);
}

function buildPrimePuzzle() {
  const primes = getPrimesInRange(PRIME_MIN, PRIME_MAX);
  const correctPrime = sample(primes) ?? 2;
  const optionValues = buildPrimeOptions(correctPrime);
  const correctIndex = optionValues.indexOf(correctPrime);

  const options = optionValues.map((value, index) => ({
    id: String.fromCharCode(97 + index),
    text: String(value)
  }));

  return {
    type: "topic",
    topicId: "prime_numbers",
    dialogue: "Prime time! Let’s spot the number that has exactly two factors.",
    question: PRIME_QUESTION,
    options,
    correctId: String.fromCharCode(97 + correctIndex),
    reward: 2,
    hintOnWrong: "Try checking factors: can it divide evenly by 2, 3, 5, or 7?",
    hintSteps: {
      level1: "Check 2, 3, 5, and 7 first — primes have no other factors.",
      level2: "If it divides evenly by any of those, it is not prime.",
      level3: "Prime numbers have exactly two factors: 1 and itself."
    },
    regenerate: () => buildPrimePuzzle()
  };
}

export const primeNumbers = {
  id: "prime_numbers",
  yearLevel: 5,
  displayName: "Prime Numbers",
  farmContext: "numbers",
  generate() {
    return buildPrimePuzzle();
  }
};
