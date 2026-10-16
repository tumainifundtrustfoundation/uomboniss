import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { StudentCouncilMember } from '../../types';
import {
  Users,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Award,
  Crown
} from 'lucide-react';

export const AdminStudentCouncilTab: React.FC = () => {
  const { language } = useLanguage();
  const {
    studentCouncil,
    addStudentCouncilMember,
    updateStudentCouncilMember,
    deleteStudentCouncilMember,
    resetStudentCouncilToDefaults
  } = useData();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [positionSw, setPositionSw] = useState('');
  const [positionEn, setPositionEn] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [form, setForm] = useState('Kidato cha 4');
  const [roleDescSw, setRoleDescSw] = useState('');
  const [roleDescEn, setRoleDescEn] = useState('');
  const [icon, setIcon] = useState('⭐');

  const resetForm = () => {
    setName('');
    setPositionSw('');
    setPositionEn('');
    setGender('M');
    setForm('Kidato cha 4');
    setRoleDescSw('');
    setRoleDescEn('');
    setIcon('⭐');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleStartEdit = (member: StudentCouncilMember) => {
    setEditingId(member.id);
    setName(member.name);
    setPositionSw(member.positionSw);
    setPositionEn(member.positionEn);
    setGender(member.gender);
    setForm(member.form);
    setRoleDescSw(member.roleDescriptionSw || '');
    setRoleDescEn(member.roleDescriptionEn || '');
    setIcon(member.icon || '⭐');
    setIsAdding(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !positionSw.trim()) return;

    if (editingId) {
      updateStudentCouncilMember({
        id: editingId,
        name: name.trim(),
        positionSw: positionSw.trim(),
        positionEn: positionEn.trim() || positionSw.trim(),
        gender,
        form,
        roleDescriptionSw: roleDescSw.trim(),
        roleDescriptionEn: roleDescEn.trim() || roleDescSw.trim(),
        icon: icon.trim() || '⭐'
      });
    } else {
      const newMember: StudentCouncilMember = {
        id: `council-${Date.now()}`,
        name: name.trim(),
        positionSw: positionSw.trim(),
        positionEn: positionEn.trim() || positionSw.trim(),
        gender,
        form,
        roleDescriptionSw: roleDescSw.trim(),
        roleDescriptionEn: roleDescEn.trim() || roleDescSw.trim(),
        icon: icon.trim() || '⭐'
      };
      addStudentCouncilMember(newMember);
    }
    resetForm();
  };

  return (
    <div className="space-y-6">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">
              {language === 'sw' ? 'Usimamizi wa Serikali ya Wanafunzi (Prefects)' : 'Student Council Management'}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {language === 'sw'
              ? 'Mabadiliko yanahifadhiwa kwenye database na yataonekana mara moja kwa wageni wote kwenye tovuti.'
              : 'Updates are stored on the live server and immediately visible to all website visitors.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isAdding && !editingId && (
            <button
              onClick={() => setIsAdding(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{language === 'sw' ? 'Ongeza Kiongozi Mpya' : 'Add New Prefect'}</span>
            </button>
          )}

          <button
            onClick={() => {
              if (window.confirm(language === 'sw' ? 'Rejesha orodha ya awali ya viongozi?' : 'Reset council to default?')) {
                resetStudentCouncilToDefaults();
              }
            }}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border border-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{language === 'sw' ? 'Rejesha Orodha ya Awali' : 'Reset Defaults'}</span>
          </button>
        </div>
      </div>

      {/* Add / Edit Form */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSave} className="bg-slate-900 p-6 rounded-2xl border border-amber-500/30 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              {editingId
                ? (language === 'sw' ? 'Hariri Taarifa za Kiongozi' : 'Edit Prefect Info')
                : (language === 'sw' ? 'Sajili Kiongozi Mpya wa Serikali ya Wanafunzi' : 'Add New Prefect')}
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
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Jina Kamili la Mwanafunzi *' : 'Student Full Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="mf. Prosper M. Shirima"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Wadhifa / Cheo (Kiswahili) *' : 'Position (Swahili) *'}
              </label>
              <input
                type="text"
                required
                value={positionSw}
                onChange={(e) => setPositionSw(e.target.value)}
                placeholder="mf. Kiranja Mkuu (Head Boy)"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Wadhifa / Cheo (English)' : 'Position (English)'}
              </label>
              <input
                type="text"
                value={positionEn}
                onChange={(e) => setPositionEn(e.target.value)}
                placeholder="e.g. Head Boy"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Jinsia *' : 'Gender *'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="M">Mvulana (Male)</option>
                <option value="F">Msichana (Female)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Darasa / Kidato *' : 'Form / Class *'}
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Kidato cha 4">Kidato cha 4 (Form 4)</option>
                <option value="Kidato cha 3">Kidato cha 3 (Form 3)</option>
                <option value="Kidato cha 2">Kidato cha 2 (Form 2)</option>
                <option value="Kidato cha 1">Kidato cha 1 (Form 1)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Ikoni / Alama ya Cheo' : 'Badge Icon (Emoji)'}
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                placeholder="👑, ⭐, 📚, ⚽, ✝️"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {language === 'sw' ? 'Majukumu & Ufafanuzi wa Kazi (Kiswahili)' : 'Role Description (Swahili)'}
              </label>
              <input
                type="text"
                value={roleDescSw}
                onChange={(e) => setRoleDescSw(e.target.value)}
                placeholder="mf. Kusimamia nidhamu kuu, uwakilishi wa wanafunzi na mikutano yote."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>{editingId ? (language === 'sw' ? 'Sasisha Kiongozi' : 'Update Prefect') : (language === 'sw' ? 'Hifadhi Kiongozi' : 'Save Prefect')}</span>
            </button>
          </div>
        </form>
      )}

      {/* Council Members List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {studentCouncil.map((member, idx) => (
          <div
            key={member.id}
            className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{member.icon || '⭐'}</span>
                  <div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                      #{idx + 1} • {member.form}
                    </span>
                    <span className="ml-1.5 text-[10px] text-slate-400">
                      {member.gender === 'M' ? 'Mvulana' : 'Msichana'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleStartEdit(member)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Hariri' : 'Edit'}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'sw' ? `Ondoa ${member.name}?` : `Delete ${member.name}?`)) {
                        deleteStudentCouncilMember(member.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                    title={language === 'sw' ? 'Futa' : 'Delete'}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-2.5">
                <h4 className="text-sm font-black text-white">{member.name}</h4>
                <p className="text-xs font-bold text-amber-400 mt-0.5">
                  {language === 'sw' ? member.positionSw : member.positionEn}
                </p>
                {member.roleDescriptionSw && (
                  <p className="text-[11px] text-slate-400 leading-relaxed mt-1.5 line-clamp-2">
                    {language === 'sw' ? member.roleDescriptionSw : member.roleDescriptionEn}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
