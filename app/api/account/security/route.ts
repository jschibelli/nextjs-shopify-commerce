import { getAuth } from 'lib/auth';
import {
    deleteTwoFactorData,
    generateBackupCodes,
    generateTOTPSecret,
    getTwoFactorData,
    storeTwoFactorData,
    TwoFactorData,
    updateTwoFactorData,
    validateSecurityQuestions,
    verifyTOTPCode
} from 'lib/security';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Get 2FA data from persistence
    const twoFactorData = getTwoFactorData(user.id);

    // Get current security settings
    const securitySettings = {
      twoFactorEnabled: twoFactorData?.enabled || false,
      twoFactorSecret: twoFactorData?.secret ? 'configured' : null,
      backupCodes: twoFactorData?.backupCodes?.length || 0,
      lastLogin: new Date().toISOString(),
      loginHistory: [],
      securityQuestions: [],
      deviceTrust: []
    };

    return NextResponse.json({
      success: true,
      securitySettings
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
    return NextResponse.json({ error: 'Failed to fetch security settings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('customer_token');
    
    if (!tokenCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const auth = getAuth();
    await auth.initializeFromCookies();
    const user = await auth.getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const { action, data } = await request.json();

    switch (action) {
      case 'enable-2fa':
        return await handleEnable2FA(user, data);
      
      case 'verify-2fa':
        return await handleVerify2FA(user, data);
      
      case 'disable-2fa':
        return await handleDisable2FA(user, data);
      
      case 'generate-backup-codes':
        return await handleGenerateBackupCodes(user);
      
      case 'verify-backup-code':
        return await handleVerifyBackupCode(user, data);
      
      case 'update-security-questions':
        return await handleUpdateSecurityQuestions(user, data);
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in security action:', error);
    return NextResponse.json({ error: 'Failed to process security action' }, { status: 500 });
  }
}

async function handleEnable2FA(user: any, data: any) {
  try {
    const { email } = data;
    
    // Generate new TOTP secret
    const secret = generateTOTPSecret();
    
    // Create the proper otpauth URL for QR code
    const qrCodeUrl = `otpauth://totp/${encodeURIComponent(user.email)}?secret=${secret}&issuer=${encodeURIComponent('NextJS Shopify Store')}&algorithm=SHA1&digits=6&period=30`;
    
    // Store the secret temporarily (will be enabled after verification)
    const twoFactorData: TwoFactorData = {
      enabled: false,
      secret,
      backupCodes: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storeTwoFactorData(user.id, twoFactorData);
    
    console.log('2FA setup initiated for user:', user.id);
    
    return NextResponse.json({
      success: true,
      secret,
      qrCodeUrl,
      message: 'Two-factor authentication setup initiated'
    });
  } catch (error) {
    console.error('Error enabling 2FA:', error);
    return NextResponse.json({ error: 'Failed to enable 2FA' }, { status: 500 });
  }
}

async function handleVerify2FA(user: any, data: any) {
  try {
    const { code, secret } = data;
    
    if (!secret || !code) {
      return NextResponse.json({ error: 'Secret and code are required' }, { status: 400 });
    }
    
    // Verify the TOTP code
    const isValid = verifyTOTPCode(secret, code);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    
    // Enable 2FA and generate backup codes
    const backupCodes = generateBackupCodes();
    
    const twoFactorData: TwoFactorData = {
      enabled: true,
      secret,
      backupCodes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    storeTwoFactorData(user.id, twoFactorData);
    
    console.log('2FA enabled for user:', user.id);
    
    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'Two-factor authentication enabled successfully'
    });
  } catch (error) {
    console.error('Error verifying 2FA:', error);
    return NextResponse.json({ error: 'Failed to verify 2FA' }, { status: 500 });
  }
}

async function handleDisable2FA(user: any, data: any) {
  try {
    const { code } = data;
    
    const twoFactorData = getTwoFactorData(user.id);
    
    if (!twoFactorData || !twoFactorData.enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }
    
    // Verify the current code before disabling
    const isValid = verifyTOTPCode(twoFactorData.secret, code);
    
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }
    
    // Disable 2FA
    deleteTwoFactorData(user.id);
    
    console.log('2FA disabled for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Two-factor authentication disabled successfully'
    });
  } catch (error) {
    console.error('Error disabling 2FA:', error);
    return NextResponse.json({ error: 'Failed to disable 2FA' }, { status: 500 });
  }
}

async function handleGenerateBackupCodes(user: any) {
  try {
    const twoFactorData = getTwoFactorData(user.id);
    
    if (!twoFactorData || !twoFactorData.enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }
    
    // Generate new backup codes
    const backupCodes = generateBackupCodes();
    
    updateTwoFactorData(user.id, {
      backupCodes,
      updatedAt: new Date().toISOString()
    });
    
    console.log('New backup codes generated for user:', user.id);
    
    return NextResponse.json({
      success: true,
      backupCodes,
      message: 'New backup codes generated successfully'
    });
  } catch (error) {
    console.error('Error generating backup codes:', error);
    return NextResponse.json({ error: 'Failed to generate backup codes' }, { status: 500 });
  }
}

async function handleVerifyBackupCode(user: any, data: any) {
  try {
    const { code } = data;
    
    const twoFactorData = getTwoFactorData(user.id);
    
    if (!twoFactorData || !twoFactorData.enabled) {
      return NextResponse.json({ error: '2FA is not enabled' }, { status: 400 });
    }
    
    // Check if backup code is valid
    const isValidCode = twoFactorData.backupCodes.includes(code);
    
    if (!isValidCode) {
      return NextResponse.json({ error: 'Invalid backup code' }, { status: 400 });
    }
    
    // Remove the used backup code
    const updatedBackupCodes = twoFactorData.backupCodes.filter((c: string) => c !== code);
    
    updateTwoFactorData(user.id, {
      backupCodes: updatedBackupCodes,
      updatedAt: new Date().toISOString()
    });
    
    console.log('Backup code verified for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Backup code verified successfully'
    });
  } catch (error) {
    console.error('Error verifying backup code:', error);
    return NextResponse.json({ error: 'Failed to verify backup code' }, { status: 500 });
  }
}

async function handleUpdateSecurityQuestions(user: any, data: any) {
  try {
    const { questions } = data;
    
    // Validate security questions
    const validation = validateSecurityQuestions(questions);
    
    if (!validation.isValid) {
      return NextResponse.json({ 
        error: 'Invalid security questions', 
        feedback: validation.feedback 
      }, { status: 400 });
    }
    
    // Store security questions (in a real app, this would go to a database)
    console.log('Security questions updated for user:', user.id);
    
    return NextResponse.json({
      success: true,
      message: 'Security questions updated successfully'
    });
  } catch (error) {
    console.error('Error updating security questions:', error);
    return NextResponse.json({ error: 'Failed to update security questions' }, { status: 500 });
  }
} 