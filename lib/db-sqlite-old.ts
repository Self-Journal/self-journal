import Database from 'better-sqlite3';
import { join } from 'path';
import bcrypt from 'bcryptjs';

const dbPath = join(process.cwd(), 'bulletjournal.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize database schema
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('daily', 'weekly', 'monthly', 'collection')),
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      symbol TEXT NOT NULL CHECK(symbol IN ('bullet', 'complete', 'migrated', 'scheduled', 'note', 'event')),
      position INTEGER NOT NULL,
      is_recurring INTEGER DEFAULT 0,
      recurrence_pattern TEXT CHECK(recurrence_pattern IN ('daily', 'weekly', 'monthly', 'yearly', NULL)),
      parent_task_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (entry_id) REFERENCES entries(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_task_id) REFERENCES tasks(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS task_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id, date)
    );

    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      symbol TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      mood TEXT NOT NULL CHECK(mood IN ('amazing', 'good', 'okay', 'bad', 'terrible')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    );

    CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_tasks_entry ON tasks(entry_id);
    CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id);
    CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date);
    CREATE INDEX IF NOT EXISTS idx_task_completions_task_date ON task_completions(task_id, date);
  `);
}

// User operations
export const userOperations = {
  create: (username: string, password: string) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    return stmt.run(username, passwordHash);
  },

  findByUsername: (username: string) => {
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    return stmt.get(username) as { id: number; username: string; password_hash: string } | undefined;
  },

  verifyPassword: (username: string, password: string) => {
    const user = userOperations.findByUsername(username);
    if (!user) return null;
    const isValid = bcrypt.compareSync(password, user.password_hash);
    return isValid ? { id: user.id, username: user.username } : null;
  }
};

// Entry operations
export const entryOperations = {
  create: (userId: number, date: string, type: string, title?: string) => {
    const stmt = db.prepare('INSERT INTO entries (user_id, date, type, title) VALUES (?, ?, ?, ?)');
    return stmt.run(userId, date, type, title);
  },

  findByUserAndDate: (userId: number, date: string, type: string) => {
    const stmt = db.prepare('SELECT * FROM entries WHERE user_id = ? AND date = ? AND type = ?');
    return stmt.get(userId, date, type) as { id: number; user_id: number; date: string; type: string; title?: string } | undefined;
  },

  findByUser: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC');
    return stmt.all(userId);
  },

  update: (id: number, title: string) => {
    const stmt = db.prepare('UPDATE entries SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(title, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM entries WHERE id = ?');
    return stmt.run(id);
  }
};

// Task operations
export const taskOperations = {
  create: (entryId: number, content: string, symbol: string, position: number, isRecurring = 0, recurrencePattern: string | null = null, parentTaskId: number | null = null) => {
    const stmt = db.prepare('INSERT INTO tasks (entry_id, content, symbol, position, is_recurring, recurrence_pattern, parent_task_id) VALUES (?, ?, ?, ?, ?, ?, ?)');
    return stmt.run(entryId, content, symbol, position, isRecurring, recurrencePattern, parentTaskId);
  },

  findByEntry: (entryId: number) => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE entry_id = ? ORDER BY position');
    return stmt.all(entryId);
  },

  findById: (id: number) => {
    const stmt = db.prepare('SELECT * FROM tasks WHERE id = ?');
    return stmt.get(id);
  },

  update: (id: number, content: string, symbol: string) => {
    const stmt = db.prepare('UPDATE tasks SET content = ?, symbol = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(content, symbol, id);
  },

  setRecurring: (id: number, isRecurring: number, recurrencePattern: string | null) => {
    const stmt = db.prepare('UPDATE tasks SET is_recurring = ?, recurrence_pattern = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    return stmt.run(isRecurring, recurrencePattern, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
    return stmt.run(id);
  },

  reorder: (updates: { id: number; position: number }[]) => {
    const stmt = db.prepare('UPDATE tasks SET position = ? WHERE id = ?');
    const transaction = db.transaction(() => {
      updates.forEach(({ id, position }) => stmt.run(position, id));
    });
    transaction();
  }
};

// Task completion operations
export const taskCompletionOperations = {
  recordCompletion: (taskId: number, date: string, completed = 1) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO task_completions (task_id, date, completed) VALUES (?, ?, ?)');
    return stmt.run(taskId, date, completed);
  },

  findByTask: (taskId: number) => {
    const stmt = db.prepare('SELECT * FROM task_completions WHERE task_id = ? ORDER BY date DESC');
    return stmt.all(taskId);
  },

  findByTaskAndDateRange: (taskId: number, startDate: string, endDate: string) => {
    const stmt = db.prepare('SELECT * FROM task_completions WHERE task_id = ? AND date >= ? AND date <= ? ORDER BY date');
    return stmt.all(taskId, startDate, endDate);
  },

  delete: (taskId: number, date: string) => {
    const stmt = db.prepare('DELETE FROM task_completions WHERE task_id = ? AND date = ?');
    return stmt.run(taskId, date);
  }
};

// Collection operations
export const collectionOperations = {
  create: (userId: number, name: string, description?: string) => {
    const stmt = db.prepare('INSERT INTO collections (user_id, name, description) VALUES (?, ?, ?)');
    return stmt.run(userId, name, description);
  },

  findByUser: (userId: number) => {
    const stmt = db.prepare('SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId);
  },

  update: (id: number, name: string, description?: string) => {
    const stmt = db.prepare('UPDATE collections SET name = ?, description = ? WHERE id = ?');
    return stmt.run(name, description, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM collections WHERE id = ?');
    return stmt.run(id);
  }
};

// Collection item operations
export const collectionItemOperations = {
  create: (collectionId: number, content: string, symbol: string, position: number) => {
    const stmt = db.prepare('INSERT INTO collection_items (collection_id, content, symbol, position) VALUES (?, ?, ?, ?)');
    return stmt.run(collectionId, content, symbol, position);
  },

  findByCollection: (collectionId: number) => {
    const stmt = db.prepare('SELECT * FROM collection_items WHERE collection_id = ? ORDER BY position');
    return stmt.all(collectionId);
  },

  update: (id: number, content: string, symbol: string) => {
    const stmt = db.prepare('UPDATE collection_items SET content = ?, symbol = ? WHERE id = ?');
    return stmt.run(content, symbol, id);
  },

  delete: (id: number) => {
    const stmt = db.prepare('DELETE FROM collection_items WHERE id = ?');
    return stmt.run(id);
  }
};

// Initialize database on import
initDatabase();

export default db;
