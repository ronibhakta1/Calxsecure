
import { getApps, initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: "calx-d05b2.firebasestorage.app",
  messagingSenderId: "675190342157",
  appId: "1:675190342157:web:b69e0beb329262039f0b44",
  measurementId: "G-DHJ7EF75QL"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export { auth, RecaptchaVerifier, signInWithPhoneNumber };