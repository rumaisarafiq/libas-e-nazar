import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/config";

const AuthContext = createContext(null);

// Firebase auth error codes -> friendly messages. Firebase throws errors
// like "Firebase: Error (auth/email-already-in-use)." — not something to
// show a person directly.
function friendlyAuthError(err) {
  const code = err?.code || "";
  const map = {
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password must be at least 6 characters.",
    "auth/user-not-found": "Invalid email or password.",
    "auth/wrong-password": "Invalid email or password.",
    "auth/invalid-credential": "Invalid email or password.",
    "auth/too-many-requests":
      "Too many attempts — please wait a moment and try again.",
    "auth/network-request-failed":
      "Couldn't reach the server. Check your connection and try again.",
  };
  return map[code] || err?.message || "Something went wrong. Please try again.";
}

// Logs a signup/login/logout event to the "authHistory" collection in
// Firestore — a real, queryable record of session activity, not just a
// local log. Fire-and-forget: a logging failure shouldn't block the
// actual auth action from completing.
function logAuthEvent(type, { name, email, uid }) {
  addDoc(collection(db, "authHistory"), {
    type, // "signup" | "login" | "logout"
    name: name || null,
    email: email || null,
    uid: uid || null,
    timestamp: serverTimestamp(),
  }).catch((err) => console.error("Failed to log auth event:", err));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True once Firebase has told us whether someone's already logged in
  // (from a previous session) — avoids a flash of "logged out" UI while
  // that check is still in flight on page load.
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(
        firebaseUser
          ? {
              name: firebaseUser.displayName || firebaseUser.email,
              email: firebaseUser.email,
              uid: firebaseUser.uid,
            }
          : null,
      );
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  const signup = async ({ name, email, password }) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const session = { name, email, uid: cred.user.uid };
      setUser(session);
      logAuthEvent("signup", session);
      logAuthEvent("login", session);
      return session;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const login = async ({ email, password }) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const session = {
        name: cred.user.displayName || cred.user.email,
        email: cred.user.email,
        uid: cred.user.uid,
      };
      setUser(session);
      logAuthEvent("login", session);
      return session;
    } catch (err) {
      throw new Error(friendlyAuthError(err));
    }
  };

  const logout = async () => {
    if (user) logAuthEvent("logout", user);
    await signOut(auth);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, authReady }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
