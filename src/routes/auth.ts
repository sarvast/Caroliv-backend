/**
 * Authentication Routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validate, registerSchema, loginSchema, resetPasswordSchema } from '../middleware/validation';
import { authLimiter } from '../middleware/rateLimit';
// import { Database } from 'sqlite3';

export function createAuthRoutes(db: any): Router {
    const router = Router();
    const authController = new AuthController(db);

    /**
     * @route   POST /api/auth/register
     * @desc    Register a new user
     * @access  Public
     */
    router.post(
        '/register',
        authLimiter,
        validate(registerSchema),
        (req, res) => authController.register(req, res)
    );

    /**
     * @route   POST /api/auth/login
     * @desc    Login user
     * @access  Public
     */
    router.post(
        '/login',
        authLimiter,
        validate(loginSchema),
        (req, res) => authController.login(req, res)
    );

    /**
     * @route   POST /api/auth/reset-password
     * @desc    Reset user password
     * @access  Public
     */
    router.post(
        '/reset-password',
        authLimiter,
        validate(resetPasswordSchema),
        (req, res) => authController.resetPassword(req, res)
    );

    return router;
}
