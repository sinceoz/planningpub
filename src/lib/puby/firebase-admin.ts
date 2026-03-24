import { initializeApp, getApps, cert, type ServiceAccount, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';

function getAdminApp(): App {
  const existing = getApps().find(a => a.name === 'puby-admin');
  if (existing) return existing;

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  if (!serviceAccount.projectId) {
    throw new Error('FIREBASE_PROJECT_ID environment variable is required for Firebase Admin SDK');
  }

  return initializeApp({ credential: cert(serviceAccount) }, 'puby-admin');
}

let _adminAuth: Auth | undefined;
let _adminDb: Firestore | undefined;

export function getAdminAuth(): Auth {
  if (!_adminAuth) _adminAuth = getAuth(getAdminApp());
  return _adminAuth;
}

export function getAdminDb(): Firestore {
  if (!_adminDb) _adminDb = getFirestore(getAdminApp());
  return _adminDb;
}

// Lazy-init exports for backward compatibility
export const adminAuth = new Proxy({} as Auth, {
  get: (_, prop) => (getAdminAuth() as any)[prop],
});

export const adminDb = new Proxy({} as Firestore, {
  get: (_, prop) => (getAdminDb() as any)[prop],
});
