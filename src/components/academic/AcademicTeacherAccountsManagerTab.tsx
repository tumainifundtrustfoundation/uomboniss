import React, { useState } from 'react';
import {
  Users,
  KeyRound,
  BookOpen,
  Plus,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Edit2,
  Trash2,
  Search,
  Phone,
  Mail,
  Send,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  Lock,
  Unlock,
  RefreshCw,
  Eye,
  EyeOff,
  UserCheck,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useLanguage } from '../../context/LanguageContext';
import { Teacher } from '../../types';
import { OFFICIAL_NECTA_SUBJECTS } from '../../utils/nectaResultsEngine';
import {
  TEACHER_AUTH_DIRECTORY,
  getActiveTeacherPin,
  setCustomTeacherPin,
  adminResetTeacherPin,
} from '../../services/teacherAuthDirectory';

interface AcademicTeacherAccountsManagerTabProps {
  language: 'sw' | 'en';
}

export const AcademicTeacherAccountsManagerTab: React.FC<AcademicTeacherAccountsManagerTabProps> = ({
  language,
}) => {
  const { teachers, addTeacher, updateTeacher, deleteTeacher, updateTeacherSubjectsAndPin } = useData() as any;

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');

  // Modal: Change / Assign Password
  const [passwordModalTeacher, setPasswordModalTeacher] = useState<Teacher | null>(null);
  const [newPinInput, setNewPinInput] = useState('');
  const [revealPins, setRevealPins] = useState<Record<string, boolean>>({});

  // Modal: Edit Teacher Subjects
  const [subjectModalTeacher, setSubjectModalTeacher] = useState<Teacher | null>(null);
  const [selectedSubjectsDraft, setSelectedSubjectsDraft] = useState<string[]>([]);
  const [newCustomSubjectName, setNewCustomSubjectName] = useState('');

  // Modal: Add New Teacher
  const [isAddTeacherOpen, setIsAddTeacherOpen] = useState(false);
  const [newTeacherForm, setNewTeacherForm] = useState({
    name: '',
    roleSw: 'Mwalimu wa Somo',
    roleEn: 'Subject Teacher',
    department: 'Sayansi (Science)',
    email: '',
    phone: '',
    subjects: ['Chemistry'],
    initialPin: '654321',
  });

  // Toast notification
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [copiedTeacherId, setCopiedTeacherId] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Get current active PIN for a teacher
  const getTeacherPin = (teacher: Teacher): string => {
    const fromAuthDir = getActiveTeacherPin(teacher.id);
    if (fromAuthDir && fromAuthDir !== '000000') return fromAuthDir;
    if (teacher.portalPin) return teacher.portalPin;
    if (teacher.defaultPin) return teacher.defaultPin;
    const authProfile = TEACHER_AUTH_DIRECTORY[teacher.id];
    if (authProfile?.defaultPin) return authProfile.defaultPin;
    return '123456';
  };

  // Handle Copy Credentials
  const handleCopyCredentials = (teacher: Teacher) => {
    const pin = getTeacherPin(teacher);
    const text = `SHULE YA SEKONDARI UOMBONI (NECTA S.0486)
Taarifa za Kuingia Kwenye Portal ya Walimu:
Mwalimu: ${teacher.name}
Cheo: ${teacher.roleSw || teacher.role}
Barua Pepe: ${teacher.email}
Nenosiri / PIN ya Portal: ${pin}
Masomo Yako: ${teacher.subjects.join(', ')}
Kiungo cha Kuingia: https://www.uomboniss.sc.tz/#academic

Kumbuka: Una ruhusa ya kuingiza alama kwa masomo yako uliyopangiwa pekee.`;

    navigator.clipboard.writeText(text);
    setCopiedTeacherId(teacher.id);
    showToast(
      language === 'sw'
        ? `Taarifa za kuingia za ${teacher.name} zimenakiliwa! Unaweza kumtumia WhatsApp au SMS.`
        : `Login credentials copied for ${teacher.name}!`
    );
    setTimeout(() => setCopiedTeacherId(null), 3000);
  };

  // Handle WhatsApp Share
  const handleWhatsAppCredentials = (teacher: Teacher) => {
    const pin = getTeacherPin(teacher);
    const cleanPhone = (teacher.phone || '').replace(/[^0-9]/g, '');
    const text = encodeURIComponent(`Habari Mwalimu ${teacher.name},\n\nHizi hapa ni taarifa zako za kuingia kwenye Portal ya Walimu ya Shule ya Sekondari Uomboni:\n\n*Barua Pepe:* ${teacher.email}\n*Nenosiri / PIN:* ${pin}\n*Masomo:* ${teacher.subjects.join(', ')}\n*Tovuti:* https://www.uomboniss.sc.tz/#academic\n\n_Mkuu wa Taaluma, Uomboni Secondary School_`);
    const waUrl = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(waUrl, '_blank');
  };

  // Save new assigned PIN
  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalTeacher) return;
    if (!newPinInput.trim() || newPinInput.trim().length < 4) {
      showToast(language === 'sw' ? 'Nenosiri/PIN lazima iwe na angalau tarakimu 4' : 'PIN must have at least 4 digits', 'error');
      return;
    }

    const pin = newPinInput.trim();
    // Update in Context and Firestore
    updateTeacherSubjectsAndPin(passwordModalTeacher.id, passwordModalTeacher.subjects, pin);
    setCustomTeacherPin(passwordModalTeacher.id, pin);

    showToast(
      language === 'sw'
        ? `Nenosiri la Mwalimu ${passwordModalTeacher.name} limewekwa kuwa: ${pin}`
        : `PIN for ${passwordModalTeacher.name} updated to: ${pin}`
    );
    setPasswordModalTeacher(null);
    setNewPinInput('');
  };

  // Generate random 6-digit PIN
  const handleGenerateRandomPin = () => {
    const randomPin = String(Math.floor(100000 + Math.random() * 900000));
    setNewPinInput(randomPin);
  };

  // Open Subject Management Modal
  const handleOpenSubjectModal = (teacher: Teacher) => {
    setSubjectModalTeacher(teacher);
    setSelectedSubjectsDraft([...teacher.subjects]);
    setNewCustomSubjectName('');
  };

  // Toggle subject assignment checkbox
  const handleToggleSubject = (subjectName: string) => {
    setSelectedSubjectsDraft((prev) => {
      if (prev.includes(subjectName)) {
        return prev.filter((s) => s !== subjectName);
      } else {
        return [...prev, subjectName];
      }
    });
  };

  // Add custom registered subject
  const handleAddCustomSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomSubjectName.trim()) return;
    const name = newCustomSubjectName.trim();
    if (!selectedSubjectsDraft.includes(name)) {
      setSelectedSubjectsDraft((prev) => [...prev, name]);
    }
    setNewCustomSubjectName('');
    showToast(`Somo la "${name}" limeongezwa kwa mwalimu huyu.`);
  };

  // Save updated subjects for teacher
  const handleSaveTeacherSubjects = () => {
    if (!subjectModalTeacher) return;
    if (selectedSubjectsDraft.length === 0) {
      showToast(language === 'sw' ? 'Mwalimu lazima apangiwe angalau somo 1' : 'Teacher must have at least 1 subject', 'error');
      return;
    }

    updateTeacherSubjectsAndPin(subjectModalTeacher.id, selectedSubjectsDraft);
    showToast(
      language === 'sw'
        ? `Masomo ya ${subjectModalTeacher.name} yamesasishwa: ${selectedSubjectsDraft.join(', ')}`
        : `Subjects updated for ${subjectModalTeacher.name}`
    );
    setSubjectModalTeacher(null);
  };

  // Save brand new teacher
  const handleCreateNewTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeacherForm.name.trim() || !newTeacherForm.email.trim()) {
      showToast(language === 'sw' ? 'Tafadhali jaza jina na barua pepe ya mwalimu' : 'Please fill teacher name and email', 'error');
      return;
    }

    const newId = `tch-${Date.now().toString().slice(-4)}`;
    const createdTeacher: Teacher = {
      id: newId,
      name: newTeacherForm.name.trim(),
      role: newTeacherForm.roleSw,
      roleSw: newTeacherForm.roleSw,
      roleEn: newTeacherForm.roleEn,
      department: newTeacherForm.department as any,
      email: newTeacherForm.email.trim(),
      phone: newTeacherForm.phone.trim() || '+255 700 000 000',
      subjects: newTeacherForm.subjects,
      defaultPin: newTeacherForm.initialPin || '654321',
      portalPin: newTeacherForm.initialPin || '654321',
      imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    };

    addTeacher(createdTeacher);
    setCustomTeacherPin(newId, createdTeacher.portalPin || '654321');

    showToast(
      language === 'sw'
        ? `Mwalimu ${createdTeacher.name} amesajiliwa kikamilifu na kupewa PIN: ${createdTeacher.portalPin}`
        : `Teacher ${createdTeacher.name} created with PIN: ${createdTeacher.portalPin}`
    );
    setIsAddTeacherOpen(false);
    setNewTeacherForm({
      name: '',
      roleSw: 'Mwalimu wa Somo',
      roleEn: 'Subject Teacher',
      department: 'Sayansi (Science)',
      email: '',
      phone: '',
      subjects: ['Chemistry'],
      initialPin: '654321',
    });
  };

  // Filtered teachers list
  const filteredTeachers = teachers.filter((t) => {
    if (selectedDepartment !== 'ALL' && !t.department?.toLowerCase().includes(selectedDepartment.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-md border ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
              : 'bg-rose-50 text-rose-900 border-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button onClick={() => setToast(null)} className="text-stone-400 hover:text-stone-700">
            &times;
          </button>
        </div>
      )}

      {/* Top Banner */}
      <div className="bg-[#FFFDF8] p-5 rounded-3xl border-2 border-red-200/80 shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-950 text-xs font-black uppercase mb-1">
            <KeyRound className="w-3.5 h-3.5 text-red-700" />
            <span>{language === 'sw' ? 'Usimamizi wa Walimu & Nywila (Teacher Accounts)' : 'Teacher Directory & Credentials'}</span>
          </div>
          <h2 className="text-lg md:text-xl font-black text-stone-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-red-700" />
            <span>{language === 'sw' ? 'Kusajili Masomo ya Walimu & Kuwapa Nywila za Portal' : 'Teacher Subject Assignment & Password Provisioning'}</span>
          </h2>
          <p className="text-xs text-stone-600 max-w-2xl mt-1 leading-relaxed">
            {language === 'sw'
              ? 'Mkuu wa Taaluma ndiye anayepanga masomo anayofundisha kila mwalimu, kusajili masomo mapya, na kumpa kila mwalimu nenosiri/PIN ya kuingilia portal ya taaluma. Kila mwalimu anaingiza alama za masomo yake pekee.'
              : 'The Academic Master manages teacher subject assignments, registers new curriculum subjects, and assigns individual login PINs/passwords for teacher portal access.'}
          </p>
        </div>

        <button
          onClick={() => setIsAddTeacherOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'sw' ? '+ Sajili Mwalimu Mpya' : '+ Register New Teacher'}</span>
        </button>
      </div>

      {/* Search & Department Filters */}
      <div className="bg-[#FFFDF8] p-4 rounded-2xl border border-red-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-red-700 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              language === 'sw'
                ? 'Tafuta mwalimu kwa jina, barua pepe au somo...'
                : 'Search teacher by name, email, or subject...'
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs text-stone-900 font-medium focus:ring-2 focus:ring-red-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-600">Idara:</span>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#FAF7EE] border border-red-300 text-xs font-bold text-stone-900 focus:ring-2 focus:ring-red-600 focus:outline-none cursor-pointer"
          >
            <option value="ALL">Idara Zote</option>
            <option value="Sayansi">Sayansi (Science)</option>
            <option value="Lugha">Lugha (Languages)</option>
            <option value="Sanaa">Sanaa (Humanities)</option>
            <option value="Biashara">Biashara (Commercial)</option>
            <option value="Utawala">Utawala (Administration)</option>
          </select>
        </div>
      </div>

      {/* Teachers Directory Table */}
      <div className="bg-[#FFFDF8] rounded-3xl border-2 border-red-200/80 shadow-md overflow-hidden">
        <div className="p-4 border-b border-red-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-red-700" />
            <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              {language === 'sw' ? 'Orodha ya Walimu na Nywila Zao' : 'Faculty Roster & Login Passwords'}
            </h4>
            <span className="text-xs text-stone-500">({filteredTeachers.length} walimu)</span>
          </div>

          <div className="text-[11px] text-stone-500 flex items-center gap-1.5 font-medium">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Kila mwalimu ana nenosiri lake binafsi</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF7EE] text-stone-700 uppercase text-[10px] font-black border-b border-red-200">
              <tr>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-4">Mwalimu & Cheo</th>
                <th className="py-3 px-3">Mawasiliano (Email / Simu)</th>
                <th className="py-3 px-3">Masomo Aliyopangiwa</th>
                <th className="py-3 px-3">Nenosiri / PIN ya Portal</th>
                <th className="py-3 px-4 text-right">Vitendo vya Taaluma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-100 font-medium text-stone-800">
              {filteredTeachers.map((teacher, idx) => {
                const pin = getTeacherPin(teacher);
                const isRevealed = revealPins[teacher.id];
                const isCopied = copiedTeacherId === teacher.id;

                return (
                  <tr key={teacher.id} className="hover:bg-[#FFFFF0]/80 transition-colors">
                    {/* Index */}
                    <td className="py-3.5 px-3 text-stone-400 font-mono text-[11px]">{idx + 1}</td>

                    {/* Teacher & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-red-100 text-red-900 font-black flex items-center justify-center shrink-0 border border-red-200">
                          {teacher.name.charAt(teacher.name.indexOf('.') > -1 ? teacher.name.indexOf('.') + 2 : 0) || 'M'}
                        </div>
                        <div>
                          <div className="font-bold text-stone-900 text-xs">{teacher.name}</div>
                          <div className="text-[10px] text-stone-500 font-medium">
                            {teacher.roleSw || teacher.role}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Email & Phone */}
                    <td className="py-3.5 px-3 text-[11px] text-stone-700 font-mono">
                      <div className="text-stone-900 font-medium">{teacher.email}</div>
                      <div className="text-stone-500">{teacher.phone}</div>
                    </td>

                    {/* Assigned Subjects */}
                    <td className="py-3.5 px-3">
                      <div className="flex flex-wrap gap-1 max-w-[240px]">
                        {teacher.subjects && teacher.subjects.length > 0 ? (
                          teacher.subjects.map((sub) => (
                            <span
                              key={sub}
                              className="px-2 py-0.5 rounded-md bg-[#FAF7EE] border border-red-200 text-red-950 text-[10px] font-bold"
                            >
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-rose-600 italic text-[11px]">Hajapangiwa somo</span>
                        )}
                      </div>
                    </td>

                    {/* Password / PIN */}
                    <td className="py-3.5 px-3">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-300 font-mono font-bold text-amber-950 text-xs">
                        <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                        <span>{isRevealed ? pin : '••••••'}</span>
                        <button
                          type="button"
                          onClick={() => setRevealPins((prev) => ({ ...prev, [teacher.id]: !prev[teacher.id] }))}
                          className="text-stone-400 hover:text-stone-700 ml-1 cursor-pointer"
                          title={isRevealed ? 'Ficha PIN' : 'Onyesha PIN'}
                        >
                          {isRevealed ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Copy Credentials */}
                        <button
                          type="button"
                          onClick={() => handleCopyCredentials(teacher)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isCopied
                              ? 'bg-emerald-700 text-white'
                              : 'bg-[#FAF7EE] hover:bg-red-50 text-stone-800 border border-red-300'
                          }`}
                          title="Nakili taarifa za kuingia kumtumia mwalimu"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-red-700" />}
                          <span>{isCopied ? 'Imenakiliwa!' : 'Nakili'}</span>
                        </button>

                        {/* WhatsApp Credentials */}
                        <button
                          type="button"
                          onClick={() => handleWhatsAppCredentials(teacher)}
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all cursor-pointer"
                          title="Tuma taarifa za kuingia kwa WhatsApp"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>

                        {/* Change PIN */}
                        <button
                          type="button"
                          onClick={() => {
                            setPasswordModalTeacher(teacher);
                            setNewPinInput(pin);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold border border-amber-300 text-xs transition-all cursor-pointer flex items-center gap-1"
                          title="Weka Nenosiri Jipya"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-800" />
                          <span>Weka PIN</span>
                        </button>

                        {/* Assign Subjects */}
                        <button
                          type="button"
                          onClick={() => handleOpenSubjectModal(teacher)}
                          className="px-2.5 py-1 rounded-lg bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-bold text-xs transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                          title="Panga Masomo ya Mwalimu"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-[#FFFFF0]" />
                          <span>Panga Masomo</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CHANGE / ASSIGN TEACHER PIN */}
      {passwordModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-stone-300 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-black">
                  <KeyRound className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {language === 'sw' ? 'Weka Nenosiri / PIN ya Mwalimu' : 'Assign Teacher Portal Password'}
                  </h3>
                  <p className="text-[11px] text-stone-500">{passwordModalTeacher.name}</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalTeacher(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePin} className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF7EE] rounded-xl border border-amber-300 text-[11px] text-stone-700 space-y-1">
                <div>Mwalimu: <strong>{passwordModalTeacher.name}</strong></div>
                <div>Email ya Kuingilia: <strong className="font-mono text-red-900">{passwordModalTeacher.email}</strong></div>
                <div>Masomo: <strong className="text-stone-900">{passwordModalTeacher.subjects.join(', ')}</strong></div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1">
                  {language === 'sw' ? 'Nenosiri Jipya au PIN (Tarakimu 4-8) *' : 'New Password / PIN *'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="mfano: 745225"
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border-2 border-amber-400 font-mono font-bold text-base text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateRandomPin}
                    className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-all cursor-pointer flex items-center gap-1"
                    title="Tengeneza PIN salama bila kubahatisha"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                    <span>Generate</span>
                  </button>
                </div>
                <p className="text-[10px] text-stone-500 mt-1">
                  Mwalimu atatumia nenosiri hili kuingia kwenye Portal ya Taaluma na kuingiza alama za masomo yake pekee.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setPasswordModalTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hifadhi Nenosiri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN SUBJECTS TO TEACHER */}
      {subjectModalTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border-2 border-stone-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-900 flex items-center justify-center font-black">
                  <BookOpen className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {language === 'sw' ? 'Panga Masomo ya Mwalimu' : 'Assign Teacher Subjects'}
                  </h3>
                  <p className="text-[11px] text-stone-500">{subjectModalTeacher.name}</p>
                </div>
              </div>
              <button
                onClick={() => setSubjectModalTeacher(null)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3 bg-[#FAF7EE] rounded-xl border border-red-200 text-stone-800 text-xs">
                Mwalimu <strong>{subjectModalTeacher.name}</strong> ataweza kuona na kuingiza alama kwa masomo uliyoyachagua hapa chini pekee:
              </div>

              {/* Standard NECTA Subjects Checkboxes */}
              <div>
                <label className="block font-bold text-stone-800 mb-2">
                  {language === 'sw' ? 'Chagua Masomo Rasmi ya NECTA:' : 'Select NECTA Standard Subjects:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {OFFICIAL_NECTA_SUBJECTS.map((sub) => {
                    const isChecked = selectedSubjectsDraft.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.code}
                        onClick={() => handleToggleSubject(sub.name)}
                        className={`p-2 rounded-xl border text-left text-xs font-bold transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? 'bg-red-700 text-[#FFFFF0] border-red-800 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        <span className="truncate">{sub.name}</span>
                        {isChecked && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Register / Add Custom Subject */}
              <div className="pt-2 border-t border-stone-200">
                <label className="block font-bold text-stone-800 mb-1">
                  {language === 'sw' ? 'Sajili Somo Lingine la Ziada:' : 'Register Additional Subject:'}
                </label>
                <form onSubmit={handleAddCustomSubject} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomSubjectName}
                    onChange={(e) => setNewCustomSubjectName(e.target.value)}
                    placeholder="mfano: Kifaransa (French), Kiarabu, Michezo..."
                    className="flex-1 px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition-all cursor-pointer shrink-0"
                  >
                    + Ongeza Somo
                  </button>
                </form>
              </div>

              {/* Currently Selected Summary */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase block mb-1">
                  Masomo Yaliyochaguliwa ({selectedSubjectsDraft.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSubjectsDraft.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-md bg-red-100 text-red-950 font-bold text-[11px] border border-red-300"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSubjectModalTeacher(null)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="button"
                  onClick={handleSaveTeacherSubjects}
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Hifadhi Masomo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW TEACHER */}
      {isAddTeacherOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border-2 border-stone-300 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-red-100 text-red-900 flex items-center justify-center font-black">
                  <Plus className="w-5 h-5 text-red-700" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-stone-900">
                    {language === 'sw' ? 'Sajili Mwalimu Mpya Shuleni' : 'Register New Faculty Member'}
                  </h3>
                  <p className="text-[11px] text-stone-500">Mkuu wa Taaluma ataweka masomo na PIN</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddTeacherOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 rounded-lg cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateNewTeacher} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-stone-800 mb-1">Jina Kamili la Mwalimu *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.name}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, name: e.target.value })}
                    placeholder="mfano: Mwl. Grace Shayo"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Barua Pepe (Login Email) *</label>
                  <input
                    type="email"
                    required
                    value={newTeacherForm.email}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, email: e.target.value })}
                    placeholder="grace.shayo@uombonisec.ac.tz"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Namba ya Simu</label>
                  <input
                    type="tel"
                    value={newTeacherForm.phone}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, phone: e.target.value })}
                    placeholder="+255 784 000 000"
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-red-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Idara (Department)</label>
                  <select
                    value={newTeacherForm.department}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 font-semibold focus:outline-none focus:ring-2 focus:ring-red-600"
                  >
                    <option value="Sayansi (Science)">Sayansi (Science)</option>
                    <option value="Lugha (Languages)">Lugha (Languages)</option>
                    <option value="Sanaa (Humanities)">Sanaa (Humanities)</option>
                    <option value="Biashara (Commercial)">Biashara (Commercial)</option>
                    <option value="Utawala (Administration)">Utawala (Administration)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-800 mb-1">Nenosiri / PIN ya Kuanzia *</label>
                  <input
                    type="text"
                    required
                    value={newTeacherForm.initialPin}
                    onChange={(e) => setNewTeacherForm({ ...newTeacherForm, initialPin: e.target.value })}
                    placeholder="654321"
                    className="w-full px-3 py-2 rounded-xl bg-amber-50 border-2 border-amber-400 text-amber-950 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-stone-800 mb-1.5">Masomo Anayofundisha:</label>
                <div className="flex flex-wrap gap-1.5">
                  {OFFICIAL_NECTA_SUBJECTS.map((sub) => {
                    const isChecked = newTeacherForm.subjects.includes(sub.name);
                    return (
                      <button
                        type="button"
                        key={sub.code}
                        onClick={() => {
                          const next = isChecked
                            ? newTeacherForm.subjects.filter((s) => s !== sub.name)
                            : [...newTeacherForm.subjects, sub.name];
                          setNewTeacherForm({ ...newTeacherForm, subjects: next });
                        }}
                        className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-red-700 text-[#FFFFF0] border-red-800 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
                        }`}
                      >
                        {sub.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddTeacherOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 text-stone-700 font-bold hover:bg-stone-200 cursor-pointer"
                >
                  Ghairi
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-[#FFFFF0] font-black shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sajili Mwalimu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
