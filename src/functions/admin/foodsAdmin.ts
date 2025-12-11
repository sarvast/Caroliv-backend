import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

// CREATE Food
export async function createFood(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as any;

        const container = getContainer(CONTAINERS.FOODS);
        const now = new Date().toISOString();

        const food = {
            id: `food_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: body.name,
            nameHindi: body.nameHindi,
            category: body.category,
            emoji: body.emoji || '',
            imageUrl: body.imageUrl || '',
            servingSize: body.servingSize || '100g',
            calories: body.calories,
            protein: body.protein || 0,
            carbs: body.carbs || 0,
            fat: body.fat || 0,
            fiber: body.fiber || 0,
            searchTerms: body.searchTerms || '',
            isActive: body.isActive !== false,
            createdAt: now,
            updatedAt: now,
        };

        await container.items.create(food);

        context.log(`Created food: ${food.name}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: food,
            },
        };
    } catch (error: any) {
        context.error('Create food error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to create food' },
        };
    }
}

// UPDATE Food
export async function updateFood(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const id = request.params.id;
        const body = await request.json() as any;

        const container = getContainer(CONTAINERS.FOODS);

        // Get existing food using query (partition key is /category, not /id)
        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return {
                status: 404,
                jsonBody: { success: false, message: 'Food not found' },
            };
        }

        const existing = resources[0];

        const updated = {
            ...existing,
            name: body.name ?? existing.name,
            nameHindi: body.nameHindi ?? existing.nameHindi,
            category: body.category ?? existing.category,
            emoji: body.emoji ?? existing.emoji,
            imageUrl: body.imageUrl ?? existing.imageUrl,
            servingSize: body.servingSize ?? existing.servingSize,
            calories: body.calories ?? existing.calories,
            protein: body.protein ?? existing.protein,
            carbs: body.carbs ?? existing.carbs,
            fat: body.fat ?? existing.fat,
            fiber: body.fiber ?? existing.fiber,
            searchTerms: body.searchTerms ?? existing.searchTerms,
            isActive: body.isActive ?? existing.isActive,
            updatedAt: new Date().toISOString(),
        };

        await container.item(id, updated.category).replace(updated);

        context.log(`Updated food: ${updated.name}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: updated,
            },
        };
    } catch (error: any) {
        context.error('Update food error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to update food' },
        };
    }
}

// DELETE Food
export async function deleteFood(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const id = request.params.id;

        const container = getContainer(CONTAINERS.FOODS);

        // First query to get the category (partition key)
        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return {
                status: 404,
                jsonBody: { success: false, message: 'Food not found' },
            };
        }

        const food = resources[0];
        await container.item(id, food.category).delete();

        context.log(`Deleted food: ${id}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                message: 'Food deleted successfully',
            },
        };
    } catch (error: any) {
        context.error('Delete food error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to delete food' },
        };
    }
}

// Register routes
app.http('createFood', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'admin/foods',
    handler: createFood,
});

app.http('updateFood', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'admin/foods/{id}',
    handler: updateFood,
});

app.http('deleteFood', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'admin/foods/{id}',
    handler: deleteFood,
});
