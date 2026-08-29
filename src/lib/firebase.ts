import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  serverTimestamp,
  doc,
  getDocFromServer
} from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyB49noPlq7jXGZ12MMOw8ksV1fJ2SyNtmk",
  authDomain: "halaqa-management.firebaseapp.com",
  projectId: "halaqa-management",
  storageBucket: "halaqa-management.firebasestorage.app",
  messagingSenderId: "1092390635725",
  appId: "1:1092390635725:web:1902695b13d501ee4ec184"
};

// Prevent duplicate initialization during hot reload
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore with persistent offline cache and multi-tab support
let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch {
  // Fallback to existing instance if already initialized (e.g. during fast refresh)
  firestoreInstance = getFirestore(app);
}

export const db = firestoreInstance;
export { serverTimestamp };

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client is in offline cache mode.");
    }
    return false;
  }
}

export {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};
export type { User };
