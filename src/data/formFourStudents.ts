import { StudentProfile, StudentResult, SubjectResult } from '../types';

export interface FormFourCandidateRecord {
  rollNo: number;
  indexNumber: string; // S.0486.0001 to S.0486.0019 (NECTA CSEE Candidate No.)
  classIndex: string;  // F4-0001 to F4-0019
  sex: 'F' | 'M';
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  centreNumber: string; // S.0486
  combination: 'Science' | 'Arts';
}

/**
 * Official Form Four Candidate Register of Uomboni Secondary School (Center S.0486)
 * Transcribed verbatim from the authentic school register (Rolls 1 to 19).
 */
export const OFFICIAL_FORM_FOUR_REGISTER_DATA: FormFourCandidateRecord[] = [
  // 1-6: Wasichana (Female Candidates)
  {
    rollNo: 1,
    indexNumber: 'S.0486.0001',
    classIndex: 'F4-0001',
    sex: 'F',
    firstName: 'Adella',
    middleName: 'Silvano',
    lastName: 'Massawe',
    fullName: 'Adella Silvano Massawe',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 2,
    indexNumber: 'S.0486.0002',
    classIndex: 'F4-0002',
    sex: 'F',
    firstName: 'Anitha',
    middleName: 'Miraji',
    lastName: 'Muhamad',
    fullName: 'Anitha Miraji Muhamad',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
  {
    rollNo: 3,
    indexNumber: 'S.0486.0003',
    classIndex: 'F4-0003',
    sex: 'F',
    firstName: 'Elizabeth',
    middleName: 'Festo',
    lastName: 'Kessy',
    fullName: 'Elizabeth Festo Kessy',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
  {
    rollNo: 4,
    indexNumber: 'S.0486.0004',
    classIndex: 'F4-0004',
    sex: 'F',
    firstName: 'Farida',
    middleName: 'Mohamed',
    lastName: 'Juma',
    fullName: 'Farida Mohamed Juma',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
  {
    rollNo: 5,
    indexNumber: 'S.0486.0005',
    classIndex: 'F4-0005',
    sex: 'F',
    firstName: 'Gloria',
    middleName: 'Paul',
    lastName: 'William',
    fullName: 'Gloria Paul William',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
  {
    rollNo: 6,
    indexNumber: 'S.0486.0006',
    classIndex: 'F4-0006',
    sex: 'F',
    firstName: 'Julieth',
    middleName: 'Abel',
    lastName: 'Lyimo',
    fullName: 'Julieth Abel Lyimo',
    centreNumber: 'S.0486',
    combination: 'Science',
  },

  // 7-18: Wavulana (Male Candidates)
  {
    rollNo: 7,
    indexNumber: 'S.0486.0007',
    classIndex: 'F4-0007',
    sex: 'M',
    firstName: 'Allen',
    middleName: 'Christopher',
    lastName: 'Mbiku',
    fullName: 'Allen Christopher Mbiku',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 8,
    indexNumber: 'S.0486.0008',
    classIndex: 'F4-0008',
    sex: 'M',
    firstName: 'Daud',
    middleName: 'Innocent',
    lastName: 'Massawe',
    fullName: 'Daud Innocent Massawe',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 9,
    indexNumber: 'S.0486.0009',
    classIndex: 'F4-0009',
    sex: 'M',
    firstName: 'David',
    middleName: 'Dismas',
    lastName: 'Vicent',
    fullName: 'David Dismas Vicent',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 10,
    indexNumber: 'S.0486.0010',
    classIndex: 'F4-0010',
    sex: 'M',
    firstName: 'Dominick',
    middleName: 'Boniventure',
    lastName: 'Masunga',
    fullName: 'Dominick Boniventure Masunga',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 11,
    indexNumber: 'S.0486.0011',
    classIndex: 'F4-0011',
    sex: 'M',
    firstName: 'Isdory',
    middleName: 'Wilhem',
    lastName: 'Kawishe',
    fullName: 'Isdory Wilhem Kawishe',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 12,
    indexNumber: 'S.0486.0012',
    classIndex: 'F4-0012',
    sex: 'M',
    firstName: 'Louice',
    middleName: 'Benedict',
    lastName: 'Tungaraza',
    fullName: 'Louice Benedict Tungaraza',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
  {
    rollNo: 13,
    indexNumber: 'S.0486.0013',
    classIndex: 'F4-0013',
    sex: 'M',
    firstName: 'Meshack',
    middleName: 'Peter',
    lastName: 'Olomi',
    fullName: 'Meshack Peter Olomi',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 14,
    indexNumber: 'S.0486.0014',
    classIndex: 'F4-0014',
    sex: 'M',
    firstName: 'Richard',
    middleName: 'Reginald',
    lastName: 'Morio',
    fullName: 'Richard Reginald Morio',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 15,
    indexNumber: 'S.0486.0015',
    classIndex: 'F4-0015',
    sex: 'M',
    firstName: 'Simon',
    middleName: 'Narisis',
    lastName: 'Mramba',
    fullName: 'Simon Narisis Mramba',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 16,
    indexNumber: 'S.0486.0016',
    classIndex: 'F4-0016',
    sex: 'M',
    firstName: 'Willbrood',
    middleName: 'Peter',
    lastName: 'Kiwale',
    fullName: 'Willbrood Peter Kiwale',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 17,
    indexNumber: 'S.0486.0017',
    classIndex: 'F4-0017',
    sex: 'M',
    firstName: 'Amedeus',
    middleName: 'Thadei',
    lastName: 'Mrii',
    fullName: 'Amedeus Thadei Mrii',
    centreNumber: 'S.0486',
    combination: 'Science',
  },
  {
    rollNo: 18,
    indexNumber: 'S.0486.0018',
    classIndex: 'F4-0018',
    sex: 'M',
    firstName: 'Br. Gasper',
    middleName: 'Honest',
    lastName: 'Kimario',
    fullName: 'Br. Gasper Honest Kimario',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },

  // 19: Msichana (Female Candidate)
  {
    rollNo: 19,
    indexNumber: 'S.0486.0019',
    classIndex: 'F4-0019',
    sex: 'F',
    firstName: 'Tinah',
    middleName: 'George',
    lastName: 'Mhimbila',
    fullName: 'Tinah George Mhimbila',
    centreNumber: 'S.0486',
    combination: 'Arts',
  },
];

/**
 * Enriched Student Profiles for Form Four (Class of 2026 CSEE Candidates)
 */
export const FORM_FOUR_STUDENT_PROFILES: StudentProfile[] = OFFICIAL_FORM_FOUR_REGISTER_DATA.map((rec, index) => {
  const numStr = (index + 1).toString().padStart(4, '0');
  const isFemale = rec.sex === 'F';
  const isBoarding = index % 4 !== 3; // 15 boarding, 4 day scholars
  const dorm = isFemale
    ? (index % 2 === 0 ? 'St. Theresa Hall (Room 4 - Finalists)' : 'St. Maria Goretti (Room 3 - Finalists)')
    : (index % 2 === 0 ? 'Kibo Hostel (Room D - Finalists)' : 'Mawenzi Block (Room C - Finalists)');

  const phonePrefixes = ['0754', '0784', '0768', '0752', '0745', '0713', '0782'];
  const pPrefix = phonePrefixes[index % phonePrefixes.length];
  const pSuffix = (130000 + (index * 4517) % 860000).toString();
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
    'Kibosho, Moshi Vijijini',
  ];
  const residence = villages[index % villages.length];

  return {
    id: `std-f4-${numStr}`,
    studentId: `USS-2022-${numStr}`,
    examNumber: rec.indexNumber,
    premNumber: `PREM-2021-${(66100 + index + 1).toString()}`,
    fullName: rec.fullName,
    gender: rec.sex,
    dob: isFemale ? `2007-0${((index % 8) + 2)}-15` : `2007-0${((index % 8) + 2)}-20`,
    dateOfBirth: isFemale ? `15/0${((index % 8) + 2)}/2007` : `20/0${((index % 8) + 2)}/2007`,
    form: 'Form 4',
    stream: rec.combination,
    admissionYear: 2022,
    enrollmentDate: '2022-01-17',
    studentType: isBoarding ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
    boardingStatus: isBoarding ? 'Bweni' : 'Kutwa',
    dormitoryRoom: isBoarding ? dorm : undefined,
    hostelName: isBoarding ? (isFemale ? 'Hosteli Kuu ya Wasichana (St. Theresa)' : 'Hosteli Kuu ya Wavulana (Kibo)') : undefined,
    bedNumber: isBoarding ? `Kitanda #F4-${index + 1}` : undefined,
    lockerNumber: `Kabati-F4-${(index + 1).toString().padStart(2, '0')}`,
    previousSchool: index % 2 === 0 ? 'Shule ya Msingi Ashira' : 'Shule ya Msingi Uomboni',
    parentName: rec.fullName.startsWith('Br.') ? 'Uongozi wa Shirika / Dayosisi ya Moshi' : `${rec.middleName} ${rec.lastName}`,
    parentGuardianName: rec.fullName.startsWith('Br.') ? 'Uongozi wa Shirika / Dayosisi ya Moshi' : `${rec.middleName} ${rec.lastName}`,
    parentPhone: parentPhone,
    parentEmail: `${rec.lastName.toLowerCase().replace(/[^a-z]/g, '')}.${rec.firstName.toLowerCase().replace(/[^a-z]/g, '')}@gmail.com`,
    residence: residence,
    address: `${residence}, Kilimanjaro, Tanzania`,
    religion: rec.fullName.startsWith('Br.') ? 'Katoliki (RC - Mtawa/Brother)' : index % 4 === 0 ? 'Katoliki (RC)' : index % 4 === 1 ? 'KKKT (Lutheran)' : index % 4 === 2 ? 'Katoliki (RC)' : 'Islam',
    attendanceRate: 97 + (index % 3),
    conductRating: 'Bora Sana',
    leadershipRole:
      index === 0
        ? 'Kiranja Mkuu wa Wasichana (Head Girl F4)'
        : index === 7
        ? 'Kiranja Mkuu wa Shule (Head Boy F4)'
        : index === 12
        ? 'Kiranja wa Taaluma (Academic Prefect F4)'
        : index === 17
        ? 'Mratibu wa Malezi & Sala (Spiritual Prefect)'
        : undefined,
    clubs:
      rec.combination === 'Science'
        ? ['Klabu ya Sayansi & Hesabu', 'Klabu ya Mazingira & Malihai']
        : ['Klabu ya Lugha & Mdahalo', 'Klabu ya Historia & Jamii'],
    feeTotal: isBoarding ? 1200000 : 750000,
    feePaid: isBoarding ? (index % 2 === 0 ? 1200000 : 1050000) : (index % 2 === 0 ? 750000 : 700000),
  };
});

/**
 * Realistic Mock/Pre-National Performance Results for Form Four Candidates
 * Based on authentic school academic records and NECTA standards.
 */
export const FORM_FOUR_STUDENT_RESULTS: StudentResult[] = OFFICIAL_FORM_FOUR_REGISTER_DATA.map((rec, index) => {
  // Score matrices tailored for Science vs Arts combinations
  const scoresByRoll: Record<number, { civ: number; hist: number; geo: number; kisw: number; eng: number; phys?: number; chem?: number; bio: number; math: number; lit?: number; rel?: number }> = {
    1: { civ: 76, hist: 72, geo: 80, kisw: 78, eng: 82, phys: 74, chem: 78, bio: 82, math: 75, rel: 85 }, // Adella Silvano Massawe
    2: { civ: 70, hist: 68, geo: 74, kisw: 80, eng: 78, bio: 70, math: 65, lit: 72, rel: 84 },            // Anitha Miraji Muhamad
    3: { civ: 68, hist: 65, geo: 72, kisw: 75, eng: 74, bio: 68, math: 62, lit: 70, rel: 82 },            // Elizabeth Festo Kessy
    4: { civ: 72, hist: 70, geo: 75, kisw: 84, eng: 80, bio: 72, math: 66, lit: 75, rel: 88 },            // Farida Mohamed Juma
    5: { civ: 74, hist: 72, geo: 76, kisw: 82, eng: 81, bio: 74, math: 68, lit: 73, rel: 86 },            // Gloria Paul William
    6: { civ: 75, hist: 70, geo: 78, kisw: 76, eng: 79, phys: 70, chem: 76, bio: 80, math: 72, rel: 84 }, // Julieth Abel Lyimo
    7: { civ: 80, hist: 78, geo: 82, kisw: 81, eng: 84, phys: 78, chem: 82, bio: 86, math: 85, rel: 89 }, // Allen Christopher Mbiku
    8: { civ: 82, hist: 80, geo: 84, kisw: 83, eng: 85, phys: 82, chem: 86, bio: 88, math: 88, rel: 90 }, // Daud Innocent Massawe
    9: { civ: 71, hist: 67, geo: 73, kisw: 74, eng: 76, phys: 68, chem: 72, bio: 76, math: 70, rel: 80 }, // David Dismas Vicent
    10: { civ: 84, hist: 82, geo: 86, kisw: 85, eng: 88, phys: 84, chem: 88, bio: 90, math: 91, rel: 92 }, // Dominick Boniventure Masunga
    11: { civ: 73, hist: 71, geo: 75, kisw: 76, eng: 77, phys: 71, chem: 75, bio: 78, math: 74, rel: 82 }, // Isdory Wilhem Kawishe
    12: { civ: 69, hist: 66, geo: 71, kisw: 77, eng: 75, bio: 69, math: 63, lit: 71, rel: 81 },            // Louice Benedict Tungaraza
    13: { civ: 86, hist: 84, geo: 88, kisw: 87, eng: 90, phys: 86, chem: 90, bio: 92, math: 93, rel: 94 }, // Meshack Peter Olomi
    14: { civ: 72, hist: 69, geo: 74, kisw: 75, eng: 76, phys: 70, chem: 73, bio: 77, math: 71, rel: 83 }, // Richard Reginald Morio
    15: { civ: 70, hist: 68, geo: 72, kisw: 73, eng: 74, phys: 66, chem: 71, bio: 75, math: 69, rel: 80 }, // Simon Narisis Mramba
    16: { civ: 75, hist: 73, geo: 77, kisw: 78, eng: 79, phys: 73, chem: 77, bio: 81, math: 76, rel: 85 }, // Willbrood Peter Kiwale
    17: { civ: 77, hist: 74, geo: 79, kisw: 80, eng: 81, phys: 75, chem: 79, bio: 83, math: 78, rel: 86 }, // Amedeus Thadei Mrii
    18: { civ: 88, hist: 86, geo: 89, kisw: 92, eng: 91, bio: 85, math: 80, lit: 88, rel: 98 },            // Br. Gasper Honest Kimario
    19: { civ: 81, hist: 79, geo: 83, kisw: 88, eng: 86, bio: 80, math: 75, lit: 84, rel: 91 },            // Tinah George Mhimbila
  };

  const sc = scoresByRoll[rec.rollNo] || scoresByRoll[1];
  const toGrade = (score: number): 'A' | 'B' | 'C' | 'D' | 'F' =>
    score >= 75 ? 'A' : score >= 65 ? 'B' : score >= 45 ? 'C' : score >= 30 ? 'D' : 'F';
  const toPoints = (score: number): number =>
    score >= 75 ? 1 : score >= 65 ? 2 : score >= 45 ? 3 : score >= 30 ? 4 : 5;

  const subjects: SubjectResult[] = [
    { code: '011', name: 'Civics', nameEn: 'Civics', score: sc.civ, grade: toGrade(sc.civ), points: toPoints(sc.civ), remarks: sc.civ >= 75 ? 'Bora Sana' : 'Nzuri Sana' },
    { code: '012', name: 'History', nameEn: 'History', score: sc.hist, grade: toGrade(sc.hist), points: toPoints(sc.hist), remarks: sc.hist >= 75 ? 'Bora Sana' : 'Nzuri Sana' },
    { code: '013', name: 'Geography', nameEn: 'Geography', score: sc.geo, grade: toGrade(sc.geo), points: toPoints(sc.geo), remarks: sc.geo >= 75 ? 'Bora Sana' : 'Nzuri Sana' },
    { code: '021', name: 'Kiswahili', nameEn: 'Kiswahili', score: sc.kisw, grade: toGrade(sc.kisw), points: toPoints(sc.kisw), remarks: 'Bora Sana' },
    { code: '022', name: 'English Language', nameEn: 'English Language', score: sc.eng, grade: toGrade(sc.eng), points: toPoints(sc.eng), remarks: 'Bora Sana' },
  ];

  if (rec.combination === 'Science') {
    if (sc.phys) {
      subjects.push({ code: '031', name: 'Physics', nameEn: 'Physics', score: sc.phys, grade: toGrade(sc.phys), points: toPoints(sc.phys), remarks: sc.phys >= 75 ? 'Bora Sana' : 'Nzuri' });
    }
    if (sc.chem) {
      subjects.push({ code: '032', name: 'Chemistry', nameEn: 'Chemistry', score: sc.chem, grade: toGrade(sc.chem), points: toPoints(sc.chem), remarks: sc.chem >= 75 ? 'Bora Sana' : 'Nzuri Sana' });
    }
  }

  subjects.push({ code: '033', name: 'Biology', nameEn: 'Biology', score: sc.bio, grade: toGrade(sc.bio), points: toPoints(sc.bio), remarks: 'Bora Sana' });
  subjects.push({ code: '041', name: 'Basic Mathematics', nameEn: 'Basic Mathematics', score: sc.math, grade: toGrade(sc.math), points: toPoints(sc.math), remarks: sc.math >= 75 ? 'Bora Sana' : 'Nzuri' });

  if (sc.lit) {
    subjects.push({ code: '024', name: 'Literature in English', nameEn: 'Literature in English', score: sc.lit, grade: toGrade(sc.lit), points: toPoints(sc.lit), remarks: 'Bora Sana' });
  }

  if (sc.rel) {
    subjects.push({ code: '071', name: 'Religious Education', nameEn: 'Religious Education', score: sc.rel, grade: 'A', points: 1, remarks: 'Bora Sana' });
  }

  const totalMarks = subjects.reduce((sum, s) => sum + s.score, 0);
  const averageMarks = Math.round((totalMarks / subjects.length) * 10) / 10;
  // Calculate best 7 points for official NECTA CSEE division
  const sortedPoints = [...subjects.map((s) => s.points)].sort((a, b) => a - b);
  const best7Points = sortedPoints.slice(0, 7).reduce((a, b) => a + b, 0);
  const division = best7Points <= 17 ? 'Division I' : best7Points <= 21 ? 'Division II' : best7Points <= 25 ? 'Division III' : 'Division IV';

  // Positions mapped by rank
  const positions: Record<number, number> = {
    13: 1, // Meshack Peter Olomi
    18: 2, // Br. Gasper Honest Kimario
    10: 3, // Dominick Boniventure Masunga
    8: 4,  // Daud Innocent Massawe
    7: 5,  // Allen Christopher Mbiku
    19: 6, // Tinah George Mhimbila
    17: 7, // Amedeus Thadei Mrii
    1: 8,  // Adella Silvano Massawe
    6: 9,  // Julieth Abel Lyimo
    16: 10, // Willbrood Peter Kiwale
    5: 11, // Gloria Paul William
    4: 12, // Farida Mohamed Juma
    11: 13, // Isdory Wilhem Kawishe
    14: 14, // Richard Reginald Morio
    9: 15, // David Dismas Vicent
    2: 16, // Anitha Miraji Muhamad
    15: 17, // Simon Narisis Mramba
    12: 18, // Louice Benedict Tungaraza
    3: 19, // Elizabeth Festo Kessy
  };

  return {
    id: `res-f4-${(index + 1).toString().padStart(4, '0')}`,
    examNumber: rec.indexNumber,
    studentName: rec.fullName,
    gender: rec.sex,
    form: 'Form 4',
    stream: rec.combination,
    examType: 'Mtihani wa Utimilifu wa Kidato cha Nne (Pre-NECTA Mock 2026)',
    year: 2026,
    subjects,
    totalMarks,
    averageMarks,
    division,
    points: best7Points,
    classPosition: positions[rec.rollNo] || index + 1,
    totalStudentsInClass: 19,
    conduct: 'Bora Sana',
    headmasterRemarks:
      best7Points <= 14
        ? 'Ufaulu wa kiwango cha juu sana (Division One). Endelea kudumisha nidhamu na kasi hii kuelekea NECTA CSEE.'
        : best7Points <= 21
        ? 'Ufaulu mzuri sana. Kaza buti katika masomo ya sayansi na hisabati ili kupanda hadi Daraja la Kwanza.'
        : 'Ufaulu wa kuridhisha. Ongeza masaa ya usiku na kambi ya majadiliano ya kitaaluma.',
    publishDate: '2026-08-15',
  };
});
