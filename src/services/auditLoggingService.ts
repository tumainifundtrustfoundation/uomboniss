import { db, auth } from '../lib/firebase';
import { collection, doc, setDoc, getDocs, query, limit, orderBy } from 'firebase/firestore';

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string;
  actorName: string;
  actorRole: 'admin' | 'academic_master' | 'bursar' | 'teacher' | 'system' | 'guest';
  action:
    | 'RESULTS_DRAFT_SAVED'
    | 'RESULTS_SUBMITTED'
    | 'RESULTS_APPROVED'
    | 'RESULTS_RETURNED'
    | 'RESULTS_CORRECTION_RESUBMITTED'
    | 'RESULTS_DELETED'
    | 'STAFF_LOGIN_SUCCESS'
    | 'STAFF_LOGIN_FAILED'
    | 'STAFF_MFA_VERIFIED'
    | 'STAFF_MFA_FAILED'
    | 'STAFF_LOGOUT'
    | 'BACKUP_CREATED'
    | 'BACKUP_RESTORE_TEST'
    | 'SECURITY_POLICY_VIOLATION'
    | 'UNAUTHORIZED_ACCESS_ATTEMPT'
    | string;
  resourceType: 'pending_results' | 'published_results' | 'student' | 'staff' | 'backup' | 'system';
  resourceId: string;
  details: string;
  previousState?: any;
  newState?: any;
  reason?: string;
  success: boolean;
  timestamp: string;
  userAgent?: string;
}

const LOCAL_STORAGE_AUDIT_KEY = 'uomboni_audit_trail_cache';

/**
 * Saves a fallback copy of audit log to localStorage
 */
function cacheAuditLogLocally(entry: AuditLogEntry) {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
    const existing: AuditLogEntry[] = raw ? JSON.parse(raw) : [];
    existing.unshift(entry);
    localStorage.setItem(LOCAL_STORAGE_AUDIT_KEY, JSON.stringify(existing.slice(0, 100)));
  } catch {
    // fallback ignore
  }
}

/**
 * Records an immutable audit log to Cloud Firestore and the server
 */
export async function recordAuditLog(
  event: Omit<AuditLogEntry, 'id' | 'timestamp'>
): Promise<string> {
  const timestamp = new Date().toISOString();
  const logId = `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const logEntry: AuditLogEntry = {
    ...event,
    id: logId,
    timestamp,
    actorUid: event.actorUid || auth.currentUser?.uid || 'anonymous',
    actorEmail: event.actorEmail || auth.currentUser?.email || 'unauthenticated@uombonisec.ac.tz',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
  };

  // 1. Cache locally for immediate UI availability
  cacheAuditLogLocally(logEntry);

  // 2. Persist to Firestore collection 'auditLogs' (Rules enforce append-only: updates/deletes rejected)
  try {
    const docRef = doc(collection(db, 'auditLogs'), logId);
    await setDoc(docRef, logEntry);
  } catch (err: any) {
    console.warn('Firestore audit log write notice:', err?.message || err);
  }

  // 3. Mirror to server-side audit endpoint
  try {
    fetch('/api/auth/log-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: logEntry.action,
        identifier: logEntry.actorEmail,
        role: logEntry.actorRole,
        details: logEntry.details,
        success: logEntry.success,
      }),
    }).catch(() => {});
  } catch {
    // ignore server mirror errors
  }

  return logId;
}

/**
 * Fetches audit logs from Firestore (or fallback cached logs) for Admin / Academic Master review
 */
export async function fetchAuditLogs(limitCount: number = 60): Promise<AuditLogEntry[]> {
  try {
    const logsCol = collection(db, 'auditLogs');
    const q = query(logsCol, limit(limitCount));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const records: AuditLogEntry[] = [];
      snap.forEach((docSnap) => {
        records.push(docSnap.data() as AuditLogEntry);
      });
      // Sort newest first
      records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return records;
    }
  } catch (err: any) {
    console.warn('Firestore audit log read fallback:', err?.message || err);
  }

  // Fallback to local storage cache
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_AUDIT_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      list.sort((a: AuditLogEntry, b: AuditLogEntry) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      return list;
    }
  } catch {
    // ignore
  }

  return [];
}
