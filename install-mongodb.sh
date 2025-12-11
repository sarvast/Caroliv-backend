#!/bin/bash
# MongoDB Installation Script for Ubuntu 22.04

echo "🔧 Installing MongoDB..."

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb

# Start MongoDB service
sudo systemctl start mongodb

# Enable MongoDB to start on boot
sudo systemctl enable mongodb

# Check status
sudo systemctl status mongodb --no-pager

# Test connection
mongo --eval "db.version()"

echo "✅ MongoDB installed successfully!"
