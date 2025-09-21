interface MoodIndicatorProps {
  currentScore: number;
  sessionDuration: number;
}

export function MoodIndicator({ currentScore, sessionDuration }: MoodIndicatorProps) {
  // Generate mood history visualization (simplified for demo)
  const moodBars = Array.from({ length: 5 }, (_, i) => {
    const height = Math.random() * 100 + 20; // Random heights for demo
    const colorClass = height > 70 ? 'bg-accent' : height > 50 ? 'bg-primary' : 'bg-warning';
    return { height, colorClass };
  });

  const getMoodLabel = (score: number) => {
    if (score >= 8) return "Feeling Great";
    if (score >= 6) return "Feeling Better";
    if (score >= 4) return "Neutral";
    if (score >= 2) return "Struggling";
    return "Very Low";
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min session`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m session`;
  };

  return (
    <div className="bg-muted/30 border-b border-border" data-testid="mood-indicator-bar">
      <div className="max-w-4xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-foreground" data-testid="mood-label-title">Today's Mood:</span>
            <div className="flex space-x-1">
              {moodBars.map((bar, index) => (
                <div 
                  key={index}
                  className={`w-3 h-6 rounded-sm mood-indicator transition-all duration-300 ${bar.colorClass}`}
                  style={{ height: `${Math.min(bar.height, 100)}%` }}
                  data-testid={`mood-bar-${index}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground" data-testid="mood-label">
              {getMoodLabel(currentScore)}
            </span>
            <div className="flex items-center space-x-1 ml-2">
              <span className="text-xs text-muted-foreground">Score:</span>
              <span className="text-sm font-medium text-foreground" data-testid="mood-score">
                {currentScore.toFixed(1)}
              </span>
            </div>
          </div>
          <div className="text-sm text-muted-foreground" data-testid="session-duration">
            {formatDuration(sessionDuration)}
          </div>
        </div>
      </div>
    </div>
  );
}
