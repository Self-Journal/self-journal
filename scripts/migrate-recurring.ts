import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'bulletjournal.db');
const db = new Database(dbPath);

console.log('Starting migration: Adding recurring task support...');

try {
  // Check if is_recurring column already exists
  const columns = db.prepare("PRAGMA table_info(tasks)").all() as any[];
  const hasIsRecurring = columns.some(col => col.name === 'is_recurring');

  if (!hasIsRecurring) {
    console.log('Adding is_recurring column to tasks table...');
    db.exec('ALTER TABLE tasks ADD COLUMN is_recurring INTEGER DEFAULT 0');
    console.log('✓ Added is_recurring column');
  } else {
    console.log('✓ is_recurring column already exists');
  }

  // Check if task_completions table exists
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='task_completions'").all();

  if (tables.length === 0) {
    console.log('Creating task_completions table...');
    db.exec(`
      CREATE TABLE task_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        completed INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        UNIQUE(task_id, date)
      );

      CREATE INDEX idx_task_completions_task_date ON task_completions(task_id, date);
    `);
    console.log('✓ Created task_completions table and index');
  } else {
    console.log('✓ task_completions table already exists');
  }

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
