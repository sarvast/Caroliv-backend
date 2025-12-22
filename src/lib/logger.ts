// Lightweight logger for 1GB VM environment
// Avoids heavy libraries like Winston/Bunyan

export enum LogLevel {
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
    DEBUG = 'DEBUG'
}

const getTimestamp = () => new Date().toISOString();

export const logger = {
    info: (message: string, meta?: any) => {
        console.log(`[${getTimestamp()}] [INFO] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    warn: (message: string, meta?: any) => {
        console.warn(`[${getTimestamp()}] [WARN] ${message}`, meta ? JSON.stringify(meta) : '');
    },
    error: (message: string, error?: any) => {
        console.error(`[${getTimestamp()}] [ERROR] ${message}`, error ? (error instanceof Error ? error.message : error) : '');
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
    },
    debug: (message: string, meta?: any) => {
        if (process.env.NODE_ENV !== 'production') {
            console.debug(`[${getTimestamp()}] [DEBUG] ${message}`, meta ? JSON.stringify(meta) : '');
        }
    }
};
