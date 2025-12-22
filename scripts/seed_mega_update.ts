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
    { name: 'Samosa', calories: 250, protein: 3, carbs: 24, fat: 17, emoji: '🥟', pairingTags: 'Green Chutney,Sweet Chutney,Masala Chai' },
    { name: 'Kachori', calories: 280, protein: 5, carbs: 28, fat: 18, emoji: '🥟', pairingTags: 'Potato Curry,Green Chutney' },
    { name: 'Vada Pav', calories: 290, protein: 5, carbs: 40, fat: 12, emoji: '🥯', pairingTags: 'Green Chutney,Garlic Chutney' },
    { name: 'Pani Puri', calories: 330, protein: 4, carbs: 42, fat: 12, emoji: '🥣', pairingTags: 'Tamarind Water,Sweet Chutney' },
    { name: 'Pav Bhaji', calories: 400, protein: 10, carbs: 55, fat: 14, emoji: '🍛', pairingTags: 'Butter,Onion Salad' },
    { name: 'Aloo Paratha', calories: 230, protein: 5, carbs: 35, fat: 8, emoji: '🫓', pairingTags: 'Curd,Pickle,Butter' },
    { name: 'Masala Dosa', calories: 350, protein: 6, carbs: 50, fat: 10, emoji: '🥞', pairingTags: 'Sambar,Coconut Chutney' },
    { name: 'Idli', calories: 120, protein: 5, carbs: 25, fat: 1, emoji: '⚪', pairingTags: 'Sambar,Coconut Chutney' },
    { name: 'Masala Chai', calories: 120, protein: 4, carbs: 15, fat: 5, emoji: '☕', pairingTags: 'Sugar,Biscuit,Rusk,Samosa' },
    { name: 'Filter Coffee', calories: 100, protein: 3, carbs: 12, fat: 4, emoji: '☕', pairingTags: 'Sugar,Cookies' },
    { name: 'Roti/Chapati', calories: 70, protein: 3, carbs: 15, fat: 1, emoji: '🫓', pairingTags: 'Dal Tadka,Aloo Matar,Curd,Pickle' },
    { name: 'Plain Rice', calories: 130, protein: 3, carbs: 28, fat: 0.5, emoji: '🍚', pairingTags: 'Dal Tadka,Rajma Masala,Kadhi' },
    { name: 'Dal Tadka', calories: 150, protein: 8, carbs: 20, fat: 6, emoji: '🍲', pairingTags: 'Rice,Roti/Chapati' },
    { name: 'Aloo Matar', calories: 160, protein: 4, carbs: 22, fat: 8, emoji: '🥔', pairingTags: 'Roti/Chapati,Rice' },
    { name: 'Rajma Masala', calories: 200, protein: 12, carbs: 35, fat: 5, emoji: '🥣', pairingTags: 'Rice' },
    { name: 'Green Chutney', calories: 15, protein: 1, carbs: 2, fat: 0.5, emoji: '🥣', pairingTags: '' },
    { name: 'Sugar (1 tsp)', calories: 20, protein: 0, carbs: 5, fat: 0, emoji: '🧂', pairingTags: '' },
    { name: 'Butter', calories: 70, protein: 0, carbs: 0, fat: 8, emoji: '🧈', pairingTags: '' },
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
