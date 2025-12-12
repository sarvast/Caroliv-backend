#!/bin/bash

# Caroliv Backend - Complete Deployment Script
# This script will: stop server, delete old code, clone fresh, install, migrate, and start server

set -e  # Exit on any error

echo "🚀 Starting Caroliv Backend Deployment..."
echo ""

# Step 1: Stop PM2 server
echo "📛 Step 1/6: Stopping PM2 server..."
pm2 stop caroliv-backend || echo "⚠️  Server not running"
pm2 delete caroliv-backend || echo "⚠️  No server to delete"
echo "✅ Server stopped"
echo ""

# Step 2: Navigate to home and delete old backend
echo "🗑️  Step 2/6: Cleaning up old backend..."
cd ~
rm -rf Caroliv-backend
echo "✅ Old backend deleted"
echo ""

# Step 3: Clone fresh from GitHub
echo "📥 Step 3/6: Cloning fresh backend from GitHub..."
git clone https://github.com/sarvast/Caroliv-backend.git
echo "✅ Backend cloned"
echo ""

# Step 4: Install dependencies
echo "📦 Step 4/6: Installing dependencies..."
cd Caroliv-backend
npm install
echo "✅ Dependencies installed"
echo ""

# Step 5: Run migration to populate database
echo "💾 Step 5/6: Running database migration..."
node migrate.js
echo "✅ Migration complete"
echo ""

# Step 6: Start server with PM2
echo "🚀 Step 6/6: Starting server with PM2..."
pm2 start server.js --name caroliv-backend
pm2 save
echo "✅ Server started"
echo ""

# Verification
echo "🔍 Verifying deployment..."
echo ""
sleep 2

echo "📊 PM2 Status:"
pm2 list
echo ""

echo "🧪 Testing API endpoints..."
echo ""

echo "1️⃣ Testing /api/foods:"
curl -s http://localhost:3000/api/foods | jq '.count'
echo ""

echo "2️⃣ Testing /api/exercises:"
curl -s http://localhost:3000/api/exercises | jq '.count'
echo ""

echo "3️⃣ Testing /api/admin/users:"
curl -s http://localhost:3000/api/admin/users | jq '.count'
echo ""

echo "✅ Deployment complete!"
echo ""
echo "📝 Summary:"
echo "   - Backend: ~/Caroliv-backend"
echo "   - Database: ~/Caroliv-backend/caroliv.db"
echo "   - Server: http://localhost:3000"
echo "   - PM2 Status: pm2 list"
echo "   - Logs: pm2 logs caroliv-backend"
echo ""
