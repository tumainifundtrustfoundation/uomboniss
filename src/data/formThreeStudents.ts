import { StudentProfile, StudentResult, SubjectResult } from '../types';

export interface FormThreeCandidateRecord {
  rollNo: number;
  indexNumber: string; // S0486-0025 to S0486-0035
  classIndex: string; // F3-0001 to F3-0011
  sex: 'F' | 'M';
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  centreNumber: string; // S.0486
}

export const OFFICIAL_FORM_THREE_REGISTER_DATA: FormThreeCandidateRecord[] = [
  { rollNo: 1, indexNumber: 'S0486-0025', classIndex: 'F3-0001', sex: 'F', firstName: 'Beatrice', middleName: 'John', lastName: 'Mremi', fullName: 'Beatrice John Mremi', centreNumber: 'S.0486' },
  { rollNo: 2, indexNumber: 'S0486-0026', classIndex: 'F3-0002', sex: 'F', firstName: 'Frida', middleName: 'John', lastName: 'Egidi', fullName: 'Frida John Egidi', centreNumber: 'S.0486' },
  { rollNo: 3, indexNumber: 'S0486-0027', classIndex: 'F3-0003', sex: 'F', firstName: 'Jackline', middleName: 'Johnson', lastName: 'Mrita', fullName: 'Jackline Johnson Mrita', centreNumber: 'S.0486' },
  { rollNo: 4, indexNumber: 'S0486-0028', classIndex: 'F3-0004', sex: 'F', firstName: 'Sauda', middleName: 'Hamisi', lastName: 'Hassani', fullName: 'Sauda Hamisi Hassani', centreNumber: 'S.0486' },
  { rollNo: 5, indexNumber: 'S0486-0029', classIndex: 'F3-0005', sex: 'M', firstName: 'Emmanuel', middleName: 'Polycarpy', lastName: 'Njau', fullName: 'Emmanuel Polycarpy Njau', centreNumber: 'S.0486' },
  { rollNo: 6, indexNumber: 'S0486-0030', classIndex: 'F3-0006', sex: 'M', firstName: 'Imanyai', middleName: 'Emmanuel', lastName: 'Ketto', fullName: 'Imanyai Emmanuel Ketto', centreNumber: 'S.0486' },
  { rollNo: 7, indexNumber: 'S0486-0031', classIndex: 'F3-0007', sex: 'M', firstName: 'Justine', middleName: 'Priscus', lastName: 'Kimario', fullName: 'Justine Priscus Kimario', centreNumber: 'S.0486' },
  { rollNo: 8, indexNumber: 'S0486-0032', classIndex: 'F3-0008', sex: 'M', firstName: 'Joshua', middleName: 'Antin', lastName: 'Massawe', fullName: 'Joshua Antin Massawe', centreNumber: 'S.0486' },
  { rollNo: 9, indexNumber: 'S0486-0033', classIndex: 'F3-0009', sex: 'M', firstName: 'Joseph', middleName: 'Gaudence', lastName: 'Temu', fullName: 'Joseph Gaudence Temu', centreNumber: 'S.0486' },
  { rollNo: 10, indexNumber: 'S0486-0034', classIndex: 'F3-0010', sex: 'M', firstName: 'Joshua', middleName: 'Japhet', lastName: 'Stephano', fullName: 'Joshua Japhet Stephano', centreNumber: 'S.0486' },
  { rollNo: 11, indexNumber: 'S0486-0035', classIndex: 'F3-0011', sex: 'M', firstName: 'Nolasco', middleName: 'Denis', lastName: 'Massawe', fullName: 'Nolasco Denis Massawe', centreNumber: 'S.0486' },
];

export const FORM_THREE_STUDENT_PROFILES: StudentProfile[] = OFFICIAL_FORM_THREE_REGISTER_DATA.map((rec, index) => {
  const numStr = (index + 1).toString().padStart(4, '0');
  const isFemale = rec.sex === 'F';
  const isBoarding = index % 3 !== 1; // 8 boarding, 3 day scholars
  const dorm = isFemale
    ? (index % 2 === 0 ? 'St. Theresa Hall (Room 3)' : 'St. Maria Goretti (Room 1)')
    : (index % 2 === 0 ? 'Kibo Hostel (Room C)' : 'Mawenzi Block (Room A)');

  const phonePrefixes = ['0754', '0784', '0768', '0752', '0745', '0713', '0782'];
  const pPrefix = phonePrefixes[index % phonePrefixes.length];
  const pSuffix = (140000 + (index * 4219) % 850000).toString();
  const parentPhone = `+255 ${pPrefix.substring(1)} ${pSuffix.substring(0, 3)} ${pSuffix.substring(3)}`;

  const villages = [
    'Marangu Mashariki, Moshi',
    'Marangu Magharibi, Moshi',
    'Mamba Kotela, Moshi',
    'Mwika Kusini, Moshi',
    'Keni Mengwe, Rombo/Moshi',
    'Himo Mjini, Moshi',
    'Kilema Kaskazini, Moshi',
    'Kirua Vunjo, Moshi',
    'Ashira, Marangu, Moshi',
  ];
  const residence = villages[index % villages.length];

  return {
    id: `std-f3-${numStr}`,
    studentId: `USS-2023-${numStr}`,
    examNumber: rec.indexNumber,
    premNumber: `PREM-2022-${(77100 + index + 1).toString()}`,
    fullName: rec.fullName,
    gender: rec.sex,
    dob: isFemale ? `2008-0${((index % 8) + 2)}-18` : `2008-0${((index % 8) + 2)}-26`,
    dateOfBirth: isFemale ? `18/0${((index % 8) + 2)}/2008` : `26/0${((index % 8) + 2)}/2008`,
    form: 'Form 3',
    stream: index < 6 ? 'Science' : 'Arts',
    admissionYear: 2023,
    enrollmentDate: '2023-01-16',
    studentType: isBoarding ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
    boardingStatus: isBoarding ? 'Bweni' : 'Kutwa',
    dormitoryRoom: isBoarding ? dorm : undefined,
    hostelName: isBoarding ? (isFemale ? 'Hosteli ya Wasichana' : 'Hosteli ya Wavulana') : undefined,
    bedNumber: isBoarding ? `Kitanda #F3-${index + 1}` : undefined,
    lockerNumber: `Kabati-F3-${(index + 1).toString().padStart(2, '0')}`,
    previousSchool: index % 2 === 0 ? 'Shule ya Msingi Ashira' : 'Shule ya Msingi Uomboni',
    parentName: `${rec.middleName} ${rec.lastName}`,
    parentGuardianName: `${rec.middleName} ${rec.lastName}`,
    parentPhone: parentPhone,
    parentEmail: `${rec.lastName.toLowerCase()}.${rec.firstName.toLowerCase()}@gmail.com`,
    residence: residence,
    address: `${residence}, Kilimanjaro`,
    religion: index % 4 === 0 ? 'Katoliki (RC)' : index % 4 === 1 ? 'KKKT (Lutheran)' : index % 4 === 2 ? 'Katoliki (RC)' : 'Islam',
    attendanceRate: 96 + (index % 4),
    conductRating: index % 3 === 0 ? 'Bora Sana' : 'Nzuri Sana',
    leadershipRole: index === 0 ? 'Kiranja Mkuu wa Wasichana (Head Girl F3)' : index === 4 ? 'Kiranja wa Taaluma (Academic Prefect F3)' : undefined,
    clubs: index % 2 === 0 ? ['Klabu ya Mazingira & Malihai', 'Klabu ya TEHAMA'] : ['Klabu ya Sayansi & Hesabu', 'Klabu ya Lugha & Mdahalo'],
    feeTotal: isBoarding ? 1200000 : 750000,
    feePaid: isBoarding ? (index % 2 === 0 ? 1200000 : 950000) : (index % 2 === 0 ? 750000 : 650000),
  };
});

export const FORM_THREE_STUDENT_RESULTS: StudentResult[] = OFFICIAL_FORM_THREE_REGISTER_DATA.map((rec, index) => {
  const scoresPreset = [
    { civ: 84, hist: 82, geo: 85, kisw: 90, eng: 88, phys: 78, chem: 84, bio: 88, math: 86, rel: 92 }, // 1. Beatrice John Mremi
    { civ: 80, hist: 78, geo: 82, kisw: 88, eng: 85, phys: 74, chem: 80, bio: 85, math: 81, rel: 89 }, // 2. Frida John Egidi
    { civ: 78, hist: 76, geo: 79, kisw: 84, eng: 86, phys: 70, chem: 76, bio: 82, math: 75, rel: 86 }, // 3. Jackline Johnson Mrita
    { civ: 82, hist: 80, geo: 81, kisw: 91, eng: 84, phys: 72, chem: 79, bio: 84, math: 78, rel: 90 }, // 4. Sauda Hamisi Hassani
    { civ: 88, hist: 85, geo: 87, kisw: 89, eng: 91, phys: 84, chem: 88, bio: 92, math: 90, rel: 94 }, // 5. Emmanuel Polycarpy Njau
    { civ: 76, hist: 74, geo: 78, kisw: 82, eng: 80, phys: 71, chem: 75, bio: 80, math: 74, rel: 84 }, // 6. Imanyai Emmanuel Ketto
    { civ: 79, hist: 77, geo: 80, kisw: 85, eng: 83, phys: 73, chem: 78, bio: 83, math: 77, rel: 87 }, // 7. Justine Priscus Kimario
    { civ: 83, hist: 81, geo: 84, kisw: 87, eng: 86, phys: 77, chem: 82, bio: 86, math: 82, rel: 90 }, // 8. Joshua Antin Massawe
    { civ: 81, hist: 79, geo: 83, kisw: 86, eng: 84, phys: 75, chem: 81, bio: 85, math: 80, rel: 88 }, // 9. Joseph Gaudence Temu
    { civ: 77, hist: 75, geo: 79, kisw: 83, eng: 81, phys: 72, chem: 76, bio: 81, math: 76, rel: 85 }, // 10. Joshua Japhet Stephano
    { civ: 85, hist: 83, geo: 86, kisw: 88, eng: 87, phys: 80, chem: 85, bio: 89, math: 85, rel: 91 }, // 11. Nolasco Denis Massawe
  ];

  const sc = scoresPreset[index] || scoresPreset[0];
  const toGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' => (score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 45 ? 'C' : score >= 30 ? 'D' : 'F');

  const subjects: SubjectResult[] = [
    { code: '011', name: 'Civics', nameEn: 'Civics', score: sc.civ, grade: toGrade(sc.civ), points: sc.civ >= 75 ? 1 : 2, remarks: 'Bora Sana' },
    { code: '012', name: 'History', nameEn: 'History', score: sc.hist, grade: toGrade(sc.hist), points: sc.hist >= 75 ? 1 : 2, remarks: 'Bora Sana' },
    { code: '013', name: 'Geography', nameEn: 'Geography', score: sc.geo, grade: toGrade(sc.geo), points: sc.geo >= 75 ? 1 : 2, remarks: 'Bora Sana' },
    { code: '021', name: 'Kiswahili', nameEn: 'Kiswahili', score: sc.kisw, grade: toGrade(sc.kisw), points: 1, remarks: 'Bora Sana' },
    { code: '022', name: 'English Language', nameEn: 'English Language', score: sc.eng, grade: toGrade(sc.eng), points: 1, remarks: 'Bora Sana' },
    { code: '031', name: 'Physics', nameEn: 'Physics', score: sc.phys, grade: toGrade(sc.phys), points: sc.phys >= 75 ? 1 : 2, remarks: 'Nzuri Sana' },
    { code: '032', name: 'Chemistry', nameEn: 'Chemistry', score: sc.chem, grade: toGrade(sc.chem), points: sc.chem >= 75 ? 1 : 2, remarks: 'Bora Sana' },
    { code: '033', name: 'Biology', nameEn: 'Biology', score: sc.bio, grade: toGrade(sc.bio), points: 1, remarks: 'Bora Sana' },
    { code: '041', name: 'Basic Mathematics', nameEn: 'Basic Mathematics', score: sc.math, grade: toGrade(sc.math), points: sc.math >= 75 ? 1 : 2, remarks: 'Bora Sana' },
    { code: '071', name: 'Religious Education', nameEn: 'Religious Education', score: sc.rel, grade: 'A', points: 1, remarks: 'Bora Sana' },
  ];

  const totalMarks = subjects.reduce((sum, s) => sum + s.score, 0);
  const averageMarks = Math.round((totalMarks / subjects.length) * 10) / 10;
  // Calculate best 7 subjects points for division
  const sortedPoints = [...subjects.map((s) => s.points)].sort((a, b) => a - b);
  const best7Points = sortedPoints.slice(0, 7).reduce((a, b) => a + b, 0);
  const division = best7Points <= 17 ? 'Division I' : best7Points <= 21 ? 'Division II' : 'Division III';

  return {
    id: `res-f3-${(index + 1).toString().padStart(4, '0')}`,
    examNumber: rec.indexNumber,
    studentName: rec.fullName,
    gender: rec.sex,
    form: 'Form 3',
    stream: index < 6 ? 'Science' : 'Arts',
    examType: 'Mtihani wa Muhula (Terminal Exam 2025)',
    year: 2025,
    subjects,
    totalMarks,
    averageMarks,
    division,
    points: best7Points,
    classPosition: index === 4 ? 1 : index === 0 ? 2 : index === 10 ? 3 : index + 1,
    totalStudentsInClass: 11,
    conduct: 'Bora Sana',
    headmasterRemarks: 'Ufaulu mzuri sana. Endelea kudumisha ari ya kujisomea ili kujiandaa vyema na Kidato cha Nne.',
    publishDate: '2025-11-20',
  };
});
