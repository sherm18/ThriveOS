import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert
} from 'react-native';
import { Calendar, Clock, Edit2, Plus, Trash2 } from 'lucide-react';

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

interface SleepHistoryProps {
  sleepEntries: SleepEntry[];
  onEditEntry: (entry: SleepEntry) => void;
  onDeleteEntry: (id: string) => void;
  onAddNew: () => void;
}

export default function SleepHistory({
  sleepEntries,
  onEditEntry,
  onDeleteEntry,
  onAddNew
}: SleepHistoryProps) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Sort entries by date (newest first)
  const sortedEntries = [...sleepEntries].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group entries by month for calendar view
  const groupedByMonth = sortedEntries.reduce((acc, entry) => {
    const date = new Date(entry.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(entry);
    return acc;
  }, {} as Record<string, SleepEntry[]>);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getFeelingEmoji = (feeling: string) => {
    const emojiMap: Record<string, string> = {
      'terrible': '😫',
      'tired': '😴',
      'okay': '😐',
      'good': '😊',
      'amazing': '🌟'
    };
    return emojiMap[feeling] || '😐';
  };

  const handleDelete = (entry: SleepEntry) => {
    Alert.alert(
      'Delete Sleep Entry',
      `Are you sure you want to delete the entry for ${formatDate(entry.date)}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDeleteEntry(entry.id)
        }
      ]
    );
  };

  const renderListView = () => (
    <View>
      {sortedEntries.map((entry) => (
        <View key={entry.id} style={styles.entryCard}>
          <View style={styles.entryHeader}>
            <View style={styles.entryDate}>
              <Text style={styles.entryDateText}>{formatDate(entry.date)}</Text>
              <Text style={styles.entryDateSub}>
                {new Date(entry.date).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.entryScore}>
              <Text style={[styles.scoreText, { color: getScoreColor(entry.score) }]}>
                {entry.score}
              </Text>
              <Text style={styles.scoreLabel}>score</Text>
            </View>
          </View>

          <View style={styles.entryDetails}>
            <View style={styles.detailRow}>
              <Clock size={16} color="#c4b5fd" />
              <Text style={styles.detailText}>
                {entry.bedtime} → {entry.waketime} ({entry.duration.toFixed(1)}h)
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>⭐</Text>
              <Text style={styles.detailText}>
                Quality: {entry.quality}/10
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailEmoji}>{getFeelingEmoji(entry.feeling)}</Text>
              <Text style={styles.detailText}>
                Feeling: {entry.feeling}
              </Text>
            </View>
          </View>

          <View style={styles.entryActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => onEditEntry(entry)}
            >
              <Edit2 size={16} color="#8b5cf6" />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={() => handleDelete(entry)}
            >
              <Trash2 size={16} color="#ef4444" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </View>
  );

  const renderCalendarView = () => (
    <View>
      {Object.entries(groupedByMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([month, entries]) => (
        <View key={month} style={styles.monthSection}>
          <Text style={styles.monthHeader}>
            {new Date(month + '-01').toLocaleDateString('en', {
              month: 'long',
              year: 'numeric'
            })}
          </Text>

          <View style={styles.calendarGrid}>
            {entries.map((entry) => (
              <TouchableOpacity
                key={entry.id}
                style={styles.calendarDay}
                onPress={() => onEditEntry(entry)}
              >
                <Text style={styles.calendarDayNumber}>
                  {new Date(entry.date).getDate()}
                </Text>
                <View style={[
                  styles.calendarScore,
                  { backgroundColor: getScoreColor(entry.score) }
                ]}>
                  <Text style={styles.calendarScoreText}>
                    {entry.score}
                  </Text>
                </View>
                <Text style={styles.calendarEmoji}>
                  {getFeelingEmoji(entry.feeling)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sleep History</Text>
          <Text style={styles.subtitle}>
            {sleepEntries.length} night{sleepEntries.length !== 1 ? 's' : ''} logged
          </Text>
        </View>

        {/* View Toggle */}
        <View style={styles.viewToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'list' && styles.toggleActive]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
              List
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'calendar' && styles.toggleActive]}
            onPress={() => setViewMode('calendar')}
          >
            <Calendar size={16} color={viewMode === 'calendar' ? "#ffffff" : "#c4b5fd"} />
            <Text style={[styles.toggleText, viewMode === 'calendar' && styles.toggleTextActive]}>
              Calendar
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add New Button */}
        <TouchableOpacity style={styles.addButton} onPress={onAddNew}>
          <Plus size={20} color="#ffffff" />
          <Text style={styles.addButtonText}>Add Sleep Entry</Text>
        </TouchableOpacity>

        {/* Content */}
        {sleepEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No sleep entries yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Start logging your sleep to build your history
            </Text>
          </View>
        ) : (
          viewMode === 'list' ? renderListView() : renderCalendarView()
        )}
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
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#c4b5fd',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  toggleActive: {
    backgroundColor: '#8b5cf6',
  },
  toggleText: {
    color: '#c4b5fd',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  entryCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  entryDate: {
    flex: 1,
  },
  entryDateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  entryDateSub: {
    fontSize: 12,
    color: '#c4b5fd',
    marginTop: 2,
  },
  entryScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scoreLabel: {
    fontSize: 10,
    color: '#c4b5fd',
  },
  entryDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#c4b5fd',
  },
  detailEmoji: {
    fontSize: 16,
    width: 16,
    textAlign: 'center',
  },
  entryActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  actionText: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '500',
  },
  deleteText: {
    color: '#ef4444',
  },
  monthSection: {
    marginBottom: 24,
  },
  monthHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  calendarDay: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  calendarDayNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  calendarScore: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  calendarScoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  calendarEmoji: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#c4b5fd',
    textAlign: 'center',
  },
});