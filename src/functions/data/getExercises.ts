import { app, HttpRequest, HttpResponseInit, InvocationContext } from '@azure/functions';
import { getContainer, CONTAINERS } from '../../lib/cosmosClient';

export async function getExercises(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  try {
    const category = request.query.get('category');
    const difficulty = request.query.get('difficulty');
    const search = request.query.get('search');

    const container = getContainer(CONTAINERS.EXERCISES);

    let query = 'SELECT * FROM c WHERE c.isActive = true';
    const parameters: any[] = [];

    if (category) {
      query += ' AND c.category = @category';
      parameters.push({ name: '@category', value: category });
    }

    if (difficulty) {
      query += ' AND c.difficulty = @difficulty';
      parameters.push({ name: '@difficulty', value: difficulty });
    }

    if (search) {
      query += ' AND (CONTAINS(LOWER(c.name), LOWER(@search)) OR CONTAINS(LOWER(c.category), LOWER(@search)))';
      parameters.push({ name: '@search', value: search });
    }

    query += ' ORDER BY c.name ASC';

    const { resources } = await container.items
      .query({ query, parameters })
      .fetchAll();

    context.log(`Retrieved ${resources.length} exercises`);

    return {
      status: 200,
      jsonBody: {
        success: true,
        data: resources,
        count: resources.length,
      },
    };
  } catch (error: any) {
    context.error('Get exercises error:', error);
    return {
      status: 500,
      jsonBody: { success: false, message: 'Failed to fetch exercises' },
    };
  }
}

app.http('getExercises', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'exercises',
  handler: getExercises,
});
