// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: 'AIzaSyDqIaOupyookXUlQzuNGOja_m-vX02qdMc',
  authDomain: 'agan-adhigaram.firebaseapp.com',
  projectId: 'agan-adhigaram',
  storageBucket: 'agan-adhigaram.appspot.com',
  messagingSenderId: '101879593712',
  appId: '1:101879593712:web:d2ba4c76f39375ecc12035',
  measurementId: 'G-FTJECBXM60',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage();
export const db = getFirestore(app);
// only the live site reports to Google Analytics (local and emulator runs skewed the numbers)
export const analytics =
  process.env.NODE_ENV === 'production' && process.env.REACT_APP_USE_EMULATOR !== 'true' ? getAnalytics(app) : null;
export const storage = getStorage(app);

// local testing - set REACT_APP_USE_EMULATOR=true in .env.development.local and
// run the firebase emulators from the backend repo, so production data is not touched
if (process.env.REACT_APP_USE_EMULATOR === 'true') {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
  // book cover uploads/deletes (getStorage() in BookModal returns this same default instance)
  connectStorageEmulator(storage, '127.0.0.1', 9199);
}

// API base URL for Cloud Functions
export const FUNCTIONS_BASE_URL =
  process.env.REACT_APP_USE_EMULATOR === 'true'
    ? 'http://127.0.0.1:5001/agan-adhigaram/us-central1'
    : 'https://us-central1-agan-adhigaram.cloudfunctions.net';
