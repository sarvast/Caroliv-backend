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

const safeAddColumn = (tableName, columnName, columnType) => {
    return new Promise((resolve) => {
        db.run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnType}`, (err) => {
            if (err) {
                if (err.message.includes('duplicate column')) {
                    console.log(`✅ Column "${columnName}" already exists in ${tableName}.`);
                } else {
                    console.log(`ℹ️ Note for "${columnName}":`, err.message);
                }
            } else {
                console.log(`✅ Fixed: Added missing "${columnName}" column to ${tableName}.`);
            }
            resolve();
        });
    });
};

db.serialize(async () => {
    console.log('Running repair...');

    // 1. Ensure table exists
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

    // 2. Add potential missing columns sequentially
    // We wrap in a promise chain or just run them because SQLite serializes operations
    // but better to be explicit with our helper function logic if we were using async/await fully.
    // Since db.serialize ensures sequence, we can just call them.

    // Fix externalLink
    db.run(`ALTER TABLE promotions ADD COLUMN externalLink TEXT`, (err) => {
        if (!err) console.log('✅ Added externalLink');
        else if (err.message.includes('duplicate')) console.log('✅ externalLink exists');
    });

    // Fix delayDays
    db.run(`ALTER TABLE promotions ADD COLUMN delayDays INTEGER DEFAULT 0`, (err) => {
        if (!err) console.log('✅ Added delayDays');
        else if (err.message.includes('duplicate')) console.log('✅ delayDays exists');
    });

});

// Wait a bit for the serialized operations to finish before closing
setTimeout(() => {
    db.close((err) => {
        if (err) console.error('Error closing database:', err.message);
        else console.log('Database connection closed.');
    });
}, 2000);
