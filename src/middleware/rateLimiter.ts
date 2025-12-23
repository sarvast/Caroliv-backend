import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
    [key: string]: {
        count: number;
        resetTime: number;
    };
}

const store: RateLimitStore = {};

// Cleanup old entries every 10 minutes
setInterval(() => {
    const now = Date.now();
    Object.keys(store).forEach(key => {
        if (store[key].resetTime < now) {
            delete store[key];
        }
    });
}, 10 * 60 * 1000);

export interface RateLimitOptions {
    windowMs: number;      // Time window in milliseconds
    maxRequests: number;   // Max requests per window
    message?: string;      // Custom error message
}

/**
 * Simple in-memory rate limiter middleware
 * Limits requests per IP address
 */
export function rateLimiter(options: RateLimitOptions) {
    const { windowMs, maxRequests, message = 'Too many requests, please try again later' } = options;

    return (req: Request, res: Response, next: NextFunction) => {
        const ip = req.ip || req.socket.remoteAddress || 'unknown';
        const key = `${ip}:${req.path}`;
        const now = Date.now();

        // Initialize or get existing record
        if (!store[key] || store[key].resetTime < now) {
            store[key] = {
                count: 1,
                resetTime: now + windowMs
            };
            return next();
        }

        // Increment count
        store[key].count++;

        // Check if limit exceeded
        if (store[key].count > maxRequests) {
            const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);
            res.setHeader('Retry-After', retryAfter.toString());
            return res.status(429).json({
                success: false,
                message,
                retryAfter
            });
        }

        next();
    };
}

// Preset rate limiters for common use cases
export const authLimiter = rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,            // 5 attempts per 15 min
    message: 'Too many login attempts. Please try again in 15 minutes.'
});

export const strictAuthLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,            // 3 attempts per hour
    message: 'Too many password reset attempts. Please try again in 1 hour.'
});

export const registrationLimiter = rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,            // 3 registrations per hour per IP
    message: 'Too many registration attempts. Please try again later.'
});
