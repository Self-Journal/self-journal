import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { moodOperations } from '@/lib/db';

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const userId = parseInt(session.user.id);

  try {
    // Get mood for specific date
    if (date) {
      const mood = await moodOperations.find(userId, date);
      return NextResponse.json(mood || null);
    }

    // Get moods for date range
    if (startDate && endDate) {
      const moods = await moodOperations.findByDateRange(userId, startDate, endDate);
      return NextResponse.json(moods);
    }

    // Get all moods for user (last 90 days by default)
    const moods = await moodOperations.findRecent(userId, 90);

    return NextResponse.json(moods);
  } catch (error) {
    console.error('Error fetching moods:', error);
    return NextResponse.json({ error: 'Failed to fetch moods' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = parseInt(session.user.id);
  const { date, mood, note } = await request.json();

  if (!date || !mood) {
    return NextResponse.json({ error: 'Date and mood are required' }, { status: 400 });
  }

  try {
    // Insert or replace mood for the day
    const result = await moodOperations.create(userId, date, mood, note);

    return NextResponse.json({
      id: result.lastInsertRowid,
      success: true
    });
  } catch (error) {
    console.error('Error saving mood:', error);
    return NextResponse.json({ error: 'Failed to save mood' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const userId = parseInt(session.user.id);

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  try {
    await moodOperations.delete(userId, date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mood:', error);
    return NextResponse.json({ error: 'Failed to delete mood' }, { status: 500 });
  }
}
