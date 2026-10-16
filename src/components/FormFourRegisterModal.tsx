import React, { useState } from 'react';
import {
  X,
  GraduationCap,
  Search,
  Printer,
  Download,
  Award,
  Users,
  CheckCircle2,
  BookOpen,
  Filter,
  UserCheck,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import {
  OFFICIAL_FORM_FOUR_REGISTER_DATA,
  FORM_FOUR_STUDENT_PROFILES,
} from '../data/formFourStudents';
import { downloadClassBroadsheetPdf } from '../utils/pdfService';

interface FormFourRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectStudent?: (identifier: string) => void;
}

export const FormFourRegisterModal: React.FC<FormFourRegisterModalProps> = ({
  isOpen,
  onClose,
  onSelectStudent,
}) => {
  const { language } = useLanguage();
  const { studentResults, loginStudent } = useData();

  const [searchQuery, setSearchQuery] = useState('');
  const [sexFilter, setSexFilter] = useState<'ALL' | 'F' | 'M'>('ALL');
  const [streamFilter, setStreamFilter] = useState<'ALL' | 'Science' | 'Arts'>('ALL');

  if (!isOpen) return null;

  const totalCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.length;
  const femaleCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.sex === 'F').length;
  const maleCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.sex === 'M').length;
  const scienceCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.combination === 'Science').length;
  const artsCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => c.combination === 'Arts').length;

  const filteredCandidates = OFFICIAL_FORM_FOUR_REGISTER_DATA.filter((c) => {
    const matchSex = sexFilter === 'ALL' || c.sex === sexFilter;
    const matchStream = streamFilter === 'ALL' || c.combination === streamFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      c.fullName.toLowerCase().includes(q) ||
      c.indexNumber.toLowerCase().includes(q) ||
      c.classIndex.toLowerCase().includes(q) ||
      c.rollNo.toString() === q;
    return matchSex && matchStream && matchQuery;
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadRosterPdf = () => {
    // Find Form 4 student results for export
    const f4Results = studentResults.filter((r) => r.form === 'Form 4');
    if (f4Results.length > 0) {
      downloadClassBroadsheetPdf(f4Results, 'Orodha Rasmi ya Watahiniwa Kidato cha Nne 2026 (CSEE S.0486)');
    } else {
      window.print();
    }
  };

  const handleStudentClick = (indexNumber: string) => {
    if (onSelectStudent) {
      onSelectStudent(indexNumber);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pr-12">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black shadow-lg shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono text-[11px] font-black border border-amber-400/30">
                    KITUO NECTA S.0486
                  </span>
                  <span className="text-emerald-300 text-xs font-semibold">
                    {language === 'sw' ? 'Wahitimu 2026' : 'Graduating Class 2026'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                  {language === 'sw' ? 'Daftari Rasmi la Watahiniwa Kidato cha Nne' : 'Official Form Four Candidates Register'}
                </h2>
                <p className="text-emerald-200/90 text-xs mt-0.5">
                  Shule ya Sekondari Uomboni • Marangu, Moshi Vijijini • CSEE Candidate Roster
                </p>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-white/10"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Chapa' : 'Print'}</span>
              </button>
              <button
                onClick={handleDownloadRosterPdf}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <Download className="w-3.5 h-3.5" />
                <span>PDF Broadsheet</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-5 pt-4 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2 px-3 border border-white/5">
              <div className="text-emerald-300 text-[10px] font-bold uppercase">Jumla Watahiniwa</div>
              <div className="text-lg font-black text-white">{totalCandidates}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 px-3 border border-white/5">
              <div className="text-emerald-300 text-[10px] font-bold uppercase">Wasichana (F)</div>
              <div className="text-lg font-black text-pink-300">{femaleCandidates}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 px-3 border border-white/5">
              <div className="text-emerald-300 text-[10px] font-bold uppercase">Wavulana (M)</div>
              <div className="text-lg font-black text-blue-300">{maleCandidates}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 px-3 border border-white/5">
              <div className="text-emerald-300 text-[10px] font-bold uppercase">Mkondo wa Sayansi</div>
              <div className="text-lg font-black text-amber-300">{scienceCandidates}</div>
            </div>
            <div className="bg-white/5 rounded-xl p-2 px-3 border border-white/5 col-span-2 sm:col-span-1">
              <div className="text-emerald-300 text-[10px] font-bold uppercase">Mkondo wa Sanaa (Arts)</div>
              <div className="text-lg font-black text-purple-300">{artsCandidates}</div>
            </div>
          </div>
        </div>

        {/* Toolbar: Search and Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={
                language === 'sw'
                  ? 'Tafuta kwa jina, roll no au namba ya mtihani...'
                  : 'Search by name, roll no or exam number...'
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            {/* Gender Filters */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setSexFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sexFilter === 'ALL'
                    ? 'bg-emerald-800 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {language === 'sw' ? 'Wote' : 'All'}
              </button>
              <button
                type="button"
                onClick={() => setSexFilter('F')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sexFilter === 'F'
                    ? 'bg-pink-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wasichana ({femaleCandidates})
              </button>
              <button
                type="button"
                onClick={() => setSexFilter('M')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  sexFilter === 'M'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wavulana ({maleCandidates})
              </button>
            </div>

            {/* Stream Filters */}
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
              <button
                type="button"
                onClick={() => setStreamFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  streamFilter === 'ALL'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mikondo Yote
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter('Science')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  streamFilter === 'Science'
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sayansi ({scienceCandidates})
              </button>
              <button
                type="button"
                onClick={() => setStreamFilter('Arts')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                  streamFilter === 'Arts'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sanaa ({artsCandidates})
              </button>
            </div>
          </div>
        </div>

        {/* Candidate List Table */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">Roll</th>
                    <th className="py-3 px-4">Jina Kamili la Mwanafunzi</th>
                    <th className="py-3 px-3 text-center w-16">Jinsia</th>
                    <th className="py-3 px-3 font-mono">Namba ya Mtihani (NECTA)</th>
                    <th className="py-3 px-3">Mkondo / Masomo</th>
                    <th className="py-3 px-3">Hali ya Malazi</th>
                    <th className="py-3 px-3">Uongozi / Klabu</th>
                    <th className="py-3 px-3 text-right">Kitendo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCandidates.map((candidate) => {
                    const profile = FORM_FOUR_STUDENT_PROFILES.find(
                      (p) => p.examNumber === candidate.indexNumber
                    );
                    const isF = candidate.sex === 'F';

                    return (
                      <tr
                        key={candidate.indexNumber}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                          <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 inline-flex items-center justify-center text-[11px] font-mono font-bold">
                            {candidate.rollNo}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-black text-slate-900 text-[13px] flex items-center gap-2">
                            {candidate.fullName}
                            {profile?.leadershipRole && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-bold border border-amber-300">
                                {profile.leadershipRole}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                            <span>ID: {profile?.studentId || `USS-2022-${candidate.rollNo.toString().padStart(4, '0')}`}</span>
                            <span>•</span>
                            <span>{profile?.residence || 'Marangu, Moshi'}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              isF
                                ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                : 'bg-blue-100 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {isF ? 'F (Ke)' : 'M (Me)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 font-mono font-bold text-emerald-900 text-[12px]">
                          <span className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                            {candidate.indexNumber}
                          </span>
                        </td>
                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                              candidate.combination === 'Science'
                                ? 'bg-amber-50 text-amber-900 border border-amber-200'
                                : 'bg-purple-50 text-purple-900 border border-purple-200'
                            }`}
                          >
                            {candidate.combination === 'Science' ? 'Sayansi (PCM/PCB)' : 'Sanaa (HGL/HGK)'}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                          <div className="font-semibold text-slate-800">
                            {profile?.boardingStatus || 'Bweni'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {profile?.dormitoryRoom ? profile.dormitoryRoom.split('(')[0] : 'Bweni Kuu'}
                          </div>
                        </td>
                        <td className="py-3.5 px-3 text-slate-600 text-[11px]">
                          {profile?.clubs && profile.clubs.length > 0 ? (
                            <span className="text-slate-700">{profile.clubs[0]}</span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleStudentClick(candidate.indexNumber)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-[11px] transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                          >
                            <span>{language === 'sw' ? 'Fungua' : 'View'}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredCandidates.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                        <p className="font-bold text-slate-700">
                          {language === 'sw' ? 'Hakuna Mwanafunzi Aliyepatikana' : 'No Candidates Found'}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          Jaribu kubadilisha jina au namba uliyoweka kwenye chujio la utafutaji.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'sw'
                ? `Wanafunzi wote 19 wamethibitishwa na kusajiliwa rasmi kwenye mfumo wa kitaaluma wa shule.`
                : `All 19 candidates verified and actively synced in Uomboni academic system.`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition-all cursor-pointer"
            >
              {language === 'sw' ? 'Funga' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
