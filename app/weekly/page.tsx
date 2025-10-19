'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay } from 'date-fns';
import { Task, TaskSymbol } from '@/components/TaskList';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar, X, ArrowRight, ChevronLeft as ChevronLeftIcon, Minus, Dot } from 'lucide-react';

interface TaskWithDate extends Task {
  date: string;
  entry_type: string;
}

export default function WeeklyPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasksByDay, setTasksByDay] = useState<Record<string, TaskWithDate[]>>({});
  const [loading, setLoading] = useState(true);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    loadWeekTasks();
  }, [currentDate]);

  const loadWeekTasks = async () => {
    setLoading(true);
    try {
      const startDateStr = format(weekStart, 'yyyy-MM-dd');
      const endDateStr = format(weekEnd, 'yyyy-MM-dd');

      const response = await fetch(
        `/api/tasks/range?startDate=${startDateStr}&endDate=${endDateStr}&type=daily`
      );

      if (response.status === 401) {
        router.push('/login');
        return;
      }

      const tasks: TaskWithDate[] = await response.json();

      // Group tasks by day
      const grouped: Record<string, TaskWithDate[]> = {};
      daysInWeek.forEach(day => {
        const dateStr = format(day, 'yyyy-MM-dd');
        grouped[dateStr] = tasks.filter(t => t.date === dateStr);
      });

      setTasksByDay(grouped);
    } catch (error) {
      console.error('Error loading week tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTask = async (id: number, content: string, symbol: TaskSymbol) => {
    try {
      await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, content, symbol }),
      });

      // Update local state
      setTasksByDay(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(date => {
          updated[date] = updated[date].map(t =>
            t.id === id ? { ...t, content, symbol } : t
          );
        });
        return updated;
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToThisWeek = () => setCurrentDate(new Date());

  const symbolIcons: Record<TaskSymbol, React.ReactNode> = {
    bullet: <div className="w-2 h-2 rounded-full bg-foreground" />,
    complete: <X className="w-4 h-4" strokeWidth={3} />,
    migrated: <ArrowRight className="w-4 h-4" strokeWidth={3} />,
    scheduled: <ChevronLeftIcon className="w-4 h-4" strokeWidth={3} />,
    note: <Minus className="w-4 h-4" strokeWidth={3} />,
    event: <Dot className="w-4 h-4" strokeWidth={3} />,
  };

  const getSymbolOptions = (currentSymbol: TaskSymbol): TaskSymbol[] => {
    const allSymbols: TaskSymbol[] = ['bullet', 'complete', 'migrated', 'scheduled', 'note', 'event'];
    return allSymbols.filter(s => s !== currentSymbol);
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

  const isThisWeek = format(weekStart, 'yyyy-MM-dd') === format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  return (
    <AppLayout>
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPreviousWeek}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Previous</span>
              </Button>

              <div className="flex flex-col items-center gap-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  Week
                </h1>
                <p className="text-sm text-muted-foreground">
                  {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                </p>
                {!isThisWeek && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToThisWeek}
                    className="gap-1 h-7"
                  >
                    <Calendar className="h-3 w-3" />
                    <span className="text-xs">This Week</span>
                  </Button>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={goToNextWeek}
                className="gap-1"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {daysInWeek.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDay[dateStr] || [];
                const isToday = isSameDay(day, new Date());

                return (
                  <div key={dateStr} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <h3 className={`text-sm font-semibold ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {format(day, 'EEEE, MMM d')}
                        {isToday && (
                          <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-foreground text-background rounded">
                            Today
                          </span>
                        )}
                      </h3>
                      <div className="flex-1 h-px bg-border" />
                    </div>

                    {dayTasks.length === 0 ? (
                      <p className="text-sm text-muted-foreground pl-4">No tasks for this day</p>
                    ) : (
                      <div className="space-y-2">
                        {dayTasks.map(task => {
                          if (!task.id) return null;
                          return (
                            <div
                              key={task.id}
                              className="group flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 transition-colors"
                            >
                              <div className="relative pt-1">
                                <button
                                  onClick={() => {
                                    const options = getSymbolOptions(task.symbol);
                                    const nextSymbol = options[0];
                                    if (task.id) {
                                      handleUpdateTask(task.id, task.content, nextSymbol);
                                    }
                                  }}
                                  className="flex items-center justify-center w-5 h-5 hover:bg-muted rounded transition-colors"
                                >
                                  {symbolIcons[task.symbol]}
                                </button>
                              </div>

                              <div className="flex-1 min-w-0">
                                <p className={`text-sm break-words ${
                                  task.symbol === 'complete' ? 'line-through text-muted-foreground' : ''
                                }`}>
                                  {task.content}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
