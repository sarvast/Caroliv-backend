import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';
import { verifyToken, extractTokenFromHeader } from '../../lib/jwtHelper';
import { CreateLogRequest, Log } from '../../types/Log';

export async function logFood(
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

        const body = (await request.json()) as CreateLogRequest;

        if (body.type !== 'food') {
            return {
                status: 400,
                jsonBody: { success: false, message: 'Invalid log type' },
            };
        }

        const logsContainer = getContainer(CONTAINERS.LOGS);
        const now = new Date().toISOString();

        const log: Log = {
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            userId: payload.userId,
            email: payload.email,
            type: 'food',
            date: body.date,
            details: body.details,
            calories: body.calories,
            createdAt: now,
        };

        await logsContainer.items.create(log);

        context.log(`Food logged for user: ${payload.email}, calories: ${body.calories}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: log,
            },
        };
    } catch (error: any) {
        context.error('Log food error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to log food' },
        };
    }
}

app.http('logFood', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'logs/food',
    handler: logFood,
});
