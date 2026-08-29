export type EvaluationGrade = 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'إعادة';

export type RecordType = 'حفظ جديد' | 'مراجعة صغرى' | 'مراجعة كبرى' | 'تلاوة وتجويد';

export type AttendanceStatus = 'حاضر' | 'غائب بعذر' | 'غائب' | 'مستأذن';

export type SyncStatus = 'pending' | 'synced' | 'local' | 'error';

export interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  ayahsCount: number;
  type: 'مكية' | 'مدنية';
  juz: number;
  startPage: number;
}

export interface Halaqa {
  id: string;
  name: string;
  mosqueName: string;
  city: string;
  description?: string;
  isActive: boolean;
  createdAt?: any;
  updatedAt?: any;
  createdBy?: string;
  
  // Computed / UI stats helper fields
  studentsCount?: number;
  recordsCount?: number;
  teachersCount?: number;
}

export interface Student {
  id: string;
  halaqaId?: string;
  name: string;
  age: number;
  guardianName: string;
  guardianPhone: string;
  level: string;
  status: 'نشط' | 'متعثر' | 'متميز' | 'منقطع';
  currentSurah: number;
  currentVerse: number;
  targetDailyAmount: number;
  totalJuz: number;
  createdAt: any;
  updatedAt: any;
  createdBy: string;
  active: boolean;
  deleted: boolean;
  
  // UI Compatibility aliases
  parentPhone?: string;
  group?: string;
  currentSurahNumber?: number;
  currentAyah?: number;
  completedJuz?: number;
  targetDailyPages?: number;
  joinDate?: string;
  avatarSeed?: string;
  notes?: string;
}

export interface MemorizationRecord {
  id: string;
  halaqaId?: string;
  studentId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  surahNumber: number;
  fromVerse: number;
  toVerse: number;
  recordType: RecordType;
  rating: EvaluationGrade;
  mistakesCount: number;
  alertsCount: number;
  hesitationCount: number;
  notes?: string;
  createdAt: any;
  updatedAt: any;
  deviceId: string;
  deleted: boolean;

  // UI Compatibility aliases
  type?: RecordType;
  fromAyah?: number;
  toAyah?: number;
  grade?: EvaluationGrade;
  hesitationsCount?: number;
  teacherNotes?: string;
  audioRecorded?: boolean;
}

// Alias for daily record to ensure backwards compatibility
export type DailyRecord = MemorizationRecord;

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  reason?: string;
}

export interface TeacherProfile {
  id: string;
  name: string;
  title: string;
  circleName: string;
  mosqueName: string;
  city: string;
  phone: string;
  email: string;
  role: 'teacher' | 'assistant' | 'admin';
  halaqaIds?: string[];
  defaultHalaqaId?: string;
  active: boolean;
  isLoggedIn?: boolean;
  avatarSeed?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface CircleSettings {
  id: string;
  halaqaId?: string;
  circleName: string;
  mosqueName: string;
  city: string;
  sessionDays: string[];
  sessionStartTime: string;
  sessionEndTime: string;
  dailyMemorizationTarget: string;
  enableWhatsAppNotifications: boolean;
  whatsAppTemplate: string;
  mushafType: 'مصحف المدينة (حفص عن عاصم)' | 'مصحف التجويد الملون' | 'مصحف الشمرلي' | 'مصحف قالون';
  themeMode: 'light' | 'dark' | 'system';
  colorTheme: 'emerald' | 'forest' | 'teal';
  updatedAt?: any;
}

