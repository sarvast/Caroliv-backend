import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';
import { verifyToken, extractTokenFromHeader } from '../../lib/jwtHelper';
import { SyncProfileRequest, User } from '../../types/User';

export async function syncProfile(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        // Verify JWT
        const authHeader = request.headers.get('authorization');
        const token = extractTokenFromHeader(authHeader);

        if (!token) {
            return {
                status: 401,
                jsonBody: { success: false, message: 'No token provided' },
            };
        }

        const payload = verifyToken(token);
        if (!payload) {
            return {
                status: 401,
                jsonBody: { success: false, message: 'Invalid token' },
            };
        }

        const body = (await request.json()) as SyncProfileRequest;

        // Validation
        if (body.profile?.targetWeight !== undefined) {
            const tw = body.profile.targetWeight;
            if (typeof tw !== 'number' || tw < 30 || tw > 300) {
                return {
                    status: 400,
                    jsonBody: { success: false, message: 'Target weight must be between 30 and 300 kg' },
                };
            }
        }
        const usersContainer = getContainer(CONTAINERS.USERS);

        // Get current user
        const { resource: user } = await usersContainer
            .item(payload.userId, payload.email)
            .read<User>();

        if (!user) {
            return {
                status: 404,
                jsonBody: { success: false, message: 'User not found' },
            };
        }

        // Update user data
        const updatedUser: User = {
            ...user,
            profile: body.profile ? { ...user.profile, ...body.profile } : user.profile,
            dailyLogs: body.dailyLogs || user.dailyLogs,
            subscription: body.subscription
                ? { ...user.subscription, ...body.subscription }
                : user.subscription,
            lastSyncedAt: new Date().toISOString(),
        };

        // Save to Cosmos DB
        await usersContainer.item(user.id, user.email).replace(updatedUser);

        context.log(`Profile synced for user: ${payload.email}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                message: 'Profile synced successfully',
                lastSyncedAt: updatedUser.lastSyncedAt,
            },
        };
    } catch (error: any) {
        context.error('Sync profile error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Sync failed' },
        };
    }
}

app.http('syncProfile', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'syncProfile',
    handler: syncProfile,
});
