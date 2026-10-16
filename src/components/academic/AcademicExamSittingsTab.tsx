import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Unlock,
  Trash2,
  Edit2,
  Layers,
  Sparkles,
  BookOpen,
  Filter,
  Users,
  ShieldCheck,
  Check,
  X,
  Printer,
  Megaphone,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ExamSittingType } from '../../types';

interface AcademicExamSittingsTabProps {
  language: 'sw' | 'en';
}

export const AcademicExamSittingsTab: React.FC<AcademicExamSittingsTabProps> = ({
  language,
}) => {
  const {
    examSittingTypes,
    addExamSittingType,
    updateExamSittingType,
    deleteExamSittingType,
    toggleExamSittingActive,
    toggleMarkEntryAuthorization,
  } = useData() as any;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSitting, setEditingSitting] = useState<ExamSittingType | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<ExamSittingType>>({
    name: '',
    code: '',
    sittingMode: 'National / Mock Sitting',
    sittingModeSw: 'Mtihani wa Utamilifu (Mock) wa Mkoa / Kanda',
    academicYear: '2025/2026',
    term: 'Muhula wa 2',
    targetForms: ['Form 4', 'Form 2'],
    weightPercentage: 100,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    markEntryDeadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
    status: 'Open for Marks',
    isEntryOpen: true,
    instructionsSw: '',
    active: false,
  });

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedback({ text, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const handleOpenAddModal = () => {
    setEditingSitting(null);
    setFormData({
      name: '',
      code: `EXAM-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      sittingMode: 'National / Mock Sitting',
      sittingModeSw: 'Mtihani wa Utamilifu (Mock) wa Mkoa / Kanda',
      academicYear: '2025/2026',
      term: 'Muhula wa 2',
      targetForms: ['Form 4'],
      weightPercentage: 100,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      markEntryDeadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      status: 'Open for Marks',
      isEntryOpen: true,
      instructionsSw: 'Walimu wote mnatakiwa kuingiza alama kwa wakati kabla ya tarehe ya mwisho.',
      active: false,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sitting: ExamSittingType) => {
    setEditingSitting(sitting);
    setFormData({ ...sitting });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      showNotification(language === 'sw' ? 'Tafadhali weka jina la mtihani' : 'Please enter exam name', 'error');
      return;
    }

    if (editingSitting) {
      updateExamSittingType(editingSitting.id, formData);
      showNotification(
        language === 'sw'
          ? `Aina ya mtihani "${formData.name}" imesasishwa kikamilifu.`
          : `Exam sitting "${formData.name}" successfully updated.`
      );
    } else {
      const newSitting: ExamSittingType = {
        id: `sit-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code?.trim() || `EXAM-${Date.now().toString().slice(-4)}`,
        sittingMode: formData.sittingMode || 'National / Mock Sitting',
        sittingModeSw: formData.sittingModeSw || 'Mtihani wa Utamilifu (Mock)',
        academicYear: formData.academicYear || '2025/2026',
        term: formData.term || 'Muhula wa 1',
        targetForms: formData.targetForms && formData.targetForms.length > 0 ? formData.targetForms : ['Form 4'],
        weightPercentage: Number(formData.weightPercentage) || 100,
        startDate: formData.startDate || new Date().toISOString().split('T')[0],
        endDate: formData.endDate || new Date().toISOString().split('T')[0],
        markEntryDeadline: formData.markEntryDeadline || new Date().toISOString().split('T')[0],
        status: formData.status || 'Open for Marks',
        isEntryOpen: formData.isEntryOpen !== undefined ? formData.isEntryOpen : true,
        instructionsSw: formData.instructionsSw || '',
        active: Boolean(formData.active),
        createdAt: new Date().toISOString(),
      };
      addExamSittingType(newSitting);

      // Also create corresponding academic directive if entry is open
      if (newSitting.isEntryOpen) {
        newSitting.targetForms.forEach((f) => {
          toggleMarkEntryAuthorization(
            f,
            newSitting.name,
            true,
            newSitting.instructionsSw,
            newSitting.markEntryDeadline,
            'Mwl. Yohana Bahati (Taaluma)'
          );
        });
      }

      showNotification(
        language === 'sw'
          ? `Aina mpya ya mtihani "${newSitting.name}" imeandaliwa rasmi!`
          : `New exam sitting "${newSitting.name}" successfully configured!`
      );
    }
    setIsModalOpen(false);
  };

  const handleToggleEntry = (sitting: ExamSittingType) => {
    const nextState = !sitting.isEntryOpen;
    updateExamSittingType(sitting.id, {
      isEntryOpen: nextState,
      status: nextState ? 'Open for Marks' : 'Closed',
    });

    sitting.targetForms.forEach((f) => {
      toggleMarkEntryAuthorization(
        f,
        sitting.name,
        nextState,
        nextState
          ? `Mkuu wa Taaluma amefungua dirisha la ${sitting.name} (${f}).`
          : `Mkuu wa Taaluma amefunga dirisha la kuingiza alama za ${sitting.name} (${f}).`,
        sitting.markEntryDeadline,
        'Mwl. Yohana Bahati (Mkuu wa Taaluma)'
      );
    });

    showNotification(
      nextState
        ? (language === 'sw' ? `Dirisha la alama za ${sitting.name} limefunguliwa kwa walimu.` : `Mark entry window opened.`)
        : (language === 'sw' ? `Dirisha la alama za ${sitting.name} limefungwa.` : `Mark entry window locked.`)
    );
  };

  const handleToggleFormCheckbox = (formName: string) => {
    setFormData((prev) => {
      const current = prev.targetForms || [];
      const next = current.includes(formName)
        ? current.filter((f) => f !== formName)
        : [...current, formName];
      return { ...prev, targetForms: next };
    });
  };

  const activeSitting = examSittingTypes.find((s) => s.active);
  const openCount = examSittingTypes.filter((s) => s.isEntryOpen).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Context */}
      <div className="bg-gradient-to-r from-red-950 via-red-900 to-amber-950 text-amber-50 p-6 rounded-2xl border-2 border-amber-500/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-200 text-xs font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
              <span>{language === 'sw' ? 'Mamlaka ya Mkuu wa Taaluma (Examination Master Desk)' : 'Academic Master Exam Console'}</span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-amber-100 flex items-center gap-3">
              <Calendar className="w-6 h-6 text-amber-400" />
              <span>{language === 'sw' ? 'Maandalizi ya Aina za Mitihani (Examination Sitting Types)' : 'Examination Sitting Types & Sessions'}</span>
            </h2>
            <p className="text-xs md:text-sm text-amber-200/80 mt-1 max-w-2xl leading-relaxed">
              {language === 'sw'
                ? 'Mwalimu wa Taaluma ndiye anayeandaa aina za mitihani, mfumo wa upimaji (Continuous Assessment, Terminal, Annual, NECTA Mock, Weekly Tests), madarasa husika, tarehe za mitihani na kufungua/kufunga madirisha ya walimu kuingiza alama.'
                : 'The Academic Master designs exam sitting types, grading formats (CA, Terminal, Annual, Mock, Quizzes), target streams, sitting dates, and manages teacher submission windows.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'sw' ? '+ Unda Aina Mpya ya Mtihani' : '+ New Exam Sitting Type'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {feedback && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2.5 border shadow-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {language === 'sw' ? 'Jumla ya Sittings' : 'Total Exam Sittings'}
          </span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">
            {examSittingTypes.length}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
            {language === 'sw' ? 'Dirisha Wazi (Walimu)' : 'Open For Mark Entry'}
          </span>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-black text-emerald-900">{openCount}</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-black">
              {openCount > 0 ? 'Active' : 'Closed'}
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 shadow-xs">
          <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">
            {language === 'sw' ? 'Mtihani Hai (Active)' : 'Active Focus Sitting'}
          </span>
          <span className="text-xs font-black text-amber-950 mt-1 block truncate">
            {activeSitting ? activeSitting.name : (language === 'sw' ? 'Hakuna' : 'None')}
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 shadow-xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block">
            {language === 'sw' ? 'Mfumo Rasmi' : 'Grading Standards'}
          </span>
          <span className="text-xs font-black text-blue-950 mt-1 block">
            NECTA & CSSC Compliant
          </span>
        </div>
      </div>

      {/* Examination Sittings Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span>{language === 'sw' ? 'Orodha ya Aina za Mitihani Shuleni' : 'Official School Examination Sittings'}</span>
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'sw'
                ? 'Bofya kitufe cha kufungua au kufunga dirisha la walimu kuweka alama.'
                : 'Click lock/unlock button to control teacher mark entry windows.'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">{language === 'sw' ? 'Jina la Mtihani & Mfumo' : 'Exam Name & Mode'}</th>
                <th className="py-3 px-3">{language === 'sw' ? 'Mwaka & Muhula' : 'Academic Year & Term'}</th>
                <th className="py-3 px-3">{language === 'sw' ? 'Madarasa' : 'Target Forms'}</th>
                <th className="py-3 px-3 text-center">{language === 'sw' ? 'Uzito (%)' : 'Weight (%)'}</th>
                <th className="py-3 px-3">{language === 'sw' ? 'Tarehe za Mtihani' : 'Sitting Dates'}</th>
                <th className="py-3 px-3">{language === 'sw' ? 'Mwisho wa Alama' : 'Mark Deadline'}</th>
                <th className="py-3 px-3 text-center">{language === 'sw' ? 'Hali ya Dirisha' : 'Entry Window'}</th>
                <th className="py-3 px-4 text-right">{language === 'sw' ? 'Vitendo' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {examSittingTypes.map((sitting) => {
                const isActive = sitting.active;
                return (
                  <tr
                    key={sitting.id}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      isActive ? 'bg-amber-50/50 font-medium' : ''
                    }`}
                  >
                    {/* Name & Mode */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{sitting.name}</span>
                        {isActive && (
                          <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                            ★ Active Focus
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span className="font-mono text-slate-400">{sitting.code}</span>
                        <span>·</span>
                        <span className="text-amber-800 font-semibold">{sitting.sittingModeSw || sitting.sittingMode}</span>
                      </div>
                    </td>

                    {/* Academic Year & Term */}
                    <td className="py-3.5 px-3 align-top font-semibold text-slate-700">
                      <div>{sitting.academicYear}</div>
                      <div className="text-[10px] text-slate-500">{sitting.term}</div>
                    </td>

                    {/* Target Forms */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="flex flex-wrap gap-1">
                        {sitting.targetForms.map((f) => (
                          <span
                            key={f}
                            className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-800 text-[10px] font-bold"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Weight */}
                    <td className="py-3.5 px-3 align-top text-center font-black text-slate-900">
                      <span className="px-2 py-1 rounded-md bg-slate-100 border border-slate-200">
                        {sitting.weightPercentage}%
                      </span>
                    </td>

                    {/* Dates */}
                    <td className="py-3.5 px-3 align-top text-[11px] text-slate-600 font-mono">
                      <div>{sitting.startDate}</div>
                      <div className="text-slate-400">hadi {sitting.endDate}</div>
                    </td>

                    {/* Deadline */}
                    <td className="py-3.5 px-3 align-top">
                      <div className="inline-flex items-center gap-1 font-mono text-[11px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        <Clock className="w-3 h-3 text-red-500" />
                        <span>{sitting.markEntryDeadline}</span>
                      </div>
                    </td>

                    {/* Status & Entry Lock */}
                    <td className="py-3.5 px-3 align-top text-center">
                      <button
                        onClick={() => handleToggleEntry(sitting)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border transition-all cursor-pointer shadow-xs ${
                          sitting.isEntryOpen
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200'
                            : 'bg-rose-100 text-rose-900 border-rose-300 hover:bg-rose-200'
                        }`}
                        title={language === 'sw' ? 'Bofya kubadili ruhusa ya walimu kuingiza alama' : 'Toggle teacher mark entry'}
                      >
                        {sitting.isEntryOpen ? (
                          <>
                            <Unlock className="w-3 h-3 text-emerald-700" />
                            <span>{language === 'sw' ? 'Dirisha Wazi' : 'Entry Open'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3 h-3 text-rose-700" />
                            <span>{language === 'sw' ? 'Limefungwa' : 'Locked'}</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => toggleExamSittingActive(sitting.id)}
                          className={`p-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                            isActive
                              ? 'bg-amber-400 text-slate-950 border-amber-500'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                          title={language === 'sw' ? 'Weka kama mtihani hai wa sasa' : 'Set as active focus exam'}
                        >
                          ★
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(sitting)}
                          className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 transition-all cursor-pointer"
                          title={language === 'sw' ? 'Hariri' : 'Edit'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Una uhakika unataka kufuta mtihani wa "${sitting.name}"?`)) {
                              deleteExamSittingType(sitting.id);
                              showNotification(language === 'sw' ? 'Mtihani umefutwa' : 'Exam deleted');
                            }
                          }}
                          className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 transition-all cursor-pointer"
                          title={language === 'sw' ? 'Futa' : 'Delete'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border-2 border-slate-300 max-h-[90vh] overflow-y-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <Calendar className="w-5 h-5 text-amber-800" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {editingSitting
                      ? (language === 'sw' ? 'Hariri Aina ya Mtihani (Sitting Type)' : 'Edit Exam Sitting Type')
                      : (language === 'sw' ? 'Uandaaji wa Aina Mpya ya Mtihani' : 'Create New Exam Sitting Type')}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {language === 'sw' ? 'Sanidi vigezo vya mtihani kulingana na taratibu za shule na NECTA' : 'Configure exam sitting parameters for Uomboni Secondary School'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Exam Name & Code */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Jina Rasmi la Mtihani *' : 'Official Exam Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="mfano: NECTA Mock Examination 2026, Mtihani wa Muhula (Terminal)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Kodi ya Mtihani (Code)' : 'Exam Code'}
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="MOCK-2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sitting Mode & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Mfumo wa Upimaji (Sitting Mode)' : 'Assessment Sitting Mode'}
                  </label>
                  <select
                    value={formData.sittingMode}
                    onChange={(e) => {
                      const mode = e.target.value as any;
                      let modeSw = 'Mtihani wa Utamilifu (Mock)';
                      if (mode === 'Continuous Assessment') modeSw = 'Tathmini Endelevu ya Nusu Muhula (Midterm CA)';
                      if (mode === 'Terminal Sitting') modeSw = 'Mtihani wa Mwisho wa Muhula (Terminal)';
                      if (mode === 'Annual Sitting') modeSw = 'Mtihani wa Mwaka (Annual)';
                      if (mode === 'Weekly Test / Quiz') modeSw = 'Majaribio ya Kila Wiki (Weekly Quizzes)';
                      setFormData({ ...formData, sittingMode: mode, sittingModeSw: modeSw });
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="National / Mock Sitting">Mtihani wa Utamilifu (NECTA Mock / Regional Joint)</option>
                    <option value="Continuous Assessment">Tathmini Endelevu ya Nusu Muhula (Mid-Term CA)</option>
                    <option value="Terminal Sitting">Mtihani wa Mwisho wa Muhula (Terminal Exam)</option>
                    <option value="Annual Sitting">Mtihani wa Mwaka (Annual Examination)</option>
                    <option value="Weekly Test / Quiz">Majaribio ya Kila Wiki (Weekly Academic Tests)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Uzito wa Alama kwenye Matokeo (%)' : 'Weight Percentage (%)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={formData.weightPercentage || 100}
                    onChange={(e) => setFormData({ ...formData, weightPercentage: parseInt(e.target.value) || 100 })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Academic Year & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Mwaka wa Masomo' : 'Academic Year'}
                  </label>
                  <select
                    value={formData.academicYear}
                    onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="2025/2026">Mwaka wa Masomo 2025/2026</option>
                    <option value="2026/2027">Mwaka wa Masomo 2026/2027</option>
                    <option value="2024/2025">Mwaka wa Masomo 2024/2025</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Muhula' : 'Term'}
                  </label>
                  <select
                    value={formData.term}
                    onChange={(e) => setFormData({ ...formData, term: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Muhula wa 1">Muhula wa 1 (Term 1: Jan - Juni)</option>
                    <option value="Muhula wa 2">Muhula wa 2 (Term 2: Julai - Desemba)</option>
                  </select>
                </div>
              </div>

              {/* Target Forms (Checkboxes) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">
                  {language === 'sw' ? 'Madarasa Yanayofanya Mtihani Huu' : 'Applicable Classes (Forms)'}
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Form 1', 'Form 2', 'Form 3', 'Form 4'].map((f) => {
                    const isChecked = formData.targetForms?.includes(f);
                    return (
                      <button
                        type="button"
                        key={f}
                        onClick={() => handleToggleFormCheckbox(f)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isChecked
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {isChecked && <Check className="w-3.5 h-3.5" />}
                        <span>{f}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dates & Deadline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Tarehe ya Kuanza Mtihani' : 'Sitting Start Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {language === 'sw' ? 'Tarehe ya Kumalizika' : 'Sitting End Date'}
                  </label>
                  <input
                    type="date"
                    value={formData.endDate || ''}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-red-700 mb-1">
                    {language === 'sw' ? 'Mwisho wa Walimu Kuingiza Alama *' : 'Teacher Score Deadline *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.markEntryDeadline || ''}
                    onChange={(e) => setFormData({ ...formData, markEntryDeadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-red-50 border border-red-300 text-red-950 font-mono text-xs font-bold focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Directives & Instructions for Teachers */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {language === 'sw' ? 'Maagizo ya Mkuu wa Taaluma kwa Walimu wa Masomo' : 'Academic Master Instructions for Teachers'}
                </label>
                <textarea
                  rows={2}
                  value={formData.instructionsSw || ''}
                  onChange={(e) => setFormData({ ...formData, instructionsSw: e.target.value })}
                  placeholder="Maelekezo rasmi: walimu wahakikishe wanaingiza alama kwa viwango halisi vya NECTA kabla ya tarehe ya mwisho..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Toggles */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isEntryOpen}
                    onChange={(e) => setFormData({ ...formData, isEntryOpen: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="font-bold text-slate-800">
                    {language === 'sw' ? 'Fungua dirisha la kuingiza alama sasa hivi' : 'Open score submission window immediately'}
                  </span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="font-bold text-amber-900">
                    {language === 'sw' ? 'Weka kama mtihani mkuu unaoendelea (Active Focus)' : 'Set as current active focus sitting'}
                  </span>
                </label>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-all cursor-pointer"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {editingSitting
                      ? (language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes')
                      : (language === 'sw' ? 'Weka Mtihani Mfumo' : 'Save Sitting Type')}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
