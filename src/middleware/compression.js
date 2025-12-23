/**
 * Request Compression Middleware
 * Compresses API responses to reduce bandwidth
 */

const compression = require('compression');

/**
 * Compression configuration
 * Only compress responses larger than 1KB
 */
const compressionMiddleware = compression({
    filter: (req, res) => {
        if (req.headers['x-no-compression']) {
            return false;
        }
        return compression.filter(req, res);
    },
    threshold: 1024, // Only compress if response > 1KB
    level: 6 // Compression level (0-9, 6 is default)
});

module.exports = compressionMiddleware;
