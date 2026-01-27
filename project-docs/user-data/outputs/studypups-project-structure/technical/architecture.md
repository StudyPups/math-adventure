# StudyPups Technical Architecture

## Purpose
This document tracks how the code is structured, key technical decisions, and implementation notes. This helps you remember why things are built a certain way and guides future development.

---

## Tech Stack

### Current (Phase 1 - Web App)
- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **No backend needed** (client-side only for MVP)
- **Storage:** LocalStorage (browser-based save system)
- **Hosting:** GitHub Pages (free, easy deployment)
- **Version Control:** Git + GitHub

### Future (Phase 2+ - Mobile App)
- **Framework:** React Native (iOS + Android from one codebase) OR Capacitor (wrap web app)
- **Backend:** Firebase or Supabase (user accounts, cloud saves, teacher features)
- **Database:** Firestore or PostgreSQL (student progress, analytics)
- **API:** Claude API (for AI-powered hint system in Phase 3)

---

## File Structure

### Current Organization
```
/math-adventure/               (GitHub repo root)
  /assets/
    /images/
      /characters/             (Teddy, fairy, StudyPups)
      /backgrounds/            (scene1.png, scene2.png)
      /items/                  (shop items - collar, bandana, etc.)
      /ui/                     (buttons, icons)
    /sounds/                   (future: bark, ding, music)
  
  /css/
    styles.css                 (main stylesheet)
    animations.css             (optional: if animations get complex)
  
  /js/
    /core/
      game.js                  (main game logic)
      save-system.js           (localStorage management)
      utils.js                 (helper functions)
    
    /curriculum/
      questions.js             (question bank - all problems)
      hints.js                 (hint text for each problem)
    
    /ui/
      shop.js                  (shop system)
      puppy-home.js            (customization display)
      tutorial.js              (vine rescue sequence)
  
  /data/                       (JSON files for easy editing)
    questions.json             (all questions structured)
    items.json                 (shop items + costs)
    studypups.json             (puppy data)
  
  index.html                   (landing/welcome page)
  game.html                    (main game interface)
  README.md                    (project description for GitHub)
```

### Future Structure (When Scaling)
```
  /teacher-dashboard/          (Phase 3)
  /analytics/                  (Phase 3)
  /server/                     (Phase 2 - backend)
  /tests/                      (automated testing)
```

---

## Data Structures

### Questions Format
```javascript
// /data/questions.json
{
  "questions": [
    {
      "id": "pattern_001",
      "section": "patterns",
      "difficulty": "easy",
      "question": "What comes next in this pattern? 2, 4, 6, 8, ___",
      "answer": 10,
      "answerType": "number",  // or "text", "multiple-choice"
      "hints": [
        "Look at how the numbers are changing!",
        "Try counting by 2s: 2, 4, 6, 8...",
        "Each number is 2 more than the one before it. What's 8 + 2?"
      ],
      "visual": "pattern_001.png",  // optional image
      "curriculum": ["ACMNA107"],   // Australian Curriculum codes
      "year": 6,
      "gems": 2  // reward for correct answer
    }
  ]
}
```

### Save Data Format
```javascript
// Stored in localStorage as JSON
{
  "playerName": "Loli",
  "currentSection": "patterns",
  "currentQuestion": 5,
  
  "progress": {
    "sectionsCompleted": ["tutorial"],
    "questionsCompleted": ["pattern_001", "pattern_002", "pattern_003"],
    "studyPupsUnlocked": ["teddy"]
  },
  
  "stats": {
    "totalGems": 25,
    "gemsSpent": 10,
    "gemsAvailable": 15,
    "totalCorrect": 12,
    "totalAttempts": 15,
    "hintsUsed": 8,
    "timeSpentMinutes": 45
  },
  
  "inventory": {
    "items": ["collar_red", "bandana_blue"],
    "equippedItems": {
      "teddy": ["collar_red"]
    }
  },
  
  "settings": {
    "soundEnabled": true,
    "musicEnabled": false
  },
  
  "lastPlayed": "2026-01-22T10:30:00Z"
}
```

### Items/Shop Format
```javascript
// /data/items.json
{
  "items": [
    {
      "id": "collar_red",
      "name": "Red Collar",
      "description": "A bright red collar for your puppy!",
      "cost": 10,
      "category": "accessory",
      "image": "collar_red.png",
      "compatiblePups": ["teddy", "all"]  // which pups can wear it
    }
  ]
}
```

---

## Key Systems

### 1. Save System (LocalStorage)

**Why LocalStorage:**
- Simple for Phase 1 (no server needed)
- Instant saves (no loading screens)
- Works offline
- Free

**Limitations:**
- Tied to browser (can't switch devices)
- Can be cleared by user
- No cloud backup
- Not suitable for multi-user (Phase 2+)

**Implementation:**
```javascript
// Save progress
function saveGame(gameState) {
  localStorage.setItem('studypups_save', JSON.stringify(gameState));
}

// Load progress
function loadGame() {
  const saved = localStorage.getItem('studypups_save');
  return saved ? JSON.parse(saved) : createNewGame();
}
```

**When to save:**
- After each correct answer
- After purchasing items
- After unlocking StudyPups
- When closing game (onbeforeunload event)

---

### 2. Gem Economy System

**Design Principles:**
- Earn gems for correct answers (immediate reward)
- Different amounts based on difficulty (1-3 gems)
- Optional: Bonus gems for first-try correct
- Never lose gems for wrong answers (no punishment)

**Implementation:**
```javascript
const gemRewards = {
  easy: 1,
  medium: 2,
  hard: 3,
  firstTryBonus: 1  // extra gem if correct on first attempt
};

function awardGems(difficulty, attempts) {
  let gems = gemRewards[difficulty];
  if (attempts === 1) gems += gemRewards.firstTryBonus;
  
  gameState.stats.totalGems += gems;
  gameState.stats.gemsAvailable += gems;
  
  saveGame(gameState);
  return gems;
}
```

**Item Pricing Strategy:**
- Common items: 5-10 gems (achievable after 3-5 questions)
- Rare items: 15-25 gems (requires completing section)
- Special items: 30-50 gems (long-term goals)

**Balance goal:** Player can buy something meaningful every 10-15 minutes of play

---

### 3. Progressive Hint System

**Three-Tier Approach:**

**Tier 1 - Encouragement:**
- "You can do this! Think about what's happening in the pattern."
- Builds confidence, doesn't give answer

**Tier 2 - Strategy:**
- "Try looking at how the numbers change. What's being added each time?"
- Points to approach without solving

**Tier 3 - Near-Answer:**
- "Each number is 2 more than the one before. So 8 + 2 = ?"
- Almost gives answer, student just has to compute

**Implementation:**
```javascript
function showHint(questionId, hintLevel) {
  const question = questions.find(q => q.id === questionId);
  const hint = question.hints[hintLevel - 1];  // 0-indexed array
  
  // Track hint usage
  gameState.stats.hintsUsed++;
  
  // Display hint (with Teddy animation/character)
  displayTeddyMessage(hint);
  
  // Save immediately (don't lose hint usage data)
  saveGame(gameState);
}
```

**Hint Cooldown:**
- After 3 hints used, suggest break ("Teddy thinks you might need a rest!")
- Encourages self-regulation without forcing it

---

### 4. Question Delivery System

**Current (Phase 1):**
- Linear progression (question 1 → 2 → 3...)
- All questions pre-written in JSON
- Manual curation for quality

**Future (Phase 2+):**
- Adaptive difficulty (based on performance)
- Random selection from question pool
- Teacher-created custom questions

**Implementation:**
```javascript
function getNextQuestion(section) {
  const sectionQuestions = questions.filter(q => q.section === section);
  const completed = gameState.progress.questionsCompleted;
  
  // Find first uncompleted question in section
  const nextQ = sectionQuestions.find(q => !completed.includes(q.id));
  
  return nextQ || null;  // null = section complete!
}
```

---

## Code Quality Standards

### For Phase 1 (Learning Phase):
**Priority: Working > Perfect**

✅ **Good enough:**
- Code that works reliably
- Clear variable names
- Basic comments explaining what code does

❌ **Don't stress about:**
- Advanced patterns/architectures
- Optimization (unless it's noticeably slow)
- Perfect code style

### For Phase 2 (Scaling):
**Priority: Maintainable > Clever**

✅ **Start caring about:**
- Modular functions (do one thing well)
- Consistent naming conventions
- More detailed comments
- Error handling

---

## Technical Decisions Log

### Decision: Web-First vs. Mobile-First
**Chose:** Web-first (HTML/CSS/JS)  
**Why:**
- Easier to learn
- Faster iteration (no app store approval)
- Works on any device with browser
- Can convert to mobile later (React Native wrapper)

**Trade-off:** Not as "polished" as native app initially, but much faster to build and test

---

### Decision: LocalStorage vs. Backend Database
**Chose:** LocalStorage for Phase 1  
**Why:**
- No server costs
- Simpler to implement
- Perfect for single-player testing
- Instant saves

**When to switch:** Phase 2 when adding teacher features (need cloud storage)

---

### Decision: Pre-written Hints vs. AI-Generated
**Chose:** Pre-written for Phase 1  
**Why:**
- Full control over hint quality
- No API costs during development
- Easier to test and refine
- Don't need backend infrastructure

**When to add AI:** Phase 3 when revenue supports API costs (~$0.01-0.03 per hint)

---

### Decision: JavaScript Framework (React?) or Vanilla JS
**Chose:** Vanilla JavaScript for Phase 1  
**Why:**
- Learning fundamentals first
- No build system complexity
- Easier to debug when you're new
- Can refactor to React Native later if needed

**Trade-off:** More manual DOM manipulation, but that's good for learning!

---

## Future Technical Considerations

### When Adding Backend (Phase 2):

**Will need:**
- User authentication (accounts for teachers/students)
- Cloud database (PostgreSQL or Firestore)
- API endpoints (for teacher dashboard, custom questions)
- Security (protect student data, COPPA compliance)

**Options:**
- **Firebase:** Easy setup, generous free tier, good for startups
- **Supabase:** Open-source Firebase alternative, more control
- **Custom backend:** Node.js + PostgreSQL (most flexible, most complex)

**Recommendation:** Start with Firebase (fast), migrate to Supabase if needed (ownership)

---

### When Adding AI Hints (Phase 3):

**Claude API Integration:**
```javascript
async function getAIHint(question, studentAnswer) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are Teddy, a friendly dog helping students with math.
        
        Question: ${question.question}
        Student answered: ${studentAnswer}
        Correct answer: ${question.answer}
        
        Give a gentle hint without revealing the answer.
        Be encouraging and supportive. Keep it under 50 words.
        Use "woof" occasionally to stay in character!`
      }]
    })
  });
  
  const data = await response.json();
  return data.content[0].text;
}
```

**Cost:** ~$0.001-0.003 per hint, viable at scale

---

## Testing Strategy

### Phase 1 Testing (Manual):
- Loli playtesting (primary validation)
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile responsive testing (phone, tablet)
- Save/load testing (close browser, reopen - data persists?)

### Phase 2+ Testing (Automated):
- Unit tests for core functions (Jest)
- Integration tests for game flows
- User acceptance testing (formal protocols)

---

## Deployment Strategy

### Phase 1: GitHub Pages
**How to deploy:**
1. Commit code to GitHub repository
2. Enable GitHub Pages in repo settings
3. Set source to main branch
4. Site live at: `https://studypups.github.io/math-adventure/`

**Benefits:**
- Free hosting
- Automatic deployment (push = update)
- Custom domain possible
- HTTPS included

---

## Code Comments Philosophy

**Bad comment:**
```javascript
// Add 1 to gems
gems = gems + 1;
```

**Good comment:**
```javascript
// Award gem for correct answer to maintain engagement loop
// ADHD learners need immediate positive reinforcement
gameState.stats.totalGems += gemRewards[difficulty];
```

**Comment WHY, not WHAT** - the code shows what it does, comments explain reasoning

---

## When You Get Stuck (Technical Troubleshooting)

### Process:
1. **Read error message carefully** (they're usually helpful!)
2. **Check console** (browser DevTools → Console tab)
3. **Add console.log()** to see what's happening
4. **Google the exact error** (probably someone solved it)
5. **Ask Claude** (Coding chat for technical help)
6. **Take a break** (seriously, solutions often come after stepping away)

### Common Beginner Issues:

**"Nothing shows on page"**
- Check: Is JavaScript file linked in HTML? (`<script src="...">`)
- Check: Console for errors
- Check: File paths (case-sensitive!)

**"Save data not persisting"**
- Check: localStorage quota (browser limits)
- Check: Private browsing mode (localStorage disabled)
- Check: JSON.stringify/parse errors

**"CSS not loading"**
- Check: File path in `<link>` tag
- Check: Hard refresh (Ctrl+Shift+R)
- Check: CSS file uploaded to GitHub

---

**Last Updated:** 2026-01-22  
**Current Version:** Phase 1 in development  
**Tech Lead:** Dominique (with Claude assistance!)
