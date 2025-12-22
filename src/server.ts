import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { db } from './lib/db';

// Import Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dataRoutes from './routes/dataRoutes';
import adminRoutes from './routes/adminRoutes';
import featureRoutes from './routes/featureRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Initialize DB Tables & Schema Updates
const initDb = async () => {
    try {
        // Auth Tables
        await db.run(`
            CREATE TABLE IF NOT EXISTS password_resets (
                email TEXT,
                otp TEXT,
                expiresAt TEXT,
                createdAt TEXT
            )
        `);

        // Check/Add 'pairingTags' column to 'foods' if missing
        try {
            await db.run(`ALTER TABLE foods ADD COLUMN pairingTags TEXT DEFAULT ''`);
            console.log('✅ Added pairingTags column to foods table');
        } catch (e: any) {
            if (!e.message.includes('duplicate column name')) {
                console.log('ℹ️ pairingTags column likely exists');
            }
        }

        // Check/Add 'workoutLevel' and 'workoutGoal' to 'users' if missing
        try {
            await db.run(`ALTER TABLE users ADD COLUMN workoutLevel TEXT DEFAULT 'beginner'`);
        } catch (e: any) { }
        try {
            await db.run(`ALTER TABLE users ADD COLUMN workoutGoal TEXT DEFAULT 'weight_loss'`);
        } catch (e: any) { }

        // Streak System Columns
        try { await db.run(`ALTER TABLE users ADD COLUMN currentStreak INTEGER DEFAULT 0`); } catch (e) { }
        try { await db.run(`ALTER TABLE users ADD COLUMN lastLoginDate TEXT DEFAULT ''`); } catch (e) { }


        console.log('✅ Database initialized successfully');
    } catch (error) {
        console.error('❌ Failed to init DB:', error);
    }
};

initDb();

// Debug Logger
app.use((req, res, next) => {
    if (res.statusCode >= 400) {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${res.statusCode}`);
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', dataRoutes); // /api/foods, /api/exercises
app.use('/api/admin', adminRoutes);
app.use('/api/features', featureRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({ status: 'Online', version: '2.0.0 (Modular)' });
});

// Payment (Razorpay - Optional)
// ... (Can be moved to a separate paymentRoutes.ts later, kept here for simplicity if needed)

// Start Server
app.listen(PORT, () => {
    console.log(`✅ Caroliv API running on port ${PORT}`);
    console.log(`🚀 Mode: Modular Routes`);
});
