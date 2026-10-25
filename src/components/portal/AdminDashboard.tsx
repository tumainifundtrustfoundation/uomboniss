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
  Film,
  FolderOpen,
  Video,
  Clock,
  Ban,
  CheckSquare,
  Square,
  Edit,
  ShieldAlert,
  UserX,
  PlayCircle,
} from 'lucide-react';
import { useData } from '../../context/DataContext';
import { AdminSchoolVideosTab } from '../admin/AdminSchoolVideosTab';
import { AdminAdmissionDocsTab } from '../admin/AdminAdmissionDocsTab';
import { useAuth } from '../../context/AuthContext';
import { SchoolLogo } from '../SchoolLogo';
import { UserProfile, UserRole, UserStatus, db, auth, handleFirestoreError, OperationType } from '../../lib/firebase';
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
  const {
    user,
    userProfile,
    updateUserRoleByAdmin,
    updateUserRbacByAdmin,
    loginWithDemoRole,
    loginWithTestPendingUser,
    loginWithTestDisabledUser,
  } = useAuth();
  const { schoolVideos, joiningDocs } = useData();
  const [activeAdminTab, setActiveAdminTab] = useState<
    'users' | 'students' | 'teachers' | 'academics' | 'exams' | 'announcements' | 'videos' | 'documents' | 'settings'
  >('users');

  // Users state
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'disabled'>('all');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // RBAC Assignment Modal State
  const [editingRbacUser, setEditingRbacUser] = useState<UserProfile | null>(null);
  const [rbacFormRole, setRbacFormRole] = useState<UserRole>('teacher');
  const [rbacFormStatus, setRbacFormStatus] = useState<UserStatus>('approved');
  const [rbacFormDepartments, setRbacFormDepartments] = useState<string[]>([]);
  const [rbacFormSubjects, setRbacFormSubjects] = useState<string[]>([]);
  const [rbacFormClasses, setRbacFormClasses] = useState<string[]>([]);
  const [isSavingRbac, setIsSavingRbac] = useState(false);

  const AVAILABLE_DEPARTMENTS = [
    'Utawala Mkuu (Executive Administration)',
    'Taaluma (Academic Affairs)',
    'Sayansi (Science Department)',
    'Lugha (Languages Department)',
    'Sanaa (Humanities & Social Studies)',
    'Biashara (Commercial Department)',
    'Uhasibu (Accounts & Finance)',
    'Nidhamu (Discipline)',
    'Malezi na Bweni (Boarding & Welfare)',
    'Michezo (Sports & Extracurricular)',
    'TEHAMA (ICT & Computer Studies)',
  ];

  const AVAILABLE_SUBJECTS = [
    'Civics',
    'History',
    'Geography',
    'Kiswahili',
    'English Language',
    'Physics',
    'Chemistry',
    'Biology',
    'Basic Mathematics',
    'Commerce',
    'Bookkeeping',
    'Religious Education',
  ];

  const AVAILABLE_CLASSES = [
    'Kidato cha 1 (Form 1)',
    'Kidato cha 2 (Form 2)',
    'Kidato cha 3 (Form 3)',
    'Kidato cha 4 (Form 4)',
  ];

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
      status: 'approved',
      assignedDepartments: ['Utawala Mkuu (Executive Administration)', 'Taaluma (Academic Affairs)'],
      assignedSubjects: [
        'Civics', 'History', 'Geography', 'Kiswahili', 'English Language',
        'Physics', 'Chemistry', 'Biology', 'Basic Mathematics', 'Commerce',
        'Bookkeeping', 'Religious Education'
      ],
      assignedClasses: ['Kidato cha 1 (Form 1)', 'Kidato cha 2 (Form 2)', 'Kidato cha 3 (Form 3)', 'Kidato cha 4 (Form 4)'],
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'academic-001',
      fullName: 'Mwl. Yohana Bahati',
      email: 'yohana.bahati@uombonisec.ac.tz',
      phone: '+255 745 548 225',
      role: 'academic_master',
      status: 'approved',
      assignedDepartments: ['Taaluma (Academic Affairs)', 'Sayansi (Science Department)'],
      assignedSubjects: ['Physics', 'Basic Mathematics'],
      assignedClasses: ['Kidato cha 3 (Form 3)', 'Kidato cha 4 (Form 4)'],
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'tch-005',
      fullName: 'Mwl. Endrew Benson',
      email: 'endrew.benson@uombonisec.ac.tz',
      phone: '+255 784 921 506',
      role: 'teacher',
      status: 'approved',
      assignedDepartments: ['Sayansi (Science Department)'],
      assignedSubjects: ['Biology', 'Chemistry'],
      assignedClasses: ['Kidato cha 1 (Form 1)', 'Kidato cha 2 (Form 2)'],
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'usr-pending-001',
      fullName: 'Mwl. Peter Kimaro (Maombi Mapya)',
      email: 'peter.kimaro@uombonisec.ac.tz',
      phone: '+255 768 114 209',
      role: 'teacher',
      status: 'pending',
      assignedDepartments: ['Lugha (Languages Department)'],
      assignedSubjects: ['English Language'],
      assignedClasses: ['Kidato cha 1 (Form 1)'],
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
    },
    {
      uid: 'usr-disabled-001',
      fullName: 'Mtumishi wa Zamani (Aliyehamishwa)',
      email: 'zamani@uombonisec.ac.tz',
      phone: '+255 711 222 333',
      role: 'teacher',
      status: 'disabled',
      assignedDepartments: ['Sayansi (Science Department)'],
      assignedSubjects: ['Chemistry'],
      assignedClasses: [],
      school: 'UOMBONI SECONDARY SCHOOL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      emailVerified: true,
      rejectionReason: 'Akaunti imesitishwa kufuatia uhamisho wa kituo cha kazi.',
    },
    {
      uid: 'usr-002',
      fullName: 'Baraka J. Kimaro',
      email: 'baraka@uomboni.sc.tz',
      phone: '+255 754 112 233',
      role: 'student',
      status: 'approved',
      assignedDepartments: [],
      assignedSubjects: [],
      assignedClasses: ['Kidato cha 4 (Form 4)'],
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
    setLoadingUsers(true);
    try {
      if (auth.currentUser) {
        const snap = await getDocs(collection(db, 'users'));
        const list: UserProfile[] = [];
        snap.forEach((d) => {
          const raw = d.data();
          if (raw) {
            list.push({
              uid: d.id || raw.uid || '',
              fullName: raw.fullName || raw.name || raw.displayName || (raw.email ? raw.email.split('@')[0] : 'Mtumishi'),
              email: raw.email || '',
              phone: raw.phone || '',
              role: (raw.role as UserRole) || 'teacher',
              status: (raw.status as UserStatus) || 'pending',
              assignedDepartments: Array.isArray(raw.assignedDepartments) ? raw.assignedDepartments : [],
              assignedSubjects: Array.isArray(raw.assignedSubjects) ? raw.assignedSubjects : [],
              assignedClasses: Array.isArray(raw.assignedClasses) ? raw.assignedClasses : [],
              school: raw.school || 'UOMBONI SECONDARY SCHOOL',
              createdAt: raw.createdAt || new Date().toISOString(),
              updatedAt: raw.updatedAt || new Date().toISOString(),
              emailVerified: Boolean(raw.emailVerified),
              rejectionReason: raw.rejectionReason || '',
            } as UserProfile);
          }
        });
        if (list.length > 0) {
          setUsersList(list);
          setLoadingUsers(false);
          return;
        }
      }
      // Also query server backend for stored users
      try {
        const serverRes = await fetch('/api/admin/users');
        if (serverRes.ok) {
          const sJson = await serverRes.json();
          if (sJson.success && Array.isArray(sJson.users) && sJson.users.length > 0) {
            const mapped: UserProfile[] = sJson.users.map((raw: any) => ({
              uid: raw.uid || raw.id || '',
              fullName: raw.fullName || raw.name || raw.displayName || (raw.email ? raw.email.split('@')[0] : 'Mtumishi'),
              email: raw.email || '',
              phone: raw.phone || '',
              role: (raw.role as UserRole) || 'teacher',
              status: (raw.status as UserStatus) || 'pending',
              assignedDepartments: Array.isArray(raw.assignedDepartments) ? raw.assignedDepartments : [],
              assignedSubjects: Array.isArray(raw.assignedSubjects) ? raw.assignedSubjects : [],
              assignedClasses: Array.isArray(raw.assignedClasses) ? raw.assignedClasses : [],
              school: raw.school || 'UOMBONI SECONDARY SCHOOL',
              createdAt: raw.createdAt || new Date().toISOString(),
              updatedAt: raw.updatedAt || new Date().toISOString(),
              emailVerified: Boolean(raw.emailVerified),
              rejectionReason: raw.rejectionReason || '',
            }));
            setUsersList(mapped);
            setLoadingUsers(false);
            return;
          }
        }
      } catch (e) {}

      setUsersList(fallbackUsersList);
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
    const res = await updateUserRbacByAdmin(targetUid, { role: newRole });
    if (res.success) {
      setStatusMessage({ type: 'success', text: `Jukumu la mtumiaji limesasishwa kuwa "${newRole}" kikamilifu.` });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, role: newRole } : u))
      );
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Imeshindwa kubadilisha jukumu.' });
    }
  };

  const handleQuickApprove = async (targetUid: string) => {
    setStatusMessage(null);
    const targetUser = usersList.find((u) => u.uid === targetUid);
    const defaultSubjects = targetUser?.assignedSubjects && targetUser.assignedSubjects.length > 0
      ? targetUser.assignedSubjects
      : (targetUser?.role === 'teacher' ? ['Chemistry', 'Biology'] : []);

    const res = await updateUserRbacByAdmin(targetUid, {
      status: 'approved',
      assignedSubjects: defaultSubjects,
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: `Akaunti ya mtumiaji imethibitishwa na kuidhinishwa kikamilifu.` });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, status: 'approved', assignedSubjects: defaultSubjects } : u))
      );
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Imeshindwa kuidhinisha akaunti.' });
    }
  };

  const handleQuickDisable = async (targetUid: string) => {
    setStatusMessage(null);
    const res = await updateUserRbacByAdmin(targetUid, {
      status: 'disabled',
      rejectionReason: 'Akaunti imesitishwa na Msimamizi Mkuu kwa ajili ya ukaguzi wa kiusalama.',
    });

    if (res.success) {
      setStatusMessage({ type: 'success', text: `Akaunti ya mtumiaji imesitishwa (disabled) kikamilifu.` });
      setUsersList((prev) =>
        prev.map((u) => (u.uid === targetUid ? { ...u, status: 'disabled' } : u))
      );
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Imeshindwa kusitisha akaunti.' });
    }
  };

  const handleOpenRbacModal = (u: UserProfile) => {
    setEditingRbacUser(u);
    setRbacFormRole(u.role || 'teacher');
    setRbacFormStatus(u.status || 'approved');
    setRbacFormDepartments(u.assignedDepartments || []);
    setRbacFormSubjects(u.assignedSubjects || []);
    setRbacFormClasses(u.assignedClasses || []);
  };

  const handleToggleSubject = (subj: string) => {
    setRbacFormSubjects((prev) =>
      prev.includes(subj) ? prev.filter((s) => s !== subj) : [...prev, subj]
    );
  };

  const handleToggleDepartment = (dept: string) => {
    setRbacFormDepartments((prev) =>
      prev.includes(dept) ? prev.filter((d) => d !== dept) : [...prev, dept]
    );
  };

  const handleToggleClass = (cls: string) => {
    setRbacFormClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSaveRbacModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRbacUser) return;
    setIsSavingRbac(true);
    setStatusMessage(null);

    const res = await updateUserRbacByAdmin(editingRbacUser.uid, {
      role: rbacFormRole,
      status: rbacFormStatus,
      assignedDepartments: rbacFormDepartments,
      assignedSubjects: rbacFormSubjects,
      assignedClasses: rbacFormClasses,
    });

    if (res.success) {
      setStatusMessage({
        type: 'success',
        text: `Marekebisho ya jukumu, hali, vitengo (${rbacFormDepartments.length}), na masomo (${rbacFormSubjects.length}) yamehifadhiwa kikamilifu.`,
      });
      setUsersList((prev) =>
        prev.map((u) =>
          u.uid === editingRbacUser.uid
            ? {
                ...u,
                role: rbacFormRole,
                status: rbacFormStatus,
                assignedDepartments: rbacFormDepartments,
                assignedSubjects: rbacFormSubjects,
                assignedClasses: rbacFormClasses,
              }
            : u
        )
      );
      setEditingRbacUser(null);
    } else {
      setStatusMessage({ type: 'error', text: res.error || 'Imeshindwa kuhifadhi taarifa za RBAC.' });
    }
    setIsSavingRbac(false);
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

  const filteredUsers = (usersList || []).filter((u) => {
    if (!u) return false;
    const search = (searchTerm || '').toLowerCase().trim();
    const fullName = (u.fullName || '').toLowerCase();
    const email = (u.email || '').toLowerCase();
    const phone = u.phone || '';
    const uid = (u.uid || '').toLowerCase();

    const matchesSearch =
      !search ||
      fullName.includes(search) ||
      email.includes(search) ||
      uid.includes(search) ||
      phone.includes(search);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return Boolean(matchesSearch && matchesRole && matchesStatus);
  });

  const pendingCount = (usersList || []).filter((u) => u?.status === 'pending').length;

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
                  Official Schema & RBAC Management Hub
                </span>
                <span className="text-xs text-slate-400">Marangu Magharibi, Moshi • Reg: {schoolSettings.registrationNumber}</span>
              </div>
              <h1 className="font-serif text-xl sm:text-2xl font-bold">
                {schoolSettings.schoolName}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Motto: <span className="text-amber-300 font-semibold">{schoolSettings.motto}</span> • Mfumo Madhubuti wa Usimamizi wa Ruhusa (RBAC), Vitengo vya Walimu na Usalama wa Data
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
          { id: 'users', label: `Watumiaji & Ruhusa (${usersList.length})${pendingCount > 0 ? ` [${pendingCount} Pending]` : ''}`, icon: Users },
          { id: 'students', label: `Wanafunzi (${studentsList.length})`, icon: GraduationCap },
          { id: 'teachers', label: `Walimu Rasmi (${teachersList.length})`, icon: UserCheck },
          { id: 'academics', label: `Madarasa & Masomo (${classesList.length}/${subjectsList.length})`, icon: BookOpen },
          { id: 'exams', label: `Mitihani & Matokeo (${examsList.length})`, icon: FileSpreadsheet },
          { id: 'announcements', label: `Matangazo (${announcementsList.length})`, icon: Megaphone },
          { id: 'videos', label: `Video za YouTube (${schoolVideos.length})`, icon: Film },
          { id: 'documents', label: `Nyaraka za Drive (${joiningDocs.length})`, icon: FolderOpen },
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

      {/* TAB 1: USERS & RBAC (users/{uid}) */}
      {activeAdminTab === 'users' && (
        <div className="space-y-6">
          {/* Security Testing Toolbar */}
          <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-500/10 border border-amber-500/30 rounded-2xl p-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                  <ShieldCheck className="w-4 h-4" />
                  Zana ya Kujaribu Ruhusa za Mfumo (RBAC Security Test Bar)
                </div>
                <p className="text-xs text-slate-300">
                  Jaribu majukumu 5 ya kiusalama ili kuhakiki kuwa akaunti zisizoidhinishwa zimezuiwa na walimu wanaona masomo yao pekee:
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => loginWithDemoRole('admin')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/80 hover:bg-rose-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Jaribu kuingia kama Msimamizi Mkuu (Admin)"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  1. Admin
                </button>
                <button
                  onClick={() => loginWithDemoRole('academic_master')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/80 hover:bg-indigo-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Jaribu kuingia kama Academic Master"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  2. Academic Master
                </button>
                <button
                  onClick={() => loginWithDemoRole('teacher')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600/80 hover:bg-amber-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Jaribu kuingia kama Mwalimu wa Somo"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  3. Teacher
                </button>
                <button
                  onClick={() => loginWithTestPendingUser()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-yellow-600/80 hover:bg-yellow-500 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Jaribu kuingia na akaunti inayosubiri (Pending)"
                >
                  <Clock className="w-3.5 h-3.5" />
                  4. Jaribu Pending (Zuia)
                </button>
                <button
                  onClick={() => loginWithTestDisabledUser()}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-700 hover:bg-slate-600 text-white shadow-sm flex items-center gap-1.5 cursor-pointer"
                  title="Jaribu kuingia na akaunti iliyositishwa (Disabled)"
                >
                  <Ban className="w-3.5 h-3.5" />
                  5. Jaribu Disabled (Zuia)
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Usimamizi wa Akaunti na Ruhusa (Users & RBAC - users/{'{uid}'})
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  UID ndio utambulisho wa kipekee. Akaunti zote mpya zina status ya <span className="text-amber-400 font-bold">pending</span> kwa chaguo-msingi. Admin pekee anaweza kuidhinisha, kupangia vitengo, na masomo.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tafuta jina, barua pepe, au namba..."
                    className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">Majukumu Yote (All Roles)</option>
                  <option value="admin">Admin (Msimamizi Mkuu)</option>
                  <option value="academic_master">Academic Master (Taaluma)</option>
                  <option value="teacher">Walimu (Teachers)</option>
                  <option value="student">Wanafunzi (Students)</option>
                  <option value="bursar">Mhasibu (Bursar)</option>
                </select>
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 text-xs">
              <span className="text-slate-400 font-bold text-[11px] uppercase mr-1">Chuja kwa Hali:</span>
              {[
                { id: 'all', label: `Wote (${usersList.length})` },
                { id: 'pending', label: `Inayosubiri / Pending (${usersList.filter((u) => u?.status === 'pending').length})`, badgeColor: 'bg-amber-500/20 text-amber-300' },
                { id: 'approved', label: `Waliothibitishwa / Approved (${usersList.filter((u) => u?.status === 'approved').length})`, badgeColor: 'bg-emerald-500/20 text-emerald-300' },
                { id: 'disabled', label: `Waliositishwa / Disabled (${usersList.filter((u) => u?.status === 'disabled').length})`, badgeColor: 'bg-rose-500/20 text-rose-300' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id as any)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                    statusFilter === s.id
                      ? 'bg-blue-600 text-white shadow'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs text-slate-300 min-w-[900px]">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-bold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-3">Mtumiaji & UID</th>
                    <th className="py-3 px-3">Jukumu (Role)</th>
                    <th className="py-3 px-3">Hali (Status)</th>
                    <th className="py-3 px-3">Vitengo Vilivyopangiwa</th>
                    <th className="py-3 px-3">Masomo Yaliyopangiwa</th>
                    <th className="py-3 px-3 text-right">Hatua za Usimamizi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Hakuna mtumiaji anayelingana na vigezo vilivyochaguliwa.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u, uIdx) => (
                      <tr key={u.uid || `user-${uIdx}`} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <span>{u.fullName || u.email || 'Mtumishi / Mtumiaji'}</span>
                            {u.emailVerified && (
                              <span title="Email Verified" className="inline-flex">
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.email || '—'}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">UID: {u.uid ? `${u.uid.slice(0, 14)}...` : 'N/A'}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : u.role === 'academic_master'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                : u.role === 'teacher'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : u.role === 'bursar'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          {u.status === 'approved' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              <CheckCircle2 className="w-3 h-3" /> Approved
                            </span>
                          )}
                          {u.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/40 animate-pulse">
                              <Clock className="w-3 h-3" /> Pending Review
                            </span>
                          )}
                          {u.status === 'disabled' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              <Ban className="w-3 h-3" /> Disabled
                            </span>
                          )}
                          {u.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500/10 text-slate-400 border border-slate-500/30">
                              <UserX className="w-3 h-3" /> Rejected
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          {u.assignedDepartments && u.assignedDepartments.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {u.assignedDepartments.map((dept, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 text-blue-300 border border-blue-500/20"
                                >
                                  {dept.split('(')[0].trim()}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">Bila kitengo</span>
                          )}
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          {u.assignedSubjects && u.assignedSubjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {u.assignedSubjects.map((subj, idx) => (
                                <span
                                  key={idx}
                                  className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                                >
                                  {subj}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
                              {u.role === 'admin' || u.role === 'academic_master' ? 'Masomo Yote' : 'Hajapangiwa somo'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {u.status === 'pending' && (
                              <button
                                onClick={() => handleQuickApprove(u.uid)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer"
                                title="Idhinisha akaunti hii mara moja"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Idhinisha
                              </button>
                            )}
                            {u.status === 'approved' && u.uid !== user?.uid && (
                              <button
                                onClick={() => handleQuickDisable(u.uid)}
                                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                title="Sitisha uwezo wa mtumiaji kuingia ndani ya mfumo"
                              >
                                <Ban className="w-3 h-3" />
                                Sitisha
                              </button>
                            )}
                            {u.status === 'disabled' && (
                              <button
                                onClick={() => handleQuickApprove(u.uid)}
                                className="px-2 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/40 text-[11px] font-medium flex items-center gap-1 cursor-pointer"
                                title="Rejesha akaunti hii"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                Rejesha
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenRbacModal(u)}
                              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                              title="Hariri jukumu, hali, vitengo na masomo yaliyopangiwa"
                            >
                              <Edit className="w-3 h-3 text-blue-400" />
                              Hariri RBAC
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* RBAC EDIT MODAL */}
          {editingRbacUser && (
            <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-blue-400" />
                      Usimamizi wa Ruhusa za Ndani (RBAC Assignment)
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Weka jukumu, hali ya akaunti, vitengo rasmi vya shule na masomo ya kufundisha.
                    </p>
                  </div>
                  <button
                    onClick={() => setEditingRbacUser(null)}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                  <div className="font-bold text-white">{editingRbacUser.fullName}</div>
                  <div className="text-slate-400 font-mono text-[11px]">{editingRbacUser.email}</div>
                  <div className="text-slate-500 font-mono text-[10px] mt-1">UID: {editingRbacUser.uid}</div>
                </div>

                <form onSubmit={handleSaveRbacModal} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Role Selector */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Jukumu la Mtumiaji (Role) *</label>
                      <select
                        value={rbacFormRole}
                        onChange={(e) => setRbacFormRole(e.target.value as UserRole)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="teacher">Teacher (Mwalimu wa Somo)</option>
                        <option value="academic_master">Academic Master (Mkuu wa Taaluma)</option>
                        <option value="admin">Administrator (Msimamizi Mkuu)</option>
                        <option value="bursar">Bursar (Mhasibu wa Shule)</option>
                        <option value="student">Student (Mwanafunzi)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Mwalimu wa kawaida ataona masomo aliyopangiwa pekee wakati wa kuingiza matokeo.
                      </p>
                    </div>

                    {/* Status Selector */}
                    <div>
                      <label className="block text-slate-300 font-bold mb-1">Hali ya Akaunti (Status) *</label>
                      <select
                        value={rbacFormStatus}
                        onChange={(e) => setRbacFormStatus(e.target.value as UserStatus)}
                        className="w-full p-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500 cursor-pointer"
                      >
                        <option value="approved">Approved (Imeidhinishwa - Anaweza kuingia)</option>
                        <option value="pending">Pending (Inasubiri idhini - Ufikiaji umezuiwa)</option>
                        <option value="disabled">Disabled (Imesitishwa - Ufikiaji umezuiwa)</option>
                        <option value="rejected">Rejected (Imekataliwa)</option>
                      </select>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Akaunti yoyote isiyo 'approved' itaonyeshwa ukurasa rasmi wa "HUJAIDHINISHWA KUTUMIA MFUMO".
                      </p>
                    </div>
                  </div>

                  {/* Assigned Departments */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                      <span>Vitengo Rasmi vya Shule (Assigned Departments)</span>
                      <span className="text-[10px] text-blue-400 font-normal">
                        Vimechaguliwa: {rbacFormDepartments.length}
                      </span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                      {AVAILABLE_DEPARTMENTS.map((dept) => {
                        const checked = rbacFormDepartments.includes(dept);
                        return (
                          <label
                            key={dept}
                            className={`flex items-start gap-2 p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                              checked ? 'bg-blue-600/20 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleDepartment(dept)}
                              className="mt-0.5 rounded text-blue-500 focus:ring-0"
                            />
                            <span>{dept}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Subjects */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                      <span>Masomo ya Kufundisha & Kuingiza Alama (Assigned Subjects)</span>
                      <span className="text-[10px] text-emerald-400 font-normal">
                        Yamechaguliwa: {rbacFormSubjects.length}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl">
                      {AVAILABLE_SUBJECTS.map((subj) => {
                        const checked = rbacFormSubjects.includes(subj);
                        return (
                          <label
                            key={subj}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                              checked ? 'bg-emerald-600/20 text-emerald-200 font-semibold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleSubject(subj)}
                              className="rounded text-emerald-500 focus:ring-0"
                            />
                            <span>{subj}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Assigned Classes */}
                  <div>
                    <label className="block text-slate-300 font-bold mb-1.5 flex items-center justify-between">
                      <span>Madarasa Anayofundisha (Assigned Classes)</span>
                      <span className="text-[10px] text-purple-400 font-normal">
                        Yamechaguliwa: {rbacFormClasses.length}
                      </span>
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                      {AVAILABLE_CLASSES.map((cls) => {
                        const checked = rbacFormClasses.includes(cls);
                        return (
                          <label
                            key={cls}
                            className={`flex items-center gap-2 p-1.5 rounded-lg text-[11px] cursor-pointer transition-colors ${
                              checked ? 'bg-purple-600/20 text-purple-200 font-semibold' : 'text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => handleToggleClass(cls)}
                              className="rounded text-purple-500 focus:ring-0"
                            />
                            <span>{cls}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setEditingRbacUser(null)}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white font-bold cursor-pointer"
                    >
                      Ghairi
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingRbac}
                      className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
                    >
                      {isSavingRbac ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Inahifadhi...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Hifadhi Mamlaka (Save RBAC)</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
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

      {/* TAB 8: YOUTUBE SCHOOL VIDEOS */}
      {activeAdminTab === 'videos' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <AdminSchoolVideosTab />
        </div>
      )}

      {/* TAB 9: GOOGLE DRIVE DOCUMENTS */}
      {activeAdminTab === 'documents' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
          <AdminAdmissionDocsTab />
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
