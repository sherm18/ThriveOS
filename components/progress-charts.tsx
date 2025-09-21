import { LineChart } from 'react-native-chart-kit';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { TrendingDown, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';

const screenWidth = Dimensions.get('window').width;

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

interface ProgressChartsProps {
  sleepEntries: SleepEntry[];
}

export default function ProgressCharts({ sleepEntries }: ProgressChartsProps) {
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly'>('weekly');
  const [dataType, setDataType] = useState<'score' | 'hours' | 'quality'>('score');

  // Process data based on view mode
  const processData = () => {
    if (sleepEntries.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }]
      };
    }

    // Sort entries by date
    const sortedEntries = [...sleepEntries].sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    if (viewMode === 'weekly') {
      // Get last 7 days of data
      const weeklyData = sortedEntries.slice(-7);
      return {
        labels: weeklyData.map(item => {
          const date = new Date(item.date);
          return date.toLocaleDateString('en', { weekday: 'short' });
        }),
        datasets: [{
          data: weeklyData.map(item => {
            switch (dataType) {
              case 'score': return item.score;
              case 'hours': return item.duration;
              case 'quality': return item.quality;
              default: return item.score;
            }
          })
        }]
      };
    } else {
      // Group by weeks for monthly view
      const weeks = [];
      for (let i = 0; i < sortedEntries.length; i += 7) {
        const weekData = sortedEntries.slice(i, i + 7);
        if (weekData.length === 0) continue;

        const avgValue = weekData.reduce((sum, item) => {
          switch (dataType) {
            case 'score': return sum + item.score;
            case 'hours': return sum + item.duration;
            case 'quality': return sum + item.quality;
            default: return sum + item.score;
          }
        }, 0) / weekData.length;

        weeks.push({
          label: `Week ${Math.floor(i / 7) + 1}`,
          value: Math.round(avgValue * 10) / 10
        });
      }

      return {
        labels: weeks.map(week => week.label),
        datasets: [{
          data: weeks.map(week => week.value)
        }]
      };
    }
  };

  const chartData = processData();

  // Calculate trend
  const calculateTrend = () => {
    const data = chartData.datasets[0].data;
    if (data.length < 2) return { direction: 'neutral', percentage: 0 };

    const recent = data.slice(-3).reduce((sum, val) => sum + val, 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, val) => sum + val, 0) / 3;

    if (isNaN(recent) || isNaN(previous)) return { direction: 'neutral', percentage: 0 };

    const change = ((recent - previous) / previous) * 100;
    return {
      direction: change > 5 ? 'up' : change < -5 ? 'down' : 'neutral',
      percentage: Math.abs(change)
    };
  };

  const trend = calculateTrend();

  const getDataTypeLabel = () => {
    switch (dataType) {
      case 'score': return 'Sleep Score';
      case 'hours': return 'Sleep Hours';
      case 'quality': return 'Sleep Quality';
      default: return 'Sleep Score';
    }
  };

  const getDataTypeUnit = () => {
    switch (dataType) {
      case 'score': return '';
      case 'hours': return ' hrs';
      case 'quality': return '/10';
      default: return '';
    }
  };

  const chartConfig = {
    backgroundColor: '#1e1b4b',
    backgroundGradientFrom: '#312e81',
    backgroundGradientTo: '#1e1b4b',
    decimalPlaces: dataType === 'hours' ? 1 : 0,
    color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(196, 181, 253, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#8b5cf6'
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(255, 255, 255, 0.1)'
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Sleep Progress</Text>
          <Text style={styles.subtitle}>Track your sleep trends over time</Text>
        </View>

        {/* View Mode Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'weekly' && styles.toggleButtonActive]}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={[styles.toggleText, viewMode === 'weekly' && styles.toggleTextActive]}>
              Weekly
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, viewMode === 'monthly' && styles.toggleButtonActive]}
            onPress={() => setViewMode('monthly')}
          >
            <Text style={[styles.toggleText, viewMode === 'monthly' && styles.toggleTextActive]}>
              Monthly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Data Type Selector */}
        <View style={styles.dataTypeContainer}>
          {(['score', 'hours', 'quality'] as const).map(type => (
            <TouchableOpacity
              key={type}
              style={[styles.dataTypeButton, dataType === type && styles.dataTypeButtonActive]}
              onPress={() => setDataType(type)}
            >
              <Text style={[styles.dataTypeText, dataType === type && styles.dataTypeTextActive]}>
                {type === 'score' ? 'Score' : type === 'hours' ? 'Hours' : 'Quality'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Trend Indicator */}
        <View style={styles.trendCard}>
          <View style={styles.trendContent}>
            <View style={styles.trendIcon}>
              {trend.direction === 'up' ? (
                <TrendingUp size={24} color="#10b981" />
              ) : trend.direction === 'down' ? (
                <TrendingDown size={24} color="#ef4444" />
              ) : (
                <View style={styles.neutralTrend}>
                  <Text style={styles.neutralTrendText}>→</Text>
                </View>
              )}
            </View>
            <View style={styles.trendInfo}>
              <Text style={styles.trendTitle}>
                {trend.direction === 'up' ? 'Improving!' :
                 trend.direction === 'down' ? 'Declining' : 'Stable'}
              </Text>
              <Text style={styles.trendDescription}>
                {trend.direction === 'neutral'
                  ? 'Your sleep pattern is stable'
                  : `${trend.percentage.toFixed(1)}% ${trend.direction === 'up' ? 'improvement' : 'decrease'} recently`
                }
              </Text>
            </View>
          </View>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>{getDataTypeLabel()} Trend</Text>
            <Text style={styles.chartSubtitle}>
              {viewMode === 'weekly' ? 'Last 7 days' : 'Last 4 weeks'}
            </Text>
          </View>

          <LineChart
            data={chartData}
            width={screenWidth - 64}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
            withDots
            withShadow={false}
            withVerticalLabels
            withHorizontalLabels
            formatYLabel={(value) => `${Math.round(Number(value))}${getDataTypeUnit()}`}
          />
        </View>

        {/* Stats Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Summary</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {(chartData.datasets[0].data.reduce((sum, val) => sum + val, 0) / chartData.datasets[0].data.length).toFixed(1)}
                {getDataTypeUnit()}
              </Text>
              <Text style={styles.statLabel}>Average</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(...chartData.datasets[0].data).toFixed(1)}{getDataTypeUnit()}
              </Text>
              <Text style={styles.statLabel}>Best</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.min(...chartData.datasets[0].data).toFixed(1)}{getDataTypeUnit()}
              </Text>
              <Text style={styles.statLabel}>Lowest</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {chartData.datasets[0].data.length}
              </Text>
              <Text style={styles.statLabel}>Days</Text>
            </View>
          </View>
        </View>

        {/* Insights */}
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>💡 Insights</Text>
          <View style={styles.insights}>
            {trend.direction === 'up' && (
              <Text style={styles.insightText}>
                • Great job! Your {getDataTypeLabel().toLowerCase()} is trending upward
              </Text>
            )}
            {trend.direction === 'down' && (
              <Text style={styles.insightText}>
                • Consider reviewing your sleep routine to improve your {getDataTypeLabel().toLowerCase()}
              </Text>
            )}
            <Text style={styles.insightText}>
              • Try to maintain consistent bedtime and wake times
            </Text>
            <Text style={styles.insightText}>
              • Aim for 7-9 hours of sleep each night
            </Text>
          </View>
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
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  toggleButtonActive: {
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
  dataTypeContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  dataTypeButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  dataTypeButtonActive: {
    backgroundColor: '#8b5cf6',
  },
  dataTypeText: {
    color: '#c4b5fd',
    fontWeight: '500',
    fontSize: 14,
  },
  dataTypeTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  trendCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    marginRight: 16,
  },
  neutralTrend: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  neutralTrendText: {
    color: '#c4b5fd',
    fontSize: 20,
    fontWeight: 'bold',
  },
  trendInfo: {
    flex: 1,
  },
  trendTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  trendDescription: {
    fontSize: 14,
    color: '#c4b5fd',
  },
  chartCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  chartHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 12,
    color: '#c4b5fd',
  },
  chart: {
    borderRadius: 16,
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
  insightsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  insights: {
    gap: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#c4b5fd',
    lineHeight: 20,
  },
});