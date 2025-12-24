/**
 * Performance Monitoring Middleware
 * Tracks API response times and logs slow requests
 */

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

interface PerformanceMetrics {
    endpoint: string;
    method: string;
    duration: number;
    statusCode: number;
    timestamp: string;
}

const metrics: PerformanceMetrics[] = [];
const MAX_METRICS = 1000; // Keep last 1000 requests

// Slow request threshold (milliseconds)
const SLOW_REQUEST_THRESHOLD = 1000;

/**
 * Performance monitoring middleware
 */
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    // Capture original end function
    const originalEnd = res.end;

    // Override end function to measure duration
    res.end = function (this: Response, ...args: any[]) {
        const duration = Date.now() - startTime;
        const endpoint = req.path;
        const method = req.method;
        const statusCode = res.statusCode;

        // Log slow requests
        if (duration > SLOW_REQUEST_THRESHOLD) {
            logger.warn(`Slow request detected: ${method} ${endpoint}`, {
                duration: `${duration}ms`,
                statusCode
            });
        }

        // Store metrics
        const metric: PerformanceMetrics = {
            endpoint,
            method,
            duration,
            statusCode,
            timestamp: new Date().toISOString()
        };

        metrics.push(metric);

        // Keep only last MAX_METRICS
        if (metrics.length > MAX_METRICS) {
            metrics.shift();
        }

        // Log API call
        logger.api(method, endpoint, statusCode, duration);

        // Call original end
        return originalEnd.apply(this, args as [any, any, any]);
    };

    next();
};

/**
 * Get performance statistics
 */
export const getPerformanceStats = () => {
    if (metrics.length === 0) {
        return {
            totalRequests: 0,
            averageResponseTime: 0,
            slowestEndpoint: null,
            fastestEndpoint: null
        };
    }

    const totalRequests = metrics.length;
    const totalDuration = metrics.reduce((sum, m) => sum + m.duration, 0);
    const averageResponseTime = totalDuration / totalRequests;

    const sortedByDuration = [...metrics].sort((a, b) => b.duration - a.duration);
    const slowestEndpoint = sortedByDuration[0];
    const fastestEndpoint = sortedByDuration[sortedByDuration.length - 1];

    // Group by endpoint
    const endpointStats: { [key: string]: { count: number; avgDuration: number } } = {};
    metrics.forEach(m => {
        const key = `${m.method} ${m.endpoint}`;
        if (!endpointStats[key]) {
            endpointStats[key] = { count: 0, avgDuration: 0 };
        }
        endpointStats[key].count++;
        endpointStats[key].avgDuration =
            (endpointStats[key].avgDuration * (endpointStats[key].count - 1) + m.duration) /
            endpointStats[key].count;
    });

    return {
        totalRequests,
        averageResponseTime: Math.round(averageResponseTime),
        slowestEndpoint: {
            endpoint: `${slowestEndpoint.method} ${slowestEndpoint.endpoint}`,
            duration: slowestEndpoint.duration
        },
        fastestEndpoint: {
            endpoint: `${fastestEndpoint.method} ${fastestEndpoint.endpoint}`,
            duration: fastestEndpoint.duration
        },
        endpointStats
    };
};

/**
 * Clear metrics (for testing or reset)
 */
export const clearMetrics = () => {
    metrics.length = 0;
};
