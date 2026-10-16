import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export interface SecurityCheckResult {
  isLocked: boolean;
  remainingSeconds: number;
  attemptsRemaining: number;
  lockReason?: string;
  clientIp?: string;
}

export interface PasswordStrength {
  score: number; // 0 to 4
  labelSw: string;
  labelEn: string;
  color: string;
  feedbackSw: string[];
  feedbackEn: string[];
}

/**
 * Evaluates password strength with practical rules
 */
export function calculatePasswordStrength(password: string): PasswordStrength {
  if (!password) {
    return {
      score: 0,
      labelSw: 'Tupu',
      labelEn: 'Empty',
      color: 'bg-slate-700',
      feedbackSw: ['Weka nenosiri lako'],
      feedbackEn: ['Enter your password'],
    };
  }

  let score = 0;
  const feedbackSw: string[] = [];
  const feedbackEn: string[] = [];

  if (password.length >= 6) {
    score += 1;
  } else {
    feedbackSw.push('Angalau herufi 6 zinahitajika');
    feedbackEn.push('At least 6 characters required');
  }

  if (password.length >= 8) {
    score += 1;
  }

  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) {
    score += 1;
  } else {
    feedbackSw.push('Changanya herufi kubwa na ndogo');
    feedbackEn.push('Mix uppercase and lowercase letters');
  }

  if (/[0-9]/.test(password)) {
    score += 0.5;
  } else {
    feedbackSw.push('Weka angalau namba moja');
    feedbackEn.push('Include at least one number');
  }

  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    score += 0.5;
  }

  const rounded = Math.min(4, Math.floor(score));

  switch (rounded) {
    case 0:
    case 1:
      return {
        score: 1,
        labelSw: 'Dhaifu (Weak)',
        labelEn: 'Weak',
        color: 'bg-rose-500',
        feedbackSw,
        feedbackEn,
      };
    case 2:
      return {
        score: 2,
        labelSw: 'Wastani (Medium)',
        labelEn: 'Medium',
        color: 'bg-amber-500',
        feedbackSw,
        feedbackEn,
      };
    case 3:
      return {
        score: 3,
        labelSw: 'Nzuri (Good)',
        labelEn: 'Good',
        color: 'bg-blue-500',
        feedbackSw,
        feedbackEn,
      };
    case 4:
    default:
      return {
        score: 4,
        labelSw: 'Thabiti Sana (Very Strong)',
        labelEn: 'Very Strong',
        color: 'bg-emerald-500',
        feedbackSw: ['Nenosiri lipo salama kabisa'],
        feedbackEn: ['Password is highly secure'],
      };
  }
}

/**
 * Pre-checks rate limit & lockout status from server
 */
export async function checkServerSecurityStatus(identifier: string): Promise<SecurityCheckResult> {
  try {
    const res = await fetch('/api/auth/security-check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend security check unavailable:', err);
  }
  return {
    isLocked: false,
    remainingSeconds: 0,
    attemptsRemaining: 5,
  };
}

/**
 * Verifies credentials and issues a secure backend session token
 */
export async function verifyLoginOnBackend(params: {
  identifier: string;
  password?: string;
  role: string;
  twoFactorCode?: string;
}): Promise<{
  success: boolean;
  token?: string;
  error?: string;
  locked?: boolean;
  remainingSeconds?: number;
  remainingAttempts?: number;
  twoFactorError?: boolean;
}> {
  try {
    const res = await fetch('/api/auth/verify-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      if (data.token) {
        localStorage.setItem('uomboni_server_token', data.token);
      }
      return { success: true, token: data.token };
    }

    return {
      success: false,
      error: data.error || 'Uthibitisho wa seva umeshindwa.',
      locked: data.locked,
      remainingSeconds: data.remainingSeconds,
      remainingAttempts: data.remainingAttempts,
      twoFactorError: data.twoFactorError,
    };
  } catch (e: any) {
    return {
      success: false,
      error: 'Hitilafu ya mtandao katika seva ya ulinzi.',
    };
  }
}

/**
 * Verifies staff 2FA / Passkey with backend
 */
export async function verifyTwoFactorOnBackend(params: {
  role: string;
  code: string;
  identifier: string;
}): Promise<{
  success: boolean;
  error?: string;
  locked?: boolean;
  remainingAttempts?: number;
}> {
  try {
    const res = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }
    return {
      success: false,
      error: data.error || 'Nambari ya 2FA si sahihi.',
      locked: data.locked,
      remainingAttempts: data.remainingAttempts,
    };
  } catch (e: any) {
    return {
      success: false,
      error: 'Hitilafu ya mtandao wakati wa kuthibitisha 2FA.',
    };
  }
}

/**
 * Dispatches an immutable security event log to both the server backend and Firebase Firestore
 */
export async function logSecurityEvent(event: {
  eventType: string;
  identifier: string;
  role?: string;
  details: string;
  success?: boolean;
}): Promise<void> {
  // 1. Send to server backend
  try {
    fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    }).catch(() => {});
  } catch (e) {}

  // 2. Mirror into Firestore auditLogs collection
  try {
    const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const logRef = doc(collection(db, 'auditLogs'), logId);
    await setDoc(logRef, {
      id: logId,
      actor: event.identifier,
      role: event.role || 'guest',
      action: event.eventType,
      details: event.details,
      success: event.success !== false,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'browser',
    });
  } catch (e) {
    // Graceful fallback
  }
}

/**
 * Fetches audit logs from backend
 */
export async function fetchServerAuditLogs(): Promise<any[]> {
  try {
    const token = localStorage.getItem('uomboni_server_token') || '';
    const res = await fetch('/api/auth/audit-logs', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      return data.logs || [];
    }
  } catch (e) {}
  return [];
}
