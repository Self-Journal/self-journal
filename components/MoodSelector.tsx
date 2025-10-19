'use client';

import { useState } from 'react';
import { Smile, Meh, Frown, SmilePlus, Angry, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MoodNoteModal from './MoodNoteModal';

export type MoodType = 'amazing' | 'good' | 'okay' | 'bad' | 'terrible';

export interface MoodEntry {
  id?: number;
  time: string;
  mood: MoodType;
  note?: string;
}

interface MoodSelectorProps {
  moodEntries: MoodEntry[];
  onAddMood: (mood: MoodType, time: string, note?: string) => void;
  onDeleteMood?: (id: number) => void;
}

const moodConfig: Record<MoodType, { icon: React.ReactNode; label: string; color: string }> = {
  amazing: {
    icon: <SmilePlus className="w-6 h-6" />,
    label: 'Amazing',
    color: 'text-green-600 dark:text-green-400'
  },
  good: {
    icon: <Smile className="w-6 h-6" />,
    label: 'Good',
    color: 'text-blue-600 dark:text-blue-400'
  },
  okay: {
    icon: <Meh className="w-6 h-6" />,
    label: 'Okay',
    color: 'text-yellow-600 dark:text-yellow-400'
  },
  bad: {
    icon: <Frown className="w-6 h-6" />,
    label: 'Bad',
    color: 'text-orange-600 dark:text-orange-400'
  },
  terrible: {
    icon: <Angry className="w-6 h-6" />,
    label: 'Terrible',
    color: 'text-red-600 dark:text-red-400'
  }
};

export default function MoodSelector({ moodEntries, onAddMood, onDeleteMood }: MoodSelectorProps) {
  const [showModal, setShowModal] = useState(false);
  const [pendingMood, setPendingMood] = useState<MoodType | null>(null);

  const handleMoodClick = (mood: MoodType) => {
    setPendingMood(mood);
    setShowModal(true);
  };

  const handleSaveNote = (note: string) => {
    if (pendingMood) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      onAddMood(pendingMood, time, note);
      setPendingMood(null);
    }
  };

  const handleCloseModal = () => {
    // If user skips the note, save mood without note
    if (pendingMood) {
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      onAddMood(pendingMood, time, '');
      setPendingMood(null);
    }
    setShowModal(false);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Mood Timeline */}
        {moodEntries.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Today's Mood Timeline</h4>
            <div className="space-y-2">
              {moodEntries.map((entry) => {
                const config = moodConfig[entry.mood];
                return (
                  <div
                    key={entry.id || entry.time}
                    className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className={`${config.color} shrink-0 mt-0.5`}>
                      {config.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{config.label}</span>
                        <span className="text-xs text-muted-foreground">{entry.time}</span>
                      </div>
                      {entry.note && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {entry.note}
                        </p>
                      )}
                    </div>
                    {onDeleteMood && entry.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteMood(entry.id!)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Mood Section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">
              How are you feeling right now?
            </span>
          </div>
          <div className="flex gap-1 flex-wrap">
            {(Object.keys(moodConfig) as MoodType[]).map((mood) => {
              const config = moodConfig[mood];

              return (
                <button
                  key={mood}
                  onClick={() => handleMoodClick(mood)}
                  className="flex flex-col items-center gap-1 p-2 rounded-lg transition-all hover:bg-muted"
                  title={config.label}
                >
                  <div className={config.color}>
                    {config.icon}
                  </div>
                  <span className="text-xs font-medium hidden sm:block">
                    {config.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {pendingMood && (
        <MoodNoteModal
          isOpen={showModal}
          mood={pendingMood}
          onClose={handleCloseModal}
          onSave={handleSaveNote}
        />
      )}
    </>
  );
}

export { moodConfig };
