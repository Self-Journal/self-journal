# Database Setup Guide

SelfJournal supports **two database options**: SQLite and PostgreSQL. You can choose based on your deployment target.

## 🎯 Quick Decision Matrix

| Deployment Target | Recommended Database | Why? |
|-------------------|---------------------|------|
| **Vercel** | PostgreSQL (Supabase) | Serverless, no persistent filesystem |
| **Railway** | SQLite or PostgreSQL | Both work great, SQLite is simpler |
| **Docker/VPS** | SQLite | Simple, no external dependencies |
| **Large Scale** | PostgreSQL | Better for 1000+ concurrent users |

## Option 1: SQLite (Default)

**Best for:** Railway, Docker, VPS, local development

### Advantages
- ✅ **Zero configuration** - just works
- ✅ **No external dependencies**
- ✅ **Perfect for self-hosting**
- ✅ **Automatic backups** (just copy the file)
- ✅ **Fast for small-medium workloads**

### Setup

1. Copy environment variables:
```bash
cp .env.example .env
```

2. Your `.env` should have:
```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./bulletjournal.db"
```

3. Run migrations:
```bash
npx prisma migrate deploy
```

4. Done! The database file `bulletjournal.db` will be created automatically.

### Backup SQLite

```bash
# Manual backup
cp bulletjournal.db backups/bulletjournal-$(date +%Y%m%d).db

# Automated backup (add to cron)
0 0 * * * cp /path/to/bulletjournal.db /path/to/backups/bulletjournal-$(date +\%Y\%m\%d).db
```

## Option 2: PostgreSQL with Supabase

**Best for:** Vercel, scalable cloud deployments

### Advantages
- ✅ **Works on Vercel** (serverless-friendly)
- ✅ **Scalable** to millions of users
- ✅ **Supabase free tier** (500MB database, generous limits)
- ✅ **Built-in Auth, Storage** (for future features)
- ✅ **Automatic backups** by Supabase

### Setup

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Choose a name, password, and region
   - Wait for project to be ready (~2 minutes)

2. **Get Database URL**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - It looks like: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

3. **Update Schema for PostgreSQL**

   Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"  // Changed from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

4. **Configure Environment**

   Your `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

5. **Run Migrations**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

6. **Deploy to Vercel**
   - Add `DATABASE_URL` to Vercel environment variables
   - Deploy!

### Supabase Free Tier Limits
- ✅ 500MB database storage
- ✅ 2GB bandwidth per month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests

**Perfect for:**
- Personal use
- Small teams (< 50 users)
- MVPs and demos
- Vercel OSS Program applications

## Option 3: PostgreSQL (Self-hosted)

**Best for:** Organizations with existing PostgreSQL infrastructure

### Setup

1. **Install PostgreSQL** (if not already):
   ```bash
   # Ubuntu/Debian
   sudo apt install postgresql postgresql-contrib

   # macOS
   brew install postgresql
   ```

2. **Create Database**:
   ```bash
   sudo -u postgres psql
   CREATE DATABASE selfjournal;
   CREATE USER selfjournal_user WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE selfjournal TO selfjournal_user;
   \q
   ```

3. **Update Schema**:

   Edit `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

4. **Configure Environment**:
   ```env
   DATABASE_URL="postgresql://selfjournal_user:your_password@localhost:5432/selfjournal"
   ```

5. **Run Migrations**:
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   ```

## Switching Databases

### From SQLite to PostgreSQL

1. **Export data from SQLite**:
   ```bash
   npx prisma db pull --schema=prisma/schema.prisma
   # Your data is in bulletjournal.db
   ```

2. **Update schema** to PostgreSQL

3. **Import data**:
   - Use a tool like [pgloader](https://pgloader.io/)
   - Or manually export/import via Prisma

### From PostgreSQL to SQLite

1. Export data from PostgreSQL
2. Update schema to SQLite
3. Import data

## Database Maintenance

### View Database Contents

**SQLite:**
```bash
sqlite3 bulletjournal.db
.tables
SELECT * FROM users;
.quit
```

**PostgreSQL:**
```bash
psql $DATABASE_URL
\dt
SELECT * FROM users;
\q
```

### Reset Database

```bash
# ⚠️ WARNING: This deletes all data!
npx prisma migrate reset
```

### Update Schema

After modifying `prisma/schema.prisma`:

```bash
# Create migration
npx prisma migrate dev --name description_of_changes

# Apply in production
npx prisma migrate deploy
```

## Troubleshooting

### "Can't reach database server"

**SQLite:**
- Check file permissions
- Ensure directory exists
- Verify DATABASE_URL path

**PostgreSQL:**
- Check connection string
- Verify database exists
- Check firewall/network

### "Migration failed"

```bash
# Mark migration as applied (if already run)
npx prisma migrate resolve --applied MIGRATION_NAME

# Rollback last migration
npx prisma migrate resolve --rolled-back MIGRATION_NAME
```

### "Prisma Client not found"

```bash
npx prisma generate
```

## Performance Tips

### SQLite
- Enable WAL mode (auto-enabled by Prisma)
- Use indexes (already configured)
- Keep database file on SSD
- Backup regularly

### PostgreSQL
- Use connection pooling (Supabase has this built-in)
- Monitor query performance
- Add indexes for frequently queried fields
- Use Supabase dashboard for analytics

## Next Steps

After setting up your database:

1. ✅ Run the application: `npm run dev`
2. ✅ Create your first user
3. ✅ Start journaling!
4. ✅ Set up backups (SQLite) or monitor Supabase dashboard

## Getting Help

- **Prisma Docs**: https://www.prisma.io/docs
- **Supabase Docs**: https://supabase.com/docs
- **SelfJournal Issues**: https://github.com/Self-Journal/self-journal/issues

---

**Questions?** Open an issue or discussion on GitHub!
