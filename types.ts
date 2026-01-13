
export interface Question {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'Dễ' | 'Trung bình' | 'Khó';
}

export interface QuizResult {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  answers: {
    questionId: number;
    userAnswer: number;
    isCorrect: boolean;
  }[];
  date: string;
}

export interface Analysis {
  strengths: string[];
  weaknesses: string[];
  roadmap: string;
  advice: string;
}

export interface User {
  name: string;
  bestScore: number;
  history: QuizResult[];
}

export interface LeaderboardEntry {
  name: string;
  score: number;
  date: string;
}
