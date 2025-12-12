import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

export async function getUsers(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const container = getContainer(CONTAINERS.USERS);

        // Fetch all users
        // The profile object (containing targetWeight) is included in the user document
        const { resources } = await container.items.readAll().fetchAll();

        context.log(`Fetched ${resources.length} users`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: resources,
                count: resources.length
            },
        };
    } catch (error: any) {
        context.error('Get users error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to fetch users' },
        };
    }
}

app.http('getUsers', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'admin/users',
    handler: getUsers,
});
