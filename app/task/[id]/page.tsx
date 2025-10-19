'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { format, parseISO, differenceInDays } from 'date-fns';
import AppLayout from '@/components/AppLayout';
import TaskActivityHeatmap from '@/components/TaskActivityHeatmap';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, TrendingUp, Target, Flame } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface TaskDetails {
  id: number;
  content: string;
  is_recurring: number;
  recurrence_pattern: string;
  created_at: string;
}

interface CompletionData {
  date: string;
  completed: number;
}

interface Stats {
  totalCompletions: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
  daysActive: number;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetails | null>(null);
  const [completions, setCompletions] = useState<CompletionData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTaskDetails();
  }, [taskId]);

  const loadTaskDetails = async () => {
    setLoading(true);
    try {
      // Load task info (we'll need a new endpoint)
      const taskResponse = await fetch(`/api/tasks/detail?id=${taskId}`);
      if (taskResponse.status === 401) {
        router.push('/login');
        return;
      }

      if (taskResponse.ok) {
        const taskData = await taskResponse.json();
        setTask(taskData);

        // Load completions
        const completionsResponse = await fetch(`/api/tasks/completions?taskId=${taskId}`);
        if (completionsResponse.ok) {
          const completionsData = await completionsResponse.json();
          setCompletions(completionsData);

          // Calculate stats
          calculateStats(taskData, completionsData);
        }
      }
    } catch (error) {
      console.error('Error loading task details:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (taskData: TaskDetails, completionsData: CompletionData[]) => {
    const totalCompletions = completionsData.filter(c => c.completed === 1).length;

    // Calculate streaks
    const sortedDates = completionsData
      .filter(c => c.completed === 1)
      .map(c => parseISO(c.date))
      .sort((a, b) => b.getTime() - a.getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const today = new Date();

    for (let i = 0; i < sortedDates.length; i++) {
      if (i === 0) {
        const daysSinceToday = differenceInDays(today, sortedDates[i]);
        if (daysSinceToday <= 1) {
          currentStreak = 1;
          tempStreak = 1;
        }
      } else {
        const daysDiff = differenceInDays(sortedDates[i - 1], sortedDates[i]);
        if (daysDiff === 1) {
          tempStreak++;
          if (i === 1 || currentStreak > 0) {
            currentStreak = tempStreak;
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Calculate days active (from task creation to now)
    const createdDate = parseISO(taskData.created_at);
    const daysActive = differenceInDays(today, createdDate) + 1;

    // Calculate completion rate based on recurrence pattern
    let expectedCompletions = 0;
    switch (taskData.recurrence_pattern) {
      case 'daily':
        expectedCompletions = daysActive;
        break;
      case 'weekly':
        expectedCompletions = Math.floor(daysActive / 7);
        break;
      case 'monthly':
        expectedCompletions = Math.floor(daysActive / 30);
        break;
      case 'yearly':
        expectedCompletions = Math.floor(daysActive / 365);
        break;
    }

    const completionRate = expectedCompletions > 0
      ? Math.round((totalCompletions / expectedCompletions) * 100)
      : 0;

    setStats({
      totalCompletions,
      currentStreak,
      longestStreak,
      completionRate: Math.min(completionRate, 100),
      daysActive,
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!task) {
    return (
      <AppLayout>
        <div className="container max-w-4xl mx-auto py-8 px-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Task not found</p>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="gap-2 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        {/* Task Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl mb-2">{task.content}</CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="capitalize">{task.recurrence_pattern}</span>
                  <span>•</span>
                  <span>Since {format(parseISO(task.created_at), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Target className="h-8 w-8 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.totalCompletions}</p>
                  <p className="text-xs text-muted-foreground">Total Completions</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <Flame className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-xs text-muted-foreground">Current Streak</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <TrendingUp className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-2xl font-bold">{stats.longestStreak}</p>
                  <p className="text-xs text-muted-foreground">Longest Streak</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="relative h-8 w-8 mb-2">
                    <svg className="transform -rotate-90" viewBox="0 0 36 36">
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-muted"
                        strokeWidth="3"
                      />
                      <circle
                        cx="18"
                        cy="18"
                        r="16"
                        fill="none"
                        className="stroke-primary"
                        strokeWidth="3"
                        strokeDasharray={`${stats.completionRate}, 100`}
                      />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold">{stats.completionRate}%</p>
                  <p className="text-xs text-muted-foreground">Completion Rate</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Activity History</CardTitle>
          </CardHeader>
          <CardContent>
            <TaskActivityHeatmap
              taskId={task.id}
              data={completions}
              weeks={26}
            />

            <Separator className="my-6" />

            {/* Recent Activity */}
            <div>
              <h3 className="text-sm font-medium mb-4">Recent Activity</h3>
              <div className="space-y-2">
                {completions.slice(0, 10).map((completion) => (
                  <div
                    key={completion.date}
                    className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/50"
                  >
                    <span className="text-sm">
                      {format(parseISO(completion.date), 'EEEE, MMMM d, yyyy')}
                    </span>
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        completion.completed
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {completion.completed ? 'Completed' : 'Skipped'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
