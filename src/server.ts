import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import { db } from './lib/db'; // SQLite Wrapper
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 8080;
const JWT_SECRET = process.env.JWT_SECRET || '##hellosarvasva69';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug Middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Body:', JSON.stringify(req.body).substring(0, 500)); // Log first 500 chars of body
    next();
});

// Health check
app.get('/', (req: Request, res: Response) => {
    res.json({ status: 'Caroliv API is running (SQLite)', version: '3.1.2' });
});

// ... AI Endpoint ...

// ============ AUTH ENDPOINTS ============

// Login
app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        console.log(`Login attempt for: ${email}`);

        if (!email || !password) {
            console.log('❌ Missing email or password');
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = await db.get('SELECT * FROM users WHERE lower(email) = ?', [email.toLowerCase()]);

        if (!user) {
            console.log('❌ User not found in DB');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log(`User found: ${user.id}, checking password...`);
        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            console.log('❌ Password mismatch');
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        console.log('✅ Password matched, generating token...');
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
app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
        const { email, password, name, age, gender, weight, height, targetWeight, goal, activityLevel } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const existing = await db.get('SELECT id FROM users WHERE lower(email) = ?', [email.toLowerCase()]);

        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const user = {
            id: userId,
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

        await db.run(
            `INSERT INTO users (id, email, password, name, age, gender, weight, height, targetWeight, goal, activityLevel, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.email, user.password, user.name, user.age, user.gender, user.weight, user.height, user.targetWeight, user.goal, user.activityLevel, user.createdAt, user.updatedAt]
        );

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

// Get Profile
app.get('/api/users/profile', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [decoded.email]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        // Remove password before returning
        delete user.password;
        res.json({ success: true, user });

    } catch (error: any) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update Profile
app.put('/api/users/profile', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as any;

        const { name, age, gender, weight, height, targetWeight, goal, activityLevel } = req.body;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [decoded.email]);

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const updated = {
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

        await db.run(
            `UPDATE users SET name=?, age=?, gender=?, weight=?, height=?, targetWeight=?, goal=?, activityLevel=?, updatedAt=? WHERE email=?`,
            [updated.name, updated.age, updated.gender, updated.weight, updated.height, updated.targetWeight, updated.goal, updated.activityLevel, updated.updatedAt, decoded.email]
        );

        res.json({ success: true, user: { ...user, ...updated } }); // Return full user object
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

        let query = 'SELECT * FROM foods WHERE isActive = 1';
        const params: any[] = [];

        // Note: SQLite doesn't have a 'category' in foods based on the migration script, but generic filtering if needed. 
        // Based on migration, foods have: id, name, nameHindi, calories... no category column in standard foods table?
        // Wait, migrate.js doesn't show a category column for foods! 
        // I will trust the migration script. If specific filter needed, we can add it, but for now strict to schema.

        if (search) {
            query += ' AND (lower(name) LIKE ? OR lower(nameHindi) LIKE ? OR lower(searchTerms) LIKE ?)';
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY name ASC';

        const resources = await db.query(query, params);

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

        let query = 'SELECT * FROM exercises WHERE isActive = 1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        query += ' ORDER BY name ASC';

        const resources = await db.query(query, params);

        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Get exercises error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
    }
});

// Submit Exercise (User Proposed)
app.post('/api/exercises/submit', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        let userId = 'anonymous';

        // Optional auth check
        if (authHeader?.startsWith('Bearer ')) {
            try {
                const token = authHeader.substring(7);
                const decoded = jwt.verify(token, JWT_SECRET) as any;
                userId = decoded.userId;
            } catch (e) { }
        }

        const { name, category, difficulty, equipment, targetMuscles, gifUrl, description, instructions } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Name and category are required' });
        }

        const id = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        // Insert as inactive
        await db.run(
            `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, description, instructions, isActive, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                id,
                name,
                category,
                difficulty || 'beginner',
                equipment || 'bodyweight',
                JSON.stringify(targetMuscles || []),
                gifUrl || '',
                description || '',
                instructions || '',
                now
            ]
        );

        res.json({ success: true, message: 'Exercise submitted for review' });

    } catch (error: any) {
        console.error('Submit exercise error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit exercise' });
    }
});

// ============ ADMIN ENDPOINTS (Simplified) ============
// Reuse generic db queries

app.get('/api/admin/foods', async (req: Request, res: Response) => {
    try {
        const data = await db.query('SELECT * FROM foods');
        res.json({ success: true, data, count: data.length });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

app.post('/api/admin/foods', async (req: Request, res: Response) => {
    try {
        const id = `food_${Date.now()}`;
        const { name, calories, protein, carbs, fat } = req.body;
        await db.run(
            'INSERT INTO foods (id, name, calories, protein, carbs, fat, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, 1, ?)',
            [id, name, calories, protein, carbs, fat, new Date().toISOString()]
        );
        res.json({ success: true, data: { id, ...req.body } });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

// Admin Exercise Endpoints
app.get('/api/admin/exercises', async (req: Request, res: Response) => {
    try {
        const data = await db.query('SELECT * FROM exercises');
        res.json({ success: true, data, count: data.length });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});


// Razorpay Setup
// Razorpay Setup
const Razorpay = require('razorpay');

let razorpay: any = null;

try {
    if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
        razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
        console.log('✅ Payments: Enabled (Razorpay)');
    } else {
        console.warn('⚠️ Payments: Disabled (Missing RAZORPAY_KEY_ID/SECRET)');
    }
} catch (error) {
    console.error('❌ Failed to init Razorpay:', error);
}

app.post('/api/payment/create-order', async (req: any, res: any) => {
    if (!razorpay) {
        return res.status(503).json({ error: 'Payments are currently disabled on the server.' });
    }

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
    console.log(`💾 Params: SQLite, 1GB RAM Mode`);
});
