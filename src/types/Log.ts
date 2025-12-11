export interface Log {
    id: string;
    userId: string;
    email: string;
    type: 'food' | 'workout';
    date: string; // YYYY-MM-DD
    details: FoodLogDetails | WorkoutLogDetails;
    calories: number;
    createdAt: string;
}

export interface FoodLogDetails {
    foodName: string;
    servingSize: string;
    protein?: number;
    carbs?: number;
    fat?: number;
}

export interface WorkoutLogDetails {
    workoutName: string;
    duration: number; // minutes
    exercises?: string[];
}

export interface CreateLogRequest {
    type: 'food' | 'workout';
    date: string;
    details: FoodLogDetails | WorkoutLogDetails;
    calories: number;
}
