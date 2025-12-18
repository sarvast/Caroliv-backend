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
    { id: '1', name: '1 Roti/Chapati', nameHindi: '1 रोटी/चपाती', calories: 70, protein: 3, carbs: 15, fat: 0.5, emoji: '🫓', searchTerms: 'roti chapati fulka wheat bread' },
    { id: '2', name: '1 Bowl Rice', nameHindi: '1 कटोरी चावल', calories: 130, protein: 2.5, carbs: 28, fat: 0.2, emoji: '🍚', searchTerms: 'rice chawal bhaat plain rice' },
    { id: '3', name: '1 Boiled Egg', nameHindi: '1 उबला अंडा', calories: 70, protein: 6, carbs: 0.6, fat: 5, emoji: '🥚', searchTerms: 'egg anda boiled ubla' },
    { id: '4', name: '1 Omelette', nameHindi: '1 ऑमलेट', calories: 100, protein: 7, carbs: 1, fat: 7, emoji: '🍳', searchTerms: 'omelette anda fry egg fry' },
    { id: '5', name: '1 Slice White Bread', nameHindi: '1 स्लाइस सफेद ब्रेड', calories: 60, protein: 2, carbs: 12, fat: 1, emoji: '🍞', searchTerms: 'bread white toast' },
    { id: '6', name: '1 Slice Brown Bread', nameHindi: '1 स्लाइस ब्राउन ब्रेड', calories: 45, protein: 3, carbs: 10, fat: 0.5, emoji: '🍞', searchTerms: 'bread brown whole wheat' },
    { id: '7', name: '1 Potato Paratha', nameHindi: '1 आलू पराठा', calories: 230, protein: 5, carbs: 35, fat: 8, emoji: '🥔', searchTerms: 'paratha aloo stuffed flatbread' },
    { id: '8', name: '1 Plain Paratha', nameHindi: '1 प्लेन पराठा', calories: 190, protein: 4, carbs: 28, fat: 6, emoji: '🫓', searchTerms: 'paratha plain tawa' },
    { id: '9', name: '1 Paneer Paratha', nameHindi: '1 पनीर पराठा', calories: 260, protein: 9, carbs: 32, fat: 12, emoji: '🧀', searchTerms: 'paratha paneer cottage cheese' },
    { id: '10', name: '2 Idli with Sambar', nameHindi: '2 इडली सांबर के साथ', calories: 120, protein: 4, carbs: 24, fat: 1, emoji: '🥘', searchTerms: 'idli sambar breakfast south indian' },
    { id: '11', name: '1 Plain Dosa', nameHindi: '1 प्लेन डोसा', calories: 110, protein: 3, carbs: 22, fat: 2, emoji: '🥞', searchTerms: 'dosa plain sada South indian' },
    { id: '12', name: '1 Masala Dosa', nameHindi: '1 मसाला डोसा', calories: 200, protein: 4, carbs: 30, fat: 7, emoji: '🥞', searchTerms: 'dosa masala potato South indian' },
    { id: '13', name: '1 Bowl Poha', nameHindi: '1 कटोरी पोहा', calories: 180, protein: 3, carbs: 30, fat: 5, emoji: '🍚', searchTerms: 'poha flattened rice chivda breakfast' },
    { id: '14', name: '1 Bowl Upma', nameHindi: '1 कटोरी उपमा', calories: 200, protein: 4, carbs: 35, fat: 5, emoji: '🥣', searchTerms: 'upma rava suji breakfast' },
    { id: '15', name: '1 Bowl Lentils (Dal)', nameHindi: '1 कटोरी दाल', calories: 130, protein: 7, carbs: 18, fat: 4, emoji: '🍲', searchTerms: 'dal tadka fry arhar yellow lentil' },
    { id: '16', name: '1 Bowl Potato Curry', nameHindi: '1 कटोरी आलू सब्जी', calories: 150, protein: 2, carbs: 22, fat: 6, emoji: '🥔', searchTerms: 'aloo sabji curry potato veg' },
    { id: '17', name: '1 Bowl Chickpeas (Chole)', nameHindi: '1 कटोरी छोले', calories: 180, protein: 8, carbs: 28, fat: 5, emoji: '🧆', searchTerms: 'chole chana chickpea curry' },
    { id: '18', name: '1 Bowl Kidney Beans (Rajma)', nameHindi: '1 कटोरी राजमा', calories: 200, protein: 9, carbs: 30, fat: 5, emoji: '🫘', searchTerms: 'rajma kidney bean curry' },
    { id: '19', name: '100g Chicken Curry', nameHindi: '100g चिकन करी', calories: 170, protein: 20, carbs: 5, fat: 8, emoji: '🍗', searchTerms: 'chicken curry nonveg gravy' },
    { id: '20', name: '1 Bowl Paneer Curry', nameHindi: '1 कटोरी पनीर सब्जी', calories: 220, protein: 10, carbs: 8, fat: 15, emoji: '🧀', searchTerms: 'paneer curry butter masala shahi matarr' },
    { id: '21', name: '1 Bowl Kadhi', nameHindi: '1 कटोरी कढ़ी', calories: 140, protein: 4, carbs: 12, fat: 8, emoji: '🥣', searchTerms: 'kadhi yogurt curry dahi' },
    { id: '22', name: '1 Bowl Mixed Veg', nameHindi: '1 कटोरी मिक्स सब्जी', calories: 120, protein: 3, carbs: 15, fat: 5, emoji: '🥗', searchTerms: 'mix veg sabji' },
    { id: '23', name: '100g Fish Curry', nameHindi: '100g मछली करी', calories: 150, protein: 18, carbs: 4, fat: 7, emoji: '🐟', searchTerms: 'fish curry machli' },
    { id: '24', name: '1 Bowl Palak Paneer', nameHindi: '1 कटोरी पालक पनीर', calories: 240, protein: 12, carbs: 10, fat: 16, emoji: '🥬', searchTerms: 'palak paneer spinach cottage cheese' },
    { id: '25', name: '1 Plate Veg Biryani', nameHindi: '1 प्लेट वेज बिरयानी', calories: 350, protein: 8, carbs: 55, fat: 10, emoji: '🍛', searchTerms: 'biryani veg pulao rice' },
    { id: '26', name: '1 Plate Chicken Biryani', nameHindi: '1 प्लेट चिकन बिरयानी', calories: 450, protein: 25, carbs: 50, fat: 15, emoji: '🍛', searchTerms: 'biryani chicken rice nonveg' },
    { id: '27', name: '1 Bowl Jeera Rice', nameHindi: '1 कटोरी जीरा राइस', calories: 180, protein: 3, carbs: 35, fat: 3, emoji: '🍚', searchTerms: 'jeera rice cumin' },
    { id: '28', name: '1 Bowl Curd Rice', nameHindi: '1 कटोरी दही चावल', calories: 200, protein: 5, carbs: 32, fat: 6, emoji: '🍚', searchTerms: 'curd rice dahi chawal yogurt' },
    { id: '29', name: '1 Samosa', nameHindi: '1 समोसा', calories: 150, protein: 3, carbs: 18, fat: 8, emoji: '🥟', searchTerms: 'samosa snack fried' },
    { id: '30', name: '1 Kachori', nameHindi: '1 कचौरी', calories: 180, protein: 4, carbs: 22, fat: 10, emoji: '🥟', searchTerms: 'kachori snack fried' },
    { id: '31', name: '1 Vada Pav', nameHindi: '1 वड़ा पाव', calories: 250, protein: 6, carbs: 40, fat: 10, emoji: '🍔', searchTerms: 'vada pav burger mumbai street' },
    { id: '32', name: '1 Plate Pakora', nameHindi: '1 प्लेट पकोड़े', calories: 200, protein: 4, carbs: 25, fat: 12, emoji: '🍤', searchTerms: 'pakora fritters bhajiya' },
    { id: '33', name: '1 Gulab Jamun', nameHindi: '1 गुलाब जामुन', calories: 150, protein: 2, carbs: 25, fat: 6, emoji: '🧁', searchTerms: 'gulab jamun sweet dessert' },
    { id: '34', name: '1 Rasgulla', nameHindi: '1 रसगुल्ला', calories: 120, protein: 3, carbs: 25, fat: 1, emoji: '⚪', searchTerms: 'rasgulla sweet bengali' },
    { id: '35', name: '1 Jalebi', nameHindi: '1 जलेबी', calories: 140, protein: 1, carbs: 30, fat: 4, emoji: '🟠', searchTerms: 'jalebi sweet' },
    { id: '36', name: '1 Besan Ladoo', nameHindi: '1 लड्डू', calories: 160, protein: 4, carbs: 20, fat: 9, emoji: '🟡', searchTerms: 'ladoo laddu sweet besan' },
    { id: '37', name: '1 Piece Barfi', nameHindi: '1 पीस बर्फी', calories: 130, protein: 3, carbs: 18, fat: 6, emoji: '🟫', searchTerms: 'barfi sweet' },
    { id: '38', name: '1 Banana', nameHindi: '1 केला', calories: 90, protein: 1, carbs: 23, fat: 0, emoji: '🍌', searchTerms: 'banana kela fruit' },
    { id: '39', name: '1 Apple', nameHindi: '1 सेब', calories: 52, protein: 0, carbs: 14, fat: 0, emoji: '🍎', searchTerms: 'apple seb fruit' },
    { id: '40', name: '1 Orange', nameHindi: '1 संतरा', calories: 47, protein: 1, carbs: 12, fat: 0, emoji: '🍊', searchTerms: 'orange santra fruit' },
    { id: '41', name: '1 Mango', nameHindi: '1 आम', calories: 135, protein: 1, carbs: 35, fat: 0, emoji: '🥭', searchTerms: 'mango aam fruit' },
    { id: '42', name: '1 Cup Papaya', nameHindi: '1 कप पपीता', calories: 55, protein: 1, carbs: 13, fat: 0, emoji: '🍈', searchTerms: 'papaya papita fruit' },
    { id: '43', name: '200ml Tea (Sweet)', nameHindi: '200ml चाय (मीठी)', calories: 100, protein: 2, carbs: 15, fat: 3, emoji: '☕', searchTerms: 'tea chai morning sweet' },
    { id: '44', name: '200ml Tea (No Sugar)', nameHindi: '200ml चाय (बिना चीनी)', calories: 60, protein: 2, carbs: 6, fat: 3, emoji: '☕', searchTerms: 'tea chai unsweetened' },
    { id: '45', name: '100ml Milk Coffee', nameHindi: '100ml मिल्क कॉफी', calories: 80, protein: 3, carbs: 10, fat: 4, emoji: '☕', searchTerms: 'coffee kafi milk' },
    { id: '46', name: '200ml Milk', nameHindi: '200ml दूध', calories: 120, protein: 6, carbs: 10, fat: 6, emoji: '🥛', searchTerms: 'milk doodh dairy' },
    { id: '47', name: '1 Glass Lassi', nameHindi: '1 गिलास लस्सी', calories: 180, protein: 6, carbs: 30, fat: 5, emoji: '🥤', searchTerms: 'lassi sweet yogurt drink' },
    { id: '48', name: '1 Glass Buttermilk', nameHindi: '1 गिलास छाछ', calories: 60, protein: 2, carbs: 5, fat: 2, emoji: '🥛', searchTerms: 'buttermilk chaas chhach' },
    { id: '49', name: '1 Tbsp Ghee', nameHindi: '1 चम्मच घी', calories: 120, protein: 0, carbs: 0, fat: 14, emoji: '🧈', searchTerms: 'ghee clarified butter fat' },
    { id: '50', name: '1 Tbsp Oil', nameHindi: '1 चम्मच तेल', calories: 120, protein: 0, carbs: 0, fat: 14, emoji: '🫗', searchTerms: 'oil tel cooking fat' },
    { id: '51', name: '100g Yogurt (Curd)', nameHindi: '100g दही', calories: 60, protein: 3, carbs: 5, fat: 3, emoji: '🥣', searchTerms: 'dahi curd yogurt' },
    { id: '52', name: '1 Papad', nameHindi: '1 पापड़', calories: 50, protein: 2, carbs: 8, fat: 1, emoji: '🫓', searchTerms: 'papad side dish' },
    { id: '53', name: '1 Plate Dahi Puri', nameHindi: '1 प्लेट दही पूरी', calories: 320, protein: 6, carbs: 50, fat: 12, emoji: '🥣', searchTerms: 'dahi puri chaat' },
    { id: '54', name: '1 Plate Bhel Puri', nameHindi: '1 प्लेट भेल पूरी', calories: 250, protein: 5, carbs: 40, fat: 8, emoji: '🥡', searchTerms: 'bhel puri chaat snack' },
    { id: '55', name: '1 Plate Sev Puri', nameHindi: '1 प्लेट सेव पूरी', calories: 280, protein: 5, carbs: 38, fat: 12, emoji: '🍘', searchTerms: 'sev puri chaat snack' },
    { id: '56', name: '2 Aloo Tikki', nameHindi: '2 आलू टिक्की', calories: 280, protein: 4, carbs: 35, fat: 14, emoji: '🥔', searchTerms: 'aloo tikki cutlet patty' },
    { id: '57', name: '1 Khasta Kachori', nameHindi: '1 खस्ता कचौड़ी', calories: 185, protein: 3, carbs: 20, fat: 10, emoji: '🥟', searchTerms: 'khasta kachori snack' },
    { id: '58', name: '1 Plate Veg Momos (6 pcs)', nameHindi: '1 प्लेट वेज मोमोस', calories: 210, protein: 5, carbs: 35, fat: 4, emoji: '🥟', searchTerms: 'momos dimsum dumpling' },
    { id: '59', name: '1 Dabeli', nameHindi: '1 दाबेली', calories: 300, protein: 6, carbs: 45, fat: 12, emoji: '🥯', searchTerms: 'dabeli snack gujarati' },
    { id: '60', name: '1 Egg Roll', nameHindi: '1 अंडा रोल', calories: 450, protein: 14, carbs: 40, fat: 22, emoji: '🌯', searchTerms: 'egg roll wrap frankie' },
    { id: '61', name: '1 Plate Pav Bhaji', nameHindi: '1 प्लेट पाव भाजी', calories: 400, protein: 8, carbs: 60, fat: 15, emoji: '🍛', searchTerms: 'pav bhaji mumbai street' },
    { id: '62', name: '6 Pani Puri', nameHindi: '6 पानी पूरी', calories: 120, protein: 2, carbs: 22, fat: 4, emoji: '🥟', searchTerms: 'pani puri golgappa puchka' },
    { id: '63', name: '1 Plate Dhokla (4 pcs)', nameHindi: '1 प्लेट ढोकला', calories: 160, protein: 6, carbs: 25, fat: 5, emoji: '🟨', searchTerms: 'dhokla gujarati snack steamed' },
    { id: '64', name: '1 Plate Misal Pav', nameHindi: '1 प्लेट मिसल पाव', calories: 480, protein: 15, carbs: 55, fat: 20, emoji: '🍛', searchTerms: 'misal pav spicy maharashtrian' },
    { id: '65', name: '2 Thepla', nameHindi: '2 थेपला', calories: 240, protein: 6, carbs: 35, fat: 10, emoji: '🥞', searchTerms: 'thepla paratha gujarati methi' },
    { id: '66', name: '1 Plate Chole Bhature', nameHindi: '1 प्लेट छोले भटूरे', calories: 550, protein: 18, carbs: 70, fat: 25, emoji: '🥘', searchTerms: 'chole bhature punjabi heavy' },
    { id: '67', name: '2 Litti Chokha', nameHindi: '2 लिट्टी चोखा', calories: 350, protein: 12, carbs: 55, fat: 8, emoji: '🧆', searchTerms: 'litti chokha bihari roasted' },
    { id: '68', name: '1 Plate Dal Baati Churma', nameHindi: '1 प्लेट दाल बाटी चूरमा', calories: 650, protein: 18, carbs: 80, fat: 30, emoji: '🥣', searchTerms: 'dal baati churma rajasthani' },
    { id: '69', name: '1 Medu Vada', nameHindi: '1 मेदु वड़ा', calories: 140, protein: 4, carbs: 15, fat: 8, emoji: '🍩', searchTerms: 'medu vada donut south indian' },
    { id: '70', name: '1 Uttapam', nameHindi: '1 उत्तपम', calories: 200, protein: 5, carbs: 35, fat: 6, emoji: '🥞', searchTerms: 'uttapam pancake south indian' },
    { id: '71', name: '2 Kaju Katli', nameHindi: '2 काजू कतली', calories: 120, protein: 3, carbs: 14, fat: 7, emoji: '💠', searchTerms: 'kaju katli cashew sweet' },
    { id: '72', name: '1 Mysore Pak', nameHindi: '1 मैसूर पाक', calories: 190, protein: 1, carbs: 20, fat: 12, emoji: '🟫', searchTerms: 'mysore pak sweet besan' },
    { id: '73', name: '1 Bowl Gajar Halwa', nameHindi: '1 कटोरी गाजर का हलवा', calories: 300, protein: 6, carbs: 40, fat: 14, emoji: '🥕', searchTerms: 'gajar halwa carrot pudding sweet' },
    { id: '74', name: '2 Rasmalai', nameHindi: '2 रसमलाई', calories: 320, protein: 8, carbs: 35, fat: 14, emoji: '🍮', searchTerms: 'rasmalai sweet milk' },
    { id: '75', name: '1 Bowl Shrikhand', nameHindi: '1 कटोरी श्रीखंड', calories: 280, protein: 8, carbs: 30, fat: 14, emoji: '🥣', searchTerms: 'shrikhand sweet yogurt' },
    { id: '76', name: '1 Motichoor Ladoo', nameHindi: '1 मोतीचूर लड्डू', calories: 180, protein: 2, carbs: 25, fat: 9, emoji: '🟠', searchTerms: 'motichoor ladoo sweet boondi' },
    { id: '77', name: '1 Bowl Kheer', nameHindi: '1 कटोरी खीर', calories: 240, protein: 6, carbs: 35, fat: 8, emoji: '🍚', searchTerms: 'kheer rice pudding sweet' },
    { id: '78', name: '1 Peda', nameHindi: '1 पेड़ा', calories: 140, protein: 3, carbs: 20, fat: 5, emoji: '⚪', searchTerms: 'peda sweet milk' },
    { id: '79', name: '1 Kalakand', nameHindi: '1 कलाकंद', calories: 160, protein: 4, carbs: 18, fat: 8, emoji: '🟫', searchTerms: 'kalakand milk cake sweet' },
    { id: '80', name: '1 Bowl Phirni', nameHindi: '1 कटोरी फिरनी', calories: 220, protein: 5, carbs: 32, fat: 8, emoji: '🥣', searchTerms: 'phirni rice pudding sweet' },
    { id: '81', name: '3 Chakli', nameHindi: '3 चकली', calories: 150, protein: 2, carbs: 20, fat: 8, emoji: '🌀', searchTerms: 'chakli murukku snack crunchy' },
    { id: '82', name: '1 Bowl Namkeen', nameHindi: '1 कटोरी नमकीन', calories: 200, protein: 4, carbs: 20, fat: 12, emoji: '🥜', searchTerms: 'namkeen mixture snack' },
    { id: '83', name: '4 Mathri', nameHindi: '4 मठरी', calories: 220, protein: 3, carbs: 25, fat: 12, emoji: '🍪', searchTerms: 'mathri snack cracker' },
    { id: '84', name: '1 Bowl Banana Chips', nameHindi: '1 कटोरी केला चिप्स', calories: 180, protein: 1, carbs: 20, fat: 10, emoji: '🍌', searchTerms: 'banana chips wafers' },
    { id: '85', name: '1 Plate Fafda', nameHindi: '1 प्लेट फाफड़ा', calories: 200, protein: 6, carbs: 22, fat: 10, emoji: '🥖', searchTerms: 'fafda gujarati snack' },
    { id: '86', name: '1 Bowl Bhujia Sev', nameHindi: '1 कटोरी भुजिया सेव', calories: 250, protein: 4, carbs: 20, fat: 18, emoji: '🍜', searchTerms: 'bhujia sev namkeen' },
    { id: '87', name: '1 Bowl Makhanas', nameHindi: '1 कटोरी मखाना', calories: 100, protein: 3, carbs: 20, fat: 0.5, emoji: '🍿', searchTerms: 'makhana fox nut lotus seed healthy' },
    { id: '88', name: '1 Peanut Chikki', nameHindi: '1 मूंगफली चिक्की', calories: 120, protein: 4, carbs: 15, fat: 6, emoji: '🍫', searchTerms: 'chikki peanut bar sweet' },
    { id: '89', name: '1 Khakhra', nameHindi: '1 खाखरा', calories: 60, protein: 2, carbs: 10, fat: 1, emoji: '🥖', searchTerms: 'khakhra cracker healthy gujarati' },
    { id: '90', name: '1 Bowl Chana Jor Garam', nameHindi: '1 कटोरी चना जोर गरम', calories: 150, protein: 8, carbs: 22, fat: 4, emoji: '🥜', searchTerms: 'chana jor garam snack chickpea' },
    { id: '91', name: '1 Butter Naan', nameHindi: '1 बटर नान', calories: 280, protein: 6, carbs: 45, fat: 8, emoji: '🍞', searchTerms: 'naan butter bread tandoori' },
    { id: '92', name: '1 Tandoori Roti', nameHindi: '1 तंदूरी रोटी', calories: 120, protein: 3, carbs: 25, fat: 1, emoji: '🥯', searchTerms: 'tandoori roti bread' },
    { id: '93', name: '1 Kulcha', nameHindi: '1 कुलचा', calories: 180, protein: 4, carbs: 32, fat: 3, emoji: '🥖', searchTerms: 'kulcha bread' },
    { id: '94', name: '4 Puri', nameHindi: '4 पूरी', calories: 320, protein: 4, carbs: 35, fat: 18, emoji: '🥟', searchTerms: 'puri fried bread poori' },
    { id: '95', name: '1 Bhakri', nameHindi: '1 भाकरी', calories: 160, protein: 3, carbs: 30, fat: 2, emoji: '🍞', searchTerms: 'bhakri hard bread maharashtrian' },
    { id: '96', name: '1 Garlic Naan', nameHindi: '1 गार्लिक नान', calories: 300, protein: 6, carbs: 45, fat: 10, emoji: '🍞', searchTerms: 'garlic naan bread' },
    { id: '97', name: '1 Missi Roti', nameHindi: '1 मिस्सी रोटी', calories: 140, protein: 5, carbs: 25, fat: 2, emoji: '🥯', searchTerms: 'missi roti besan bread' },
    { id: '98', name: '1 Cup Masala Chai', nameHindi: '1 कप मसाला चाय', calories: 105, protein: 2, carbs: 12, fat: 3, emoji: '☕', searchTerms: 'masala chai tea spice' },
    { id: '99', name: '1 Cup Filter Coffee', nameHindi: '1 कप फिल्टर कॉफी', calories: 80, protein: 2, carbs: 10, fat: 3, emoji: '☕', searchTerms: 'filter coffee south indian' },
    { id: '100', name: '1 Glass Thandai', nameHindi: '1 गिलास ठंडाई', calories: 220, protein: 6, carbs: 30, fat: 10, emoji: '🥛', searchTerms: 'thandai milk drink festival' },
    { id: '101', name: '1 Glass Aam Panna', nameHindi: '1 गिलास आम पन्ना', calories: 160, protein: 0.5, carbs: 40, fat: 0, emoji: '🥭', searchTerms: 'aam panna mango drink summer' },
    { id: '102', name: '1 Glass Jaljeera', nameHindi: '1 गिलास जलजीरा', calories: 40, protein: 0, carbs: 10, fat: 0, emoji: '🥤', searchTerms: 'jaljeera cumin drink spice' },
    { id: '103', name: '1 Bowl Soya Chunks Curry', nameHindi: '1 कटोरी सोया चंक्स करी', calories: 180, protein: 25, carbs: 10, fat: 5, emoji: '🥩', searchTerms: 'soya chunks nutrella protein veg' },
    { id: '104', name: '1 Bowl Sprouts Salad', nameHindi: '1 कटोरी अंकुरित सलाद', calories: 120, protein: 8, carbs: 20, fat: 1, emoji: '🥗', searchTerms: 'sprouts moong salad healthy' },
    { id: '105', name: '1 Glass Sugarcane Juice', nameHindi: '1 गिलास गन्ने का रस', calories: 180, protein: 0, carbs: 45, fat: 0, emoji: '🎋', searchTerms: 'sugarcane ganne ka ras juice' },
    { id: '106', name: '1 Bowl Raita', nameHindi: '1 कटोरी रायता', calories: 80, protein: 3, carbs: 10, fat: 2, emoji: '🥣', searchTerms: 'raita yogurt curd side' },
    { id: '107', name: '1 Rumali Roti', nameHindi: '1 रुमाली रोटी', calories: 200, protein: 5, carbs: 35, fat: 4, emoji: '🫓', searchTerms: 'rumali roti thin bread' },
    { id: '108', name: '1 Plate Chicken Tikka (6 pcs)', nameHindi: '1 प्लेट चिकन टिक्का', calories: 300, protein: 35, carbs: 5, fat: 12, emoji: '🍢', searchTerms: 'chicken tikka kebab starter' },
    { id: '109', name: '1 Plate Paneer Tikka (6 pcs)', nameHindi: '1 प्लेट पनीर टिक्का', calories: 320, protein: 18, carbs: 15, fat: 20, emoji: '🍢', searchTerms: 'paneer tikka kebab starter veg' },
    { id: '110', name: '1 Bowl Oats Porridge', nameHindi: '1 कटोरी ओट्स', calories: 150, protein: 6, carbs: 25, fat: 3, emoji: '🥣', searchTerms: 'oats porridge breakfast healthy' }
];

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
      INSERT INTO foods (id, name, nameHindi, calories, protein, carbs, fat, emoji, searchTerms, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)
    `);

        foods.forEach(food => {
            foodStmt.run(
                food.id,
                food.name,
                food.nameHindi,
                food.calories,
                food.protein || 0,
                food.carbs || 0,
                food.fat || 0,
                food.emoji,
                food.searchTerms || '',
                new Date().toISOString()
            );
        });
        foodStmt.finalize(() => {
            console.log(`✅ Inserted ${foods.length} foods with macros`);

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
