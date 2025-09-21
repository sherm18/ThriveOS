import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Alert
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, Clock, Save, X } from 'lucide-react';

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

interface SleepEntryFormProps {
  entry?: SleepEntry | null;
  onSave: (entry: Omit<SleepEntry, 'id'>) => void;
  onCancel: () => void;
}

export default function SleepEntryForm({
  entry,
  onSave,
  onCancel
}: SleepEntryFormProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bedtime, setBedtime] = useState('');
  const [waketime, setWaketime] = useState('');
  const [quality, setQuality] = useState(5);
  const [feeling, setFeeling] = useState('okay');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Initialize form with existing entry data or defaults
  useEffect(() => {
    if (entry) {
      setSelectedDate(new Date(entry.date));
      setBedtime(entry.bedtime);
      setWaketime(entry.waketime);
      setQuality(entry.quality);
      setFeeling(entry.feeling);
    } else {
      // Reset to defaults for new entry
      setSelectedDate(new Date());
      setBedtime('');
      setWaketime('');
      setQuality(5);
      setFeeling('okay');
    }
  }, [entry]);

  const formatDateForDisplay = (date: Date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const calculateDuration = () => {
    if (!bedtime || !waketime) return 0;
    const bedtimeParts = bedtime.split(':');
    const waketimeParts = waketime.split(':');
    if (bedtimeParts.length !== 2 || waketimeParts.length !== 2) return 0;

    const bedHour = parseInt(bedtimeParts[0]);
    const bedMin = parseInt(bedtimeParts[1]);
    const wakeHour = parseInt(waketimeParts[0]);
    const wakeMin = parseInt(waketimeParts[1]);

    let duration = (wakeHour + wakeMin / 60) - (bedHour + bedMin / 60);
    if (duration < 0) duration += 24;
    return duration;
  };

  const calculateSleepScore = () => {
    const duration = calculateDuration();
    let score = 0;

    // Duration scoring (40 points max)
    if (duration >= 7 && duration <= 9) {
      score += 40;
    } else if (duration >= 6 && duration <= 10) {
      score += 30;
    } else if (duration >= 5 && duration <= 11) {
      score += 20;
    } else {
      score += 10;
    }

    // Quality scoring (40 points max)
    score += (quality - 1) * 4.44;

    // Feeling scoring (20 points max)
    const feelingBonus = {
      'terrible': 0,
      'tired': 5,
      'okay': 10,
      'good': 15,
      'amazing': 20
    };
    score += feelingBonus[feeling] || 10;

    return Math.round(score);
  };

  const handleSave = () => {
    if (!bedtime || !waketime) {
      Alert.alert('Missing Information', 'Please enter both bedtime and wake time!');
      return;
    }

    const bedtimeParts = bedtime.split(':');
    const waketimeParts = waketime.split(':');

    if (bedtimeParts.length !== 2 || waketimeParts.length !== 2) {
      Alert.alert('Invalid Format', 'Please use format HH:MM (like 22:30)');
      return;
    }

    const duration = calculateDuration();
    const score = calculateSleepScore();

    const entryData = {
      date: selectedDate.toISOString().split('T')[0],
      bedtime,
      waketime,
      quality,
      feeling,
      duration,
      score
    };

    onSave(entryData);
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
            <X size={24} color="#c4b5fd" />
          </TouchableOpacity>
          <Text style={styles.title}>
            {entry ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Date Picker */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Calendar size={20} color="#ffffff" />
            <Text style={styles.formTitle}>Sleep Date</Text>
          </View>

          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {formatDateForDisplay(selectedDate)}
            </Text>
            <Text style={styles.dateButtonSubtext}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Sleep Times */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <Clock size={20} color="#ffffff" />
            <Text style={styles.formTitle}>Sleep Times</Text>
          </View>

          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Bedtime</Text>
              <TextInput
                style={styles.timeInput}
                value={bedtime}
                onChangeText={setBedtime}
                placeholder="22:30"
                placeholderTextColor="#c4b5fd"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Wake Time</Text>
              <TextInput
                style={styles.timeInput}
                value={waketime}
                onChangeText={setWaketime}
                placeholder="07:00"
                placeholderTextColor="#c4b5fd"
                keyboardType="numeric"
              />
            </View>

            {bedtime && waketime && (
              <View style={styles.durationDisplay}>
                <Text style={styles.durationText}>
                  Duration: {calculateDuration().toFixed(1)} hours
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Sleep Quality */}
        <View style={styles.formCard}>
          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Sleep Quality: {quality}/10</Text>
              <View style={styles.qualityContainer}>
                <Text style={styles.emoji}>😴</Text>
                <View style={styles.sliderContainer}>
                  <View style={[styles.slider, { width: `${quality * 10}%` }]} />
                </View>
                <Text style={styles.emoji}>😊</Text>
                <TouchableOpacity
                  style={styles.qualityButton}
                  onPress={() => setQuality(Math.max(1, quality - 1))}
                >
                  <Text style={styles.qualityButtonText}>-</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.qualityButton}
                  onPress={() => setQuality(Math.min(10, quality + 1))}
                >
                  <Text style={styles.qualityButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* How you feel */}
        <View style={styles.formCard}>
          <View style={styles.formContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>How do you feel?</Text>
              <View style={styles.feelingButtons}>
                {[
                  { value: 'terrible', label: '😫 Terrible' },
                  { value: 'tired', label: '😴 Tired' },
                  { value: 'okay', label: '😐 Okay' },
                  { value: 'good', label: '😊 Good' },
                  { value: 'amazing', label: '🌟 Amazing' }
                ].map((feelingOption) => (
                  <TouchableOpacity
                    key={feelingOption.value}
                    style={[
                      styles.feelingButton,
                      feeling === feelingOption.value && styles.feelingButtonActive
                    ]}
                    onPress={() => setFeeling(feelingOption.value)}
                  >
                    <Text style={[
                      styles.feelingButtonText,
                      feeling === feelingOption.value && styles.feelingButtonTextActive
                    ]}>
                      {feelingOption.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Preview Score */}
        {bedtime && waketime && (
          <View style={styles.previewCard}>
            <Text style={styles.previewTitle}>Preview Score</Text>
            <Text style={styles.previewScore}>{calculateSleepScore()}</Text>
            <Text style={styles.previewSubtext}>out of 100</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={20} color="#ffffff" />
            <Text style={styles.saveButtonText}>
              {entry ? 'Update Entry' : 'Save Entry'}
            </Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  closeButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
  dateButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  dateButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  dateButtonSubtext: {
    fontSize: 14,
    color: '#c4b5fd',
    marginTop: 4,
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
  durationDisplay: {
    alignItems: 'center',
    paddingTop: 8,
  },
  durationText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8b5cf6',
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
  previewCard: {
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8b5cf6',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#c4b5fd',
    marginBottom: 8,
  },
  previewScore: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#8b5cf6',
  },
  previewSubtext: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  cancelButtonText: {
    color: '#c4b5fd',
    fontWeight: '600',
    fontSize: 16,
  },
  saveButton: {
    flex: 2,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
});