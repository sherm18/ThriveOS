import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ScrollView
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../contexts/MockAuthContext';
import { User, Camera, Edit3, Save, X } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, updateProfile, signOut } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setLoading(true);
    try {
      await updateProfile({ displayName: displayName.trim() });
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setDisplayName(user.displayName);
    setIsEditing(false);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      Alert.alert('Permission Required', 'Please grant camera roll permissions to change your avatar.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      // TODO: Upload image to Firebase Storage and update user profile
      Alert.alert('Coming Soon', 'Avatar upload will be implemented in the next update!');
    }
  };

  const handleSignOut = () => {
    console.log('UserProfile: handleSignOut called');
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            console.log('UserProfile: Sign out confirmed, calling signOut...');
            try {
              await signOut();
              console.log('UserProfile: signOut completed successfully');
            } catch (error: any) {
              console.error('UserProfile: signOut failed:', error);
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {user.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.defaultAvatar}>
              <User size={40} color="#8b5cf6" />
            </View>
          )}
          <View style={styles.cameraIcon}>
            <Camera size={16} color="#ffffff" />
          </View>
        </TouchableOpacity>

        <View style={styles.userInfo}>
          {isEditing ? (
            <View style={styles.editContainer}>
              <TextInput
                style={styles.editInput}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Display Name"
                placeholderTextColor="#9ca3af"
              />
              <View style={styles.editButtons}>
                <TouchableOpacity
                  style={[styles.editButton, styles.cancelButton]}
                  onPress={handleCancel}
                >
                  <X size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editButton, styles.saveButton]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  <Save size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.displayContainer}>
              <Text style={styles.displayName}>{user.displayName}</Text>
              <TouchableOpacity
                style={styles.editIconButton}
                onPress={() => setIsEditing(true)}
              >
                <Edit3 size={16} color="#8b5cf6" />
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.username}>@{user.username}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.sectionTitle}>Sleep Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.sleepStats.totalNights}</Text>
            <Text style={styles.statLabel}>Nights Logged</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {user.sleepStats.averageScore > 0 ? Math.round(user.sleepStats.averageScore) : 0}
            </Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.sleepStats.currentStreak}</Text>
            <Text style={styles.statLabel}>Current Streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.sleepStats.bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
        </View>
      </View>

      <View style={styles.friends}>
        <Text style={styles.sectionTitle}>Friends</Text>
        <Text style={styles.friendsCount}>
          {user.friends.length} friend{user.friends.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.signOutButton}
        onPress={async () => {
          console.log('Sign out button pressed!');
          try {
            await signOut();
            console.log('Direct signOut completed');
          } catch (error) {
            console.error('Direct signOut failed:', error);
            Alert.alert('Error', 'Failed to sign out: ' + error);
          }
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.signOutButtonText}>Sign Out (Direct)</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  header: {
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  defaultAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1e1b4b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  editContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 200,
    textAlign: 'center',
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ef4444',
  },
  saveButton: {
    backgroundColor: '#10b981',
  },
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  displayName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginRight: 8,
  },
  editIconButton: {
    padding: 4,
  },
  username: {
    fontSize: 16,
    color: '#8b5cf6',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#9ca3af',
  },
  stats: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
  friends: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  friendsCount: {
    fontSize: 16,
    color: '#9ca3af',
  },
  signOutButton: {
    margin: 24,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  signOutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});