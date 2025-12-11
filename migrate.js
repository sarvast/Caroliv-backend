const { MongoClient } = require('mongodb');

const MONGO_URL = 'mongodb://localhost:27017';
const DB_NAME = 'caroliv';

const exercises = [
    { id: '1', name: 'Push-Ups', category: 'chest', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Chest', 'Triceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/47.gif', defaultSets: '4 sets', isActive: true },
    { id: '2', name: 'Dumbbell Chest Press', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif', defaultSets: '4 × 15', isActive: true },
    { id: '3', name: 'Dumbbell Fly', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif', defaultSets: '3 × 15', isActive: true },
    { id: '4', name: 'Shoulder Press', category: 'shoulders', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://barbend.com/wp-content/uploads/2023/10/seated-dumbbell-shoulder-press-barbend-movement-gif-masters-2.gif', defaultSets: '3 × 15', isActive: true },
    { id: '5', name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/32.gif', defaultSets: '3 × 20', isActive: true },
    { id: '6', name: 'Rear Delt Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Rear Delts'], gifUrl: 'https://cdn.prod.website-files.com/66c501d753ae2a8c705375b6/67f015ffa54a8deb0995e0f0_67eff133ef062af3c638116a_250204_ANYTIME_FITNESS_Seated-Reverse-Lateral-Raise.gif', defaultSets: '3 × 20', isActive: true },
    { id: '7', name: 'Bent-Over Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif', defaultSets: '4 × 15', isActive: true },
    { id: '8', name: 'One-Arm Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://i.pinimg.com/originals/1c/7e/29/1c7e293b84e72ee9f7dc68c0e6ce071a.gif', defaultSets: '3 × 15', isActive: true },
    { id: '9', name: 'Barbell Rows', category: 'back', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Back'], gifUrl: 'https://hips.hearstapps.com/menshealth-uk/main/assets/row-under.gif', defaultSets: '4 × 15', isActive: true },
    { id: '10', name: 'Bicep Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '4 × 15', isActive: true },
    { id: '11', name: 'Barbell Curls', category: 'arms', difficulty: 'intermediate', equipment: 'barbell', targetMuscles: ['Biceps'], gifUrl: 'https://artimg.gympik.com/articles/wp-content/uploads/2018/08/Final-Gift.gif', defaultSets: '4 × 12', isActive: true },
    { id: '12', name: 'Hammer Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://barbend.com/wp-content/uploads/2021/08/hammer-curl-barbend-movement-gif-masters.gif', defaultSets: '3 × 12', isActive: true },
    { id: '13', name: 'Wrist Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Forearms'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/1093.gif', defaultSets: '3 × 20', isActive: true },
    { id: '14', name: 'Plank', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Core'], gifUrl: 'https://i.pinimg.com/originals/71/39/d1/7139d152892319a5f61b64bab693c685.gif', defaultSets: '3 × 1 min', isActive: true },
    { id: '15', name: 'Leg Raises', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Lower Abs'], gifUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/eUKRNPj04Tg9Lw5uF8OgF/72414354eb43c1a2b1e06f07386cc0b7/Leg_Lifts_GIF.gif', defaultSets: '4 × 15', isActive: true },
    { id: '16', name: 'Russian Twists', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://i.pinimg.com/originals/a1/74/53/a17453017da9630b48304348c62bee3c.gif', defaultSets: '3 × 30', isActive: true },
    { id: '17', name: 'Crunches', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://i.pinimg.com/originals/af/8f/3c/af8f3c6315440188dfe84b5f27646365.gif', defaultSets: '3 × 15', isActive: true },
    { id: '18', name: 'V-Ups', category: 'core', difficulty: 'advanced', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://d24bnpykhxwj9p.cloudfront.net/s3file/s3fs-public/users1/2017-03/Wed/v%20up.gif', defaultSets: '3 × failure', isActive: true },
    { id: '19', name: 'Squats', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads', 'Glutes'], gifUrl: 'https://barbend.com/wp-content/uploads/2022/06/goblet-squat-barbend-movement-gif-masters.gif', defaultSets: '4 × 15', isActive: true },
    { id: '20', name: 'Lunges', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads'], gifUrl: 'https://www.verywellfit.com/thmb/OxaUMT6kHg2Lfvi-i-Oiq0lwOwA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/70-4588048-LungeGIF-36593998192c4036a37cac3903b4f6bd.gif', defaultSets: '3 × 12', isActive: true },
    { id: '21', name: 'Romanian Deadlifts', category: 'legs', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Hamstrings'], gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif', defaultSets: '4 × 12', isActive: true },
    { id: '22', name: 'Calf Raises', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Calves'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif', defaultSets: '4 × 25', isActive: true },
    { id: '23', name: 'Hip Thrusts', category: 'legs', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Glutes'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlbIs9A4kE4O98mBn15zAA0zElnxHmhQXQww&s', defaultSets: '3 × 15', isActive: true },
    { id: '24', name: 'Overhead Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Shoulders'], gifUrl: 'https://assets.vogue.com/photos/5891df4b12a7b1df212c840d/master/pass/karlie-stretch-5.gif', defaultSets: '1 min', isActive: true },
    { id: '25', name: 'Side Bend', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://assets.vogue.com/photos/5891df4612a7b1df212c8409/master/w_1600%2Cc_limit/karlie-stretch-2.gif', defaultSets: '1 min', isActive: true },
    { id: '26', name: 'Cat Cow', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Back'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrBXePns59QORJUtzHPa2fGYThEEZ90nmdsQ&s', defaultSets: '2 × 10', isActive: true },
    { id: '27', name: 'Hamstring Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/09/400x400-Seated_Hamstring_Stretch.gif', defaultSets: '1 min', isActive: true },
    { id: '28', name: 'Pyramid Pose', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/pyramid-pose.gif', defaultSets: '1 min', isActive: true },
];

const foods = [
    { id: '1', name: 'Chicken Breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, isActive: true },
    { id: '2', name: 'Brown Rice', category: 'carbs', calories: 216, protein: 5, carbs: 45, fat: 1.8, isActive: true },
    { id: '3', name: 'Banana', category: 'fruits', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, isActive: true },
];

async function migrate() {
    const client = await MongoClient.connect(MONGO_URL);
    const db = client.db(DB_NAME);

    console.log('🔄 Starting migration...');

    // Clear existing data
    await db.collection('exercises').deleteMany({});
    await db.collection('foods').deleteMany({});

    // Insert exercises
    const exerciseResult = await db.collection('exercises').insertMany(exercises);
    console.log(`✅ Inserted ${exerciseResult.insertedCount} exercises`);

    // Insert foods
    const foodResult = await db.collection('foods').insertMany(foods);
    console.log(`✅ Inserted ${foodResult.insertedCount} foods`);

    console.log('🎉 Migration complete!');

    await client.close();
}

migrate().catch(console.error);
