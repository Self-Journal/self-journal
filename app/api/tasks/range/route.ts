import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const type = searchParams.get('type'); // 'daily', 'weekly', 'monthly'

  if (!startDate || !endDate) {
    return NextResponse.json({ error: 'Start and end dates required' }, { status: 400 });
  }

  const userId = parseInt(session.user.id);

  try {
    // Get all entries in the date range for the user
    type TaskWithEntry = {
      id: number;
      entry_id: number;
      content: string;
      symbol: string;
      position: number;
      is_recurring: number;
      recurrence_pattern: string | null;
      parent_task_id: number | null;
      date: string;
      entry_type: string;
    };

    const tasks = type
      ? await prisma.$queryRaw<TaskWithEntry[]>`
          SELECT t.*, e.date, e.type as entry_type
          FROM tasks t
          JOIN entries e ON t.entry_id = e.id
          WHERE e.user_id = ${userId}
            AND e.date >= ${startDate}
            AND e.date <= ${endDate}
            AND e.type = ${type}
          ORDER BY e.date ASC, t.position ASC
        `
      : await prisma.$queryRaw<TaskWithEntry[]>`
          SELECT t.*, e.date, e.type as entry_type
          FROM tasks t
          JOIN entries e ON t.entry_id = e.id
          WHERE e.user_id = ${userId}
            AND e.date >= ${startDate}
            AND e.date <= ${endDate}
          ORDER BY e.date ASC, t.position ASC
        `;

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}
