#!/bin/bash
BACKUP_FILE="database/backups/backup_$(date +%Y%m%d_%H%M%S).sql"
docker-compose exec -T database pg_dump -U phishuser phishguard > "$BACKUP_FILE"
echo "✅ Backup saved: $BACKUP_FILE"
