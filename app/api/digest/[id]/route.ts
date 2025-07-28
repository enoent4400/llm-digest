import { NextRequest, NextResponse } from 'next/server';
import { getDigestById, deleteDigest } from '@/lib/database/digests';

// Default user ID for open-source version (no auth)
const DEFAULT_USER_ID = 'anonymous';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Await params as required in Next.js 15
    const { id } = await params;

    // Use default user for open-source version
    const user = { id: DEFAULT_USER_ID };

    // Verify the digest exists and belongs to the user
    const { data: existingDigest, error: fetchError } = await getDigestById(id);

    if (fetchError || !existingDigest) {
      return NextResponse.json(
        { error: 'Digest not found' },
        { status: 404 }
      );
    }

    // Delete the digest
    const { error: deleteError } = await deleteDigest(id, user.id);

    if (deleteError) {
      console.error('Failed to delete digest:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete digest', details: deleteError.message },
        { status: 500 }
      );
    }

    // Log successful deletion
    console.log(`Successfully deleted digest: ${id} (${existingDigest.title}) for user: ${user.id}`);

    return NextResponse.json({
      success: true,
      message: 'Digest deleted successfully',
      digestId: id
    });

  } catch (error) {
    console.error('Digest deletion error:', error);

    return NextResponse.json(
      {
        error: 'Internal server error while deleting digest',
        code: 'DIGEST_DELETION_FAILED'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE to remove digests.' },
    { status: 405 }
  );
}

export async function POST() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE to remove digests.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use DELETE to remove digests.' },
    { status: 405 }
  );
}