import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// Base32 encoding/decoding utilities
function base32Encode(buffer: Buffer): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  let output = '';
  
  for (let i = 0; i < buffer.length; i++) {
    value = (value << 8) | (buffer[i] || 0);
    bits += 8;
    
    while (bits >= 5) {
      output += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    output += alphabet[(value << (5 - bits)) & 31];
  }
  
  return output;
}

function base32Decode(str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = 0;
  let value = 0;
  const output: number[] = [];
  
  for (let i = 0; i < str.length; i++) {
    const char = str[i]?.toUpperCase() || '';
    const index = alphabet.indexOf(char);
    if (index === -1) continue;
    
    value = (value << 5) | index;
    bits += 5;
    
    while (bits >= 8) {
      output.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  
  return Buffer.from(output);
}

// TOTP (Time-based One-Time Password) implementation
export function generateTOTPSecret(): string {
  // Generate a random 20-byte secret and encode as base32
  const bytes = crypto.randomBytes(20);
  return base32Encode(bytes);
}

export function verifyTOTPCode(secret: string, code: string, window: number = 1): boolean {
  try {
    const now = Math.floor(Date.now() / 30000); // 30-second window
    const expectedCode = generateTOTPCode(secret, now);
    
    // Check current window and adjacent windows
    for (let i = -window; i <= window; i++) {
      const testCode = generateTOTPCode(secret, now + i);
      if (testCode === code) {
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error verifying TOTP code:', error);
    return false;
  }
}

function generateTOTPCode(secret: string, counter: number): string {
  try {
    // Convert secret to buffer
    const secretBuffer = base32Decode(secret);
    
    // Create counter buffer (8 bytes, big-endian)
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(BigInt(counter), 0);
    
    // Generate HMAC-SHA1
    const hmac = crypto.createHmac('sha1', secretBuffer);
    hmac.update(counterBuffer);
    const hash = hmac.digest();
    
    // Generate 6-digit code with bounds checking
    const offset = (hash[hash.length - 1] || 0) & 0xf;
    const hashLength = hash.length;
    
    if (offset + 3 >= hashLength) {
      return '000000'; // Fallback for invalid offset
    }
    
    const code = ((hash[offset] || 0) & 0x7f) << 24 |
                 ((hash[offset + 1] || 0) & 0xff) << 16 |
                 ((hash[offset + 2] || 0) & 0xff) << 8 |
                 ((hash[offset + 3] || 0) & 0xff);
    
    return (code % 1000000).toString().padStart(6, '0');
  } catch (error) {
    console.error('Error generating TOTP code:', error);
    return '000000';
  }
}

export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric codes
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
  }
  return codes;
}

export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('Password should be at least 8 characters long');
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one uppercase letter');
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one lowercase letter');
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one number');
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('Password should contain at least one special character');
  }

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function generateDeviceFingerprint(userAgent: string, ip: string): string {
  const data = `${userAgent}-${ip}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

export class RateLimiter {
  private attempts: Map<string, { count: number; resetTime: number }> = new Map();

  isRateLimited(key: string, maxAttempts: number = 5, windowMs: number = 900000): boolean {
    const now = Date.now();
    const record = this.attempts.get(key);

    if (!record || now > record.resetTime) {
      // Reset or create new record
      this.attempts.set(key, { count: 1, resetTime: now + windowMs });
      return false;
    }

    if (record.count >= maxAttempts) {
      return true;
    }

    record.count++;
    return false;
  }

  reset(key: string): void {
    this.attempts.delete(key);
  }
}

export function validateSecurityQuestions(questions: Array<{ question: string; answer: string }>): {
  isValid: boolean;
  feedback: string[];
} {
  const feedback: string[] = [];

  if (questions.length < 2) {
    feedback.push('At least 2 security questions are required');
  }

  questions.forEach((q, index) => {
    if (!q.question.trim()) {
      feedback.push(`Question ${index + 1} is required`);
    }
    if (!q.answer.trim()) {
      feedback.push(`Answer ${index + 1} is required`);
    }
    if (q.answer.length < 3) {
      feedback.push(`Answer ${index + 1} should be at least 3 characters`);
    }
  });

  return {
    isValid: feedback.length === 0,
    feedback
  };
}

// 2FA Data Persistence Functions
export interface TwoFactorData {
  enabled: boolean;
  secret: string;
  backupCodes: string[];
  createdAt: string;
  updatedAt: string;
}

// Session Management Functions
export interface SessionData {
  id: string;
  userId: string;
  device: string;
  location: string;
  ip: string;
  userAgent: string;
  lastActive: string;
  isCurrent: boolean;
  createdAt: string;
}

// File-based storage for development (replace with database in production)
const STORAGE_FILE = path.join(process.cwd(), '.2fa-storage.json');
const SESSION_STORAGE_FILE = path.join(process.cwd(), '.session-storage.json');

// Load existing data from file
function loadStorageData() {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading 2FA storage:', error);
  }
  return {};
}

function loadSessionData() {
  try {
    if (fs.existsSync(SESSION_STORAGE_FILE)) {
      const data = fs.readFileSync(SESSION_STORAGE_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading session storage:', error);
  }
  return {};
}

// Save data to file
function saveStorageData(data: any) {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving 2FA storage:', error);
  }
}

function saveSessionData(data: any) {
  try {
    fs.writeFileSync(SESSION_STORAGE_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error saving session storage:', error);
  }
}

// Initialize storage from file
const twoFactorStorage = new Map<string, TwoFactorData>();
const sessionStorage = new Map<string, SessionData[]>();

// Load existing data
const loaded2FAData = loadStorageData();
const loadedSessionData = loadSessionData();

Object.entries(loaded2FAData).forEach(([key, value]) => {
  twoFactorStorage.set(key, value as TwoFactorData);
});

Object.entries(loadedSessionData).forEach(([key, value]) => {
  sessionStorage.set(key, value as SessionData[]);
});

const SECURITY_DEBUG = process.env.SECURITY_DEBUG === 'true';
if (SECURITY_DEBUG) {
  console.log('Loaded 2FA data for', twoFactorStorage.size, 'users');
  console.log('Loaded session data for', sessionStorage.size, 'users');
}

export function storeTwoFactorData(userId: string, data: TwoFactorData): void {
  twoFactorStorage.set(userId, {
    ...data,
    updatedAt: new Date().toISOString()
  });
  saveStorageData(Object.fromEntries(twoFactorStorage));
}

export function getTwoFactorData(userId: string): TwoFactorData | null {
  return twoFactorStorage.get(userId) || null;
}

export function updateTwoFactorData(userId: string, updates: Partial<TwoFactorData>): void {
  const existing = twoFactorStorage.get(userId);
  if (existing) {
    twoFactorStorage.set(userId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    });
    saveStorageData(Object.fromEntries(twoFactorStorage));
  }
}

export function deleteTwoFactorData(userId: string): void {
  twoFactorStorage.delete(userId);
  saveStorageData(Object.fromEntries(twoFactorStorage));
}

// Session Management Functions
export function createSession(userId: string, sessionInfo: {
  device: string;
  location: string;
  ip: string;
  userAgent: string;
}): SessionData {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const session: SessionData = {
    id: sessionId,
    userId,
    device: sessionInfo.device,
    location: sessionInfo.location,
    ip: sessionInfo.ip,
    userAgent: sessionInfo.userAgent,
    lastActive: new Date().toISOString(),
    isCurrent: true,
    createdAt: new Date().toISOString()
  };

  // Mark all other sessions as not current
  const userSessions = sessionStorage.get(userId) || [];
  userSessions.forEach(s => s.isCurrent = false);
  
  // Add new session
  userSessions.push(session);
  sessionStorage.set(userId, userSessions);
  saveSessionData(Object.fromEntries(sessionStorage));

  return session;
}

export function getUserSessions(userId: string): SessionData[] {
  return sessionStorage.get(userId) || [];
}

export function updateSessionActivity(userId: string, sessionId: string): void {
  const userSessions = sessionStorage.get(userId) || [];
  const session = userSessions.find(s => s.id === sessionId);
  if (session) {
    session.lastActive = new Date().toISOString();
  }
  saveSessionData(Object.fromEntries(sessionStorage));
}

export function revokeSession(userId: string, sessionId: string): boolean {
  const userSessions = sessionStorage.get(userId) || [];
  const filteredSessions = userSessions.filter(s => s.id !== sessionId);
  
  if (filteredSessions.length !== userSessions.length) {
    sessionStorage.set(userId, filteredSessions);
    saveSessionData(Object.fromEntries(sessionStorage));
    return true;
  }
  
  return false;
}

export function revokeAllSessions(userId: string): void {
  sessionStorage.delete(userId);
  saveSessionData(Object.fromEntries(sessionStorage));
}

export function detectDevice(userAgent: string): string {
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('iPad')) return 'iPad';
  if (userAgent.includes('Android')) return 'Android Device';
  if (userAgent.includes('Macintosh')) return 'Mac';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Unknown Device';
}

export function getLocationFromIP(ip: string): string {
  // In production, this would use a geolocation service
  // For now, return mock locations based on IP patterns
  if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    return 'Local Network';
  }
  if (ip === '127.0.0.1') {
    return 'Localhost';
  }
  return 'Unknown Location';
} 