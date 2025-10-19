// Shared database types and interfaces

export type MoodType = 'amazing' | 'good' | 'okay' | 'bad' | 'terrible';
export type TaskSymbol = 'bullet' | 'complete' | 'migrated' | 'scheduled' | 'note' | 'event';
export type EntryType = 'daily' | 'weekly' | 'monthly' | 'collection';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

// Database operation result types
export interface RunResult {
  lastInsertRowid: number | bigint;
  changes: number;
}

// Database abstraction interface
export interface DatabaseAdapter {
  // User operations
  createUser(username: string, password: string): RunResult;
  findUserByUsername(username: string): any;
  findUserById(id: number): any;
  countUsers(): number;

  // Entry operations
  createEntry(userId: number, date: string, type: EntryType, title?: string): RunResult;
  findEntry(userId: number, date: string, type: EntryType): any;
  findEntryById(id: number): any;
  findEntriesByUser(userId: number): any[];
  updateEntry(id: number, title: string): RunResult;
  deleteEntry(id: number): RunResult;

  // Task operations
  createTask(
    entryId: number,
    content: string,
    symbol: TaskSymbol,
    position: number,
    isRecurring?: number,
    recurrencePattern?: RecurrencePattern | null,
    parentTaskId?: number | null
  ): RunResult;
  findTasksByEntry(entryId: number): any[];
  findTaskById(id: number): any;
  findTasksByDateRange(userId: number, startDate: string, endDate: string): any[];
  updateTask(id: number, content: string, symbol: TaskSymbol): RunResult;
  setRecurring(id: number, isRecurring: number, recurrencePattern: RecurrencePattern | null): RunResult;
  deleteTask(id: number): RunResult;
  findRecurringTasksByUser(userId: number): any[];

  // Task completion operations
  recordTaskCompletion(taskId: number, date: string, completed: number): RunResult;
  findTaskCompletion(taskId: number, date: string): any;

  // Collection operations
  createCollection(userId: number, name: string, description?: string): RunResult;
  findCollectionsByUser(userId: number): any[];
  findCollectionById(id: number): any;
  updateCollection(id: number, name: string, description?: string): RunResult;
  deleteCollection(id: number): RunResult;

  // Collection item operations
  createCollectionItem(collectionId: number, content: string, symbol: TaskSymbol, position: number): RunResult;
  findItemsByCollection(collectionId: number): any[];
  updateCollectionItem(id: number, content: string, symbol: TaskSymbol): RunResult;
  deleteCollectionItem(id: number): RunResult;

  // Mood operations (old table)
  createMood(userId: number, date: string, mood: MoodType, note?: string): RunResult;
  findMood(userId: number, date: string): any;

  // Mood entry operations (new table)
  createMoodEntry(userId: number, date: string, time: string, mood: MoodType, note?: string): RunResult;
  findMoodEntries(userId: number, date: string): any[];
  deleteMoodEntry(id: number, userId: number): RunResult;

  // Stats operations
  getTaskStats(userId: number, days?: number): any;

  // Initialization
  initialize(): void;

  // Cleanup
  close?(): void;
}
