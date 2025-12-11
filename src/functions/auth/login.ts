import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import bcrypt from 'bcryptjs';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';
import { generateToken } from '../../lib/jwtHelper';
import { sanitizeUserId } from '../../lib/validators';
import { LoginRequest, User } from '../../types/User';

export async function login(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = (await request.json()) as LoginRequest;
        const { email, password } = body;

        if (!email || !password) {
            return {
                status: 400,
                jsonBody: { success: false, message: 'Missing email or password' },
            };
        }

        const userId = sanitizeUserId(email);
        const usersContainer = getContainer(CONTAINERS.USERS);

        // Get user
        let user: User;
        try {
            const { resource } = await usersContainer.item(userId, email).read<User>();
            if (!resource) {
                return {
                    status: 404,
                    jsonBody: { success: false, message: 'User not found' },
                };
            }
            user = resource;
        } catch (error: any) {
            return {
                status: 404,
                jsonBody: { success: false, message: 'User not found' },
            };
        }

        // Verify password
        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return {
                status: 401,
                jsonBody: { success: false, message: 'Invalid credentials' },
            };
        }

        // Generate JWT
        const token = generateToken({ userId: user.id, email: user.email });

        context.log(`User logged in: ${email}`);

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
                    profile: user.profile,
                },
            },
        };
    } catch (error: any) {
        context.error('Login error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Login failed' },
        };
    }
}

app.http('login', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'login',
    handler: login,
});
