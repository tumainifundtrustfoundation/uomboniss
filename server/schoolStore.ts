import fs from 'fs';
import path from 'path';
import { DEFAULT_UOMBONI_STUDENT_RESULTS } from '../src/data/defaultStudentResults';
import {
  INITIAL_NEWS,
  INITIAL_EVENTS,
  INITIAL_ACADEMIC_CALENDAR,
  INITIAL_TEACHERS,
  INITIAL_JOINING_DOCUMENTS,
  INITIAL_GALLERY,
  INITIAL_ALERTS,
  INITIAL_RESULTS_PDF_DOCUMENTS,
  INITIAL_STUDENTS,
  INITIAL_SCHOOL_ASSETS,
  INITIAL_TIMETABLE,
  INITIAL_STUDENT_NOTICES,
  INITIAL_APPLICATIONS,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_STUDENT_COUNCIL,
  SCHOOL_PROFILE_INFO,
  INITIAL_ENROLLMENT_STATS,
} from '../src/data/initialData';

export interface SchoolDataPayload {
  studentResults: any[];
  news: any[];
  events: any[];
  alerts: any[];
  academicCalendar: any[];
  teachers: any[];
  students: any[];
  paymentRecords: any[];
  joiningDocs: any[];
  galleryPhotos: any[];
  applications: any[];
  parentInquiries: any[];
  resultsPdfDocuments: any[];
  schoolAssets: any[];
  timetable: any[];
  studentNotices: any[];
  customLogoUrl: string | null;
  bankAccounts: any[];
  studentCouncil: any[];
  schoolProfile: any;
  enrollmentStats: any[];
}

export interface SchoolDatabase {
  version: number;
  lastUpdated: number;
  data: SchoolDataPayload;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'school_database.json');

function getDefaultSchoolData(): SchoolDataPayload {
  return {
    studentResults: [...DEFAULT_UOMBONI_STUDENT_RESULTS],
    news: [...INITIAL_NEWS],
    events: [...INITIAL_EVENTS],
    alerts: [...INITIAL_ALERTS],
    academicCalendar: [...INITIAL_ACADEMIC_CALENDAR],
    teachers: [...INITIAL_TEACHERS],
    students: [...INITIAL_STUDENTS],
    paymentRecords: [],
    joiningDocs: [...INITIAL_JOINING_DOCUMENTS],
    galleryPhotos: [...INITIAL_GALLERY],
    applications: [...INITIAL_APPLICATIONS],
    parentInquiries: [],
    resultsPdfDocuments: [...INITIAL_RESULTS_PDF_DOCUMENTS],
    schoolAssets: [...INITIAL_SCHOOL_ASSETS],
    timetable: [...INITIAL_TIMETABLE],
    studentNotices: [...INITIAL_STUDENT_NOTICES],
    customLogoUrl: null,
    bankAccounts: [...INITIAL_BANK_ACCOUNTS],
    studentCouncil: [...INITIAL_STUDENT_COUNCIL],
    schoolProfile: { ...SCHOOL_PROFILE_INFO },
    enrollmentStats: [...INITIAL_ENROLLMENT_STATS],
  };
}

let dbInstance: SchoolDatabase | null = null;
let saveTimeout: NodeJS.Timeout | null = null;
let lastDiskMtime: number = 0;

function ensureDataDirectory() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create data directory:', err);
  }
}

function persistToDisk() {
  if (!dbInstance) return;
  try {
    ensureDataDirectory();
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(dbInstance, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
    try {
      lastDiskMtime = fs.statSync(DB_FILE).mtimeMs;
    } catch {}
  } catch (err) {
    console.error('Failed to persist school database to disk:', err);
  }
}

function schedulePersist() {
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }
  // Debounce writes by 100ms for high performance
  saveTimeout = setTimeout(() => {
    persistToDisk();
    saveTimeout = null;
  }, 100);
}

export function initSchoolDatabase(): SchoolDatabase {
  ensureDataDirectory();
  const defaultData = getDefaultSchoolData();

  if (fs.existsSync(DB_FILE)) {
    try {
      const stats = fs.statSync(DB_FILE);
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.data) {
        lastDiskMtime = stats.mtimeMs;
        // Merge with defaults to guarantee all expected fields exist
        const loadedStudents = Array.isArray(parsed.data.students) ? parsed.data.students : [];
        const existingExamNumbers = new Set(loadedStudents.map((s: any) => s.examNumber?.toLowerCase()?.replace(/[\/\-_]/g, '')));
        const missingStudents = defaultData.students.filter((s: any) => !existingExamNumbers.has(s.examNumber?.toLowerCase()?.replace(/[\/\-_]/g, '')));
        const combinedStudents = [...loadedStudents, ...missingStudents];

        const mergedData: SchoolDataPayload = {
          ...defaultData,
          ...parsed.data,
          students: combinedStudents.length > 0 ? combinedStudents : defaultData.students,
        };

        dbInstance = {
          version: parsed.version || 1,
          lastUpdated: parsed.lastUpdated || stats.mtimeMs || Date.now(),
          data: mergedData,
        };
        return dbInstance;
      }
    } catch (err) {
      console.warn('Error reading existing school_database.json, initializing fresh store:', err);
    }
  }

  // Initialize fresh database
  dbInstance = {
    version: 1,
    lastUpdated: Date.now(),
    data: defaultData,
  };
  persistToDisk();
  return dbInstance;
}

export function getSchoolDatabase(): SchoolDatabase {
  // Check if file on disk was modified externally (e.g. direct backend file updates)
  if (fs.existsSync(DB_FILE)) {
    try {
      const stats = fs.statSync(DB_FILE);
      if (stats.mtimeMs > lastDiskMtime) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.data) {
          lastDiskMtime = stats.mtimeMs;
          const defaultData = getDefaultSchoolData();
          dbInstance = {
            version: (parsed.version || 1),
            lastUpdated: parsed.lastUpdated || stats.mtimeMs,
            data: {
              ...defaultData,
              ...parsed.data,
            },
          };
          return dbInstance;
        }
      }
    } catch (e) {
      console.warn('Error checking external DB_FILE modification:', e);
    }
  }

  if (!dbInstance) {
    return initSchoolDatabase();
  }
  return dbInstance;
}

export function updateSchoolDatabase(key: keyof SchoolDataPayload, value: any): SchoolDatabase {
  const db = getSchoolDatabase();
  (db.data as any)[key] = value;
  db.version = (db.version || 1) + 1;
  db.lastUpdated = Date.now();
  persistToDisk();
  return db;
}

export function batchUpdateSchoolDatabase(updates: Partial<SchoolDataPayload>): SchoolDatabase {
  const db = getSchoolDatabase();
  Object.keys(updates).forEach((k) => {
    const key = k as keyof SchoolDataPayload;
    if (updates[key] !== undefined) {
      (db.data as any)[key] = updates[key];
    }
  });
  db.version = (db.version || 1) + 1;
  db.lastUpdated = Date.now();
  persistToDisk();
  return db;
}

export function resetSchoolDatabase(): SchoolDatabase {
  dbInstance = {
    version: (dbInstance?.version || 1) + 1,
    lastUpdated: Date.now(),
    data: getDefaultSchoolData(),
  };
  persistToDisk();
  return dbInstance;
}
