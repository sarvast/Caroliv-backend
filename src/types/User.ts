export interface User {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    gender: 'male' | 'female';

    onboardingProgress: {
        basicInfoDone: boolean;
        bioDone: boolean;
    };

    profile: {
        age?: number;
        height?: number;
        currentWeight?: number;
        targetWeight?: number;
        activityLevel?: number;
        fitnessGoal?: 'loss' | 'gain' | 'maintain' | 'lean' | 'recomp';
        stepGoal?: number;
        waterGoal?: number;
        bmr?: number;
        tdee?: number;
        bmi?: number;
    };

    subscription: {
        plan: 'free' | 'premium';
        premiumExpiresAt: string | null;
        razorpay?: {
            lastPaymentId?: string;
            lastOrderId?: string;
        };
    };

    dailyLogs: DailyLog[];
    streak: number;
    createdAt: string;
    lastSyncedAt: string;
}

export interface DailyLog {
    date: string;
    steps: number;
    water_ml: number;
    calories_eaten: number;
    calories_burned: number;
    workout_done: boolean;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    gender: 'male' | 'female';
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface SyncProfileRequest {
    profile?: Partial<User['profile']>;
    dailyLogs?: DailyLog[];
    subscription?: Partial<User['subscription']>;
}
