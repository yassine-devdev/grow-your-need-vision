# Gamification App - PocketBase Collections Setup

## Required Collections

### 1. `gamification_achievements`
**Purpose**: Define available achievements that users can unlock

```javascript
{
  "name": "text (required, unique)",
  "description": "text (required)",
  "icon": "text (emoji or icon code)",
  "category": "select (Learning, Social, Activity, Milestone)",
  "xp_reward": "number (default: 100)",
  "requirement_type": "select (count, score, streak)",
  "requirement_value": "number (required)",
  "rarity": "select (Common, Rare, Epic, Legendary)"
}
```

**Indexes**: `category`, `rarity`

### 2. `user_achievements`
**Purpose**: Track which achievements users have unlocked

```javascript
{
  "user": "relation (users, required)",
  "achievement": "relation (gamification_achievements, required)",
  "progress": "number (0-100, default: 0)",
  "completed": "bool (default: false)",
  "unlocked_at": "date (optional)"
}
```

**Indexes**: `user`, `achievement`, `completed`  
**Unique**: `user` + `achievement`

### 3. `gamification_progress`
**Purpose**: Track user's overall gamification stats (already exists)

```javascript
{
  "user": "relation (users, required, unique)",
  "level": "number (default: 1)",
  "current_xp": "number (default: 0)",
  "total_xp": "number (default: 0)",
  "achievements_unlocked": "number (default: 0)",
  "streak_days": "number (default: 0)",
  "last_activity": "date"
}
```

### 4. `gamification_rewards`
**Purpose**: Define rewards available in the store

```javascript
{
  "name": "text (required)",
  "description": "text (required)",
  "cost_xp": "number (required)",
  "category": "select (Avatar, Theme, Badge, Power-Up)",
  "icon": "text (emoji or icon code)",
  "available": "bool (default: true)"
}
```

### 5. `user_rewards`
**Purpose**: Track rewards purchased by users

```javascript
{
  "user": "relation (users, required)",
  "reward": "relation (gamification_rewards, required)",
  "purchased_at": "date (required)",
  "equipped": "bool (default: false)"
}
```

**Indexes**: `user`, `equipped`

### 6. `gamification_challenges` (Optional)
**Purpose**: Daily/weekly challenges

```javascript
{
  "title": "text (required)",
  "description": "text (required)",
  "type": "select (Daily, Weekly, Special)",
  "xp_reward": "number (required)",
  "status": "select (Active, Expired, Completed)",
  "expires_at": "date",
  "target_user": "relation (users, optional)" // Empty = for all users
}
```

---

## Sample Data

### Sample Achievements

```javascript
// First Steps - Common
{
  "name": "First Steps",
  "description": "Complete your first lesson",
  "icon": "👣",
  "category": "Learning",
  "xp_reward": 50,
  "requirement_type": "count",
  "requirement_value": 1,
  "rarity": "Common"
}

// Social Butterfly - Rare
{
  "name": "Social Butterfly",
  "description": "Make 10 friends on the platform",
  "icon": "🦋",
  "category": "Social",
  "xp_reward": 200,
  "requirement_type": "count",
  "requirement_value": 10,
  "rarity": "Rare"
}

// Quiz Master - Epic
{
  "name": "Quiz Master",
  "description": "Score 100% on 5 quizzes in a row",
  "icon": "🎯",
  "category": "Learning",
  "xp_reward": 500,
  "requirement_type": "streak",
  "requirement_value": 5,
  "rarity": "Epic"
}

// Legend - Legendary
{
  "name": "Legend",
  "description": "Reach Level 50",
  "icon": "👑",
  "category": "Milestone",
  "xp_reward": 5000,
  "requirement_type": "count",
  "requirement_value": 50,
  "rarity": "Legendary"
}
```

### Sample Rewards

```javascript
// Avatar Border
{
  "name": "Golden Border",
  "description": "Unlock a shiny golden border for your avatar",
  "cost_xp": 1000,
  "category": "Avatar",
  "icon": "🟡",
  "available": true
}

// Theme
{
  "name": "Dark Mode Pro",
  "description": "Premium dark theme with custom colors",
  "cost_xp": 2500,
  "category": "Theme",
  "icon": "🌙",
  "available": true
}

// Power-Up
{
  "name": "XP Booster",
  "description": "2x XP for 24 hours",
  "cost_xp": 500,
  "category": "Power-Up",
  "icon": "⚡",
  "available": true
}

// Badge
{
  "name": "Early Adopter",
  "description": "Special badge for early platform users",
  "cost_xp": 100,
  "category": "Badge",
  "icon": "🌟",
  "Available": true
}
```

---

## API Rules (PocketBase)

### `gamification_achievements`
```javascript
// List/View
@request.auth.id != ""

// Create/Update/Delete
@request.auth.role = "Admin"
```

### `user_achievements`
```javascript
// List/View
@request.auth.id = user.id || @request.auth.role ~ "Admin|Teacher"

// Create
@request.auth.role ~ "Admin|System" || 
(@request.auth.id = @request.data.user && @request.data.completed = false)

// Update
@request.auth.role ~ "Admin|System" ||
(@request.auth.id = user.id && @request.data.progress >= @request.before.progress)

// Delete
@request.auth.role = "Admin"
```

### `gamification_rewards`
```javascript
// List/View
@request.auth.id != "" && available = true

// Create/Update/Delete
@request.auth.role = "Admin"
```

### `user_rewards`
```javascript
// List/View
@request.auth.id = user.id || @request.auth.role = "Admin"

// Create
@request.auth.id = @request.data.user

// Update (equip/unequip)
@request.auth.id = user.id

// Delete
@request.auth.role = "Admin"
```

---

## Quick Setup - Create All Collections

### Step 1: Create Achievements Collection
```bash
# In PocketBase Admin → Collections → New Collection
Name: gamification_achievements
Type: Base
```

### Step 2: Add Sample Achievements
Use the sample data above or create your own!

### Step 3: Test Integration
1. Open Gamification app
2. Navigate to Achievements tab
3. Verify achievements display correctly

---

## Integration with Edumultiverse

The Gamification app is now integrated with Edumultiverse:

1. **Completing quizzes** → Unlocks achievements
2. **Leveling up** → Unlocks new universe access
3. **XP rewards** → Can purchase rewards in store

### Automatically Unlock Achievement Example:
```typescript
// In QuantumQuiz.tsx after completing quiz
import { gamificationService } from '../../../services/gamificationService';

async function completeQuiz() {
  // Award XP (already done)
  await addXP(scoreXp);
  
  // Check if user should unlock "Quiz Master" achievement
  const userAchievements = await gamificationService.getUserAchievements(user.id);
  const quizMasterAchievement = achievements.find(a => a.name === "Quiz Master");
  
  if (perfectScore && !hasUnlocked(quizMasterAchievement.id)) {
    await gamificationService.unlockAchievement(user.id, quizMasterAchievement.id);
  }
}
```

---

**Status**: Collections defined  
**Next Step**: Create collections in PocketBase admin panel  
**Estimated Setup Time**: 15-20 minutes
