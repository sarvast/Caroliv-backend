/**
 * Input validation schemas using Zod
 */
import { z } from 'zod';

// Auth schemas
export const registerSchema = z.object({
    email: z.string().email('Invalid email address').max(255),
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long'),
    name: z.string()
        .min(1, 'Name is required')
        .max(100, 'Name is too long'),
    age: z.number()
        .int('Age must be a whole number')
        .min(13, 'Must be at least 13 years old')
        .max(120, 'Invalid age')
        .optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    height: z.number()
        .positive('Height must be positive')
        .max(300, 'Invalid height')
        .optional(),
    currentWeight: z.number()
        .positive('Weight must be positive')
        .max(500, 'Invalid weight')
        .optional(),
    targetWeight: z.number()
        .positive('Target weight must be positive')
        .max(500, 'Invalid target weight')
        .optional(),
    goal: z.enum(['lose', 'gain', 'maintain']).optional()
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
});

export const resetPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
    currentWeight: z.number().positive('Weight must be positive'),
    age: z.number().int().positive('Age must be positive'),
    newPassword: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password is too long')
});

// User profile schema
export const updateProfileSchema = z.object({
    name: z.string().min(1).max(100).optional(),
    age: z.number().int().min(13).max(120).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    height: z.number().positive().max(300).optional(),
    currentWeight: z.number().positive().max(500).optional(),
    targetWeight: z.number().positive().max(500).optional(),
    goal: z.enum(['lose', 'gain', 'maintain']).optional(),
    chest: z.number().positive().max(200).optional(),
    waist: z.number().positive().max(200).optional(),
    arms: z.number().positive().max(100).optional(),
    hips: z.number().positive().max(200).optional()
});

// Food schemas
export const createFoodSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    nameHindi: z.string().max(200).optional(),
    calories: z.number().int().min(0, 'Calories cannot be negative'),
    protein: z.number().min(0, 'Protein cannot be negative').optional(),
    carbs: z.number().min(0, 'Carbs cannot be negative').optional(),
    fat: z.number().min(0, 'Fat cannot be negative').optional(),
    fiber: z.number().min(0, 'Fiber cannot be negative').optional(),
    servingSize: z.string().max(100).optional(),
    imageUrl: z.string().url('Invalid image URL').optional().or(z.literal('')),
    emoji: z.string().max(10).optional()
});

export const foodSubmissionSchema = z.object({
    name: z.string().min(1).max(200),
    brand: z.string().max(100).optional(),
    calories: z.number().int().min(0),
    carbs: z.number().min(0).optional(),
    protein: z.number().min(0).optional(),
    fat: z.number().min(0).optional(),
    servingSize: z.string().max(100).optional(),
    barcode: z.string().max(50).optional()
});

// Exercise schemas
export const createExerciseSchema = z.object({
    name: z.string().min(1, 'Name is required').max(200),
    category: z.string().max(50).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    equipment: z.string().max(100).optional(),
    targetMuscles: z.array(z.string()).optional(),
    gifUrl: z.string().url('Invalid GIF URL').optional().or(z.literal('')),
    defaultSets: z.string().optional(),
    instructions: z.string().optional(),
    description: z.string().optional()
});

export const exerciseSubmissionSchema = z.object({
    name: z.string().min(1).max(200),
    category: z.string().max(50).optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    equipment: z.string().max(100).optional(),
    targetMuscles: z.array(z.string()).optional(),
    gifUrl: z.string().url('Invalid GIF URL').optional().or(z.literal(''))
});

// Body measurements schema
export const bodyMeasurementSchema = z.object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    chest: z.number().positive().max(200).optional(),
    waist: z.number().positive().max(200).optional(),
    arms: z.number().positive().max(100).optional(),
    hips: z.number().positive().max(200).optional()
});

// App config schema
export const appConfigSchema = z.object({
    requiredVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in X.Y.Z format'),
    forceUpdate: z.boolean(),
    updateMessage: z.string().min(1).max(500),
    updateUrl: z.string().url('Invalid update URL')
});

// Validation middleware factory
export const validate = (schema: z.ZodSchema) => {
    return (req: any, res: any, next: any) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors.map(err => ({
                        field: err.path.join('.'),
                        message: err.message
                    }))
                });
            }
            next(error);
        }
    };
};
