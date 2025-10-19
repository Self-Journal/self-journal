import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  try {
    // Check if there are any users in the database
    // We'll use a simple query to see if setup is needed
    const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
    const result = stmt.get() as { count: number };

    return NextResponse.json({ needsSetup: result.count === 0 });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
