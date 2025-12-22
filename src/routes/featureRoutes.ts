import express from 'express';

import { db } from '../lib/db';
const router = express.Router();

// 0. Announcements (Public/User)
router.get('/announcements', async (req, res) => {
    try {
        const rows = await db.all('SELECT * FROM announcements WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1');
        res.json({ success: true, data: rows });
    } catch (error) { res.status(500).json({ error: 'DB Error' }) }
});

// 1. Ad Configuration
router.get('/promotion', async (req, res) => {
    try {
        const promo = await db.get('SELECT * FROM promotions WHERE isActive = 1 ORDER BY createdAt DESC LIMIT 1');

        if (promo) {
            return res.json({ success: true, data: promo });
        }

        // Default Fallback
        res.json({
            success: true,
            data: {
                isActive: true,
                imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
                externalLink: 'https://caloriv-gear.com',
                delayDays: 2
            }
        });
    } catch (error) {
        res.status(500).json({ error: 'DB Error' });
    }
});

// 2. Social Proof / Activity Stats
router.get('/activity-stats', async (req, res) => {
    // Generate a realistic looking number
    const baseUsers = 400;
    const timeOfDayVariation = Math.floor(Math.random() * 100);
    const activeUsers = baseUsers + timeOfDayVariation;

    res.json({
        success: true,
        data: {
            activeUsers: activeUsers,
            message: `${activeUsers} people are exercising with you right now!`
        }
    });
});

router.get('/config', async (req, res) => {
    try {
        const config = await db.get('SELECT * FROM app_config ORDER BY id DESC LIMIT 1');
        res.json({ success: true, data: config });
    } catch (error) {
        res.status(500).json({ success: false, error: 'DB Error' });
    }
});

export default router;
