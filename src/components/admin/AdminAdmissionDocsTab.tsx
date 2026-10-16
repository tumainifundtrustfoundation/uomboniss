import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { JoiningDocument } from '../../types';
import { downloadJoiningInstructionsPdf } from '../../utils/pdfService';
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  Download,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Save,
  X,
  FileCheck,
  Search,
  Sparkles
} from 'lucide-react';

export const AdminAdmissionDocsTab: React.FC = () => {
  const { language } = useLanguage();
  const { joiningDocs, addJoiningDoc, updateJoiningDoc, deleteJoiningDoc } = useData();

  const [search, setSearch] = useState('');
  const [editingDoc, setEditingDoc] = useState<JoiningDocument | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form fields
  const [formTitleSw, setFormTitleSw] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescSw, setFormDescSw] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formTargetGroup, setFormTargetGroup] = useState('Kidato cha Kwanza (Form One)');
  const [formFileSize, setFormFileSize] = useState('1.2 MB (PDF Document)');
  const [formHeader, setFormHeader] = useState('SHULE YA SEKONDARI UOMBONI - NECTA S0486\nS.L.P 361 MARANGU, MOSHI');
  const [formRequirementsText, setFormRequirementsText] = useState('');
  const [formFeesSummary, setFormFeesSummary] = useState('Ada ya shule inalipwa kwa awamu kupitia benki.');
  const [formReportingDate, setFormReportingDate] = useState('Januari 2026/2027');

  const openEditModal = (doc: JoiningDocument) => {
    setEditingDoc(doc);
    setIsCreatingNew(false);
    setFormTitleSw(doc.titleSw);
    setFormTitleEn(doc.titleEn);
    setFormDescSw(doc.descriptionSw);
    setFormDescEn(doc.descriptionEn);
    setFormTargetGroup(doc.targetGroup);
    setFormFileSize(doc.fileSize);
    setFormHeader(doc.pdfContentPreview?.header || '');
    setFormRequirementsText((doc.pdfContentPreview?.requirements || []).join('\n'));
    setFormFeesSummary(doc.pdfContentPreview?.feesSummary || '');
    setFormReportingDate(doc.pdfContentPreview?.reportingDate || '');
  };

  const openCreateModal = () => {
    setEditingDoc(null);
    setIsCreatingNew(true);
    setFormTitleSw('');
    setFormTitleEn('');
    setFormDescSw('');
    setFormDescEn('');
    setFormTargetGroup('Kidato cha Kwanza (Form One)');
    setFormFileSize('1.2 MB (PDF Document)');
    setFormHeader('SHULE YA SEKONDARI UOMBONI - NECTA S0486\nS.L.P 361 MARANGU, MOSHI');
    setFormRequirementsText('Cheti cha Kuzaliwa (RITA)\nResult Slip ya Darasa la Saba\nPicha 4 za pasipoti');
    setFormFeesSummary('Ada inalipwa benki kupitia akaunti rasmi za CRDB, NMB na Mkombozi.');
    setFormReportingDate('Januari 2026 / 2027');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleSw.trim()) return;

    const reqArray = formRequirementsText
      .split('\n')
      .map((r) => r.trim())
      .filter(Boolean);

    const docPayload: JoiningDocument = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}`,
      titleSw: formTitleSw.trim(),
      titleEn: formTitleEn.trim() || formTitleSw.trim(),
      descriptionSw: formDescSw.trim(),
      descriptionEn: formDescEn.trim() || formDescSw.trim(),
      targetGroup: formTargetGroup,
      fileSize: formFileSize.trim(),
      downloadCount: editingDoc ? editingDoc.downloadCount : 0,
      pdfContentPreview: {
        header: formHeader.trim(),
        requirements: reqArray,
        feesSummary: formFeesSummary.trim(),
        reportingDate: formReportingDate.trim(),
      },
    };

    if (editingDoc) {
      updateJoiningDoc(docPayload);
      setSuccessToast('Hati imesasishwa kikamilifu!');
    } else {
      addJoiningDoc(docPayload);
      setSuccessToast('Hati mpya imechapishwa kikamilifu!');
    }

    setEditingDoc(null);
    setIsCreatingNew(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    deleteJoiningDoc(id);
    setDeleteConfirmId(null);
    setSuccessToast('Hati imeondolewa kikamilifu!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filtered = joiningDocs.filter(
    (d) =>
      d.titleSw.toLowerCase().includes(search.toLowerCase()) ||
      d.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      d.targetGroup.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Header with Search and Create Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C9A227]" />
            <span>Usimamizi wa Hati &amp; Fomu za Udahili (Admission Documents Management)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Ongeza, sasisha maelezo, au ondoa fomu rasmi zinazoonekana kwenye ukurasa wa udahili wa wanafunzi.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-[#C9A227]" />
          <span>Chapisha Hati Mpya</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tafuta fomu kwa jina au kundi..."
          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none"
        />
      </div>

      {/* Documents Table / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((doc) => (
          <div
            key={doc.id}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-900 border border-amber-200">
                  {doc.targetGroup}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {doc.downloadCount.toLocaleString()} downloads
                </span>
              </div>

              <h4 className="font-bold text-sm text-[#102A43]">{doc.titleSw}</h4>
              <p className="text-xs text-slate-600 line-clamp-2">{doc.descriptionSw}</p>

              <div className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded-lg">
                Ukubwa: {doc.fileSize} &bull; Ripoti: {doc.pdfContentPreview?.reportingDate || 'N/A'}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                onClick={() => downloadJoiningInstructionsPdf(doc)}
                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                title="Jaribu kupakua fomu hii"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Jaribu PDF</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(doc)}
                  className="px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Hariri</span>
                </button>

                <button
                  onClick={() => setDeleteConfirmId(doc.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Ondoa</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-900">Thibitisha Kuondoa Hati</h4>
            <p className="text-xs text-slate-600">
              Je, una uhakika unataka kuondoa hati hii kwenye mfumo wa shule? Wanafunzi hawataweza kuipakua tena.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer"
              >
                Ondoa Kabisa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Create Document Modal */}
      {(editingDoc || isCreatingNew) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 bg-[#102A43] text-white flex items-center justify-between">
              <h3 className="font-bold text-sm sm:text-base">
                {editingDoc ? 'Hariri Hati ya Udahili' : 'Chapisha Hati Mpya ya Udahili'}
              </h3>
              <button
                onClick={() => {
                  setEditingDoc(null);
                  setIsCreatingNew(false);
                }}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jina la Hati (Kiswahili) *</label>
                  <input
                    type="text"
                    required
                    value={formTitleSw}
                    onChange={(e) => setFormTitleSw(e.target.value)}
                    placeholder="Mf: Fomu ya Maombi ya Kujiunga"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jina la Hati (English)</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Student Application Form"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Walengwa (Target Group)</label>
                  <select
                    value={formTargetGroup}
                    onChange={(e) => setFormTargetGroup(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  >
                    <option value="Kidato cha Kwanza (Form One)">Kidato cha Kwanza (Form One)</option>
                    <option value="Uhamisho (Form Two/Three)">Uhamisho (Form Two/Three)</option>
                    <option value="Wanafunzi Wote">Wanafunzi Wote</option>
                    <option value="Wazazi na Walezi">Wazazi na Walezi</option>
                    <option value="Afya na Bima">Afya na Bima</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Aina &amp; Ukubwa wa Faili</label>
                  <input
                    type="text"
                    value={formFileSize}
                    onChange={(e) => setFormFileSize(e.target.value)}
                    placeholder="Mf: 1.4 MB (PDF Document)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maelezo (Kiswahili) *</label>
                <textarea
                  required
                  rows={2}
                  value={formDescSw}
                  onChange={(e) => setFormDescSw(e.target.value)}
                  placeholder="Maelezo mafupi ya hati hii..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Maelezo (English)</label>
                <textarea
                  rows={2}
                  value={formDescEn}
                  onChange={(e) => setFormDescEn(e.target.value)}
                  placeholder="English summary..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kichwa cha Taarifa kwenye PDF (Header)</label>
                <textarea
                  rows={2}
                  value={formHeader}
                  onChange={(e) => setFormHeader(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Masharti &amp; Orodha ya Vitu (Weka mstari mpya kwa kila kipengele)
                </label>
                <textarea
                  rows={4}
                  value={formRequirementsText}
                  onChange={(e) => setFormRequirementsText(e.target.value)}
                  placeholder="Cheti cha Kuzaliwa&#10;Result Slip ya PSLE&#10;Picha 4 za pasipoti"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ada &amp; Malipo</label>
                  <input
                    type="text"
                    value={formFeesSummary}
                    onChange={(e) => setFormFeesSummary(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tarehe ya Kuripoti</label>
                  <input
                    type="text"
                    value={formReportingDate}
                    onChange={(e) => setFormReportingDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-[#102A43]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setEditingDoc(null);
                    setIsCreatingNew(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#102A43] hover:bg-[#0A1C2E] text-white font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Save className="w-4 h-4 text-[#C9A227]" />
                  <span>{editingDoc ? 'Sasisha Hati' : 'Chapisha Hati'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
