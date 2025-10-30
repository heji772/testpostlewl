# 🚀 PhishGuard - Quick Start Guide

## ⚡ 3-Minute Setup

### Step 1: Prerequisites Check ✓

```bash
# Check Docker
docker --version
docker-compose --version

# Check OpenSSL
openssl version
```

If missing:
- **Docker**: https://docs.docker.com/get-docker/
- **Docker Compose**: Included with Docker Desktop
- **OpenSSL**: Pre-installed on macOS/Linux

### Step 2: Run Setup 🎯

```bash
# Navigate to project directory
cd phishguard

# Run the complete setup wizard
bash scripts/init-complete.sh
```

The wizard will:
1. ✅ Generate SSL certificates
2. ✅ Create secure passwords
3. ✅ Build Docker containers
4. ✅ Start all services
5. ✅ Initialize database
6. ✅ Run health checks

**⏱️ Expected time: 2-3 minutes**

### Step 3: Access Your Platform 🌐

Open in browser (accept SSL warning):
- **Frontend**: https://localhost:8443
- **Admin Panel**: https://localhost:8443/admin

**Admin Credentials**: Displayed during setup (save them!)

---

## 🎓 First Time User?

### What to do after setup:

1. **Visit Frontend** (https://localhost:8443)
   - Browse sample coupons
   - Click on coupons to test the flow
   - Experience the phishing detection

2. **Login to Admin** (https://localhost:8443/admin)
   - Username: `admin`
   - Password: (shown during setup)
   - View analytics dashboard
   - Manage coupons

3. **Monitor System**
   ```bash
   # Real-time monitoring
   bash scripts/monitor.sh
   
   # Quick health check
   bash check-all.sh
   ```

---

## 🐛 Common Issues

### Issue 1: Port Already in Use

**Problem**: Port 8443, 8080, or 5432 already in use

**Solution**:
```bash
# Check what's using the port
lsof -i :8443
lsof -i :8080
lsof -i :5432

# On macOS, AirPlay uses ports 5000/7000
# Disable: System Settings > AirDrop & Handoff > AirPlay Receiver (OFF)
```

### Issue 2: SSL Certificate Warnings

**Problem**: Browser shows "Not Secure" warning

**Solution**: This is normal with self-signed certificates
- Click "Advanced" → "Proceed to localhost"
- For production, use real SSL certificates (see PRODUCTION-READY.md)

### Issue 3: Container Won't Start

**Problem**: Service fails to start

**Solution**:
```bash
# Check logs
docker-compose logs backend

# Restart specific service
docker-compose restart backend

# Full restart
docker-compose down
docker-compose up -d
```

### Issue 4: Database Connection Error

**Problem**: Backend can't connect to database

**Solution**:
```bash
# Check database is running
docker exec phishing-coupon-platform-database-1 pg_isready -U phishuser

# Restart database
docker-compose restart database

# Wait 10 seconds, then restart backend
sleep 10
docker-compose restart backend
```

---

## 🔧 Daily Operations

### Start Services
```bash
bash scripts/start.sh
# or
docker-compose up -d
```

### Stop Services
```bash
bash scripts/stop.sh
# or
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
```

### Backup Database
```bash
bash scripts/backup-enhanced.sh
```

### Check Health
```bash
bash check-all.sh
```

### Live Monitoring
```bash
bash scripts/monitor.sh
```

---

## 📚 Next Steps

### For Developers:
- Explore the code in `frontend/`, `backend/`, `admin-panel/`
- Modify Docker compose for custom configuration
- See PROJECT-STRUCTURE.txt for detailed file layout

### For Production Deployment:
- Read **PRODUCTION-READY.md** for complete checklist
- Replace self-signed SSL with real certificates
- Set up monitoring and backups
- Configure firewall and security hardening

### For Security Testing:
```bash
bash scripts/security-test.sh
```

---

## 💡 Pro Tips

1. **Save Your Credentials**: Displayed only once during setup
2. **Regular Backups**: Run `bash scripts/backup-enhanced.sh` daily
3. **Monitor Logs**: Use `bash scripts/monitor.sh` for real-time view
4. **Update Regularly**: Pull latest changes with `git pull`

---

## 🆘 Need Help?

### Resources:
- **Full README**: [README.md](README.md)
- **Production Guide**: [PRODUCTION-READY.md](PRODUCTION-READY.md)
- **Changes Log**: [CHANGELOG.md](CHANGELOG.md)

### Commands:
```bash
# System status
docker-compose ps

# Resource usage
docker stats

# Database access
docker-compose exec database psql -U phishuser -d phishguard

# Backend shell
docker-compose exec backend /bin/sh
```

---

## ✅ Verification Checklist

After setup, verify:
- [ ] All 5 containers running: `docker-compose ps`
- [ ] Frontend accessible: https://localhost:8443
- [ ] Admin panel works: https://localhost:8443/admin
- [ ] API responds: https://localhost:8443/api/health
- [ ] Database has data: `bash check-all.sh`
- [ ] No errors in logs: `docker-compose logs | grep -i error`

**All green? You're ready to go! 🎉**

---

**Last Updated**: 2024-10-29  
**Version**: 2.0
