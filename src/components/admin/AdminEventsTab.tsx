import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolEvent } from '../../types';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Sparkles,
  MapPin,
  Clock,
  RotateCcw
} from 'lucide-react';

export const AdminEventsTab: React.FC = () => {
  const { language } = useLanguage();
  const { events, addEvent, updateEvent, deleteEvent, resetEventsToDefaults } = useData();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [titleSw, setTitleSw] = useState('');
  const [titleEn, setTitleEn] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('Ukumbi Mkuu wa Shule');
  const [descriptionSw, setDescriptionSw] = useState('');
  const [descriptionEn, setDescriptionEn] = useState('');
  const [category, setCategory] = useState<SchoolEvent['category']>('Taaluma');

  const resetForm = () => {
    setTitleSw('');
    setTitleEn('');
    setDate('');
    setTime('');
    setLocation('Ukumbi Mkuu wa Shule');
    setDescriptionSw('');
    setDescriptionEn('');
    setCategory('Taaluma');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (ev: SchoolEvent) => {
    setEditingId(ev.id);
    setTitleSw(ev.titleSw);
    setTitleEn(ev.titleEn);
    setDate(ev.date);
    setTime(ev.time);
    setLocation(ev.location);
    setDescriptionSw(ev.descriptionSw);
    setDescriptionEn(ev.descriptionEn);
    setCategory(ev.category);
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleSw.trim() || !date.trim()) return;

    if (editingId) {
      updateEvent({
        id: editingId,
        titleSw: titleSw.trim(),
        titleEn: titleEn.trim() || titleSw.trim(),
        date: date.trim(),
        time: time.trim() || 'Saa 2:30 Asubuhi',
        location: location.trim() || 'Shuleni Uomboni',
        descriptionSw: descriptionSw.trim(),
        descriptionEn: descriptionEn.trim() || descriptionSw.trim(),
        category
      });
    } else {
      const newEv: SchoolEvent = {
        id: `event-${Date.now()}`,
        titleSw: titleSw.trim(),
        titleEn: titleEn.trim() || titleSw.trim(),
        date: date.trim(),
        time: time.trim() || 'Saa 2:30 Asubuhi',
        location: location.trim() || 'Shuleni Uomboni',
        descriptionSw: descriptionSw.trim(),
        descriptionEn: descriptionEn.trim() || descriptionSw.trim(),
        category
      };
      addEvent(newEv);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {language === 'sw' ? 'Matukio Muhimu ya Shule (School Events)' : 'School Events Management'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'sw'
              ? 'Ongeza na hariri mikutano ya wazazi, mahafali, siku ya michezo, na matukio ya kikanisa.'
              : 'Add and edit parent meetings, graduations, sports days, and patron saint celebrations.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'sw' ? 'Ongeza Tukio Jipya' : 'Add New Event'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm(language === 'sw' ? 'Rejesha matukio ya awali?' : 'Reset events to defaults?')) {
                resetEventsToDefaults();
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Rejesha Awali' : 'Reset'}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-slate-900 p-6 rounded-2xl border border-emerald-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {editingId
                ? (language === 'sw' ? 'Hariri Taarifa za Tukio' : 'Edit Event')
                : (language === 'sw' ? 'Sajili Tukio Jipya la Shule' : 'Add New Event')}
            </h4>
            <button
              type="button"
              onClick={resetForm}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Kichwa cha Tukio (Kiswahili) *' : 'Event Title (Swahili) *'}
              </label>
              <input
                type="text"
                required
                value={titleSw}
                onChange={(e) => setTitleSw(e.target.value)}
                placeholder="mf. Mkutano Mkuu wa Wazazi na Walimu (PTA)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Kategoria ya Tukio *' : 'Event Category *'}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as SchoolEvent['category'])}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Taaluma">Taaluma (Academic)</option>
                <option value="Kikanisa">Kikanisa / Dini (Church / Spiritual)</option>
                <option value="Wazazi">Wazazi / PTA (Parents)</option>
                <option value="Michezo">Michezo & Utamaduni (Sports)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Tarehe ya Tukio *' : 'Date *'}
              </label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="mf. 25 Machi, 2026 au 2026-03-25"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Muda wa Kuanza' : 'Time'}
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="mf. Saa 3:00 Asubuhi - Saa 8:00 Mchana"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Eneo la Tukio' : 'Venue / Location'}
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="mf. Ukumbi Mkuu wa Mt. Joseph, Uomboni"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Maelezo ya Tukio (Kiswahili)' : 'Event Description (Swahili)'}
              </label>
              <textarea
                rows={2}
                value={descriptionSw}
                onChange={(e) => setDescriptionSw(e.target.value)}
                placeholder="mf. Wazazi wote wanakaribishwa kujadili maendeleo ya taaluma ya watoto wao na miradi ya shule."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              {language === 'sw' ? 'Ghairi' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? (language === 'sw' ? 'Sasisha Tukio' : 'Update Event') : (language === 'sw' ? 'Hifadhi Tukio' : 'Save Event')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Events List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-800/60">
                  {ev.category}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(ev)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Hariri' : 'Edit'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'sw' ? `Futa tukio "${ev.titleSw}"?` : `Delete "${ev.titleSw}"?`)) {
                        deleteEvent(ev.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Futa' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h4 className="text-sm font-black text-white mt-2 leading-snug">{ev.titleSw}</h4>

              <div className="mt-3 space-y-1 text-xs text-slate-400 font-medium">
                <div className="flex items-center gap-1.5 text-amber-300">
                  <Calendar className="w-3.5 h-3.5 shrink-0" />
                  <span>{ev.date}</span>
                </div>
                {ev.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>{ev.time}</span>
                  </div>
                )}
                {ev.location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-500" />
                    <span>{ev.location}</span>
                  </div>
                )}
              </div>

              {ev.descriptionSw && (
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5 line-clamp-2">
                  {ev.descriptionSw}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
