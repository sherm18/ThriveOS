import { History, Moon, Trophy, BarChart3, Plus, Award, User, Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import ProgressCharts from '@/components/progress-charts';
import SleepHistory from '@/components/sleep-history';
import SleepEntryForm from '@/components/sleep-entry-form';
import BadgeCollection from '@/components/badge-collection';
import { calculateBadges, Badge } from '@/components/badge-system';
import { AuthScreen } from '@/components/AuthScreen';
import { UserProfile } from '@/components/UserProfile';
import { FriendsManager } from '@/components/FriendsManager';
import { useAuth } from '@/contexts/MockAuthContext';
import { SleepService } from '@/services/mockSleepService';
import { SleepEntry } from '@/types/sleep';

export default function SleepGameApp() {
  const { user, loading: authLoading } = useAuth();
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [currentTab, setCurrentTab] = useState<'sleep' | 'friends' | 'progress' | 'history' | 'badges' | 'profile'>('sleep');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);

  // Load user's sleep entries when user is authenticated
  useEffect(() => {
    if (user) {
      loadSleepEntries();
    } else {
      setSleepEntries([]);
      setBadges([]);
    }
  }, [user]);

  const loadSleepEntries = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const entries = await SleepService.getUserSleepEntries(user.id);
      setSleepEntries(entries);

      // Update user sleep stats
      await SleepService.updateUserSleepStats(user.id, entries);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Calculate latest sleep score and average
  const latestEntry = sleepEntries.length > 0 ?
    sleepEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const averageScore = sleepEntries.length > 0 ?
    Math.round(sleepEntries.reduce((sum, entry) => sum + entry.score, 0) / sleepEntries.length) : 0;

  // Calculate badges whenever sleep entries change
  useEffect(() => {
    const updatedBadges = calculateBadges(sleepEntries);

    // Check for newly earned badges
    const earnedBadges = updatedBadges.filter(badge => badge.isEarned);
    const previouslyEarnedBadges = badges.filter(badge => badge.isEarned);

    const newlyEarnedBadges = earnedBadges.filter(newBadge =>
      !previouslyEarnedBadges.some(oldBadge => oldBadge.id === newBadge.id)
    );

    if (newlyEarnedBadges.length > 0) {
      // Show notification for first newly earned badge
      setTimeout(() => {
        Alert.alert(
          '🎉 Badge Earned!',
          `Congratulations! You earned the "${newlyEarnedBadges[0].name}" badge!\n\n${newlyEarnedBadges[0].description}`,
          [
            { text: 'View Collection', onPress: () => setCurrentTab('badges') },
            { text: 'Continue', style: 'default' }
          ]
        );
      }, 500);
    }

    setBadges(updatedBadges);
  }, [sleepEntries, badges]);

  // Calculate earned badges count for display
  const earnedBadgesCount = badges.filter(badge => badge.isEarned).length;

  // Show loading screen during auth check
  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8b5cf6" />
        <Text style={styles.loadingText}>Loading Sleep Quest...</Text>
      </View>
    );
  }

  // Show auth screen if not authenticated
  if (!user) {
    return <AuthScreen />;
  }

  // Sleep entry management functions with Firebase integration
  const handleSaveEntry = async (entryData: Omit<SleepEntry, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;

    setLoading(true);
    try {
      if (editingEntry) {
        // Update existing entry
        await SleepService.updateSleepEntry(editingEntry.id, entryData);
      } else {
        // Add new entry
        await SleepService.addSleepEntry(user.id, entryData);
      }

      // Reload entries
      await loadSleepEntries();

      setShowEntryForm(false);
      setEditingEntry(null);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEntry = (entry: SleepEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleDeleteEntry = async (id: string) => {
    if (!user) return;

    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this sleep entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await SleepService.deleteSleepEntry(id);
              await loadSleepEntries();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleAddNew = () => {
    setEditingEntry(null);
    setShowEntryForm(true);
  };

  const handleCancelForm = () => {
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  // Show entry form if active
  if (showEntryForm) {
    return (
      <SleepEntryForm
        entry={editingEntry}
        onSave={handleSaveEntry}
        onCancel={handleCancelForm}
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <View style={styles.iconContainer}>
              <Moon size={48} color="#c4b5fd" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Sleep Quest</Text>
              <Text style={styles.subtitle}>Welcome back, {user.displayName}!</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setCurrentTab('profile')}
          >
            <User size={24} color="#c4b5fd" />
          </TouchableOpacity>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'sleep' && styles.tabActive]}
            onPress={() => setCurrentTab('sleep')}
          >
            <Moon size={14} color={currentTab === 'sleep' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'sleep' && styles.tabTextActive]}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'history' && styles.tabActive]}
            onPress={() => setCurrentTab('history')}
          >
            <History size={14} color={currentTab === 'history' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'badges' && styles.tabActive]}
            onPress={() => setCurrentTab('badges')}
          >
            <Award size={14} color={currentTab === 'badges' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'badges' && styles.tabTextActive]}>Badges</Text>
            {earnedBadgesCount > 0 && (
              <View style={styles.badgeCount}>
                <Text style={styles.badgeCountText}>{earnedBadgesCount}</Text>
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'progress' && styles.tabActive]}
            onPress={() => setCurrentTab('progress')}
          >
            <BarChart3 size={14} color={currentTab === 'progress' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'progress' && styles.tabTextActive]}>Charts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'friends' && styles.tabActive]}
            onPress={() => setCurrentTab('friends')}
          >
            <Trophy size={14} color={currentTab === 'friends' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'friends' && styles.tabTextActive]}>Friends</Text>
          </TouchableOpacity>
        </View>

        {currentTab === 'sleep' ? (
          // Sleep Overview View
          <View>
            {/* Quick Stats */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Your Sleep Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{sleepEntries.length}</Text>
                  <Text style={styles.statLabel}>Nights Logged</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{averageScore}</Text>
                  <Text style={styles.statLabel}>Avg Score</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{user.sleepStats.currentStreak}</Text>
                  <Text style={styles.statLabel}>Day Streak</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {latestEntry ? latestEntry.duration.toFixed(1) : '0'}h
                  </Text>
                  <Text style={styles.statLabel}>Last Sleep</Text>
                </View>
              </View>
            </View>

            {/* Quick Add Button */}
            <TouchableOpacity style={styles.quickAddButton} onPress={handleAddNew}>
              <Plus size={24} color="#ffffff" />
              <Text style={styles.quickAddText}>Log Sleep Entry</Text>
            </TouchableOpacity>

            {/* Recent Entries */}
            {sleepEntries.length > 0 && (
              <View style={styles.recentCard}>
                <Text style={styles.recentTitle}>Recent Entries</Text>
                {sleepEntries
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .slice(0, 3)
                  .map((entry) => (
                    <TouchableOpacity
                      key={entry.id}
                      style={styles.recentEntry}
                      onPress={() => handleEditEntry(entry)}
                    >
                      <View style={styles.recentDate}>
                        <Text style={styles.recentDateText}>
                          {new Date(entry.date).toLocaleDateString('en', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Text>
                      </View>
                      <View style={styles.recentInfo}>
                        <Text style={styles.recentScore}>{entry.score}</Text>
                        <Text style={styles.recentDuration}>{entry.duration.toFixed(1)}h</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
              </View>
            )}

            {/* Recent Badges */}
            {earnedBadgesCount > 0 && (
              <View style={styles.recentBadgesCard}>
                <Text style={styles.recentBadgesTitle}>🏆 Recent Badges ({earnedBadgesCount})</Text>
                <View style={styles.badgeRow}>
                  {badges
                    .filter(badge => badge.isEarned)
                    .slice(0, 3)
                    .map((badge) => (
                      <TouchableOpacity
                        key={badge.id}
                        style={styles.miniBadge}
                        onPress={() => setCurrentTab('badges')}
                      >
                        <Text style={styles.miniBadgeEmoji}>{badge.icon}</Text>
                        <Text style={styles.miniBadgeName}>{badge.name}</Text>
                      </TouchableOpacity>
                    ))}
                  {earnedBadgesCount > 3 && (
                    <TouchableOpacity
                      style={styles.moreBadges}
                      onPress={() => setCurrentTab('badges')}
                    >
                      <Text style={styles.moreBadgesText}>+{earnedBadgesCount - 3}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}

            {sleepEntries.length === 0 && (
              <View style={styles.emptyState}>
                <Moon size={64} color="#c4b5fd" />
                <Text style={styles.emptyStateTitle}>Start Your Sleep Journey</Text>
                <Text style={styles.emptyStateText}>
                  Log your first sleep entry to begin tracking your sleep patterns and building healthy habits.
                </Text>
              </View>
            )}
          </View>
        ) : currentTab === 'history' ? (
          // Sleep History View
          <SleepHistory
            sleepEntries={sleepEntries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onAddNew={handleAddNew}
          />
        ) : currentTab === 'badges' ? (
          // Badge Collection View
          <BadgeCollection badges={badges} />
        ) : currentTab === 'progress' ? (
          // Progress Charts View
          <ProgressCharts sleepEntries={sleepEntries} />
        ) : currentTab === 'friends' ? (
          // Friends Manager View
          <FriendsManager />
        ) : currentTab === 'profile' ? (
          // User Profile View
          <UserProfile />
        ) : null}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e1b4b',
  },
  content: {
    padding: 16,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f0f23',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 16,
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  headerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    marginLeft: 16,
  },
  profileButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    marginBottom: 0,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#c4b5fd',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 4,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  tabActive: {
    backgroundColor: '#8b5cf6',
  },
  tabText: {
    color: '#c4b5fd',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  streakCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streakText: {
    color: '#ffffff',
    fontWeight: '600',
    marginLeft: 8,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  formContent: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#c4b5fd',
    marginBottom: 8,
  },
  timeInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    padding: 12,
    color: '#ffffff',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    fontSize: 16,
  },
  qualityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emoji: {
    fontSize: 20,
  },
  sliderContainer: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  slider: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  qualityButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qualityButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  feelingButtons: {
    gap: 8,
  },
  feelingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  feelingButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  feelingButtonText: {
    color: '#c4b5fd',
    textAlign: 'center',
  },
  feelingButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  calculateButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  scoreCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  scoreCenter: {
    alignItems: 'center',
  },
  scoreDisplay: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreNumber: {
    fontSize: 64,
    fontWeight: 'bold',
  },
  scoreOutOf: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  scoreLabelContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  comparisonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  comparisonText: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  progressBarContainer: {
    width: '100%',
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    marginBottom: 16,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 6,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 16,
    alignSelf: 'stretch',
  },
  tipsTitle: {
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  tipText: {
    color: '#c4b5fd',
    fontSize: 12,
    marginBottom: 4,
  },
  rankCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  rankContent: {
    alignItems: 'center',
  },
  rankTitle: {
    fontSize: 16,
    color: '#c4b5fd',
    marginBottom: 8,
  },
  rankDisplay: {
    alignItems: 'center',
    marginBottom: 12,
  },
  rankNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  rankSubtitle: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  rankBadge: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fbbf24',
  },
  leaderboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  leaderboardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  friendRowHighlight: {
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  friendRank: {
    width: 30,
    alignItems: 'center',
  },
  friendRankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c4b5fd',
  },
  topRankText: {
    color: '#fbbf24',
  },
  friendAvatar: {
    fontSize: 24,
    marginRight: 12,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  friendNameHighlight: {
    color: '#8b5cf6',
  },
  friendDetails: {
    fontSize: 12,
    color: '#c4b5fd',
    marginTop: 2,
  },
  friendScore: {
    alignItems: 'center',
  },
  friendScoreText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  challengeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  challengeTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  challenge: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    marginBottom: 12,
  },
  challengeText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 14,
  },
  challengeProgress: {
    color: '#8b5cf6',
    fontWeight: '600',
    fontSize: 12,
  },
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  quickAddButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  quickAddText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 18,
  },
  recentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  recentEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    marginBottom: 8,
  },
  recentDate: {
    flex: 1,
  },
  recentDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
  },
  recentInfo: {
    alignItems: 'flex-end',
  },
  recentScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  recentDuration: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#c4b5fd',
    textAlign: 'center',
    lineHeight: 24,
  },
  badgeCount: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1e1b4b',
  },
  badgeCountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  recentBadgesCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  recentBadgesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniBadge: {
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    minWidth: 80,
  },
  miniBadgeEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  miniBadgeName: {
    fontSize: 10,
    color: '#c4b5fd',
    textAlign: 'center',
    fontWeight: '500',
  },
  moreBadges: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 50,
    height: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.3)',
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  moreBadgesText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: 'bold',
  },
});