import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  Student, 
  MemorizationRecord, 
  DailyRecord,
  AttendanceRecord, 
  TeacherProfile, 
  CircleSettings, 
  Halaqa, 
  EvaluationGrade, 
  RecordType, 
  AttendanceStatus, 
  SyncStatus 
} from '../types';
import { 
  INITIAL_STUDENTS, 
  INITIAL_RECORDS, 
  INITIAL_ATTENDANCE, 
  INITIAL_TEACHER, 
  INITIAL_SETTINGS,
  INITIAL_HALAQAS 
} from '../data/initialData';
import { 
  auth, 
  db, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  serverTimestamp,
  handleFirestoreError,
  OperationType,
  User
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  getDoc,
  getDocs,
  onSnapshot, 
  query, 
  where,
  writeBatch,
  WriteBatch
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';

export type ScreenType = 'home' | 'students' | 'record' | 'reports' | 'settings' | 'login' | 'admin_halaqas';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export interface MigrationLogItem {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface MigrationStatus {
  isRunning: boolean;
  progress: number;
  totalSteps: number;
  currentStep: number;
  logs: MigrationLogItem[];
  summary: {
    halaqasCreated: number;
    studentsUpdated: number;
    recordsUpdated: number;
    teachersUpdated: number;
  } | null;
  error: string | null;
  isCompleted: boolean;
}

interface AppContextType {
  currentScreen: ScreenType;
  setCurrentScreen: (screen: ScreenType) => void;
  previousScreen: ScreenType;
  
  // Auth state
  currentUser: User | null;
  isAuthLoading: boolean;
  authError: string | null;
  setAuthError: (err: string | null) => void;
  teacher: TeacherProfile;
  isAdmin: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;

  // Halaqas Management (Multi-Tenancy)
  halaqas: Halaqa[];
  isHalaqasLoading: boolean;
  selectedHalaqaId: string | null;
  selectedHalaqa: Halaqa | null;
  setSelectedHalaqaId: (id: string | null) => void;
  createHalaqa: (data: Omit<Halaqa, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'studentsCount' | 'recordsCount' | 'teachersCount'>) => Promise<string | null>;
  updateHalaqa: (id: string, data: Partial<Halaqa>) => Promise<void>;
  toggleHalaqaStatus: (id: string, isActive: boolean) => Promise<void>;
  
  // Teachers Management (Admin only)
  teachersList: TeacherProfile[];
  assignTeacherHalaqas: (teacherId: string, halaqaIds: string[], defaultHalaqaId?: string) => Promise<void>;

  // Filtered Data (by selected halaqa)
  students: Student[];
  allStudents: Student[]; // Active filtered list for compatibility
  isStudentsLoading: boolean;
  addStudent: (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'active' | 'deleted'>) => Promise<void>;
  updateStudent: (id: string, student: Partial<Student>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;

  dailyRecords: DailyRecord[];
  allDailyRecords: DailyRecord[];
  isRecordsLoading: boolean;
  addDailyRecord: (record: Omit<MemorizationRecord, 'id' | 'createdAt' | 'updatedAt' | 'deviceId' | 'deleted' | 'teacherId'> & { date?: string }) => Promise<void>;
  deleteDailyRecord: (id: string) => Promise<void>;

  attendance: AttendanceRecord[];
  setStudentAttendance: (studentId: string, status: AttendanceStatus, reason?: string) => void;

  settings: CircleSettings;
  updateSettings: (newSettings: Partial<CircleSettings>) => Promise<void>;
  resetAllData: () => Promise<void>;

  // Migration Tool
  migrationStatus: MigrationStatus;
  runManualMigration: () => Promise<void>;

  // Sync state
  syncStatus: SyncStatus;
  syncStatusLabel: string;

  // Selected student states
  selectedStudentForRecord: Student | null;
  setSelectedStudentForRecord: (student: Student | null) => void;
  selectedStudentForDetail: Student | null;
  setSelectedStudentForDetail: (student: Student | null) => void;
  
  editingStudent: Student | null;
  setEditingStudent: (student: Student | null) => void;
  isAddStudentModalOpen: boolean;
  setIsAddStudentModalOpen: (open: boolean) => void;

  // Viewport and Compose inspector
  deviceViewMode: 'mobile' | 'fullscreen';
  setDeviceViewMode: (mode: 'mobile' | 'fullscreen') => void;
  isCodeInspectorOpen: boolean;
  setIsCodeInspectorOpen: (open: boolean) => void;

  toasts: ToastMessage[];
  showToast: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  triggerCelebration: () => void;

  // Export / Import
  exportBackupData: () => string;
  importBackupData: (jsonStr: string) => Promise<{ success: boolean; message: string; duplicateCount?: number }>;

  // Helper stats
  getStudentRecords: (studentId: string) => DailyRecord[];
  getStudentAttendance: (studentId: string) => AttendanceRecord[];
  getTodayRecordForStudent: (studentId: string) => DailyRecord | undefined;
  getTodayAttendanceForStudent: (studentId: string) => AttendanceRecord | undefined;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Unique persistent device ID for conflict-free multi-device tracking
const getOrCreateDeviceId = (): string => {
  let devId = localStorage.getItem('halaqa_device_id');
  if (!devId) {
    devId = `dev-${uuidv4().slice(0, 8)}`;
    localStorage.setItem('halaqa_device_id', devId);
  }
  return devId;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreenState] = useState<ScreenType>('home');
  const [previousScreen, setPreviousScreen] = useState<ScreenType>('home');
  const [deviceViewMode, setDeviceViewMode] = useState<'mobile' | 'fullscreen'>('mobile');
  const [isCodeInspectorOpen, setIsCodeInspectorOpen] = useState<boolean>(false);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [teacher, setTeacherState] = useState<TeacherProfile>(INITIAL_TEACHER);
  const [teachersList, setTeachersList] = useState<TeacherProfile[]>([]);

  // Multi-Halaqas State
  const [halaqas, setHalaqasState] = useState<Halaqa[]>([]);
  const [isHalaqasLoading, setIsHalaqasLoading] = useState<boolean>(true);
  const [selectedHalaqaId, setSelectedHalaqaIdState] = useState<string | null>(() => {
    return localStorage.getItem('halaqa_selected_id');
  });

  // Firestore collections state (Filtered by selectedHalaqaId)
  const [allStudentsRaw, setAllStudentsRaw] = useState<Student[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState<boolean>(true);
  const [allRecordsRaw, setAllRecordsRaw] = useState<DailyRecord[]>([]);
  const [isRecordsLoading, setIsRecordsLoading] = useState<boolean>(true);
  const [settings, setSettingsState] = useState<CircleSettings>(INITIAL_SETTINGS);
  
  const [attendance, setAttendanceState] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('halaqah_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Migration state
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>({
    isRunning: false,
    progress: 0,
    totalSteps: 5,
    currentStep: 0,
    logs: [],
    summary: null,
    error: null,
    isCompleted: false
  });

  // Combined Sync state tracking across all active snapshot listeners
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const listenerSyncMapRef = useRef<Record<string, SyncStatus>>({});

  const [selectedStudentForRecord, setSelectedStudentForRecord] = useState<Student | null>(null);
  const [selectedStudentForDetail, setSelectedStudentForDetail] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState<boolean>(false);

  const deviceIdRef = useRef<string>(getOrCreateDeviceId());

  // Recalculate combined sync status from active listeners
  const updateListenerSync = useCallback((key: string, status: SyncStatus) => {
    listenerSyncMapRef.current[key] = status;
    const statuses = Object.values(listenerSyncMapRef.current);
    if (statuses.length === 0) {
      setSyncStatus('synced');
      return;
    }
    if (statuses.includes('error')) {
      setSyncStatus('error');
    } else if (statuses.includes('pending')) {
      setSyncStatus('pending');
    } else if (statuses.every(s => s === 'synced')) {
      setSyncStatus('synced');
    } else if (statuses.includes('local')) {
      setSyncStatus('local');
    } else {
      setSyncStatus('synced');
    }
  }, []);

  const removeListenerSync = useCallback((key: string) => {
    delete listenerSyncMapRef.current[key];
    const statuses = Object.values(listenerSyncMapRef.current);
    if (statuses.length === 0) {
      setSyncStatus('synced');
      return;
    }
    if (statuses.includes('error')) {
      setSyncStatus('error');
    } else if (statuses.includes('pending')) {
      setSyncStatus('pending');
    } else if (statuses.every(s => s === 'synced')) {
      setSyncStatus('synced');
    } else if (statuses.includes('local')) {
      setSyncStatus('local');
    } else {
      setSyncStatus('synced');
    }
  }, []);

  // Save local attendance
  useEffect(() => {
    localStorage.setItem('halaqah_attendance', JSON.stringify(attendance));
  }, [attendance]);

  // Admin status derived strictly from stored teacher document
  const isAdmin = teacher.isLoggedIn === true && teacher.active === true && teacher.role === 'admin';

  // Translate Sync Status to Arabic
  const syncStatusLabel = (() => {
    switch (syncStatus) {
      case 'pending':
        return 'بانتظار المزامنة';
      case 'synced':
        return 'تمت المزامنة';
      case 'local':
        return 'محفوظ محليًا';
      case 'error':
        return 'فشلت المزامنة';
      default:
        return 'تمت المزامنة';
    }
  })();

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#006D44', '#8EF7BE', '#D4AF37', '#10B981', '#ffffff']
      });
    } catch {
      // safe fallback
    }
  };

  // Set selected halaqa with validation and localStorage persistence
  const setSelectedHalaqaId = useCallback((id: string | null) => {
    if (id) {
      // For non-admin, validate against teacher.halaqaIds
      if (teacher.isLoggedIn && teacher.role !== 'admin') {
        const assigned = teacher.halaqaIds || [];
        if (!assigned.includes(id)) {
          console.warn(`Unauthorized halaqa switch attempt: ${id}`);
          return;
        }
      }
      setSelectedHalaqaIdState(id);
      localStorage.setItem('halaqa_selected_id', id);
    } else {
      setSelectedHalaqaIdState(null);
      localStorage.removeItem('halaqa_selected_id');
    }
  }, [teacher.isLoggedIn, teacher.role, teacher.halaqaIds]);

  // Helper for helper sync state from metadata
  const getSnapshotSyncStatus = (metadata: { hasPendingWrites: boolean; fromCache: boolean }): SyncStatus => {
    if (metadata.hasPendingWrites) return 'pending';
    if (metadata.fromCache) return 'local';
    return 'synced';
  };

  // Helper for handling Firestore operation errors & rollback
  const handleOperationError = useCallback((error: any, rollbackFn?: () => void, customMsg?: string) => {
    if (rollbackFn) rollbackFn();
    updateListenerSync('last_operation', 'error');

    const errCode = error?.code || 'unknown';
    const errMsg = error?.message || '';
    const displayMsg = customMsg ? `${customMsg} [${errCode}]` : `Operation error: [${errCode}] ${errMsg}`;
    console.error('Firestore operation error:', error);
    showToast(displayMsg, 'error');
  }, [showToast, updateListenerSync]);

  // 1. Firebase Auth listener & Teacher Document Verification
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setIsAuthLoading(true);

      if (!user) {
        setCurrentUser(null);
        setTeacherState({
          ...INITIAL_TEACHER,
          isLoggedIn: false,
          active: false,
          halaqaIds: []
        });
        setHalaqasState([]);
        setTeachersList([]);
        setAllStudentsRaw([]);
        setAllRecordsRaw([]);
        setCurrentScreenState('login');
        setIsAuthLoading(false);
        return;
      }

      // If user is already loaded with valid active profile, ensure state consistency
      if (teacher.isLoggedIn && teacher.id === user.uid && teacher.active === true) {
        setCurrentUser(user);
        setIsAuthLoading(false);
        return;
      }

      // Fetch teacher document using getDoc directly from teachers/{user.uid}
      try {
        const teacherDocRef = doc(db, 'teachers', user.uid);
        const docSnap = await getDoc(teacherDocRef);

        if (!docSnap.exists()) {
          const msg = 'Missing teacher document';
          console.error(`Teacher profile error: ${msg}`);
          await signOut(auth);
          setCurrentUser(null);
          setTeacherState({
            ...INITIAL_TEACHER,
            isLoggedIn: false,
            active: false,
            halaqaIds: []
          });
          setAuthError(msg);
          showToast(msg, 'error');
          setCurrentScreenState('login');
          setIsAuthLoading(false);
          return;
        }

        const data = docSnap.data() as Partial<TeacherProfile>;

        if (data.active !== true) {
          const msg = 'Inactive teacher account';
          console.error(`Teacher profile error: ${msg}`);
          await signOut(auth);
          setCurrentUser(null);
          setTeacherState({
            ...INITIAL_TEACHER,
            isLoggedIn: false,
            active: false,
            halaqaIds: []
          });
          setAuthError(msg);
          showToast(msg, 'error');
          setCurrentScreenState('login');
          setIsAuthLoading(false);
          return;
        }

        // Admin access must come only from teacherDocument.role === "admin"
        // Teacher access must come only from teacherDocument.role === "teacher"
        const role: 'admin' | 'teacher' = data.role === 'admin' ? 'admin' : 'teacher';
        const assignedHalaqaIds = Array.isArray(data.halaqaIds) ? data.halaqaIds : [];

        const loadedTeacher: TeacherProfile = {
          id: user.uid,
          name: data.name || user.displayName || user.email?.split('@')[0] || 'معلم الحلقة',
          title: data.title || (role === 'admin' ? 'مشرف عام' : 'معلم ومحفّظ معتمد'),
          circleName: data.circleName || 'حلقة تحفيظ القرآن الكريم',
          mosqueName: data.mosqueName || 'جامع الهدى الكبير',
          city: data.city || 'الرياض',
          phone: data.phone || '',
          email: data.email || user.email || '',
          role: role,
          halaqaIds: assignedHalaqaIds,
          defaultHalaqaId: data.defaultHalaqaId || '',
          active: true,
          isLoggedIn: true,
          avatarSeed: data.avatarSeed || 'teacher'
        };

        setTeacherState(loadedTeacher);
        setCurrentUser(user);
        setAuthError(null);

        // Missing halaqaIds warning for teachers
        if (role === 'teacher' && assignedHalaqaIds.length === 0) {
          showToast('تنبيه: لم يتم إسناد أي حلقة لهذا الحساب، يرجى من المشرف إسناد حلقة', 'warning');
        }

        // Auto-select valid halaqa based on role & assigned halaqaIds
        const savedHalaqaId = localStorage.getItem('halaqa_selected_id');
        if (role === 'admin') {
          if (savedHalaqaId) {
            setSelectedHalaqaIdState(savedHalaqaId);
          } else if (loadedTeacher.defaultHalaqaId) {
            setSelectedHalaqaIdState(loadedTeacher.defaultHalaqaId);
          } else if (assignedHalaqaIds.length > 0) {
            setSelectedHalaqaIdState(assignedHalaqaIds[0]);
          }
        } else {
          if (savedHalaqaId && assignedHalaqaIds.includes(savedHalaqaId)) {
            setSelectedHalaqaIdState(savedHalaqaId);
          } else if (loadedTeacher.defaultHalaqaId && assignedHalaqaIds.includes(loadedTeacher.defaultHalaqaId)) {
            setSelectedHalaqaIdState(loadedTeacher.defaultHalaqaId);
          } else if (assignedHalaqaIds.length > 0) {
            setSelectedHalaqaIdState(assignedHalaqaIds[0]);
          } else {
            setSelectedHalaqaIdState(null);
          }
        }

        setCurrentScreenState('home');
        setIsAuthLoading(false);
      } catch (err: any) {
        const errCode = err?.code || 'unknown-firestore-error';
        console.error(`Teacher profile error: [${errCode}]`, err);
        await signOut(auth);
        setCurrentUser(null);
        setTeacherState({
          ...INITIAL_TEACHER,
          isLoggedIn: false,
          active: false,
          halaqaIds: []
        });
        const msg = `Teacher profile error: [${errCode}]`;
        setAuthError(msg);
        showToast(msg, 'error');
        setCurrentScreenState('login');
        setIsAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, [showToast]);

  // 2. Real-time Firestore Subscriptions for Halaqas, Teachers, Students, Records, and Settings
  // Starts only after the teacher document has been loaded successfully
  useEffect(() => {
    if (!currentUser || !teacher.isLoggedIn || teacher.active !== true) {
      setHalaqasState([]);
      setTeachersList([]);
      setAllStudentsRaw([]);
      setAllRecordsRaw([]);
      setIsHalaqasLoading(false);
      setIsStudentsLoading(false);
      setIsRecordsLoading(false);
      return;
    }

    setIsHalaqasLoading(true);
    const unsubs: Array<() => void> = [];

    // --- A. Halaqas Subscription ---
    if (teacher.role === 'admin') {
      // Admins may subscribe to all halaqas
      const halaqasCol = collection(db, 'halaqas');
      const unsubHalaqas = onSnapshot(halaqasCol, { includeMetadataChanges: true }, (snapshot) => {
        updateListenerSync('halaqas', getSnapshotSyncStatus(snapshot.metadata));
        const list: Halaqa[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Halaqa;
          list.push({
            ...data,
            id: docSnap.id,
            isActive: data.isActive !== false
          });
        });
        setHalaqasState(list);
        setIsHalaqasLoading(false);
      }, (error) => {
        const errCode = error?.code || 'unknown';
        console.error(`Collection subscription error: [halaqas] [${errCode}]`, error);
        showToast(`Collection subscription error: [halaqas] [${errCode}]`, 'error');
        updateListenerSync('halaqas', 'error');
        setIsHalaqasLoading(false);
      });
      unsubs.push(unsubHalaqas);
    } else {
      // Regular teachers must load ONLY halaqas whose document IDs exist in their teacher.halaqaIds
      const assignedIds = teacher.halaqaIds || [];
      if (assignedIds.length === 0) {
        setHalaqasState([]);
        setIsHalaqasLoading(false);
      } else {
        const loadedHalaqasMap: Record<string, Halaqa> = {};
        assignedIds.forEach(hId => {
          const unsubHalaqaDoc = onSnapshot(doc(db, 'halaqas', hId), { includeMetadataChanges: true }, (docSnap) => {
            updateListenerSync(`halaqa_${hId}`, getSnapshotSyncStatus(docSnap.metadata));
            if (docSnap.exists()) {
              const data = docSnap.data() as Halaqa;
              loadedHalaqasMap[hId] = {
                ...data,
                id: docSnap.id,
                isActive: data.isActive !== false
              };
            } else {
              delete loadedHalaqasMap[hId];
            }
            setHalaqasState(Object.values(loadedHalaqasMap));
            setIsHalaqasLoading(false);
          }, (error) => {
            const errCode = error?.code || 'unknown';
            console.error(`Collection subscription error: [halaqas/${hId}] [${errCode}]`, error);
            showToast(`Collection subscription error: [halaqas] [${errCode}]`, 'error');
            updateListenerSync(`halaqa_${hId}`, 'error');
            setIsHalaqasLoading(false);
          });
          unsubs.push(unsubHalaqaDoc);
        });
      }
    }

    // --- B. Teachers Subscription ---
    if (teacher.role === 'admin') {
      // Only admins may subscribe to the entire teachers collection
      const teachersCol = collection(db, 'teachers');
      const unsubTeachers = onSnapshot(teachersCol, { includeMetadataChanges: true }, (snapshot) => {
        updateListenerSync('teachers', getSnapshotSyncStatus(snapshot.metadata));
        const list: TeacherProfile[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as TeacherProfile;
          list.push({
            ...data,
            id: docSnap.id
          });
        });
        setTeachersList(list);
      }, (error) => {
        const errCode = error?.code || 'unknown';
        console.error(`Collection subscription error: [teachers] [${errCode}]`, error);
        showToast(`Collection subscription error: [teachers] [${errCode}]`, 'error');
        updateListenerSync('teachers', 'error');
      });
      unsubs.push(unsubTeachers);
    } else {
      // Regular teachers may only see themselves
      setTeachersList([teacher]);
    }

    // --- C. Validate selectedHalaqaId for Students & Records queries ---
    const isHalaqaValidForUser = teacher.role === 'admin' 
      ? !!selectedHalaqaId
      : (!!selectedHalaqaId && (teacher.halaqaIds || []).includes(selectedHalaqaId));

    if (isHalaqaValidForUser && selectedHalaqaId) {
      setIsStudentsLoading(true);
      setIsRecordsLoading(true);

      // Query students explicitly filtered by where("halaqaId", "==", selectedHalaqaId)
      const studentsQuery = query(
        collection(db, 'students'), 
        where('halaqaId', '==', selectedHalaqaId)
      );

      const unsubStudents = onSnapshot(studentsQuery, { includeMetadataChanges: true }, (snapshot) => {
        updateListenerSync('students', getSnapshotSyncStatus(snapshot.metadata));
        const list: Student[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as Student;
          if (!data.deleted) {
            list.push({
              ...data,
              id: docSnap.id,
              halaqaId: data.halaqaId || selectedHalaqaId,
              guardianName: data.guardianName || data.name,
              guardianPhone: data.guardianPhone || data.parentPhone || '',
              parentPhone: data.guardianPhone || data.parentPhone || '',
              group: data.level || data.group || 'المستوى الأول (جزء عم)',
              level: data.level || data.group || 'المستوى الأول (جزء عم)',
              currentSurahNumber: data.currentSurah || data.currentSurahNumber || 1,
              currentSurah: data.currentSurah || data.currentSurahNumber || 1,
              currentAyah: data.currentVerse || data.currentAyah || 1,
              currentVerse: data.currentVerse || data.currentAyah || 1,
              completedJuz: data.totalJuz ?? data.completedJuz ?? 0,
              totalJuz: data.totalJuz ?? data.completedJuz ?? 0,
              targetDailyPages: data.targetDailyAmount ?? data.targetDailyPages ?? 1,
              targetDailyAmount: data.targetDailyAmount ?? data.targetDailyPages ?? 1,
              joinDate: typeof data.createdAt === 'string' ? data.createdAt : new Date().toISOString().split('T')[0],
            });
          }
        });

        list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
        setAllStudentsRaw(list);
        setIsStudentsLoading(false);
      }, (error) => {
        const errCode = error?.code || 'unknown';
        console.error(`Collection subscription error: [students] [${errCode}]`, error);
        showToast(`Collection subscription error: [students] [${errCode}]`, 'error');
        updateListenerSync('students', 'error');
        setIsStudentsLoading(false);
      });
      unsubs.push(unsubStudents);

      // Query memorization records explicitly filtered by where("halaqaId", "==", selectedHalaqaId)
      const recordsQuery = query(
        collection(db, 'memorization_records'), 
        where('halaqaId', '==', selectedHalaqaId)
      );

      const unsubRecords = onSnapshot(recordsQuery, { includeMetadataChanges: true }, (snapshot) => {
        updateListenerSync('records', getSnapshotSyncStatus(snapshot.metadata));
        const list: MemorizationRecord[] = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data() as MemorizationRecord;
          if (!data.deleted) {
            list.push({
              ...data,
              id: docSnap.id,
              halaqaId: data.halaqaId || selectedHalaqaId,
              type: data.recordType || data.type || 'حفظ جديد',
              recordType: data.recordType || data.type || 'حفظ جديد',
              grade: data.rating || data.grade || 'ممتاز',
              rating: data.rating || data.grade || 'ممتاز',
              fromAyah: data.fromVerse ?? data.fromAyah ?? 1,
              fromVerse: data.fromVerse ?? data.fromAyah ?? 1,
              toAyah: data.toVerse ?? data.toAyah ?? 1,
              toVerse: data.toVerse ?? data.toAyah ?? 1,
              hesitationsCount: data.hesitationCount ?? data.hesitationsCount ?? 0,
              hesitationCount: data.hesitationCount ?? data.hesitationsCount ?? 0,
              teacherNotes: data.notes || data.teacherNotes || '',
              notes: data.notes || data.teacherNotes || ''
            });
          }
        });

        list.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
        setAllRecordsRaw(list);
        setIsRecordsLoading(false);
      }, (error) => {
        const errCode = error?.code || 'unknown';
        console.error(`Collection subscription error: [memorization_records] [${errCode}]`, error);
        showToast(`Collection subscription error: [memorization_records] [${errCode}]`, 'error');
        updateListenerSync('records', 'error');
        setIsRecordsLoading(false);
      });
      unsubs.push(unsubRecords);

      // Listen to Settings document for selected halaqa
      const settingsDoc = doc(db, 'settings', selectedHalaqaId);
      const unsubSettings = onSnapshot(settingsDoc, { includeMetadataChanges: true }, (docSnap) => {
        updateListenerSync('settings', getSnapshotSyncStatus(docSnap.metadata));
        if (docSnap.exists()) {
          const data = docSnap.data() as CircleSettings;
          setSettingsState(prev => ({ ...prev, ...data }));
        }
      }, (error) => {
        const errCode = error?.code || 'unknown';
        console.error(`Collection subscription error: [settings] [${errCode}]`, error);
        showToast(`Collection subscription error: [settings] [${errCode}]`, 'error');
        updateListenerSync('settings', 'error');
      });
      unsubs.push(unsubSettings);
    } else {
      // No valid halaqa selected or authorized -> clear data
      setAllStudentsRaw([]);
      setAllRecordsRaw([]);
      setIsStudentsLoading(false);
      setIsRecordsLoading(false);
      removeListenerSync('students');
      removeListenerSync('records');
      removeListenerSync('settings');
    }

    return () => {
      unsubs.forEach(unsub => unsub());
    };
  }, [
    currentUser, 
    teacher.isLoggedIn, 
    teacher.active, 
    teacher.role, 
    teacher.halaqaIds, 
    selectedHalaqaId, 
    showToast,
    updateListenerSync, 
    removeListenerSync
  ]);

  // Compute enriched halaqas stats
  const enrichedHalaqas: Halaqa[] = halaqas.map(h => {
    const stds = allStudentsRaw.filter(s => s.halaqaId === h.id);
    const recs = allRecordsRaw.filter(r => r.halaqaId === h.id);
    const tchrs = teachersList.filter(t => t.halaqaIds?.includes(h.id));
    return {
      ...h,
      studentsCount: stds.length,
      recordsCount: recs.length,
      teachersCount: tchrs.length
    };
  });

  // Current selected halaqa
  const selectedHalaqa = enrichedHalaqas.find(h => h.id === selectedHalaqaId) || enrichedHalaqas[0] || null;

  // Filtered lists for the active screen
  const students = allStudentsRaw;
  const dailyRecords = allRecordsRaw;

  const setCurrentScreen = (screen: ScreenType) => {
    setPreviousScreen(currentScreen);
    setCurrentScreenState(screen);
  };

  // Firebase Email/Password Login
  const loginWithEmail = async (email: string, pass: string): Promise<boolean> => {
    setAuthError(null);
    setIsAuthLoading(true);

    // 1. Authentication
    let authUser: User | null = null;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      authUser = userCredential.user;
    } catch (err: any) {
      const errCode = err?.code || 'unknown-auth-error';
      console.error(`Authentication error: [${errCode}]`, err);
      const msg = `Authentication error: [${errCode}]`;
      setAuthError(msg);
      showToast(msg, 'error');
      setIsAuthLoading(false);
      return false;
    }

    if (!authUser) {
      const msg = 'Authentication error: [no-user]';
      console.error(msg);
      setAuthError(msg);
      showToast(msg, 'error');
      setIsAuthLoading(false);
      return false;
    }

    // 2. Read exactly teachers/{user.uid} using getDoc
    try {
      const teacherDocRef = doc(db, 'teachers', authUser.uid);
      const docSnap = await getDoc(teacherDocRef);

      if (!docSnap.exists()) {
        const msg = 'Missing teacher document';
        console.error(`Teacher profile error: ${msg}`);
        await signOut(auth);
        setCurrentUser(null);
        setTeacherState({
          ...INITIAL_TEACHER,
          isLoggedIn: false,
          active: false,
          halaqaIds: []
        });
        setAuthError(msg);
        showToast(msg, 'error');
        setIsAuthLoading(false);
        return false;
      }

      const data = docSnap.data() as Partial<TeacherProfile>;

      if (data.active !== true) {
        const msg = 'Inactive teacher account';
        console.error(`Teacher profile error: ${msg}`);
        await signOut(auth);
        setCurrentUser(null);
        setTeacherState({
          ...INITIAL_TEACHER,
          isLoggedIn: false,
          active: false,
          halaqaIds: []
        });
        setAuthError(msg);
        showToast(msg, 'error');
        setIsAuthLoading(false);
        return false;
      }

      // Role check: admin access must come only from teacherDocument.role === 'admin'
      // teacher access must come only from teacherDocument.role === 'teacher'
      const role: 'admin' | 'teacher' = data.role === 'admin' ? 'admin' : 'teacher';
      const assignedHalaqaIds = Array.isArray(data.halaqaIds) ? data.halaqaIds : [];

      const loadedTeacher: TeacherProfile = {
        id: authUser.uid,
        name: data.name || authUser.displayName || authUser.email?.split('@')[0] || 'معلم الحلقة',
        title: data.title || (role === 'admin' ? 'مشرف عام' : 'معلم ومحفّظ معتمد'),
        circleName: data.circleName || 'حلقة تحفيظ القرآن الكريم',
        mosqueName: data.mosqueName || 'جامع الهدى الكبير',
        city: data.city || 'الرياض',
        phone: data.phone || '',
        email: data.email || authUser.email || '',
        role: role,
        halaqaIds: assignedHalaqaIds,
        defaultHalaqaId: data.defaultHalaqaId || '',
        active: true,
        isLoggedIn: true,
        avatarSeed: data.avatarSeed || 'teacher'
      };

      setTeacherState(loadedTeacher);
      setCurrentUser(authUser);
      setAuthError(null);

      // Warning if halaqaIds is empty for a teacher
      if (role === 'teacher' && assignedHalaqaIds.length === 0) {
        showToast('تنبيه: لم يتم إسناد أي حلقة لهذا الحساب، يرجى من المشرف إسناد حلقة', 'warning');
      }

      // Initial halaqa selection
      const savedHalaqaId = localStorage.getItem('halaqa_selected_id');
      if (role === 'admin') {
        if (savedHalaqaId) {
          setSelectedHalaqaIdState(savedHalaqaId);
        } else if (loadedTeacher.defaultHalaqaId) {
          setSelectedHalaqaIdState(loadedTeacher.defaultHalaqaId);
        } else if (assignedHalaqaIds.length > 0) {
          setSelectedHalaqaIdState(assignedHalaqaIds[0]);
        }
      } else {
        if (savedHalaqaId && assignedHalaqaIds.includes(savedHalaqaId)) {
          setSelectedHalaqaIdState(savedHalaqaId);
        } else if (loadedTeacher.defaultHalaqaId && assignedHalaqaIds.includes(loadedTeacher.defaultHalaqaId)) {
          setSelectedHalaqaIdState(loadedTeacher.defaultHalaqaId);
        } else if (assignedHalaqaIds.length > 0) {
          setSelectedHalaqaIdState(assignedHalaqaIds[0]);
        } else {
          setSelectedHalaqaIdState(null);
        }
      }

      setCurrentScreenState('home');
      setIsAuthLoading(false);
      return true;
    } catch (err: any) {
      const errCode = err?.code || 'unknown-firestore-error';
      console.error(`Teacher profile error: [${errCode}]`, err);
      await signOut(auth);
      setCurrentUser(null);
      setTeacherState({
        ...INITIAL_TEACHER,
        isLoggedIn: false,
        active: false,
        halaqaIds: []
      });
      const msg = `Teacher profile error: [${errCode}]`;
      setAuthError(msg);
      showToast(msg, 'error');
      setIsAuthLoading(false);
      return false;
    }
  };

  // Firebase Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setTeacherState({ ...INITIAL_TEACHER, isLoggedIn: false, active: false, halaqaIds: [] });
      setSelectedHalaqaId(null);
      setCurrentScreen('login');
      showToast('تم تسجيل الخروج بنجاح', 'info');
    } catch (err: any) {
      showToast('حدث خطأ أثناء تسجيل الخروج', 'error');
    }
  };

  // Create Halaqa (Strict Admin Only, Atomically with Settings in One writeBatch)
  const createHalaqa = async (data: Omit<Halaqa, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'studentsCount' | 'recordsCount' | 'teachersCount'>): Promise<string | null> => {
    if (teacher.role !== 'admin' || !teacher.active || !currentUser) {
      showToast('غير مصرح لك بإنشاء حلقات (خاص بالمشرف العام فقط)', 'error');
      return null;
    }

    const halaqaId = `halaqa-${Date.now().toString().slice(-6)}`;
    const batch = writeBatch(db);

    const halaqaRef = doc(db, 'halaqas', halaqaId);
    batch.set(halaqaRef, {
      id: halaqaId,
      name: data.name.trim(),
      mosqueName: data.mosqueName.trim(),
      city: data.city.trim(),
      description: (data.description || '').trim(),
      isActive: data.isActive !== false,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const settingsRef = doc(db, 'settings', halaqaId);
    batch.set(settingsRef, {
      ...settings,
      id: halaqaId,
      halaqaId: halaqaId,
      circleName: data.name.trim(),
      mosqueName: data.mosqueName.trim(),
      city: data.city.trim(),
      updatedAt: serverTimestamp()
    });

    // Automatically grant the creating admin teacher access
    const currentAssigned = teacher.halaqaIds || [];
    if (!currentAssigned.includes(halaqaId)) {
      const updatedAssigned = [...currentAssigned, halaqaId];
      const teacherRef = doc(db, 'teachers', currentUser.uid);
      batch.update(teacherRef, {
        halaqaIds: updatedAssigned,
        updatedAt: serverTimestamp()
      });
    }

    try {
      await batch.commit();
      setSelectedHalaqaId(halaqaId);
      showToast(`تم إنشاء "${data.name}" بنجاح ✨`);
      triggerCelebration();
      return halaqaId;
    } catch (error) {
      handleOperationError(error, undefined, 'فشل إنشاء الحلقة في السحابة');
      return null;
    }
  };

  // Update Halaqa (Admin only)
  const updateHalaqa = async (id: string, data: Partial<Halaqa>) => {
    if (teacher.role !== 'admin' || !teacher.active) {
      showToast('غير مصرح لك بتعديل الحلقة', 'error');
      return;
    }

    const prevHalaqas = halaqas;
    setHalaqasState(prev => prev.map(h => h.id === id ? { ...h, ...data } : h));

    try {
      const batch = writeBatch(db);
      batch.update(doc(db, 'halaqas', id), {
        ...data,
        updatedAt: serverTimestamp()
      });

      if (data.name || data.mosqueName || data.city) {
        batch.set(doc(db, 'settings', id), {
          ...(data.name && { circleName: data.name }),
          ...(data.mosqueName && { mosqueName: data.mosqueName }),
          ...(data.city && { city: data.city }),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      await batch.commit();
      showToast('تم تحديث بيانات الحلقة بنجاح');
    } catch (error) {
      handleOperationError(error, () => setHalaqasState(prevHalaqas), 'تعذر تحديث بيانات الحلقة');
    }
  };

  // Toggle Halaqa status (Admin only)
  const toggleHalaqaStatus = async (id: string, isActive: boolean) => {
    if (teacher.role !== 'admin' || !teacher.active) {
      showToast('غير مصرح لك بتغيير حالة الحلقة', 'error');
      return;
    }

    const prevHalaqas = halaqas;
    setHalaqasState(prev => prev.map(h => h.id === id ? { ...h, isActive } : h));

    try {
      await updateDoc(doc(db, 'halaqas', id), {
        isActive,
        updatedAt: serverTimestamp()
      });
      showToast(isActive ? 'تم تفعيل الحلقة بنجاح' : 'تم تعطيل الحلقة');
    } catch (error) {
      handleOperationError(error, () => setHalaqasState(prevHalaqas), 'تعذر تغيير حالة الحلقة');
    }
  };

  // Assign Teacher Halaqas (Admin only)
  const assignTeacherHalaqas = async (teacherId: string, halaqaIds: string[], defaultHalaqaId?: string) => {
    if (teacher.role !== 'admin' || !teacher.active) {
      showToast('غير مصرح لك بإسناد الحلقات للمعلمين', 'error');
      return;
    }

    try {
      const payload: Record<string, any> = {
        halaqaIds,
        updatedAt: serverTimestamp()
      };
      if (defaultHalaqaId) {
        payload.defaultHalaqaId = defaultHalaqaId;
      }
      await updateDoc(doc(db, 'teachers', teacherId), payload);

      if (teacherId === currentUser?.uid) {
        setTeacherState(prev => ({
          ...prev,
          halaqaIds,
          ...(defaultHalaqaId && { defaultHalaqaId })
        }));
      }
      showToast('تم تحديث تعيينات المعلم بنجاح ✅');
    } catch (error) {
      handleOperationError(error, undefined, 'تعذر تحديث تعيينات المعلم');
    }
  };

  // Add student
  const addStudent = async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'active' | 'deleted'>) => {
    if (!selectedHalaqaId) {
      showToast('يرجى تحديد الحلقة أولاً قبل إضافة الطالب', 'error');
      return;
    }

    if (teacher.role !== 'admin' && !(teacher.halaqaIds || []).includes(selectedHalaqaId)) {
      showToast('غير مصرح لك بإضافة طالب في هذه الحلقة', 'error');
      return;
    }

    const studentId = uuidv4();
    const activeHalaqaId = selectedHalaqaId;

    const newStudentDoc: Student = {
      id: studentId,
      halaqaId: activeHalaqaId,
      name: studentData.name.trim(),
      age: Number(studentData.age) || 10,
      guardianName: (studentData.guardianName || studentData.name).trim(),
      guardianPhone: (studentData.guardianPhone || studentData.parentPhone || '').trim(),
      level: studentData.level || studentData.group || 'المستوى الأول (جزء عم)',
      status: studentData.status || 'نشط',
      currentSurah: Number(studentData.currentSurah || studentData.currentSurahNumber || 1),
      currentVerse: Number(studentData.currentVerse || studentData.currentAyah || 1),
      targetDailyAmount: Number(studentData.targetDailyAmount || studentData.targetDailyPages || 1),
      totalJuz: Number(studentData.totalJuz ?? studentData.completedJuz ?? 0),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser?.uid || 'teacher',
      active: true,
      deleted: false,

      // UI Aliases
      group: studentData.level || studentData.group || 'المستوى الأول (جزء عم)',
      parentPhone: (studentData.guardianPhone || studentData.parentPhone || '').trim(),
      currentSurahNumber: Number(studentData.currentSurah || studentData.currentSurahNumber || 1),
      currentAyah: Number(studentData.currentVerse || studentData.currentAyah || 1),
      completedJuz: Number(studentData.totalJuz ?? studentData.completedJuz ?? 0),
      targetDailyPages: Number(studentData.targetDailyAmount || studentData.targetDailyPages || 1),
      notes: studentData.notes || '',
      avatarSeed: studentData.avatarSeed || `std_${studentData.name.slice(0, 2)}`
    };

    const prevStudents = allStudentsRaw;
    setAllStudentsRaw(prev => [newStudentDoc, ...prev]);

    try {
      await setDoc(doc(db, 'students', studentId), newStudentDoc);
      showToast(`تمت إضافة الطالب ${newStudentDoc.name} بنجاح`);
      triggerCelebration();
    } catch (error) {
      handleOperationError(error, () => setAllStudentsRaw(prevStudents), 'تعذر حفظ بيانات الطالب');
    }
  };

  // Update student
  const updateStudent = async (id: string, updatedData: Partial<Student>) => {
    const prevStudents = allStudentsRaw;
    setAllStudentsRaw(prev => prev.map(s => {
      if (s.id !== id) return s;
      return {
        ...s,
        ...updatedData,
        ...(updatedData.group && { level: updatedData.group }),
        ...(updatedData.parentPhone && { guardianPhone: updatedData.parentPhone }),
        ...(updatedData.currentSurahNumber !== undefined && { currentSurah: updatedData.currentSurahNumber }),
        ...(updatedData.currentAyah !== undefined && { currentVerse: updatedData.currentAyah }),
        ...(updatedData.completedJuz !== undefined && { totalJuz: updatedData.completedJuz }),
        ...(updatedData.targetDailyPages !== undefined && { targetDailyAmount: updatedData.targetDailyPages })
      };
    }));

    try {
      const updatePayload: Record<string, any> = {
        ...updatedData,
        updatedAt: serverTimestamp()
      };

      if (updatedData.group) updatePayload.level = updatedData.group;
      if (updatedData.parentPhone) updatePayload.guardianPhone = updatedData.parentPhone;
      if (updatedData.currentSurahNumber !== undefined) updatePayload.currentSurah = updatedData.currentSurahNumber;
      if (updatedData.currentAyah !== undefined) updatePayload.currentVerse = updatedData.currentAyah;
      if (updatedData.completedJuz !== undefined) updatePayload.totalJuz = updatedData.completedJuz;
      if (updatedData.targetDailyPages !== undefined) updatePayload.targetDailyAmount = updatedData.targetDailyPages;

      await updateDoc(doc(db, 'students', id), updatePayload);
      showToast('تم تحديث بيانات الطالب بنجاح');
    } catch (error) {
      handleOperationError(error, () => setAllStudentsRaw(prevStudents), 'تعذر تحديث بيانات الطالب');
    }
  };

  // Soft Delete student
  const deleteStudent = async (id: string) => {
    const student = allStudentsRaw.find(s => s.id === id);
    const prevStudents = allStudentsRaw;
    setAllStudentsRaw(prev => prev.map(s => s.id === id ? { ...s, deleted: true, active: false } : s));

    try {
      await updateDoc(doc(db, 'students', id), {
        deleted: true,
        active: false,
        updatedAt: serverTimestamp()
      });
      showToast(`تم حذف الطالب ${student?.name || ''} بنجاح`, 'warning');
    } catch (error) {
      handleOperationError(error, () => setAllStudentsRaw(prevStudents), 'تعذر حذف الطالب');
    }
  };

  // Add daily record
  const addDailyRecord = async (recordData: Omit<MemorizationRecord, 'id' | 'createdAt' | 'updatedAt' | 'deviceId' | 'deleted' | 'teacherId'> & { date?: string }) => {
    if (!selectedHalaqaId) {
      showToast('يرجى تحديد الحلقة أولاً', 'error');
      return;
    }

    if (teacher.role !== 'admin' && !(teacher.halaqaIds || []).includes(selectedHalaqaId)) {
      showToast('غير مصرح لك بتسجيل تسميع في هذه الحلقة', 'error');
      return;
    }

    const recordId = uuidv4();
    const today = recordData.date || new Date().toISOString().split('T')[0];
    const activeHalaqaId = selectedHalaqaId;

    const newRecordDoc: MemorizationRecord = {
      id: recordId,
      halaqaId: activeHalaqaId,
      studentId: recordData.studentId,
      teacherId: currentUser?.uid || teacher.id,
      date: today,
      surahNumber: Number(recordData.surahNumber),
      fromVerse: Number(recordData.fromVerse ?? recordData.fromAyah ?? 1),
      toVerse: Number(recordData.toVerse ?? recordData.toAyah ?? 1),
      recordType: recordData.recordType || recordData.type || 'حفظ جديد',
      rating: recordData.rating || recordData.grade || 'ممتاز',
      mistakesCount: Number(recordData.mistakesCount || 0),
      alertsCount: Number(recordData.alertsCount || 0),
      hesitationCount: Number(recordData.hesitationCount ?? recordData.hesitationsCount ?? 0),
      notes: recordData.notes || recordData.teacherNotes || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      deviceId: deviceIdRef.current,
      deleted: false,

      // UI Aliases
      type: recordData.recordType || recordData.type || 'حفظ جديد',
      grade: recordData.rating || recordData.grade || 'ممتاز',
      fromAyah: Number(recordData.fromVerse ?? recordData.fromAyah ?? 1),
      toAyah: Number(recordData.toVerse ?? recordData.toAyah ?? 1),
      hesitationsCount: Number(recordData.hesitationCount ?? recordData.hesitationsCount ?? 0),
      teacherNotes: recordData.notes || recordData.teacherNotes || ''
    };

    const prevRecords = allRecordsRaw;
    const prevStudents = allStudentsRaw;

    setAllRecordsRaw(prev => [newRecordDoc, ...prev]);

    // Auto mark attendance
    setAttendanceState(prev => {
      const exists = prev.find(a => a.studentId === recordData.studentId && a.date === today);
      if (exists) {
        return prev.map(a => a.id === exists.id ? { ...a, status: 'حاضر' as AttendanceStatus } : a);
      }
      return [...prev, {
        id: `att-${Date.now()}`,
        studentId: recordData.studentId,
        date: today,
        status: 'حاضر' as AttendanceStatus
      }];
    });

    // Advance student progress locally
    if (newRecordDoc.recordType === 'حفظ جديد') {
      setAllStudentsRaw(prev => prev.map(s => {
        if (s.id !== recordData.studentId) return s;
        return {
          ...s,
          currentSurah: newRecordDoc.surahNumber,
          currentVerse: newRecordDoc.toVerse,
          currentSurahNumber: newRecordDoc.surahNumber,
          currentAyah: newRecordDoc.toVerse
        };
      }));
    }

    try {
      await setDoc(doc(db, 'memorization_records', recordId), newRecordDoc);

      if (newRecordDoc.recordType === 'حفظ جديد') {
        const studentDocRef = doc(db, 'students', recordData.studentId);
        try {
          await updateDoc(studentDocRef, {
            currentSurah: newRecordDoc.surahNumber,
            currentVerse: newRecordDoc.toVerse,
            currentSurahNumber: newRecordDoc.surahNumber,
            currentAyah: newRecordDoc.toVerse,
            updatedAt: serverTimestamp()
          });
        } catch (e) {
          console.warn('Could not advance student in cloud:', e);
        }
      }

      if (newRecordDoc.rating === 'ممتاز') {
        triggerCelebration();
      }
      showToast('تم تسجيل التسميع بنجاح ✅');
    } catch (error) {
      handleOperationError(error, () => {
        setAllRecordsRaw(prevRecords);
        setAllStudentsRaw(prevStudents);
      }, 'تعذر حفظ سجل التسميع');
    }
  };

  // Soft Delete daily record
  const deleteDailyRecord = async (id: string) => {
    const prevRecords = allRecordsRaw;
    setAllRecordsRaw(prev => prev.filter(r => r.id !== id));

    try {
      await updateDoc(doc(db, 'memorization_records', id), {
        deleted: true,
        updatedAt: serverTimestamp()
      });
      showToast('تم حذف السجل', 'info');
    } catch (error) {
      handleOperationError(error, () => setAllRecordsRaw(prevRecords), 'تعذر حذف السجل');
    }
  };

  const setStudentAttendance = (studentId: string, status: AttendanceStatus, reason?: string) => {
    const today = new Date().toISOString().split('T')[0];
    setAttendanceState(prev => {
      const index = prev.findIndex(a => a.studentId === studentId && a.date === today);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = { ...updated[index], status, reason };
        return updated;
      }
      return [...prev, {
        id: `att-${Date.now()}`,
        studentId,
        date: today,
        status,
        reason
      }];
    });
    showToast(`تم تسجيل الحضور: ${status}`);
  };

  // Update Settings in Firestore (per halaqa)
  const updateSettings = async (newSettings: Partial<CircleSettings>) => {
    const settingDocId = selectedHalaqaId || 'circle_settings';
    try {
      const settingsRef = doc(db, 'settings', settingDocId);
      await setDoc(settingsRef, {
        ...settings,
        ...newSettings,
        id: settingDocId,
        halaqaId: selectedHalaqaId,
        updatedAt: serverTimestamp()
      }, { merge: true });

      setSettingsState(prev => ({ ...prev, ...newSettings }));
      showToast('تم حفظ إعدادات الحلقة في السحابة بنجاح');
    } catch (error) {
      handleOperationError(error, undefined, 'تعذر حفظ الإعدادات');
    }
  };

  // Reset / Seed Initial Data (Admin only)
  const resetAllData = async () => {
    if (teacher.role !== 'admin' || !teacher.active) {
      showToast('خاص بالمشرف العام فقط', 'error');
      return;
    }

    try {
      const batch = writeBatch(db);

      for (const h of INITIAL_HALAQAS) {
        const hRef = doc(db, 'halaqas', h.id);
        batch.set(hRef, {
          ...h,
          createdBy: currentUser?.uid || 'admin',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });

        const sRef = doc(db, 'settings', h.id);
        batch.set(sRef, {
          ...INITIAL_SETTINGS,
          id: h.id,
          halaqaId: h.id,
          circleName: h.name,
          mosqueName: h.mosqueName,
          city: h.city,
          updatedAt: serverTimestamp()
        });
      }

      await batch.commit();
      setSelectedHalaqaId('halaqa-1');
      showToast('تمت استعادة وتهيئة بيانات الحلقات بنجاح', 'info');
    } catch (error) {
      handleOperationError(error, undefined, 'تعذر استعادة البيانات الأولية');
    }
  };

  // Helper for batch execution in chunks of <= 400 operations
  const commitInChunks = async (operations: Array<(batch: WriteBatch) => void>) => {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < operations.length; i += CHUNK_SIZE) {
      const batch = writeBatch(db);
      const slice = operations.slice(i, i + CHUNK_SIZE);
      slice.forEach(op => op(batch));
      await batch.commit();
    }
  };

  // Admin Manual Migration Engine (Idempotent, Safe, Batches <= 400)
  const runManualMigration = async () => {
    if (teacher.role !== 'admin' || !teacher.active || !currentUser) {
      showToast('خاص بالمشرف العام المصرح فقط', 'error');
      return;
    }

    const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
      const time = new Date().toLocaleTimeString('ar-SA');
      setMigrationStatus(prev => ({
        ...prev,
        logs: [...prev.logs, { timestamp: time, message, type }]
      }));
    };

    setMigrationStatus({
      isRunning: true,
      progress: 5,
      totalSteps: 5,
      currentStep: 1,
      logs: [],
      summary: null,
      error: null,
      isCompleted: false
    });

    addLog('بدء فحص وتدقيق هيكل قاعدة البيانات للترقية إلى نظام الحلقات المتعددة...', 'info');

    try {
      // Step 0: Check idempotency via migration completion document
      const migrationDocRef = doc(db, 'migrations', 'multi_halaqa_v1');
      const migrationSnap = await getDoc(migrationDocRef);

      if (migrationSnap.exists() && migrationSnap.data()?.status === 'completed') {
        addLog('تم فحص سجل الترقية: العملية تم تنفيذها مسبقاً بنجاح (النظام محدث ومكتمل ولا يلزم تكرارها).', 'info');
        setMigrationStatus(prev => ({
          ...prev,
          progress: 100,
          currentStep: 5,
          isRunning: false,
          isCompleted: true
        }));
        showToast('تمت ترقية قاعدة البيانات مسبقاً بنجاح ✅');
        return;
      }

      // Step 1: Create exactly one default halaqa (halaqa-1: حلقة الإمام الشاطبي للتحفيظ)
      addLog('الخطوة 1/5: فحص وإنشاء الحلقة الافتراضية الرئيسية (حلقة الإمام الشاطبي للتحفيظ)...', 'info');
      const primaryHalaqaRef = doc(db, 'halaqas', 'halaqa-1');
      const primaryHalaqaSnap = await getDoc(primaryHalaqaRef);
      let halaqasCreated = 0;

      if (!primaryHalaqaSnap.exists()) {
        const defaultHalaqa: Halaqa = {
          id: 'halaqa-1',
          name: 'حلقة الإمام الشاطبي للتحفيظ',
          mosqueName: settings.mosqueName || 'جامع الهدى الكبير',
          city: settings.city || 'الرياض',
          description: 'الحلقة الافتراضية الرئيسية لتحفيظ القرآن الكريم',
          isActive: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          createdBy: currentUser.uid
        };

        const batch = writeBatch(db);
        batch.set(primaryHalaqaRef, defaultHalaqa);
        batch.set(doc(db, 'settings', 'halaqa-1'), {
          ...settings,
          id: 'halaqa-1',
          halaqaId: 'halaqa-1',
          circleName: 'حلقة الإمام الشاطبي للتحفيظ',
          mosqueName: settings.mosqueName || 'جامع الهدى الكبير',
          city: settings.city || 'الرياض',
          updatedAt: serverTimestamp()
        });
        await batch.commit();
        halaqasCreated = 1;
        addLog('تم إنشاء الحلقة الافتراضية الرئيسية (halaqa-1) بنجاح.', 'success');
      } else {
        addLog('الحلقة الافتراضية الرئيسية (halaqa-1) موجودة مسبقاً.', 'info');
      }

      setMigrationStatus(prev => ({ ...prev, progress: 30, currentStep: 2 }));

      // Step 2: Migrate unassigned students (without halaqaId) to halaqa-1 in batches <= 400
      addLog('الخطوة 2/5: فحص وتحديث الطلاب غير المرتبطين بحلقة...', 'info');
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentOps: Array<(batch: WriteBatch) => void> = [];
      let studentsUpdated = 0;

      studentsSnap.forEach(docSnap => {
        const sData = docSnap.data();
        if (!sData.halaqaId) {
          studentOps.push((batch) => {
            batch.update(doc(db, 'students', docSnap.id), {
              halaqaId: 'halaqa-1',
              updatedAt: serverTimestamp()
            });
          });
          studentsUpdated++;
        }
      });

      if (studentOps.length > 0) {
        await commitInChunks(studentOps);
        addLog(`تم ربط ${studentsUpdated} طالب بالحلقة الافتراضية (halaqa-1).`, 'success');
      } else {
        addLog('جميع الطلاب مرتبطون بحلقات صحيحة مسبقاً.', 'info');
      }

      setMigrationStatus(prev => ({ ...prev, progress: 60, currentStep: 3 }));

      // Step 3: Migrate unassigned records (without halaqaId) to halaqa-1 in batches <= 400
      addLog('الخطوة 3/5: فحص وتحديث سجلات التسميع والتقييم...', 'info');
      const recordsSnap = await getDocs(collection(db, 'memorization_records'));
      const recordOps: Array<(batch: WriteBatch) => void> = [];
      let recordsUpdated = 0;

      recordsSnap.forEach(docSnap => {
        const rData = docSnap.data();
        if (!rData.halaqaId) {
          recordOps.push((batch) => {
            batch.update(doc(db, 'memorization_records', docSnap.id), {
              halaqaId: 'halaqa-1',
              updatedAt: serverTimestamp()
            });
          });
          recordsUpdated++;
        }
      });

      if (recordOps.length > 0) {
        await commitInChunks(recordOps);
        addLog(`تم تحديث ${recordsUpdated} سجل تسميع وإسنادها للحلقة (halaqa-1).`, 'success');
      } else {
        addLog('جميع سجلات التسميع مرتبطة بحلقات صحيحة.', 'info');
      }

      setMigrationStatus(prev => ({ ...prev, progress: 80, currentStep: 4 }));

      // Step 4: Update teachers assignments (preserve existing halaqaIds; if missing, assign ONLY ['halaqa-1'])
      addLog('الخطوة 4/5: فحص وتحديث ملفات المعلمين غير المعينين...', 'info');
      const teachersSnap = await getDocs(collection(db, 'teachers'));
      const teacherOps: Array<(batch: WriteBatch) => void> = [];
      let teachersUpdated = 0;

      teachersSnap.forEach(docSnap => {
        const tData = docSnap.data();
        const existingHalaqaIds = Array.isArray(tData.halaqaIds) ? tData.halaqaIds : [];
        const needsHalaqaIds = existingHalaqaIds.length === 0;
        const needsDefault = !tData.defaultHalaqaId;

        if (needsHalaqaIds || needsDefault) {
          teacherOps.push((batch) => {
            batch.update(doc(db, 'teachers', docSnap.id), {
              ...(needsHalaqaIds && { halaqaIds: ['halaqa-1'] }),
              ...(needsDefault && { defaultHalaqaId: existingHalaqaIds[0] || 'halaqa-1' }),
              updatedAt: serverTimestamp()
            });
          });
          teachersUpdated++;
        }
      });

      if (teacherOps.length > 0) {
        await commitInChunks(teacherOps);
        addLog(`تم تحديث إسنادات ${teachersUpdated} معلم.`, 'success');
      } else {
        addLog('بيانات المعلمين وصلاحيات الحلقات محدثة وصحيحة مسبقاً.', 'info');
      }

      // Step 5: Save migration completion record for idempotency
      await setDoc(migrationDocRef, {
        id: 'multi_halaqa_v1',
        completedAt: serverTimestamp(),
        completedBy: currentUser.uid,
        status: 'completed',
        summary: {
          halaqasCreated,
          studentsUpdated,
          recordsUpdated,
          teachersUpdated
        }
      });

      setMigrationStatus(prev => ({
        ...prev,
        progress: 100,
        currentStep: 5,
        isRunning: false,
        isCompleted: true,
        summary: {
          halaqasCreated,
          studentsUpdated,
          recordsUpdated,
          teachersUpdated
        }
      }));

      addLog('الخطوة 5/5: اكتملت عملية الترقية والمزامنة بنجاح تام! 🎉', 'success');
      setSelectedHalaqaId('halaqa-1');
      triggerCelebration();
      showToast('اكتملت ترقية قاعدة البيانات لنظام الحلقات المتعددة بنجاح ✅');
    } catch (err: any) {
      console.error('Migration error:', err);
      const errMsg = err.message || 'حدث خطأ غير متوقع أثناء الترقية.';
      addLog(`فشل الترقية: ${errMsg}`, 'error');
      setMigrationStatus(prev => ({
        ...prev,
        isRunning: false,
        error: errMsg
      }));
      handleOperationError(err, undefined, errMsg);
    }
  };

  // JSON Export
  const exportBackupData = (): string => {
    const backup = {
      exportDate: new Date().toISOString(),
      version: '2.0-multi-halaqa',
      selectedHalaqa: selectedHalaqa?.name,
      halaqas,
      students: allStudentsRaw,
      dailyRecords: allRecordsRaw,
      attendance,
      settings
    };
    return JSON.stringify(backup, null, 2);
  };

  // JSON Import with Multi-Halaqa Support
  const importBackupData = async (jsonStr: string): Promise<{ success: boolean; message: string; duplicateCount?: number }> => {
    if (teacher.role !== 'admin' || !teacher.active) {
      return { success: false, message: 'استيراد البيانات متاح للمشرف العام فقط.' };
    }

    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || (!Array.isArray(parsed.students) && !Array.isArray(parsed.dailyRecords))) {
        return { success: false, message: 'ملف النسخة الاحتياطية غير صالح أو تالف.' };
      }

      const incomingStudents: Student[] = Array.isArray(parsed.students) ? parsed.students : [];
      const incomingRecords: MemorizationRecord[] = Array.isArray(parsed.dailyRecords) ? parsed.dailyRecords : [];

      const activeHalaqaId = selectedHalaqaId || 'halaqa-1';
      const ops: Array<(batch: WriteBatch) => void> = [];

      let duplicateStudents = 0;
      let newStudentsCount = 0;

      for (const std of incomingStudents) {
        const existing = allStudentsRaw.find(s => s.id === std.id || (s.name.trim() === std.name.trim() && s.halaqaId === (std.halaqaId || activeHalaqaId)));
        if (existing) {
          duplicateStudents++;
        } else {
          const stdId = std.id || uuidv4();
          ops.push((batch) => {
            const stdRef = doc(db, 'students', stdId);
            batch.set(stdRef, {
              ...std,
              id: stdId,
              halaqaId: std.halaqaId || activeHalaqaId,
              createdBy: currentUser?.uid || 'imported',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              active: true,
              deleted: false
            });
          });
          newStudentsCount++;
        }
      }

      let newRecordsCount = 0;
      for (const rec of incomingRecords) {
        const existing = allRecordsRaw.find(r => r.id === rec.id);
        if (!existing) {
          const recId = rec.id || uuidv4();
          ops.push((batch) => {
            const recRef = doc(db, 'memorization_records', recId);
            batch.set(recRef, {
              ...rec,
              id: recId,
              halaqaId: rec.halaqaId || activeHalaqaId,
              teacherId: currentUser?.uid || rec.teacherId || 'imported',
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
              deleted: false
            });
          });
          newRecordsCount++;
        }
      }

      if (ops.length > 0) {
        await commitInChunks(ops);
      }

      const message = `تم استيراد ${newStudentsCount} طالب جديد، و${newRecordsCount} سجل تسميع بنجاح.` +
        (duplicateStudents > 0 ? ` (تم تخطي ${duplicateStudents} طلاب موجودين مسبقاً لتجنب التكرار).` : '');

      showToast(message, duplicateStudents > 0 ? 'warning' : 'success');
      return { success: true, message, duplicateCount: duplicateStudents };
    } catch (err: any) {
      return { success: false, message: `فشل استيراد البيانات: ${err.message}` };
    }
  };

  const getStudentRecords = (studentId: string) => {
    return allRecordsRaw.filter(r => r.studentId === studentId);
  };

  const getStudentAttendance = (studentId: string) => {
    return attendance.filter(a => a.studentId === studentId);
  };

  const getTodayRecordForStudent = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return allRecordsRaw.find(r => r.studentId === studentId && r.date === today);
  };

  const getTodayAttendanceForStudent = (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return attendance.find(a => a.studentId === studentId && a.date === today);
  };

  return (
    <AppContext.Provider
      value={{
        currentScreen,
        setCurrentScreen,
        previousScreen,
        currentUser,
        isAuthLoading,
        authError,
        setAuthError,
        teacher,
        isAdmin,
        loginWithEmail,
        logout,
        halaqas: enrichedHalaqas,
        isHalaqasLoading,
        selectedHalaqaId,
        selectedHalaqa,
        setSelectedHalaqaId,
        createHalaqa,
        updateHalaqa,
        toggleHalaqaStatus,
        teachersList,
        assignTeacherHalaqas,
        students,
        allStudents: allStudentsRaw,
        isStudentsLoading,
        addStudent,
        updateStudent,
        deleteStudent,
        dailyRecords,
        allDailyRecords: allRecordsRaw,
        isRecordsLoading,
        addDailyRecord,
        deleteDailyRecord,
        attendance,
        setStudentAttendance,
        settings,
        updateSettings,
        resetAllData,
        migrationStatus,
        runManualMigration,
        syncStatus,
        syncStatusLabel,
        selectedStudentForRecord,
        setSelectedStudentForRecord,
        selectedStudentForDetail,
        setSelectedStudentForDetail,
        editingStudent,
        setEditingStudent,
        isAddStudentModalOpen,
        setIsAddStudentModalOpen,
        deviceViewMode,
        setDeviceViewMode,
        isCodeInspectorOpen,
        setIsCodeInspectorOpen,
        toasts,
        showToast,
        triggerCelebration,
        exportBackupData,
        importBackupData,
        getStudentRecords,
        getStudentAttendance,
        getTodayRecordForStudent,
        getTodayAttendanceForStudent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
