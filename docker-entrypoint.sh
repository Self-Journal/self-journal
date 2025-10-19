#!/bin/sh
set -e

# Set DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/selfjournal.db"
  echo "DATABASE_URL not set, using default: $DATABASE_URL"
fi

# Check if database file exists
DB_FILE="/app/data/selfjournal.db"

if [ ! -f "$DB_FILE" ]; then
  echo "Database not found. Running initial migration..."
  npx prisma migrate deploy
  echo "Database initialized successfully"
else
  echo "Database exists. Checking for pending migrations..."
  npx prisma migrate deploy
fi

echo "Starting Next.js server..."
exec node server.js
