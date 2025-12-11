# 🔧 Azure Functions Deployment - Problem Fix

## ❌ **Problem Identified**

Azure Portal me functions nahi dikh rahe kyunki:
1. ✅ Code sahi hai
2. ✅ `app.http()` use ho raha hai (Azure Functions v4)
3. ❌ **Entry point missing** - Sab functions ko ek jagah register karna padega

## ✅ **Solution Applied**

Maine ye changes kiye hain:

### 1. Created Entry Point (`src/functions.ts`)
```typescript
// All functions ko import karta hai
import './functions/auth/login';
import './functions/auth/register';
import './functions/auth/syncProfile';
import './functions/data/getFoods';
import './functions/data/getExercises';
import './functions/admin/foodsAdmin';
import './functions/admin/exercisesAdmin';
import './functions/logs/getDailyLogs';
import './functions/logs/logFood';
import './functions/logs/logWorkout';
```

### 2. Updated `package.json`
```json
{
  "main": "dist/src/functions.js"  // Single entry point
}
```

---

## 🚀 **Ab Ye Commands Run Karo**

### Step 1: Build Karo
```bash
cd C:\Users\Admin\OneDrive\Desktop\Caroliv\caroliv-backend
npm run build
```

**Check karo**: `dist/src/functions.js` file banni chahiye

### Step 2: Deploy Karo
```bash
func azure functionapp publish caroliv-api
```

### Step 3: Verify Karo
Azure Portal me jao:
1. **caroliv-api** → **Functions**
2. Ye **10 functions** dikhne chahiye:
   - login
   - register
   - syncProfile
   - getFoods
   - getExercises
   - createFood
   - updateFood
   - deleteFood
   - createExercise
   - updateExercise
   - deleteExercise
   - getDailyLogs
   - logFood
   - logWorkout

---

## 🐛 **Agar Build Fail Ho**

### Check TypeScript Errors
```bash
npm run build
```

Agar errors aayein, to dikha do. Main fix kar dunga.

### Check dist/ Folder
```bash
dir dist\src
```

`functions.js` file honi chahiye.

---

## 📊 **Functions List (Expected)**

| Function Name | Route | Method | Purpose |
|--------------|-------|--------|---------|
| login | `/api/login` | POST | User login |
| register | `/api/register` | POST | User registration |
| syncProfile | `/api/syncProfile` | POST | Sync user profile |
| getFoods | `/api/foods` | GET | Get foods list |
| getExercises | `/api/exercises` | GET | Get exercises list |
| createFood | `/api/admin/foods` | POST | Create food (admin) |
| updateFood | `/api/admin/foods/{id}` | PUT | Update food (admin) |
| deleteFood | `/api/admin/foods/{id}` | DELETE | Delete food (admin) |
| createExercise | `/api/admin/exercises` | POST | Create exercise (admin) |
| updateExercise | `/api/admin/exercises/{id}` | PUT | Update exercise (admin) |
| deleteExercise | `/api/admin/exercises/{id}` | DELETE | Delete exercise (admin) |
| getDailyLogs | `/api/logs` | GET | Get daily logs |
| logFood | `/api/logs/food` | POST | Log food entry |
| logWorkout | `/api/logs/workout` | POST | Log workout |

---

## ✅ **After Deployment**

### Test Login API
```bash
curl -X POST https://caroliv-api.azurewebsites.net/api/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@test.com\",\"password\":\"test123\"}"
```

### Test Get Foods
```bash
curl https://caroliv-api.azurewebsites.net/api/foods
```

---

## 🎯 **Next Steps**

1. **Build karo** (check for errors)
2. **Deploy karo**
3. **Portal me verify karo**
4. **APIs test karo**
5. **Mobile app update karo** (MOCK_MODE = false)

---

**Status**: Fix applied! Ab build aur deploy karo! 🚀
