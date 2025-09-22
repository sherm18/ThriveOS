import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { SleepEntry } from '../types/sleep';
import { User } from '../types/user';

export class SleepService {
  private static COLLECTION_NAME = 'sleepEntries';

  // Add new sleep entry
  static async addSleepEntry(
    userId: string,
    sleepData: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SleepEntry> {
    try {
      const now = new Date().toISOString();
      const entryData = {
        ...sleepData,
        userId,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.COLLECTION_NAME), entryData);

      return {
        id: docRef.id,
        ...entryData
      };
    } catch (error) {
      console.error('Error adding sleep entry:', error);
      throw new Error('Failed to add sleep entry');
    }
  }

  // Update existing sleep entry
  static async updateSleepEntry(
    entryId: string,
    updates: Partial<Omit<SleepEntry, 'id' | 'userId' | 'createdAt'>>
  ): Promise<void> {
    try {
      const updateData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(doc(db, this.COLLECTION_NAME, entryId), updateData);
    } catch (error) {
      console.error('Error updating sleep entry:', error);
      throw new Error('Failed to update sleep entry');
    }
  }

  // Delete sleep entry
  static async deleteSleepEntry(entryId: string): Promise<void> {
    try {
      await deleteDoc(doc(db, this.COLLECTION_NAME, entryId));
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      throw new Error('Failed to delete sleep entry');
    }
  }

  // Get all sleep entries for a user
  static async getUserSleepEntries(userId: string): Promise<SleepEntry[]> {
    try {
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const entries: SleepEntry[] = [];

      querySnapshot.forEach((doc) => {
        entries.push({
          id: doc.id,
          ...doc.data()
        } as SleepEntry);
      });

      return entries;
    } catch (error) {
      console.error('Error getting sleep entries:', error);
      throw new Error('Failed to load sleep entries');
    }
  }

  // Get sleep entries for multiple users (for leaderboard)
  static async getMultipleUsersSleepEntries(userIds: string[]): Promise<SleepEntry[]> {
    try {
      if (userIds.length === 0) return [];

      // Firestore 'in' queries are limited to 10 items, so we may need to batch
      const batches: SleepEntry[][] = [];

      for (let i = 0; i < userIds.length; i += 10) {
        const batch = userIds.slice(i, i + 10);
        const q = query(
          collection(db, this.COLLECTION_NAME),
          where('userId', 'in', batch),
          orderBy('date', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const batchEntries: SleepEntry[] = [];

        querySnapshot.forEach((doc) => {
          batchEntries.push({
            id: doc.id,
            ...doc.data()
          } as SleepEntry);
        });

        batches.push(batchEntries);
      }

      return batches.flat();
    } catch (error) {
      console.error('Error getting multiple users sleep entries:', error);
      throw new Error('Failed to load friends sleep data');
    }
  }

  // Calculate user sleep statistics
  static calculateSleepStats(entries: SleepEntry[]) {
    if (entries.length === 0) {
      return {
        totalNights: 0,
        averageScore: 0,
        currentStreak: 0,
        bestStreak: 0
      };
    }

    // Sort entries by date (newest first)
    const sortedEntries = [...entries].sort((a, b) => b.date.localeCompare(a.date));

    // Calculate average score
    const totalScore = entries.reduce((sum, entry) => sum + entry.score, 0);
    const averageScore = totalScore / entries.length;

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Check for consecutive days starting from most recent
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);

      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (entryDate.getTime() === expectedDate.getTime()) {
        tempStreak++;
        if (i === 0) currentStreak = tempStreak; // Still building current streak
      } else {
        if (tempStreak > bestStreak) bestStreak = tempStreak;
        tempStreak = 0;
        if (i === 0) currentStreak = 0; // Streak broken
      }
    }

    if (tempStreak > bestStreak) bestStreak = tempStreak;

    return {
      totalNights: entries.length,
      averageScore: Math.round(averageScore * 10) / 10,
      currentStreak,
      bestStreak
    };
  }

  // Update user sleep statistics in their profile
  static async updateUserSleepStats(userId: string, entries: SleepEntry[]): Promise<void> {
    try {
      const stats = this.calculateSleepStats(entries);

      await updateDoc(doc(db, 'users', userId), {
        sleepStats: stats
      });
    } catch (error) {
      console.error('Error updating user sleep stats:', error);
      throw new Error('Failed to update sleep statistics');
    }
  }
}