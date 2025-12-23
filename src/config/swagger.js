/**
 * Swagger API Documentation Configuration
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Caloriv API',
            version: '3.2.0',
            description: 'Comprehensive fitness and nutrition tracking API',
            contact: {
                name: 'Caloriv Support',
                email: 'support@caloriv.com',
                url: 'https://caloriv.com'
            },
            license: {
                name: 'MIT',
                url: 'https://opensource.org/licenses/MIT'
            }
        },
        servers: [
            {
                url: 'http://localhost:3000',
                description: 'Development server'
            },
            {
                url: 'https://api.caloriv.com',
                description: 'Production server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', example: '1234567890' },
                        email: { type: 'string', format: 'email', example: 'user@example.com' },
                        name: { type: 'string', example: 'John Doe' },
                        age: { type: 'integer', example: 25 },
                        gender: { type: 'string', enum: ['male', 'female', 'other'], example: 'male' },
                        height: { type: 'integer', example: 175 },
                        currentWeight: { type: 'integer', example: 70 },
                        targetWeight: { type: 'integer', example: 65 },
                        goal: { type: 'string', enum: ['lose', 'gain', 'maintain'], example: 'lose' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                Food: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Apple' },
                        nameHindi: { type: 'string', example: 'सेब' },
                        calories: { type: 'integer', example: 95 },
                        protein: { type: 'number', example: 0.5 },
                        carbs: { type: 'number', example: 25 },
                        fat: { type: 'number', example: 0.3 },
                        fiber: { type: 'number', example: 4.4 },
                        servingSize: { type: 'string', example: '1 medium (182g)' },
                        imageUrl: { type: 'string', format: 'uri' },
                        emoji: { type: 'string', example: '🍎' },
                        isActive: { type: 'boolean', example: true }
                    }
                },
                Exercise: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string', example: 'Push-ups' },
                        category: { type: 'string', example: 'Strength' },
                        difficulty: { type: 'string', enum: ['beginner', 'intermediate', 'advanced'] },
                        equipment: { type: 'string', example: 'None' },
                        targetMuscles: { type: 'array', items: { type: 'string' }, example: ['Chest', 'Triceps'] },
                        gifUrl: { type: 'string', format: 'uri' },
                        instructions: { type: 'string' },
                        description: { type: 'string' }
                    }
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: false },
                        error: { type: 'string', example: 'Error message' },
                        details: { type: 'array', items: { type: 'object' } }
                    }
                },
                Success: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean', example: true },
                        message: { type: 'string', example: 'Operation successful' }
                    }
                }
            },
            responses: {
                UnauthorizedError: {
                    description: 'Authentication required',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/Error' }
                        }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Users', description: 'User profile management' },
            { name: 'Foods', description: 'Food database and logging' },
            { name: 'Exercises', description: 'Exercise database and tracking' },
            { name: 'Admin', description: 'Admin-only endpoints' },
            { name: 'Config', description: 'App configuration' }
        ]
    },
    apis: ['./server.js', './src/routes/*.ts', './src/controllers/*.ts']
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
