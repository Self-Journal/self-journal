'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  TrendingUp,
  Flame,
  Target,
  CheckCircle2,
  Circle,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface QuickStats {
  completionRate: number;
  currentStreak: number;
  activeTasks: number;
  completedToday: number;
  totalTasks: number;
}

export default function PerformanceSidebar() {
  const [stats, setStats] = useState<QuickStats | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuickStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(loadQuickStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadQuickStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats({
          completionRate: data.overview.completionRate,
          currentStreak: data.streaks.current,
          activeTasks: data.overview.totalTasks - data.overview.completedTasks - data.overview.migratedTasks,
          completedToday: data.tasksBySymbol.complete || 0,
          totalTasks: data.overview.totalTasks,
        });
      }
    } catch (error) {
      console.error('Error loading quick stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="w-64 border-l bg-muted/30 p-4 hidden lg:block">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
          <p className="text-xs text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  if (isCollapsed) {
    return (
      <div className="border-l bg-muted/30 hidden lg:flex flex-col items-center py-4 px-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex flex-col gap-4 mt-6">
          <div className="flex flex-col items-center gap-1">
            <Flame className="h-5 w-5 text-orange-500" />
            <span className="text-xs font-bold">{stats.currentStreak}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <TrendingUp className="h-5 w-5" />
            <span className="text-xs font-bold">{stats.completionRate}%</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <Target className="h-5 w-5" />
            <span className="text-xs font-bold">{stats.activeTasks}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 border-l bg-muted/30 p-4 hidden lg:block">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Quick Stats</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(true)}
          className="h-7 w-7 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {/* Streak */}
        <Card className="border-2">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-xs font-medium">Streak</span>
              </div>
              <span className="text-lg font-bold">{stats.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">days in a row</p>
          </CardContent>
        </Card>

        {/* Completion Rate */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xs font-medium">Completion</span>
              </div>
              <span className="text-lg font-bold">{stats.completionRate}%</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Active Tasks */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Circle className="h-3.5 w-3.5" />
            <span className="text-xs">Active</span>
          </div>
          <span className="text-sm font-semibold">{stats.activeTasks}</span>
        </div>

        {/* Completed */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="text-xs">Completed</span>
          </div>
          <span className="text-sm font-semibold">{stats.completedToday}</span>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between p-2">
          <div className="flex items-center gap-2">
            <Target className="h-3.5 w-3.5" />
            <span className="text-xs">Total Tasks</span>
          </div>
          <span className="text-sm font-semibold">{stats.totalTasks}</span>
        </div>

        <Separator />

        {/* Quick Link to Dashboard */}
        <a href="/dashboard" className="block">
          <Button variant="outline" size="sm" className="w-full text-xs">
            View Full Dashboard
          </Button>
        </a>
      </div>
    </div>
  );
}
