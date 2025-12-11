import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

export async function getFoods(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const category = request.query.get('category');
        const search = request.query.get('search');

        const container = getContainer(CONTAINERS.FOODS);

        let query = 'SELECT * FROM c WHERE c.isActive = true';
        const parameters: any[] = [];

        if (category) {
            query += ' AND c.category = @category';
            parameters.push({ name: '@category', value: category });
        }

        if (search) {
            query += ' AND (CONTAINS(LOWER(c.name), LOWER(@search)) OR CONTAINS(LOWER(c.nameHindi), LOWER(@search)) OR CONTAINS(LOWER(c.searchTerms), LOWER(@search)))';
            parameters.push({ name: '@search', value: search });
        }

        query += ' ORDER BY c.name ASC';

        const { resources } = await container.items
            .query({ query, parameters })
            .fetchAll();

        context.log(`Retrieved ${resources.length} foods`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: resources,
                count: resources.length,
            },
        };
    } catch (error: any) {
        context.error('Get foods error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to fetch foods' },
        };
    }
}

app.http('getFoods', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'foods',
    handler: getFoods,
});
