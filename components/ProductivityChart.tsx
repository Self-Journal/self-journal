'use client';

import { format, parseISO } from 'date-fns';

interface ProductivityData {
  date: string;
  completed: number;
  total: number;
}

interface ProductivityChartProps {
  data: ProductivityData[];
}

export default function ProductivityChart({ data }: ProductivityChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-muted-foreground">
        No productivity data yet
      </div>
    );
  }

  const maxTasks = Math.max(...data.map(d => d.total), 1);
  const chartHeight = 150;

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-muted-foreground pr-2">
          <span>{maxTasks}</span>
          <span>{Math.floor(maxTasks / 2)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="ml-8 h-full flex items-end gap-0.5">
          {data.map((item) => {
            const totalHeight = (item.total / maxTasks) * 100;
            const completedHeight = item.total > 0 ? (item.completed / item.total) * totalHeight : 0;

            return (
              <div
                key={item.date}
                className="flex-1 flex flex-col justify-end group relative"
                style={{ height: '100%' }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                  <div className="bg-popover border rounded-md shadow-md px-3 py-2 text-xs whitespace-nowrap">
                    <p className="font-medium">{format(parseISO(item.date), 'MMM d')}</p>
                    <p className="text-muted-foreground">
                      {item.completed} of {item.total} completed
                    </p>
                  </div>
                </div>

                {/* Bar */}
                <div
                  className="w-full bg-muted rounded-t-sm transition-all"
                  style={{ height: `${totalHeight}%` }}
                >
                  <div
                    className="w-full bg-foreground rounded-t-sm"
                    style={{ height: `${completedHeight}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels (show every 5th day) */}
      <div className="ml-8 flex justify-between text-xs text-muted-foreground">
        {data.filter((_, i) => i % 5 === 0).map((item, i) => (
          <span key={i}>{format(parseISO(item.date), 'MMM d')}</span>
        ))}
      </div>
    </div>
  );
}
