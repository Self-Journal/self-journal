'use client';

import { format, subDays, startOfWeek, eachDayOfInterval, addWeeks } from 'date-fns';
import { moodConfig } from './MoodSelector';
import type { MoodType } from './MoodSelector';

interface MoodData {
  date: string;
  mood: string;
}

interface MoodCalendarProps {
  data: MoodData[];
  weeks?: number;
}

export default function MoodCalendar({ data, weeks = 12 }: MoodCalendarProps) {
  const today = new Date();
  const startDate = subDays(today, weeks * 7);
  const weekStart = startOfWeek(startDate, { weekStartsOn: 0 });

  const days = eachDayOfInterval({
    start: weekStart,
    end: addWeeks(weekStart, weeks)
  });

  const moodMap = new Map(
    data.map(d => [d.date, d.mood as MoodType])
  );

  const getMoodColor = (mood: MoodType | undefined): string => {
    if (!mood) return 'bg-muted';

    const colorMap: Record<MoodType, string> = {
      amazing: 'bg-green-500',
      good: 'bg-blue-500',
      okay: 'bg-yellow-500',
      bad: 'bg-orange-500',
      terrible: 'bg-red-500'
    };

    return colorMap[mood];
  };

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
        <div className="flex flex-col justify-between text-sm text-muted-foreground pr-3 py-2">
          {[1, 3, 5].map(i => (
            <div key={i} className="h-4 flex items-center">
              {dayLabels[i]}
            </div>
          ))}
        </div>

        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-1.5 mb-1 text-xs text-muted-foreground">
            {monthLabels.map((month, i) => (
              <div key={i} className="flex-1 min-w-[3px]">
                {month}
              </div>
            ))}
          </div>

          <div className="flex gap-1.5">
            {weekGroups.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-1.5">
                {week.map((day) => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const mood = moodMap.get(dateStr);
                  const isFuture = day > today;

                  return (
                    <div
                      key={dateStr}
                      className={`w-3 h-3 rounded-sm ${
                        isFuture ? 'bg-transparent border border-border/30' : getMoodColor(mood)
                      } transition-colors cursor-pointer hover:ring-2 hover:ring-foreground/20`}
                      title={mood ? `${format(day, 'MMM d, yyyy')}: ${moodConfig[mood].label}` : format(day, 'MMM d, yyyy')}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap text-sm">
        {Object.entries(moodConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={`w-4 h-4 rounded-sm ${getMoodColor(key as MoodType)}`} />
            <span className="text-muted-foreground">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
