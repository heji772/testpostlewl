# 🚀 QUICKSTART Guide

Jednostavne upute za pokretanje PhishGuard platforme.

---

## ⚡ 3-Minute Setup

```bash
# 1. Kopiraj .env
cp .env.example .env

# 2. Generiraj ključeve i dodaj u .env
openssl rand -hex 32      # → ENCRYPTION_KEY
openssl rand -base64 32   # → JWT_SECRET

# 3. Uredi .env (obavezno zamijeni sve placeholder vrijednosti!)
nano .env
# Promijeni: DATABASE_URL, DB_PASSWORD, ADMIN_USERNAME, ADMIN_PASSWORD,
#            ENCRYPTION_KEY, JWT_SECRET, SUBNET (ako kolidira)

# 4. Pokreni setup
chmod +x scripts/*.sh
bash scripts/setup.sh
```

**Gotovo! 🎉**

---

## 🌐 Pristup Platformi

### Port 8443 (HTTPS - **PREPORUČENO**)
- Frontend: `https://localhost:8443`
- Admin: `https://localhost:8443/admin`

### Port 8080 (HTTP - alternative)
- Frontend: `http://localhost:8080`
- Admin: `http://localhost:8080/admin`

**Napomena**: Browsergledati će SSL upozorenje - to je normalno za self-signed certifikate. Kliknite "Advanced" → "Proceed".

---

## 🔑 Login Podaci

Admin panel login:
- **Username**: `admin`
- **Password**: Ono što ste stavili u `.env` kao `ADMIN_PASSWORD`

---

## 📊 Osnovno Korištenje

### 1. Dodaj Kupone (Admin Panel)

```
1. Login → https://localhost:8443/admin
2. Navigate → "Coupons"
3. Click → "Add Coupon"
4. Fill form:
   - Title: "Nike 50% popust"
   - Brand: "Nike"
   - Category: "Sport"
   - Discount: "50% na sve tenisice"
   - Type: PHISHING (za phishing) ili REAL (za pravi kupon)
   - URL: Ostavi prazno za phishing, dodaj link za real
5. Save
```

### 2. Testiraj Frontend

```
1. Open → https://localhost:8443
2. Klikni na kupon
3. Ispuni formu (phishing kupon)
4. Vidi error poruku: "Nešto je pošlo po zlu..."
```

### 3. Provjeri Prikupljene Podatke

```
1. Login → Admin panel
2. Navigate → "Victims"
3. Vidi sve prikupljene podatke
4. Export → CSV
```

---

## 🛠️ Najčešći Problemi i Rješenja

### Problem: "Port already in use"

**Rješenje**:
```bash
# Provjeri što koristi port
sudo lsof -i :8080
sudo lsof -i :8443

# Ili promijeni portove u docker-compose.yml
```

### Problem: SSL Certificate Warning

**Rješenje**: To je normalno! Klikni "Advanced" → "Proceed to localhost".

### Problem: Ne mogu se ulogirati u admin

**Rješenje**:
```bash
# Provjeri password u .env
cat .env | grep ADMIN_PASSWORD

# Ako si zaboravio, promijeni u .env i restartaj:
docker-compose restart backend
```

### Problem: Database connection error

**Rješenje**:
```bash
# Restart database
docker-compose restart database

# Provjeri status
docker-compose ps

# Ako ne radi, resetiraj sve
docker-compose down -v
bash scripts/setup.sh
```

---

## 📝 Brze Komande

```bash
# Start services
bash scripts/start.sh

# Stop services
bash scripts/stop.sh

# View logs
docker-compose logs -f

# Restart single service
docker-compose restart backend

# Check status
docker-compose ps

# Backup database
bash scripts/backup.sh

# Complete reset (DELETES ALL DATA!)
docker-compose down -v && bash scripts/setup.sh
```

---

## ✅ Checklist Nakon Pokretanja

- [ ] .env file kreiran i ureden
- [ ] Encryption key i JWT secret generirani
- [ ] Docker containeri pokreću (docker-compose ps)
- [ ] Frontend dostupan na https://localhost:8443
- [ ] Admin panel dostupan na https://localhost:8443/admin
- [ ] Mogu se ulogirati u admin panel
- [ ] Database radi (check logs)

---

## 🎯 Prvi Koraci Nakon Setup-a

1. **Dodaj 5-10 kupona** (mix real + phishing)
2. **Testiraj frontend** - otvori https://localhost:8443
3. **Simuliraj klik** na phishing kupon
4. **Ispuni formu** s test podacima
5. **Provjeri admin panel** - vidi prikupljene podatke
6. **Exportaj CSV** za analizu

---

## 📞 Trebate Pomoć?

1. **Provjeri logs**:
   ```bash
   docker-compose logs -f
   ```

2. **Provjeri README.md** - detaljna troubleshooting sekcija

3. **Restart sve**:
   ```bash
   bash scripts/stop.sh
   bash scripts/start.sh
   ```

---

**Sretno! 🎯🔐**
