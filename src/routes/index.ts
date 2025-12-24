/**
 * Main Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import { createAuthRoutes } from './auth';
import { createUserRoutes } from './users';
import { createAdminRoutes } from './admin';
// import { Database } from 'sqlite3';

export function createRoutes(db: any): Router {
    const router = Router();

    // Mount route modules
    router.use('/auth', createAuthRoutes(db));
    router.use('/users', createUserRoutes(db));

    // Health check
    router.get('/health', (req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            version: '3.2.0'
        });
    });

    return router;
}
