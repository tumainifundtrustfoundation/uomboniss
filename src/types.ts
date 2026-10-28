export type Language = 'sw' | 'en';

export interface SubjectResult {
  code: string;
  name: string;
  nameEn: string;
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  points: number; // 1 to 5
  remarks: string;
}

export interface StudentResult {
  id: string;
  studentId?: string;
  examNumber: string; // e.g. S0486/0001/2025
  studentName: string;
  gender: 'M' | 'F';
  form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | string;
  stream: 'A' | 'B' | 'Science' | 'Arts' | 'Commercial' | string;
  examType: 'NECTA Mock 2025' | 'Annual Examination 2025' | 'Mid-Term Exam 2025' | 'Pre-NECTA 2025' | string;
  year: number;
  subjects: SubjectResult[];
  totalMarks: number;
  averageMarks: number;
  division: 'Division I' | 'Division II' | 'Division III' | 'Division IV' | 'Division 0' | 'ABS' | string;
  points: number;
  classPosition: number;
  totalStudentsInClass: number;
  conduct: 'Bora Sana (Excellent)' | 'Nzuri Sana (Very Good)' | 'Nzuri (Good)' | 'Inaridhisha (Fair)' | string;
  headmasterRemarks: string;
  publishDate: string;
  approvalStatus?: 'draft_teacher' | 'submitted_to_academic' | 'approved_by_academic' | 'published_to_parents';
  status?: 'pending' | 'approved' | 'rejected' | 'published';
  detailedSubjectsString?: string;
  subjectSubmissions?: Record<string, { teacherName: string; submittedAt: string; status: 'pending' | 'submitted' | 'approved' }>;
}

export interface PendingStudentScore {
  examNumber: string;
  studentName: string;
  gender?: 'M' | 'F';
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  points: number;
  remarks: string;
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'returned' | 'rejected';
}

export interface PendingSubjectSubmission {
  id: string;
  subject: string;
  subjectCode: string;
  form: string;
  stream: string;
  examType: string;
  academicYear: string;
  term?: string;
  maxMarks?: number;
  teacherName: string;
  teacherEmail?: string;
  teacherId?: string;
  status: 'draft' | 'pending' | 'under_review' | 'approved' | 'returned' | 'rejected';
  submittedCount: number;
  studentScores: PendingStudentScore[];
  submittedAt: string;
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  academicMasterNotes?: string;
  returnComment?: string;
  auditTrail?: Array<{
    action: string;
    by: string;
    at: string;
    notes?: string;
  }>;
}

export interface AcademicDirective {
  id: string;
  title: string;
  message: string;
  senderName: string;
  senderRole: string;
  targetForm: 'ALL' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | string;
  examType: string;
  deadlineDate: string;
  isOpenForEntry: boolean;
  allowLateSubmissions?: boolean;
  priority: 'urgent' | 'high' | 'normal';
  dateIssued: string;
  timestamp: number;
  status: 'active' | 'closed' | 'archived';
}

export interface ExamTypeConfig {
  id: string;
  name: string; // e.g. "NECTA Mock 2025", "Mid-Term Exam 2026", "Jaribio la Mwezi Machi", "Mtihani wa Muhula (Terminal)"
  category: 'NECTA' | 'Mock' | 'Mid-Term' | 'Terminal' | 'Annual' | 'Monthly Test' | 'Joint / Pre-NECTA' | 'Other';
  targetForm: 'ALL' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | string;
  academicYear: string; // e.g. "2025/2026"
  term: 'Muhula wa 1 (Term 1)' | 'Muhula wa 2 (Term 2)' | 'Mwaka Mzima' | string;
  status: 'active' | 'upcoming' | 'closed' | 'archived';
  dateCreated?: string;
  createdBy?: string;
  description?: string;
  isCurrentForEntry?: boolean;
}

export interface NewsItem {
  id: string;
  titleSw: string;
  titleEn: string;
  excerptSw: string;
  excerptEn: string;
  contentSw: string;
  contentEn: string;
  category: 'Taaluma' | 'Matangazo' | 'Michezo' | 'Kikanisa' | 'Uongozi';
  date: string;
  imageUrl: string;
  featured?: boolean;
  author: string;
}

export interface SchoolEvent {
  id: string;
  titleSw: string;
  titleEn: string;
  date: string;
  time: string;
  location: string;
  descriptionSw: string;
  descriptionEn: string;
  category: 'Kikanisa' | 'Taaluma' | 'Michezo' | 'Wazazi';
}

export interface AcademicCalendarEvent {
  id: string;
  titleSw: string;
  titleEn: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  term: 'Term 1' | 'Term 2' | 'All Year';
  category: 'NECTA' | 'Term Dates' | 'Internal Exams' | 'Holidays' | 'School Events' | 'Admissions';
  targetAudience: 'All Forms' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Parents & Teachers';
  location: string;
  time?: string;
  descriptionSw: string;
  descriptionEn: string;
  status?: 'Upcoming' | 'In Progress' | 'Completed';
  importantNotice?: boolean;
}

export interface Teacher {
  id: string;
  name: string;
  role?: string;
  roleSw: string;
  roleEn: string;
  qualification?: string;
  qualifications?: string;
  subjects: string[];
  department?: 'Sayansi (Science)' | 'Lugha (Languages)' | 'Sanaa (Humanities)' | 'Biashara (Commercial)' | 'Utawala (Administration)' | string;
  imageUrl: string;
  email: string;
  phone: string;
  experienceYears?: number;
  portalPin?: string;
  defaultPin?: string;
}

export interface ExamSittingType {
  id: string;
  code?: string;
  name: string;
  category?: string;
  targetForm?: string;
  targetForms?: string[];
  academicYear?: string;
  term?: string;
  status?: string;
  sittingMode?: string;
  sittingModeSw?: string;
  weightPercentage?: number;
  startDate?: string;
  endDate?: string;
  markEntryDeadline?: string;
  instructionsSw?: string;
  isEntryOpen?: boolean;
  active?: boolean;
  isOpenForMarksEntry?: boolean;
  dateCreated?: string;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  description?: string;
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branch: string;
  swiftCode: string;
  type: 'Ada ya Shule (School Fees)' | 'Michango ya Kikanisa/Misa' | 'Ununuzi wa Sare na Vifaa' | 'Bweni na Chakula';
  logoUrl?: string;
}

export interface MobilePaymentMethod {
  id: string;
  provider: 'M-Pesa (Vodacom)' | 'Airtel Money' | 'Tigo Pesa (Mixx by Yas)' | 'Halopesa';
  paybillNumber: string;
  accountReferenceFormat: string;
  instructionsSw: string;
  instructionsEn: string;
}

export interface FeePaymentRecord {
  id: string;
  studentName: string;
  examNumber: string;
  form: string;
  amount: number;
  paymentMethod: string;
  transactionReference: string;
  paymentDate: string;
  parentPhone: string;
  status: 'Imethibitishwa' | 'Inakaguliwa' | 'Imekataliwa';
  receiptNumber: string;
}

export interface JoiningDocument {
  id: string;
  titleSw: string;
  titleEn: string;
  descriptionSw: string;
  descriptionEn: string;
  fileSize: string;
  targetGroup: 'Kidato cha Kwanza (Form One)' | 'Uhamisho (Form Two/Three)' | 'Wanafunzi Wote' | 'Afya na Bima' | string;
  downloadCount: number;
  imageUrl?: string;
  googleDriveUrl?: string;
  documentType?: 'pdf_template' | 'google_drive' | 'link';
  externalUrl?: string;
  pdfContentPreview: {
    header: string;
    requirements: string[];
    feesSummary: string;
    reportingDate: string;
  };
}

export interface GalleryPhoto {
  id: string;
  titleSw: string;
  titleEn: string;
  category: 'Matukio ya Kikanisa' | 'Maabara na Sayansi' | 'Michezo na Sanaa' | 'Mahafali (Graduation)' | 'Mazingira ya Marangu' | 'Taaluma na Maktaba' | 'Uongozi na Malezi' | string;
  imageUrl: string;
  fallbackUrl?: string;
  filename?: string;
  date: string;
  descriptionSw?: string;
  descriptionEn?: string;
}

export interface SchoolVideo {
  id: string;
  titleSw: string;
  titleEn: string;
  youtubeUrl: string;
  youtubeId: string;
  category: 'Mahafali & Sherehe' | 'Taaluma & Masomo' | 'Kikanisa & Misa' | 'Michezo & Utamaduni' | 'Ziara & Mazingira' | string;
  date: string;
  duration?: string;
  descriptionSw?: string;
  descriptionEn?: string;
  featured?: boolean;
  order?: number;
  videoSource?: 'youtube' | 'drive' | string;
  videoUrl?: string;
  embedUrl?: string;
  driveFileId?: string;
  thumbnailUrl?: string;
}

export interface ParentInquiry {
  id: string;
  parentName: string;
  phone: string;
  email: string;
  studentName?: string;
  form?: string;
  category: 'Kujiunga na Shule' | 'Matokeo na Taaluma' | 'Malipo na Ada' | 'Nidhamu na Bweni' | 'Maoni ya Jumla';
  message: string;
  createdAt: string;
  status: 'Inashughulikiwa' | 'Imejibiwa' | 'Mpya';
  adminNotes?: string;
}

export interface UrgentAlert {
  id: string;
  messageSw: string;
  messageEn: string;
  linkTextSw?: string;
  linkTextEn?: string;
  linkAction?: string;
  active: boolean;
  priority: 'high' | 'normal';
}

export interface EnrollmentStat {
  form: string;
  boys: number;
  girls: number;
  total: number;
  boarding: number;
  day: number;
}

export interface NectaPerformanceStat {
  year: number;
  candidates: number;
  div1: number;
  div2: number;
  div3: number;
  div4: number;
  div0: number;
  gpa: number;
  nationalRank?: string;
  regionalRank?: string;
}

export interface SubjectStat {
  subjectName: string;
  subjectNameEn: string;
  passRate: number; // percentage
  averageScore: number;
  gradeA: number;
  gradeB: number;
  gradeC: number;
  gradeD: number;
  gradeF: number;
}

export interface ResultsPdfDocument {
  id: string;
  titleSw: string;
  titleEn: string;
  form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'All Forms';
  examType: string;
  year: number;
  datePublished: string;
  fileSize: string;
  totalCandidates: number;
  divisionSummary: string; // e.g. "Div I: 85, Div II: 42, Div III: 18"
  descriptionSw: string;
  descriptionEn: string;
  externalUrl?: string;
}

export interface StudentProfile {
  id: string;
  studentId: string; // e.g. USS-2022-0042
  examNumber: string; // e.g. S0486/0001/2025
  premNumber?: string; // Namba ya PREM au Namba ya Mtihani wa Darasa la Saba (Primary PREM / PSLE Examination Number)
  fullName: string;
  gender: 'M' | 'F';
  dob?: string;
  dateOfBirth?: string;
  form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | string;
  stream: 'A' | 'B' | 'Science' | 'Arts' | 'Commercial' | string;
  admissionYear?: number;
  enrollmentDate?: string;
  studentType?: 'Bweni (Boarding)' | 'Kutwa (Day Scholar)' | string;
  boardingStatus?: 'Bweni' | 'Kutwa' | 'Bweni (Boarding)' | 'Kutwa (Day Scholar)' | string;
  dormitoryRoom?: string;
  hostelName?: string;
  bedNumber?: string;
  lockerNumber?: string;
  previousSchool?: string;
  parentName?: string;
  parentGuardianName?: string;
  parentPhone?: string;
  parentEmail?: string;
  residence?: string;
  address?: string;
  religion?: string;
  attendanceRate?: number; // percentage, e.g. 98.5
  conductRating?: 'Bora Sana' | 'Nzuri Sana' | 'Nzuri' | 'Inaridhisha' | 'Inahitaji Uangalizi' | string;
  leadershipRole?: string;
  clubs?: string[];
  feeTotal?: number;
  feePaid?: number;
  avatarUrl?: string;
  photoUrl?: string;
  exemptSubjects?: string[];
  registeredSubjects?: string[];
  subjectExemptionReasons?: Record<string, string>;
}

export interface SchoolAsset {
  id: string;
  assetTag?: string; // e.g. USS-LAB-012, USS-LIB-2041, USS-ICT-008
  assetCode?: string;
  nameSw: string;
  nameEn: string;
  category: string;
  condition: string;
  location: string;
  quantity?: number;
  assignedToType?: 'Student' | 'Teacher' | 'Department' | 'General';
  assignedToId?: string; // studentId or teacherId
  assignedToName?: string;
  assignedToStudentId?: string;
  assignedToStudentName?: string;
  assignedDate?: string;
  returnDueDate?: string;
  expectedReturnDate?: string;
  status: string;
  notes?: string;
}

export interface TimetableSlot {
  id: string;
  form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | string;
  stream?: string;
  day?: 'Jumatatu' | 'Jumanne' | 'Jumatano' | 'Alhamisi' | 'Ijumaa' | string;
  dayOfWeek?: 'Jumatatu' | 'Jumanne' | 'Jumatano' | 'Alhamisi' | 'Ijumaa' | string;
  time?: string; // e.g. '08:00 - 08:45'
  startTime?: string;
  endTime?: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface StudentNotice {
  id: string;
  title?: string;
  titleSw?: string;
  titleEn?: string;
  content?: string;
  contentSw?: string;
  contentEn?: string;
  targetGroup?: 'Wanafunzi Wote' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Wanafunzi wa Bweni' | 'Wanafunzi wa Kutwa' | string;
  targetAudience?: 'All' | 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' | 'Wanafunzi Wote' | string;
  date?: string;
  publishDate?: string;
  priority?: 'high' | 'normal' | 'High' | 'Normal' | string;
  author?: string;
  authorRole?: string;
}

export interface OnlineApplication {
  id: string;
  applicationNumber: string; // e.g. APP-2026-1048
  studentName: string;
  gender: 'M' | 'F';
  dob?: string;
  applyingFor: 'Form 1' | 'Form 2 Transfer' | 'Form 3 Transfer' | 'Pre-Form 1' | string;
  entryType: 'Bweni (Boarding)' | 'Kutwa (Day)' | string;
  previousSchool?: string;
  premNumber?: string; // Namba ya PREM au Namba ya Mtihani wa Darasa la Saba (Primary PREM or PSLE Examination Number)
  primaryResults?: string; // e.g. "Daraja A (Alama 245)"
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  parentAddress?: string;
  status: 'Inasubiri Uhakiki' | 'Imethibitishwa' | 'Inashughulikiwa' | 'Imekataliwa';
  submissionDate: string;
  adminNotes?: string;
  verifiedBy?: string;
  verifiedDate?: string;
  enrolledStudentId?: string;
}

export interface StudentCouncilMember {
  id: string;
  positionSw: string;
  positionEn: string;
  name: string;
  gender: 'M' | 'F';
  form: string;
  roleDescriptionSw?: string;
  roleDescriptionEn?: string;
  icon?: string;
}

export interface SchoolCoreValue {
  title: string;
  titleSw: string;
  description: string;
  descriptionSw: string;
  icon: string;
}

export interface SchoolProfile {
  name: string;
  nectaCode: string;
  establishedYear: number;
  firstNectaYear: number;
  yearsOfService: string;
  postalAddress: string;
  email: string;
  phone?: string;
  phones: string[];
  phonesFormatted: string[];
  location: string;
  motto: string;
  mottoSw: string;
  mottoEn?: string;
  slogan: string;
  sloganSw?: string;
  sloganEn?: string;
  vision: string;
  visionSw: string;
  visionEn?: string;
  mission: string;
  missionSw: string;
  missionEn?: string;
  historySummarySw?: string;
  historySummaryEn?: string;
  coreValues?: SchoolCoreValue[];
  headmasterName?: string;
  headmasterTitleSw?: string;
  headmasterTitleEn?: string;
  headmasterEmail?: string;
  headmasterPhone?: string;
  headmasterWelcomeSw?: string;
  headmasterWelcomeEn?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
}

// ==========================================
// CANONICAL FIRESTORE SCHEMA TYPES
// ==========================================

export interface FirestoreUser {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'admin' | 'teacher' | 'student';
  photoURL?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreStudent {
  id?: string;
  admissionNumber: string;
  fullName: string;
  gender: 'M' | 'F';
  dateOfBirth?: string;
  classId: string;
  stream: string;
  userId?: string;
  parentName?: string;
  parentPhone?: string;
  photoURL?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreTeacher {
  id?: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  subjects: string[];
  classes: string[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FirestoreClass {
  id?: string;
  name: string; // Form One, Form Two...
  stream: string;
  academicYear: string;
  classTeacherId?: string;
  active: boolean;
}

export interface FirestoreSubject {
  id?: string;
  name: string;
  code: string;
  category: string;
  active: boolean;
}

export interface FirestoreExam {
  id?: string;
  name: string;
  type: 'Monthly' | 'Terminal' | 'Annual' | 'Midterm' | 'Mock' | string;
  academicYear: string;
  term: string;
  classId?: string;
  startDate?: string;
  endDate?: string;
  status: 'draft' | 'processing' | 'published';
  createdBy: string;
  createdAt: string;
}

export interface FirestoreResult {
  id?: string;
  studentId: string;
  admissionNumber: string;
  examId: string;
  subjectId: string;
  classId: string;
  marks: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  remarks?: string;
  enteredBy: string;
  verifiedBy?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PublishedResultSubject {
  subjectId: string;
  subjectName?: string;
  marks: number;
  grade: string;
  remarks?: string;
}

export interface FirestorePublishedResult {
  id?: string;
  studentId: string;
  examId: string;
  admissionNumber: string;
  totalMarks: number;
  average: number;
  division: string;
  position: number;
  subjects: PublishedResultSubject[];
  publishedBy: string;
  publishedAt: string;
}

export interface FirestoreAnnouncement {
  id?: string;
  title: string;
  message: string;
  imageURL?: string;
  target: 'all' | 'students' | 'teachers' | 'parents' | string;
  createdBy: string;
  createdAt: string;
}

export interface FirestoreSchoolSettings {
  schoolName: string;
  registrationNumber: string;
  address: string;
  phone: string;
  email: string;
  logoURL?: string;
  motto: string;
  website: string;
}



