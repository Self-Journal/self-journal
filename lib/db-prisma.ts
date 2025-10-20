// Database operations using Prisma ORM
// Maintains same API as lib/db.ts for backward compatibility

import bcrypt from 'bcryptjs';
import prisma from './prisma';

// User operations
export const userOperations = {
  create: async (username: string, password: string) => {
    const passwordHash = bcrypt.hashSync(password, 10);
    const user = await prisma.user.create({
      data: {
        username,
        passwordHash,
      },
    });
    return { lastInsertRowid: user.id, changes: 1 };
  },

  findByUsername: async (username: string) => {
    return await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        passwordHash: true,
      },
    });
  },

  verifyPassword: async (username: string, password: string) => {
    const user = await userOperations.findByUsername(username);
    if (!user) {
      console.log('verifyPassword: user not found:', username);
      return null;
    }

    console.log('verifyPassword: found user:', {
      id: user.id,
      username: user.username,
      hashLength: user.passwordHash?.length,
      hashPrefix: user.passwordHash?.substring(0, 10)
    });

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    console.log('verifyPassword: bcrypt compare result:', isValid);

    return isValid ? { id: user.id, username: user.username } : null;
  },

  count: async () => {
    return await prisma.user.count();
  },

  findById: async (id: number) => {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
      },
    });
  },
};

// Entry operations
export const entryOperations = {
  create: async (userId: number, date: string, type: string, title?: string) => {
    const entry = await prisma.entry.create({
      data: {
        userId,
        date,
        type,
        title: title || null,
      },
    });
    return { lastInsertRowid: entry.id, changes: 1 };
  },

  findByUserAndDate: async (userId: number, date: string, type: string) => {
    return await prisma.entry.findFirst({
      where: {
        userId,
        date,
        type,
      },
    });
  },

  findByUser: async (userId: number) => {
    return await prisma.entry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  },

  findById: async (id: number) => {
    return await prisma.entry.findUnique({
      where: { id },
    });
  },

  update: async (id: number, title: string) => {
    await prisma.entry.update({
      where: { id },
      data: { title },
    });
    return { lastInsertRowid: id, changes: 1 };
  },

  delete: async (id: number) => {
    await prisma.entry.delete({
      where: { id },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Task operations
export const taskOperations = {
  create: async (
    entryId: number,
    content: string,
    symbol: string,
    position: number,
    isRecurring = 0,
    recurrencePattern: string | null = null,
    parentTaskId: number | null = null
  ) => {
    const task = await prisma.task.create({
      data: {
        entryId,
        content,
        symbol,
        position,
        isRecurring,
        recurrencePattern,
        parentTaskId,
      },
    });
    return { lastInsertRowid: task.id, changes: 1 };
  },

  findByEntry: async (entryId: number) => {
    return await prisma.task.findMany({
      where: { entryId },
      orderBy: { position: 'asc' },
    });
  },

  findById: async (id: number) => {
    return await prisma.task.findUnique({
      where: { id },
    });
  },

  findByDateRange: async (userId: number, startDate: string, endDate: string) => {
    return await prisma.task.findMany({
      where: {
        entry: {
          userId,
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
      },
      include: {
        entry: {
          select: {
            date: true,
          },
        },
      },
      orderBy: [{ entry: { date: 'asc' } }, { position: 'asc' }],
    });
  },

  update: async (id: number, content: string, symbol: string) => {
    await prisma.task.update({
      where: { id },
      data: { content, symbol },
    });
    return { lastInsertRowid: id, changes: 1 };
  },

  setRecurring: async (id: number, isRecurring: number, recurrencePattern: string | null) => {
    await prisma.task.update({
      where: { id },
      data: {
        isRecurring,
        recurrencePattern,
      },
    });
    return { lastInsertRowid: id, changes: 1 };
  },

  delete: async (id: number) => {
    await prisma.task.delete({
      where: { id },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },

  findRecurringByUser: async (userId: number) => {
    return await prisma.task.findMany({
      where: {
        entry: { userId },
        isRecurring: 1,
        parentTaskId: null,
      },
      include: {
        entry: {
          select: {
            date: true,
          },
        },
      },
    });
  },
};

// Task completion operations
export const taskCompletionOperations = {
  record: async (taskId: number, date: string, completed: number) => {
    const completion = await prisma.taskCompletion.upsert({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
      update: { completed },
      create: {
        taskId,
        date,
        completed,
      },
    });
    return { lastInsertRowid: completion.id, changes: 1 };
  },

  find: async (taskId: number, date: string) => {
    return await prisma.taskCompletion.findUnique({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
    });
  },

  findByTask: async (taskId: number) => {
    return await prisma.taskCompletion.findMany({
      where: { taskId },
      orderBy: { date: 'desc' },
    });
  },

  findByTaskAndDateRange: async (taskId: number, startDate: string, endDate: string) => {
    return await prisma.taskCompletion.findMany({
      where: {
        taskId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'asc' },
    });
  },

  recordCompletion: async (taskId: number, date: string, completed: number) => {
    const completion = await prisma.taskCompletion.upsert({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
      update: { completed },
      create: {
        taskId,
        date,
        completed,
      },
    });
    return { lastInsertRowid: completion.id, changes: 1 };
  },

  delete: async (taskId: number, date: string) => {
    await prisma.taskCompletion.delete({
      where: {
        taskId_date: {
          taskId,
          date,
        },
      },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Collection operations
export const collectionOperations = {
  create: async (userId: number, name: string, description?: string) => {
    const collection = await prisma.collection.create({
      data: {
        userId,
        name,
        description: description || null,
      },
    });
    return { lastInsertRowid: collection.id, changes: 1 };
  },

  findByUser: async (userId: number) => {
    return await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  },

  findById: async (id: number) => {
    return await prisma.collection.findUnique({
      where: { id },
    });
  },

  update: async (id: number, name: string, description?: string) => {
    await prisma.collection.update({
      where: { id },
      data: { name, description: description || null },
    });
    return { lastInsertRowid: id, changes: 1 };
  },

  delete: async (id: number) => {
    await prisma.collection.delete({
      where: { id },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Collection item operations
export const collectionItemOperations = {
  create: async (collectionId: number, content: string, symbol: string, position: number) => {
    const item = await prisma.collectionItem.create({
      data: {
        collectionId,
        content,
        symbol,
        position,
      },
    });
    return { lastInsertRowid: item.id, changes: 1 };
  },

  findByCollection: async (collectionId: number) => {
    return await prisma.collectionItem.findMany({
      where: { collectionId },
      orderBy: { position: 'asc' },
    });
  },

  update: async (id: number, content: string, symbol: string) => {
    await prisma.collectionItem.update({
      where: { id },
      data: { content, symbol },
    });
    return { lastInsertRowid: id, changes: 1 };
  },

  delete: async (id: number) => {
    await prisma.collectionItem.delete({
      where: { id },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Mood operations (old table)
export const moodOperations = {
  create: async (userId: number, date: string, mood: string, note?: string) => {
    const moodEntry = await prisma.mood.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: { mood, note: note || null },
      create: {
        userId,
        date,
        mood,
        note: note || null,
      },
    });
    return { lastInsertRowid: moodEntry.id, changes: 1 };
  },

  find: async (userId: number, date: string) => {
    return await prisma.mood.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  },

  findByDateRange: async (userId: number, startDate: string, endDate: string) => {
    return await prisma.mood.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { date: 'desc' },
    });
  },

  findRecent: async (userId: number, limit = 90) => {
    return await prisma.mood.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
    });
  },

  delete: async (userId: number, date: string) => {
    await prisma.mood.delete({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Mood entry operations (new table - multiple moods per day)
export const moodEntryOperations = {
  create: async (userId: number, date: string, time: string, mood: string, note?: string) => {
    const entry = await prisma.moodEntry.create({
      data: {
        userId,
        date,
        time,
        mood,
        note: note || null,
      },
    });
    return { lastInsertRowid: entry.id, changes: 1 };
  },

  findByDate: async (userId: number, date: string) => {
    return await prisma.moodEntry.findMany({
      where: {
        userId,
        date,
      },
      orderBy: { time: 'asc' },
    });
  },

  findRecent: async (userId: number, limit = 100) => {
    return await prisma.moodEntry.findMany({
      where: { userId },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' },
      ],
      take: limit,
    });
  },

  findById: async (id: number) => {
    return await prisma.moodEntry.findUnique({
      where: { id },
    });
  },

  delete: async (id: number, userId: number) => {
    await prisma.moodEntry.delete({
      where: {
        id,
        userId,
      },
    });
    return { lastInsertRowid: 0, changes: 1 };
  },
};

// Stats operations
export const statsOperations = {
  getTaskStats: async (userId: number, days = 30) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startDateStr = startDate.toISOString().split('T')[0];

    const tasks = await prisma.task.findMany({
      where: {
        entry: {
          userId,
          date: {
            gte: startDateStr,
          },
        },
      },
      select: {
        symbol: true,
      },
    });

    const stats = {
      completed: tasks.filter((t: { symbol: string }) => t.symbol === 'complete').length,
      open: tasks.filter((t: { symbol: string }) => t.symbol === 'bullet').length,
      migrated: tasks.filter((t: { symbol: string }) => t.symbol === 'migrated').length,
      scheduled: tasks.filter((t: { symbol: string }) => t.symbol === 'scheduled').length,
    };

    return stats;
  },
};

// Initialize database
export async function initDatabase() {
  // Prisma handles schema via migrations
  console.log('Database initialized with Prisma');
}

export default prisma;
