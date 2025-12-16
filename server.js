const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
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
      isActive INTEGER DEFAULT 1,
      createdAt TEXT
    )`);

        // Foods table
        db.run(`CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameHindi TEXT,
      calories INTEGER NOT NULL,
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
      createdAt TEXT
    )`);

        // App Configuration table (for version control)
        db.run(`CREATE TABLE IF NOT EXISTS app_config (
      id TEXT PRIMARY KEY,
      requiredVersion TEXT NOT NULL,
      forceUpdate INTEGER DEFAULT 0,
      updateMessage TEXT,
      updateUrl TEXT DEFAULT 'https://caloriv-web.vercel.app/',
      createdAt TEXT,
      updatedAt TEXT
    )`);

        // Initialize default app config
        db.get('SELECT id FROM app_config WHERE id = ?', ['default'], (err, row) => {
            if (!row) {
                const now = new Date().toISOString();
                db.run(
                    `INSERT INTO app_config (id, requiredVersion, forceUpdate, updateMessage, updateUrl, createdAt, updatedAt)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    ['default', '69.0.0', 0, 'A new version of Caloriv is available! Update now for the best experience.', 'https://caloriv-web.vercel.app/', now, now],
                    (err) => {
                        if (!err) console.log('✅ Default app config initialized');
                    }
                );
            }
        });

        console.log('✅ Database tables initialized');
    });
}

initDatabase();

app.use(cors());
app.use(express.json());

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
    db.get('SELECT requiredVersion, forceUpdate, updateMessage, updateUrl FROM app_config WHERE id = ?', ['default'], (err, config) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!config) {
            // Return default if not found
            return res.json({
                success: true,
                data: {
                    requiredVersion: '69.0.0',
                    forceUpdate: false,
                    updateMessage: 'A new version of Caloriv is available!',
                    updateUrl: 'https://caloriv-web.vercel.app/'
                }
            });
        }
        res.json({
            success: true,
            data: {
                requiredVersion: config.requiredVersion,
                forceUpdate: config.forceUpdate === 1,
                updateMessage: config.updateMessage,
                updateUrl: config.updateUrl
            }
        });
    });
});

// Get app config (ADMIN)
app.get('/api/admin/config', (req, res) => {
    db.get('SELECT * FROM app_config WHERE id = ?', ['default'], (err, config) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!config) {
            return res.status(404).json({ success: false, error: 'Config not found' });
        }
        res.json({
            success: true,
            data: {
                ...config,
                forceUpdate: config.forceUpdate === 1
            }
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
    const forceUpdateInt = forceUpdate ? 1 : 0;

    db.run(
        `UPDATE app_config SET requiredVersion = ?, forceUpdate = ?, updateMessage = ?, updateUrl = ?, updatedAt = ? WHERE id = ?`,
        [requiredVersion, forceUpdateInt, updateMessage, updateUrl || 'https://caloriv-web.vercel.app/', now, 'default'],
        function (err) {
            if (err) {
                return res.status(500).json({ success: false, error: err.message });
            }
            if (this.changes === 0) {
                return res.status(404).json({ success: false, error: 'Config not found' });
            }
            console.log(`✅ App config updated: v${requiredVersion}, forceUpdate: ${forceUpdate}`);
            res.json({
                success: true,
                data: { requiredVersion, forceUpdate, updateMessage, updateUrl, updatedAt: now }
            });
        }
    );
});

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
    db.all('SELECT id, email, password, name, age, gender, height, currentWeight, targetWeight, goal, chest, waist, arms, hips, createdAt, updatedAt FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: users, count: users.length });
    });
});

app.get('/api/admin/users/:id', (req, res) => {
    db.get('SELECT id, email, password, name, age, gender, height, currentWeight, targetWeight, goal, chest, waist, arms, hips, createdAt, updatedAt FROM users WHERE id = ?', [req.params.id], (err, user) => {
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
        `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, defaultSets, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [exercise.id, exercise.name, exercise.category, exercise.difficulty, exercise.equipment, exercise.targetMuscles, exercise.gifUrl, exercise.defaultSets, exercise.isActive, exercise.createdAt],
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
        `INSERT INTO foods (id, name, nameHindi, calories, emoji, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [food.id, food.name, food.nameHindi, food.calories, food.emoji, food.isActive, food.createdAt],
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
