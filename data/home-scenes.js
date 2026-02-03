// data/home-scenes.js
// Data definitions for the Home scene
// Contains: Wall/floor styles, placement zones, free items, preset messages, etc.

// ============================================================
// PLACEMENT ZONES
// Items can only be placed in compatible zones
// ============================================================

export const PLACEMENT_ZONES = {
  floor: {
    id: "floor",
    name: "Floor",
    description: "Items that sit on the floor",
    allowedTypes: ["rug", "furniture", "pet-bed", "floor-decor", "plant-floor"]
  },
  wall: {
    id: "wall",
    name: "Back Wall",
    description: "Items that hang on the wall",
    allowedTypes: ["poster", "frame", "window", "shelf", "wall-decor", "lights"]
  },
  "side-wall": {
    id: "side-wall",
    name: "Side Wall",
    description: "Items for the side wall (door, tall items)",
    allowedTypes: ["door", "tall-furniture", "side-decor"]
  },
  surface: {
    id: "surface",
    name: "On Surface",
    description: "Items that go on top of furniture",
    allowedTypes: ["lamp", "plant-small", "decoration", "photo"]
  }
};

// ============================================================
// WALL STYLES
// Players can customize the back wall appearance
// ============================================================

export const WALL_STYLES = {
  "wall-default": {
    id: "wall-default",
    name: "Cozy Cream",
    icon: "🏠",
    color: "#f5f0e8",
    gradient: "linear-gradient(180deg, #f5f0e8 0%, #e8e0d5 100%)",
    free: true
  },
  "wall-pink": {
    id: "wall-pink",
    name: "Rosy Pink",
    icon: "🌸",
    color: "#fce4ec",
    gradient: "linear-gradient(180deg, #fce4ec 0%, #f8bbd9 100%)",
    free: true
  },
  "wall-blue": {
    id: "wall-blue",
    name: "Sky Blue",
    icon: "☁️",
    color: "#e3f2fd",
    gradient: "linear-gradient(180deg, #e3f2fd 0%, #bbdefb 100%)",
    free: true
  },
  "wall-green": {
    id: "wall-green",
    name: "Meadow Green",
    icon: "🌿",
    color: "#e8f5e9",
    gradient: "linear-gradient(180deg, #e8f5e9 0%, #c8e6c9 100%)",
    free: true
  },
  "wall-purple": {
    id: "wall-purple",
    name: "Lavender Dreams",
    icon: "💜",
    color: "#ede7f6",
    gradient: "linear-gradient(180deg, #ede7f6 0%, #d1c4e9 100%)",
    free: true
  },
  "wall-yellow": {
    id: "wall-yellow",
    name: "Sunny Yellow",
    icon: "☀️",
    color: "#fff9c4",
    gradient: "linear-gradient(180deg, #fff9c4 0%, #fff59d 100%)",
    free: true
  },
  "wall-stripes": {
    id: "wall-stripes",
    name: "Candy Stripes",
    icon: "🍬",
    pattern: "repeating-linear-gradient(90deg, #fff 0px, #fff 20px, #fce4ec 20px, #fce4ec 40px)",
    unlockCondition: { glimmers: 50 }
  },
  "wall-stars": {
    id: "wall-stars",
    name: "Starry Night",
    icon: "⭐",
    color: "#1a237e",
    gradient: "linear-gradient(180deg, #1a237e 0%, #283593 100%)",
    overlay: "stars",
    unlockCondition: { glimmers: 100 }
  }
};

// ============================================================
// FLOOR STYLES
// Players can customize the floor appearance
// ============================================================

export const FLOOR_STYLES = {
  "floor-default": {
    id: "floor-default",
    name: "Wooden Boards",
    icon: "🪵",
    color: "#d7b98e",
    gradient: "linear-gradient(90deg, #d7b98e 0%, #c4a676 50%, #d7b98e 100%)",
    pattern: "wood",
    free: true
  },
  "floor-tile": {
    id: "floor-tile",
    name: "Checkered Tiles",
    icon: "🔲",
    pattern: "repeating-conic-gradient(#fff 0% 25%, #e0e0e0 0% 50%) 50% / 40px 40px",
    free: true
  },
  "floor-carpet": {
    id: "floor-carpet",
    name: "Soft Carpet",
    icon: "🟣",
    color: "#9575cd",
    gradient: "linear-gradient(135deg, #9575cd 0%, #7e57c2 100%)",
    free: true
  },
  "floor-grass": {
    id: "floor-grass",
    name: "Indoor Garden",
    icon: "🌱",
    color: "#81c784",
    gradient: "linear-gradient(135deg, #81c784 0%, #66bb6a 100%)",
    free: true
  },
  "floor-cloud": {
    id: "floor-cloud",
    name: "Fluffy Clouds",
    icon: "☁️",
    color: "#e1f5fe",
    gradient: "radial-gradient(ellipse at 30% 50%, #fff 0%, #e1f5fe 70%)",
    unlockCondition: { glimmers: 75 }
  }
};

// ============================================================
// FREE STARTER ITEMS
// Items that come with the home for free
// ============================================================

export const FREE_STARTER_ITEMS = [
  {
    id: "starter-rug",
    name: "Welcome Rug",
    icon: "🟫",
    type: "rug",
    zone: "floor",
    description: "A simple but cozy rug to start with!",
    size: { width: 120, height: 80 },
    defaultPosition: { x: 50, y: 70 } // percentage
  },
  {
    id: "starter-window",
    name: "Simple Window",
    icon: "🪟",
    type: "window",
    zone: "wall",
    description: "Let the sunshine in!",
    size: { width: 80, height: 100 },
    defaultPosition: { x: 50, y: 30 }
  },
  {
    id: "starter-door",
    name: "Home Door",
    icon: "🚪",
    type: "door",
    zone: "side-wall",
    description: "The entrance to your cozy home!",
    size: { width: 60, height: 120 },
    defaultPosition: { x: 15, y: 50 }
  },
  {
    id: "starter-bed",
    name: "Basic Pup Bed",
    icon: "🛏️",
    type: "pet-bed",
    zone: "floor",
    description: "A comfy spot for your pups to rest!",
    size: { width: 80, height: 60 },
    defaultPosition: { x: 75, y: 75 }
  }
];

// ============================================================
// HOME ITEMS (extends shop items with placement info)
// Maps shop item IDs to home placement properties
// ============================================================

export const HOME_ITEM_PROPERTIES = {
  // Decorations from shop
  "decor-plant": {
    type: "plant-floor",
    zone: "floor",
    size: { width: 40, height: 60 },
    hint: "A cheerful plant to brighten the room!"
  },
  "decor-flowers": {
    type: "decoration",
    zone: "surface",
    size: { width: 30, height: 40 },
    hint: "Pretty flowers for your table!"
  },
  "decor-rug-rainbow": {
    type: "rug",
    zone: "floor",
    size: { width: 140, height: 100 },
    hint: "A colorful rug for pup naps!"
  },
  "decor-poster-stars": {
    type: "poster",
    zone: "wall",
    size: { width: 60, height: 80 },
    hint: "Reach for the stars!"
  },
  "decor-lamp-moon": {
    type: "lamp",
    zone: "surface",
    size: { width: 30, height: 50 },
    hint: "Gives a soft magical glow at night!"
  },
  "decor-bookshelf": {
    type: "furniture",
    zone: "floor",
    size: { width: 80, height: 120 },
    hint: "Fill it with adventure stories!",
    hasSurface: true // Items can be placed on top
  },
  "decor-bed-cozy": {
    type: "pet-bed",
    zone: "floor",
    size: { width: 90, height: 70 },
    hint: "The coziest bed for tired pups!",
    forPups: ["all"]
  },
  "decor-fairy-lights": {
    type: "lights",
    zone: "wall",
    size: { width: 200, height: 30 },
    hint: "Magical twinkling lights!"
  },
  "decor-frame-gold": {
    type: "frame",
    zone: "wall",
    size: { width: 50, height: 60 },
    hint: "Display your favorite memory!"
  }
};

// ============================================================
// STUDYPUPS DATA
// Information about each pup for the home scene
// ============================================================

export const STUDYPUPS = {
  teddy: {
    id: "teddy",
    name: "Teddy",
    sprite: "assets/images/characters/Teddy/teddy-sit.png",
    walkSprite: "assets/images/characters/Teddy/teddy-walk.png",
    happySprite: "assets/images/characters/Teddy/teddy-happy.png",
    sleepSprite: "assets/images/characters/Teddy/teddy-sleep.png",
    color: "#8B4513",
    personality: "friendly",
    favoriteSpot: "near-bed",
    walkSpeed: 2,
    idleAnimations: ["sniff", "wag", "sit", "stretch"]
  }
  // More pups will be added here as they're created
};

// ============================================================
// FEEDING SYSTEM
// ============================================================

export const FEEDING_CONFIG = {
  // Food depletes once per real-world day
  depletionIntervalHours: 24,

  // Warning thresholds (percentage)
  warningThreshold: 30,
  criticalThreshold: 10,

  // Pup escape after X days without food
  escapeAfterDays: 3,

  // Bowl capacities
  foodBowlMax: 100,
  waterBowlMax: 100,

  // Refill amounts (when clicking bowl)
  foodRefillAmount: 100,
  waterRefillAmount: 100,

  // Free refills per day
  freeRefillsPerDay: 2
};

export const FEEDING_MESSAGES = {
  bowlsFull: [
    "Yum! The bowls are full! 🐕",
    "Thanks for keeping my food fresh!",
    "I love meal time! 🦴"
  ],
  foodLow: [
    "My tummy's getting rumbly... 🐕",
    "Is it dinner time yet?",
    "I could use a snack!"
  ],
  foodEmpty: [
    "I'm really hungry! Please fill my bowl! 🥺",
    "*sad puppy eyes* The bowl is empty...",
    "Woof! I need food!"
  ],
  waterLow: [
    "Getting a little thirsty over here!",
    "Could use some fresh water! 💧"
  ],
  treatGiven: [
    "YUM! Best treat ever! 🦴✨",
    "*happy tail wags* Thank you!",
    "You're the best human! 🐕💕"
  ]
};

// ============================================================
// PRESET MESSAGES FOR LETTERBOX
// ============================================================

export const PRESET_MESSAGES = [
  {
    id: "msg-great-job",
    text: "Great job on your puzzles! 🌟",
    icon: "⭐",
    category: "encouragement"
  },
  {
    id: "msg-love-home",
    text: "I love your home decorations! 🏠",
    icon: "🏠",
    category: "compliment"
  },
  {
    id: "msg-cute-pup",
    text: "Your StudyPup is so cute! 🐕",
    icon: "🐕",
    category: "compliment"
  },
  {
    id: "msg-keep-going",
    text: "Keep going, you're doing amazing! 💪",
    icon: "💪",
    category: "encouragement"
  },
  {
    id: "msg-hi-friend",
    text: "Hi friend! Hope you're having fun! 👋",
    icon: "👋",
    category: "greeting"
  },
  {
    id: "msg-math-star",
    text: "You're a math superstar! ✨",
    icon: "🧮",
    category: "encouragement"
  },
  {
    id: "msg-thanks",
    text: "Thanks for being a great neighbor! 🏘️",
    icon: "🙏",
    category: "gratitude"
  },
  {
    id: "msg-miss-you",
    text: "Come back and play soon! 🎮",
    icon: "🎮",
    category: "greeting"
  }
];

// Default banned words (teacher can add more)
export const DEFAULT_BANNED_WORDS = [
  // Basic profanity and mean words - keeping it simple for kids
  "stupid", "dumb", "idiot", "hate", "ugly", "loser", "shut up"
];

// ============================================================
// TEDDY TUTORIAL DIALOGUES
// ============================================================

export const HOME_TUTORIAL = {
  steps: [
    {
      id: "welcome",
      text: "Welcome to your new home! 🏠 This is where you and your StudyPups can relax and have fun!",
      highlight: null,
      teddyPose: "happy"
    },
    {
      id: "decorating",
      text: "Click the 'Decorate' button to customize your room! You can change the walls, floor, and add furniture!",
      highlight: "#modeToggleBtn",
      teddyPose: "point"
    },
    {
      id: "feeding",
      text: "Don't forget to keep my food and water bowls full! I get hungry every day! 🍽️",
      highlight: "#feedingStation",
      teddyPose: "hungry"
    },
    {
      id: "visiting",
      text: "You can visit your friends' homes and leave nice messages in their letterbox! 📬",
      highlight: "#socialBtn",
      teddyPose: "excited"
    },
    {
      id: "done",
      text: "That's it! Have fun decorating and playing with me! Woof! 🐕",
      highlight: null,
      teddyPose: "celebrate"
    }
  ]
};

// ============================================================
// TEDDY RANDOM DIALOGUES (when clicked)
// ============================================================

export const TEDDY_HOME_DIALOGUES = [
  { text: "I love our home! It's so cozy! 🏠", pose: "happy" },
  { text: "Want to redecorate? I like the rainbow rug best!", pose: "excited" },
  { text: "Thanks for taking such good care of me! 💕", pose: "love" },
  { text: "Did you know I can learn tricks? Coming soon!", pose: "curious" },
  { text: "*happy tail wags* You're my favorite human!", pose: "wag" },
  { text: "I wonder what our friends are doing... Let's visit!", pose: "curious" },
  { text: "Solving puzzles makes me hungry! 🦴", pose: "hungry" },
  { text: "This is the best home ever!", pose: "celebrate" }
];

// ============================================================
// ITEM HOVER HINTS
// ============================================================

export const ITEM_HINTS = {
  "food-bowl": "Click to refill! Pups need food every day.",
  "water-bowl": "Click to refill! Fresh water keeps pups happy.",
  "starter-rug": "Drag me to move! Pups love to nap here.",
  "starter-window": "Let the sunshine in! Drag to reposition.",
  "starter-door": "The way in and out! Can be customized later.",
  "starter-bed": "A cozy spot for pups to rest after adventures!",
  default: "Click to move or drag to reposition!"
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get wall style by ID
 */
export function getWallStyle(wallId) {
  return WALL_STYLES[wallId] || WALL_STYLES["wall-default"];
}

/**
 * Get floor style by ID
 */
export function getFloorStyle(floorId) {
  return FLOOR_STYLES[floorId] || FLOOR_STYLES["floor-default"];
}

/**
 * Get all available wall styles (optionally filter by unlocked)
 */
export function getAvailableWalls(unlockedIds = []) {
  return Object.values(WALL_STYLES).filter(wall =>
    wall.free || unlockedIds.includes(wall.id)
  );
}

/**
 * Get all available floor styles (optionally filter by unlocked)
 */
export function getAvailableFloors(unlockedIds = []) {
  return Object.values(FLOOR_STYLES).filter(floor =>
    floor.free || unlockedIds.includes(floor.id)
  );
}

/**
 * Check if an item can be placed in a zone
 */
export function canPlaceInZone(itemType, zoneId) {
  const zone = PLACEMENT_ZONES[zoneId];
  if (!zone) return false;
  return zone.allowedTypes.includes(itemType);
}

/**
 * Get item properties for home placement
 */
export function getHomeItemProperties(itemId) {
  return HOME_ITEM_PROPERTIES[itemId] || null;
}

/**
 * Get a random feeding message
 */
export function getFeedingMessage(type) {
  const messages = FEEDING_MESSAGES[type];
  if (!messages || messages.length === 0) return "";
  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Get a random Teddy home dialogue
 */
export function getRandomTeddyDialogue() {
  return TEDDY_HOME_DIALOGUES[Math.floor(Math.random() * TEDDY_HOME_DIALOGUES.length)];
}

/**
 * Get hint for an item
 */
export function getItemHint(itemId) {
  return ITEM_HINTS[itemId] || ITEM_HINTS.default;
}

/**
 * Get StudyPup data
 */
export function getStudyPup(pupId) {
  return STUDYPUPS[pupId] || null;
}

/**
 * Filter messages for banned words
 */
export function containsBannedWords(text, additionalBanned = []) {
  const allBanned = [...DEFAULT_BANNED_WORDS, ...additionalBanned];
  const lowerText = text.toLowerCase();
  return allBanned.some(word => lowerText.includes(word.toLowerCase()));
}

/**
 * Get preset messages by category
 */
export function getPresetsByCategory(category = null) {
  if (!category) return PRESET_MESSAGES;
  return PRESET_MESSAGES.filter(msg => msg.category === category);
}

/**
 * Create default home state for a new player
 */
export function createDefaultHomeState() {
  return {
    // Interior design
    wallStyle: "wall-default",
    floorStyle: "floor-default",
    unlockedWalls: [],
    unlockedFloors: [],

    // Placed items (position in percentage of room)
    placedItems: FREE_STARTER_ITEMS.map(item => ({
      itemId: item.id,
      instanceId: `${item.id}-default`,
      position: { ...item.defaultPosition },
      zone: item.zone
    })),

    // Feeding state
    feeding: {
      foodLevel: 100,
      waterLevel: 100,
      lastFedAt: new Date().toISOString(),
      lastWateredAt: new Date().toISOString(),
      freeRefillsUsedToday: 0,
      lastRefillResetDate: new Date().toISOString().split('T')[0]
    },

    // Pup states
    pups: {
      teddy: {
        happiness: 100,
        energy: 100,
        isHome: true,
        lastPetAt: null,
        position: { x: 60, y: 65 }
      }
    },

    // Social
    receivedLikes: 0,
    receivedMessages: [],
    sentMessages: [],
    memoryBook: [],

    // Tracking
    firstVisit: true,
    tutorialComplete: false,
    lastVisitedAt: new Date().toISOString()
  };
}
