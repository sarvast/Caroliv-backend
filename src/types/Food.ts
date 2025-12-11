export interface Food {
    id: string;
    name: string;
    nameHindi: string;
    category: string;
    emoji: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    searchTerms: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateFoodRequest {
    name: string;
    nameHindi: string;
    category: string;
    emoji: string;
    servingSize: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    searchTerms: string;
}
