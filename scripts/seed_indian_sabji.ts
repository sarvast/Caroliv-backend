import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

async function seedSabjis() {
    console.log('🍛 Starting Indian Sabji Seed...');

    try {
        const dbPath = path.resolve(__dirname, '../database.sqlite');
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        console.log('✅ Connected to SQLite database');

        const foods = [
            { id: 'aloo_matar_1', name: 'Aloo Matar', nameHindi: 'आलू मटर', calories: 170, protein: 4, carbs: 20, fat: 9, servingSize: '1 bowl (200g)', emoji: '🥘', category: 'Vegetables', pairingTags: 'Roti, Paratha, Rice, Jeera Rice' },
            { id: 'kaddu_sabji_1', name: 'Kaddu Ki Sabji', nameHindi: 'कद्दू की सब्जी', calories: 120, protein: 2, carbs: 18, fat: 5, servingSize: '1 bowl (200g)', emoji: '🎃', category: 'Vegetables', pairingTags: 'Poori, Paratha, Roti' },
            { id: 'matar_paneer_1', name: 'Matar Paneer', nameHindi: 'मटर पनीर', calories: 350, protein: 14, carbs: 15, fat: 25, servingSize: '1 bowl (250g)', emoji: '🧀', category: 'Protein', pairingTags: 'Naan, Roti, Rice, Pulao' },
            { id: 'malai_kofta_1', name: 'Malai Kofta', nameHindi: 'मलाई कोफ्ता', calories: 450, protein: 10, carbs: 25, fat: 35, servingSize: '1 bowl (250g)', emoji: '🍘', category: 'Sweets', pairingTags: 'Naan, Garlic Naan, Paratha' },
            { id: 'palak_paneer_1', name: 'Palak Paneer', nameHindi: 'पालक पनीर', calories: 280, protein: 18, carbs: 10, fat: 20, servingSize: '1 bowl (250g)', emoji: '🥬', category: 'Protein', pairingTags: 'Roti, Naan, Jeera Rice' },
            { id: 'dal_makhani_1', name: 'Dal Makhani', nameHindi: 'दाल मखनी', calories: 400, protein: 14, carbs: 30, fat: 25, servingSize: '1 bowl (250g)', emoji: '🥣', category: 'Protein', pairingTags: 'Naan, Rice, Roti' },
            { id: 'bhindi_masala_1', name: 'Bhindi Masala', nameHindi: 'भिंडी मसाला', calories: 140, protein: 3, carbs: 12, fat: 10, servingSize: '1 bowl (150g)', emoji: '🥒', category: 'Vegetables', pairingTags: 'Roti, Paratha' },
            { id: 'baingan_bharta_1', name: 'Baingan Bharta', nameHindi: 'बैंगन भर्ता', calories: 130, protein: 3, carbs: 14, fat: 8, servingSize: '1 bowl (200g)', emoji: '🍆', category: 'Vegetables', pairingTags: 'Roti, Bajra Roti' },
            { id: 'chana_masala_1', name: 'Chana Masala', nameHindi: 'चना मसाला', calories: 280, protein: 12, carbs: 35, fat: 10, servingSize: '1 bowl (200g)', emoji: '🥘', category: 'Protein', pairingTags: 'Bhature, Rice, Roti' },
            { id: 'rajma_masala_1', name: 'Rajma Masala', nameHindi: 'राजमा मसाला', calories: 300, protein: 14, carbs: 40, fat: 9, servingSize: '1 bowl (200g)', emoji: '🥣', category: 'Protein', pairingTags: 'Rice, Jeera Rice, Roti' },

            // Staples (Essential for pairing)
            { id: 'chapati_1', name: 'Chapati', nameHindi: 'चपाती (रोटी)', calories: 100, protein: 3, carbs: 18, fat: 3, servingSize: '1 pc', emoji: '🫓', category: 'Grains', pairingTags: 'Dal Makhani, Matar Paneer, Bhindi Masala' },
            { id: 'tandoori_roti_1', name: 'Tandoori Roti', nameHindi: 'तंदूरी रोटी', calories: 120, protein: 4, carbs: 22, fat: 2, servingSize: '1 pc', emoji: '🫓', category: 'Grains', pairingTags: 'Dal Makhani, Chicken Biryani' },
            { id: 'butter_naan_1', name: 'Butter Naan', nameHindi: 'बटर नान', calories: 260, protein: 8, carbs: 45, fat: 6, servingSize: '1 pc', emoji: '🫓', category: 'Grains', pairingTags: 'Butter Chicken, Dal Makhani, Malai Kofta' },
            { id: 'garlic_naan_1', name: 'Garlic Naan', nameHindi: 'गार्लिक नान', calories: 280, protein: 9, carbs: 48, fat: 7, servingSize: '1 pc', emoji: '🫓', category: 'Grains', pairingTags: 'Shahi Paneer, Dal Makhani' },
            { id: 'plain_rice_1', name: 'Plain Rice', nameHindi: 'सदा चावल', calories: 130, protein: 3, carbs: 28, fat: 0.5, servingSize: '1 bowl (150g)', emoji: '🍚', category: 'Grains', pairingTags: 'Dal Tadka, Rajma Masala, Kadhi' },
            { id: 'jeera_rice_1', name: 'Jeera Rice', nameHindi: 'जीरा राइस', calories: 150, protein: 3, carbs: 30, fat: 3, servingSize: '1 bowl (150g)', emoji: '🍚', category: 'Grains', pairingTags: 'Dal Fry, Chole, Rajma' },
            { id: 'boondi_raita_1', name: 'Boondi Raita', nameHindi: 'बूंदी रायता', calories: 80, protein: 3, carbs: 8, fat: 4, servingSize: '1 bowl', emoji: '🥣', category: 'Dairy', pairingTags: 'Biryani, Pulao, Paratha' },
            { id: 'green_salad_1', name: 'Green Salad', nameHindi: 'हरा सलाद', calories: 30, protein: 1, carbs: 5, fat: 0, servingSize: '1 plate', emoji: '🥗', category: 'Vegetables', pairingTags: 'Any Meal' },

            // Chai Snacks (For Smart Pairing)
            { id: 'biscuit_marie_1', name: 'Biscuit (Marie 2pcs)', nameHindi: 'बिस्किट', calories: 60, protein: 1, carbs: 10, fat: 1.5, servingSize: '2 pcs', emoji: '🍪', category: 'Snacks', pairingTags: 'Masala Chai, Filter Coffee' },
            { id: 'rusk_toast_1', name: 'Rusk / Toast', nameHindi: 'टोस्ट / रस्क', calories: 60, protein: 1.5, carbs: 10, fat: 1.5, servingSize: '1 pc', emoji: '🍞', category: 'Snacks', pairingTags: 'Masala Chai' },
            { id: 'sugar_tsp_1', name: 'Sugar (1 tsp)', nameHindi: 'चीनी', calories: 20, protein: 0, carbs: 5, fat: 0, servingSize: '1 tsp', emoji: '🧂', category: 'Other', pairingTags: 'Masala Chai, Coffee' },
            { id: 'pakora_1', name: 'Mix Veg Pakora', nameHindi: 'पकोड़ा', calories: 200, protein: 4, carbs: 15, fat: 12, servingSize: 'Plate (4pcs)', emoji: '🥟', category: 'Snacks', pairingTags: 'Masala Chai, Green Chutney' },
        ];

        for (const food of foods) {
            // Check if exists
            const existing = await db.get('SELECT id FROM foods WHERE name = ?', food.name);
            if (!existing) {
                await db.run(
                    `INSERT INTO foods (id, name, nameHindi, calories, protein, carbs, fat, servingSize, emoji, category, pairingTags, isActive, createdAt) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
                    [food.id, food.name, food.nameHindi, food.calories, food.protein, food.carbs, food.fat, food.servingSize, food.emoji, food.category, food.pairingTags, new Date().toISOString()]
                );
                console.log(`✅ Added: ${food.name}`);
            } else {
                console.log(`ℹ️ Skipped (Exists): ${food.name}`);
            }
        }

        console.log('🎉 Desi Sabji Seeding Complete!');

    } catch (error) {
        console.error('❌ Seeding Failed:', error);
    }
}

seedSabjis();
