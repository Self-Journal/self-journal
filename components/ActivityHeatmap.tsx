'use client';

import { format, subDays, startOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';

interface ActivityData {
  date: string;
  tasks: number;
}

interface ActivityHeatmapProps {
  data: ActivityData[];
  weeks?: number;
}

export default function ActivityHeatmap({ data, weeks = 12 }: ActivityHeatmapProps) {
  const today = new Date();
  const startDate = subDays(today, weeks * 7);
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday

  // Generate all days for the grid
  const days = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, weeks)
  });

  // Create a map for quick lookup
  const activityMap = new Map(
    data.map(d => [d.date, d.tasks])
  );

  // Get intensity level based on task count
  const getIntensity = (tasks: number): string => {
    if (tasks === 0) return 'bg-muted';
    if (tasks <= 2) return 'bg-green-200 dark:bg-green-900/40';
    if (tasks <= 5) return 'bg-green-400 dark:bg-green-700/60';
    if (tasks <= 8) return 'bg-green-600 dark:bg-green-500/80';
    return 'bg-green-800 dark:bg-green-400';
  };

  // Group days by week
  const weekGroups: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekGroups.push(days.slice(i, i + 7));
  }

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthLabels: string[] = [];
  let currentMonth = '';

  weekGroups.forEach((week) => {
    const monthName = format(week[0], 'MMM');
    if (monthName !== currentMonth) {
      monthLabels.push(monthName);
      currentMonth = monthName;
    } else {
      monthLabels.push('');
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {/* Day labels */}
        <div className="flex flex-col justify-between text-sm text-muted-foreground pr-3 py-2">
          {[1, 3, 5].map(i => (
            <div key={i} className="h-4 flex items-center">
              {dayLabels[i]}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-1.5 mb-1 text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="flex-1 min-w-[3px]">
                {month}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex gap-1.5">
            {weekGroups.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const tasks = activityMap.get(dateStr) || 0;
                  const isFuture = day > today;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-sm ${
                        isFuture ? 'bg-transparent border border-border/30' : getIntensity(tasks)
                      } transition-colors cursor-pointer hover:ring-2 hover:ring-foreground/20`}
                      title={`${format(day, 'MMM d, yyyy')}: ${tasks} tasks`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Less</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-muted" />
          <div className="w-4 h-4 rounded-sm bg-green-200 dark:bg-green-900/40" />
          <div className="w-4 h-4 rounded-sm bg-green-400 dark:bg-green-700/60" />
          <div className="w-4 h-4 rounded-sm bg-green-600 dark:bg-green-500/80" />
          <div className="w-4 h-4 rounded-sm bg-green-800 dark:bg-green-400" />
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
