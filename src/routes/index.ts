/**
 * Main Routes Index
 * Combines all route modules
 */

import { Router } from 'express';
import { Database } from 'sqlite3';
import { createAuthRoutes } from './auth';
import { createUserRoutes } from './users';

export function createRoutes(db: Database): Router {
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
