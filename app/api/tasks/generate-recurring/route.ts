import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { taskOperations, entryOperations } from '@/lib/db';
import { parseISO } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = await request.json();
    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const userId = parseInt(session.user.id);

    // Get or create entry for the target date
    let entry = await entryOperations.findByUserAndDate(userId, date, 'daily');
    if (!entry) {
      const result = await entryOperations.create(userId, date, 'daily');
      entry = { id: result.lastInsertRowid as number, userId, date, type: 'daily', title: null, createdAt: new Date(), updatedAt: new Date() };
    }

    // Find all recurring tasks from the user
    const allEntries = await entryOperations.findByUser(userId);
    const recurringTasks: Array<{id: number; content: string; isRecurring: number; recurrencePattern: string; entryDate: string; parentTaskId?: number | null}> = [];

    for (const userEntry of allEntries) {
      const tasks = await taskOperations.findByEntry(userEntry.id);
      for (const task of tasks) {
        if (task.isRecurring === 1 && task.recurrencePattern) {
          recurringTasks.push({
            id: task.id,
            content: task.content,
            isRecurring: task.isRecurring,
            recurrencePattern: task.recurrencePattern,
            entryDate: userEntry.date,
            parentTaskId: task.parentTaskId,
          });
        }
      }
    }

    // Check which recurring tasks should be created for this date
    const targetDate = parseISO(date);
    const tasksCreated: Array<{id: number; content: string; pattern: string}> = [];

    for (const recurringTask of recurringTasks) {
      const taskDate = parseISO(recurringTask.entryDate);
      let shouldCreate = false;

      // Check if task should appear on target date based on recurrence pattern
      switch (recurringTask.recurrencePattern) {
        case 'daily':
          // Create every day (including the original date)
          shouldCreate = true;
          break;

        case 'weekly':
          // Create on the same day of week every week
          shouldCreate = targetDate.getDay() === taskDate.getDay();
          break;

        case 'monthly':
          // Create on the same day of month every month
          shouldCreate = targetDate.getDate() === taskDate.getDate();
          break;

        case 'yearly':
          // Create on the same day and month each year
          shouldCreate = targetDate.getDate() === taskDate.getDate() &&
                        targetDate.getMonth() === taskDate.getMonth();
          break;
      }

      if (shouldCreate) {
        // Check if this task instance already exists for this date
        const existingTasks = await taskOperations.findByEntry(entry.id);
        const alreadyExists = existingTasks.some(
          (t: { content: string; parentTaskId: number | null }) => t.content === recurringTask.content &&
                     (t.parentTaskId === recurringTask.id || t.parentTaskId === recurringTask.parentTaskId)
        );

        if (!alreadyExists) {
          // Create new instance of the recurring task
          const position = existingTasks.length;
          const result = await taskOperations.create(
            entry.id,
            recurringTask.content,
            'bullet', // Reset to bullet (not complete) for new instance
            position,
            0, // Not recurring for instances
            null, // No recurrence pattern for instances
            recurringTask.parentTaskId || recurringTask.id // Link to original task
          );

          tasksCreated.push({
            id: Number(result.lastInsertRowid),
            content: recurringTask.content,
            pattern: recurringTask.recurrencePattern,
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      tasksCreated: tasksCreated.length,
      tasks: tasksCreated,
    });
  } catch (error) {
    console.error('Generate recurring tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
