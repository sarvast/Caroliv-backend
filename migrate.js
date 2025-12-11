// SQLite Migration Script
// Populates database with 28 exercises and 102 foods

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'caroliv.db');

// 28 Exercises
const exercises = [
    { id: '1', name: 'Push-Ups', category: 'chest', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Chest', 'Triceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/47.gif', defaultSets: '4 sets' },
    { id: '2', name: 'Dumbbell Chest Press', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif', defaultSets: '4 × 15' },
    { id: '3', name: 'Dumbbell Fly', category: 'chest', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Chest'], gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif', defaultSets: '3 × 15' },
    { id: '4', name: 'Shoulder Press', category: 'shoulders', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://barbend.com/wp-content/uploads/2023/10/seated-dumbbell-shoulder-press-barbend-movement-gif-masters-2.gif', defaultSets: '3 × 15' },
    { id: '5', name: 'Lateral Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Shoulders'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/32.gif', defaultSets: '3 × 20' },
    { id: '6', name: 'Rear Delt Raises', category: 'shoulders', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Rear Delts'], gifUrl: 'https://cdn.prod.website-files.com/66c501d753ae2a8c705375b6/67f015ffa54a8deb0995e0f0_67eff133ef062af3c638116a_250204_ANYTIME_FITNESS_Seated-Reverse-Lateral-Raise.gif', defaultSets: '3 × 20' },
    { id: '7', name: 'Bent-Over Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif', defaultSets: '4 × 15' },
    { id: '8', name: 'One-Arm Rows', category: 'back', difficulty: 'intermediate', equipment: 'dumbbells', targetMuscles: ['Back'], gifUrl: 'https://i.pinimg.com/originals/1c/7e/29/1c7e293b84e72ee9f7dc68c0e6ce071a.gif', defaultSets: '3 × 15' },
    { id: '9', name: 'Barbell Rows', category: 'back', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Back'], gifUrl: 'https://hips.hearstapps.com/menshealth-uk/main/assets/row-under.gif', defaultSets: '4 × 15' },
    { id: '10', name: 'Bicep Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif', defaultSets: '4 × 15' },
    { id: '11', name: 'Barbell Curls', category: 'arms', difficulty: 'intermediate', equipment: 'barbell', targetMuscles: ['Biceps'], gifUrl: 'https://artimg.gympik.com/articles/wp-content/uploads/2018/08/Final-Gift.gif', defaultSets: '4 × 12' },
    { id: '12', name: 'Hammer Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Biceps'], gifUrl: 'https://barbend.com/wp-content/uploads/2021/08/hammer-curl-barbend-movement-gif-masters.gif', defaultSets: '3 × 12' },
    { id: '13', name: 'Wrist Curls', category: 'arms', difficulty: 'beginner', equipment: 'dumbbells', targetMuscles: ['Forearms'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/1093.gif', defaultSets: '3 × 20' },
    { id: '14', name: 'Plank', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Core'], gifUrl: 'https://i.pinimg.com/originals/71/39/d1/7139d152892319a5f61b64bab693c685.gif', defaultSets: '3 × 1 min' },
    { id: '15', name: 'Leg Raises', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Lower Abs'], gifUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/eUKRNPj04Tg9Lw5uF8OgF/72414354eb43c1a2b1e06f07386cc0b7/Leg_Lifts_GIF.gif', defaultSets: '4 × 15' },
    { id: '16', name: 'Russian Twists', category: 'core', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://i.pinimg.com/originals/a1/74/53/a17453017da9630b48304348c62bee3c.gif', defaultSets: '3 × 30' },
    { id: '17', name: 'Crunches', category: 'core', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://i.pinimg.com/originals/af/8f/3c/af8f3c6315440188dfe84b5f27646365.gif', defaultSets: '3 × 15' },
    { id: '18', name: 'V-Ups', category: 'core', difficulty: 'advanced', equipment: 'bodyweight', targetMuscles: ['Abs'], gifUrl: 'https://d24bnpykhxwj9p.cloudfront.net/s3file/s3fs-public/users1/2017-03/Wed/v%20up.gif', defaultSets: '3 × failure' },
    { id: '19', name: 'Squats', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads', 'Glutes'], gifUrl: 'https://barbend.com/wp-content/uploads/2022/06/goblet-squat-barbend-movement-gif-masters.gif', defaultSets: '4 × 15' },
    { id: '20', name: 'Lunges', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Quads'], gifUrl: 'https://www.verywellfit.com/thmb/OxaUMT6kHg2Lfvi-i-Oiq0lwOwA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/70-4588048-LungeGIF-36593998192c4036a37cac3903b4f6bd.gif', defaultSets: '3 × 12' },
    { id: '21', name: 'Romanian Deadlifts', category: 'legs', difficulty: 'advanced', equipment: 'barbell', targetMuscles: ['Hamstrings'], gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif', defaultSets: '4 × 12' },
    { id: '22', name: 'Calf Raises', category: 'legs', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Calves'], gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif', defaultSets: '4 × 25' },
    { id: '23', name: 'Hip Thrusts', category: 'legs', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Glutes'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlbIs9A4kE4O98mBn15zAA0zElnxHmhQXQww&s', defaultSets: '3 × 15' },
    { id: '24', name: 'Overhead Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Shoulders'], gifUrl: 'https://assets.vogue.com/photos/5891df4b12a7b1df212c840d/master/pass/karlie-stretch-5.gif', defaultSets: '1 min' },
    { id: '25', name: 'Side Bend', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Obliques'], gifUrl: 'https://assets.vogue.com/photos/5891df4612a7b1df212c8409/master/w_1600%2Cc_limit/karlie-stretch-2.gif', defaultSets: '1 min' },
    { id: '26', name: 'Cat Cow', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Back'], gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrBXePns59QORJUtzHPa2fGYThEEZ90nmdsQ&s', defaultSets: '2 × 10' },
    { id: '27', name: 'Hamstring Stretch', category: 'flexibility', difficulty: 'beginner', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/09/400x400-Seated_Hamstring_Stretch.gif', defaultSets: '1 min' },
    { id: '28', name: 'Pyramid Pose', category: 'flexibility', difficulty: 'intermediate', equipment: 'bodyweight', targetMuscles: ['Hamstrings'], gifUrl: 'https://www.nourishmovelove.com/wp-content/uploads/2021/11/pyramid-pose.gif', defaultSets: '1 min' },
];

// 102 Indian Foods - Complete List
const foods = [
    { id: '1', name: '1 Roti/Chapati', nameHindi: '1 रोटी/चपाती', calories: 70, emoji: '🫓' },
    { id: '2', name: '1 Bowl Rice', nameHindi: '1 कटोरी चावल', calories: 130, emoji: '🍚' },
    { id: '3', name: '1 Boiled Egg', nameHindi: '1 उबला अंडा', calories: 70, emoji: '🥚' },
    { id: '4', name: '1 Omelette', nameHindi: '1 ऑमलेट', calories: 100, emoji: '🍳' },
    { id: '5', name: '1 Slice White Bread', nameHindi: '1 स्लाइस सफेद ब्रेड', calories: 60, emoji: '🍞' },
    { id: '6', name: '1 Slice Brown Bread', nameHindi: '1 स्लाइस ब्राउन ब्रेड', calories: 45, emoji: '🍞' },
    { id: '7', name: '1 Potato Paratha', nameHindi: '1 आलू पराठा', calories: 230, emoji: '🥔' },
    { id: '8', name: '1 Plain Paratha', nameHindi: '1 प्लेन पराठा', calories: 190, emoji: '🫓' },
    { id: '9', name: '1 Paneer Paratha', nameHindi: '1 पनीर पराठा', calories: 260, emoji: '🧀' },
    { id: '10', name: '2 Idli with Sambar', nameHindi: '2 इडली सांबर के साथ', calories: 120, emoji: '🥘' },
    { id: '11', name: '1 Plain Dosa', nameHindi: '1 प्लेन डोसा', calories: 110, emoji: '🥞' },
    { id: '12', name: '1 Masala Dosa', nameHindi: '1 मसाला डोसा', calories: 200, emoji: '🥞' },
    { id: '13', name: '1 Bowl Poha', nameHindi: '1 कटोरी पोहा', calories: 180, emoji: '🍚' },
    { id: '14', name: '1 Bowl Upma', nameHindi: '1 कटोरी उपमा', calories: 200, emoji: '🥣' },
    { id: '15', name: '1 Bowl Lentils', nameHindi: '1 कटोरी दाल', calories: 130, emoji: '🍲' },
    { id: '16', name: '1 Bowl Potato Curry', nameHindi: '1 कटोरी आलू सब्जी', calories: 150, emoji: '🥔' },
    { id: '17', name: '1 Bowl Chickpeas', nameHindi: '1 कटोरी छोले', calories: 180, emoji: '🧆' },
    { id: '18', name: '1 Bowl Kidney Beans', nameHindi: '1 कटोरी राजमा', calories: 200, emoji: '🫘' },
    { id: '19', name: '100g Chicken Curry', nameHindi: '100g चिकन करी', calories: 170, emoji: '🍗' },
    { id: '20', name: '1 Bowl Cottage Cheese Curry', nameHindi: '1 कटोरी पनीर सब्जी', calories: 220, emoji: '🧀' },
    { id: '21', name: '1 Bowl Yogurt Curry', nameHindi: '1 कटोरी कढ़ी', calories: 140, emoji: '🥣' },
    { id: '22', name: '1 Bowl Mixed Vegetables', nameHindi: '1 कटोरी मिक्स सब्जी', calories: 120, emoji: '🥗' },
    { id: '23', name: '100g Fish Curry', nameHindi: '100g मछली करी', calories: 150, emoji: '🐟' },
    { id: '24', name: '1 Bowl Spinach Cottage Cheese', nameHindi: '1 कटोरी पालक पनीर', calories: 240, emoji: '🥬' },
    { id: '25', name: '1 Plate Veg Biryani', nameHindi: '1 प्लेट वेज बिरयानी', calories: 350, emoji: '🍛' },
    { id: '26', name: '1 Plate Chicken Biryani', nameHindi: '1 प्लेट चिकन बिरयानी', calories: 450, emoji: '🍛' },
    { id: '27', name: '1 Bowl Cumin Rice', nameHindi: '1 कटोरी जीरा राइस', calories: 180, emoji: '🍚' },
    { id: '28', name: '1 Bowl Curd Rice', nameHindi: '1 कटोरी दही चावल', calories: 200, emoji: '🍚' },
    { id: '29', name: '1 Samosa', nameHindi: '1 समोसा', calories: 150, emoji: '🥟' },
    { id: '30', name: '1 Kachori', nameHindi: '1 कचौरी', calories: 180, emoji: '🥟' },
    { id: '31', name: '1 Vada Pav', nameHindi: '1 वड़ा पाव', calories: 250, emoji: '🍔' },
    { id: '32', name: '1 Plate Fritters', nameHindi: '1 प्लेट पकोड़े', calories: 200, emoji: '🍤' },
    { id: '33', name: '1 Gulab Jamun', nameHindi: '1 गुलाब जामुन', calories: 150, emoji: '🧁' },
    { id: '34', name: '1 Rasgulla', nameHindi: '1 रसगुल्ला', calories: 120, emoji: '⚪' },
    { id: '35', name: '1 Jalebi', nameHindi: '1 जलेबी', calories: 140, emoji: '🟠' },
    { id: '36', name: '1 Ladoo', nameHindi: '1 लड्डू', calories: 160, emoji: '🟡' },
    { id: '37', name: '1 Piece Barfi', nameHindi: '1 पीस बर्फी', calories: 130, emoji: '🟫' },
    { id: '38', name: '1 Banana', nameHindi: '1 केला', calories: 90, emoji: '🍌' },
    { id: '39', name: '1 Apple', nameHindi: '1 सेब', calories: 52, emoji: '🍎' },
    { id: '40', name: '1 Orange', nameHindi: '1 संतरा', calories: 47, emoji: '🍊' },
    { id: '41', name: '1 Mango', nameHindi: '1 आम', calories: 135, emoji: '🥭' },
    { id: '42', name: '1 Cup Papaya', nameHindi: '1 कप पपीता', calories: 55, emoji: '🍈' },
    { id: '43', name: '200ml Tea (Sweet)', nameHindi: '200ml चाय (मीठी)', calories: 100, emoji: '☕' },
    { id: '44', name: '200ml Tea (No Sugar)', nameHindi: '200ml चाय (बिना चीनी)', calories: 60, emoji: '☕' },
    { id: '45', name: '100ml Milk Coffee', nameHindi: '100ml मिल्क कॉफी', calories: 80, emoji: '☕' },
    { id: '46', name: '200ml Milk', nameHindi: '200ml दूध', calories: 120, emoji: '🥛' },
    { id: '47', name: '1 Glass Lassi', nameHindi: '1 गिलास लस्सी', calories: 180, emoji: '🥤' },
    { id: '48', name: '1 Glass Buttermilk', nameHindi: '1 गिलास छाछ', calories: 60, emoji: '🥛' },
    { id: '49', name: '1 Tbsp Ghee', nameHindi: '1 चम्मच घी', calories: 120, emoji: '🧈' },
    { id: '50', name: '1 Tbsp Oil', nameHindi: '1 चम्मच तेल', calories: 120, emoji: '🫗' },
    { id: '51', name: '100g Yogurt', nameHindi: '100g दही', calories: 60, emoji: '🥣' },
    { id: '52', name: '1 Papad', nameHindi: '1 पापड़', calories: 50, emoji: '🫓' },
    { id: '53', name: '1 Plate Dahi Puri', nameHindi: '1 प्लेट दही पूरी', calories: 320, emoji: '🥣' },
    { id: '54', name: '1 Plate Bhel Puri', nameHindi: '1 प्लेट भेल पूरी', calories: 250, emoji: '🥡' },
    { id: '55', name: '1 Plate Sev Puri', nameHindi: '1 प्लेट सेव पूरी', calories: 280, emoji: '🍘' },
    { id: '56', name: '2 Aloo Tikki', nameHindi: '2 आलू टिक्की', calories: 280, emoji: '🥔' },
    { id: '57', name: '1 Khasta Kachori', nameHindi: '1 खस्ता कचौड़ी', calories: 185, emoji: '🥟' },
    { id: '58', name: '1 Plate Veg Momos (6 pcs)', nameHindi: '1 प्लेट वेज मोमोस', calories: 210, emoji: '🥟' },
    { id: '59', name: '1 Dabeli', nameHindi: '1 दाबेली', calories: 300, emoji: '🥯' },
    { id: '60', name: '1 Egg Roll', nameHindi: '1 अंडा रोल', calories: 450, emoji: '🌯' },
    { id: '61', name: '1 Plate Pav Bhaji', nameHindi: '1 प्लेट पाव भाजी', calories: 400, emoji: '🍛' },
    { id: '62', name: '6 Pani Puri', nameHindi: '6 पानी पूरी', calories: 120, emoji: '🥟' },
    { id: '63', name: '1 Plate Dhokla (4 pcs)', nameHindi: '1 प्लेट ढोकला', calories: 160, emoji: '🟨' },
    { id: '64', name: '1 Plate Misal Pav', nameHindi: '1 प्लेट मिसल पाव', calories: 480, emoji: '🍛' },
    { id: '65', name: '2 Thepla', nameHindi: '2 थेपला', calories: 240, emoji: '🥞' },
    { id: '66', name: '1 Plate Chole Bhature', nameHindi: '1 प्लेट छोले भटूरे', calories: 550, emoji: '🥘' },
    { id: '67', name: '2 Litti Chokha', nameHindi: '2 लिट्टी चोखा', calories: 350, emoji: '🧆' },
    { id: '68', name: '1 Plate Dal Baati Churma', nameHindi: '1 प्लेट दाल बाटी चूरमा', calories: 650, emoji: '🥣' },
    { id: '69', name: '1 Medu Vada', nameHindi: '1 मेदु वड़ा', calories: 140, emoji: '🍩' },
    { id: '70', name: '1 Uttapam', nameHindi: '1 उत्तपम', calories: 200, emoji: '🥞' },
    { id: '71', name: '2 Kaju Katli', nameHindi: '2 काजू कतली', calories: 120, emoji: '💠' },
    { id: '72', name: '1 Mysore Pak', nameHindi: '1 मैसूर पाक', calories: 190, emoji: '🟫' },
    { id: '73', name: '1 Bowl Gajar Halwa', nameHindi: '1 कटोरी गाजर का हलवा', calories: 300, emoji: '🥕' },
    { id: '74', name: '2 Rasmalai', nameHindi: '2 रसमलाई', calories: 320, emoji: '🍮' },
    { id: '75', name: '1 Bowl Shrikhand', nameHindi: '1 कटोरी श्रीखंड', calories: 280, emoji: '🥣' },
    { id: '76', name: '1 Motichoor Ladoo', nameHindi: '1 मोतीचूर लड्डू', calories: 180, emoji: '🟠' },
    { id: '77', name: '1 Bowl Kheer', nameHindi: '1 कटोरी खीर', calories: 240, emoji: '🍚' },
    { id: '78', name: '1 Peda', nameHindi: '1 पेड़ा', calories: 140, emoji: '⚪' },
    { id: '79', name: '1 Kalakand', nameHindi: '1 कलाकंद', calories: 160, emoji: '🟫' },
    { id: '80', name: '1 Bowl Phirni', nameHindi: '1 कटोरी फिरनी', calories: 220, emoji: '🥣' },
    { id: '81', name: '3 Chakli', nameHindi: '3 चकली', calories: 150, emoji: '🌀' },
    { id: '82', name: '1 Bowl Namkeen', nameHindi: '1 कटोरी नमकीन', calories: 200, emoji: '🥜' },
    { id: '83', name: '4 Mathri', nameHindi: '4 मठरी', calories: 220, emoji: '🍪' },
    { id: '84', name: '1 Bowl Banana Chips', nameHindi: '1 कटोरी केला चिप्स', calories: 180, emoji: '🍌' },
    { id: '85', name: '1 Plate Fafda', nameHindi: '1 प्लेट फाफड़ा', calories: 200, emoji: '🥖' },
    { id: '86', name: '1 Bowl Bhujia Sev', nameHindi: '1 कटोरी भुजिया सेव', calories: 250, emoji: '🍜' },
    { id: '87', name: '1 Bowl Makhanas', nameHindi: '1 कटोरी मखाना', calories: 100, emoji: '🍿' },
    { id: '88', name: '1 Peanut Chikki', nameHindi: '1 मूंगफली चिक्की', calories: 120, emoji: '🍫' },
    { id: '89', name: '1 Khakhra', nameHindi: '1 खाखरा', calories: 60, emoji: '🥖' },
    { id: '90', name: '1 Bowl Chana Jor Garam', nameHindi: '1 कटोरी चना जोर गरम', calories: 150, emoji: '🥜' },
    { id: '91', name: '1 Butter Naan', nameHindi: '1 बटर नान', calories: 280, emoji: '🍞' },
    { id: '92', name: '1 Tandoori Roti', nameHindi: '1 तंदूरी रोटी', calories: 120, emoji: '🥯' },
    { id: '93', name: '1 Kulcha', nameHindi: '1 कुलचा', calories: 180, emoji: '🥖' },
    { id: '94', name: '4 Puri', nameHindi: '4 पूरी', calories: 320, emoji: '🥟' },
    { id: '95', name: '1 Bhakri', nameHindi: '1 भाकरी', calories: 160, emoji: '🍞' },
    { id: '96', name: '1 Garlic Naan', nameHindi: '1 गार्लिक नान', calories: 300, emoji: '🍞' },
    { id: '97', name: '1 Missi Roti', nameHindi: '1 मिस्सी रोटी', calories: 140, emoji: '🥯' },
    { id: '98', name: '1 Cup Masala Chai', nameHindi: '1 कप मसाला चाय', calories: 105, emoji: '☕' },
    { id: '99', name: '1 Cup Filter Coffee', nameHindi: '1 कप फिल्टर कॉफी', calories: 80, emoji: '☕' },
    { id: '100', name: '1 Glass Thandai', nameHindi: '1 गिलास ठंडाई', calories: 220, emoji: '🥛' },
    { id: '101', name: '1 Glass Aam Panna', nameHindi: '1 गिलास आम पन्ना', calories: 160, emoji: '🥭' },
    { id: '102', name: '1 Glass Jaljeera', nameHindi: '1 गिलास जलजीरा', calories: 40, emoji: '🥤' },
];

function migrate() {
    const db = new sqlite3.Database(DB_PATH);

    db.serialize(() => {
        console.log('🔄 Starting SQLite migration...');
        console.log('📊 Database:', DB_PATH);

        // Clear existing data
        db.run('DELETE FROM exercises');
        db.run('DELETE FROM foods');
        console.log('🗑️  Cleared existing data');

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

        // Insert foods
        const foodStmt = db.prepare(`
      INSERT INTO foods (id, name, nameHindi, calories, emoji, isActive, createdAt)
      VALUES (?, ?, ?, ?, ?, 1, ?)
    `);

        foods.forEach(food => {
            foodStmt.run(
                food.id,
                food.name,
                food.nameHindi,
                food.calories,
                food.emoji,
                new Date().toISOString()
            );
        });
        foodStmt.finalize();
        console.log(`✅ Inserted ${foods.length} foods`);

        console.log('🎉 Migration complete!');
        console.log('');
        console.log('Summary:');
        console.log(`  - Exercises: ${exercises.length}`);
        console.log(`  - Foods: ${foods.length}`);
        console.log(`  - Total: ${exercises.length + foods.length} items`);
        console.log(`  - Database: ${DB_PATH}`);
    });

    db.close((err) => {
        if (err) {
            console.error('❌ Error closing database:', err);
            process.exit(1);
        }
        console.log('✅ Database connection closed');
        process.exit(0);
    });
}

migrate();
