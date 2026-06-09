import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import { googleProvider } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isDonor, setIsDonor] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Check donor status
        const donorSnap = await getDoc(doc(db, 'donors', currentUser.uid));
        setIsDonor(donorSnap.exists());
        
        // Check admin status
        const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
        setIsAdmin(adminSnap.exists());
      } else {
        setIsDonor(false);
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const donorSnap = await getDoc(doc(db, 'donors', result.user.uid));
      setIsDonor(donorSnap.exists());
      
      const adminSnap = await getDoc(doc(db, 'admins', result.user.uid));
      setIsAdmin(adminSnap.exists());
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const adminSnap = await getDoc(doc(db, 'admins', result.user.uid));
      setIsAdmin(adminSnap.exists());
      return { success: true };
    } catch (error) {
      console.error("Email login failed", error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, isDonor, isAdmin, loading, loginWithGoogle, loginWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
