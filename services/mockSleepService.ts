import AsyncStorage from '@react-native-async-storage/async-storage';
import { SleepEntry } from '../types/sleep';

export class SleepService {
  private static STORAGE_KEY = '@sleep_quest_entries';

  // Get all sleep entries from storage
  private static async getAllEntries(): Promise<SleepEntry[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading sleep entries:', error);
      return [];
    }
  }

  // Save all sleep entries to storage
  private static async saveAllEntries(entries: SleepEntry[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error('Error saving sleep entries:', error);
      throw new Error('Failed to save sleep entries');
    }
  }

  // Add new sleep entry
  static async addSleepEntry(
    userId: string,
    sleepData: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<SleepEntry> {
    try {
      const entries = await this.getAllEntries();
      const now = new Date().toISOString();

      const newEntry: SleepEntry = {
        ...sleepData,
        id: Date.now().toString(),
        userId,
        createdAt: now,
        updatedAt: now
      };

      entries.push(newEntry);
      await this.saveAllEntries(entries);

      return newEntry;
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
      const entries = await this.getAllEntries();
      const entryIndex = entries.findIndex(e => e.id === entryId);

      if (entryIndex === -1) {
        throw new Error('Sleep entry not found');
      }

      entries[entryIndex] = {
        ...entries[entryIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };

      await this.saveAllEntries(entries);
    } catch (error) {
      console.error('Error updating sleep entry:', error);
      throw new Error('Failed to update sleep entry');
    }
  }

  // Delete sleep entry
  static async deleteSleepEntry(entryId: string): Promise<void> {
    try {
      const entries = await this.getAllEntries();
      const filteredEntries = entries.filter(e => e.id !== entryId);
      await this.saveAllEntries(filteredEntries);
    } catch (error) {
      console.error('Error deleting sleep entry:', error);
      throw new Error('Failed to delete sleep entry');
    }
  }

  // Get all sleep entries for a user
  static async getUserSleepEntries(userId: string): Promise<SleepEntry[]> {
    try {
      const entries = await this.getAllEntries();
      return entries
        .filter(entry => entry.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } catch (error) {
      console.error('Error getting sleep entries:', error);
      throw new Error('Failed to load sleep entries');
    }
  }

  // Get sleep entries for multiple users (for leaderboard)
  static async getMultipleUsersSleepEntries(userIds: string[]): Promise<SleepEntry[]> {
    try {
      const entries = await this.getAllEntries();
      return entries
        .filter(entry => userIds.includes(entry.userId))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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

  // Update user sleep statistics (mock version - would normally update user profile)
  static async updateUserSleepStats(userId: string, entries: SleepEntry[]): Promise<void> {
    try {
      const stats = this.calculateSleepStats(entries);

      // In a real app, this would update the user's profile
      // For now, we'll just log the stats
      console.log(`Updated sleep stats for user ${userId}:`, stats);
    } catch (error) {
      console.error('Error updating user sleep stats:', error);
      throw new Error('Failed to update sleep statistics');
    }
  }
}