/**
 * Database Query Optimizer
 * Provides optimized query helpers
 */

import { Database } from 'sqlite3';
import { logger } from '../utils/logger';

export class QueryOptimizer {
    constructor(private db: Database) { }

    /**
     * Execute query with performance logging
     */
    async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                const duration = Date.now() - startTime;

                if (err) {
                    logger.error('Database query error', err, { sql, duration });
                    reject(err);
                    return;
                }

                if (duration > 100) {
                    logger.warn('Slow database query', { sql, duration: `${duration}ms`, rowCount: rows?.length });
                } else {
                    logger.db('Query executed', sql.split(' ')[0], duration);
                }

                resolve(rows as T[]);
            });
        });
    }

    /**
     * Execute single row query
     */
    async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                const duration = Date.now() - startTime;

                if (err) {
                    logger.error('Database query error', err, { sql, duration });
                    reject(err);
                    return;
                }

                if (duration > 100) {
                    logger.warn('Slow database query', { sql, duration: `${duration}ms` });
                }

                resolve((row as T) || null);
            });
        });
    }

    /**
     * Execute write query (INSERT, UPDATE, DELETE)
     */
    async execute(sql: string, params: any[] = []): Promise<{ changes: number; lastID?: number }> {
        const startTime = Date.now();

        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                const duration = Date.now() - startTime;

                if (err) {
                    logger.error('Database execute error', err, { sql, duration });
                    reject(err);
                    return;
                }

                if (duration > 100) {
                    logger.warn('Slow database operation', { sql, duration: `${duration}ms` });
                }

                resolve({ changes: this.changes, lastID: this.lastID });
            });
        });
    }

    /**
     * Batch insert with transaction
     */
    async batchInsert(table: string, records: any[]): Promise<number> {
        if (records.length === 0) return 0;

        const startTime = Date.now();
        const keys = Object.keys(records[0]);
        const placeholders = keys.map(() => '?').join(', ');
        const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;

        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                this.db.run('BEGIN TRANSACTION');

                let completed = 0;
                let hasError = false;

                records.forEach(record => {
                    const values = keys.map(key => record[key]);

                    this.db.run(sql, values, err => {
                        if (err && !hasError) {
                            hasError = true;
                            this.db.run('ROLLBACK');
                            logger.error('Batch insert error', err);
                            reject(err);
                            return;
                        }

                        completed++;

                        if (completed === records.length && !hasError) {
                            this.db.run('COMMIT', err => {
                                if (err) {
                                    logger.error('Transaction commit error', err);
                                    reject(err);
                                    return;
                                }

                                const duration = Date.now() - startTime;
                                logger.info(`Batch insert completed: ${records.length} records`, { duration: `${duration}ms` });
                                resolve(records.length);
                            });
                        }
                    });
                });
            });
        });
    }

    /**
     * Analyze query performance
     */
    async analyzeQuery(sql: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.db.all(`EXPLAIN QUERY PLAN ${sql}`, [], (err, rows) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(rows);
            });
        });
    }
}
