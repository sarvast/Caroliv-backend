# 🧹 VM CLEANUP + SQLITE DEPLOYMENT

## STEP 1: Clean VM (Remove MongoDB)

```bash
# Stop and remove MongoDB
sudo systemctl stop mongod
sudo systemctl disable mongod
sudo apt remove --purge -y mongodb-org*
sudo rm -rf /var/log/mongodb
sudo rm -rf /var/lib/mongodb
sudo rm -rf /etc/mongod.conf

# Clean PM2
pm2 kill

# Remove old backend
cd ~
rm -rf Caroliv-backend

# Clear cache
sudo sync
sudo sh -c 'echo 3 > /proc/sys/vm/drop_caches'

# Check memory
free -h
```

## STEP 2: Deploy SQLite Backend

```bash
# Clone fresh code
git clone https://github.com/sarvast/Caroliv-backend.git
cd Caroliv-backend

# Install dependencies (SQLite only - lightweight!)
npm install

# Run migration
node migrate.js

# Start backend
pm2 start server.js --name caroliv-backend
pm2 save
pm2 startup

# Check status
pm2 status
pm2 logs caroliv-backend --lines 20
```

## STEP 3: Verify

```bash
# Test API
curl http://localhost:3000/
curl http://localhost:3000/api/exercises
curl http://localhost:3000/api/foods

# Check memory (should be ~40-50%)
free -h

# Check database file
ls -lh caroliv.db
```

## Expected Output:

```
✅ Connected to SQLite database
✅ Database tables initialized
✅ Caroliv Backend running on port 3000
📊 Database: SQLite (/home/ipynb/Caroliv-backend/caroliv.db)
🌐 API: http://localhost:3000/api
🔐 Auth: Enabled (JWT)
👥 Users: Enabled
💾 Memory: Zero overhead!
```

## Benefits:

✅ **No MongoDB** - No memory usage
✅ **No hanging** - Lightweight
✅ **Fast** - Direct file access
✅ **Simple** - Just one file
✅ **Persistent** - Data saved in caroliv.db

---

**Total time:** 5-10 minutes
**Memory after:** ~40-50% (from 88%)
**Status:** PRODUCTION READY! 🚀
