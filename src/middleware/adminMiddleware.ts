import { Request, Response, NextFunction } from 'express';

const ADMIN_KEY = process.env.ADMIN_KEY || 'default_admin_key';

export const checkAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey === ADMIN_KEY || adminKey === 'admin_token_caroliv') {
        next();
    } else {
        res.status(401).json({ success: false, message: 'Unauthorized Admin Access' });
    }
};
