# SelfJournal

> Your personal productivity companion that adapts to your life

A modern, privacy-first Bullet Journal Progressive Web App that combines the proven Bullet Journal methodology with smart features like recurring tasks, mood tracking, and productivity insights.

![License](https://img.shields.io/github/license/Self-Journal/self-journal)
![GitHub stars](https://img.shields.io/github/stars/Self-Journal/self-journal)
![GitHub issues](https://img.shields.io/github/issues/Self-Journal/self-journal)

## ✨ Features

- **📝 True Bullet Journal Methodology** - Rapid logging with bullets, tasks, events, and notes
- **📱 Mobile-First PWA** - Works offline, installable on any device
- **🔄 Smart Recurring Tasks** - Daily, weekly, monthly, and yearly task patterns
- **😊 Mood Tracking Timeline** - Log multiple moods per day with contextual notes
- **📊 Productivity Insights** - Activity heatmaps and performance analytics
- **📚 Collections** - Organize related entries and tasks
- **🎯 Multi-View Navigation** - Daily, Weekly, Monthly, and Index views
- **🔒 Privacy-First** - All data stored locally in SQLite
- **🎨 Beautiful Design** - Clean, minimal interface with dark mode
- **💰 Free & Open Source** - MIT licensed

## 🚀 Quick Start

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Self-Journal/self-journal&env=NEXTAUTH_SECRET,NEXTAUTH_URL&envDescription=Required%20environment%20variables&envLink=https://github.com/Self-Journal/self-journal%23environment-variables)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/selfjournal)

### Docker (Recommended for Self-Hosting)

```bash
# Clone the repository
git clone https://github.com/Self-Journal/self-journal.git
cd selfjournal

# Copy environment variables
cp .env.example .env

# Edit .env and set your NEXTAUTH_SECRET
# Generate one with: openssl rand -base64 32

# Start with Docker Compose
docker-compose up -d

# Access at http://localhost:3000
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/Self-Journal/self-journal.git
cd selfjournal

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your NEXTAUTH_SECRET

# Start development server
npm run dev

# Access at http://localhost:3000
```

## 📦 Deployment Options

### Vercel

1. Click the "Deploy with Vercel" button above
2. Set environment variables:
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL`: Your Vercel URL (e.g., `https://yourapp.vercel.app`)
3. Deploy!

**Note:** Vercel uses ephemeral storage. For production use with persistent data, consider Docker or Railway.

### Railway

1. Click the "Deploy on Railway" button above
2. Railway will auto-generate `NEXTAUTH_SECRET`
3. Set `NEXTAUTH_URL` to your Railway URL
4. Deploy with persistent volume for SQLite database

### Docker

**Using Docker Compose (Recommended):**

```bash
docker-compose up -d
```

**Manual Docker:**

```bash
# Build the image
docker build -t selfjournal .

# Run the container
docker run -d \
  -p 3000:3000 \
  -e NEXTAUTH_SECRET="your-secret-here" \
  -e NEXTAUTH_URL="https://yourdomain.com" \
  -v selfjournal-data:/app/data \
  --name selfjournal \
  selfjournal
```

### Self-Hosted (VPS)

```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup
git clone https://github.com/Self-Journal/self-journal.git
cd selfjournal
npm install
npm run build

# Set up environment
cp .env.example .env
# Edit .env with your values

# Start with PM2 (production process manager)
npm install -g pm2
pm2 start npm --name selfjournal -- start
pm2 save
pm2 startup
```

## 🔧 Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXTAUTH_SECRET` | Secret key for authentication (generate with `openssl rand -base64 32`) | ✅ Yes | - |
| `NEXTAUTH_URL` | Canonical URL of your deployment | ✅ Yes | `http://localhost:3000` |
| `NODE_ENV` | Environment mode | No | `development` |

## 📖 Usage Guide

### Getting Started

1. **Register** - Create your account (data stored locally)
2. **Setup** - Choose your journaling preferences
3. **Start Logging** - Use the Daily view to track tasks and moods

### Bullet Journal Basics

- **• Bullet** - Open task
- **× Complete** - Finished task
- **> Migrated** - Moved to another day
- **< Scheduled** - Planned for future
- **- Note** - General note
- **○ Event** - Special event

### Views

- **Daily** - Focus on today's tasks and mood
- **Weekly** - Plan and review your week
- **Monthly** - Big picture overview
- **Index** - Quick navigation and search
- **Collections** - Organize related tasks and notes

### Recurring Tasks

1. Create a task in Daily view
2. Tap the task menu (⋮)
3. Select "Make Recurring"
4. Choose pattern: Daily, Weekly, Monthly, or Yearly
5. Task automatically appears on future dates

### Mood Tracking

1. Tap a mood emoji in Daily view
2. Optionally add a note (predefined or custom)
3. Track multiple moods throughout the day
4. View your mood timeline and patterns

## 🛠 Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** SQLite (better-sqlite3)
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui
- **PWA:** next-pwa
- **Deployment:** Docker, Vercel, Railway

## 📊 Database Schema

SelfJournal uses SQLite for local-first data storage:

- `users` - User accounts
- `entries` - Daily/Weekly/Monthly journal entries
- `tasks` - Tasks with bullet symbols and recurrence
- `mood_entries` - Multiple mood logs per day
- `collections` - Custom collections
- `collection_items` - Items within collections

See [lib/db.ts](./lib/db.ts) for complete schema.

## 🤝 Contributing

Contributions are welcome! Please read our [Contributing Guide](CONTRIBUTING.md) first.

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/selfjournal.git

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/amazing-feature

# Make changes and test
npm run dev

# Commit with conventional commits
git commit -m "feat: add amazing feature"

# Push and create PR
git push origin feature/amazing-feature
```

## 📝 Roadmap

See [FUTURE_FEATURES.md](./FUTURE_FEATURES.md) for planned features.

**Short-term:**
- [ ] Cloud sync (optional)
- [ ] Native mobile apps (iOS/Android)
- [ ] Import/Export (JSON, Markdown)
- [ ] Templates gallery
- [ ] Habit tracking

**Long-term:**
- [ ] Collaboration features
- [ ] AI-powered insights
- [ ] Integration ecosystem
- [ ] Multi-language support

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Inspired by the [Bullet Journal Method](https://bulletjournal.com/) by Ryder Carroll
- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 💬 Community & Support

- **GitHub Issues:** [Report bugs or request features](https://github.com/Self-Journal/self-journal/issues)
- **Discussions:** [Join the conversation](https://github.com/Self-Journal/self-journal/discussions)
- **Twitter:** [@lucianfialho](https://twitter.com/lucianfialho)

## ⭐ Star History

If you find SelfJournal useful, please consider giving it a star! It helps others discover the project.

---

**Made with ❤️ for mindful productivity**
