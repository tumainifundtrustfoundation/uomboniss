import React, { useState } from 'react';
import {
  Award,
  Plus,
  Lock,
  Unlock,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit3,
  ShieldCheck,
  Layers,
  BookOpen,
  Filter,
  Info,
  Clock,
  Sparkles,
  HelpCircle,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { ExamTypeConfig } from '../../types';

interface AcademicExamTypesManagerTabProps {
  language: 'sw' | 'en';
}

export const AcademicExamTypesManagerTab: React.FC<AcademicExamTypesManagerTabProps> = ({
  language,
}) => {
  const {
    examTypes,
    addExamType,
    updateExamType,
    deleteExamType,
    toggleExamTypeEntryStatus,
  } = useData();

  // Filter state
  const [filterForm, setFilterForm] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Modal / Form state for Adding / Editing
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ExamTypeConfig['category']>('Mid-Term');
  const [targetForm, setTargetForm] = useState<string>('ALL');
  const [academicYear, setAcademicYear] = useState<string>('2025/2026');
  const [term, setTerm] = useState<string>('Muhula wa 1 (Term 1)');
  const [status, setStatus] = useState<ExamTypeConfig['status']>('active');
  const [isCurrentForEntry, setIsCurrentForEntry] = useState<boolean>(true);
  const [description, setDescription] = useState<string>('');

  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Quick Preset Adders
  const handleQuickAddPreset = (presetName: string, cat: ExamTypeConfig['category'], form: string, desc: string) => {
    try {
      const created = addExamType({
        name: presetName,
        category: cat,
        targetForm: form,
        academicYear: '2025/2026',
        term: 'Muhula wa 1 (Term 1)',
        status: 'active',
        isCurrentForEntry: true,
        createdBy: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
        description: desc,
        dateCreated: new Date().toISOString().split('T')[0],
      });
      setFeedbackMsg({
        text: language === 'sw'
          ? `✅ Aina ya Mtihani "${created.name}" imewekwa na kufunguliwa kikamilifu kwa walimu!`
          : `✅ Exam type "${created.name}" created and opened for mark entry!`,
        type: 'success',
      });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch {
      setFeedbackMsg({
        text: language === 'sw' ? 'Hitilafu wakati wa kuweka aina ya mtihani.' : 'Error adding exam type.',
        type: 'error',
      });
    }
  };

  const openCreateModal = () => {
    setEditingId(null);
    setName('');
    setCategory('Mid-Term');
    setTargetForm('ALL');
    setAcademicYear('2025/2026');
    setTerm('Muhula wa 1 (Term 1)');
    setStatus('active');
    setIsCurrentForEntry(true);
    setDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (ex: ExamTypeConfig) => {
    setEditingId(ex.id);
    setName(ex.name);
    setCategory(ex.category);
    setTargetForm(ex.targetForm);
    setAcademicYear(ex.academicYear);
    setTerm(ex.term);
    setStatus(ex.status);
    setIsCurrentForEntry(typeof ex.isCurrentForEntry === 'boolean' ? ex.isCurrentForEntry : ex.status === 'active');
    setDescription(ex.description || '');
    setIsModalOpen(true);
  };

  const handleSaveExamType = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFeedbackMsg({
        text: language === 'sw' ? 'Tafadhali weka jina la mtihani.' : 'Please enter exam name.',
        type: 'error',
      });
      return;
    }

    try {
      if (editingId) {
        updateExamType(editingId, {
          name: name.trim(),
          category,
          targetForm,
          academicYear,
          term,
          status,
          isCurrentForEntry,
          description: description.trim(),
        });
        setFeedbackMsg({
          text: language === 'sw'
            ? `✅ Aina ya mtihani "${name.trim()}" imesasishwa kikamilifu!`
            : `✅ Exam type "${name.trim()}" updated successfully!`,
          type: 'success',
        });
      } else {
        const created = addExamType({
          name: name.trim(),
          category,
          targetForm,
          academicYear,
          term,
          status,
          isCurrentForEntry,
          createdBy: 'Mwl. Yohana Bahati (Mtaaluma Mkuu)',
          description: description.trim(),
          dateCreated: new Date().toISOString().split('T')[0],
        });
        setFeedbackMsg({
          text: language === 'sw'
            ? `✅ Aina mpya ya mtihani "${created.name}" imewekwa na kuhifadhiwa kwenye mfumo!`
            : `✅ New exam type "${created.name}" created and saved to system!`,
          type: 'success',
        });
      }

      setIsModalOpen(false);
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch {
      setFeedbackMsg({
        text: language === 'sw' ? 'Hitilafu wakati wa kuhifadhi aina ya mtihani.' : 'Error saving exam type.',
        type: 'error',
      });
    }
  };

  // Filtered exams
  const filteredExams = examTypes.filter((e) => {
    if (filterForm !== 'ALL' && e.targetForm !== 'ALL' && e.targetForm !== filterForm) return false;
    if (filterStatus === 'active' && !e.isCurrentForEntry && e.status !== 'active') return false;
    if (filterStatus === 'closed' && (e.isCurrentForEntry || e.status === 'active')) return false;
    return true;
  });

  return (
    <div className="space-y-6" id="academic-exam-types-container">
      {/* 1. Header Banner */}
      <div className="bg-[#FFFDF8] p-6 rounded-3xl border-2 border-red-200/80 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-red-100/80 text-red-700 border border-red-200 rounded-2xl">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-red-700 text-[#FFFFF0]">
                  {language === 'sw' ? 'Idara ya Taaluma' : 'Academic Office'}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  {language === 'sw' ? 'Aina za Mitihani Rasmi' : 'Official Exam Types'}
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-stone-900 mt-1">
                {language === 'sw'
                  ? '📋 Mkuu wa Taaluma: Weka na Simamia Aina za Mitihani'
                  : '📋 Academic Master: Configure & Manage Exam Types'}
              </h2>
              <p className="text-sm text-stone-600 max-w-3xl mt-1 leading-relaxed">
                {language === 'sw'
                  ? 'Mkuu wa Taaluma (Mtaaluma) ndiye mwenye mamlaka ya kuweka aina za mitihani ya shule (k.m. Mock, Mid-Term, Terminal, Annual, Jaribio la Mwezi). Walimu watachagua aina ya mtihani uliyoweka pekee wakati wa kuingiza alama za masomo yao.'
                  : 'The Academic Master has sole authority to define and configure school exam periods. Teachers will only be permitted to enter scores for exam types defined and opened here.'}
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="px-5 py-3 rounded-2xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition-all self-start md:self-auto shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'sw' ? '+ Weka Aina Mpya ya Mtihani' : '+ Create New Exam Type'}</span>
          </button>
        </div>
      </div>

      {/* Feedback Alert */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 shadow-sm ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-red-50 text-red-900 border-red-300'
          }`}
        >
          {feedbackMsg.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedbackMsg.text}</span>
        </div>
      )}

      {/* 2. Quick Presets for Uomboni Standard Exams */}
      <div className="bg-[#FAF7EE] p-4 rounded-3xl border border-red-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-black uppercase text-stone-800 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-red-700" />
            {language === 'sw' ? 'Violezo vya Haraka (Bofya Kuongeza Papo Hapo):' : 'Quick Presets (Click to Add Instantly):'}
          </span>
          <span className="text-[10px] text-stone-500 font-medium">
            {language === 'sw' ? 'Mitihani Rasmi ya Kalenda ya Uomboni' : 'Official Uomboni School Calendar Exams'}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              handleQuickAddPreset(
                'Mid-Term Exam 2026',
                'Mid-Term',
                'ALL',
                'Mtihani wa Nusu Muhula wa Kwanza 2026 kwa masomo yote na vidato vyote.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-stone-800 text-xs font-bold hover:text-red-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3 text-red-700" />
            <span>Mid-Term Exam 2026 (Vidato Vyote)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAddPreset(
                'NECTA Mock 2026',
                'NECTA',
                'Form 4',
                'Mtihani Rasmi wa Majaribio wa NECTA Mock kwa Watahiniwa wa Kidato cha Nne 2026.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-stone-800 text-xs font-bold hover:text-red-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3 text-red-700" />
            <span>NECTA Mock 2026 (Kidato cha IV)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAddPreset(
                'CSSC Joint Examination 2026',
                'Joint / Pre-NECTA',
                'Form 4',
                'Mtihani wa Pamoja wa Shule za Kikatoliki na Kikristo Kanda ya Kaskazinis.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-stone-800 text-xs font-bold hover:text-red-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3 text-red-700" />
            <span>CSSC Joint Exam 2026</span>
          </button>

          <button
            onClick={() =>
              handleQuickAddPreset(
                'Mtihani wa Muhula (Terminal Exam 2026)',
                'Terminal',
                'ALL',
                'Mtihani wa kufunga muhula wa kwanza 2026.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-stone-800 text-xs font-bold hover:text-red-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3 text-red-700" />
            <span>Mtihani wa Muhula (Terminal 2026)</span>
          </button>

          <button
            onClick={() =>
              handleQuickAddPreset(
                'Jaribio la Mwezi Machi (Monthly Test)',
                'Monthly Test',
                'ALL',
                'Jaribio la kila mwezi la tathmini endelevu ya wanafunzi.'
              )
            }
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-red-50 border border-red-200 text-stone-800 text-xs font-bold hover:text-red-800 transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Plus className="w-3 h-3 text-red-700" />
            <span>Jaribio la Mwezi Machi</span>
          </button>
        </div>
      </div>

      {/* 3. Filter Bar and Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#FFFDF8] p-4 rounded-2xl border border-red-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-red-700" />
          <span className="text-xs font-black text-stone-900">
            {language === 'sw' ? 'Chuja Aina za Mitihani:' : 'Filter Exam Types:'}
          </span>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800">
            {filteredExams.length} {language === 'sw' ? 'Mitihani' : 'Exams'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterForm}
            onChange={(e) => setFilterForm(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{language === 'sw' ? 'Vidato Vyote (All Forms)' : 'All Forms'}</option>
            <option value="Form 1">Kidato cha 1 (Form 1)</option>
            <option value="Form 2">Kidato cha 2 (Form 2)</option>
            <option value="Form 3">Kidato cha 3 (Form 3)</option>
            <option value="Form 4">Kidato cha 4 (Form 4)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] border border-red-200 text-xs font-bold text-stone-800 focus:outline-none cursor-pointer"
          >
            <option value="ALL">{language === 'sw' ? 'Hadhi Zote (All Status)' : 'All Status'}</option>
            <option value="active">{language === 'sw' ? 'Yaliyo Wazi Kuingiza (Open)' : 'Open for Entry'}</option>
            <option value="closed">{language === 'sw' ? 'Yaliyofungwa (Closed)' : 'Closed'}</option>
          </select>
        </div>
      </div>

      {/* 4. Exam Types Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredExams.map((ex) => {
          const isOpen = typeof ex.isCurrentForEntry === 'boolean' ? ex.isCurrentForEntry : ex.status === 'active';

          return (
            <div
              key={ex.id}
              className={`p-5 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                isOpen
                  ? 'bg-[#FFFDF8] border-red-300 shadow-md hover:border-red-400'
                  : 'bg-[#FAF7EE] border-stone-200/90 opacity-90'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-700 text-[#FFFFF0]">
                      {ex.category}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-200">
                      {ex.targetForm === 'ALL' ? 'Vidato Vyote' : ex.targetForm}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      {ex.academicYear}
                    </span>
                  </div>

                  <button
                    onClick={() => toggleExamTypeEntryStatus(ex.id, !isOpen)}
                    title={isOpen ? 'Bofya kufunga dirisha' : 'Bofya kufungua dirisha'}
                    className={`p-2 rounded-2xl border transition-all cursor-pointer ${
                      isOpen
                        ? 'bg-red-700 text-[#FFFFF0] border-red-700 shadow-sm hover:bg-red-800'
                        : 'bg-stone-200 text-stone-700 border-stone-300 hover:bg-stone-300'
                    }`}
                  >
                    {isOpen ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                  </button>
                </div>

                <h3 className="text-base font-black text-stone-900 mt-2.5 leading-snug">
                  {ex.name}
                </h3>

                <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                  {ex.description || (language === 'sw' ? 'Mtihani rasmi uliowekwa na Mkuu wa Taaluma.' : 'Official exam set by Academic Master.')}
                </p>

                <div className="mt-3 pt-3 border-t border-red-100/80 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span className="font-medium">{language === 'sw' ? 'Muhula:' : 'Term:'}</span>
                    <span className="font-bold text-stone-900">{ex.term}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-600 font-medium">{language === 'sw' ? 'Uingizaji Alama:' : 'Teacher Entry:'}</span>
                    <span
                      className={`font-black px-2 py-0.5 rounded-lg text-[10px] tracking-wide ${
                        isOpen
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {isOpen
                        ? language === 'sw' ? 'DIRISHA WAZI (OPEN)' : 'WINDOW OPEN'
                        : language === 'sw' ? 'LIMEFUNGWA (CLOSED)' : 'LOCKED'}
                    </span>
                  </div>

                  {ex.createdBy && (
                    <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                      <span>{language === 'sw' ? 'Aliyeweka:' : 'Created by:'}</span>
                      <span className="font-semibold text-red-950">{ex.createdBy}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-4 pt-3 border-t border-red-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openEditModal(ex)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF7EE] hover:bg-stone-200/80 text-stone-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-stone-200 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-stone-700" />
                  <span>{language === 'sw' ? 'Hariri' : 'Edit'}</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(language === 'sw' ? `Una uhakika unataka kufuta mtihani wa "${ex.name}"?` : `Are you sure you want to delete "${ex.name}"?`)) {
                      deleteExamType(ex.id);
                      setFeedbackMsg({
                        text: language === 'sw' ? `Mtihani wa "${ex.name}" umefutwa.` : `Exam "${ex.name}" deleted.`,
                        type: 'success',
                      });
                      setTimeout(() => setFeedbackMsg(null), 4000);
                    }
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer border border-red-200 transition-colors"
                  title="Futa Aina ya Mtihani"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'sw' ? 'Futa' : 'Delete'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="p-8 text-center bg-[#FFFDF8] rounded-3xl border-2 border-dashed border-red-200 text-stone-600 space-y-3">
          <Award className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-black text-stone-800 text-base">
            {language === 'sw' ? 'Hakuna Aina ya Mtihani Inayolingana' : 'No Matching Exam Types Found'}
          </h4>
          <p className="text-xs text-stone-500 max-w-md mx-auto">
            {language === 'sw'
              ? 'Mkuu wa Taaluma anaweza kubonyeza kitufe cha "+ Weka Aina Mpya ya Mtihani" hapo juu ili kuongeza mtihani mpya kwa walimu.'
              : 'Use the "+ Create New Exam Type" button above to configure an exam period.'}
          </p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl bg-red-700 text-[#FFFFF0] text-xs font-bold inline-flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{language === 'sw' ? 'Weka Aina ya Mtihani Sasa' : 'Configure Exam Type Now'}</span>
          </button>
        </div>
      )}

      {/* 5. Create / Edit Exam Type Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-300 shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-3 border-b border-red-100">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-700 text-[#FFFFF0]">
                  {language === 'sw' ? 'Mamlaka ya Mkuu wa Taaluma' : 'Academic Master Authority'}
                </span>
                <h3 className="text-lg font-black text-stone-900 mt-1">
                  {editingId
                    ? language === 'sw' ? '✏️ Hariri Aina ya Mtihani' : '✏️ Edit Exam Type'
                    : language === 'sw' ? '➕ Weka Aina Mpya ya Mtihani' : '➕ Configure New Exam Type'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveExamType} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'sw' ? 'Jina Kamili la Mtihani (Exam Name) *' : 'Exam Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'sw' ? 'k.m. Mid-Term Exam 2026, NECTA Mock 2026, Jaribio la Mwezi Machi...' : 'e.g. Mid-Term Exam 2026, NECTA Mock 2026...'}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-red-300 text-stone-900 font-bold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {language === 'sw' ? 'Kundi la Mtihani (Category)' : 'Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="Mid-Term">Mtihani wa Nusu Muhula (Mid-Term)</option>
                    <option value="Terminal">Mtihani wa Muhula (Terminal)</option>
                    <option value="Annual">Mtihani wa Mwaka (Annual Exam)</option>
                    <option value="NECTA">Mtihani wa NECTA / Mock</option>
                    <option value="Joint / Pre-NECTA">CSSC / Joint / Pre-NECTA</option>
                    <option value="Monthly Test">Jaribio la Mwezi (Monthly Test)</option>
                    <option value="Other">Mtihani Mwingine (Other)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {language === 'sw' ? 'Kidato Kinachohusika' : 'Target Form'}
                  </label>
                  <select
                    value={targetForm}
                    onChange={(e) => setTargetForm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="ALL">Vidato Vyote (Form 1 - Form 4)</option>
                    <option value="Form 1">Kidato cha 1 (Form 1)</option>
                    <option value="Form 2">Kidato cha 2 (Form 2)</option>
                    <option value="Form 3">Kidato cha 3 (Form 3)</option>
                    <option value="Form 4">Kidato cha 4 (Form 4)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {language === 'sw' ? 'Mwaka wa Masomo' : 'Academic Year'}
                  </label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1">
                    {language === 'sw' ? 'Muhula (Term)' : 'Term'}
                  </label>
                  <select
                    value={term}
                    onChange={(e) => setTerm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-red-200 text-stone-900 font-semibold text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                  >
                    <option value="Muhula wa 1 (Term 1)">Muhula wa 1 (Term 1)</option>
                    <option value="Muhula wa 2 (Term 2)">Muhula wa 2 (Term 2)</option>
                    <option value="Mwaka Mzima">Mwaka Mzima (Full Year)</option>
                  </select>
                </div>
              </div>

              {/* Status and Open for Entry Toggle */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7EE] border border-red-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isCurrentForEntry ? <Unlock className="w-4 h-4 text-emerald-700" /> : <Lock className="w-4 h-4 text-stone-600" />}
                    <span className="text-xs font-bold text-stone-900">
                      {language === 'sw' ? 'Dirisha la Kuingiza Alama Liko Wazi kwa Walimu?' : 'Open Mark Entry for Teachers?'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCurrentForEntry}
                      onChange={(e) => {
                        setIsCurrentForEntry(e.target.checked);
                        setStatus(e.target.checked ? 'active' : 'closed');
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-stone-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-700"></div>
                  </label>
                </div>
                <p className="text-[11px] text-stone-500">
                  {isCurrentForEntry
                    ? (language === 'sw' ? '✅ Walimu wataona aina hii ya mtihani kwenye mfumo na wataweza kuingiza alama za masomo yao.' : '✅ Teachers can select and input marks for their assigned subjects.')
                    : (language === 'sw' ? '🔒 Dirisha limefungwa. Walimu hawataweza kuingiza alama bila idhini yako.' : '🔒 Locked. Teachers cannot submit marks for this exam.')}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1">
                  {language === 'sw' ? 'Maelezo ya Ziada / Waraka wa Mtaaluma (Hiari)' : 'Academic Master Notes / Description (Optional)'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'sw' ? 'Maelezo kwa walimu kuhusu mtihani huu...' : 'Notes to teachers regarding this examination...'}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border border-red-200 text-stone-900 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs cursor-pointer"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black text-xs cursor-pointer shadow-md"
                >
                  {editingId
                    ? language === 'sw' ? 'Sasisha Mtihani' : 'Update Exam'
                    : language === 'sw' ? 'Hifadhi Mtihani' : 'Save Exam Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
