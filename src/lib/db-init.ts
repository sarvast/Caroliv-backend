import { db } from './db';
import { logger } from './logger';

export const initDb = async () => {
    logger.info('Initializing Database...');

    try {
        // 1. Ensure Auth Tables exist
        await db.run(`
            CREATE TABLE IF NOT EXISTS password_resets (
                email TEXT,
                otp TEXT,
                expiresAt TEXT,
                createdAt TEXT
            )
        `);

        // 2. Announcements Table (New Feature)
        await db.run(`
            CREATE TABLE IF NOT EXISTS announcements (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                message TEXT NOT NULL,
                type TEXT DEFAULT 'info', -- info, warning, success
                isActive INTEGER DEFAULT 1,
                createdAt TEXT,
                expiresAt TEXT
            )
        `);

        // 3. Promotions Table (New: Dynamic Ads)
        await db.run(`
            CREATE TABLE IF NOT EXISTS promotions (
                id TEXT PRIMARY KEY,
                title TEXT,
                imageUrl TEXT NOT NULL,
                externalLink TEXT NOT NULL,
                delayDays INTEGER DEFAULT 0,
                isActive INTEGER DEFAULT 1,
                createdAt TEXT
            )
        `);

        // 4. Run Migrations (Safe Column Additions)
        await safeAddColumn('foods', 'pairingTags', 'TEXT DEFAULT ""');
        await safeAddColumn('users', 'workoutLevel', 'TEXT DEFAULT "beginner"');
        await safeAddColumn('users', 'workoutGoal', 'TEXT DEFAULT "weight_loss"');
        await safeAddColumn('users', 'currentStreak', 'INTEGER DEFAULT 0');
        await safeAddColumn('users', 'lastLoginDate', 'TEXT DEFAULT ""');

        // New: Streak Shield (Retention Feature)
        await safeAddColumn('users', 'streakShields', 'INTEGER DEFAULT 0');

        logger.info('✅ Database initialized and migrated successfully');
    } catch (error) {
        logger.error('❌ Failed to initialize database', error);
        process.exit(1); // Critical failure
    }
};

// Helper to add columns safely without crashing if they exist
const safeAddColumn = async (table: string, column: string, definition: string) => {
    try {
        await db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
        logger.info(`Checking Schema: Added column '${column}' to '${table}'`);
    } catch (e: any) {
        if (e.message && e.message.includes('duplicate column name')) {
            // Column exists, ignore
        } else {
            logger.warn(`Failed to add column ${column} to ${table}: ${e.message}`);
        }
    }
};
