# 🛡️ PhishGuard - Phishing Awareness Platform

**Production-ready phishing education platform with complete security features**

## ✨ Features

- 🎯 **Interactive Phishing Detection Training**
- 📊 **Real-time Analytics Dashboard**
- 🔐 **Secure Admin Panel** with 2FA support
- 🛡️ **Enterprise-grade Security** (Rate limiting, CSP, HSTS)
- 📦 **Automated Backups** with encryption
- 📈 **Live Monitoring Dashboard**
- 🐋 **Docker-based** deployment
- 🔒 **HTTPS/SSL** by default

## 🚀 Quick Start (5 minutes)

### Prerequisites

- Docker & Docker Compose
- OpenSSL (for SSL certificates)
- macOS/Linux/WSL

### Installation

```bash
# 1. Clone repository
git clone https://github.com/yourusername/phishguard.git
cd phishguard

# 2. Run complete setup (handles everything automatically)
bash scripts/init-complete.sh

# 3. Access the platform
# Frontend: https://localhost:8443
# Admin: https://localhost:8443/admin
```

That's it! The setup script will:
- ✅ Generate SSL certificates
- ✅ Create secure credentials
- ✅ Build Docker containers
- ✅ Initialize database
- ✅ Add sample data (optional)
- ✅ Run health checks

## 📖 Detailed Setup

### Manual Setup (if preferred)

```bash
# 1. Generate SSL certificates
bash scripts/generate-ssl.sh

# 2. Create environment file
cp .env.example .env
# Edit .env and replace every placeholder with secure values

# 3. Build and start containers
docker-compose build
docker-compose up -d

# 4. Verify installation
bash check-all.sh
```

### Configure environment variables

1. Open `.env` in your editor and change **every** placeholder before running Docker.
2. Keep `DB_PASSWORD` in sync with the password inside `DATABASE_URL`.
3. Generate secrets for the secure values:

   ```bash
   # 64 hex characters → ENCRYPTION_KEY
   openssl rand -hex 32

   # Strong base64 string → JWT_SECRET
   openssl rand -base64 32

   # Bcrypt hash of your ADMIN_PASSWORD → ADMIN_PASSWORD_HASH
   docker run --rm node:18-alpine \
     node -e "console.log(require('bcrypt').hashSync(process.argv[1], 12))" "YourPasswordHere"
   ```

4. Optional: Set `ADMIN_TOTP_SECRET` if you want to pre-provision 2FA (otherwise it will be generated on first login).

> **Required keys in `.env`:** `DATABASE_URL`, `DB_PASSWORD`, `ADMIN_USERNAME`,
> `ADMIN_PASSWORD`, `ADMIN_PASSWORD_HASH`, `ENCRYPTION_KEY`, `JWT_SECRET`, and
> (optionally) `SUBNET`, `REFRESH_TOKEN_TTL_DAYS`, `ADMIN_TOTP_SECRET`.

## 🔧 Available Scripts

### Essential Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| init-complete.sh | Complete setup wizard | bash scripts/init-complete.sh |
| check-all.sh | Health check | bash check-all.sh |
| monitor.sh | Live monitoring dashboard | bash scripts/monitor.sh |
| backup-enhanced.sh | Create encrypted backup | bash scripts/backup-enhanced.sh |
| start.sh | Start services | bash scripts/start.sh |
| stop.sh | Stop services | bash scripts/stop.sh |

### Monitoring & Management

```bash
# Live monitoring dashboard (real-time stats)
bash scripts/monitor.sh

# Check system health
bash check-all.sh

# View logs
docker-compose logs -f

# Backup database
bash scripts/backup-enhanced.sh
```

## 🌐 Access Points

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | https://localhost:8443 | Main user interface |
| Admin Panel | https://localhost:8443/admin | Admin dashboard |
| API | https://localhost:8443/api | Backend API |
| Health Check | https://localhost:8443/api/health | API status |

## 🔐 Default Credentials

```
Username: admin
Password: [Generated during setup]
```

**⚠️ Important**: Credentials are displayed during setup. Store them securely!

## 📊 Monitoring

### Live Dashboard

```bash
bash scripts/monitor.sh
```

Displays:
- Container status and health
- CPU and memory usage
- Database statistics
- API response times
- Recent log entries
- System resources

### Health Check

```bash
bash check-all.sh
```

Verifies:
- All containers running
- Backend health
- API accessibility
- Database tables
- Error counts

## 💾 Backup & Restore

### Create Backup

```bash
# With encryption
bash scripts/backup-enhanced.sh

# Backups stored in: backups/
```

### Restore from Backup

```bash
# 1. Stop services
docker-compose down

# 2. Restore database
cat backups/phishguard_backup_YYYYMMDD_database.dump | \
  docker exec -i phishing-coupon-platform-database-1 \
  pg_restore -U phishuser -d phishguard --clean

# 3. Restore config
tar -xzf backups/phishguard_backup_YYYYMMDD_config.tar.gz

# 4. Restart
docker-compose up -d
```

## 🔒 Security Features

### Already Implemented

- ✅ **HTTPS/TLS encryption** (self-signed, production needs real certs)
- ✅ **Rate limiting** (10 req/s API, 5 req/s admin)
- ✅ **Security headers** (CSP, HSTS, XSS protection)
- ✅ **SQL injection prevention**
- ✅ **XSS protection**
- ✅ **CSRF protection**
- ✅ **2FA/TOTP support** (backend ready)
- ✅ **Encrypted backups**
- ✅ **Session management**

### Production Checklist

See [PRODUCTION-READY.md](PRODUCTION-READY.md) for complete security hardening checklist.

## 🐛 Troubleshooting

### Port Conflicts (macOS)

```bash
# AirPlay uses ports 5000/7000
# Solution: Disable in System Settings
System Settings > General > AirDrop & Handoff > AirPlay Receiver (OFF)
```

### Service Won't Start

```bash
# Check status
docker-compose ps

# View logs
docker-compose logs service-name

# Restart service
docker-compose restart service-name
```

## 📚 Documentation

- [Production Deployment Guide](PRODUCTION-READY.md)
- [Architecture Overview](PROJECT-STRUCTURE.txt)
- [Original README](README.old)

## 🆘 Support

- 📧 Issues: [GitHub Issues](https://github.com/yourusername/phishguard/issues)

---

**Made with ❤️ for a safer internet**
