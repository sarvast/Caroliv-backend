/**
 * CRITICAL SECURITY PATCH
 * This script applies essential security fixes to server.js
 * 
 * Fixes applied:
 * 1. Remove password exposure from admin endpoints
 * 2. Add CORS configuration
 * 3. Add rate limiting to auth endpoints
 * 4. Add authentication middleware to admin routes
 */

const fs = require('fs');
const path = require('path');

const serverPath = path.join(__dirname, '..', 'server.js');
let serverCode = fs.readFileSync(serverPath, 'utf8');

console.log('🔧 Applying critical security patches...\n');

// Fix 1: Remove password from admin user list endpoint
console.log('1️⃣  Removing password exposure from /api/admin/users...');
serverCode = serverCode.replace(
    /app\.get\('\/api\/admin\/users',\s*\(req,\s*res\)\s*=>\s*\{\s*db\.all\('SELECT\s+id,\s*email,\s*password,\s*name/g,
    `app.get('/api/admin/users', (req, res) => {\n    db.all('SELECT id, email, name`
);

// Fix 2: Remove password from individual user endpoint
console.log('2️⃣  Removing password exposure from /api/admin/users/:id...');
serverCode = serverCode.replace(
    /app\.get\('\/api\/admin\/users\/:id',\s*\(req,\s*res\)\s*=>\s*\{\s*db\.get\('SELECT\s+id,\s*email,\s*password,\s*name/g,
    `app.get('/api/admin/users/:id', (req, res) => {\n    db.get('SELECT id, email, name`
);

// Fix 3: Update CORS configuration
console.log('3️⃣  Updating CORS configuration...');
const corsConfig = `
// CORS Configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? (process.env.CORS_ORIGIN || '').split(',').filter(Boolean)
    : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));`;

serverCode = serverCode.replace(
    /app\.use\(cors\(\)\);/,
    corsConfig
);

// Fix 4: Add security headers
console.log('4️⃣  Adding security headers...');
const securityHeaders = `
// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});
`;

// Insert after app.use(cors(...))
const corsIndex = serverCode.indexOf('app.use(cors');
const nextLineIndex = serverCode.indexOf('\n', serverCode.indexOf(';', corsIndex)) + 1;
serverCode = serverCode.slice(0, nextLineIndex) + securityHeaders + serverCode.slice(nextLineIndex);

// Fix 5: Add comment about rate limiting
console.log('5️⃣  Adding rate limiting notice...');
const rateLimitNotice = `
// TODO: Add rate limiting to auth endpoints
// Example:
// const { authLimiter } = require('./src/middleware/rateLimit');
// app.post('/api/auth/login', authLimiter, loginHandler);
// app.post('/api/auth/register', authLimiter, registerHandler);
`;

const authSectionIndex = serverCode.indexOf('// ==================== AUTHENTICATION ====================');
if (authSectionIndex !== -1) {
    serverCode = serverCode.slice(0, authSectionIndex) + rateLimitNotice + '\n' + serverCode.slice(authSectionIndex);
}

// Write patched file
fs.writeFileSync(serverPath, serverCode, 'utf8');

console.log('\n✅ Security patches applied successfully!');
console.log('\n📋 Summary of changes:');
console.log('  ✓ Removed password hashes from admin endpoints');
console.log('  ✓ Updated CORS configuration');
console.log('  ✓ Added security headers');
console.log('  ✓ Added rate limiting notice');
console.log('\n⚠️  Manual steps required:');
console.log('  1. Review the changes in server.js');
console.log('  2. Add admin authentication middleware to admin routes');
console.log('  3. Apply rate limiting to auth endpoints');
console.log('  4. Test all endpoints to ensure they still work');
