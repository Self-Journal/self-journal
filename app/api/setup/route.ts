import { NextResponse } from 'next/server';
import { userOperations } from '@/lib/db';

export async function GET() {
  try {
    // In demo mode, setup is never needed
    if (process.env.DEMO_MODE === 'true') {
      return NextResponse.json({ needsSetup: false });
    }

    // Check if there are any users in the database
    const count = await userOperations.count();

    return NextResponse.json({ needsSetup: count === 0 });
  } catch (error) {
    console.error('Setup check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
