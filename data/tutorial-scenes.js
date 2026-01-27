// data/tutorial-scenes.js
// All the tutorial dialogue, scenes, and flow defined here
// Easy to edit without touching the code!

export const tutorialScenes = {
  
  // ===================
  // SCENE 1: First Meeting
  // ===================
  "intro": {
    id: "intro",
    background: "assets/images/backgrounds/scene2.png",
    layout: "scene", // full scene with characters
    characters: [
      {
        id: "teddy",
        image: "assets/images/characters/Teddy/tutorial-teddy-hopeful.png",
        position: "left",
        size: "medium"
      },
      {
        id: "fairy",
        image: "assets/images/characters/Fairy/fairy-concern-down.png",
        position: "right-high", // on a rock, looking down
        size: "medium"
      }
    ],
    environmentElements: [
      {
        id: "rock",
        image: "assets/images/environmental-elements/tall-rock.png",
        position: "right-base"
      }
    ],
    dialogue: null, // No dialogue box yet, just the scene
    choices: [
      { text: "Are you okay?", next: "fairy-intro" },
      { text: "Have you lost something?", next: "fairy-intro" }
    ]
  },

  // ===================
  // SCENE 2: Fairy Explains (Close-up)
  // ===================
  "fairy-intro": {
    id: "fairy-intro",
    background: "assets/images/backgrounds/scene2.png",
    layout: "dialogue", // close-up character portrait with text
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-help-request.png",
      position: "left"
    },
    dialogue: "Oh! I'm so glad to see someone! One of the StudyPups has got stuck behind some pesky *pattern vines*! I need some help to clear them out, do you think you could help me?",
    choices: [
      { text: "Of course I'll help!", next: "vine-explain" },
      { text: "Sure... What are pattern vines?", next: "vine-explain-detailed" }
    ]
  },

  // ===================
  // SCENE 2b: Extra Explanation (optional path)
  // ===================
  "vine-explain-detailed": {
    id: "vine-explain-detailed",
    layout: "dialogue",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Pattern vines are magical plants that grow in Complexa Meadows. They love number patterns! The only way to clear them is to solve the pattern puzzles woven into their leaves.",
    choices: [
      { text: "Got it! Let's do this!", next: "vine-explain" }
    ]
  },

  // ===================
  // SCENE 3: Vine Tutorial Start
  // ===================
  "vine-explain": {
    id: "vine-explain",
    layout: "dialogue",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-thanks.png",
      position: "left"
    },
    dialogue: "Thanks so much! Let's get started. The only way to clear pattern vines is to solve the pattern problems on them. Let's do one together!",
    choices: [
      { text: "I'm ready!", next: "vine-puzzle-intro" }
    ]
  },

  // ===================
  // SCENE 4: First Vine (Guided)
  // ===================
  "vine-puzzle-intro": {
    id: "vine-puzzle-intro",
    layout: "puzzle", // Special layout for vine puzzles
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Have a look at these numbers. Can you see that each number is going up by 2 each time? Which number would come next in this pattern?",
    puzzle: {
      type: "pattern",
      question: "2, 4, 6, 8, ___",
      options: [
        { id: "a", text: "9" },
        { id: "b", text: "10" },
        { id: "c", text: "12" },
        { id: "d", text: "11" }
      ],
      correctId: "b",
      hintOnWrong: "Oh, these vines are pesky! Have a look again - the last number is 8. If you add 2, which number do you get?",
      onCorrect: "vine-puzzle-1-success"
    }
  },

  // ===================
  // SCENE 4b: First Vine Success
  // ===================
  "vine-puzzle-1-success": {
    id: "vine-puzzle-1-success",
    layout: "dialogue",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-wow.png",
      position: "left"
    },
    dialogue: "Yes! Amazing! We're already one vine down! Have a go at the next one and see if you can solve it on your own!",
    vineSnap: 1, // Snap vine #1
    choices: [
      { text: "Let's go!", next: "vine-puzzle-2" }
    ]
  },

  // ===================
  // SCENE 5: Second Vine
  // ===================
  "vine-puzzle-2": {
    id: "vine-puzzle-2",
    layout: "puzzle",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Here's the next one! What number comes next?",
    puzzle: {
      type: "pattern",
      question: "5, 10, 15, 20, ___",
      options: [
        { id: "a", text: "21" },
        { id: "b", text: "30" },
        { id: "c", text: "25" },
        { id: "d", text: "22" }
      ],
      correctId: "c",
      hintOnWrong: "Look at the pattern - how much is being added each time? Try counting the jumps between numbers!",
      onCorrect: "vine-puzzle-2-success"
    }
  },

  "vine-puzzle-2-success": {
    id: "vine-puzzle-2-success",
    layout: "dialogue",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-cute-reaction.png",
      position: "left"
    },
    dialogue: "Brilliant! You're a natural at this! Just one more vine to go!",
    vineSnap: 2,
    choices: [
      { text: "Almost there!", next: "vine-puzzle-3" }
    ]
  },

  // ===================
  // SCENE 6: Third Vine
  // ===================
  "vine-puzzle-3": {
    id: "vine-puzzle-3",
    layout: "puzzle",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Last one! You've got this!",
    puzzle: {
      type: "pattern",
      question: "3, 6, 9, 12, ___",
      options: [
        { id: "a", text: "13" },
        { id: "b", text: "14" },
        { id: "c", text: "15" },
        { id: "d", text: "18" }
      ],
      correctId: "c",
      hintOnWrong: "This pattern is counting by 3s. What's 12 + 3?",
      onCorrect: "vines-cleared"
    }
  },

  // ===================
  // SCENE 7: All Vines Cleared!
  // ===================
  "vines-cleared": {
    id: "vines-cleared",
    layout: "scene",
    characters: [
      {
        id: "teddy",
        image: "assets/images/characters/Teddy/teddy-jump-excited.png",
        position: "center-left",
        size: "medium"
      },
      {
        id: "fairy",
        image: "assets/images/characters/Fairy/fairy-wow.png",
        position: "center-right",
        size: "medium"
      }
    ],
    vineSnap: 3,
    dialogue: null,
    autoNext: "name-ask",
    autoNextDelay: 1500 // Show celebration for 1.5 seconds
  },

  // ===================
  // SCENE 8: Ask for Name
  // ===================
  "name-ask": {
    id: "name-ask",
    layout: "dialogue",
    speaker: {
      name: "???",
      image: "assets/images/characters/Fairy/fairy-thanks.png",
      position: "left"
    },
    dialogue: "You did it! The path is clear! Oh, I forgot to ask - what should I call you?",
    input: {
      type: "text",
      placeholder: "Enter your name...",
      saveAs: "playerName"
    },
    choices: [
      { text: "That's me!", next: "introductions", requiresInput: true }
    ]
  },

  // ===================
  // SCENE 9: Introductions
  // ===================
  "introductions": {
    id: "introductions",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-welcome.png",
      position: "left"
    },
    dialogue: "It's lovely to meet you, {playerName}! Let me introduce us - I'm Melody, and this is Teddy! Teddy is one of the StudyPups who lives here in Complexa Meadows.",
    choices: [
      { text: "Nice to meet you both!", next: "teddy-bark" }
    ]
  },

  // ===================
  // SCENE 10: Teddy Barks
  // ===================
  "teddy-bark": {
    id: "teddy-bark",
    layout: "scene",
    characters: [
      {
        id: "teddy",
        image: "assets/images/characters/Teddy/teddy-jump-excited.png",
        position: "center",
        size: "large",
        animation: "bounce"
      }
    ],
    soundEffect: "bark", // For later!
    dialogue: {
      text: "*Woof woof!*",
      style: "action" // Italicized/different style
    },
    autoNext: "teddy-wants-to-talk",
    autoNextDelay: 1000
  },

  // ===================
  // SCENE 11: Collar Gift Intro
  // ===================
  "teddy-wants-to-talk": {
    id: "teddy-wants-to-talk",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-cute-reaction.png",
      position: "left"
    },
    dialogue: "It sounds like Teddy wants to say thank you! Oh! I have just the thing...",
    choices: [
      { text: "What is it?", next: "collar-gift" }
    ]
  },

  // ===================
  // SCENE 12: Collar Gift
  // ===================
  "collar-gift": {
    id: "collar-gift",
    layout: "reward",
    rewardImage: "assets/images/ui/magical-collar.png", // You'll need to create this!
    rewardName: "Magical Gem Collar",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-grant-reward.png",
      position: "left"
    },
    dialogue: "As a special thank you from both of us, please take this magical gem collar!",
    choices: [
      { text: "Wow, thank you!", next: "collar-explain" }
    ]
  },

  // ===================
  // SCENE 13: Collar Explanation
  // ===================
  "collar-explain": {
    id: "collar-explain",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "With this magical gem, Teddy will be able to speak to you! He's excellent at solving math questions, so if you ever need help, just click on the gem and he'll give you a helpful hint.",
    choices: [
      { text: "That's amazing!", next: "collar-warning" }
    ]
  },

  // ===================
  // SCENE 14: Gem Warning
  // ===================
  "collar-warning": {
    id: "collar-warning",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Use it sparingly though! The gem can only hold enough power for a few hints at a time. But don't worry - it will recharge again over time. Why don't you try it now?",
    choices: [
      { text: "Let me try!", next: "gem-tutorial" }
    ]
  },

  // ===================
  // SCENE 15: Gem Tutorial (Interactive)
  // ===================
  "gem-tutorial": {
    id: "gem-tutorial",
    layout: "gem-demo",
    characters: [
      {
        id: "teddy",
        image: "assets/images/characters/Teddy/teddy-focus-up.png",
        position: "center",
        size: "large"
      }
    ],
    instruction: "Click on Teddy's gem to hear him speak!",
    onGemClick: "teddy-speaks"
  },

  // ===================
  // SCENE 16: Teddy Speaks!
  // ===================
  "teddy-speaks": {
    id: "teddy-speaks",
    layout: "dialogue",
    speaker: {
      name: "Teddy",
      image: "assets/images/characters/Teddy/teddy-tongue.png",
      position: "left"
    },
    dialogue: "Hello, {playerName}! Thank you SO much for rescuing me! I was stuck behind those vines for ages! I can't wait to go on adventures with you!",
    choices: [
      { text: "I can't wait either!", next: "shop-intro" }
    ]
  },

  // ===================
  // SCENE 17: Shop Introduction
  // ===================
  "shop-intro": {
    id: "shop-intro",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-welcome.png",
      position: "left"
    },
    dialogue: "I run the shop here in Complexa Meadows! I have heaps of items for sale - collars, toys, beds, and more! You should come by and visit!",
    choices: [
      { text: "I'd love to!", next: "currency-intro" }
    ]
  },

  // ===================
  // SCENE 18: Currency Introduction
  // ===================
  "currency-intro": {
    id: "currency-intro",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-neutral.png",
      position: "left"
    },
    dialogue: "Oh! But you're new here, aren't you? You'll need to earn some ✨glimmers✨ first! That's what we use as currency in Complexa Meadows.",
    choices: [
      { text: "How do I earn glimmers?", next: "farm-intro" }
    ]
  },

  // ===================
  // SCENE 19: Farm Introduction
  // ===================
  "farm-intro": {
    id: "farm-intro",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-thanks.png",
      position: "left"
    },
    dialogue: "Well, lucky for you, you've arrived just in time! Farmer Buttercup is looking for help with her magical bean harvest! Take Teddy with you and head over to her farm - she'll pay you in glimmers!",
    choices: [
      { text: "Sounds great!", next: "farm-directions" }
    ]
  },

  // ===================
  // SCENE 20: Final Directions
  // ===================
  "farm-directions": {
    id: "farm-directions",
    layout: "dialogue",
    speaker: {
      name: "Melody",
      image: "assets/images/characters/Fairy/fairy-welcome.png",
      position: "left"
    },
    dialogue: "Teddy will show you the way! And remember to come by the shop afterwards - I'll have some special items ready just for you!",
    choices: [
      { text: "Thanks, Melody!", next: "teddy-leads" }
    ]
  },

  // ===================
  // SCENE 21: Teddy Leads the Way
  // ===================
  "teddy-leads": {
    id: "teddy-leads",
    layout: "scene",
    characters: [
      {
        id: "teddy",
        image: "assets/images/characters/Teddy/teddy-run-forward.png",
        position: "center",
        size: "large",
        animation: "bounce"
      }
    ],
    dialogue: {
      speaker: "Teddy",
      text: "Follow me, {playerName}! Let's go to Buttercup's farm!",
      style: "speech"
    },
    choices: [
      { text: "🐕 Follow Teddy to Buttercup's Farm! →", next: "goto-farm", style: "primary-large" }
    ]
  },

  // ===================
  // SCENE 22: Transition to Farm
  // ===================
  "goto-farm": {
    id: "goto-farm",
    layout: "transition",
    transitionText: "Heading to Buttercup's Farm...",
    destination: "farm.html" // or patterns.html for now
  }
};

// Helper to get a scene by ID
export function getScene(sceneId) {
  return tutorialScenes[sceneId] || null;
}

// Starting scene
export const STARTING_SCENE = "intro";