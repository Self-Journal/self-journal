import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import db from '@/lib/db';

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
      const mood = db.prepare(
        'SELECT * FROM moods WHERE user_id = ? AND date = ?'
      ).get(userId, date);
      return NextResponse.json(mood || null);
    }

    // Get moods for date range
    if (startDate && endDate) {
      const moods = db.prepare(`
        SELECT * FROM moods
        WHERE user_id = ? AND date >= ? AND date <= ?
        ORDER BY date DESC
      `).all(userId, startDate, endDate);
      return NextResponse.json(moods);
    }

    // Get all moods for user (last 90 days by default)
    const moods = db.prepare(`
      SELECT * FROM moods
      WHERE user_id = ?
      ORDER BY date DESC
      LIMIT 90
    `).all(userId);

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
    const stmt = db.prepare(`
      INSERT INTO moods (user_id, date, mood, note)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(user_id, date)
      DO UPDATE SET mood = excluded.mood, note = excluded.note
    `);

    const result = stmt.run(userId, date, mood, note || null);

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
    db.prepare('DELETE FROM moods WHERE user_id = ? AND date = ?')
      .run(userId, date);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mood:', error);
    return NextResponse.json({ error: 'Failed to delete mood' }, { status: 500 });
  }
}
