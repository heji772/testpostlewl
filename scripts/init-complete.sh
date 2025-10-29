#!/bin/bash

# PhishGuard - Complete Initialization Script
# This script handles SSL generation, environment setup, and database seeding

set -e  # Exit on error

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  PhishGuard Complete Setup Wizard     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Function to generate secure password
generate_password() {
    openssl rand -base64 32 | tr -d "=+/" | cut -c1-25
}

# Check if running from project root
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}❌ Error: Please run this script from the project root directory${NC}"
    exit 1
fi

# 1. Generate SSL Certificates
echo -e "\n${BLUE}[1/5] Generating SSL Certificates...${NC}"
if [ -f "nginx/ssl/server.crt" ] && [ -f "nginx/ssl/server.key" ]; then
    echo -e "${YELLOW}⚠️  SSL certificates already exist${NC}"
    read -p "Regenerate? (y/N): " REGENERATE
    if [[ $REGENERATE =~ ^[Yy]$ ]]; then
        bash scripts/generate-ssl.sh
    else
        echo -e "${GREEN}✓ Using existing certificates${NC}"
    fi
else
    bash scripts/generate-ssl.sh
fi

# 2. Create .env file
echo -e "\n${BLUE}[2/5] Setting up environment variables...${NC}"
if [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file already exists${NC}"
    read -p "Overwrite? (y/N): " OVERWRITE
    if [[ ! $OVERWRITE =~ ^[Yy]$ ]]; then
        echo -e "${GREEN}✓ Using existing .env${NC}"
        ENV_EXISTS=true
    fi
fi

if [ "$ENV_EXISTS" != "true" ]; then
    echo -e "${BLUE}Generating secure credentials...${NC}"
    
    DB_PASSWORD=$(generate_password)
    ADMIN_PASSWORD=$(generate_password)
    ENCRYPTION_KEY=$(openssl rand -hex 32)
    JWT_SECRET=$(openssl rand -base64 32)
    
    cat > .env << EOF
# ----------------------------------------------------------------------------
# PhishGuard Coupon Platform - Environment Configuration
# Generated on: $(date)
# ----------------------------------------------------------------------------

# Database Configuration
DATABASE_URL=postgres://phishuser:${DB_PASSWORD}@database:5432/phishguard
DB_HOST=database
DB_PORT=5432
DB_NAME=phishguard
DB_USER=phishuser
DB_PASSWORD=${DB_PASSWORD}

# Admin Panel Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=${ADMIN_PASSWORD}

# Security Keys (Keep these secret!)
ENCRYPTION_KEY=${ENCRYPTION_KEY}
JWT_SECRET=${JWT_SECRET}

# Backend Configuration
PORT=5000
NODE_ENV=production

# Network Configuration
SUBNET=172.20.0.0/24
EOF
    
    echo -e "${GREEN}✓ Environment file created${NC}"
    echo -e "\n${YELLOW}📝 Save these credentials:${NC}"
    echo -e "   Admin Username: ${GREEN}admin${NC}"
    echo -e "   Admin Password: ${GREEN}${ADMIN_PASSWORD}${NC}"
    echo -e "   DB Password: ${GREEN}${DB_PASSWORD}${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Store these credentials securely!${NC}"
    read -p "Press Enter to continue..."
fi

# 3. Check for port conflicts
echo -e "\n${BLUE}[3/5] Checking for port conflicts...${NC}"
PORTS_IN_USE=""
for port in 8080 8443 5432; do
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        PORTS_IN_USE="$PORTS_IN_USE $port"
    fi
done

if [ -n "$PORTS_IN_USE" ]; then
    echo -e "${YELLOW}⚠️  Warning: Ports in use:${PORTS_IN_USE}${NC}"
    echo -e "${YELLOW}   On macOS, port 7000/5000 may be used by AirPlay${NC}"
    echo -e "${YELLOW}   Consider: System Settings > General > AirDrop & Handoff > AirPlay Receiver (OFF)${NC}"
    read -p "Continue anyway? (y/N): " CONTINUE
    if [[ ! $CONTINUE =~ ^[Yy]$ ]]; then
        echo -e "${RED}Setup cancelled${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ All required ports available${NC}"
fi

# 4. Build and start containers
echo -e "\n${BLUE}[4/5] Building and starting Docker containers...${NC}"
docker-compose down -v 2>/dev/null || true
docker-compose build --no-cache
docker-compose up -d

# Wait for services to be healthy
echo -e "${BLUE}Waiting for services to start...${NC}"
sleep 5

# Wait for database
echo -e "${BLUE}Waiting for database...${NC}"
RETRIES=30
until docker exec phishing-coupon-platform-database-1 pg_isready -U phishuser -d phishguard >/dev/null 2>&1; do
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -eq 0 ]; then
        echo -e "${RED}❌ Database failed to start${NC}"
        exit 1
    fi
    sleep 2
    echo -n "."
done
echo -e "\n${GREEN}✓ Database ready${NC}"

# Wait for backend
echo -e "${BLUE}Waiting for backend API...${NC}"
RETRIES=30
until curl -sf http://localhost:5000/health >/dev/null 2>&1; do
    RETRIES=$((RETRIES-1))
    if [ $RETRIES -eq 0 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi
    sleep 2
    echo -n "."
done
echo -e "\n${GREEN}✓ Backend ready${NC}"

# 5. Seed database
echo -e "\n${BLUE}[5/5] Database seeding...${NC}"
read -p "Add sample data (coupons and test user)? (Y/n): " ADD_SAMPLE
if [[ ! $ADD_SAMPLE =~ ^[Nn]$ ]]; then
    echo -e "${BLUE}Creating sample data...${NC}"
    
    # Create sample coupons
    docker exec phishing-coupon-platform-database-1 psql -U phishuser -d phishguard << 'EOF'
-- Sample legitimate coupons
INSERT INTO coupons (title, brand, category, discount_text, code, is_phishing, image_url) VALUES
('20% popusta na odjeću', 'ZARA', 'fashion', '20% OFF', 'ZARA20', false, 'https://via.placeholder.com/300x200?text=ZARA'),
('Besplatna dostava', 'Amazon', 'shopping', 'FREE SHIPPING', 'SHIP2024', false, 'https://via.placeholder.com/300x200?text=Amazon'),
('Kupite 2, treći gratis', 'Nike', 'sports', 'BUY 2 GET 1 FREE', 'NIKE3FOR2', false, 'https://via.placeholder.com/300x200?text=Nike');

-- Sample phishing coupon (for testing)
INSERT INTO coupons (title, brand, category, discount_text, code, is_phishing, image_url) VALUES
('🎁 OSVOJI iPhone 15 PRO!', 'Apple', 'electronics', 'KLIKNI ODMAH', 'SCAM123', true, 'https://via.placeholder.com/300x200?text=PHISHING');

-- Create admin user (password will be from .env)
INSERT INTO auth_users (username, password_hash, totp_enabled, created_at, updated_at) 
VALUES ('admin', '$2b$10$placeholder', false, NOW(), NOW())
ON CONFLICT (username) DO NOTHING;

EOF
    
    echo -e "${GREEN}✓ Sample data created${NC}"
    echo -e "${BLUE}  - 3 legitimate coupons${NC}"
    echo -e "${BLUE}  - 1 phishing test coupon${NC}"
else
    echo -e "${YELLOW}⚠️ Skipping sample data${NC}"
fi

# Final status check
echo -e "\n${BLUE}Running system health check...${NC}"
sleep 3

CONTAINERS=$(docker-compose ps --format "{{.State}}" | grep -c "running" || echo "0")
if [ "$CONTAINERS" -eq 5 ]; then
    echo -e "${GREEN}✓ All 5 containers running${NC}"
else
    echo -e "${YELLOW}⚠️ Only $CONTAINERS/5 containers running${NC}"
fi

# Check API
if curl -sk https://localhost:8443/api/health | grep -iq "ok"; then
    echo -e "${GREEN}✓ API is responding${NC}"
else
    echo -e "${YELLOW}⚠️ API may not be ready yet${NC}"
fi

# Success message
echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Setup Complete!                 ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}🌐 Access your PhishGuard platform:${NC}"
echo -e "   ${GREEN}Frontend:${NC}    https://localhost:8443"
echo -e "   ${GREEN}Admin Panel:${NC} https://localhost:8443/admin"
echo -e "   ${GREEN}Backend API:${NC} https://localhost:8443/api"
echo ""
echo -e "${BLUE}🔐 Admin Credentials:${NC}"
if [ "$ENV_EXISTS" != "true" ]; then
    echo -e "   Username: ${GREEN}admin${NC}"
    echo -e "   Password: ${GREEN}${ADMIN_PASSWORD}${NC}"
else
    echo -e "   ${YELLOW}Check your .env file for credentials${NC}"
fi
echo ""
echo -e "${BLUE}📊 Useful Commands:${NC}"
echo -e "   ${GREEN}docker-compose logs -f${NC}           # View logs"
echo -e "   ${GREEN}docker-compose ps${NC}                # Check status"
echo -e "   ${GREEN}bash check-all.sh${NC}                # Run health check"
echo -e "   ${GREEN}docker-compose down${NC}              # Stop all services"
echo ""
echo -e "${YELLOW}⚠️  Note: Accept browser security warnings for self-signed SSL${NC}"
echo ""
