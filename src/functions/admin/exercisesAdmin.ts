import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

// CREATE Exercise
export async function createExercise(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const body = await request.json() as any;

        const container = getContainer(CONTAINERS.EXERCISES);
        const now = new Date().toISOString();

        const exercise = {
            id: `ex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: body.name,
            category: body.category,
            difficulty: body.difficulty,
            gifUrl: body.gifUrl || '',
            defaultSets: body.defaultSets || '',
            description: body.description || '',
            instructions: body.instructions || '',
            targetMuscles: body.targetMuscles || [],
            isActive: body.isActive !== false,
            createdAt: now,
            updatedAt: now,
        };

        await container.items.create(exercise);

        context.log(`Created exercise: ${exercise.name}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: exercise,
            },
        };
    } catch (error: any) {
        context.error('Create exercise error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to create exercise' },
        };
    }
}

// UPDATE Exercise
export async function updateExercise(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const id = request.params.id;
        const body = await request.json() as any;

        const container = getContainer(CONTAINERS.EXERCISES);

        // Get existing exercise using query (partition key is /category)
        const { resources } = await container.items
            .query({
                query: 'SELECT * FROM c WHERE c.id = @id',
                parameters: [{ name: '@id', value: id }]
            })
            .fetchAll();

        if (!resources || resources.length === 0) {
            return {
                status: 404,
                jsonBody: { success: false, message: 'Exercise not found' },
            };
        }

        const existing = resources[0];

        const updated = {
            ...existing,
            name: body.name ?? existing.name,
            category: body.category ?? existing.category,
            difficulty: body.difficulty ?? existing.difficulty,
            gifUrl: body.gifUrl ?? existing.gifUrl,
            defaultSets: body.defaultSets ?? existing.defaultSets,
            description: body.description ?? existing.description,
            instructions: body.instructions ?? existing.instructions,
            targetMuscles: body.targetMuscles ?? existing.targetMuscles,
            isActive: body.isActive ?? existing.isActive,
            updatedAt: new Date().toISOString(),
        };

        await container.item(id, updated.category).replace(updated);

        context.log(`Updated exercise: ${updated.name}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                data: updated,
            },
        };
    } catch (error: any) {
        context.error('Update exercise error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to update exercise' },
        };
    }
}

// DELETE Exercise
export async function deleteExercise(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const id = request.params.id;

        const container = getContainer(CONTAINERS.EXERCISES);

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
                jsonBody: { success: false, message: 'Exercise not found' },
            };
        }

        const exercise = resources[0];
        await container.item(id, exercise.category).delete();

        context.log(`Deleted exercise: ${id}`);

        return {
            status: 200,
            jsonBody: {
                success: true,
                message: 'Exercise deleted successfully',
            },
        };
    } catch (error: any) {
        context.error('Delete exercise error:', error);
        return {
            status: 500,
            jsonBody: { success: false, message: 'Failed to delete exercise' },
        };
    }
}

// Register routes
app.http('createExercise', {
    methods: ['POST'],
    authLevel: 'anonymous',
    route: 'admin/exercises',
    handler: createExercise,
});

app.http('updateExercise', {
    methods: ['PUT'],
    authLevel: 'anonymous',
    route: 'admin/exercises/{id}',
    handler: updateExercise,
});

app.http('deleteExercise', {
    methods: ['DELETE'],
    authLevel: 'anonymous',
    route: 'admin/exercises/{id}',
    handler: deleteExercise,
});
