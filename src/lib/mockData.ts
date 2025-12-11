// Full Mock Data imported from frontend source
export const exercises: any[] = [
    // --- CHEST ---
    {
        id: 'chest_pushups',
        name: 'Push-Ups',
        category: 'Chest',
        difficulty: 'Beginner',
        defaultSets: '3 sets to failure',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/47.gif',
        description: 'Classic bodyweight chest exercise',
        instructions: 'Keep body straight, lower until chest nearly touches floor.',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'chest_db_press_floor',
        name: 'Dumbbell Chest Press (Floor)',
        category: 'Chest',
        difficulty: 'Beginner',
        defaultSets: '3 x 12',
        gifUrl: 'https://i0.wp.com/www.strengthlog.com/wp-content/uploads/2022/09/dumbbell-floor-press.gif?fit=600%2C600&ssl=1',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'chest_db_fly_floor',
        name: 'Dumbbell Fly (Floor)',
        category: 'Chest',
        difficulty: 'Intermediate',
        defaultSets: '3 x 15',
        gifUrl: 'https://i.makeagif.com/media/10-20-2021/K9gsQd.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'chest_incline_pushup',
        name: 'Incline Push-Ups',
        category: 'Chest',
        difficulty: 'Beginner',
        defaultSets: '3 x 12',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'chest_decline_pushup',
        name: 'Decline Push-Ups',
        category: 'Chest',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- SHOULDERS ---
    {
        id: 'shoulder_db_press',
        name: 'Dumbbell Shoulder Press',
        category: 'Shoulders',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        gifUrl: 'https://barbend.com/wp-content/uploads/2023/10/seated-dumbbell-shoulder-press-barbend-movement-gif-masters-2.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'shoulder_lat_raise',
        name: 'Lateral Raises',
        category: 'Shoulders',
        difficulty: 'Beginner',
        defaultSets: '3 x 15',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/32.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'shoulder_rear_delt_raise',
        name: 'Rear Delt Raises',
        category: 'Shoulders',
        difficulty: 'Intermediate',
        defaultSets: '3 x 15',
        gifUrl: 'https://cdn.prod.website-files.com/66c501d753ae2a8c705375b6/67f015ffa54a8deb0995e0f0_67eff133ef062af3c638116a_250204_ANYTIME_FITNESS_Seated-Reverse-Lateral-Raise.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'shoulder_front_raise',
        name: 'Front Raises',
        category: 'Shoulders',
        difficulty: 'Beginner',
        defaultSets: '3 x 15',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'shoulder_shrugs',
        name: 'Dumbbell Shrugs',
        category: 'Shoulders',
        difficulty: 'Beginner',
        defaultSets: '3 x 20',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- BACK ---
    {
        id: 'back_bent_row',
        name: 'Bent-Over Dumbbell Rows',
        category: 'Back',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/88.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'back_one_arm_row',
        name: 'One-Arm Dumbbell Rows',
        category: 'Back',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        gifUrl: 'https://i.pinimg.com/originals/1c/7e/29/1c7e293b84e72ee9f7dc68c0e6ce071a.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'back_bb_row_underhand',
        name: 'Barbell Rows (Underhand)',
        category: 'Back',
        difficulty: 'Advanced',
        defaultSets: '3 x 10',
        gifUrl: 'https://hips.hearstapps.com/menshealth-uk/main/assets/row-under.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'back_superman',
        name: 'Superman',
        category: 'Back',
        difficulty: 'Beginner',
        defaultSets: '3 x 15',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'back_pullups',
        name: 'Pull-Ups',
        category: 'Back',
        difficulty: 'Advanced',
        defaultSets: '3 sets to failure',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- ARMS (Biceps/Triceps) ---
    {
        id: 'arm_bicep_curl',
        name: 'Bicep Curls (Dumbbells)',
        category: 'Arms',
        difficulty: 'Beginner',
        defaultSets: '3 x 12',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/116.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'arm_hammer_curl',
        name: 'Hammer Curls',
        category: 'Arms',
        difficulty: 'Beginner',
        defaultSets: '3 x 12',
        gifUrl: 'https://barbend.com/wp-content/uploads/2021/08/hammer-curl-barbend-movement-gif-masters.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'arm_bb_curl',
        name: 'Barbell Curls',
        category: 'Arms',
        difficulty: 'Intermediate',
        defaultSets: '3 x 10',
        gifUrl: 'https://artimg.gympik.com/articles/wp-content/uploads/2018/08/Final-Gift.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'arm_wrist_curl',
        name: 'Wrist Curls',
        category: 'Arms',
        difficulty: 'Beginner',
        defaultSets: '3 x 20',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/1093.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'arm_tricep_dip',
        name: 'Chair Dips',
        category: 'Arms',
        difficulty: 'Beginner',
        defaultSets: '3 x 15',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'arm_skullcrusher',
        name: 'Dumbbell Skullcrushers',
        category: 'Arms',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- LEGS ---
    {
        id: 'leg_goblet_squat',
        name: 'Goblet Squats',
        category: 'legs',
        difficulty: 'Beginner',
        defaultSets: '3 x 12',
        gifUrl: 'https://barbend.com/wp-content/uploads/2022/06/goblet-squat-barbend-movement-gif-masters.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'leg_lunges',
        name: 'Walking Lunges',
        category: 'legs',
        difficulty: 'Intermediate',
        defaultSets: '3 x 20 steps',
        gifUrl: 'https://www.verywellfit.com/thmb/OxaUMT6kHg2Lfvi-i-Oiq0lwOwA=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/70-4588048-LungeGIF-36593998192c4036a37cac3903b4f6bd.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'leg_rdl',
        name: 'Romanian Deadlifts',
        category: 'legs',
        difficulty: 'Advanced',
        defaultSets: '3 x 10',
        gifUrl: 'https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyMzhwaWE0YmRsMnduZnJvODZuaGxzdXlmem0yYzhiY3VyMGVyaWF1YSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/xT0xenc4lKQlhf1Ohi/giphy.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'leg_calf_raise',
        name: 'Standing Calf Raises',
        category: 'legs',
        difficulty: 'Beginner',
        defaultSets: '3 x 20',
        gifUrl: 'https://cdn.jefit.com/assets/img/exercises/gifs/142.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'leg_hip_thrust',
        name: 'Hip Thrusts',
        category: 'legs',
        difficulty: 'Intermediate',
        defaultSets: '3 x 12',
        gifUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTlbIs9A4kE4O98mBn15zAA0zElnxHmhQXQww&s',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'leg_wall_sit',
        name: 'Wall Sit',
        category: 'legs',
        difficulty: 'Beginner',
        defaultSets: '3 x 45 sec',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- CORE ---
    {
        id: 'core_plank',
        name: 'Plank',
        category: 'Core',
        difficulty: 'Beginner',
        defaultSets: '3 x 60 sec',
        gifUrl: 'https://i.pinimg.com/originals/71/39/d1/7139d152892319a5f61b64bab693c685.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'core_leg_raise',
        name: 'Leg Raises',
        category: 'Core',
        difficulty: 'Intermediate',
        defaultSets: '3 x 15',
        gifUrl: 'https://downloads.ctfassets.net/6ilvqec50fal/eUKRNPj04Tg9Lw5uF8OgF/72414354eb43c1a2b1e06f07386cc0b7/Leg_Lifts_GIF.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'core_russian_twist',
        name: 'Russian Twists',
        category: 'Core',
        difficulty: 'Beginner',
        defaultSets: '3 x 20',
        gifUrl: 'https://i.pinimg.com/originals/a1/74/53/a17453017da9630b48304348c62bee3c.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'core_crunches',
        name: 'Crunches',
        category: 'Core',
        difficulty: 'Beginner',
        defaultSets: '3 x 20',
        gifUrl: 'https://i.pinimg.com/originals/af/8f/3c/af8f3c6315440188dfe84b5f27646365.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'core_situps',
        name: 'Sit-Ups',
        category: 'Core',
        difficulty: 'Beginner',
        defaultSets: '3 x 15',
        gifUrl: 'https://d24bnpykhxwj9p.cloudfront.net/s3file/s3fs-public/users1/2017-03/Wed/v%20up.gif',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },

    // --- CARDIO ---
    {
        id: 'cardio_jumping_jacks',
        name: 'Jumping Jacks',
        category: 'Cardio',
        difficulty: 'Beginner',
        defaultSets: '60 sec',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'cardio_burpees',
        name: 'Burpees',
        category: 'Cardio',
        difficulty: 'Advanced',
        defaultSets: '3 x 10',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
    {
        id: 'cardio_high_knees',
        name: 'High Knees',
        category: 'Cardio',
        difficulty: 'Beginner',
        defaultSets: '45 sec',
        isActive: true, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
    },
];

export const foods: any[] = [
    // Breakfast
    { id: '1', name: '1 Roti/Chapati', nameHindi: '1 रोटी/चपाती', calories: 70, emoji: '🫓', searchTerms: 'roti chapati phulka', category: 'Grains', isActive: true },
    { id: '2', name: '1 Bowl Rice', nameHindi: '1 कटोरी चावल', calories: 130, emoji: '🍚', searchTerms: 'chawal rice bhat', category: 'Grains', isActive: true },
    { id: '3', name: '1 Boiled Egg', nameHindi: '1 उबला अंडा', calories: 70, emoji: '🥚', searchTerms: 'anda egg boiled', category: 'Protein', isActive: true },
    { id: '4', name: '1 Omelette', nameHindi: '1 ऑमलेट', calories: 100, emoji: '🍳', searchTerms: 'omelette anda egg', category: 'Protein', isActive: true },
    { id: '5', name: '1 Slice White Bread', nameHindi: '1 स्लाइस सफेद ब्रेड', calories: 60, emoji: '🍞', searchTerms: 'bread pav double roti', category: 'Grains', isActive: true },
    { id: '6', name: '1 Slice Brown Bread', nameHindi: '1 स्लाइस ब्राउन ब्रेड', calories: 45, emoji: '🍞', searchTerms: 'bread brown atta', category: 'Grains', isActive: true },
    { id: '7', name: '1 Potato Paratha', nameHindi: '1 आलू पराठा', calories: 230, emoji: '🥔', searchTerms: 'aloo paratha potato', category: 'Grains', isActive: true },
    { id: '8', name: '1 Plain Paratha', nameHindi: '1 प्लेन पराठा', calories: 190, emoji: '🫓', searchTerms: 'paratha plain', category: 'Grains', isActive: true },
    { id: '9', name: '1 Paneer Paratha', nameHindi: '1 पनीर पराठा', calories: 260, emoji: '🧀', searchTerms: 'paneer paratha cheese', category: 'Grains', isActive: true },
    { id: '10', name: '2 Idli with Sambar', nameHindi: '2 इडली सांबर के साथ', calories: 120, emoji: '🥘', searchTerms: 'idli sambar south indian', category: 'Grains', isActive: true },
    { id: '11', name: '1 Plain Dosa', nameHindi: '1 प्लेन डोसा', calories: 110, emoji: '🥞', searchTerms: 'dosa plain south indian', category: 'Grains', isActive: true },
    { id: '12', name: '1 Masala Dosa', nameHindi: '1 मसाला डोसा', calories: 200, emoji: '🥞', searchTerms: 'dosa masala south indian', category: 'Grains', isActive: true },
    { id: '13', name: '1 Bowl Poha', nameHindi: '1 कटोरी पोहा', calories: 180, emoji: '🍚', searchTerms: 'poha chivda flattened rice', category: 'Grains', isActive: true },
    { id: '14', name: '1 Bowl Upma', nameHindi: '1 कटोरी उपमा', calories: 200, emoji: '🥣', searchTerms: 'upma rava sooji', category: 'Grains', isActive: true },

    // Main Dishes
    { id: '15', name: '1 Bowl Lentils', nameHindi: '1 कटोरी दाल', calories: 130, emoji: '🍲', searchTerms: 'dal lentils katori', category: 'Protein', isActive: true },
    { id: '16', name: '1 Bowl Potato Curry', nameHindi: '1 कटोरी आलू सब्जी', calories: 150, emoji: '🥔', searchTerms: 'aloo sabzi potato curry katori', category: 'Vegetables', isActive: true },
    { id: '17', name: '1 Bowl Chickpeas', nameHindi: '1 कटोरी छोले', calories: 180, emoji: '🧆', searchTerms: 'chole chickpeas chana', category: 'Protein', isActive: true },
    { id: '18', name: '1 Bowl Kidney Beans', nameHindi: '1 कटोरी राजमा', calories: 200, emoji: '🫘', searchTerms: 'rajma kidney beans', category: 'Protein', isActive: true },
    { id: '19', name: '100g Chicken Curry', nameHindi: '100g चिकन करी', calories: 170, emoji: '🍗', searchTerms: 'chicken curry murgh', category: 'Protein', isActive: true },
    { id: '20', name: '1 Bowl Cottage Cheese Curry', nameHindi: '1 कटोरी पनीर सब्जी', calories: 220, emoji: '🧀', searchTerms: 'paneer sabzi cottage cheese curry katori', category: 'Protein', isActive: true },
    { id: '21', name: '1 Bowl Yogurt Curry', nameHindi: '1 कटोरी कढ़ी', calories: 140, emoji: '🥣', searchTerms: 'kadhi yogurt dahi curry katori', category: 'Dairy', isActive: true },

    // Rice & Biryani
    { id: '25', name: '1 Plate Veg Biryani', nameHindi: '1 प्लेट वेज बिरयानी', calories: 350, emoji: '🍛', searchTerms: 'veg biryani vegetable rice', category: 'Grains', isActive: true },
    { id: '26', name: '1 Plate Chicken Biryani', nameHindi: '1 प्लेट चिकन बिरयानी', calories: 450, emoji: '🍛', searchTerms: 'chicken biryani murgh rice', category: 'Grains', isActive: true },
    { id: '27', name: '1 Bowl Cumin Rice', nameHindi: '1 कटोरी जीरा राइस', calories: 180, emoji: '🍚', searchTerms: 'jeera rice cumin chawal', category: 'Grains', isActive: true },

    // Snacks
    { id: '29', name: '1 Samosa', nameHindi: '1 समोसा', calories: 150, emoji: '🥟', searchTerms: 'samosa', category: 'Snacks', isActive: true },
    { id: '30', name: '1 Kachori', nameHindi: '1 कचौरी', calories: 180, emoji: '🥟', searchTerms: 'kachori', category: 'Snacks', isActive: true },
    { id: '31', name: '1 Vada Pav', nameHindi: '1 वड़ा पाव', calories: 250, emoji: '🍔', searchTerms: 'vada pav batata', category: 'Snacks', isActive: true },
    { id: '33', name: '1 Gulab Jamun', nameHindi: '1 गुलाब जामुन', calories: 150, emoji: '🧁', searchTerms: 'gulab jamun sweet', category: 'Sweets', isActive: true },
    { id: '34', name: '1 Rasgulla', nameHindi: '1 रसगुल्ला', calories: 120, emoji: '⚪', searchTerms: 'rasgulla sweet', category: 'Sweets', isActive: true },

    // Fruits
    { id: '38', name: '1 Banana', nameHindi: '1 केला', calories: 90, emoji: '🍌', searchTerms: 'banana kela', category: 'Fruits', isActive: true },
    { id: '39', name: '1 Apple', nameHindi: '1 सेब', calories: 52, emoji: '🍎', searchTerms: 'apple seb', category: 'Fruits', isActive: true },
    { id: '40', name: '1 Orange', nameHindi: '1 संतरा', calories: 47, emoji: '🍊', searchTerms: 'orange santra', category: 'Fruits', isActive: true },
    { id: '41', name: '1 Mango', nameHindi: '1 आम', calories: 135, emoji: '🥭', searchTerms: 'mango aam', category: 'Fruits', isActive: true },
    { id: '42', name: '1 Cup Papaya', nameHindi: '1 कप पपीता', calories: 55, emoji: '🍈', searchTerms: 'papaya papita', category: 'Fruits', isActive: true },

    // Beverages/Dairy
    { id: '43', name: '200ml Tea (Sweet)', nameHindi: '200ml चाय (मीठी)', calories: 100, emoji: '☕', searchTerms: 'tea chai sweet sugar', category: 'Beverages', isActive: true },
    { id: '46', name: '200ml Milk', nameHindi: '200ml दूध', calories: 120, emoji: '🥛', searchTerms: 'milk doodh', category: 'Dairy', isActive: true },
    { id: '47', name: '1 Glass Lassi', nameHindi: '1 गिलास लस्सी', calories: 180, emoji: '🥤', searchTerms: 'lassi yogurt drink', category: 'Dairy', isActive: true },
    { id: '48', name: '1 Glass Buttermilk', nameHindi: '1 गिलास छाछ', calories: 60, emoji: '🥛', searchTerms: 'buttermilk chaas mattha', category: 'Dairy', isActive: true },
].map((f: any) => ({
    ...f,
    servingSize: f.servingSize || '1 Serving',
    protein: 0, carbs: 0, fat: 0, fiber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
}));

export const mockData = {
    exercises,
    foods,
};
