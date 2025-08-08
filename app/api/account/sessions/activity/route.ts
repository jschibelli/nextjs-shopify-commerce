import { getAuth } from 'lib/auth';
import { getUserSessions, updateSessionActivity } from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ 
        success: true,
        message: 'Not authenticated, activity tracking skipped' 
      }, { status: 200 });
    }

    let sessionId;
    
    // Try to parse the request body, but handle empty/malformed requests gracefully
    try {
      // Check if request has content
      const contentLength = request.headers.get('content-length');
      const contentType = request.headers.get('content-type');
      
      // If no content or not JSON, try to get sessionId from URL params or headers
      if (!contentLength || contentLength === '0' || !contentType?.includes('application/json')) {
        // Try to get sessionId from URL search params
        const url = new URL(request.url);
        sessionId = url.searchParams.get('sessionId');
        
        // If still no sessionId, try to get from headers
        if (!sessionId) {
          sessionId = request.headers.get('x-session-id');
        }
        
        // If still no sessionId, return success (session tracking is optional)
        if (!sessionId) {
          return NextResponse.json({
            success: true,
            message: 'No session ID provided, activity tracking skipped'
          });
        }
      } else {
        // Try to parse JSON body
        const body = await request.json();
        sessionId = body.sessionId;
      }
    } catch (error) {
      console.error('Error parsing request body:', error);
      
      // Try alternative methods to get sessionId
      const url = new URL(request.url);
      sessionId = url.searchParams.get('sessionId') || request.headers.get('x-session-id');
      
      if (!sessionId) {
        return NextResponse.json({
          success: true,
          message: 'Invalid request body, activity tracking skipped'
        });
      }
    }

    // Try to get user, but don't fail if user is not found (after logout)
    try {
      const auth = getAuth();
      await auth.initializeFromCookies();
      const user = await auth.getCurrentUser();

      if (!user) {
        console.log('Session activity: User not found, likely logged out');
        return NextResponse.json({
          success: true,
          message: 'User not found, activity tracking skipped'
        });
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
      console.log('Session activity: User not found for session activity update, likely logged out');
      return NextResponse.json({
        success: true,
        message: 'Session activity skipped - user not found'
      });
    }
  } catch (error) {
    console.error('Session activity: Error updating session activity:', error);
    return NextResponse.json({ 
      success: true,
      message: 'Session activity failed, but continuing normally' 
    });
  }
} 