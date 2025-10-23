import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { taskOperations, entryOperations } from '@/lib/db';
import { getChallengeById } from '@/lib/templates';
import { format, addDays } from 'date-fns';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, startDate } = await request.json();

    if (!templateId || !startDate) {
      return NextResponse.json(
        { error: 'Template ID and start date are required' },
        { status: 400 }
      );
    }

    const template = getChallengeById(templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const userId = parseInt(session.user.id);
    const tasksCreated: number[] = [];

    // Get or create entry for the start date
    let entry = await entryOperations.findByUserAndDate(userId, startDate, 'daily');
    if (!entry) {
      const result = await entryOperations.create(userId, startDate, 'daily');
      entry = {
        id: result.lastInsertRowid as number,
        userId,
        date: startDate,
        type: 'daily',
        title: `${template.icon} ${template.name}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }

    // Add template tasks to the start date entry as recurring tasks
    const existingTasks = await taskOperations.findByEntry(entry.id);
    const startPosition = existingTasks.length;

    for (let i = 0; i < template.tasks.length; i++) {
      const task = template.tasks[i];

      // Create the recurring task
      const result = await taskOperations.create(
        entry.id,
        task.content,
        'bullet',
        startPosition + i,
        1, // isRecurring = 1
        task.recurrence, // recurrencePattern
        null // parentTaskId
      );

      tasksCreated.push(Number(result.lastInsertRowid));
    }

    return NextResponse.json({
      success: true,
      message: `${template.name} added successfully!`,
      tasksCreated: tasksCreated.length,
      template: {
        name: template.name,
        duration: template.duration,
        icon: template.icon,
      },
    });
  } catch (error) {
    console.error('Apply template error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
