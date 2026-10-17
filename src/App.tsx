import React, { useState, useEffect, useRef, Suspense } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { DataProvider } from './context/DataContext';
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
  const { activeView, setActiveView, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('home');
  const [currentHash, setCurrentHash] = useState(() => window.location.hash);

  // Modals state
  const [isStaffGateOpen, setIsStaffGateOpen] = useState(false);
  const [isTeacherStaffPortalOpen, setIsTeacherStaffPortalOpen] = useState(false);
  const [isParentPortalOpen, setIsParentPortalOpen] = useState(false);
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

  const handleOpenStaffGate = (role: StaffRole = 'admin') => {
    setStaffGateInitialRole(role);
    setIsStaffGateOpen(true);
  };

  const handleOpenAcademicPortalWithRole = (
    role: AcademicRole = 'academic_master',
    authenticated: boolean = false
  ) => {
    setAcademicInitialRole(role);
    setIsAcademicInitialAuthenticated(authenticated);
    setIsAcademicPortalOpen(true);
  };

  const handleNavigate = (sectionId: string) => {
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
        setActiveView('admission-documents');
        return;
      }

      if (pathname === '/results' || hash === '#results' || hash === '#matokeo') {
        setIsSchoolResultsOpen(true);
      } else if (pathname === '/necta' || hash === '#necta') {
        setIsNectaResultsOpen(true);
      } else if (pathname === '/admissions' || hash === '#admissions' || hash === '#kujiunga') {
        setIsAdmissionsModalOpen(true);
      } else if (pathname === '/news' || hash === '#news' || hash === '#habari' || hash === '#matangazo') {
        setIsNewsModalOpen(true);
      } else if (pathname === '/faq' || hash === '#faq' || hash === '#maswali') {
        const el = document.getElementById('faq');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      } else if (pathname === '/about' || hash === '#about') {
        handleNavigate('about');
      } else if (pathname === '/academics' || hash === '#academics') {
        handleNavigate('academics');
      } else if (
        pathname === '/ramani' ||
        pathname === '/location' ||
        pathname === '/map' ||
        hash === '#ramani' ||
        hash === '#location' ||
        hash === '#map'
      ) {
        handleNavigate('location');
      } else if (pathname === '/contact' || hash === '#contact') {
        handleNavigate('contact');
      } else if (pathname === '/teachers' || hash === '#teachers') {
        handleNavigate('teachers');
      } else if (hash === '#welcome' || hash === '#karibu') {
        setActiveView('welcome');
      } else if (hash === '#login' || hash === '#ingia') {
        setActiveView('login');
      } else if (hash === '#signup' || hash === '#register') {
        setActiveView('signup');
      } else if (hash === '#portal' || hash === '#dashboard') {
        setActiveView('portal');
      } else if (
        hash === '#admin' ||
        hash === '#uomboni' ||
        hash === '#s0486' ||
        hash === '#administration' ||
        hash === '#administrate' ||
        hash === '#utawala'
      ) {
        setIsAdminModalOpen(true);
      } else if (hash === '#staff' || hash === '#teacher' || hash === '#walimu' || hash === '#staffportal') {
        setIsTeacherStaffPortalOpen(true);
      } else if (hash === '#bursar' || hash === '#mhasibu') {
        handleOpenStaffGate('bursar');
      } else if (
        hash === '#academic' ||
        hash === '#taaluma' ||
        hash === '#portal-taaluma' ||
        hash === '#portal_taaluma' ||
        hash === '#mitihani' ||
        hash === '#broadsheet'
      ) {
        handleOpenAcademicPortalWithRole('academic_master');
      } else if (hash === '#parent' || hash === '#wazazi') {
        setIsParentPortalOpen(true);
      } else if (hash === '#architecture' || hash === '#tech') {
        setIsArchitectureModalOpen(true);
      } else if (hash === '#install' || hash === '#pwa') {
        setIsInstallModalOpen(true);
      } else if (hash === '#vitu-muhimu' || hash === '#mahitaji' || hash === '#vitu' || hash === '#requirements') {
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
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#102A43] font-sans flex flex-col selection:bg-[#102A43] selection:text-white">
      {/* 1. Navigation */}
      <Navbar
        activeSection={activeSection}
        onNavigate={handleNavigate}
        onOpenNews={() => setIsNewsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        onOpenStaffPortal={() => setIsTeacherStaffPortalOpen(true)}
        onOpenAcademicPortal={() => handleOpenAcademicPortalWithRole('academic_master')}
        onOpenAdmissions={() => setIsAdmissionsModalOpen(true)}
        onOpenAdmissionDocuments={() => {
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenJoiningInstructions={() => {
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenVituMuhimu={() => setIsVituMuhimuModalOpen(true)}
        onOpenWelcome={() => setActiveView('welcome')}
        onOpenLogin={() => setActiveView('login')}
      />

      <main className="flex-grow">
        {/* 1. Hero */}
        <Hero
          onNavigate={handleNavigate}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenAdmissionDocuments={() => {
            setActiveView('admission-documents');
            window.location.hash = '#admission-documents';
          }}
        />

        {/* 2. About */}
        <AboutSection
          onNavigate={handleNavigate}
        />

        {/* 3. Academics & Performance */}
        <AcademicsSection
          onOpenResults={() => setIsNectaResultsOpen(true)}
          onOpenAcademicPortal={() => handleOpenAcademicPortalWithRole('academic_master')}
        />

        {/* 4. Teachers (Meet Our Faculty) */}
        <LeadershipTeachersSection />

        {/* 5. Campus Photo Gallery (Animated) */}
        <GallerySection />

        {/* 6. Frequently Asked Questions (FAQ) Accordion */}
        <FAQSection
          onOpenAdmissionDocuments={() => {
            setActiveView('admission-documents');
            window.location.hash = '#admission-documents';
          }}
          onOpenContact={() => handleNavigate('contact')}
        />

        {/* 7. Official School Location & Google Maps Interactive Section */}
        <MapSection
          onOpenAdmissions={() => setIsAdmissionsModalOpen(true)}
        />

        {/* 8. Contact & Location */}
        <ContactSection />
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenNews={() => setIsNewsModalOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenStaffPortal={() => setIsTeacherStaffPortalOpen(true)}
        onOpenParentPortal={() => setIsParentPortalOpen(true)}
        onOpenAcademicPortal={() => handleOpenAcademicPortalWithRole('academic_master')}
        onOpenAdmissions={() => setIsAdmissionsModalOpen(true)}
        onOpenAdmissionDocuments={() => {
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenJoiningInstructions={() => {
          setActiveView('admission-documents');
          window.location.hash = '#admission-documents';
        }}
        onOpenVituMuhimu={() => setIsVituMuhimuModalOpen(true)}
        onOpenResults={() => setIsSchoolResultsOpen(true)}
      />

      {/* Modals */}
      {/* Staff Security Gate Modal */}
      {isStaffGateOpen && (
        <Suspense fallback={<ModalFallback />}>
          <StaffSecurityGateModal
            isOpen={isStaffGateOpen}
            onClose={() => setIsStaffGateOpen(false)}
            initialRole={staffGateInitialRole}
            onOpenAdmin={() => {
              setIsStaffGateOpen(false);
              setIsAdminModalOpen(true);
            }}
            onOpenBursar={() => {
              setIsStaffGateOpen(false);
              setIsBursarModalOpen(true);
            }}
            onOpenAcademicMaster={() => {
              setIsStaffGateOpen(false);
              handleOpenAcademicPortalWithRole('academic_master', true);
            }}
            onOpenTeacher={() => {
              setIsStaffGateOpen(false);
              setIsTeacherStaffPortalOpen(true);
            }}
          />
        </Suspense>
      )}

      {/* Teachers & Staff Portal Modal (Sepia Identity) */}
      {isTeacherStaffPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <TeacherStaffPortalModal
            isOpen={isTeacherStaffPortalOpen}
            onClose={() => setIsTeacherStaffPortalOpen(false)}
            onOpenAdminPortal={() => {
              setIsTeacherStaffPortalOpen(false);
              setIsAdminModalOpen(true);
            }}
            onOpenBursarPortal={() => {
              setIsTeacherStaffPortalOpen(false);
              setIsBursarModalOpen(true);
            }}
            onOpenAcademicPortal={() => {
              setIsTeacherStaffPortalOpen(false);
              handleOpenAcademicPortalWithRole('academic_master');
            }}
            onOpenStaffGate={() => {
              setIsTeacherStaffPortalOpen(false);
              handleOpenStaffGate('admin');
            }}
          />
        </Suspense>
      )}

      {/* Parent Portal Modal (Sepia Identity) */}
      {isParentPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <StudentPortalModal
            isOpen={isParentPortalOpen}
            onClose={() => setIsParentPortalOpen(false)}
          />
        </Suspense>
      )}

      {/* Admissions / Apply Modal */}
      {isAdmissionsModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <ApplyNowModal
            isOpen={isAdmissionsModalOpen}
            onClose={() => setIsAdmissionsModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Vitu Muhimu (Essential Items Checklist) Modal */}
      {isVituMuhimuModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <VituMuhimuModal
            isOpen={isVituMuhimuModalOpen}
            onClose={() => setIsVituMuhimuModalOpen(false)}
            onOpenApply={() => {
              setIsVituMuhimuModalOpen(false);
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
            onClose={() => setIsJoiningInstructionsModalOpen(false)}
          />
        </Suspense>
      )}

      {/* NECTA Results Modal */}
      {isNectaResultsOpen && (
        <Suspense fallback={<ModalFallback />}>
          <NectaResultsModal
            isOpen={isNectaResultsOpen}
            onClose={() => setIsNectaResultsOpen(false)}
          />
        </Suspense>
      )}

      {/* School Results Modal */}
      {isSchoolResultsOpen && (
        <Suspense fallback={<ModalFallback />}>
          <SchoolResultsModal
            isOpen={isSchoolResultsOpen}
            onClose={() => setIsSchoolResultsOpen(false)}
            onOpenParentPortal={() => setIsParentPortalOpen(true)}
          />
        </Suspense>
      )}

      {/* Admin Portal Modal */}
      {isAdminModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <AdminPortalModal
            isOpen={isAdminModalOpen}
            onClose={() => setIsAdminModalOpen(false)}
            onOpenBursar={() => {
              setIsAdminModalOpen(false);
              setIsBursarModalOpen(true);
            }}
            onOpenAcademic={(role) => {
              setIsAdminModalOpen(false);
              handleOpenAcademicPortalWithRole(role);
            }}
            onOpenJoiningInstructions={() => setIsJoiningInstructionsModalOpen(true)}
            onOpenVituMuhimu={() => setIsVituMuhimuModalOpen(true)}
            onOpenAdmissions={() => setIsAdmissionsModalOpen(true)}
          />
        </Suspense>
      )}

      {/* Bursar Portal Modal */}
      {isBursarModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <BursarPortalModal
            isOpen={isBursarModalOpen}
            onClose={() => setIsBursarModalOpen(false)}
            onOpenAdmin={() => {
              setIsBursarModalOpen(false);
              setIsAdminModalOpen(true);
            }}
            onOpenAcademic={(role) => {
              setIsBursarModalOpen(false);
              handleOpenAcademicPortalWithRole(role);
            }}
          />
        </Suspense>
      )}

      {/* Academic Master Portal Modal */}
      {isAcademicPortalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <AcademicPortalModal
            isOpen={isAcademicPortalOpen}
            onClose={() => setIsAcademicPortalOpen(false)}
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
            onClose={() => setIsArchitectureModalOpen(false)}
          />
        </Suspense>
      )}

      {/* Hot News & Announcements Modal */}
      {isNewsModalOpen && (
        <Suspense fallback={<ModalFallback />}>
          <NewsModal
            isOpen={isNewsModalOpen}
            onClose={() => setIsNewsModalOpen(false)}
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
