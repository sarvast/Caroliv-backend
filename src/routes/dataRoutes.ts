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

// Get Smart Pairings for a specific food
router.get('/foods/:id/pairings', async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Get the source food's details
        const sourceFood = await db.get('SELECT pairingTags, category FROM foods WHERE id = ?', [id]);

        if (!sourceFood || !sourceFood.pairingTags) {
            return res.json({ success: true, data: [] });
        }

        const tags = sourceFood.pairingTags.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean);
        if (tags.length === 0) return res.json({ success: true, data: [] });

        const sourceCategory = sourceFood.category;

        // 2. Build query to find matching items
        let query = 'SELECT * FROM foods WHERE isActive = 1 AND id != ?';
        const params: any[] = [id];

        // LOGIC IMPROVEMENT 1: Avoid same-category pairings (e.g. Roti + Rice, Apple + Banana is okay but generally main dishes don't mix)
        // Exceptions can be handled via tags, but generally for "Meals" we want diversity.
        if (sourceCategory === 'Grains' || sourceCategory === 'Protein') {
            // Don't suggest other Grains with Grains (e.g. No Roti + Rice)
            // Don't suggest Snacks with Grains (e.g. No Roti + Kachori)
            query += ' AND category != ? AND category != "Snacks"';
            params.push(sourceCategory);
        } else if (sourceCategory === 'Beverages') {
            // Beverages pair with Snacks
            query += ' AND category = "Snacks"';
        }

        query += ' AND (';

        const conditions = tags.map((tag: string) => {
            // LOGIC IMPROVEMENT 2: Direct Category Matching
            // If tag is "dal", match category "Protein" or name "dal"
            // If tag is "curry", match category "Vegetables" or name "curry"

            if (['dal', 'protein', 'chicken', 'egg', 'paneer'].includes(tag)) {
                params.push('Protein', `%${tag}%`, `%${tag}%`);
                return '(category = ? OR lower(name) LIKE ? OR lower(searchTerms) LIKE ?)';
            }
            if (['sabzi', 'vegetable', 'curry', 'bhaji'].includes(tag)) {
                params.push('Vegetables', `%${tag}%`, `%${tag}%`);
                return '(category = ? OR lower(name) LIKE ? OR lower(searchTerms) LIKE ?)';
            }
            if (['rice', 'chawal', 'biryani'].includes(tag)) {
                params.push('Grains', `%${tag}%`, `%${tag}%`);
                return '(category = ? OR lower(name) LIKE ? OR lower(searchTerms) LIKE ?)';
            }

            // Fallback to text matching
            params.push(`%${tag}%`, `%${tag}%`);
            return '(lower(name) LIKE ? OR lower(searchTerms) LIKE ?)';
        });

        query += conditions.join(' OR ') + ') LIMIT 10';

        const pairings = await db.query(query, params);
        res.json({ success: true, data: pairings });

    } catch (error) {
        console.error('Smart pairing error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch pairings' });
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
