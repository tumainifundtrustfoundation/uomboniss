import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { SchoolProfile } from '../../types';
import {
  Building2,
  Save,
  Check,
  Sparkles,
  Award,
  Compass,
  Target,
  FileText,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

export const AdminSchoolProfileTab: React.FC = () => {
  const { language } = useLanguage();
  const { schoolProfile, updateSchoolProfile } = useData();

  const [formData, setFormData] = useState<SchoolProfile>(schoolProfile);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (schoolProfile) {
      setFormData(schoolProfile);
    }
  }, [schoolProfile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSchoolProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">
              {language === 'sw' ? 'Wasifu, Dira, Dhamira na Kaulimbiu ya Shule' : 'School Profile, Vision & Mission'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'sw'
              ? 'Badilisha kaulimbiu, wito wa shule, dira, dhamira na maelezo ya msingi yanayoonekana kwenye kurasa zote za tovuti.'
              : 'Edit motto, slogan, vision, mission, and foundational details displayed across the website.'}
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-fade-in">
            <Check className="w-4 h-4" />
            <span>{language === 'sw' ? 'Mabadiliko Yamehifadhiwa!' : 'Saved Successfully!'}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-6 shadow-xl">
        {/* Basic Identifiers */}
        <div>
          <h4 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Award className="w-4 h-4" />
            {language === 'sw' ? '1. Utambulisho Rasmi wa Shule' : '1. Official School Identifiers'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Jina Rasmi la Shule' : 'Official School Name'}
              </label>
              <input
                type="text"
                value={formData?.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Namba ya Usajili ya NECTA' : 'NECTA Registration Code'}
              </label>
              <input
                type="text"
                value={formData?.nectaCode || 'S0486'}
                onChange={(e) => setFormData({ ...formData, nectaCode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Mwaka wa Kuanzishwa' : 'Year Established'}
              </label>
              <input
                type="number"
                value={formData?.establishedYear || 1985}
                onChange={(e) => setFormData({ ...formData, establishedYear: parseInt(e.target.value, 10) || 1985 })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Motto & Slogan */}
        <div className="border-t border-slate-800 pt-5">
          <h4 className="text-sm font-bold text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            {language === 'sw' ? '2. Wito na Kaulimbiu ya Shule' : '2. Motto & Slogan'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Wito wa Shule (Motto - Kiingereza)' : 'School Motto (English)'}
              </label>
              <input
                type="text"
                value={formData?.motto || formData?.mottoEn || 'PRAYER, EDUCATION AND WORK'}
                onChange={(e) => setFormData({ ...formData, motto: e.target.value, mottoEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Wito wa Shule (Motto - Kiswahili)' : 'School Motto (Swahili)'}
              </label>
              <input
                type="text"
                value={formData?.mottoSw || 'SALA, ELIMU NA KAZI'}
                onChange={(e) => setFormData({ ...formData, mottoSw: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Kaulimbiu (Slogan - Kiswahili)' : 'School Slogan (Swahili)'}
              </label>
              <input
                type="text"
                value={formData?.slogan || formData?.sloganSw || 'TUJIENDELEZE SISI WENYEWE'}
                onChange={(e) => setFormData({ ...formData, slogan: e.target.value, sloganSw: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Kaulimbiu (Slogan - Kiingereza)' : 'School Slogan (English)'}
              </label>
              <input
                type="text"
                value={formData?.sloganEn || 'LET US DEVELOP OURSELVES'}
                onChange={(e) => setFormData({ ...formData, sloganEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="border-t border-slate-800 pt-5">
          <h4 className="text-sm font-bold text-teal-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Target className="w-4 h-4" />
            {language === 'sw' ? '3. Dira na Dhamira ya Shule' : '3. Vision & Mission'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Dira ya Shule (Vision - English)' : 'Vision Statement (English)'}
              </label>
              <textarea
                rows={3}
                value={formData?.vision || formData?.visionEn || ''}
                onChange={(e) => setFormData({ ...formData, vision: e.target.value, visionEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Dira ya Shule (Vision - Kiswahili)' : 'Vision Statement (Swahili)'}
              </label>
              <textarea
                rows={3}
                value={formData?.visionSw || ''}
                onChange={(e) => setFormData({ ...formData, visionSw: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Dhamira ya Shule (Mission - English)' : 'Mission Statement (English)'}
              </label>
              <textarea
                rows={4}
                value={formData?.mission || formData?.missionEn || ''}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value, missionEn: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Dhamira ya Shule (Mission - Kiswahili)' : 'Mission Statement (Swahili)'}
              </label>
              <textarea
                rows={4}
                value={formData?.missionSw || ''}
                onChange={(e) => setFormData({ ...formData, missionSw: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-teal-400 leading-relaxed"
              />
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="border-t border-slate-800 pt-5">
          <h4 className="text-sm font-bold text-sky-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {language === 'sw' ? '4. Mawasiliano na Eneo' : '4. Location & Contact Info'}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Anwani ya Eneo' : 'Physical Location'}
              </label>
              <input
                type="text"
                value={formData?.location || 'Marangu, Kilimanjaro, Tanzania'}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Sanduku la Posta' : 'Postal Address'}
              </label>
              <input
                type="text"
                value={formData?.postalAddress || 'S.L.P. 293, Marangu - Moshi'}
                onChange={(e) => setFormData({ ...formData, postalAddress: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Barua Pepe Rasmi' : 'Official Email'}
              </label>
              <input
                type="email"
                value={formData?.email || 'uomboniss@gmail.com'}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-400 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-4 border-t border-slate-800">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition-all shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            <span>{language === 'sw' ? 'Hifadhi Mabadiliko Yote ya Wasifu' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
