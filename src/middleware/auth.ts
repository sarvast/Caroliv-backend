/**
 * Authentication middleware for protected routes
 */
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: {
        userId: string;
        email: string;
        isAdmin?: boolean;
    };
}

/**
 * Verify JWT token and attach user to request
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No authentication token provided'
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'caroliv-secret-key-2025';
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            error: 'Invalid or expired token'
        });
    }
};

/**
 * Admin-only middleware
 * Requires authenticate middleware to run first
 */
export const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            });
        }

        // TODO: Add isAdmin field to users table and check here
        // For now, we'll use a simple admin email check
        const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim());

        if (adminEmails.length === 0) {
            console.warn('⚠️  No admin emails configured. All authenticated users have admin access!');
        }

        const isAdmin = adminEmails.length === 0 || adminEmails.includes(req.user.email);

        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                error: 'Admin access required'
            });
        }

        req.user.isAdmin = true;
        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            error: 'Authorization check failed'
        });
    }
};
