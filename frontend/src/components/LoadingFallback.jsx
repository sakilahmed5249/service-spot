import React from 'react';

export default function LoadingFallback({ message = 'Loading…' }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div
        role="status"
        aria-live="polite"
        className="glass card-glass p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-4 max-w-sm w-full"
      >
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary/90" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
          </div>
        </div>

        <div className="text-center">
          <p className="text-lg font-semibold text-[var(--text-primary)]">{message}</p>
          <p className="text-sm text-slate-400 mt-1">Thanks for your patience — fetching the best content for you.</p>
        </div>
      </div>
    </div>
  );
}