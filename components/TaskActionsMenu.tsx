'use client';

import { useState } from 'react';
import { CheckCircle, ArrowRight, Calendar, Edit2, Trash2, X, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TaskSymbol } from './TaskList';
import RecurrenceSelector, { RecurrencePattern } from './RecurrenceSelector';

interface TaskActionsMenuProps {
  isOpen: boolean;
  onClose: () => void;
  taskContent: string;
  currentSymbol: TaskSymbol;
  isRecurring?: boolean;
  recurrencePattern?: string | null;
  onComplete: () => void;
  onMigrate: () => void;
  onSchedule: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetRecurring?: (pattern: RecurrencePattern) => void;
  onRemoveRecurring?: () => void;
}

export default function TaskActionsMenu({
  isOpen,
  onClose,
  taskContent,
  currentSymbol,
  isRecurring = false,
  recurrencePattern = null,
  onComplete,
  onMigrate,
  onSchedule,
  onEdit,
  onDelete,
  onSetRecurring,
  onRemoveRecurring,
}: TaskActionsMenuProps) {
  const [showRecurrenceSelector, setShowRecurrenceSelector] = useState(false);

  if (!isOpen) return null;

  const handleSetRecurring = (pattern: RecurrencePattern) => {
    if (onSetRecurring) {
      onSetRecurring(pattern);
      setShowRecurrenceSelector(false);
      onClose();
    }
  };

  const handleRemoveRecurring = () => {
    if (onRemoveRecurring) {
      onRemoveRecurring();
      onClose();
    }
  };

  const actions = [
    {
      icon: CheckCircle,
      label: 'Mark Complete',
      onClick: () => {
        onComplete();
        onClose();
      },
      variant: 'default' as const,
      show: currentSymbol !== 'complete',
    },
    {
      icon: ArrowRight,
      label: 'Migrate to Tomorrow',
      onClick: () => {
        onMigrate();
        onClose();
      },
      variant: 'outline' as const,
      show: true,
    },
    {
      icon: Calendar,
      label: 'Schedule for Later',
      onClick: () => {
        onSchedule();
        onClose();
      },
      variant: 'outline' as const,
      show: true,
    },
    {
      icon: Repeat,
      label: isRecurring ? `Remove Recurrence (${recurrencePattern})` : 'Make Recurring',
      onClick: () => {
        if (isRecurring) {
          handleRemoveRecurring();
        } else {
          setShowRecurrenceSelector(true);
        }
      },
      variant: 'outline' as const,
      show: !!(onSetRecurring || onRemoveRecurring),
    },
    {
      icon: Edit2,
      label: 'Edit',
      onClick: () => {
        onEdit();
        onClose();
      },
      variant: 'outline' as const,
      show: true,
    },
    {
      icon: Trash2,
      label: 'Delete',
      onClick: () => {
        if (confirm('Delete this task?')) {
          onDelete();
          onClose();
        }
      },
      variant: 'outline' as const,
      show: true,
    },
  ];

  // If recurrence selector is shown, render it instead of the actions menu
  if (showRecurrenceSelector) {
    return (
      <RecurrenceSelector
        onSelect={handleSetRecurring}
        onCancel={() => setShowRecurrenceSelector(false)}
      />
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 animate-in slide-in-from-bottom duration-300">
        <div className="bg-background rounded-t-2xl shadow-lg border-t">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Task Preview */}
          <div className="px-6 py-4 border-b">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium line-clamp-2 flex-1">
                {taskContent}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 space-y-2 pb-safe">
            {actions
              .filter((action) => action.show)
              .map((action) => {
                const Icon = action.icon;
                return (
                  <Button
                    key={action.label}
                    variant={action.variant}
                    onClick={action.onClick}
                    className="w-full justify-start gap-3 h-14 text-base"
                  >
                    <Icon className="h-5 w-5" />
                    {action.label}
                  </Button>
                );
              })}
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe" />
        </div>
      </div>
    </>
  );
}
