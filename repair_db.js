const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'caroliv.db');

const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
    console.log('Connected to the SQLite database.');
});

db.serialize(() => {
    console.log('Running repair...');

    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id TEXT PRIMARY KEY,
        title TEXT,
        imageUrl TEXT,
        externalLink TEXT,
        delayDays INTEGER,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT
    )`, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('✅ "promotions" table created or verified successfully.');
        }
    });
});

db.close((err) => {
    if (err) {
        console.error('Error closing database:', err.message);
    } else {
        console.log('Database connection closed.');
    }
});
