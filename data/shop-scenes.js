// data/shop-scenes.js
// Shop data for Melody's Shop location
// Contains: Item catalog, categories, Melody dialogues, job listings

// ============================================================
// ITEM CATEGORIES
// ============================================================

export const CATEGORIES = [
  { id: "all", name: "View All", icon: "🏪", description: "Browse everything!" },
  { id: "accessories", name: "Accessories", icon: "🎀", description: "Dress up your StudyPups!" },
  { id: "food", name: "Food & Treats", icon: "🦴", description: "Yummy snacks for your pups!" },
  { id: "decorations", name: "Decorations", icon: "🖼️", description: "Make your home beautiful!" },
  { id: "stationery", name: "Stationery", icon: "✉️", description: "Send letters to friends!" }
];

// ============================================================
// SHOP ITEMS CATALOG
// ============================================================
// Pricing Guide (based on farm rewards of 2-5 glimmers per puzzle):
// - Small items: 3-8 glimmers (1-3 puzzles)
// - Medium items: 10-20 glimmers (4-8 puzzles)
// - Large items: 25-50 glimmers (10-20 puzzles)
// - Premium items: 50+ glimmers (special savings goal)

export const SHOP_ITEMS = {
  // ============================================================
  // ACCESSORIES - For StudyPups
  // ============================================================

  // Collars (gifted for free when unlocking a new StudyPup)
  "collar-magic": {
    id: "collar-magic",
    name: "Magic Collar",
    category: "accessories",
    description: "A shimmering collar that glows with helpful magic! (Gift from Melody)",
    price: { glimmers: 0 },
    icon: "✨",
    image: null, // placeholder
    forPups: ["teddy"],
    isGift: true, // Cannot be purchased, only gifted
    giftCondition: "tutorial-complete"
  },

  "collar-red": {
    id: "collar-red",
    name: "Ruby Red Collar",
    category: "accessories",
    description: "A bold red collar that makes any pup look confident!",
    price: { glimmers: 8 },
    icon: "🔴",
    image: null,
    forPups: ["all"]
  },

  "collar-blue": {
    id: "collar-blue",
    name: "Ocean Blue Collar",
    category: "accessories",
    description: "Cool as the sea, perfect for adventurous pups!",
    price: { glimmers: 8 },
    icon: "🔵",
    image: null,
    forPups: ["all"]
  },

  "collar-rainbow": {
    id: "collar-rainbow",
    name: "Rainbow Collar",
    category: "accessories",
    description: "All the colors of the rainbow! So cheerful!",
    price: { glimmers: 15 },
    icon: "🌈",
    image: null,
    forPups: ["all"]
  },

  // Hats
  "hat-wizard": {
    id: "hat-wizard",
    name: "Wizard Hat",
    category: "accessories",
    description: "A sparkly wizard hat covered in stars and moons!",
    price: { glimmers: 12 },
    icon: "🧙",
    image: null,
    forPups: ["all"]
  },

  "hat-flower": {
    id: "hat-flower",
    name: "Flower Crown",
    category: "accessories",
    description: "A delicate crown made of fresh meadow flowers!",
    price: { glimmers: 10 },
    icon: "💐",
    image: null,
    forPups: ["all"]
  },

  "hat-party": {
    id: "hat-party",
    name: "Party Hat",
    category: "accessories",
    description: "It's always a celebration with this festive hat!",
    price: { glimmers: 6 },
    icon: "🎉",
    image: null,
    forPups: ["all"]
  },

  // Bows & Accessories
  "bow-pink": {
    id: "bow-pink",
    name: "Pink Bow",
    category: "accessories",
    description: "A pretty pink bow, perfect for photos!",
    price: { glimmers: 5 },
    icon: "🎀",
    image: null,
    forPups: ["all"]
  },

  "bow-sparkle": {
    id: "bow-sparkle",
    name: "Sparkle Bow",
    category: "accessories",
    description: "This bow literally sparkles! How magical!",
    price: { glimmers: 12 },
    icon: "💫",
    image: null,
    forPups: ["all"]
  },

  "bandana-adventure": {
    id: "bandana-adventure",
    name: "Adventure Bandana",
    category: "accessories",
    description: "For brave explorers on big adventures!",
    price: { glimmers: 7 },
    icon: "🏴",
    image: null,
    forPups: ["all"]
  },

  "glasses-cool": {
    id: "glasses-cool",
    name: "Cool Sunglasses",
    category: "accessories",
    description: "Looking cool is serious business! 😎",
    price: { glimmers: 8 },
    icon: "🕶️",
    image: null,
    forPups: ["all"]
  },

  // ============================================================
  // FOOD & TREATS - For feeding StudyPups
  // ============================================================

  "treat-biscuit": {
    id: "treat-biscuit",
    name: "Pup Biscuit",
    category: "food",
    description: "A crunchy biscuit shaped like a bone! Yum!",
    price: { glimmers: 3 },
    icon: "🦴",
    image: null,
    forPups: ["all"],
    effect: "happiness+1"
  },

  "treat-cookie": {
    id: "treat-cookie",
    name: "Magic Cookie",
    category: "food",
    description: "A cookie sprinkled with fairy dust!",
    price: { glimmers: 5 },
    icon: "🍪",
    image: null,
    forPups: ["all"],
    effect: "happiness+2"
  },

  "treat-cake": {
    id: "treat-cake",
    name: "Pup-cake",
    category: "food",
    description: "A mini cupcake made specially for pups!",
    price: { glimmers: 8 },
    icon: "🧁",
    image: null,
    forPups: ["all"],
    effect: "happiness+3"
  },

  "food-kibble": {
    id: "food-kibble",
    name: "Premium Kibble",
    category: "food",
    description: "Nutritious and delicious! A pup's favorite meal.",
    price: { glimmers: 4 },
    icon: "🥣",
    image: null,
    forPups: ["all"],
    effect: "energy+2"
  },

  "food-steak": {
    id: "food-steak",
    name: "Fancy Steak",
    category: "food",
    description: "A special dinner for a very good pup!",
    price: { glimmers: 15 },
    icon: "🥩",
    image: null,
    forPups: ["all"],
    effect: "energy+5, happiness+3"
  },

  "drink-water": {
    id: "drink-water",
    name: "Fresh Spring Water",
    category: "food",
    description: "Crystal clear water from the meadow springs!",
    price: { glimmers: 2 },
    icon: "💧",
    image: null,
    forPups: ["all"],
    effect: "energy+1"
  },

  "treat-icecream": {
    id: "treat-icecream",
    name: "Pup Ice Cream",
    category: "food",
    description: "A frozen treat made safe for pups! Brain freeze alert!",
    price: { glimmers: 6 },
    icon: "🍦",
    image: null,
    forPups: ["all"],
    effect: "happiness+2"
  },

  // ============================================================
  // DECORATIONS - For Home
  // ============================================================

  "decor-plant": {
    id: "decor-plant",
    name: "Potted Plant",
    category: "decorations",
    description: "A cheerful little plant to brighten any room!",
    price: { glimmers: 6 },
    icon: "🪴",
    image: null,
    placement: "floor"
  },

  "decor-flowers": {
    id: "decor-flowers",
    name: "Flower Vase",
    category: "decorations",
    description: "Fresh flowers picked from Complexa Meadows!",
    price: { glimmers: 8 },
    icon: "💐",
    image: null,
    placement: "table"
  },

  "decor-rug-rainbow": {
    id: "decor-rug-rainbow",
    name: "Rainbow Rug",
    category: "decorations",
    description: "A soft, colorful rug - perfect for pup naps!",
    price: { glimmers: 20 },
    icon: "🌈",
    image: null,
    placement: "floor"
  },

  "decor-poster-stars": {
    id: "decor-poster-stars",
    name: "Starry Poster",
    category: "decorations",
    description: "A poster of the night sky, full of wonder!",
    price: { glimmers: 10 },
    icon: "⭐",
    image: null,
    placement: "wall"
  },

  "decor-lamp-moon": {
    id: "decor-lamp-moon",
    name: "Moon Lamp",
    category: "decorations",
    description: "A glowing moon lamp that lights up the night!",
    price: { glimmers: 18 },
    icon: "🌙",
    image: null,
    placement: "table"
  },

  "decor-bookshelf": {
    id: "decor-bookshelf",
    name: "Mini Bookshelf",
    category: "decorations",
    description: "Fill it with your favorite adventure stories!",
    price: { glimmers: 25 },
    icon: "📚",
    image: null,
    placement: "floor"
  },

  "decor-bed-cozy": {
    id: "decor-bed-cozy",
    name: "Cozy Pup Bed",
    category: "decorations",
    description: "The comfiest bed for tired pups after adventures!",
    price: { glimmers: 30 },
    icon: "🛏️",
    image: null,
    placement: "floor"
  },

  "decor-fairy-lights": {
    id: "decor-fairy-lights",
    name: "Fairy Lights",
    category: "decorations",
    description: "Magical twinkling lights! Melody enchanted them herself!",
    price: { glimmers: 15 },
    icon: "✨",
    image: null,
    placement: "wall"
  },

  "decor-frame-gold": {
    id: "decor-frame-gold",
    name: "Golden Frame",
    category: "decorations",
    description: "A beautiful frame for your favorite memory!",
    price: { glimmers: 12 },
    icon: "🖼️",
    image: null,
    placement: "wall"
  },

  // ============================================================
  // STATIONERY - For Post System
  // ============================================================

  "letter-basic": {
    id: "letter-basic",
    name: "Friendly Letter",
    category: "stationery",
    description: "A simple letter to send to your friends!",
    price: { glimmers: 2 },
    icon: "✉️",
    image: null,
    uses: 1
  },

  "letter-fancy": {
    id: "letter-fancy",
    name: "Fancy Letter",
    category: "stationery",
    description: "A decorated letter with a golden seal!",
    price: { glimmers: 5 },
    icon: "💌",
    image: null,
    uses: 1
  },

  "postcard-meadow": {
    id: "postcard-meadow",
    name: "Meadow Postcard",
    category: "stationery",
    description: "A pretty postcard with Complexa Meadows on it!",
    price: { glimmers: 3 },
    icon: "🏞️",
    image: null,
    uses: 1
  },

  "postcard-farm": {
    id: "postcard-farm",
    name: "Farm Postcard",
    category: "stationery",
    description: "Greetings from Buttercup's Farm!",
    price: { glimmers: 3 },
    icon: "🌻",
    image: null,
    uses: 1
  },

  "sticker-pack": {
    id: "sticker-pack",
    name: "Sticker Pack",
    category: "stationery",
    description: "Cute stickers to decorate your letters! (5 stickers)",
    price: { glimmers: 4 },
    icon: "⭐",
    image: null,
    uses: 5
  },

  "stamp-paw": {
    id: "stamp-paw",
    name: "Paw Print Stamp",
    category: "stationery",
    description: "Stamp your letters with an official paw print!",
    price: { glimmers: 8 },
    icon: "🐾",
    image: null,
    uses: "unlimited"
  },

  "envelope-sparkle": {
    id: "envelope-sparkle",
    name: "Sparkle Envelope",
    category: "stationery",
    description: "An envelope that literally sparkles when opened!",
    price: { glimmers: 6 },
    icon: "💫",
    image: null,
    uses: 1
  },

  // ============================================================
  // FUTURE: Exclusive Items (require secondary currencies)
  // These are placeholders - will be locked until feature is ready
  // ============================================================

  "collar-geopup-special": {
    id: "collar-geopup-special",
    name: "Geometry Collar",
    category: "accessories",
    description: "A special collar with geometric patterns! Only for geometry masters!",
    price: { glimmers: 10, geopupGems: 5 },
    icon: "📐",
    image: null,
    forPups: ["geopup"],
    exclusive: true,
    unlockCondition: { studypup: "geopup" }
  }
};

// ============================================================
// MELODY'S DIALOGUES
// ============================================================

export const MELODY_DIALOGUES = {
  // First visit greeting
  firstVisit: {
    greeting: "Welcome to my shop, {playerName}! ✨ I'm Melody, and I've been waiting for you! I heard you did amazing work at Buttercup's farm!",
    explanation: "Here you can spend your hard-earned glimmers on wonderful things! Treats for Teddy, decorations for your home, and so much more!",
    encouragement: "Take your time looking around - I'm here if you need any help!"
  },

  // Regular greetings (random)
  regularGreetings: [
    "Welcome back, {playerName}! What catches your eye today? ✨",
    "Oh, {playerName}! So lovely to see you! I just got some new items in!",
    "Hello, friend! Ready to find something special? 💫",
    "Ah, my favorite customer! Come in, come in! ✨",
    "The shop sparkles brighter when you visit, {playerName}!"
  ],

  // New StudyPup unlocked
  newPupGreeting: "Oh my stars! ✨ You've found {pupName}! Congratulations, {playerName}! I have a special gift for you - a magical collar for your new friend! And look, I've put out some exclusive items just for {pupName}!",

  // Cart affordability messages
  canAfford: "Wonderful choices! 🌟 You have {balance} glimmers, and this comes to {total} glimmers. You've got plenty!",
  canAffordExactly: "Perfect! This is exactly {total} glimmers, and that's exactly what you have! It's meant to be! ✨",
  cantAfford: "Oh dear... this lovely collection costs {total} glimmers, but you have {balance}. You need {needed} more glimmers!",
  cantAffordSuggestion: "Would you like to remove something from your cart, or perhaps head out to earn some more glimmers? There are jobs waiting for you! 💪",

  // Purchase messages
  purchaseSuccess: [
    "Wonderful choice! {pupName} is going to love this! 🌟",
    "Oh, this will look absolutely perfect! ✨",
    "You have such great taste, {playerName}! 💫",
    "I just know this will bring so much joy! 🌈",
    "*wraps it up with a sparkly bow* There you go! Enjoy! ✨"
  ],

  purchaseSuccessDecor: [
    "Your home is going to look amazing! 🏠✨",
    "I can already imagine how beautiful this will be in your space! 🌟",
    "What a lovely addition to your home! 💫"
  ],

  purchaseSuccessFood: [
    "{pupName} is going to be SO excited for this treat! 🦴",
    "Mmm, this smells delicious! Your pups will love it! 😋",
    "A yummy choice! Nothing but the best for your StudyPups! 🌟"
  ],

  purchaseSuccessStationery: [
    "Your friends in the neighborhood will love getting mail from you! ✉️💫",
    "How wonderful that you're staying in touch with friends! ✨",
    "I love that you're sending letters! It makes the whole meadow happier! 🌈"
  ],

  // Insufficient funds
  notEnoughFunds: "I'm sorry, {playerName}... you need {needed} more glimmers for this. But don't worry! You can earn more by helping out around the meadow!",

  // Empty cart
  emptyCart: "Your cart is empty, {playerName}! Browse around and add anything that catches your eye! ✨",

  // Farewell messages
  farewells: [
    "Come back soon, {playerName}! ✨",
    "Happy adventuring! See you next time! 🌟",
    "Take care, friend! The shop will be here whenever you need it! 💫",
    "Bye for now! Give Teddy a pat from me! 🐕✨"
  ]
};

// ============================================================
// JOB LISTINGS (Now Hiring Menu)
// ============================================================

export const JOB_LISTINGS = [
  {
    id: "farm",
    locationId: "farm",
    name: "Buttercup's Farm",
    employer: "Farmer Buttercup",
    icon: "🌻",
    href: "farm.html",
    description: "Help count sheep, eggs, and vegetables!",
    mathSkills: "Multiplication & Skip Counting",
    currency: "glimmers",
    rewardRange: { min: 2, max: 5 },
    rewardText: "2-5 glimmers per puzzle",
    unlockCondition: null, // Always available after tutorial
    levels: [
      { level: 1, name: "Counting Sheep", reward: "~15 glimmers" },
      { level: 2, name: "Harvest Time", reward: "~20 glimmers" },
      { level: 3, name: "Market Day", reward: "~25 glimmers" }
    ]
  },
  {
    id: "tutorial",
    locationId: "tutorial",
    name: "Whispering Woods",
    employer: "The Forest",
    icon: "🌲",
    href: "tutorial.html",
    description: "Practice patterns and sequences!",
    mathSkills: "Patterns & Sequences",
    currency: "glimmers",
    rewardRange: { min: 1, max: 3 },
    rewardText: "1-3 glimmers per puzzle",
    unlockCondition: null,
    levels: [
      { level: 1, name: "Forest Patterns", reward: "~10 glimmers" }
    ]
  },
  // Future locations - locked for now
  {
    id: "cafe",
    locationId: "cafe",
    name: "Cozy Cafe",
    employer: "Coming Soon",
    icon: "☕",
    href: "#",
    description: "Practice money and decimals!",
    mathSkills: "Money & Decimals",
    currency: "glimmers",
    rewardRange: { min: 3, max: 6 },
    rewardText: "3-6 glimmers per puzzle",
    unlockCondition: { comingSoon: true },
    locked: true,
    levels: []
  },
  {
    id: "geometry-garden",
    locationId: "geometry-garden",
    name: "Geometry Garden",
    employer: "GeoPup",
    icon: "📐",
    href: "#",
    description: "Explore shapes and angles!",
    mathSkills: "Geometry",
    currency: "geopupGems",
    rewardRange: { min: 1, max: 3 },
    rewardText: "1-3 GeoPup Gems per puzzle",
    unlockCondition: { studypup: "geopup" },
    locked: true,
    exclusive: true,
    levels: []
  }
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Get all items in a category
 */
export function getItemsByCategory(categoryId) {
  if (categoryId === "all") {
    return Object.values(SHOP_ITEMS).filter(item => !item.isGift);
  }
  return Object.values(SHOP_ITEMS).filter(
    item => item.category === categoryId && !item.isGift
  );
}

/**
 * Get a specific item by ID
 */
export function getItem(itemId) {
  return SHOP_ITEMS[itemId] || null;
}

/**
 * Get available jobs for a player (based on unlocked locations and StudyPups)
 */
export function getAvailableJobs(playerProgress) {
  return JOB_LISTINGS.filter(job => {
    // If locked/coming soon, still show but marked as locked
    if (job.locked) return true;

    // Check unlock conditions
    if (!job.unlockCondition) return true;

    if (job.unlockCondition.studypup) {
      const hasStudyPup = playerProgress?.studyPupsUnlocked?.includes(job.unlockCondition.studypup);
      return hasStudyPup;
    }

    return true;
  });
}

/**
 * Get a random dialogue from an array
 */
export function getRandomDialogue(dialogueArray) {
  if (!Array.isArray(dialogueArray)) return dialogueArray;
  return dialogueArray[Math.floor(Math.random() * dialogueArray.length)];
}

/**
 * Format dialogue with player data
 */
export function formatDialogue(text, data = {}) {
  let formatted = text;
  for (const [key, value] of Object.entries(data)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return formatted;
}

/**
 * Check if player can afford a cart total
 */
export function canAffordCart(cartTotal, playerGlimmers, otherCurrencies = {}) {
  if (cartTotal.glimmers > playerGlimmers) return false;

  // Check other currencies (future feature)
  for (const [currency, amount] of Object.entries(cartTotal)) {
    if (currency === 'glimmers') continue;
    if (!otherCurrencies[currency] || otherCurrencies[currency] < amount) {
      return false;
    }
  }

  return true;
}

/**
 * Calculate cart total from items
 */
export function calculateCartTotal(cartItems) {
  const total = { glimmers: 0 };

  for (const cartItem of cartItems) {
    const item = SHOP_ITEMS[cartItem.itemId];
    if (!item) continue;

    const qty = cartItem.quantity || 1;

    // Add glimmers
    total.glimmers += (item.price.glimmers || 0) * qty;

    // Add other currencies
    for (const [currency, amount] of Object.entries(item.price)) {
      if (currency === 'glimmers') continue;
      total[currency] = (total[currency] || 0) + amount * qty;
    }
  }

  return total;
}

/**
 * Get newly unlocked items for a StudyPup
 */
export function getExclusiveItemsForPup(pupId) {
  return Object.values(SHOP_ITEMS).filter(item => {
    if (item.forPups && item.forPups.includes(pupId)) return true;
    if (item.unlockCondition?.studypup === pupId) return true;
    return false;
  });
}

/**
 * Check if this is the player's first shop visit
 */
export function isFirstShopVisit(gameState) {
  return !gameState?.progress?.shopVisited;
}

/**
 * Get collar gift for a specific StudyPup
 */
export function getCollarGiftForPup(pupId) {
  if (pupId === 'teddy') {
    return SHOP_ITEMS['collar-magic'];
  }
  // Future: return specific collars for other pups
  return null;
}
