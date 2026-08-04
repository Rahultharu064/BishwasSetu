#!/bin/sh
# Applies any pending Prisma migrations before the server accepts traffic.
# Without this the container starts against an empty database and every query
# fails with P2021 ("The table `...` does not exist in the current database").
set -e

echo "[entrypoint] Applying database migrations..."
./node_modules/.bin/prisma migrate deploy

echo "[entrypoint] Migrations applied. Starting server..."
# exec so node stays PID 1 and receives SIGTERM for the graceful shutdown in server.ts
exec node dist/server.js
