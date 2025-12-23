const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./caroliv.db', (err) => {
    if (err) {
        console.error('Database open error:', err.message);
        process.exit(1);
    }
});

db.all("SELECT id, name, category, searchTerms, pairingTags FROM foods WHERE name LIKE '%Roti%' OR name LIKE '%Kachori%'", [], (err, rows) => {
    if (err) {
        console.error('Query error:', err.message);
    } else {
        console.log(JSON.stringify(rows, null, 2));
    }
    db.close();
});
