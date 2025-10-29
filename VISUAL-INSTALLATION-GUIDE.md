# 🎨 PhishGuard - Visual Installation Guide

Easy-to-follow visual guide za instalaciju projekta.

---

## 📦 Step 1: Ekstraktuj Projekat

```
┌─────────────────────────────────────────┐
│  Terminal                               │
├─────────────────────────────────────────┤
│ $ tar -xzf phishguard-FINAL.tar.gz     │
│ $ cd phishing-coupon-platform           │
│                                          │
│ ✅ phishing-coupon-platform/            │
│    ├── README.md                        │
│    ├── QUICKSTART.md                    │
│    ├── docker-compose.yml               │
│    └── ...                              │
└─────────────────────────────────────────┘
```

---

## ⚙️ Step 2: Generiraj Ključeve

```
┌─────────────────────────────────────────┐
│  Terminal - Generate Keys               │
├─────────────────────────────────────────┤
│ $ openssl rand -hex 32                  │
│ 0a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p... ← ENCRYPTION_KEY
│                                          │
│ $ openssl rand -base64 32               │
│ AbCdEfGhIjKlMnOpQrStUvWxYz12... ← JWT_SECRET
│                                          │
│ 💾 Kopiraj ove vrijednosti!             │
└─────────────────────────────────────────┘
```

---

## 📝 Step 3: Konfiguriraj .env File

```
┌─────────────────────────────────────────┐
│  .env File Editor                       │
├─────────────────────────────────────────┤
│ DB_PASSWORD=SuperJakaSifra123!          │
│ DATABASE_URL=postgres://phishuser:Super │
│ ADMIN_PASSWORD=AdminPass2025!           │
│ ADMIN_PASSWORD_HASH=$2b$12$... ← Hash   │
│ ENCRYPTION_KEY=0a1b2c3d4e5f6g7h... ← Hex│
│ JWT_SECRET=AbCdEfGhIjKlMnOpQrSt... ← Base│
│ 💡 Koristi jake lozinke!                │
└─────────────────────────────────────────┘

Kako editirati:
$ cp .env.example .env
$ nano .env  # ili vim, ili bilo koji editor
$ docker run --rm node:18-alpine \
    node -e "console.log(require('bcrypt').hashSync(process.argv[1], 12))" "AdminPass2025!"
```

---

## 🚀 Step 4: Pokreni Setup

```
┌─────────────────────────────────────────┐
│  Terminal - Setup Script                │
├─────────────────────────────────────────┤
│ $ chmod +x scripts/*.sh                 │
│ $ bash scripts/setup.sh                 │
│                                          │
│ 🚀 PhishGuard Platform Setup            │
│ ============================            │
│ 📝 .env file found ✅                   │
│ 🔐 Generating SSL certificates...       │
│ ✅ SSL certificates generated!          │
│ 🐳 Building Docker containers...        │
│   [████████████████] 100%              │
│ ▶️  Starting services...                │
│ ✅ All services started!                │
│                                          │
│ 🌐 Frontend: https://localhost:8443     │
│ 🔐 Admin: https://localhost:8443/admin  │
└─────────────────────────────────────────┘
```

---

## 🌐 Step 5: Otvori Browser

```
┌─────────────────────────────────────────────────────────┐
│  Browser - https://localhost:8443                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ⚠️ Your connection is not private                      │
│                                                          │
│  NET::ERR_CERT_AUTHORITY_INVALID                        │
│                                                          │
│  This is NORMAL for self-signed certificates!           │
│                                                          │
│  [Advanced]  ← Click here                               │
│                                                          │
│  Then click: "Proceed to localhost (unsafe)"            │
│                                                          │
└─────────────────────────────────────────────────────────┘

                      👇 Nakon klika

┌─────────────────────────────────────────────────────────┐
│  🎁 Najbolji Kuponi i Popusti                           │
│  Pronađi najbolje ponude za online shopping!            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Nike    │  │  Zara    │  │ Footshop │              │
│  │ 50% OFF  │  │ 70% OFF  │  │ 20% Code │              │
│  │[Preuzmi] │  │[Preuzmi] │  │[Preuzmi] │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│                                                          │
│  Trenutno nema kupona. Dodaj ih preko admin panela.     │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔐 Step 6: Login u Admin Panel

```
┌─────────────────────────────────────────────────────────┐
│  https://localhost:8443/admin                           │
├─────────────────────────────────────────────────────────┤
│                                                          │
│              🔐 Admin Login                             │
│                                                          │
│         ┌─────────────────────────────┐                 │
│         │ Username: admin_____        │                 │
│         └─────────────────────────────┘                 │
│                                                          │
│         ┌─────────────────────────────┐                 │
│         │ Password: ************      │                 │
│         └─────────────────────────────┘                 │
│                                                          │
│         ┌─────────────────────────────┐                 │
│         │        [  Login  ]          │                 │
│         └─────────────────────────────┘                 │
│                                                          │
│  💡 Use credentials from .env file                      │
│     Username: admin                                     │
│     Password: (ADMIN_PASSWORD value)                    │
│                                                          │
└─────────────────────────────────────────────────────────┘

                      👇 Nakon logina

┌─────────────────────────────────────────────────────────┐
│  PhishGuard Admin Dashboard                             │
├─────────────────────────────────────────────────────────┤
│  [Dashboard] [Victims] [Coupons] [Analytics] [Settings] │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Dashboard functionality will be implemented here.       │
│                                                          │
│  [Logout]                                               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Step 7: Provjeri Status

```
┌─────────────────────────────────────────┐
│  Terminal - Check Status                │
├─────────────────────────────────────────┤
│ $ docker-compose ps                     │
│                                          │
│ NAME            STATE    PORTS           │
│ ─────────────────────────────────────── │
│ nginx           Up       8080, 8443      │
│ frontend        Up       3000            │
│ admin-panel     Up       3001            │
│ backend         Up       5000            │
│ database        Up       5432            │
│                                          │
│ ✅ All services running!                │
└─────────────────────────────────────────┘

$ docker-compose logs -f backend
✅ Backend server running on port 5000

$ curl http://localhost:5000/health
{"status":"ok","timestamp":"2025-10-29T..."}
✅ Health check passed!
```

---

## 🎯 Common Scenarios

### Scenario 1: Port Already in Use

```
┌─────────────────────────────────────────┐
│  ❌ Error                               │
├─────────────────────────────────────────┤
│ Error starting userland proxy:         │
│ bind 0.0.0.0:8080: address already     │
│ in use                                  │
│                                          │
│ 🔍 Solution:                            │
└─────────────────────────────────────────┘

$ sudo lsof -i :8080
COMMAND   PID USER   FD   TYPE DEVICE
apache2  1234 root    4u  IPv4  0t0  TCP

$ sudo systemctl stop apache2

Ili promijeni port u docker-compose.yml:
ports:
  - "8090:80"  ← Change 8080 to 8090
```

### Scenario 2: Database Not Starting

```
┌─────────────────────────────────────────┐
│  ❌ Error                               │
├─────────────────────────────────────────┤
│ database | PostgreSQL init process     │
│ database | failed                       │
│                                          │
│ 🔍 Solution:                            │
└─────────────────────────────────────────┘

$ docker-compose logs database
# Read the error message

# Common fix: Reset database
$ docker-compose down -v
$ bash scripts/setup.sh
```

### Scenario 3: Cannot Login to Admin

```
┌─────────────────────────────────────────┐
│  ❌ Error                               │
├─────────────────────────────────────────┤
│ Invalid credentials                     │
│                                          │
│ 🔍 Solution:                            │
└─────────────────────────────────────────┘

# Check password in .env
$ cat .env | grep ADMIN_PASSWORD
ADMIN_PASSWORD=YourPassword123

# Make sure you're using exactly this password

# If changed, restart backend:
$ docker-compose restart backend
```

---

## 🛠️ Useful Commands Reference

```
┌─────────────────────────────────────────┐
│  Quick Command Reference                │
├─────────────────────────────────────────┤
│ Start:   bash scripts/start.sh          │
│ Stop:    bash scripts/stop.sh           │
│ Logs:    docker-compose logs -f         │
│ Status:  docker-compose ps              │
│ Restart: docker-compose restart SERVICE │
│ Rebuild: docker-compose up --build -d   │
│ Reset:   docker-compose down -v         │
│ Backup:  bash scripts/backup.sh         │
└─────────────────────────────────────────┘
```

---

## 🎨 Architecture Diagram

```
Internet/Network (Port 8080/8443)
          │
          ├──────┐
          │      │
    ┌─────▼────┐ │
    │   Nginx  │ │ ← SSL Termination
    │  Proxy   │ │
    └─────┬────┘ │
          │      │
    ┌─────▼─┐  ┌─▼────────┐
    │       │  │          │
    │ Front │  │  Admin   │
    │  End  │  │  Panel   │
    │(React)│  │ (React)  │
    └───┬───┘  └────┬─────┘
        │           │
        └─────┬─────┘
              │ /api
        ┌─────▼─────┐
        │  Backend  │
        │ (Express) │
        └─────┬─────┘
              │
        ┌─────▼──────┐
        │ PostgreSQL │
        │  Database  │
        └────────────┘
```

---

## 📊 Port Mapping

```
┌──────────────┬─────────┬─────────────────┐
│   Service    │  Port   │     Access      │
├──────────────┼─────────┼─────────────────┤
│ Nginx (HTTP) │  8080   │ External        │
│ Nginx (HTTPS)│  8443   │ External        │
│ Frontend     │  3000   │ Internal        │
│ Admin Panel  │  3001   │ Internal        │
│ Backend      │  5000   │ Internal        │
│ PostgreSQL   │  5432   │ Internal        │
└──────────────┴─────────┴─────────────────┘

External = Accessible from your computer
Internal = Only accessible between Docker containers
```

---

## ✅ Success Checklist

```
After setup, verify:

□ Terminal shows "✅ PhishGuard started successfully!"
□ docker-compose ps shows all services "Up"
□ Can open https://localhost:8443 in browser
□ Can open https://localhost:8443/admin
□ Can login to admin panel
□ Backend health check works: curl http://localhost:5000/health
□ No errors in logs: docker-compose logs

If all checked ✅ → SUCCESS! 🎉
```

---

## 🎯 What to Do Next?

```
1. ✅ Projekt pokrenut
2. 📝 Dodaj kupone preko admin panela
3. 🎨 Testiraj frontend
4. 📊 Provjeri dashboard
5. 🔐 Testraj phishing forme (kada budu implementirane)
6. 📈 Analiziraj podatke
7. 🚀 Deploy na stvarnu mrežu (with proper security!)
```

---

## 📞 Need Help?

```
┌─────────────────────────────────────────┐
│  Troubleshooting Steps                  │
├─────────────────────────────────────────┤
│ 1. Check logs:                          │
│    $ docker-compose logs -f             │
│                                          │
│ 2. Check status:                        │
│    $ docker-compose ps                  │
│                                          │
│ 3. Restart services:                    │
│    $ bash scripts/stop.sh               │
│    $ bash scripts/start.sh              │
│                                          │
│ 4. Read documentation:                  │
│    - README.md                          │
│    - QUICKSTART.md                      │
│    - WHAT-WAS-FIXED.md                  │
│                                          │
│ 5. Nuclear option (last resort):        │
│    $ docker-compose down -v             │
│    $ bash scripts/setup.sh              │
└─────────────────────────────────────────┘
```

---

**Visual Guide Complete!** 🎨✅

*All steps with ASCII art for easy following!*
