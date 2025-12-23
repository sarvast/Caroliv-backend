/**
 * Sentry Configuration for Backend
 * Error tracking and performance monitoring
 */

const Sentry = require('@sentry/node');
const { ProfilingIntegration } = require('@sentry/profiling-node');

const SENTRY_DSN = process.env.SENTRY_DSN || '';

const initSentry = (app) => {
    if (!SENTRY_DSN) {
        console.warn('⚠️  Sentry DSN not configured. Error tracking disabled.');
        return;
    }

    Sentry.init({
        dsn: SENTRY_DSN,

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Set sampling rate for profiling
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Environment
        environment: process.env.NODE_ENV || 'development',

        // Release version
        release: 'caloriv-backend@3.2.0',

        // Integrations
        integrations: [
            // Enable HTTP calls tracing
            new Sentry.Integrations.Http({ tracing: true }),
            // Enable Express.js middleware tracing
            new Sentry.Integrations.Express({ app }),
            // Enable profiling
            new ProfilingIntegration(),
        ],

        // Ignore specific errors
        ignoreErrors: [
            'ECONNREFUSED',
            'ENOTFOUND',
            'ETIMEDOUT',
        ],

        // Before send hook
        beforeSend(event, hint) {
            // Don't send events in development
            if (process.env.NODE_ENV !== 'production') {
                console.log('Sentry event (dev):', event);
                return null;
            }

            // Filter sensitive data
            if (event.request) {
                delete event.request.cookies;
                if (event.request.headers) {
                    delete event.request.headers.authorization;
                    delete event.request.headers.cookie;
                }
            }

            return event;
        },
    });

    console.log('✅ Sentry initialized');
};

// Request handler - must be the first middleware
const sentryRequestHandler = () => {
    if (!SENTRY_DSN) return (req, res, next) => next();
    return Sentry.Handlers.requestHandler();
};

// Tracing handler
const sentryTracingHandler = () => {
    if (!SENTRY_DSN) return (req, res, next) => next();
    return Sentry.Handlers.tracingHandler();
};

// Error handler - must be after all controllers
const sentryErrorHandler = () => {
    if (!SENTRY_DSN) return (err, req, res, next) => next(err);
    return Sentry.Handlers.errorHandler();
};

// Capture exception helper
const captureException = (error, context) => {
    if (context) {
        Sentry.setContext('additional', context);
    }
    Sentry.captureException(error);
};

// Capture message helper
const captureMessage = (message, level = 'info') => {
    Sentry.captureMessage(message, level);
};

module.exports = {
    initSentry,
    sentryRequestHandler,
    sentryTracingHandler,
    sentryErrorHandler,
    captureException,
    captureMessage,
    Sentry,
};
