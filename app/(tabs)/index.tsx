import { History, Moon, Trophy, BarChart3, Plus } from 'lucide-react';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ProgressCharts from '@/components/progress-charts';
import SleepHistory from '@/components/sleep-history';
import SleepEntryForm from '@/components/sleep-entry-form';

interface SleepEntry {
  id: string;
  date: string;
  bedtime: string;
  waketime: string;
  quality: number;
  feeling: string;
  score: number;
  duration: number;
}

export default function SleepGameApp() {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [currentTab, setCurrentTab] = useState<'sleep' | 'friends' | 'progress' | 'history'>('sleep');
  const [showEntryForm, setShowEntryForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<SleepEntry | null>(null);
  const [streak] = useState(3);

  // Calculate latest sleep score and average for friends leaderboard
  const latestEntry = sleepEntries.length > 0 ?
    sleepEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] : null;

  const averageScore = sleepEntries.length > 0 ?
    Math.round(sleepEntries.reduce((sum, entry) => sum + entry.score, 0) / sleepEntries.length) : 0;

  // Mock friends data with real user data
  const friends = [
    { id: 1, name: 'Sarah', score: 87, streak: 5, lastSleep: '8.2 hrs', avatar: '👩' },
    { id: 2, name: 'Mike', score: 72, streak: 2, lastSleep: '6.8 hrs', avatar: '👨' },
    { id: 3, name: 'Emma', score: 91, streak: 8, lastSleep: '8.5 hrs', avatar: '👱‍♀️' },
    { id: 4, name: 'Alex', score: 65, streak: 1, lastSleep: '5.9 hrs', avatar: '🧑' },
    {
      id: 5,
      name: 'You',
      score: latestEntry?.score || 0,
      streak: streak,
      lastSleep: latestEntry ? `${latestEntry.duration.toFixed(1)} hrs` : '0 hrs',
      avatar: '🌟'
    },
  ];

  // Sort friends by score for leaderboard
  const leaderboard = [...friends].sort((a, b) => b.score - a.score);
  const yourRank = leaderboard.findIndex(friend => friend.name === 'You') + 1;

  // Sleep entry management functions
  const handleSaveEntry = (entryData: Omit<SleepEntry, 'id'>) => {
    if (editingEntry) {
      // Update existing entry
      setSleepEntries(entries =>
        entries.map(entry =>
          entry.id === editingEntry.id
            ? { ...entryData, id: editingEntry.id }
            : entry
        )
      );
    } else {
      // Add new entry
      const newEntry: SleepEntry = {
        ...entryData,
        id: Date.now().toString()
      };
      setSleepEntries(entries => [...entries, newEntry]);
    }
    setShowEntryForm(false);
    setEditingEntry(null);
  };

  const handleEditEntry = (entry: SleepEntry) => {
    setEditingEntry(entry);
    setShowEntryForm(true);
  };

  const handleDeleteEntry = (id: string) => {
    setSleepEntries(entries => entries.filter(entry => entry.id !== id));
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
          <View style={styles.iconContainer}>
            <Moon size={48} color="#c4b5fd" />
          </View>
          <Text style={styles.title}>Sleep Quest</Text>
          <Text style={styles.subtitle}>Level up your sleep game!</Text>
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'sleep' && styles.tabActive]}
            onPress={() => setCurrentTab('sleep')}
          >
            <Moon size={16} color={currentTab === 'sleep' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'sleep' && styles.tabTextActive]}>Sleep</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'history' && styles.tabActive]}
            onPress={() => setCurrentTab('history')}
          >
            <History size={16} color={currentTab === 'history' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'progress' && styles.tabActive]}
            onPress={() => setCurrentTab('progress')}
          >
            <BarChart3 size={16} color={currentTab === 'progress' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.tabText, currentTab === 'progress' && styles.tabTextActive]}>Progress</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, currentTab === 'friends' && styles.tabActive]}
            onPress={() => setCurrentTab('friends')}
          >
            <Trophy size={16} color={currentTab === 'friends' ? "#ffffff" : "#c4b5fd"} />
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
                  <Text style={styles.statValue}>{streak}</Text>
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
        ) : currentTab === 'progress' ? (
          // Progress Charts View
          <ProgressCharts sleepEntries={sleepEntries} />
        ) : currentTab === 'friends' ? (
          // Friends & Leaderboard View
          <View>
            {/* Your Rank Card */}
            <View style={styles.rankCard}>
              <View style={styles.rankContent}>
                <Text style={styles.rankTitle}>Your Ranking</Text>
                <View style={styles.rankDisplay}>
                  <Text style={styles.rankNumber}>#{yourRank}</Text>
                  <Text style={styles.rankSubtitle}>out of {friends.length} friends</Text>
                </View>
                {yourRank <= 3 && (
                  <Text style={styles.rankBadge}>
                    {yourRank === 1 ? '🥇 Sleep Champion!' : 
                     yourRank === 2 ? '🥈 Great Sleeper!' : '🥉 Top Performer!'}
                  </Text>
                )}
              </View>
            </View>

            {/* Leaderboard */}
            <View style={styles.leaderboardCard}>
              <Text style={styles.leaderboardTitle}>🏆 Sleep Leaderboard</Text>
              {leaderboard.map((friend, index) => (
                <View key={friend.id} style={[
                  styles.friendRow,
                  friend.name === 'You' && styles.friendRowHighlight
                ]}>
                  <View style={styles.friendRank}>
                    <Text style={[
                      styles.friendRankText,
                      index < 3 && styles.topRankText
                    ]}>
                      {index + 1}
                    </Text>
                  </View>
                  
                  <Text style={styles.friendAvatar}>{friend.avatar}</Text>
                  
                  <View style={styles.friendInfo}>
                    <Text style={[
                      styles.friendName,
                      friend.name === 'You' && styles.friendNameHighlight
                    ]}>
                      {friend.name}
                    </Text>
                    <Text style={styles.friendDetails}>
                      {friend.lastSleep} • {friend.streak} day streak
                    </Text>
                  </View>
                  
                  <View style={styles.friendScore}>
                    <Text style={[
                      styles.friendScoreText,
                      {color: friend.score >= 80 ? '#10b981' : 
                              friend.score >= 60 ? '#f59e0b' : '#ef4444'}
                    ]}>
                      {friend.score}
                    </Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Friend Challenges */}
            <View style={styles.challengeCard}>
              <Text style={styles.challengeTitle}>🎯 Weekly Challenges</Text>
              <View style={styles.challenge}>
                <Text style={styles.challengeText}>Beat Sarah&apos;s 5-day streak</Text>
                <Text style={styles.challengeProgress}>3/6 days</Text>
              </View>
              <View style={styles.challenge}>
                <Text style={styles.challengeText}>Get 80+ score 3 times this week</Text>
                <Text style={styles.challengeProgress}>1/3 completed</Text>
              </View>
            </View>
          </View>
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
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    marginBottom: 16,
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
});