/**
 * Database initialization and optimization
 * Creates tables and adds performance indexes
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'caroliv.db');

function initDatabase() {
    const db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
            console.error('❌ SQLite connection error:', err);
            process.exit(1);
        }
        console.log('✅ Connected to SQLite database');
    });

    db.serialize(() => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      age INTEGER,
      gender TEXT,
      height INTEGER,
      currentWeight INTEGER,
      targetWeight INTEGER DEFAULT 0,
      goal TEXT DEFAULT 'maintain',
      chest REAL,
      waist REAL,
      arms REAL,
      hips REAL,
      isGuest INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`);

        // Exercises table
        db.run(`CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      difficulty TEXT,
      equipment TEXT,
      targetMuscles TEXT,
      gifUrl TEXT,
      defaultSets TEXT,
      instructions TEXT,
      description TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT
    )`);

        // Foods table
        db.run(`CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameHindi TEXT,
      calories INTEGER NOT NULL,
      protein REAL,
      carbs REAL,
      fat REAL,
      fiber REAL,
      servingSize TEXT,
      imageUrl TEXT,
      emoji TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT
    )`);

        // Body Measurements table
        db.run(`CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      chest REAL,
      waist REAL,
      arms REAL,
      hips REAL,
      createdAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`);

        // App Configuration table
        db.run(`CREATE TABLE IF NOT EXISTS app_config (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT
    )`);

        // Food Submissions Table
        db.run(`CREATE TABLE IF NOT EXISTS food_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT,
      calories INTEGER NOT NULL,
      carbs REAL,
      protein REAL,
      fat REAL,
      servingSize TEXT,
      barcode TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT
    )`);

        // Exercise Submissions Table
        db.run(`CREATE TABLE IF NOT EXISTS exercise_submissions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      difficulty TEXT,
      equipment TEXT,
      targetMuscles TEXT,
      gifUrl TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT
    )`);

        console.log('✅ Database tables initialized');

        // Add performance indexes
        console.log('🔧 Creating performance indexes...');

        const indexes = [
            // Users indexes
            'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',

            // Exercises indexes
            'CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises(category)',
            'CREATE INDEX IF NOT EXISTS idx_exercises_difficulty ON exercises(difficulty)',
            'CREATE INDEX IF NOT EXISTS idx_exercises_isActive ON exercises(isActive)',

            // Foods indexes
            'CREATE INDEX IF NOT EXISTS idx_foods_name ON foods(name)',
            'CREATE INDEX IF NOT EXISTS idx_foods_isActive ON foods(isActive)',

            // Body measurements indexes
            'CREATE INDEX IF NOT EXISTS idx_body_measurements_userId ON body_measurements(userId)',
            'CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(date)',
            'CREATE INDEX IF NOT EXISTS idx_body_measurements_userId_date ON body_measurements(userId, date)',

            // Submissions indexes
            'CREATE INDEX IF NOT EXISTS idx_food_submissions_status ON food_submissions(status)',
            'CREATE INDEX IF NOT EXISTS idx_exercise_submissions_status ON exercise_submissions(status)'
        ];

        let indexCount = 0;
        indexes.forEach((indexSQL) => {
            db.run(indexSQL, (err) => {
                if (err) {
                    console.error(`❌ Error creating index: ${err.message}`);
                } else {
                    indexCount++;
                    if (indexCount === indexes.length) {
                        console.log(`✅ Created ${indexCount} performance indexes`);

                        // Initialize default app config
                        initializeAppConfig(db);
                    }
                }
            });
        });
    });

    return db;
}

function initializeAppConfig(db) {
    const now = new Date().toISOString();
    const configs = [
        ['requiredVersion', '1.0.0'],
        ['forceUpdate', 'false'],
        ['updateMessage', 'A new version of Caloriv is available! Update now for the best experience.'],
        ['updateUrl', 'https://caloriv-web.vercel.app/']
    ];

    configs.forEach(([key, value]) => {
        db.run(
            `INSERT OR IGNORE INTO app_config (key, value, updatedAt) VALUES (?, ?, ?)`,
            [key, value, now],
            (err) => {
                if (err) {
                    console.error(`❌ Error initializing config ${key}:`, err.message);
                }
            }
        );
    });

    console.log('✅ Default app configuration initialized');
}

module.exports = { initDatabase };
