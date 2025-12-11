# ✅ VM DEPLOYMENT CHECKLIST

**VM IP:** 20.197.14.33  
**User:** ipynb  
**Backend Path:** ~/Caroliv-backend

---

## 📋 TASK LIST

### ✅ COMPLETED TASKS
- [x] MongoDB 7.0 installed
- [x] MongoDB service running
- [x] Node.js 20.x installed
- [x] PM2 installed globally
- [x] Git repository cloned

### 🔄 PENDING TASKS

#### **Task 1: Pull Latest Code from GitHub**
```bash
cd ~/Caroliv-backend
git pull origin main
```

#### **Task 2: Install Dependencies**
```bash
npm install
```

**Required packages:**
- express
- cors
- dotenv
- mongodb
- bcryptjs
- jsonwebtoken

#### **Task 3: Run Migration (Populate Database)**
```bash
node migrate.js
```

**Expected output:**
```
🔄 Starting migration...
✅ Inserted 28 exercises
✅ Inserted 3 foods
🎉 Migration complete!
```

#### **Task 4: Restart Backend with PM2**
```bash
# Stop old process
pm2 delete caroliv-backend

# Start new process
pm2 start server.js --name caroliv-backend

# Save PM2 config
pm2 save

# Enable startup
pm2 startup
```

#### **Task 5: Verify Backend is Running**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs caroliv-backend --lines 30

# Test API
curl http://localhost:3000/
curl http://localhost:3000/api/exercises
```

**Expected response:**
```json
{
  "message": "Caroliv Backend API",
  "version": "2.0.0",
  "database": "MongoDB",
  "status": "running",
  "features": ["Auth", "Exercises", "Foods", "Users"]
}
```

---

## 🔍 VERIFICATION CHECKLIST

- [ ] MongoDB running: `sudo systemctl status mongod`
- [ ] Backend running: `pm2 status`
- [ ] Exercises API working: `curl http://localhost:3000/api/exercises`
- [ ] Foods API working: `curl http://localhost:3000/api/foods`
- [ ] Auth endpoints available: `curl http://localhost:3000/`

---

## 🐛 TROUBLESHOOTING

### MongoDB not running
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Backend crashes
```bash
pm2 logs caroliv-backend --lines 50
pm2 restart caroliv-backend
```

### Dependencies missing
```bash
cd ~/Caroliv-backend
npm install
pm2 restart caroliv-backend
```

### Port 3000 already in use
```bash
pm2 delete caroliv-backend
pm2 start server.js --name caroliv-backend
```

---

## 📊 CURRENT STATUS

**Last Updated:** December 11, 2025, 8:05 PM IST

**Completed:**
- ✅ MongoDB installed
- ✅ Backend code ready (local)
- ✅ Migration script ready
- ✅ Auth system implemented

**Next Steps:**
1. Push code to GitHub
2. Pull on VM
3. Install dependencies
4. Run migration
5. Restart backend
6. Test all endpoints

---

## 🚀 QUICK DEPLOYMENT (Copy-Paste)

```bash
# Complete deployment in one go
cd ~/Caroliv-backend && \
git pull origin main && \
npm install && \
node migrate.js && \
pm2 delete caroliv-backend ; pm2 start server.js --name caroliv-backend && \
pm2 save && \
pm2 logs caroliv-backend --lines 20
```

---

**Status:** Ready for deployment! 🎯
