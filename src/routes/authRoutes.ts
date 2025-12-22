import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../lib/db';
import { sendOtpEmail } from '../services/emailService';
import crypto from 'crypto';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'default_insecure_secret';

// ============ AUTH ENDPOINTS ============

// Register
router.post('/register', async (req, res) => {
    try {
        const { email, password, name, age, gender, weight, height, targetWeight, goal, activityLevel } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const existing = await db.get('SELECT id FROM users WHERE lower(email) = ?', [email.toLowerCase()]);

        if (existing) {
            return res.status(409).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const now = new Date().toISOString();
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const user = {
            id: userId,
            email: email.toLowerCase(),
            password: hashedPassword,
            name: name || '',
            age: age || 0,
            gender: gender || '',
            weight: weight || 0,
            height: height || 0,
            targetWeight: targetWeight || 0,
            goal: goal || 'maintain',
            activityLevel: activityLevel || 'moderate',
            createdAt: now,
            updatedAt: now,
        };

        await db.run(
            `INSERT INTO users (id, email, password, name, age, gender, weight, height, targetWeight, goal, activityLevel, createdAt, updatedAt) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [user.id, user.email, user.password, user.name, user.age, user.gender, user.weight, user.height, user.targetWeight, user.goal, user.activityLevel, user.createdAt, user.updatedAt]
        );

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
                weight: user.weight,
                currentWeight: user.weight,
                height: user.height,
                targetWeight: user.targetWeight,
                goal: user.goal,
                activityLevel: user.activityLevel,
            }
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Registration failed' });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password required' });
        }

        const user = await db.get('SELECT * FROM users WHERE lower(email) = ?', [email.toLowerCase()]);

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '30d' });

        // --- STREAK LOGIC START ---
        const todayStr = new Date().toISOString().split('T')[0];
        const lastLoginStr = user.lastLoginDate ? user.lastLoginDate.split('T')[0] : null;
        let currentStreak = user.currentStreak || 0;

        // --- STREAK LOGIC START ---
        let usedShield = false;

        // Only update if not logged in today
        if (lastLoginStr !== todayStr) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (lastLoginStr === yesterdayStr) {
                currentStreak += 1; // Continued streak
            } else {
                // Missed a day! Check for Shield
                const shields = user.streakShields || 0;
                if (shields > 0) {
                    // Consume Shield
                    await db.run('UPDATE users SET streakShields = streakShields - 1 WHERE id = ?', [user.id]);
                    usedShield = true;
                    // Streak preserved (not incremented, but not reset)
                    // currentStreak remains same
                    console.log(`🛡️ User ${user.email} used a Streak Shield!`);
                } else {
                    currentStreak = 1; // Reset
                }
            }

            // Update DB
            await db.run('UPDATE users SET currentStreak = ?, lastLoginDate = ? WHERE id = ?',
                [currentStreak, new Date().toISOString(), user.id]
            );
        }
        // --- STREAK LOGIC END ---

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                age: user.age,
                gender: user.gender,
                weight: user.weight,
                currentWeight: user.weight,
                height: user.height,
                targetWeight: user.targetWeight,
                goal: user.goal,
                activityLevel: user.activityLevel,
                currentStreak: currentStreak,
                streakShields: (user.streakShields || 0) - (usedShield ? 1 : 0),
                protectionUsed: usedShield,
            }
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Login failed' });
    }
});

// Forgot Password - Step 1: Request OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ success: false, message: 'Email required' });

        const user = await db.get('SELECT * FROM users WHERE lower(email) = ?', [email.toLowerCase()]);
        if (!user) {
            return res.json({ success: true, message: 'If account exists, OTP sent' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        await db.run('DELETE FROM password_resets WHERE email = ?', [email.toLowerCase()]);
        await db.run(
            'INSERT INTO password_resets (email, otp, expiresAt, createdAt) VALUES (?, ?, ?, ?)',
            [email.toLowerCase(), otp, expiresAt, new Date().toISOString()]
        );

        const emailSent = await sendOtpEmail(email, otp);

        if (emailSent) {
            res.json({ success: true, message: 'OTP sent to email' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to send email' });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// Forgot Password - Step 2: Confirm Reset
router.post('/confirm-reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ success: false, message: 'Missing fields' });

        const record = await db.get(
            'SELECT * FROM password_resets WHERE lower(email) = ? AND otp = ?',
            [email.toLowerCase(), otp]
        );

        console.log(`[DEBUG] Verification attempt for ${email} with OTP ${otp}`);

        if (!record) {
            console.warn(`[DEBUG] No matching record found in password_resets for ${email}/${otp}`);
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        const now = new Date();
        const expiresAt = new Date(record.expiresAt);
        console.log(`[DEBUG] Record found. ExpiresAt: ${record.expiresAt}, CurrentTime: ${now.toISOString()}`);

        if (expiresAt < now) {
            console.warn(`[DEBUG] OTP expired for ${email}`);
            return res.status(400).json({ success: false, message: 'OTP Expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.run('UPDATE users SET password = ? WHERE lower(email) = ?', [hashedPassword, email.toLowerCase()]);
        await db.run('DELETE FROM password_resets WHERE lower(email) = ?', [email.toLowerCase()]);

        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        console.error('Reset confirm error:', error);
        res.status(500).json({ success: false, message: 'Failed to reset password' });
    }
});

export default router;
