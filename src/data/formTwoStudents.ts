import { StudentProfile } from '../types';

export interface FormTwoCandidateRecord {
  indexNumber: string; // e.g. S0486-0001
  sex: 'F' | 'M';
  firstName: string;
  middleName: string;
  lastName: string;
  fullName: string;
  centreNumber: string; // S.0486
}

export const OFFICIAL_FORM_TWO_REGISTER_DATA: FormTwoCandidateRecord[] = [
  { indexNumber: 'S0486-0001', sex: 'F', firstName: 'Beatrice', middleName: 'Ally', lastName: 'Issa', fullName: 'Beatrice Ally Issa', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0002', sex: 'F', firstName: 'Cesilia', middleName: 'Samson', lastName: 'Ambros', fullName: 'Cesilia Samson Ambros', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0003', sex: 'F', firstName: 'Devota', middleName: 'Marco', lastName: 'Ritte', fullName: 'Devota Marco Ritte', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0004', sex: 'F', firstName: 'Diana', middleName: 'Izahaki', lastName: 'Lyamuya', fullName: 'Diana Izahaki Lyamuya', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0005', sex: 'F', firstName: 'Flora', middleName: 'John', lastName: 'Egidi', fullName: 'Flora John Egidi', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0006', sex: 'F', firstName: 'Jenipher', middleName: 'Sebastian', lastName: 'Kimario', fullName: 'Jenipher Sebastian Kimario', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0007', sex: 'F', firstName: 'Laurensia', middleName: 'Ernest', lastName: 'Shine', fullName: 'Laurensia Ernest Shine', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0008', sex: 'F', firstName: 'Princess', middleName: 'Salvatory', lastName: 'Mtui', fullName: 'Princess Salvatory Mtui', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0009', sex: 'F', firstName: 'Sekunda', middleName: 'Peter', lastName: 'Mtui', fullName: 'Sekunda Peter Mtui', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0010', sex: 'F', firstName: 'Veronika', middleName: 'Samweli', lastName: 'Aminieli', fullName: 'Veronika Samweli Aminieli', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0011', sex: 'M', firstName: 'Abdallha', middleName: 'Omary', lastName: 'Shetui', fullName: 'Abdallha Omary Shetui', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0012', sex: 'M', firstName: 'Andrea', middleName: 'John', lastName: 'Mtui', fullName: 'Andrea John Mtui', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0013', sex: 'M', firstName: 'Braiton', middleName: 'Avelin', lastName: 'Massawe', fullName: 'Braiton Avelin Massawe', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0014', sex: 'M', firstName: 'Christian', middleName: 'Antony', lastName: 'Shao', fullName: 'Christian Antony Shao', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0015', sex: 'M', firstName: 'Emmanuel', middleName: 'Thadei', lastName: 'Ngowi', fullName: 'Emmanuel Thadei Ngowi', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0016', sex: 'M', firstName: 'Evance', middleName: 'Wilhard', lastName: 'Alfred', fullName: 'Evance Wilhard Alfred', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0017', sex: 'M', firstName: 'Godfrey', middleName: 'James', lastName: 'Lyamuya', fullName: 'Godfrey James Lyamuya', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0018', sex: 'M', firstName: 'Joseph', middleName: 'Wolta', lastName: 'Novati', fullName: 'Joseph Wolta Novati', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0019', sex: 'M', firstName: 'Jovin', middleName: 'Livin', lastName: 'Priva', fullName: 'Jovin Livin Priva', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0020', sex: 'M', firstName: 'Nelson', middleName: 'Martini', lastName: 'Anzelimu', fullName: 'Nelson Martini Anzelimu', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0021', sex: 'M', firstName: 'Patric', middleName: 'Asanterabi', lastName: 'Ulomi', fullName: 'Patric Asanterabi Ulomi', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0022', sex: 'M', firstName: 'Paulo', middleName: 'Benedict', lastName: 'Jamara', fullName: 'Paulo Benedict Jamara', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0023', sex: 'M', firstName: 'Vicent', middleName: 'Deogratias', lastName: 'Kimbi', fullName: 'Vicent Deogratias Kimbi', centreNumber: 'S.0486' },
  { indexNumber: 'S0486-0024', sex: 'M', firstName: 'Yusufu', middleName: 'Akwino', lastName: 'Massawe', fullName: 'Yusufu Akwino Massawe', centreNumber: 'S.0486' },
];

export { CSSC_FORM_TWO_JOINT_RESULTS_2026 as FORM_TWO_STUDENT_RESULTS } from './csscJointExamResults2026';

export const FORM_TWO_STUDENT_PROFILES: StudentProfile[] = OFFICIAL_FORM_TWO_REGISTER_DATA.map((rec, index) => {
  const numStr = (index + 1).toString().padStart(4, '0');
  const isFemale = rec.sex === 'F';
  const isBoarding = index % 3 !== 2; // 16 boarding, 8 day scholars
  const dorm = isFemale
    ? (index % 2 === 0 ? 'St. Theresa Hall (Room 1)' : 'St. Maria Goretti (Room 2)')
    : (index % 2 === 0 ? 'Kibo Hostel (Room A)' : 'Mawenzi Block (Room B)');

  const phonePrefixes = ['0754', '0752', '0784', '0768', '0745', '0713', '0782'];
  const pPrefix = phonePrefixes[index % phonePrefixes.length];
  const pSuffix = (100000 + (index * 3791) % 900000).toString();
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
  ];
  const residence = villages[index % villages.length];

  return {
    id: `std-f2-${numStr}`,
    studentId: `USS-2024-${numStr}`,
    examNumber: rec.indexNumber,
    premNumber: `PREM-2023-${(88200 + index).toString()}`,
    fullName: rec.fullName,
    gender: rec.sex,
    dob: isFemale ? `2009-0${((index % 9) + 1)}-14` : `2009-0${((index % 9) + 1)}-22`,
    dateOfBirth: isFemale ? `14/0${((index % 9) + 1)}/2009` : `22/0${((index % 9) + 1)}/2009`,
    form: 'Form 2',
    stream: 'A',
    admissionYear: 2024,
    enrollmentDate: '2024-01-15',
    studentType: isBoarding ? 'Bweni (Boarding)' : 'Kutwa (Day Scholar)',
    boardingStatus: isBoarding ? 'Bweni' : 'Kutwa',
    dormitoryRoom: isBoarding ? dorm : undefined,
    hostelName: isBoarding ? (isFemale ? 'Hosteli ya Wasichana' : 'Hosteli ya Wavulana') : undefined,
    bedNumber: isBoarding ? `Kitanda #${index + 1}` : undefined,
    lockerNumber: `Kabati-F2-${(index + 1).toString().padStart(2, '0')}`,
    previousSchool: index % 2 === 0 ? 'Shule ya Msingi Marangu' : 'Shule ya Msingi Uomboni',
    parentName: `${rec.middleName} ${rec.lastName}`,
    parentGuardianName: `${rec.middleName} ${rec.lastName}`,
    parentPhone: parentPhone,
    parentEmail: `${rec.lastName.toLowerCase()}.${rec.firstName.toLowerCase()}@gmail.com`,
    residence: residence,
    address: `${residence}, Kilimanjaro`,
    religion: index % 4 === 0 ? 'Katoliki (RC)' : index % 4 === 1 ? 'KKKT (Lutheran)' : index % 4 === 2 ? 'Katoliki (RC)' : 'Islam',
    attendanceRate: 95 + (index % 5),
    conductRating: index % 5 === 0 ? 'Bora Sana' : 'Nzuri Sana',
    leadershipRole: index === 0 ? 'Kiranja wa Wasichana (Monitress)' : index === 10 ? 'Kiranja wa Wavulana (Monitor)' : undefined,
    clubs: index % 2 === 0 ? ['Klabu ya Mazingira & Malihai', 'Klabu ya TEHAMA'] : ['Klabu ya Sayansi & Hesabu', 'Kwaya ya Shule'],
    feeTotal: isBoarding ? 1200000 : 750000,
    feePaid: isBoarding ? (index % 3 === 0 ? 1200000 : 900000) : (index % 2 === 0 ? 750000 : 600000),
  };
});
