#!/bin/bash

# PhishGuard - Enhanced Backup Script
# Creates encrypted backups of database and configuration

set -e

GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="phishguard_backup_${TIMESTAMP}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   PhishGuard Backup System            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup database
echo -e "${BLUE}[1/4] Backing up database...${NC}"
docker exec phishing-coupon-platform-database-1 pg_dump \
    -U phishuser \
    -d phishguard \
    -F c \
    -f /tmp/db_backup.dump

docker cp phishing-coupon-platform-database-1:/tmp/db_backup.dump \
    "$BACKUP_DIR/${BACKUP_NAME}_database.dump"

docker exec phishing-coupon-platform-database-1 rm /tmp/db_backup.dump

echo -e "${GREEN}✓ Database backed up${NC}"

# 2. Backup configuration files
echo -e "${BLUE}[2/4] Backing up configuration...${NC}"
tar -czf "$BACKUP_DIR/${BACKUP_NAME}_config.tar.gz" \
    .env \
    docker-compose.yml \
    nginx/nginx.conf \
    nginx/ssl/ \
    database/init.sql \
    2>/dev/null || echo "Some files may be missing"

echo -e "${GREEN}✓ Configuration backed up${NC}"

# 3. Create backup manifest
echo -e "${BLUE}[3/4] Creating backup manifest...${NC}"
cat > "$BACKUP_DIR/${BACKUP_NAME}_manifest.txt" << EOF
PhishGuard Backup Manifest
==========================
Backup Date: $(date)
Backup Name: ${BACKUP_NAME}

Contents:
---------
1. Database dump (PostgreSQL custom format)
2. Configuration files (.env, docker-compose.yml, nginx configs)
3. SSL certificates

Database Info:
-------------
Container: phishing-coupon-platform-database-1
User: phishuser
Database: phishguard

To Restore:
-----------
1. Stop all services: docker-compose down
2. Restore database:
   cat ${BACKUP_NAME}_database.dump | docker exec -i phishing-coupon-platform-database-1 pg_restore -U phishuser -d phishguard --clean
3. Extract config:
   tar -xzf ${BACKUP_NAME}_config.tar.gz
4. Restart: docker-compose up -d

Created by: $(whoami)@$(hostname)
EOF

echo -e "${GREEN}✓ Manifest created${NC}"

# 4. Encrypt backup (optional)
if command -v gpg &> /dev/null; then
    read -p "Encrypt backup with GPG? (y/N): " ENCRYPT
    if [[ $ENCRYPT =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}[4/4] Encrypting backup...${NC}"
        
        for file in "$BACKUP_DIR/${BACKUP_NAME}"*; do
            gpg --symmetric --cipher-algo AES256 "$file"
            rm "$file"  # Remove unencrypted version
        done
        
        echo -e "${GREEN}✓ Backup encrypted${NC}"
        echo -e "${YELLOW}⚠️  Remember your encryption password!${NC}"
    else
        echo -e "${BLUE}[4/4] Skipping encryption${NC}"
    fi
else
    echo -e "${BLUE}[4/4] GPG not available, skipping encryption${NC}"
fi

# 5. Clean old backups
echo -e "\n${BLUE}Cleaning backups older than ${RETENTION_DAYS} days...${NC}"
find "$BACKUP_DIR" -name "phishguard_backup_*" -mtime +${RETENTION_DAYS} -delete
OLD_COUNT=$(find "$BACKUP_DIR" -name "phishguard_backup_*" | wc -l)
echo -e "${GREEN}✓ Cleanup complete (${OLD_COUNT} backups remaining)${NC}"

# 6. Backup summary
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

echo -e "\n${GREEN}╔════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║     ✅ Backup Complete!                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}📦 Backup Details:${NC}"
echo -e "   Location: ${GREEN}$BACKUP_DIR/${NC}"
echo -e "   Name:     ${GREEN}$BACKUP_NAME${NC}"
echo -e "   Size:     ${GREEN}$BACKUP_SIZE${NC}"
echo ""
echo -e "${BLUE}📁 Files created:${NC}"
ls -lh "$BACKUP_DIR/${BACKUP_NAME}"* 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
echo ""
echo -e "${YELLOW}💡 Tip: Store backups in a secure off-site location${NC}"
echo ""
