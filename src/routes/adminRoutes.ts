import express from 'express';
import { db } from '../lib/db';
import { checkAdminAuth } from '../middleware/adminMiddleware';
import bcrypt from 'bcryptjs';

const router = express.Router();

router.use(checkAdminAuth); // Apply to all routes in this file

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
