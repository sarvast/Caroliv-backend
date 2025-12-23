/**
 * Admin Controller
 * Handles admin-specific operations
 */

import { Response } from 'express';
import { Database } from 'sqlite3';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';
import { getPerformanceStats } from '../middleware/performance';

export class AdminController {
    constructor(private db: Database) { }

    /**
     * Get all users (admin only)
     */
    getAllUsers(req: AuthRequest, res: Response): void {
        this.db.all(
            'SELECT id, email, name, age, gender, height, currentWeight, targetWeight, goal, createdAt, updatedAt FROM users',
            [],
            (err, users) => {
                if (err) {
                    logger.error('Error fetching users', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                res.json({ success: true, data: users, count: users.length });
            }
        );
    }

    /**
     * Get user by ID (admin only)
     */
    getUserById(req: AuthRequest, res: Response): void {
        const userId = req.params.id;

        this.db.get(
            'SELECT id, email, name, age, gender, height, currentWeight, targetWeight, goal, createdAt, updatedAt FROM users WHERE id = ?',
            [userId],
            (err, user) => {
                if (err) {
                    logger.error('Error fetching user', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                if (!user) {
                    res.status(404).json({ success: false, error: 'User not found' });
                    return;
                }

                res.json({ success: true, data: user });
            }
        );
    }

    /**
     * Get dashboard statistics (admin only)
     */
    getStats(req: AuthRequest, res: Response): void {
        const stats: any = {};

        this.db.serialize(() => {
            // Total users
            this.db.get('SELECT COUNT(*) as count FROM users', [], (err, result: any) => {
                if (!err) stats.totalUsers = result.count;
            });

            // Total foods
            this.db.get('SELECT COUNT(*) as count FROM foods WHERE isActive = 1', [], (err, result: any) => {
                if (!err) stats.totalFoods = result.count;
            });

            // Total exercises
            this.db.get('SELECT COUNT(*) as count FROM exercises WHERE isActive = 1', [], (err, result: any) => {
                if (!err) stats.totalExercises = result.count;
            });

            // Pending food submissions
            this.db.get('SELECT COUNT(*) as count FROM food_submissions WHERE status = "pending"', [], (err, result: any) => {
                if (!err) stats.pendingFoodSubmissions = result.count;
            });

            // Pending exercise submissions
            this.db.get('SELECT COUNT(*) as count FROM exercise_submissions WHERE status = "pending"', [], (err, result: any) => {
                if (!err) stats.pendingExerciseSubmissions = result.count;

                // Send response after all queries
                res.json({ success: true, data: stats });
            });
        });
    }

    /**
     * Get performance metrics (admin only)
     */
    getPerformance(req: AuthRequest, res: Response): void {
        const perfStats = getPerformanceStats();
        res.json({ success: true, data: perfStats });
    }

    /**
     * Verify admin token
     */
    verifyAdmin(req: AuthRequest, res: Response): void {
        res.json({
            success: true,
            user: {
                email: req.user?.email,
                role: 'admin'
            }
        });
    }

    /**
     * Admin login
     */
    login(req: AuthRequest, res: Response): void {
        const { email, password } = req.body;

        // Check if email is in admin list
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

        if (!adminEmails.includes(email)) {
            res.status(401).json({ success: false, error: 'Unauthorized' });
            return;
        }

        // Verify password against user table
        this.db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
            if (err || !user) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }

            const bcrypt = require('bcryptjs');
            const isValid = await bcrypt.compare(password, user.password);

            if (!isValid) {
                res.status(401).json({ success: false, error: 'Invalid credentials' });
                return;
            }

            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                { userId: user.id, email: user.email, isAdmin: true },
                process.env.JWT_SECRET || 'caroliv-secret-key-2025',
                { expiresIn: '7d' }
            );

            res.json({
                success: true,
                token,
                user: {
                    email: user.email,
                    name: user.name,
                    role: 'admin'
                }
            });
        });
    }
}
