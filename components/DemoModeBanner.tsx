'use client';

import { useState, useEffect } from 'react';
import { Info, X } from 'lucide-react';

export function DemoModeBanner() {
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    async function checkDemoMode() {
      try {
        const response = await fetch('/api/demo/check');
        const data = await response.json();
        setIsDemoMode(data.isDemoMode);
      } catch (error) {
        console.error('Error checking demo mode:', error);
      }
    }

    checkDemoMode();
  }, []);

  useEffect(() => {
    // Add padding to body when banner is visible
    if (isDemoMode && isVisible) {
      document.body.style.paddingBottom = '80px';
    } else {
      document.body.style.paddingBottom = '0';
    }

    return () => {
      document.body.style.paddingBottom = '0';
    };
  }, [isDemoMode, isVisible]);

  if (!isDemoMode || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg border-t border-white/20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 shrink-0">
              <Info className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">
                Demo Mode Active
              </p>
              <p className="text-xs text-white/90 hidden sm:block">
                All data is temporary and resets periodically • This is a preview environment
              </p>
              <p className="text-xs text-white/90 sm:hidden">
                Temporary preview data
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/20 transition-colors shrink-0"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
