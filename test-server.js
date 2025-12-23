/**
 * Quick Server Test Script
 * Tests that all middleware is working correctly
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Color codes for terminal
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEndpoint(path, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    headers: res.headers,
                    body: body
                });
            });
        });

        req.on('error', reject);

        if (data) {
            req.write(JSON.stringify(data));
        }

        req.end();
    });
}

async function runTests() {
    log('\n🧪 Testing Caloriv Backend\n', 'blue');

    try {
        // Test 1: Health Check
        log('1. Testing Health Endpoint...', 'yellow');
        const health = await testEndpoint('/api/health');
        if (health.status === 200) {
            log('   ✅ Health check passed', 'green');
            const data = JSON.parse(health.body);
            log(`   Server uptime: ${data.uptime.toFixed(2)}s`, 'blue');
        } else {
            log('   ❌ Health check failed', 'red');
        }

        // Test 2: Security Headers
        log('\n2. Testing Security Headers...', 'yellow');
        const headers = health.headers;
        const requiredHeaders = [
            'x-content-type-options',
            'x-frame-options',
            'x-xss-protection',
            'strict-transport-security'
        ];

        let headersPassed = true;
        requiredHeaders.forEach(header => {
            if (headers[header]) {
                log(`   ✅ ${header}: ${headers[header]}`, 'green');
            } else {
                log(`   ❌ Missing header: ${header}`, 'red');
                headersPassed = false;
            }
        });

        // Test 3: Compression
        log('\n3. Testing Compression...', 'yellow');
        if (headers['content-encoding']) {
            log(`   ✅ Compression enabled: ${headers['content-encoding']}`, 'green');
        } else {
            log('   ⚠️  Compression not detected (may be disabled for small responses)', 'yellow');
        }

        // Test 4: API Endpoints
        log('\n4. Testing API Endpoints...', 'yellow');

        const foods = await testEndpoint('/api/foods');
        if (foods.status === 200) {
            const data = JSON.parse(foods.body);
            log(`   ✅ Foods endpoint: ${data.data?.length || 0} foods`, 'green');
        } else {
            log('   ❌ Foods endpoint failed', 'red');
        }

        const exercises = await testEndpoint('/api/exercises');
        if (exercises.status === 200) {
            const data = JSON.parse(exercises.body);
            log(`   ✅ Exercises endpoint: ${data.data?.length || 0} exercises`, 'green');
        } else {
            log('   ❌ Exercises endpoint failed', 'red');
        }

        // Test 5: Swagger Documentation
        log('\n5. Testing Swagger Documentation...', 'yellow');
        const swagger = await testEndpoint('/api-docs/');
        if (swagger.status === 200 || swagger.status === 301) {
            log('   ✅ Swagger UI accessible', 'green');
            log('   📚 Visit: http://localhost:3000/api-docs', 'blue');
        } else {
            log('   ❌ Swagger UI not accessible', 'red');
        }

        // Test 6: Performance Monitoring
        log('\n6. Testing Performance Monitoring...', 'yellow');
        const start = Date.now();
        await testEndpoint('/api/foods');
        const duration = Date.now() - start;
        log(`   ✅ Response time: ${duration}ms`, duration < 500 ? 'green' : 'yellow');

        log('\n✅ All tests completed!\n', 'green');
        log('Next steps:', 'blue');
        log('  1. Visit http://localhost:3000/api-docs for API documentation', 'blue');
        log('  2. Run: npm test (for automated tests)', 'blue');
        log('  3. Test with mobile app\n', 'blue');

    } catch (error) {
        log(`\n❌ Error: ${error.message}`, 'red');
        log('\nMake sure the server is running:', 'yellow');
        log('  cd caroliv-backend', 'blue');
        log('  node server.js\n', 'blue');
        process.exit(1);
    }
}

// Run tests
runTests();
