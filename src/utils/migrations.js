/**
 * Database Migration System
 * Handles database schema changes with version control
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

class MigrationManager {
    constructor(db) {
        this.db = db;
        this.migrationsDir = path.join(__dirname, '../migrations');
        this.initMigrationsTable();
    }

    /**
     * Initialize migrations tracking table
     */
    initMigrationsTable() {
        this.db.run(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        executed_at TEXT NOT NULL
      )
    `);
    }

    /**
     * Get list of executed migrations
     */
    async getExecutedMigrations() {
        return new Promise((resolve, reject) => {
            this.db.all('SELECT name FROM migrations ORDER BY id', [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows.map(r => r.name));
            });
        });
    }

    /**
     * Get list of pending migrations
     */
    async getPendingMigrations() {
        const executed = await this.getExecutedMigrations();

        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
            return [];
        }

        const allMigrations = fs.readdirSync(this.migrationsDir)
            .filter(f => f.endsWith('.js'))
            .sort();

        return allMigrations.filter(m => !executed.includes(m));
    }

    /**
     * Execute a single migration
     */
    async executeMigration(filename) {
        const migrationPath = path.join(this.migrationsDir, filename);
        const migration = require(migrationPath);

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                try {
                    // Execute migration
                    migration.up(this.db);

                    // Record migration
                    this.db.run(
                        'INSERT INTO migrations (name, executed_at) VALUES (?, ?)',
                        [filename, new Date().toISOString()],
                        (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                            } else {
                                this.db.run('COMMIT', (err) => {
                                    if (err) reject(err);
                                    else {
                                        console.log(`✅ Migration executed: ${filename}`);
                                        resolve();
                                    }
                                });
                            }
                        }
                    );
                } catch (error) {
                    this.db.run('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    /**
     * Run all pending migrations
     */
    async runPendingMigrations() {
        const pending = await this.getPendingMigrations();

        if (pending.length === 0) {
            console.log('✅ No pending migrations');
            return;
        }

        console.log(`📦 Running ${pending.length} migration(s)...`);

        for (const migration of pending) {
            await this.executeMigration(migration);
        }

        console.log('✅ All migrations completed');
    }

    /**
     * Rollback last migration
     */
    async rollbackLastMigration() {
        const executed = await this.getExecutedMigrations();

        if (executed.length === 0) {
            console.log('⚠️  No migrations to rollback');
            return;
        }

        const lastMigration = executed[executed.length - 1];
        const migrationPath = path.join(this.migrationsDir, lastMigration);
        const migration = require(migrationPath);

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                try {
                    // Execute rollback
                    if (migration.down) {
                        migration.down(this.db);
                    }

                    // Remove migration record
                    this.db.run(
                        'DELETE FROM migrations WHERE name = ?',
                        [lastMigration],
                        (err) => {
                            if (err) {
                                this.db.run('ROLLBACK');
                                reject(err);
                            } else {
                                this.db.run('COMMIT', (err) => {
                                    if (err) reject(err);
                                    else {
                                        console.log(`✅ Migration rolled back: ${lastMigration}`);
                                        resolve();
                                    }
                                });
                            }
                        }
                    );
                } catch (error) {
                    this.db.run('ROLLBACK');
                    reject(error);
                }
            });
        });
    }

    /**
     * Create new migration file
     */
    createMigration(name) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const filename = `${timestamp}_${name}.js`;
        const filepath = path.join(this.migrationsDir, filename);

        const template = `/**
 * Migration: ${name}
 * Created: ${new Date().toISOString()}
 */

module.exports = {
  up: (db) => {
    // Add your migration code here
    // Example:
    // db.run(\`ALTER TABLE users ADD COLUMN new_field TEXT\`);
  },

  down: (db) => {
    // Add your rollback code here
    // Example:
    // db.run(\`ALTER TABLE users DROP COLUMN new_field\`);
  }
};
`;

        if (!fs.existsSync(this.migrationsDir)) {
            fs.mkdirSync(this.migrationsDir, { recursive: true });
        }

        fs.writeFileSync(filepath, template);
        console.log(`✅ Migration created: ${filename}`);
        return filename;
    }
}

module.exports = MigrationManager;
