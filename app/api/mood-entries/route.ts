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
  const userId = parseInt(session.user.id);

  try {
    if (date) {
      // Get all mood entries for specific date, ordered by time
      const entries = db.prepare(`
        SELECT * FROM mood_entries
        WHERE user_id = ? AND date = ?
        ORDER BY time ASC
      `).all(userId, date);
      return NextResponse.json(entries);
    }

    // Get all recent mood entries (last 30 days)
    const entries = db.prepare(`
      SELECT * FROM mood_entries
      WHERE user_id = ?
      ORDER BY date DESC, time DESC
      LIMIT 100
    `).all(userId);

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
    const stmt = db.prepare(`
      INSERT INTO mood_entries (user_id, date, time, mood, note)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = stmt.run(userId, date, time, mood, note || null);

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
    const entry = db.prepare('SELECT user_id FROM mood_entries WHERE id = ?').get(parseInt(id)) as any;

    if (!entry || entry.user_id !== userId) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    db.prepare('DELETE FROM mood_entries WHERE id = ?').run(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting mood entry:', error);
    return NextResponse.json({ error: 'Failed to delete mood entry' }, { status: 500 });
  }
}
