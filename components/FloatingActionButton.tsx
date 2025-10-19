'use client';

import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FloatingActionButtonProps {
  onClick: () => void;
  label?: string;
}

export default function FloatingActionButton({ onClick, label = 'Add' }: FloatingActionButtonProps) {
  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 h-14 w-14 md:hidden rounded-full shadow-lg z-30 hover:scale-110 transition-transform"
      size="icon"
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
