'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { MoodType } from './MoodSelector';

interface MoodNoteModalProps {
  isOpen: boolean;
  mood: MoodType;
  onClose: () => void;
  onSave: (note: string) => void;
}

// Predefined notes based on mood
const moodNotes: Record<MoodType, string[]> = {
  amazing: [
    'Everything is going great!',
    'Achieved my goals today',
    'Feeling energized and motivated',
    'Had a productive day',
    'Grateful for today',
  ],
  good: [
    'Had a solid day overall',
    'Made good progress',
    'Feeling positive',
    'Things went smoothly',
    'Accomplished what I planned',
  ],
  okay: [
    'Just an average day',
    'Nothing special happened',
    'Felt neutral today',
    'Could be better, could be worse',
    'Taking it easy',
  ],
  bad: [
    'Struggled with some tasks',
    'Feeling stressed',
    'Had some challenges',
    'Not my best day',
    'Need to recharge',
  ],
  terrible: [
    'Very difficult day',
    'Feeling overwhelmed',
    'Nothing went right',
    'Need support',
    'Tomorrow will be better',
  ],
};

export default function MoodNoteModal({ isOpen, mood, onClose, onSave }: MoodNoteModalProps) {
  const [selectedNote, setSelectedNote] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalNote = showCustomInput ? customNote : selectedNote;
    onSave(finalNote);
    handleClose();
  };

  const handleClose = () => {
    setSelectedNote('');
    setCustomNote('');
    setShowCustomInput(false);
    onClose();
  };

  const handleSelectNote = (note: string) => {
    setSelectedNote(note);
    setShowCustomInput(false);
    setCustomNote('');
  };

  const handleSelectOther = () => {
    setShowCustomInput(true);
    setSelectedNote('');
  };

  const predefinedOptions = moodNotes[mood] || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-x-0 bottom-0 md:inset-0 md:flex md:items-center md:justify-center z-50 animate-in slide-in-from-bottom md:fade-in duration-300">
        <div className="bg-background rounded-t-2xl md:rounded-2xl shadow-lg border-t md:border md:max-w-lg md:w-full md:mx-4">
          {/* Handle (mobile only) */}
          <div className="flex justify-center pt-3 pb-2 md:hidden">
            <div className="w-12 h-1 bg-muted-foreground/30 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Add a note</h3>
              <p className="text-sm text-muted-foreground mt-1">
                What made you feel this way?
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[60vh] md:max-h-96 overflow-y-auto">
            <div className="space-y-2">
              {/* Predefined options */}
              {predefinedOptions.map((note) => (
                <button
                  key={note}
                  onClick={() => handleSelectNote(note)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                    selectedNote === note
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-background hover:bg-muted border-border'
                  }`}
                >
                  {note}
                </button>
              ))}

              {/* Other option */}
              <button
                onClick={handleSelectOther}
                className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                  showCustomInput
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background hover:bg-muted border-border'
                }`}
              >
                Other...
              </button>

              {/* Custom input */}
              {showCustomInput && (
                <div className="pt-2 animate-in slide-in-from-top-2">
                  <Input
                    value={customNote}
                    onChange={(e) => setCustomNote(e.target.value)}
                    placeholder="Type your own note..."
                    className="w-full"
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t flex gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
            >
              Skip
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedNote && !customNote}
              className="flex-1"
            >
              Save Note
            </Button>
          </div>

          {/* Safe area padding for iOS */}
          <div className="h-safe md:hidden" />
        </div>
      </div>
    </>
  );
}
