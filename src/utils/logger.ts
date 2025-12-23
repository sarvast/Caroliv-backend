/**
 * Centralized logging utility for the Caloriv backend
 * Provides structured logging with different levels
 */

export enum LogLevel {
    DEBUG = 'DEBUG',
    INFO = 'INFO',
    WARN = 'WARN',
    ERROR = 'ERROR',
}

interface LogContext {
    [key: string]: any;
}

class Logger {
    private isDevelopment = process.env.NODE_ENV !== 'production';

    private shouldLog(level: LogLevel): boolean {
        // In production, only log info, warnings and errors
        if (!this.isDevelopment) {
            return level !== LogLevel.DEBUG;
        }
        return true;
    }

    private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
        const timestamp = new Date().toISOString();
        const contextStr = context ? ` | ${JSON.stringify(context)}` : '';
        return `[${timestamp}] [${level}] ${message}${contextStr}`;
    }

    private getEmoji(level: LogLevel): string {
        switch (level) {
            case LogLevel.DEBUG: return '🔍';
            case LogLevel.INFO: return '✅';
            case LogLevel.WARN: return '⚠️';
            case LogLevel.ERROR: return '❌';
            default: return '';
        }
    }

    debug(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.DEBUG)) {
            console.log(`${this.getEmoji(LogLevel.DEBUG)} ${this.formatMessage(LogLevel.DEBUG, message, context)}`);
        }
    }

    info(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.INFO)) {
            console.info(`${this.getEmoji(LogLevel.INFO)} ${this.formatMessage(LogLevel.INFO, message, context)}`);
        }
    }

    warn(message: string, context?: LogContext): void {
        if (this.shouldLog(LogLevel.WARN)) {
            console.warn(`${this.getEmoji(LogLevel.WARN)} ${this.formatMessage(LogLevel.WARN, message, context)}`);
        }
    }

    error(message: string, error?: Error | unknown, context?: LogContext): void {
        if (this.shouldLog(LogLevel.ERROR)) {
            const errorContext = {
                ...context,
                error: error instanceof Error ? {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                } : error,
            };
            console.error(`${this.getEmoji(LogLevel.ERROR)} ${this.formatMessage(LogLevel.ERROR, message, errorContext)}`);

            // TODO: Send to error tracking service (Sentry) in production
        }
    }

    // Specialized logging methods
    api(method: string, endpoint: string, status: number, duration?: number): void {
        const emoji = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️';
        this.info(`${emoji} ${method} ${endpoint} - ${status}`, { duration: duration ? `${duration}ms` : undefined });
    }

    db(operation: string, table: string, duration?: number): void {
        this.debug(`DB ${operation} on ${table}`, { duration: duration ? `${duration}ms` : undefined });
    }

    auth(action: string, email?: string, success: boolean = true): void {
        const emoji = success ? '🔐' : '🚫';
        this.info(`${emoji} Auth: ${action}`, { email });
    }
}

export const logger = new Logger();
