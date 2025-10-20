# Demo Mode

Demo Mode allows you to run Self Journal with automatic login, perfect for showcasing the application or providing a public demo instance.

## Features

- **Auto-login**: Users are automatically logged in as a demo user
- **No authentication required**: Skip the login page entirely
- **Pre-populated data**: Demo user comes with sample tasks, collections, and mood entries
- **Demo Mode Banner**: Fixed footer banner indicating demo mode is active
- **Easy setup**: Single environment variable to enable

## Setup

### 1. Create Demo User and Sample Data

Run the seed script to create the demo user and populate with sample data:

```bash
npm run seed:demo
```

This will create:
- Demo user (username: `demo`, password: `demo123`)
- Sample daily entries for the last 7 days
- Sample tasks (completed, in-progress, and todo)
- Sample collections (Work Projects, Personal Goals, Reading List)
- Sample mood entries with ratings

### 2. Enable Demo Mode

Add or update the following environment variable in your `.env` file:

```bash
DEMO_MODE=true
```

### 3. Restart the Application

```bash
npm run dev
# or in production
npm start
```

## How It Works

When `DEMO_MODE=true`:

1. **Middleware Check**: The middleware detects unauthenticated users
2. **Auto-redirect**: Users are redirected to the login page
3. **Auto-login**: The login page automatically signs in with demo credentials
4. **Demo Banner**: A fixed footer banner appears indicating demo mode is active
5. **Seamless Experience**: Users are immediately redirected to the dashboard

### Demo Mode Banner

The demo mode banner:
- Appears at the bottom of every page when `DEMO_MODE=true`
- Shows "Demo Mode Active" with an info icon
- Includes a message that data is temporary and resets periodically
- Can be dismissed by users (but will reappear on page refresh)
- Automatically adds padding to the body to prevent content overlap
- Responsive design with different messages for mobile and desktop

## Production Deployment

For a public demo instance:

1. Set up your production environment with a dedicated database
2. Run the seed script on the production database:
   ```bash
   npm run seed:demo
   ```
3. Set `DEMO_MODE=true` in your production environment variables
4. Deploy your application

### Important Considerations for Production Demo

- **Data Persistence**: Demo data persists across sessions. Consider:
  - Using a read-only database
  - Implementing periodic data reset
  - Running the seed script on a schedule to refresh data

- **Resource Management**:
  - Monitor database size as users add data
  - Consider implementing data cleanup scripts
  - Set up alerts for unusual activity

- **Privacy Notice**: The built-in demo banner automatically informs users that:
  - This is a demo environment
  - Data may be reset periodically
  - Data is temporary and for preview purposes only

## Disabling Demo Mode

To disable demo mode and require normal authentication:

```bash
DEMO_MODE=false
# or remove the line entirely
```

Then restart the application.

## Demo Credentials

If you need to manually login (e.g., for testing):

- **Username**: `demo`
- **Password**: `demo123`

## Troubleshooting

### Auto-login not working

1. Check that `DEMO_MODE=true` in your `.env` file
2. Verify the demo user exists in the database
3. Clear your browser cache and cookies
4. Check the browser console for errors

### Demo user doesn't exist

Run the seed script:
```bash
npm run seed:demo
```

### Need to reset demo data

1. Delete the demo user's data (or entire database)
2. Run the seed script again:
   ```bash
   npm run seed:demo
   ```

## Example: Automatic Data Reset Script

For a production demo, you might want to reset data periodically. Here's an example script you could run as a cron job:

```bash
#!/bin/bash
# reset-demo.sh

# Backup current database
cp selfjournal.db selfjournal.db.backup

# Clear demo user's data
npx prisma db execute --stdin < scripts/clear-demo-data.sql

# Re-seed demo data
npm run seed:demo

echo "Demo data reset complete"
```

Run this script daily or weekly depending on your needs.
