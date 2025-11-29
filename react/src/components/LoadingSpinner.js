import React from 'react';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <span className="relative w-10 h-10 block">
        <span className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></span>
        <span className="absolute inset-2 rounded-full border-2 border-accent/30 border-t-transparent animate-spin-slow"></span>
      </span>
    </div>
  );
}

// Add this to index.css or a global CSS file:
// .animate-spin-slow { animation: spin 1.5s linear infinite; }
