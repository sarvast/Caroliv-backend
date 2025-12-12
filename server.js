const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';

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
      goal TEXT DEFAULT 'maintain',
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
        version: '3.0.0',
        database: 'SQLite',
        status: 'running',
        features: ['Auth', 'Exercises', 'Foods', 'Users']
    });
});

// ==================== AUTHENTICATION ====================

// Register new user
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, name, age, gender, height, currentWeight, goal } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ success: false, error: 'Email, password, and name are required' });
        }

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
                `INSERT INTO users (id, email, password, name, age, gender, height, currentWeight, goal, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, email.toLowerCase(), hashedPassword, name, age, gender, height, currentWeight, goal || 'maintain', now, now],
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
                        user: { id: userId, email: email.toLowerCase(), name, age, gender, height, currentWeight, goal }
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

// ==================== ADMIN - USERS ====================

app.get('/api/admin/users', (req, res) => {
    db.all('SELECT id, email, password, name, age, gender, height, currentWeight, goal, createdAt, updatedAt FROM users', [], (err, users) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, data: users, count: users.length });
    });
});

app.get('/api/admin/users/:id', (req, res) => {
    db.get('SELECT id, email, password, name, age, gender, height, currentWeight, goal, createdAt, updatedAt FROM users WHERE id = ?', [req.params.id], (err, user) => {
        if (err) {
            return res.status(500).json({ success: false, error: err.message });
        }
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: user });
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

// Start server
app.listen(PORT, () => {
    console.log(`✅ Caroliv Backend running on port ${PORT}`);
    console.log(`📊 Database: SQLite (${DB_PATH})`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`🔐 Auth: Enabled (JWT)`);
    console.log(`👥 Users: Enabled`);
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
