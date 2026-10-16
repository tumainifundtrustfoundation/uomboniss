import { StudentResult } from "../types";

export interface NoticeboardSummaryData {
  classGpa: number;
  classGpaGrade: string;
  classAverage: number;
  classAverageGrade: string;
  totalStudents: number;
  boysCount: number;
  girlsCount: number;
  gradeSummary: {
    grade: "A" | "B" | "C" | "D" | "F";
    f: number;
    m: number;
    total: number;
  }[];
  best5: {
    position: number;
    name: string;
    sex: "M" | "F";
    points: number;
    division: string;
    average: number;
  }[];
  last5: {
    position: number;
    name: string;
    sex: "M" | "F";
    points: number;
    division: string;
    average: number;
  }[];
}

export const UOMBONI_NOTICEBOARD_SUMMARY: NoticeboardSummaryData = {
  classGpa: 3.58,
  classGpaGrade: "D",
  classAverage: 38.5,
  classAverageGrade: "D",
  totalStudents: 19,
  boysCount: 12,
  girlsCount: 7,
  gradeSummary: [
    { grade: "A", f: 0, m: 0, total: 0 },
    { grade: "B", f: 0, m: 0, total: 0 },
    { grade: "C", f: 1, m: 4, total: 5 },
    { grade: "D", f: 6, m: 8, total: 14 },
    { grade: "F", f: 0, m: 0, total: 0 },
  ],
  best5: [
    { position: 1, name: "Br. Gasper Honest Kimario", sex: "M", points: 18, division: "II", average: 51 },
    { position: 2, name: "Meshack Peter Olomi", sex: "M", points: 18, division: "II", average: 49 },
    { position: 3, name: "Allen Christopher Mbiku", sex: "M", points: 19, division: "II", average: 47 },
    { position: 4, name: "Daud Innocent Massawe", sex: "M", points: 20, division: "II", average: 48 },
    { position: 5, name: "Dominick Boniventure Masunga", sex: "M", points: 20, division: "II", average: 48 },
  ],
  last5: [
    { position: 15, name: "Isdory Wilhem Kawishe", sex: "M", points: 29, division: "IV", average: 32 },
    { position: 16, name: "Willbrood Peter Kiwale", sex: "M", points: 30, division: "IV", average: 29 },
    { position: 17, name: "Louice Benedict Tungaraza", sex: "M", points: 31, division: "IV", average: 30 },
    { position: 18, name: "Simon Narisis Mramba", sex: "M", points: 31, division: "IV", average: 30 },
    { position: 19, name: "David Dismas Vicent", sex: "M", points: 31, division: "IV", average: 28 },
  ],
};

export const AUTHENTIC_UOMBONI_NOTICEBOARD_STUDENTS: StudentResult[] = [
  {
    "id": "uomb-nb-018",
    "examNumber": "S.0486.0018",
    "studentName": "Br. Gasper Honest Kimario",
    "gender": "M",
    "form": "Form 4",
    "stream": "Arts & Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 61,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 79,
        "grade": "A",
        "points": 1,
        "remarks": "Bora Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 27,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 48,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 31,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 70,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 57,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 508,
    "averageMarks": 50.8,
    "division": "Division II",
    "points": 18,
    "classPosition": 1,
    "totalStudentsInClass": 19,
    "conduct": "Bora Sana (Excellent)",
    "headmasterRemarks": "Mwanafunzi bora wa kwanza darasani. Matokeo ya kupongezwa sana, ongeza bidii somo la Kiswahili.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-013",
    "examNumber": "S.0486.0013",
    "studentName": "Meshack Peter Olomi",
    "gender": "M",
    "form": "Form 4",
    "stream": "Arts & Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 37,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 67,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 81,
        "grade": "A",
        "points": 1,
        "remarks": "Bora Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 23,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 47,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 30,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 65,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 39,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 55,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 489,
    "averageMarks": 48.9,
    "division": "Division II",
    "points": 18,
    "classPosition": 2,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri Sana (Very Good)",
    "headmasterRemarks": "Ufaulu mzuri sana. Hongera kwa nafasi ya pili, fanyia kazi hisabati na Kiswahili.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-007",
    "examNumber": "S.0486.0007",
    "studentName": "Allen Christopher Mbiku",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 65,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 84,
        "grade": "A",
        "points": 1,
        "remarks": "Bora Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 15,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 53,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 53,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 56,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 473,
    "averageMarks": 47.3,
    "division": "Division II",
    "points": 19,
    "classPosition": 3,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri Sana (Very Good)",
    "headmasterRemarks": "Ufaulu wa Division II. Jiografia na Historia ziko juu sana.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-008",
    "examNumber": "S.0486.0008",
    "studentName": "Daud Innocent Massawe",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 50,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 57,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 68,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 22,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 27,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 34,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 54,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 63,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 50,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 470,
    "averageMarks": 47.8,
    "division": "Division II",
    "points": 20,
    "classPosition": 4,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Jitahidi kurekebisha masomo ya lugha (Kiswahili & Kiingereza) ili kuboresha alama za jumla.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-010",
    "examNumber": "S.0486.0010",
    "studentName": "Dominick Boniventure Masunga",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 57,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 57,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 68,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 22,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 27,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 34,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 54,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 63,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 50,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 477,
    "averageMarks": 47.7,
    "division": "Division II",
    "points": 20,
    "classPosition": 5,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri Sana (Very Good)",
    "headmasterRemarks": "Uwezo mkubwa katika masomo ya sayansi na jamii. Fanya mazoezi ya lugha.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-019",
    "examNumber": "S.0486.0019",
    "studentName": "Tinah George Mhimbila",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 39,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 57,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 20,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 37,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 46,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 52,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 52,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 393,
    "averageMarks": 43,
    "division": "Division III",
    "points": 23,
    "classPosition": 6,
    "totalStudentsInClass": 19,
    "conduct": "Bora Sana (Excellent)",
    "headmasterRemarks": "Mwanafunzi wa kike aliyeongoza darasani. Nidhamu ya kipekee na bidii ya kupongezwa.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-003",
    "examNumber": "S.0486.0003",
    "studentName": "Elizabeth Festo Kessy",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts & Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 19,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 15,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 65,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 18,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 43,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 33,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 55,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 46,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 42,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 381,
    "averageMarks": 38.1,
    "division": "Division III",
    "points": 23,
    "classPosition": 7,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Juhudi zinaonekana kwenye Jiografia na Baiolojia. Ongeza nguvu masomo ya jamii.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-001",
    "examNumber": "S.0486.0001",
    "studentName": "Adella Silvano Massawe",
    "gender": "F",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 56,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 46,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 44,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 31,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 52,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 48,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 25,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 40,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 422,
    "averageMarks": 42.2,
    "division": "Division III",
    "points": 25,
    "classPosition": 8,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri Sana (Very Good)",
    "headmasterRemarks": "Ufaulu mzuri wa wastani. Weka mkazo kwenye hisabati na lugha.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-006",
    "examNumber": "S.0486.0006",
    "studentName": "Julieth Abel Lyimo",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts & Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 34,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 46,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 17,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 41,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 26,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 42,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 52,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 42,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 380,
    "averageMarks": 38,
    "division": "Division III",
    "points": 25,
    "classPosition": 9,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Una uwezo wa kufanya vizuri zaidi. Zingatia maelekezo ya walimu.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-014",
    "examNumber": "S.0486.0014",
    "studentName": "Richard Reginald Morio",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 26,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 25,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 31,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 15,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 46,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 33,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 298,
    "averageMarks": 33.1,
    "division": "Division IV",
    "points": 26,
    "classPosition": 10,
    "totalStudentsInClass": 19,
    "conduct": "Inaridhisha (Fair)",
    "headmasterRemarks": "Inahitaji kuongeza masaa ya kujisomea ili kupanda daraja.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-002",
    "examNumber": "S.0486.0002",
    "studentName": "Anitha Miraji Muhamad",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 43,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 31,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 26,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 29,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 52,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 34,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 31,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 291,
    "averageMarks": 36.4,
    "division": "Division IV",
    "points": 27,
    "classPosition": 11,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Kiingereza na Baiolojia viko vizuri. Weka bidii kwenye masomo mengine.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-004",
    "examNumber": "S.0486.0004",
    "studentName": "Farida Mohamed Juma",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 40,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 33,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 19,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 40,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 41,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 23,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 47,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 275,
    "averageMarks": 34.4,
    "division": "Division IV",
    "points": 28,
    "classPosition": 12,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Fanya mazoezi ya mitihani iliyopita mara kwa mara.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-005",
    "examNumber": "S.0486.0005",
    "studentName": "Gloria Paul William",
    "gender": "F",
    "form": "Form 4",
    "stream": "Arts",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 19,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 27,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 19,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 36,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 25,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 48,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 36,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 287,
    "averageMarks": 31.9,
    "division": "Division IV",
    "points": 28,
    "classPosition": 13,
    "totalStudentsInClass": 19,
    "conduct": "Inaridhisha (Fair)",
    "headmasterRemarks": "Zingatia masomo ya msingi ili kujiweka sawa kabla ya NECTA.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-017",
    "examNumber": "S.0486.0017",
    "studentName": "Amedeus Thadei Mrii",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 33,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 29,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 30,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 39,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 41,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "031",
        "name": "Physics",
        "nameEn": "Physics",
        "score": 34,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 20,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 39,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 265,
    "averageMarks": 33.1,
    "division": "Division IV",
    "points": 29,
    "classPosition": 14,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Unapaswa kuongeza umakini darasani na kuhudhuria masomo ya ziada.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-011",
    "examNumber": "S.0486.0011",
    "studentName": "Isdory Wilhem Kawishe",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 23,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 40,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 24,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 15,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 20,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 67,
        "grade": "B",
        "points": 2,
        "remarks": "Nzuri Sana"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 256,
    "averageMarks": 32,
    "division": "Division IV",
    "points": 29,
    "classPosition": 15,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Ufaulu mzuri sana wa Basic Mathematics (Grade B, 67%). Ongeza juhudi masomo mengine.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-016",
    "examNumber": "S.0486.0016",
    "studentName": "Willbrood Peter Kiwale",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 21,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 21,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 21,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 10,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 33,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 47,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 53,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 206,
    "averageMarks": 29.4,
    "division": "Division IV",
    "points": 30,
    "classPosition": 16,
    "totalStudentsInClass": 19,
    "conduct": "Inaridhisha (Fair)",
    "headmasterRemarks": "Matokeo mazuri kwenye Hisabati na Baiolojia. Masomo mengine yanahitaji marekebisho makubwa.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-012",
    "examNumber": "S.0486.0012",
    "studentName": "Louice Benedict Tungaraza",
    "gender": "M",
    "form": "Form 4",
    "stream": "Arts & Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 37,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 24,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 41,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 11,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 24,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "032",
        "name": "Chemistry",
        "nameEn": "Chemistry",
        "score": 25,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 45,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 25,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "024",
        "name": "Literature in English",
        "nameEn": "Literature in English",
        "score": 37,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      }
    ],
    "totalMarks": 269,
    "averageMarks": 29.8,
    "division": "Division IV",
    "points": 31,
    "classPosition": 17,
    "totalStudentsInClass": 19,
    "conduct": "Inaridhisha (Fair)",
    "headmasterRemarks": "Unatakiwa kuongeza bidii na kuhudhuria kambi ya kitaaluma.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-015",
    "examNumber": "S.0486.0015",
    "studentName": "Simon Narisis Mramba",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 28,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 29,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 15,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 12,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 42,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 50,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 208,
    "averageMarks": 29.7,
    "division": "Division IV",
    "points": 31,
    "classPosition": 18,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Jitahidi kuongeza ushirikiano na walimu wa masomo ya sanaa na lugha.",
    "publishDate": "2025-11-20"
  },
  {
    "id": "uomb-nb-009",
    "examNumber": "S.0486.0009",
    "studentName": "David Dismas Vicent",
    "gender": "M",
    "form": "Form 4",
    "stream": "Science",
    "examType": "Annual Examination 2025",
    "year": 2025,
    "subjects": [
      {
        "code": "011",
        "name": "Civics",
        "nameEn": "Civics",
        "score": 27,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "012",
        "name": "History",
        "nameEn": "History",
        "score": 23,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "013",
        "name": "Geography",
        "nameEn": "Geography",
        "score": 13,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "021",
        "name": "Kiswahili",
        "nameEn": "Kiswahili",
        "score": 13,
        "grade": "F",
        "points": 5,
        "remarks": "Feli"
      },
      {
        "code": "022",
        "name": "English Language",
        "nameEn": "English Language",
        "score": 32,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "033",
        "name": "Biology",
        "nameEn": "Biology",
        "score": 35,
        "grade": "D",
        "points": 4,
        "remarks": "Dhaifu"
      },
      {
        "code": "041",
        "name": "Basic Mathematics",
        "nameEn": "Basic Mathematics",
        "score": 54,
        "grade": "C",
        "points": 3,
        "remarks": "Nzuri"
      }
    ],
    "totalMarks": 197,
    "averageMarks": 28.1,
    "division": "Division IV",
    "points": 31,
    "classPosition": 19,
    "totalStudentsInClass": 19,
    "conduct": "Nzuri (Good)",
    "headmasterRemarks": "Hisabati ni nzuri (54% Grade C). Weka mkakati wa kuokoa masomo mengine.",
    "publishDate": "2025-11-20"
  }
];
