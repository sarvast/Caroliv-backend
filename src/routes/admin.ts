/**
 * Admin Routes
 */

import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';
import { Database } from 'sqlite3';

export function createAdminRoutes(db: Database): Router {
    const router = Router();
    const adminController = new AdminController(db);

    /**
     * @route   POST /api/admin/login
     * @desc    Admin login
     * @access  Public
     */
    router.post('/login', (req, res) => adminController.login(req, res));

    /**
     * @route   GET /api/admin/verify
     * @desc    Verify admin token
     * @access  Admin
     */
    router.get('/verify', authenticate, requireAdmin, (req, res) =>
        adminController.verifyAdmin(req, res)
    );

    // All routes below require admin authentication
    router.use(authenticate, requireAdmin);

    /**
     * @route   GET /api/admin/users
     * @desc    Get all users
     * @access  Admin
     */
    router.get('/users', (req, res) => adminController.getAllUsers(req, res));

    /**
     * @route   GET /api/admin/users/:id
     * @desc    Get user by ID
     * @access  Admin
     */
    router.get('/users/:id', (req, res) => adminController.getUserById(req, res));

    /**
     * @route   GET /api/admin/stats
     * @desc    Get dashboard statistics
     * @access  Admin
     */
    router.get('/stats', (req, res) => adminController.getStats(req, res));

    /**
     * @route   GET /api/admin/performance
     * @desc    Get performance metrics
     * @access  Admin
     */
    router.get('/performance', (req, res) => adminController.getPerformance(req, res));

    return router;
}
