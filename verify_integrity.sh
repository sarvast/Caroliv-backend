#!/bin/bash
echo "🔍 Checking VM Deployment Integrity..."

# Check server.ts for api/config/app-version AND currentWeight fix AND admin endpoints
if grep -q "api/config/app-version" src/server.ts && grep -q "currentWeight" src/server.ts && grep -q "api/admin/config" src/server.ts; then
    echo "✅ server.ts: App Version & Profile Fix & Admin API FOUND"
else
    echo "❌ server.ts: Code outdated (Missing Admin/Profile Updates)"
fi

# Check migrate.js for user_measurements
if grep -q "user_measurements" migrate.js; then
    echo "✅ migrate.js: Measurements Table FOUND"
else
    echo "❌ migrate.js: Measurements Table MISSING (Old Code!)"
fi

echo "-----------------------------------"
if grep -q "api/config/app-version" src/server.ts && grep -q "user_measurements" migrate.js; then
    echo "🚀 Code is up to date. Rebuilding..."
    npm run build
    pm2 reload caroliv-backend
    echo "✅ Build & Reload Triggered."
else
    echo "⚠️ Code is OUTDATED. Pulling now..."
    git pull origin main
    echo "🔄 Now type: ./verify_integrity.sh again to build."
fi
