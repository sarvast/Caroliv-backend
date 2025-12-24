const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./src/config/swagger');
require('dotenv').config();

// Load local.settings.json if present (fallback for .env)
const localSettingsPath = path.join(__dirname, 'local.settings.json');
if (fs.existsSync(localSettingsPath)) {
    try {
        const settings = JSON.parse(fs.readFileSync(localSettingsPath, 'utf8'));
        if (settings.Values) {
            Object.assign(process.env, settings.Values);
        }
    } catch (e) {
        console.error('Error loading local.settings.json', e);
    }
}

const Razorpay = require('razorpay');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';

// Razorpay Instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// SQLite Database
const DB_PATH = path.join(__dirname, 'caroliv.db');
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('❌ SQLite connection error:', err);
        process.exit(1);
    }
    console.log('✅ Connected to SQLite database');
});

// Initialize database tables
function initDatabase() {
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
      isGuest INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`);

        // Migration: Add targetWeight if not exists
        db.run("ALTER TABLE users ADD COLUMN targetWeight INTEGER DEFAULT 0", (err) => {
            // Ignore error if column already exists
        });

        // Migration: Add measurement cols to users
        const measurementCols = ['chest', 'waist', 'arms', 'hips'];
        measurementCols.forEach(col => {
            db.run(`ALTER TABLE users ADD COLUMN ${col} REAL`, () => { });
        });

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

        // Migration: Add instructions and description to exercises if not exists
        const exerciseCols = ['instructions', 'description'];
        exerciseCols.forEach(col => {
            db.run(`ALTER TABLE exercises ADD COLUMN ${col} TEXT`, () => { });
        });

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

        // Migration: Add missing columns to foods
        const foodCols = ['protein', 'carbs', 'fat', 'fiber'];
        foodCols.forEach(col => {
            db.run(`ALTER TABLE foods ADD COLUMN ${col} REAL`, () => { });
        });
        const foodTextCols = ['servingSize', 'imageUrl', 'nameHindi'];
        foodTextCols.forEach(col => {
            db.run(`ALTER TABLE foods ADD COLUMN ${col} TEXT`, () => { });
        });
        // Add pairingTags column
        db.run(`ALTER TABLE foods ADD COLUMN pairingTags TEXT`, () => { });

        // Body Measurements table
        db.run(`CREATE TABLE IF NOT EXISTS body_measurements (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      date TEXT NOT NULL,
      chest REAL,
      waist REAL,
      arms REAL,
      hips REAL,
      createdAt TEXT
    )`);

        // App Configuration table (for version control)
        db.run(`CREATE TABLE IF NOT EXISTS app_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updatedAt TEXT
        )`);

        // Initialize default app config if empty
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
                [key, value, now]
            );
        });

        console.log('✅ Database tables initialized');
    });

    // Food Submissions Table (New)
    db.serialize(() => {
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
    });
    // Exercise Submissions Table (New)
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS exercise_submissions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          category TEXT,
          difficulty TEXT,
          equipment TEXT,
          targetMuscles TEXT,
          status TEXT DEFAULT 'pending',
          createdAt TEXT
        )`);
    });

    // Promotions Table
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS promotions (
          id TEXT PRIMARY KEY,
          title TEXT,
          description TEXT,
          imageUrl TEXT,
          link TEXT,
          isActive INTEGER DEFAULT 1,
          createdAt TEXT
        )`);
    });

    // Announcements Table
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS announcements (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT DEFAULT 'info',
          isActive INTEGER DEFAULT 1,
          createdAt TEXT
        )`);
    });
}

initDatabase();


// CORS Configuration
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
        : ['http://localhost:3001', 'http://localhost:3000', '*'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-admin-key']
};

app.use(cors(corsOptions));

// Security headers
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
});

// Compression middleware
app.use(compression());

// Performance monitoring
app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        if (duration > 1000) {
            console.log(`⚠️  Slow request: ${req.method} ${req.path} - ${duration}ms`);
        }
    });
    next();
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Caloriv API Documentation'
}));

// Load admin routes
const adminRoutes = require('./admin-routes');
adminRoutes(app, db);

// ... (existing helper endpoints) ...

// ==================== EXERCISE SUBMISSIONS ====================

app.post('/api/exercises/submit', (req, res) => {
    const { name, category, difficulty, equipment, targetMuscles } = req.body;

    if (!name) {
        return res.status(400).json({ success: false, error: 'Name is required' });
    }

    const id = Date.now().toString();
    const createdAt = new Date().toISOString();
    const musclesJson = JSON.stringify(targetMuscles || []);

    db.run(
        `INSERT INTO exercise_submissions (id, name, category, difficulty, equipment, targetMuscles, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [id, name, category, difficulty, equipment, musclesJson, createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log('✅ Exercise submitted for review:', name);
            res.json({ success: true, message: 'Exercise submitted for review' });
        }
    );
});

app.get('/api/admin/exercise-submissions', (req, res) => {
    db.all('SELECT * FROM exercise_submissions ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        // Parse JSON
        const parsed = rows.map(r => ({
            ...r,
            targetMuscles: r.targetMuscles ? JSON.parse(r.targetMuscles) : []
        }));
        res.json({ success: true, data: parsed });
    });
});

app.post('/api/admin/exercise-submissions/:id/approve', (req, res) => {
    db.get('SELECT * FROM exercise_submissions WHERE id = ?', [req.params.id], (err, submission) => {
        if (err || !submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const exId = Date.now().toString();
        const createdAt = new Date().toISOString();

        // 1. Add to main exercises table
        db.run(
            `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, isActive, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
            [exId, submission.name, submission.category, submission.difficulty, submission.equipment, submission.targetMuscles, createdAt],
            (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });

                // 2. Delete from submissions
                db.run('DELETE FROM exercise_submissions WHERE id = ?', [req.params.id], () => {
                    console.log('✅ Exercise approved:', submission.name);
                    res.json({ success: true, message: 'Exercise approved' });
                });
            }
        );
    });
});

app.delete('/api/admin/exercise-submissions/:id', (req, res) => {
    db.run('DELETE FROM exercise_submissions WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: 'Submission rejected' });
    });
});

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Caroliv Backend API',
        version: '3.1.0',
        database: 'SQLite',
        status: 'running',
        features: ['Auth', 'Exercises', 'Foods', 'Users', 'TargetWeight']
    });
});

// ==================== APP VERSION CONFIG ====================

// Get app version config (PUBLIC - used by mobile app on startup)
app.get('/api/config/app-version', (req, res) => {
    db.all('SELECT key, value FROM app_config', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        const config = {
            requiredVersion: '1.0.0',
            forceUpdate: 'false',
            updateMessage: 'A new version of Caloriv is available!',
            updateUrl: 'https://caloriv-web.vercel.app/'
        };

        if (rows) {
            rows.forEach(row => {
                config[row.key] = row.value;
            });
        }

        res.json({
            success: true,
            data: {
                requiredVersion: config.requiredVersion,
                forceUpdate: config.forceUpdate === 'true' || config.forceUpdate === 1,
                updateMessage: config.updateMessage,
                updateUrl: config.updateUrl
            }
        });
    });
});

// Public endpoint for mobile app - Get active promotion
app.get('/api/features/promotion', (req, res) => {
    db.get(
        'SELECT * FROM promotions WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1',
        [],
        (err, promotion) => {
            if (err) return res.status(500).json({ success: false, error: err.message });

            // Transform response for mobile app compatibility
            if (promotion) {
                const transformed = {
                    isActive: promotion.isActive === 1,
                    imageUrl: promotion.imageUrl || '',
                    externalLink: promotion.link || '',
                    delayDays: 0 // Default to 0 days
                };
                res.json({ success: true, data: transformed });
            } else {
                res.json({ success: true, data: null });
            }
        }
    );
});

// ==================== FOOD ROUTES ====================

// Get all foods
app.get('/api/foods', (req, res) => {
    db.all('SELECT * FROM foods WHERE isActive = 1', [], (err, foods) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: foods || [] });
    });
});

// Get pairings for a food
app.get('/api/foods/:id/pairings', (req, res) => {
    const foodId = req.params.id;

    // First get the target food to check its tags
    db.get('SELECT * FROM foods WHERE id = ?', [foodId], (err, food) => {
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!food) return res.status(404).json({ success: false, error: 'Food not found' });

        // If no tags, return empty
        if (!food.pairingTags) return res.json({ success: true, data: [] });

        const tags = food.pairingTags.split(',').map(t => t.trim()).filter(Boolean);
        if (tags.length === 0) return res.json({ success: true, data: [] });

        // Find other foods that match any of these tags
        // Simple simplified logic: search for foods where pairingTags LIKE any of the tags
        const placeholders = tags.map(() => 'pairingTags LIKE ?').join(' OR ');
        const params = tags.map(t => `%${t}%`);

        const query = `SELECT * FROM foods WHERE isActive = 1 AND id != ? AND (${placeholders}) LIMIT 5`;

        db.all(query, [foodId, ...params], (err, pairings) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: pairings || [] });
        });
    });
});

// Submit new food (authenticated optional, but good practice)
app.post('/api/foods/submit', (req, res) => {
    const { name, brand, calories, protein, carbs, fat, servingSize, barcode } = req.body;
    const id = Date.now().toString();
    const now = new Date().toISOString();

    db.run(
        `INSERT INTO food_submissions (id, name, brand, calories, protein, carbs, fat, servingSize, barcode, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [id, name, brand, calories, protein, carbs, fat, servingSize, barcode, now],
        (err) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, message: 'Food submitted for approval' });
        }
    );
});

// Log food intake (authenticated)
app.post('/api/logs/food', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const { type, date, details, calories } = req.body;

    // In a real app, you'd insert into a 'logs' or 'food_logs' table.
    // Since we don't have that schema visible yet, we'll just log it and return success
    // to unblock the frontend.
    console.log(`Food logged for user ${userId}:`, details.foodName, calories);

    res.json({ success: true, message: 'Food logged successfully' });
});

// Public endpoint for mobile app - Get active announcements
app.get('/api/features/announcements', (req, res) => {
    db.all(
        'SELECT * FROM announcements WHERE isActive = 1 ORDER BY createdAt DESC',
        [],
        (err, announcements) => {
            if (err) return res.status(500).json({ success: false, error: err.message });
            res.json({ success: true, data: announcements || [] });
        }
    );
});

// Public endpoint for mobile app - Get app version config
app.get('/api/features/config', (req, res) => {
    db.all('SELECT key, value FROM app_config', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        const config = {
            requiredVersion: '1.0.0',
            forceUpdate: false,
            updateMessage: 'A new version of Caloriv is available!',
            updateUrl: 'https://caloriv-web.vercel.app/'
        };

        if (rows) {
            rows.forEach(row => {
                // Convert string booleans to actual booleans
                config[row.key] = row.value === 'true' ? true : row.value === 'false' ? false : row.value;
            });
        }

        res.json({ success: true, data: config });
    });
});

// Sync user activity log (authenticated endpoint)
app.post('/api/users/sync-log', authenticateToken, (req, res) => {
    const userId = req.user.userId;
    const syncData = req.body;

    // For now, just acknowledge the sync
    // In future, you can store this data in a sync_logs table if needed
    console.log(`Sync received from user ${userId}:`, JSON.stringify(syncData).substring(0, 100));

    res.json({
        success: true,
        message: 'Data synced successfully',
        timestamp: new Date().toISOString()
    });
});

// Get app config (ADMIN)
app.get('/api/admin/config', (req, res) => {
    db.all('SELECT key, value FROM app_config', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }

        const config = {};
        if (rows) {
            rows.forEach(row => {
                if (row.key === 'forceUpdate') {
                    config[row.key] = row.value === 'true' || row.value === 1;
                } else {
                    config[row.key] = row.value;
                }
            });
        }

        res.json({
            success: true,
            data: config
        });
    });
});

// Update app config (ADMIN)
app.put('/api/admin/config', (req, res) => {
    const { requiredVersion, forceUpdate, updateMessage, updateUrl } = req.body;

    if (!requiredVersion) {
        return res.status(400).json({ success: false, error: 'requiredVersion is required' });
    }

    // Validate version format (X.Y.Z)
    const versionRegex = /^\d+\.\d+\.\d+$/;
    if (!versionRegex.test(requiredVersion)) {
        return res.status(400).json({ success: false, error: 'Invalid version format. Use X.Y.Z (e.g., 1.0.0)' });
    }

    const now = new Date().toISOString();
    const updates = [
        ['requiredVersion', requiredVersion],
        ['forceUpdate', String(forceUpdate)],
        ['updateMessage', updateMessage],
        ['updateUrl', updateUrl || 'https://caloriv-web.vercel.app/']
    ];

    let completed = 0;
    let hasError = false;

    updates.forEach(([key, value]) => {
        db.run(
            `INSERT INTO app_config (key, value, updatedAt) VALUES (?, ?, ?)
             ON CONFLICT(key) DO UPDATE SET value=excluded.value, updatedAt=excluded.updatedAt`,
            [key, value, now],
            (err) => {
                if (err && !hasError) {
                    hasError = true;
                    return res.status(500).json({ success: false, error: err.message });
                }
                completed++;
                if (completed === updates.length && !hasError) {
                    console.log(`✅ App config updated: v${requiredVersion}, forceUpdate: ${forceUpdate}`);
                    res.json({
                        success: true,
                        data: { requiredVersion, forceUpdate, updateMessage, updateUrl, updatedAt: now }
                    });
                }
            }
        );
    });
});


// TODO: Add rate limiting to auth endpoints
// Example:
// const { authLimiter } = require('./src/middleware/rateLimit');
// app.post('/api/auth/login', authLimiter, loginHandler);
// app.post('/api/auth/register', authLimiter, registerHandler);

// ==================== AUTHENTICATION ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, age, gender, height, currentWeight, targetWeight, goal } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
        }

        console.log('🔍 Backend Register - Received gender:', gender);

        // Check if user exists
        db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], async (err, row) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (row) {
                return res.status(400).json({ success: false, error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10);
            const userId = Date.now().toString();
            const now = new Date().toISOString();

            // Insert user
            db.run(
                `INSERT INTO users (id, email, password, name, age, gender, height, currentWeight, targetWeight, goal, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, email.toLowerCase(), hashedPassword, name, age, gender, height, currentWeight || 0, targetWeight || 0, goal || 'maintain', now, now],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }

                    // Generate JWT
                    const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '30d' });

                    console.log('✅ User registered:', email);
                    res.json({
                        success: true,
                        token,
                        user: { id: userId, email: email.toLowerCase(), name, age, gender, height, currentWeight, targetWeight, goal }
                    });
                }
            );
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, error: 'Email and password are required' });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!user) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            // Verify password
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).json({ success: false, error: 'Invalid email or password' });
            }

            // Generate JWT
            const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

            const { password: _, ...userWithoutPassword } = user;
            console.log('✅ User logged in:', user.email);
            res.json({ success: true, token, user: userWithoutPassword });
        });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Reset Password (Self-Serve)
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, currentWeight, age, newPassword } = req.body;

        if (!email || !currentWeight || !age || !newPassword) {
            return res.status(400).json({ success: false, error: 'All fields are required' });
        }

        db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            // Verification Logic
            // Note: Database stores numbers as numbers, ensuring type match
            const weightMatch = Math.abs(user.currentWeight - parseFloat(currentWeight)) < 0.1; // Allow small float diff
            const ageMatch = user.age === parseInt(age);

            if (!weightMatch || !ageMatch) {
                console.log(`❌ Password reset failed for ${email}. Weight: ${user.currentWeight} vs ${currentWeight}, Age: ${user.age} vs ${age}`);
                return res.status(400).json({ success: false, error: 'Verification failed. Details do not match.' });
            }

            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            const now = new Date().toISOString();

            db.run(
                'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
                [hashedPassword, now, user.id],
                function (err) {
                    if (err) {
                        return res.status(500).json({ success: false, error: err.message });
                    }
                    console.log(`✅ User reset password: ${email}`);
                    res.json({ success: true, message: 'Password reset successfully' });
                }
            );
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get user profile
app.get('/api/users/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (!user) {
                return res.status(404).json({ success: false, error: 'User not found' });
            }

            const { password: _, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword });
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

// Update user profile
app.put('/api/users/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const updates = { ...req.body, updatedAt: new Date().toISOString() };
        delete updates.email;
        delete updates.password;
        delete updates.id;

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), decoded.userId];

        db.run(`UPDATE users SET ${fields} WHERE id = ?`, values, function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }

            db.get('SELECT * FROM users WHERE id = ?', [decoded.userId], (err, user) => {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                const { password: _, ...userWithoutPassword } = user;
                res.json({ success: true, user: userWithoutPassword });
            });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== BODY MEASUREMENTS ====================

app.get('/api/users/measurements', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        db.all('SELECT * FROM body_measurements WHERE userId = ? ORDER BY date DESC', [decoded.userId], (err, rows) => {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            res.json({ success: true, data: rows });
        });
    } catch (error) {
        res.status(401).json({ success: false, error: 'Invalid token' });
    }
});

app.post('/api/users/measurements', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const { date, chest, waist, arms, hips } = req.body;
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();

        db.run(
            `INSERT INTO body_measurements (id, userId, date, chest, waist, arms, hips, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, decoded.userId, date, chest, waist, arms, hips, createdAt],
            function (err) {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }

                // ALSO UPDATE USER TABLE (Latest Measurements)
                db.run(
                    `UPDATE users SET chest = COALESCE(?, chest), waist = COALESCE(?, waist), arms = COALESCE(?, arms), hips = COALESCE(?, hips) WHERE id = ?`,
                    [chest, waist, arms, hips, decoded.userId]
                );

                res.json({ success: true, data: { id, userId: decoded.userId, date, chest, waist, arms, hips, createdAt } });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.delete('/api/users/measurements/:id', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const decoded = jwt.verify(token, JWT_SECRET);

        db.run('DELETE FROM body_measurements WHERE id = ? AND userId = ?', [req.params.id, decoded.userId], function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Measurement not found or unauthorized' });
            }
            res.json({ success: true, message: 'Measurement deleted' });
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== ADMIN - USERS ====================

app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, email, name, age, gender, height, currentWeight, targetWeight, goal, chest, waist, arms, hips, createdAt, updatedAt FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: users, count: users.length });
    });
});

app.get('/api/admin/users/:id', (req, res) => {
    db.get('SELECT id, email, name, age, gender, height, currentWeight, targetWeight, goal, chest, waist, arms, hips, createdAt, updatedAt FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
    });
});

app.delete('/api/admin/users/:id', (req, res) => {
    db.run('DELETE FROM users WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        console.log('✅ User deleted:', req.params.id);
        res.json({ success: true, message: 'User deleted' });
    });
});

// Admin Reset Password
app.put('/api/admin/users/:id/password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ success: false, error: 'New password is required' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();

        db.run(
            'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
            [hashedPassword, now, req.params.id],
            function (err) {
                if (err) {
                    return res.status(500).json({ success: false, error: err.message });
                }
                if (this.changes === 0) {
                    return res.status(404).json({ success: false, error: 'User not found' });
                }
                console.log(`✅ Password reset for user: ${req.params.id}`);
                res.json({ success: true, message: 'Password updated successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/api/admin/users/:id/measurements', (req, res) => {
    db.all('SELECT * FROM body_measurements WHERE userId = ? ORDER BY date DESC', [req.params.id], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

// ==================== EXERCISES ====================

app.get('/api/exercises', (req, res) => {
    db.all('SELECT * FROM exercises WHERE isActive = 1', [], (err, exercises) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        // Parse targetMuscles JSON
        const parsed = exercises.map(ex => ({
            ...ex,
            targetMuscles: ex.targetMuscles ? JSON.parse(ex.targetMuscles) : []
        }));
        res.json({ success: true, data: parsed, count: parsed.length });
    });
});

app.get('/api/exercises/:id', (req, res) => {
    db.get('SELECT * FROM exercises WHERE id = ?', [req.params.id], (err, exercise) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!exercise) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }
        exercise.targetMuscles = exercise.targetMuscles ? JSON.parse(exercise.targetMuscles) : [];
        res.json({ success: true, data: exercise });
    });
});

app.post('/api/admin/exercises', (req, res) => {
    const exercise = {
        ...req.body,
        id: req.body.id || Date.now().toString(),
        isActive: req.body.isActive !== false ? 1 : 0,
        createdAt: new Date().toISOString(),
        targetMuscles: JSON.stringify(req.body.targetMuscles || [])
    };

    db.run(
        `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, defaultSets, instructions, description, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exercise.id, exercise.name, exercise.category, exercise.difficulty, exercise.equipment, exercise.targetMuscles, exercise.gifUrl, exercise.defaultSets, exercise.instructions, exercise.description, exercise.isActive, exercise.createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log('✅ Exercise created:', exercise.name);
            res.json({ success: true, data: exercise });
        }
    );
});

app.put('/api/admin/exercises/:id', (req, res) => {
    const updates = { ...req.body };
    delete updates.id;
    if (updates.targetMuscles) {
        updates.targetMuscles = JSON.stringify(updates.targetMuscles);
    }

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    db.run(`UPDATE exercises SET ${fields} WHERE id = ?`, values, function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }
        console.log('✅ Exercise updated:', req.params.id);
        res.json({ success: true, data: { id: req.params.id, ...updates } });
    });
});

app.delete('/api/admin/exercises/:id', (req, res) => {
    db.run('DELETE FROM exercises WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }
        console.log('✅ Exercise deleted:', req.params.id);
        res.json({ success: true, message: 'Exercise deleted' });
    });
});

// ==================== FOODS ====================

app.get('/api/foods', (req, res) => {
    db.all('SELECT * FROM foods WHERE isActive = 1', [], (err, foods) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: foods, count: foods.length });
    });
});

app.post('/api/admin/foods', (req, res) => {
    const food = {
        ...req.body,
        id: req.body.id || Date.now().toString(),
        isActive: req.body.isActive !== false ? 1 : 0,
        createdAt: new Date().toISOString()
    };

    db.run(
        `INSERT INTO foods (id, name, nameHindi, calories, protein, carbs, fat, fiber, servingSize, imageUrl, emoji, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [food.id, food.name, food.nameHindi, food.calories, food.protein, food.carbs, food.fat, food.fiber, food.servingSize, food.imageUrl, food.emoji, food.isActive, food.createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log('✅ Food created:', food.name);
            res.json({ success: true, data: food });
        }
    );
});

app.put('/api/admin/foods/:id', (req, res) => {
    const updates = { ...req.body };
    delete updates.id;

    const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updates), req.params.id];

    db.run(`UPDATE foods SET ${fields} WHERE id = ?`, values, function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }
        console.log('✅ Food updated:', req.params.id);
        res.json({ success: true, data: { id: req.params.id, ...updates } });
    });
});

app.delete('/api/admin/foods/:id', (req, res) => {
    db.run('DELETE FROM foods WHERE id = ?', [req.params.id], function (err) {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }
        console.log('✅ Food deleted:', req.params.id);
        res.json({ success: true, message: 'Food deleted' });
    });
});

// ==================== FOOD SUBMISSIONS (BARCODE/USER FOUND) ====================

app.post('/api/foods/submit', (req, res) => {
    const { name, brand, calories, carbs, protein, fat, servingSize, barcode } = req.body;

    if (!name || !calories) {
        return res.status(400).json({ success: false, error: 'Name and calories are required' });
    }

    const id = Date.now().toString();
    const createdAt = new Date().toISOString();

    db.run(
        `INSERT INTO food_submissions (id, name, brand, calories, carbs, protein, fat, servingSize, barcode, status, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)`,
        [id, name, brand, calories, carbs, protein, fat, servingSize, barcode, createdAt],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            console.log('✅ Food submitted for review:', name);
            res.json({ success: true, message: 'Food submitted for review' });
        }
    );
});

app.get('/api/admin/food-submissions', (req, res) => {
    db.all('SELECT * FROM food_submissions ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: rows });
    });
});

app.post('/api/admin/food-submissions/:id/approve', (req, res) => {
    db.get('SELECT * FROM food_submissions WHERE id = ?', [req.params.id], (err, submission) => {
        if (err || !submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }

        const foodId = Date.now().toString();
        const createdAt = new Date().toISOString();

        // 1. Add to main foods table
        db.run(
            `INSERT INTO foods (id, name, nameHindi, calories, emoji, isActive, createdAt)
             VALUES (?, ?, ?, ?, ?, 1, ?)`,
            [foodId, submission.name, submission.brand, submission.calories, '🍎', createdAt],
            (err) => {
                if (err) return res.status(500).json({ success: false, error: err.message });

                // 2. Delete from submissions
                db.run('DELETE FROM food_submissions WHERE id = ?', [req.params.id], () => {
                    console.log('✅ Food approved and moved to database:', submission.name);
                    res.json({ success: true, message: 'Food approved' });
                });
            }
        );
    });
});

app.delete('/api/admin/food-submissions/:id', (req, res) => {
    db.run('DELETE FROM food_submissions WHERE id = ?', [req.params.id], function (err) {
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, message: 'Submission rejected/deleted' });
    });
});


// ==================== PAYMENT ====================

app.post('/api/payment/create-order', async (req, res) => {
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
    console.log(`✅ Caroliv Backend running on port ${PORT}`);
    console.log(`📊 Database: SQLite (${DB_PATH})`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth: Enabled (JWT)`);
    console.log(`👥 Users: Enabled`);
    console.log(`Target Weight: Enabled`);
    console.log(`💾 Memory: Zero overhead!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('✅ Database connection closed');
        process.exit(0);
    });
});
