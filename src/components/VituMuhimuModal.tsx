import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  VITU_MUHIMU_CATEGORIES,
  VITU_MUHIMU_LIST,
  VITU_MUHIMU_IMPORTANT_NOTES,
  VituMuhimuItem,
} from '../data/vituMuhimuData';
import { SchoolLogo } from './SchoolLogo';
import { downloadVituMuhimuPdf, printVituMuhimuDirectly } from '../utils/pdfService';
import {
  X,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Shirt,
  BedDouble,
  FileCheck,
  Search,
  Sparkles,
  Phone,
  Layers,
  CheckSquare,
  Square,
  Share2,
  Calendar,
  ShieldCheck,
} from 'lucide-react';

interface VituMuhimuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenApply?: () => void;
}

export const VituMuhimuModal: React.FC<VituMuhimuModalProps> = ({
  isOpen,
  onClose,
  onOpenApply,
}) => {
  const { language } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>({});
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const toggleCheck = (id: string) => {
    setCheckedItemIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredItems = VITU_MUHIMU_LIST.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      item.nameSw.toLowerCase().includes(q) ||
      item.nameEn.toLowerCase().includes(q) ||
      (item.specSw && item.specSw.toLowerCase().includes(q)) ||
      (item.specEn && item.specEn.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const checkedCount = Object.values(checkedItemIds).filter(Boolean).length;
  const totalItems = VITU_MUHIMU_LIST.length;
  const progressPercent = Math.round((checkedCount / totalItems) * 100);

  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case 'academic':
        return <BookOpen className="w-4 h-4" />;
      case 'uniform':
        return <Shirt className="w-4 h-4" />;
      case 'boarding':
        return <BedDouble className="w-4 h-4" />;
      case 'documents':
        return <FileCheck className="w-4 h-4" />;
      case 'prohibited':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Layers className="w-4 h-4" />;
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'Vitu Muhimu vya Kujiunga - Uomboni Secondary School',
          text: 'Tazama orodha kamili ya vitu na mahitaji muhimu ya kujiunga na Shule ya Sekondari Uomboni (NECTA S0486), Marangu - Moshi.',
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#FFFFF0] rounded-2xl sm:rounded-3xl max-w-5xl w-full max-h-[94vh] flex flex-col shadow-2xl border-2 border-[#102A43]/20 overflow-hidden text-[#102A43]">
        {/* Top Header Bar */}
        <div className="bg-[#102A43] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#C9A227]/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-xl shrink-0 shadow-sm">
              <SchoolLogo size="sm" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
                  NECTA REG: S0486
                </span>
                <span className="text-[10px] text-emerald-300 hidden sm:inline-block">
                  Marangu, Moshi - Kilimanjaro
                </span>
              </div>
              <h3 className="font-serif text-base sm:text-xl font-bold text-white tracking-tight leading-tight mt-0.5">
                {language === 'sw'
                  ? 'Vitu Muhimu vya Kujiunga na Shule'
                  : 'Essential Joining Requirements & Checklist'}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title="Share"
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action & Stats Strip */}
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border-b border-amber-200/60 p-3 sm:px-6 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-700">
              {language === 'sw' ? 'Maendeleo ya Maandalizi:' : 'Checklist Progress:'}{' '}
              <span className="font-black text-[#102A43]">
                {checkedCount} / {totalItems} ({progressPercent}%)
              </span>
            </div>
            <div className="w-24 sm:w-36 h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => printVituMuhimuDirectly()}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-[#102A43] text-xs font-bold border border-slate-300 shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-[#C9A227]" />
              <span className="hidden sm:inline">{language === 'sw' ? 'Chapisha' : 'Print'}</span>
            </button>

            <button
              onClick={() => downloadVituMuhimuPdf()}
              className="px-3.5 py-1.5 rounded-lg bg-[#102A43] hover:bg-[#0b2545] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'sw' ? 'Pakua Orodha (PDF)' : 'Download PDF'}</span>
            </button>

            {onOpenApply && (
              <button
                onClick={() => {
                  onClose();
                  onOpenApply();
                }}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black shadow-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{language === 'sw' ? 'Omba Udahili' : 'Apply Now'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="p-3 sm:px-6 bg-white border-b border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  language === 'sw'
                    ? 'Tafuta kifaa mf. daftari, shuka, godoro, sare...'
                    : 'Search items e.g., books, uniform, mattress, trunk...'
                }
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#102A43] focus:ring-1 focus:ring-[#102A43] outline-hidden text-slate-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700 text-xs"
                >
                  ✕
                </button>
              )}
            </div>

            {copiedLink && (
              <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200 animate-in fade-in">
                ✓ Kiungo kimenakiliwa!
              </span>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {VITU_MUHIMU_CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              const count =
                cat.id === 'all'
                  ? VITU_MUHIMU_LIST.length
                  : VITU_MUHIMU_LIST.filter((i) => i.category === cat.id).length;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                    isSelected
                      ? cat.id === 'prohibited'
                        ? 'bg-rose-700 text-white shadow-xs'
                        : 'bg-[#102A43] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {getCategoryIcon(cat.id)}
                  <span>{language === 'sw' ? cat.titleSw : cat.titleEn}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-6">
          {/* Important Alert Notice */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-black text-amber-900">
              <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                {language === 'sw'
                  ? 'MAELEKEZO MUHIMU KWA MZAZI NA MWANAFUNZI:'
                  : 'IMPORTANT INSTRUCTIONS FOR PARENTS & STUDENTS:'}
              </span>
            </div>
            <p className="leading-relaxed text-slate-700">
              {language === 'sw'
                ? VITU_MUHIMU_IMPORTANT_NOTES.markingItemsSw
                : VITU_MUHIMU_IMPORTANT_NOTES.markingItemsEn}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-slate-600 text-[11px]">
              <div>
                •{' '}
                <strong>
                  {language === 'sw' ? 'Muda wa Kuripoti:' : 'Reporting Time:'}
                </strong>{' '}
                {language === 'sw'
                  ? VITU_MUHIMU_IMPORTANT_NOTES.reportingTimeSw
                  : VITU_MUHIMU_IMPORTANT_NOTES.reportingTimeEn}
              </div>
              <div>
                •{' '}
                <strong>
                  {language === 'sw' ? 'Pesa ya Matumizi:' : 'Pocket Money:'}
                </strong>{' '}
                {language === 'sw'
                  ? VITU_MUHIMU_IMPORTANT_NOTES.pocketMoneySw
                  : VITU_MUHIMU_IMPORTANT_NOTES.pocketMoneyEn}
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredItems.map((item) => {
              const isChecked = !!checkedItemIds[item.id];
              const isProhibited = item.category === 'prohibited';

              return (
                <div
                  key={item.id}
                  onClick={() => !isProhibited && toggleCheck(item.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                    isProhibited
                      ? 'bg-rose-50/70 border-rose-200 hover:border-rose-400'
                      : isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-[#102A43]/40 hover:shadow-xs'
                  }`}
                >
                  {/* Checkbox Icon */}
                  {!isProhibited ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleCheck(item.id);
                      }}
                      className="mt-0.5 shrink-0 text-slate-400 hover:text-emerald-600 focus:outline-hidden"
                    >
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-300" />
                      )}
                    </button>
                  ) : (
                    <div className="mt-0.5 shrink-0 text-rose-600">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  )}

                  {/* Details */}
                  <div className="space-y-1 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4
                        className={`font-bold text-xs sm:text-sm leading-snug ${
                          isProhibited
                            ? 'text-rose-900 font-black'
                            : isChecked
                            ? 'text-emerald-950 line-through opacity-85'
                            : 'text-[#102A43]'
                        }`}
                      >
                        {language === 'sw' ? item.nameSw : item.nameEn}
                      </h4>

                      {item.quantity && (
                        <span className="shrink-0 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                          {item.quantity}
                        </span>
                      )}
                    </div>

                    {(item.specSw || item.specEn) && (
                      <p
                        className={`text-[11px] sm:text-xs leading-relaxed ${
                          isProhibited ? 'text-rose-700' : 'text-slate-600'
                        }`}
                      >
                        {language === 'sw' ? item.specSw : item.specEn}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {item.mandatory && !isProhibited && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          {language === 'sw' ? 'Lazima' : 'Mandatory'}
                        </span>
                      )}
                      {isProhibited && (
                        <span className="text-[10px] font-black uppercase text-rose-800 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                          {language === 'sw' ? 'Marufuku Kabisa' : 'Strictly Prohibited'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 space-y-2">
              <p className="text-sm text-slate-500">
                {language === 'sw'
                  ? 'Hakuna kifaa kilichopatikana kwa utafutaji wako.'
                  : 'No items found matching your search.'}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-[#102A43] underline cursor-pointer"
              >
                {language === 'sw' ? 'Onyesha vitu vyote' : 'Show all items'}
              </button>
            </div>
          )}

          {/* Contacts Footer for Joining Enquiries */}
          <div className="p-4 rounded-2xl bg-[#102A43] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-[11px] font-mono text-amber-300 uppercase tracking-wider block font-bold">
                {language === 'sw' ? 'Una swali kuhusu mahitaji ya shule?' : 'Questions about school requirements?'}
              </span>
              <p className="text-xs text-slate-200">
                Wasiliana na Idara ya Udahili na Malezi ya Shule ya Sekondari Uomboni moja kwa moja.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <a
                href="tel:+255782558127"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+255 782 558 127</span>
              </a>
              <a
                href="tel:+255752717191"
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-mono font-bold flex items-center gap-1.5 border border-white/20 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>+255 752 717 191</span>
              </a>
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="p-3 sm:px-6 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-slate-500 font-sans">
            <span>Uomboni Secondary School • Marangu, Moshi</span> •{' '}
            <span className="font-bold text-amber-700">Motto: Tujiendeleze Sisi Wenyewe</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
            >
              {language === 'sw' ? 'Funga' : 'Close'}
            </button>
            <button
              onClick={() => downloadVituMuhimuPdf()}
              className="px-5 py-2 rounded-xl bg-[#102A43] hover:bg-[#0b2545] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'sw' ? 'Pakua PDF Rasmi' : 'Download Official PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
