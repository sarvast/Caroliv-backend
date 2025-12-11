/**
 * ONE-TIME MIGRATION SCRIPT
 * Migrates local exercise and food data to Cosmos DB
 */

import { CosmosClient } from '@azure/cosmos';
import { EXERCISE_LIBRARY } from '../data/exerciseLibrary';
import { DEFAULT_FOOD_ITEMS } from '../data/foodItems';

const connectionString = process.env.COSMOS_CONNECTION_STRING!;
const databaseName = 'caroliv-db';

async function migrateData() {
    console.log('🚀 Starting migration...\n');

    const client = new CosmosClient(connectionString);
    const database = client.database(databaseName);

    // ============================================
    // MIGRATE EXERCISES
    // ============================================
    console.log('📋 Migrating Exercises...');
    const exercisesContainer = database.container('exercises');

    let exerciseCount = 0;
    for (const exercise of EXERCISE_LIBRARY) {
        const exerciseDoc = {
            id: exercise.id,
            name: exercise.name,
            nameHindi: exercise.name, // Add Hindi translation if needed
            category: exercise.category.toLowerCase(),
            difficulty: exercise.difficulty.toLowerCase(),
            gifUrl: exercise.gifUrl || '',
            caloriesPer10Min: 50, // Default, adjust as needed
            targetMuscles: [exercise.category.toLowerCase()],
            sets: exercise.defaultSets || '3 x 12',
            instructions: exercise.description || '',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await exercisesContainer.items.create(exerciseDoc);
            exerciseCount++;
            console.log(`  ✅ ${exercise.name}`);
        } catch (error: any) {
            if (error.code === 409) {
                console.log(`  ⚠️  ${exercise.name} (already exists)`);
            } else {
                console.error(`  ❌ ${exercise.name}:`, error.message);
            }
        }
    }

    console.log(`\n✅ Migrated ${exerciseCount} exercises\n`);

    // ============================================
    // MIGRATE FOODS
    // ============================================
    console.log('🍽️  Migrating Foods...');
    const foodsContainer = database.container('foods');

    let foodCount = 0;
    for (const food of DEFAULT_FOOD_ITEMS) {
        const foodDoc = {
            id: food.id,
            name: food.name,
            nameHindi: food.nameHindi,
            category: getCategoryFromName(food.name),
            emoji: food.emoji,
            imageUrl: getImageUrlForFood(food.emoji), // Convert emoji to image URL
            servingSize: '1 serving',
            calories: food.calories,
            protein: 0, // Add if available
            carbs: 0,
            fat: 0,
            fiber: 0,
            searchTerms: food.searchTerms || food.name.toLowerCase(),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        try {
            await foodsContainer.items.create(foodDoc);
            foodCount++;
            console.log(`  ✅ ${food.name}`);
        } catch (error: any) {
            if (error.code === 409) {
                console.log(`  ⚠️  ${food.name} (already exists)`);
            } else {
                console.error(`  ❌ ${food.name}:`, error.message);
            }
        }
    }

    console.log(`\n✅ Migrated ${foodCount} foods\n`);
    console.log('🎉 Migration complete!');
}

// Helper: Get category from food name
function getCategoryFromName(name: string): string {
    const lower = name.toLowerCase();
    if (lower.includes('rice') || lower.includes('roti') || lower.includes('bread')) return 'grains';
    if (lower.includes('chicken') || lower.includes('egg') || lower.includes('paneer')) return 'protein';
    if (lower.includes('dal') || lower.includes('lentil')) return 'protein';
    if (lower.includes('fruit') || lower.includes('banana') || lower.includes('apple')) return 'fruits';
    if (lower.includes('milk') || lower.includes('yogurt') || lower.includes('curd')) return 'dairy';
    if (lower.includes('vegetable') || lower.includes('sabzi')) return 'vegetables';
    return 'other';
}

// Helper: Convert emoji to image URL (Unsplash)
function getImageUrlForFood(emoji: string): string {
    const emojiToImage: Record<string, string> = {
        '🍚': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400', // Rice
        '🥚': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400', // Egg
        '🍞': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', // Bread
        '🫓': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=400', // Roti
        '🍳': 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=400', // Omelette
        '🥔': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400', // Potato
        '🧀': 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400', // Paneer
        '🍲': 'https://images.unsplash.com/photo-1596797038530-2c107229654b?w=400', // Dal
        '🍗': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400', // Chicken
        '🥘': 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=400', // Curry
        '🍛': 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400', // Biryani
        '🥟': 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', // Samosa
        '🍔': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400', // Vada Pav
        '🧁': 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', // Sweet
    };

    return emojiToImage[emoji] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
}

// Run migration
migrateData().catch(console.error);
