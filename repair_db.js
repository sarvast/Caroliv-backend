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

    // 1. Try to create the table if it completely doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS promotions (
        id TEXT PRIMARY KEY,
        title TEXT,
        imageUrl TEXT,
        externalLink TEXT,
        delayDays INTEGER,
        isActive INTEGER DEFAULT 1,
        createdAt TEXT
    )`, (err) => {
        if (err) console.log('Table check error (ignored):', err.message);
        else console.log('✅ Table check passed');
    });

    // 2. Explicitly try to add the column that is reported missing
    // This will fail if the column exists, which is fine.
    db.run(`ALTER TABLE promotions ADD COLUMN externalLink TEXT`, (err) => {
        if (err) {
            if (err.message.includes('duplicate column')) {
                console.log('✅ Column "externalLink" already exists.');
            } else {
                console.log('ℹ️ Alter table note:', err.message);
            }
        } else {
            console.log('✅ Fixed: Added missing "externalLink" column.');
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
