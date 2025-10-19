'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import AppNav from '@/components/AppNav';
import StatCard from '@/components/StatCard';
import ProgressRing from '@/components/ProgressRing';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import MoodCalendar from '@/components/MoodCalendar';
import ProductivityHeatmap from '@/components/ProductivityHeatmap';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  CheckCircle2,
  Circle,
  TrendingUp,
  BookOpen,
  Flame,
  Target,
  Calendar as CalendarIcon,
  BarChart3,
  Plus,
  X,
  ArrowRight,
  ChevronLeft,
  Minus,
  Dot,
  Smile,
  Activity
} from 'lucide-react';

interface Stats {
  overview: {
    totalTasks: number;
    completedTasks: number;
    migratedTasks: number;
    completionRate: number;
    totalCollections: number;
  };
  tasksBySymbol: Record<string, number>;
  entriesByType: Record<string, number>;
  recentActivity: Array<{
    date: string;
    entries: number;
    tasks: number;
  }>;
  streaks: {
    current: number;
    longest: number;
  };
  moods: Array<{
    date: string;
    mood: string;
  }>;
  moodDistribution: Record<string, number>;
  productivityTimeline: Array<{
    date: string;
    completed: number;
    total: number;
  }>;
}

const symbolLabels: Record<string, string> = {
  bullet: 'Active Tasks',
  complete: 'Completed',
  migrated: 'Migrated',
  scheduled: 'Scheduled',
  note: 'Notes',
  event: 'Events',
};

type TaskSymbol = 'bullet' | 'complete' | 'migrated' | 'scheduled' | 'note' | 'event';

export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [taskInput, setTaskInput] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<TaskSymbol>('bullet');
  const [addingTask, setAddingTask] = useState(false);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stats');
      if (response.status === 401) {
        router.push('/login');
        return;
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!taskInput.trim()) return;

    setAddingTask(true);
    try {
      // Get today's date
      const today = format(new Date(), 'yyyy-MM-dd');

      // Get or create today's entry
      const entryResponse = await fetch(`/api/entries?date=${today}&type=daily`);
      let entry = await entryResponse.json();

      if (!entry || !entry.id) {
        // Create entry if it doesn't exist
        const createResponse = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, type: 'daily' }),
        });
        entry = await createResponse.json();
      }

      // Get existing tasks to determine position
      const tasksResponse = await fetch(`/api/tasks?entryId=${entry.id}`);
      const tasks = await tasksResponse.json();
      const position = tasks.length;

      // Add the task
      await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId: entry.id,
          content: taskInput,
          symbol: selectedSymbol,
          position
        }),
      });

      // Reset form and close dialog
      setTaskInput('');
      setSelectedSymbol('bullet');
      setIsDialogOpen(false);

      // Reload stats to reflect new task
      loadStats();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setAddingTask(false);
    }
  };

  const symbolIcons: Record<TaskSymbol, React.ReactNode> = {
    bullet: <div className="w-2 h-2 rounded-full bg-foreground" />,
    complete: <X className="w-4 h-4" strokeWidth={3} />,
    migrated: <ArrowRight className="w-4 h-4" strokeWidth={3} />,
    scheduled: <ChevronLeft className="w-4 h-4" strokeWidth={3} />,
    note: <Minus className="w-4 h-4" strokeWidth={3} />,
    event: <Dot className="w-4 h-4" strokeWidth={3} />,
  };

  const symbolLabelsMap: Record<TaskSymbol, string> = {
    bullet: 'Task',
    complete: 'Complete',
    migrated: 'Migrated',
    scheduled: 'Scheduled',
    note: 'Note',
    event: 'Event',
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-foreground animate-pulse" />
            <p className="text-sm text-muted-foreground">Loading stats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppNav />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">No data available</p>
        </div>
      </div>
    );
  }

  const activeTasks = stats.overview.totalTasks - stats.overview.completedTasks - stats.overview.migratedTasks;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <AppNav />

      <main className="w-full mx-auto py-8 px-6 flex-1">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Track your productivity and progress</p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Task Today
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Task for Today</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Task</label>
                    <Input
                      value={taskInput}
                      onChange={(e) => setTaskInput(e.target.value)}
                      placeholder="Enter task..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !addingTask) {
                          handleAddTask();
                        }
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Symbol</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(symbolIcons) as TaskSymbol[]).map((symbol) => (
                        <Button
                          key={symbol}
                          variant={selectedSymbol === symbol ? 'default' : 'outline'}
                          className="gap-2 justify-start"
                          onClick={() => setSelectedSymbol(symbol)}
                        >
                          <div className="flex items-center justify-center w-5 h-5">
                            {symbolIcons[symbol]}
                          </div>
                          <span className="text-xs">{symbolLabelsMap[symbol]}</span>
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddTask}
                      disabled={!taskInput.trim() || addingTask}
                      className="flex-1"
                    >
                      {addingTask ? 'Adding...' : 'Add Task'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setTaskInput('');
                        setSelectedSymbol('bullet');
                      }}
                      disabled={addingTask}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Tasks"
              value={stats.overview.totalTasks}
              description="All time"
              icon={Circle}
            />
            <StatCard
              title="Completed"
              value={stats.overview.completedTasks}
              description={`${stats.overview.completionRate}% completion rate`}
              icon={CheckCircle2}
            />
            <StatCard
              title="Active Tasks"
              value={activeTasks}
              description="In progress"
              icon={Target}
            />
            <StatCard
              title="Collections"
              value={stats.overview.totalCollections}
              description="Custom lists"
              icon={BookOpen}
            />
          </div>

          {/* Completion Rate & Streaks */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Completion Rate Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Completion Rate
                </CardTitle>
                <CardDescription>How many tasks you complete</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <ProgressRing progress={stats.overview.completionRate} />
              </CardContent>
            </Card>

            {/* Streak Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5" />
                  Activity Streaks
                </CardTitle>
                <CardDescription>Consecutive days logging</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Current Streak</p>
                    <p className="text-3xl font-bold mt-1">{stats.streaks.current}</p>
                  </div>
                  <Flame className="h-12 w-12 text-orange-500" />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Longest Streak</p>
                    <p className="text-2xl font-bold mt-1">{stats.streaks.longest}</p>
                  </div>
                  <Target className="h-10 w-10 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Heatmaps - 3 Column Grid */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Productivity Heatmap */}
            {stats.productivityTimeline.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Productivity Heatmap
                  </CardTitle>
                  <CardDescription>Task completion rate over the past 12 weeks</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <ProductivityHeatmap data={stats.productivityTimeline} weeks={12} />
                </CardContent>
              </Card>
            )}

            {/* Activity Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activity Heatmap
                </CardTitle>
                <CardDescription>Your task activity over the past 12 weeks</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <ActivityHeatmap
                  data={stats.recentActivity.map(a => ({ date: a.date, tasks: a.tasks }))}
                  weeks={12}
                />
              </CardContent>
            </Card>

            {/* Mood Calendar */}
            {stats.moods.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Smile className="h-5 w-5" />
                    Mood Tracker
                  </CardTitle>
                  <CardDescription>How you&apos;ve been feeling over the past 12 weeks</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <MoodCalendar data={stats.moods} weeks={12} />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Tasks Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Tasks Breakdown
              </CardTitle>
              <CardDescription>Distribution by status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.tasksBySymbol).map(([symbol, count]) => {
                  const percentage = stats.overview.totalTasks > 0
                    ? (count / stats.overview.totalTasks) * 100
                    : 0;

                  return (
                    <div key={symbol} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{symbolLabels[symbol] || symbol}</span>
                        <span className="text-muted-foreground">
                          {count} ({Math.round(percentage)}%)
                        </span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Entries by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Entries by Type
              </CardTitle>
              <CardDescription>Your journaling habits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {Object.entries(stats.entriesByType).map(([type, count]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <p className="text-sm font-medium text-muted-foreground capitalize">{type}</p>
                    <p className="text-2xl font-bold mt-1">{count}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          {stats.recentActivity.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Last 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.date} className="flex items-center justify-between py-2 px-3 hover:bg-muted/50 rounded">
                      <span className="text-sm font-medium">
                        {new Date(activity.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>{activity.entries} entries</span>
                        <span>{activity.tasks} tasks</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}
