// Turso (libSQL) adapter - cloud SQLite for Vercel deployments
import { createClient } from '@libsql/client';
import bcrypt from 'bcryptjs';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Initialize database schema
export async function initDatabase() {
  await turso.batch([
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    `CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL CHECK(type IN ('daily', 'weekly', 'monthly', 'collection')),
      title TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS tasks (
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
    )`,

    `CREATE TABLE IF NOT EXISTS task_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      UNIQUE(task_id, date)
    )`,

    `CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS collection_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      collection_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      symbol TEXT NOT NULL,
      position INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
    )`,

    `CREATE TABLE IF NOT EXISTS moods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      mood TEXT NOT NULL CHECK(mood IN ('amazing', 'good', 'okay', 'bad', 'terrible')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, date)
    )`,

    `CREATE TABLE IF NOT EXISTS mood_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      mood TEXT NOT NULL CHECK(mood IN ('amazing', 'good', 'okay', 'bad', 'terrible')),
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )`,

    `CREATE INDEX IF NOT EXISTS idx_entries_user_date ON entries(user_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_tasks_entry ON tasks(entry_id)`,
    `CREATE INDEX IF NOT EXISTS idx_collections_user ON collections(user_id)`,
    `CREATE INDEX IF NOT EXISTS idx_moods_user_date ON moods(user_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_task_completions_task_date ON task_completions(task_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date ON mood_entries(user_id, date)`,
    `CREATE INDEX IF NOT EXISTS idx_mood_entries_user_date_time ON mood_entries(user_id, date, time)`,
  ], 'write');
}

// User operations
export const userOperations = {
  create: async (username: string, password: string) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const result = await turso.execute({
      sql: 'INSERT INTO users (username, password_hash) VALUES (?, ?)',
      args: [username, passwordHash]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  findByUsername: async (username: string) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    return result.rows[0];
  },

  findById: async (id: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  count: async () => {
    const result = await turso.execute('SELECT COUNT(*) as count FROM users');
    return Number(result.rows[0]?.count || 0);
  }
};

// Entry operations
export const entryOperations = {
  create: async (userId: number, date: string, type: string, title?: string) => {
    const result = await turso.execute({
      sql: 'INSERT INTO entries (user_id, date, type, title) VALUES (?, ?, ?, ?)',
      args: [userId, date, type, title || null]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  find: async (userId: number, date: string, type: string) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM entries WHERE user_id = ? AND date = ? AND type = ?',
      args: [userId, date, type]
    });
    return result.rows[0];
  },

  findById: async (id: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM entries WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  findByUser: async (userId: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM entries WHERE user_id = ? ORDER BY date DESC',
      args: [userId]
    });
    return result.rows;
  },

  update: async (id: number, title: string) => {
    const result = await turso.execute({
      sql: 'UPDATE entries SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [title, id]
    });
    return { lastInsertRowid: id, changes: result.rowsAffected };
  },

  delete: async (id: number) => {
    const result = await turso.execute({
      sql: 'DELETE FROM entries WHERE id = ?',
      args: [id]
    });
    return { lastInsertRowid: 0, changes: result.rowsAffected };
  }
};

// Task operations
export const taskOperations = {
  create: async (entryId: number, content: string, symbol: string, position: number, isRecurring = 0, recurrencePattern: string | null = null, parentTaskId: number | null = null) => {
    const result = await turso.execute({
      sql: 'INSERT INTO tasks (entry_id, content, symbol, position, is_recurring, recurrence_pattern, parent_task_id) VALUES (?, ?, ?, ?, ?, ?, ?)',
      args: [entryId, content, symbol, position, isRecurring, recurrencePattern, parentTaskId]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  findByEntry: async (entryId: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM tasks WHERE entry_id = ? ORDER BY position ASC',
      args: [entryId]
    });
    return result.rows;
  },

  findById: async (id: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM tasks WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  findByDateRange: async (userId: number, startDate: string, endDate: string) => {
    const result = await turso.execute({
      sql: `SELECT t.*, e.date FROM tasks t
            JOIN entries e ON t.entry_id = e.id
            WHERE e.user_id = ? AND e.date >= ? AND e.date <= ?
            ORDER BY e.date ASC, t.position ASC`,
      args: [userId, startDate, endDate]
    });
    return result.rows;
  },

  update: async (id: number, content: string, symbol: string) => {
    const result = await turso.execute({
      sql: 'UPDATE tasks SET content = ?, symbol = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [content, symbol, id]
    });
    return { lastInsertRowid: id, changes: result.rowsAffected };
  },

  setRecurring: async (id: number, isRecurring: number, recurrencePattern: string | null) => {
    const result = await turso.execute({
      sql: 'UPDATE tasks SET is_recurring = ?, recurrence_pattern = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      args: [isRecurring, recurrencePattern, id]
    });
    return { lastInsertRowid: id, changes: result.rowsAffected };
  },

  delete: async (id: number) => {
    const result = await turso.execute({
      sql: 'DELETE FROM tasks WHERE id = ?',
      args: [id]
    });
    return { lastInsertRowid: 0, changes: result.rowsAffected };
  },

  findRecurringByUser: async (userId: number) => {
    const result = await turso.execute({
      sql: `SELECT t.*, e.date as entryDate FROM tasks t
            JOIN entries e ON t.entry_id = e.id
            WHERE e.user_id = ? AND t.is_recurring = 1 AND t.parent_task_id IS NULL`,
      args: [userId]
    });
    return result.rows;
  }
};

// Task completion operations
export const taskCompletionOperations = {
  record: async (taskId: number, date: string, completed: number) => {
    const result = await turso.execute({
      sql: 'INSERT OR REPLACE INTO task_completions (task_id, date, completed) VALUES (?, ?, ?)',
      args: [taskId, date, completed]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  find: async (taskId: number, date: string) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM task_completions WHERE task_id = ? AND date = ?',
      args: [taskId, date]
    });
    return result.rows[0];
  }
};

// Collection operations
export const collectionOperations = {
  create: async (userId: number, name: string, description?: string) => {
    const result = await turso.execute({
      sql: 'INSERT INTO collections (user_id, name, description) VALUES (?, ?, ?)',
      args: [userId, name, description || null]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  findByUser: async (userId: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM collections WHERE user_id = ? ORDER BY created_at DESC',
      args: [userId]
    });
    return result.rows;
  },

  findById: async (id: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM collections WHERE id = ?',
      args: [id]
    });
    return result.rows[0];
  },

  update: async (id: number, name: string, description?: string) => {
    const result = await turso.execute({
      sql: 'UPDATE collections SET name = ?, description = ? WHERE id = ?',
      args: [name, description || null, id]
    });
    return { lastInsertRowid: id, changes: result.rowsAffected };
  },

  delete: async (id: number) => {
    const result = await turso.execute({
      sql: 'DELETE FROM collections WHERE id = ?',
      args: [id]
    });
    return { lastInsertRowid: 0, changes: result.rowsAffected };
  }
};

// Collection item operations
export const collectionItemOperations = {
  create: async (collectionId: number, content: string, symbol: string, position: number) => {
    const result = await turso.execute({
      sql: 'INSERT INTO collection_items (collection_id, content, symbol, position) VALUES (?, ?, ?, ?)',
      args: [collectionId, content, symbol, position]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  findByCollection: async (collectionId: number) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM collection_items WHERE collection_id = ? ORDER BY position ASC',
      args: [collectionId]
    });
    return result.rows;
  },

  update: async (id: number, content: string, symbol: string) => {
    const result = await turso.execute({
      sql: 'UPDATE collection_items SET content = ?, symbol = ? WHERE id = ?',
      args: [content, symbol, id]
    });
    return { lastInsertRowid: id, changes: result.rowsAffected };
  },

  delete: async (id: number) => {
    const result = await turso.execute({
      sql: 'DELETE FROM collection_items WHERE id = ?',
      args: [id]
    });
    return { lastInsertRowid: 0, changes: result.rowsAffected };
  }
};

// Mood operations (old table)
export const moodOperations = {
  create: async (userId: number, date: string, mood: string, note?: string) => {
    const result = await turso.execute({
      sql: 'INSERT OR REPLACE INTO moods (user_id, date, mood, note) VALUES (?, ?, ?, ?)',
      args: [userId, date, mood, note || null]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  find: async (userId: number, date: string) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM moods WHERE user_id = ? AND date = ?',
      args: [userId, date]
    });
    return result.rows[0];
  }
};

// Mood entry operations (new table)
export const moodEntryOperations = {
  create: async (userId: number, date: string, time: string, mood: string, note?: string) => {
    const result = await turso.execute({
      sql: 'INSERT INTO mood_entries (user_id, date, time, mood, note) VALUES (?, ?, ?, ?, ?)',
      args: [userId, date, time, mood, note || null]
    });
    return { lastInsertRowid: result.lastInsertRowid, changes: result.rowsAffected };
  },

  findByDate: async (userId: number, date: string) => {
    const result = await turso.execute({
      sql: 'SELECT * FROM mood_entries WHERE user_id = ? AND date = ? ORDER BY time ASC',
      args: [userId, date]
    });
    return result.rows;
  },

  delete: async (id: number, userId: number) => {
    const result = await turso.execute({
      sql: 'DELETE FROM mood_entries WHERE id = ? AND user_id = ?',
      args: [id, userId]
    });
    return { lastInsertRowid: 0, changes: result.rowsAffected };
  }
};

// Stats operations
export const statsOperations = {
  getTaskStats: async (userId: number, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const result = await turso.execute({
      sql: `SELECT
              SUM(CASE WHEN t.symbol = 'complete' THEN 1 ELSE 0 END) as completed,
              SUM(CASE WHEN t.symbol = 'bullet' THEN 1 ELSE 0 END) as open,
              SUM(CASE WHEN t.symbol = 'migrated' THEN 1 ELSE 0 END) as migrated,
              SUM(CASE WHEN t.symbol = 'scheduled' THEN 1 ELSE 0 END) as scheduled
            FROM tasks t
            JOIN entries e ON t.entry_id = e.id
            WHERE e.user_id = ? AND e.date >= ?`,
      args: [userId, startDateStr]
    });

    const row = result.rows[0];
    return {
      completed: Number(row?.completed || 0),
      open: Number(row?.open || 0),
      migrated: Number(row?.migrated || 0),
      scheduled: Number(row?.scheduled || 0)
    };
  }
};

export default turso;
