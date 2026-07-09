export type UserRole = "admin" | "teacher" | "student" | "parent";

export interface pagination {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface user {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  studentClass?: Class;
  teacherSubjects?: subject[];
}

export interface academicYear {
  _id: string;
  name: string;
  fromYear: Date;
  toYear: Date;
  isCurrent: boolean;
}

export interface Class {
  _id: string;
  name: string;
  academicYear: academicYear;
  classTeacher: user;
  subjects: subject[];
  students: user[];
  capacity: number;
}

export interface subject {
  _id: string;
  name: string;
  code: string;
  unit?: number;
  teacher?: user[];
  isActive: boolean;
}

export interface courseRegistration {
  _id: string;
  student?: user;
  class?: Class;
  academicYear?: academicYear;
  subjectIds?: string[];
  subjects?: subject[];
  status: "submitted" | "approved";
  updatedAt?: string;
}

export interface resultRecord {
  _id: string;
  student?: user;
  subject?: subject;
  class?: Class;
  academicYear?: academicYear;
  caScore: number;
  examScore: number;
  totalScore: number;
  qualityPoints?: number;
  grade: string;
  remark: string;
  resultStatus?: "draft" | "published";
}

export interface question {
  _id: string;
  questionText: string;
  type: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface exam {
  _id: string;
  title: string;
  subject: subject;
  class: Class;
  teacher: user;
  duration: number;
  questions: question[];
  dueDate: Date;
  isActive: boolean;
}

export interface Submission {
  _id: string;
  score: number;
  exam: exam;
  answers: { questionId: string; answer: string }[];
}

export interface period {
  _id: string;
  subject: { _id: string; name: string; code: string };
  teacher: { _id: string; name: string };
  startTime: string;
  endTime: string;
}

export interface schedule {
  day: string;
  periods: period[];
}
