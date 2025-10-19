import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { taskOperations, entryOperations } from '@/lib/db';
import { addDays, addWeeks, addMonths, addYears, format, parseISO } from 'date-fns';

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
    let entry = entryOperations.findByUserAndDate(userId, date, 'daily');
    if (!entry) {
      const result = entryOperations.create(userId, date, 'daily');
      entry = { id: result.lastInsertRowid as number, user_id: userId, date, type: 'daily' };
    }

    // Find all recurring tasks from the user
    const allEntries = entryOperations.findByUser(userId) as Array<{id: number; user_id: number; date: string; type: string}>;
    const recurringTasks: Array<{id: number; content: string; is_recurring: number; recurrence_pattern: string; entryDate: string; parent_task_id?: number}> = [];

    for (const userEntry of allEntries) {
      const tasks = taskOperations.findByEntry(userEntry.id) as Array<{id: number; content: string; symbol: string; is_recurring: number; recurrence_pattern?: string; parent_task_id?: number}>;
      for (const task of tasks) {
        if (task.is_recurring === 1 && task.recurrence_pattern) {
          recurringTasks.push({
            id: task.id,
            content: task.content,
            is_recurring: task.is_recurring,
            recurrence_pattern: task.recurrence_pattern,
            entryDate: userEntry.date,
            parent_task_id: task.parent_task_id,
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
      switch (recurringTask.recurrence_pattern) {
        case 'daily':
          // Create every day after the original task date
          shouldCreate = targetDate >= taskDate;
          break;

        case 'weekly':
          // Create on the same day of week
          const daysDiff = Math.floor((targetDate.getTime() - taskDate.getTime()) / (1000 * 60 * 60 * 24));
          shouldCreate = daysDiff >= 0 && daysDiff % 7 === 0;
          break;

        case 'monthly':
          // Create on the same day of month
          shouldCreate = targetDate >= taskDate &&
                        targetDate.getDate() === taskDate.getDate() &&
                        (targetDate.getMonth() !== taskDate.getMonth() || targetDate.getFullYear() !== taskDate.getFullYear());
          break;

        case 'yearly':
          // Create on the same day and month each year
          shouldCreate = targetDate >= taskDate &&
                        targetDate.getDate() === taskDate.getDate() &&
                        targetDate.getMonth() === taskDate.getMonth() &&
                        targetDate.getFullYear() > taskDate.getFullYear();
          break;
      }

      if (shouldCreate) {
        // Check if this task instance already exists for this date
        const existingTasks = taskOperations.findByEntry(entry.id) as Array<{id: number; content: string; parent_task_id?: number}>;
        const alreadyExists = existingTasks.some(
          (t) => t.content === recurringTask.content &&
                     (t.parent_task_id === recurringTask.id || t.parent_task_id === recurringTask.parent_task_id)
        );

        if (!alreadyExists) {
          // Create new instance of the recurring task
          const position = existingTasks.length;
          const result = taskOperations.create(
            entry.id,
            recurringTask.content,
            'bullet', // Reset to bullet (not complete) for new instance
            position,
            0, // Not recurring for instances
            null, // No recurrence pattern for instances
            recurringTask.parent_task_id || recurringTask.id // Link to original task
          );

          tasksCreated.push({
            id: Number(result.lastInsertRowid),
            content: recurringTask.content,
            pattern: recurringTask.recurrence_pattern,
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
