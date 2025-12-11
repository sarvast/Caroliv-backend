import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import bcrypt from 'bcryptjs';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';
import { generateToken } from '../../lib/jwtHelper';
import { validateEmail, validatePassword, sanitizeUserId } from '../../lib/validators';
import { User, RegisterRequest } from '../../types/User';

export async function register(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as RegisterRequest;
        const { email, password, name, gender } = body;

        // Validation
        if (!email || !password || !name || !gender) {
            return {
                status: 400,
                jsonBody: { success: false, message: 'Missing required fields' },
            };
        }

        if (!validateEmail(email)) {
            return {
                status: 400,
                jsonBody: { success: false, message: 'Invalid email format' },
            };
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.valid) {
            return {
                status: 400,
                jsonBody: { success: false, message: passwordValidation.message },
            };
        }

        const userId = sanitizeUserId(email);
        const usersContainer = getContainer(CONTAINERS.USERS);

        // Check if user already exists
        try {
            await usersContainer.item(userId, email).read();
            return {
                status: 409,
                jsonBody: { success: false, message: 'User already exists' },
            };
        } catch (error: any) {
            if (error.code !== 404) throw error;
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create user document
        const now = new Date().toISOString();
        const user: User = {
            id: userId,
            email,
            passwordHash,
            name,
            gender,
            onboardingProgress: {
                basicInfoDone: false,
                bioDone: false,
            },
            profile: {},
            subscription: {
                plan: 'free',
                premiumExpiresAt: null,
            },
            dailyLogs: [],
            streak: 0,
            createdAt: now,
            lastSyncedAt: now,
        };

        await usersContainer.items.create(user);

        // Generate JWT
        const token = generateToken({ userId: user.id, email: user.email });

        context.log(`User registered: ${email}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    gender: user.gender,
                    subscription: user.subscription,
                    onboardingProgress: user.onboardingProgress,
                },
            },
        };
    } catch (error: any) {
        context.error('Register error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Registration failed' },
        };
    }
}

app.http('register', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'register',
    handler: register,
});
