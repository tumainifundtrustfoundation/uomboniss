import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  auth,
  db,
  onAuthStateChanged,
  User,
  UserProfile,
  UserRole,
  getUserProfile,
  syncUserProfile,
  loginWithEmailPassword,
  registerWithEmailPassword,
  signInWithGoogle,
  signInAsDemoRole,
  logOutFromFirebase,
  sendResetPassword,
  resendVerificationEmail,
  checkEmailVerificationStatus,
  formatAuthError,
  handleFirestoreError,
  OperationType,
} from '../lib/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';

export interface AuthMessage {
  type: 'success' | 'error' | 'info';
  text: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  authMessage: AuthMessage | null;
  setAuthMessage: (msg: AuthMessage | null) => void;
  activeView: 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'portal' | 'website' | 'welcome' | 'admission-documents';
  setActiveView: (view: 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'portal' | 'website' | 'welcome' | 'admission-documents') => void;
  activeRoleDashboard: UserRole;
  setActiveRoleDashboard: (role: UserRole) => void;
  login: (email: string, password: string, rememberMe?: boolean, preferredRole?: UserRole) => Promise<{ success: boolean; error?: string }>;
  loginWithDemoRole: (role: UserRole) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: 'student' | 'parent' | 'teacher' | 'staff';
  }) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogleAuth: (
    preferredRole?: UserRole,
    chosenAccount?: { email: string; name: string; role: UserRole }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resendVerification: () => Promise<{ success: boolean; error?: string }>;
  checkVerification: () => Promise<boolean>;
  refreshProfile: () => Promise<UserProfile | null>;
  updateUserRoleByAdmin: (targetUid: string, newRole: UserRole) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authMessage, setAuthMessage] = useState<AuthMessage | null>(null);
  const [activeView, setActiveView] = useState<'login' | 'signup' | 'forgot-password' | 'verify-email' | 'portal' | 'website' | 'welcome' | 'admission-documents'>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.toLowerCase();
      const path = window.location.pathname.toLowerCase();
      if (path === '/welcome' || hash === '#welcome') return 'welcome';
      if (path === '/login' || hash === '#login') return 'login';
      if (path === '/signup' || hash === '#signup') return 'signup';
      if (hash === '#admission-documents' || hash === '#admissions-documents' || hash === '#admission-docs') return 'admission-documents';
      const savedView = sessionStorage.getItem('uomboni_view');
      if (!savedView && !hash) return 'welcome';
    }
    return 'website';
  });
  const [activeRoleDashboard, setActiveRoleDashboard] = useState<UserRole>('student');

  // Handle URL hash / path on initial load
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();

      if (path === '/welcome' || hash === '#welcome') {
        setActiveView('welcome');
      } else if (path === '/login' || hash === '#login') {
        setActiveView('login');
      } else if (path === '/signup' || path === '/register' || hash === '#signup' || hash === '#register') {
        setActiveView('signup');
      } else if (path === '/forgot-password' || hash === '#forgot-password' || hash === '#reset-password') {
        setActiveView('forgot-password');
      } else if (path === '/verify-email' || hash === '#verify-email') {
        setActiveView('verify-email');
      } else if (
        path === '/student-dashboard' ||
        path === '/parent-dashboard' ||
        path === '/teacher-dashboard' ||
        path === '/staff-dashboard' ||
        path === '/admin-dashboard' ||
        hash === '#portal' ||
        hash === '#dashboard'
      ) {
        setActiveView('portal');
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    window.addEventListener('hashchange', handleUrlRoute);
    return () => {
      window.removeEventListener('popstate', handleUrlRoute);
      window.removeEventListener('hashchange', handleUrlRoute);
    };
  }, []);

  // Synchronize authentication state from Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const profile = await syncUserProfile(firebaseUser);
          setUserProfile(profile);
          setActiveRoleDashboard(profile.role);
          try {
            localStorage.setItem('uomboni_active_session', JSON.stringify({ user: firebaseUser, profile }));
          } catch (e) {}
          // If in an auth screen, transition to portal
          setActiveView((prev) => (prev === 'login' || prev === 'signup' ? 'portal' : prev));
        } catch (err) {
          console.error("Error setting up user profile:", err);
        }
      } else {
        // Fallback to local session cache if present
        try {
          const cached = localStorage.getItem('uomboni_active_session');
          if (cached) {
            const data = JSON.parse(cached);
            if (data?.profile) {
              setUser(data.user || null);
              setUserProfile(data.profile);
              setActiveRoleDashboard(data.profile.role);
            } else {
              setUserProfile(null);
            }
          } else {
            setUserProfile(null);
          }
        } catch (e) {
          setUserProfile(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Update browser history when view changes
  const handleSetActiveView = (view: 'login' | 'signup' | 'forgot-password' | 'verify-email' | 'portal' | 'website') => {
    setActiveView(view);
    if (view === 'website') {
      window.history.pushState(null, '', '/');
    } else if (view === 'portal') {
      const roleRoute = userProfile ? `/${userProfile.role}-dashboard` : '/student-dashboard';
      window.history.pushState(null, '', roleRoute);
    } else {
      window.history.pushState(null, '', `/${view}`);
    }
  };

  const login = async (email: string, password: string, rememberMe = true, preferredRole?: UserRole) => {
    setLoading(true);
    setAuthMessage(null);
    try {
      const res = await loginWithEmailPassword(email.trim(), password, preferredRole);
      if (res.success && res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        setActiveRoleDashboard(res.profile.role);
        setActiveView('portal');
        try {
          localStorage.setItem('uomboni_active_session', JSON.stringify({ user: res.user, profile: res.profile }));
        } catch (e) {}
        setAuthMessage({
          type: 'success',
          text: `Karibu tena, ${res.profile.fullName}! Umeingia kikamilifu kwenye Portal ya Uomboni (${res.profile.role.toUpperCase()}).`,
        });
        return { success: true };
      }
      const err = res.error || 'Imeshindwa kuingia.';
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } catch (e: any) {
      const err = formatAuthError(e);
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (data: {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    role: 'student' | 'parent' | 'teacher' | 'staff';
  }) => {
    setLoading(true);
    setAuthMessage(null);
    try {
      const res = await registerWithEmailPassword({
        ...data,
        email: data.email.trim(),
      });
      if (res.success && res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        setActiveRoleDashboard(res.profile.role);
        setActiveView('verify-email');
        setAuthMessage({
          type: 'success',
          text: 'Akaunti yako imeundwa kikamilifu! Kiungo cha uthibitisho kimetumwa kwenye barua pepe yako.',
        });
        return { success: true };
      }
      const err = res.error || 'Imeshindwa kuunda akaunti.';
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } catch (e: any) {
      const err = formatAuthError(e);
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogleAuth = async (
    preferredRole?: UserRole,
    chosenAccount?: { email: string; name: string; role: UserRole }
  ) => {
    setLoading(true);
    setAuthMessage(null);
    try {
      const res = await signInWithGoogle(preferredRole, chosenAccount);
      if (res.success && res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        setActiveRoleDashboard(res.profile.role);
        setActiveView('portal');
        try {
          localStorage.setItem('uomboni_active_session', JSON.stringify({ user: res.user, profile: res.profile }));
        } catch (e) {}
        setAuthMessage({
          type: 'success',
          text: `Karibu kwenye Uomboni Digital Portal, ${res.profile.fullName}!`,
        });
        return { success: true };
      }
      const err = res.error || 'Imeshindwa kuingia na Google.';
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } catch (e: any) {
      const err = formatAuthError(e);
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const loginWithDemoRole = async (role: UserRole) => {
    setLoading(true);
    setAuthMessage(null);
    try {
      const res = await signInAsDemoRole(role);
      if (res.success && res.user && res.profile) {
        setUser(res.user);
        setUserProfile(res.profile);
        setActiveRoleDashboard(res.profile.role);
        setActiveView('portal');
        try {
          localStorage.setItem('uomboni_active_session', JSON.stringify({ user: res.user, profile: res.profile }));
        } catch (e) {}
        setAuthMessage({
          type: 'success',
          text: `Umeingia kama ${res.profile.fullName} (${role.toUpperCase()}) - Uomboni Portal.`,
        });
        return { success: true };
      }
      return { success: false, error: 'Imeshindwa kuingia kama demo.' };
    } catch (e: any) {
      const err = formatAuthError(e);
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      try {
        localStorage.removeItem('uomboni_active_session');
      } catch (e) {}
      await logOutFromFirebase();
      setUser(null);
      setUserProfile(null);
      handleSetActiveView('login');
      setAuthMessage({
        type: 'info',
        text: 'You have been successfully logged out. Umefanikiwa kutoka kwenye mfumo wa Uomboni.',
      });
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (email: string) => {
    setLoading(true);
    setAuthMessage(null);
    try {
      const res = await sendResetPassword(email.trim());
      if (res.success) {
        setAuthMessage({
          type: 'success',
          text: 'Maelekezo ya kurejesha nenosiri yametumwa ikiwa akaunti hiyo ipo.',
        });
        return { success: true };
      }
      const err = res.error || 'Imeshindwa kutuma kiungo cha kurejesha nenosiri.';
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } catch (e: any) {
      const err = formatAuthError(e);
      setAuthMessage({ type: 'error', text: err });
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    try {
      const res = await resendVerificationEmail();
      if (res.success) {
        setAuthMessage({
          type: 'success',
          text: 'Barua pepe mpya ya uthibitishaji imetumwa sasa hivi.',
        });
        return { success: true };
      }
      return { success: false, error: res.error };
    } catch (e: any) {
      return { success: false, error: formatAuthError(e) };
    }
  };

  const checkVerification = async () => {
    const isVerified = await checkEmailVerificationStatus();
    if (isVerified) {
      if (userProfile) {
        setUserProfile({ ...userProfile, emailVerified: true });
      }
      setAuthMessage({
        type: 'success',
        text: 'Barua pepe yako imethibitishwa kikamilifu!',
      });
      setActiveView('portal');
    }
    return isVerified;
  };

  const refreshProfile = async () => {
    if (!user) return null;
    const p = await getUserProfile(user.uid);
    if (p) {
      setUserProfile(p);
      setActiveRoleDashboard(p.role);
    }
    return p;
  };

  const updateUserRoleByAdmin = async (targetUid: string, newRole: UserRole) => {
    // Check if current user is admin
    if (userProfile?.role !== 'admin') {
      return { success: false, error: 'Idhini haitoshi: Wasimamizi pekee (Admin) wanaweza kubadilisha majukumu.' };
    }
    try {
      const userRef = doc(db, 'users', targetUid);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date().toISOString(),
      });
      // If updating self
      if (targetUid === user?.uid && userProfile) {
        setUserProfile({ ...userProfile, role: newRole });
        setActiveRoleDashboard(newRole);
      }
      return { success: true };
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.UPDATE, `users/${targetUid}`);
      }
      return { success: false, error: err?.message || 'Imeshindwa kusasisha jukumu.' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        authMessage,
        setAuthMessage,
        activeView,
        setActiveView: handleSetActiveView,
        activeRoleDashboard,
        setActiveRoleDashboard,
        login,
        loginWithDemoRole,
        signUp,
        loginWithGoogleAuth,
        logout,
        forgotPassword,
        resendVerification,
        checkVerification,
        refreshProfile,
        updateUserRoleByAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
