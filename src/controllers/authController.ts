/**
 * Authentication Controller
 * Handles all authentication-related business logic
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Database } from 'sqlite3';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';

export class AuthController {
    constructor(private db: Database) { }

    /**
     * Register a new user
     */
    async register(req: Request, res: Response): Promise<void> {
        try {
            const { email, password, name, age, gender, height, currentWeight, targetWeight, goal } = req.body;

            // Check if user exists
            this.db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase()], async (err, row) => {
                if (err) {
                    logger.error('Database error during registration', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                if (row) {
                    res.status(400).json({ success: false, error: 'User already exists with this email' });
                    return;
                }

                // Hash password
                const hashedPassword = await bcrypt.hash(password, 10);
                const userId = Date.now().toString();
                const now = new Date().toISOString();

                // Insert user
                this.db.run(
                    `INSERT INTO users (id, email, password, name, age, gender, height, currentWeight, targetWeight, goal, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [userId, email.toLowerCase(), hashedPassword, name, age, gender, height, currentWeight || 0, targetWeight || 0, goal || 'maintain', now, now],
                    function (err) {
                        if (err) {
                            logger.error('Error creating user', err);
                            res.status(500).json({ success: false, error: err.message });
                            return;
                        }

                        // Generate JWT
                        const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '30d' });

                        logger.auth('User registered', email, true);
                        res.json({
                            success: true,
                            token,
                            user: { id: userId, email: email.toLowerCase(), name, age, gender, height, currentWeight, targetWeight, goal }
                        });
                    }
                );
            });
        } catch (error) {
            logger.error('Registration error', error);
            res.status(500).json({ success: false, error: 'Registration failed' });
        }
    }

    /**
     * Login user
     */
    async login(req: Request, res: Response): Promise<void> {
        try {
            const { email, password } = req.body;

            this.db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user: any) => {
                if (err) {
                    logger.error('Database error during login', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                if (!user) {
                    logger.auth('Login failed - user not found', email, false);
                    res.status(401).json({ success: false, error: 'Invalid email or password' });
                    return;
                }

                // Verify password
                const isValid = await bcrypt.compare(password, user.password);
                if (!isValid) {
                    logger.auth('Login failed - invalid password', email, false);
                    res.status(401).json({ success: false, error: 'Invalid email or password' });
                    return;
                }

                // Generate JWT
                const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

                const { password: _, ...userWithoutPassword } = user;
                logger.auth('User logged in', user.email, true);
                res.json({ success: true, token, user: userWithoutPassword });
            });
        } catch (error) {
            logger.error('Login error', error);
            res.status(500).json({ success: false, error: 'Login failed' });
        }
    }

    /**
     * Reset password
     */
    async resetPassword(req: Request, res: Response): Promise<void> {
        try {
            const { email, currentWeight, age, newPassword } = req.body;

            this.db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase()], async (err, user: any) => {
                if (err) {
                    logger.error('Database error during password reset', err);
                    res.status(500).json({ success: false, error: err.message });
                    return;
                }

                if (!user) {
                    res.status(404).json({ success: false, error: 'User not found' });
                    return;
                }

                // Verify details
                const weightMatch = Math.abs(user.currentWeight - parseFloat(currentWeight)) < 0.1;
                const ageMatch = user.age === parseInt(age);

                if (!weightMatch || !ageMatch) {
                    logger.warn('Password reset failed - verification mismatch', { email });
                    res.status(400).json({ success: false, error: 'Verification failed. Details do not match.' });
                    return;
                }

                // Hash new password
                const hashedPassword = await bcrypt.hash(newPassword, 10);
                const now = new Date().toISOString();

                this.db.run(
                    'UPDATE users SET password = ?, updatedAt = ? WHERE id = ?',
                    [hashedPassword, now, user.id],
                    function (err) {
                        if (err) {
                            logger.error('Error updating password', err);
                            res.status(500).json({ success: false, error: err.message });
                            return;
                        }

                        logger.auth('Password reset successful', email, true);
                        res.json({ success: true, message: 'Password reset successfully' });
                    }
                );
            });
        } catch (error) {
            logger.error('Password reset error', error);
            res.status(500).json({ success: false, error: 'Password reset failed' });
        }
    }
}
