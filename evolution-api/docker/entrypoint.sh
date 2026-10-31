#!/bin/bash
set -e
cd /evolution
mkdir -p /app/instances /app/store
# Idempotent; nothing is written outside /app.
./node_modules/.bin/prisma migrate deploy --schema ./prisma/postgresql-schema.prisma
exec node dist/main
