# 🚀 MONGODB INSTALLATION - UBUNTU 22.04

## Official MongoDB Installation (Correct Method)

```bash
# Import MongoDB GPG key
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | \
   sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | \
   sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify installation
sudo systemctl status mongod
mongosh --eval "db.version()"
```

## Quick One-Liner

```bash
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-7.0.gpg --dearmor && echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list && sudo apt update && sudo apt install -y mongodb-org && sudo systemctl start mongod && sudo systemctl enable mongod
```

## Verify Installation

```bash
# Check service status
sudo systemctl status mongod

# Test connection
mongosh --eval "db.version()"

# Should output: MongoDB shell version v7.0.x
```

## After Installation

```bash
# Navigate to backend
cd ~/Caroliv-backend

# Install MongoDB Node.js driver
npm install mongodb

# Run migration
node migrate.js

# Restart backend
pm2 restart caroliv-backend

# Check logs
pm2 logs caroliv-backend --lines 20
```

## Troubleshooting

### If mongod fails to start:
```bash
sudo mkdir -p /data/db
sudo chown -R mongodb:mongodb /data/db
sudo systemctl restart mongod
```

### Check MongoDB logs:
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

---

**Note:** MongoDB 7.0 is the latest stable version for Ubuntu 22.04
