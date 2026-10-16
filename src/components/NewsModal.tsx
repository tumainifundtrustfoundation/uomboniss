import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { SAVED_NEWS } from '../data/savedSchoolMedia';
import { NewsItem } from '../types';
import {
  Flame,
  X,
  Calendar,
  User,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  Share2,
  ChevronRight,
  Radio,
  Clock,
} from 'lucide-react';

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NewsModal: React.FC<NewsModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const { news } = useData();

  const newsList: NewsItem[] = useMemo(() => {
    if (Array.isArray(news) && news.length > 0) {
      return news;
    }
    return SAVED_NEWS;
  }, [news]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeArticle, setActiveArticle] = useState<NewsItem | null>(null);

  const categories = ['ALL', 'Taaluma', 'Matangazo', 'Michezo', 'Kikanisa', 'Uongozi'];

  const filteredNews = useMemo(() => {
    return newsList.filter((item) => {
      const matchCat =
        selectedCategory === 'ALL' || item.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        item.titleSw.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.excerptSw.toLowerCase().includes(q) ||
        item.excerptEn.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [newsList, selectedCategory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Animated Flaming Header Banner */}
        <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-amber-500 text-white p-5 sm:p-6 overflow-hidden shrink-0 shadow-md">
          {/* Ambient Flame Glow Effect */}
          <div className="absolute -right-8 -top-8 w-40 h-40 bg-yellow-300/30 rounded-full blur-2xl pointer-events-none animate-pulse" />
          <div className="absolute left-1/3 -bottom-8 w-32 h-32 bg-red-800/40 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {/* Pulsing Burning Flame Icon */}
              <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs border border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                <span className="absolute -inset-1 rounded-2xl bg-yellow-400 blur-xs opacity-60 animate-ping" />
                <Flame className="w-7 h-7 text-yellow-200 fill-yellow-400 animate-bounce drop-shadow-[0_0_10px_rgba(255,200,0,0.9)]" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>
                      {language === 'sw'
                        ? 'Habari Mpya & Matangazo ya Shule'
                        : 'Official News & Hot Announcements'}
                    </span>
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-yellow-400 text-slate-950 text-[10px] font-black uppercase tracking-wider animate-pulse shadow-xs">
                    🔥 LIVE
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-yellow-100 font-medium">
                  {language === 'sw'
                    ? 'Taarifa rasmi za kitaaluma, mitihani, michezo na maendeleo ya Shule ya Sekondari Uomboni.'
                    : 'Official updates on academics, exams, student sports, and campus activities at Uomboni.'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close news modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Article Reader Mode vs Grid List View */}
        {activeArticle ? (
          /* Full Article Reader */
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 bg-slate-50">
            <button
              onClick={() => setActiveArticle(null)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-[#102A43] hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
            >
              <span>← {language === 'sw' ? 'Rudi kwenye Orodha ya Habari' : 'Back to All News'}</span>
            </button>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider border border-orange-200">
                  {activeArticle.category}
                </span>
                <span className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {activeArticle.date}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {activeArticle.author || 'Ofisi ya Mkuu wa Shule'}
                </span>
              </div>

              <h2 className="font-serif text-xl sm:text-3xl font-bold text-[#102A43] leading-snug">
                {language === 'sw' ? activeArticle.titleSw : activeArticle.titleEn}
              </h2>

              {activeArticle.imageUrl && (
                <div className="rounded-2xl overflow-hidden max-h-[420px] bg-slate-900 shadow-inner">
                  <img
                    src={activeArticle.imageUrl}
                    alt={activeArticle.titleSw}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              )}

              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 pt-2">
                <p className="font-medium text-slate-800 text-base sm:text-lg">
                  {language === 'sw'
                    ? activeArticle.excerptSw
                    : activeArticle.excerptEn}
                </p>
                <div className="border-t border-slate-100 pt-4 whitespace-pre-line text-slate-600">
                  {language === 'sw'
                    ? activeArticle.contentSw
                    : activeArticle.contentEn}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* News Feed List & Search Controls */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Toolbar: Search & Category Pills */}
            <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={
                    language === 'sw'
                      ? 'Tafuta habari, matangazo, taaluma, mitihani...'
                      : 'Search news, announcements, academics...'
                  }
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-orange-500 shadow-2xs"
                />
              </div>

              {/* Category Filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:text-[#102A43] hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat === 'ALL' ? (language === 'sw' ? 'Zote' : 'All') : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* News Cards Grid */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 bg-slate-100/70">
              {filteredNews.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-500">
                  <p className="font-semibold text-sm">
                    {language === 'sw'
                      ? 'Hakuna habari inayolingana na utafutaji wako.'
                      : 'No news found matching your query.'}
                  </p>
                </div>
              ) : (
                filteredNews.map((item) => (
                  <article
                    key={item.id}
                    onClick={() => setActiveArticle(item)}
                    className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      {/* Thumbnail with hot badge */}
                      <div className="aspect-16/10 bg-slate-900 overflow-hidden relative">
                        <img
                          src={
                            item.imageUrl ||
                            '/media/media_6.webp'
                          }
                          alt={item.titleSw}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs border border-white/10">
                            {item.category}
                          </span>
                          {item.featured && (
                            <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600 to-amber-500 text-white text-[9px] font-black uppercase tracking-wider animate-pulse flex items-center gap-0.5 shadow-xs">
                              <Flame className="w-2.5 h-2.5 fill-yellow-200" />
                              <span>HOT</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Content excerpt */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono">
                          <Calendar className="w-3 h-3 text-amber-500" />
                          <span>{item.date}</span>
                        </div>

                        <h4 className="text-sm font-bold text-[#102A43] group-hover:text-orange-600 transition-colors leading-snug line-clamp-2">
                          {language === 'sw' ? item.titleSw : item.titleEn}
                        </h4>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {language === 'sw' ? item.excerptSw : item.excerptEn}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-0 flex items-center justify-between text-xs font-bold text-orange-600 group-hover:text-orange-700">
                      <span>{language === 'sw' ? 'Soma Zaidi' : 'Read Full Story'}</span>
                      <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </article>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
