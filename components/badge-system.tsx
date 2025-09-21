import { SleepEntry } from '../types/sleep';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'timing' | 'consistency' | 'quality' | 'special';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isEarned: boolean;
  earnedDate?: string;
  progress: number; // 0-100
  requirement: string;
}

export interface BadgeRequirement {
  id: string;
  check: (entries: SleepEntry[]) => { earned: boolean; progress: number };
}

// Badge definitions with their requirements
export const BADGE_DEFINITIONS: (Badge & { requirement: BadgeRequirement })[] = [
  // Timing Badges
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Sleep before 10:00 PM for 7 consecutive nights',
    icon: '🐦',
    category: 'timing',
    tier: 'bronze',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'early_bird',
      check: (entries: SleepEntry[]) => {
        const recentEntries = entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 7);

        let consecutiveDays = 0;
        let maxConsecutive = 0;

        for (const entry of recentEntries) {
          const bedHour = parseInt(entry.bedtime.split(':')[0]);
          const bedMin = parseInt(entry.bedtime.split(':')[1]);
          const bedTimeMinutes = bedHour * 60 + bedMin;

          if (bedTimeMinutes <= 22 * 60) { // 10:00 PM = 22:00
            consecutiveDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          } else {
            consecutiveDays = 0;
          }
        }

        return {
          earned: maxConsecutive >= 7,
          progress: Math.min(100, (maxConsecutive / 7) * 100)
        };
      }
    }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Consistently sleep after midnight for 10 nights',
    icon: '🦉',
    category: 'timing',
    tier: 'bronze',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'night_owl',
      check: (entries: SleepEntry[]) => {
        let lateNights = 0;

        for (const entry of entries) {
          const bedHour = parseInt(entry.bedtime.split(':')[0]);
          if (bedHour >= 0 && bedHour < 6) { // Midnight to 6 AM
            lateNights++;
          }
        }

        return {
          earned: lateNights >= 10,
          progress: Math.min(100, (lateNights / 10) * 100)
        };
      }
    }
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Score 80+ on both weekend days for 4 consecutive weekends',
    icon: '🏆',
    category: 'special',
    tier: 'silver',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'weekend_warrior',
      check: (entries: SleepEntry[]) => {
        const weekendEntries = entries.filter(entry => {
          const date = new Date(entry.date);
          const dayOfWeek = date.getDay();
          return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
        });

        // Group by week
        const weekendsByWeek: { [key: string]: SleepEntry[] } = {};
        weekendEntries.forEach(entry => {
          const date = new Date(entry.date);
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          const weekKey = weekStart.toISOString().split('T')[0];

          if (!weekendsByWeek[weekKey]) {
            weekendsByWeek[weekKey] = [];
          }
          weekendsByWeek[weekKey].push(entry);
        });

        let consecutiveWeeks = 0;
        let maxConsecutive = 0;

        const sortedWeeks = Object.entries(weekendsByWeek)
          .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime());

        for (const [, weekEntries] of sortedWeeks) {
          const allGoodScores = weekEntries.length >= 2 &&
            weekEntries.every(entry => entry.score >= 80);

          if (allGoodScores) {
            consecutiveWeeks++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveWeeks);
          } else {
            consecutiveWeeks = 0;
          }
        }

        return {
          earned: maxConsecutive >= 4,
          progress: Math.min(100, (maxConsecutive / 4) * 100)
        };
      }
    }
  },

  // Consistency Badges
  {
    id: 'consistent_sleeper',
    name: 'Consistent Sleeper',
    description: 'Log sleep for 7 consecutive days',
    icon: '📅',
    category: 'consistency',
    tier: 'bronze',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'consistent_sleeper',
      check: (entries: SleepEntry[]) => {
        if (entries.length === 0) return { earned: false, progress: 0 };

        const sortedEntries = entries.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let consecutiveDays = 1;
        const today = new Date(sortedEntries[0].date);

        for (let i = 1; i < sortedEntries.length; i++) {
          const currentDate = new Date(sortedEntries[i].date);
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);

          if (currentDate.toDateString() === expectedDate.toDateString()) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        return {
          earned: consecutiveDays >= 7,
          progress: Math.min(100, (consecutiveDays / 7) * 100)
        };
      }
    }
  },
  {
    id: 'habit_master',
    name: 'Habit Master',
    description: 'Log sleep for 30 consecutive days',
    icon: '🎯',
    category: 'consistency',
    tier: 'gold',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'habit_master',
      check: (entries: SleepEntry[]) => {
        if (entries.length === 0) return { earned: false, progress: 0 };

        const sortedEntries = entries.sort((a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );

        let consecutiveDays = 1;
        const today = new Date(sortedEntries[0].date);

        for (let i = 1; i < sortedEntries.length; i++) {
          const currentDate = new Date(sortedEntries[i].date);
          const expectedDate = new Date(today);
          expectedDate.setDate(today.getDate() - i);

          if (currentDate.toDateString() === expectedDate.toDateString()) {
            consecutiveDays++;
          } else {
            break;
          }
        }

        return {
          earned: consecutiveDays >= 30,
          progress: Math.min(100, (consecutiveDays / 30) * 100)
        };
      }
    }
  },

  // Quality Badges
  {
    id: 'sleep_champion',
    name: 'Sleep Champion',
    description: 'Achieve a score of 90+ points',
    icon: '👑',
    category: 'quality',
    tier: 'gold',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'sleep_champion',
      check: (entries: SleepEntry[]) => {
        const hasChampionScore = entries.some(entry => entry.score >= 90);
        const bestScore = entries.length > 0 ? Math.max(...entries.map(e => e.score)) : 0;

        return {
          earned: hasChampionScore,
          progress: Math.min(100, (bestScore / 90) * 100)
        };
      }
    }
  },
  {
    id: 'quality_sleeper',
    name: 'Quality Sleeper',
    description: 'Rate sleep quality 9+ for 5 consecutive nights',
    icon: '⭐',
    category: 'quality',
    tier: 'silver',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'quality_sleeper',
      check: (entries: SleepEntry[]) => {
        const recentEntries = entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 5);

        let consecutiveDays = 0;
        let maxConsecutive = 0;

        for (const entry of recentEntries) {
          if (entry.quality >= 9) {
            consecutiveDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          } else {
            consecutiveDays = 0;
          }
        }

        return {
          earned: maxConsecutive >= 5,
          progress: Math.min(100, (maxConsecutive / 5) * 100)
        };
      }
    }
  },
  {
    id: 'perfect_sleeper',
    name: 'Perfect Sleeper',
    description: 'Achieve three 100-point scores',
    icon: '💎',
    category: 'quality',
    tier: 'platinum',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'perfect_sleeper',
      check: (entries: SleepEntry[]) => {
        const perfectScores = entries.filter(entry => entry.score === 100).length;

        return {
          earned: perfectScores >= 3,
          progress: Math.min(100, (perfectScores / 3) * 100)
        };
      }
    }
  },

  // Special Badges
  {
    id: 'first_entry',
    name: 'Sleep Tracker',
    description: 'Log your first sleep entry',
    icon: '🌙',
    category: 'special',
    tier: 'bronze',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'first_entry',
      check: (entries: SleepEntry[]) => {
        return {
          earned: entries.length >= 1,
          progress: entries.length >= 1 ? 100 : 0
        };
      }
    }
  },
  {
    id: 'optimal_sleeper',
    name: 'Optimal Sleeper',
    description: 'Sleep exactly 8 hours for 3 consecutive nights',
    icon: '🎪',
    category: 'timing',
    tier: 'silver',
    isEarned: false,
    progress: 0,
    requirement: {
      id: 'optimal_sleeper',
      check: (entries: SleepEntry[]) => {
        const recentEntries = entries
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 3);

        let consecutiveDays = 0;
        let maxConsecutive = 0;

        for (const entry of recentEntries) {
          // Check if duration is between 7.5 and 8.5 hours (close to 8)
          if (entry.duration >= 7.5 && entry.duration <= 8.5) {
            consecutiveDays++;
            maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
          } else {
            consecutiveDays = 0;
          }
        }

        return {
          earned: maxConsecutive >= 3,
          progress: Math.min(100, (maxConsecutive / 3) * 100)
        };
      }
    }
  }
];

// Badge calculation function
export const calculateBadges = (entries: SleepEntry[]): Badge[] => {
  return BADGE_DEFINITIONS.map(badgeDef => {
    const { earned, progress } = badgeDef.requirement.check(entries);

    return {
      ...badgeDef,
      isEarned: earned,
      progress,
      earnedDate: earned && !badgeDef.isEarned ? new Date().toISOString().split('T')[0] : badgeDef.earnedDate
    };
  });
};

// Get tier color
export const getTierColor = (tier: Badge['tier']): string => {
  switch (tier) {
    case 'bronze': return '#cd7f32';
    case 'silver': return '#c0c0c0';
    case 'gold': return '#ffd700';
    case 'platinum': return '#e5e4e2';
    default: return '#8b5cf6';
  }
};

// Get category color
export const getCategoryColor = (category: Badge['category']): string => {
  switch (category) {
    case 'timing': return '#3b82f6';
    case 'consistency': return '#10b981';
    case 'quality': return '#8b5cf6';
    case 'special': return '#f59e0b';
    default: return '#8b5cf6';
  }
};