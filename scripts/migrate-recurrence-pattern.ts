import Database from 'better-sqlite3';
import { join } from 'path';

const dbPath = join(process.cwd(), 'bulletjournal.db');
const db = new Database(dbPath);

console.log('Starting migration: Adding recurrence pattern fields...');

try {
  // Check if recurrence_pattern column already exists
  const columns = db.prepare("PRAGMA table_info(tasks)").all() as any[];
  const hasRecurrencePattern = columns.some(col => col.name === 'recurrence_pattern');
  const hasParentTaskId = columns.some(col => col.name === 'parent_task_id');

  if (!hasRecurrencePattern) {
    console.log('Adding recurrence_pattern column to tasks table...');
    db.exec("ALTER TABLE tasks ADD COLUMN recurrence_pattern TEXT CHECK(recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly', NULL))");
    console.log('✓ Added recurrence_pattern column');
  } else {
    console.log('✓ recurrence_pattern column already exists');
  }

  if (!hasParentTaskId) {
    console.log('Adding parent_task_id column to tasks table...');
    db.exec('ALTER TABLE tasks ADD COLUMN parent_task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL');
    console.log('✓ Added parent_task_id column');
  } else {
    console.log('✓ parent_task_id column already exists');
  }

  console.log('\n✅ Migration completed successfully!');
} catch (error) {
  console.error('❌ Migration failed:', error);
  process.exit(1);
} finally {
  db.close();
}
