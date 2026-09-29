#!/bin/sh
set -e

# ==============================================================================
# GovOS Core API - Container Entrypoint
# Resolves database & redis credentials across Render, Supabase, Neon & local
# ==============================================================================

# If DATABASE_URL is provided (e.g., by Render attached database postgres:// or postgresql://)
if [ -n "$DATABASE_URL" ]; then
    echo "[GovOS Entrypoint] Detected DATABASE_URL. Parsing for Spring Boot JDBC..."
    PROTO_STRIPPED=$(echo "$DATABASE_URL" | sed -E 's|^postgres(ql)?://||')
    
    if echo "$PROTO_STRIPPED" | grep -q "@"; then
        USERINFO=$(echo "$PROTO_STRIPPED" | cut -d'@' -f1)
        HOSTPART=$(echo "$PROTO_STRIPPED" | cut -d'@' -f2-)
        
        DB_USER=$(echo "$USERINFO" | cut -d':' -f1)
        DB_PASS=$(echo "$USERINFO" | cut -d':' -f2-)
        
        export SPRING_DATASOURCE_USERNAME="${SPRING_DATASOURCE_USERNAME:-$DB_USER}"
        export SPRING_DATASOURCE_PASSWORD="${SPRING_DATASOURCE_PASSWORD:-$DB_PASS}"
        export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:postgresql://$HOSTPART}"
    else
        export SPRING_DATASOURCE_URL="${SPRING_DATASOURCE_URL:-jdbc:postgresql://$PROTO_STRIPPED}"
    fi
    echo "[GovOS Entrypoint] Configured JDBC URL: $SPRING_DATASOURCE_URL (User: $SPRING_DATASOURCE_USERNAME)"
fi

# If REDIS_URL is provided (e.g. from Render Redis)
if [ -n "$REDIS_URL" ]; then
    echo "[GovOS Entrypoint] Detected REDIS_URL. Parsing for Spring Data Redis..."
    REDIS_STRIPPED=$(echo "$REDIS_URL" | sed -E 's|^rediss?://||')
    if echo "$REDIS_STRIPPED" | grep -q "@"; then
        R_AUTH=$(echo "$REDIS_STRIPPED" | cut -d'@' -f1)
        R_HOSTPORT=$(echo "$REDIS_STRIPPED" | cut -d'@' -f2-)
        
        R_PASS=$(echo "$R_AUTH" | cut -d':' -f2-)
        R_HOST=$(echo "$R_HOSTPORT" | cut -d':' -f1)
        R_PORT=$(echo "$R_HOSTPORT" | cut -d':' -f2 | cut -d'/' -f1)
        
        export SPRING_REDIS_HOST="${SPRING_REDIS_HOST:-$R_HOST}"
        export SPRING_REDIS_PORT="${SPRING_REDIS_PORT:-${R_PORT:-6379}}"
        export SPRING_REDIS_PASSWORD="${SPRING_REDIS_PASSWORD:-$R_PASS}"
    else
        R_HOST=$(echo "$REDIS_STRIPPED" | cut -d':' -f1)
        R_PORT=$(echo "$REDIS_STRIPPED" | cut -d':' -f2 | cut -d'/' -f1)
        export SPRING_REDIS_HOST="${SPRING_REDIS_HOST:-$R_HOST}"
        export SPRING_REDIS_PORT="${SPRING_REDIS_PORT:-${R_PORT:-6379}}"
    fi
fi

exec java $JAVA_OPTS -Dserver.port="${PORT:-8080}" -jar app.jar
