import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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

  // Load user from storage on app start
  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('@sleep_quest_user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('@sleep_quest_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  // Mock sign up - creates a local user account
  const signUp = async (email: string, password: string, username: string, displayName: string) => {
    try {
      // Check if user already exists in local storage
      const existingUsers = await AsyncStorage.getItem('@sleep_quest_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const userExists = users.find((u: any) => u.email === email || u.username === username.toLowerCase());
      if (userExists) {
        throw new Error('Email or username already exists');
      }

      const newUser: User = {
        id: Date.now().toString(), // Simple ID generation for demo
        email,
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

      // Save to users list
      users.push(newUser);
      await AsyncStorage.setItem('@sleep_quest_users', JSON.stringify(users));

      // Save as current user
      await saveUser(newUser);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create account');
    }
  };

  // Mock sign in - finds user in local storage
  const signIn = async (email: string, password: string) => {
    try {
      const existingUsers = await AsyncStorage.getItem('@sleep_quest_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const foundUser = users.find((u: any) => u.email === email);
      if (!foundUser) {
        throw new Error('User not found');
      }

      await saveUser(foundUser);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to sign in');
    }
  };

  // Sign out - remove from storage
  const signOut = async () => {
    try {
      console.log('SignOut: Starting sign out process...');
      await AsyncStorage.removeItem('@sleep_quest_user');
      console.log('SignOut: Removed user from storage');
      setUser(null);
      console.log('SignOut: Set user to null');
    } catch (error: any) {
      console.error('SignOut error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  };

  // Update user profile
  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    try {
      const updatedUser = { ...user, ...updates };

      // Update in users list
      const existingUsers = await AsyncStorage.getItem('@sleep_quest_users');
      const users = existingUsers ? JSON.parse(existingUsers) : [];
      const updatedUsers = users.map((u: any) =>
        u.id === user.id ? updatedUser : u
      );
      await AsyncStorage.setItem('@sleep_quest_users', JSON.stringify(updatedUsers));

      // Update current user
      await saveUser(updatedUser);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  };

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