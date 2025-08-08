import { getModerationLog, getModerationStats } from 'lib/shopify/yotpo-reviews';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const includeLog = searchParams.get('log') === 'true';
    const limit = parseInt(searchParams.get('limit') || '50');

    const stats = getModerationStats();
    let log = null;

    if (includeLog) {
      const fullLog = getModerationLog();
      log = fullLog
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    }

    return NextResponse.json({
      stats,
      log,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching moderation stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch moderation statistics' },
      { status: 500 }
    );
  }
} 