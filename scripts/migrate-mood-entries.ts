import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'bulletjournal.db');
const db = new Database(dbPath);

console.log('Starting migration: Creating mood_entries table for multiple moods per day...');

try {
  // Check if mood_entries table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='mood_entries'").all();

  if (tables.length === 0) {
    console.log('Creating mood_entries table...');
    db.exec(`
      CREATE TABLE mood_entries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        mood TEXT NOT NULL CHECK(mood IN ('amazing', 'good', 'okay', 'bad', 'terrible')),
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE INDEX idx_mood_entries_user_date ON mood_entries(user_id, date);
      CREATE INDEX idx_mood_entries_user_date_time ON mood_entries(user_id, date, time);
    `);
    console.log('✓ Created mood_entries table');

    // Migrate existing moods data to mood_entries
    console.log('Migrating existing moods data...');
    const existingMoods = db.prepare('SELECT * FROM moods').all() as any[];

    if (existingMoods.length > 0) {
      const insertStmt = db.prepare(`
        INSERT INTO mood_entries (user_id, date, time, mood, note, created_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `);

      for (const mood of existingMoods) {
        // Use created_at time if available, otherwise default to 12:00
        const createdAt = new Date(mood.created_at);
        const time = createdAt.getHours() + ':' + String(createdAt.getMinutes()).padStart(2, '0');

        insertStmt.run(
          mood.user_id,
          mood.date,
          time,
          mood.mood,
          mood.note || null,
          mood.created_at
        );
      }

      console.log(`✓ Migrated ${existingMoods.length} existing mood entries`);
    }
  } else {
    console.log('✓ mood_entries table already exists');
  }

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
