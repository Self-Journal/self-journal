import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { taskOperations } from '@/lib/db';

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId, recurrencePattern } = await request.json();

    if (taskId === undefined) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    // If recurrencePattern is provided, set recurring, otherwise remove it
    const isRecurring = recurrencePattern ? 1 : 0;
    await taskOperations.setRecurring(taskId, isRecurring, recurrencePattern || null);

    return NextResponse.json({ success: true, isRecurring, recurrencePattern });
  } catch (error) {
    console.error('Set recurring error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
