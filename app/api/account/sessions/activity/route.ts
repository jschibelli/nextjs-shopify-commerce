import { getAuth } from 'lib/auth';
import { getUserSessions, updateSessionActivity } from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check if request has body and content type
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return NextResponse.json({ error: 'Content-Type must be application/json' }, { status: 400 });
    }

    // Check if request body is empty
    const contentLength = request.headers.get('content-length');
    if (contentLength === '0' || !contentLength) {
      return NextResponse.json({ error: 'Request body is empty' }, { status: 400 });
    }

    let sessionId;
    try {
      const body = await request.json();
      sessionId = body.sessionId;
    } catch (error) {
      console.error('Error parsing request body:', error);
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Try to get user, but don't fail if user is not found (after logout)
    try {
      const auth = getAuth();
      await auth.initializeFromCookies();
      const user = await auth.getCurrentUser();

      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 401 });
      }

      // Check if session exists in server storage
      const userSessions = getUserSessions(user.id);
      const sessionExists = userSessions.some(session => session.id === sessionId);
      
      if (!sessionExists) {
        console.log(`Session activity: Session ${sessionId} not found for user ${user.id}`);
        return NextResponse.json({
          success: true,
          message: 'Session not found in server storage'
        });
      }

      // Update session activity
      updateSessionActivity(user.id, sessionId);

      return NextResponse.json({
        success: true,
        message: 'Session activity updated'
      });
    } catch (error) {
      // If user is not found (e.g., after logout), just return success
      console.log('User not found for session activity update, likely logged out');
      return NextResponse.json({
        success: true,
        message: 'Session activity skipped - user not found'
      });
    }
  } catch (error) {
    console.error('Error updating session activity:', error);
    return NextResponse.json({ error: 'Failed to update session activity' }, { status: 500 });
  }
} 