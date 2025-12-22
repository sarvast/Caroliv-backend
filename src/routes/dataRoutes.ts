import express from 'express';
import { db } from '../lib/db';
import crypto from 'crypto';

const router = express.Router();

// Get Foods
router.get('/foods', async (req, res) => {
    try {
        const search = req.query.search as string;
        let query = 'SELECT * FROM foods WHERE isActive = 1';
        const params: any[] = [];

        if (search) {
            query += ' AND (lower(name) LIKE ? OR lower(nameHindi) LIKE ? OR lower(searchTerms) LIKE ?)';
            const term = `%${search.toLowerCase()}%`;
            params.push(term, term, term);
        }

        query += ' ORDER BY name ASC';
        const resources = await db.query(query, params);
        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Get foods error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch foods' });
    }
});

// Get Exercises
router.get('/exercises', async (req, res) => {
    try {
        const category = req.query.category as string;
        const difficulty = req.query.difficulty as string;

        let query = 'SELECT * FROM exercises WHERE isActive = 1';
        const params: any[] = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }

        if (difficulty) {
            query += ' AND difficulty = ?';
            params.push(difficulty);
        }

        query += ' ORDER BY name ASC';
        const resources = await db.query(query, params);
        res.json({ success: true, data: resources, count: resources.length });
    } catch (error: any) {
        console.error('Get exercises error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch exercises' });
    }
});

// Submit Exercise (User Proposed)
router.post('/exercises/submit', async (req, res) => {
    try {
        const { name, category, difficulty, equipment, targetMuscles, gifUrl, description, instructions } = req.body;

        if (!name || !category) {
            return res.status(400).json({ success: false, message: 'Name and category are required' });
        }

        const id = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        await db.run(
            `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, description, instructions, isActive, createdAt)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
            [
                id,
                name,
                category,
                difficulty || 'beginner',
                equipment || 'bodyweight',
                JSON.stringify(targetMuscles || []),
                gifUrl || '',
                description || '',
                instructions || '',
                now
            ]
        );

        res.json({ success: true, message: 'Exercise submitted for review' });

    } catch (error: any) {
        console.error('Submit exercise error:', error);
        res.status(500).json({ success: false, message: 'Failed to submit exercise' });
    }
});

export default router;
