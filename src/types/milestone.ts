export interface Question {
  id: string;
  text: string;
  category: 'physical' | 'cognitive' | 'emotional' | 'social' | 'language';
  options: string[];
  expectedAnswer: number; // Index of the expected/correct answer (0-3)
  weight?: number; // Optional weight for scoring (default: 1)
}

export interface Test {
  id: string;
  ageInMonths: number;
  title: string;
  description: string;
  questions: Question[];
  recommendations: TestRecommendation[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TestRecommendation {
  id: string;
  scoreRange: {
    min: number; // Percentage (0-100)
    max: number; // Percentage (0-100)
  };
  status: 'excellent' | 'good' | 'needs_attention' | 'consult_doctor';
  title: string;
  message: string;
  tips: string[];
  nextSteps?: string[];
  urgency: 'low' | 'medium' | 'high';
}

export interface TestAnswer {
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  childId: string;
  parentId: string;
  testId: string;
  ageInMonths: number;
  answers: TestAnswer[];
  score: number; // Percentage (0-100)
  totalQuestions: number;
  correctAnswers: number;
  recommendation: TestRecommendation;
  submittedAt: Date;
  completedAt: Date;
  createdAt: Date;
}

// New interfaces for milestone test templates
export interface MilestoneTestTemplate {
  id: string;
  milestoneId: string;
  title: string;
  description: string;
  questions: MilestoneTestQuestion[];
  passingScore?: number; // Optional passing score (0-100)
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MilestoneTestQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'yes_no' | 'text';
  options?: string[]; // For multiple choice
  correctAnswer?: number | string; // Index for multiple choice, 'yes'/'no' for yes/no
  weight?: number; // Optional weight for scoring (default: 1)
}

export interface MilestoneTestAttempt {
  id: string;
  userId: string; // Parent ID
  childId?: string; // Optional child ID
  milestoneId: string;
  testTemplateId: string;
  answers: MilestoneTestAnswer[];
  result: {
    score?: number; // Percentage for auto-gradable questions
    passed?: boolean; // If passing score is defined
    totalQuestions: number;
    gradableQuestions: number;
    correctAnswers: number;
  };
  milestoneAchieved?: boolean; // If milestone was marked as achieved
  completedAt: Date;
  createdAt: Date;
}

export interface MilestoneTestAnswer {
  questionId: string;
  answer: string | number; // String for text, number for multiple choice index
  isCorrect?: boolean; // Only for gradable questions
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  ageInMonths: number;
  category: 'physical' | 'cognitive' | 'emotional' | 'social' | 'language';
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChildMilestone {
  id: string;
  childId: string;
  parentId: string;
  milestoneId: string;
  achieved: boolean;
  achievedAt?: Date;
  notes?: string;
  testAttemptId?: string; // Link to the test attempt that achieved this
  createdAt: Date;
  updatedAt: Date;
}
export interface TestSession {
  testId: string;
  childId: string;
  currentQuestionIndex: number;
  answers: TestAnswer[];
  startedAt: Date;
  isCompleted: boolean;
}

export interface DevelopmentCategory {
  name: string;
  description: string;
  color: string;
  icon: string;
}

export const DEVELOPMENT_CATEGORIES: Record<string, DevelopmentCategory> = {
  physical: {
    name: 'Physical Development',
    description: 'Motor skills, coordination, and physical growth',
    color: 'blue',
    icon: '🏃‍♂️',
  },
  cognitive: {
    name: 'Cognitive Development',
    description: 'Learning, thinking, and problem-solving skills',
    color: 'purple',
    icon: '🧠',
  },
  emotional: {
    name: 'Emotional Development',
    description: 'Understanding and expressing emotions',
    color: 'pink',
    icon: '❤️',
  },
  social: {
    name: 'Social Development',
    description: 'Interaction with others and social skills',
    color: 'green',
    icon: '👥',
  },
  language: {
    name: 'Language Development',
    description: 'Communication and language skills',
    color: 'yellow',
    icon: '💬',
  },
};

export const AGE_GROUPS = [
  { months: 6, label: '6 Months' },
  { months: 9, label: '9 Months' },
  { months: 12, label: '1 Year' },
  { months: 18, label: '18 Months' },
  { months: 24, label: '2 Years' },
  { months: 30, label: '2.5 Years' },
  { months: 36, label: '3 Years' },
  { months: 48, label: '4 Years' },
  { months: 60, label: '5 Years' },
];