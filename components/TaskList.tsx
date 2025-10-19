'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X, ChevronRight, ChevronLeft, Circle, Minus, Check, MoreVertical, Repeat, BarChart3 } from 'lucide-react';
import TaskActionsMenu from './TaskActionsMenu';
import TaskActivityHeatmap from './TaskActivityHeatmap';

export type TaskSymbol = 'bullet' | 'complete' | 'migrated' | 'scheduled' | 'note' | 'event';

export interface Task {
  id?: number;
  content: string;
  symbol: TaskSymbol;
  position: number;
  is_recurring?: number;
  recurrence_pattern?: string | null;
  parent_task_id?: number | null;
}

interface TaskListProps {
  tasks: Task[];
  onAddTask: (content: string, symbol: TaskSymbol, afterSection?: string, isRecurring?: boolean) => void;
  onUpdateTask: (id: number, content: string, symbol: TaskSymbol) => void;
  onDeleteTask: (id: number) => void;
  onSetRecurring?: (id: number, pattern: string) => void;
  onRemoveRecurring?: (id: number) => void;
}

const symbolConfig: Record<TaskSymbol, { icon: React.ReactNode; label: string; description: string }> = {
  bullet: {
    icon: <div className="w-2 h-2 rounded-full bg-foreground" />,
    label: 'Task',
    description: 'A task to do'
  },
  complete: {
    icon: <X className="w-4 h-4" strokeWidth={3} />,
    label: 'Complete',
    description: 'Completed task'
  },
  migrated: {
    icon: <ChevronRight className="w-4 h-4" strokeWidth={3} />,
    label: 'Migrated',
    description: 'Moved to another day'
  },
  scheduled: {
    icon: <ChevronLeft className="w-4 h-4" strokeWidth={3} />,
    label: 'Scheduled',
    description: 'Scheduled for later'
  },
  note: {
    icon: <Minus className="w-4 h-4" strokeWidth={3} />,
    label: 'Note',
    description: 'A note or observation'
  },
  event: {
    icon: <Circle className="w-4 h-4" strokeWidth={2} />,
    label: 'Event',
    description: 'An event or appointment'
  }
};

export default function TaskList({ tasks, onAddTask, onUpdateTask, onDeleteTask, onSetRecurring, onRemoveRecurring }: TaskListProps) {
  const router = useRouter();
  const [newTaskContent, setNewTaskContent] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState<TaskSymbol>('bullet');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editSymbol, setEditSymbol] = useState<TaskSymbol>('bullet');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState<number | null>(null);
  const [swipeState, setSwipeState] = useState<{ id: number; offset: number } | null>(null);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [expandedHeatmap, setExpandedHeatmap] = useState<number | null>(null);
  const [completionData, setCompletionData] = useState<Record<number, { date: string; completed: number }[]>>({});

  // Get all sections (notes) from the task list
  const sections = tasks
    .filter(task => task.symbol === 'note' && task.content.trim())
    .map(task => task.content);

  // Auto-select the last section if not already selected
  if (!selectedSection && sections.length > 0) {
    setSelectedSection(sections[sections.length - 1]);
  }

  // Detect when a new task is added and trigger animation
  useEffect(() => {
    if (tasks.length > 0) {
      const lastTask = tasks[tasks.length - 1];
      if (lastTask.id && lastTask.id !== justAdded) {
        setJustAdded(lastTask.id);
        // Clear animation after 1 second
        setTimeout(() => setJustAdded(null), 1000);
      }
    }
  }, [tasks]);

  // Fetch completion data when heatmap is expanded
  const fetchCompletionData = async (taskId: number) => {
    if (completionData[taskId]) return; // Already fetched

    try {
      const response = await fetch(`/api/tasks/completions?taskId=${taskId}`);
      if (response.ok) {
        const data = await response.json();
        setCompletionData(prev => ({ ...prev, [taskId]: data }));
      }
    } catch (error) {
      console.error('Error fetching completion data:', error);
    }
  };

  const toggleHeatmap = (taskId: number) => {
    if (expandedHeatmap === taskId) {
      setExpandedHeatmap(null);
    } else {
      setExpandedHeatmap(taskId);
      fetchCompletionData(taskId);
    }
  };

  const handleAdd = () => {
    if (newTaskContent.trim()) {
      onAddTask(newTaskContent, selectedSymbol, selectedSection || undefined);
      setNewTaskContent('');
      setSelectedSymbol('bullet');

      // Show success feedback
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 600);
    }
  };

  const handleEdit = (task: Task) => {
    if (task.id) {
      setEditingId(task.id);
      setEditContent(task.content);
      setEditSymbol(task.symbol);
    }
  };

  const handleSaveEdit = () => {
    if (editingId && editContent.trim()) {
      onUpdateTask(editingId, editContent, editSymbol);
      setEditingId(null);
      setEditContent('');
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent('');
  };

  const cycleSymbol = (currentSymbol: TaskSymbol): TaskSymbol => {
    const symbols: TaskSymbol[] = ['bullet', 'complete', 'migrated', 'scheduled'];
    const currentIndex = symbols.indexOf(currentSymbol);
    return symbols[(currentIndex + 1) % symbols.length];
  };

  const handleTouchStart = (e: React.TouchEvent, taskId: number) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setSwipeState(null);
  };

  const handleTouchMove = (e: React.TouchEvent, _taskId: number) => {
    if (!touchStart) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only swipe if horizontal movement is dominant
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      e.preventDefault();
      setSwipeState({ id: _taskId, offset: deltaX });
    }
  };

  const handleTouchEnd = (task: Task) => {
    if (!swipeState || !task.id) {
      setSwipeState(null);
      setTouchStart(null);
      return;
    }

    const threshold = 80; // Minimum swipe distance

    // Swipe Right → Migrate to Tomorrow (Future)
    if (swipeState.offset > threshold) {
      onUpdateTask(task.id, task.content, 'migrated');
    }
    // Swipe Left → Mark as Past/Complete
    else if (swipeState.offset < -threshold) {
      onUpdateTask(task.id, task.content, 'complete');
    }

    setSwipeState(null);
    setTouchStart(null);
  };

  return (
    <div className="space-y-6">
      {/* Task List */}
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <Card className="p-8 text-center border-dashed">
            <p className="text-muted-foreground text-sm">No entries yet. Add your first task below.</p>
          </Card>
        ) : (
          tasks.map((task, index) => {
            const isJustAdded = task.id === justAdded;
            const isSwiping = swipeState?.id === task.id;
            const swipeOffset = isSwiping && swipeState ? swipeState.offset : 0;
            const isSwipeRight = swipeOffset > 0;
            const isSwipeLeft = swipeOffset < 0;
            const swipeProgress = Math.min(Math.abs(swipeOffset) / 80, 1);

            return (
            <div
              key={task.id || `task-${index}`}
              className="relative overflow-hidden"
              onTouchStart={(e) => task.id && handleTouchStart(e, task.id)}
              onTouchMove={(e) => task.id && handleTouchMove(e, task.id)}
              onTouchEnd={() => handleTouchEnd(task)}
            >
              {/* Swipe Action Backgrounds */}
              {isSwiping && (
                <>
                  {/* Right Swipe → Migrate to Tomorrow (Blue - Future) */}
                  {isSwipeRight && (
                    <div
                      className="absolute inset-y-0 left-0 bg-blue-500 flex items-center px-6"
                      style={{ width: Math.abs(swipeOffset) }}
                    >
                      <ChevronRight className="h-6 w-6 text-white" style={{ opacity: swipeProgress }} />
                    </div>
                  )}

                  {/* Left Swipe → Mark Complete (Green - Past/Done) */}
                  {isSwipeLeft && (
                    <div
                      className="absolute inset-y-0 right-0 bg-green-500 flex items-center justify-end px-6"
                      style={{ width: Math.abs(swipeOffset) }}
                    >
                      <Check className="h-6 w-6 text-white" style={{ opacity: swipeProgress }} />
                    </div>
                  )}
                </>
              )}

              {/* Task Content */}
              <div
                className={`group flex items-center gap-3 py-2 px-3 -mx-3 rounded-md hover:bg-muted/50 transition-all duration-500 bg-background relative ${
                  isJustAdded
                    ? 'animate-in slide-in-from-left-5 bg-green-100 dark:bg-green-900/30 scale-105'
                    : ''
                }`}
                style={{
                  transform: isSwiping ? `translateX(${swipeOffset}px)` : 'translateX(0)',
                  transition: isSwiping ? 'none' : 'transform 0.3s ease-out',
                }}
                onDoubleClick={() => handleEdit(task)}
              >
              {editingId === task.id ? (
                <>
                  <select
                    value={editSymbol}
                    onChange={(e) => setEditSymbol(e.target.value as TaskSymbol)}
                    className="px-2 py-1 border rounded-md bg-background text-sm font-medium"
                  >
                    {Object.entries(symbolConfig).map(([key, { label }]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    className="flex-1"
                    autoFocus
                  />
                  <Button onClick={handleSaveEdit} size="sm">Save</Button>
                  <Button onClick={handleCancelEdit} size="sm" variant="ghost">Cancel</Button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => task.id && onUpdateTask(task.id, task.content, cycleSymbol(task.symbol))}
                    className="flex items-center justify-center w-10 h-10 md:w-6 md:h-6 hover:bg-muted rounded transition-colors shrink-0"
                    title={`${symbolConfig[task.symbol].label} - Click to cycle`}
                  >
                    {symbolConfig[task.symbol].icon}
                  </button>
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm cursor-text ${
                          task.symbol === 'complete'
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground'
                        }`}
                      >
                        {task.content}
                      </span>
                      {task.is_recurring === 1 && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (task.id) toggleHeatmap(task.id);
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-0.5 rounded-md transition-colors"
                            title="Toggle quick heatmap"
                          >
                            <Repeat className="h-3 w-3" />
                            <span className="hidden sm:inline">Recurring</span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (task.id) router.push(`/task/${task.id}`);
                            }}
                            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted px-2 py-0.5 rounded-md transition-colors"
                            title="View detailed report"
                          >
                            <BarChart3 className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    {task.is_recurring === 1 && expandedHeatmap === task.id && completionData[task.id || 0] && (
                      <div className="mt-1 p-2 bg-muted/30 rounded-md">
                        <TaskActivityHeatmap
                          taskId={task.id || 0}
                          data={completionData[task.id || 0]}
                          weeks={8}
                        />
                      </div>
                    )}
                  </div>

                  {/* Desktop: Show on hover */}
                  <div className="hidden md:flex opacity-0 group-hover:opacity-100 gap-1 transition-opacity">
                    <Button
                      onClick={() => handleEdit(task)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs"
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => task.id && onDeleteTask(task.id)}
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                    >
                      Delete
                    </Button>
                  </div>

                  {/* Mobile: Menu button always visible */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(task.id || null);
                    }}
                    className="md:hidden h-10 w-10 p-0 shrink-0"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </Button>
                </>
              )}
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* Actions Menu (Mobile Bottom Sheet) - Fixed to viewport footer */}
      {menuOpen && (
        <TaskActionsMenu
          isOpen={true}
          onClose={() => setMenuOpen(null)}
          taskContent={tasks.find(t => t.id === menuOpen)?.content || ''}
          currentSymbol={tasks.find(t => t.id === menuOpen)?.symbol || 'bullet'}
          isRecurring={tasks.find(t => t.id === menuOpen)?.is_recurring === 1}
          recurrencePattern={tasks.find(t => t.id === menuOpen)?.recurrence_pattern}
          onComplete={() => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onUpdateTask(task.id, task.content, 'complete');
          }}
          onMigrate={() => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onUpdateTask(task.id, task.content, 'migrated');
          }}
          onSchedule={() => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onUpdateTask(task.id, task.content, 'scheduled');
          }}
          onEdit={() => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task) handleEdit(task);
          }}
          onDelete={() => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onDeleteTask(task.id);
          }}
          onSetRecurring={onSetRecurring ? (pattern) => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onSetRecurring(task.id, pattern);
          } : undefined}
          onRemoveRecurring={onRemoveRecurring ? () => {
            const task = tasks.find(t => t.id === menuOpen);
            if (task?.id) onRemoveRecurring(task.id);
          } : undefined}
        />
      )}

      {/* Add New Task */}
      <Card className="p-4 border-2 border-dashed">
        {sections.length > 0 && (
          <div className="mb-3 pb-3 border-b space-y-2">
            <span className="text-xs font-medium text-muted-foreground">Add to section:</span>
            <div className="flex flex-wrap gap-2">
              {sections.map((section) => (
                <button
                  key={section}
                  onClick={() => setSelectedSection(section)}
                  className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                    selectedSection === section
                      ? 'bg-foreground text-background font-medium'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                >
                  {section}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="flex gap-3 items-start">
          <div className="flex flex-col gap-1">
            <div className="flex gap-1">
              {(['bullet', 'note', 'event'] as TaskSymbol[]).map((symbol) => (
                <button
                  key={symbol}
                  onClick={() => setSelectedSymbol(symbol)}
                  className={`flex items-center justify-center w-8 h-8 rounded-md transition-colors ${
                    selectedSymbol === symbol
                      ? 'bg-foreground text-background'
                      : 'bg-muted hover:bg-muted/80'
                  }`}
                  title={symbolConfig[symbol].label}
                >
                  {symbolConfig[symbol].icon}
                </button>
              ))}
            </div>
            {selectedSymbol && (
              <p className="text-xs text-muted-foreground text-center">
                {symbolConfig[selectedSymbol].label}
              </p>
            )}
          </div>

          <div className="flex-1 flex gap-2">
            <Input
              value={newTaskContent}
              onChange={(e) => setNewTaskContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              placeholder="Add new entry..."
              className="flex-1"
            />
            <Button
              onClick={handleAdd}
              className={`shrink-0 transition-all ${
                showSuccess ? 'bg-green-600 hover:bg-green-600 scale-105' : ''
              }`}
            >
              {showSuccess ? (
                <Check className="h-4 w-4 animate-in zoom-in-50" />
              ) : (
                'Add'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
