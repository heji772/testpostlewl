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
# Expected tables in the public schema. Update this list whenever schema changes.
# - analytics
# - auth_sessions
# - auth_users
# - coupons
# - security_settings
# - users
echo -e "\n4. Database:"
EXPECTED_TABLES=("analytics" "auth_sessions" "auth_users" "coupons" "security_settings" "users")
TABLE_LIST=$(docker exec phishing-coupon-platform-database-1 psql -U phishuser -d phishguard -t -A -c "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;" 2>/dev/null | tr -d '\r')
TABLE_COUNT=$(echo "$TABLE_LIST" | sed '/^$/d' | wc -l | xargs)
MISSING_TABLES=()
for table in "${EXPECTED_TABLES[@]}"; do
    if ! echo "$TABLE_LIST" | grep -qx "$table"; then
        MISSING_TABLES+=("$table")
    fi
done

if [ -n "$TABLE_LIST" ] && [ ${#MISSING_TABLES[@]} -eq 0 ]; then
    echo -e "${GREEN}✅ Database initialized (${TABLE_COUNT} tables: ${EXPECTED_TABLES[*]})${NC}"
else
    if [ -z "$TABLE_LIST" ]; then
        echo -e "${RED}❌ Unable to fetch table information from database${NC}"
    else
        echo -e "${RED}❌ Database issue (found $TABLE_COUNT tables). Missing: ${MISSING_TABLES[*]:-none}${NC}"
    fi
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
