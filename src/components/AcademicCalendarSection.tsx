import React, { useState, useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useData } from '../context/DataContext';
import { AcademicCalendarEvent } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Award,
  BookOpen,
  Sun,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  Search,
  Filter,
  Share2,
  Check,
  ChevronRight,
  GraduationCap,
  CalendarDays,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { downloadAcademicCalendarPdf, downloadCalendarIcsFile } from '../utils/pdfService';

interface AcademicCalendarSectionProps {
  onOpenApply?: () => void;
  onOpenAcademicPortal?: () => void;
}

export const AcademicCalendarSection: React.FC<AcademicCalendarSectionProps> = ({
  onOpenApply,
  onOpenAcademicPortal
}) => {
  const { language } = useLanguage();
  const { academicCalendar } = useData();

  const [selectedTerm, setSelectedTerm] = useState<'All' | 'Term 1' | 'Term 2'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedTarget, setSelectedTarget] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedEventId, setCopiedEventId] = useState<string | null>(null);

  // Categories config
  const categories = [
    { id: 'ALL', labelSw: 'Matukio Yote', labelEn: 'All Events' },
    { id: 'NECTA', labelSw: 'Mitihani ya NECTA', labelEn: 'NECTA Exams' },
    { id: 'Term Dates', labelSw: 'Kufungua & Kufunga', labelEn: 'Term Start/End' },
    { id: 'Internal Exams', labelSw: 'Mitihani ya Ndani & Mock', labelEn: 'Mock & Terminal Exams' },
    { id: 'Holidays', labelSw: 'Likizo & Mapumziko', labelEn: 'Holidays & Breaks' },
    { id: 'School Events', labelSw: 'Mikutano & Mahafali', labelEn: 'Meetings & Graduation' },
    { id: 'Admissions', labelSw: 'Udahili & Kidato cha 1', labelEn: 'Admissions & Form 1' },
  ];

  // Target groups config
  const targetGroups = [
    { id: 'ALL', labelSw: 'Wanafunzi Wote', labelEn: 'All Audiences' },
    { id: 'Form 4', labelSw: 'Kidato cha 4 (CSEE)', labelEn: 'Form 4 (CSEE)' },
    { id: 'Form 2', labelSw: 'Kidato cha 2 (FTNA)', labelEn: 'Form 2 (FTNA)' },
    { id: 'Form 1', labelSw: 'Kidato cha 1', labelEn: 'Form 1' },
    { id: 'Parents & Teachers', labelSw: 'Wazazi & Walimu', labelEn: 'Parents & Teachers' },
  ];

  // Filter logic
  const filteredEvents = useMemo(() => {
    return academicCalendar.filter((event) => {
      // Term filter
      if (selectedTerm !== 'All' && event.term !== selectedTerm && event.term !== 'All Year') {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && event.category !== selectedCategory) {
        return false;
      }

      // Target audience filter
      if (selectedTarget !== 'ALL') {
        if (selectedTarget === 'Parents & Teachers' && event.targetAudience !== 'Parents & Teachers') {
          return false;
        }
        if (selectedTarget !== 'Parents & Teachers' && event.targetAudience !== 'All Forms' && event.targetAudience !== selectedTarget) {
          return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = (event.titleSw + ' ' + event.titleEn).toLowerCase().includes(q);
        const matchDesc = (event.descriptionSw + ' ' + event.descriptionEn).toLowerCase().includes(q);
        const matchLoc = event.location.toLowerCase().includes(q);
        const matchDate = (event.startDate + ' ' + (event.endDate || '')).toLowerCase().includes(q);
        const matchCat = event.category.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchLoc || matchDate || matchCat;
      }

      return true;
    });
  }, [academicCalendar, selectedTerm, selectedCategory, selectedTarget, searchQuery]);

  // Statistics calculation
  const totalEventsCount = academicCalendar.length;
  const nectaEventsCount = academicCalendar.filter((e) => e.category === 'NECTA').length;
  const term1EventsCount = academicCalendar.filter((e) => e.term === 'Term 1').length;
  const term2EventsCount = academicCalendar.filter((e) => e.term === 'Term 2').length;

  // Next upcoming event finder
  const todayStr = '2026-08-25'; // Match current system date
  const upcomingEvents = academicCalendar
    .filter((e) => e.startDate >= todayStr || (e.endDate && e.endDate >= todayStr))
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const nextMajorEvent = upcomingEvents[0] || academicCalendar[0];

  // Handle share / copy single event
  const handleShareEvent = (event: AcademicCalendarEvent) => {
    const text = `${event.titleSw} (${event.startDate}${event.endDate ? ` hadi ${event.endDate}` : ''}) - Shule ya Sekondari Uomboni Marangu`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedEventId(event.id);
      setTimeout(() => setCopiedEventId(null), 2500);
    }
  };

  // Category Icon & Badge Styling helper
  const getCategoryStyles = (category: AcademicCalendarEvent['category']) => {
    switch (category) {
      case 'NECTA':
        return {
          badgeBg: 'bg-blue-50 text-[#0b2545] border-blue-200',
          iconBg: 'bg-[#0b2545] text-white',
          lineColor: 'border-blue-400',
          icon: GraduationCap,
          tag: 'NECTA National Exam',
        };
      case 'Term Dates':
        return {
          badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
          iconBg: 'bg-blue-800 text-white',
          lineColor: 'border-blue-500',
          icon: CalendarDays,
          tag: 'Term Reopening / Closing',
        };
      case 'Internal Exams':
        return {
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
          iconBg: 'bg-blue-700 text-white',
          lineColor: 'border-blue-400',
          icon: BookOpen,
          tag: 'Internal & Mock Exams',
        };
      case 'Holidays':
        return {
          badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBg: 'bg-slate-700 text-white',
          lineColor: 'border-slate-300',
          icon: Sun,
          tag: 'School Vacation',
        };
      case 'School Events':
        return {
          badgeBg: 'bg-blue-50 text-[#0b2545] border-blue-200',
          iconBg: 'bg-[#0b2545] text-white',
          lineColor: 'border-blue-300',
          icon: Users,
          tag: 'Ceremony / Meeting',
        };
      case 'Admissions':
        return {
          badgeBg: 'bg-blue-50 text-blue-900 border-blue-200',
          iconBg: 'bg-blue-800 text-white',
          lineColor: 'border-blue-400',
          icon: Sparkles,
          tag: 'Admissions & Induction',
        };
      default:
        return {
          badgeBg: 'bg-slate-100 text-slate-900 border-slate-200',
          iconBg: 'bg-slate-700 text-white',
          lineColor: 'border-slate-300',
          icon: Calendar,
          tag: 'Academic Event',
        };
    }
  };

  return (
    <section id="calendar" className="py-16 sm:py-24 bg-slate-50 border-b border-slate-200 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#0b2545] text-xs font-bold border border-blue-200 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-blue-800" />
            <span>
              {language === 'sw'
                ? 'Mwaka wa Masomo 2026 • Jimbo Katoliki Moshi'
                : 'Academic Year 2026 • Catholic Diocese of Moshi'}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 tracking-tight">
            {language === 'sw' ? 'Kalenda Rasmi ya Kitaaluma & Ratiba ya NECTA' : 'Official Academic Calendar & NECTA Timetable'}
          </h2>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {language === 'sw'
              ? 'Ratiba kamili ya tarehe za kufungua na kufunga shule, mitihani ya Taifa (CSEE & FTNA), mitihani ya Mock ya Kanda, likizo za nusu muhula, na mikutano mikuu ya wazazi.'
              : 'Complete schedule of term dates, national examinations (NECTA CSEE & FTNA), zonal mocks, holidays, and general parents assemblies.'}
          </p>
        </div>

        {/* Top Summary Cards (Quick Stats & Next Milestone) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Milestones */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0b2545] flex items-center justify-center shrink-0 border border-blue-100">
              <CalendarDays className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">{totalEventsCount}</div>
              <div className="text-xs font-semibold text-slate-500">
                {language === 'sw' ? 'Matukio ya Mwaka' : 'Annual Milestones'}
              </div>
            </div>
          </div>

          {/* Card 2: NECTA Exam Blocks */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0b2545] flex items-center justify-center shrink-0 border border-blue-100">
              <GraduationCap className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-900">Form 2 & 4</div>
              <div className="text-xs font-semibold text-slate-500">
                {language === 'sw' ? 'Mitihani ya Taifa (NECTA)' : 'National Examinations'}
              </div>
            </div>
          </div>

          {/* Card 3: Terms Breakdown */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#0b2545] flex items-center justify-center shrink-0 border border-blue-100">
              <Layers className="w-6 h-6 text-blue-800" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-900">Muhula 1: {term1EventsCount} | Muhula 2: {term2EventsCount}</div>
              <div className="text-xs font-semibold text-slate-500">
                {language === 'sw' ? 'Ugawaji wa Mihula' : 'Term Distribution'}
              </div>
            </div>
          </div>

          {/* Card 4: Next Major Milestone */}
          {nextMajorEvent && (
            <div className="bg-[#0b2545] text-white p-5 rounded-xl shadow-xs flex flex-col justify-between border border-blue-900">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-800 text-white">
                  {language === 'sw' ? 'Tukio Linalofuata' : 'Next Milestone'}
                </span>
                <span className="text-[11px] font-mono text-blue-200 font-bold">{nextMajorEvent.startDate}</span>
              </div>
              <div className="mt-2">
                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {language === 'sw' ? nextMajorEvent.titleSw : nextMajorEvent.titleEn}
                </h4>
                <p className="text-[11px] text-blue-200 line-clamp-1 mt-0.5">{nextMajorEvent.location}</p>
              </div>
            </div>
          )}
        </div>

        {/* Global Toolbar: Search & Action Buttons */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'sw'
                  ? 'Tafuta mtihani, tarehe, kidato, au tukio (mf. NECTA, Mock, Likizo, Form 4)...'
                  : 'Search by exam, date, form, or milestone (e.g. NECTA, Mock, Break, Form 4)...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-900/20 focus:border-[#0b2545] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 px-1.5 py-0.5 rounded cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* Download & Export Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Download Calendar PDF */}
            <button
              type="button"
              onClick={() => downloadAcademicCalendarPdf(filteredEvents, '2026', language)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-[#0b2545] hover:bg-blue-900 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Pakua Kalenda Kamili ya PDF"
            >
              <Download className="w-4 h-4 text-white" />
              <span>{language === 'sw' ? 'Pakua PDF' : 'Download PDF'}</span>
            </button>

            {/* Sync / Export All ICS */}
            <button
              type="button"
              onClick={() => downloadCalendarIcsFile(academicCalendar, 'Kalenda_Uomboni_2026.ics')}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-blue-800 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
              title="Ongeza matukio yote kwenye Google au Apple Calendar"
            >
              <Calendar className="w-4 h-4 text-white" />
              <span>{language === 'sw' ? 'Hifadhi (.ICS)' : 'Add to Calendar'}</span>
            </button>

            {/* Print Window */}
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Chapisha Ratiba Hii"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{language === 'sw' ? 'Chapisha' : 'Print'}</span>
            </button>
          </div>
        </div>

        {/* Filter Tabs Section */}
        <div className="space-y-3">
          {/* Term Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0 mr-1">
              <Filter className="w-3.5 h-3.5 text-[#0b2545]" />
              <span>{language === 'sw' ? 'Muhula:' : 'Term:'}</span>
            </span>

            {(['All', 'Term 1', 'Term 2'] as const).map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSelectedTerm(term)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTerm === term
                    ? 'bg-[#0b2545] text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {term === 'All'
                  ? language === 'sw'
                    ? 'Mihula Yote (Mwaka Mzima)'
                    : 'All Terms (Full Year)'
                  : term === 'Term 1'
                  ? language === 'sw'
                    ? 'Muhula wa 1 (Jan - Jun)'
                    : 'Term 1 (Jan - Jun)'
                  : language === 'sw'
                  ? 'Muhula wa 2 (Jul - Des)'
                  : 'Term 2 (Jul - Dec)'}
              </button>
            ))}
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">
              {language === 'sw' ? 'Aina ya Tukio:' : 'Category:'}
            </span>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#0b2545] text-white shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {language === 'sw' ? cat.labelSw : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Target Audience Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1">
              {language === 'sw' ? 'Walengwa:' : 'Audience:'}
            </span>
            {targetGroups.map((target) => (
              <button
                key={target.id}
                type="button"
                onClick={() => setSelectedTarget(target.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  selectedTarget === target.id
                    ? 'bg-blue-800 text-white font-bold shadow-2xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {language === 'sw' ? target.labelSw : target.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline View Container */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 space-y-4 max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'sw' ? 'Hakuna Matukio Yaliyopatikana' : 'No Events Found'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {language === 'sw'
                  ? 'Jaribu kubadilisha vigezo vya utafutaji au weka vichujio kwenye "Matukio Yote".'
                  : 'Try adjusting your search query or reset the filters to see all academic dates.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedTerm('All');
                setSelectedCategory('ALL');
                setSelectedTarget('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-lg bg-[#0b2545] text-white text-xs font-bold hover:bg-blue-900 transition-colors cursor-pointer"
            >
              {language === 'sw' ? 'Rejesha Vichujio Zote' : 'Reset All Filters'}
            </button>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline Center Connecting Line for Desktop */}
            <div className="hidden md:block absolute left-8 lg:left-1/2 top-4 bottom-4 w-0.5 bg-slate-200 -translate-x-1/2"></div>

            {/* Event Cards List */}
            <div className="space-y-6 md:space-y-10">
              {filteredEvents.map((event, index) => {
                const style = getCategoryStyles(event.category);
                const IconComponent = style.icon;
                const isEven = index % 2 === 0;

                // Format friendly dates
                const startObj = new Date(event.startDate);
                const monthNamesSw = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ago', 'Sep', 'Okt', 'Nov', 'Des'];
                const monthNamesEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const monthStr = (language === 'sw' ? monthNamesSw : monthNamesEn)[startObj.getMonth()] || '';
                const dayStr = startObj.getDate();

                return (
                  <div
                    key={event.id}
                    className={`relative flex flex-col md:flex-row items-start ${
                      isEven ? 'md:flex-row-reverse' : ''
                    } gap-4 md:gap-8 group`}
                  >
                    {/* Center Timeline Node Marker */}
                    <div className="hidden md:flex absolute left-8 lg:left-1/2 top-6 -translate-x-1/2 items-center justify-center z-10">
                      <div
                        className={`w-10 h-10 rounded-full ${style.iconBg} flex items-center justify-center shadow-xs ring-4 ring-white transition-transform`}
                      >
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Timeline Event Card (Spans half width on desktop) */}
                    <div className="w-full md:w-[calc(50%-2rem)] bg-white rounded-xl border border-slate-200 hover:border-blue-500/50 shadow-xs transition-all p-5 sm:p-6 space-y-4">
                      {/* Card Header with Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        {/* Date Ribbon Badge */}
                        <div className="flex items-center gap-2">
                          <div className="w-11 h-11 rounded-lg bg-[#0b2545] text-white flex flex-col items-center justify-center shrink-0 shadow-2xs">
                            <span className="text-[10px] font-mono uppercase font-bold text-blue-200 leading-none">
                              {monthStr}
                            </span>
                            <span className="text-sm font-bold leading-none mt-0.5">{dayStr}</span>
                          </div>

                          <div>
                            <div className="font-mono text-xs font-bold text-slate-900">
                              {event.startDate}
                              {event.endDate && ` — ${event.endDate}`}
                            </div>
                            <div className="text-[10px] font-semibold text-slate-500">
                              {event.term === 'All Year'
                                ? language === 'sw'
                                  ? 'Mwaka Mzima'
                                  : 'Full Year'
                                : event.term === 'Term 1'
                                ? language === 'sw'
                                  ? 'Muhula wa 1'
                                  : 'Term 1'
                                : language === 'sw'
                                ? 'Muhula wa 2'
                                : 'Term 2'}
                            </div>
                          </div>
                        </div>

                        {/* Category & Status Pill */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${style.badgeBg}`}>
                            {language === 'sw'
                              ? categories.find((c) => c.id === event.category)?.labelSw || event.category
                              : categories.find((c) => c.id === event.category)?.labelEn || event.category}
                          </span>

                          {event.status === 'Completed' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-slate-400" />
                              <span>{language === 'sw' ? 'Imekamilika' : 'Completed'}</span>
                            </span>
                          ) : event.status === 'In Progress' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-900 animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-700"></span>
                              <span>{language === 'sw' ? 'Inaendelea Sasa' : 'In Progress'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#0b2545] flex items-center gap-1 border border-blue-200">
                              <Calendar className="w-3 h-3 text-blue-800" />
                              <span>{language === 'sw' ? 'Inakuja' : 'Upcoming'}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Event Title */}
                      <div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug group-hover:text-[#0b2545] transition-colors">
                          {language === 'sw' ? event.titleSw : event.titleEn}
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                          {language === 'sw' ? event.descriptionSw : event.descriptionEn}
                        </p>
                      </div>

                      {/* Important Notice Callout if flagged */}
                      {event.importantNotice && (
                        <div className="p-3 rounded-lg bg-blue-50/80 border border-blue-200 flex items-start gap-2 text-slate-800 text-xs">
                          <AlertCircle className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                          <div>
                            <span className="font-bold text-[#0b2545]">
                              {language === 'sw' ? 'Tanbihi Muhimu:' : 'Important Notice:'}{' '}
                            </span>
                            <span>
                              {language === 'sw'
                                ? 'Wanafunzi wote wanatakiwa kufuata masharti ya sare, ada kamili na nidhamu ya kambi.'
                                : 'All students must strictly observe school dress code, fee clearance, and boarding regulations.'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Event Meta: Location, Time & Target */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3.5 h-3.5 text-[#0b2545] shrink-0" />
                            <span className="truncate max-w-[180px]">{event.location}</span>
                          </div>

                          {event.time && (
                            <div className="flex items-center gap-1 text-slate-500">
                              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{event.time}</span>
                            </div>
                          )}
                        </div>

                        <span className="font-mono font-bold text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                          {event.targetAudience}
                        </span>
                      </div>

                      {/* Interactive Buttons for single event */}
                      <div className="pt-2 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => downloadCalendarIcsFile(event, `${event.titleSw.replace(/[^a-zA-Z0-9]/g, '_')}.ics`)}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-[#0b2545] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-blue-200"
                        >
                          <Calendar className="w-3.5 h-3.5 text-blue-800" />
                          <span>{language === 'sw' ? 'Weka Kikumbusho (.ics)' : 'Add Reminder'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleShareEvent(event)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 text-[11px] font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="Nakili Maelezo ya Tukio"
                        >
                          {copiedEventId === event.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-blue-700" />
                              <span className="text-blue-800 font-bold">{language === 'sw' ? 'Imenakiliwa!' : 'Copied!'}</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5 text-slate-400" />
                              <span>{language === 'sw' ? 'Shiriki' : 'Share'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Banner: Candidate & Parent Direct Links */}
        <div className="bg-[#0b2545] rounded-xl p-6 sm:p-8 text-white border border-blue-900 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-bold border border-blue-700">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              <span>{language === 'sw' ? 'Mwongozo wa Watahiniwa & Wazazi' : 'Candidate & Parents Portal Guidance'}</span>
            </div>
            <h4 className="text-lg sm:text-2xl font-bold text-white">
              {language === 'sw'
                ? 'Unahitaji Ratiba Maalum ya Masomo au Matokeo ya NECTA?'
                : 'Looking for Timetables or NECTA Examination Results?'}
            </h4>
            <p className="text-xs sm:text-sm text-blue-200 max-w-2xl">
              {language === 'sw'
                ? 'Pakua ratiba za vipindi vya kila siku vya Kidato cha 1 hadi cha 4, au tembelea Lango la Matokeo kuthibitisha ufaulu wa mitihani ya Mock na NECTA.'
                : 'Access daily class timetables from Form 1 to Form 4, or visit the Results Portal to review mock and national exam achievements.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
            {onOpenApply && (
              <button
                type="button"
                onClick={onOpenApply}
                className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
              >
                <span>{language === 'sw' ? 'Omba Kujiunga 2026' : 'Apply for Admission 2026'}</span>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
