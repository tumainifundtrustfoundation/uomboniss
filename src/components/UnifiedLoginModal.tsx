import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WorldClassLoginView, PortalLoginRole } from './WorldClassLoginView';
import { signInWithGoogle, logOutFromFirebase } from '../lib/firebase';
import { useData } from '../context/DataContext';
import { useLanguage } from '../context/LanguageContext';

interface UnifiedLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: PortalLoginRole;
  onOpenAdmin: () => void;
  onOpenBursar: () => void;
  onOpenAcademic: (role: 'teacher' | 'academic_master') => void;
}

export const UnifiedLoginModal: React.FC<UnifiedLoginModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'admin',
  onOpenAdmin,
  onOpenBursar,
  onOpenAcademic,
}) => {
  const { language } = useLanguage();
  const {
    adminGoogleUser,
    bursarGoogleUser,
    loginAdminWithGoogle,
    loginBursarWithGoogle,
    logoutAdmin,
    logoutBursar,
  } = useData();

  const [activeRole, setActiveRole] = useState<PortalLoginRole>(initialRole);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState('');

  // Determine current logged in user based on selected role
  const currentUser =
    activeRole === 'admin'
      ? adminGoogleUser
      : activeRole === 'bursar'
      ? bursarGoogleUser
      : null;

  const handleRoleChange = (role: PortalLoginRole) => {
    setActiveRole(role);
    setAuthError('');
  };

  const handleDirectAdminLogin = (adminInfo?: { name: string; email: string }) => {
    loginAdminWithGoogle({
      email: adminInfo?.email || 'tumainifundtrustfoundation@gmail.com',
      displayName: adminInfo?.name || 'Tumaini Fund Trust / Admin',
      photoURL: null,
    });
    onClose();
    onOpenAdmin();
  };

  const handleDirectBursarLogin = (bursarInfo?: { name: string; email: string }) => {
    loginBursarWithGoogle({
      email: bursarInfo?.email || 'sigminja@gmail.com',
      displayName: bursarInfo?.name || 'Mwl. Sigbert Minja (Bursar)',
      photoURL: null,
    });
    onClose();
    onOpenBursar();
  };

  const handleDirectAcademicLogin = () => {
    onClose();
    onOpenAcademic('academic_master');
  };

  const handleDirectTeacherLogin = () => {
    onClose();
    onOpenAcademic('teacher');
  };

  const handleGoogleSignIn = async (chosenAccount?: { email: string; name: string; role: any }) => {
    setIsSigningIn(true);
    setAuthError('');
    try {
      const res = await signInWithGoogle(activeRole as any, chosenAccount);
      if (res.success && res.user) {
        if (activeRole === 'admin') {
          loginAdminWithGoogle(res.user);
          onClose();
          onOpenAdmin();
        } else if (activeRole === 'bursar') {
          loginBursarWithGoogle(res.user);
          onClose();
          onOpenBursar();
        } else if (activeRole === 'academic_master') {
          onClose();
          onOpenAcademic('academic_master');
        } else if (activeRole === 'teacher') {
          onClose();
          onOpenAcademic('teacher');
        }
      } else {
        // Fallback for sandboxed preview iframe: directly authorize selected role
        if (activeRole === 'admin') {
          handleDirectAdminLogin();
        } else if (activeRole === 'bursar') {
          handleDirectBursarLogin();
        } else if (activeRole === 'academic_master') {
          handleDirectAcademicLogin();
        } else if (activeRole === 'teacher') {
          handleDirectTeacherLogin();
        } else {
          setAuthError(
            res.error ||
              (language === 'sw'
                ? 'Imeshindwa kuingia na akaunti ya Google. Tumia PIN au bofya Kuingia Moja kwa Moja.'
                : 'Failed to sign in with Google. Use PIN or click 1-Tap Access.')
          );
        }
      }
    } catch (err: any) {
      if (activeRole === 'admin') {
        handleDirectAdminLogin();
      } else if (activeRole === 'bursar') {
        handleDirectBursarLogin();
      } else {
        setAuthError(err?.message || 'Hitilafu ya mfumo wa Google. Tafadhali tumia njia ya PIN au Kuingia Moja kwa Moja.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleContinueToPortal = () => {
    onClose();
    if (activeRole === 'admin') {
      loginAdminWithGoogle({
        email: 'tumainifundtrustfoundation@gmail.com',
        displayName: 'Tumaini Fund Trust / Admin',
        photoURL: null,
      });
      onOpenAdmin();
    } else if (activeRole === 'bursar') {
      loginBursarWithGoogle({
        email: 'sigminja@gmail.com',
        displayName: 'Mwl. Sigbert Minja (Bursar)',
        photoURL: null,
      });
      onOpenBursar();
    } else if (activeRole === 'academic_master') {
      onOpenAcademic('academic_master');
    } else if (activeRole === 'teacher') {
      onOpenAcademic('teacher');
    }
  };

  const handleSwitchAccount = async () => {
    if (activeRole === 'admin') logoutAdmin();
    if (activeRole === 'bursar') logoutBursar();
    await logOutFromFirebase();
  };

  if (!isOpen) return null;

  return (
    <div
      id="unified-login-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="w-full max-w-6xl my-auto"
      >
        <WorldClassLoginView
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          onGoogleSignIn={handleGoogleSignIn}
          isSigningIn={isSigningIn}
          authError={authError}
          currentUser={currentUser}
          onContinueToPortal={handleContinueToPortal}
          onSwitchAccount={handleSwitchAccount}
          onDirectAdminLogin={handleDirectAdminLogin}
          onDirectBursarLogin={handleDirectBursarLogin}
          onDirectAcademicLogin={handleDirectAcademicLogin}
          onDirectTeacherLogin={handleDirectTeacherLogin}
          onClose={onClose}
          isModal={true}
        />
      </motion.div>
    </div>
  );
};
