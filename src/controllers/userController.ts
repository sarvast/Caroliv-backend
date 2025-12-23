/**
 * User Controller
 * Handles user profile and data management
 */

import { Response } from 'express';
import { Database } from 'sqlite3';
import { AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

export class UserController {
    constructor(private db: Database) { }

    /**
     * Get user profile
     */
    getProfile(req: AuthRequest, res: Response): void {
        const userId = req.user?.userId;

        this.db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user: any) => {
            if (err) {
                logger.error('Error fetching user profile', err);
                res.status(500).json({ success: false, error: err.message });
                return;
            }

            if (!user) {
                res.status(404).json({ success: false, error: 'User not found' });
                return;
            }

            const { password: _, ...userWithoutPassword } = user;
            res.json({ success: true, user: userWithoutPassword });
        });
    }

    /**
     * Update user profile
     */
    updateProfile(req: AuthRequest, res: Response): void {
        const userId = req.user?.userId;
        const updates = { ...req.body, updatedAt: new Date().toISOString() };

        // Remove protected fields
        delete updates.email;
        delete updates.password;
        delete updates.id;

        const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
        const values = [...Object.values(updates), userId];

        this.db.run(`UPDATE users SET ${fields} WHERE id = ?`, values, function (err) {
            if (err) {
                logger.error('Error updating user profile', err);
                res.status(500).json({ success: false, error: err.message });
                return;
            }

            // Fetch updated user
            this.get('SELECT * FROM users WHERE id = ?', [userId], (err: any, user: any) => {
                if (err) {
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                const { password: _, ...userWithoutPassword } = user;
                logger.info('User profile updated', { userId });
                res.json({ success: true, user: userWithoutPassword });
            });
        });
    }

    /**
     * Get body measurements
     */
    getMeasurements(req: AuthRequest, res: Response): void {
        const userId = req.user?.userId;

        this.db.all(
            'SELECT * FROM body_measurements WHERE userId = ? ORDER BY date DESC',
            [userId],
            (err, rows) => {
                if (err) {
                    logger.error('Error fetching measurements', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                res.json({ success: true, data: rows });
            }
        );
    }

    /**
     * Add body measurement
     */
    addMeasurement(req: AuthRequest, res: Response): void {
        const userId = req.user?.userId;
        const { date, chest, waist, arms, hips } = req.body;
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();

        this.db.run(
            `INSERT INTO body_measurements (id, userId, date, chest, waist, arms, hips, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, date, chest, waist, arms, hips, createdAt],
            function (err) {
                if (err) {
                    logger.error('Error adding measurement', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                // Update user table with latest measurements
                this.run(
                    `UPDATE users SET chest = COALESCE(?, chest), waist = COALESCE(?, waist), 
           arms = COALESCE(?, arms), hips = COALESCE(?, hips) WHERE id = ?`,
                    [chest, waist, arms, hips, userId]
                );

                logger.info('Body measurement added', { userId, date });
                res.json({ success: true, data: { id, userId, date, chest, waist, arms, hips, createdAt } });
            }
        );
    }

    /**
     * Delete body measurement
     */
    deleteMeasurement(req: AuthRequest, res: Response): void {
        const userId = req.user?.userId;
        const measurementId = req.params.id;

        this.db.run(
            'DELETE FROM body_measurements WHERE id = ? AND userId = ?',
            [measurementId, userId],
            function (err) {
                if (err) {
                    logger.error('Error deleting measurement', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                if (this.changes === 0) {
                    res.status(404).json({ success: false, error: 'Measurement not found or unauthorized' });
                    return;
                }

                logger.info('Body measurement deleted', { userId, measurementId });
                res.json({ success: true, message: 'Measurement deleted' });
            }
        );
    }
}
