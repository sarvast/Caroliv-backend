const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = 'caroliv';

let db;
let exercisesCollection;
let foodsCollection;

// Connect to MongoDB
async function connectDB() {
    try {
        const client = await MongoClient.connect(MONGO_URL);
        db = client.db(DB_NAME);
        exercisesCollection = db.collection('exercises');
        foodsCollection = db.collection('foods');
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({
        message: 'Caroliv Backend API',
        version: '2.0.0',
        database: 'MongoDB',
        status: 'running'
    });
});

// ==================== EXERCISES ====================

// Get all exercises
app.get('/api/exercises', async (req, res) => {
    try {
        const exercises = await exercisesCollection
            .find({ isActive: { $ne: false } })
            .toArray();
        res.json({ success: true, data: exercises, count: exercises.length });
    } catch (error) {
        console.error('Error fetching exercises:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Get single exercise
app.get('/api/exercises/:id', async (req, res) => {
    try {
        const exercise = await exercisesCollection.findOne({ id: req.params.id });
        if (!exercise) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }
        res.json({ success: true, data: exercise });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create exercise (Admin)
app.post('/api/admin/exercises', async (req, res) => {
    try {
        const newExercise = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            isActive: req.body.isActive !== false,
            createdAt: new Date().toISOString(),
        };

        await exercisesCollection.insertOne(newExercise);
        console.log('✅ Exercise created:', newExercise.name);
        res.json({ success: true, data: newExercise });
    } catch (error) {
        console.error('Error creating exercise:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update exercise (Admin)
app.put('/api/admin/exercises/:id', async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        updateData.updatedAt = new Date().toISOString();

        const result = await exercisesCollection.updateOne(
            { id: req.params.id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }

        console.log('✅ Exercise updated:', req.params.id);
        res.json({ success: true, data: { id: req.params.id, ...updateData } });
    } catch (error) {
        console.error('Error updating exercise:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete exercise (Admin)
app.delete('/api/admin/exercises/:id', async (req, res) => {
    try {
        const result = await exercisesCollection.deleteOne({ id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Exercise not found' });
        }

        console.log('✅ Exercise deleted:', req.params.id);
        res.json({ success: true, message: 'Exercise deleted' });
    } catch (error) {
        console.error('Error deleting exercise:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// ==================== FOODS ====================

// Get all foods
app.get('/api/foods', async (req, res) => {
    try {
        const foods = await foodsCollection
            .find({ isActive: { $ne: false } })
            .toArray();
        res.json({ success: true, data: foods, count: foods.length });
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Create food (Admin)
app.post('/api/admin/foods', async (req, res) => {
    try {
        const newFood = {
            ...req.body,
            id: req.body.id || Date.now().toString(),
            isActive: req.body.isActive !== false,
            createdAt: new Date().toISOString(),
        };

        await foodsCollection.insertOne(newFood);
        console.log('✅ Food created:', newFood.name);
        res.json({ success: true, data: newFood });
    } catch (error) {
        console.error('Error creating food:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Update food (Admin)
app.put('/api/admin/foods/:id', async (req, res) => {
    try {
        const { id, ...updateData } = req.body;
        updateData.updatedAt = new Date().toISOString();

        const result = await foodsCollection.updateOne(
            { id: req.params.id },
            { $set: updateData }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }

        console.log('✅ Food updated:', req.params.id);
        res.json({ success: true, data: { id: req.params.id, ...updateData } });
    } catch (error) {
        console.error('Error updating food:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Delete food (Admin)
app.delete('/api/admin/foods/:id', async (req, res) => {
    try {
        const result = await foodsCollection.deleteOne({ id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ success: false, error: 'Food not found' });
        }

        console.log('✅ Food deleted:', req.params.id);
        res.json({ success: true, message: 'Food deleted' });
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// Start server
async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`✅ Caroliv Backend running on port ${PORT}`);
        console.log(`📊 Database: MongoDB (${DB_NAME})`);
        console.log(`🌐 API: http://localhost:${PORT}/api`);
    });
}

startServer();
