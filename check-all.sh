#!/bin/bash

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "🔍 PhishGuard Platform Status Check"
echo "===================================="

# Check containers
echo -e "\n1. Container Status:"
RUNNING=$(docker-compose ps --format "{{.State}}" | grep -c "running")
TOTAL=$(docker-compose ps --format "{{.State}}" | wc -l)
if [ "$RUNNING" -eq "$TOTAL" ] && [ "$TOTAL" -eq 5 ]; then
    echo -e "${GREEN}✅ All $TOTAL/5 containers running${NC}"
else
    echo -e "${RED}❌ Only $RUNNING/$TOTAL containers running${NC}"
    docker-compose ps
fi

# Check backend health
echo -e "\n2. Backend Health:"
if curl -sk https://localhost:8443/api/health | grep -iq "ok"; then

    echo -e "${GREEN}✅ Backend is healthy${NC}"
else
    echo -e "${RED}❌ Backend health check failed${NC}"
fi

# Check API through nginx
echo -e "\n3. API Gateway (Nginx):"
if curl -s -k https://localhost:8443/api/public/coupons | grep -q "coupons"; then
    echo -e "${GREEN}✅ API accessible through Nginx${NC}"
else
    echo -e "${RED}❌ API not accessible through Nginx${NC}"
fi

# Check database
echo -e "\n4. Database:"
TABLES=$(docker exec phishing-coupon-platform-database-1 psql -U phishuser -d phishguard -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
if [ "$TABLES" = "4" ]; then
    echo -e "${GREEN}✅ Database initialized (4 tables: users, coupons, analytics, auth_users)${NC}"
else
    echo -e "${RED}❌ Database issue (found $TABLES tables, expected 4)${NC}"
fi

# Check for errors in logs
echo -e "\n5. Error Check:"
ERRORS=$(docker-compose logs --tail=100 2>&1 | grep -i "error" | grep -v "errorformat" | wc -l)
if [ "$ERRORS" -lt 5 ]; then
    echo -e "${GREEN}✅ Minimal errors in logs ($ERRORS)${NC}"
else
    echo -e "${RED}⚠️  Found $ERRORS errors in logs${NC}"
fi

echo -e "\n===================================="
echo "📊 Summary:"
echo "- Frontend: https://localhost:8443"
echo "- Admin: https://localhost:8443/admin"
echo "- Backend: http://localhost:5000"
echo "===================================="
