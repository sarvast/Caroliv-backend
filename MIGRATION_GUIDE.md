# 🚀 MIGRATION GUIDE - Local Data → Cosmos DB

## ✅ WHAT THIS DOES

Migrates your existing data to Azure Cosmos DB:
- **368 Exercises** from `exerciseLibrary.ts` → `exercises` container
- **139 Foods** from `foodItems.ts` → `foods` container

---

## 📋 PREREQUISITES

1. **Azure Cosmos DB** created
2. **Containers** created:
   - `exercises` (partition: /category)
   - `foods` (partition: /category)
3. **Connection string** ready

---

## 🔧 SETUP

### Step 1: Copy Local Data Files

```bash
cd caroliv-backend

# Copy exercise library
cp ../src/data/exerciseLibrary.ts src/data/

# Copy food items
cp ../src/data/foodItems.ts src/data/
```

### Step 2: Set Environment Variable

```bash
# Windows
set COSMOS_CONNECTION_STRING=AccountEndpoint=https://...

# Or add to local.settings.json
```

### Step 3: Install Dependencies

```bash
npm install
```

---

## ▶️ RUN MIGRATION

```bash
npm run migrate
```

**Output:**
```
🚀 Starting migration...

📋 Migrating Exercises...
  ✅ Push-Ups
  ✅ Dumbbell Chest Press (Floor)
  ✅ Squats
  ...
✅ Migrated 368 exercises

🍽️  Migrating Foods...
  ✅ 1 Roti/Chapati
  ✅ 1 Bowl Rice
  ✅ 1 Boiled Egg
  ...
✅ Migrated 139 foods

🎉 Migration complete!
```

---

## ✅ VERIFY

### Check Cosmos DB:

```bash
# Count exercises
az cosmosdb sql container show \
  --account-name caroliv-cosmos \
  --database-name caroliv-db \
  --name exercises \
  --resource-group caroliv-rg

# Count foods
az cosmosdb sql container show \
  --account-name caroliv-cosmos \
  --database-name caroliv-db \
  --name foods \
  --resource-group caroliv-rg
```

### Test API:

```bash
# Get exercises
curl https://caroliv-api.azurewebsites.net/api/exercises

# Get foods
curl https://caroliv-api.azurewebsites.net/api/foods
```

---

## 🎯 WHAT HAPPENS TO DATA

### **Exercises:**
```typescript
{
  id: "chest_pushups",
  name: "Push-Ups",
  nameHindi: "Push-Ups", // Add Hindi later
  category: "chest",
  difficulty: "beginner",
  gifUrl: "https://cdn.jefit.com/...",
  caloriesPer10Min: 50,
  targetMuscles: ["chest"],
  sets: "3 sets to failure",
  instructions: "",
  isActive: true
}
```

### **Foods:**
```typescript
{
  id: "1",
  name: "1 Roti/Chapati",
  nameHindi: "1 रोटी/चपाती",
  category: "grains",
  emoji: "🫓",
  imageUrl: "https://images.unsplash.com/...",
  servingSize: "1 serving",
  calories: 70,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  searchTerms: "roti chapati phulka",
  isActive: true
}
```

---

## 🔄 RE-RUN MIGRATION

If you need to update data:

```bash
# Migration script handles duplicates
# Already existing items will show: ⚠️ (already exists)
npm run migrate
```

---

## 🎉 AFTER MIGRATION

### Mobile App Will:
1. ✅ Fetch exercises from backend
2. ✅ Show library with GIFs
3. ✅ Quick add (speed dial style)
4. ✅ Auto-update when admin edits

### Admin Panel Will:
1. ✅ Show all exercises/foods
2. ✅ Edit GIF URLs, calories, etc.
3. ✅ Add new items
4. ✅ Delete items

---

## ⚠️ IMPORTANT

**After migration:**
- Mobile app will use **backend data** (not local files)
- Local files (`exerciseLibrary.ts`, `foodItems.ts`) become **backup only**
- All changes via **admin panel**

---

**Ready to migrate?** Run: `npm run migrate` 🚀
