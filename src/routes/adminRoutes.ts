import express from 'express';
import { db } from '../lib/db';
import { authenticate, requireAdmin } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';

// 0. Admin Login (Public)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const normalizedEmail = email.toLowerCase();

        const user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
        if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

        // Admin Check
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map((e: string) => e.trim());
        const isAdmin = adminEmails.length === 0 || adminEmails.includes(normalizedEmail);

        if (!isAdmin) return res.status(403).json({ success: false, error: 'Admin access required' });

        const token = jwt.sign(
            { userId: user.id, email: user.email, isAdmin: true },
            JWT_SECRET,
            { expiresIn: '30d' }
        );

        const { password: _, ...userWithoutPass } = user;
        res.json({ success: true, token, user: userWithoutPass });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Login failed' });
    }
});

router.use(authenticate, requireAdmin); // Apply to all routes in this file

// 0. Dashboard Stats
router.get('/stats', async (req, res) => {
    try {
        const userCount = await db.get('SELECT COUNT(*) as c FROM users');
        const foodCount = await db.get('SELECT COUNT(*) as c FROM foods WHERE isActive = 1');
        const exerciseCount = await db.get('SELECT COUNT(*) as c FROM exercises WHERE isActive = 1');
        const pendingFoods = await db.get('SELECT COUNT(*) as c FROM foods WHERE isActive = 0');
        const pendingExercises = await db.get('SELECT COUNT(*) as c FROM exercises WHERE isActive = 0');

        res.json({
            success: true,
            data: {
                users: userCount?.c || 0,
                foods: foodCount?.c || 0,
                exercises: exerciseCount?.c || 0,
                pending: (pendingFoods?.c || 0) + (pendingExercises?.c || 0)
            }
        });
    } catch (error) {
        console.error('Stats error:', error);
        res.status(500).json({ error: 'DB Error' });
    }
});

// 0.1 Growth Stats (Last 30 Days)
router.get('/stats/growth', async (req, res) => {
    try {
        // Users Growth
        const usersGrowth = await db.all(`
            SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as count 
            FROM users 
            WHERE createdAt >= date('now', '-30 days')
            GROUP BY date 
            ORDER BY date ASC
        `);

        // Food Submissions (Activity Proxy)
        const foodsGrowth = await db.all(`
            SELECT strftime('%Y-%m-%d', createdAt) as date, COUNT(*) as count 
            FROM foods 
            WHERE createdAt >= date('now', '-30 days')
            GROUP BY date 
            ORDER BY date ASC
        `);

        res.json({
            success: true,
            data: {
                users: usersGrowth,
                foods: foodsGrowth
            }
        });
    } catch (error) {
        console.error('Growth stats error:', error);
        res.status(500).json({ error: 'DB Error' });
    }
});

// 0. Announcements
router.get('/announcements', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM announcements ORDER BY createdAt DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.post('/announcements', async (req, res) => {
    try {
        const { title, message, type, expiresAt } = req.body;
        const id = `ann_${Date.now()}`;
        await db.run(
            'INSERT INTO announcements (id, title, message, type, expiresAt, createdAt) VALUES (?, ?, ?, ?, ?, ?)',
            [id, title, message, type || 'info', expiresAt || null, new Date().toISOString()]
        );
        res.json({ success: true, message: 'Posted' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.delete('/announcements/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM announcements WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

// 1. App Updates Config
router.get('/config', async (req, res) => {
    try {
        const rows = await db.query('SELECT key, value FROM app_config');
        const config: any = {};
        rows.forEach((row: any) => {
            if (row.value === 'true') config[row.key] = true;
            else if (row.value === 'false') config[row.key] = false;
            else config[row.key] = row.value;
        });

        const defaults: any = {
            requiredVersion: '1.0.0',
            forceUpdate: false,
            updateMessage: 'Please update app',
            updateUrl: 'https://example.com'
        };

        res.json({ success: true, data: { ...defaults, ...config } });
    } catch (error) {
        console.error('Get admin config error:', error);
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

router.put('/config', async (req, res) => {
    try {
        const { requiredVersion, forceUpdate, updateMessage, updateUrl } = req.body;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO app_config (key, value, updatedAt) VALUES 
            ('requiredVersion', ?, ?), ('forceUpdate', ?, ?), ('updateMessage', ?, ?), ('updateUrl', ?, ?)
            ON CONFLICT(key) DO UPDATE SET value=excluded.value, updatedAt=excluded.updatedAt`,
            [
                requiredVersion, now,
                String(forceUpdate), now,
                updateMessage, now,
                updateUrl, now
            ]
        );
        res.json({ success: true, message: 'Config updated' });
    } catch (error) {
        console.error('Update admin config error:', error);
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

// 2. User Management
router.get('/users', async (req, res) => {
    try {
        const search = req.query.search as string;
        let query = 'SELECT * FROM users';
        const params: any[] = [];

        if (search) {
            query += ' WHERE lower(name) LIKE ? OR lower(email) LIKE ?';
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term);
        }

        query += ' ORDER BY createdAt DESC LIMIT 50';

        const users = await db.query(query, params);
        const countRes = await db.get('SELECT COUNT(*) as count FROM users');

        const mappedUsers = users.map((u: any) => ({
            ...u,
            currentWeight: u.weight,
            password: u.password ? (u.password.substring(0, 10) + '...') : undefined
        }));

        res.json({ success: true, data: mappedUsers, count: countRes?.count || 0 });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
});

router.put('/users/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) return res.status(400).json({ success: false, message: 'Password too short' });

        const hashedPassword = await bcrypt.hash(password, 10);
        await db.run('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        res.json({ success: true, message: 'Password updated' });
    } catch (error) {
        console.error('Admin reset pass error:', error);
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

router.put('/users/:id/engagement', async (req, res) => {
    try {
        const { id } = req.params;
        const { currentStreak, streakShields } = req.body;

        await db.run(
            'UPDATE users SET currentStreak = ?, streakShields = ? WHERE id = ?',
            [currentStreak, streakShields, id]
        );

        res.json({ success: true, message: 'Engagement stats updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'DB Error' });
    }
});

// 3. Approvals (Foods)
router.get('/food-submissions', async (req, res) => {
    try {
        const foods = await db.query('SELECT * FROM foods WHERE isActive = 0 ORDER BY createdAt DESC');
        res.json({ success: true, data: foods });
    } catch (error) {
        res.status(500).json({ success: false, error: 'DB Error' });
    }
});

router.post('/food-submissions/:id/approve', async (req, res) => {
    try {
        await db.run('UPDATE foods SET isActive = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Approved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

router.delete('/food-submissions/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM foods WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Rejected/Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

// 4. Approvals (Exercises)
router.get('/exercise-submissions', async (req, res) => {
    try {
        const exercises = await db.query('SELECT * FROM exercises WHERE isActive = 0 ORDER BY createdAt DESC');
        res.json({ success: true, data: exercises });
    } catch (error) {
        res.status(500).json({ success: false, error: 'DB Error' });
    }
});

router.post('/exercise-submissions/:id/approve', async (req, res) => {
    try {
        await db.run('UPDATE exercises SET isActive = 1 WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Approved' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

router.delete('/exercise-submissions/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM exercises WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Rejected/Deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

// CRUD (Foods & Exercises) - Handled here for admin simplicity
router.get('/foods', async (req, res) => {
    try {
        const search = req.query.search as string;
        const category = req.query.category as string;
        let query = 'SELECT * FROM foods WHERE 1=1';
        const params: any[] = [];

        if (search) {
            query += ' AND (lower(name) LIKE ? OR lower(nameHindi) LIKE ?)';
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        query += ' ORDER BY createdAt DESC';
        const foods = await db.query(query, params);
        res.json({ success: true, data: foods });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.get('/exercises', async (req, res) => {
    try {
        const search = req.query.search as string;
        const category = req.query.category as string;
        const difficulty = req.query.difficulty as string;
        let query = 'SELECT * FROM exercises WHERE 1=1';
        const params: any[] = [];

        if (search) {
            query += ' AND lower(name) LIKE ?';
            params.push(`%${search.toLowerCase()}%`);
        }
        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        query += ' ORDER BY createdAt DESC';
        const exercises = await db.query(query, params);
        res.json({ success: true, data: exercises });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.post('/foods', async (req, res) => {
    try {
        const id = `food_${Date.now()}`;
        const { name, calories, protein, carbs, fat, emoji, pairingTags } = req.body;
        await db.run(
            'INSERT INTO foods (id, name, calories, protein, carbs, fat, emoji, pairingTags, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
            [id, name, calories, protein, carbs, fat, emoji || '🍽️', pairingTags || '', new Date().toISOString()]
        );
        res.json({ success: true, data: { id, ...req.body } });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.post('/foods/bulk', async (req, res) => {
    try {
        const foods = req.body; // Expecting Array
        if (!Array.isArray(foods)) return res.status(400).json({ error: 'Expected JSON Array' });

        let count = 0;
        const now = new Date().toISOString();

        // Transaction-like loop (SQLite runs sequentially anyway in this setup)
        for (const food of foods) {
            if (!food.name || !food.calories) continue; // Skip invalid

            const id = `food_bulk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            await db.run(
                'INSERT INTO foods (id, name, calories, protein, carbs, fat, emoji, pairingTags, category, servingSize, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
                [
                    id,
                    food.name,
                    food.calories || 0,
                    food.protein || 0,
                    food.carbs || 0,
                    food.fat || 0,
                    food.emoji || '🍽️',
                    food.pairingTags || '',
                    food.category || 'Other',
                    food.servingSize || '1 serving',
                    now
                ]
            );
            count++;
        }

        res.json({ success: true, message: `Successfully imported ${count} items` });
    } catch (error) {
        console.error('Bulk upload error:', error);
        res.status(500).json({ error: 'DB Error during bulk upload' });
    }
});

router.put('/foods/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, nameHindi, calories, protein, carbs, fat, emoji, pairingTags, isActive } = req.body;
        await db.run(
            `UPDATE foods SET 
                name = ?, nameHindi = ?, calories = ?, protein = ?, carbs = ?, 
                fat = ?, emoji = ?, pairingTags = ?, isActive = ?
             WHERE id = ?`,
            [name, nameHindi, calories, protein, carbs, fat, emoji, pairingTags, isActive, id]
        );
        res.json({ success: true, message: 'Updated' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.delete('/foods/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM foods WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

// 5. Promotion Management
router.get('/promotions', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM promotions ORDER BY createdAt DESC');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.post('/promotions', async (req, res) => {
    try {
        const id = `promo_${Date.now()}`;
        const { title, imageUrl, externalLink, delayDays, isActive } = req.body;
        await db.run(
            'INSERT INTO promotions (id, title, imageUrl, externalLink, delayDays, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, title, imageUrl, externalLink, delayDays || 0, isActive === false ? 0 : 1, new Date().toISOString()]
        );
        res.json({ success: true, data: { id, ...req.body } });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.put('/promotions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, imageUrl, externalLink, delayDays, isActive } = req.body;
        await db.run(
            'UPDATE promotions SET title = ?, imageUrl = ?, externalLink = ?, delayDays = ?, isActive = ? WHERE id = ?',
            [title, imageUrl, externalLink, delayDays, isActive === false ? 0 : 1, id]
        );
        res.json({ success: true, message: 'Updated' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

router.delete('/promotions/:id', async (req, res) => {
    try {
        await db.run('DELETE FROM promotions WHERE id = ?', [req.params.id]);
        res.json({ success: true, message: 'Deleted' });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

export default router;
