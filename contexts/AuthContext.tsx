import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, AuthContextType } from '../types/user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if username is available
  const isUsernameAvailable = async (username: string): Promise<boolean> => {
    try {
      const usernameDoc = await getDoc(doc(db, 'usernames', username.toLowerCase()));
      return !usernameDoc.exists();
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (firebaseUser: FirebaseUser, username: string, displayName: string) => {
    const userProfile: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      username: username.toLowerCase(),
      displayName,
      createdAt: new Date().toISOString(),
      friends: [],
      friendRequests: {
        sent: [],
        received: []
      },
      sleepStats: {
        totalNights: 0,
        averageScore: 0,
        currentStreak: 0,
        bestStreak: 0
      }
    };

    // Save user profile
    await setDoc(doc(db, 'users', firebaseUser.uid), userProfile);

    // Reserve username
    await setDoc(doc(db, 'usernames', username.toLowerCase()), {
      userId: firebaseUser.uid,
      createdAt: new Date().toISOString()
    });

    return userProfile;
  };

  // Sign up new user
  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Check if username is available
      const available = await isUsernameAvailable(username);
      if (!available) {
        throw new Error('Username is already taken');
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);

      // Create user profile
      const userProfile = await createUserProfile(userCredential.user, username, displayName);
      setUser(userProfile);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Sign in existing user
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Sign out user
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };
      await updateDoc(doc(db, 'users', user.id), updates);
      setUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as User);
          } else {
            // User exists in Auth but not in Firestore - this shouldn't happen
            console.error('User not found in Firestore');
            await firebaseSignOut(auth);
          }
        } catch (error) {
          console.error('Error loading user profile:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};