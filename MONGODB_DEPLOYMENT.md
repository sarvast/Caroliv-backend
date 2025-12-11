# 🚀 CAROLIV MONGODB DEPLOYMENT GUIDE

## STEP 1: Install MongoDB on VM

```bash
# SSH to VM
ssh ipynb@20.197.14.33

# Install MongoDB
sudo apt update
sudo apt install -y mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# Verify installation
sudo systemctl status mongodb
mongo --eval "db.version()"
```

## STEP 2: Update Backend Code

```bash
# Navigate to backend
cd ~/Caroliv-backend

# Pull latest code
git pull origin main

# Install MongoDB driver
npm install mongodb

# Update .env file
nano .env
```

Add to `.env`:
```
MONGO_URL=mongodb://localhost:27017
PORT=3000
```

## STEP 3: Migrate Data

```bash
# Run migration script
node migrate.js

# Expected output:
# 🔄 Starting migration...
# ✅ Inserted 28 exercises
# ✅ Inserted 3 foods
# 🎉 Migration complete!
```

## STEP 4: Restart Backend

```bash
# Stop old PM2 process
pm2 delete caroliv-backend

# Start new backend with MongoDB
pm2 start server.js --name caroliv-backend

# Save PM2 config
pm2 save

# Check logs
pm2 logs caroliv-backend --lines 20
```

Expected logs:
```
✅ Connected to MongoDB
✅ Caroliv Backend running on port 3000
📊 Database: MongoDB (caroliv)
🌐 API: http://localhost:3000/api
```

## STEP 5: Test API

```bash
# Test exercises endpoint
curl http://localhost:3000/api/exercises

# Test foods endpoint
curl http://localhost:3000/api/foods

# Test health check
curl http://localhost:3000/
```

## STEP 6: Test from Admin Panel

1. Open admin panel: `http://localhost:3000/admin/exercises`
2. Click "Add Exercise"
3. Fill form and save
4. Verify it appears in list

## STEP 7: Test from Mobile App

1. Open mobile app
2. Go to Exercise Vault
3. Pull to refresh
4. Verify new exercise appears

## Troubleshooting

### MongoDB not starting
```bash
sudo systemctl restart mongodb
sudo systemctl status mongodb
```

### Backend connection error
```bash
# Check MongoDB is running
mongo --eval "db.stats()"

# Check backend logs
pm2 logs caroliv-backend
```

### Data not showing
```bash
# Verify data in MongoDB
mongo caroliv --eval "db.exercises.count()"
mongo caroliv --eval "db.foods.count()"
```

## Success Criteria

✅ MongoDB running on VM
✅ Backend connected to MongoDB
✅ 28 exercises in database
✅ 3 foods in database
✅ Admin panel can CRUD
✅ Mobile app fetches data
✅ Real-time sync working

---

**Total Setup Time: 15-20 minutes**
**Status: Production Ready! 🚀**
