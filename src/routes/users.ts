/**
 * User Routes
 */

import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/auth';
import { validate, updateProfileSchema, bodyMeasurementSchema } from '../middleware/validation';
import { Database } from 'sqlite3';

export function createUserRoutes(db: Database): Router {
    const router = Router();
    const userController = new UserController(db);

    // All user routes require authentication
    router.use(authenticate);

    /**
     * @route   GET /api/users/profile
     * @desc    Get user profile
     * @access  Private
     */
    router.get('/profile', (req, res) => userController.getProfile(req, res));

    /**
     * @route   PUT /api/users/profile
     * @desc    Update user profile
     * @access  Private
     */
    router.put(
        '/profile',
        validate(updateProfileSchema),
        (req, res) => userController.updateProfile(req, res)
    );

    /**
     * @route   GET /api/users/measurements
     * @desc    Get body measurements
     * @access  Private
     */
    router.get('/measurements', (req, res) => userController.getMeasurements(req, res));

    /**
     * @route   POST /api/users/measurements
     * @desc    Add body measurement
     * @access  Private
     */
    router.post(
        '/measurements',
        validate(bodyMeasurementSchema),
        (req, res) => userController.addMeasurement(req, res)
    );

    /**
     * @route   DELETE /api/users/measurements/:id
     * @desc    Delete body measurement
     * @access  Private
     */
    router.delete('/measurements/:id', (req, res) => userController.deleteMeasurement(req, res));

    return router;
}
