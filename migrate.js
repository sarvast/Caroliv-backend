// SQLite Migration Script
// Populates database with exercises and comprehensive Indian food list with Macros

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'caroliv.db');

// 60 Exercises (Updated Master List)
const exercises = [
    { id: '1', name: 'Push-Ups', category: 'chest', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Chest', 'Triceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/47.gif', defaultSets: '4 sets' },
    { id: '2', name: 'Dumbbell Chest Press (Floor)', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif', defaultSets: '4 × 15' },
    { id: '3', name: 'Dumbbell Fly (Floor)', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif', defaultSets: '3 × 15' },
    { id: '4', name: 'Dumbbell Shoulder Press', category: 'shoulders', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://barbend.com/wp-content/uploads/2023/10/seated-dumbbell-shoulder-press-barbend-movement-gif-masters-2.gif', defaultSets: '3 × 15' },
    { id: '5', name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/32.gif', defaultSets: '3 × 20' },
    { id: '6', name: 'Rear Delt Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Rear Delts'], gifUrl: 'https://cdn.prod.website-files.com/66c501d753ae2a8c705375b6/67f015ffa54a8deb0995e0f0_67eff133ef062af3c638116a_250204_ANYTIME_FITNESS_Seated-Reverse-Lateral-Raise.gif', defaultSets: '3 × 20' },
    { id: '7', name: 'Dumbbell Bent-over Row', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif', defaultSets: '4 × 15' },
    { id: '8', name: 'One-Arm Dumbbell Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://i.pinimg.com/originals/1c/7e/29/1c7e293b84e72ee9f7dc68c0e6ce071a.gif', defaultSets: '3 × 15' },
    { id: '9', name: 'Barbell Rows (underhand grip)', category: 'back', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Back'], gifUrl: 'https://hips.hearstapps.com/menshealth-uk/main/assets/row-under.gif', defaultSets: '4 × 15' },
    { id: '10', name: 'Bicep Curls (Dumbbells)', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '4 × 15' },
    { id: '11', name: 'Barbell Curls', category: 'arms', difficulty: 'intermediate', equipment: 'barbell', targetMuscles: ['Biceps'], gifUrl: 'https://artimg.gympik.com/articles/wp-content/uploads/2018/08/Final-Gift.gif', defaultSets: '4 × 12' },
    { id: '12', name: 'Hammer Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://barbend.com/wp-content/uploads/2021/08/hammer-curl-barbend-movement-gif-masters.gif', defaultSets: '3 × 12' },
    { id: '13', name: 'Wrist Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Forearms'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/1093.gif', defaultSets: '3 × 20' },
    { id: '14', name: 'Plank', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Core'], gifUrl: 'https://i.pinimg.com/originals/71/39/d1/7139d152892319a5f61b64bab693c685.gif', defaultSets: '3 × 1 min' },
    { id: '15', name: 'Leg Raises', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Lower Abs'], gifUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/eUKRNPj04Tg9Lw5uF8OgF/72414354eb43c1a2b1e06f07386cc0b7/Leg_Lifts_GIF.gif', defaultSets: '4 × 15' },
    { id: '16', name: 'Russian Twists', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://i.pinimg.com/originals/a1/74/53/a17453017da9630b48304348c62bee3c.gif', defaultSets: '3 × 30' },
    { id: '17', name: 'Abdominal Crunches', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://i.pinimg.com/originals/af/8f/3c/af8f3c6315440188dfe84b5f27646365.gif', defaultSets: '3 × 15' },
    { id: '18', name: 'Toe-up Sit-ups', category: 'core', difficulty: 'advanced', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://d24bnpykhxwj9p.cloudfront.net/s3file/s3fs-public/users1/2017-03/Wed/v%20up.gif', defaultSets: '3 × failure' },
    { id: '19', name: 'Goblet Squats', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads', 'Glutes'], gifUrl: 'https://barbend.com/wp-content/uploads/2022/06/goblet-squat-barbend-movement-gif-masters.gif', defaultSets: '4 × 15' },
    { id: '20', name: 'Lunges', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads'], gifUrl: 'https://www.verywellfit.com/thmb/OxaUMT6kHg2Lfvi-i-Oiq0lwOwA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/70-4588048-LungeGIF-36593998192c4036a37cac3903b4f6bd.gif', defaultSets: '3 × 12' },
    { id: '21', name: 'Romanian Deadlifts', category: 'legs', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Hamstrings'], gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif', defaultSets: '4 × 12' },
    { id: '22', name: 'Calf Raises', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Calves'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif', defaultSets: '4 × 25' },
    { id: '23', name: 'Hip Thrusts', category: 'legs', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Glutes'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlbIs9A4kE4O98mBn15zAA0zElnxHmhQXQww&s', defaultSets: '3 × 15' },
    { id: '24', name: 'Overhead Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Shoulders'], gifUrl: 'https://assets.vogue.com/photos/5891df4b12a7b1df212c840d/master/pass/karlie-stretch-5.gif', defaultSets: '1 min' },
    { id: '25', name: 'Side Bend Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://assets.vogue.com/photos/5891df4612a7b1df212c8409/master/w_1600%2Cc_limit/karlie-stretch-2.gif', defaultSets: '1 min' },
    { id: '26', name: 'Cat Cow Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Back'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrBXePns59QORJUtzHPa2fGYThEEZ90nmdsQ&s', defaultSets: '2 × 10' },
    { id: '27', name: 'Seated Hamstring Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/09/400x400-Seated_Hamstring_Stretch.gif', defaultSets: '1 min' },
    { id: '28', name: 'Pyramid Pose', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/pyramid-pose.gif', defaultSets: '1 min' },
    // New Exercises
    { id: '29', name: 'Dumbbell Overhead Extension', category: 'triceps', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Triceps'], gifUrl: 'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/dumbbelloverheadtricepsextension-1456956005.gif?resize=640:*', defaultSets: '3 × 12' },
    { id: '30', name: 'Close-grip Push-ups', category: 'triceps', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Triceps', 'Chest'], gifUrl: 'https://fitliferegime.com/wp-content/uploads/2022/10/Close-Grip-Push-Up.gif', defaultSets: '3 × 8–12' },
    { id: '31', name: 'Dumbbell Pullover (Floor)', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back', 'Chest'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/375.gif', defaultSets: '3 × 12' },
    { id: '32', name: 'Dumbbell Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '3 × 10–12' },
    { id: '33', name: 'Reverse Lunges', category: 'legs', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Quads', 'Glutes'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/473.gif', defaultSets: '3 × 10/leg' },
    { id: '34', name: 'Incline Push-ups', category: 'chest', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Chest'], gifUrl: 'https://www.verywellfit.com/thmb/GG7EXAUxQvwxiu4QAzDBPu6yy44=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/90-3120038--Incline-PushupsGIF-d321334ec54849539010832028d5635a.gif', defaultSets: '3 × 12–15' },
    { id: '35', name: 'Dumbbell Squeeze Press', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://cdn.shopify.com/s/files/1/0250/0362/2496/files/110.gif?v=1644641092', defaultSets: '3 × 12' },
    { id: '36', name: 'Dumbbell Kickbacks', category: 'triceps', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Triceps'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXIkMu91XEZRuKCbT-z0iMr-G7QjubvA0yxA&s', defaultSets: '3 × 15' },
    { id: '37', name: 'Bench Dips (Chair)', category: 'triceps', difficulty: 'beginner', equipment: 'chair', targetMuscles: ['Triceps'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZYcnUH4WbWnbLKtiMW-TKS_ae8LHIY6b9sg&s', defaultSets: '2 × 12–15' },
    { id: '38', name: 'Dumbbell Deadlift', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back', 'Hamstrings'], gifUrl: 'https://gymvisual.com/img/p/1/9/8/2/5/19825.gif', defaultSets: '3 × 12' },
    { id: '39', name: 'Reverse Snow Angels (Bodyweight)', category: 'back', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Back'], gifUrl: 'https://www.thisiswhyimfit.com/wp-content/uploads/2019/02/reverseSnowAngel.gif', defaultSets: '3 × 15' },
    { id: '40', name: 'Alternating DB Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '3 × 12' },
    { id: '41', name: 'Isometric Curl Hold', category: 'arms', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://static.wixstatic.com/media/11c3fa_7593d6db84c54081b3ead27b582a75ac~mv2.gif', defaultSets: '2 × 30 sec' },
    { id: '42', name: 'Zottman Curls', category: 'arms', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Biceps', 'Forearms'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/276.gif', defaultSets: '3 × 12' },
    { id: '43', name: 'Overhead Tricep Extensions', category: 'triceps', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Triceps'], gifUrl: 'https://hips.hearstapps.com/hmg-prod/images/workouts/2016/03/dumbbelloverheadtricepsextension-1456956005.gif?crop=1xw:0.5xh;center,top&resize=640:*', defaultSets: '3 × 12' },
    { id: '44', name: 'Plank Walk Out Low Lunge', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Full Body'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/plank-walk-out-low-lunge.gif', defaultSets: '2 × 10' },
    { id: '45', name: 'Romanian Deadlift (DB)', category: 'legs', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Hamstrings'], gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif', defaultSets: '4 × 12' },
    { id: '46', name: 'Standing Calf Raises', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Calves'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif', defaultSets: '4 × 25' },
    { id: '47', name: 'Dumbbell Fly', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif', defaultSets: '2 × 15' },
    { id: '48', name: 'Dumbbell Rows (neutral grip)', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif', defaultSets: '3 × 15' }
];

// 120+ Indian Foods with Macros & Search Terms
const foods = [
    { id: '1', name: '1 Roti/Chapati', nameHindi: '1 रोटी/चपाती', calories: 70, protein: 3, carbs: 15, fat: 0.5, emoji: '🫓', category: 'lunch', searchTerms: 'roti chapati fulka phulka wheat bread gehu atta indian flatbread' },
    { id: '2', name: '1 Bowl Rice', nameHindi: '1 कटोरी चावल', calories: 130, protein: 2.5, carbs: 28, fat: 0.2, emoji: '🍚', category: 'lunch', searchTerms: 'rice chawal bhaat plain steam cooked white basmati' },
    { id: '3', name: '1 Boiled Egg', nameHindi: '1 उबला अंडा', calories: 70, protein: 6, carbs: 0.6, fat: 5, emoji: '🥚', category: 'breakfast', searchTerms: 'egg anda boiled ubla protein healthy breakfast' },
    { id: '4', name: '1 Omelette', nameHindi: '1 ऑमलेट', calories: 100, protein: 7, carbs: 1, fat: 7, emoji: '🍳', category: 'breakfast', searchTerms: 'omelette omelet anda fry egg fry masala spanish' },
    { id: '5', name: '1 Slice White Bread', nameHindi: '1 स्लाइस सफेद ब्रेड', calories: 60, protein: 2, carbs: 12, fat: 1, emoji: '🍞', category: 'breakfast', searchTerms: 'bread white toast maida sandwich slice' },
    { id: '6', name: '1 Slice Brown Bread', nameHindi: '1 स्लाइस ब्राउन ब्रेड', calories: 45, protein: 3, carbs: 10, fat: 0.5, emoji: '🍞', category: 'breakfast', searchTerms: 'bread brown whole wheat atta toast healthy slice' },
    { id: '7', name: '1 Potato Paratha', nameHindi: '1 आलू पराठा', calories: 230, protein: 5, carbs: 35, fat: 8, emoji: '🥔', category: 'breakfast', searchTerms: 'paratha aloo stuffed flatbread punjabi breakfast potato' },
    { id: '8', name: '1 Plain Paratha', nameHindi: '1 प्लेन पराठा', calories: 190, protein: 4, carbs: 28, fat: 6, emoji: '🫓', category: 'breakfast', searchTerms: 'paratha plain tawa sada flatbread indian bread' },
    { id: '9', name: '1 Paneer Paratha', nameHindi: '1 पनीर पराठा', calories: 260, protein: 9, carbs: 32, fat: 12, emoji: '🧀', category: 'breakfast', searchTerms: 'paratha paneer cottage cheese stuffed healthy protein breakfast' },
    { id: '10', name: '2 Idli with Sambar', nameHindi: '2 इडली सांबर के साथ', calories: 120, protein: 4, carbs: 24, fat: 1, emoji: '🥘', category: 'breakfast', searchTerms: 'idli sambar breakfast south indian steamed rice cake healthy' },
    { id: '11', name: '1 Plain Dosa', nameHindi: '1 प्लेन डोसा', calories: 110, protein: 3, carbs: 22, fat: 2, emoji: '🥞', category: 'breakfast', searchTerms: 'dosa plain sada South indian crepe rice batter' },
    { id: '12', name: '1 Masala Dosa', nameHindi: '1 मसाला डोसा', calories: 200, protein: 4, carbs: 30, fat: 7, emoji: '🥞', category: 'breakfast', searchTerms: 'dosa masala potato South indian stuffed spicy mysore' },
    { id: '13', name: '1 Bowl Poha', nameHindi: '1 कटोरी पोहा', calories: 180, protein: 3, carbs: 30, fat: 5, emoji: '🍚', category: 'breakfast', searchTerms: 'poha flattened rice chivda breakfast kanda batata indori' },
    { id: '14', name: '1 Bowl Upma', nameHindi: '1 कटोरी उपमा', calories: 200, protein: 4, carbs: 35, fat: 5, emoji: '🥣', category: 'breakfast', searchTerms: 'upma rava suji breakfast semolina south indian' },
    { id: '15', name: '1 Bowl Lentils (Dal)', nameHindi: '1 कटोरी दाल', calories: 130, protein: 7, carbs: 18, fat: 4, emoji: '🍲', category: 'lunch', searchTerms: 'dal tadka fry arhar moong masoor yellow lentil protein soup' },
    { id: '16', name: '1 Bowl Potato Curry', nameHindi: '1 कटोरी आलू सब्जी', calories: 150, protein: 2, carbs: 22, fat: 6, emoji: '🥔', category: 'lunch', searchTerms: 'aloo sabji curry potato veg rasedar dry' },
    { id: '17', name: '1 Bowl Chickpeas (Chole)', nameHindi: '1 कटोरी छोले', calories: 180, protein: 8, carbs: 28, fat: 5, emoji: '🧆', category: 'lunch', searchTerms: 'chole chana chickpea curry kabuli punjabi spicy gravy' },
    { id: '18', name: '1 Bowl Kidney Beans (Rajma)', nameHindi: '1 कटोरी राजमा', calories: 200, protein: 9, carbs: 30, fat: 5, emoji: '🫘', category: 'lunch', searchTerms: 'rajma kidney bean curry punjabi rice gravy' },
    { id: '19', name: '100g Chicken Curry', nameHindi: '100g चिकन करी', calories: 170, protein: 20, carbs: 5, fat: 8, emoji: '🍗', category: 'dinner', searchTerms: 'chicken curry nonveg gravy murgh masala protein' },
    { id: '20', name: '1 Bowl Paneer Curry', nameHindi: '1 कटोरी पनीर सब्जी', calories: 220, protein: 10, carbs: 8, fat: 15, emoji: '🧀', category: 'dinner', searchTerms: 'paneer curry butter masala shahi matar cottage cheese veg gravy' },
    { id: '21', name: '1 Bowl Kadhi', nameHindi: '1 कटोरी कढ़ी', calories: 140, protein: 4, carbs: 12, fat: 8, emoji: '🥣', category: 'lunch', searchTerms: 'kadhi yogurt curry dahi pakoda punjabi rajasthani sour' },
    { id: '22', name: '1 Bowl Mixed Veg', nameHindi: '1 कटोरी मिक्स सब्जी', calories: 120, protein: 3, carbs: 15, fat: 5, emoji: '🥗', category: 'dinner', searchTerms: 'mix veg sabji seasonal vegetable healthy dry fry' },
    { id: '23', name: '100g Fish Curry', nameHindi: '100g मछली करी', calories: 150, protein: 18, carbs: 4, fat: 7, emoji: '🐟', category: 'dinner', searchTerms: 'fish curry machli seafood bengal goan protein' },
    { id: '24', name: '1 Bowl Palak Paneer', nameHindi: '1 कटोरी पालक पनीर', calories: 240, protein: 12, carbs: 10, fat: 16, emoji: '🥬', category: 'dinner', searchTerms: 'palak paneer spinach cottage cheese green healthy iron' },
    { id: '25', name: '1 Plate Veg Biryani', nameHindi: '1 प्लेट वेज बिरयानी', calories: 350, protein: 8, carbs: 55, fat: 10, emoji: '🍛', category: 'lunch', searchTerms: 'biryani veg pulao rice hyderabadi spicy vegetable' },
    { id: '26', name: '1 Plate Chicken Biryani', nameHindi: '1 प्लेट चिकन बिरयानी', calories: 450, protein: 25, carbs: 50, fat: 15, emoji: '🍛', category: 'lunch', searchTerms: 'biryani chicken rice nonveg hyderabadi dum' },
    { id: '27', name: '1 Bowl Jeera Rice', nameHindi: '1 कटोरी जीरा राइस', calories: 180, protein: 3, carbs: 35, fat: 3, emoji: '🍚', category: 'lunch', searchTerms: 'jeera rice cumin fried tadka' },
    { id: '28', name: '1 Bowl Curd Rice', nameHindi: '1 कटोरी दही चावल', calories: 200, protein: 5, carbs: 32, fat: 6, emoji: '🍚', category: 'lunch', searchTerms: 'curd rice dahi chawal yogurt south indian thayir sadam' },
    { id: '29', name: '1 Samosa', nameHindi: '1 समोसा', calories: 150, protein: 3, carbs: 18, fat: 8, emoji: '🥟', category: 'snacks', searchTerms: 'samosa snack fried potato stuffed tea time' },
    { id: '30', name: '1 Kachori', nameHindi: '1 कचौरी', calories: 180, protein: 4, carbs: 22, fat: 10, emoji: '🥟', category: 'snacks', searchTerms: 'kachori snack fried moong dal pyaz khasta' },
    { id: '31', name: '1 Vada Pav', nameHindi: '1 वड़ा पाव', calories: 250, protein: 6, carbs: 40, fat: 10, emoji: '🍔', category: 'snacks', searchTerms: 'vada pav burger mumbai street food spicy potato' },
    { id: '32', name: '1 Plate Pakora', nameHindi: '1 प्लेट पकोड़े', calories: 200, protein: 4, carbs: 25, fat: 12, emoji: '🍤', category: 'snacks', searchTerms: 'pakora fritters bhajiya onion potato mix veg rain' },
    { id: '33', name: '1 Gulab Jamun', nameHindi: '1 गुलाब जामुन', calories: 150, protein: 2, carbs: 25, fat: 6, emoji: '🧁', category: 'snacks', searchTerms: 'gulab jamun sweet dessert mithai festival syrup' },
    { id: '34', name: '1 Rasgulla', nameHindi: '1 रसगुल्ला', calories: 120, protein: 3, carbs: 25, fat: 1, emoji: '⚪', category: 'snacks', searchTerms: 'rasgulla sweet bengali roshogulla sponge white' },
    { id: '35', name: '1 Jalebi', nameHindi: '1 जलेबी', calories: 140, protein: 1, carbs: 30, fat: 4, emoji: '🟠', category: 'snacks', searchTerms: 'jalebi sweet dessert crispy spiral syrup hot' },
    { id: '36', name: '1 Besan Ladoo', nameHindi: '1 लड्डू', calories: 160, protein: 4, carbs: 20, fat: 9, emoji: '🟡', category: 'snacks', searchTerms: 'ladoo laddu sweet besan gram flour festival ganesh' },
    { id: '37', name: '1 Piece Barfi', nameHindi: '1 पीस बर्फी', calories: 130, protein: 3, carbs: 18, fat: 6, emoji: '🟫', category: 'snacks', searchTerms: 'barfi sweet fudge milk kaju pista almond' },
    { id: '38', name: '1 Banana', nameHindi: '1 केला', calories: 90, protein: 1, carbs: 23, fat: 0, emoji: '🍌', category: 'breakfast', searchTerms: 'banana kela fruit potassium energy snack' },
    { id: '39', name: '1 Apple', nameHindi: '1 सेब', calories: 52, protein: 0, carbs: 14, fat: 0, emoji: '🍎', category: 'snacks', searchTerms: 'apple seb fruit healthy fiber red' },
    { id: '40', name: '1 Orange', nameHindi: '1 संतरा', calories: 47, protein: 1, carbs: 12, fat: 0, emoji: '🍊', category: 'snacks', searchTerms: 'orange santra fruit vitamin c citrus juicy' },
    { id: '41', name: '1 Mango', nameHindi: '1 आम', calories: 135, protein: 1, carbs: 35, fat: 0, emoji: '🥭', category: 'snacks', searchTerms: 'mango aam fruit king summer sweet' },
    { id: '42', name: '1 Cup Papaya', nameHindi: '1 कप पपीता', calories: 55, protein: 1, carbs: 13, fat: 0, emoji: '🍈', category: 'breakfast', searchTerms: 'papaya papita fruit digestion healthy low calorie' },
    { id: '43', name: '200ml Tea (Sweet)', nameHindi: '200ml चाय (मीठी)', calories: 100, protein: 2, carbs: 15, fat: 3, emoji: '☕', category: 'breakfast', searchTerms: 'tea chai morning sweet milk masala ginger' },
    { id: '44', name: '200ml Tea (No Sugar)', nameHindi: '200ml चाय (बिना चीनी)', calories: 60, protein: 2, carbs: 6, fat: 3, emoji: '☕', category: 'breakfast', searchTerms: 'tea chai unsweetened sugarfree healthy milk' },
    { id: '45', name: '100ml Milk Coffee', nameHindi: '100ml मिल्क कॉफी', calories: 80, protein: 3, carbs: 10, fat: 4, emoji: '☕', category: 'breakfast', searchTerms: 'coffee kafi milk nescafe latte cappuccino' },
    { id: '46', name: '200ml Milk', nameHindi: '200ml दूध', calories: 120, protein: 6, carbs: 10, fat: 6, emoji: '🥛', category: 'breakfast', searchTerms: 'milk doodh dairy calcium protein warm cold' },
    { id: '47', name: '1 Glass Lassi', nameHindi: '1 गिलास लस्सी', calories: 180, protein: 6, carbs: 30, fat: 5, emoji: '🥤', category: 'snacks', searchTerms: 'lassi sweet yogurt drink punjabi summer cool' },
    { id: '48', name: '1 Glass Buttermilk', nameHindi: '1 गिलास छाछ', calories: 60, protein: 2, carbs: 5, fat: 2, emoji: '🥛', category: 'lunch', searchTerms: 'buttermilk chaas chhach mattha savory drink digestion' },
    { id: '49', name: '1 Tbsp Ghee', nameHindi: '1 चम्मच घी', calories: 120, protein: 0, carbs: 0, fat: 14, emoji: '🧈', category: 'lunch', searchTerms: 'ghee clarified butter fat cooking indian' },
    { id: '50', name: '1 Tbsp Oil', nameHindi: '1 चम्मच तेल', calories: 120, protein: 0, carbs: 0, fat: 14, emoji: '🫗', category: 'lunch', searchTerms: 'oil tel cooking fat vegetable mustard refined' },
    { id: '51', name: '100g Yogurt (Curd)', nameHindi: '100g दही', calories: 60, protein: 3, carbs: 5, fat: 3, emoji: '🥣', category: 'lunch', searchTerms: 'dahi curd yogurt probiotic side dish' },
    { id: '52', name: '1 Papad', nameHindi: '1 पापड़', calories: 50, protein: 2, carbs: 8, fat: 1, emoji: '🫓', category: 'lunch', searchTerms: 'papad papadum side dish roasted fried crunchy' },
    { id: '53', name: '1 Plate Dahi Puri', nameHindi: '1 प्लेट दही पूरी', calories: 320, protein: 6, carbs: 50, fat: 12, emoji: '🥣', category: 'snacks', searchTerms: 'dahi puri chaat snack spicy tangy yogurt' },
    { id: '54', name: '1 Plate Bhel Puri', nameHindi: '1 प्लेट भेल पूरी', calories: 250, protein: 5, carbs: 40, fat: 8, emoji: '🥡', category: 'snacks', searchTerms: 'bhel puri chaat snack puffed rice mumbai street' },
    { id: '55', name: '1 Plate Sev Puri', nameHindi: '1 प्लेट सेव पूरी', calories: 280, protein: 5, carbs: 38, fat: 12, emoji: '🍘', category: 'snacks', searchTerms: 'sev puri chaat snack papdi spicy mumbai' },
    { id: '56', name: '2 Aloo Tikki', nameHindi: '2 आलू टिक्की', calories: 280, protein: 4, carbs: 35, fat: 14, emoji: '🥔', category: 'snacks', searchTerms: 'aloo tikki cutlet patty potato snack spicy fried chaat' },
    { id: '57', name: '1 Khasta Kachori', nameHindi: '1 खस्ता कचौड़ी', calories: 185, protein: 3, carbs: 20, fat: 10, emoji: '🥟', category: 'snacks', searchTerms: 'khasta kachori snack fried moong dal rajasthani pyaz breakfast' },
    { id: '58', name: '1 Plate Veg Momos (6 pcs)', nameHindi: '1 प्लेट वेज मोमोस', calories: 210, protein: 5, carbs: 35, fat: 4, emoji: '🥟', category: 'snacks', searchTerms: 'momos dimsum dumpling tibetan nepali steam veg fried chutney' },
    { id: '59', name: '1 Dabeli', nameHindi: '1 दाबेली', calories: 300, protein: 6, carbs: 45, fat: 12, emoji: '🥯', category: 'snacks', searchTerms: 'dabeli kutchi burger gujarati snack potato spicy bun' },
    { id: '60', name: '1 Egg Roll', nameHindi: '1 अंडा रोल', calories: 450, protein: 14, carbs: 40, fat: 22, emoji: '🌯', category: 'snacks', searchTerms: 'egg roll wrap frankie kolkata street food nonveg anda' },
    { id: '61', name: '1 Plate Pav Bhaji', nameHindi: '1 प्लेट पाव भाजी', calories: 400, protein: 8, carbs: 60, fat: 15, emoji: '🍛', category: 'dinner', searchTerms: 'pav bhaji mumbai street food dinner lunch spicy buttery bread vegetable' },
    { id: '62', name: '6 Pani Puri', nameHindi: '6 पानी पूरी', calories: 120, protein: 2, carbs: 22, fat: 4, emoji: '🥟', category: 'snacks', searchTerms: 'pani puri golgappa puchka gupchup water balls spicy tangy chaat' },
    { id: '63', name: '1 Plate Dhokla (4 pcs)', nameHindi: '1 प्लेट ढोकला', calories: 160, protein: 6, carbs: 25, fat: 5, emoji: '🟨', category: 'breakfast', searchTerms: 'dhokla khaman gujarati snack steamed besan healthy breakfast lighter' },
    { id: '64', name: '1 Plate Misal Pav', nameHindi: '1 प्लेट मिसल पाव', calories: 480, protein: 15, carbs: 55, fat: 20, emoji: '🍛', category: 'breakfast', searchTerms: 'misal pav spicy maharashtrian sprouts curry bread breakfast fwa' },
    { id: '65', name: '2 Thepla', nameHindi: '2 थेपला', calories: 240, protein: 6, carbs: 35, fat: 10, emoji: '🥞', category: 'breakfast', searchTerms: 'thepla paratha gujarati methi fenugreek travel food healthy roti' },
    { id: '66', name: '1 Plate Chole Bhature', nameHindi: '1 प्लेट छोले भटूरे', calories: 550, protein: 18, carbs: 70, fat: 25, emoji: '🥘', category: 'lunch', searchTerms: 'chole bhature punjabi heavy breakfast lunch chickpea fried bread chana' },
    { id: '67', name: '2 Litti Chokha', nameHindi: '2 लिट्टी चोखा', calories: 350, protein: 12, carbs: 55, fat: 8, emoji: '🧆', category: 'dinner', searchTerms: 'litti chokha bihari roasted sattu eggplant potato healthy baked' },
    { id: '68', name: '1 Plate Dal Baati Churma', nameHindi: '1 प्लेट दाल बाटी चूरमा', calories: 650, protein: 18, carbs: 80, fat: 30, emoji: '🥣', category: 'dinner', searchTerms: 'dal baati churma rajasthani ghee wheat balls lentils sweet thali' },
    { id: '69', name: '1 Medu Vada', nameHindi: '1 मेदु वड़ा', calories: 140, protein: 4, carbs: 15, fat: 8, emoji: '🍩', category: 'breakfast', searchTerms: 'medu vada donut south indian fried urad dal sambar coconut chutney' },
    { id: '70', name: '1 Uttapam', nameHindi: '1 उत्तपम', calories: 200, protein: 5, carbs: 35, fat: 6, emoji: '🥞', category: 'breakfast', searchTerms: 'uttapam pancake south indian veg onion tomato breakfast' },
    { id: '71', name: '2 Kaju Katli', nameHindi: '2 काजू कतली', calories: 120, protein: 3, carbs: 14, fat: 7, emoji: '💠', category: 'snacks', searchTerms: 'kaju katli cashew sweet barfi mithai festival diwali dessert' },
    { id: '72', name: '1 Mysore Pak', nameHindi: '1 मैसूर पाक', calories: 190, protein: 1, carbs: 20, fat: 12, emoji: '🟫', category: 'snacks', searchTerms: 'mysore pak sweet besan ghee south indian dessert rich' },
    { id: '73', name: '1 Bowl Gajar Halwa', nameHindi: '1 कटोरी गाजर का हलवा', calories: 300, protein: 6, carbs: 40, fat: 14, emoji: '🥕', category: 'snacks', searchTerms: 'gajar halwa carrot pudding sweet winter dessert milk khoya' },
    { id: '74', name: '2 Rasmalai', nameHindi: '2 रसमलाई', calories: 320, protein: 8, carbs: 35, fat: 14, emoji: '🍮', category: 'snacks', searchTerms: 'rasmalai sweet milk cheese bengali dessert chenna spongy' },
    { id: '75', name: '1 Bowl Shrikhand', nameHindi: '1 कटोरी श्रीखंड', calories: 280, protein: 8, carbs: 30, fat: 14, emoji: '🥣', category: 'snacks', searchTerms: 'shrikhand sweet yogurt curd saffron elaichi maharashtrian dessert amrakhand' },
    { id: '76', name: '1 Motichoor Ladoo', nameHindi: '1 मोतीचूर लड्डू', calories: 180, protein: 2, carbs: 25, fat: 9, emoji: '🟠', category: 'snacks', searchTerms: 'motichoor ladoo sweet boondi besan festival ganesh dessert orange' },
    { id: '77', name: '1 Bowl Kheer', nameHindi: '1 कटोरी खीर', calories: 240, protein: 6, carbs: 35, fat: 8, emoji: '🍚', category: 'snacks', searchTerms: 'kheer rice pudding sweet milk payasam dessert festival' },
    { id: '78', name: '1 Peda', nameHindi: '1 पेड़ा', calories: 140, protein: 3, carbs: 20, fat: 5, emoji: '⚪', category: 'snacks', searchTerms: 'peda sweet milk mawa mathura khoya dessert prasad' },
    { id: '79', name: '1 Kalakand', nameHindi: '1 कलाकंद', calories: 160, protein: 4, carbs: 18, fat: 8, emoji: '🟫', category: 'snacks', searchTerms: 'kalakand milk cake sweet alwar mawa dessert soft' },
    { id: '80', name: '1 Bowl Phirni', nameHindi: '1 कटोरी फिरनी', calories: 220, protein: 5, carbs: 32, fat: 8, emoji: '🥣', category: 'snacks', searchTerms: 'phirni rice pudding sweet ground rice kashmiri earthen pot' },
    { id: '81', name: '3 Chakli', nameHindi: '3 चकली', calories: 150, protein: 2, carbs: 20, fat: 8, emoji: '🌀', category: 'snacks', searchTerms: 'chakli murukku snack crunchy rice spiral diwali fried' },
    { id: '82', name: '1 Bowl Namkeen', nameHindi: '1 कटोरी नमकीन', calories: 200, protein: 4, carbs: 20, fat: 12, emoji: '🥜', category: 'snacks', searchTerms: 'namkeen mixture snack spicy sev bhujia tea time' },
    { id: '83', name: '4 Mathri', nameHindi: '4 मठरी', calories: 220, protein: 3, carbs: 25, fat: 12, emoji: '🍪', category: 'snacks', searchTerms: 'mathri snack cracker fried flour tea time punjabi' },
    { id: '84', name: '1 Bowl Banana Chips', nameHindi: '1 कटोरी केला चिप्स', calories: 180, protein: 1, carbs: 20, fat: 10, emoji: '🍌', category: 'snacks', searchTerms: 'banana chips wafers kerala coconut oil salty crunchy' },
    { id: '85', name: '1 Plate Fafda', nameHindi: '1 प्लेट फाफड़ा', calories: 200, protein: 6, carbs: 22, fat: 10, emoji: '🥖', category: 'breakfast', searchTerms: 'fafda gujarati snack besan crispy dussehra breakfast' },
    { id: '86', name: '1 Bowl Bhujia Sev', nameHindi: '1 कटोरी भुजिया सेव', calories: 250, protein: 4, carbs: 20, fat: 18, emoji: '🍜', category: 'snacks', searchTerms: 'bhujia sev namkeen bikaneri spicy noodles crunchy' },
    { id: '87', name: '1 Bowl Makhanas', nameHindi: '1 कटोरी मखाना', calories: 100, protein: 3, carbs: 20, fat: 0.5, emoji: '🍿', category: 'snacks', searchTerms: 'makhana fox nut lotus seed healthy roasted light diet snack' },
    { id: '88', name: '1 Peanut Chikki', nameHindi: '1 मूंगफली चिक्की', calories: 120, protein: 4, carbs: 15, fat: 6, emoji: '🍫', category: 'snacks', searchTerms: 'chikki peanut bar sweet jaggery winter snack protein' },
    { id: '89', name: '1 Khakhra', nameHindi: '1 खाखरा', calories: 60, protein: 2, carbs: 10, fat: 1, emoji: '🥖', category: 'snacks', searchTerms: 'khakhra cracker healthy gujarati roasted diet snack light' },
    { id: '90', name: '1 Bowl Chana Jor Garam', nameHindi: '1 कटोरी चना जोर गरम', calories: 150, protein: 8, carbs: 22, fat: 4, emoji: '🥜', category: 'snacks', searchTerms: 'chana jor garam snack chickpea flattened spicy street food' },
    { id: '91', name: '1 Butter Naan', nameHindi: '1 बटर नान', calories: 280, protein: 6, carbs: 45, fat: 8, emoji: '🍞', category: 'dinner', searchTerms: 'naan butter bread tandoori maida punjabi restaurant' },
    { id: '92', name: '1 Tandoori Roti', nameHindi: '1 तंदूरी रोटी', calories: 120, protein: 3, carbs: 25, fat: 1, emoji: '🥯', category: 'dinner', searchTerms: 'tandoori roti bread wheat roasted clay oven healthy' },
    { id: '93', name: '1 Kulcha', nameHindi: '1 कुलचा', calories: 180, protein: 4, carbs: 32, fat: 3, emoji: '🥖', category: 'dinner', searchTerms: 'kulcha bread maida amritsari stuffed dinner lunch' },
    { id: '94', name: '4 Puri', nameHindi: '4 पूरी', calories: 320, protein: 4, carbs: 35, fat: 18, emoji: '🥟', category: 'lunch', searchTerms: 'puri fried bread poori wheat festive breakfast lunch' },
    { id: '95', name: '1 Bhakri', nameHindi: '1 भाकरी', calories: 160, protein: 3, carbs: 30, fat: 2, emoji: '🍞', category: 'lunch', searchTerms: 'bhakri hard bread maharashtrian jowar bajra multigrain healthy' },
    { id: '96', name: '1 Garlic Naan', nameHindi: '1 गार्लिक नान', calories: 300, protein: 6, carbs: 45, fat: 10, emoji: '🍞', category: 'dinner', searchTerms: 'garlic naan bread tandoori butter flavor restaurant' },
    { id: '97', name: '1 Missi Roti', nameHindi: '1 मिस्सी रोटी', calories: 140, protein: 5, carbs: 25, fat: 2, emoji: '🥯', category: 'lunch', searchTerms: 'missi roti besan bread rajasthani punjabi protein healthy' },
    { id: '98', name: '1 Cup Masala Chai', nameHindi: '1 कप मसाला चाय', calories: 105, protein: 2, carbs: 12, fat: 3, emoji: '☕', category: 'breakfast', searchTerms: 'masala chai tea spice ginger cardamom morning drink' },
    { id: '99', name: '1 Cup Filter Coffee', nameHindi: '1 कप फिल्टर कॉफी', calories: 80, protein: 2, carbs: 10, fat: 3, emoji: '☕', category: 'breakfast', searchTerms: 'filter coffee south indian kaapi strong morning drink energy' },
    { id: '100', name: '1 Glass Thandai', nameHindi: '1 गिलास ठंडाई', calories: 220, protein: 6, carbs: 30, fat: 10, emoji: '🥛', category: 'snacks', searchTerms: 'thandai milk drink festival holi almonds saffron cool' },
    { id: '101', name: '1 Glass Aam Panna', nameHindi: '1 गिलास आम पन्ना', calories: 160, protein: 0.5, carbs: 40, fat: 0, emoji: '🥭', category: 'snacks', searchTerms: 'aam panna mango drink summer raw kairi cool' },
    { id: '102', name: '1 Glass Jaljeera', nameHindi: '1 गिलास जलजीरा', calories: 40, protein: 0, carbs: 10, fat: 0, emoji: '🥤', category: 'snacks', searchTerms: 'jaljeera cumin drink spice digestive summer cool' },
    { id: '103', name: '1 Bowl Soya Chunks Curry', nameHindi: '1 कटोरी सोया चंक्स करी', calories: 180, protein: 25, carbs: 10, fat: 5, emoji: '🥩', category: 'dinner', searchTerms: 'soya chunks nutrella protein veg curry meal maker vegetarian meat' },
    { id: '104', name: '1 Bowl Sprouts Salad', nameHindi: '1 कटोरी अंकुरित सलाद', calories: 120, protein: 8, carbs: 20, fat: 1, emoji: '🥗', category: 'breakfast', searchTerms: 'sprouts moong salad healthy protein diet weight loss breakfast raw' },
    { id: '105', name: '1 Glass Sugarcane Juice', nameHindi: '1 गिलास गन्ने का रस', calories: 180, protein: 0, carbs: 45, fat: 0, emoji: '🎋', category: 'snacks', searchTerms: 'sugarcane ganne ka ras juice summer energy drink sweet fresh' },
    { id: '106', name: '1 Bowl Raita', nameHindi: '1 कटोरी रायता', calories: 80, protein: 3, carbs: 10, fat: 2, emoji: '🥣', category: 'lunch', searchTerms: 'raita yogurt curd side dish cucumber boondi cool digestion' },
    { id: '107', name: '1 Rumali Roti', nameHindi: '1 रुमाली रोटी', calories: 200, protein: 5, carbs: 35, fat: 4, emoji: '🫓', category: 'dinner', searchTerms: 'rumali roti thin bread soft handkerchief exotic dinner' },
    { id: '108', name: '1 Plate Chicken Tikka (6 pcs)', nameHindi: '1 प्लेट चिकन टिक्का', calories: 300, protein: 35, carbs: 5, fat: 12, emoji: '🍢', category: 'dinner', searchTerms: 'chicken tikka kebab starter tandoori protein grilled nonveg' },
    { id: '109', name: '1 Plate Paneer Tikka (6 pcs)', nameHindi: '1 प्लेट पनीर टिक्का', calories: 320, protein: 18, carbs: 15, fat: 20, emoji: '🍢', category: 'dinner', searchTerms: 'paneer tikka kebab starter veg tandoori cottage cheese protein' },
    { id: '110', name: '1 Bowl Oats Porridge', nameHindi: '1 कटोरी ओट्स', calories: 150, protein: 6, carbs: 25, fat: 3, emoji: '🥣', category: 'breakfast', searchTerms: 'oats porridge breakfast healthy fiber diet oatmeal weight loss' }];

function migrate() {
    const db = new sqlite3.Database(DB_PATH);

    db.serialize(() => {
        console.log('🔄 Starting SQLite migration...');
        console.log('📊 Database:', DB_PATH);

        // Create tables first (if they don't exist)
        db.run(`CREATE TABLE IF NOT EXISTS exercises (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT,
      difficulty TEXT,
      equipment TEXT,
      targetMuscles TEXT,
      gifUrl TEXT,
      description TEXT,
      instructions TEXT,
      defaultSets TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT
    )`);

        // Added protein, carbs, fat, searchTerms columns
        db.run(`CREATE TABLE IF NOT EXISTS foods (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nameHindi TEXT,
      calories INTEGER NOT NULL,
      protein REAL DEFAULT 0,
      carbs REAL DEFAULT 0,
      fat REAL DEFAULT 0,
      emoji TEXT,
      category TEXT,
      searchTerms TEXT,
      isActive INTEGER DEFAULT 1,
      createdAt TEXT
    )`);

        // Create Users Table
        db.run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      age INTEGER,
      gender TEXT,
      weight REAL,
      height REAL,
      targetWeight REAL,
      goal TEXT,
      activityLevel TEXT,
      createdAt TEXT,
      updatedAt TEXT
    )`);

        // Create User Measurements Table
        db.run(`CREATE TABLE IF NOT EXISTS user_measurements (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            date TEXT NOT NULL,
            chest REAL,
            waist REAL,
            arms REAL,
            hips REAL,
            createdAt TEXT,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )`);

        // Re-create App Config Table (Drop first to ensure schema integrity)
        db.run('DROP TABLE IF EXISTS app_config');
        db.run(`CREATE TABLE app_config (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updatedAt TEXT
        )`);

        // Insert default app config if not exists
        const configStmt = db.prepare(`INSERT OR IGNORE INTO app_config (key, value, updatedAt) VALUES (?, ?, ?)`);
        configStmt.run('requiredVersion', '1.0.0', new Date().toISOString());
        configStmt.run('forceUpdate', 'false', new Date().toISOString());
        configStmt.run('updateMessage', 'A new version of Caloriv is available! Update now for the best experience.', new Date().toISOString());
        configStmt.run('updateUrl', 'https://caloriv-web.vercel.app/', new Date().toISOString());
        configStmt.finalize();

        // Ensure isActive defaults to 1 for migration items is handled in insert
        // Note: Submitted exercises will be inserted with isActive=0 via the API

        console.log('✅ Database tables created/verified');

        // Clear existing data (Exercises & Foods only - preserve Users)
        db.run('DELETE FROM exercises');
        db.run('DELETE FROM foods');
        console.log('🗑️  Cleared existing food/exercise data (Users preserved)');

        // Insert exercises
        const exerciseStmt = db.prepare(`
      INSERT INTO exercises (id, name, category, difficulty, equipment, targetMuscles, gifUrl, defaultSets, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

        exercises.forEach(ex => {
            exerciseStmt.run(
                ex.id,
                ex.name,
                ex.category,
                ex.difficulty,
                ex.equipment,
                JSON.stringify(ex.targetMuscles),
                ex.gifUrl,
                ex.defaultSets,
                new Date().toISOString()
            );
        });
        exerciseStmt.finalize();
        console.log(`✅ Inserted ${exercises.length} exercises`);

        // Insert foods with macro data
        const foodStmt = db.prepare(`
      INSERT INTO foods (id, name, nameHindi, calories, protein, carbs, fat, emoji, category, searchTerms, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

        foods.forEach(food => {
            // Hueristic for category assignment if missing
            let cat = food.category;
            if (!cat) {
                const name = food.name.toLowerCase();
                if (name.includes('tea') || name.includes('coffee') || name.includes('egg') || name.includes('oats') || name.includes('bread')) cat = 'breakfast';
                else if (name.includes('rice') || name.includes('roti') || name.includes('dal') || name.includes('curry')) cat = 'lunch';
                else if (name.includes('snack') || name.includes('samosa') || name.includes('fruit')) cat = 'snacks';
                else cat = 'dinner';
            }

            foodStmt.run(
                food.id,
                food.name,
                food.nameHindi,
                food.calories,
                food.protein || 0,
                food.carbs || 0,
                food.fat || 0,
                food.emoji,
                cat, // category
                food.searchTerms || '',
                new Date().toISOString()
            );
        });
        foodStmt.finalize(() => {
            console.log(`✅ Inserted ${foods.length} foods with macros`);

            // 4. Ensure Users Table has currentWeight (Fixes registration error)
            db.run("ALTER TABLE users ADD COLUMN currentWeight INTEGER DEFAULT 0", (err) => {
                if (!err) console.log("✅ Added 'currentWeight' column to users table");
            });

            console.log('🎉 Migration complete!');
            console.log('');
            console.log('Summary:');
            console.log(`  - Exercises: ${exercises.length}`);
            console.log(`  - Foods: ${foods.length}`);
            console.log(`  - Total: ${exercises.length + foods.length} items`);
            console.log(`  - Database: ${DB_PATH}`);

            // Close database AFTER all inserts complete
            db.close((err) => {
                if (err) {
                    console.error('❌ Error closing database:', err);
                    process.exit(1);
                }
                console.log('✅ Database connection closed');
                process.exit(0);
            });
        });
    });
}

migrate();
