import { StudentProfile, StudentResult } from '../types';

/**
 * Normalizes name string for comparison: removes punctuation, lowers case, trims extra spaces
 */
export function normalizeName(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/[.,\-_/()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Searches for a student by their full name or three names across student profiles and exam results.
 * Supports exact match, token-based matching, and three-name matching.
 */
export function findStudentByNameOrExam(
  query: string,
  studentsList: StudentProfile[],
  resultsList: StudentResult[]
): StudentProfile | null {
  if (!query || !query.trim()) return null;

  const normalizedQuery = normalizeName(query);
  const queryTokens = normalizedQuery.split(' ').filter(Boolean);

  // 1. Direct Exam Number Match
  const byExam = studentsList.find(
    (s) => s.examNumber && normalizeName(s.examNumber) === normalizedQuery
  );
  if (byExam) return byExam;

  const resByExam = resultsList.find(
    (r) => r.examNumber && normalizeName(r.examNumber) === normalizedQuery
  );
  if (resByExam) {
    const profile = studentsList.find(
      (s) => s.examNumber && normalizeName(s.examNumber) === normalizeName(resByExam.examNumber)
    );
    if (profile) return profile;
    return createProfileFromResult(resByExam);
  }

  // 2. Exact Full Name Match in Student Profiles
  const exactProfile = studentsList.find(
    (s) => normalizeName(s.fullName) === normalizedQuery
  );
  if (exactProfile) return exactProfile;

  // 3. Exact Full Name Match in Exam Results
  const exactResult = resultsList.find(
    (r) => normalizeName(r.studentName) === normalizedQuery
  );
  if (exactResult) {
    const profile = studentsList.find(
      (s) =>
        (s.examNumber && s.examNumber.toLowerCase() === exactResult.examNumber.toLowerCase()) ||
        normalizeName(s.fullName) === normalizeName(exactResult.studentName)
    );
    if (profile) return profile;
    return createProfileFromResult(exactResult);
  }

  // 4. Token-based / Three-name matching
  // Matches when all search tokens are found in the candidate's name or vice-versa
  if (queryTokens.length >= 2) {
    // Search in student profiles
    const matchedProfile = studentsList.find((s) => {
      const studentTokens = normalizeName(s.fullName).split(' ').filter(Boolean);
      // Check if all query tokens exist in student name
      const allQueryInStudent = queryTokens.every((q) =>
        studentTokens.some((st) => st === q || st.startsWith(q) || q.startsWith(st))
      );
      if (allQueryInStudent) return true;

      // Or if student name has at least 2 tokens and all exist in query
      if (studentTokens.length >= 2) {
        const allStudentInQuery = studentTokens.every((st) =>
          queryTokens.some((q) => q === st || q.startsWith(st) || st.startsWith(q))
        );
        if (allStudentInQuery) return true;
      }
      return false;
    });

    if (matchedProfile) return matchedProfile;

    // Search in exam results
    const matchedResult = resultsList.find((r) => {
      const resTokens = normalizeName(r.studentName).split(' ').filter(Boolean);
      const allQueryInResult = queryTokens.every((q) =>
        resTokens.some((rt) => rt === q || rt.startsWith(q) || q.startsWith(rt))
      );
      if (allQueryInResult) return true;

      if (resTokens.length >= 2) {
        const allResultInQuery = resTokens.every((rt) =>
          queryTokens.some((q) => q === rt || q.startsWith(rt) || rt.startsWith(q))
        );
        if (allResultInQuery) return true;
      }
      return false;
    });

    if (matchedResult) {
      const profile = studentsList.find(
        (s) =>
          (s.examNumber && s.examNumber.toLowerCase() === matchedResult.examNumber.toLowerCase()) ||
          normalizeName(s.fullName) === normalizeName(matchedResult.studentName)
      );
      if (profile) return profile;
      return createProfileFromResult(matchedResult);
    }
  }

  return null;
}

function createProfileFromResult(result: StudentResult): StudentProfile {
  return {
    id: result.id,
    studentId: result.studentId || result.examNumber,
    fullName: result.studentName,
    gender: result.gender,
    form: result.form,
    stream: result.stream,
    examNumber: result.examNumber,
    admissionYear: result.year,
    studentType: 'Bweni (Boarding)',
    feeTotal: 1500000,
    feePaid: 1200000,
  };
}
