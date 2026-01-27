# StudyPups Game Design Decisions

## Purpose
This document tracks every significant design decision, why it was made, what alternatives were considered, and the results. This becomes invaluable when you need to explain your choices to partners/investors, or when you need to remember why you did something.

---

## Decision Log

### 2026-01-22: Tutorial Structure - Rescue the Fairy
**Decision:** Tutorial begins with rescuing a math fairy trapped in pattern vines  
**Why:** 
- Immediate engagement (action, not exposition)
- Teaches core mechanic (patterns) first
- Creates emotional investment (help someone in distress)
- Introduces hint system organically (fairy teaches you)

**Alternative considered:** 
- Start with Teddy introduction and backstory
- Begin with Princess Algebra recruitment message

**Why rejected:**
- ADHD learners jump in first, read instructions later
- Story setup feels like homework if it's passive
- Need hook within first 30 seconds

**Result:** [TBD after Loli testing]

**Date implemented:** [TBD]

---

### 2026-01-22: Gem Economy System
**Decision:** [PENDING - Need to finalize]

**Key questions to resolve:**
- How many gems per correct answer? (Consider: 1-3 based on difficulty?)
- How much do items cost? (Consider: 10-50 gem range for achievements?)
- Do gems reset or accumulate forever?
- Can you lose gems? (Recommendation: NO - only lose hint availability)
- Are gems the only currency or do we need multiple?

**Considerations:**
- ADHD need for immediate reward (gems must feel frequent)
- Balance: Too easy = no achievement feeling, too hard = frustration
- Long-term engagement (always something to save for)
- Avoid punitive systems (wrong answers shouldn't take gems away)

**Next step:** Test different gem amounts with Loli, observe what feels rewarding

---

### 2026-01-22: Project Scope - Vertical Slice Focus
**Decision:** Phase 1 builds vertical slice (15-20 min complete gameplay) rather than horizontal slice (all features half-done)

**Why:**
- Proves complete game loop works
- Can pitch/test with one polished experience
- Better for learning (finish one thing fully before moving on)
- Demonstrates scalability without building everything

**What's included in vertical slice:**
- Tutorial (rescue fairy, 5 pattern problems)
- One complete "job shift" (10 pattern problems in story context)
- Gem economy (earn throughout gameplay)
- Simple shop (5 items, buy one)
- Puppy Home (see Teddy wearing purchased item)
- Completion certificate

**What's delayed to Phase 2:**
- Multiple locations/jobs
- Additional StudyPups beyond Teddy
- Teacher dashboard
- Social features
- Other curriculum areas

**Result:** Allows completion in 6 months vs. years

---

### [Template for Future Decisions]
**Decision:** [What you decided]  
**Why:** [Reasoning]  
**Alternative considered:** [What else you thought about]  
**Why rejected:** [Why alternatives didn't work]  
**Result:** [What happened when implemented]  
**Date implemented:** [When it went live]

---

## Design Principles (Constants)

These don't change - they guide all decisions:

1. **Loli First:** If it doesn't work for her, it doesn't work
2. **ADHD-Optimized:** Immediate feedback, clear progress, no punishment for exploration
3. **Story Over Drill:** Math embedded in narrative, not worksheets disguised
4. **Respectful:** Never shame, always encourage
5. **Achievable:** Success feels earned but accessible
6. **Scalable:** Design for one, build for thousands

---

## Questions Tracker

Ongoing questions that need resolution:

- [ ] How many hints before suggesting break? (Currently 3)
- [ ] Should there be difficulty settings or adaptive difficulty?
- [ ] Voice acting for Teddy or text-only?
- [ ] How to handle wrong answers pedagogically? (Try again vs. show solution vs. progressive hints)
- [ ] Background music - yes/no? If yes, what style?

---

**Last Updated:** 2026-01-22  
**Status:** Active development, Phase 1

### 2026-01-22: Gem Economy System - Complete Design

**Decision:** Gems are earned per shift, must spend on food, progression required for better items

**Core Mechanics:**
- Earn gems by completing practice shifts (even repeat shifts)
- Must feed StudyPups regularly or they "run away"
- Higher level jobs = more gems per shift
- Better items require more gems (can't afford without advancing)

**Why this works:**
- Food cost prevents camping at easy levels forever
- Run away mechanic = gentle consequence (not harsh)
- Encourages practice (gems for repeat shifts)
- Natural progression curve (need promotion for cool stuff)

**Economics (DRAFT - needs testing):**
**Earnings:**
- Level 1: 3 gems/shift
- Level 2: 5 gems/shift
- Level 3: 8 gems/shift
- Level 4: 12 gems/shift

**Costs:**
- Food: 2 gems/pup (per day? per 3 shifts? TBD)
- Basic items: 10 gems
- Medium items: 25 gems
- Special items: 50 gems

**Questions to resolve:**
- How often must pups be fed?
- How many missed feedings before run away?
- Can you get them back? How?
- Does food cost scale with pup count?
- Should there be "treats" (optional) vs "food" (required)?

**Next steps:**
1. Build basic gem counter
2. Test earning rate with Loli (does 3 gems feel rewarding?)
3. Design food/feeding UI
4. Test progression pressure (when does she WANT to advance?)

**Result:** [TBD after implementation and testing]

### 2026-01-22: Single vs Multi-Currency System

**Question:** Should items cost domain-specific gems (red for geometry, yellow for algebra) to force curriculum coverage?

**Options considered:**

**Option A: Universal gems only**
- Pro: Simple, flexible
- Con: Kids can avoid hard topics

**Option B: Domain-specific gems**
- Pro: Forces balanced practice
- Con: Complex UI, might frustrate

**Option C: Hybrid (gems + tokens)**
- Gems (universal) for most items
- Tokens (domain-specific) to unlock StudyPups & special items
- Tokens earned per completed shift, not per question

**Decision:** START with gems only (Phase 1), ADD tokens if needed (Phase 2)

**Reasoning:**
- Simpler for vertical slice
- Easier to add later than remove
- Can test with Loli if single currency is engaging enough
- If she avoids topics, we know we need tokens

**Implementation:**
Phase 1: Just gems (2-4 per question)
Phase 2: Add tokens (1 per completed shift)
- StudyPups cost tokens to unlock
- Special items cost gems + tokens

**Next steps:**
1. Build gem system
2. Test with Loli
3. Observe: Does she naturally try all topics or avoid some?
4. Decide on tokens based on data

**Result:** [TBD after Phase 1 testing]

### 2026-01-22: User-Generated Custom Items

**Decision:** Allow Loli to design custom items (drawn on paper → AI converted → in-game)

**Why:**
- Personal investment (her art in the game!)
- Increased engagement (has to earn gems to buy her own creation)
- Creative expression within educational context
- Pride of ownership (this is MY game)

**Phase 1 Implementation (Now):**
- Loli draws: ball, bow tie, fancy food bowl
- I photograph drawings
- AI converts to game assets (manual process)
- Add to her shop as special items
- Test: Does this increase her engagement?

**Future Expansion (Phase 3-4):**
- All students can upload/create custom items
- Items go into their personal shop first
- Can share designs with classmates (MySpace-style profiles)
- Creators earn small royalty when others buy their design
- Teacher moderation for shared items

**Educational Benefits:**
- Math: Still earning gems through practice
- Art: Creative expression, design thinking
- Economics: Understanding value, royalties concept
- Social: Sharing creations, positive peer interaction
- Tech: Photo upload, AI tools exposure

**Questions to resolve:**
- Does Loli engage more with custom items?
- Do other kids want this feature?
- What's reasonable royalty amount? (1-2 gems?)
- How to handle moderation at scale?

**Next steps:**
1. Ask Loli to draw 3 items
2. Convert with AI (test prompt engineering)
3. Add to game during 3-day sprint
4. Observe her reaction
5. Document in testing log

**Result:** [TBD after Loli tests]