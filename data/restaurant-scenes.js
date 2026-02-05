// data/restaurant-scenes.js
// Scene data for Riverside Restaurant location
// Math focus: Measurements & Conversions (NAPLAN Year 5-7)

import { makeKitchenHandPuzzle, makeChefApprenticePuzzle, RESTAURANT_POSITIONS, POSITION_ORDER, getNextPosition } from "../js/generators/measurements.js";

export const restaurantScenes = {

  // ===================
  // SCENE 1: Arrival at Restaurant
  // ===================
  "arrival": {
    id: "arrival",
    background: "assets/images/backgrounds/kitchen-background-scene.png",
    layout: "scene",

    characters: [
      {
        id: "zara",
        image: "assets/images/characters/Chef-Zara/zara-neutral.png",
        position: "stage-center",
        size: "large"
      }
    ],

    dialogue: null,
    choices: [
      { text: "Hello! Are you Chef Zara?", next: "zara-intro" }
    ]
  },

  // ===================
  // SCENE 2: Zara Introduces Herself
  // ===================
  "zara-intro": {
    id: "zara-intro",
    background: "assets/images/backgrounds/kitchen-background-scene.png",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Welcome to my kitchen, {playerName}! I'm Chef Zara, and I run the busiest restaurant on this side of the river. Melody told me you're looking for work!",
    choices: [
      { text: "Yes! I'd love to help!", next: "explain-positions" }
    ]
  },

  // ===================
  // SCENE 3: Explain the Position System
  // ===================
  "explain-positions": {
    id: "explain-positions",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "In my kitchen, everyone starts as a Kitchen Hand and works their way up. Prove yourself at each position, and you'll earn a qualification to move to the next level!",
    choices: [
      { text: "How do I prove myself?", next: "explain-qualification" }
    ]
  },

  // ===================
  // SCENE 4: Explain Qualification Requirements
  // ===================
  "explain-qualification": {
    id: "explain-qualification",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "You'll need to complete 10 kitchen tasks. Get at least 8 correct, and show me you can get 3 in a row right to prove you really understand. I'll pay you in glimmers for each task you complete correctly!",
    choices: [
      { text: "I'm ready to start!", next: "start-kitchen-hand" }
    ]
  },

  // ===================
  // KITCHEN HAND POSITION
  // ===================
  "start-kitchen-hand": {
    id: "start-kitchen-hand",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Wonderful! Let's start with the basics. As a Kitchen Hand, you'll help me measure ingredients. Knowing your grams, kilograms, millilitres and litres is essential in any kitchen!",
    choices: [
      { text: "Let's do it!", next: "kitchen-hand-puzzle" }
    ]
  },

  // Kitchen Hand puzzle loop
  "kitchen-hand-puzzle": {
    id: "kitchen-hand-puzzle",
    layout: "puzzle",
    positionId: "kitchen-hand",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    puzzle: () => {
      const puzzle = makeKitchenHandPuzzle();
      return {
        ...puzzle,
        onCorrect: "kitchen-hand-check-progress"
      };
    }
  },

  // Check progress after correct answer
  "kitchen-hand-check-progress": {
    id: "kitchen-hand-check-progress",
    layout: "progress-check",
    positionId: "kitchen-hand",
    onComplete: "kitchen-hand-qualified",
    onContinue: "kitchen-hand-puzzle"
  },

  // Kitchen Hand qualification earned!
  "kitchen-hand-qualified": {
    id: "kitchen-hand-qualified",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Outstanding work, {playerName}! You've proven yourself as a Kitchen Hand! Here's your official qualification certificate!",
    choices: [
      { text: "Thank you, Chef Zara!", next: "kitchen-hand-certificate" }
    ]
  },

  // Show certificate
  "kitchen-hand-certificate": {
    id: "kitchen-hand-certificate",
    layout: "certificate",
    positionId: "kitchen-hand",
    title: "Kitchen Hand Qualification",
    message: "This certifies that {playerName} has successfully completed all requirements to become a qualified Kitchen Hand at Riverside Restaurant.",
    nextScene: "position-choice-1"
  },

  // Choice after first qualification
  "position-choice-1": {
    id: "position-choice-1",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "You're now ready to begin your Chef Apprenticeship! But take your time - you can explore other places, spend your glimmers at the shop, or continue training right now. What would you like to do?",
    choices: [
      { text: "Continue to Chef Apprenticeship!", next: "start-chef-apprentice" },
      { text: "Visit Melody's Shop", next: "goto-shop" },
      { text: "Explore the Map", next: "open-map" }
    ]
  },

  // ===================
  // CHEF APPRENTICESHIP POSITION
  // ===================
  "start-chef-apprentice": {
    id: "start-chef-apprentice",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Now you're an Apprentice Chef! The measurements get a bit trickier here - you'll work with decimals, recipe scaling, and converting between units. Ready for the challenge?",
    choices: [
      { text: "I'm ready!", next: "chef-apprentice-puzzle" }
    ]
  },

  // Chef Apprentice puzzle loop
  "chef-apprentice-puzzle": {
    id: "chef-apprentice-puzzle",
    layout: "puzzle",
    positionId: "chef-apprentice",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    puzzle: () => {
      const puzzle = makeChefApprenticePuzzle();
      return {
        ...puzzle,
        onCorrect: "chef-apprentice-check-progress"
      };
    }
  },

  // Check progress after correct answer
  "chef-apprentice-check-progress": {
    id: "chef-apprentice-check-progress",
    layout: "progress-check",
    positionId: "chef-apprentice",
    onComplete: "chef-apprentice-qualified",
    onContinue: "chef-apprentice-puzzle"
  },

  // Chef Apprentice qualification earned!
  "chef-apprentice-qualified": {
    id: "chef-apprentice-qualified",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Incredible, {playerName}! You've completed your Chef Apprenticeship! You're really becoming a skilled chef!",
    choices: [
      { text: "Wow, thank you!", next: "chef-apprentice-certificate" }
    ]
  },

  // Show certificate
  "chef-apprentice-certificate": {
    id: "chef-apprentice-certificate",
    layout: "certificate",
    positionId: "chef-apprentice",
    title: "Chef Apprentice Qualification",
    message: "This certifies that {playerName} has successfully completed all requirements to become a qualified Chef Apprentice at Riverside Restaurant.",
    nextScene: "position-choice-2"
  },

  // Choice after second qualification
  "position-choice-2": {
    id: "position-choice-2",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "You're doing wonderfully! The Junior Chef position will be available soon. For now, you can practice what you've learned, visit the shop, or explore other places!",
    choices: [
      { text: "Practice Kitchen Hand again", next: "replay-kitchen-hand" },
      { text: "Practice Chef Apprentice again", next: "replay-chef-apprentice" },
      { text: "Visit Melody's Shop", next: "goto-shop" },
      { text: "Explore the Map", next: "open-map" }
    ]
  },

  // ===================
  // REPLAY / PRACTICE MODES
  // ===================
  "replay-kitchen-hand": {
    id: "replay-kitchen-hand",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Want to practice your Kitchen Hand skills? Great idea! Practice makes perfect. Let's see what you remember!",
    choices: [
      { text: "Let's practice!", next: "kitchen-hand-puzzle" }
    ]
  },

  "replay-chef-apprentice": {
    id: "replay-chef-apprentice",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Practicing your Apprentice skills? Excellent choice! The more you practice, the better chef you'll become!",
    choices: [
      { text: "Let's practice!", next: "chef-apprentice-puzzle" }
    ]
  },

  // ===================
  // POSITION SELECT (for returning players)
  // ===================
  "position-select": {
    id: "position-select",
    layout: "position-select",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "Welcome back, {playerName}! What would you like to work on today?"
  },

  // ===================
  // FUTURE POSITIONS (Coming Soon)
  // ===================
  "junior-chef-coming-soon": {
    id: "junior-chef-coming-soon",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "The Junior Chef position is coming soon! Keep practicing your skills, and you'll be ready when it opens!",
    choices: [
      { text: "I'll keep practicing!", next: "position-select" }
    ]
  },

  // ===================
  // TRANSITIONS
  // ===================
  "goto-shop": {
    id: "goto-shop",
    layout: "transition",
    transitionText: "Heading to Melody's Shop...",
    destination: "shop.html"
  },

  "open-map": {
    id: "open-map",
    layout: "open-menu"
  },

  // ===================
  // DAILY LIMIT REACHED
  // ===================
  "daily-limit-reached": {
    id: "daily-limit-reached",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "You've already earned your glimmers for this position today! You can still practice, but I can't pay you again until tomorrow. Want to practice anyway?",
    choices: [
      { text: "Yes, I want to practice!", next: "practice-mode" },
      { text: "I'll come back tomorrow", next: "position-select" }
    ]
  },

  "practice-mode": {
    id: "practice-mode",
    layout: "dialogue",
    speaker: {
      name: "Chef Zara",
      image: "assets/images/characters/Chef-Zara/zara-neutral.png",
      position: "left"
    },
    dialogue: "That's the spirit! Practice is the secret to becoming a great chef. Which position would you like to practice?",
    choices: [
      { text: "Kitchen Hand", next: "kitchen-hand-puzzle" },
      { text: "Chef Apprentice", next: "chef-apprentice-puzzle" }
    ]
  }
};

// Helper to get a scene by ID
export function getScene(sceneId) {
  return restaurantScenes[sceneId] || null;
}

// Starting scene for the restaurant
export const STARTING_SCENE = "arrival";

// Export position utilities for the game engine
export { RESTAURANT_POSITIONS, POSITION_ORDER, getNextPosition };
