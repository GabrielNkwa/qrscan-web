/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { onAuthStateChanged, type User, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../constants/firebase';

export type UserTier = 'free' | 'pro';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  tier: UserTier;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  tier: 'free',
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tier, setTier] = useState<UserTier>('free');
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[AuthContext] Error signing out:', error);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        setLoading(false);
      }
    }, 5000);

    let unsubscribeTier: (() => void) | undefined;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      clearTimeout(timeoutId);
      setUser(user);
      
      if (unsubscribeTier) {
        unsubscribeTier();
      }

      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        unsubscribeTier = onSnapshot(userDocRef, (doc) => {
          if (doc.exists()) {
            const userData = doc.data();
            setTier(userData.tier || 'free');
          } else {
            setTier('free');
          }
          setLoading(false);
        }, (error) => {
          console.error('[AuthContext] Error fetching user tier:', error);
          setTier('free');
          setLoading(false);
        });
      } else {
        setTier('free');
        setLoading(false);
      }
    }, (error) => {
      console.error('[AuthContext] Auth state change error:', error);
      clearTimeout(timeoutId);
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeTier) {
        unsubscribeTier();
      }
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, tier, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
