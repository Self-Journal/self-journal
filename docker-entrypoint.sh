#!/bin/sh
set -e

# Set DATABASE_URL if not already set
if [ -z "$DATABASE_URL" ]; then
  export DATABASE_URL="file:/app/data/selfjournal.db"
  echo "DATABASE_URL not set, using default: $DATABASE_URL"
fi

echo "Current DATABASE_URL: $DATABASE_URL"

# Check if database file exists
DB_FILE="/app/data/selfjournal.db"

if [ ! -f "$DB_FILE" ]; then
  echo "Database not found at $DB_FILE"
  echo "Running initial migration..."
  npx prisma migrate deploy --schema=./prisma/schema.prisma
  echo "Database initialized successfully"

  # Verify database was created
  if [ -f "$DB_FILE" ]; then
    echo "✓ Database file created successfully"
  else
    echo "✗ ERROR: Database file was not created!"
    exit 1
  fi
else
  echo "Database exists at $DB_FILE"

  # Check if tables exist
  TABLES_COUNT=$(sqlite3 "$DB_FILE" "SELECT count(*) FROM sqlite_master WHERE type='table' AND name='User';" 2>/dev/null || echo "0")

  if [ "$TABLES_COUNT" = "0" ]; then
    echo "⚠ Database file exists but tables are missing!"
    echo "This might be a corrupted database. Removing and recreating..."
    rm -f "$DB_FILE"
    npx prisma migrate deploy --schema=./prisma/schema.prisma
    echo "✓ Database recreated with schema"
  else
    echo "✓ Tables exist. Checking for pending migrations..."
    npx prisma migrate deploy --schema=./prisma/schema.prisma
  fi
fi

echo "Generating Prisma Client..."
npx prisma generate --schema=./prisma/schema.prisma

echo "Starting Next.js server..."
exec node server.js
