import React, { useState, useEffect } from 'react';
import {
  Users,
  ShieldCheck,
  Megaphone,
  BookOpen,
  School,
  Search,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Sparkles,
  GraduationCap,
  FileSpreadsheet,
  Settings,
  UserCheck,
  Building2,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { UserProfile, UserRole, db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import {
  FirestoreStudent,
  FirestoreTeacher,
  FirestoreClass,
  FirestoreSubject,
  FirestoreExam,
  FirestoreSchoolSettings,
  FirestoreAnnouncement,
} from '../../types';
import {
  getSchoolSettings,
  updateSchoolSettings,
  getStudents,
  saveStudent,
  deleteStudent,
  getTeachers,
  saveTeacher,
  getClasses,
  saveClass,
  getSubjects,
  saveSubject,
  getExams,
  saveExam,
  getAnnouncements,
  saveAnnouncement,
  deleteAnnouncement,
  seedInstitutionSchemaFoundation,
  DEFAULT_SCHOOL_SETTINGS,
} from '../../services/schoolFirestoreService';

export const AdminDashboard: React.FC = () => {
  const { user, userProfile, updateUserRoleByAdmin } = useAuth();
  const [activeAdminTab, setActiveAdminTab] = useState<
    'users' | 'students' | 'teachers' | 'academics' | 'exams' | 'announcements' | 'settings'
  >('users');

  // Users state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Schema state
  const [schoolSettings, setSchoolSettings] = useState<FirestoreSchoolSettings>(DEFAULT_SCHOOL_SETTINGS);
  const [studentsList, setStudentsList] = useState<FirestoreStudent[]>([]);
  const [teachersList, setTeachersList] = useState<FirestoreTeacher[]>([]);
  const [classesList, setClassesList] = useState<FirestoreClass[]>([]);
  const [subjectsList, setSubjectsList] = useState<FirestoreSubject[]>([]);
  const [examsList, setExamsList] = useState<FirestoreExam[]>([]);
  const [announcementsList, setAnnouncementsList] = useState<FirestoreAnnouncement[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);

  // New Student modal/form state
  const [newStudent, setNewStudent] = useState<Partial<FirestoreStudent>>({
    admissionNumber: '',
    fullName: '',
    gender: 'M',
    classId: 'class_Form_One_A_2026',
    stream: 'A',
    parentName: '',
    parentPhone: '',
    active: true,
  });

  // New announcement form state
  const [newAnn, setNewAnn] = useState({ title: '', message: '', target: 'all' });

  const fallbackUsersList: UserProfile[] = [
    {
      uid: user?.uid || 'admin-001',
      fullName: userProfile?.fullName || 'Br. Adolph Massawe (Mkuu wa Shule)',
      email: user?.email || 'tumainifundtrustfoundation@gmail.com',
      role: 'admin',
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'usr-002',
      fullName: 'Baraka J. Kimaro',
      email: 'baraka@uomboni.sc.tz',
      phone: '+255 754 112 233',
      role: 'student',
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'usr-003',
      fullName: 'Mwl. Wolter Temu',
      email: 'wolter.temu@uombonisec.ac.tz',
      phone: '+255 754 532 949',
      role: 'teacher',
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
  ];

  // Initial load
  useEffect(() => {
    loadUsers();
    loadSchemaData();
  }, []);

  const loadSchemaData = async () => {
    try {
      const [settingsData, studs, teachs, clss, subjs, exms, anns] = await Promise.all([
        getSchoolSettings(),
        getStudents(),
        getTeachers(),
        getClasses(),
        getSubjects(),
        getExams(),
        getAnnouncements(),
      ]);

      setSchoolSettings(settingsData);
      setStudentsList(studs);
      setTeachersList(teachs);
      setClassesList(clss);
      setSubjectsList(subjs);
      setExamsList(exms);
      setAnnouncementsList(anns);
    } catch (err) {
      console.warn('Error loading school schema collections:', err);
    }
  };

  const loadUsers = async () => {
    if (!auth.currentUser) {
      setUsersList(fallbackUsersList);
      setLoadingUsers(false);
      return;
    }

    setLoadingUsers(true);
    try {
      const snap = await getDocs(collection(db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      if (list.length > 0) {
        setUsersList(list);
      } else {
        setUsersList(fallbackUsersList);
      }
    } catch (err: any) {
      if (err?.code === 'permission-denied') {
        handleFirestoreError(err, OperationType.LIST, 'users');
      }
      setUsersList(fallbackUsersList);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleRoleChange = async (targetUid: string, newRole: UserRole) => {
    setStatusMessage(null);
    const res = await updateUserRoleByAdmin(targetUid, newRole);
    if (res.success) {
      setStatusMessage({ type: 'success', text: `Jukumu la mtumiaji limesasishwa kuwa "${newRole}" kikamilifu.` });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Imeshindwa kubadilisha jukumu.' });
    }
  };

  const handleSeedSchema = async () => {
    setIsSeeding(true);
    setStatusMessage(null);
    const res = await seedInstitutionSchemaFoundation();
    if (res.success) {
      setStatusMessage({ type: 'success', text: res.message });
      await loadSchemaData();
    } else {
      setStatusMessage({ type: 'error', text: res.message });
    }
    setIsSeeding(false);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await updateSchoolSettings(schoolSettings);
    if (ok) {
      setStatusMessage({ type: 'success', text: 'School settings saved to settings/school successfully.' });
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to save school settings.' });
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.admissionNumber || !newStudent.fullName) return;

    const studentToSave: FirestoreStudent = {
      admissionNumber: newStudent.admissionNumber,
      fullName: newStudent.fullName,
      gender: (newStudent.gender as 'M' | 'F') || 'M',
      classId: newStudent.classId || 'class_Form_One_A_2026',
      stream: newStudent.stream || 'A',
      parentName: newStudent.parentName || '',
      parentPhone: newStudent.parentPhone || '',
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedId = await saveStudent(studentToSave);
    if (savedId) {
      setStatusMessage({ type: 'success', text: `Student ${studentToSave.fullName} registered in students/${savedId}.` });
      setStudentsList((prev) => [...prev, { ...studentToSave, id: savedId }]);
      setNewStudent({
        admissionNumber: '',
        fullName: '',
        gender: 'M',
        classId: 'class_Form_One_A_2026',
        stream: 'A',
        parentName: '',
        parentPhone: '',
        active: true,
      });
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to register student.' });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm('Are you sure you want to remove this student?')) return;
    const ok = await deleteStudent(id);
    if (ok) {
      setStudentsList((prev) => prev.filter((s) => s.id !== id));
      setStatusMessage({ type: 'success', text: 'Student deleted successfully.' });
    }
  };

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnn.title || !newAnn.message) return;

    const announcement: FirestoreAnnouncement = {
      title: newAnn.title,
      message: newAnn.message,
      target: newAnn.target,
      createdBy: userProfile?.fullName || 'School Administration',
      createdAt: new Date().toISOString(),
    };

    const savedId = await saveAnnouncement(announcement);
    if (savedId) {
      setStatusMessage({ type: 'success', text: 'Announcement published to announcements collection!' });
      setAnnouncementsList((prev) => [{ ...announcement, id: savedId }, ...prev]);
      setNewAnn({ title: '', message: '', target: 'all' });
    } else {
      setStatusMessage({ type: 'error', text: 'Failed to publish announcement.' });
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    const ok = await deleteAnnouncement(id);
    if (ok) {
      setAnnouncementsList((prev) => prev.filter((a) => a.id !== id));
      setStatusMessage({ type: 'success', text: 'Announcement archived.' });
    }
  };

  const filteredUsers = usersList.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-[#0b2545] via-slate-900 to-[#0b2545] border border-blue-900/40 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start sm:items-center gap-4">
            <div className="p-2 rounded-2xl bg-white/10 border border-blue-500/30 shadow-md shrink-0">
              <SchoolLogo size="lg" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Official Schema Management Hub
                </span>
                <span className="text-xs text-slate-400">Marangu Magharibi, Moshi • Reg: {schoolSettings.registrationNumber}</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">
                {schoolSettings.schoolName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Motto: <span className="text-amber-300 font-semibold">{schoolSettings.motto}</span> • Collections: users, students, teachers, classes, subjects, exams, results, published_results, announcements, settings/school
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedSchema}
              disabled={isSeeding}
              className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-all disabled:opacity-50"
              title="Pre-populate collections with standard NECTA subjects, classes, and settings"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
              <span>{isSeeding ? 'Seeding...' : 'Seed Foundation'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'users', label: 'Users (RBAC)', icon: Users },
          { id: 'students', label: `Students (${studentsList.length})`, icon: GraduationCap },
          { id: 'teachers', label: `Teachers (${teachersList.length})`, icon: UserCheck },
          { id: 'academics', label: `Classes & Subjects (${classesList.length}/${subjectsList.length})`, icon: BookOpen },
          { id: 'exams', label: `Exams & Results (${examsList.length})`, icon: FileSpreadsheet },
          { id: 'announcements', label: `Announcements (${announcementsList.length})`, icon: Megaphone },
          { id: 'settings', label: 'School Settings', icon: Settings },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeAdminTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveAdminTab(item.id as any)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-[#0b2545] text-white border border-blue-500 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 text-blue-400" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Status banner */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs sm:text-sm flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* TAB 1: USERS (users/{uid}) */}
      {activeAdminTab === 'users' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Users Collection (users/{'{uid}'})</h2>
              <p className="text-xs text-slate-400">
                Schema: uid, fullName, email, phone, role (admin | teacher | student), photoURL, active, createdAt, updatedAt
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search name or email..."
                  className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="teacher">Teachers</option>
                <option value="admin">Administrators</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">User & Email</th>
                  <th className="py-2.5 px-3">Phone</th>
                  <th className="py-2.5 px-3">Active Status</th>
                  <th className="py-2.5 px-3">Current Role</th>
                  <th className="py-2.5 px-3">Reassign Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.uid} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3">
                      <div className="font-bold text-white">{u.fullName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">{u.phone || '—'}</td>
                    <td className="py-2.5 px-3">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          u.role === 'admin'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : u.role === 'teacher'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.uid, e.target.value as UserRole)}
                        className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-blue-400 cursor-pointer"
                      >
                        <option value="student">Student</option>
                        <option value="teacher">Teacher</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: STUDENTS (students/{studentId}) */}
      {activeAdminTab === 'students' && (
        <div className="space-y-6">
          {/* Add Student Form */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-1">Enroll Student (students/{'{studentId}'})</h2>
            <p className="text-xs text-slate-400 mb-4">
              Schema: admissionNumber, fullName, gender, dateOfBirth, classId, stream, userId, parentName, parentPhone, photoURL, active, createdAt, updatedAt
            </p>
            <form onSubmit={handleAddStudent} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Admission Number *</label>
                <input
                  type="text"
                  placeholder="e.g. S0486/0014/2026"
                  value={newStudent.admissionNumber || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, admissionNumber: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Kelvin A. Maro"
                  value={newStudent.fullName || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Gender</label>
                <select
                  value={newStudent.gender || 'M'}
                  onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'M' | 'F' })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="M">Male (M)</option>
                  <option value="F">Female (F)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Stream</label>
                <input
                  type="text"
                  placeholder="e.g. A"
                  value={newStudent.stream || 'A'}
                  onChange={(e) => setNewStudent({ ...newStudent, stream: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Parent Name</label>
                <input
                  type="text"
                  placeholder="e.g. Aloyce Maro"
                  value={newStudent.parentName || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-bold mb-1">Parent Phone</label>
                <input
                  type="text"
                  placeholder="e.g. +255 754 112 233"
                  value={newStudent.parentPhone || ''}
                  onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                />
              </div>
              <div className="sm:col-span-2 flex items-end">
                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Save Student Record
                </button>
              </div>
            </form>
          </div>

          {/* Student List */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-white mb-3">Enrolled Students in Firestore ({studentsList.length})</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Admission #</th>
                    <th className="py-2.5 px-3">Full Name</th>
                    <th className="py-2.5 px-3">Gender</th>
                    <th className="py-2.5 px-3">Stream</th>
                    <th className="py-2.5 px-3">Parent Info</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {studentsList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-500">
                        No students enrolled yet. Click "Seed Foundation" or use the form above.
                      </td>
                    </tr>
                  ) : (
                    studentsList.map((s) => (
                      <tr key={s.id || s.admissionNumber} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-bold text-amber-400">{s.admissionNumber}</td>
                        <td className="py-2.5 px-3 font-bold text-white">{s.fullName}</td>
                        <td className="py-2.5 px-3">{s.gender}</td>
                        <td className="py-2.5 px-3 font-mono">{s.stream}</td>
                        <td className="py-2.5 px-3">
                          <div>{s.parentName || '—'}</div>
                          <div className="text-[10px] text-slate-400">{s.parentPhone}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300">
                            {s.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <button
                            onClick={() => s.id && handleDeleteStudent(s.id)}
                            className="p-1 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                            title="Remove Student"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEACHERS (teachers/{teacherId}) */}
      {activeAdminTab === 'teachers' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Teachers Collection (teachers/{'{teacherId}'})</h2>
              <p className="text-xs text-slate-400">
                Schema: userId, fullName, email, phone, subjects[], classes[], active, createdAt, updatedAt
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teachersList.length === 0 ? (
              <div className="col-span-full text-center py-8 text-slate-500 text-xs">
                No teacher records found. Click "Seed Foundation" to load initial faculty records.
              </div>
            ) : (
              teachersList.map((t) => (
                <div key={t.id || t.userId} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{t.fullName}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-slate-400">
                    <div>Email: <span className="text-slate-300">{t.email}</span></div>
                    <div>Phone: <span className="text-slate-300 font-mono">{t.phone}</span></div>
                  </div>
                  <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">Subjects: </span>
                    {t.subjects?.join(', ') || 'General Teaching'}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ACADEMICS (classes & subjects) */}
      {activeAdminTab === 'academics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Classes */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Classes Collection (classes/{'{classId}'})</h2>
              <p className="text-xs text-slate-400">
                Schema: name (Form One, Form Two...), stream, academicYear, classTeacherId, active
              </p>
            </div>
            <div className="space-y-2">
              {classesList.map((c) => (
                <div key={c.id || `${c.name}_${c.stream}`} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-white">{c.name} - Stream {c.stream}</span>
                    <span className="ml-2 text-slate-400 font-mono">({c.academicYear})</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Subjects */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div>
              <h2 className="text-base font-bold text-white">Subjects Collection (subjects/{'{subjectId}'})</h2>
              <p className="text-xs text-slate-400">
                Schema: name, code, category, active
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {subjectsList.map((sub) => (
                <div key={sub.id || sub.code} className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{sub.name}</span>
                    <span className="font-mono text-amber-400 font-bold">{sub.code}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block">Category: {sub.category}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXAMS & RESULTS (exams & results & published_results) */}
      {activeAdminTab === 'exams' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-base font-bold text-white">Examinations Collection (exams/{'{examId}'})</h2>
            <p className="text-xs text-slate-400">
              Schema: name, type (Monthly, Terminal, Annual, Mock...), academicYear, term, classId, startDate, endDate, status, createdBy, createdAt
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {examsList.map((ex) => (
              <div key={ex.id || ex.name} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">{ex.name}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase">
                    {ex.status}
                  </span>
                </div>
                <div className="text-xs text-slate-400 space-y-1">
                  <div>Type: <span className="text-slate-300 font-semibold">{ex.type}</span> • Term: {ex.term}</div>
                  <div>Academic Year: <span className="font-mono text-amber-400">{ex.academicYear}</span></div>
                  <div>Dates: {ex.startDate || '—'} to {ex.endDate || '—'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-white mb-2">Examination Results Collections:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="font-bold text-amber-400 block mb-1">results/{'{resultId}'}</span>
                studentId, admissionNumber, examId, subjectId, classId, marks, grade, remarks, enteredBy, verifiedBy, status, createdAt, updatedAt
              </div>
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl">
                <span className="font-bold text-emerald-400 block mb-1">published_results/{'{resultId}'}</span>
                studentId, examId, admissionNumber, totalMarks, average, division, position, subjects[], publishedBy, publishedAt
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ANNOUNCEMENTS (announcements/{announcementId}) */}
      {activeAdminTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-1">
            <h2 className="text-base font-bold text-white mb-1">Publish Circular (announcements/{'{id}'})</h2>
            <p className="text-xs text-slate-400 mb-4">
              Schema: title, message, imageURL, target, createdBy, createdAt
            </p>

            <form onSubmit={handlePostAnnouncement} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newAnn.title}
                  onChange={(e) => setNewAnn({ ...newAnn, title: e.target.value })}
                  placeholder="e.g. End of Term Closing Assembly"
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Target Audience</label>
                <select
                  value={newAnn.target}
                  onChange={(e) => setNewAnn({ ...newAnn, target: e.target.value })}
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                >
                  <option value="all">All School Community</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Teachers & Faculty</option>
                  <option value="parents">Parents / Guardians</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Message Content *</label>
                <textarea
                  rows={4}
                  value={newAnn.message}
                  onChange={(e) => setNewAnn({ ...newAnn, message: e.target.value })}
                  placeholder="Official notice body..."
                  className="w-full p-2 bg-slate-950 border border-slate-700 rounded-xl text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all"
              >
                Publish Announcement
              </button>
            </form>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 lg:col-span-2 space-y-4">
            <h2 className="text-base font-bold text-white">Active Announcements in Firestore ({announcementsList.length})</h2>
            <div className="space-y-3">
              {announcementsList.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No announcements published yet.
                </div>
              ) : (
                announcementsList.map((item) => (
                  <div key={item.id || item.title} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
                        {item.target}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{item.title}</h4>
                      <p className="text-xs text-slate-300 mt-1">{item.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2">By: {item.createdBy} • {item.createdAt}</p>
                    </div>
                    {item.id && (
                      <button
                        onClick={() => handleDeleteAnnouncement(item.id!)}
                        className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded cursor-pointer"
                        title="Archive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: SETTINGS / SCHOOL (settings/school) */}
      {activeAdminTab === 'settings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <div className="mb-4">
            <h2 className="text-base font-bold text-white">School Profile & Identity (settings/school)</h2>
            <p className="text-xs text-slate-400">
              Schema: schoolName, registrationNumber, address, phone, email, logoURL, motto, website
            </p>
          </div>

          <form onSubmit={handleSaveSettings} className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-300 mb-1">School Name *</label>
              <input
                type="text"
                value={schoolSettings.schoolName}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, schoolName: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">NECTA Registration Number *</label>
              <input
                type="text"
                value={schoolSettings.registrationNumber}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, registrationNumber: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Motto *</label>
              <input
                type="text"
                value={schoolSettings.motto}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, motto: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Official Website</label>
              <input
                type="text"
                value={schoolSettings.website}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, website: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Telephone Contacts *</label>
              <input
                type="text"
                value={schoolSettings.phone}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, phone: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Official Email *</label>
              <input
                type="email"
                value={schoolSettings.email}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, email: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-300 mb-1">Address *</label>
              <input
                type="text"
                value={schoolSettings.address}
                onChange={(e) => setSchoolSettings({ ...schoolSettings, address: e.target.value })}
                className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                className="py-2.5 px-6 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md transition cursor-pointer"
              >
                Save School Settings
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
