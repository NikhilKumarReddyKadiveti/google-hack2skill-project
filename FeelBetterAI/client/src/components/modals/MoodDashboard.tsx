import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Lightbulb, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

interface MoodDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DailyMoodSummary {
  date: string;
  averageScore: number;
  sessionCount: number;
  messageCount: number;
}

interface MoodInsight {
  type: "pattern" | "improvement" | "concern" | "milestone";
  title: string;
  description: string;
  confidence: number;
}

interface DashboardData {
  dailySummaries: DailyMoodSummary[];
  insights: MoodInsight[];
  averageMood: number;
  todayStats: {
    sessions: number;
    totalTime: number;
    messageCount: number;
  };
}

export function MoodDashboard({ isOpen, onClose }: MoodDashboardProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDashboardData();
    }
  }, [isOpen]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest("GET", "/api/mood/dashboard");
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      }
    } catch (error) {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      
      toast({
        title: "Error",
        description: "Failed to load mood dashboard",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "improvement":
        return <TrendingUp className="text-accent h-4 w-4" />;
      case "pattern":
        return <Lightbulb className="text-accent h-4 w-4" />;
      default:
        return <Lightbulb className="text-primary h-4 w-4" />;
    }
  };

  const getDayName = (date: string) => {
    const today = new Date();
    const targetDate = new Date(date);
    const diffTime = today.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return targetDate.toLocaleDateString("en-US", { weekday: "short" });
  };

  const getMoodColor = (score: number) => {
    if (score >= 7.5) return "bg-accent";
    if (score >= 5.5) return "bg-primary";
    if (score >= 3.5) return "bg-warning";
    return "bg-destructive";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="mood-dashboard">
        <DialogHeader className="flex flex-row justify-between items-center">
          <div>
            <DialogTitle className="text-2xl font-bold text-foreground" data-testid="dashboard-title">
              Your Mood Journey
            </DialogTitle>
            <DialogDescription data-testid="dashboard-description">
              Track your emotional wellness over time
            </DialogDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} data-testid="button-close-dashboard">
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-pulse bg-muted rounded-lg w-16 h-16 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your mood data...</p>
            </div>
          </div>
        ) : dashboardData ? (
          <div className="space-y-8">
            {/* Today's Summary */}
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="today-summary-title">
                    Today's Summary
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Average Mood</span>
                      <div className="flex items-center space-x-2">
                        <div className={`w-6 h-6 rounded-full ${getMoodColor(dashboardData.averageMood)}`}></div>
                        <span className="font-medium" data-testid="average-mood">
                          {dashboardData.averageMood.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Sessions</span>
                      <span className="font-medium" data-testid="sessions-today">
                        {dashboardData.todayStats.sessions}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total Time</span>
                      <span className="font-medium" data-testid="total-time">
                        {dashboardData.todayStats.totalTime} min
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* This Week */}
              <Card className="bg-muted/30">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="week-summary-title">
                    This Week
                  </h3>
                  <div className="space-y-2">
                    {dashboardData.dailySummaries.map((day, index) => (
                      <div key={day.date} className="flex items-center space-x-3" data-testid={`daily-summary-${index}`}>
                        <span className="text-sm text-muted-foreground w-16">
                          {getDayName(day.date)}
                        </span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${getMoodColor(day.averageScore)}`}
                            style={{ width: `${(day.averageScore / 10) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium" data-testid={`daily-score-${index}`}>
                          {day.averageScore.toFixed(1)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Insights */}
            <Card className="bg-muted/30">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4" data-testid="insights-title">
                  Recent Insights
                </h3>
                <div className="space-y-4">
                  {dashboardData.insights.length === 0 ? (
                    <p className="text-muted-foreground text-sm" data-testid="no-insights">
                      Keep chatting to generate personalized insights about your mood patterns.
                    </p>
                  ) : (
                    dashboardData.insights.map((insight, index) => (
                      <div key={index} className="flex items-start space-x-3" data-testid={`insight-${index}`}>
                        <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {getInsightIcon(insight.type)}
                        </div>
                        <div>
                          <p className="text-foreground font-medium" data-testid={`insight-title-${index}`}>
                            {insight.title}
                          </p>
                          <p className="text-sm text-muted-foreground" data-testid={`insight-description-${index}`}>
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No mood data available yet. Start chatting to track your mood!</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
