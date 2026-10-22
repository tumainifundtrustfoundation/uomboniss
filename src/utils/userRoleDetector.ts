import { UserRole } from '../lib/firebase';
import { TEACHER_AUTH_DIRECTORY } from '../services/teacherAuthDirectory';

export interface DetectedRoleInfo {
  role: UserRole;
  labelSw: string;
  labelEn: string;
  badgeColor: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  descriptionSw: string;
  descriptionEn: string;
  matchedField?: string;
  matchedName?: string;
}

/**
 * Intelligently and automatically identifies the user's role from any input identifier:
 * - Student NECTA candidate number (e.g. S0486/0014/2026, S0486, 0014), student name or student email
 * - Parent telephone number (e.g. 0754..., 07..., +255...), parent email or parent keywords
 * - Teacher email, teacher name, or faculty keyword (e.g. temu, bahati, benson, etc.)
 * - School Administrator / Headmaster (e.g. adolphmassawe, headmaster, admin, etc.)
 * - Bursar / Accountant (e.g. bursar, mhasibu, minja, etc.)
 */
export function detectUserRoleFromIdentifier(identifier: string): DetectedRoleInfo {
  const raw = (identifier || '').trim();
  const lower = raw.toLowerCase();

  // Default empty fallback
  if (!raw) {
    return {
      role: 'student',
      labelSw: 'Mtumiaji wa Shule',
      labelEn: 'School Community',
      badgeColor: 'bg-slate-100 text-slate-700 border-slate-200',
      bgLight: 'bg-slate-50',
      borderLight: 'border-slate-200',
      textLight: 'text-slate-700',
      descriptionSw: 'Weka Namba ya Mtihani, Simu ya Mzazi, Username au Barua Pepe',
      descriptionEn: 'Enter Exam Number, Parent Phone, Username or Email',
    };
  }

  // 1. ADMIN / HEADMASTER RECOGNITION
  const adminKeywords = [
    'admin',
    'headmaster',
    'mkuu',
    'adolph',
    'adolphmassawe',
    'tumaini',
    'tumainifundtrustfoundation',
    'uongozi',
  ];
  if (adminKeywords.some((k) => lower === k || lower.startsWith(k) || lower.includes(`@${k}`) || lower.includes(k))) {
    return {
      role: 'admin',
      labelSw: '👑 Utawala Mkuu (Admin / Headmaster)',
      labelEn: '👑 Administration / Headmaster',
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      bgLight: 'bg-emerald-50',
      borderLight: 'border-emerald-300',
      textLight: 'text-emerald-900',
      descriptionSw: 'Udhibiti Kamili wa Mfumo, Walimu, Udahili & Ripoti za Shule',
      descriptionEn: 'Full Administration Control, Teachers, Admissions & School Records',
      matchedField: 'Utawala wa Shule',
    };
  }

  // 2. BURSAR / ACCOUNTANT RECOGNITION
  const bursarKeywords = ['bursar', 'mhasibu', 'uhasibu', 'accounts', 'finance'];
  if (bursarKeywords.some((k) => lower.includes(k))) {
    return {
      role: 'bursar',
      labelSw: '💳 Mhasibu wa Shule (Bursar Portal)',
      labelEn: '💳 School Bursar / Finance',
      badgeColor: 'bg-teal-100 text-teal-900 border-teal-300',
      bgLight: 'bg-teal-50',
      borderLight: 'border-teal-300',
      textLight: 'text-teal-900',
      descriptionSw: 'Usimamizi wa Ada, Stakabadhi za Malipo & Benki',
      descriptionEn: 'School Fees Reconciliation, Receipts & Bank Accounts',
      matchedField: 'Ofisi ya Uhasibu',
    };
  }

  // 3. TEACHER / ACADEMIC FACULTY RECOGNITION
  // Check exact teacher directory entries or teacher names
  const knownTeachers = Object.values(TEACHER_AUTH_DIRECTORY);
  const matchedTeacher = knownTeachers.find((t) => {
    const tEmail = t.email.toLowerCase();
    const tName = t.name.toLowerCase();
    const tId = t.id.toLowerCase();
    const tPhone = (t.phone || '').replace(/[^0-9]/g, '');
    const cleanInputDigits = lower.replace(/[^0-9]/g, '');

    if (lower === tEmail || lower === tId) return true;
    if (tName.includes(lower) && lower.length >= 4) return true;
    if (cleanInputDigits.length >= 7 && tPhone.includes(cleanInputDigits)) return true;
    return false;
  });

  const teacherGeneralKeywords = [
    'teacher',
    'walimu',
    'mwalimu',
    'mwl',
    'academic',
    'taaluma',
    'secondmaster',
    'makamu',
    'discipline',
    'nidhamu',
    'uombonisec.ac.tz',
    'temu',
    'bahati',
    'benson',
    'kimaro',
    'witness',
    'herman',
    'mtei',
    'manyanga',
    'temba',
    'minja',
  ];

  if (matchedTeacher || teacherGeneralKeywords.some((k) => lower.includes(k))) {
    return {
      role: 'teacher',
      labelSw: matchedTeacher
        ? `👨‍🏫 Mwalimu: ${matchedTeacher.name}`
        : '👨‍🏫 Mwalimu / Taaluma (Teacher Portal)',
      labelEn: matchedTeacher
        ? `👨‍🏫 Teacher: ${matchedTeacher.name}`
        : '👨‍🏫 Faculty / Teacher Portal',
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300',
      bgLight: 'bg-blue-50',
      borderLight: 'border-blue-300',
      textLight: 'text-blue-900',
      descriptionSw: 'Uingizaji wa Alama za Mitihani & Ratiba ya Masomo',
      descriptionEn: 'Score Entry, Exam Broadsheets & Subject Management',
      matchedField: matchedTeacher ? matchedTeacher.name : 'Kitivo cha Walimu',
      matchedName: matchedTeacher?.name,
    };
  }

  // 4. PARENT / GUARDIAN RECOGNITION
  // A phone number pattern (Tanzanian format e.g. 07xx, 06xx, +255xx, 255xx) or contains parent keywords
  const isPhoneNumber =
    /^(?:\+?255|0)[67]\d{8}$/.test(raw.replace(/[\s-]/g, '')) ||
    (raw.replace(/[^0-9]/g, '').length >= 9 && raw.replace(/[^0-9]/g, '').length <= 13 && !raw.includes('/'));

  const parentKeywords = ['parent', 'mzazi', 'mlezi', 'wazazi', 'baba', 'mama', 'guardian'];

  if (isPhoneNumber || parentKeywords.some((k) => lower.includes(k))) {
    return {
      role: 'parent',
      labelSw: '👨‍👩‍👧 Mzazi / Mlezi (Parent Portal)',
      labelEn: '👨‍👩‍👧 Parent / Guardian Portal',
      badgeColor: 'bg-amber-100 text-amber-950 border-amber-300',
      bgLight: 'bg-amber-50',
      borderLight: 'border-amber-300',
      textLight: 'text-amber-950',
      descriptionSw: 'Maendeleo ya Taaluma ya Mtoto, Malipo ya Ada & Notisi za Shule',
      descriptionEn: 'Student Academic Progress, Fees Invoicing & School Circulars',
      matchedField: isPhoneNumber ? 'Namba ya Simu ya Mzazi' : 'Akaunti ya Mzazi',
    };
  }

  // 5. STUDENT RECOGNITION (Default for Candidate Numbers like S0486/..., S.0486/..., Form Numbers, or Student Names)
  const isNectaCandidatePattern =
    lower.startsWith('s0486') ||
    lower.startsWith('s.0486') ||
    lower.startsWith('s0') ||
    lower.startsWith('s.') ||
    lower.includes('/0486') ||
    lower.includes('/202') ||
    lower.includes('/') ||
    lower.includes('student') ||
    lower.includes('mwanafunzi') ||
    lower.includes('kelvin') ||
    lower.includes('form') ||
    lower.includes('kidato');

  // Any other input defaults to student with helpful auto-detection badge
  return {
    role: 'student',
    labelSw: isNectaCandidatePattern
      ? '🎓 Mwanafunzi (NECTA S0486 Student Portal)'
      : '🎓 Mwanafunzi (Student Portal)',
    labelEn: '🎓 Student Portal',
    badgeColor: 'bg-purple-100 text-purple-900 border-purple-300',
    bgLight: 'bg-purple-50',
    borderLight: 'border-purple-300',
    textLight: 'text-purple-900',
    descriptionSw: 'Matokeo Rasmi ya Mitihani, Ripoti za Maendeleo & Ratiba',
    descriptionEn: 'Official Examination Results, Progress Reports & Timetable',
    matchedField: isNectaCandidatePattern ? 'Namba ya Mtihani ya NECTA' : 'Mwanafunzi',
  };
}
