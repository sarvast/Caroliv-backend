import path from 'path';
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.resolve(process.cwd(), 'caroliv.db');

class Database {
    private db: any;

    constructor() {
        this.db = new sqlite3.Database(DB_PATH, (err: any) => {
            if (err) {
                console.error('❌ Could not connect to database', err);
            } else {
                console.log('✅ Connected to SQLite database');
                this.enableWalMode();
            }
        });
    }

    private enableWalMode() {
        this.db.run('PRAGMA journal_mode = WAL;', (err: any) => {
            if (err) console.error('Failed to enable WAL mode:', err);
        });
    }

    public query(sql: string, params: any[] = []): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err: any, rows: any) => {
                if (err) {
                    console.error('Query Error:', sql, err);
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    public get(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err: any, row: any) => {
                if (err) {
                    console.error('Get Error:', sql, err);
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    public run(sql: string, params: any[] = []): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (this: any, err: any) {
                if (err) {
                    console.error('Run Error:', sql, err);
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }
}

export const db = new Database();
