import { makeFarmMultiplicationPuzzle } from "../js/generators/multiplication.js";
import { getDefaultPracticeTopics, getTopicById } from "../js/maths/topic-registry.js";

// data/farm-scenes.js
// Scene data for Buttercup's Farm location
// Math focus: Skip counting, multiplication, grouping (confidence builders!)

export const farmScenes = {
  
  
  // ===================
  // SCENE 1: Arrival at Farm
  // ===================
  "arrival": {
    id: "arrival",
    background: "assets/images/backgrounds/farm-scene.png",
    layout: "scene",
    
    characters: [
      {
        id: "buttercup",
        image: "assets/images/characters/FarmerButtercup/Buttercup-neutral.png",
        position: "stage-center",
        size: "large"
      }
    ],
    
    dialogue: null,
    choices: [
      { text: "Hello! Are you Farmer Buttercup?", next: "buttercup-intro" },
      { text: "🧠 Practice Maths (Year 5)", next: "practice-select" }
    ]
  },




  // ===================
  // SCENE 2: Buttercup Introduces Herself
  // ===================
  "buttercup-intro": {
    id: "buttercup-intro",
    background: "assets/images/backgrounds/farm-scene.png",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "Well howdy there, {playerName}! Melody told me you'd be coming! I'm Buttercup, and this here is my farm. Welcome!",
    choices: [
      { text: "Nice to meet you!", next: "explain-job" }
    ]
  },

  // ===================
  // SCENE 3: Explain the Job
  // ===================
  "explain-job": {
    id: "explain-job",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thinking.png",
      position: "left"
    },
    dialogue: "I could really use some help today! My sheep have wandered all over the paddock and I need to count them back into their pens. Think you and Teddy could help me out?",
    choices: [
      { text: "We'd love to help!", next: "great-news" },
      { text: "How do I count them?", next: "explain-counting" }
    ]
  },

  // ===================
  // SCENE 3b: Extra Explanation (optional)
  // ===================
  "explain-counting": {
    id: "explain-counting",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-neutral.png",
      position: "left"
    },
    dialogue: "It's easy! I'll tell you how many sheep go in each pen, and you help me work out the totals. Sometimes we count by 2s, sometimes by 5s - whatever's fastest! You'll get the hang of it!",
    choices: [
      { text: "Got it! Let's do this!", next: "great-news" }
    ]
  },

  // ===================
  // SCENE 4: Payment Info
  // ===================
  "great-news": {
    id: "great-news",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "Wonderful! And don't worry - I'll pay you in ✨glimmers✨ for your help! You can spend those at Melody's shop later.",
    choices: [
      { text: "Let's get started!", next: "first-task" }
    ]
  },

  // ===================
  // SCENE 5: First Task Introduction
  // ===================
  "first-task": {
    id: "first-task",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-neutral.png",
      position: "left"
    },
    dialogue: "Alright! Let's start with the first pen. I need you to help me count these sheep...",
    choices: [
      { text: "Ready!", next: "puzzle-1" }
    ]
  },

  // ===================
  // PUZZLE 1: Simple Skip Counting
  // ===================
  "puzzle-1": {
    id: "puzzle-1",
    layout: "puzzle",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thinking.png",
      position: "left"
    },
    
    puzzle: () => ({
  ...makeFarmMultiplicationPuzzle(),
  onCorrect: "puzzle-1-success"
}),

  },

  "puzzle-1-success": {
    id: "puzzle-1-success",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "That's right! 5 × 2 = 10 sheep! You're a natural at this! Here's 3 glimmers for your help! 💎💎💎",
    choices: [
      { text: "What's next?", next: "puzzle-2" }
    ]
  },

  // ===================
  // PUZZLE 2: Skip Counting by 5s
  // ===================
  "puzzle-2": {
    id: "puzzle-2",
    layout: "puzzle",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-neutral.png",
      position: "left"
    },
    dialogue: "Now for the bigger paddock! I've got 4 rows of vegetables, with 5 carrots in each row. How many carrots altogether?",
    puzzle: {
      type: "multiplication",
      question: "4 rows × 5 carrots = ?",
      options: [
        { id: "a", text: "9" },
        { id: "b", text: "15" },
        { id: "c", text: "20" },
        { id: "d", text: "25" }
      ],
      correctId: "c",
      hintOnWrong: "Count by 5s four times: 5, 10, 15... what comes next?",
      reward: 3,
      onCorrect: "puzzle-2-success"
    }
  },

  "puzzle-2-success": {
    id: "puzzle-2-success",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "Perfect! 4 × 5 = 20 carrots! You're getting really good at this! 💎💎💎",
    choices: [
      { text: "This is fun!", next: "puzzle-3" }
    ]
  },

  // ===================
  // PUZZLE 3: Counting by 10s
  // ===================
  "puzzle-3": {
    id: "puzzle-3",
    layout: "puzzle",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thinking.png",
      position: "left"
    },
    dialogue: "The chickens laid lots of eggs! I collected 3 baskets with 10 eggs in each. How many eggs do I have?",
    puzzle: {
      type: "multiplication",
      question: "3 baskets × 10 eggs = ?",
      options: [
        { id: "a", text: "13" },
        { id: "b", text: "30" },
        { id: "c", text: "31" },
        { id: "d", text: "40" }
      ],
      correctId: "b",
      hintOnWrong: "Counting by 10s is easy! 10, 20, 30... Count three times!",
      reward: 3,
      onCorrect: "puzzle-3-success"
    }
  },

  "puzzle-3-success": {
    id: "puzzle-3-success",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "Egg-cellent work! 3 × 10 = 30 eggs! 💎💎💎",
    choices: [
      { text: "Haha! Good one!", next: "puzzle-4" }
    ]
  },

  // ===================
  // PUZZLE 4: Slightly Harder
  // ===================
  "puzzle-4": {
    id: "puzzle-4",
    layout: "puzzle",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-neutral.png",
      position: "left"
    },
    dialogue: "Now let's check the apple orchard! I've got 6 trees with 5 apples each. How many apples can I pick?",
    puzzle: {
      type: "multiplication",
      question: "6 trees × 5 apples = ?",
      options: [
        { id: "a", text: "25" },
        { id: "b", text: "11" },
        { id: "c", text: "30" },
        { id: "d", text: "35" }
      ],
      correctId: "c",
      hintOnWrong: "Count by 5s six times: 5, 10, 15, 20, 25... one more!",
      reward: 4,
      onCorrect: "puzzle-4-success"
    }
  },

  "puzzle-4-success": {
    id: "puzzle-4-success",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "You're amazing! 6 × 5 = 30 apples! That's enough for a whole pie! 💎💎💎💎",
    choices: [
      { text: "One more?", next: "puzzle-5" }
    ]
  },

  // ===================
  // PUZZLE 5: Final Challenge
  // ===================
  "puzzle-5": {
    id: "puzzle-5",
    layout: "puzzle",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thinking.png",
      position: "left"
    },
    dialogue: "Last one! My prize pumpkins grow in 4 rows with 4 pumpkins in each row. How many pumpkins do I have for the fair?",
    puzzle: {
      type: "multiplication",
      question: "4 rows × 4 pumpkins = ?",
      options: [
        { id: "a", text: "8" },
        { id: "b", text: "12" },
        { id: "c", text: "16" },
        { id: "d", text: "20" }
      ],
      correctId: "c",
      hintOnWrong: "4 × 4 is a square number! Count 4 four times: 4, 8, 12...",
      reward: 5,
      onCorrect: "farm-complete"
    }
  },

  // ===================
  // COMPLETION SCENE
  // ===================
  "farm-complete": {
    id: "farm-complete",
    layout: "dialogue",
    speaker: {
      name: "Farmer Buttercup",
      image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
      position: "left"
    },
    dialogue: "WOW, {playerName}! You and Teddy did an incredible job today! Thank you SO much for all your help! You've earned lots of glimmers - make sure you visit Melody's shop!",
    choices: [
      { text: "Thanks, Farmer Buttercup!", next: "farm-end" }
    ]
  },

  // ===================
  // END SCENE
  // ===================
  "farm-end": {
    id: "farm-end",
    layout: "scene",
    characters: [
      {
        id: "buttercup",
        image: "assets/images/characters/FarmerButtercup/Buttercup-thanks.png",
        position: "stage-center",
        size: "large"
      }
    ],
    dialogue: {
      speaker: "Farmer Buttercup",
      text: "Come back anytime! There's always more work on the farm! 🌻",
      style: "speech"
    },
    choices: [
      { text: "🛒 Visit Melody's Shop", next: "goto-shop", style: "primary-large" }
    ]
  },

  // ===================
  // TRANSITION: To Melody's Shop
  // ===================
  "goto-shop": {
    id: "goto-shop",
    layout: "transition",
    transitionText: "Heading to Melody's Shop...",
    destination: "shop.html"
  },

  // ===================
  // PRACTICE MODE: Topic Selection
  // ===================
  "practice-select": {
    id: "practice-select",
    layout: "practice-select",
    dialogue: "Pick something to practise! We can do as many as you want. 🐾",
    practiceTopics: () => getDefaultPracticeTopics().map((topic) => ({
      id: topic.id,
      name: topic.displayName
    })),
    nextSceneAfterPick: "practice-topic-start"
  },

  // ===================
  // PRACTICE MODE: Topic Start
  // ===================
  "practice-topic-start": {
    id: "practice-topic-start",
    layout: "practice-topic-start"
  },

  // ===================
  // PRACTICE MODE: Topic Intro
  // ===================
  "practice-intro": {
    id: "practice-intro",
    layout: "practice-intro"
  },

  // ===================
  // PRACTICE MODE: Puzzle Loop
  // ===================
  "practice-loop": {
    id: "practice-loop",
    layout: "puzzle",
    speaker: {
      name: "Teddy",
      image: "assets/images/characters/Teddy/teddy-wait.png",
      position: "left"
    },
    puzzle: () => {
      const topicId = window.__studypupsPracticeTopicId;
      const topic = getTopicById(topicId);
      const generated = topic?.generate?.();

      if (!generated) {
        return {
          type: "topic",
          topicId: "fallback",
          question: "Pick a topic to get started!",
          options: [{ id: "a", text: "Okay!" }],
          correctId: "a",
          reward: 0,
          onCorrect: "practice-select"
        };
      }

      return {
        ...generated,
        onCorrect: "practice-correct"
      };
    }
  },

  // ===================
  // PRACTICE MODE: Results
  // ===================
  "practice-results": {
    id: "practice-results",
    layout: "practice-results",
    speaker: {
      name: "Teddy",
      image: "assets/images/characters/Teddy/teddy-tongue.png",
      position: "left"
    }
  },

  // ===================
  // PRACTICE MODE: Success
  // ===================
  "practice-correct": {
    id: "practice-correct",
    layout: "dialogue",
    speaker: {
      name: "Teddy",
      image: "assets/images/characters/Teddy/teddy-tongue.png",
      position: "left"
    },
    dialogue: "Nice work! Want another one?",
    choices: [
      { text: "Another one!", next: "practice-loop" },
      { text: "Pick a different topic", next: "practice-select" },
      { text: "Back to the farm story", next: "arrival" }
    ]
  }
};

// Helper to get a scene by ID
export function getScene(sceneId) {
  return farmScenes[sceneId] || null;
}

// Starting scene for the farm
export const STARTING_SCENE = "arrival";
