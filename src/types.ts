export interface Question {
  id: string;
  text: string;
  type: 'multiple_choice' | 'essay' | 'true_false' | string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export interface ExamStatistics {
  cognitiveLevels: string[];
  difficultyScore: number;
  skillsEvaluated: string[];
  estimatedSuccessRate: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  grade: string;
  syllabus: string;
  difficulty: string;
  format: string;
  estimatedTime: string;
  questions: Question[];
  statistics: ExamStatistics;
  createdAt: any; // Can be firestore Timestamp or Date or string
  createdBy: string;
  developerName?: string;
  originalExamId?: string;
  adaptationType?: 'none' | 'adaptation' | 'recovery';
  studentPerformanceInfo?: string;
}
