// js/generators/measurements.js
// --------------------------------
// Measurement conversion question generator
// (Restaurant version – cooking themed, NAPLAN Year 5-7)
// --------------------------------

// Ingredient pools for realistic cooking contexts
const MASS_INGREDIENTS = [
  "flour", "sugar", "rice", "pasta", "chicken", "beef", "potatoes",
  "butter", "cheese", "carrots", "onions", "tomatoes", "apples"
];

const CAPACITY_INGREDIENTS = [
  "milk", "water", "cream", "stock", "juice", "oil", "sauce",
  "soup", "honey", "yogurt", "coconut milk", "lemon juice"
];

// Question templates for Kitchen Hand (Year 5 - easier)
const KITCHEN_HAND_TEMPLATES = [
  // Basic g to kg conversions
  {
    type: "g-to-kg",
    generate: () => {
      const kg = pickRandom([1, 2, 3, 4, 5]);
      const grams = kg * 1000;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `Hmm, the recipe says we need ${grams} grams of ${ingredient}. Can you help me convert that to kilograms?`,
        question: `${grams} g = ? kg`,
        answer: kg,
        unit: "kg",
        hint: `Remember: 1000 grams = 1 kilogram. How many thousands are in ${grams}?`
      };
    }
  },
  // Basic kg to g conversions
  {
    type: "kg-to-g",
    generate: () => {
      const kg = pickRandom([1, 2, 3, 4, 5]);
      const grams = kg * 1000;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `I need ${kg} kilograms of ${ingredient} for this big batch. How many grams is that?`,
        question: `${kg} kg = ? g`,
        answer: grams,
        unit: "g",
        hint: `Each kilogram is 1000 grams. So ${kg} kg = ${kg} × 1000 grams.`
      };
    }
  },
  // Basic mL to L conversions
  {
    type: "mL-to-L",
    generate: () => {
      const litres = pickRandom([1, 2, 3, 4, 5]);
      const mL = litres * 1000;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `We've got ${mL} millilitres of ${ingredient} in this container. How many litres is that?`,
        question: `${mL} mL = ? L`,
        answer: litres,
        unit: "L",
        hint: `Remember: 1000 millilitres = 1 litre. How many thousands are in ${mL}?`
      };
    }
  },
  // Basic L to mL conversions
  {
    type: "L-to-mL",
    generate: () => {
      const litres = pickRandom([1, 2, 3, 4]);
      const mL = litres * 1000;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `This recipe needs ${litres} litres of ${ingredient}. I need to measure it in millilitres - how many is that?`,
        question: `${litres} L = ? mL`,
        answer: mL,
        unit: "mL",
        hint: `Each litre is 1000 millilitres. So ${litres} L = ${litres} × 1000 mL.`
      };
    }
  },
  // Simple addition with same units (g)
  {
    type: "add-grams",
    generate: () => {
      const g1 = pickRandom([200, 250, 300, 400, 500]);
      const g2 = pickRandom([100, 150, 200, 250, 300]);
      const total = g1 + g2;
      const ing1 = pickRandom(MASS_INGREDIENTS);
      const ing2 = pickRandom(MASS_INGREDIENTS.filter(i => i !== ing1));
      return {
        dialogue: `For this recipe, we need ${g1} grams of ${ing1} and ${g2} grams of ${ing2}. How many grams altogether?`,
        question: `${g1} g + ${g2} g = ? g`,
        answer: total,
        unit: "g",
        hint: `Add the two amounts together: ${g1} + ${g2} = ?`
      };
    }
  },
  // Simple addition with same units (mL)
  {
    type: "add-mL",
    generate: () => {
      const mL1 = pickRandom([200, 250, 300, 400, 500]);
      const mL2 = pickRandom([100, 150, 200, 250, 300]);
      const total = mL1 + mL2;
      const ing1 = pickRandom(CAPACITY_INGREDIENTS);
      const ing2 = pickRandom(CAPACITY_INGREDIENTS.filter(i => i !== ing1));
      return {
        dialogue: `I'm mixing ${mL1} millilitres of ${ing1} with ${mL2} millilitres of ${ing2}. How many millilitres in total?`,
        question: `${mL1} mL + ${mL2} mL = ? mL`,
        answer: total,
        unit: "mL",
        hint: `Add the two amounts: ${mL1} + ${mL2} = ?`
      };
    }
  },
  // Simple subtraction (how much left)
  {
    type: "subtract-mL",
    generate: () => {
      const total = pickRandom([1000, 1500, 2000]);
      const used = pickRandom([250, 300, 400, 500, 750]);
      const remaining = total - used;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `We have ${total} millilitres of ${ingredient}. If we use ${used} millilitres for this recipe, how much will be left?`,
        question: `${total} mL - ${used} mL = ? mL`,
        answer: remaining,
        unit: "mL",
        hint: `Subtract what we use from what we have: ${total} - ${used} = ?`
      };
    }
  },
  // Half/quarter conversions (kg)
  {
    type: "half-kg",
    generate: () => {
      const ingredient = pickRandom(MASS_INGREDIENTS);
      const scenarios = [
        { kg: 0.5, grams: 500, text: "half a kilogram" },
        { kg: 0.25, grams: 250, text: "a quarter of a kilogram" }
      ];
      const scenario = pickRandom(scenarios);
      return {
        dialogue: `The recipe asks for ${scenario.text} of ${ingredient}. How many grams is that?`,
        question: `${scenario.text} = ? g`,
        answer: scenario.grams,
        unit: "g",
        hint: `1 kilogram = 1000 grams. So ${scenario.text} = ${scenario.kg} × 1000 grams.`
      };
    }
  }
];

// Question templates for Chef Apprenticeship (Year 5-6 - harder)
const CHEF_APPRENTICE_TEMPLATES = [
  // Mixed unit conversions (e.g., 1.5 kg to g)
  {
    type: "decimal-kg-to-g",
    generate: () => {
      const kg = pickRandom([1.5, 2.5, 3.5, 1.25, 2.75]);
      const grams = kg * 1000;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `This big order needs ${kg} kilograms of ${ingredient}. How many grams should I weigh out?`,
        question: `${kg} kg = ? g`,
        answer: grams,
        unit: "g",
        hint: `Multiply by 1000: ${kg} × 1000 = ?`
      };
    }
  },
  // Mixed unit conversions (e.g., 1500 g to kg)
  {
    type: "g-to-decimal-kg",
    generate: () => {
      const grams = pickRandom([1500, 2500, 3500, 1250, 2750, 500, 750]);
      const kg = grams / 1000;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `I've weighed out ${grams} grams of ${ingredient}. How many kilograms is that?`,
        question: `${grams} g = ? kg`,
        answer: kg,
        unit: "kg",
        hint: `Divide by 1000: ${grams} ÷ 1000 = ?`
      };
    }
  },
  // Mixed unit conversions (e.g., 1.5 L to mL)
  {
    type: "decimal-L-to-mL",
    generate: () => {
      const litres = pickRandom([1.5, 2.5, 0.5, 0.75, 1.25]);
      const mL = litres * 1000;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `The soup recipe needs ${litres} litres of ${ingredient}. How many millilitres is that?`,
        question: `${litres} L = ? mL`,
        answer: mL,
        unit: "mL",
        hint: `Multiply by 1000: ${litres} × 1000 = ?`
      };
    }
  },
  // Comparing quantities
  {
    type: "compare-mass",
    generate: () => {
      const kg = pickRandom([1, 2, 3]);
      const grams = pickRandom([500, 750, 800, 900, 1100, 1200]);
      const kgInGrams = kg * 1000;
      const larger = kgInGrams > grams ? `${kg} kg` : `${grams} g`;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `I have two bags of ${ingredient}: one is ${kg} kg and another is ${grams} g. Which bag is heavier?`,
        question: `Which is more: ${kg} kg or ${grams} g?`,
        answer: larger,
        unit: "",
        isComparison: true,
        options: [`${kg} kg`, `${grams} g`, "They're equal"],
        hint: `Convert to the same unit first. ${kg} kg = ${kgInGrams} g. Now compare!`
      };
    }
  },
  // Recipe scaling (double)
  {
    type: "double-recipe",
    generate: () => {
      const original = pickRandom([250, 300, 400, 500, 750]);
      const doubled = original * 2;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `The recipe uses ${original} grams of ${ingredient}, but we need to make double the amount. How many grams do we need now?`,
        question: `${original} g × 2 = ? g`,
        answer: doubled,
        unit: "g",
        hint: `Double means multiply by 2: ${original} × 2 = ?`
      };
    }
  },
  // Recipe scaling (half)
  {
    type: "half-recipe",
    generate: () => {
      const original = pickRandom([400, 500, 600, 800, 1000]);
      const halved = original / 2;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `We only need half the recipe today. If it normally uses ${original} mL of ${ingredient}, how much do we need?`,
        question: `${original} mL ÷ 2 = ? mL`,
        answer: halved,
        unit: "mL",
        hint: `Half means divide by 2: ${original} ÷ 2 = ?`
      };
    }
  },
  // Adding different units (need to convert first)
  {
    type: "add-mixed-units",
    generate: () => {
      const kg = pickRandom([1, 2]);
      const grams = pickRandom([250, 500, 750]);
      const total = (kg * 1000) + grams;
      const ingredient = pickRandom(MASS_INGREDIENTS);
      return {
        dialogue: `I've got ${kg} kilogram${kg > 1 ? 's' : ''} of ${ingredient} here, plus another ${grams} grams. How many grams is that altogether?`,
        question: `${kg} kg + ${grams} g = ? g`,
        answer: total,
        unit: "g",
        hint: `First convert ${kg} kg to grams (${kg * 1000} g), then add ${grams}.`
      };
    }
  },
  // Subtraction with different units
  {
    type: "subtract-mixed-units",
    generate: () => {
      const litres = pickRandom([2, 3]);
      const usedML = pickRandom([250, 500, 750, 1000]);
      const remaining = (litres * 1000) - usedML;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `We started with ${litres} litres of ${ingredient} and used ${usedML} mL. How many millilitres are left?`,
        question: `${litres} L - ${usedML} mL = ? mL`,
        answer: remaining,
        unit: "mL",
        hint: `First convert ${litres} L to mL (${litres * 1000} mL), then subtract ${usedML}.`
      };
    }
  },
  // Triple recipe
  {
    type: "triple-recipe",
    generate: () => {
      const original = pickRandom([100, 150, 200, 250]);
      const tripled = original * 3;
      const ingredient = pickRandom(CAPACITY_INGREDIENTS);
      return {
        dialogue: `We're cooking for a party! The recipe uses ${original} mL of ${ingredient}, but we need to make triple the amount. How much do we need?`,
        question: `${original} mL × 3 = ? mL`,
        answer: tripled,
        unit: "mL",
        hint: `Triple means multiply by 3: ${original} × 3 = ?`
      };
    }
  },
  // Multi-step: total then convert
  {
    type: "total-and-convert",
    generate: () => {
      const g1 = pickRandom([400, 500, 600]);
      const g2 = pickRandom([400, 500, 600]);
      const totalGrams = g1 + g2;
      const totalKg = totalGrams / 1000;
      const ing1 = pickRandom(MASS_INGREDIENTS);
      const ing2 = pickRandom(MASS_INGREDIENTS.filter(i => i !== ing1));
      return {
        dialogue: `We need ${g1} g of ${ing1} and ${g2} g of ${ing2}. What's the total weight in kilograms?`,
        question: `(${g1} g + ${g2} g) = ? kg`,
        answer: totalKg,
        unit: "kg",
        hint: `First add: ${g1} + ${g2} = ${totalGrams} g. Then convert to kg: ${totalGrams} ÷ 1000 = ?`
      };
    }
  }
];

// Helper functions
function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function buildMeasurementOptions(correctAnswer, unit, isComparison = false, comparisonOptions = null) {
  if (isComparison && comparisonOptions) {
    // For comparison questions, use the provided options
    const shuffled = shuffleArray(comparisonOptions);
    const correctIndex = shuffled.indexOf(correctAnswer);
    return {
      options: shuffled.map((text, index) => ({
        id: String.fromCharCode(97 + index),
        text: text
      })),
      correctId: String.fromCharCode(97 + correctIndex)
    };
  }

  const options = new Set([correctAnswer]);

  // Generate plausible wrong answers
  const candidates = [];

  // Common mistakes for measurement conversions
  if (unit === "g" || unit === "mL") {
    candidates.push(
      correctAnswer / 10,      // Forgot to multiply by 1000, did 100 instead
      correctAnswer / 100,     // Only multiplied by 10
      correctAnswer * 10,      // Multiplied by 10000
      correctAnswer + 100,
      correctAnswer - 100,
      correctAnswer + 500,
      correctAnswer - 500,
      correctAnswer + 1000,
      correctAnswer - 1000,
      Math.round(correctAnswer * 1.5),
      Math.round(correctAnswer * 0.5)
    );
  } else if (unit === "kg" || unit === "L") {
    candidates.push(
      correctAnswer * 10,      // Didn't divide by 1000
      correctAnswer * 100,
      correctAnswer + 1,
      correctAnswer - 1,
      correctAnswer + 0.5,
      correctAnswer - 0.5,
      correctAnswer * 2,
      correctAnswer / 2,
      Math.round((correctAnswer + 0.25) * 100) / 100,
      Math.round((correctAnswer - 0.25) * 100) / 100
    );
  }

  // Add nearby values
  const step = correctAnswer < 100 ? 0.25 : (correctAnswer < 1000 ? 50 : 250);
  for (let i = 1; i <= 5; i++) {
    candidates.push(correctAnswer + (step * i));
    candidates.push(correctAnswer - (step * i));
  }

  // Filter and add candidates
  for (const value of candidates) {
    if (options.size >= 4) break;
    if (value > 0 && value !== correctAnswer && !options.has(value)) {
      // Round to reasonable precision
      const rounded = Number.isInteger(value) ? value : Math.round(value * 100) / 100;
      if (rounded > 0 && rounded !== correctAnswer) {
        options.add(rounded);
      }
    }
  }

  // Fill remaining slots if needed
  while (options.size < 4) {
    const multiplier = 1 + (Math.random() * 0.5 - 0.25);
    const candidate = Math.round(correctAnswer * multiplier * 100) / 100;
    if (candidate > 0 && candidate !== correctAnswer) {
      options.add(candidate);
    }
  }

  // Convert to array and shuffle
  const optionArray = Array.from(options);
  const shuffled = shuffleArray(optionArray);
  const correctIndex = shuffled.indexOf(correctAnswer);

  return {
    options: shuffled.map((value, index) => ({
      id: String.fromCharCode(97 + index),
      text: unit ? `${value} ${unit}` : String(value)
    })),
    correctId: String.fromCharCode(97 + correctIndex)
  };
}

/**
 * Generate a Kitchen Hand level question (Year 5 - easier)
 * Rewards: 1-3 gems
 */
export function makeKitchenHandPuzzle() {
  const template = pickRandom(KITCHEN_HAND_TEMPLATES);
  const data = template.generate();

  const { options, correctId } = buildMeasurementOptions(
    data.answer,
    data.unit,
    data.isComparison,
    data.options
  );

  const reward = pickRandom([1, 2, 2, 2, 3]); // Weighted towards 2

  return {
    type: "measurement",
    difficulty: "kitchen-hand",
    dialogue: data.dialogue,
    question: data.question,
    options,
    correctId,
    hintOnWrong: data.hint,
    reward
  };
}

/**
 * Generate a Chef Apprentice level question (Year 5-6 - harder)
 * Rewards: 2-4 gems
 */
export function makeChefApprenticePuzzle() {
  const template = pickRandom(CHEF_APPRENTICE_TEMPLATES);
  const data = template.generate();

  const { options, correctId } = buildMeasurementOptions(
    data.answer,
    data.unit,
    data.isComparison,
    data.options
  );

  const reward = pickRandom([2, 3, 3, 3, 4]); // Weighted towards 3

  return {
    type: "measurement",
    difficulty: "chef-apprentice",
    dialogue: data.dialogue,
    question: data.question,
    options,
    correctId,
    hintOnWrong: data.hint,
    reward
  };
}

// Position configuration for future levels
export const RESTAURANT_POSITIONS = {
  "kitchen-hand": {
    name: "Kitchen Hand",
    displayName: "Kitchen Hand",
    minReward: 1,
    maxReward: 3,
    generator: makeKitchenHandPuzzle,
    yearLevel: 5,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  "chef-apprentice": {
    name: "Chef Apprentice",
    displayName: "Chef Apprenticeship",
    minReward: 2,
    maxReward: 4,
    generator: makeChefApprenticePuzzle,
    yearLevel: 5.5,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  // Future positions (not yet implemented)
  "junior-chef": {
    name: "Junior Chef",
    displayName: "Junior Chef",
    minReward: 3,
    maxReward: 5,
    generator: null, // To be implemented
    yearLevel: 6,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  "qualified-chef": {
    name: "Qualified Chef",
    displayName: "Qualified Chef",
    minReward: 4,
    maxReward: 6,
    generator: null,
    yearLevel: 6.5,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  "senior-chef": {
    name: "Senior Chef",
    displayName: "Senior Chef",
    minReward: 5,
    maxReward: 7,
    generator: null,
    yearLevel: 7,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  "sous-chef": {
    name: "Sous Chef",
    displayName: "Sous Chef",
    minReward: 6,
    maxReward: 8,
    generator: null,
    yearLevel: 7,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  },
  "head-chef": {
    name: "Head Chef",
    displayName: "Head Chef",
    minReward: 7,
    maxReward: 10,
    generator: null,
    yearLevel: 7,
    questionsRequired: 10,
    correctRequired: 8,
    streakRequired: 3
  }
};

// Get position order for unlocking
export const POSITION_ORDER = [
  "kitchen-hand",
  "chef-apprentice",
  "junior-chef",
  "qualified-chef",
  "senior-chef",
  "sous-chef",
  "head-chef"
];

/**
 * Get the next position after the given one
 */
export function getNextPosition(currentPosition) {
  const index = POSITION_ORDER.indexOf(currentPosition);
  if (index === -1 || index >= POSITION_ORDER.length - 1) {
    return null;
  }
  return POSITION_ORDER[index + 1];
}

/**
 * Check if a position is implemented (has a generator)
 */
export function isPositionImplemented(positionId) {
  const position = RESTAURANT_POSITIONS[positionId];
  return position && typeof position.generator === 'function';
}
