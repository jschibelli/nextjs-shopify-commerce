import { bulkDeleteReviews } from 'lib/shopify/yotpo-reviews';
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

    const result = bulkDeleteReviews(reviewIds, moderator);

    return NextResponse.json({
      success: true,
      message: `Bulk deletion completed: ${result.success} succeeded, ${result.failed} failed`,
      data: {
        success: result.success,
        failed: result.failed,
        errors: result.errors,
        moderator,
        notes
      }
    });
  } catch (error) {
    console.error('Error bulk deleting reviews:', error);
    return NextResponse.json(
      { error: 'Failed to bulk delete reviews' },
      { status: 500 }
    );
  }
} 