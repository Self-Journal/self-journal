'use client';

import { Calendar, CalendarDays, CalendarClock, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface RecurrenceSelectorProps {
  onSelect: (pattern: RecurrencePattern) => void;
  onCancel: () => void;
}

const recurrenceOptions: { pattern: RecurrencePattern; label: string; description: string; icon: React.ReactNode }[] = [
  {
    pattern: 'daily',
    label: 'Daily',
    description: 'Repeats every day',
    icon: <Calendar className="h-5 w-5" />,
  },
  {
    pattern: 'weekly',
    label: 'Weekly',
    description: 'Repeats every week',
    icon: <CalendarDays className="h-5 w-5" />,
  },
  {
    pattern: 'monthly',
    label: 'Monthly',
    description: 'Repeats every month',
    icon: <CalendarClock className="h-5 w-5" />,
  },
  {
    pattern: 'yearly',
    label: 'Yearly',
    description: 'Repeats every year',
    icon: <CalendarRange className="h-5 w-5" />,
  },
];

export default function RecurrenceSelector({ onSelect, onCancel }: RecurrenceSelectorProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={onCancel}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-background rounded-t-2xl shadow-lg border-t">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b">
            <h3 className="text-lg font-semibold">Select Recurrence Pattern</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Choose how often this task should repeat
            </p>
          </div>

          {/* Options */}
          <div className="px-6 py-4 space-y-2">
            {recurrenceOptions.map((option) => (
              <Button
                key={option.pattern}
                variant="outline"
                onClick={() => onSelect(option.pattern)}
                className="w-full justify-start gap-3 h-auto py-4"
              >
                <div className="shrink-0 text-primary">{option.icon}</div>
                <div className="flex-1 text-left">
                  <div className="font-medium">{option.label}</div>
                  <div className="text-xs text-muted-foreground">{option.description}</div>
                </div>
              </Button>
            ))}
          </div>

          {/* Cancel Button */}
          <div className="px-6 py-4 border-t">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe" />
        </div>
      </div>
    </>
  );
}
