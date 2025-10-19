#!/bin/sh
set -e

# Set DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/selfjournal.db"
  echo "DATABASE_URL not set, using default: $DATABASE_URL"
fi

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Starting Next.js server..."
exec node server.js
