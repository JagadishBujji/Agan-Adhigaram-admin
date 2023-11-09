// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDqIaOupyookXUlQzuNGOja_m-vX02qdMc",
  authDomain: "agan-adhigaram.firebaseapp.com",
  projectId: "agan-adhigaram",
  storageBucket: "agan-adhigaram.appspot.com",
  messagingSenderId: "101879593712",
  appId: "1:101879593712:web:d2ba4c76f39375ecc12035",
  measurementId: "G-FTJECBXM60",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
auth.useDeviceLanguage();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
