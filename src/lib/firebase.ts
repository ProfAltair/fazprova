import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Exam } from '../types';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();

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
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Funções utilitárias do Firestore para Provas

export async function saveExam(exam: Omit<Exam, 'createdAt'>): Promise<void> {
  const path = `exams/${exam.id}`;
  try {
    const examRef = doc(db, 'exams', exam.id);
    await setDoc(examRef, {
      ...exam,
      createdAt: serverTimestamp()
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getExam(id: string): Promise<Exam | null> {
  const path = `exams/${id}`;
  try {
    const examRef = doc(db, 'exams', id);
    const snap = await getDoc(examRef);
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as Exam;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

export async function listUserExams(userId: string): Promise<Exam[]> {
  const path = 'exams';
  try {
    const q = query(
      collection(db, 'exams'),
      where('createdBy', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const exams: Exam[] = [];
    snap.forEach((doc) => {
      exams.push({ id: doc.id, ...doc.data() } as Exam);
    });
    return exams;
  } catch (error) {
    // Se falhar devido a índice ou qualquer outro motivo, tenta fallback sem ordenação
    try {
      const qFallback = query(
        collection(db, 'exams'),
        where('createdBy', '==', userId)
      );
      const snapFallback = await getDocs(qFallback);
      const exams: Exam[] = [];
      snapFallback.forEach((doc) => {
        exams.push({ id: doc.id, ...doc.data() } as Exam);
      });
      // Ordenação manual no cliente
      return exams.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
    } catch (fallbackError) {
      handleFirestoreError(fallbackError, OperationType.LIST, path);
      return [];
    }
  }
}

export async function deleteExam(id: string): Promise<void> {
  const path = `exams/${id}`;
  try {
    await deleteDoc(doc(db, 'exams', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function logout(): Promise<void> {
  await signOut(auth);
}
