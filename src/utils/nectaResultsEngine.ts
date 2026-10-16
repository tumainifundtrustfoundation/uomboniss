import { StudentResult, SubjectResult } from '../types';

export interface NectaSubjectInfo {
  code: string;
  key: string;
  name: string;
  nameEn: string;
}

export const OFFICIAL_NECTA_SUBJECTS: NectaSubjectInfo[] = [
  { code: '011', key: 'CIV', name: 'Civics', nameEn: 'Civics' },
  { code: '012', key: 'HIST', name: 'History', nameEn: 'History' },
  { code: '013', key: 'GEO', name: 'Geography', nameEn: 'Geography' },
  { code: '021', key: 'KISW', name: 'Kiswahili', nameEn: 'Kiswahili' },
  { code: '022', key: 'ENGL', name: 'English Language', nameEn: 'English Language' },
  { code: '024', key: 'LIT ENG', name: 'Literature in English', nameEn: 'Literature in English' },
  { code: '031', key: 'PHY', name: 'Physics', nameEn: 'Physics' },
  { code: '032', key: 'CHEM', name: 'Chemistry', nameEn: 'Chemistry' },
  { code: '033', key: 'BIO', name: 'Biology', nameEn: 'Biology' },
  { code: '041', key: 'B/MATH', name: 'Basic Mathematics', nameEn: 'Basic Mathematics' },
  { code: '061', key: 'COMM', name: 'Commerce', nameEn: 'Commerce' },
  { code: '062', key: 'B/KEEPING', name: 'Book Keeping', nameEn: 'Book Keeping' },
  { code: '071', key: 'BIBLE KNOWLEDGE', name: 'Religious Education', nameEn: 'Bible Knowledge' },
];

/**
 * Standard NECTA / CSSC Grade conversion
 */
export function scoreToNectaGrade(score: number): {
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  points: number;
  remarks: string;
} {
  if (score >= 75) return { grade: 'A', points: 1, remarks: 'Bora Sana' };
  if (score >= 65) return { grade: 'B', points: 2, remarks: 'Nzuri Sana' };
  if (score >= 45) return { grade: 'C', points: 3, remarks: 'Nzuri' };
  if (score >= 30) return { grade: 'D', points: 4, remarks: 'Inaridhisha' };
  return { grade: 'F', points: 5, remarks: 'Hajaridhisha' };
}

/**
 * Map subject code or name to standard NECTA abbreviation (CIV, HIST, GEO, etc.)
 */
export function getNectaSubjectAbbr(subject: { code?: string; name: string; nameEn?: string }): string {
  const norm = (subject.name || subject.nameEn || '').toLowerCase();
  const code = (subject.code || '').trim();

  if (code === '011' || norm.includes('civic')) return 'CIV';
  if (code === '012' || norm.includes('histor')) return 'HIST';
  if (code === '013' || norm.includes('geograph')) return 'GEO';
  if (code === '021' || norm.includes('kiswahil')) return 'KISW';
  if (code === '024' || norm.includes('literat')) return 'LIT ENG';
  if (code === '022' || norm.includes('english')) return 'ENGL';
  if (code === '031' || norm.includes('physic')) return 'PHY';
  if (code === '032' || norm.includes('chemist')) return 'CHEM';
  if (code === '033' || norm.includes('biolog')) return 'BIO';
  if (code === '041' || norm.includes('math') || norm.includes('hisabati')) return 'B/MATH';
  if (code === '061' || norm.includes('commerc') || norm.includes('biashara')) return 'COMM';
  if (code === '062' || norm.includes('book') || norm.includes('kutunza vitabu')) return 'B/KEEPING';
  if (code === '071' || norm.includes('religion') || norm.includes('dini') || norm.includes('bible')) return 'BIBLE KNOWLEDGE';
  if (norm.includes('islam')) return 'E/D/KIISLAMU';

  // Fallback uppercase first word
  return (subject.name || 'SUBJ').split(' ')[0].toUpperCase();
}

/**
 * Produces the official detailed subjects string:
 * e.g. "CIV - 'C' HIST - 'D' GEO - 'C' KISW - 'C' ENGL - 'D' LIT ENG - 'D' BIO - 'F' B/MATH - 'F'"
 */
export function formatNectaDetailedSubjects(subjects: SubjectResult[]): string {
  if (!subjects || subjects.length === 0) return '—';

  // Sort according to standard order
  const order = ['CIV', 'HIST', 'GEO', 'BIBLE KNOWLEDGE', 'E/D/KIISLAMU', 'KISW', 'ENGL', 'LIT ENG', 'PHY', 'CHEM', 'BIO', 'B/MATH', 'COMM', 'B/KEEPING'];
  
  const mapped = subjects.map((s) => ({
    abbr: getNectaSubjectAbbr(s),
    grade: s.grade || 'F',
  }));

  mapped.sort((a, b) => {
    const idxA = order.indexOf(a.abbr);
    const idxB = order.indexOf(b.abbr);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.abbr.localeCompare(b.abbr);
  });

  return mapped.map((m) => `${m.abbr} - '${m.grade}'`).join(' ');
}

/**
 * Formats exam number into official CNO format (e.g. S0486/0001)
 */
export function formatCno(examNumber: string): string {
  if (!examNumber) return 'S0486/0000';
  const clean = examNumber.trim();
  const parts = clean.split('/');
  if (parts.length >= 2) {
    return `${parts[0]}/${parts[1]}`;
  }
  return clean;
}

export interface NectaCalculationResult {
  divisionRoman: 'I' | 'II' | 'III' | 'IV' | '0' | 'ABS';
  divisionFull: string;
  points: number;
  aggregateDisplay: string | number;
  passCount: number;
  averageMarks: number;
}

/**
 * Calculates official NECTA Division & Aggregate points based on best 7 subjects
 */
export function calculateNectaDivision(subjects: SubjectResult[]): NectaCalculationResult {
  if (!subjects || subjects.length === 0) {
    return {
      divisionRoman: 'ABS',
      divisionFull: 'ABS',
      points: 0,
      aggregateDisplay: '-',
      passCount: 0,
      averageMarks: 0,
    };
  }

  // Calculate points for each subject: A=1, B=2, C=3, D=4, F=5
  const validSubjects = subjects.filter((s) => typeof s.score === 'number' && !isNaN(s.score));
  
  if (validSubjects.length === 0) {
    return {
      divisionRoman: 'ABS',
      divisionFull: 'ABS',
      points: 0,
      aggregateDisplay: '-',
      passCount: 0,
      averageMarks: 0,
    };
  }

  const scored = validSubjects.map((s) => {
    const pts = s.points && s.points >= 1 && s.points <= 5 ? s.points : scoreToNectaGrade(s.score).points;
    const grade = s.grade || scoreToNectaGrade(s.score).grade;
    return {
      score: s.score,
      points: pts,
      grade,
      isPass: grade !== 'F',
    };
  });

  // Sort by points ascending (1 is best, 5 is fail)
  scored.sort((a, b) => a.points - b.points);

  // Take best 7 subjects
  const best7 = scored.slice(0, 7);
  const totalPoints = best7.reduce((acc, cur) => acc + cur.points, 0);
  const passCount = scored.filter((s) => s.isPass).length;

  const totalScore = validSubjects.reduce((acc, cur) => acc + cur.score, 0);
  const averageMarks = parseFloat((totalScore / validSubjects.length).toFixed(1));

  let divisionRoman: 'I' | 'II' | 'III' | 'IV' | '0' | 'ABS' = '0';
  let divisionFull = 'Division 0';

  if (best7.length < 7 && passCount < 2) {
    divisionRoman = '0';
    divisionFull = 'Division 0';
  } else if (passCount < 2) {
    divisionRoman = '0';
    divisionFull = 'Division 0';
  } else if (totalPoints >= 7 && totalPoints <= 17) {
    divisionRoman = 'I';
    divisionFull = 'Division I';
  } else if (totalPoints >= 18 && totalPoints <= 21) {
    divisionRoman = 'II';
    divisionFull = 'Division II';
  } else if (totalPoints >= 22 && totalPoints <= 25) {
    divisionRoman = 'III';
    divisionFull = 'Division III';
  } else if (totalPoints >= 26 && totalPoints <= 33) {
    divisionRoman = 'IV';
    divisionFull = 'Division IV';
  } else {
    divisionRoman = '0';
    divisionFull = 'Division 0';
  }

  return {
    divisionRoman,
    divisionFull,
    points: totalPoints,
    aggregateDisplay: divisionRoman === '0' ? (totalPoints >= 34 ? totalPoints : '-') : totalPoints,
    passCount,
    averageMarks,
  };
}

export interface DivisionSummaryCounts {
  div1: number;
  div2: number;
  div3: number;
  div4: number;
  div0: number;
  abs: number;
  total: number;
}

export interface DivisionPerformanceSummary {
  F: DivisionSummaryCounts;
  M: DivisionSummaryCounts;
  T: DivisionSummaryCounts;
}

/**
 * Computes the exact DIVISION PERFORMANCE SUMMARY table seen in NECTA and CSSC portals
 */
export function computeDivisionPerformanceSummary(results: StudentResult[]): DivisionPerformanceSummary {
  const summary: DivisionPerformanceSummary = {
    F: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
    M: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
    T: { div1: 0, div2: 0, div3: 0, div4: 0, div0: 0, abs: 0, total: 0 },
  };

  results.forEach((st) => {
    const gender = st.gender === 'F' ? 'F' : 'M';
    const div = (st.division || '').toUpperCase();

    let target: 'div1' | 'div2' | 'div3' | 'div4' | 'div0' | 'abs' = 'div0';

    if (div.includes('I') && !div.includes('II') && !div.includes('III') && !div.includes('IV')) {
      target = 'div1';
    } else if (div.includes('II') && !div.includes('III')) {
      target = 'div2';
    } else if (div.includes('III')) {
      target = 'div3';
    } else if (div.includes('IV')) {
      target = 'div4';
    } else if (div.includes('ABS')) {
      target = 'abs';
    } else {
      target = 'div0';
    }

    summary[gender][target]++;
    summary[gender].total++;

    summary.T[target]++;
    summary.T.total++;
  });

  return summary;
}
