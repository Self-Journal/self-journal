'use client';

import { format, subDays, startOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';

interface CompletionData {
  date: string;
  completed: number;
}

interface TaskActivityHeatmapProps {
  taskId: number;
  data: CompletionData[];
  weeks?: number;
}

export default function TaskActivityHeatmap({ data, weeks = 8 }: TaskActivityHeatmapProps) {
  const today = new Date();
  const startDate = subDays(today, weeks * 7);
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 }); // Sunday

  // Generate all days for the grid
  const days = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, weeks)
  });

  // Create a map for quick lookup
  const completionMap = new Map(
    data.map(d => [d.date, d.completed])
  );

  // Get color based on completion status
  const getColor = (completed: number): string => {
    if (completed === 0) return 'bg-muted';
    return 'bg-blue-500 dark:bg-blue-600';
  };

  // Group days by week
  const weekGroups: Date[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weekGroups.push(days.slice(i, i + 7));
  }

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
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
    <div className="space-y-2 py-2">
      <div className="flex gap-1">
        {/* Compact day labels */}
        <div className="flex flex-col justify-between text-[10px] text-muted-foreground pr-1">
          {[1, 3, 5].map(i => (
            <div key={i} className="h-3 flex items-center">
              {dayLabels[i]}
            </div>
          ))}
        </div>

        {/* Heatmap grid */}
        <div className="flex-1 overflow-x-auto">
          {/* Month labels */}
          <div className="flex gap-0.5 mb-0.5 text-[10px] text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="flex-1 min-w-[2px]">
                {month}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="flex gap-0.5">
            {weekGroups.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-0.5">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const completed = completionMap.get(dateStr) || 0;
                  const isFuture = day > today;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-[2px] ${
                        isFuture
                          ? 'bg-transparent border border-border/30'
                          : getColor(completed)
                      } transition-colors cursor-pointer hover:ring-1 hover:ring-foreground/30`}
                      title={`${format(day, 'MMM d, yyyy')}: ${completed ? 'Completed' : 'Not done'}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Compact Legend */}
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-muted" />
          <span>Not done</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-[2px] bg-blue-500" />
          <span>Done</span>
        </div>
      </div>
    </div>
  );
}
