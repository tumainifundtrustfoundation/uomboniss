import React from 'react';
import { Award, ExternalLink, FileText, CheckCircle2, Search } from 'lucide-react';
import { SchoolLogo } from './SchoolLogo';

interface ResultsSectionProps {
  onOpenNectaResults?: () => void;
  onOpenSchoolResults?: () => void;
}

export const ResultsSection: React.FC<ResultsSectionProps> = ({
  onOpenNectaResults,
  onOpenSchoolResults,
}) => {
  return (
    <section id="results" className="py-20 sm:py-24 bg-white border-t border-b border-[#102A43]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="text-xs font-semibold text-[#C9A227] tracking-wider block mb-2 uppercase">
            Performance &amp; Standards
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-[#102A43] tracking-tight leading-[1.2]">
            Academic Results
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-700 leading-[1.75] font-normal">
            Uomboni Secondary School is an officially registered national examination centre under the National Examinations Council of Tanzania (NECTA) with Centre Number <strong>S0486</strong>. We believe in transparent, verifiable academic achievement and continuous tracking of learner progress.
          </p>
        </div>

        {/* NECTA Centre Credential Card */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main Info Box */}
          <div className="lg:col-span-8 bg-[#FFFFF0] p-6 sm:p-8 rounded-lg border border-[#102A43]/15 flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-xl bg-white border border-[#C9A227]/40 shadow-xs shrink-0">
                    <SchoolLogo size="md" />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      National Centre Code
                    </span>
                    <span className="text-2xl font-bold text-[#102A43] font-mono">
                      NECTA S0486
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-[#C9A227] uppercase tracking-wider block">
                    Accredited Centre
                  </span>
                  <span className="text-sm font-semibold text-slate-700">
                    CSEE &amp; FTNA Examinations
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
                <p>
                  Official results for the <strong>Certificate of Secondary Education Examination (CSEE)</strong> and <strong>Form Two National Assessment (FTNA)</strong> are published annually by NECTA. Candidates and parents can access both national archives and verified internal school performance records.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-md border border-slate-200">
                    <span className="text-xs font-bold text-[#102A43] block">
                      National Examination Levels
                    </span>
                    <span className="text-xs text-slate-600 block mt-1">
                      • Form 4: CSEE (Certificate of Secondary Education)
                    </span>
                    <span className="text-xs text-slate-600 block">
                      • Form 2: FTNA (National Assessment)
                    </span>
                  </div>

                  <div className="bg-white p-4 rounded-md border border-slate-200">
                    <span className="text-xs font-bold text-[#102A43] block">
                      Continuous Assessment (CA)
                    </span>
                    <span className="text-xs text-slate-600 block mt-1">
                      • Weekly subject quizzes &amp; topic tests
                    </span>
                    <span className="text-xs text-slate-600 block">
                      • Midterm &amp; Terminal examinations
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons: NECTA Results & School Results */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-4">
              <button
                id="results-btn-necta"
                onClick={onOpenNectaResults}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-[#102A43] text-white font-semibold text-xs sm:text-sm hover:bg-[#0A1C2E] transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2"
              >
                <Award className="w-4 h-4 text-[#C9A227]" />
                <span>NECTA Results (S0486)</span>
              </button>

              <button
                id="results-btn-school"
                onClick={onOpenSchoolResults}
                className="w-full sm:w-auto px-6 py-3 rounded-md bg-white text-[#102A43] border border-[#102A43]/30 font-semibold text-xs sm:text-sm hover:bg-[#FFFFF0] transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4 text-[#C9A227]" />
                <span>School Results</span>
              </button>
            </div>
          </div>

          {/* Quick Notice Card */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-lg border border-[#102A43]/15 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-md bg-[#FFFFF0] border border-[#C9A227]/40 flex items-center justify-center text-[#102A43]">
                <Search className="w-5 h-5 text-[#102A43]" />
              </div>
              <h4 className="text-base font-bold text-[#102A43]">
                Student Privacy &amp; Verification
              </h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                In strict observance of educational privacy policies, individualized terminal score sheets, division breakdowns, and continuous progress cards are accessed securely through the school portal.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Authenticated examination numbers</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Direct printable report cards</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A227]" />
                  <span>Official academic stamp &amp; signatures</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-400">
              National Examination Council of Tanzania · Centre S0486
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
