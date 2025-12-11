export interface Exercise {
    id: string;
    name: string;
    nameHindi: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    gifUrl: string;
    caloriesPer10Min: number;
    targetMuscles: string[];
    sets: string;
    instructions: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateExerciseRequest {
    name: string;
    nameHindi: string;
    category: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    gifUrl: string;
    caloriesPer10Min: number;
    targetMuscles: string[];
    sets: string;
    instructions: string;
}
