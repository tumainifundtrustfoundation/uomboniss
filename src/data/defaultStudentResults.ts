import { StudentResult } from '../types';
import { CSSC_FORM_FOUR_JOINT_RESULTS_2026, CSSC_FORM_TWO_JOINT_RESULTS_2026 } from './csscJointExamResults2026';
import { AUTHENTIC_UOMBONI_NOTICEBOARD_STUDENTS } from './uomboniNoticeboardResults';
import { FORM_ONE_STUDENT_RESULTS } from './formOneStudents';
import { FORM_THREE_STUDENT_RESULTS } from './formThreeStudents';
import { FORM_FOUR_STUDENT_RESULTS } from './formFourStudents';
import { FORM_TWO_STUDENT_RESULTS } from './formTwoStudents';

export const DEFAULT_UOMBONI_STUDENT_RESULTS: StudentResult[] = [
  ...CSSC_FORM_FOUR_JOINT_RESULTS_2026,
  ...CSSC_FORM_TWO_JOINT_RESULTS_2026,
  ...FORM_FOUR_STUDENT_RESULTS,
  ...AUTHENTIC_UOMBONI_NOTICEBOARD_STUDENTS,
  ...FORM_ONE_STUDENT_RESULTS,
  ...FORM_TWO_STUDENT_RESULTS,
  ...FORM_THREE_STUDENT_RESULTS,
];
