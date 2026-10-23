import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolVideo } from '../../types';
import { parseVideoUrl } from '../../utils/mediaUrlHelper';
import {
  Film,
  Plus,
  Trash2,
  Edit2,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Calendar,
  Clock,
  Search,
  Eye,
  X,
  Save,
  Video,
  Check,
} from 'lucide-react';

export const AdminVideosManagerTab: React.FC = () => {
  const { language } = useLanguage();
  const { schoolVideos, addSchoolVideo, updateSchoolVideo, deleteSchoolVideo } = useData();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingVideo, setEditingVideo] = useState<SchoolVideo | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<SchoolVideo | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Form Fields
  const [formTitleSw, setFormTitleSw] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formCategory, setFormCategory] = useState('Mahafali & Sherehe');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDuration, setFormDuration] = useState('10:00');
  const [formDescriptionSw, setFormDescriptionSw] = useState('');
  const [formDescriptionEn, setFormDescriptionEn] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);

  // Live parsed preview for input URL
  const parsedUrl = parseVideoUrl(formVideoUrl);

  const categories = [
    'Mahafali & Sherehe',
    'Taaluma & Masomo',
    'Kikanisa & Misa',
    'Michezo & Utamaduni',
    'Ziara & Mazingira',
    'Uongozi & Shule',
  ];

  const openCreateModal = () => {
    setEditingVideo(null);
    setIsCreatingNew(true);
    setFormTitleSw('');
    setFormTitleEn('');
    setFormVideoUrl('');
    setFormCategory('Mahafali & Sherehe');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDuration('12:00');
    setFormDescriptionSw('');
    setFormDescriptionEn('');
    setFormFeatured(false);
  };

  const openEditModal = (video: SchoolVideo) => {
    setEditingVideo(video);
    setIsCreatingNew(false);
    setFormTitleSw(video.titleSw);
    setFormTitleEn(video.titleEn || video.titleSw);
    setFormVideoUrl(video.videoUrl || video.youtubeUrl || '');
    setFormCategory(video.category || 'Mahafali & Sherehe');
    setFormDate(video.date || new Date().toISOString().split('T')[0]);
    setFormDuration(video.duration || '10:00');
    setFormDescriptionSw(video.descriptionSw || '');
    setFormDescriptionEn(video.descriptionEn || '');
    setFormFeatured(Boolean(video.featured));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitleSw.trim() || !formVideoUrl.trim()) {
      alert(language === 'sw' ? 'Tafadhali jaza jina la video na kiungo (link).' : 'Please enter video title and URL.');
      return;
    }

    const parsed = parseVideoUrl(formVideoUrl);

    const videoPayload: SchoolVideo = {
      id: editingVideo ? editingVideo.id : `vid-custom-${Date.now()}`,
      titleSw: formTitleSw.trim(),
      titleEn: formTitleEn.trim() || formTitleSw.trim(),
      videoSource: parsed.source,
      videoUrl: formVideoUrl.trim(),
      embedUrl: parsed.embedUrl,
      youtubeUrl: parsed.source === 'youtube' ? (parsed.watchUrl || formVideoUrl.trim()) : formVideoUrl.trim(),
      youtubeId: parsed.source === 'youtube' ? (parsed.id || '') : '',
      driveFileId: parsed.source === 'google_drive' ? parsed.id : undefined,
      category: formCategory,
      date: formDate,
      duration: formDuration.trim(),
      descriptionSw: formDescriptionSw.trim(),
      descriptionEn: formDescriptionEn.trim() || formDescriptionSw.trim(),
      featured: formFeatured,
    };

    if (editingVideo) {
      updateSchoolVideo(videoPayload);
      setSuccessToast(language === 'sw' ? 'Video imesasishwa kikamilifu!' : 'Video updated successfully!');
    } else {
      addSchoolVideo(videoPayload);
      setSuccessToast(language === 'sw' ? 'Video mpya imechapishwa kikamilifu!' : 'New video published successfully!');
    }

    setEditingVideo(null);
    setIsCreatingNew(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    deleteSchoolVideo(id);
    setDeleteConfirmId(null);
    setSuccessToast(language === 'sw' ? 'Video imeondolewa kikamilifu!' : 'Video deleted successfully!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredVideos = schoolVideos.filter((v) => {
    const matchesSearch =
      search.trim() === '' ||
      v.titleSw.toLowerCase().includes(search.toLowerCase()) ||
      v.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      (v.descriptionSw && v.descriptionSw.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700">✕</button>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">
            <Film className="w-4 h-4 text-amber-600" />
            <span>YouTube &amp; Google Drive Integration</span>
          </div>
          <h2 className="text-lg font-bold text-[#102A43]">
            {language === 'sw' ? 'Meneja wa Video za Shule' : 'School Videos Manager'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'sw'
              ? 'Weka video za YouTube au Google Drive za matukio ya shule, mahafali, masomo na michezo.'
              : 'Add YouTube or Google Drive videos of school events, graduations, lessons, and sports.'}
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="liquid-btn liquid-btn-gold px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4 text-amber-950" />
          <span>{language === 'sw' ? 'Weka Video Mpya' : 'Add New Video'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={language === 'sw' ? 'Tafuta kwa jina la video...' : 'Search by video title...'}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-[#102A43] text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {language === 'sw' ? 'Zote' : 'All'} ({schoolVideos.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#102A43] text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Video className="w-12 h-12 text-slate-300 mx-auto" />
          <h4 className="font-bold text-sm text-slate-700">
            {language === 'sw' ? 'Hakuna video inayofanana na utafutaji' : 'No videos match search'}
          </h4>
          <p className="text-xs text-slate-500">
            {language === 'sw'
              ? 'Bofya kitufe cha "Weka Video Mpya" kupakia video kwa kutumia kiungo cha YouTube au Google Drive.'
              : 'Click "Add New Video" to publish a video using a YouTube or Google Drive link.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((vid) => {
            const isDrive = vid.videoSource === 'google_drive' || (vid.videoUrl && vid.videoUrl.includes('drive.google'));
            const thumbnail =
              vid.youtubeId
                ? `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg`
                : vid.driveFileId
                ? `https://drive.google.com/thumbnail?id=${vid.driveFileId}&sz=w600`
                : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';

            return (
              <div
                key={vid.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Thumbnail Preview with Source Badge */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden group">
                  <img
                    src={thumbnail}
                    alt={vid.titleSw}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
                    }}
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(vid)}
                      className="w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#102A43] flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform cursor-pointer"
                      title="Cheza Video (Play Video)"
                    >
                      <Play className="w-5 h-5 ml-0.5 fill-[#102A43]" />
                    </button>
                  </div>

                  {/* Provider Pill */}
                  <div className="absolute top-2.5 left-2.5">
                    {isDrive ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-600/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                        <span>📁 Google Drive</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-red-600/95 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm backdrop-blur-xs">
                        <span>▶ YouTube</span>
                      </span>
                    )}
                  </div>

                  {/* Duration Pill */}
                  {vid.duration && (
                    <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded bg-black/80 text-white font-mono text-[10px] font-bold">
                      {vid.duration}
                    </div>
                  )}

                  {vid.featured && (
                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black text-[9px] uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>FEATURED</span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                        {vid.category}
                      </span>
                      <span className="flex items-center gap-1 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{vid.date}</span>
                      </span>
                    </div>

                    <h4 className="font-bold text-xs sm:text-sm text-[#102A43] line-clamp-2 leading-snug">
                      {language === 'sw' ? vid.titleSw : vid.titleEn}
                    </h4>

                    {vid.descriptionSw && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {language === 'sw' ? vid.descriptionSw : vid.descriptionEn || vid.descriptionSw}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewVideo(vid)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#102A43] hover:text-[#C9A227] cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'sw' ? 'Tazama' : 'Preview'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(vid)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer transition-colors"
                        title="Hariri Video (Edit)"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirmId(vid.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-700 hover:bg-red-50 cursor-pointer transition-colors"
                        title="Futa Video (Delete)"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {language === 'sw' ? 'Una uhakika unataka kufuta video hii?' : 'Are you sure you want to delete this video?'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'sw'
                  ? 'Video itaondolewa mara moja kwenye tovuti na maktaba ya shule.'
                  : 'This video will be removed immediately from the school website and library.'}
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                {language === 'sw' ? 'Ghairi' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white cursor-pointer shadow-sm"
              >
                {language === 'sw' ? 'Ndio, Futa' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Video Modal */}
      {(isCreatingNew || editingVideo) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Film className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    {editingVideo
                      ? (language === 'sw' ? 'Hariri Video ya Shule' : 'Edit School Video')
                      : (language === 'sw' ? 'Weka Video Mpya (YouTube / Google Drive)' : 'Add New Video (YouTube / Google Drive)')}
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Uomboni Secondary School · Mfumo wa Media na Video
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingVideo(null);
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="space-y-4">
              {/* URL Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {language === 'sw' ? 'Kiungo cha Video (YouTube Link au Google Drive Link) *' : 'Video Link (YouTube URL or Google Drive Link) *'}
                </label>
                <input
                  type="url"
                  required
                  value={formVideoUrl}
                  onChange={(e) => setFormVideoUrl(e.target.value)}
                  placeholder="mfano: https://www.youtube.com/watch?v=... au https://drive.google.com/file/d/.../view"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#102A43] outline-none"
                />
                <span className="block text-[11px] text-slate-500 mt-1">
                  Inasaidia video zote za <strong>YouTube</strong> (kawaida, shorts, au embed) na video zilizopakiwa kwenye <strong>Google Drive</strong> (zilizowekwa &apos;Anyone with the link can view&apos;).
                </span>

                {/* Live Parser Feedback */}
                {formVideoUrl && (
                  <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                    {parsedUrl.source === 'youtube' ? (
                      <span className="text-red-700 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Imetambuliwa kama YouTube Video (ID: {parsedUrl.id})
                      </span>
                    ) : parsedUrl.source === 'google_drive' ? (
                      <span className="text-blue-700 font-bold flex items-center gap-1.5">
                        <Check className="w-4 h-4 text-emerald-600" />
                        Imetambuliwa kama Google Drive Video (File ID: {parsedUrl.id?.substring(0, 12)}...)
                      </span>
                    ) : (
                      <span className="text-amber-700 flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        Tafadhali hakikisha kiungo kimetoka YouTube au Google Drive.
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Title Swahili & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Jina la Video (Kiswahili) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitleSw}
                    onChange={(e) => setFormTitleSw(e.target.value)}
                    placeholder="mfano: Mahafali ya Kidato cha Nne 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Video Title (English)
                  </label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. Form Four Graduation Ceremony 2026"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none"
                  />
                </div>
              </div>

              {/* Category, Date, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Kategoria (Category)
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tarehe (Date)
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Muda (Duration)
                  </label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="mfano: 15:30"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-[#102A43] outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Maelezo Fupi ya Video (Kiswahili)
                </label>
                <textarea
                  rows={2}
                  value={formDescriptionSw}
                  onChange={(e) => setFormDescriptionSw(e.target.value)}
                  placeholder="Eleza kwa ufupi tukio lililorekodiwa kwenye video hii..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-[#102A43] outline-none resize-none"
                />
              </div>

              {/* Featured checkbox */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-200">
                <input
                  type="checkbox"
                  id="form-featured-video"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                />
                <label htmlFor="form-featured-video" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {language === 'sw' ? 'Weka kama Video Maalum (Featured Video)' : 'Mark as Featured Video'}
                  <span className="block text-[10px] text-slate-500 font-normal">
                    Itaonekana juu kabisa kwenye ukurasa wa picha na video (Gallery).
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  {language === 'sw' ? 'Ghairi' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="liquid-btn liquid-btn-gold px-6 py-2.5 text-xs font-black inline-flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4 text-amber-950" />
                  <span>{editingVideo ? (language === 'sw' ? 'Hifadhi Mabadiliko' : 'Save Changes') : (language === 'sw' ? 'Chapisha Video' : 'Publish Video')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Play Video Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-700">
            {/* Top Bar */}
            <div className="p-4 bg-slate-950 flex items-center justify-between text-white border-b border-slate-800">
              <div className="min-w-0 pr-4">
                <h3 className="font-bold text-sm truncate">
                  {language === 'sw' ? previewVideo.titleSw : previewVideo.titleEn}
                </h3>
                <span className="text-[11px] text-slate-400">
                  {previewVideo.category} · {previewVideo.date}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Player */}
            <div className="relative aspect-video bg-black">
              {(() => {
                const parsed = parseVideoUrl(previewVideo.videoUrl || previewVideo.youtubeUrl || '');
                if (parsed.embedUrl) {
                  return (
                    <iframe
                      src={parsed.embedUrl}
                      title={previewVideo.titleSw}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center space-y-2">
                    <AlertCircle className="w-8 h-8 text-amber-400" />
                    <p className="text-xs">
                      Hatuwezi kucheza video hii moja kwa moja hapa.
                    </p>
                    <a
                      href={previewVideo.videoUrl || previewVideo.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <span>Fungua kwenye Kichupo Kipya</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })()}
            </div>

            {/* Footer description */}
            {previewVideo.descriptionSw && (
              <div className="p-4 bg-slate-950 text-slate-300 text-xs leading-relaxed border-t border-slate-800">
                {language === 'sw' ? previewVideo.descriptionSw : previewVideo.descriptionEn || previewVideo.descriptionSw}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
