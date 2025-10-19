import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { moodEntryOperations } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const userId = parseInt(session.user.id);

  try {
    if (date) {
      // Get all mood entries for specific date, ordered by time
      const entries = await moodEntryOperations.findByDate(userId, date);
      return NextResponse.json(entries);
    }

    // Get all recent mood entries (last 100)
    const entries = await moodEntryOperations.findRecent(userId, 100);

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching mood entries:', error);
    return NextResponse.json({ error: 'Failed to fetch mood entries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const { date, time, mood, note } = await request.json();

  if (!date || !time || !mood) {
    return NextResponse.json(
      { error: 'Date, time and mood are required' },
      { status: 400 }
    );
  }

  try {
    const result = await moodEntryOperations.create(userId, date, time, mood, note);

    return NextResponse.json({
      id: result.lastInsertRowid,
      success: true,
    });
  } catch (error) {
    console.error('Error saving mood entry:', error);
    return NextResponse.json({ error: 'Failed to save mood entry' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const userId = parseInt(session.user.id);

  if (!id) {
    return NextResponse.json({ error: 'Entry ID is required' }, { status: 400 });
  }

  try {
    // Verify ownership before deleting
    const entry = await moodEntryOperations.findById(parseInt(id));

    if (!entry || entry.userId !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await moodEntryOperations.delete(parseInt(id), userId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    return NextResponse.json({ error: 'Failed to delete mood entry' }, { status: 500 });
  }
}
