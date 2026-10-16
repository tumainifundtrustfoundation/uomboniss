import { db } from '../lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

export type StaffRole = 'admin' | 'academic_master' | 'bursar' | 'teacher';

export interface StaffAuthorizationResult {
  authorized: boolean;
  resolvedRole: StaffRole | null;
  officialName: string;
  officialTitle: string;
  reasonSw: string;
  reasonEn: string;
}

// Official staff registry recognized across Firebase security rules and system consoles
export const AUTHORIZED_STAFF_DIRECTORY: Record<
  string,
  {
    role: StaffRole;
    name: string;
    titleSw: string;
    titleEn: string;
    additionalRoles?: StaffRole[];
  }
> = {
  // Super Admin & Headmaster
  'tumainifundtrustfoundation@gmail.com': {
    role: 'admin',
    name: 'Tumaini Fund Trust Foundation',
    titleSw: 'Msimamizi Mkuu wa Mfumo (Super Administrator)',
    titleEn: 'Super Administrator',
    additionalRoles: ['academic_master', 'bursar', 'teacher'],
  },
  'yohanabahati665@gmail.com': {
    role: 'admin',
    name: 'Mwl. Yohana Bahati',
    titleSw: 'Mkuu wa Taaluma na Msimamizi wa Mfumo (Admin & Academic Master)',
    titleEn: 'Academic Master & Administrator',
    additionalRoles: ['academic_master', 'bursar', 'teacher'],
  },
  'adolphmassawe@gmail.com': {
    role: 'admin',
    name: 'Br. Adolph Massawe',
    titleSw: 'Mkuu wa Shule (Headmaster)',
    titleEn: 'Headmaster & Executive Director',
    additionalRoles: ['academic_master', 'bursar', 'teacher'],
  },
  'headmaster@uombonisecondary.ac.tz': {
    role: 'admin',
    name: 'Br. Adolph Massawe',
    titleSw: 'Mkuu wa Shule (Headmaster)',
    titleEn: 'Headmaster',
    additionalRoles: ['academic_master', 'bursar', 'teacher'],
  },

  // Academic Masters (Taaluma & Mitihani)
  'yohana.bahati@uombonisec.ac.tz': {
    role: 'academic_master',
    name: 'Mwl. Yohana Bahati',
    titleSw: 'Mkuu wa Taaluma (Academic Master)',
    titleEn: 'Dean of Academic Affairs & Examinations',
    additionalRoles: ['teacher'],
  },
  'adela.manyanga@uombonisec.ac.tz': {
    role: 'academic_master',
    name: 'Madam Adela Manyanga',
    titleSw: 'Mkuu wa Taaluma Msaidizi (Academic Mistress)',
    titleEn: 'Assistant Dean of Academics',
    additionalRoles: ['teacher'],
  },
  'academic@uombonisecondary.ac.tz': {
    role: 'academic_master',
    name: 'Ofisi ya Taaluma Uomboni',
    titleSw: 'Ofisi ya Taaluma & Mitihani',
    titleEn: 'Examination & Academic Directorate',
    additionalRoles: ['teacher'],
  },

  // Second Master / Deputy Head
  'wolter.temu@uombonisec.ac.tz': {
    role: 'admin',
    name: 'Mwl. Wolter Temu',
    titleSw: 'Makamu Mkuu wa Shule (Second Master)',
    titleEn: 'Deputy Headmaster',
    additionalRoles: ['academic_master', 'teacher'],
  },

  // School Bursar (Uhasibu na Ada)
  'sigminja@gmail.com': {
    role: 'bursar',
    name: 'Mwl. Sigbert Minja',
    titleSw: 'Mhasibu wa Shule / Bursar',
    titleEn: 'School Bursar & Head of Finance',
  },
  'bursar@uombonisecondary.ac.tz': {
    role: 'bursar',
    name: 'Mwl. Sigbert Minja',
    titleSw: 'Mhasibu wa Shule / Bursar',
    titleEn: 'School Bursar & Finance Desk',
  },

  // Laboratory In-Charge & Faculty
  'endrew.benson@uombonisec.ac.tz': {
    role: 'teacher',
    name: 'Mwl. Endrew Benson',
    titleSw: 'Mwalimu Mkuu wa Sayansi & Maabara',
    titleEn: 'Head of Sciences & Laboratories',
  },
  'witness@uombonisec.ac.tz': {
    role: 'teacher',
    name: 'Madam Witness',
    titleSw: 'Mwalimu wa Masomo ya Jamii (Social Studies)',
    titleEn: 'Social Studies & Civics Department',
  },
  'teacher@uombonisecondary.ac.tz': {
    role: 'teacher',
    name: 'Mwalimu wa Masomo',
    titleSw: 'Mwalimu wa Somo (Gradebook)',
    titleEn: 'Subject Teacher',
  },
};

/**
 * Validates whether an email is strictly authorized for the requested staff portal.
 * Checks against both the static verified directory and Firebase Firestore profile roles.
 */
export function checkStaffAuthorization(
  email: string | null | undefined,
  targetRole: StaffRole,
  firestoreRole?: string | null
): StaffAuthorizationResult {
  if (!email || !email.trim()) {
    return {
      authorized: false,
      resolvedRole: null,
      officialName: '',
      officialTitle: '',
      reasonSw: 'Hakuna barua pepe iliyotolewa. Tafadhali ingia na barua pepe iliyoidhinishwa.',
      reasonEn: 'No email address provided. Please sign in with an authorized email.',
    };
  }

  const cleanEmail = email.toLowerCase().trim();

  // Check static directory
  const directoryEntry = AUTHORIZED_STAFF_DIRECTORY[cleanEmail];

  // Check if role is granted via Firestore profile
  const isFirestoreAdmin = firestoreRole === 'admin';
  const isFirestoreBursar = firestoreRole === 'bursar';
  const isFirestoreAcademic = firestoreRole === 'academic_master' || firestoreRole === 'teacher';

  // 1. Admin Portal Check
  if (targetRole === 'admin') {
    if (
      isFirestoreAdmin ||
      (directoryEntry && (directoryEntry.role === 'admin' || directoryEntry.additionalRoles?.includes('admin'))) ||
      cleanEmail === 'yohanabahati665@gmail.com' ||
      cleanEmail === 'tumainifundtrustfoundation@gmail.com' ||
      cleanEmail === 'adolphmassawe@gmail.com' ||
      cleanEmail === 'headmaster@uombonisecondary.ac.tz'
    ) {
      return {
        authorized: true,
        resolvedRole: 'admin',
        officialName: directoryEntry?.name || 'Msimamizi wa Shule',
        officialTitle: directoryEntry?.titleSw || 'Msimamizi Mkuu (Admin)',
        reasonSw: 'Umeidhinishwa kuingia Jopo Kuu la Utawala.',
        reasonEn: 'Access granted to Executive Administration Console.',
      };
    }

    return {
      authorized: false,
      resolvedRole: null,
      officialName: '',
      officialTitle: '',
      reasonSw: `Barua pepe (${cleanEmail}) haijaidhinishwa kuingia Jopo Kuu la Utawala la Uomboni Secondary. Wasiliana na Mkuu wa Shule.`,
      reasonEn: `The email (${cleanEmail}) is not authorized for Admin Console access. Please contact the Headmaster.`,
    };
  }

  // 2. Bursar Portal Check
  if (targetRole === 'bursar') {
    if (
      isFirestoreAdmin ||
      isFirestoreBursar ||
      (directoryEntry &&
        (directoryEntry.role === 'bursar' ||
          directoryEntry.role === 'admin' ||
          directoryEntry.additionalRoles?.includes('bursar'))) ||
      cleanEmail === 'yohanabahati665@gmail.com' ||
      cleanEmail === 'sigminja@gmail.com' ||
      cleanEmail === 'bursar@uombonisecondary.ac.tz' ||
      cleanEmail === 'tumainifundtrustfoundation@gmail.com' ||
      cleanEmail === 'adolphmassawe@gmail.com'
    ) {
      return {
        authorized: true,
        resolvedRole: 'bursar',
        officialName: directoryEntry?.name || 'Mhasibu wa Shule',
        officialTitle: directoryEntry?.titleSw || 'Mhasibu wa Shule (Bursar)',
        reasonSw: 'Umeidhinishwa kuingia Dawati la Uhasibu na Fedha.',
        reasonEn: 'Access granted to School Bursar & Finance Desk.',
      };
    }

    return {
      authorized: false,
      resolvedRole: null,
      officialName: '',
      officialTitle: '',
      reasonSw: `Barua pepe (${cleanEmail}) haina idhini ya kufikia kumbukumbu za fedha na ada za wanafunzi. Wasiliana na Ofisi ya Uhasibu.`,
      reasonEn: `The email (${cleanEmail}) is not authorized to access student financial and fee records.`,
    };
  }

  // 3. Academic Master Portal Check
  if (targetRole === 'academic_master') {
    if (
      isFirestoreAdmin ||
      (directoryEntry &&
        (directoryEntry.role === 'academic_master' ||
          directoryEntry.role === 'admin' ||
          directoryEntry.additionalRoles?.includes('academic_master'))) ||
      cleanEmail === 'yohanabahati665@gmail.com' ||
      cleanEmail === 'yohana.bahati@uombonisec.ac.tz' ||
      cleanEmail === 'adela.manyanga@uombonisec.ac.tz' ||
      cleanEmail === 'academic@uombonisecondary.ac.tz' ||
      cleanEmail === 'tumainifundtrustfoundation@gmail.com' ||
      cleanEmail === 'adolphmassawe@gmail.com'
    ) {
      return {
        authorized: true,
        resolvedRole: 'academic_master',
        officialName: directoryEntry?.name || 'Mkuu wa Taaluma',
        officialTitle: directoryEntry?.titleSw || 'Mkuu wa Taaluma (Academic Master)',
        reasonSw: 'Umeidhinishwa kuingia Ofisi Kuu ya Taaluma & Broadsheets za NECTA.',
        reasonEn: 'Access granted to Dean of Academics Console.',
      };
    }

    return {
      authorized: false,
      resolvedRole: null,
      officialName: '',
      officialTitle: '',
      reasonSw: `Barua pepe (${cleanEmail}) haina idhini ya Mkuu wa Taaluma (Academic Master). Alama na matokeo yanaweza kubadilishwa na Wakuu wa Taaluma pekee.`,
      reasonEn: `The email (${cleanEmail}) is not authorized as Academic Master. Only verified Academic Deans may manage broadsheets.`,
    };
  }

  // 4. Teacher Portal Check
  if (targetRole === 'teacher') {
    if (
      isFirestoreAdmin ||
      isFirestoreAcademic ||
      (directoryEntry &&
        (directoryEntry.role === 'teacher' ||
          directoryEntry.role === 'academic_master' ||
          directoryEntry.role === 'admin' ||
          directoryEntry.additionalRoles?.includes('teacher'))) ||
      cleanEmail.endsWith('@uombonisec.ac.tz') ||
      cleanEmail.endsWith('@uombonisecondary.ac.tz') ||
      cleanEmail === 'tumainifundtrustfoundation@gmail.com' ||
      cleanEmail === 'adolphmassawe@gmail.com'
    ) {
      return {
        authorized: true,
        resolvedRole: 'teacher',
        officialName: directoryEntry?.name || 'Mwalimu wa Masomo',
        officialTitle: directoryEntry?.titleSw || 'Mwalimu wa Somo',
        reasonSw: 'Umeidhinishwa kuwasilisha alama za masomo.',
        reasonEn: 'Access granted to Teacher Gradebook.',
      };
    }

    return {
      authorized: false,
      resolvedRole: null,
      officialName: '',
      officialTitle: '',
      reasonSw: `Barua pepe (${cleanEmail}) haijasajiliwa kama mwalimu wa Shule ya Sekondari Uomboni.`,
      reasonEn: `The email (${cleanEmail}) is not registered in the school faculty directory.`,
    };
  }

  return {
    authorized: false,
    resolvedRole: null,
    officialName: '',
    officialTitle: '',
    reasonSw: 'Jukumu lililoombwa halitambuliki kwenye mfumo.',
    reasonEn: 'Unrecognized role requested.',
  };
}

/**
 * Records an immutable audit log to Firebase Firestore for staff authentication events
 */
export async function logStaffAuthAttempt(event: {
  email: string;
  roleRequested: StaffRole;
  success: boolean;
  reason: string;
  uid?: string;
}): Promise<void> {
  try {
    const logId = `auth-log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const logRef = doc(collection(db, 'auditLogs'), logId);
    await setDoc(logRef, {
      id: logId,
      actorUid: event.uid || 'anonymous',
      actorEmail: event.email,
      action: event.success ? 'staff_login_granted' : 'staff_login_denied',
      target: event.roleRequested,
      reason: event.reason,
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    });
  } catch (err) {
    console.warn('Audit log write error:', err);
  }
}
