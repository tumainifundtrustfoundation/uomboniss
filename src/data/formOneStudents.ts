import { StudentProfile, StudentResult, SubjectResult } from '../types';

export interface FormOneCandidateRecord {
  rollNo: number;
  indexNumber: string; // S0486-0036 to S0486-0060
  classIndex: string;  // F1-0001 to F1-0025
  sex: 'F' | 'M';
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  centreNumber: string; // S.0486
}

export const OFFICIAL_FORM_ONE_REGISTER_DATA: FormOneCandidateRecord[] = [
  // 1-16: Wavulana (Male Students)
  { rollNo: 1, indexNumber: 'S0486-0036', classIndex: 'F1-0001', sex: 'M', firstName: 'Alfan', middleName: 'Bakari', lastName: 'Manday', fullName: 'Alfan Bakari Manday', centreNumber: 'S.0486' },
  { rollNo: 2, indexNumber: 'S0486-0037', classIndex: 'F1-0002', sex: 'M', firstName: 'Brayan', middleName: 'Rumishael', lastName: 'Urio', fullName: 'Brayan Rumishael Urio', centreNumber: 'S.0486' },
  { rollNo: 3, indexNumber: 'S0486-0038', classIndex: 'F1-0003', sex: 'M', firstName: 'David', middleName: 'Maka', lastName: 'Kasimoto', fullName: 'David Maka Kasimoto', centreNumber: 'S.0486' },
  { rollNo: 4, indexNumber: 'S0486-0039', classIndex: 'F1-0004', sex: 'M', firstName: 'Elisha', middleName: 'Alfred', lastName: 'Minja', fullName: 'Elisha Alfred Minja', centreNumber: 'S.0486' },
  { rollNo: 5, indexNumber: 'S0486-0040', classIndex: 'F1-0005', sex: 'M', firstName: 'Francis', middleName: 'Simon', lastName: 'Samson', fullName: 'Francis Simon Samson', centreNumber: 'S.0486' },
  { rollNo: 6, indexNumber: 'S0486-0041', classIndex: 'F1-0006', sex: 'M', firstName: 'Francis', middleName: 'William', lastName: 'Shayo', fullName: 'Francis William Shayo', centreNumber: 'S.0486' },
  { rollNo: 7, indexNumber: 'S0486-0042', classIndex: 'F1-0007', sex: 'M', firstName: 'Fredias', middleName: 'Reginald', lastName: 'Lasway', fullName: 'Fredias Reginald Lasway', centreNumber: 'S.0486' },
  { rollNo: 8, indexNumber: 'S0486-0043', classIndex: 'F1-0008', sex: 'M', firstName: 'Grecious', middleName: 'Peter', lastName: 'Meela', fullName: 'Grecious Peter Meela', centreNumber: 'S.0486' },
  { rollNo: 9, indexNumber: 'S0486-0044', classIndex: 'F1-0009', sex: 'M', firstName: 'Godfrey', middleName: 'John', lastName: 'Temu', fullName: 'Godfrey John Temu', centreNumber: 'S.0486' },
  { rollNo: 10, indexNumber: 'S0486-0045', classIndex: 'F1-0010', sex: 'M', firstName: 'Jovin', middleName: 'Ewald', lastName: 'Minja', fullName: 'Jovin Ewald Minja', centreNumber: 'S.0486' },
  { rollNo: 11, indexNumber: 'S0486-0046', classIndex: 'F1-0011', sex: 'M', firstName: 'Jonans', middleName: 'Dismas', lastName: 'Temba', fullName: 'Jonans Dismas Temba', centreNumber: 'S.0486' },
  { rollNo: 12, indexNumber: 'S0486-0047', classIndex: 'F1-0012', sex: 'M', firstName: 'James', middleName: 'Michael', lastName: 'Mshanga', fullName: 'James Michael Mshanga', centreNumber: 'S.0486' },
  { rollNo: 13, indexNumber: 'S0486-0048', classIndex: 'F1-0013', sex: 'M', firstName: 'Kenedy', middleName: 'Kefa', lastName: 'Lazima', fullName: 'Kenedy Kefa Lazima', centreNumber: 'S.0486' },
  { rollNo: 14, indexNumber: 'S0486-0049', classIndex: 'F1-0014', sex: 'M', firstName: 'Livino', middleName: 'Aloyce', lastName: 'Nguma', fullName: 'Livino Aloyce Nguma', centreNumber: 'S.0486' },
  { rollNo: 15, indexNumber: 'S0486-0050', classIndex: 'F1-0015', sex: 'M', firstName: 'Raphael', middleName: 'Jumanne', lastName: 'Mlwenga', fullName: 'Raphael Jumanne Mlwenga', centreNumber: 'S.0486' },
  { rollNo: 16, indexNumber: 'S0486-0051', classIndex: 'F1-0016', sex: 'M', firstName: 'Wolfugan', middleName: 'Deogratius', lastName: 'Kimbi', fullName: 'Wolfugan Deogratius Kimbi', centreNumber: 'S.0486' },

  // 17-25: Wasichana (Female Students)
  { rollNo: 17, indexNumber: 'S0486-0052', classIndex: 'F1-0017', sex: 'F', firstName: 'Faith', middleName: 'Cosmas', lastName: 'Johnson', fullName: 'Faith Cosmas Johnson', centreNumber: 'S.0486' },
  { rollNo: 18, indexNumber: 'S0486-0053', classIndex: 'F1-0018', sex: 'F', firstName: 'Floracareen', middleName: 'Nicholaus', lastName: 'Marandu', fullName: 'Floracareen Nicholaus Marandu', centreNumber: 'S.0486' },
  { rollNo: 19, indexNumber: 'S0486-0054', classIndex: 'F1-0019', sex: 'F', firstName: 'Moureen', middleName: 'Paulo', lastName: 'Ndonde', fullName: 'Moureen Paulo Ndonde', centreNumber: 'S.0486' },
  { rollNo: 20, indexNumber: 'S0486-0055', classIndex: 'F1-0020', sex: 'F', firstName: 'Prediganda', middleName: 'William', lastName: 'France', fullName: 'Prediganda William France', centreNumber: 'S.0486' },
  { rollNo: 21, indexNumber: 'S0486-0056', classIndex: 'F1-0021', sex: 'F', firstName: 'Regina', middleName: 'John', lastName: 'Temu', fullName: 'Regina John Temu', centreNumber: 'S.0486' },
  { rollNo: 22, indexNumber: 'S0486-0057', classIndex: 'F1-0022', sex: 'F', firstName: 'Sarah', middleName: 'Sabas', lastName: 'Kawishe', fullName: 'Sarah Sabas Kawishe', centreNumber: 'S.0486' },
  { rollNo: 23, indexNumber: 'S0486-0058', classIndex: 'F1-0023', sex: 'F', firstName: 'Happyness', middleName: 'January', lastName: 'Sebatloa', fullName: 'Happyness January Sebatloa', centreNumber: 'S.0486' },
  { rollNo: 24, indexNumber: 'S0486-0059', classIndex: 'F1-0024', sex: 'F', firstName: 'Hermina', middleName: 'Protas', lastName: 'Chuwa', fullName: 'Hermina Protas Chuwa', centreNumber: 'S.0486' },
  { rollNo: 25, indexNumber: 'S0486-0060', classIndex: 'F1-0025', sex: 'F', firstName: 'Vanessa', middleName: 'James', lastName: 'Lymuya', fullName: 'Vanessa James Lymuya', centreNumber: 'S.0486' },
];

export const FORM_ONE_STUDENT_PROFILES: StudentProfile[] = OFFICIAL_FORM_ONE_REGISTER_DATA.map((rec, index) => {
  const numStr = (index + 1).toString().padStart(4, '0');
  const isFemale = rec.sex === 'F';
  const isBoarding = index % 3 !== 1; // 16 boarding, 9 day scholars
  const dorm = isFemale
    ? (index % 2 === 0 ? 'St. Theresa Hall (Room 2)' : 'St. Maria Goretti (Room 3)')
    : (index % 2 === 0 ? 'Kibo Hostel (Room B)' : 'Mawenzi Block (Room C)');

  const phonePrefixes = ['0754', '0784', '0768', '0752', '0745', '0713', '0782'];
  const pPrefix = phonePrefixes[index % phonePrefixes.length];
  const pSuffix = (160000 + (index * 3829) % 820000).toString();
  const parentPhone = `+255 ${pPrefix.substring(1)} ${pSuffix.substring(0, 3)} ${pSuffix.substring(3)}`;

  const villages = [
    'Marangu Magharibi, Moshi',
    'Marangu Mashariki, Moshi',
    'Mamba Kotela, Moshi',
    'Mwika Kaskazini, Moshi',
    'Keni Mengwe, Rombo/Moshi',
    'Himo Mjini, Moshi',
    'Kilema Kusini, Moshi',
    'Kirua Vunjo, Moshi',
    'Ashira, Marangu, Moshi',
    'Moshi Mjini, Kilimanjaro',
  ];
  const residence = villages[index % villages.length];

  return {
    id: `std-f1-${numStr}`,
    studentId: `USS-2025-${numStr}`,
    examNumber: rec.indexNumber,
    premNumber: `PREM-2024-${(99300 + index + 1).toString()}`,
    fullName: rec.fullName,
    gender: rec.sex,
    dob: isFemale ? `2010-0${((index % 8) + 1)}-11` : `2010-0${((index % 8) + 1)}-18`,
    dateOfBirth: isFemale ? `11/0${((index % 8) + 1)}/2010` : `18/0${((index % 8) + 1)}/2010`,
    form: 'Form 1',
    stream: 'A',
    admissionYear: 2025,
    enrollmentDate: '2025-01-13',
    studentType: isBoarding ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
    boardingStatus: isBoarding ? 'Bweni' : 'Kutwa',
    dormitoryRoom: isBoarding ? dorm : undefined,
    hostelName: isBoarding ? (isFemale ? 'Hosteli ya Wasichana' : 'Hosteli ya Wavulana') : undefined,
    bedNumber: isBoarding ? `Kitanda #${index + 1}` : undefined,
    lockerNumber: `Kabati-F1-${(index + 1).toString().padStart(2, '0')}`,
    previousSchool: index % 3 === 0 ? 'Shule ya Msingi Marangu' : index % 3 === 1 ? 'Shule ya Msingi Uomboni' : 'Shule ya Msingi Mwika',
    parentName: `${rec.middleName} ${rec.lastName}`,
    parentGuardianName: `${rec.middleName} ${rec.lastName}`,
    parentPhone: parentPhone,
    parentEmail: `${rec.lastName.toLowerCase()}.${rec.firstName.toLowerCase()}@gmail.com`,
    residence: residence,
    address: `${residence}, Kilimanjaro`,
    religion: index % 4 === 0 ? 'Katoliki (RC)' : index % 4 === 1 ? 'KKKT (Lutheran)' : index % 4 === 2 ? 'Katoliki (RC)' : 'Islam',
    attendanceRate: 96 + (index % 4),
    conductRating: index % 4 === 0 ? 'Bora Sana' : 'Nzuri Sana',
    leadershipRole: index === 0 ? 'Kiranja wa Darasa (Class Monitor)' : index === 16 ? 'Kiranja wa Wasichana (Monitress)' : undefined,
    clubs: index % 2 === 0 ? ['Klabu ya Mazingira & Malihai', 'Klabu ya TEHAMA & Kompyuta'] : ['Klabu ya Sayansi & Hisabati', 'Kwaya ya Shule'],
    feeTotal: isBoarding ? 1200000 : 750000,
    feePaid: isBoarding ? (index % 2 === 0 ? 1200000 : 900000) : (index % 3 === 0 ? 750000 : 550000),
  };
});

// Authentic Form One Mid-Term / Terminal Results
export const FORM_ONE_STUDENT_RESULTS: StudentResult[] = OFFICIAL_FORM_ONE_REGISTER_DATA.map((rec, index) => {
  const scoresPreset = [
    { civ: 86, hist: 84, geo: 88, kisw: 92, eng: 89, phys: 82, chem: 85, bio: 90, math: 88, rel: 94 }, // 1. Alfan Bakari Manday
    { civ: 82, hist: 80, geo: 84, kisw: 88, eng: 85, phys: 78, chem: 81, bio: 86, math: 82, rel: 90 }, // 2. Brayan Rumishael Urio
    { civ: 79, hist: 77, geo: 81, kisw: 85, eng: 82, phys: 75, chem: 78, bio: 83, math: 79, rel: 87 }, // 3. David Maka Kasimoto
    { civ: 88, hist: 85, geo: 89, kisw: 93, eng: 90, phys: 85, chem: 88, bio: 92, math: 90, rel: 95 }, // 4. Elisha Alfred Minja
    { civ: 81, hist: 79, geo: 83, kisw: 86, eng: 84, phys: 76, chem: 80, bio: 85, math: 81, rel: 89 }, // 5. Francis Simon Samson
    { civ: 83, hist: 81, geo: 85, kisw: 87, eng: 86, phys: 79, chem: 82, bio: 87, math: 83, rel: 91 }, // 6. Francis William Shayo
    { civ: 80, hist: 78, geo: 82, kisw: 85, eng: 83, phys: 74, chem: 79, bio: 84, math: 80, rel: 88 }, // 7. Fredias Reginald Lasway
    { civ: 85, hist: 83, geo: 87, kisw: 90, eng: 88, phys: 81, chem: 84, bio: 89, math: 86, rel: 92 }, // 8. Grecious Peter Meela
    { civ: 82, hist: 80, geo: 84, kisw: 88, eng: 85, phys: 77, chem: 81, bio: 86, math: 82, rel: 90 }, // 9. Godfrey John Temu
    { civ: 84, hist: 82, geo: 86, kisw: 89, eng: 87, phys: 80, chem: 83, bio: 88, math: 84, rel: 92 }, // 10. Jovin Ewald Minja
    { civ: 78, hist: 76, geo: 80, kisw: 84, eng: 81, phys: 73, chem: 77, bio: 82, math: 78, rel: 86 }, // 11. Jonans Dismas Temba
    { civ: 81, hist: 79, geo: 83, kisw: 87, eng: 84, phys: 76, chem: 80, bio: 85, math: 81, rel: 89 }, // 12. James Michael Mshanga
    { civ: 83, hist: 81, geo: 85, kisw: 88, eng: 85, phys: 78, chem: 82, bio: 87, math: 83, rel: 90 }, // 13. Kenedy Kefa Lazima
    { civ: 80, hist: 78, geo: 82, kisw: 85, eng: 83, phys: 75, chem: 79, bio: 84, math: 80, rel: 88 }, // 14. Livino Aloyce Nguma
    { civ: 82, hist: 80, geo: 84, kisw: 87, eng: 85, phys: 77, chem: 81, bio: 86, math: 82, rel: 90 }, // 15. Raphael Jumanne Mlwenga
    { civ: 86, hist: 84, geo: 88, kisw: 91, eng: 89, phys: 83, chem: 86, bio: 91, math: 88, rel: 93 }, // 16. Wolfugan Deogratius Kimbi
    { civ: 89, hist: 87, geo: 91, kisw: 94, eng: 92, phys: 86, chem: 89, bio: 94, math: 91, rel: 96 }, // 17. Faith Cosmas Johnson
    { civ: 87, hist: 85, geo: 89, kisw: 92, eng: 90, phys: 84, chem: 87, bio: 92, math: 89, rel: 94 }, // 18. Floracareen Nicholaus Marandu
    { civ: 84, hist: 82, geo: 86, kisw: 89, eng: 87, phys: 80, chem: 83, bio: 88, math: 84, rel: 92 }, // 19. Moureen Paulo Ndonde
    { civ: 85, hist: 83, geo: 87, kisw: 90, eng: 88, phys: 81, chem: 84, bio: 89, math: 85, rel: 93 }, // 20. Prediganda William France
    { civ: 86, hist: 84, geo: 88, kisw: 91, eng: 89, phys: 82, chem: 85, bio: 90, math: 87, rel: 94 }, // 21. Regina John Temu
    { civ: 88, hist: 86, geo: 90, kisw: 93, eng: 91, phys: 85, chem: 88, bio: 93, math: 90, rel: 95 }, // 22. Sarah Sabas Kawishe
    { civ: 83, hist: 81, geo: 85, kisw: 88, eng: 86, phys: 79, chem: 82, bio: 87, math: 83, rel: 91 }, // 23. Happyness January Sebatloa
    { civ: 85, hist: 83, geo: 87, kisw: 90, eng: 88, phys: 81, chem: 84, bio: 89, math: 86, rel: 92 }, // 24. Hermina Protas Chuwa
    { civ: 87, hist: 85, geo: 89, kisw: 92, eng: 90, phys: 84, chem: 87, bio: 92, math: 88, rel: 94 }, // 25. Vanessa James Lymuya
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
  const sortedPoints = [...subjects.map((s) => s.points)].sort((a, b) => a - b);
  const best7Points = sortedPoints.slice(0, 7).reduce((a, b) => a + b, 0);
  const division = best7Points <= 17 ? 'Division I' : best7Points <= 21 ? 'Division II' : 'Division III';

  return {
    id: `res-f1-${(index + 1).toString().padStart(4, '0')}`,
    examNumber: rec.indexNumber,
    studentName: rec.fullName,
    gender: rec.sex,
    form: 'Form 1',
    stream: 'A',
    examType: 'Mtihani wa Muhula (Terminal Exam 2025)',
    year: 2025,
    subjects,
    totalMarks,
    averageMarks,
    division,
    points: best7Points,
    classPosition: index === 16 ? 1 : index === 3 ? 2 : index === 21 ? 3 : index + 1,
    totalStudentsInClass: 25,
    conduct: 'Bora Sana',
    headmasterRemarks: 'Mwanzo mzuri sana wa Kidato cha Kwanza. Dumisha nidhamu na bidii katika masomo yako.',
    publishDate: '2025-11-20',
  };
});
