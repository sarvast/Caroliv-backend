export function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 6) {
        return { valid: false, message: 'Password must be at least 6 characters' };
    }
    return { valid: true };
}

export function sanitizeUserId(email: string): string {
    return `user_${email.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`;
}

export function isAdminRequest(headers: Record<string, string>): boolean {
    const adminKey = headers['x-admin-key'] || headers['X-Admin-Key'];
    return adminKey === process.env.ADMIN_API_KEY;
}
