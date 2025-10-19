'use client';

import { format, subDays, startOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';

interface ProductivityData {
  date: string;
  completed: number;
  total: number;
}

interface ProductivityHeatmapProps {
  data: ProductivityData[];
  weeks?: number;
}

export default function ProductivityHeatmap({ data, weeks = 12 }: ProductivityHeatmapProps) {
  const today = new Date();
  const startDate = subDays(today, weeks * 7);
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, weeks)
  });

  // Create a map for quick lookup
  const productivityMap = new Map(
    data.map(d => [d.date, { completed: d.completed, total: d.total }])
  );

  // Get intensity based on completion rate
  const getIntensity = (completed: number, total: number): string => {
    if (total === 0) return 'bg-muted';

    const rate = (completed / total) * 100;

    if (rate === 0) return 'bg-red-200 dark:bg-red-900/40';
    if (rate <= 25) return 'bg-orange-300 dark:bg-orange-800/50';
    if (rate <= 50) return 'bg-yellow-400 dark:bg-yellow-700/60';
    if (rate <= 75) return 'bg-lime-500 dark:bg-lime-600/70';
    if (rate < 100) return 'bg-green-600 dark:bg-green-500/80';
    return 'bg-green-800 dark:bg-green-400'; // 100%
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
                  const productivity = productivityMap.get(dateStr);
                  const isFuture = day > today;

                  const completed = productivity?.completed || 0;
                  const total = productivity?.total || 0;
                  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-sm ${
                        isFuture
                          ? 'bg-transparent border border-border/30'
                          : getIntensity(completed, total)
                      } transition-colors cursor-pointer hover:ring-2 hover:ring-foreground/20`}
                      title={
                        total > 0
                          ? `${format(day, 'MMM d, yyyy')}: ${completed}/${total} tasks (${rate}%)`
                          : `${format(day, 'MMM d, yyyy')}: No tasks`
                      }
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
        <span>0%</span>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-sm bg-red-200 dark:bg-red-900/40" title="0%" />
          <div className="w-4 h-4 rounded-sm bg-orange-300 dark:bg-orange-800/50" title="1-25%" />
          <div className="w-4 h-4 rounded-sm bg-yellow-400 dark:bg-yellow-700/60" title="26-50%" />
          <div className="w-4 h-4 rounded-sm bg-lime-500 dark:bg-lime-600/70" title="51-75%" />
          <div className="w-4 h-4 rounded-sm bg-green-600 dark:bg-green-500/80" title="76-99%" />
          <div className="w-4 h-4 rounded-sm bg-green-800 dark:bg-green-400" title="100%" />
        </div>
        <span>100%</span>
      </div>
    </div>
  );
}
