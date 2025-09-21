import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal
} from 'react-native';
import { Award, Filter, Trophy, Star, Clock, Calendar } from 'lucide-react';
import { Badge, getTierColor, getCategoryColor } from './badge-system';

interface BadgeCollectionProps {
  badges: Badge[];
}

export default function BadgeCollection({ badges }: BadgeCollectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filter badges by category
  const filteredBadges = badges.filter(badge =>
    selectedCategory === 'all' || badge.category === selectedCategory
  );

  // Separate earned and unearned badges
  const earnedBadges = filteredBadges.filter(badge => badge.isEarned);
  const unearnedBadges = filteredBadges.filter(badge => !badge.isEarned);

  // Calculate stats
  const totalBadges = badges.length;
  const earnedCount = badges.filter(badge => badge.isEarned).length;
  const completionPercentage = Math.round((earnedCount / totalBadges) * 100);

  const categories = [
    { id: 'all', name: 'All', icon: Award },
    { id: 'timing', name: 'Timing', icon: Clock },
    { id: 'consistency', name: 'Consistency', icon: Calendar },
    { id: 'quality', name: 'Quality', icon: Star },
    { id: 'special', name: 'Special', icon: Trophy }
  ];

  const handleBadgePress = (badge: Badge) => {
    setSelectedBadge(badge);
    setShowModal(true);
  };

  const renderBadge = (badge: Badge, isEarned: boolean) => (
    <TouchableOpacity
      key={badge.id}
      style={[
        styles.badgeCard,
        !isEarned && styles.badgeCardUnearned,
        isEarned && { borderColor: getTierColor(badge.tier) }
      ]}
      onPress={() => handleBadgePress(badge)}
    >
      {/* Badge Icon */}
      <View style={[
        styles.badgeIcon,
        !isEarned && styles.badgeIconUnearned,
        isEarned && { backgroundColor: getTierColor(badge.tier) + '20' }
      ]}>
        <Text style={[
          styles.badgeEmoji,
          !isEarned && styles.badgeEmojiUnearned
        ]}>
          {badge.icon}
        </Text>
      </View>

      {/* Badge Info */}
      <View style={styles.badgeInfo}>
        <Text style={[
          styles.badgeName,
          !isEarned && styles.badgeNameUnearned
        ]}>
          {badge.name}
        </Text>
        <Text style={[
          styles.badgeDescription,
          !isEarned && styles.badgeDescriptionUnearned
        ]}>
          {badge.description}
        </Text>

        {/* Progress Bar for Unearned Badges */}
        {!isEarned && badge.progress > 0 && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${badge.progress}%`, backgroundColor: getCategoryColor(badge.category) }
              ]} />
            </View>
            <Text style={styles.progressText}>{Math.round(badge.progress)}%</Text>
          </View>
        )}

        {/* Earned Date */}
        {isEarned && badge.earnedDate && (
          <Text style={styles.earnedDate}>
            Earned on {new Date(badge.earnedDate).toLocaleDateString()}
          </Text>
        )}
      </View>

      {/* Tier Badge */}
      <View style={[
        styles.tierBadge,
        { backgroundColor: getTierColor(badge.tier) }
      ]}>
        <Text style={styles.tierText}>{badge.tier.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Header Stats */}
        <View style={styles.statsCard}>
          <View style={styles.statsHeader}>
            <Trophy size={32} color="#ffd700" />
            <Text style={styles.statsTitle}>Badge Collection</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{earnedCount}</Text>
              <Text style={styles.statLabel}>Earned</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{totalBadges - earnedCount}</Text>
              <Text style={styles.statLabel}>Remaining</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completionPercentage}%</Text>
              <Text style={styles.statLabel}>Complete</Text>
            </View>
          </View>

          {/* Overall Progress Bar */}
          <View style={styles.overallProgressContainer}>
            <View style={styles.overallProgressBar}>
              <View style={[
                styles.overallProgressFill,
                { width: `${completionPercentage}%` }
              ]} />
            </View>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Filter size={20} color="#c4b5fd" />
            <Text style={styles.filterTitle}>Categories</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {categories.map(category => {
              const IconComponent = category.icon;
              const isActive = selectedCategory === category.id;

              return (
                <TouchableOpacity
                  key={category.id}
                  style={[
                    styles.categoryButton,
                    isActive && styles.categoryButtonActive
                  ]}
                  onPress={() => setSelectedCategory(category.id)}
                >
                  <IconComponent
                    size={20}
                    color={isActive ? "#ffffff" : "#c4b5fd"}
                  />
                  <Text style={[
                    styles.categoryText,
                    isActive && styles.categoryTextActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Earned Badges */}
        {earnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🏆 Earned Badges ({earnedBadges.length})
            </Text>
            {earnedBadges.map(badge => renderBadge(badge, true))}
          </View>
        )}

        {/* Unearned Badges */}
        {unearnedBadges.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              🎯 In Progress ({unearnedBadges.length})
            </Text>
            {unearnedBadges.map(badge => renderBadge(badge, false))}
          </View>
        )}

        {/* Empty State */}
        {filteredBadges.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No badges in this category</Text>
          </View>
        )}

        {/* Badge Detail Modal */}
        <Modal
          visible={showModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowModal(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowModal(false)}
          >
            <View style={styles.modalContent}>
              {selectedBadge && (
                <>
                  {/* Modal Header */}
                  <View style={styles.modalHeader}>
                    <View style={[
                      styles.modalBadgeIcon,
                      { backgroundColor: getTierColor(selectedBadge.tier) + '20' }
                    ]}>
                      <Text style={styles.modalBadgeEmoji}>
                        {selectedBadge.icon}
                      </Text>
                    </View>
                    <View style={[
                      styles.modalTierBadge,
                      { backgroundColor: getTierColor(selectedBadge.tier) }
                    ]}>
                      <Text style={styles.modalTierText}>
                        {selectedBadge.tier.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Badge Details */}
                  <Text style={styles.modalBadgeName}>{selectedBadge.name}</Text>
                  <Text style={styles.modalBadgeDescription}>
                    {selectedBadge.description}
                  </Text>

                  {/* Category */}
                  <View style={styles.modalCategory}>
                    <View style={[
                      styles.modalCategoryDot,
                      { backgroundColor: getCategoryColor(selectedBadge.category) }
                    ]} />
                    <Text style={styles.modalCategoryText}>
                      {selectedBadge.category.charAt(0).toUpperCase() + selectedBadge.category.slice(1)}
                    </Text>
                  </View>

                  {/* Progress or Earned Status */}
                  {selectedBadge.isEarned ? (
                    <View style={styles.modalEarnedContainer}>
                      <Text style={styles.modalEarnedText}>🎉 Badge Earned!</Text>
                      {selectedBadge.earnedDate && (
                        <Text style={styles.modalEarnedDate}>
                          {new Date(selectedBadge.earnedDate).toLocaleDateString('en', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <View style={styles.modalProgressContainer}>
                      <Text style={styles.modalProgressTitle}>Progress</Text>
                      <View style={styles.modalProgressBar}>
                        <View style={[
                          styles.modalProgressFill,
                          {
                            width: `${selectedBadge.progress}%`,
                            backgroundColor: getCategoryColor(selectedBadge.category)
                          }
                        ]} />
                      </View>
                      <Text style={styles.modalProgressText}>
                        {Math.round(selectedBadge.progress)}% Complete
                      </Text>
                    </View>
                  )}

                  {/* Close Button */}
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowModal(false)}
                  >
                    <Text style={styles.modalCloseText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
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
  statsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginLeft: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8b5cf6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  overallProgressContainer: {
    marginTop: 8,
  },
  overallProgressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
    borderRadius: 4,
  },
  filterContainer: {
    marginBottom: 24,
  },
  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginLeft: 8,
  },
  categoryScroll: {
    flexDirection: 'row',
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  categoryButtonActive: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
  },
  categoryText: {
    color: '#c4b5fd',
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  badgeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    flexDirection: 'row',
    alignItems: 'center',
  },
  badgeCardUnearned: {
    opacity: 0.7,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  badgeIconUnearned: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  badgeEmoji: {
    fontSize: 28,
  },
  badgeEmojiUnearned: {
    opacity: 0.5,
  },
  badgeInfo: {
    flex: 1,
    marginRight: 12,
  },
  badgeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  badgeNameUnearned: {
    color: '#c4b5fd',
  },
  badgeDescription: {
    fontSize: 14,
    color: '#c4b5fd',
    lineHeight: 20,
  },
  badgeDescriptionUnearned: {
    opacity: 0.7,
  },
  progressContainer: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#c4b5fd',
    fontWeight: '500',
  },
  earnedDate: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
    fontWeight: '500',
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tierText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#c4b5fd',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#312e81',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  modalBadgeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  modalBadgeEmoji: {
    fontSize: 40,
  },
  modalTierBadge: {
    position: 'absolute',
    top: 0,
    right: '30%',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalTierText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  modalBadgeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
  },
  modalBadgeDescription: {
    fontSize: 16,
    color: '#c4b5fd',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  modalCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  modalCategoryText: {
    fontSize: 14,
    color: '#c4b5fd',
    fontWeight: '500',
  },
  modalEarnedContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    borderRadius: 12,
    marginBottom: 20,
  },
  modalEarnedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  modalEarnedDate: {
    fontSize: 14,
    color: '#10b981',
  },
  modalProgressContainer: {
    marginBottom: 20,
  },
  modalProgressTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalProgressBar: {
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 8,
  },
  modalProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  modalProgressText: {
    fontSize: 14,
    color: '#c4b5fd',
    textAlign: 'center',
    fontWeight: '500',
  },
  modalCloseButton: {
    backgroundColor: '#8b5cf6',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});