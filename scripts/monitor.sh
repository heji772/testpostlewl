#!/bin/bash

# PhishGuard - Real-time Monitoring Dashboard
# Shows live stats and health metrics

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
PROJECT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
cd "$PROJECT_DIR" || exit 1
PROJECT_NAME=${COMPOSE_PROJECT_NAME:-$(basename "$PROJECT_DIR")}

resolve_compose_cmd() {
    if [ -n "$COMPOSE_CMD" ]; then
        read -r -a cmd <<< "$COMPOSE_CMD"
        echo "${cmd[@]}"
        return
    fi

    if command -v docker-compose >/dev/null 2>&1; then
        echo "docker-compose"
        return
    fi

    if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
        echo "docker compose"
        return
    fi

    echo ""
}

COMPOSE_CMD_RESOLVED=$(resolve_compose_cmd)

# Function to get container status
get_container_status() {
    local container=$1
    local status=$(docker inspect --format='{{.State.Status}}' "$container" 2>/dev/null)
    local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null)
    
    if [ "$status" = "running" ]; then
        if [ "$health" = "healthy" ] || [ "$health" = "" ]; then
            echo -e "${GREEN}● running${NC}"
        elif [ "$health" = "starting" ]; then
            echo -e "${YELLOW}● starting${NC}"
        else
            echo -e "${RED}● unhealthy${NC}"
        fi
    else
        echo -e "${RED}● $status${NC}"
    fi
}

# Function to get container CPU/Memory
get_container_stats() {
    local container=$1
    docker stats --no-stream --format "{{.CPUPerc}} | {{.MemUsage}}" "$container" 2>/dev/null | head -1
}

# Function to check database stats
get_db_stats() {
    docker exec phishing-coupon-platform-database-1 psql -U phishuser -d phishguard -t -c "
        SELECT 
            (SELECT COUNT(*) FROM users) as users,
            (SELECT COUNT(*) FROM coupons) as coupons,
            (SELECT COUNT(*) FROM analytics) as analytics,
            (SELECT COUNT(*) FROM auth_users) as auth_users
    " 2>/dev/null | tr -d ' '
}

# Function to check API response time
get_api_response_time() {
    local start=$(date +%s%N)
    curl -sk https://localhost:8443/api/health >/dev/null 2>&1
    local end=$(date +%s%N)
    local duration=$(( (end - start) / 1000000 ))
    echo "${duration}ms"
}

# Clear screen function
clear_screen() {
    clear
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║         🛡️  PhishGuard Live Monitoring Dashboard             ║${NC}"
    echo -e "${CYAN}╠══════════════════════════════════════════════════════════════╣${NC}"
    echo -e "${CYAN}║  Press Ctrl+C to exit                  Updated: $(date +%H:%M:%S)    ║${NC}"
    echo -e "${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
}

# Main monitoring loop
while true; do
    clear_screen
    
    # Container Status
    echo -e "${BLUE}━━━ Container Status ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    printf "%-30s %-20s %s\n" "Container" "Status" "Resources (CPU | Memory)"
    echo "────────────────────────────────────────────────────────────"

    compose_cmd=()
    if [ -n "$COMPOSE_CMD_RESOLVED" ]; then
        read -r -a compose_cmd <<< "$COMPOSE_CMD_RESOLVED"
    fi

    compose_services=()
    if [ ${#compose_cmd[@]} -gt 0 ]; then
        while IFS= read -r service; do
            if [ -n "$service" ]; then
                compose_services+=("$service")
            fi
        done < <("${compose_cmd[@]}" ps --services 2>/dev/null)
    fi

    if [ ${#compose_services[@]} -eq 0 ]; then
        compose_services=(database backend frontend admin-panel nginx)
    fi

    declare -A display_names=(
        [database]="Database"
        [backend]="Backend API"
        [frontend]="Frontend"
        [admin-panel]="Admin Panel"
        [nginx]="Nginx Gateway"
    )

    for service in "${compose_services[@]}"; do
        container_identifier=""
        if [ ${#compose_cmd[@]} -gt 0 ]; then
            container_identifier=$("${compose_cmd[@]}" ps -q "$service" 2>/dev/null)
        fi

        if [ -z "$container_identifier" ]; then
            if [ "$service" = "database" ]; then
                container_identifier="phishing-coupon-platform-database-1"
            else
                container_identifier="${PROJECT_NAME}-${service}-1"
            fi
        fi

        display_name=${display_names[$service]:-$service}

        status=$(get_container_status "$container_identifier")
        stats=$(get_container_stats "$container_identifier")
        printf "%-30s %-20s %s\n" "$display_name" "$status" "$stats"
    done
    
    # Database Statistics
    echo ""
    echo -e "${BLUE}━━━ Database Records ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    db_stats=$(get_db_stats)
    if [ -n "$db_stats" ]; then
        IFS='|' read -r users coupons analytics auth_users <<< "$db_stats"
        echo -e "Users:      ${GREEN}${users:-0}${NC}    |  Coupons:    ${GREEN}${coupons:-0}${NC}"
        echo -e "Analytics:  ${GREEN}${analytics:-0}${NC}    |  Auth Users: ${GREEN}${auth_users:-0}${NC}"
    else
        echo -e "${RED}Unable to fetch database stats${NC}"
    fi
    
    # API Health
    echo ""
    echo -e "${BLUE}━━━ API Health ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Backend direct
    if curl -sf http://localhost:5000/health >/dev/null 2>&1; then
        backend_time=$(get_api_response_time)
        echo -e "Backend (direct):   ${GREEN}✓ Healthy${NC}  Response: ${backend_time}"
    else
        echo -e "Backend (direct):   ${RED}✗ Unhealthy${NC}"
    fi
    
    # Through Nginx
    if curl -sk https://localhost:8443/api/health >/dev/null 2>&1; then
        nginx_time=$(get_api_response_time)
        echo -e "Nginx Gateway:      ${GREEN}✓ Healthy${NC}  Response: ${nginx_time}"
    else
        echo -e "Nginx Gateway:      ${RED}✗ Unhealthy${NC}"
    fi
    
    # Frontend check
    if curl -sk https://localhost:8443/ >/dev/null 2>&1; then
        echo -e "Frontend:           ${GREEN}✓ Accessible${NC}"
    else
        echo -e "Frontend:           ${RED}✗ Not accessible${NC}"
    fi
    
    # Admin panel check
    if curl -sk https://localhost:8443/admin/ >/dev/null 2>&1; then
        echo -e "Admin Panel:        ${GREEN}✓ Accessible${NC}"
    else
        echo -e "Admin Panel:        ${RED}✗ Not accessible${NC}"
    fi
    
    # Recent Logs
    echo ""
    echo -e "${BLUE}━━━ Recent Activity (Last 5 log entries) ━━━━━━━━━━━━━━━${NC}"
    if [ ${#compose_cmd[@]} -gt 0 ]; then
        log_source=$("${compose_cmd[@]}" logs --tail=5 --no-log-prefix backend 2>/dev/null)
    else
        log_source=$(docker logs --tail 5 "${PROJECT_NAME}-backend-1" 2>/dev/null)
    fi

    printf '%s\n' "$log_source" | tail -5 | while read -r line; do
        if echo "$line" | grep -qi "error"; then
            echo -e "${RED}$line${NC}"
        elif echo "$line" | grep -qi "warn"; then
            echo -e "${YELLOW}$line${NC}"
        else
            echo -e "${line}"
        fi
    done
    
    # System Resources
    echo ""
    echo -e "${BLUE}━━━ System Resources ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Docker disk usage
    docker_size=$(docker system df --format "{{.Size}}" 2>/dev/null | head -1)
    echo -e "Docker disk usage:  ${CYAN}${docker_size}${NC}"
    
    # Volume size
    volume_size=$(docker volume ls -q | xargs docker volume inspect --format '{{.Name}} {{.Mountpoint}}' | grep phishing | head -1)
    if [ -n "$volume_size" ]; then
        vol_name=$(echo $volume_size | awk '{print $1}')
        echo -e "Database volume:    ${CYAN}${vol_name}${NC}"
    fi
    
    # Network status
    echo ""
    echo -e "${BLUE}━━━ Network Status ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "HTTP  (8080):       ${GREEN}http://localhost:8080${NC}"
    echo -e "HTTPS (8443):       ${GREEN}https://localhost:8443${NC}"
    echo -e "DB    (5432):       ${GREEN}Internal only${NC}"
    
    # Access URLs
    echo ""
    echo -e "${BLUE}━━━ Quick Access ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "Frontend:    ${GREEN}https://localhost:8443${NC}"
    echo -e "Admin:       ${GREEN}https://localhost:8443/admin${NC}"
    echo -e "API Health:  ${GREEN}https://localhost:8443/api/health${NC}"
    echo -e "API Docs:    ${GREEN}https://localhost:8443/api${NC}"
    
    echo ""
    echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    # Wait before refresh
    sleep 5
done
