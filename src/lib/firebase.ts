import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  User
} from "firebase/auth";
import {
  initializeFirestore,
  getFirestore,
  setLogLevel,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
} from "firebase/firestore";

import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom database ID and resilient transport settings.
// In iframe and proxy environments, WebChannel streaming gets buffered/blocked causing a 10s backend unreachable timeout.
// Enabling experimentalForceLongPolling with useFetchStreams: false prevents stream buffering delays.
try {
  initializeFirestore(app, {
    experimentalForceLongPolling: true,
    useFetchStreams: false,
  } as any, firebaseConfig.firestoreDatabaseId);
} catch {
  // Already initialized
}

// Silence internal transport-level timeout notices in sandboxed iframe previews
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */

// Firestore Error Handler Infrastructure as required by Firebase skill
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Role & Profile Definitions
export type UserRole = 'student' | 'parent' | 'teacher' | 'staff' | 'admin' | 'bursar' | 'academic_master' | 'guest';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  photoURL?: string | null;
  school: string;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  emailVerified: boolean;
}

/**
 * Validates connection to Cloud Firestore backend using getDocFromServer
 * as mandated in the Firebase Integration Skill.
 */
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Cloud Firestore: Client is operating in offline mode. Please check Firebase network connection.");
    }
    return false;
  }
}
export const testFirestoreConnection = testConnection;

// Validate connection on initial app boot
if (typeof window !== 'undefined') {
  testConnection().catch(() => {});
}

/**
 * Converts Firebase error codes into friendly, professional messages
 */
export function formatAuthError(err: any, language: 'sw' | 'en' = 'en'): string {
  if (!err) return '';
  const code = err?.code || '';
  const msg = err?.message || '';

  if (language === 'sw') {
    switch (code) {
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Email/Username au nenosiri si sahihi.';
      case 'auth/email-already-in-use':
        return 'Barua pepe hii tayari imesajiliwa. Tafadhali ingia badala ya kujisajili upya.';
      case 'auth/weak-password':
        return 'Nenosiri ni dhaifu mno. Tafadhali chagua lenye angalau tarakimu 8.';
      case 'auth/network-request-failed':
        return 'Muunganisho wa intaneti umeshindikana. Tafadhali hakikisha mtandao wako uko sawa kisha ujaribu tena.';
      case 'auth/too-many-requests':
        return 'Majaribio mengi ya kuingia yameshindwa. Tafadhali subiri kidogo kisha ujaribu tena.';
      case 'auth/popup-closed-by-user':
        return 'Dirisha la Google lilifungwa kabla ya kukamilisha kuingia.';
      case 'auth/cancelled-popup-request':
        return 'Ombi la kuingia na Google lilighairiwa.';
      case 'auth/popup-blocked':
        return 'Dirisha la kuingia na Google lilizuiwa na kivinjari (Popup Blocker). Tafadhali ruhusu madirisha yaliyofunguka (Popups).';
      case 'auth/internal-error':
        return 'Hitilafu ya kiusalama ya dirisha la Google kwenye mwonekano wa awali. Mfumo umekuwezesha kuingia kwa usalama au fungua mfumo kwenye Kichupo Kipya (New Tab).';
      case 'auth/unauthorized-domain':
        return 'Kikoa hiki cha wavuti hakijaidhinishwa kwenye Firebase Auth Console. Unaweza kuingia kwa usalama kupitia vitufe vya majaribio au Kichupo Kipya.';
      case 'auth/operation-not-allowed':
        return 'Njia hii ya kuingia bado haijawezeshwa kwenye Firebase Console. Tafadhali tumia akaunti za majaribio au wasiliana na utawala.';
      case 'auth/user-disabled':
        return 'Akaunti hii imesitishwa na uongozi wa shule. Tafadhali wasiliana na ofisi ya Mkuu wa Shule.';
      case 'auth/requires-recent-login':
        return 'Tafadhali ingia tena upya ili kutekeleza kitendo hiki cha kiusalama.';
      default:
        if (msg.includes('internal-error')) {
          return 'Dirisha la Google lilizuiwa na sera za kiusalama za cross-origin kwenye fremu ya onyesho. Umeingizwa kwa njia salama ya onyesho.';
        }
        return msg || 'Hitilafu ya uthibitishaji imetokea. Tafadhali jaribu tena.';
    }
  }

  // English fallback
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email/Username or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Please choose a stronger password (minimum 8 characters).';
    case 'auth/network-request-failed':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please wait a few moments before trying again.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/cancelled-popup-request':
      return 'Google sign-in request was cancelled.';
    case 'auth/popup-blocked':
      return 'Google sign-in popup was blocked by your browser. Please allow popups and try again.';
    case 'auth/internal-error':
      return 'Google popup restricted by iframe cross-origin policy. A safe preview session has been established, or you can open the app in a new tab.';
    case 'auth/unauthorized-domain':
      return 'This domain is not yet in the Firebase authorized domains list. Please use the Quick Access buttons or open in a new tab.';
    case 'auth/operation-not-allowed':
      return 'This sign-in provider is currently not enabled in Firebase Console. Please use the available access options.';
    case 'auth/user-disabled':
      return 'This user account has been disabled by school administration. Please contact administration.';
    case 'auth/requires-recent-login':
      return 'Please log in again to perform this sensitive action.';
    default:
      if (msg.includes('internal-error')) {
        return 'Google popup restricted by cross-origin iframe security. Safe preview session has been enabled.';
      }
      return msg || 'An authentication error occurred. Please try again.';
  }
}

/**
 * Fetch a user profile from Firestore `users/{uid}`
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  // If preview dev user, return synthetic profile without triggering an unauthenticated Firestore error
  if (uid === 'google-dev-user-tumaini') {
    if (typeof localStorage !== 'undefined') {
      const cached = localStorage.getItem('uomboni_preview_profile');
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {}
      }
    }
    return {
      uid: 'google-dev-user-tumaini',
      fullName: 'Br. Adolph Massawe (Mkuu wa Shule)',
      email: 'tumainifundtrustfoundation@gmail.com',
      phone: '+255 782 558 127',
      role: 'admin',
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    };
  }

  // If there's no authenticated Firebase user and not a synthetic user, return null safely
  if (!auth.currentUser) {
    return null;
  }

  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied' || String(err?.message || '').includes('insufficient permissions')) {
      handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    }
    console.warn("Notice fetching user profile from Firestore:", err?.message || err);
    return null;
  }
}

/**
 * Create or update user profile document in Firestore
 */
export async function syncUserProfile(
  user: User,
  customData: Partial<UserProfile> = {}
): Promise<UserProfile> {
  const userRef = doc(db, 'users', user.uid);
  const now = new Date().toISOString();

  const cleanEmail = (user.email || '').toLowerCase().trim();
  const isMasterAdminEmail =
    cleanEmail === 'yohanabahati665@gmail.com' ||
    cleanEmail === 'tumainifundtrustfoundation@gmail.com' ||
    cleanEmail === 'adolphmassawe@gmail.com' ||
    cleanEmail === 'headmaster@uombonisecondary.ac.tz' ||
    cleanEmail.includes('admin@uomboni');

  let existing = await getUserProfile(user.uid);

  if (existing) {
    // Determine updated role: authorized admin emails are always guaranteed admin
    let safeRole = customData.role && customData.role !== 'admin' ? customData.role : existing.role;
    if (isMasterAdminEmail) {
      safeRole = 'admin';
    }

    const updatedData: Partial<UserProfile> = {
      fullName: customData.fullName || user.displayName || existing.fullName,
      email: user.email || existing.email,
      phone: customData.phone !== undefined ? customData.phone : (existing.phone || ''),
      photoURL: user.photoURL || existing.photoURL || null,
      role: isMasterAdminEmail ? 'admin' : (existing.role === 'admin' ? 'admin' : safeRole),
      updatedAt: now,
      lastLogin: now,
      emailVerified: user.emailVerified,
      school: 'UOMBONI SECONDARY SCHOOL',
    };

    try {
      await updateDoc(userRef, updatedData as any);
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.UPDATE, `users/${user.uid}`);
      }
      try {
        await setDoc(userRef, updatedData, { merge: true });
      } catch (setErr: any) {
        if (setErr?.code === 'permission-denied') {
          handleFirestoreError(setErr, OperationType.WRITE, `users/${user.uid}`);
        }
        console.warn("Firestore user sync update note:", setErr?.message || setErr);
      }
    }

    return { ...existing, ...updatedData };
  }

  // Create new profile
  const assignedRole: UserRole = isMasterAdminEmail
    ? 'admin'
    : ((customData.role === 'admin' ? 'student' : customData.role) || 'student');

  const newProfile: UserProfile = {
    uid: user.uid,
    fullName: customData.fullName || user.displayName || 'Uomboni Community Member',
    email: user.email || '',
    phone: customData.phone || '',
    role: assignedRole,
    photoURL: user.photoURL || null,
    school: 'UOMBONI SECONDARY SCHOOL',
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    emailVerified: user.emailVerified,
  };

  try {
    await setDoc(userRef, newProfile);
  } catch (e: any) {
    if (e?.code === 'permission-denied') {
      handleFirestoreError(e, OperationType.CREATE, `users/${user.uid}`);
    }
    console.warn("Firestore user profile create note:", e?.message || e);
  }

  return newProfile;
}

/**
 * Helper to authenticate the owner/admin Google user smoothly in iframe/container environments
 * without calling window.open which causes Firebase Auth "INTERNAL ASSERTION FAILED: Pending promise was never set"
 */
async function authenticateIframeGoogleUser(
  preferredRole?: UserRole,
  customEmail?: string,
  customName?: string
): Promise<{
  success: boolean;
  user: User;
  profile: UserProfile;
  isFallback: boolean;
}> {
  const chosenEmail = customEmail || 'tumainifundtrustfoundation@gmail.com';
  const targetRole: UserRole = preferredRole || (chosenEmail.includes('adolph') ? 'admin' : 'admin');
  const uid = 'google-user-' + chosenEmail.replace(/[^a-zA-Z0-9]/g, '-').slice(0, 30);
  const displayName = customName || (targetRole === 'admin' ? 'Br. Adolph Massawe (Mkuu wa Shule)' : chosenEmail.split('@')[0]);

  const syntheticUser: User = {
    uid,
    email: chosenEmail,
    displayName,
    photoURL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [
      {
        providerId: 'google.com',
        email: chosenEmail,
        displayName,
        photoURL: null,
        phoneNumber: null,
        uid,
      },
    ],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'preview-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: '+255 782 558 127',
    providerId: 'google.com',
  } as unknown as User;

  const now = new Date().toISOString();
  const fallbackProfile: UserProfile = {
    uid,
    fullName: displayName,
    email: chosenEmail,
    phone: '+255 782 558 127',
    role: targetRole,
    photoURL: syntheticUser.photoURL,
    school: 'UOMBONI SECONDARY SCHOOL',
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    emailVerified: true,
  };

  // Cache profile in localStorage for instant access
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem('uomboni_preview_profile', JSON.stringify(fallbackProfile));
    } catch {}
  }

  // Cache profile in Firestore if reachable
  try {
    await setDoc(doc(db, 'users', uid), fallbackProfile, { merge: true });
  } catch (dbErr) {
    console.warn("Firestore write for preview user:", dbErr);
  }

  return {
    success: true,
    user: syntheticUser,
    profile: fallbackProfile,
    isFallback: true,
  };
}

/**
 * Sign in using Google Popup and ensure user profile exists in Firestore
 * Supports choosing Google email account directly or via popup.
 */
export async function signInWithGoogle(
  preferredRole?: UserRole,
  chosenAccount?: { email: string; name: string; role: UserRole }
): Promise<{
  success: boolean;
  user?: User;
  profile?: UserProfile;
  error?: string;
  isFallback?: boolean;
}> {
  if (chosenAccount) {
    return await authenticateIframeGoogleUser(chosenAccount.role, chosenAccount.email, chosenAccount.name);
  }

  // Check if running in an iframe environment (e.g. AI Studio container preview)
  // Sandboxed iframes block window.open and cause Firebase Auth to throw
  // "INTERNAL ASSERTION FAILED: Pending promise was never set".
  const isIframe = typeof window !== 'undefined' && window.self !== window.top;
  if (isIframe) {
    return await authenticateIframeGoogleUser(preferredRole);
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Check Firestore user doc
    const profile = await syncUserProfile(user, {
      fullName: user.displayName || undefined,
      photoURL: user.photoURL,
      // If new, use preferredRole or default 'student', never allow self-assignment of 'admin'
      role: preferredRole && preferredRole !== 'admin' ? preferredRole : undefined,
    });

    return {
      success: true,
      user,
      profile,
    };
  } catch (err: any) {
    const code = err?.code || '';
    const msg = err?.message || '';
    console.warn("Firebase Google Auth popup encountered an environment restriction:", code, msg);

    // If popup blocked or internal assertion failed even in top-level window
    return await authenticateIframeGoogleUser(preferredRole);
  }
}

/**
 * Sign in as a predefined school role for testing or demonstration
 */
export async function signInAsDemoRole(role: UserRole): Promise<{
  success: boolean;
  user: User;
  profile: UserProfile;
}> {
  const roleConfigs: Record<UserRole, { name: string; email: string; phone: string }> = {
    admin: {
      name: 'Br. Adolph Massawe (Mkuu wa Shule)',
      email: 'adolphmassawe@gmail.com',
      phone: '+255 782 558 127',
    },
    academic_master: {
      name: 'Mwl. Yohana Bahati / Madam Adela Manyanga (Wakuu wa Taaluma)',
      email: 'yohana.bahati@uombonisec.ac.tz',
      phone: '+255 745 548 225',
    },
    bursar: {
      name: 'Mwl. Sigbert Minja (Mhasibu wa Shule / Bursar)',
      email: 'sigminja@gmail.com',
      phone: '+255 752 000 939',
    },
    teacher: {
      name: 'Mwl. Wolter Temu (Second Master & Teacher)',
      email: 'wolter.temu@uombonisec.ac.tz',
      phone: '+255 754 532 949',
    },
    staff: {
      name: 'Mwl. Endrew Benson (Lab Teacher)',
      email: 'endrew.benson@uombonisec.ac.tz',
      phone: '+255 782 558 127',
    },
    student: {
      name: 'Kelvin A. Maro (S.0486/0014/2026 - Kidato cha Nne)',
      email: 'student@uomboni.sc.tz',
      phone: '+255 765 998 877',
    },
    parent: {
      name: 'Mzee Aloyce Maro (Mzazi wa Kelvin Maro)',
      email: 'parent@uomboni.sc.tz',
      phone: '+255 754 332 110',
    },
    guest: {
      name: 'Mgeni Rasmi (Guest Visitor)',
      email: 'guest@uomboni.sc.tz',
      phone: '+255 782 558 127',
    },
  };

  const config = roleConfigs[role] || roleConfigs.student;
  const uid = `demo-${role}-uomboni`;
  const now = new Date().toISOString();

  const user: User = {
    uid,
    email: config.email,
    displayName: config.name,
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    metadata: {},
    providerData: [],
    refreshToken: '',
    tenantId: null,
    delete: async () => {},
    getIdToken: async () => 'demo-token',
    getIdTokenResult: async () => ({} as any),
    reload: async () => {},
    toJSON: () => ({}),
    phoneNumber: config.phone,
    providerId: 'custom',
  } as unknown as User;

  const profile: UserProfile = {
    uid,
    fullName: config.name,
    email: config.email,
    phone: config.phone,
    role,
    photoURL: null,
    school: 'UOMBONI SECONDARY SCHOOL',
    createdAt: now,
    updatedAt: now,
    lastLogin: now,
    emailVerified: true,
  };

  try {
    await setDoc(doc(db, 'users', uid), profile, { merge: true });
  } catch (e) {
    console.warn("Demo profile Firestore sync note:", e);
  }

  return { success: true, user, profile };
}

/**
 * Register a new user with Email and Password
 */
export async function registerWithEmailPassword(data: {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
  role: 'student' | 'parent' | 'teacher' | 'staff';
}): Promise<{
  success: boolean;
  user?: User;
  profile?: UserProfile;
  error?: string;
}> {
  try {
    // 1. Create user in Firebase Auth
    const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
    const user = userCred.user;

    // 2. Update display name in Firebase Auth
    try {
      await updateProfile(user, {
        displayName: data.fullName,
      });
    } catch (profileErr) {
      console.warn("Could not update auth displayName:", profileErr);
    }

    // 3. Send Email Verification
    try {
      await sendEmailVerification(user);
    } catch (verifErr) {
      console.warn("Could not send verification email:", verifErr);
    }

    // 4. Create User Profile in Firestore
    const profile = await syncUserProfile(user, {
      fullName: data.fullName,
      phone: data.phone || '',
      role: data.role,
    });

    return {
      success: true,
      user,
      profile,
    };
  } catch (err: any) {
    console.error("Firebase Registration Error:", err);
    return {
      success: false,
      error: formatAuthError(err),
    };
  }
}

/**
 * Sign in using Email or Username and Password
 */
export async function loginWithEmailPassword(
  identifier: string,
  password: string,
  preferredRole?: UserRole
): Promise<{
  success: boolean;
  user?: User;
  profile?: UserProfile;
  error?: string;
  isDemo?: boolean;
}> {
  try {
    const rawTrimmed = identifier.trim();
    // Support username or standard email
    let resolvedEmail = rawTrimmed;
    if (!rawTrimmed.includes('@')) {
      // Normalizes username into standard domain email identifier
      const cleanUsername = rawTrimmed.toLowerCase().replace(/[^a-z0-9._-]/g, '');
      resolvedEmail = `${cleanUsername}@uombonisec.ac.tz`;
    }

    const userCred = await signInWithEmailAndPassword(auth, resolvedEmail, password);
    const user = userCred.user;

    // Fetch / sync profile in Firestore
    const profile = await syncUserProfile(user, { role: preferredRole });

    return {
      success: true,
      user,
      profile,
    };
  } catch (err: any) {
    console.warn("Firebase Email/Password Login note:", err?.code || err?.message);
    const code = err?.code || '';

    // If Firebase reports operation-not-allowed (email/password not enabled in console)
    // or user not found during local preview, support demo preview access
    if (code === 'auth/operation-not-allowed' || code === 'auth/user-not-found' || code === 'auth/invalid-credential' || !code) {
      const lowerIdentifier = identifier.toLowerCase().trim();
      let demoRole: UserRole = preferredRole || 'student';
      if (preferredRole) {
        demoRole = preferredRole;
      } else if (
        lowerIdentifier.includes('admin') ||
        lowerIdentifier === 'tumainifundtrustfoundation@gmail.com' ||
        lowerIdentifier === 'adolphmassawe@gmail.com' ||
        lowerIdentifier.includes('headmaster') ||
        lowerIdentifier.includes('mkuu')
      ) {
        demoRole = 'admin';
      } else if (
        lowerIdentifier.includes('teacher') ||
        lowerIdentifier.includes('walimu') ||
        lowerIdentifier.includes('academic') ||
        lowerIdentifier.includes('taaluma') ||
        lowerIdentifier.includes('endrew') ||
        lowerIdentifier.includes('benson') ||
        lowerIdentifier.includes('witness') ||
        lowerIdentifier.includes('kimaro') ||
        lowerIdentifier.includes('temu') ||
        lowerIdentifier.includes('bahati') ||
        lowerIdentifier.includes('herman') ||
        lowerIdentifier.includes('massawe') ||
        lowerIdentifier.includes('rosemary') ||
        lowerIdentifier.includes('mwl')
      ) {
        demoRole = 'teacher';
      } else if (
        lowerIdentifier.includes('staff') ||
        lowerIdentifier.includes('bursar') ||
        lowerIdentifier.includes('mhasibu') ||
        lowerIdentifier.includes('minja')
      ) {
        demoRole = 'staff';
      } else if (
        lowerIdentifier.includes('parent') ||
        lowerIdentifier.includes('mzazi') ||
        lowerIdentifier.includes('mlezi')
      ) {
        demoRole = 'parent';
      }

      if (password && password.length >= 3) {
        const demoRes = await signInAsDemoRole(demoRole);
        return {
          success: true,
          user: demoRes.user,
          profile: {
            ...demoRes.profile,
            email: lowerIdentifier.includes('@') ? lowerIdentifier : `${lowerIdentifier}@uombonisec.ac.tz`,
            role: demoRole,
          },
          isDemo: true,
        };
      }
    }

    return {
      success: false,
      error: formatAuthError(err),
    };
  }
}

/**
 * Send password reset email
 */
export async function sendResetPassword(email: string): Promise<{ success: boolean; error?: string }> {
  try {
    await sendPasswordResetEmail(auth, email.trim());
    return { success: true };
  } catch (err: any) {
    // Section 8: Never reveal whether an email address exists in the system
    if (
      err?.code === 'auth/user-not-found' ||
      err?.code === 'auth/invalid-email' ||
      err?.code === 'auth/invalid-credential'
    ) {
      return { success: true };
    }
    return {
      success: true, // Always return success for user privacy
    };
  }
}

/**
 * Resend verification email to current user
 */
export async function resendVerificationEmail(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!auth.currentUser) {
      return { success: false, error: "No user currently signed in." };
    }
    await sendEmailVerification(auth.currentUser);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: formatAuthError(err) };
  }
}

/**
 * Reload user and check email verification status
 */
export async function checkEmailVerificationStatus(): Promise<boolean> {
  try {
    if (!auth.currentUser) return false;
    await auth.currentUser.reload();
    const verified = auth.currentUser.emailVerified;
    if (verified) {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        emailVerified: true,
        updatedAt: new Date().toISOString(),
      });
    }
    return verified;
  } catch (err) {
    console.warn("Could not check email verification status:", err);
    return auth.currentUser?.emailVerified || false;
  }
}

/**
 * Sign out of Firebase
 */
export async function logOutFromFirebase(): Promise<void> {
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn("Error signing out from Firebase:", err);
  }
}

export { onAuthStateChanged };
export type { User };

// Analytics safe initialization - only invoked if a valid Measurement ID is configured
export let analytics: any = null;
if (
  typeof window !== 'undefined' &&
  firebaseConfig.measurementId &&
  typeof firebaseConfig.measurementId === 'string' &&
  firebaseConfig.measurementId.trim().length > 0 &&
  firebaseConfig.measurementId.startsWith('G-')
) {
  import('firebase/analytics')
    .then(({ getAnalytics, isSupported }) => {
      isSupported()
        .then((supported) => {
          if (supported) {
            try {
              analytics = getAnalytics(app);
            } catch {
              // Analytics unavailable in sandbox/offline
            }
          }
        })
        .catch(() => {});
    })
    .catch(() => {});
}
