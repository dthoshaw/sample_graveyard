import React from 'react';
import CompletedFileDropdown from './CompletedFileDropdown';

export default function Sidebar({ show, onClose, completedFiles, onDownload }) {
  return (
    <div
      className={`fixed top-0 right-0 h-full w-80 bg-surface border-l border-border shadow-xl p-6 z-50 transition-transform duration-300 ease-in-out ${show ? 'translate-x-0' : 'translate-x-full'}`}
      style={{ boxShadow: '0 0 24px 0 #0008' }}
    >
      <button
        className="absolute top-4 right-4 text-light hover:text-accent text-2xl focus:outline-none"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        ×
      </button>
      <h2 className="text-xl font-bold mb-4">Completed</h2>
      <ul className="space-y-3">
        {completedFiles.length === 0 && <li className="text-light/60">No completed files</li>}
        {completedFiles.map((file) => (
          <li key={file} className="bg-background rounded px-3 py-2 border border-border">
            <CompletedFileDropdown file={file} onDownload={onDownload} />
          </li>
        ))}
      </ul>
    </div>
  );
}
