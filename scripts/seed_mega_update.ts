import { db } from '../src/lib/db';
import crypto from 'crypto';

const exercisesStart = [
    {
        name: 'Burpees',
        category: 'cardio',
        difficulty: 'advanced',
        equipment: 'bodyweight',
        targetMuscles: ['full_body', 'legs', 'chest'],
        gifUrl: 'https://i.pinimg.com/originals/d1/00/b2/d100b21d7c96c397c8abd466ae0ce670.gif',
        description: 'A full body exercise used in strength training and as an aerobic exercise.',
        instructions: 'Start in a standing position, drop into a squat, kick your feet back, return to squat, and jump up.'
    },
    {
        name: 'Mountain Climbers',
        category: 'cardio',
        difficulty: 'intermediate',
        equipment: 'bodyweight',
        targetMuscles: ['abs', 'legs', 'shoulders'],
        gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT2V5adha9PhJ-vRWDy0BH-OXVoFcZrgtm0cg&s',
        description: 'A bodyweight exercise that mimics climbing a mountain.',
        instructions: 'Start in a plank, alternate bringing knees to chest rapidly.'
    },
    {
        name: 'Jumping Jacks',
        category: 'cardio',
        difficulty: 'beginner',
        equipment: 'bodyweight',
        targetMuscles: ['legs', 'shoulders', 'cardio'],
        gifUrl: 'https://cdn.dribbble.com/userupload/23995967/file/original-b7327e47be94975940e98b26277e5ead.gif',
        description: 'A physical jumping exercise.',
        instructions: 'Jump with legs spread wide and hands touching overhead, then return to a standing position.'
    },
    {
        name: 'Surya Namaskar',
        category: 'yoga',
        difficulty: 'intermediate',
        equipment: 'mat',
        targetMuscles: ['full_body', 'spine', 'legs'],
        gifUrl: 'https://i.pinimg.com/originals/38/17/4c/38174c698faab3324d6d3b7581868436.gif',
        description: 'A sequence of 12 powerful yoga poses.',
        instructions: 'Flow through the 12 poses breathing deeply.'
    },
    {
        name: 'Cobra Stretch',
        category: 'flexibility',
        difficulty: 'beginner',
        equipment: 'mat',
        targetMuscles: ['back', 'abs'],
        gifUrl: 'https://media.tenor.com/bHvaGEjp7PcAAAAM/workout-working-out.gif',
        description: 'A reclining back-bending asana in hatha yoga.',
        instructions: 'Lie on stomach, place hands under shoulders, lift chest.'
    }
];

const indianFoods = [
    { name: 'Samosa (1 pc)', calories: 260, protein: 3, carbs: 24, fat: 17, emoji: '🥟', pairingTags: 'Green Chutney,Tamarind Chutney' },
    { name: 'Vada Pav (1 pc)', calories: 290, protein: 5, carbs: 40, fat: 12, emoji: '🥯', pairingTags: 'Green Chutney,Red Garlic Chutney,Fried Chilli' },
    { name: 'Pani Puri (6 pcs)', calories: 330, protein: 4, carbs: 42, fat: 12, emoji: '🥣', pairingTags: 'Extra Pani,Sweet Chutney' },
    { name: 'Pav Bhaji (Plate)', calories: 400, protein: 10, carbs: 55, fat: 14, emoji: '🍛', pairingTags: 'Extra Pav,Butter,Onion Salad' },
    { name: 'Chole Bhature (Plate)', calories: 450, protein: 14, carbs: 50, fat: 22, emoji: '🍲', pairingTags: 'Onion Salad,Pickle,Lassi' },
    { name: 'Aloo Paratha (1 pc)', calories: 180, protein: 4, carbs: 30, fat: 6, emoji: '🫓', pairingTags: 'Curd,Butter,Pickle' },
    { name: 'Masala Dosa', calories: 350, protein: 6, carbs: 50, fat: 10, emoji: '🥞', pairingTags: 'Sambar,Coconut Chutney' },
    { name: 'Idli (2 pcs)', calories: 100, protein: 4, carbs: 20, fat: 0.5, emoji: '⚪', pairingTags: 'Sambar,Coconut Chutney' },
    { name: 'Momos (Steamed 6pcs)', calories: 210, protein: 8, carbs: 35, fat: 4, emoji: '🥟', pairingTags: 'Schezwan Chutney,Mayonnaise' },
    { name: 'Momos (Fried 6pcs)', calories: 350, protein: 7, carbs: 40, fat: 18, emoji: '🥟', pairingTags: 'Schezwan Chutney,Mayonnaise' },
    { name: 'Hakka Noodles (Plate)', calories: 300, protein: 8, carbs: 50, fat: 9, emoji: '🍜', pairingTags: 'Manchurian,Chilli Paneer' },
    { name: 'Manchurian (Dry)', calories: 250, protein: 6, carbs: 30, fat: 15, emoji: 'balls', pairingTags: 'Fried Rice,Noodles' },
    { name: 'Pizza (Slice)', calories: 280, protein: 10, carbs: 30, fat: 12, emoji: '🍕', pairingTags: 'Coke,Garlic Bread,Seasoning' },
    { name: 'Burger (Veg)', calories: 350, protein: 9, carbs: 45, fat: 16, emoji: '🍔', pairingTags: 'Fries,Coke' },
    { name: 'French Fries (Med)', calories: 360, protein: 4, carbs: 48, fat: 17, emoji: '🍟', pairingTags: 'Coke,Burger,Mayo' },
    { name: 'Gulab Jamun (1 pc)', calories: 150, protein: 2, carbs: 25, fat: 6, emoji: '🍮', pairingTags: 'Ice Cream' },
    { name: 'Jalebi (100g)', calories: 450, protein: 2, carbs: 80, fat: 15, emoji: '🥨', pairingTags: 'Rabdi,Milk' },
    { name: 'Masala Chai', calories: 120, protein: 4, carbs: 15, fat: 5, emoji: '☕', pairingTags: 'Biscuit,Toast,Sugar' },
    { name: 'Filter Coffee', calories: 100, protein: 3, carbs: 12, fat: 4, emoji: '☕', pairingTags: 'Sugar,Cookies' },
    { name: 'Lassi (Sweet)', calories: 250, protein: 8, carbs: 30, fat: 10, emoji: '🥛', pairingTags: 'Stuffed Paratha' },
    { name: 'Cold Drink (Can)', calories: 140, protein: 0, carbs: 39, fat: 0, emoji: '🥤', pairingTags: 'Pizza,Burger,Biryani' },
    { name: 'Veg Biryani', calories: 350, protein: 8, carbs: 55, fat: 12, emoji: '🍚', pairingTags: 'Raita,Salad,Papad' },
    { name: 'Chicken Biryani', calories: 450, protein: 22, carbs: 50, fat: 18, emoji: '🍗', pairingTags: 'Raita,Salad,Coke' },
    { name: 'Rajma Chawal', calories: 320, protein: 10, carbs: 55, fat: 7, emoji: '🍛', pairingTags: 'Onion,Papad' },
    { name: 'Kadhi Chawal', calories: 280, protein: 8, carbs: 45, fat: 8, emoji: '🍛', pairingTags: 'Pickle,Papad' },
];

async function seed() {
    console.log('🌱 Starting Mega Seed...');

    // Quick Schema Update (Ensure columns exist for safe seeding)
    try {
        await db.run("ALTER TABLE foods ADD COLUMN pairingTags TEXT DEFAULT ''");
        console.log('✅ Added pairingTags column');
    } catch (e: any) { }

    // 1. Seed Exercises
    for (const ex of exercisesStart) {
        const id = `ex_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const existing = await db.get('SELECT id FROM exercises WHERE name = ?', [ex.name]);
        if (!existing) {
            await db.run(
                `INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, description, instructions, isActive, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                [id, ex.name, ex.category, ex.difficulty, ex.equipment, JSON.stringify(ex.targetMuscles), ex.gifUrl, ex.description, ex.instructions, new Date().toISOString()]
            );
            console.log(`✅ Added Exercise: ${ex.name}`);
        } else {
            // Update GIF if exists
            await db.run('UPDATE exercises SET gifUrl = ? WHERE name = ?', [ex.gifUrl, ex.name]);
            console.log(`🔄 Updated GIF: ${ex.name}`);
        }
    }

    // 2. Seed Foods
    for (const food of indianFoods) {
        const id = `food_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
        const existing = await db.get('SELECT id FROM foods WHERE name = ?', [food.name]);

        if (!existing) {
            await db.run(
                `INSERT INTO foods (id, name, calories, protein, carbs, fat, emoji, pairingTags, isActive, createdAt)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                [id, food.name, food.calories, food.protein, food.carbs, food.fat, food.emoji, food.pairingTags, new Date().toISOString()]
            );
            console.log(`✅ Added Food: ${food.name}`);
        } else {
            await db.run('UPDATE foods SET pairingTags = ? WHERE name = ?', [food.pairingTags, food.name]);
            console.log(`🔄 Updated Pairing: ${food.name}`);
        }
    }

    console.log('🎉 Seeding Complete!');
}

seed();
