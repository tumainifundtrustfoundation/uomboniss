import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { JoiningDocument } from '../../types';
import { downloadJoiningInstructionsPdf } from '../../utils/pdfService';
import {
  isGoogleDriveUrl,
  parseGoogleDriveUrl,
  extractGoogleDriveId,
} from '../../utils/googleDriveHelper';
import { uploadToStorage } from '../../utils/blobStorage';
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
  Sparkles,
  ExternalLink,
  FolderOpen,
  Loader2,
  UploadCloud,
} from 'lucide-react';

export const AdminAdmissionDocsTab: React.FC = () => {
  const { language } = useLanguage();
  const { joiningDocs, addJoiningDoc, updateJoiningDoc, deleteJoiningDoc } = useData();

  const [search, setSearch] = useState('');
  const [editingDoc, setEditingDoc] = useState<JoiningDocument | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [drivePreviewUrl, setDrivePreviewUrl] = useState<string | null>(null);

  // Form fields
  const [formDocumentSource, setFormDocumentSource] = useState<'google_drive' | 'pdf_template'>('google_drive');
  const [formGoogleDriveUrl, setFormGoogleDriveUrl] = useState('');
  const [formTitleSw, setFormTitleSw] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formDescSw, setFormDescSw] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formTargetGroup, setFormTargetGroup] = useState('Kidato cha Kwanza (Form One)');
  const [formFileSize, setFormFileSize] = useState('Google Drive Document');
  const [formHeader, setFormHeader] = useState('SHULE YA SEKONDARI UOMBONI - NECTA S0486\nS.L.P 361 MARANGU, MOSHI');
  const [formRequirementsText, setFormRequirementsText] = useState('');
  const [formFeesSummary, setFormFeesSummary] = useState('Ada ya shule inalipwa kwa awamu kupitia benki.');
  const [formReportingDate, setFormReportingDate] = useState('Januari 2026/2027');

  // Vercel Blob File Upload States
  const fileUploadInputRef = React.useRef<HTMLInputElement>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadFeedback, setUploadFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingFile(true);
    setUploadFeedback(null);

    try {
      const uploadRes = await uploadToStorage(file, { folder: 'documents' });
      if (!uploadRes.success || !uploadRes.url) {
        throw new Error(uploadRes.error || 'Imeshindwa kupakia faili.');
      }

      setFormGoogleDriveUrl(uploadRes.url);
      setFormFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB (${file.type.includes('pdf') ? 'PDF Document' : 'Document'})`);
      if (!formTitleSw.trim()) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');
        setFormTitleSw(cleanTitle);
        setFormTitleEn(cleanTitle);
      }

      setUploadFeedback({
        type: 'success',
        message: `Faili limepakiwa kikamilifu kwenye ${uploadRes.source === 'vercel_blob' ? 'Vercel Blob Storage' : 'Hifadhi ya Shule'}! Link: ${uploadRes.url}`,
      });
    } catch (err: any) {
      setUploadFeedback({
        type: 'error',
        message: err?.message || 'Hitilafu ya kupakia faili.',
      });
    } finally {
      setIsUploadingFile(false);
      if (fileUploadInputRef.current) fileUploadInputRef.current.value = '';
    }
  };

  const openEditModal = (doc: JoiningDocument) => {
    setEditingDoc(doc);
    setIsCreatingNew(false);
    setFormDocumentSource(doc.googleDriveUrl ? 'google_drive' : 'pdf_template');
    setFormGoogleDriveUrl(doc.googleDriveUrl || '');
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
    setFormDocumentSource('google_drive');
    setFormGoogleDriveUrl('');
    setFormTitleSw('');
    setFormTitleEn('');
    setFormDescSw('');
    setFormDescEn('');
    setFormTargetGroup('Kidato cha Kwanza (Form One)');
    setFormFileSize('Google Drive PDF');
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

    const isDrive = Boolean(formGoogleDriveUrl.trim());

    const docPayload: JoiningDocument = {
      id: editingDoc ? editingDoc.id : `doc-${Date.now()}`,
      titleSw: formTitleSw.trim(),
      titleEn: formTitleEn.trim() || formTitleSw.trim(),
      descriptionSw: formDescSw.trim(),
      descriptionEn: formDescEn.trim() || formDescSw.trim(),
      targetGroup: formTargetGroup,
      fileSize: formFileSize.trim() || (isDrive ? 'Google Drive Document' : '1.2 MB (PDF Document)'),
      downloadCount: editingDoc ? editingDoc.downloadCount : 0,
      googleDriveUrl: formGoogleDriveUrl.trim() || undefined,
      documentType: isDrive ? 'google_drive' : 'pdf_template',
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

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5">
                {doc.googleDriveUrl ? (
                  <a
                    href={doc.googleDriveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer border border-blue-200"
                    title="Fungua hati hii kwenye Google Drive"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Drive</span>
                    <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
                  </a>
                ) : (
                  <button
                    onClick={() => downloadJoiningInstructionsPdf(doc)}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                    title="Jaribu kupakua fomu hii"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-600" />
                    <span>Jaribu PDF</span>
                  </button>
                )}
              </div>

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
              {/* Direct File Upload via Vercel Blob */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-300 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-amber-950 flex items-center gap-1.5 text-xs">
                    <UploadCloud className="w-4 h-4 text-amber-700" />
                    <span>Pakia Faili Moja kwa Moja (Vercel Blob / Cloud Storage)</span>
                  </label>
                  <span className="text-[10px] bg-amber-200 text-amber-950 font-black px-2 py-0.5 rounded-md border border-amber-300 uppercase">
                    Vercel Blob
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Pakia faili halisi la PDF au Word moja kwa moja kutoka kwenye kifaa chako. Faili litahifadhiwa kwenye wingu la Vercel Blob na kiungo kitazalishwa moja kwa moja.
                </p>

                <div className="flex items-center gap-3 pt-1">
                  <input
                    ref={fileUploadInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileUploadInputRef.current?.click()}
                    disabled={isUploadingFile}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-xs cursor-pointer transition disabled:opacity-50"
                  >
                    {isUploadingFile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Inapakia kwenye Vercel Blob...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-slate-950" />
                        <span>Chagua Faili la Kupakia (PDF/Doc)</span>
                      </>
                    )}
                  </button>
                  {formGoogleDriveUrl && (
                    <span className="text-[11px] font-mono text-emerald-800 font-bold truncate max-w-xs">
                      ✓ Faili limewekwa tayari
                    </span>
                  )}
                </div>

                {uploadFeedback && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      uploadFeedback.type === 'success'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {uploadFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span className="truncate">{uploadFeedback.message}</span>
                  </div>
                )}
              </div>

              {/* Google Drive Link Section */}
              <div className="p-3.5 rounded-2xl bg-blue-50/80 border border-blue-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-blue-950 flex items-center gap-1.5 text-xs">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                    <span>Kiungo cha Faili (Vercel Blob / Google Drive URL)</span>
                  </label>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">
                    File URL
                  </span>
                </div>
                <input
                  type="url"
                  value={formGoogleDriveUrl}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormGoogleDriveUrl(val);
                    if (val.trim() && isGoogleDriveUrl(val)) {
                      setFormFileSize('Google Drive Document');
                    }
                  }}
                  placeholder="Mfano: https://drive.google.com/file/d/1A2B3C4D.../view?usp=sharing"
                  className="w-full p-2.5 rounded-xl border border-blue-300 bg-white text-xs outline-none focus:ring-2 focus:ring-blue-600"
                />
                <p className="text-[11px] text-blue-800 leading-relaxed">
                  Weka link ya Google Drive kutoka "Share" &rarr; "Anyone with the link can view". Mfumo utazalisha fomu na link ya kupakua kwa wazazi na wanafunzi.
                </p>
                {formGoogleDriveUrl.trim() && isGoogleDriveUrl(formGoogleDriveUrl) && (
                  <div className="flex items-center justify-between text-[11px] text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 font-semibold">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Google Drive File ID: <code className="bg-emerald-100 px-1 py-0.5 rounded text-[10px]">{extractGoogleDriveId(formGoogleDriveUrl)}</code>
                    </span>
                    <a
                      href={formGoogleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 hover:text-blue-900 underline text-[10px] font-bold flex items-center gap-0.5"
                    >
                      <span>Jaribu Kufungua</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                )}
              </div>

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
