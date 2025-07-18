export interface Child {
  id: string;
  name: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  bloodType?: string;
  allergies: string[];
  photoURL?: string;
  parentId: string;
  medicalConditions?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface GrowthRecord {
  id: string;
  childId: string;
  parentId: string;
  date: string;
  height: number; // in cm
  weight: number; // in kg
  headCircumference?: number; // in cm
  notes?: string;
  percentiles?: {
    heightPercentile: number;
    weightPercentile: number;
    bmiPercentile?: number;
  };
  createdAt: Date;
}

export interface HealthReminder {
  id: string;
  childId: string;
  parentId: string;
  type: 'medicine' | 'meal' | 'water' | 'sleep' | 'appointment' | 'exercise';
  title: string;
  description?: string;
  time: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'once' | 'custom';
  customFrequency?: string;
  isActive: boolean;
  notificationEnabled: boolean;
  completedDates: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface MediaItem {
  id: string;
  title: string;
  description: string;
  category: 'books' | 'videos' | 'music' | 'games';
  ageGroup: string; // e.g., "0-2", "3-5", "6-8"
  thumbnailURL: string;
  mediaURL: string;
  duration?: number; // for videos/music in seconds
  tags: string[];
  isFeatured: boolean;
  difficulty?: 'easy' | 'medium' | 'hard';
  educationalValue?: string[];
  language: string;
  author?: string;
  publisher?: string;
  rating?: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserFavorite {
  id: string;
  userId: string;
  mediaItemId: string;
  createdAt: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  childId?: string;
  mediaItemId: string;
  status: 'started' | 'completed' | 'bookmarked';
  progress?: number; // percentage for videos
  timeSpent?: number; // in seconds
  lastAccessed: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: 'parent' | 'admin';
  photoURL?: string;
  phoneNumber?: string;
  location?: string;
  language: 'en' | 'uz' | 'ru';
  isActive: boolean;
  notificationPreferences: {
    medicine: boolean;
    meals: boolean;
    water: boolean;
    sleep: boolean;
    appointments: boolean;
    healthTips: boolean;
    contentUpdates: boolean;
    systemUpdates: boolean;
  };
  fcmToken?: string;
  lastActive: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IllnessInfo {
  id: string;
  name: string;
  category: string;
  symptoms: string[];
  causes: string[];
  treatment: string[];
  whenToSeeDoctor: string[];
  prevention: string[];
  ageGroups: string[];
  severity: 'mild' | 'moderate' | 'severe';
  isActive: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  targetAudience: 'all' | 'parents' | 'admins';
  ageGroupFilter?: string[];
  category: 'health_tip' | 'system_update' | 'content_alert' | 'general';
  isActive: boolean;
  scheduledFor?: Date;
  sentAt?: Date;
  readBy: string[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface HealthTimeline {
  id: string;
  childId: string;
  parentId: string;
  type: 'growth' | 'illness' | 'medicine' | 'appointment' | 'milestone' | 'admin_note';
  title: string;
  description?: string;
  date: Date;
  data?: any; // Flexible data field for different types
  severity?: 'low' | 'medium' | 'high';
  createdBy: string;
  createdAt: Date;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: 'nutrition' | 'growth' | 'development' | 'safety' | 'general';
  ageGroups: string[];
  tags: string[];
  isActive: boolean;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'reminder' | 'health_tip' | 'system_update' | 'content_alert';
  data?: any;
  isRead: boolean;
  priority: 'low' | 'normal' | 'high';
  createdAt: Date;
  readAt?: Date;
}

export interface AdminMetrics {
  totalParents: number;
  totalChildren: number;
  activeReminders: number;
  totalMediaItems: number;
  featuredMediaItems: number;
  totalGrowthRecords: number;
  recentRegistrations: number;
  contentEngagement: {
    totalViews: number;
    averageSessionTime: number;
    topCategories: { category: string; views: number }[];
  };
  healthMetrics: {
    averageGrowthRecordsPerChild: number;
    mostCommonReminders: { type: string; count: number }[];
    ageGroupDistribution: { ageGroup: string; count: number }[];
  };
}

export interface WHOGrowthStandard {
  ageInMonths: number;
  gender: 'male' | 'female';
  heightPercentiles: { [key: string]: number }; // P3, P10, P25, P50, P75, P90, P97
  weightPercentiles: { [key: string]: number };
  bmiPercentiles?: { [key: string]: number };
}

export interface AIRecommendation {
  id: string;
  childId: string;
  type: 'health_tip' | 'content_recommendation' | 'growth_alert' | 'routine_suggestion';
  title: string;
  description: string;
  confidence: number; // 0-1
  data?: any;
  isActive: boolean;
  dismissedAt?: Date;
  createdAt: Date;
}

export interface ContentRecommendation {
  mediaItem: MediaItem;
  score: number;
  reasons: string[];
}

export interface HealthAlert {
  id: string;
  childId: string;
  type: 'growth_concern' | 'missed_reminders' | 'unusual_pattern';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  recommendations: string[];
  isResolved: boolean;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface NutritionRecord {
  id: string;
  childId: string;
  parentId: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  name: string;
  time: string;
  calories?: number;
  ingredients: string[];
  notes?: string;
  completed: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

export interface FCMMessage {
  title: string;
  body: string;
  data?: { [key: string]: string };
  tokens?: string[];
  topic?: string;
  condition?: string;
}