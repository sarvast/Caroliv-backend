/**
 * Migration Script: Add All Existing Exercises to Cosmos DB
 * 
 * This script adds all exercises from the mobile app's workout data
 * to the Cosmos DB exercises container so they appear in the Exercise Vault.
 * 
 * Run this once to populate the database with initial exercises.
 */

import { CosmosClient } from '@azure/cosmos';
import * as fs from 'fs';
import * as path from 'path';

// Load connection string from local.settings.json
const settingsPath = path.join(__dirname, '../local.settings.json');
const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));

const connectionString = settings.Values.COSMOS_CONNECTION_STRING;
const databaseName = settings.Values.COSMOS_DATABASE_NAME || 'caroliv-db';

if (!connectionString) {
    console.error('❌ COSMOS_CONNECTION_STRING not found in local.settings.json');
    process.exit(1);
}

const client = new CosmosClient(connectionString);
const database = client.database(databaseName);
const container = database.container('exercises');

// Map exercise names to categories and difficulty
const exerciseData = [
    // CHEST & SHOULDERS
    { name: 'Push-Ups', category: 'chest', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Chest', 'Triceps', 'Shoulders'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/47.gif', defaultSets: '4 sets to failure' },
    { name: 'Dumbbell Chest Press (Floor)', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest', 'Triceps'], gifUrl: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif?fit=600%2C600&ssl=1', defaultSets: '4 × 15' },
    { name: 'Dumbbell Fly (Floor)', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif', defaultSets: '3 × 15' },
    { name: 'Dumbbell Shoulder Press', category: 'shoulders', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Shoulders', 'Triceps'], gifUrl: 'https://barbend.com/wp-content/uploads/2023/10/seated-dumbbell-shoulder-press-barbend-movement-gif-masters-2.gif', defaultSets: '3 × 15' },
    { name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/32.gif', defaultSets: '3 × 20' },

    // CARDIO & HIIT
    { name: 'Jumping Jacks', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Full Body', 'Cardio'], gifUrl: 'https://media.tenor.com/lUlZ4v98QSAAAAAC/jumping-jacks.gif', defaultSets: '3 × 45 sec' },
    { name: 'Burpees', category: 'cardio', difficulty: 'advanced', equipment: 'bodyweight', targetMuscles: ['Full Body', 'Cardio'], gifUrl: 'https://media.tenor.com/d_yJqVz3s0AAAAAC/burpees.gif', defaultSets: '3 × 15' },
    { name: 'Mountain Climbers', category: 'cardio', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Core', 'Cardio'], gifUrl: 'https://post.healthline.com/wp-content/uploads/2020/09/Mountain-Climbers.gif', defaultSets: '3 × 30 sec' },
    { name: 'High Knees', category: 'cardio', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Legs', 'Cardio'], gifUrl: 'https://media.tenor.com/E1w8gO1i0tAAAAAC/high-knees.gif', defaultSets: '3 × 45 sec' },
    { name: 'Bicycle Crunches', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Abs', 'Obliques'], gifUrl: 'https://i.pinimg.com/originals/1d/19/22/1d1922c069b27560d27c08271101859c.gif', defaultSets: '3 × 20' },

    // BACK
    { name: 'Bent-Over Dumbbell Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back', 'Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif', defaultSets: '4 × 15' },
    { name: 'One-Arm Dumbbell Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back', 'Biceps'], gifUrl: 'https://i.pinimg.com/originals/1c/7e/29/1c7e293b84e72ee9f7dc68c0e6ce071a.gif', defaultSets: '3 × 15' },
    { name: 'Barbell Rows (underhand grip)', category: 'back', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Back', 'Biceps'], gifUrl: 'https://hips.hearstapps.com/menshealth-uk/main/assets/row-under.gif', defaultSets: '4 × 15' },
    { name: 'Rear Delt Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Rear Delts'], gifUrl: 'https://cdn.prod.website-files.com/66c501d753ae2a8c705375b6/67f015ffa54a8deb0995e0f0_67eff133ef062af3c638116a_250204_ANYTIME_FITNESS_Seated-Reverse-Lateral-Raise.gif', defaultSets: '3 × 20' },

    // ARMS
    { name: 'Bicep Curls (Dumbbells)', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '4 × 15' },
    { name: 'Barbell Curls', category: 'arms', difficulty: 'intermediate', equipment: 'barbell', targetMuscles: ['Biceps'], gifUrl: 'https://artimg.gympik.com/articles/wp-content/uploads/2018/08/Final-Gift.gif', defaultSets: '4 × 12' },
    { name: 'Hammer Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps', 'Forearms'], gifUrl: 'https://barbend.com/wp-content/uploads/2021/08/hammer-curl-barbend-movement-gif-masters.gif', defaultSets: '3 × 12' },
    { name: 'Wrist Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Forearms'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/1093.gif', defaultSets: '3 × 20' },

    // CORE
    { name: 'Plank', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Core', 'Abs'], gifUrl: 'https://i.pinimg.com/originals/71/39/d1/7139d152892319a5f61b64bab693c685.gif', defaultSets: '3 × 1 minute' },
    { name: 'Leg Raises', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Lower Abs'], gifUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/eUKRNPj04Tg9Lw5uF8OgF/72414354eb43c1a2b1e06f07386cc0b7/Leg_Lifts_GIF.gif', defaultSets: '4 × 15' },
    { name: 'Russian Twists', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Obliques', 'Core'], gifUrl: 'https://i.pinimg.com/originals/a1/74/53/a17453017da9630b48304348c62bee3c.gif', defaultSets: '3 × 30' },
    { name: 'Abdominal Crunches', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Upper Abs'], gifUrl: 'https://i.pinimg.com/originals/af/8f/3c/af8f3c6315440188dfe84b5f27646365.gif', defaultSets: '3 × 15' },
    { name: 'Toe-up Sit-ups', category: 'core', difficulty: 'advanced', equipment: 'bodyweight', targetMuscles: ['Abs', 'Hip Flexors'], gifUrl: 'https://d24bnpykhxwj9p.cloudfront.net/s3file/s3fs-public/users1/2017-03/Wed/v%20up.gif', defaultSets: '3 × failure' },

    // LEGS
    { name: 'Goblet Squats', category: 'legs', difficulty: 'beginner', equipment: 'dumbbell', targetMuscles: ['Quads', 'Glutes'], gifUrl: 'https://barbend.com/wp-content/uploads/2022/06/goblet-squat-barbend-movement-gif-masters.gif', defaultSets: '4 × 15' },
    { name: 'Lunges', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads', 'Glutes', 'Hamstrings'], gifUrl: 'https://www.verywellfit.com/thmb/OxaUMT6kHg2Lfvi-i-Oiq0lwOwA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/70-4588048-LungeGIF-36593998192c4036a37cac3903b4f6bd.gif', defaultSets: '3 × 12' },
    { name: 'Romanian Deadlifts', category: 'legs', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Hamstrings', 'Glutes', 'Lower Back'], gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif', defaultSets: '4 × 12' },
    { name: 'Calf Raises', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Calves'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif', defaultSets: '4 × 25' },
    { name: 'Hip Thrusts', category: 'legs', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Glutes', 'Hamstrings'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlbIs9A4kE4O98mBn15zAA0zElnxHmhQXQww&s', defaultSets: '3 × 15' },

    // FLEXIBILITY
    { name: 'Overhead Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Shoulders', 'Back'], gifUrl: 'https://assets.vogue.com/photos/5891df4b12a7b1df212c840d/master/pass/karlie-stretch-5.gif', defaultSets: '1 min' },
    { name: 'Side Bend Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Obliques', 'Core'], gifUrl: 'https://assets.vogue.com/photos/5891df4612a7b1df212c8409/master/w_1600%2Cc_limit/karlie-stretch-2.gif', defaultSets: '1 min' },
    { name: 'Plank Walk Out Low Lunge', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Hip Flexors', 'Hamstrings'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/plank-walk-out-low-lunge.gif', defaultSets: '2 × 10' },
    { name: 'Cat Cow Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Back', 'Core'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrBXePns59QORJUtzHPa2fGYThEEZ90nmdsQ&s', defaultSets: '2 × 10' },
    { name: 'Seated Hamstring Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/09/400x400-Seated_Hamstring_Stretch.gif?w=1155&h=840', defaultSets: '1 min' },
    { name: 'Pyramid Pose', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Hamstrings', 'Calves'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/pyramid-pose.gif', defaultSets: '1 min' },
];

async function migrateExercises() {
    console.log('🚀 Starting exercise migration...\n');

    let successCount = 0;
    let errorCount = 0;

    for (const exercise of exerciseData) {
        try {
            const item = {
                id: exercise.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
                name: exercise.name,
                category: exercise.category,
                difficulty: exercise.difficulty,
                equipment: exercise.equipment,
                targetMuscles: exercise.targetMuscles,
                gifUrl: exercise.gifUrl,
                defaultSets: exercise.defaultSets,
                isActive: true,
                createdAt: new Date().toISOString(),
            };

            await container.items.create(item);
            console.log(`✅ Added: ${exercise.name} (${exercise.category})`);
            successCount++;
        } catch (error: any) {
            if (error.code === 409) {
                console.log(`⚠️  Already exists: ${exercise.name}`);
            } else {
                console.error(`❌ Error adding ${exercise.name}:`, error.message);
                errorCount++;
            }
        }
    }

    console.log(`\n📊 Migration Complete!`);
    console.log(`✅ Successfully added: ${successCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📝 Total exercises: ${exerciseData.length}`);
}

// Run migration
migrateExercises()
    .then(() => {
        console.log('\n✨ All done!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Migration failed:', error);
        process.exit(1);
    });
