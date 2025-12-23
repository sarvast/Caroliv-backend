import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDb } from './lib/db-init';
import { logger } from './lib/logger';

// Import Routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import dataRoutes from './routes/dataRoutes';
import adminRoutes from './routes/adminRoutes';
import featureRoutes from './routes/featureRoutes';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Request Logger Middleware
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        if (res.statusCode >= 400) {
            logger.warn(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        } else {
            logger.debug(`${req.method} ${req.url} - ${res.statusCode} (${duration}ms)`);
        }
    });
    next();
});

// Initialize DB
initDb();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api', dataRoutes); // /api/foods, /api/exercises
app.use('/api/admin', adminRoutes);
app.use('/api/features', featureRoutes);

// Test Route
app.get('/', (req, res) => {
    res.json({
        status: 'Online',
        version: '1.0.0 (Caloriv Pro)',
        features: ['Leaderboard', 'Shields', 'Announcements', 'Smart Pairing']
    });
});

// Start Server
const server = app.listen(PORT, () => {
    logger.info(`✅ Caroliv API running on port ${PORT}`);
    logger.info(`🚀 Mode: Optimized for 1GB VM`);
});

// Graceful Shutdown
const shutdown = () => {
    logger.info('🛑 Sigterm received. Shutting down gracefully...');
    server.close(() => {
        logger.info('💥 Process terminated. Goodbye.');
        process.exit(0);
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
