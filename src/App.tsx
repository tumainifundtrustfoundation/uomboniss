import React, { useState, useEffect, useRef, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider, useData } from './context/DataContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SchoolLogo } from './components/SchoolLogo';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { AcademicsSection } from './components/AcademicsSection';
import { LeadershipTeachersSection } from './components/LeadershipTeachersSection';
import { GallerySection } from './components/GallerySection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { StaffRole } from './services/staffSecurityService';
import { AcademicRole } from './components/AcademicPortalModal';
import { Loader2 } from 'lucide-react';
import { useDynamicMetaTags } from './hooks/useDynamicMetaTags';

// Modals statically imported for guaranteed availability and zero dynamic import fetch failures
import { StaffSecurityGateModal } from './components/StaffSecurityGateModal';
import { StudentPortalModal } from './components/StudentPortalModal';
import { ParentPortalModal } from './components/portal/ParentPortalModal';
import { ApplyNowModal } from './components/ApplyNowModal';
import { AdminPortalModal } from './components/AdminPortalModal';
import { BursarPortalModal } from './components/BursarPortalModal';
import { AcademicPortalModal } from './components/AcademicPortalModal';
import { TeacherStaffPortalModal } from './components/portal/TeacherStaffPortalModal';
import { NectaResultsModal } from './components/results/NectaResultsModal';
import { SchoolResultsModal } from './components/results/SchoolResultsModal';
import { SystemArchitectureModal } from './components/SystemArchitectureModal';
import { VituMuhimuModal } from './components/VituMuhimuModal';
import { OfficialJoiningInstructions2027Viewer } from './components/OfficialJoiningInstructions2027Viewer';
import { NewsModal } from './components/NewsModal';
import { AdmissionDocumentsPage } from './components/AdmissionDocumentsPage';
import { OfflineIndicator } from './components/OfflineIndicator';
import { InstallAppModal } from './components/InstallAppModal';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { FAQSection } from './components/FAQSection';
import { MapSection } from './components/MapSection';
import { OfficialSchoolAccreditationBanner } from './components/OfficialSchoolAccreditationBanner';

// Auth Views
import { WelcomeScreen } from './components/WelcomeScreen';
import { LoginPage } from './components/auth/LoginPage';
import { SignUpPage } from './components/auth/SignUpPage';
import { ForgotPasswordPage } from './components/auth/ForgotPasswordPage';
import { VerifyEmailPage } from './components/auth/VerifyEmailPage';
import { PortalContainer } from './components/portal/PortalContainer';

const ModalFallback = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#102A43]/75 backdrop-blur-xs">
    <div className="flex flex-col items-center gap-3 p-6 bg-white rounded-lg shadow-xl border border-[#102A43]/20">
      <Loader2 className="w-8 h-8 text-[#102A43] animate-spin" />
      <span className="text-xs font-semibold text-[#102A43]">Loading school system...</span>
    </div>
  </div>
);

function MainSchoolApp() {
  const { user, userProfile, activeView, setActiveView, loading } = useAuth();
  const {
    isAdminLoggedIn,
    loginAdminWithGoogle,
    logoutAdmin,
    isBursarLoggedIn,
    loginBursarWithGoogle,
    logoutBursar,
  } = useData();

  const [activeSection, setActiveSection] = useState('home');
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  // Modals state (strictly mutually exclusive to prevent overlapping/colliding login dialogs)
  const [isStaffGateOpen, setIsStaffGateOpen] = useState(false);
  const [isTeacherStaffPortalOpen, setIsTeacherStaffPortalOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);
  const [isAdmissionsModalOpen, setIsAdmissionsModalOpen] = useState(false);
  const [isNectaResultsOpen, setIsNectaResultsOpen] = useState(false);
  const [isSchoolResultsOpen, setIsSchoolResultsOpen] = useState(false);
  const [isVituMuhimuModalOpen, setIsVituMuhimuModalOpen] = useState(false);
  const [isJoiningInstructionsModalOpen, setIsJoiningInstructionsModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isBursarModalOpen, setIsBursarModalOpen] = useState(false);
  const [isAcademicPortalOpen, setIsAcademicPortalOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isNewsModalOpen, setIsNewsModalOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // Dynamic Meta-Tag Generator: updates title, description, OG tags & canonical in document head
  useDynamicMetaTags({
    activeSection,
    activeView,
    hash: currentHash,
    isNectaOpen: isNectaResultsOpen,
    isParentPortalOpen,
    isStaffPortalOpen: isTeacherStaffPortalOpen,
    isAdminOpen: isAdminModalOpen,
    isBursarOpen: isBursarModalOpen,
    isAcademicOpen: isAcademicPortalOpen,
    isAdmissionsOpen: isAdmissionsModalOpen,
    isArchitectureOpen: isArchitectureModalOpen,
    isSchoolResultsOpen,
  });

  const [staffGateInitialRole, setStaffGateInitialRole] = useState<StaffRole>('admin');
  const [academicInitialRole, setAcademicInitialRole] = useState<AcademicRole>('academic_master');
  const [isAcademicInitialAuthenticated, setIsAcademicInitialAuthenticated] = useState<boolean>(false);

  // Sync AuthContext user to DataContext admin/bursar state
  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'admin' && !isAdminLoggedIn) {
        loginAdminWithGoogle({
          email: user.email || userProfile.email || 'tumainifundtrustfoundation@gmail.com',
          displayName: userProfile.fullName || 'Admin',
          photoURL: user.photoURL || userProfile.photoURL || null,
        });
      }
      if (userProfile.role === 'bursar' && !isBursarLoggedIn) {
        loginBursarWithGoogle({
          email: user.email || userProfile.email || 'bursar@uombonisecondary.ac.tz',
          displayName: userProfile.fullName || 'Bursar',
          photoURL: user.photoURL || userProfile.photoURL || null,
        });
      }
    }
  }, [user, userProfile, isAdminLoggedIn, isBursarLoggedIn]);

  // Central modal dismisser: guarantees NO two modals or login screens can overlap
  const closeAllModals = () => {
    setIsStaffGateOpen(false);
    setIsTeacherStaffPortalOpen(false);
    setIsParentPortalOpen(false);
    setIsStudentPortalOpen(false);
    setIsAdmissionsModalOpen(false);
    setIsNectaResultsOpen(false);
    setIsSchoolResultsOpen(false);
    setIsVituMuhimuModalOpen(false);
    setIsJoiningInstructionsModalOpen(false);
    setIsAdminModalOpen(false);
    setIsBursarModalOpen(false);
    setIsAcademicPortalOpen(false);
    setIsArchitectureModalOpen(false);
    setIsNewsModalOpen(false);
    setIsInstallModalOpen(false);
  };

  const handleCloseModal = () => {
    closeAllModals();
    if (
      window.location.hash &&
      !['#about', '#academics', '#teachers', '#gallery', '#faq', '#location', '#contact'].includes(
        window.location.hash.toLowerCase()
      )
    ) {
      window.history.replaceState(null, '', window.location.pathname);
      setCurrentHash('');
    }
  };

  const handleOpenStaffGate = (role: StaffRole = 'admin') => {
    closeAllModals();
    setStaffGateInitialRole(role);
    setIsStaffGateOpen(true);
  };

  const handleOpenAdminModal = () => {
    closeAllModals();
    setIsAdminModalOpen(true);
  };

  const handleOpenBursarModal = () => {
    closeAllModals();
    setIsBursarModalOpen(true);
  };

  const handleOpenTeacherStaffPortal = () => {
    closeAllModals();
    setIsTeacherStaffPortalOpen(true);
  };

  const handleOpenParentPortal = () => {
    closeAllModals();
    if (user && userProfile) {
      setActiveView('portal');
    } else {
      setActiveView('login');
    }
  };
  const handleOpenStudentPortal = () => {
    closeAllModals();
    if (user && userProfile) {
      setActiveView('portal');
    } else {
      setActiveView('login');
    }
  };

  const handleOpenAcademicPortal = (
    role: AcademicRole = 'academic_master',
    authenticated: boolean = false
  ) => {
    closeAllModals();
    setAcademicInitialRole(role);
    setIsAcademicInitialAuthenticated(authenticated);
    setIsAcademicPortalOpen(true);
  };

  const handleNavigate = (sectionId: string) => {
    closeAllModals();
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // URL Route & Hash Listener & Hotkeys
  useEffect(() => {
    const checkRoute = () => {
      const pathname = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      setCurrentHash(hash || pathname);

      // Check direct clean paths first (for direct search engine crawler landing & navigation)
      if (
        pathname === '/admission-documents' ||
        pathname === '/joining-instructions' ||
        hash === '#admission-documents' ||
        hash === '#admissions-documents' ||
        hash === '#admission-docs' ||
        hash === '#documents' ||
        hash === '#joining-instructions' ||
        hash === '#joining' ||
        hash === '#fomu-kujiunga' ||
        hash === '#fomu' ||
        hash === '#maelekezo-kujiunga'
      ) {
        closeAllModals();
        setActiveView('admission-documents');
        return;
      }

      if (pathname === '/results' || hash === '#results' || hash === '#matokeo') {
        closeAllModals();
        setIsSchoolResultsOpen(true);
      } else if (pathname === '/necta' || hash === '#necta') {
        closeAllModals();
        setIsNectaResultsOpen(true);
      } else if (pathname === '/admissions' || hash === '#admissions' || hash === '#kujiunga') {
        closeAllModals();
        setIsAdmissionsModalOpen(true);
      } else if (pathname === '/news' || hash === '#news' || hash === '#habari' || hash === '#matangazo') {
        closeAllModals();
        setIsNewsModalOpen(true);
      } else if (pathname === '/faq' || hash === '#faq' || hash === '#maswali') {
        closeAllModals();
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (pathname === '/about' || hash === '#about') {
        closeAllModals();
        handleNavigate('about');
      } else if (pathname === '/academics' || hash === '#academics') {
        closeAllModals();
        handleNavigate('academics');
      } else if (
        pathname === '/ramani' ||
        pathname === '/location' ||
        pathname === '/map' ||
        hash === '#ramani' ||
        hash === '#location' ||
        hash === '#map'
      ) {
        closeAllModals();
        handleNavigate('location');
      } else if (pathname === '/contact' || hash === '#contact') {
        closeAllModals();
        handleNavigate('contact');
      } else if (pathname === '/teachers' || hash === '#teachers') {
        closeAllModals();
        handleNavigate('teachers');
      } else if (hash === '#welcome' || hash === '#karibu') {
        closeAllModals();
        setActiveView('welcome');
      } else if (hash === '#login' || hash === '#ingia') {
        closeAllModals();
        setActiveView('login');
      } else if (hash === '#signup' || hash === '#register') {
        closeAllModals();
        setActiveView('signup');
      } else if (hash === '#portal' || hash === '#dashboard') {
        closeAllModals();
        setActiveView('portal');
      } else if (
        hash === '#admin' ||
        hash === '#uomboni' ||
        hash === '#s0486' ||
        hash === '#administration' ||
        hash === '#administrate' ||
        hash === '#utawala'
      ) {
        handleOpenAdminModal();
      } else if (hash === '#staff' || hash === '#teacher' || hash === '#walimu' || hash === '#staffportal') {
        handleOpenTeacherStaffPortal();
      } else if (hash === '#bursar' || hash === '#mhasibu') {
        handleOpenBursarModal();
      } else if (
        hash === '#academic' ||
        hash === '#taaluma' ||
        hash === '#portal-taaluma' ||
        hash === '#portal_taaluma' ||
        hash === '#mitihani' ||
        hash === '#broadsheet'
      ) {
        handleOpenAcademicPortal('academic_master');
      } else if (hash === '#parent' || hash === '#wazazi') {
        handleOpenParentPortal();
      } else if (hash === '#student' || hash === '#wanafunzi' || hash === '#mwanafunzi') {
        handleOpenStudentPortal();
      } else if (hash === '#architecture' || hash === '#tech') {
        closeAllModals();
        setIsArchitectureModalOpen(true);
      } else if (hash === '#install' || hash === '#pwa') {
        closeAllModals();
        setIsInstallModalOpen(true);
      } else if (hash === '#vitu-muhimu' || hash === '#mahitaji' || hash === '#vitu' || hash === '#requirements') {
        closeAllModals();
        setIsVituMuhimuModalOpen(true);
      }
    };

    checkRoute();
    window.addEventListener('hashchange', checkRoute);
    window.addEventListener('popstate', checkRoute);
    return () => {
      window.removeEventListener('hashchange', checkRoute);
      window.removeEventListener('popstate', checkRoute);
    };
  }, [setActiveView]);

  // Section Observer for Dynamic SEO on Scroll
  useEffect(() => {
    const sectionIds = [
      'about',
      'academics',
      'teachers',
      'gallery',
      'faq',
      'location',
      'contact',
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -40% 0px',
        threshold: [0.3, 0.6],
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#102A43] flex flex-col items-center justify-center p-6 text-white text-center">
        <div className="w-16 h-16 mb-4 animate-pulse bg-white p-2 rounded-lg">
          <SchoolLogo className="w-full h-full object-contain" />
        </div>
        <h2 className="text-xl font-bold tracking-tight text-white">
          UOMBONI SECONDARY SCHOOL
        </h2>
        <p className="text-xs text-[#C9A227] mt-1 font-semibold">
          Tujiendeleze sisi wenyewe · NECTA S0486
        </p>
        <div className="mt-6 flex items-center gap-2 text-xs text-[#FFFFF0]/80">
          <Loader2 className="w-4 h-4 animate-spin text-[#C9A227]" />
          <span>Inapakia mfumo wa shule...</span>
        </div>
      </div>
    );
  }

  if (activeView === 'welcome') {
    return (
      <Suspense fallback={<ModalFallback />}>
        <WelcomeScreen onEnterWebsite={() => setActiveView('website')} />
      </Suspense>
    );
  }
  if (activeView === 'login') return <Suspense fallback={<ModalFallback />}><LoginPage /></Suspense>;
  if (activeView === 'signup') return <Suspense fallback={<ModalFallback />}><SignUpPage /></Suspense>;
  if (activeView === 'forgot-password') return <Suspense fallback={<ModalFallback />}><ForgotPasswordPage /></Suspense>;
  if (activeView === 'verify-email') return <Suspense fallback={<ModalFallback />}><VerifyEmailPage /></Suspense>;
  if (activeView === 'portal') return <Suspense fallback={<ModalFallback />}><PortalContainer /></Suspense>;
  if (activeView === 'admission-documents') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <AdmissionDocumentsPage
          onBackToHome={() => {
            closeAllModals();
            setActiveView('website');
            window.location.hash = '';
          }}
          onOpenApplyNow={() => setIsAdmissionsModalOpen(true)}
          onOpenAdminPortal={() => setIsAdminModalOpen(true)}
        />
        <OfflineIndicator />
        {isInstallModalOpen && (
          <InstallAppModal
            isOpen={isInstallModalOpen}
            onClose={() => setIsInstallModalOpen(false)}
          />
        )}
        {isAdmissionsModalOpen && (
          <Suspense fallback={<ModalFallback />}>
            <ApplyNowModal
              isOpen={isAdmissionsModalOpen}
              onClose={() => setIsAdmissionsModalOpen(false)}
            />
          </Suspense>
        )}
        {isAdminModalOpen && (
          <Suspense fallback={<ModalFallback />}>
            <AdminPortalModal
              isOpen={isAdminModalOpen}
              onClose={() => setIsAdminModalOpen(false)}
              onOpenBursar={handleOpenBursarModal}
              onOpenAcademic={(role) => handleOpenAcademicPortal(role)}
            />
          </Suspense>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#102A43] font-sans flex flex-col selection:bg-[#102A43] selection:text-white">
      {/* 1. Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenNews={() => {
          closeAllModals();
          setIsNewsModalOpen(true);
        }}
        onOpenAdmin={handleOpenAdminModal}
        onOpenParentPortal={handleOpenParentPortal}
        onOpenStudentPortal={handleOpenStudentPortal}
        onOpenStaffPortal={handleOpenTeacherStaffPortal}
        onOpenAcademicPortal={() => handleOpenAcademicPortal('academic_master')}
        onOpenAdmissions={() => {
          closeAllModals();
          setIsAdmissionsModalOpen(true);
        }}
        onOpenAdmissionDocuments={() => {
          closeAllModals();
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenJoiningInstructions={() => {
          closeAllModals();
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenVituMuhimu={() => {
          closeAllModals();
          setIsVituMuhimuModalOpen(true);
        }}
        onOpenWelcome={() => {
          closeAllModals();
          setActiveView('welcome');
        }}
        onOpenLogin={() => {
          closeAllModals();
          setActiveView('login');
        }}
      />

      <main className="flex-grow">
        {/* 1. Hero */}
        <Hero
          onNavigate={handleNavigate}
          onOpenAdmin={handleOpenAdminModal}
          onOpenAdmissionDocuments={() => {
            closeAllModals();
            setActiveView('admission-documents');
            window.location.hash = '#admission-documents';
          }}
        />

        {/* 1.5 Official School Accreditation & Anti-Fraud Verification Banner */}
        <OfficialSchoolAccreditationBanner
          onOpenResults={() => {
            closeAllModals();
            setIsNectaResultsOpen(true);
          }}
          onOpenAdmissions={() => {
            closeAllModals();
            setIsAdmissionsModalOpen(true);
          }}
        />

        {/* 2. About */}
        <AboutSection
          onNavigate={handleNavigate}
        />

        {/* 3. Academics & Performance */}
        <AcademicsSection
          onOpenResults={() => {
            closeAllModals();
            setIsNectaResultsOpen(true);
          }}
          onOpenAcademicPortal={() => handleOpenAcademicPortal('academic_master')}
        />

        {/* 4. Teachers (Meet Our Faculty) */}
        <LeadershipTeachersSection />

        {/* 5. Campus Photo Gallery (Animated) */}
        <GallerySection />

        {/* 6. Frequently Asked Questions (FAQ) Accordion */}
        <FAQSection
          onOpenAdmissionDocuments={() => {
            closeAllModals();
            setActiveView('admission-documents');
            window.location.hash = '#admission-documents';
          }}
          onOpenContact={() => handleNavigate('contact')}
        />

        {/* 7. Official School Location & Google Maps Interactive Section */}
        <MapSection
          onOpenAdmissions={() => {
            closeAllModals();
            setIsAdmissionsModalOpen(true);
          }}
        />

        {/* 8. Contact & Location */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenNews={() => {
          closeAllModals();
          setIsNewsModalOpen(true);
        }}
        onOpenAdmin={handleOpenAdminModal}
        onOpenStaffPortal={handleOpenTeacherStaffPortal}
        onOpenParentPortal={handleOpenParentPortal}
        onOpenStudentPortal={handleOpenStudentPortal}
        onOpenAcademicPortal={() => handleOpenAcademicPortal('academic_master')}
        onOpenAdmissions={() => {
          closeAllModals();
          setIsAdmissionsModalOpen(true);
        }}
        onOpenAdmissionDocuments={() => {
          closeAllModals();
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenJoiningInstructions={() => {
          closeAllModals();
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenVituMuhimu={() => {
          closeAllModals();
          setIsVituMuhimuModalOpen(true);
        }}
        onOpenResults={() => {
          closeAllModals();
          setIsSchoolResultsOpen(true);
        }}
      />

      {/* Modals - strictly mutually exclusive, cannot overlap */}
      {/* Staff Security Gate Modal */}
      {isStaffGateOpen && (
        <Suspense fallback={<ModalFallback />}>
          <StaffSecurityGateModal
            isOpen={isStaffGateOpen}
            onClose={handleCloseModal}
            initialRole={staffGateInitialRole}
            onOpenAdmin={handleOpenAdminModal}
            onOpenBursar={handleOpenBursarModal}
            onOpenAcademicMaster={() => handleOpenAcademicPortal('academic_master', true)}
            onOpenTeacher={handleOpenTeacherStaffPortal}
          />
        </Suspense>
      )}

      {/* Teachers & Staff Portal Modal (Sepia Identity) */}
      {isTeacherStaffPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <TeacherStaffPortalModal
            isOpen={isTeacherStaffPortalOpen}
            onClose={handleCloseModal}
            onOpenAdminPortal={handleOpenAdminModal}
            onOpenBursarPortal={handleOpenBursarModal}
            onOpenAcademicPortal={() => handleOpenAcademicPortal('academic_master')}
            onOpenStaffGate={() => handleOpenStaffGate('admin')}
          />
        </Suspense>
      )}

      {/* Parent Portal Modal (Sepia Identity) */}
      {isParentPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <ParentPortalModal
            isOpen={isParentPortalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* Student Portal Modal */}
      {isStudentPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <StudentPortalModal
            isOpen={isStudentPortalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* Admissions / Apply Modal */}
      {isAdmissionsModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <ApplyNowModal
            isOpen={isAdmissionsModalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* Vitu Muhimu (Essential Items Checklist) Modal */}
      {isVituMuhimuModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <VituMuhimuModal
            isOpen={isVituMuhimuModalOpen}
            onClose={handleCloseModal}
            onOpenApply={() => {
              closeAllModals();
              setIsAdmissionsModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Official Joining Instructions 2027 Modal */}
      {isJoiningInstructionsModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <OfficialJoiningInstructions2027Viewer
            isModal={true}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* NECTA Results Modal */}
      {isNectaResultsOpen && (
        <Suspense fallback={<ModalFallback />}>
          <NectaResultsModal
            isOpen={isNectaResultsOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* School Results Modal */}
      {isSchoolResultsOpen && (
        <Suspense fallback={<ModalFallback />}>
          <SchoolResultsModal
            isOpen={isSchoolResultsOpen}
            onClose={handleCloseModal}
            onOpenParentPortal={handleOpenParentPortal}
          />
        </Suspense>
      )}

      {/* Admin Portal Modal */}
      {isAdminModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <AdminPortalModal
            isOpen={isAdminModalOpen}
            onClose={handleCloseModal}
            onOpenBursar={handleOpenBursarModal}
            onOpenAcademic={(role) => handleOpenAcademicPortal(role)}
            onOpenJoiningInstructions={() => {
              closeAllModals();
              setIsJoiningInstructionsModalOpen(true);
            }}
            onOpenVituMuhimu={() => {
              closeAllModals();
              setIsVituMuhimuModalOpen(true);
            }}
            onOpenAdmissions={() => {
              closeAllModals();
              setIsAdmissionsModalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Bursar Portal Modal */}
      {isBursarModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <BursarPortalModal
            isOpen={isBursarModalOpen}
            onClose={handleCloseModal}
            onOpenAdmin={handleOpenAdminModal}
            onOpenAcademic={(role) => handleOpenAcademicPortal(role)}
          />
        </Suspense>
      )}

      {/* Academic Master Portal Modal */}
      {isAcademicPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <AcademicPortalModal
            isOpen={isAcademicPortalOpen}
            onClose={handleCloseModal}
            initialRole={academicInitialRole}
            initialAuthenticated={isAcademicInitialAuthenticated}
          />
        </Suspense>
      )}

      {/* System Architecture Modal (technical blueprint via #architecture) */}
      {isArchitectureModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <SystemArchitectureModal
            isOpen={isArchitectureModalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* Hot News & Announcements Modal */}
      {isNewsModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <NewsModal
            isOpen={isNewsModalOpen}
            onClose={handleCloseModal}
          />
        </Suspense>
      )}

      {/* PWA Floating Install Banner and Offline Indicator */}
      <OfflineIndicator />
      <PWAInstallBanner onOpenInstallModal={() => setIsInstallModalOpen(true)} />
      {isInstallModalOpen && (
        <InstallAppModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <AuthProvider>
          <MainSchoolApp />
        </AuthProvider>
      </DataProvider>
    </LanguageProvider>
  );
}
