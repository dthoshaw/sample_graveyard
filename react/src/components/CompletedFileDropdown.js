import React, { useState } from 'react';

export default function CompletedFileDropdown({ file, onDownload }) {
  const [open, setOpen] = useState(false);
  const [samples, setSamples] = useState([]);
  const [loaded, setLoaded] = useState(false);

  const fetchSamples = async () => {
    if (loaded) return;
    const res = await fetch(`http://localhost:8000/completed_samples/${encodeURIComponent(file)}`);
    const data = await res.json();
    setSamples(data.samples || []);
    setLoaded(true);
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    setOpen(o => !o);
    if (!loaded) fetchSamples();
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        <span className="truncate font-mono">{file}</span>
        <div className="flex items-center">
          <button
            className="ml-2 p-2 rounded download-btn flex items-center justify-center focus:outline-none"
            onClick={e => { e.currentTarget.blur(); onDownload(file); }}
            aria-label="Download"
            tabIndex={0}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24" height="24"
              fill="none"
              stroke="#818cf8"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="download-icon"
            >
              <path d="M12 4v12" />
              <path d="M8 12l4 4 4-4" />
              <path d="M4 20h16" />
            </svg>
          </button>
          <button
            className="ml-1 p-2 rounded flex items-center justify-center focus:outline-none text-accent hover:text-accent"
            onClick={handleToggle}
            aria-expanded={open}
            title={open ? 'Hide samples' : 'Show samples'}
            tabIndex={0}
          >
            <svg
              className={`w-4 h-4 transition-transform ${open ? 'rotate-90' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <ul className="ml-6 mt-1 text-xs text-light/80">
          {samples.length === 0 && <li>No samples found</li>}
          {samples.map(s => (
            <li key={s} className="truncate font-mono">{s}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
