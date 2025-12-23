#!/usr/bin/env node

/**
 * Migration CLI Tool
 * Usage:
 *   node scripts/migrate.js up          - Run pending migrations
 *   node scripts/migrate.js down        - Rollback last migration
 *   node scripts/migrate.js create NAME - Create new migration
 *   node scripts/migrate.js status      - Show migration status
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const MigrationManager = require('../src/utils/migrations');

const DB_PATH = path.join(__dirname, '../caroliv.db');
const db = new sqlite3.Database(DB_PATH);

const migrationManager = new MigrationManager(db);

const command = process.argv[2];
const arg = process.argv[3];

async function main() {
    try {
        switch (command) {
            case 'up':
                await migrationManager.runPendingMigrations();
                break;

            case 'down':
                await migrationManager.rollbackLastMigration();
                break;

            case 'create':
                if (!arg) {
                    console.error('❌ Please provide a migration name');
                    console.log('Usage: node scripts/migrate.js create <name>');
                    process.exit(1);
                }
                migrationManager.createMigration(arg);
                break;

            case 'status':
                const executed = await migrationManager.getExecutedMigrations();
                const pending = await migrationManager.getPendingMigrations();

                console.log('\n📊 Migration Status:\n');
                console.log(`Executed: ${executed.length}`);
                executed.forEach(m => console.log(`  ✅ ${m}`));

                console.log(`\nPending: ${pending.length}`);
                pending.forEach(m => console.log(`  ⏳ ${m}`));
                console.log('');
                break;

            default:
                console.log('Usage:');
                console.log('  node scripts/migrate.js up          - Run pending migrations');
                console.log('  node scripts/migrate.js down        - Rollback last migration');
                console.log('  node scripts/migrate.js create NAME - Create new migration');
                console.log('  node scripts/migrate.js status      - Show migration status');
                process.exit(1);
        }

        db.close();
    } catch (error) {
        console.error('❌ Migration error:', error);
        db.close();
        process.exit(1);
    }
}

main();
