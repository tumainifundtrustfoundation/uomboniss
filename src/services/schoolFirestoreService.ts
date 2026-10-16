import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  FirestoreUser,
  FirestoreStudent,
  FirestoreTeacher,
  FirestoreClass,
  FirestoreSubject,
  FirestoreExam,
  FirestoreResult,
  FirestorePublishedResult,
  FirestoreAnnouncement,
  FirestoreSchoolSettings,
} from '../types';

// ==========================================
// 1. SETTINGS / SCHOOL (settings/school)
// ==========================================

export const DEFAULT_SCHOOL_SETTINGS: FirestoreSchoolSettings = {
  schoolName: 'UOMBONI SECONDARY SCHOOL',
  registrationNumber: 'S0486',
  address: 'P.O. Box 297, Marangu, Moshi, Kilimanjaro, Tanzania',
  phone: '+255 782 558 127 / +255 752 717 191',
  email: 'uombonisec@gmail.com',
  logoURL: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&q=80',
  motto: 'Tobumbeeze Sisi Wenyewe • Prayer, Education, Work',
  website: 'https://uombonisec.ac.tz',
};

export async function getSchoolSettings(): Promise<FirestoreSchoolSettings> {
  try {
    const docRef = doc(db, 'settings', 'school');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as FirestoreSchoolSettings;
    }
    return DEFAULT_SCHOOL_SETTINGS;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, 'settings/school');
    }
    console.warn('Error fetching settings/school, returning default:', err);
    return DEFAULT_SCHOOL_SETTINGS;
  }
}

export async function updateSchoolSettings(
  data: Partial<FirestoreSchoolSettings>
): Promise<boolean> {
  try {
    const docRef = doc(db, 'settings', 'school');
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, 'settings/school');
    return false;
  }
}

// ==========================================
// 2. USERS (users/{uid})
// ==========================================

export async function getFirestoreUsers(): Promise<FirestoreUser[]> {
  try {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map((d) => ({ ...d.data(), uid: d.id } as FirestoreUser));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'users');
    return [];
  }
}

export async function getFirestoreUser(uid: string): Promise<FirestoreUser | null> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return { ...snap.data(), uid: snap.id } as FirestoreUser;
    }
    return null;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
    return null;
  }
}

export async function setFirestoreUser(user: FirestoreUser): Promise<boolean> {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      ...user,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    return false;
  }
}

// ==========================================
// 3. STUDENTS (students/{studentId})
// ==========================================

export async function getStudents(): Promise<FirestoreStudent[]> {
  try {
    const snap = await getDocs(collection(db, 'students'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreStudent));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'students');
    return [];
  }
}

export async function getStudentByAdmission(admissionNumber: string): Promise<FirestoreStudent | null> {
  try {
    const q = query(
      collection(db, 'students'),
      where('admissionNumber', '==', admissionNumber.trim())
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const firstDoc = snap.docs[0];
      return { ...firstDoc.data(), id: firstDoc.id } as FirestoreStudent;
    }
    return null;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, `students?admissionNumber=${admissionNumber}`);
    return null;
  }
}

export async function saveStudent(student: FirestoreStudent): Promise<string | null> {
  try {
    const studentId = student.id || student.admissionNumber.replace(/[^a-zA-Z0-9]/g, '_');
    const docRef = doc(db, 'students', studentId);
    const now = new Date().toISOString();
    const data: FirestoreStudent = {
      ...student,
      id: studentId,
      createdAt: student.createdAt || now,
      updatedAt: now,
    };
    await setDoc(docRef, data, { merge: true });
    return studentId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `students/${student.id || 'new'}`);
    return null;
  }
}

export async function deleteStudent(studentId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'students', studentId));
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `students/${studentId}`);
    return false;
  }
}

// ==========================================
// 4. TEACHERS (teachers/{teacherId})
// ==========================================

export async function getTeachers(): Promise<FirestoreTeacher[]> {
  try {
    const snap = await getDocs(collection(db, 'teachers'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreTeacher));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'teachers');
    return [];
  }
}

export async function saveTeacher(teacher: FirestoreTeacher): Promise<string | null> {
  try {
    const teacherId = teacher.id || teacher.userId || `teacher_${Date.now()}`;
    const docRef = doc(db, 'teachers', teacherId);
    const now = new Date().toISOString();
    const data: FirestoreTeacher = {
      ...teacher,
      id: teacherId,
      createdAt: teacher.createdAt || now,
      updatedAt: now,
    };
    await setDoc(docRef, data, { merge: true });
    return teacherId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `teachers/${teacher.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 5. CLASSES (classes/{classId})
// ==========================================

export async function getClasses(): Promise<FirestoreClass[]> {
  try {
    const snap = await getDocs(collection(db, 'classes'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreClass));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'classes');
    return [];
  }
}

export async function saveClass(schoolClass: FirestoreClass): Promise<string | null> {
  try {
    const classId = schoolClass.id || `${schoolClass.name.replace(/\s+/g, '_')}_${schoolClass.stream}_${schoolClass.academicYear}`;
    const docRef = doc(db, 'classes', classId);
    await setDoc(docRef, { ...schoolClass, id: classId }, { merge: true });
    return classId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `classes/${schoolClass.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 6. SUBJECTS (subjects/{subjectId})
// ==========================================

export async function getSubjects(): Promise<FirestoreSubject[]> {
  try {
    const snap = await getDocs(collection(db, 'subjects'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreSubject));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'subjects');
    return [];
  }
}

export async function saveSubject(subject: FirestoreSubject): Promise<string | null> {
  try {
    const subjectId = subject.id || subject.code || subject.name.replace(/\s+/g, '_').toLowerCase();
    const docRef = doc(db, 'subjects', subjectId);
    await setDoc(docRef, { ...subject, id: subjectId }, { merge: true });
    return subjectId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `subjects/${subject.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 7. EXAMS (exams/{examId})
// ==========================================

export async function getExams(): Promise<FirestoreExam[]> {
  try {
    const snap = await getDocs(collection(db, 'exams'));
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreExam));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'exams');
    return [];
  }
}

export async function saveExam(exam: FirestoreExam): Promise<string | null> {
  try {
    const examId = exam.id || `exam_${Date.now()}`;
    const docRef = doc(db, 'exams', examId);
    const now = new Date().toISOString();
    const data: FirestoreExam = {
      ...exam,
      id: examId,
      createdAt: exam.createdAt || now,
    };
    await setDoc(docRef, data, { merge: true });
    return examId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `exams/${exam.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 8. RESULTS (results/{resultId})
// ==========================================

export async function getResultsByExam(examId: string): Promise<FirestoreResult[]> {
  try {
    const q = query(collection(db, 'results'), where('examId', '==', examId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreResult));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, `results?examId=${examId}`);
    return [];
  }
}

export async function getResultsByStudent(studentId: string): Promise<FirestoreResult[]> {
  try {
    const q = query(collection(db, 'results'), where('studentId', '==', studentId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreResult));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, `results?studentId=${studentId}`);
    return [];
  }
}

export async function saveResult(result: FirestoreResult): Promise<string | null> {
  try {
    const resultId = result.id || `${result.studentId}_${result.examId}_${result.subjectId}`;
    const docRef = doc(db, 'results', resultId);
    const now = new Date().toISOString();
    const data: FirestoreResult = {
      ...result,
      id: resultId,
      createdAt: result.createdAt || now,
      updatedAt: now,
    };
    await setDoc(docRef, data, { merge: true });
    return resultId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `results/${result.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 9. PUBLISHED RESULTS (published_results/{resultId})
// ==========================================

export async function getPublishedResults(examId?: string): Promise<FirestorePublishedResult[]> {
  try {
    const colRef = collection(db, 'published_results');
    const q = examId ? query(colRef, where('examId', '==', examId)) : colRef;
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestorePublishedResult));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'published_results');
    return [];
  }
}

export async function getPublishedResultForStudent(
  admissionNumber: string,
  examId?: string
): Promise<FirestorePublishedResult | null> {
  try {
    const colRef = collection(db, 'published_results');
    let q = query(colRef, where('admissionNumber', '==', admissionNumber.trim()));
    if (examId) {
      q = query(colRef, where('admissionNumber', '==', admissionNumber.trim()), where('examId', '==', examId));
    }
    const snap = await getDocs(q);
    if (!snap.empty) {
      const docData = snap.docs[0];
      return { ...docData.data(), id: docData.id } as FirestorePublishedResult;
    }
    return null;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.GET, `published_results?admissionNumber=${admissionNumber}`);
    return null;
  }
}

export async function savePublishedResult(
  publishedResult: FirestorePublishedResult
): Promise<string | null> {
  try {
    const resultId = publishedResult.id || `${publishedResult.studentId}_${publishedResult.examId}`;
    const docRef = doc(db, 'published_results', resultId);
    const now = new Date().toISOString();
    const data: FirestorePublishedResult = {
      ...publishedResult,
      id: resultId,
      publishedAt: publishedResult.publishedAt || now,
    };
    await setDoc(docRef, data, { merge: true });
    return resultId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `published_results/${publishedResult.id || 'new'}`);
    return null;
  }
}

// ==========================================
// 10. ANNOUNCEMENTS (announcements/{announcementId})
// ==========================================

export async function getAnnouncements(): Promise<FirestoreAnnouncement[]> {
  try {
    const colRef = collection(db, 'announcements');
    const snap = await getDocs(colRef);
    return snap.docs.map((d) => ({ ...d.data(), id: d.id } as FirestoreAnnouncement));
  } catch (err: any) {
    handleFirestoreError(err, OperationType.LIST, 'announcements');
    return [];
  }
}

export async function saveAnnouncement(
  announcement: FirestoreAnnouncement
): Promise<string | null> {
  try {
    const annId = announcement.id || `ann_${Date.now()}`;
    const docRef = doc(db, 'announcements', annId);
    const now = new Date().toISOString();
    const data: FirestoreAnnouncement = {
      ...announcement,
      id: annId,
      createdAt: announcement.createdAt || now,
    };
    await setDoc(docRef, data, { merge: true });
    return annId;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.WRITE, `announcements/${announcement.id || 'new'}`);
    return null;
  }
}

export async function deleteAnnouncement(announcementId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'announcements', announcementId));
    return true;
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, `announcements/${announcementId}`);
    return false;
  }
}

// ==========================================
// INSTITUTION INITIAL DATA SEEDER
// Populates canonical collections with initial foundation records
// ==========================================

export async function seedInstitutionSchemaFoundation(): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // 1. Settings
    await setDoc(doc(db, 'settings', 'school'), DEFAULT_SCHOOL_SETTINGS, { merge: true });

    // 2. Core Subjects (NECTA Ordinary Level)
    const defaultSubjects: FirestoreSubject[] = [
      { name: 'Civics', code: '011', category: 'Core', active: true },
      { name: 'History', code: '012', category: 'Arts', active: true },
      { name: 'Geography', code: '013', category: 'Arts', active: true },
      { name: 'Kiswahili', code: '021', category: 'Languages', active: true },
      { name: 'English Language', code: '022', category: 'Languages', active: true },
      { name: 'Physics', code: '031', category: 'Science', active: true },
      { name: 'Chemistry', code: '032', category: 'Science', active: true },
      { name: 'Biology', code: '033', category: 'Science', active: true },
      { name: 'Basic Mathematics', code: '041', category: 'Core', active: true },
      { name: 'Commerce', code: '061', category: 'Business', active: true },
      { name: 'Bookkeeping', code: '062', category: 'Business', active: true },
      { name: 'Computer Studies (ICS)', code: '071', category: 'Technology', active: true },
    ];

    for (const sub of defaultSubjects) {
      await setDoc(doc(db, 'subjects', sub.code), sub, { merge: true });
    }

    // 3. Classes
    const defaultClasses: FirestoreClass[] = [
      { name: 'Form One', stream: 'A', academicYear: '2026', active: true },
      { name: 'Form One', stream: 'B', academicYear: '2026', active: true },
      { name: 'Form Two', stream: 'A', academicYear: '2026', active: true },
      { name: 'Form Two', stream: 'B', academicYear: '2026', active: true },
      { name: 'Form Three', stream: 'A', academicYear: '2026', active: true },
      { name: 'Form Three', stream: 'B', academicYear: '2026', active: true },
      { name: 'Form Four', stream: 'A', academicYear: '2026', active: true },
      { name: 'Form Four', stream: 'B', academicYear: '2026', active: true },
    ];

    for (const cls of defaultClasses) {
      const classId = `class_${cls.name.replace(/\s+/g, '_')}_${cls.stream}_2026`;
      await setDoc(doc(db, 'classes', classId), { ...cls, id: classId }, { merge: true });
    }

    // 4. Default Exam
    const examId = 'exam_necta_form4_mock_2026';
    const defaultExam: FirestoreExam = {
      id: examId,
      name: 'Form Four Pre-National Mock Examination',
      type: 'Mock',
      academicYear: '2026',
      term: 'Term 1',
      classId: 'class_Form_Four_A_2026',
      startDate: '2026-03-10',
      endDate: '2026-03-24',
      status: 'published',
      createdBy: 'Br. Adolph Massawe (Headmaster)',
      createdAt: new Date().toISOString(),
    };
    await setDoc(doc(db, 'exams', examId), defaultExam, { merge: true });

    // 5. Teachers
    const defaultTeachers: FirestoreTeacher[] = [
      {
        id: 'teacher_wolter_temu',
        userId: 'usr_teacher_01',
        fullName: 'Mwl. Wolter Temu',
        email: 'wolter.temu@uombonisec.ac.tz',
        phone: '+255 754 532 949',
        subjects: ['Kiswahili', 'History'],
        classes: ['Form Four A', 'Form Three A'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'teacher_yohana_bahati',
        userId: 'usr_teacher_02',
        fullName: 'Mwl. Yohana Bahati',
        email: 'yohana.bahati@uombonisec.ac.tz',
        phone: '+255 782 558 127',
        subjects: ['Basic Mathematics', 'Physics'],
        classes: ['Form Four A', 'Form Four B'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'teacher_adela_manyanga',
        userId: 'usr_teacher_03',
        fullName: 'Mwl. Adela Manyanga',
        email: 'adela.manyanga@uombonisec.ac.tz',
        phone: '+255 713 889 001',
        subjects: ['Biology', 'Chemistry'],
        classes: ['Form Three A', 'Form Four A'],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const tch of defaultTeachers) {
      await setDoc(doc(db, 'teachers', tch.id!), tch, { merge: true });
    }

    // 6. Students
    const defaultStudents: FirestoreStudent[] = [
      {
        id: 'std_S0486_0001_2026',
        admissionNumber: 'S0486/0001/2026',
        fullName: 'Baraka J. Kimaro',
        gender: 'M',
        dateOfBirth: '2008-04-12',
        classId: 'class_Form_Four_A_2026',
        stream: 'A',
        userId: 'usr-002',
        parentName: 'Joseph Kimaro',
        parentPhone: '+255 754 112 233',
        photoURL: null,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'std_S0486_0002_2026',
        admissionNumber: 'S0486/0002/2026',
        fullName: 'Neema A. Moshi',
        gender: 'F',
        dateOfBirth: '2008-09-21',
        classId: 'class_Form_Four_A_2026',
        stream: 'A',
        userId: 'usr-004',
        parentName: 'Aloyce Moshi',
        parentPhone: '+255 784 998 877',
        photoURL: null,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'std_S0486_0003_2026',
        admissionNumber: 'S0486/0003/2026',
        fullName: 'Kelvin P. Massawe',
        gender: 'M',
        dateOfBirth: '2007-11-05',
        classId: 'class_Form_Four_A_2026',
        stream: 'A',
        userId: 'usr-005',
        parentName: 'Patrick Massawe',
        parentPhone: '+255 712 345 678',
        photoURL: null,
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const std of defaultStudents) {
      await setDoc(doc(db, 'students', std.id!), std, { merge: true });
    }

    // 7. Results (results/{resultId})
    const defaultResults: FirestoreResult[] = [
      {
        id: 'res_baraka_041',
        studentId: 'std_S0486_0001_2026',
        admissionNumber: 'S0486/0001/2026',
        examId: examId,
        subjectId: '041',
        classId: 'class_Form_Four_A_2026',
        marks: 88,
        grade: 'A',
        remarks: 'Excellent mastery of quadratic equations and statistics',
        enteredBy: 'Mwl. Yohana Bahati',
        verifiedBy: 'Mwl. Yohana Bahati (Academic Master)',
        status: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'res_baraka_021',
        studentId: 'std_S0486_0001_2026',
        admissionNumber: 'S0486/0001/2026',
        examId: examId,
        subjectId: '021',
        classId: 'class_Form_Four_A_2026',
        marks: 84,
        grade: 'A',
        remarks: 'Umahiri wa hali ya juu katika insha na sarufi',
        enteredBy: 'Mwl. Wolter Temu',
        verifiedBy: 'Mwl. Yohana Bahati (Academic Master)',
        status: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'res_neema_041',
        studentId: 'std_S0486_0002_2026',
        admissionNumber: 'S0486/0002/2026',
        examId: examId,
        subjectId: '041',
        classId: 'class_Form_Four_A_2026',
        marks: 82,
        grade: 'A',
        remarks: 'Hongera sana kwa kufanya vizuri',
        enteredBy: 'Mwl. Yohana Bahati',
        verifiedBy: 'Mwl. Yohana Bahati (Academic Master)',
        status: 'verified',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    for (const res of defaultResults) {
      await setDoc(doc(db, 'results', res.id!), res, { merge: true });
    }

    // 8. Published Results (published_results/{resultId})
    const defaultPublishedResults: FirestorePublishedResult[] = [
      {
        id: 'pub_res_baraka_mock_2026',
        studentId: 'std_S0486_0001_2026',
        examId: examId,
        admissionNumber: 'S0486/0001/2026',
        totalMarks: 582,
        average: 83.1,
        division: 'Division I - 7 Points',
        position: 1,
        subjects: [
          { subjectId: '011', subjectName: 'Civics', marks: 82, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '012', subjectName: 'History', marks: 80, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '013', subjectName: 'Geography', marks: 78, grade: 'B', remarks: 'Vizuri Sana' },
          { subjectId: '021', subjectName: 'Kiswahili', marks: 84, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '022', subjectName: 'English Language', marks: 85, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '031', subjectName: 'Physics', marks: 85, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '041', subjectName: 'Basic Mathematics', marks: 88, grade: 'A', remarks: 'Bora Kabisa' },
        ],
        publishedBy: 'Br. Adolph Massawe (Headmaster)',
        publishedAt: new Date().toISOString(),
      },
      {
        id: 'pub_res_neema_mock_2026',
        studentId: 'std_S0486_0002_2026',
        examId: examId,
        admissionNumber: 'S0486/0002/2026',
        totalMarks: 564,
        average: 80.5,
        division: 'Division I - 8 Points',
        position: 2,
        subjects: [
          { subjectId: '011', subjectName: 'Civics', marks: 79, grade: 'B', remarks: 'Vizuri Sana' },
          { subjectId: '012', subjectName: 'History', marks: 81, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '013', subjectName: 'Geography', marks: 76, grade: 'B', remarks: 'Vizuri Sana' },
          { subjectId: '021', subjectName: 'Kiswahili', marks: 86, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '022', subjectName: 'English Language', marks: 82, grade: 'A', remarks: 'Bora Kabisa' },
          { subjectId: '032', subjectName: 'Chemistry', marks: 78, grade: 'B', remarks: 'Vizuri Sana' },
          { subjectId: '041', subjectName: 'Basic Mathematics', marks: 82, grade: 'A', remarks: 'Bora Kabisa' },
        ],
        publishedBy: 'Br. Adolph Massawe (Headmaster)',
        publishedAt: new Date().toISOString(),
      },
    ];

    for (const pub of defaultPublishedResults) {
      await setDoc(doc(db, 'published_results', pub.id!), pub, { merge: true });
    }

    // 9. Announcements (announcements/{announcementId})
    const defaultAnnouncements: FirestoreAnnouncement[] = [
      {
        id: 'ann_midterm_assembly_2026',
        title: 'Mkutano Maalum wa Wazazi na Walezi - Kidato cha Nne',
        message: 'Uongozi wa Shule ya Sekondari Uomboni unawakaribisha wazazi wote wa Kidato cha Nne kwenye kikao cha tathmini ya Mock siku ya Jumamosi saa 3:00 Asubuhi kwenye Ukumbi Mkuu wa Shule.',
        target: 'parents',
        createdBy: 'Br. Adolph Massawe (Headmaster)',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'ann_pre_national_necta_notice',
        title: 'Ratiba ya Mitihani ya Pre-National NECTA 2026',
        message: 'Mitihani ya Pre-National kwa wanafunzi wa Kidato cha Pili na Nne itaanza rasmi tarehe 10 Machi 2026. Wanafunzi wote wazingatie maelekezo ya wasimamizi na kuvaa sare rasmi za shule.',
        target: 'all',
        createdBy: 'Mwl. Yohana Bahati (Academic Master)',
        createdAt: new Date().toISOString(),
      },
    ];

    for (const ann of defaultAnnouncements) {
      await setDoc(doc(db, 'announcements', ann.id!), ann, { merge: true });
    }

    return {
      success: true,
      message: 'All 10 canonical Firestore collections populated with official Uomboni institutional records.',
    };
  } catch (err: any) {
    console.error('Error seeding foundation schema:', err);
    return {
      success: false,
      message: `Failed to seed foundation schema: ${err?.message || err}`,
    };
  }
}
