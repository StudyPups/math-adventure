// js/locations/shop.js
// Game engine for Melody's Shop location
// Features: Browse items, cart system, purchase, Now Hiring jobs menu

import { onReady, log, saveGameState, loadGameState, createNewGameState, initGameMenu } from "../core/shared.js";
import { addInventoryItem, getCurrentPlayer, spendGlimmers } from "../core/player-data.js";
import {
  CATEGORIES,
  SHOP_ITEMS,
  MELODY_DIALOGUES,
  JOB_LISTINGS,
  getItemsByCategory,
  getItem,
  getRandomDialogue,
  formatDialogue,
  calculateCartTotal,
  canAffordCart,
  isFirstShopVisit,
  getCollarGiftForPup,
  getExclusiveItemsForPup
} from "../../data/shop-scenes.js";

// ============================================================
// SHOP STATE
// ============================================================

let shopState = {
  cart: [], // [{ itemId: string, quantity: number }]
  currentCategory: "all",
  selectedItem: null,
  melodyDialogueQueue: [],
  isFirstVisit: false,
  newlyUnlockedPups: [], // Pups unlocked since last shop visit
  giftsPending: [] // Gifts waiting to be given
};

// ============================================================
// MAIN INITIALIZATION
// ============================================================

onReady(() => {
  log("Shop Engine loaded");
  initGameMenu("shop");

  // Load game state
  const gameState = loadGameState() || createNewGameState();
  const player = getCurrentPlayer();

  // Check first visit
  shopState.isFirstVisit = isFirstShopVisit(gameState);

  // Check for newly unlocked StudyPups
  checkNewStudyPups(gameState, player);

  // Initialize UI
  initializeShop(gameState, player);

  // Update displays
  updateGemDisplay();
  updateCartDisplay();

  // Show initial Melody greeting
  showInitialGreeting(gameState, player);

  log("Shop initialized");
});

// ============================================================
// SHOP INITIALIZATION
// ============================================================

function initializeShop(gameState, player) {
  // Build category tabs
  buildCategoryTabs();

  // Build items grid
  buildItemsGrid("all");

  // Setup event listeners
  setupEventListeners(gameState, player);

  // Build jobs list
  buildJobsList(gameState);
}

function buildCategoryTabs() {
  const tabsContainer = document.getElementById("categoryTabs");
  tabsContainer.innerHTML = "";

  CATEGORIES.forEach(category => {
    const tab = document.createElement("button");
    tab.className = `category-tab ${category.id === shopState.currentCategory ? 'active' : ''}`;
    tab.dataset.categoryId = category.id;
    tab.innerHTML = `
      <span class="category-tab-icon">${category.icon}</span>
      <span class="category-tab-name">${category.name}</span>
    `;

    tab.addEventListener("click", () => {
      selectCategory(category.id);
    });

    tabsContainer.appendChild(tab);
  });
}

function selectCategory(categoryId) {
  shopState.currentCategory = categoryId;

  // Update active tab
  document.querySelectorAll(".category-tab").forEach(tab => {
    tab.classList.toggle("active", tab.dataset.categoryId === categoryId);
  });

  // Rebuild items grid
  buildItemsGrid(categoryId);

  // Melody comment
  const category = CATEGORIES.find(c => c.id === categoryId);
  if (category && categoryId !== "all") {
    showMelodyDialogue(`${category.icon} ${category.description}`, false);
  }
}

function buildItemsGrid(categoryId) {
  const grid = document.getElementById("itemsGrid");
  grid.innerHTML = "";

  const items = getItemsByCategory(categoryId);

  if (items.length === 0) {
    grid.innerHTML = `
      <div class="items-empty">
        No items in this category yet!
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const card = createItemCard(item);
    grid.appendChild(card);
  });
}

function createItemCard(item) {
  const card = document.createElement("div");
  card.className = "item-card";
  card.dataset.itemId = item.id;

  // Check if in cart
  const cartItem = shopState.cart.find(ci => ci.itemId === item.id);
  if (cartItem) {
    card.classList.add("in-cart");
  }

  // Check if locked/exclusive
  if (item.locked) {
    card.classList.add("locked");
  }
  if (item.exclusive) {
    card.classList.add("exclusive");
  }

  // Build price display
  let priceDisplay = `<span class="gem-icon">💎</span>${item.price.glimmers}`;
  if (item.price.geopupGems) {
    priceDisplay += ` + 📐${item.price.geopupGems}`;
  }

  card.innerHTML = `
    <span class="item-card-icon">${item.icon}</span>
    <div class="item-card-name">${item.name}</div>
    <div class="item-card-price">${priceDisplay}</div>
    <button class="item-card-quick-add" data-item-id="${item.id}">
      ${cartItem ? '✓ In Cart' : '+ Add'}
    </button>
  `;

  // Click to open detail modal
  card.addEventListener("click", (e) => {
    if (!e.target.classList.contains("item-card-quick-add")) {
      openItemModal(item);
    }
  });

  // Quick add button
  const quickAddBtn = card.querySelector(".item-card-quick-add");
  quickAddBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!item.locked) {
      addToCart(item.id);
    }
  });

  return card;
}

// ============================================================
// CART SYSTEM
// ============================================================

function addToCart(itemId, quantity = 1) {
  const existingItem = shopState.cart.find(ci => ci.itemId === itemId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    shopState.cart.push({ itemId, quantity });
  }

  updateCartDisplay();
  updateItemCards();

  // Show Melody reaction
  const item = getItem(itemId);
  if (item) {
    showMelodyDialogue(`Great choice! ${item.icon} ${item.name} added to your cart!`, false);
  }

  log(`Added to cart: ${itemId} (qty: ${quantity})`);
}

function removeFromCart(itemId) {
  shopState.cart = shopState.cart.filter(ci => ci.itemId !== itemId);
  updateCartDisplay();
  updateItemCards();
  log(`Removed from cart: ${itemId}`);
}

function updateCartQuantity(itemId, delta) {
  const cartItem = shopState.cart.find(ci => ci.itemId === itemId);
  if (!cartItem) return;

  cartItem.quantity += delta;

  if (cartItem.quantity <= 0) {
    removeFromCart(itemId);
  } else {
    updateCartDisplay();
  }
}

function clearCart() {
  shopState.cart = [];
  updateCartDisplay();
  updateItemCards();
}

function updateCartDisplay() {
  const player = getCurrentPlayer();
  const playerGlimmers = player?.glimmers || 0;

  // Update cart count badge
  const cartCount = document.getElementById("cartCount");
  const totalItems = shopState.cart.reduce((sum, ci) => sum + ci.quantity, 0);
  cartCount.textContent = totalItems;
  cartCount.classList.toggle("has-items", totalItems > 0);

  // Update cart items list
  const cartItemsContainer = document.getElementById("cartItems");
  const cartEmpty = document.getElementById("cartEmpty");

  // Clear existing items (except empty message)
  cartItemsContainer.querySelectorAll(".cart-item").forEach(el => el.remove());

  if (shopState.cart.length === 0) {
    cartEmpty.style.display = "block";
  } else {
    cartEmpty.style.display = "none";

    shopState.cart.forEach(cartItem => {
      const item = getItem(cartItem.itemId);
      if (!item) return;

      const cartItemEl = document.createElement("div");
      cartItemEl.className = "cart-item";
      cartItemEl.innerHTML = `
        <span class="cart-item-icon">${item.icon}</span>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">
            <span class="gem-icon">💎</span>${item.price.glimmers * cartItem.quantity}
          </div>
        </div>
        <div class="cart-item-qty">
          <button class="cart-item-qty-btn" data-action="decrease" data-item-id="${item.id}">-</button>
          <span class="cart-item-qty-num">${cartItem.quantity}</span>
          <button class="cart-item-qty-btn" data-action="increase" data-item-id="${item.id}">+</button>
        </div>
        <button class="cart-item-remove" data-item-id="${item.id}">🗑️</button>
      `;

      // Event listeners for quantity buttons
      cartItemEl.querySelector('[data-action="decrease"]').addEventListener("click", () => {
        updateCartQuantity(item.id, -1);
      });

      cartItemEl.querySelector('[data-action="increase"]').addEventListener("click", () => {
        updateCartQuantity(item.id, 1);
      });

      cartItemEl.querySelector('.cart-item-remove').addEventListener("click", () => {
        removeFromCart(item.id);
      });

      cartItemsContainer.insertBefore(cartItemEl, cartEmpty);
    });
  }

  // Update totals
  const total = calculateCartTotal(shopState.cart);
  document.getElementById("cartTotalGlimmers").textContent = total.glimmers;
  document.getElementById("playerGlimmers").textContent = playerGlimmers;

  // Update affordability status
  const cartStatus = document.getElementById("cartStatus");
  const checkoutBtn = document.getElementById("checkoutBtn");

  if (shopState.cart.length === 0) {
    cartStatus.textContent = "";
    cartStatus.className = "cart-status";
    checkoutBtn.disabled = true;
  } else if (playerGlimmers >= total.glimmers) {
    if (playerGlimmers === total.glimmers) {
      cartStatus.textContent = "Perfect! You have exactly enough!";
    } else {
      const remaining = playerGlimmers - total.glimmers;
      cartStatus.textContent = `You'll have ${remaining} glimmers left.`;
    }
    cartStatus.className = "cart-status can-afford";
    checkoutBtn.disabled = false;
  } else {
    const needed = total.glimmers - playerGlimmers;
    cartStatus.textContent = `You need ${needed} more glimmers.`;
    cartStatus.className = "cart-status cant-afford";
    checkoutBtn.disabled = true;
  }
}

function updateItemCards() {
  document.querySelectorAll(".item-card").forEach(card => {
    const itemId = card.dataset.itemId;
    const inCart = shopState.cart.some(ci => ci.itemId === itemId);
    card.classList.toggle("in-cart", inCart);

    const quickAddBtn = card.querySelector(".item-card-quick-add");
    if (quickAddBtn) {
      quickAddBtn.textContent = inCart ? '✓ In Cart' : '+ Add';
    }
  });
}

// ============================================================
// PURCHASE FLOW
// ============================================================

function processPurchase() {
  const total = calculateCartTotal(shopState.cart);
  const player = getCurrentPlayer();

  if (!player) {
    showMelodyDialogue("No profile found. Please create a profile first.");
    return;
  }

  // Verify affordability
  const availableGlimmers = Number(player.glimmers) || 0;
  if (availableGlimmers < total.glimmers) {
    showMelodyDialogue(formatDialogue(MELODY_DIALOGUES.notEnoughFunds, {
      playerName: player.playerName || "friend",
      needed: total.glimmers - availableGlimmers
    }));
    return;
  }

  // Deduct glimmers
  const spendResult = spendGlimmers(total.glimmers);
  if (!spendResult.ok) {
    showMelodyDialogue(formatDialogue(MELODY_DIALOGUES.notEnoughFunds, {
      playerName: player.playerName || "friend",
      needed: total.glimmers
    }));
    return;
  }

  // Add items to inventory
  shopState.cart.forEach(cartItem => {
    const item = getItem(cartItem.itemId);
    if (!item) return;

    const purchaseMeta = {
      purchasedAt: new Date().toISOString(),
      seenInInventory: false
    };

    addInventoryItem(cartItem.itemId, cartItem.quantity, purchaseMeta);
  });

  // Show success modal
  showPurchaseSuccess(shopState.cart);

  // Clear cart
  const purchasedItems = [...shopState.cart];
  clearCart();

  // Update displays
  updateGemDisplay();

  log("Purchase complete!", purchasedItems);
}

function showPurchaseSuccess(purchasedItems) {
  const gameState = loadGameState() || createNewGameState();
  const modal = document.getElementById("successModal");
  const messageEl = document.getElementById("successMessage");
  const itemsEl = document.getElementById("successItems");

  // Get appropriate message based on item categories
  const categories = new Set(purchasedItems.map(ci => getItem(ci.itemId)?.category));

  let message;
  if (categories.has("food")) {
    message = getRandomDialogue(MELODY_DIALOGUES.purchaseSuccessFood);
    message = formatDialogue(message, { pupName: "Teddy" });
  } else if (categories.has("decorations")) {
    message = getRandomDialogue(MELODY_DIALOGUES.purchaseSuccessDecor);
  } else if (categories.has("stationery")) {
    message = getRandomDialogue(MELODY_DIALOGUES.purchaseSuccessStationery);
  } else {
    message = getRandomDialogue(MELODY_DIALOGUES.purchaseSuccess);
    message = formatDialogue(message, {
      pupName: "Teddy",
      playerName: gameState.playerName || "friend"
    });
  }

  messageEl.textContent = message;

  // Show purchased items
  itemsEl.innerHTML = purchasedItems.map(ci => {
    const item = getItem(ci.itemId);
    return `
      <div class="success-item">
        <span>${item.icon}</span>
        <span>${item.name}${ci.quantity > 1 ? ` x${ci.quantity}` : ''}</span>
      </div>
    `;
  }).join("");

  modal.classList.add("show");
}

// ============================================================
// ITEM DETAIL MODAL
// ============================================================

function openItemModal(item) {
  shopState.selectedItem = item;

  const modal = document.getElementById("itemModal");
  document.getElementById("itemDetailIcon").textContent = item.icon;
  document.getElementById("itemDetailName").textContent = item.name;
  document.getElementById("itemDetailDesc").textContent = item.description;
  document.getElementById("itemDetailPriceAmount").textContent = item.price.glimmers;

  // Update button states
  const addBtn = document.getElementById("addToCartBtn");
  const buyBtn = document.getElementById("buyNowBtn");

  const inCart = shopState.cart.some(ci => ci.itemId === item.id);
  addBtn.textContent = inCart ? '✓ In Cart' : '🛒 Add to Cart';

  if (item.locked) {
    addBtn.disabled = true;
    buyBtn.disabled = true;
    addBtn.textContent = '🔒 Locked';
  } else {
    addBtn.disabled = false;
    buyBtn.disabled = false;
  }

  modal.classList.add("show");
}

function closeItemModal() {
  const modal = document.getElementById("itemModal");
  modal.classList.remove("show");
  shopState.selectedItem = null;
}

// ============================================================
// JOBS (NOW HIRING) MODAL
// ============================================================

function buildJobsList(gameState) {
  const jobsList = document.getElementById("jobsList");
  jobsList.innerHTML = "";

  JOB_LISTINGS.forEach(job => {
    const card = document.createElement("a");
    card.className = `job-card ${job.locked ? 'locked' : ''} ${job.exclusive ? 'exclusive' : ''}`;
    card.href = job.locked ? "#" : job.href;

    if (job.locked) {
      card.addEventListener("click", (e) => {
        e.preventDefault();
        showMelodyDialogue(`${job.name} isn't available yet, but it's coming soon! Keep practicing!`);
      });
    }

    // Determine badge text
    let badge = job.locked ? '🔒 Coming Soon' : 'Available';
    if (job.exclusive) badge = '⭐ Exclusive';

    card.innerHTML = `
      <span class="job-card-icon">${job.icon}</span>
      <div class="job-card-info">
        <div class="job-card-name">${job.name}</div>
        <div class="job-card-desc">${job.description}</div>
        <div class="job-card-reward">
          <span class="gem-icon">${job.currency === 'glimmers' ? '💎' : '📐'}</span>
          ${job.rewardText}
        </div>
      </div>
      <span class="job-card-badge">${badge}</span>
    `;

    jobsList.appendChild(card);
  });
}

function openJobsModal() {
  const modal = document.getElementById("jobsModal");
  modal.classList.add("show");

  showMelodyDialogue(formatDialogue(MELODY_DIALOGUES.cantAffordSuggestion, {}), false);
}

function closeJobsModal() {
  const modal = document.getElementById("jobsModal");
  modal.classList.remove("show");
}

// ============================================================
// MELODY DIALOGUE SYSTEM
// ============================================================

function showMelodyDialogue(text, showButton = true) {
  const dialogueEl = document.getElementById("melodyDialogue");
  const textEl = document.getElementById("melodyDialogueText");
  const btnEl = document.getElementById("melodyDialogueBtn");

  textEl.innerHTML = text;
  btnEl.style.display = showButton ? "block" : "none";

  dialogueEl.classList.remove("hidden");

  // Auto-hide after a few seconds if no button
  if (!showButton) {
    setTimeout(() => {
      if (!showButton) {
        // Only hide if still showing same text
        dialogueEl.classList.add("hidden");
      }
    }, 4000);
  }
}

function hideMelodyDialogue() {
  const dialogueEl = document.getElementById("melodyDialogue");
  dialogueEl.classList.add("hidden");
}

function showInitialGreeting(gameState, player) {
  const playerName = gameState.playerName || player?.playerName || "friend";

  if (shopState.isFirstVisit) {
    // First visit sequence
    showMelodyDialogue(formatDialogue(MELODY_DIALOGUES.firstVisit.greeting, { playerName }));

    // Queue explanation
    shopState.melodyDialogueQueue = [
      formatDialogue(MELODY_DIALOGUES.firstVisit.explanation, { playerName }),
      formatDialogue(MELODY_DIALOGUES.firstVisit.encouragement, { playerName })
    ];

    // Mark shop as visited
    gameState.progress = gameState.progress || {};
    gameState.progress.shopVisited = true;
    saveGameState(gameState);

  } else if (shopState.giftsPending.length > 0) {
    // Show gift for new StudyPup
    showGiftModal(shopState.giftsPending[0]);

  } else {
    // Regular greeting
    const greeting = getRandomDialogue(MELODY_DIALOGUES.regularGreetings);
    showMelodyDialogue(formatDialogue(greeting, { playerName }));
  }
}

function advanceDialogue() {
  if (shopState.melodyDialogueQueue.length > 0) {
    const nextDialogue = shopState.melodyDialogueQueue.shift();
    showMelodyDialogue(nextDialogue);
  } else if (shopState.giftsPending.length > 0) {
    showGiftModal(shopState.giftsPending[0]);
  } else {
    hideMelodyDialogue();
  }
}

// ============================================================
// NEW STUDYPUP DETECTION & GIFTING
// ============================================================

function checkNewStudyPups(gameState, player) {
  const lastShopVisitPups = gameState.progress?.shopVisitPups || ['teddy'];
  const currentPups = gameState.progress?.studyPupsUnlocked || ['teddy'];

  // Find newly unlocked pups since last shop visit
  const newPups = currentPups.filter(pup => !lastShopVisitPups.includes(pup));

  if (newPups.length > 0) {
    shopState.newlyUnlockedPups = newPups;

    // Create gift for each new pup
    newPups.forEach(pupId => {
      const gift = getCollarGiftForPup(pupId);
      if (gift) {
        shopState.giftsPending.push({
          pupId,
          pupName: getPupDisplayName(pupId),
          gift
        });
      }
    });

    // Update last visit pups
    gameState.progress.shopVisitPups = [...currentPups];
    saveGameState(gameState);
  }

  // Check if first visit (Teddy's collar)
  if (shopState.isFirstVisit && !lastShopVisitPups.includes('teddy')) {
    const teddyGift = getCollarGiftForPup('teddy');
    if (teddyGift) {
      shopState.giftsPending.push({
        pupId: 'teddy',
        pupName: 'Teddy',
        gift: teddyGift
      });
    }
  }
}

function getPupDisplayName(pupId) {
  const names = {
    teddy: "Teddy",
    geopup: "GeoPup",
    // Add more as they're created
  };
  return names[pupId] || pupId;
}

function showGiftModal(giftData) {
  const modal = document.getElementById("giftModal");
  const messageEl = document.getElementById("giftMessage");
  const iconEl = document.getElementById("giftItemIcon");
  const nameEl = document.getElementById("giftItemName");

  const gameState = loadGameState() || createNewGameState();
  const playerName = gameState.playerName || "friend";

  messageEl.innerHTML = formatDialogue(MELODY_DIALOGUES.newPupGreeting, {
    playerName,
    pupName: giftData.pupName
  });

  iconEl.textContent = giftData.gift.icon;
  nameEl.textContent = giftData.gift.name;

  modal.classList.add("show");
}

function acceptGift() {
  if (shopState.giftsPending.length === 0) return;

  const giftData = shopState.giftsPending.shift();

  addInventoryItem(giftData.gift.id, 1, {
    isGift: true,
    giftedAt: new Date().toISOString()
  });

  // Close modal
  const modal = document.getElementById("giftModal");
  modal.classList.remove("show");

  // Show next gift or greeting
  if (shopState.giftsPending.length > 0) {
    setTimeout(() => showGiftModal(shopState.giftsPending[0]), 500);
  } else {
    // Show exclusive items for new pup
    if (giftData.pupId && giftData.pupId !== 'teddy') {
      const exclusiveItems = getExclusiveItemsForPup(giftData.pupId);
      if (exclusiveItems.length > 0) {
        showMelodyDialogue(`Check out these special items just for ${giftData.pupName}! They're waiting in the shop!`);
      }
    }
  }
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function setupEventListeners(gameState, player) {
  // Cart panel toggle
  document.getElementById("cartToggleBtn").addEventListener("click", () => {
    document.getElementById("cartPanel").classList.add("open");
  });

  document.getElementById("cartCloseBtn").addEventListener("click", () => {
    document.getElementById("cartPanel").classList.remove("open");
  });

  // Checkout button
  document.getElementById("checkoutBtn").addEventListener("click", () => {
    processPurchase();
  });

  // Earn more button (open jobs)
  document.getElementById("earnMoreBtn").addEventListener("click", () => {
    openJobsModal();
  });

  // Item modal
  document.getElementById("modalBackdrop").addEventListener("click", closeItemModal);
  document.getElementById("modalClose").addEventListener("click", closeItemModal);

  document.getElementById("addToCartBtn").addEventListener("click", () => {
    if (shopState.selectedItem) {
      addToCart(shopState.selectedItem.id);
      closeItemModal();
    }
  });

  document.getElementById("buyNowBtn").addEventListener("click", () => {
    if (shopState.selectedItem) {
      // Clear cart, add item, open cart, close modal
      clearCart();
      addToCart(shopState.selectedItem.id);
      closeItemModal();
      document.getElementById("cartPanel").classList.add("open");
    }
  });

  // Jobs modal
  document.getElementById("jobsModalBackdrop").addEventListener("click", closeJobsModal);
  document.getElementById("jobsModalClose").addEventListener("click", closeJobsModal);
  document.getElementById("backToShopBtn").addEventListener("click", closeJobsModal);

  // Success modal
  document.getElementById("successModalBackdrop").addEventListener("click", () => {
    document.getElementById("successModal").classList.remove("show");
  });
  document.getElementById("successContinueBtn").addEventListener("click", () => {
    document.getElementById("successModal").classList.remove("show");
  });

  // Gift modal
  document.getElementById("giftModalBackdrop").addEventListener("click", acceptGift);
  document.getElementById("giftAcceptBtn").addEventListener("click", acceptGift);

  // Melody dialogue
  document.getElementById("melodyDialogueBtn").addEventListener("click", advanceDialogue);
  document.getElementById("melodyContainer").addEventListener("click", () => {
    // Click on Melody to show a random greeting
    const greeting = getRandomDialogue(MELODY_DIALOGUES.regularGreetings);
    showMelodyDialogue(formatDialogue(greeting, {
      playerName: gameState.playerName || "friend"
    }));
  });

  // Map/Menu button
  const homeBtn = document.getElementById("homeBtn");
  homeBtn?.addEventListener("click", () => {
    if (window.openGameMenu) {
      window.openGameMenu();
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeItemModal();
      closeJobsModal();
      document.getElementById("successModal").classList.remove("show");
      document.getElementById("giftModal").classList.remove("show");
      document.getElementById("cartPanel").classList.remove("open");
    }
  });
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function updateGemDisplay() {
  const player = getCurrentPlayer();
  const count = player?.glimmers || 0;
  const gemCount = document.getElementById("gemCount");
  if (gemCount) {
    gemCount.textContent = count;
  }
}
