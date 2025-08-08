import { bulkApproveReviews } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reviewIds, moderator = 'admin', notes } = body;

    if (!reviewIds || !Array.isArray(reviewIds) || reviewIds.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid reviewIds array' },
        { status: 400 }
      );
    }

    const result = bulkApproveReviews(reviewIds, moderator);

    return NextResponse.json({
      success: true,
      message: `Bulk approval completed: ${result.success} succeeded, ${result.failed} failed`,
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
        moderator,
        notes
      }
    });
  } catch (error) {
    console.error('Error bulk approving reviews:', error);
    return NextResponse.json(
      { error: 'Failed to bulk approve reviews' },
      { status: 500 }
    );
  }
} 