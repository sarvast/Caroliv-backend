import express from 'express';
import { db } from '../lib/db';
import { authenticateToken, AuthRequest } from '../middleware/authMiddleware';
import crypto from 'crypto';

const router = express.Router();

// Get Profile
router.get('/leaderboard', authenticateToken, async (req: AuthRequest, res) => {
    try {
        // Efficient Query for 1GB VM: Limit 50, Index on currentStreak (implicit if integer)
        const users = await db.all(
            'SELECT id, name, currentStreak, activityLevel, gender FROM users ORDER BY currentStreak DESC LIMIT 50'
        );
        res.json({ success: true, data: users });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

router.post('/buy-shield', authenticateToken, async (req: AuthRequest, res) => {
    try {
        // In future: Check coins balance
        // For now: Free weekly gift or simulated purchase

        await db.run('UPDATE users SET streakShields = coalesce(streakShields, 0) + 1 WHERE email = ?', [req.user.email]);
        res.json({ success: true, message: 'Shield Acquired! You are safe for one day.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed' });
    }
});

// Get Profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [req.user.email]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        delete user.password;
        res.json({ success: true, user: { ...user, currentWeight: user.weight } });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// Update Profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { name, age, gender, weight, currentWeight, height, targetWeight, goal, activityLevel } = req.body;
        const finalWeight = weight || currentWeight;

        const user = await db.get('SELECT * FROM users WHERE email = ?', [req.user.email]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const updated = {
            name: name ?? user.name,
            age: age ?? user.age,
            gender: gender ?? user.gender,
            weight: finalWeight ?? user.weight,
            height: height ?? user.height,
            targetWeight: targetWeight ?? user.targetWeight,
            goal: goal ?? user.goal,
            activityLevel: activityLevel ?? user.activityLevel,
            updatedAt: new Date().toISOString(),
        };

        await db.run(
            `UPDATE users SET name=?, age=?, gender=?, weight=?, height=?, targetWeight=?, goal=?, activityLevel=?, updatedAt=? WHERE email=?`,
            [updated.name, updated.age, updated.gender, updated.weight, updated.height, updated.targetWeight, updated.goal, updated.activityLevel, updated.updatedAt, req.user.email]
        );

        res.json({ success: true, user: { ...user, ...updated, currentWeight: updated.weight } });
    } catch (error) {
        console.error('Sync profile error:', error);
        res.status(500).json({ success: false, message: 'Profile sync failed' });
    }
});

// Get Measurements
router.get('/measurements', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const measurements = await db.all(
            'SELECT * FROM user_measurements WHERE user_id = ? ORDER BY date DESC',
            [req.user.userId]
        );
        res.json({ success: true, data: measurements });
    } catch (error) {
        console.error('Get measurements error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch measurements' });
    }
});

// Save Measurement
router.post('/measurements', authenticateToken, async (req: AuthRequest, res) => {
    try {
        const { date, chest, waist, arms, hips } = req.body;
        const id = crypto.randomUUID();

        await db.run(
            `INSERT INTO user_measurements (id, user_id, date, chest, waist, arms, hips, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, req.user.userId, date, chest, waist, arms, hips, new Date().toISOString()]
        );

        res.json({ success: true, message: 'Measurement saved' });
    } catch (error) {
        console.error('Save measurement error:', error);
        res.status(500).json({ success: false, message: 'Failed to save measurement' });
    }
});

export default router;
