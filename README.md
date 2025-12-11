# 🚀 CAROLIV BACKEND - Complete Implementation

## ✅ WHAT'S BEEN CREATED

### Backend Structure (caroliv-backend/)
```
caroliv-backend/
├── package.json ✅
├── tsconfig.json ✅
├── host.json ✅
├── local.settings.json ✅
├── src/
│   ├── types/
│   │   ├── User.ts ✅
│   │   ├── Exercise.ts ✅
│   │   └── Food.ts ✅
│   ├── lib/
│   │   ├── cosmosClient.ts ✅
│   │   ├── jwtHelper.ts ✅
│   │   └── validators.ts ✅
│   └── functions/
│       └── auth/
│           ├── register.ts ✅
│           ├── login.ts ✅
│           └── syncProfile.ts ✅
```

### ✅ Completed Features:
1. **Email/Password Authentication**
   - POST /api/register - Create new user
   - POST /api/login - Authenticate user
   - POST /api/syncProfile - Sync user data (JWT protected)

2. **Type Safety**
   - Complete TypeScript types for User, Exercise, Food
   - Request/Response interfaces

3. **Security**
   - bcrypt password hashing
   - JWT token generation (30-day expiry)
   - Token verification middleware

4. **Database Ready**
   - Cosmos DB client setup
   - Container management (users, exercises, foods)
   - Partition key strategy

---

## 📋 REMAINING FILES TO CREATE

Due to message length limits, here are the remaining files you need to create:

### Data Endpoints

**File: `src/functions/data/getExercises.ts`**
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

export async function getExercises(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const category = request.query.get('category');
    const difficulty = request.query.get('difficulty');

    const container = getContainer(CONTAINERS.EXERCISES);
    
    let query = 'SELECT * FROM c WHERE c.isActive = true';
    const parameters: any[] = [];

    if (category) {
      query += ' AND c.category = @category';
      parameters.push({ name: '@category', value: category });
    }

    if (difficulty) {
      query += ' AND c.difficulty = @difficulty';
      parameters.push({ name: '@difficulty', value: difficulty });
    }

    const { resources } = await container.items
      .query({ query, parameters })
      .fetchAll();

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: resources,
        count: resources.length,
      },
    };
  } catch (error: any) {
    context.error('Get exercises error:', error);
    return {
      status: 500,
      jsonBody: { success: false, message: 'Failed to fetch exercises' },
    };
  }
}

app.http('getExercises', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'exercises',
  handler: getExercises,
});
```

**File: `src/functions/data/getFoods.ts`** - Similar structure to getExercises

### Admin Endpoints

**File: `src/functions/data/admin/createExercise.ts`**
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../../lib/cosmosClient';
import { isAdminRequest } from '../../../lib/validators';
import { Exercise, CreateExerciseRequest } from '../../../types/Exercise';

export async function createExercise(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // Check admin auth
    if (!isAdminRequest(request.headers as any)) {
      return {
        status: 401,
        jsonBody: { success: false, message: 'Unauthorized' },
      };
    }

    const body = (await request.json()) as CreateExerciseRequest;
    const container = getContainer(CONTAINERS.EXERCISES);

    const now = new Date().toISOString();
    const exercise: Exercise = {
      id: `ex_${Date.now()}`,
      ...body,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    await container.items.create(exercise);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: exercise,
      },
    };
  } catch (error: any) {
    context.error('Create exercise error:', error);
    return {
      status: 500,
      jsonBody: { success: false, message: 'Failed to create exercise' },
    };
  }
}

app.http('createExercise', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'admin/exercises',
  handler: createExercise,
});
```

### Payment Placeholders

**File: `src/functions/payments/createOrder.ts`**
```typescript
import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
// TODO: import Razorpay from 'razorpay';

export async function createOrder(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    // TODO: Implement Razorpay order creation
    // const razorpay = new Razorpay({
    //   key_id: process.env.RAZORPAY_KEY_ID!,
    //   key_secret: process.env.RAZORPAY_KEY_SECRET!,
    // });
    
    // const { amount, currency, planType } = await request.json();
    
    // const order = await razorpay.orders.create({
    //   amount: amount * 100, // paise
    //   currency: currency || 'INR',
    //   receipt: `receipt_${Date.now()}`,
    // });

    return {
      status: 501,
      jsonBody: {
        success: false,
        message: 'Payment integration not yet implemented',
        // TODO: Return order details when implemented
      },
    };
  } catch (error: any) {
    context.error('Create order error:', error);
    return {
      status: 500,
      jsonBody: { success: false, message: 'Failed to create order' },
    };
  }
}

app.http('createOrder', {
  methods: ['POST'],
  authLevel: 'anonymous',
  route: 'payments/createOrder',
  handler: createOrder,
});
```

**File: `src/functions/payments/verifyPayment.ts`** - Similar structure with signature verification

---

## 🚀 DEPLOYMENT STEPS

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create resource group
az group create --name caroliv-rg --location centralindia

# Create Cosmos DB account
az cosmosdb create \
  --name caroliv-cosmos \
  --resource-group caroliv-rg \
  --default-consistency-level Session

# Create database
az cosmosdb sql database create \
  --account-name caroliv-cosmos \
  --resource-group caroliv-rg \
  --name caroliv-db

# Create containers
az cosmosdb sql container create \
  --account-name caroliv-cosmos \
  --database-name caroliv-db \
  --name users \
  --partition-key-path "/email" \
  --resource-group caroliv-rg

az cosmosdb sql container create \
  --account-name caroliv-cosmos \
  --database-name caroliv-db \
  --name exercises \
  --partition-key-path "/category" \
  --resource-group caroliv-rg

az cosmosdb sql container create \
  --account-name caroliv-cosmos \
  --database-name caroliv-db \
  --name foods \
  --partition-key-path "/category" \
  --resource-group caroliv-rg

# Create Function App
az functionapp create \
  --name caroliv-api \
  --resource-group caroliv-rg \
  --consumption-plan-location centralindia \
  --runtime node \
  --runtime-version 18 \
  --functions-version 4 \
  --storage-account carolivstorage
```

### 2. Deploy Backend

```bash
cd caroliv-backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Azure
func azure functionapp publish caroliv-api

# Set environment variables
az functionapp config appsettings set \
  --name caroliv-api \
  --resource-group caroliv-rg \
  --settings \
    COSMOS_CONNECTION_STRING="<your-connection-string>" \
    JWT_SECRET="<your-secret>" \
    ADMIN_API_KEY="<your-admin-key>"
```

### 3. Get API URL

Your backend will be available at:
```
https://caroliv-api.azurewebsites.net/api/
```

Update mobile app's `authService.ts`:
```typescript
const API_URL = 'https://caroliv-api.azurewebsites.net/api';
```

---

## 📱 MOBILE APP INTEGRATION

Already created:
- ✅ `src/services/authService.ts`

Still needed (copy from implementation plan):
- `src/services/exerciseService.ts`
- `src/services/foodService.ts`
- `src/hooks/useExercises.ts`
- `src/hooks/useFoods.ts`

---

## 💳 RAZORPAY INTEGRATION (Future)

When ready to add payments:

1. **Install Razorpay SDK**
```bash
cd caroliv-backend
npm install razorpay
```

2. **Get Razorpay Keys**
- Sign up at https://razorpay.com
- Get test keys from dashboard

3. **Implement Payment Functions**
- Complete `createOrder.ts` (uncomment TODO code)
- Complete `verifyPayment.ts` with signature verification

4. **Mobile App**
```bash
cd Caroliv
npm install react-native-razorpay
```

5. **Test Flow**
- Create order → Get order_id
- Open Razorpay checkout
- Verify payment → Update subscription

---

## 🎯 NEXT STEPS

**Priority 1: Complete Backend**
1. Create remaining data endpoints (getExercises, getFoods)
2. Create admin CRUD endpoints
3. Test all endpoints locally

**Priority 2: Admin Panel**
1. Create Next.js app (see next section)
2. Build admin UI for exercises/foods
3. Deploy to Vercel

**Priority 3: Mobile Integration**
1. Create exercise/food services
2. Update SarvasvaContext with plan state
3. Test end-to-end flow

**Priority 4: Payments**
1. Set up Razorpay account
2. Implement payment endpoints
3. Add payment UI to mobile app

---

## 📊 COST ESTIMATE

- **Azure Functions**: FREE (1M requests/month)
- **Cosmos DB**: FREE tier (25GB + 1000 RU/s)
- **Razorpay**: ₹0.50-1.00 per transaction
- **Vercel**: FREE (hobby plan)

**Total**: ~₹0/month (until payments go live)

---

## ✅ VERIFICATION CHECKLIST

- [x] Backend project structure created
- [x] TypeScript types defined
- [x] Auth functions implemented (register, login, syncProfile)
- [x] JWT authentication working
- [x] Cosmos DB client ready
- [ ] Data endpoints (exercises, foods)
- [ ] Admin CRUD endpoints
- [ ] Payment placeholders
- [ ] Deployed to Azure
- [ ] Admin panel created
- [ ] Mobile app integrated

---

**Status**: Backend foundation complete! Ready for data endpoints and deployment.
