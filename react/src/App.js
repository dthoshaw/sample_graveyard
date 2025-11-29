
import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import LoadingSpinner from './components/LoadingSpinner';
import Sidebar from './components/Sidebar';
import SampleFile from './components/SampleFile';
import WaveformPlayer from './components/WaveformPlayer';

const API = 'http://localhost:8000';

function App() {
  const [samples, setSamples] = useState([]);
  const [samplesInfo, setSamplesInfo] = useState({});
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState([]);
  const [sessionCompleted, setSessionCompleted] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [graveyardName, setGraveyardName] = useState("");
  const fileInputRef = useRef();

  // Fetch samples and their info from backend
  const fetchSamples = async () => {
    const res = await fetch(`${API}/list_samples/`);
    const data = await res.json();
    setSamples(data.samples || []);
    // Fetch significant duration info
    const infoRes = await fetch(`${API}/samples_info/`);
    const infoData = await infoRes.json();
    // Map: filename -> significant_duration
    const infoMap = {};
    (infoData || []).forEach(item => {
      infoMap[item.file] = item.significant_duration;
    });
    setSamplesInfo(infoMap);
  };

  // Fetch completed files
  const fetchCompleted = async () => {
    const res = await fetch(`${API}/completed/`);
    const data = await res.json();
    setCompleted(data.completed || []);
  };

  // Handle folder selection (upload)
  const handleFolderSelect = async (e) => {
    const files = Array.from(e.target.files).filter(f => f.name.endsWith('.wav') || f.name.endsWith('.mp3'));
    if (!files.length) return;
    setLoading(true);
    // Clear previous uploads
    await fetch(`${API}/clear_uploads/`, { method: 'POST' });
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    await fetch(`${API}/upload/`, { method: 'POST', body: formData });
    await fetchSamples();
    setLoading(false);
  };

  // Handle sample select
  const handleSampleCheck = (file) => {
    setSelected(sel => sel.includes(file) ? sel.filter(f => f !== file) : sel.length < 10 ? [...sel, file] : sel);
  };

  // Handle Graveyard submit
  const handleGraveyard = async () => {
    if (selected.length === 0 || !graveyardName.trim()) return;
    setLoading(true);
    const formData = new FormData();
    selected.forEach(f => formData.append('selected', f));
    formData.append('name', graveyardName.trim());
    const resp = await fetch(`${API}/graveyard/`, { method: 'POST', body: formData });
    const result = await resp.json();
    setSelected([]);
    setGraveyardName("");
    await fetchCompleted();
    setSessionCompleted(list => result.completed ? [...list, result.completed] : list);
    setSidebarOpen(true);
    setLoading(false);
  };

  // Download completed file
  const handleDownload = (file) => {
    const url = `${API}/download/${encodeURIComponent(file)}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = file;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Initial load
  React.useEffect(() => {
    fetchSamples();
    fetchCompleted();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="min-h-screen bg-background text-light font-sans flex flex-col items-center py-10 px-2">
      <div className="flex gap-3 mb-4">
        <button
          className="btn button-animated-border"
          onClick={() => fileInputRef.current.click()}
        >
          Select Folder
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          webkitdirectory="true"
          directory="true"
          multiple
          accept=".wav,.mp3"
          onChange={handleFolderSelect}
        />
        <button
          className="btn button-animated-border"
          onClick={() => { fetchCompleted(); setSidebarOpen(true); }}
        >
          Show completed
        </button>
      </div>

      {/* Show loading spinner overlay if loading */}
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <LoadingSpinner />
        </div>
      )}

      <div className="flex flex-col items-center w-full max-w-2xl mb-8">
        <input
          type="text"
          className="input w-full mb-2 text-base"
          placeholder="Name your graveyard file (required)"
          value={graveyardName}
          onChange={e => setGraveyardName(e.target.value)}
          maxLength={64}
          required
        />
        <button
          className="btn btn-large button-animated-border bg-accent text-background border-accent w-full disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={selected.length < 2 || selected.length > 10 || loading || !graveyardName.trim()}
          onClick={handleGraveyard}
        >
          Graveyard
        </button>
      </div>

      <div className="w-full max-w-2xl bg-surface rounded-lg border border-border p-8 mb-8 shadow-lg">
        <h2 className="text-lg font-semibold mb-4">Samples</h2>
        <div className="max-h-96 overflow-y-auto pt-2">
          {samples.length === 0 && <div className="text-light/60">No samples found. Select a folder to add samples.</div>}
          {samples.map(file => {
            const isSelected = selected.includes(file);
            const disabled = !isSelected && selected.length >= 10;
            const sigDur = samplesInfo[file] || 0;
            return (
              <SampleFile
                key={file}
                file={file}
                checked={isSelected}
                onClick={() => {
                  if (disabled) return;
                  handleSampleCheck(file);
                }}
                disabled={disabled}
                significant={sigDur > 4}
              >
                <WaveformPlayer
                  src={`http://localhost:8000/sample/${encodeURIComponent(file)}`}
                  name={file}
                />
              </SampleFile>
            );
          })}
        </div>
      </div>



      {/* Sidebar for completed files */}
      <div
        className={`fixed inset-0 z-40 ${sidebarOpen ? 'block' : 'hidden'}`}
        onClick={() => setSidebarOpen(false)}
        style={{ background: sidebarOpen ? 'rgba(0,0,0,0.3)' : 'transparent', transition: 'background 0.2s' }}
      />
      <Sidebar
        show={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        completedFiles={sessionCompleted}
        onDownload={handleDownload}
      />
    </div>
  );
}

export default App;
