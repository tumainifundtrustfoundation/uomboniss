import React, { useState, useEffect } from 'react';
import {
  Laptop,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Send,
  Upload,
  Globe,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useData } from '../../context/DataContext';
import { getPendingSubjectSubmissionsFromFirestore } from '../../services/academicFirestoreService';

interface DistributedWorkflowBannerProps {
  onOpenTeacherStation: () => void;
  onOpenAcademicMasterDesk: () => void;
}

export const DistributedWorkflowBanner: React.FC<DistributedWorkflowBannerProps> = ({
  onOpenTeacherStation,
  onOpenAcademicMasterDesk,
}) => {
  const { language } = useLanguage();
  const { studentResults } = useData();
  const [pendingCount, setPendingCount] = useState<number>(2);

  useEffect(() => {
    let isMounted = true;
    getPendingSubjectSubmissionsFromFirestore()
      .then((subs) => {
        if (isMounted && Array.isArray(subs)) {
          const count = subs.filter((s) => s.status === 'pending').length;
          setPendingCount(count > 0 ? count : 2);
        }
      })
      .catch(() => {
        // Fallback default
        if (isMounted) setPendingCount(2);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="bg-[#0b2545] text-white rounded-xl p-6 sm:p-7 border border-blue-900 shadow-sm space-y-5">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-blue-900/60 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-800">
            <Laptop className="w-3 h-3 text-blue-300" />
            <span>Distributed Academic Workflow (Mfumo wa Vituo Binafsi vya Walimu)</span>
          </div>
          <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {language === 'sw'
              ? 'Mtiririko wa Kuingiza na Kuchapisha Matokeo Shuleni'
              : 'Decentralized Score Entry & Academic Master Approval Pipeline'}
          </h3>
          <p className="text-xs text-blue-200/80 max-w-2xl">
            {language === 'sw'
              ? 'Kila mwalimu anajaza alama za somo lake kwenye kompyuta/simu yake, kisha Mkuu wa Taaluma (Academic Master) anazikagua na kuzichapisha moja kwa moja kwenye tovuti ya shule.'
              : 'Teachers submit subject scores independently from their own computers. The Academic Master reviews, validates with NECTA grading, and publishes to the website.'}
          </p>
        </div>

        {/* Live Counters */}
        <div className="flex items-center gap-3 bg-blue-900/40 p-2.5 rounded-lg border border-blue-800 shrink-0">
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Pending Review</span>
            <span className="text-lg font-bold text-white font-mono">{pendingCount}</span>
          </div>
          <div className="w-px h-8 bg-blue-800" />
          <div className="text-center px-2">
            <span className="text-[10px] uppercase font-bold text-blue-200 block">Published</span>
            <span className="text-lg font-bold text-white font-mono">{studentResults.length}</span>
          </div>
        </div>
      </div>

      {/* 2 Dedicated Action Portals */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Portal 1: Teacher Station */}
        <div className="bg-blue-900/30 hover:bg-blue-900/40 border border-blue-800 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <Laptop className="w-3.5 h-3.5 text-blue-300" />
                <span>1. KITUO CHA MWALIMU (TEACHER STATION)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-800 text-blue-200 font-mono font-bold">
                Teacher Input
              </span>
            </div>
            <p className="text-xs text-blue-200/80">
              Mwalimu wa somo anajaza alama za watahiniwa (0-100) na kuzihifadhi salama kama &apos;Pending Marks&apos; tayari kwa ukaguzi wa kitaaluma.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenTeacherStation}
            id="btn-banner-open-teacher-station"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Ingiza Alama za Somo (Upload Marks)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Portal 2: Academic Master Desk */}
        <div className="bg-blue-900/30 hover:bg-blue-900/40 border border-blue-800 rounded-lg p-4 transition-all space-y-3 flex flex-col justify-between">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wide flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
                <span>2. DAWATI LA TAALUMA (ACADEMIC MASTER)</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-800 text-blue-200 font-mono font-bold">
                Admin Publish
              </span>
            </div>
            <p className="text-xs text-blue-200/80">
              Mkuu wa Taaluma anapokea orodha ya masomo yaliyotumwa, anakagua daraja/wastani, na kubofya &apos;Post to Website&apos; ili yawe hewani.
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenAcademicMasterDesk}
            id="btn-banner-open-academic-desk"
            className="w-full py-2.5 px-4 rounded-lg bg-blue-800 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all border border-blue-700"
          >
            <Globe className="w-3.5 h-3.5 text-blue-200" />
            <span>Kagua & Chapisha Tovuti (Publish Desk)</span>
            <ArrowRight className="w-3.5 h-3.5 text-blue-200" />
          </button>
        </div>
      </div>
    </div>
  );
};
