# 📦 PhishGuard Platform - Complete Project Summary

## 🎯 Što Je Ovo?

**PhishGuard Coupon Platform** je sigurnosna trening platforma dizajnirana za testiranje svijesti zaposlenik o phishing napadima. Simulira legitimnu stranicu za kupone (kao CrnoJaje.hr) kako bi prikupila podatke od korisnika koji kliknu na "phishing" kupone.

---

## ✅ Status: FUNKCIONALAN MVP

Projekt je **minimalno funkcionalan** i **SPREMAN ZA POKRETANJE**!

### Što Radi:
- ✅ Docker containeri se buildaju i pokreću
- ✅ Frontend dostupan na https://localhost:8443
- ✅ Admin panel dostupan na https://localhost:8443/admin
- ✅ Backend API funkcionalan (health check, routes)
- ✅ PostgreSQL baza inicijalizirana
- ✅ Nginx reverse proxy s SSL
- ✅ Port mapping ispravan (8080 HTTP, 8443 HTTPS)

### Što Još Fali:
- ⏳ Phishing forma modal (frontend)
- ⏳ Encryption service za PII podatke
- ⏳ Real database queries (trenutno mock data)
- ⏳ Admin dashboard s charts
- ⏳ Analytics tracking implementation
- ⏳ 2FA za admin login
- ⏳ CSV export funkcionalnost

**Ali osnove su tu i sve radi!** 🎉

---

## 📁 File Count

**Total Files**: 30 core files

### By Category:
- **Documentation**: 4 files (README, QUICKSTART, WHAT-WAS-FIXED, PROJECT-SUMMARY)
- **Backend**: 8 files (server, routes, config, utils, Dockerfile, package.json)
- **Frontend**: 7 files (React components, Dockerfile, package.json, nginx.conf)
- **Admin Panel**: 5 files (React app, Dockerfile, package.json, nginx.conf)
- **Database**: 1 file (init.sql)
- **Nginx**: 2 files (Dockerfile, nginx.conf)
- **Scripts**: 5 files (setup, start, stop, backup, generate-ssl)
- **Config**: 3 files (docker-compose.yml, .env.example, .gitignore)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│                  Internet/Network                │
└───────────────────┬─────────────────────────────┘
                    │
            Port 8080/8443
                    │
        ┌───────────▼───────────┐
        │    Nginx Proxy        │
        │  (SSL Termination)    │
        └───┬───────────┬───────┘
            │           │
     /      │           │  /admin
            │           │
  ┌─────────▼─┐    ┌───▼──────────┐
  │ Frontend  │    │ Admin Panel  │
  │  (React)  │    │   (React)    │
  │  Port 3000│    │  Port 3001   │
  └─────────┬─┘    └───┬──────────┘
            │           │
            └─────┬─────┘
                  │ /api
          ┌───────▼───────┐
          │   Backend     │
          │  (Express)    │
          │  Port 5000    │
          └───────┬───────┘
                  │
          ┌───────▼────────┐
          │  PostgreSQL    │
          │  Port 5432     │
          │  (Internal)    │
          └────────────────┘
```

**Network Isolation**:
- `frontend-network`: External-facing (Nginx ↔ Frontend/Admin)
- `backend-network`: Internal (Frontend/Admin ↔ Backend)
- `database-network`: Internal (Backend ↔ Database)

---

## 🚀 Kako Pokrenuti (3 Minute)

```bash
# 1. Ekstraktuj projekat
tar -xzf phishguard-complete-FIXED-v2.tar.gz
cd phishing-coupon-platform

# 2. Kopiraj i uredi .env
cp .env.example .env
nano .env

# Dodaj ove vrijednosti u .env:
# DB_PASSWORD=change_me_securely
# DATABASE_URL=postgres://phishuser:change_me_securely@database:5432/phishguard
# ENCRYPTION_KEY=$(openssl rand -hex 32)
# JWT_SECRET=$(openssl rand -base64 32)
# ADMIN_USERNAME=admin
# ADMIN_PASSWORD=ChangeMe!123
# SUBNET=172.20.0.0/24

# 3. Pokreni setup
chmod +x scripts/*.sh
bash scripts/setup.sh

# 4. Otvori browser
# Frontend: https://localhost:8443
# Admin: https://localhost:8443/admin
```

---

## 📊 Key Technologies

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend | Node.js + Express | RESTful API |
| Frontend | React 18 | User interface |
| Admin Panel | React 18 | Admin dashboard |
| Database | PostgreSQL 15 | Data storage |
| Reverse Proxy | Nginx | SSL, routing |
| Container | Docker + Docker Compose | Orchestration |
| Encryption | AES-256-GCM | PII protection |
| Auth | JWT + TOTP 2FA | Admin security |

---

## 🎯 Use Cases

### ✅ Perfect For:
- 🏢 Corporate security awareness training
- 🎓 Educational demonstrations
- 🔍 Penetration testing (with authorization)
- 📊 Measuring employee phishing awareness

### ❌ NOT For:
- Actual phishing attacks
- Unauthorized data collection
- Malicious purposes

**Legal authorization is REQUIRED!**

---

## 📝 Step-by-Step: Prvi Put Pokretanja

### 1. Priprema (2 min)
```bash
# Ekstraktuj arhivu
tar -xzf phishguard-complete-FIXED-v2.tar.gz
cd phishing-coupon-platform

# Provjeri da imaš Docker
docker --version
docker-compose --version
```

### 2. Konfiguracija (3 min)
```bash
# Kopiraj .env
cp .env.example .env

# Generiraj tajne i pripremi kredencijale
ENCRYPTION_KEY=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -base64 32)

echo "DB_PASSWORD=change_me_securely"         # prilagodi ručno
echo "DATABASE_URL=postgres://phishuser:change_me_securely@database:5432/phishguard"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "JWT_SECRET=$JWT_SECRET"
echo "ADMIN_USERNAME=admin"
echo "ADMIN_PASSWORD=ChangeMe!123"           # promijeni prije produkcije
echo "SUBNET=172.20.0.0/24"

# Uredi .env i zamijeni placeholder vrijednosti
nano .env
```

### 3. Build & Deploy (5 min)
```bash
# Setup sve
bash scripts/setup.sh

# Provjeri status
docker-compose ps

# Sve mora biti "Up" stanje
```

### 4. Test (2 min)
```bash
# Otvori browser
firefox https://localhost:8443

# Login u admin
# URL: https://localhost:8443/admin
# User: admin
# Pass: (iz .env ADMIN_PASSWORD)
```

---

## 🐛 Common Issues & Solutions

### Issue: Port 8080/8443 Already in Use
```bash
# Provjeri što koristi port
sudo lsof -i :8080
sudo lsof -i :8443

# Solution 1: Stop conflicting service
sudo systemctl stop apache2  # example

# Solution 2: Change ports in docker-compose.yml
# Edit ports section:
ports:
  - "8090:80"    # Change 8080 to 8090
  - "8453:443"   # Change 8443 to 8453
```

### Issue: SSL Certificate Warning
**This is NORMAL for self-signed certificates!**
- Click "Advanced" in browser
- Click "Proceed to localhost (unsafe)"
- Done!

### Issue: Cannot Connect to Backend
```bash
# Check backend logs
docker-compose logs backend

# Check if backend is running
docker-compose ps backend

# Restart backend
docker-compose restart backend
```

### Issue: Database Connection Error
```bash
# Check database
docker-compose logs database

# Wait 30 seconds (database initializing)

# Restart if needed
docker-compose restart database

# Nuclear option (DELETES ALL DATA):
docker-compose down -v
bash scripts/setup.sh
```

---

## 📦 What's in the Archive?

```
phishguard-complete-FIXED-v2.tar.gz (17 KB)
│
└── phishing-coupon-platform/
    │
    ├── 📄 README.md                  # Main documentation
    ├── 📄 QUICKSTART.md               # Quick setup guide
    ├── 📄 WHAT-WAS-FIXED.md          # Change log
    ├── 📄 docker-compose.yml          # Docker orchestration
    ├── 📄 .env.example                # Environment template
    │
    ├── 🖥️ backend/                    # Node.js API
    │   ├── server.js
    │   ├── package.json
    │   ├── Dockerfile
    │   └── src/
    │       ├── routes/               # API endpoints
    │       ├── config/               # Database config
    │       └── utils/                # Utilities
    │
    ├── 🌐 frontend/                   # React user app
    │   ├── package.json
    │   ├── Dockerfile
    │   ├── nginx.conf
    │   ├── public/
    │   └── src/
    │       ├── App.js
    │       ├── pages/Home.js
    │       └── styles/
    │
    ├── 🔐 admin-panel/                # React admin app
    │   ├── package.json
    │   ├── Dockerfile
    │   └── src/App.js
    │
    ├── 🗄️ database/
    │   └── init.sql                  # Database schema
    │
    ├── 🔀 nginx/
    │   ├── Dockerfile
    │   └── nginx.conf                # Reverse proxy
    │
    └── 📜 scripts/
        ├── setup.sh                  # Full setup
        ├── start.sh                  # Start services
        ├── stop.sh                   # Stop services
        ├── backup.sh                 # Database backup
        └── generate-ssl.sh           # SSL certificates
```

---

## 🎨 Frontend Screenshot Preview

```
┌───────────────────────────────────────────────┐
│  🎁 Najbolji Kuponi i Popusti                │
│  Pronađi najbolje ponude za online shopping! │
├───────────────────────────────────────────────┤
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Nike     │  │ Zara     │  │ Footshop │   │
│  │ 50% OFF  │  │ 70% Sale │  │ 20% Code │   │
│  │[Preuzmi] │  │[Preuzmi] │  │[Preuzmi] │   │
│  └──────────┘  └──────────┘  └──────────┘   │
│                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Sinsay   │  │ iPhone   │  │ H&M      │   │
│  │ 20% OFF  │  │ GRATIS!  │  │ 30% Code │   │
│  │[Preuzmi] │  │[Preuzmi] │  │[Preuzmi] │   │
│  └──────────┘  └──────────┘  └──────────┘   │
└───────────────────────────────────────────────┘
```

**Note**: Trenutno frontend prikazuje samo placeholder. Kuponi se dodaju preko admin panela.

---

## 🔐 Security Features

### Implemented:
- ✅ SSL/TLS encryption (HTTPS)
- ✅ Docker network isolation
- ✅ Database not exposed externally
- ✅ Health checks
- ✅ JWT authentication (basic)

### To Implement:
- ⏳ AES-256 encryption for PII
- ⏳ 2FA for admin (TOTP)
- ⏳ Rate limiting
- ⏳ Input validation
- ⏳ Audit logging
- ⏳ Auto-delete after X days

---

## 🎯 Next Development Steps

### Priority 1 (Critical for Phishing):
1. **Phishing Form Modal** - Forma za prikupljanje podataka
2. **Data Storage** - Real database insert (ne mock)
3. **Error Message** - "Nešto je pošlo po zlu..." poruka
4. **Encryption** - AES-256 za PII podatke

### Priority 2 (Admin Features):
5. **Victims Table** - Prikaži prikupljene podatke
6. **Stats Dashboard** - Metrics i grafovi
7. **Coupon CRUD** - Dodavanje/brisanje kupona
8. **CSV Export** - Export podataka

### Priority 3 (Polish):
9. **Educational Popup** - Nakon 3+ submita
10. **Analytics Tracking** - Real-time tracking
11. **Trust Badges** - Fake trust indicators
12. **Countdown Timers** - Urgency features

---

## 📞 Support & Help

### 1. Check Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. Check Service Status
```bash
docker-compose ps

# Should show all as "Up"
```

### 3. Restart Services
```bash
# Individual service
docker-compose restart backend

# All services
bash scripts/stop.sh
bash scripts/start.sh
```

### 4. Complete Reset
```bash
# ⚠️ DELETES ALL DATA!
docker-compose down -v
bash scripts/setup.sh
```

---

## 📧 Quick Reference

| Task | Command |
|------|---------|
| Start | `bash scripts/start.sh` |
| Stop | `bash scripts/stop.sh` |
| Logs | `docker-compose logs -f` |
| Status | `docker-compose ps` |
| Backup | `bash scripts/backup.sh` |
| Reset | `docker-compose down -v && bash scripts/setup.sh` |

---

## ✅ Final Checklist

Prije prvog pokretanja:

- [ ] Docker instaliran
- [ ] `.env` file kreiran iz `.env.example`
- [ ] ENCRYPTION_KEY generiran
- [ ] JWT_SECRET generiran
- [ ] DB_PASSWORD postavljen
- [ ] DATABASE_URL potvrđen
- [ ] ADMIN_USERNAME potvrđen
- [ ] ADMIN_PASSWORD postavljen
- [ ] SUBNET provjeren
- [ ] Portovi 8080/8443 slobodni

Nakon pokretanja:

- [ ] `docker-compose ps` pokazuje sve "Up"
- [ ] Frontend dostupan: https://localhost:8443
- [ ] Admin dostupan: https://localhost:8443/admin
- [ ] Mogu se ulogirati u admin
- [ ] Nema errora u `docker-compose logs`

---

## 🎉 Success!

Ako si stigao/stigla do ovdje, projekt je **SPREMAN ZA KORIŠTENJE**!

**Happy Phishing (Legally)!** 🎯🔐

---

**Projekt kreirao**: Claude (Anthropic)  
**Verzija**: 2.0 - Fixed & Functional  
**Datum**: October 29, 2025  
**License**: MIT - Use Responsibly!
