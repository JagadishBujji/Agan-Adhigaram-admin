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
  apiKey: 'AIzaSyDr_wZ9St7J_Z4KZ-HTGScqcFmFx8T-5z8',
  authDomain: 'daily-meat-f3130.firebaseapp.com',
  projectId: 'daily-meat-f3130',
  storageBucket: 'daily-meat-f3130.appspot.com',
  messagingSenderId: '39895609246',
  appId: '1:39895609246:web:bee6a7199c73f67f7ff08f',
  measurementId: 'G-T1QN4R52Q6',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const authentication = getAuth(app);
authentication.useDeviceLanguage();
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);
