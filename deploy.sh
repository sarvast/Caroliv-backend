#!/bin/bash

# Caloriv Backend Deployment Script
# Push to GitHub and pull on VM

echo "🚀 Deploying Caloriv Backend..."

# Step 1: Push to GitHub
echo ""
echo "📤 Step 1: Pushing to GitHub..."
echo "Run these commands:"
echo ""
echo "cd caroliv-backend"
echo "git add ."
echo "git commit -m \"feat: add Sentry, migrations, feature flags, admin backend\""
echo "git push origin main"
echo ""

# Step 2: Pull on VM
echo "📥 Step 2: Pull on VM..."
echo "SSH into your VM and run:"
echo ""
echo "cd /path/to/caroliv-backend"
echo "git pull origin main"
echo "npm install"
echo "npm run migrate:up"
echo "pm2 restart caloriv-backend"
echo ""

# Step 3: Verify
echo "✅ Step 3: Verify deployment..."
echo "curl http://your-vm-ip:3000/api/health"
echo ""

echo "Done! 🎉"
