// Firebase project setup. Reads config from environment variables (see
// .env.example) rather than hardcoding it, so real keys never get pasted
// directly into a file that might get shared or committed.
//
// These values aren't "secret" the way a server API key is — they're
// meant to end up in the browser bundle, and Firebase's actual security
// comes from the Firestore/Auth rules on the project (see
// firestore.rules.example) — but keeping them in .env still makes it easy
// to swap projects (e.g. a personal test project vs. the real one)
// without touching code.
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missingKeys = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingKeys.length > 0) {
  console.warn(
    `Firebase config is missing: ${missingKeys.join(", ")}. ` +
      "Copy .env.example to .env and fill in your project's values " +
      "(Firebase Console → Project Settings → General → Your apps → SDK setup and configuration).",
  );
}

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
