import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { 
  auth, db, doc, onSnapshot, setDoc, serverTimestamp, 
  collection, query, orderBy, limit 
} from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

interface UserProfile {
  xp: number;
  lvl: number;
  soulResonance: number;
  stoicEquilibrium: number;
  poeticResonance: number;
  subconsciousDepth: number;
}

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthorized: boolean;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Strict Authorization Check
        const authorizedEmail = 'mumblejinx@gmail.com';
        if (currentUser.email === authorizedEmail && currentUser.emailVerified) {
          setIsAuthorized(true);
          
          // Sync with Firestore Profile
          const userRef = doc(db, 'users', currentUser.uid);
          const unsubscribeProfile = onSnapshot(userRef, (snapshot) => {
            if (snapshot.exists()) {
              setProfile(snapshot.data() as UserProfile);
            } else {
              // Initialize profile for the first time
              const initialProfile: UserProfile = {
                xp: 14202,
                lvl: 42,
                soulResonance: 84,
                stoicEquilibrium: 14,
                poeticResonance: 88,
                subconsciousDepth: 92
              };
              setDoc(userRef, {
                ...initialProfile,
                lastUpdated: serverTimestamp()
              });
              setProfile(initialProfile);
            }
          });
          
          setLoading(false);
          return () => unsubscribeProfile();
        } else {
          setIsAuthorized(false);
          setLoading(false);
        }
      } else {
        setIsAuthorized(false);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <FirebaseContext.Provider value={{ user, profile, loading, isAuthorized }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (context === undefined) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
