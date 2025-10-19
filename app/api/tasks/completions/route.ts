import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { taskCompletionOperations } from '@/lib/db';

export async function GET(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  if (!taskId) {
    return NextResponse.json({ error: 'Task ID required' }, { status: 400 });
  }

  try {
    let completions;
    if (startDate && endDate) {
      completions = await taskCompletionOperations.findByTaskAndDateRange(parseInt(taskId), startDate, endDate);
    } else {
      completions = await taskCompletionOperations.findByTask(parseInt(taskId));
    }
    return NextResponse.json(completions);
  } catch (error) {
    console.error('Error fetching task completions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { taskId, date, completed = 1 } = await request.json();

    if (!taskId || !date) {
      return NextResponse.json({ error: 'Task ID and date required' }, { status: 400 });
    }

    const result = await taskCompletionOperations.recordCompletion(taskId, date, completed);
    return NextResponse.json({ id: result.lastInsertRowid, taskId, date, completed });
  } catch (error) {
    console.error('Error recording task completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const date = searchParams.get('date');

  if (!taskId || !date) {
    return NextResponse.json({ error: 'Task ID and date required' }, { status: 400 });
  }

  try {
    await taskCompletionOperations.delete(parseInt(taskId), date);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task completion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
