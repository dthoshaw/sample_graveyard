import React from 'react';

export default function SampleFile({ file, checked, onClick, disabled, children, significant }) {
  return (
    <div
      className={
        `flex items-center gap-2 bg-surface border border-border rounded px-4 py-1 mb-2 transition-all min-h-0 h-12 cursor-pointer select-none relative ` +
        (checked ? 'ring-2 ring-accent border-accent shadow-lg z-20 ' : '') +
        (disabled ? 'opacity-50 pointer-events-none grayscale' : 'hover:scale-[1.01] hover:shadow-lg')
      }
      style={{ maxWidth: 'calc(100% - 20px)', boxSizing: 'border-box', marginLeft: 4, marginRight: 16 }}
      onClick={disabled ? undefined : onClick}
      aria-selected={checked}
      tabIndex={0}
    >
      {significant && (
        <span title="Significant content > 4s" className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1" />
      )}
      <div className="flex items-center gap-2 min-w-0 w-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
