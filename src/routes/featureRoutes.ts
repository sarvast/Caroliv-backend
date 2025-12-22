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
    // Hardcoded for now, can be moved to DB later
    res.json({
        success: true,
        data: {
            isActive: true,
            imageUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800', // Example fitness image
            externalLink: 'https://caroliv-gym-gear.com', // Placeholder
            delayDays: 2
        }
    });
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

export default router;
