'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Circle,
  CheckCircle2,
  Target,
  BookOpen,
  Flame,
} from 'lucide-react';

interface Stats {
  overview: {
    totalTasks: number;
    completedTasks: number;
    migratedTasks: number;
    completionRate: number;
    totalCollections: number;
  };
  streaks: {
    current: number;
    longest: number;
  };
}

export default function QuickStatsSidebar() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <aside className="hidden lg:block lg:w-80 shrink-0">
        <div className="sticky top-20">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
                <p className="text-sm text-muted-foreground">Loading stats...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    );
  }

  if (!stats) return null;

  const activeTasks = stats.overview.totalTasks - stats.overview.completedTasks - stats.overview.migratedTasks;

  return (
    <aside className="hidden lg:block lg:w-80 shrink-0">
      <div className="sticky top-20">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Stats</CardTitle>
            <CardDescription>Overview at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Total Tasks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Tasks</span>
                <Circle className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.overview.totalTasks}</p>
              <p className="text-xs text-muted-foreground">All time</p>
            </div>

            <div className="border-t" />

            {/* Completed */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completed</span>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.overview.completedTasks}</p>
              <p className="text-xs text-muted-foreground">{stats.overview.completionRate}% completion rate</p>
            </div>

            <div className="border-t" />

            {/* Active Tasks */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Active</span>
                <Target className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{activeTasks}</p>
              <p className="text-xs text-muted-foreground">In progress</p>
            </div>

            <div className="border-t" />

            {/* Collections */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Collections</span>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold">{stats.overview.totalCollections}</p>
              <p className="text-xs text-muted-foreground">Custom lists</p>
            </div>

            <div className="border-t" />

            {/* Current Streak */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Current Streak</span>
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              <p className="text-3xl font-bold">{stats.streaks.current}</p>
              <p className="text-xs text-muted-foreground">days in a row</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
