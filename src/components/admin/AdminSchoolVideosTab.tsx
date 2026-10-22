import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolVideo } from '../../types';
import {
  extractYouTubeId,
  isValidYouTubeUrl,
  getYouTubeThumbnail,
  getYouTubeEmbedUrl,
} from '../../utils/youtubeHelper';
import {
  Video,
  Plus,
  Trash2,
  Edit2,
  Play,
  X,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Search,
  RotateCcw,
  Film,
  Calendar,
  Clock,
  Tag,
} from 'lucide-react';

export const AdminSchoolVideosTab: React.FC = () => {
  const { language } = useLanguage();
  const {
    schoolVideos,
    addSchoolVideo,
    updateSchoolVideo,
    deleteSchoolVideo,
    resetSchoolVideosToDefaults,
  } = useData();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [editingVideo, setEditingVideo] = useState<SchoolVideo | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [previewVideo, setPreviewVideo] = useState<SchoolVideo | null>(null);

  // Form State
  const [formYoutubeUrl, setFormYoutubeUrl] = useState('');
  const [formTitleSw, setFormTitleSw] = useState('');
  const [formTitleEn, setFormTitleEn] = useState('');
  const [formCategory, setFormCategory] = useState<SchoolVideo['category']>('Mahafali & Sherehe');
  const [formDate, setFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [formDuration, setFormDuration] = useState('10:00');
  const [formDescSw, setFormDescSw] = useState('');
  const [formDescEn, setFormDescEn] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  const categories = [
    'Mahafali & Sherehe',
    'Taaluma & Masomo',
    'Kikanisa & Misa',
    'Michezo & Utamaduni',
    'Ziara & Mazingira',
    'Ujumbe wa Mkuu wa Shule',
  ];

  const extractedId = extractYouTubeId(formYoutubeUrl);

  const openCreateModal = () => {
    setEditingVideo(null);
    setIsCreatingNew(true);
    setFormYoutubeUrl('');
    setFormTitleSw('');
    setFormTitleEn('');
    setFormCategory('Mahafali & Sherehe');
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormDuration('12:30');
    setFormDescSw('');
    setFormDescEn('');
    setFormFeatured(false);
    setUrlError(null);
  };

  const openEditModal = (video: SchoolVideo) => {
    setEditingVideo(video);
    setIsCreatingNew(false);
    setFormYoutubeUrl(video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`);
    setFormTitleSw(video.titleSw);
    setFormTitleEn(video.titleEn || video.titleSw);
    setFormCategory(video.category);
    setFormDate(video.date || new Date().toISOString().split('T')[0]);
    setFormDuration(video.duration || '10:00');
    setFormDescSw(video.descriptionSw || '');
    setFormDescEn(video.descriptionEn || '');
    setFormFeatured(Boolean(video.featured));
    setUrlError(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const videoId = extractYouTubeId(formYoutubeUrl);
    if (!videoId) {
      setUrlError('Tafadhali weka kiungo halali cha YouTube (URL au Video ID sahihi).');
      return;
    }

    if (!formTitleSw.trim()) return;

    const payload: SchoolVideo = {
      id: editingVideo ? editingVideo.id : `vid-${Date.now()}`,
      youtubeUrl: formYoutubeUrl.trim(),
      youtubeId: videoId,
      titleSw: formTitleSw.trim(),
      titleEn: formTitleEn.trim() || formTitleSw.trim(),
      category: formCategory,
      date: formDate,
      duration: formDuration.trim() || '10:00',
      descriptionSw: formDescSw.trim(),
      descriptionEn: formDescEn.trim() || formDescSw.trim(),
      featured: formFeatured,
      order: editingVideo?.order ?? schoolVideos.length + 1,
    };

    if (editingVideo) {
      updateSchoolVideo(payload);
      setSuccessToast('Video ya YouTube imesasishwa kikamilifu!');
    } else {
      addSchoolVideo(payload);
      setSuccessToast('Video mpya ya YouTube imeongezwa kikamilifu!');
    }

    setEditingVideo(null);
    setIsCreatingNew(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDelete = (id: string) => {
    deleteSchoolVideo(id);
    setDeleteConfirmId(null);
    setSuccessToast('Video imeondolewa kikamilifu!');
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const filteredVideos = schoolVideos.filter((v) => {
    const matchesSearch =
      v.titleSw.toLowerCase().includes(search.toLowerCase()) ||
      v.titleEn?.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || v.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 flex items-center justify-between text-xs font-bold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-700 hover:text-emerald-950">✕</button>
        </div>
      )}

      {/* Header with Title and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h3 className="text-base font-bold text-[#102A43] flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600" />
            <span>Usimamizi wa Video za YouTube (School YouTube Videos)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Weka na dhibiti video za shule (Mahafali, Misa, Michezo, Taaluma) kwa kutumia link za YouTube.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetSchoolVideosToDefaults}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Rejesha video za mwanzo"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rejesha Asili</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>Ongeza Video Mpya</span>
          </button>
        </div>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tafuta video kwa kichwa au kitengo..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-red-600"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none focus:ring-2 focus:ring-red-600 bg-white"
        >
          <option value="ALL">Vitengo Vyote ({schoolVideos.length})</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
          <Video className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-600">Hakuna video iliyopatikana</p>
          <p className="text-xs text-slate-400 mt-1">Bonyeza "Ongeza Video Mpya" kuweka video ya YouTube.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVideos.map((video) => {
            const thumb = getYouTubeThumbnail(video.youtubeId, 'hq');
            return (
              <div
                key={video.id}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={thumb}
                    alt={video.titleSw}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <button
                      onClick={() => setPreviewVideo(video)}
                      className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer"
                      title="Cheza Video (Play Preview)"
                    >
                      <Play className="w-5 h-5 fill-white ml-0.5" />
                    </button>
                  </div>

                  {/* Duration badge */}
                  {video.duration && (
                    <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded-md">
                      {video.duration}
                    </span>
                  )}

                  {/* Featured badge */}
                  {video.featured && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-md flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-3 h-3" />
                      <span>TEULE</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {video.category}
                      </span>
                      {video.date && (
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {video.date}
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#102A43] line-clamp-2 leading-snug">
                      {video.titleSw}
                    </h4>
                    {video.descriptionSw && (
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                        {video.descriptionSw}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <a
                      href={video.youtubeUrl || `https://www.youtube.com/watch?v=${video.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-red-600 hover:text-red-700 font-bold inline-flex items-center gap-1"
                    >
                      <span>YouTube</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openEditModal(video)}
                        className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 cursor-pointer"
                        title="Hariri Video"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(video.id)}
                        className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700 cursor-pointer"
                        title="Futa Video"
                      >
                        <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900 text-sm">Thibitisha Kufuta Video</h4>
              <p className="text-xs text-slate-500 mt-1">
                Una uhakika unataka kuondoa video hii kutoka kwenye tovuti ya shule?
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
              >
                Ghairi
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="flex-1 py-2 text-xs font-bold rounded-xl bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              >
                Ndio, Futa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
          <div className="bg-slate-950 rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" />
                <h4 className="font-bold text-white text-xs sm:text-sm line-clamp-1">
                  {previewVideo.titleSw}
                </h4>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={getYouTubeEmbedUrl(previewVideo.youtubeId, { autoplay: true })}
                title={previewVideo.titleSw}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Video Modal */}
      {(isCreatingNew || editingVideo) && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <h3 className="font-bold text-sm sm:text-base text-[#102A43] flex items-center gap-2">
                <Video className="w-5 h-5 text-red-600" />
                <span>{editingVideo ? 'Hariri Video ya YouTube' : 'Ongeza Video Mpya ya YouTube'}</span>
              </h3>
              <button
                onClick={() => {
                  setIsCreatingNew(false);
                  setEditingVideo(null);
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* YouTube URL input */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">
                  Kiungo cha YouTube (YouTube Link / URL) *
                </label>
                <input
                  type="text"
                  required
                  value={formYoutubeUrl}
                  onChange={(e) => {
                    setFormYoutubeUrl(e.target.value);
                    setUrlError(null);
                  }}
                  placeholder="Mfano: https://www.youtube.com/watch?v=dQw4w9WgXcQ au https://youtu.be/..."
                  className={`w-full p-2.5 rounded-xl border text-xs outline-none focus:ring-2 ${
                    urlError
                      ? 'border-red-400 focus:ring-red-500'
                      : extractedId
                      ? 'border-emerald-400 focus:ring-emerald-500'
                      : 'border-slate-300 focus:ring-red-600'
                  }`}
                />
                {urlError && <p className="text-red-500 text-[11px] mt-1 font-semibold">{urlError}</p>}
                {extractedId && (
                  <p className="text-emerald-700 text-[11px] mt-1 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>YouTube ID imetambuliwa: <code className="bg-emerald-100 px-1 py-0.5 rounded text-[10px]">{extractedId}</code></span>
                  </p>
                )}
              </div>

              {/* Live Preview */}
              {extractedId && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 block mb-2">Uhakiki wa Video (Live Preview):</span>
                  <div className="aspect-video max-w-xs mx-auto rounded-lg overflow-hidden border border-slate-300 bg-black">
                    <iframe
                      src={getYouTubeEmbedUrl(extractedId, { autoplay: false })}
                      title="Preview"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}

              {/* Title Swahili & English */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Kichwa cha Video (Kiswahili) *</label>
                  <input
                    type="text"
                    required
                    value={formTitleSw}
                    onChange={(e) => setFormTitleSw(e.target.value)}
                    placeholder="Mf: Mahafali ya 38 ya Kidato cha Nne"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Kichwa cha Video (English)</label>
                  <input
                    type="text"
                    value={formTitleEn}
                    onChange={(e) => setFormTitleEn(e.target.value)}
                    placeholder="e.g. 38th Form Four Graduation Ceremony"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Category, Date, Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Kitengo (Category)</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Tarehe ya Video</label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1 text-xs">Muda (Duration)</label>
                  <input
                    type="text"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    placeholder="Mf: 14:35 min"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="font-bold text-slate-700 block mb-1 text-xs">Maelezo Mafupi (Kiswahili)</label>
                <textarea
                  rows={2}
                  value={formDescSw}
                  onChange={(e) => setFormDescSw(e.target.value)}
                  placeholder="Maelezo kuhusu video hii na matukio yaliyomo..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Featured Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="featured-check"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="featured-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Weka kama Video Teule (Featured Video kwenye ukurasa wa mbele)
                </label>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingNew(false);
                    setEditingVideo(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer flex items-center gap-2"
                >
                  <span>{editingVideo ? 'Hifadhi Mabadiliko' : 'Chapisha Video'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
