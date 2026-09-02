// firebase.js — Firebase client SDK setup for sign-in (Google, Facebook,
// email/password). The backend never sees passwords — it only verifies the
// ID token Firebase hands us after a successful sign-in (see
// backend/src/middleware/firebase-auth.js).
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyA8gGiAg4QyPpwQlmvnxWlPvgsj_IAUt58',
  authDomain: 'tigertrigger-c1e0a.firebaseapp.com',
  projectId: 'tigertrigger-c1e0a',
  storageBucket: 'tigertrigger-c1e0a.firebasestorage.app',
  messagingSenderId: '248541254924',
  appId: '1:248541254924:web:4de83f5efd88bcfcefe529',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const googleProvider = new GoogleAuthProvider();
export const facebookProvider = new FacebookAuthProvider();
