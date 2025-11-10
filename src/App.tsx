import { TargetHeatmap } from './components/TargetHeatmap';
import { TargetDetails } from './components/TargetDetails';
import { SessionStats } from './components/SessionStats';
import { FileSystemLoader } from './components/FileSystemLoader';
import './App.css';
import { useMemo, useState } from 'react';
import { CalibrationDataLoader, TargetCache } from './DataLoader';
import type { SessionData, TargetData } from './types/types';

type TabType = 'heatmap' | 'stats' | 'details';

function App() {
  const [sessionId, setSessionId] = useState('');
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [allTargets, setAllTargets] = useState<Map<number, TargetData>>(new Map());
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('heatmap');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMode, setLoadingMode] = useState<'filesystem' | 'url' | null>(null);

  const loader = useMemo(() => new CalibrationDataLoader(), []);
  const targetCache = useMemo(() => new TargetCache(loader), [loader]);

  // Check if File System Access API is supported
  const isFileSystemSupported = 'showDirectoryPicker' in window;

  const handleDirectorySelected = async (dirHandle: FileSystemDirectoryHandle, sessionId: string) => {
    setLoading(true);
    setError(null);
    setLoadingMode('filesystem');

    try {
      const data = await loader.loadFromDirectory(dirHandle);
      setSessionData(data);
      setSessionId(sessionId);
      targetCache.setSessionId(sessionId);

      // Load all target metadata
      const targetIds = Array.from({ length: data.session.totalTargets }, (_, i) => i);
      const loadedTargets = new Map<number, TargetData>();

      for (const id of targetIds) {
        try {
          const targetData = await targetCache.get(id);
          loadedTargets.set(id, targetData);
        } catch (e) {
          console.warn(`Failed to load target ${id}:`, e);
        }
      }

      setAllTargets(loadedTargets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session from file system');
      setLoadingMode(null);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: string) => {
    setLoading(true);
    setError(null);
    setLoadingMode('url');

    try {
      const data = await loader.loadSession(id);
      setSessionData(data);
      setSessionId(id);
      targetCache.setSessionId(id);

      // Load all target metadata
      const targetIds = Array.from({ length: data.session.totalTargets }, (_, i) => i);
      const loadedTargets = new Map<number, TargetData>();

      for (const id of targetIds) {
        try {
          const targetData = await targetCache.get(id);
          loadedTargets.set(id, targetData);
        } catch (e) {
          console.warn(`Failed to load target ${id}:`, e);
        }
      }

      setAllTargets(loadedTargets);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session from URL');
      setLoadingMode(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTargetClick = async (targetId: number) => {
    setSelectedTargetId(targetId);
    setActiveTab('details');

    // Ensure target data is loaded
    if (!allTargets.has(targetId) && sessionData) {
      try {
        const targetData = await targetCache.get(targetId);
        setAllTargets(new Map(allTargets).set(targetId, targetData));
      } catch (err) {
        console.error('Failed to load target:', err);
      }
    }
  };

  const handleNewSession = () => {
    setSessionData(null);
    setAllTargets(new Map());
    setSelectedTargetId(null);
    setSessionId('');
    setLoadingMode(null);
    targetCache.clear();
  };

  const targetList = Array.from(allTargets.values()).map(td => td.target);
  const selectedTarget = selectedTargetId !== null ? allTargets.get(selectedTargetId) : null;

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <h1>👁️ Gaze Calibration Viewer</h1>
        {sessionData && (
          <button onClick={handleNewSession} className="new-session-button">
            Load New Session
          </button>
        )}
      </header>

      {error && (
        <div className="error-banner">
          ⚠️ {error}
        </div>
      )}

      {!sessionData && !loading && (
        <>
          {isFileSystemSupported ? (
            <FileSystemLoader
              onDirectorySelected={handleDirectorySelected}
              loading={loading}
            />
          ) : (
            <div className="legacy-loader">
              <div className="warning-banner">
                ⚠️ Your browser doesn't support the File System Access API.
                You'll need to use the legacy URL-based loading method.
              </div>
              <div className="session-input-legacy">
                <input
                  type="text"
                  placeholder="Enter session ID (e.g., session_20250109_123456)"
                  value={sessionId}
                  onChange={(e) => setSessionId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && loadSession(sessionId)}
                />
                <button onClick={() => loadSession(sessionId)} disabled={loading}>
                  {loading ? 'Loading...' : 'Load Session'}
                </button>
              </div>
              <div className="instructions">
                <h3>Setup Instructions:</h3>
                <ol>
                  <li>Copy your calibration_sessions folder to the public directory</li>
                  <li>Enter the session ID above</li>
                  <li>Click "Load Session"</li>
                </ol>
              </div>
            </div>
          )}
        </>
      )}

      {loading && (
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading session data...</p>
        </div>
      )}

      {sessionData && (
        <>
          {/* Session Info Bar */}
          <div className="session-info-bar">
            <div className="session-info">
              <strong>Session:</strong> {sessionId}
            </div>
            <div className="session-info">
              <strong>Targets:</strong> {targetList.length}
            </div>
            <div className="session-info">
              <strong>Source:</strong> {loadingMode === 'filesystem' ? '📁 File System' : '🌐 URL'}
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button
              className={activeTab === 'heatmap' ? 'active' : ''}
              onClick={() => setActiveTab('heatmap')}
            >
              📍 Heatmap
            </button>
            <button
              className={activeTab === 'stats' ? 'active' : ''}
              onClick={() => setActiveTab('stats')}
            >
              📊 Statistics
            </button>
            {selectedTargetId !== null && (
              <button
                className={activeTab === 'details' ? 'active' : ''}
                onClick={() => setActiveTab('details')}
              >
                🔍 Target #{selectedTargetId}
              </button>
            )}
          </div>

          {/* Content */}
          <div className="content">
            {activeTab === 'heatmap' && (
              <div className="heatmap-view">
                <TargetHeatmap
                  targets={targetList}
                  selectedTargetId={selectedTargetId}
                  onTargetClick={handleTargetClick}
                />
                <div className="legend">
                  <h4>Legend</h4>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#22c55e' }} />
                    <span>Quality ≥ 90%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#eab308' }} />
                    <span>Quality 70-90%</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color" style={{ background: '#ef4444' }} />
                    <span>Quality &lt; 70%</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'stats' && (
              <SessionStats session={sessionData.session} targets={targetList} />
            )}

            {activeTab === 'details' && selectedTarget && (
              <TargetDetails targetData={selectedTarget} />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default App;