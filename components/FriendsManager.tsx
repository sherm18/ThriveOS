import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  RefreshControl
} from 'react-native';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  addDoc,
  deleteDoc,
  getDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/MockAuthContext';
import { User, FriendRequest } from '../types/user';
import { UserPlus, UserCheck, UserX, Search, Users } from 'lucide-react';

export const FriendsManager: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [friends, setFriends] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Search for users by username or email
  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef,
        where('username', '>=', searchQuery.toLowerCase()),
        where('username', '<=', searchQuery.toLowerCase() + '\uf8ff')
      );

      const querySnapshot = await getDocs(q);
      const results: User[] = [];

      querySnapshot.forEach((doc) => {
        const userData = doc.data() as User;
        // Don't show current user in results
        if (userData.id !== user?.id) {
          results.push(userData);
        }
      });

      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      Alert.alert('Error', 'Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Send friend request
  const sendFriendRequest = async (toUser: User) => {
    if (!user) return;

    try {
      // Check if already friends
      if (user.friends.includes(toUser.id)) {
        Alert.alert('Info', 'You are already friends with this user');
        return;
      }

      // Check if request already sent
      if (user.friendRequests.sent.includes(toUser.id)) {
        Alert.alert('Info', 'Friend request already sent');
        return;
      }

      // Create friend request document
      const requestData: Omit<FriendRequest, 'id'> = {
        fromUserId: user.id,
        toUserId: toUser.id,
        fromUsername: user.username,
        toUsername: toUser.username,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'friendRequests'), requestData);

      // Update both users' friend request arrays
      await updateDoc(doc(db, 'users', user.id), {
        'friendRequests.sent': arrayUnion(toUser.id)
      });

      await updateDoc(doc(db, 'users', toUser.id), {
        'friendRequests.received': arrayUnion(user.id)
      });

      // Update local state
      await updateProfile({
        friendRequests: {
          ...user.friendRequests,
          sent: [...user.friendRequests.sent, toUser.id]
        }
      });

      Alert.alert('Success', 'Friend request sent!');
      setSearchResults(prev => prev.filter(u => u.id !== toUser.id));
    } catch (error) {
      console.error('Error sending friend request:', error);
      Alert.alert('Error', 'Failed to send friend request');
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (request: FriendRequest) => {
    if (!user) return;

    try {
      // Add to both users' friends lists
      await updateDoc(doc(db, 'users', user.id), {
        friends: arrayUnion(request.fromUserId),
        'friendRequests.received': arrayRemove(request.fromUserId)
      });

      await updateDoc(doc(db, 'users', request.fromUserId), {
        friends: arrayUnion(user.id),
        'friendRequests.sent': arrayRemove(user.id)
      });

      // Delete the friend request document
      await deleteDoc(doc(db, 'friendRequests', request.id));

      // Update local state
      await updateProfile({
        friends: [...user.friends, request.fromUserId],
        friendRequests: {
          ...user.friendRequests,
          received: user.friendRequests.received.filter(id => id !== request.fromUserId)
        }
      });

      Alert.alert('Success', `You are now friends with ${request.fromUsername}!`);
      loadFriendRequests();
      loadFriends();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      Alert.alert('Error', 'Failed to accept friend request');
    }
  };

  // Decline friend request
  const declineFriendRequest = async (request: FriendRequest) => {
    if (!user) return;

    try {
      // Remove from both users' request arrays
      await updateDoc(doc(db, 'users', user.id), {
        'friendRequests.received': arrayRemove(request.fromUserId)
      });

      await updateDoc(doc(db, 'users', request.fromUserId), {
        'friendRequests.sent': arrayRemove(user.id)
      });

      // Delete the friend request document
      await deleteDoc(doc(db, 'friendRequests', request.id));

      // Update local state
      await updateProfile({
        friendRequests: {
          ...user.friendRequests,
          received: user.friendRequests.received.filter(id => id !== request.fromUserId)
        }
      });

      loadFriendRequests();
    } catch (error) {
      console.error('Error declining friend request:', error);
      Alert.alert('Error', 'Failed to decline friend request');
    }
  };

  // Load friend requests
  const loadFriendRequests = async () => {
    if (!user) return;

    try {
      const requestsRef = collection(db, 'friendRequests');
      const q = query(requestsRef, where('toUserId', '==', user.id));
      const querySnapshot = await getDocs(q);

      const requests: FriendRequest[] = [];
      querySnapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() } as FriendRequest);
      });

      setFriendRequests(requests);
    } catch (error) {
      console.error('Error loading friend requests:', error);
    }
  };

  // Load friends
  const loadFriends = async () => {
    if (!user || user.friends.length === 0) {
      setFriends([]);
      return;
    }

    try {
      const friendsData: User[] = [];

      for (const friendId of user.friends) {
        const friendDoc = await getDoc(doc(db, 'users', friendId));
        if (friendDoc.exists()) {
          friendsData.push(friendDoc.data() as User);
        }
      }

      setFriends(friendsData);
    } catch (error) {
      console.error('Error loading friends:', error);
    }
  };

  // Refresh data
  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([loadFriendRequests(), loadFriends()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (user) {
      loadFriendRequests();
      loadFriends();
    }
  }, [user]);

  if (!user) return null;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Search Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Find Friends</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by username..."
            placeholderTextColor="#9ca3af"
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={searchUsers}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchUsers} disabled={loading}>
            <Text style={styles.searchButtonText}>{loading ? '...' : 'Search'}</Text>
          </TouchableOpacity>
        </View>

        {/* Search Results */}
        {searchResults.map((result) => (
          <View key={result.id} style={styles.userItem}>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{result.displayName}</Text>
              <Text style={styles.userUsername}>@{result.username}</Text>
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => sendFriendRequest(result)}
            >
              <UserPlus size={20} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {/* Friend Requests Section */}
      {friendRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Friend Requests</Text>
          {friendRequests.map((request) => (
            <View key={request.id} style={styles.requestItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{request.fromUsername}</Text>
                <Text style={styles.requestTime}>
                  {new Date(request.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.requestButtons}>
                <TouchableOpacity
                  style={[styles.requestButton, styles.acceptButton]}
                  onPress={() => acceptFriendRequest(request)}
                >
                  <UserCheck size={20} color="#ffffff" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.requestButton, styles.declineButton]}
                  onPress={() => declineFriendRequest(request)}
                >
                  <UserX size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Friends List Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Friends ({friends.length})
        </Text>
        {friends.length === 0 ? (
          <View style={styles.emptyState}>
            <Users size={48} color="#6b7280" />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>Search for users to add friends!</Text>
          </View>
        ) : (
          friends.map((friend) => (
            <View key={friend.id} style={styles.friendItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{friend.displayName}</Text>
                <Text style={styles.userUsername}>@{friend.username}</Text>
              </View>
              <View style={styles.friendStats}>
                <Text style={styles.statText}>{friend.sleepStats.totalNights} nights</Text>
                <Text style={styles.statText}>
                  {friend.sleepStats.averageScore > 0 ? Math.round(friend.sleepStats.averageScore) : 0} avg
                </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f23',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    color: '#ffffff',
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  userUsername: {
    fontSize: 14,
    color: '#8b5cf6',
  },
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 8,
  },
  requestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  requestTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  requestButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
    borderRadius: 8,
    padding: 8,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1e1b4b',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  friendStats: {
    alignItems: 'flex-end',
  },
  statText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6b7280',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 8,
  },
});