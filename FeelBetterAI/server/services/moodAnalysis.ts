export interface MoodTrend {
  direction: "improving" | "declining" | "stable";
  change: number; // percentage change
  period: string;
}

export interface MoodInsight {
  type: "pattern" | "improvement" | "concern" | "milestone";
  title: string;
  description: string;
  confidence: number;
}

export interface DailyMoodSummary {
  date: string;
  averageScore: number;
  sessionCount: number;
  messageCount: number;
  highestMood: number;
  lowestMood: number;
}

export function calculateMoodTrend(moodHistory: Array<{ score: number; date: Date }>): MoodTrend {
  if (moodHistory.length < 2) {
    return {
      direction: "stable",
      change: 0,
      period: "insufficient data"
    };
  }

  // Sort by date
  const sortedHistory = moodHistory.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  // Calculate trend over the last week vs previous week
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const lastWeekMoods = sortedHistory.filter(m => m.date >= weekAgo);
  const previousWeekMoods = sortedHistory.filter(m => m.date >= twoWeeksAgo && m.date < weekAgo);

  if (lastWeekMoods.length === 0 || previousWeekMoods.length === 0) {
    return {
      direction: "stable",
      change: 0,
      period: "this week"
    };
  }

  const lastWeekAvg = lastWeekMoods.reduce((sum, m) => sum + m.score, 0) / lastWeekMoods.length;
  const previousWeekAvg = previousWeekMoods.reduce((sum, m) => sum + m.score, 0) / previousWeekMoods.length;

  const change = ((lastWeekAvg - previousWeekAvg) / previousWeekAvg) * 100;

  let direction: "improving" | "declining" | "stable" = "stable";
  if (change > 5) direction = "improving";
  else if (change < -5) direction = "declining";

  return {
    direction,
    change: Math.abs(change),
    period: "this week vs last week"
  };
}

export function generateMoodInsights(
  moodHistory: Array<{ score: number; date: Date }>,
  sessionData: Array<{ averageMood: number; messageCount: number; startTime: Date }>
): MoodInsight[] {
  const insights: MoodInsight[] = [];

  if (moodHistory.length === 0) return insights;

  // Pattern analysis
  const recentMoods = moodHistory.slice(-7); // Last 7 entries
  if (recentMoods.length >= 3) {
    const morningChats = sessionData.filter(s => {
      const hour = s.startTime.getHours();
      return hour >= 6 && hour <= 12;
    });
    const eveningChats = sessionData.filter(s => {
      const hour = s.startTime.getHours();
      return hour >= 18 && hour <= 23;
    });

    if (morningChats.length >= 2 && eveningChats.length >= 2) {
      const morningAvg = morningChats.reduce((sum, s) => sum + (s.averageMood || 5), 0) / morningChats.length;
      const eveningAvg = eveningChats.reduce((sum, s) => sum + (s.averageMood || 5), 0) / eveningChats.length;

      if (morningAvg > eveningAvg + 1) {
        insights.push({
          type: "pattern",
          title: "Morning conversations help your mood",
          description: "You tend to feel better when you chat with me in the morning versus evening sessions.",
          confidence: 0.7
        });
      }
    }
  }

  // Improvement detection
  const trend = calculateMoodTrend(moodHistory);
  if (trend.direction === "improving" && trend.change > 10) {
    insights.push({
      type: "improvement",
      title: "Consistent progress this week",
      description: `Your overall mood has improved by ${trend.change.toFixed(1)}% with regular check-ins.`,
      confidence: 0.8
    });
  }

  // Concern detection
  const recentLowMoods = moodHistory.slice(-5).filter(m => m.score <= 3);
  if (recentLowMoods.length >= 3) {
    insights.push({
      type: "concern",
      title: "Consider additional support",
      description: "Your mood has been consistently low recently. It might help to talk to a professional counselor.",
      confidence: 0.6
    });
  }

  // Milestone detection
  const highMoodStreak = getConsecutiveHighMoodDays(moodHistory);
  if (highMoodStreak >= 3) {
    insights.push({
      type: "milestone",
      title: `${highMoodStreak} days of positive mood!`,
      description: "You've maintained a positive mood for several days. That's wonderful progress!",
      confidence: 0.9
    });
  }

  return insights;
}

export function getDailyMoodSummary(
  date: Date,
  moodEntries: Array<{ score: number; date: Date }>,
  sessions: Array<{ messageCount: number; startTime: Date; averageMood?: number }>
): DailyMoodSummary {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const dayMoods = moodEntries.filter(m => 
    m.date >= startOfDay && m.date <= endOfDay
  );
  
  const daySessions = sessions.filter(s => 
    s.startTime >= startOfDay && s.startTime <= endOfDay
  );

  const scores = dayMoods.map(m => m.score);
  
  return {
    date: date.toISOString().split('T')[0],
    averageScore: scores.length > 0 ? scores.reduce((sum, s) => sum + s, 0) / scores.length : 5,
    sessionCount: daySessions.length,
    messageCount: daySessions.reduce((sum, s) => sum + (s.messageCount || 0), 0),
    highestMood: scores.length > 0 ? Math.max(...scores) : 5,
    lowestMood: scores.length > 0 ? Math.min(...scores) : 5
  };
}

function getConsecutiveHighMoodDays(moodHistory: Array<{ score: number; date: Date }>): number {
  let streak = 0;
  const sortedHistory = moodHistory
    .sort((a, b) => b.date.getTime() - a.date.getTime()) // Most recent first
    .slice(0, 14); // Last 14 days

  for (const mood of sortedHistory) {
    if (mood.score >= 7) { // Consider 7+ as "high mood"
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
