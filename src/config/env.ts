/**
 * Environment variable validation and configuration
 * Ensures all required environment variables are present at startup
 */

interface EnvConfig {
    PORT: number;
    JWT_SECRET: string;
    RAZORPAY_KEY_ID: string;
    RAZORPAY_KEY_SECRET: string;
    GEMINI_API_KEY?: string;
    NODE_ENV: 'development' | 'production' | 'test';
    CORS_ORIGIN?: string;
}

function validateEnv(): EnvConfig {
    const errors: string[] = [];

    // Required variables
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        errors.push('JWT_SECRET is required');
    } else if (JWT_SECRET.length < 32) {
        errors.push('JWT_SECRET must be at least 32 characters long');
    }

    const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
    if (!RAZORPAY_KEY_ID) {
        errors.push('RAZORPAY_KEY_ID is required');
    }

    const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;
    if (!RAZORPAY_KEY_SECRET) {
        errors.push('RAZORPAY_KEY_SECRET is required');
    }

    // Optional with defaults
    const PORT = parseInt(process.env.PORT || '3000', 10);
    if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
        errors.push('PORT must be a valid port number (1-65535)');
    }

    const NODE_ENV = process.env.NODE_ENV || 'development';
    if (!['development', 'production', 'test'].includes(NODE_ENV)) {
        errors.push('NODE_ENV must be development, production, or test');
    }

    // Throw if any errors
    if (errors.length > 0) {
        console.error('❌ Environment validation failed:');
        errors.forEach(error => console.error(`  - ${error}`));
        console.error('\nPlease check your .env file and ensure all required variables are set.');
        process.exit(1);
    }

    // Warnings for optional variables
    if (!process.env.GEMINI_API_KEY) {
        console.warn('⚠️  GEMINI_API_KEY not set - AI features will be disabled');
    }

    return {
        PORT,
        JWT_SECRET: JWT_SECRET!,
        RAZORPAY_KEY_ID: RAZORPAY_KEY_ID!,
        RAZORPAY_KEY_SECRET: RAZORPAY_KEY_SECRET!,
        GEMINI_API_KEY: process.env.GEMINI_API_KEY,
        NODE_ENV: NODE_ENV as 'development' | 'production' | 'test',
        CORS_ORIGIN: process.env.CORS_ORIGIN,
    };
}

export const env = validateEnv();

// Log configuration (without secrets)
console.log('✅ Environment configuration loaded:');
console.log(`  - NODE_ENV: ${env.NODE_ENV}`);
console.log(`  - PORT: ${env.PORT}`);
console.log(`  - JWT_SECRET: ${env.JWT_SECRET.substring(0, 8)}...`);
console.log(`  - RAZORPAY_KEY_ID: ${env.RAZORPAY_KEY_ID.substring(0, 8)}...`);
console.log(`  - GEMINI_API_KEY: ${env.GEMINI_API_KEY ? 'Set' : 'Not set'}`);
console.log(`  - CORS_ORIGIN: ${env.CORS_ORIGIN || 'All origins (development)'}`);
