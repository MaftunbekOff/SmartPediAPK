import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  // Demo configuration - Replace with your actual Firebase project config
  apiKey: "AIzaSyCXKUPJWluFk2fDmF9Fu8w_jOpwfNWImGg",
  authDomain: "smartpedi-ddea6.firebaseapp.com",
  projectId: "smartpedi-ddea6",
  storageBucket: "smartpedi-ddea6.firebasestorage.app",
  messagingSenderId: "1085416880548",
  appId: "1:1085416880548:web:3c1e659558949c97a46931",
  measurementId: "G-JKQGD11CJS"
};

// Initialize Firebase app (avoid duplicate initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Set auth persistence asynchronously
(async () => {
  try {
    await auth.setPersistence(browserLocalPersistence);
  } catch (error) {
    console.warn('Failed to set auth persistence:', error);
  }
})();

// Enable offline persistence
// Commented out to prevent Firestore internal assertion failures
// enableMultiTabIndexedDbPersistence(db).catch((err) => {
//   if (err.code === 'failed-precondition') {
//     console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
//   } else if (err.code === 'unimplemented') {
//     console.warn('The current browser does not support all of the features required to enable persistence');
//   }
// });

export default app;