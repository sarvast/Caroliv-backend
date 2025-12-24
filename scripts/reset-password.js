const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../caroliv.db');
const db = new sqlite3.Database(dbPath);

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
    console.log('Usage: node reset-password.js <email> <new_password>');
    process.exit(1);
}

const run = async () => {
    try {
        console.log(`Resetting password for: ${email}`);

        // Check if user exists
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
            if (err) {
                console.error('DB Error:', err.message);
                return;
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const now = new Date().toISOString();

            if (row) {
                // Update existing
                db.run('UPDATE users SET password = ?, updatedAt = ? WHERE email = ?', [hashedPassword, now, email], (updateErr) => {
                    if (updateErr) console.error('Update Failed:', updateErr.message);
                    else console.log('✅ Password updated successfully!');
                });
            } else {
                // Create new admin user if not exists
                console.log('User not found. Creating new admin user...');
                const id = Date.now().toString();
                db.run(
                    `INSERT INTO users (id, email, password, name, createdAt, updatedAt, role) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [id, email, hashedPassword, 'Admin User', now, now, 'admin'],
                    (insertErr) => {
                        if (insertErr) console.error('Creation Failed:', insertErr.message);
                        else console.log('✅ New Admin User created successfully!');
                    }
                );
            }
        });

    } catch (error) {
        console.error('Error:', error);
    }
};

run();
