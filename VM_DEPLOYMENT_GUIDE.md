# 🚀 VM Deployment Guide

## Quick Deploy (One Command)

After pushing to GitHub, run this on your VM:

```bash
curl -fsSL https://raw.githubusercontent.com/sarvast/Caroliv-backend/main/deploy-vm.sh | bash
```

Or manually:

```bash
cd ~
git clone https://github.com/sarvast/Caroliv-backend.git
cd Caroliv-backend
chmod +x deploy-vm.sh
./deploy-vm.sh
```

## What the Script Does

1. ✅ Stops PM2 server (`pm2 stop caroliv-backend`)
2. ✅ Deletes old backend folder (`rm -rf ~/Caroliv-backend`)
3. ✅ Clones fresh code from GitHub
4. ✅ Installs dependencies (`npm install`)
5. ✅ Runs database migration (`node migrate.js`)
6. ✅ Starts server with PM2 (`pm2 start server.js`)
7. ✅ Verifies deployment (checks API endpoints)

## Manual Deployment Steps

If you prefer to run commands manually:

```bash
# 1. Stop server
pm2 stop caroliv-backend
pm2 delete caroliv-backend

# 2. Clean up
cd ~
rm -rf Caroliv-backend

# 3. Clone fresh
git clone https://github.com/sarvast/Caroliv-backend.git
cd Caroliv-backend

# 4. Install
npm install

# 5. Migrate database
node migrate.js

# 6. Start server
pm2 start server.js --name caroliv-backend
pm2 save
```

## Verification

After deployment, verify everything is working:

```bash
# Check PM2 status
pm2 list

# Check logs
pm2 logs caroliv-backend --lines 50

# Test API endpoints
curl http://localhost:3000/api/foods
curl http://localhost:3000/api/exercises
curl http://localhost:3000/api/admin/users
```

Expected output:
- Foods: `{"success":true,"data":[...],"count":102}`
- Exercises: `{"success":true,"data":[...],"count":28}`
- Users: `{"success":true,"data":[...],"count":0}` (or more if users registered)

## Troubleshooting

### Issue: "no such table: exercises"
**Solution**: The migration script now creates tables before inserting data. This is fixed!

### Issue: PM2 won't start
```bash
pm2 kill
pm2 start server.js --name caroliv-backend
```

### Issue: Port 3000 already in use
```bash
# Find process using port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Or change port in server.js
export PORT=3001
pm2 start server.js --name caroliv-backend
```

### Issue: Database is empty after migration
```bash
# Check if migration ran successfully
ls -lh ~/Caroliv-backend/caroliv.db

# Re-run migration
cd ~/Caroliv-backend
node migrate.js

# Restart server
pm2 restart caroliv-backend
```

## Database Location

- **Path**: `~/Caroliv-backend/caroliv.db`
- **Size**: ~100KB (with 28 exercises + 102 foods)
- **Backup**: `cp caroliv.db caroliv.db.backup`

## PM2 Commands

```bash
# List all processes
pm2 list

# View logs
pm2 logs caroliv-backend

# Restart
pm2 restart caroliv-backend

# Stop
pm2 stop caroliv-backend

# Delete
pm2 delete caroliv-backend

# Save current state
pm2 save

# Resurrect saved state on reboot
pm2 resurrect
```

## Environment Variables

Create `.env` file if needed:

```bash
PORT=3000
JWT_SECRET=caroliv-secret-key-2025
NODE_ENV=production
```

## Auto-Start on Reboot

```bash
# Setup PM2 startup script
pm2 startup

# Save current processes
pm2 save
```

## Monitoring

```bash
# Real-time monitoring
pm2 monit

# Web-based monitoring (optional)
pm2 plus
```

## Updates

To update the backend after pushing new code to GitHub:

```bash
# Option 1: Use deploy script
./deploy-vm.sh

# Option 2: Manual update
cd ~/Caroliv-backend
git pull
npm install
pm2 restart caroliv-backend
```

## Security Notes

- ✅ Database file (`caroliv.db`) is in `.gitignore`
- ✅ JWT secret should be changed in production
- ✅ Consider adding rate limiting for production
- ✅ Use HTTPS in production (nginx reverse proxy)

## Production Checklist

- [ ] Change JWT_SECRET in `.env`
- [ ] Set up nginx reverse proxy
- [ ] Enable HTTPS with Let's Encrypt
- [ ] Set up database backups
- [ ] Configure firewall (ufw)
- [ ] Set up monitoring/alerts
- [ ] Enable PM2 auto-restart on reboot

---

**Need Help?** Check logs: `pm2 logs caroliv-backend --lines 100`
