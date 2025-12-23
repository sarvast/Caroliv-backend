/**
 * Rate limiting middleware to prevent brute force attacks
 */
import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Clean up old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);

interface RateLimitOptions {
    windowMs: number;  // Time window in milliseconds
    max: number;       // Max requests per window
    message?: string;  // Custom error message
    keyGenerator?: (req: Request) => string;  // Custom key generator
}

/**
 * Rate limiting middleware factory
 */
export const rateLimit = (options: RateLimitOptions) => {
    const {
        windowMs,
        max,
        message = 'Too many requests, please try again later',
        keyGenerator = (req: Request) => req.ip || 'unknown'
    } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        const key = keyGenerator(req);
        const now = Date.now();

        if (!store[key] || store[key].resetTime < now) {
            // Initialize or reset
            store[key] = {
                count: 1,
                resetTime: now + windowMs
            };
            return next();
        }

        store[key].count++;

        if (store[key].count > max) {
            const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            res.setHeader('X-RateLimit-Limit', max.toString());
            res.setHeader('X-RateLimit-Remaining', '0');
            res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());

            return res.status(429).json({
                success: false,
                error: message,
                retryAfter
            });
        }

        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', max.toString());
        res.setHeader('X-RateLimit-Remaining', (max - store[key].count).toString());
        res.setHeader('X-RateLimit-Reset', store[key].resetTime.toString());

        next();
    };
};

// Preset rate limiters
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
    keyGenerator: (req: Request) => {
        // Rate limit by IP + email combination for auth routes
        const email = req.body?.email || '';
        return `${req.ip}-${email}`;
    }
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute
    message: 'Too many requests. Please slow down.'
});

export const strictLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 requests per minute
    message: 'Rate limit exceeded. Please try again later.'
});
