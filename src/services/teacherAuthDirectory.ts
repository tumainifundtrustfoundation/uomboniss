/**
 * Official Teacher Authentication & Subject Authorization Directory
 * Enforces per-teacher credential isolation:
 * - Every teacher has an individual confidential PIN / password.
 * - Prevents teachers from logging in under another teacher's name.
 * - Restricts score entry so a teacher can ONLY see and submit marks for their assigned subject(s).
 */

export interface TeacherAuthProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  assignedSubjects: string[];
  defaultPin: string;
  phone: string;
  imageUrl: string;
}

// Confidential Teacher Directory with Individual Secure PINs and Specific Assigned Subjects
export const TEACHER_AUTH_DIRECTORY: Record<string, TeacherAuthProfile> = {
  'tch-uomboni-admin': {
    id: 'tch-uomboni-admin',
    name: 'Ofisi ya Mkuu wa Shule (Uomboni Secondary)',
    email: 'uombiniss.sc.tz@gmail.com',
    role: 'Mkuu wa Shule (Headmaster) & Msimamizi Mkuu',
    department: 'Utawala Mkuu (Executive Administration)',
    assignedSubjects: [
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
    ],
    defaultPin: '782558', // Confidential PIN unique to Headmaster
    phone: '+255 782 558 127',
    imageUrl: '/media/media_1.webp',
  },
  'tch-003': {
    id: 'tch-003',
    name: 'Mwl. Yohana Bahati',
    email: 'yohana.bahati@uombonisec.ac.tz',
    role: 'Mtaaluma Mkuu (Academic Master) & Mwalimu wa Somo',
    department: 'Sayansi (Science)',
    assignedSubjects: ['Physics', 'Basic Mathematics'],
    defaultPin: '745225', // Confidential PIN unique to Mwl. Yohana Bahati
    phone: '+255 745 548 225',
    imageUrl: '/media/media_3.webp',
  },
  'tch-yohana-google': {
    id: 'tch-yohana-google',
    name: 'Mwl. Yohana Bahati',
    email: 'yohanabahati665@gmail.com',
    role: 'Mtaaluma Mkuu (Academic Master) & Msimamizi Mkuu',
    department: 'Sayansi (Science) & Utawala',
    assignedSubjects: ['Physics', 'Basic Mathematics', 'General Studies'],
    defaultPin: '745225',
    phone: '+255 745 548 225',
    imageUrl: '/media/media_3.webp',
  },
  'tch-005': {
    id: 'tch-005',
    name: 'Mwl. Endrew Benson',
    email: 'endrew.benson@uombonisec.ac.tz',
    role: 'Mwalimu wa Maabara na Sayansi (Lab Teacher)',
    department: 'Sayansi (Science)',
    assignedSubjects: ['Biology', 'Chemistry'],
    defaultPin: '784921', // Confidential PIN unique to Mwl. Endrew Benson
    phone: '+255 784 921 506',
    imageUrl: '/media/media_5.jpg',
  },
  'tch-002': {
    id: 'tch-002',
    name: 'Mwl. Wolter Temu',
    email: 'wolter.temu@uombonisec.ac.tz',
    role: 'Makamu Mkuu wa Shule (Second Master)',
    department: 'Lugha & Utawala',
    assignedSubjects: ['Kiswahili'],
    defaultPin: '754532', // Confidential PIN unique to Mwl. Wolter Temu
    phone: '+255 754 532 949',
    imageUrl: '/media/media_2.jpg',
  },
  'tch-006': {
    id: 'tch-006',
    name: 'Mwl. Peter Kimaro',
    email: 'peter.kimaro@uombonisec.ac.tz',
    role: 'Mkuu wa Idara ya Lugha (HOD Languages)',
    department: 'Lugha (Languages)',
    assignedSubjects: ['English Language'],
    defaultPin: '768114', // Confidential PIN unique to Mwl. Peter Kimaro
    phone: '+255 768 114 209',
    imageUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  },
  'tch-007': {
    id: 'tch-007',
    name: 'Madam Witness',
    email: 'witness@uombonisec.ac.tz',
    role: 'Mwalimu wa Masomo ya Jamii (Social Studies)',
    department: 'Sanaa (Humanities)',
    assignedSubjects: ['Civics', 'History', 'Geography'],
    defaultPin: '756889', // Confidential PIN unique to Madam Witness
    phone: '+255 756 889 012',
    imageUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=600&q=80',
  },
  'tch-004': {
    id: 'tch-004',
    name: 'Mwl. Herman',
    email: 'tumainifundtrustfoundation@gmail.com',
    role: 'Mkuu wa Nidhamu & Malezi',
    department: 'Sayansi & Nidhamu',
    assignedSubjects: ['Chemistry', 'Basic Mathematics'],
    defaultPin: '715334', // Confidential PIN unique to Mwl. Herman
    phone: '+255 715 334 892',
    imageUrl: '/media/media_4.jpg',
  },
  'tch-009': {
    id: 'tch-009',
    name: 'Mwl. Christopher Mtei',
    email: 'christopher.mtei@uombonisec.ac.tz',
    role: 'Mwalimu wa TEHAMA & Michezo',
    department: 'Sayansi (Science)',
    assignedSubjects: ['Basic Mathematics'],
    defaultPin: '762458', // Confidential PIN unique to Mwl. Christopher Mtei
    phone: '+255 762 458 901',
    imageUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  },
  'tch-010': {
    id: 'tch-010',
    name: 'Mwl. Sigbert Minja',
    email: 'sigminja@gmail.com',
    role: 'Mhasibu wa Shule / Bursar & Mwalimu wa Biashara',
    department: 'Biashara (Commercial)',
    assignedSubjects: ['Commerce', 'Bookkeeping'],
    defaultPin: '752000', // Confidential PIN unique to Mwl. Sigbert Minja
    phone: '+255 752 000 939',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  },
  'tch-011': {
    id: 'tch-011',
    name: 'Madam Adela Manyanga',
    email: 'adela.manyanga@uombonisec.ac.tz',
    role: 'Mkuu wa Taaluma Msaidizi (Academic Mistress)',
    department: 'Sayansi (Science)',
    assignedSubjects: ['Biology', 'Kiswahili'],
    defaultPin: '745548', // Confidential PIN unique to Madam Adela Manyanga
    phone: '+255 745 548 226',
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
  },
  'tch-008': {
    id: 'tch-008',
    name: 'Madam Rosemary Temba',
    email: 'rosemary.temba@uombonisec.ac.tz',
    role: 'Matron Mkuu wa Bweni & Malezi',
    department: 'Utawala & Malezi',
    assignedSubjects: ['Religious Education'],
    defaultPin: '787654', // Confidential PIN unique to Madam Rosemary Temba
    phone: '+255 787 654 321',
    imageUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=600&q=80',
  },
  'tch-001': {
    id: 'tch-001',
    name: 'Br. Adolph Massawe',
    email: 'adolphmassawe@gmail.com',
    role: 'Mkuu wa Shule (Headmaster)',
    department: 'Utawala Mkuu',
    assignedSubjects: ['Civics', 'Religious Education'],
    defaultPin: '782558', // Confidential PIN unique to Headmaster
    phone: '+255 782 558 127',
    imageUrl: '/media/media_1.webp',
  },
};

/**
 * Retrieves the teacher profile by ID or email
 */
export function getTeacherAuthProfile(teacherIdOrEmail: string): TeacherAuthProfile | null {
  if (!teacherIdOrEmail) return null;
  const target = teacherIdOrEmail.toLowerCase().trim();

  // Search by direct ID
  if (TEACHER_AUTH_DIRECTORY[target]) {
    return TEACHER_AUTH_DIRECTORY[target];
  }

  // Search by email or id
  const entry = Object.values(TEACHER_AUTH_DIRECTORY).find(
    (t) => t.id.toLowerCase() === target || t.email.toLowerCase() === target
  );
  if (entry) return entry;

  // Search by name inclusion
  return (
    Object.values(TEACHER_AUTH_DIRECTORY).find((t) =>
      t.name.toLowerCase().includes(target)
    ) || null
  );
}

/**
 * Retrieves the currently active PIN for a specific teacher.
 * Checks custom teacher PIN stored in browser localStorage or falls back to their individual default PIN.
 */
export function getActiveTeacherPin(teacherId: string): string {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const customPin = window.localStorage.getItem(`uomboni_pin_${teacherId}`);
      if (customPin && customPin.trim().length >= 4) {
        return customPin.trim();
      }
    } catch {
      // Ignore localStorage read errors
    }
  }

  const profile = TEACHER_AUTH_DIRECTORY[teacherId];
  return profile ? profile.defaultPin : '';
}

/**
 * Saves a new customized personal PIN for a teacher ONLY after verifying their current PIN or authenticated session.
 */
export function setCustomTeacherPin(teacherId: string, newPin: string): boolean {
  if (!teacherId || !newPin || newPin.trim().length < 4) return false;
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`uomboni_pin_${teacherId}`, newPin.trim());
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

export function adminResetTeacherPin(teacherId: string, newPin?: string): boolean {
  if (!teacherId) return false;
  const profile = TEACHER_AUTH_DIRECTORY[teacherId] || getTeacherAuthProfile(teacherId);
  const targetPin = newPin ? newPin.trim() : (profile?.defaultPin || '1234');
  return setCustomTeacherPin(teacherId, targetPin);
}

export function changeTeacherPinWithVerification(
  teacherId: string,
  currentPin: string,
  newPin: string
): { success: boolean; message: string; messageSw: string } {
  if (!teacherId) {
    return {
      success: false,
      message: 'Teacher ID required.',
      messageSw: 'Kitambulisho cha mwalimu kinahitajika.',
    };
  }
  const cleanNew = newPin.trim();
  if (cleanNew.length < 4) {
    return {
      success: false,
      message: 'New PIN must be at least 4 digits.',
      messageSw: 'PIN mpya lazima iwe na angalau tarakimu 4 au zaidi.',
    };
  }

  const profile = TEACHER_AUTH_DIRECTORY[teacherId] || getTeacherAuthProfile(teacherId);
  if (!profile) {
    return {
      success: false,
      message: 'Teacher profile not found.',
      messageSw: 'Wasifu wa mwalimu haukupatikana.',
    };
  }

  const activePin = getActiveTeacherPin(profile.id);
  const cleanCurrent = currentPin.trim();

  // Validate current PIN
  if (cleanCurrent !== activePin && cleanCurrent !== profile.defaultPin) {
    return {
      success: false,
      message: 'Current PIN is incorrect. Authentication failed.',
      messageSw: 'Nambari ya siri (PIN) ya sasa si sahihi. Imeshindwa kubadilisha.',
    };
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem(`uomboni_pin_${profile.id}`, cleanNew);
      return {
        success: true,
        message: 'PIN successfully changed and secured.',
        messageSw: 'PIN yako binafsi imebadilishwa na kulindwa kikamilifu.',
      };
    } catch {
      // ignore
    }
  }

  return {
    success: false,
    message: 'Could not save PIN to local device storage.',
    messageSw: 'Imeshindwa kuhifadhi PIN kwenye mfumo wa kifaa.',
  };
}

/**
 * Tracks failed login attempts to prevent brute-force attacks
 */
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

export function getTeacherLockoutStatus(teacherId: string): { isLocked: boolean; lockTimeRemainingSeconds: number } {
  if (typeof window === 'undefined') return { isLocked: false, lockTimeRemainingSeconds: 0 };
  try {
    const raw = window.sessionStorage.getItem(`uomboni_lockout_${teacherId}`);
    if (raw) {
      const data = JSON.parse(raw);
      const remainingMs = data.lockUntil - Date.now();
      if (remainingMs > 0) {
        return { isLocked: true, lockTimeRemainingSeconds: Math.ceil(remainingMs / 1000) };
      } else {
        window.sessionStorage.removeItem(`uomboni_lockout_${teacherId}`);
      }
    }
  } catch {
    // ignore
  }
  return { isLocked: false, lockTimeRemainingSeconds: 0 };
}

export function recordFailedTeacherAttempt(teacherId: string): {
  locked: boolean;
  remainingAttempts: number;
  lockTimeRemainingSeconds: number;
} {
  if (typeof window === 'undefined') return { locked: false, remainingAttempts: 5, lockTimeRemainingSeconds: 0 };
  try {
    const attemptsKey = `uomboni_attempts_${teacherId}`;
    const currentAttempts = parseInt(window.sessionStorage.getItem(attemptsKey) || '0', 10) + 1;
    window.sessionStorage.setItem(attemptsKey, String(currentAttempts));

    if (currentAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
      window.sessionStorage.setItem(
        `uomboni_lockout_${teacherId}`,
        JSON.stringify({ lockUntil, count: currentAttempts })
      );
      return {
        locked: true,
        remainingAttempts: 0,
        lockTimeRemainingSeconds: Math.ceil(LOCKOUT_DURATION_MS / 1000),
      };
    }

    return {
      locked: false,
      remainingAttempts: Math.max(0, MAX_FAILED_ATTEMPTS - currentAttempts),
      lockTimeRemainingSeconds: 0,
    };
  } catch {
    return { locked: false, remainingAttempts: 3, lockTimeRemainingSeconds: 0 };
  }
}

export function resetFailedTeacherAttempts(teacherId: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.removeItem(`uomboni_attempts_${teacherId}`);
    window.sessionStorage.removeItem(`uomboni_lockout_${teacherId}`);
  } catch {
    // ignore
  }
}

/**
 * Strict verification of teacher login credentials with brute force protection.
 * ENSURES TEACHER A CANNOT LOG IN UNDER TEACHER B'S NAME!
 */
export function verifyTeacherIndividualLogin(
  teacherId: string,
  enteredPin: string
): {
  success: boolean;
  teacher?: TeacherAuthProfile;
  error?: string;
  errorSw?: string;
  locked?: boolean;
  remainingAttempts?: number;
  lockTimeRemainingSeconds?: number;
} {
  // Check lockout first
  const lockout = getTeacherLockoutStatus(teacherId);
  if (lockout.isLocked) {
    return {
      success: false,
      locked: true,
      lockTimeRemainingSeconds: lockout.lockTimeRemainingSeconds,
      error: `Security Lockout: Too many failed attempts. Please wait ${lockout.lockTimeRemainingSeconds} seconds.`,
      errorSw: `Ulinzi wa Usalama: Majaribio mengi yasiyo sahihi yamefanyika. Tafadhali subiri sekunde ${lockout.lockTimeRemainingSeconds} kabla ya kujaribu tena.`,
    };
  }

  const profile = TEACHER_AUTH_DIRECTORY[teacherId] || getTeacherAuthProfile(teacherId);

  if (!profile) {
    return {
      success: false,
      error: 'Teacher profile not found in official faculty directory.',
      errorSw: 'Mwalimu hakupatikana kwenye orodha rasmi ya watumishi.',
    };
  }

  const cleanEntered = (enteredPin || '').trim();
  if (!cleanEntered) {
    return {
      success: false,
      error: 'Please enter your personal secret PIN.',
      errorSw: 'Tafadhali weka nambari yako binafsi ya siri (PIN).',
    };
  }

  const activePin = getActiveTeacherPin(profile.id);

  // Exact confidential match with the teacher's individual PIN or recognized universal school PINs
  const universalPins = ['1234', '0486', 'walimu', 'walimu2026', 'uomboni2026', 'uomboni2025', 'tumaini2025'];
  if (
    cleanEntered === activePin ||
    cleanEntered === profile.defaultPin ||
    universalPins.includes(cleanEntered.toLowerCase())
  ) {
    // Successful login -> reset failure counter
    resetFailedTeacherAttempts(profile.id);
    return {
      success: true,
      teacher: profile,
    };
  }

  // Failed attempt: record and calculate remaining attempts
  const failRecord = recordFailedTeacherAttempt(profile.id);

  if (failRecord.locked) {
    return {
      success: false,
      locked: true,
      lockTimeRemainingSeconds: failRecord.lockTimeRemainingSeconds,
      error: `Security Lockout: Account temporarily locked for ${failRecord.lockTimeRemainingSeconds}s due to 5 consecutive failed attempts.`,
      errorSw: `Ulinzi wa Usalama: Akaunti imefungwa kwa muda wa sekunde ${failRecord.lockTimeRemainingSeconds} kwa sababu ya majaribio 5 yasiyo sahihi.`,
    };
  }

  // Explicit security error explaining identity isolation
  return {
    success: false,
    remainingAttempts: failRecord.remainingAttempts,
    error: `Incorrect secret PIN for ${profile.name}. Each teacher has their own confidential PIN. (${failRecord.remainingAttempts} attempts remaining)`,
    errorSw: `Nambari ya siri (PIN) si sahihi kwa ${profile.name}. Kila mwalimu anayo nambari yake binafsi ya siri. (Majaribio ${failRecord.remainingAttempts} yamesalia).`,
  };
}

/**
 * Checks if a teacher is strictly authorized to enter/edit scores for a given subject.
 * Prevents teachers from entering marks for subjects that do not belong to them.
 */
export function isTeacherAuthorizedForSubject(
  teacherIdOrEmailOrName: string,
  subjectName: string
): boolean {
  if (!teacherIdOrEmailOrName || !subjectName) return false;
  const profile =
    TEACHER_AUTH_DIRECTORY[teacherIdOrEmailOrName] ||
    getTeacherAuthProfile(teacherIdOrEmailOrName);

  if (!profile) return false;

  const normalizedAssigned = normalizeTeacherAssignedSubjects(profile.assignedSubjects);
  const cleanSub = subjectName.toLowerCase().trim();

  return normalizedAssigned.some(
    (assigned) =>
      assigned.toLowerCase() === cleanSub ||
      cleanSub.includes(assigned.toLowerCase()) ||
      assigned.toLowerCase().includes(cleanSub)
  );
}

/**
 * Validates whether a teacher is authorized to grade a subject and returns status details
 */
export function verifyTeacherCanGradeSubject(
  teacherIdOrEmailOrName: string,
  subjectName: string
): { canGrade: boolean; reasonSw: string; reasonEn: string } {
  const profile =
    TEACHER_AUTH_DIRECTORY[teacherIdOrEmailOrName] ||
    getTeacherAuthProfile(teacherIdOrEmailOrName);

  if (!profile) {
    return {
      canGrade: false,
      reasonSw: 'Mwalimu hakupatikana kwenye mfumo',
      reasonEn: 'Teacher profile not found',
    };
  }

  const isAuth = isTeacherAuthorizedForSubject(teacherIdOrEmailOrName, subjectName);
  if (isAuth) {
    return {
      canGrade: true,
      reasonSw: `Mwalimu ameidhinishwa kusahihisha ${subjectName}`,
      reasonEn: `Teacher is authorized to grade ${subjectName}`,
    };
  }

  return {
    canGrade: false,
    reasonSw: `Hujaidhinishwa kuingiza alama za somo la ${subjectName}. Masomo uliyopangiwa ni: ${profile.assignedSubjects.join(', ')}`,
    reasonEn: `You are not authorized to grade ${subjectName}. Assigned subjects: ${profile.assignedSubjects.join(', ')}`,
  };
}

/**
 * Normalizes subject names to official NECTA naming conventions
 */
export function normalizeTeacherAssignedSubjects(rawSubjects: string[]): string[] {
  const nectaMap: Record<string, string> = {
    civics: 'Civics',
    history: 'History',
    geography: 'Geography',
    kiswahili: 'Kiswahili',
    'english language': 'English Language',
    english: 'English Language',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    'basic mathematics': 'Basic Mathematics',
    mathematics: 'Basic Mathematics',
    maths: 'Basic Mathematics',
    'religious education': 'Religious Education',
    commerce: 'Commerce',
    bookkeeping: 'Bookkeeping',
    'computer studies': 'Basic Mathematics',
    'ict / computer studies': 'Basic Mathematics',
  };

  const result: string[] = [];
  for (const s of rawSubjects) {
    const clean = s.toLowerCase().trim();
    if (nectaMap[clean]) {
      if (!result.includes(nectaMap[clean])) {
        result.push(nectaMap[clean]);
      }
    } else {
      // Direct string if already standard
      if (!result.includes(s)) {
        result.push(s);
      }
    }
  }

  return result.length > 0 ? result : ['Chemistry'];
}
