import * as XLSX from 'xlsx';
import { StudentResult, SubjectResult } from '../types';

// Standard NECTA Subject Code mappings
export const STANDARD_SUBJECTS = [
  { code: '011', key: 'CIV', name: 'Civics', nameEn: 'Civics' },
  { code: '012', key: 'HIST', name: 'History', nameEn: 'History' },
  { code: '013', key: 'GEO', name: 'Geography', nameEn: 'Geography' },
  { code: '021', key: 'KISW', name: 'Kiswahili', nameEn: 'Kiswahili' },
  { code: '022', key: 'ENG', name: 'English Language', nameEn: 'English Language' },
  { code: '031', key: 'PHY', name: 'Physics', nameEn: 'Physics' },
  { code: '032', key: 'CHEM', name: 'Chemistry', nameEn: 'Chemistry' },
  { code: '033', key: 'BIO', name: 'Biology', nameEn: 'Biology' },
  { code: '041', key: 'BAM', name: 'Basic Mathematics', nameEn: 'Basic Mathematics' },
  { code: '071', key: 'RE', name: 'Religious Education', nameEn: 'Religious Education' },
  { code: '061', key: 'COMM', name: 'Commerce', nameEn: 'Commerce' },
  { code: '062', key: 'BKEE', name: 'Book Keeping', nameEn: 'Book Keeping' },
];

/**
 * Converts a numeric score (0-100) into NECTA CSEE Grade, Points, and Remarks
 */
export function calculateGradeAndPoints(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  points: number;
  remarks: string;
} {
  if (score >= 75) {
    return { grade: 'A', points: 1, remarks: 'Bora Sana / Excellent' };
  } else if (score >= 65) {
    return { grade: 'B', points: 2, remarks: 'Nzuri Sana / Very Good' };
  } else if (score >= 45) {
    return { grade: 'C', points: 3, remarks: 'Nzuri / Good' };
  } else if (score >= 30) {
    return { grade: 'D', points: 4, remarks: 'Inaridhisha / Satisfactory' };
  } else {
    return { grade: 'F', points: 5, remarks: 'Hajaridhisha / Fail' };
  }
}

/**
 * Calculates NECTA Division based on points of best 7 subjects
 */
export function calculateDivision(points: number, grades: ('A' | 'B' | 'C' | 'D' | 'F')[]): 'Division I' | 'Division II' | 'Division III' | 'Division IV' | 'Division 0' {
  // Count passes (A, B, C, D)
  const passCount = grades.filter((g) => g !== 'F').length;

  if (passCount < 2) {
    return 'Division 0';
  }

  if (points >= 7 && points <= 17) {
    return 'Division I';
  } else if (points >= 18 && points <= 21) {
    return 'Division II';
  } else if (points >= 22 && points <= 25) {
    return 'Division III';
  } else if (points >= 26 && points <= 33) {
    return 'Division IV';
  } else {
    return 'Division 0';
  }
}

/**
 * Parse an uploaded Excel (.xlsx, .xls, .csv) file and return structured StudentResult[]
 */
export async function parseExcelResultsFile(file: File): Promise<StudentResult[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Parse to JSON array of objects
        const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rawRows || rawRows.length === 0) {
          throw new Error('Faili la Excel halina rekodi zozote (Empty spreadsheet).');
        }

        const parsedResults: StudentResult[] = [];

        rawRows.forEach((row, index) => {
          // Normalize column headers to lowercase trimmed
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            normalized[key.trim().toLowerCase()] = row[key];
          });

          // Look for exam number / index number
          const examNumber =
            normalized['examnumber'] ||
            normalized['exam_no'] ||
            normalized['namba_ya_mtihani'] ||
            normalized['csee_no'] ||
            normalized['index_number'] ||
            normalized['index'] ||
            normalized['prem_no'] ||
            `S.1842/${String(index + 1).padStart(4, '0')}/2025`;

          // Look for student name
          const studentName =
            normalized['studentname'] ||
            normalized['student_name'] ||
            normalized['name'] ||
            normalized['jina'] ||
            normalized['jina_la_mwanafunzi'] ||
            normalized['full_name'] ||
            `Mwanafunzi ${index + 1}`;

          // Gender
          const rawGender = String(normalized['gender'] || normalized['jinsia'] || normalized['sex'] || 'M').toUpperCase();
          const gender: 'M' | 'F' = rawGender.startsWith('F') || rawGender === 'KE' ? 'F' : 'M';

          // Form
          let form: 'Form 1' | 'Form 2' | 'Form 3' | 'Form 4' = 'Form 4';
          const rawForm = String(normalized['form'] || normalized['kidato'] || normalized['class'] || '4');
          if (rawForm.includes('1') || rawForm.toLowerCase().includes('kwanza') || rawForm.toLowerCase().includes('one')) {
            form = 'Form 1';
          } else if (rawForm.includes('2') || rawForm.toLowerCase().includes('pili') || rawForm.toLowerCase().includes('two')) {
            form = 'Form 2';
          } else if (rawForm.includes('3') || rawForm.toLowerCase().includes('tatu') || rawForm.toLowerCase().includes('three')) {
            form = 'Form 3';
          } else {
            form = 'Form 4';
          }

          // Stream
          let stream: 'A' | 'B' | 'Science' | 'Arts' | 'Commercial' = 'Science';
          const rawStream = String(normalized['stream'] || normalized['mkondo'] || normalized['combination'] || 'Science');
          if (rawStream.toLowerCase().includes('art') || rawStream.toLowerCase().includes('sanaa')) {
            stream = 'Arts';
          } else if (rawStream.toLowerCase().includes('comm') || rawStream.toLowerCase().includes('biashara')) {
            stream = 'Commercial';
          } else if (rawStream.toUpperCase() === 'B' || rawStream.includes('2')) {
            stream = 'B';
          } else if (rawStream.toUpperCase() === 'A' || rawStream.includes('1')) {
            stream = 'A';
          } else {
            stream = 'Science';
          }

          // Exam Type
          const rawExamType = String(normalized['examtype'] || normalized['exam_type'] || normalized['aina_ya_mtihani'] || 'NECTA Mock 2025');
          const examType: any = rawExamType.includes('Annual')
            ? 'Annual Examination 2025'
            : rawExamType.includes('Mid')
            ? 'Mid-Term Exam 2025'
            : rawExamType.includes('Pre')
            ? 'Pre-NECTA 2025'
            : 'NECTA Mock 2025';

          // Year
          const year = Number(normalized['year'] || normalized['mwaka'] || 2025);

          // Extract Subjects
          const subjects: SubjectResult[] = [];

          // Helper to check subject columns in various formats
          const subjectAliases: Record<string, string[]> = {
            '011': ['civ', 'civics', 'uraia', '011'],
            '012': ['hist', 'history', 'historia', '012'],
            '013': ['geo', 'geography', 'jiografia', '013'],
            '021': ['kisw', 'kiswahili', 'swahili', '021'],
            '022': ['eng', 'english', 'kiingereza', '022'],
            '031': ['phy', 'physics', 'fizikia', '031'],
            '032': ['chem', 'chemistry', 'kemia', '032'],
            '033': ['bio', 'biology', 'biolojia', '033'],
            '041': ['bam', 'math', 'mathematics', 'hisabati', 'basic_math', '041'],
            '071': ['re', 'dini', 'religious', 'religion', 'elimu_ya_dini', '071'],
            '061': ['comm', 'commerce', 'biashara', '061'],
            '062': ['bkee', 'bookkeeping', 'book_keeping', '062'],
          };

          STANDARD_SUBJECTS.forEach((subDef) => {
            const aliases = subjectAliases[subDef.code] || [subDef.key.toLowerCase()];
            let scoreVal: number | null = null;

            for (const alias of aliases) {
              if (normalized[alias] !== undefined && normalized[alias] !== '') {
                const num = Number(normalized[alias]);
                if (!isNaN(num)) {
                  scoreVal = Math.min(100, Math.max(0, num));
                  break;
                }
              }
            }

            if (scoreVal !== null) {
              const { grade, points, remarks } = calculateGradeAndPoints(scoreVal);
              subjects.push({
                code: subDef.code,
                name: subDef.name,
                nameEn: subDef.nameEn,
                score: scoreVal,
                grade,
                points,
                remarks,
              });
            }
          });

          // If no specific subject columns were detected, create standard subjects from average or default marks
          if (subjects.length === 0) {
            const baseScore = Number(normalized['average'] || normalized['score'] || normalized['alama'] || 75);
            STANDARD_SUBJECTS.slice(0, 8).forEach((subDef) => {
              const variance = Math.floor(Math.random() * 10) - 5;
              const s = Math.min(100, Math.max(30, baseScore + variance));
              const { grade, points, remarks } = calculateGradeAndPoints(s);
              subjects.push({
                code: subDef.code,
                name: subDef.name,
                nameEn: subDef.nameEn,
                score: s,
                grade,
                points,
                remarks,
              });
            });
          }

          // Calculate totals
          const totalMarks = subjects.reduce((sum, s) => sum + s.score, 0);
          const averageMarks = Number((totalMarks / (subjects.length || 1)).toFixed(1));

          // NECTA Points: sum of points of best 7 subjects
          const sortedPoints = [...subjects.map((s) => s.points)].sort((a, b) => a - b);
          const best7Points = sortedPoints.slice(0, 7).reduce((a, b) => a + b, 0);
          const points = normalized['points'] ? Number(normalized['points']) : best7Points;

          const allGrades = subjects.map((s) => s.grade);
          const division = normalized['division']
            ? (normalized['division'] as any)
            : calculateDivision(points, allGrades);

          const conduct = (normalized['conduct'] ||
            normalized['tabia'] ||
            (averageMarks >= 70 ? 'Bora Sana (Excellent)' : 'Nzuri Sana (Very Good)')) as any;

          const headmasterRemarks =
            normalized['headmasterremarks'] ||
            normalized['remarks'] ||
            normalized['maoni'] ||
            (division === 'Division I'
              ? 'Matokeo mazuri sana! Nidhamu bora na juhudi thabiti ya kitaaluma.'
              : division === 'Division II'
              ? 'Ufaulu mzuri, anao uwezo wa kufanya vizuri zaidi akiongeza juhudi.'
              : 'Aongeze bidii katika masomo ya sayansi na hisabati.');

          parsedResults.push({
            id: `excel-res-${Date.now()}-${index}`,
            examNumber: String(examNumber).toUpperCase().trim(),
            studentName: String(studentName).toUpperCase().trim(),
            gender,
            form,
            stream,
            examType,
            year,
            subjects,
            totalMarks,
            averageMarks,
            division,
            points,
            classPosition: index + 1,
            totalStudentsInClass: rawRows.length,
            conduct,
            headmasterRemarks,
            publishDate: new Date().toISOString().split('T')[0],
          });
        });

        // Recalculate rank / class positions sorted by Average Marks descending
        parsedResults.sort((a, b) => b.averageMarks - a.averageMarks);
        parsedResults.forEach((st, idx) => {
          st.classPosition = idx + 1;
          st.totalStudentsInClass = parsedResults.length;
        });

        resolve(parsedResults);
      } catch (err: any) {
        reject(new Error(err?.message || 'Hitilafu ya kusoma faili la Excel.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Kushindwa kusoma faili la Excel.'));
    };

    reader.readAsArrayBuffer(file);
  });
}

/**
 * Generate and download an official formatted Excel Template for Uomboni Secondary School
 */
export function downloadExcelTemplate() {
  const templateRows = [
    {
      EXAM_NO: 'S.1842/0001/2025',
      STUDENT_NAME: 'JOHN PETER MLAY',
      GENDER: 'M',
      FORM: 'Form 4',
      STREAM: 'Science',
      EXAM_TYPE: 'NECTA Mock 2025',
      YEAR: 2025,
      CIV: 88,
      HIST: 85,
      GEO: 90,
      KISW: 92,
      ENG: 86,
      PHY: 82,
      CHEM: 89,
      BIO: 94,
      BAM: 80,
      RE: 95,
      COMM: '',
      BKEE: '',
      CONDUCT: 'Bora Sana (Excellent)',
      REMARKS: 'Mwanafunzi hodari na mwenye nidhamu ya kikanisa.',
    },
    {
      EXAM_NO: 'S.1842/0002/2025',
      STUDENT_NAME: 'GRACE ALOIS KIMARO',
      GENDER: 'F',
      FORM: 'Form 4',
      STREAM: 'Science',
      EXAM_TYPE: 'NECTA Mock 2025',
      YEAR: 2025,
      CIV: 82,
      HIST: 78,
      GEO: 85,
      KISW: 89,
      ENG: 91,
      PHY: 75,
      CHEM: 83,
      BIO: 88,
      BAM: 76,
      RE: 92,
      COMM: '',
      BKEE: '',
      CONDUCT: 'Bora Sana (Excellent)',
      REMARKS: 'Ufaulu wa hali ya juu na bidii nzuri.',
    },
    {
      EXAM_NO: 'S.1842/0003/2025',
      STUDENT_NAME: 'EMMANUEL JOSEPH SHAYO',
      GENDER: 'M',
      FORM: 'Form 4',
      STREAM: 'Arts',
      EXAM_TYPE: 'NECTA Mock 2025',
      YEAR: 2025,
      CIV: 75,
      HIST: 82,
      GEO: 79,
      KISW: 84,
      ENG: 80,
      PHY: '',
      CHEM: '',
      BIO: 70,
      BAM: 65,
      RE: 88,
      COMM: 78,
      BKEE: 82,
      CONDUCT: 'Nzuri Sana (Very Good)',
      REMARKS: 'Bidii na maarifa mazuri katika masomo ya sanaa.',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);

  // Set column widths
  const colWidths = [
    { wch: 18 }, // EXAM_NO
    { wch: 28 }, // STUDENT_NAME
    { wch: 8 },  // GENDER
    { wch: 10 }, // FORM
    { wch: 12 }, // STREAM
    { wch: 18 }, // EXAM_TYPE
    { wch: 6 },  // YEAR
    { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 },
    { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 }, { wch: 6 },
    { wch: 6 }, { wch: 6 },
    { wch: 22 }, // CONDUCT
    { wch: 45 }, // REMARKS
  ];
  worksheet['!cols'] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MATOKEO_UOMBONI');

  XLSX.writeFile(workbook, 'UOMBONI_MATOKEO_EXCEL_TEMPLATE.xlsx');
}

/**
 * Export current list of student results to an Excel spreadsheet
 */
export function exportResultsToExcel(results: StudentResult[], filename = 'UOMBONI_SEC_MATOKEO_EXPORT.xlsx') {
  const exportRows = results.map((st) => {
    const row: Record<string, any> = {
      'NAMBA YA MTIHANI': st.examNumber,
      'JINA LA MWANAFUNZI': st.studentName,
      'JINSIA': st.gender,
      'KIDATO': st.form,
      'MKONDO': st.stream,
      'AINA YA MTIHANI': st.examType,
      'MWAKA': st.year,
      'DARAJA (DIV)': st.division,
      'POINTI': st.points,
      'WASTANI (%)': st.averageMarks,
      'JUMLA YA ALAMA': st.totalMarks,
      'NAFASI DARASANI': `${st.classPosition} / ${st.totalStudentsInClass}`,
      'TABIA / NIDHAMU': st.conduct,
      'MAONI YA MKUU WA SHULE': st.headmasterRemarks,
    };

    // Append individual subjects
    st.subjects.forEach((sub) => {
      row[`${sub.code} - ${sub.name}`] = `${sub.score} (${sub.grade})`;
    });

    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Matokeo Rasmi');

  XLSX.writeFile(workbook, filename);
}
