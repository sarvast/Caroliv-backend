/**
 * Error handling middleware
 * Catches and formats errors consistently
 */

const logger = require('../utils/logger').logger;

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req: any, res: any) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
};

/**
 * Global error handler
 * Must be the last middleware
 */
export const errorHandler = (err: any, req: any, res: any, next: any) => {
    // Log the error
    logger.error('Unhandled error', err, {
        path: req.path,
        method: req.method,
        body: req.body,
        query: req.query
    });

    // Don't leak error details in production
    const isDevelopment = process.env.NODE_ENV !== 'production';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: isDevelopment ? err.message : undefined
        });
    }

    if (err.name === 'UnauthorizedError' || err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            error: 'Authentication failed'
        });
    }

    if (err.code === 'SQLITE_CONSTRAINT') {
        return res.status(409).json({
            success: false,
            error: 'Resource already exists or constraint violation'
        });
    }

    // Generic error response
    res.status(err.status || 500).json({
        success: false,
        error: isDevelopment ? err.message : 'Internal server error',
        stack: isDevelopment ? err.stack : undefined
    });
};

/**
 * Async handler wrapper to catch promise rejections
 */
export const asyncHandler = (fn: Function) => {
    return (req: any, res: any, next: any) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
