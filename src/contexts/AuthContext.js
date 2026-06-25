// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [studioProfile, setStudioProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, "studios", firebaseUser.uid));
        if (snap.exists()) setStudioProfile(snap.data());
      } else {
        setStudioProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const register = async (email, password, studioName, ownerName) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: ownerName });
    const profile = { studioName, ownerName, email, createdAt: new Date().toISOString(), staff: [] };
    await setDoc(doc(db, "studios", cred.user.uid), profile);
    setStudioProfile(profile);
    return cred;
  };

  const logout = () => signOut(auth);

  const updateStudioProfile = async (data) => {
    if (!user) return;
    await setDoc(doc(db, "studios", user.uid), data, { merge: true });
    setStudioProfile((p) => ({ ...p, ...data }));
  };

  return (
    <AuthContext.Provider value={{ user, studioProfile, loading, login, register, logout, updateStudioProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
