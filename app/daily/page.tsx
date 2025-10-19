'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, subDays } from 'date-fns';
import TaskList, { Task, TaskSymbol } from '@/components/TaskList';
import MoodSelector, { MoodType, MoodEntry } from '@/components/MoodSelector';
import ActivityHeatmap from '@/components/ActivityHeatmap';
import AppLayout from '@/components/AppLayout';
import FloatingActionButton from '@/components/FloatingActionButton';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function DailyPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [entryId, setEntryId] = useState<number | null>(null);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activityData, setActivityData] = useState<{ date: string; tasks: number }[]>([]);
  const taskListRef = useRef<HTMLDivElement>(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const scrollToTaskList = () => {
    if (taskListRef.current) {
      taskListRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    loadEntry();
    loadMoodEntries();
    loadActivityData();
  }, [currentDate]);

  const loadActivityData = async () => {
    try {
      const response = await fetch('/api/stats');
      if (response.ok) {
        const data = await response.json();
        // Transform productivityTimeline data for ActivityHeatmap
        const activityData = data.productivityTimeline.map((day: { date: string; completed: number; total: number }) => ({
          date: day.date,
          tasks: day.completed
        }));
        setActivityData(activityData);
      }
    } catch (error) {
      console.error('Error loading activity data:', error);
    }
  };

  const loadEntry = async () => {
    setLoading(true);
    try {
      // First, generate any recurring tasks for this date
      await fetch('/api/tasks/generate-recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr }),
      });

      const response = await fetch(`/api/entries?date=${dateStr}&type=daily`);
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const entry = await response.json();

      if (entry) {
        setEntryId(entry.id);
        const tasksResponse = await fetch(`/api/tasks?entryId=${entry.id}`);
        const tasksData = await tasksResponse.json();
        setTasks(tasksData);
      } else {
        const createResponse = await fetch('/api/entries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: dateStr, type: 'daily' }),
        });
        const newEntry = await createResponse.json();
        setEntryId(newEntry.id);
        setTasks([]);
      }
    } catch (error) {
      console.error('Error loading entry:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoodEntries = async () => {
    try {
      const response = await fetch(`/api/mood-entries?date=${dateStr}`);
      if (response.ok) {
        const entries = await response.json();
        setMoodEntries(entries);
      }
    } catch (error) {
      console.error('Error loading mood entries:', error);
    }
  };

  const handleAddMood = async (mood: MoodType, time: string, note?: string) => {
    try {
      const response = await fetch('/api/mood-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateStr, time, mood, note: note || '' }),
      });

      if (response.ok) {
        const result = await response.json();
        // Add the new entry to the list
        setMoodEntries([...moodEntries, { id: Number(result.id), time, mood, note }]);
      }
    } catch (error) {
      console.error('Error saving mood entry:', error);
    }
  };

  const handleDeleteMood = async (id: number) => {
    try {
      const response = await fetch(`/api/mood-entries?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the entry from the list
        setMoodEntries(moodEntries.filter(entry => entry.id !== id));
      }
    } catch (error) {
      console.error('Error deleting mood entry:', error);
    }
  };

  const handleAddTask = async (content: string, symbol: TaskSymbol) => {
    if (!entryId) return;

    try {
      const position = tasks.length;
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId, content, symbol, position }),
      });
      const { id } = await response.json();
      setTasks([...tasks, { id, content, symbol, position }]);
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const handleUpdateTask = async (id: number, content: string, symbol: TaskSymbol) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content, symbol }),
      });

      // If task is being marked as complete and is recurring, record completion
      const task = tasks.find(t => t.id === id);
      if (symbol === 'complete' && task?.is_recurring === 1) {
        await fetch('/api/tasks/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: id, date: dateStr, completed: 1 }),
        });
      }

      setTasks(tasks.map(t => t.id === id ? { ...t, content, symbol } : t));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleSetRecurring = async (id: number, pattern: string) => {
    try {
      await fetch('/api/tasks/recurring', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, recurrencePattern: pattern }),
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, is_recurring: 1, recurrence_pattern: pattern } : t));
    } catch (error) {
      console.error('Error setting recurring:', error);
    }
  };

  const handleRemoveRecurring = async (id: number) => {
    try {
      await fetch('/api/tasks/recurring', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: id, recurrencePattern: null }),
      });
      setTasks(tasks.map(t => t.id === id ? { ...t, is_recurring: 0, recurrence_pattern: null } : t));
    } catch (error) {
      console.error('Error removing recurring:', error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const goToPreviousDay = () => setCurrentDate(subDays(currentDate, 1));
  const goToNextDay = () => setCurrentDate(addDays(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

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

  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousDay}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {format(currentDate, 'EEEE')}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(currentDate, 'MMMM d, yyyy')}
                </p>
                {!isToday && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToToday}
                    className="gap-1 h-7"
                  >
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">Today</span>
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextDay}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Mood Tracker */}
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <MoodSelector
                moodEntries={moodEntries}
                onAddMood={handleAddMood}
                onDeleteMood={handleDeleteMood}
              />
            </div>

            <Separator className="my-6" />

            {/* Tasks */}
            <div ref={taskListRef}>
              <TaskList
                tasks={tasks}
                onAddTask={handleAddTask}
                onUpdateTask={handleUpdateTask}
                onDeleteTask={handleDeleteTask}
                onSetRecurring={handleSetRecurring}
                onRemoveRecurring={handleRemoveRecurring}
              />
            </div>

            {/* Activity Overview Heatmap */}
            {activityData.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground">Activity Overview</h3>
                  <ActivityHeatmap data={activityData} weeks={12} />
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Floating Action Button (Mobile Only) */}
      <FloatingActionButton onClick={scrollToTaskList} label="Add task" />
    </AppLayout>
  );
}
