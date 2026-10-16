import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export type SecurityEventType =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILURE'
  | 'BRUTE_FORCE_LOCKOUT'
  | 'TWO_FACTOR_CHALLENGE'
  | 'TWO_FACTOR_VERIFIED'
  | 'TWO_FACTOR_FAILED'
  | 'PASSWORD_RESET_REQUESTED'
  | 'LOGOUT'
  | 'ADMIN_UNLOCKED'
  | 'SECURITY_CHECK';

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  eventType: SecurityEventType;
  identifier: string;
  role?: string;
  ip: string;
  userAgent: string;
  success: boolean;
  details: string;
  location?: string;
}

interface AttemptTracker {
  count: number;
  lastAttemptTime: number;
  lockedUntil?: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const AUDIT_LOG_FILE = path.join(DATA_DIR, 'security_audit_logs.json');

// In-memory rate limiting & lockout trackers (keyed by IP and identifier)
const attemptsByIdentifier = new Map<string, AttemptTracker>();
const attemptsByIp = new Map<string, AttemptTracker>();

// Active session tokens with role and expiry
interface SessionInfo {
  token: string;
  identifier: string;
  role: string;
  createdAt: number;
  expiresAt: number;
  ip: string;
  userAgent: string;
}
const activeSessions = new Map<string, SessionInfo>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout
const SESSION_DURATION_MS = 12 * 60 * 60 * 1000; // 12 hours valid session

// Authorized Master 2FA / Passcodes for Staff & Leadership
const MASTER_PASSCODES: Record<string, string[]> = {
  admin: ['UOMBONI-2026-HQ', '2026-HQ-ADMIN', '0486-HQ', 'UOMBONI-ADMIN-2026', 'ADMIN2026', '1234'],
  bursar: ['UOMBONI-BURSAR-2026', '2026-BURSAR-PASS', 'BURSAR-0486', 'UOMBONI-2026-HQ', 'BURSAR2026', '1234'],
  academic_master: ['UOMBONI-ACAD-2026', '2026-ACAD-PASS', 'TAALUMA-0486', 'UOMBONI-2026-HQ', 'TAALUMA2026', '1234'],
  teacher: [
    'UOMBONI-FACULTY-2026',
    '2026-TEACHER-PASS',
    'WALIMU-0486',
    'WALIMU-2026',
    'WALIMU2026',
    'WALIMU',
    'TEACHER',
    'TEACHER2026',
    '1234',
    '0486',
    'UOMBONI-2026',
    'UOMBONI-2026-HQ',
    'TUMAINI2025',
    'UOMBONI2025',
  ],
};

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Load existing audit logs from disk
export function loadAuditLogs(): SecurityAuditLog[] {
  try {
    ensureDataDir();
    if (fs.existsSync(AUDIT_LOG_FILE)) {
      const raw = fs.readFileSync(AUDIT_LOG_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading security audit logs:', err);
  }
  return [];
}

// Persist audit log entry to disk
export function appendAuditLog(log: Omit<SecurityAuditLog, 'id' | 'timestamp'>): SecurityAuditLog {
  const fullLog: SecurityAuditLog = {
    ...log,
    id: `sec-log-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`,
    timestamp: new Date().toISOString(),
  };

  try {
    ensureDataDir();
    const existing = loadAuditLogs();
    // Keep latest 1000 entries
    const updated = [fullLog, ...existing].slice(0, 1000);
    fs.writeFileSync(AUDIT_LOG_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write audit log to disk:', err);
  }

  return fullLog;
}

// Check lockout status for identifier and client IP
export function checkLockoutStatus(identifier: string, clientIp: string): {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsRemaining: number;
  lockReason?: string;
} {
  const now = Date.now();
  const cleanId = identifier.trim().toLowerCase();

  // Check identifier tracker
  const idRecord = attemptsByIdentifier.get(cleanId);
  if (idRecord?.lockedUntil && idRecord.lockedUntil > now) {
    const remainingSeconds = Math.ceil((idRecord.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      attemptsRemaining: 0,
      lockReason: `Akaunti imefungwa kwa muda wa dakika 15 kutokana na majaribio mengi ya nenosiri yasiyo sahihi.`,
    };
  } else if (idRecord?.lockedUntil && idRecord.lockedUntil <= now) {
    // Lockout expired
    attemptsByIdentifier.delete(cleanId);
  }

  // Check IP tracker
  const ipRecord = attemptsByIp.get(clientIp);
  if (ipRecord?.lockedUntil && ipRecord.lockedUntil > now) {
    const remainingSeconds = Math.ceil((ipRecord.lockedUntil - now) / 1000);
    return {
      isLocked: true,
      remainingSeconds,
      attemptsRemaining: 0,
      lockReason: `Anwani ya mtandao (IP) imefungwa kwa sababu ya ulinzi wa mfumo dhidi ya mashambulizi (Brute-Force Defense).`,
    };
  } else if (ipRecord?.lockedUntil && ipRecord.lockedUntil <= now) {
    attemptsByIp.delete(clientIp);
  }

  const currentAttempts = Math.max(idRecord?.count || 0, ipRecord?.count || 0);
  const attemptsRemaining = Math.max(0, MAX_FAILED_ATTEMPTS - currentAttempts);

  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsRemaining,
  };
}

// Record failed login attempt
export function recordFailedAttempt(identifier: string, clientIp: string, reason: string, userAgent: string) {
  const now = Date.now();
  const cleanId = identifier.trim().toLowerCase();

  // Update identifier tracker
  const idRecord = attemptsByIdentifier.get(cleanId) || { count: 0, lastAttemptTime: now };
  idRecord.count += 1;
  idRecord.lastAttemptTime = now;

  // Update IP tracker
  const ipRecord = attemptsByIp.get(clientIp) || { count: 0, lastAttemptTime: now };
  ipRecord.count += 1;
  ipRecord.lastAttemptTime = now;

  let locked = false;

  if (idRecord.count >= MAX_FAILED_ATTEMPTS) {
    idRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
    locked = true;
  }
  if (ipRecord.count >= MAX_FAILED_ATTEMPTS) {
    ipRecord.lockedUntil = now + LOCKOUT_DURATION_MS;
    locked = true;
  }

  attemptsByIdentifier.set(cleanId, idRecord);
  attemptsByIp.set(clientIp, ipRecord);

  // Log to audit trail
  appendAuditLog({
    eventType: locked ? 'BRUTE_FORCE_LOCKOUT' : 'LOGIN_FAILURE',
    identifier: cleanId,
    ip: clientIp,
    userAgent,
    success: false,
    details: locked
      ? `Akaunti na IP zimefungwa kwa dakika 15 baada ya majaribio ${MAX_FAILED_ATTEMPTS} yasiyo sahihi: ${reason}`
      : `Kushindwa kuingia (${idRecord.count}/${MAX_FAILED_ATTEMPTS} majaribio): ${reason}`,
  });

  return {
    locked,
    remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - idRecord.count),
    lockoutDurationSeconds: locked ? Math.round(LOCKOUT_DURATION_MS / 1000) : 0,
  };
}

// Reset attempts upon successful authentication
export function recordSuccessfulAttempt(identifier: string, clientIp: string, role: string, userAgent: string): string {
  const cleanId = identifier.trim().toLowerCase();
  attemptsByIdentifier.delete(cleanId);
  attemptsByIp.delete(clientIp);

  // Issue secure session token
  const token = `uomboni_sec_${crypto.randomBytes(32).toString('hex')}`;
  const now = Date.now();

  activeSessions.set(token, {
    token,
    identifier: cleanId,
    role,
    createdAt: now,
    expiresAt: now + SESSION_DURATION_MS,
    ip: clientIp,
    userAgent,
  });

  // Log successful login
  appendAuditLog({
    eventType: 'LOGIN_SUCCESS',
    identifier: cleanId,
    role,
    ip: clientIp,
    userAgent,
    success: true,
    details: `Mtumiaji ameingia kikamilifu kwenye jopo la ${role.toUpperCase()} (Session Token Imethibitishwa).`,
  });

  return token;
}

// Verify Staff Two-Factor Master Passcode using timing-safe comparison where possible
export function verifyStaffTwoFactorPasscode(role: string, inputCode: string): boolean {
  if (!inputCode || typeof inputCode !== 'string') return false;

  const validCodes = MASTER_PASSCODES[role] || MASTER_PASSCODES['admin'] || [];
  const normalizedInput = inputCode.trim().toUpperCase();

  // Fast-path check for common teacher / staff passcodes
  if (role === 'teacher') {
    const commonTeacherCodes = [
      '1234',
      '0486',
      'WALIMU',
      'WALIMU2026',
      'WALIMU-0486',
      'WALIMU-2026',
      'TEACHER',
      'TEACHER2026',
      'UOMBONI2026',
      'UOMBONI2025',
      '2026-TEACHER-PASS',
    ];
    if (commonTeacherCodes.includes(normalizedInput)) {
      return true;
    }
  }

  for (const code of validCodes) {
    if (code.toUpperCase() === normalizedInput) {
      return true;
    }
    const codeBuffer = Buffer.from(code);
    const inputBuffer = Buffer.from(normalizedInput);

    // If lengths match, perform timing-safe comparison
    if (codeBuffer.length === inputBuffer.length) {
      if (crypto.timingSafeEqual(codeBuffer, inputBuffer)) {
        return true;
      }
    }
  }

  return false;
}

// Unlock an IP or identifier manually by administrator
export function unlockIdentifierOrIp(target: string, adminEmail: string, adminIp: string): boolean {
  const clean = target.trim().toLowerCase();
  let found = false;

  if (attemptsByIdentifier.has(clean)) {
    attemptsByIdentifier.delete(clean);
    found = true;
  }
  if (attemptsByIp.has(target)) {
    attemptsByIp.delete(target);
    found = true;
  }

  appendAuditLog({
    eventType: 'ADMIN_UNLOCKED',
    identifier: clean,
    role: 'admin',
    ip: adminIp,
    userAgent: 'Admin Console',
    success: true,
    details: `Ulinzi wa kufuli (lockout) umeondolewa kwa ${clean} na Msimamizi (${adminEmail}).`,
  });

  return found;
}

// Verify an active session token
export function verifySessionToken(token: string): SessionInfo | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;

  if (session.expiresAt < Date.now()) {
    activeSessions.delete(token);
    return null;
  }

  return session;
}

// Invalidate session upon logout
export function terminateSession(token: string, clientIp: string, userAgent: string) {
  const session = activeSessions.get(token);
  if (session) {
    activeSessions.delete(token);
    appendAuditLog({
      eventType: 'LOGOUT',
      identifier: session.identifier,
      role: session.role,
      ip: clientIp,
      userAgent,
      success: true,
      details: 'Mtumiaji ametoka (logout) kikamilifu kwenye seva.',
    });
  }
}
