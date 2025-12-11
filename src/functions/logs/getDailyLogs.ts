import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';
import { verifyToken, extractTokenFromHeader } from '../../lib/jwtHelper';

export async function getDailyLogs(
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

        const date = request.query.get('date');
        if (!date) {
            return {
                status: 400,
                jsonBody: { success: false, message: 'Date parameter required (YYYY-MM-DD)' },
            };
        }

        const logsContainer = getContainer(CONTAINERS.LOGS);

        // Query logs for specific user and date
        const query = `
      SELECT * FROM c 
      WHERE c.userId = @userId 
      AND c.date = @date 
      ORDER BY c.createdAt DESC
    `;

        const { resources } = await logsContainer.items
            .query({
                query,
                parameters: [
                    { name: '@userId', value: payload.userId },
                    { name: '@date', value: date },
                ],
            })
            .fetchAll();

        // Calculate totals
        const totalCalories = resources.reduce((sum: number, log: any) => sum + (log.calories || 0), 0);
        const foodLogs = resources.filter((log: any) => log.type === 'food');
        const workoutLogs = resources.filter((log: any) => log.type === 'workout');

        context.log(`Retrieved ${resources.length} logs for user: ${payload.email}, date: ${date}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: {
                    date,
                    logs: resources,
                    summary: {
                        totalLogs: resources.length,
                        totalCalories,
                        foodCount: foodLogs.length,
                        workoutCount: workoutLogs.length,
                        caloriesFromFood: foodLogs.reduce((sum: number, log: any) => sum + log.calories, 0),
                        caloriesBurned: workoutLogs.reduce((sum: number, log: any) => sum + log.calories, 0),
                    },
                },
            },
        };
    } catch (error: any) {
        context.error('Get daily logs error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to fetch logs' },
        };
    }
}

app.http('getDailyLogs', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'logs/daily',
    handler: getDailyLogs,
});
