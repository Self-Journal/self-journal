import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { collectionItemOperations } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collectionId, content, symbol, position } = await request.json();

    if (!collectionId || !content || !symbol || position === undefined) {
      return NextResponse.json(
        { error: 'Collection ID, content, symbol, and position are required' },
        { status: 400 }
      );
    }

    const result = collectionItemOperations.create(collectionId, content, symbol, position);

    return NextResponse.json(
      { id: result.lastInsertRowid },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create collection item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, content, symbol } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    collectionItemOperations.update(id, content, symbol);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update collection item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    collectionItemOperations.delete(parseInt(id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete collection item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
