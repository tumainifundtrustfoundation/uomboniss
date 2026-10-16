import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { JoiningDocument } from '../types';
import {
  CheckCircle2,
  Circle,
  Download,
  FileText,
  CreditCard,
  School,
  Sparkles,
  RotateCcw,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink,
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { downloadJoiningInstructionsPdf } from '../utils/pdfService';

interface StudentEnrollmentProgressBarProps {
  onOpenApply?: () => void;
  onSelectLetterTab?: () => void;
  onSelectDocsTab?: () => void;
}

interface OnboardingStep {
  id: number;
  titleSw: string;
  titleEn: string;
  subtitleSw: string;
  subtitleEn: string;
  icon: React.ElementType;
  descriptionSw: string;
  descriptionEn: string;
  actionTextSw: string;
  actionTextEn: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 1,
    titleSw: 'Pakua Fomu & Barua Rasmi',
    titleEn: 'Download Forms & Letter',
    subtitleSw: 'Fomu Kuu ya Kujiunga & Mwaliko',
    subtitleEn: 'Joining Instructions & Invitation',
    icon: FileText,
    descriptionSw:
      'Pakua Fomu Rasmi ya Maelekezo ya Kujiunga (Joining Instructions 2026/2027) pamoja na Barua ya Mwaliko. Soma sheria, miongozo ya nidhamu, sare za shule, na vifaa vinavyohitajika.',
    descriptionEn:
      'Download the official 2026/2027 Joining Instructions prospectus along with the Invitation Letter. Carefully review the school code of conduct, uniform requirements, and necessary personal items.',
    actionTextSw: 'Pakua Fomu Kuu ya PDF',
    actionTextEn: 'Download Main Joining PDF',
  },
  {
    id: 2,
    titleSw: 'Jaza Maombi Mtandaoni',
    titleEn: 'Online Admission Application',
    subtitleSw: 'Udahili wa Form 1 au Uhamisho',
    subtitleEn: 'Form 1 Intake / Transfer',
    icon: UserPlus,
    descriptionSw:
      'Jaza fomu ya maombi ya mtandaoni kwa kuweka taarifa kamili za mwanafunzi, shule aliyotoka, namba ya PREM au ya mtihani wa darasa la saba (PSLE), na mawasiliano ya mzazi/mlezi. Mfumo utakupa Namba Rasmi ya Maombi (mfano APP-2026-XXXX).',
    descriptionEn:
      'Submit the online admission form with student demographics, primary school PREM number or Standard 7 PSLE exam number, previous grades, and parent/guardian contacts. You will receive an official Application Tracking ID (e.g. APP-2026-XXXX).',
    actionTextSw: 'Anza Kujaza Maombi Mtandaoni Sasa',
    actionTextEn: 'Start Online Application Now',
  },
  {
    id: 3,
    titleSw: 'Uchunguzi wa Afya Hospitalini',
    titleEn: 'Medical Examination & Health',
    subtitleSw: 'Ripoti ya Daktari Aliyesajiliwa',
    subtitleEn: 'Registered Doctor Clearance',
    icon: Stethoscope,
    descriptionSw:
      'Mwanafunzi anapaswa kufanyiwa uchunguzi wa kimatibabu (Vipimo vya macho, kifua, damu, na magonjwa sugu) katika Hospitali ya Serikali au Misheni. Fomu ya matibabu iliyopo kwenye fomu kuu lazima igongwe mhuri rasmi wa hospitali.',
    descriptionEn:
      'The student must undergo a full medical check-up (vision, chest, blood group, chronic conditions) at an authorized Government or Mission hospital. The attached medical report form must be endorsed with official hospital stamp.',
    actionTextSw: 'Angalia Mwongozo wa Matibabu',
    actionTextEn: 'Review Medical Requirements',
  },
  {
    id: 4,
    titleSw: 'Malipo ya Ada & Risiti ya Benki',
    titleEn: 'Tuition Payment & Bank Slip',
    subtitleSw: 'Akaunti Rasmi ya Shule CRDB',
    subtitleEn: 'Official School CRDB Account',
    icon: CreditCard,
    descriptionSw:
      'Lipa ada ya shule (nusu au mwaka mzima) kupitia akaunti rasmi ya Shule ya Sekondari Uomboni katika Benki ya CRDB. Tunza risiti halisi ya benki (Pay-in Slip) kwa ajili ya kuwasilisha siku ya kuripoti shuleni.',
    descriptionEn:
      'Pay school fees (installment or full annual) into the official Uomboni Secondary School bank account at CRDB Bank. Retain the authentic bank deposit slip (pay-in slip) to present on arrival.',
    actionTextSw: 'Tazama Namba ya Akaunti ya Benki',
    actionTextEn: 'View Bank Account Details',
  },
  {
    id: 5,
    titleSw: 'Kuripoti Shuleni & Kuanza Masomo',
    titleEn: 'Campus Reporting & Orientation',
    subtitleSw: 'Tarehe 11 Januari 2026',
    subtitleEn: 'January 11, 2026 Intake',
    icon: School,
    descriptionSw:
      'Ripoti shuleni Marangu Magharibi ukiwa na vifaa vyote vya bweni/kutwa, sare rasmi, fomu halisi ya matibabu, vyeti vya msingi, na risiti ya ada. Mwanafunzi atakabidhiwa kitanda, bweni, na kuingizwa rasmi kwenye rejista ya shule.',
    descriptionEn:
      'Report on-campus at Marangu West with boarding/day supplies, approved school uniforms, original medical report, primary school leaving certificate, and bank slip. Student receives dormitory room, locker, and orientation.',
    actionTextSw: 'Tazama Ratiba ya Mapokezi',
    actionTextEn: 'View Reporting Schedule',
  },
];

const STORAGE_KEY = 'uomboni_student_onboarding_progress_v1';

export const StudentEnrollmentProgressBar: React.FC<StudentEnrollmentProgressBarProps> = ({
  onOpenApply,
  onSelectLetterTab,
  onSelectDocsTab,
}) => {
  const { language } = useLanguage();
  const { joiningDocs, incrementDocDownload, applications } = useData();

  // Load completed step IDs from localStorage
  const [completedSteps, setCompletedSteps] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // fallback
    }
    return [1]; // Step 1 pre-checked or in-progress
  });

  const [activeStepId, setActiveStepId] = useState<number>(1);
  const [studentLookupQuery, setStudentLookupQuery] = useState('');
  const [lookupMessage, setLookupMessage] = useState<{ type: 'success' | 'info' | 'error'; text: string } | null>(null);

  // Save to localStorage whenever completedSteps change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(completedSteps));
    } catch {
      // ignore
    }
  }, [completedSteps]);

  // Compute completion metrics
  const totalSteps = ONBOARDING_STEPS.length;
  const completedCount = completedSteps.length;
  const progressPercentage = Math.round((completedCount / totalSteps) * 100);

  const toggleStepCompleted = (stepId: number) => {
    setCompletedSteps((prev) => {
      if (prev.includes(stepId)) {
        return prev.filter((id) => id !== stepId);
      } else {
        return [...prev, stepId].sort((a, b) => a - b);
      }
    });
  };

  const handleResetProgress = () => {
    if (
      window.confirm(
        language === 'sw'
          ? 'Je, unataka kurejesha upya maendeleo ya kujiunga (Reset Onboarding Progress)?'
          : 'Do you want to reset your onboarding progress?'
      )
    ) {
      setCompletedSteps([]);
      setActiveStepId(1);
      setLookupMessage(null);
      setStudentLookupQuery('');
    }
  };

  const handleDownloadMainPack = () => {
    if (joiningDocs[0]) {
      incrementDocDownload(joiningDocs[0].id);
      downloadJoiningInstructionsPdf(joiningDocs[0]);
      if (!completedSteps.includes(1)) {
        setCompletedSteps((prev) => [...prev, 1].sort((a, b) => a - b));
      }
    }
  };

  const handleStepAction = (stepId: number) => {
    if (stepId === 1) {
      handleDownloadMainPack();
    } else if (stepId === 2) {
      if (onOpenApply) onOpenApply();
      if (!completedSteps.includes(2)) {
        setCompletedSteps((prev) => [...prev, 2].sort((a, b) => a - b));
      }
    } else if (stepId === 3) {
      if (onSelectDocsTab) onSelectDocsTab();
    } else if (stepId === 4) {
      // mark step 4 and show details
    } else if (stepId === 5) {
      if (onSelectLetterTab) onSelectLetterTab();
    }
  };

  // Search through online applications to auto-detect onboarding status
  const handleLookupApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentLookupQuery.trim()) return;

    const query = studentLookupQuery.trim().toLowerCase();
    const match = applications.find(
      (app) =>
        app.applicationNumber.toLowerCase().includes(query) ||
        app.studentName.toLowerCase().includes(query) ||
        app.parentPhone.includes(query)
    );

    if (match) {
      // Auto complete steps based on application status
      const updated = new Set<number>([1, 2]);
      if (match.status === 'Imethibitishwa') {
        updated.add(3);
        updated.add(4);
      } else if (match.status === 'Inashughulikiwa') {
        updated.add(3);
      }
      setCompletedSteps(Array.from(updated).sort((a, b) => a - b));
      setActiveStepId(match.status === 'Imethibitishwa' ? 5 : 3);
      setLookupMessage({
        type: 'success',
        text:
          language === 'sw'
            ? `Maombi ya ${match.studentName} (${match.applicationNumber}) yamepatikana! Hali: "${match.status}". Maendeleo yamesawazishwa.`
            : `Application for ${match.studentName} (${match.applicationNumber}) found! Status: "${match.status}". Progress synchronized.`,
      });
    } else {
      setLookupMessage({
        type: 'info',
        text:
          language === 'sw'
            ? `Hatujaona maombi yenye utambulisho "${studentLookupQuery}". Unaweza kujaza maombi mapya mtandaoni sasa.`
            : `No existing application found for "${studentLookupQuery}". You can initiate a new application below.`,
      });
    }
  };

  const currentStep = ONBOARDING_STEPS.find((s) => s.id === activeStepId) || ONBOARDING_STEPS[0];
  const isCurrentStepDone = completedSteps.includes(currentStep.id);

  return (
    <div
      id="student-onboarding-tracker"
      className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 lg:p-10 border border-emerald-500/30 shadow-2xl space-y-8"
    >
      {/* Top Header & Overview */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-emerald-800/60">
        <div className="space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>{language === 'sw' ? 'Mchakato wa Kujiunga 2026/2027' : 'Student Enrollment Onboarding'}</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-emerald-950 font-mono font-black text-xs">
              {progressPercentage}% {language === 'sw' ? 'IMEKAMILIKA' : 'COMPLETED'}
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight">
            {language === 'sw'
              ? 'Mwongozo wa Hatua kwa Hatua wa Mwanafunzi Mpya'
              : 'New Student Onboarding Roadmap & Status'}
          </h3>

          <p className="text-xs sm:text-sm text-emerald-200/90 max-w-2xl leading-relaxed">
            {language === 'sw'
              ? 'Fuatilia na ukamilishe kila hatua kuanzia kupakua fomu, maombi ya mtandaoni, uchunguzi wa afya, malipo ya ada, hadi kufika shuleni kuripoti.'
              : 'Track and complete each onboarding milestone from prospectus download, online application, medical checkup, fee payment, to campus arrival.'}
          </p>
        </div>

        {/* Right Metric Box & Reset */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0">
          <div className="bg-emerald-900/60 backdrop-blur-xs border border-emerald-600/40 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-inner">
            <div className="text-right">
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300">
                {language === 'sw' ? 'Hatua Zilizofanyika' : 'Completed Milestones'}
              </div>
              <div className="text-lg font-black text-amber-300 font-mono">
                {completedCount} / {totalSteps} {language === 'sw' ? 'Hatua' : 'Steps'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center font-black font-mono text-sm border border-emerald-500/50">
              {progressPercentage}%
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetProgress}
            className="text-[11px] font-medium text-emerald-300/80 hover:text-amber-300 flex items-center gap-1.5 transition-colors cursor-pointer py-1 px-2 rounded-lg hover:bg-emerald-900/40"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'sw' ? 'Anzisha Upya Ufuatiliaji' : 'Reset Progress'}</span>
          </button>
        </div>
      </div>

      {/* Visual Progress Bar (The Main Core Component) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-emerald-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>
              {language === 'sw'
                ? `Hali ya Sasa: ${progressPercentage === 100 ? 'Uko Tayari Kuripoti Shuleni!' : progressPercentage >= 60 ? 'Mchakato Uko Katika Hatua za Mwisho' : 'Mchakato wa Kujiunga Umeanza'}`
                : `Current Status: ${progressPercentage === 100 ? 'Ready for Campus Arrival!' : progressPercentage >= 60 ? 'In Advanced Onboarding Stages' : 'Enrollment in Progress'}`}
            </span>
          </span>
          <span className="font-mono text-amber-300 text-xs">
            {completedCount} of {totalSteps} milestones reached
          </span>
        </div>

        {/* The Visual Bar Track */}
        <div className="relative w-full h-4 bg-slate-800/90 rounded-full p-1 border border-emerald-700/50 shadow-inner overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 ease-out shadow-lg shadow-emerald-500/30"
            style={{ width: `${Math.max(progressPercentage, 4)}%` }}
          />
        </div>
      </div>

      {/* Interactive Milestone Step Circles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
        {ONBOARDING_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isSelected = activeStepId === step.id;
          const StepIcon = step.icon;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => setActiveStepId(step.id)}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 relative ${
                isSelected
                  ? 'bg-emerald-900/80 border-amber-400 shadow-lg ring-2 ring-amber-400/30'
                  : isCompleted
                    ? 'bg-emerald-950/40 border-emerald-600/40 hover:bg-emerald-900/40'
                    : 'bg-slate-900/60 border-slate-800 hover:border-emerald-800/60'
              }`}
            >
              {/* Step indicator header */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-xl font-mono text-xs font-black flex items-center justify-center transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-xs'
                      : isSelected
                        ? 'bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-950" /> : step.id}
                </span>

                <StepIcon
                  className={`w-4 h-4 ${
                    isCompleted ? 'text-emerald-400' : isSelected ? 'text-amber-300' : 'text-slate-500'
                  }`}
                />
              </div>

              {/* Title & subtitle */}
              <div>
                <h4
                  className={`text-xs font-bold leading-tight line-clamp-1 ${
                    isSelected ? 'text-amber-300' : isCompleted ? 'text-white' : 'text-slate-300'
                  }`}
                >
                  {language === 'sw' ? step.titleSw : step.titleEn}
                </h4>
                <p className="text-[10px] text-emerald-200/70 truncate mt-0.5">
                  {language === 'sw' ? step.subtitleSw : step.subtitleEn}
                </p>
              </div>

              {/* Status pill */}
              <div className="pt-1 border-t border-emerald-800/40 flex items-center justify-between text-[10px]">
                <span
                  className={`font-semibold ${
                    isCompleted
                      ? 'text-emerald-400 font-bold'
                      : isSelected
                        ? 'text-amber-300'
                        : 'text-slate-500'
                  }`}
                >
                  {isCompleted
                    ? language === 'sw'
                      ? 'Tayari ✓'
                      : 'Done ✓'
                    : language === 'sw'
                      ? 'Inasubiri'
                      : 'Pending'}
                </span>
                <ChevronRight
                  className={`w-3 h-3 ${isSelected ? 'text-amber-300' : 'text-slate-600'}`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Step Detailed Card */}
      <div className="bg-slate-950/70 border border-emerald-600/40 rounded-3xl p-5 sm:p-7 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-emerald-900/60">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-amber-300 flex items-center justify-center font-black shadow-md shrink-0">
              <currentStep.icon className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                  {language === 'sw' ? `HATUA YA ${currentStep.id} KATI YA 5` : `STEP ${currentStep.id} OF 5`}
                </span>
                {isCurrentStepDone && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>{language === 'sw' ? 'Imekamilika' : 'Completed'}</span>
                  </span>
                )}
              </div>
              <h4 className="text-base sm:text-lg font-black text-white">
                {language === 'sw' ? currentStep.titleSw : currentStep.titleEn}
              </h4>
            </div>
          </div>

          {/* Mark Complete Checkbox / Toggle Button */}
          <button
            type="button"
            onClick={() => toggleStepCompleted(currentStep.id)}
            className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              isCurrentStepDone
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            {isCurrentStepDone ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>{language === 'sw' ? 'Imetiwa Alama: Tayari' : 'Marked: Done'}</span>
              </>
            ) : (
              <>
                <Circle className="w-4 h-4 text-slate-400" />
                <span>{language === 'sw' ? 'Weka Alama Imekamilika' : 'Mark as Completed'}</span>
              </>
            )}
          </button>
        </div>

        {/* Step Description & Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              {language === 'sw' ? currentStep.descriptionSw : currentStep.descriptionEn}
            </p>

            {/* Custom contextual assistance per step */}
            {currentStep.id === 1 && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Vitu Vinavyojumuishwa kwenye Pakiti:' : 'Included in the Prospectus Pack:'}</span>
                </div>
                <ul className="list-disc pl-5 space-y-1 text-emerald-100/90 font-sans">
                  <li>{language === 'sw' ? 'Fomu rasmi ya kujiunga Kidato cha 1 & 3 (2026/2027)' : 'Form 1 & 3 Joining Instructions document'}</li>
                  <li>{language === 'sw' ? 'Fomu ya uchunguzi wa afya na daktari (Medical Form)' : 'Official medical examination clearance sheet'}</li>
                  <li>{language === 'sw' ? 'Orodha kamili ya sare, vifaa vya bweni, na sheria za shule' : 'Full uniform specs, boarding kit, and school rules'}</li>
                </ul>
              </div>
            )}

            {currentStep.id === 2 && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Njia za Kuwasilisha Maombi:' : 'Submission Channels:'}</span>
                </div>
                <p className="text-emerald-100/90">
                  {language === 'sw'
                    ? 'Unaweza kujaza maombi moja kwa moja mtandaoni kwa kubonyeza kitufe hapa chini, au kuwasilisha fomu iliyochapishwa katika Ofisi ya Mkuu wa Shule Uomboni Marangu au Moshi Bookshop.'
                    : 'You can apply directly online using our portal, or hand deliver printed forms to the Headmaster Office Marangu or Moshi Bookshop.'}
                </p>
              </div>
            )}

            {currentStep.id === 3 && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <Stethoscope className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Vipimo Muhimu Vinavyohitajika:' : 'Key Medical Tests Required:'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-100/90">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'sw' ? 'Kundi la Damu (Blood Group)' : 'Blood Grouping & Sickle Cell'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'sw' ? 'Vipimo vya Kifua (Chest X-Ray / TB)' : 'Chest & Respiratory Evaluation'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'sw' ? 'Uwezo wa Kuona (Eye Vision)' : 'Visual Acuity / Ophthalmology'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                    <span>{language === 'sw' ? 'Magonjwa ya Pumu & Aleji' : 'Asthma & Allergy Profile'}</span>
                  </div>
                </div>
              </div>
            )}

            {currentStep.id === 4 && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50 space-y-2.5 text-xs font-mono">
                <div className="font-bold text-amber-300 flex items-center gap-2 font-sans">
                  <CreditCard className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Taarifa za Akaunti ya Benki ya Shule:' : 'School Bank Account Information:'}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900 border border-emerald-700/50 space-y-1">
                  <div><strong>BENKI:</strong> CRDB Bank Plc</div>
                  <div><strong>JINA LA AKAUNTI:</strong> UOMBONI SECONDARY SCHOOL</div>
                  <div><strong>NAMBA YA AKAUNTI:</strong> <span className="text-amber-300 font-bold">0152438902100</span></div>
                  <div><strong>TAWI (BRANCH):</strong> Marangu / Moshi Branch</div>
                </div>
                <p className="font-sans text-[11px] text-emerald-200">
                  * Kumbuka kuandika Jina Kamili la Mwanafunzi na Kidato anachojiunga kwenye karatasi ya benki (Pay-in Slip).
                </p>
              </div>
            )}

            {currentStep.id === 5 && (
              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/50 space-y-2 text-xs">
                <div className="font-bold text-amber-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{language === 'sw' ? 'Kituo cha Kuripoti & Muda:' : 'Reporting Venue & Schedule:'}</span>
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  {language === 'sw'
                    ? 'Shule ya Sekondari Uomboni, Marangu Magharibi, Moshi Vijijini (Kituo S.0486). Mapokezi yanaanza kuanzia saa 2:00 Asubuhi hadi saa 10:00 Jioni. Bweni litatolewa siku hiyo hiyo.'
                    : 'Uomboni Secondary School, Marangu West, Rural Moshi (Centre S.0486). Reception begins 8:00 AM to 4:00 PM. Boarding dormitories allocated on arrival day.'}
                </p>
              </div>
            )}
          </div>

          {/* Action Button & Next Step Trigger */}
          <div className="flex flex-col justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-emerald-700/40">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                {language === 'sw' ? 'Kitendo Kinachopendekezwa' : 'Recommended Action'}
              </span>
              <p className="text-xs text-slate-300">
                {language === 'sw'
                  ? 'Bofya kitufe hapa chini kutekeleza hatua hii moja kwa moja mtandaoni.'
                  : 'Click below to execute this milestone step directly.'}
              </p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStepAction(currentStep.id)}
                className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-102 cursor-pointer"
              >
                <currentStep.icon className="w-4 h-4" />
                <span>{language === 'sw' ? currentStep.actionTextSw : currentStep.actionTextEn}</span>
              </button>

              {currentStep.id < 5 && (
                <button
                  type="button"
                  onClick={() => setActiveStepId(currentStep.id + 1)}
                  className="w-full py-2 px-3 rounded-xl bg-emerald-900/50 hover:bg-emerald-900 text-emerald-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>{language === 'sw' ? `Nenda Hatua ya ${currentStep.id + 1}` : `Proceed to Step ${currentStep.id + 1}`}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Online Application Lookup Sync */}
      <div className="bg-emerald-950/40 p-4 sm:p-5 rounded-2xl border border-emerald-800/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h5 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-300" />
            <span>{language === 'sw' ? 'Tayari Umeshawahi Kujaza Maombi Mtandaoni?' : 'Already Submitted an Online Application?'}</span>
          </h5>
          <p className="text-[11px] text-emerald-200/80">
            {language === 'sw'
              ? 'Weka Namba ya Maombi (mfano APP-2026-1048) au jina kusawazisha maendeleo yako halisi.'
              : 'Enter your Application Tracking ID or student name to synchronize verified onboarding status.'}
          </p>
        </div>

        <form onSubmit={handleLookupApplication} className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="APP-2026-XXXX..."
            value={studentLookupQuery}
            onChange={(e) => setStudentLookupQuery(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-emerald-700 text-xs text-white placeholder:text-slate-500 focus:outline-hidden focus:ring-2 focus:ring-amber-400 w-full md:w-44 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-amber-300 font-bold text-xs shrink-0 cursor-pointer shadow-xs"
          >
            {language === 'sw' ? 'Sawazisha' : 'Sync'}
          </button>
        </form>
      </div>

      {lookupMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center justify-between gap-2 animate-in fade-in ${
            lookupMessage.type === 'success'
              ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-500/50'
              : 'bg-blue-950/80 text-blue-200 border border-blue-500/50'
          }`}
        >
          <span>{lookupMessage.text}</span>
          <button
            type="button"
            onClick={() => setLookupMessage(null)}
            className="text-slate-400 hover:text-white font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
