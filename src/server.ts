import express, { Request, Response } from 'express';
import cors from 'cors';
import { getContainer, CONTAINERS } from './lib/cosmosClient';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || '##hellosarvasva69';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for images

// Health check
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'Caroliv API is running!', version: '1.0.0' });
});

// ============ AI ENDPOINT ============
app.post('/api/ai/analyze-food', async (req: Request, res: Response) => {
    try {
        const { image, text } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ success: false, message: 'Gemini API Key missing' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `Analyze this food and identify the food item name and estimate calories and macros (protein, carbs, fat) for a standard serving. 
        Detailed requirements:
        1. Identify the food name clearly.
        2. Estimate calories (kcal).
        3. Estimate protein (g), carbs (g), fat (g).
        4. Suggest a serving size.
        
        Return STRICTLY valid JSON only, no markdown, no other text.
        Format:
        {
            "name": "Food Name",
            "calories": 0,
            "protein": 0,
            "carbs": 0,
            "fat": 0,
            "servingSize": "1 plate"
        }`;

        let result;
        if (image) {
            // Assume image is base64 string without data:image/jpeg;base64 prefix if possible, or handle it
            // usually client sends clean base64
            const cleanImage = image.replace(/^data:image\/\w+;base64,/, "");

            const imagePart = {
                inlineData: {
                    data: cleanImage,
                    mimeType: "image/jpeg"
                }
            };
            result = await model.generateContent([prompt, imagePart]);
        } else if (text) {
            result = await model.generateContent([prompt, `Food description: ${text}`]);
        } else {
            return res.status(400).json({ success: false, message: 'Image or text required' });
        }

        const response = await result.response;
        const textResponse = response.text();

        console.log('Gemini Response:', textResponse);

        // Clean markdown if present
        const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        const json = JSON.parse(cleaned);

        res.json({ success: true, data: json });

    } catch (error: any) {
        console.error("AI Analysis Error:", error);
        res.status(500).json({ success: false, message: "AI Analysis failed", error: error.message });
    }
});

// ============ AUTH ENDPOINTS ============

// Login
app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const container = getContainer(CONTAINERS.USERS);
        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.email = @email',
                parameters: [{ name: '@email', value: email.toLowerCase() }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const user = resources[0];
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
                weight: user.weight,
                height: user.height,
                goal: user.goal,
                activityLevel: user.activityLevel,
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Register
app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, age, gender, weight, height, targetWeight, goal, activityLevel } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const container = getContainer(CONTAINERS.USERS);

        // Check if user exists
        const { resources: existing } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.email = @email',
                parameters: [{ name: '@email', value: email.toLowerCase() }]
            })
            .fetchAll();

        if (existing && existing.length > 0) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        const user = {
            id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name || '',
            age: age || 0,
            gender: gender || '',
            weight: weight || 0,
            height: height || 0,
            targetWeight: targetWeight || 0,
            goal: goal || 'maintain',
            activityLevel: activityLevel || 'moderate',
            createdAt: now,
            updatedAt: now,
        };

        await container.items.create(user);

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
                weight: user.weight,
                height: user.height,
                targetWeight: user.targetWeight,
                goal: user.goal,
                activityLevel: user.activityLevel,
            }
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Sync Profile
app.post('/api/syncprofile', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const { name, age, gender, weight, height, targetWeight, goal, activityLevel } = req.body;

        const container = getContainer(CONTAINERS.USERS);

        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.email = @email',
                parameters: [{ name: '@email', value: decoded.email }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const user = resources[0];
        const updated = {
            ...user,
            name: name ?? user.name,
            age: age ?? user.age,
            gender: gender ?? user.gender,
            weight: weight ?? user.weight,
            height: height ?? user.height,
            targetWeight: targetWeight ?? user.targetWeight,
            goal: goal ?? user.goal,
            activityLevel: activityLevel ?? user.activityLevel,
            updatedAt: new Date().toISOString(),
        };

        await container.item(user.id, user.email).replace(updated);

        res.json({ success: true, user: updated });
    } catch (error: any) {
        console.error('Sync profile error:', error);
        res.status(500).json({ success: false, message: 'Profile sync failed' });
    }
});

// ============ DATA ENDPOINTS ============

// Get Foods
app.get('/api/foods', async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string;
        const search = req.query.search as string;

        const container = getContainer(CONTAINERS.FOODS);

        let query = 'SELECT * FROM c WHERE c.isActive = true';
        const parameters: any[] = [];

        if (category) {
            query += ' AND c.category = @category';
            parameters.push({ name: '@category', value: category });
        }

        if (search) {
            query += ' AND (CONTAINS(LOWER(c.name), LOWER(@search)) OR CONTAINS(LOWER(c.nameHindi), LOWER(@search)))';
            parameters.push({ name: '@search', value: search });
        }

        query += ' ORDER BY c.name ASC';

        const { resources } = await container.items.query({ query, parameters }).fetchAll();

        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Get foods error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch foods' });
    }
});

// Get Exercises
app.get('/api/exercises', async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string;
        const difficulty = req.query.difficulty as string;

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

        query += ' ORDER BY c.name ASC';

        const { resources } = await container.items.query({ query, parameters }).fetchAll();

        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Get exercises error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
    }
});

// ============ ADMIN ENDPOINTS ============

// Get all foods (admin)
app.get('/api/admin/foods', async (req: Request, res: Response) => {
    try {
        const container = getContainer(CONTAINERS.FOODS);
        const { resources } = await container.items.readAll().fetchAll();
        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Admin get foods error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch foods' });
    }
});

// Create food
app.post('/api/admin/foods', async (req: Request, res: Response) => {
    try {
        const container = getContainer(CONTAINERS.FOODS);
        const now = new Date().toISOString();

        const food = {
            id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...req.body,
            isActive: req.body.isActive !== false,
            createdAt: now,
            updatedAt: now,
        };

        await container.items.create(food);
        res.json({ success: true, data: food });
    } catch (error: any) {
        console.error('Create food error:', error);
        res.status(500).json({ success: false, message: 'Failed to create food' });
    }
});

// Update food
app.put('/api/admin/foods/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const container = getContainer(CONTAINERS.FOODS);

        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        const existing = resources[0];
        const updated = {
            ...existing,
            ...req.body,
            id: existing.id,
            createdAt: existing.createdAt,
            updatedAt: new Date().toISOString(),
        };

        await container.item(id, updated.category).replace(updated);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        console.error('Update food error:', error);
        res.status(500).json({ success: false, message: 'Failed to update food' });
    }
});

// Delete food
app.delete('/api/admin/foods/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const container = getContainer(CONTAINERS.FOODS);

        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        const food = resources[0];
        await container.item(id, food.category).delete();
        res.json({ success: true, message: 'Food deleted successfully' });
    } catch (error: any) {
        console.error('Delete food error:', error);
        res.status(500).json({ success: false, message: 'Failed to delete food' });
    }
});

// Similar endpoints for exercises...
app.get('/api/admin/exercises', async (req: Request, res: Response) => {
    try {
        const container = getContainer(CONTAINERS.EXERCISES);
        const { resources } = await container.items.readAll().fetchAll();
        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
    }
});

app.post('/api/admin/exercises', async (req: Request, res: Response) => {
    try {
        const container = getContainer(CONTAINERS.EXERCISES);
        const exercise = {
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ...req.body,
            isActive: req.body.isActive !== false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        await container.items.create(exercise);
        res.json({ success: true, data: exercise });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to create exercise' });
    }
});

app.put('/api/admin/exercises/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const container = getContainer(CONTAINERS.EXERCISES);
        const { resources } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: id }]
        }).fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        const existing = resources[0];
        const updated = { ...existing, ...req.body, updatedAt: new Date().toISOString() };
        await container.item(id, updated.category).replace(updated);
        res.json({ success: true, data: updated });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to update exercise' });
    }
});

app.delete('/api/admin/exercises/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const container = getContainer(CONTAINERS.EXERCISES);
        const { resources } = await container.items.query({
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: id }]
        }).fetchAll();

        if (!resources || resources.length === 0) {
            return res.status(404).json({ success: false, message: 'Exercise not found' });
        }

        const exercise = resources[0];
        await container.item(id, exercise.category).delete();
        res.json({ success: true, message: 'Exercise deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Failed to delete exercise' });
    }
});

// Razorpay Setup
const Razorpay = require('razorpay');
// Note: In Azure Functions or local settings, these come from process.env via Values
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ... (existing AI endpoint)

app.post('/api/payment/create-order', async (req: any, res: any) => {
    try {
        const { amount, currency = 'INR' } = req.body; // Amount in smallest currency unit (paise)

        // Default to ₹100 if not provided, just for safety or fixed donation
        const orderAmount = amount || 10000; // 100 INR

        const options = {
            amount: orderAmount,
            currency,
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);
        console.log('✅ Payment Order Created:', order.id);
        res.json(order);
    } catch (error) {
        console.error('❌ Razorpay Order Error:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Caroliv API running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/`);
});
