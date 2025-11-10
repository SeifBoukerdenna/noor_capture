import React, { useState } from 'react';

interface FileSystemLoaderProps {
    onDirectorySelected: (dirHandle: FileSystemDirectoryHandle, sessionId: string) => void;
    loading: boolean;
}

export const FileSystemLoader: React.FC<FileSystemLoaderProps> = ({ onDirectorySelected, loading }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleDirectorySelect = async () => {
        try {
            // @ts-expect-error - File System Access API
            const dirHandle = await window.showDirectoryPicker({
                mode: 'read',
                startIn: 'desktop',
            });

            // Get session ID from directory name
            const sessionId = dirHandle.name;

            // Verify it's a valid session directory
            try {
                await dirHandle.getFileHandle('session.json');
                onDirectorySelected(dirHandle, sessionId);
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (e) {
                alert('Invalid session directory. Make sure it contains session.json');
            }
        } catch (err) {
            if ((err as Error).name !== 'AbortError') {
                console.error('Error selecting directory:', err);
                alert('Failed to select directory. Make sure your browser supports File System Access API.');
            }
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        try {
            const items = Array.from(e.dataTransfer.items);

            for (const item of items) {
                if (item.kind === 'file') {
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-expect-error
                    const handle = await item.getAsFileSystemHandle();

                    if (handle.kind === 'directory') {
                        const sessionId = handle.name;

                        // Verify it's a valid session directory
                        try {
                            await handle.getFileHandle('session.json');
                            onDirectorySelected(handle, sessionId);
                            return;
                            // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        } catch (e) {
                            alert('Invalid session directory. Make sure it contains session.json');
                        }
                    }
                }
            }
        } catch (err) {
            console.error('Error handling drop:', err);
            alert('Failed to load directory. Try using the "Browse" button instead.');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    };

    return (
        <div className="file-system-loader">
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <div className="drop-zone-content">
                    <div className="icon">📁</div>
                    <h3>Load Calibration Session</h3>
                    <p>Drag and drop a session folder here</p>
                    <p className="or">or</p>
                    <button
                        onClick={handleDirectorySelect}
                        disabled={loading}
                        className="browse-button"
                    >
                        {loading ? 'Loading...' : 'Browse for Folder'}
                    </button>
                    <p className="hint">
                        Select a folder like: <code>session_20250109_123456</code>
                    </p>
                </div>
            </div>

            <style>{`
        .file-system-loader {
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
        }

        .drop-zone {
          border: 3px dashed #444;
          border-radius: 12px;
          padding: 60px 40px;
          text-align: center;
          background: #1a1a1a;
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .drop-zone.dragging {
          border-color: #3b82f6;
          background: #1e293b;
          transform: scale(1.02);
        }

        .drop-zone-content .icon {
          font-size: 64px;
          margin-bottom: 20px;
          opacity: 0.8;
        }

        .drop-zone-content h3 {
          font-size: 24px;
          margin-bottom: 10px;
          color: #fff;
        }

        .drop-zone-content p {
          color: #999;
          margin-bottom: 20px;
        }

        .drop-zone-content .or {
          color: #666;
          font-style: italic;
          margin: 20px 0;
        }

        .browse-button {
          padding: 12px 32px;
          background: #3b82f6;
          border: none;
          border-radius: 8px;
          color: #fff;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }

        .browse-button:hover:not(:disabled) {
          background: #2563eb;
        }

        .browse-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .hint {
          margin-top: 20px;
          font-size: 13px;
          color: #666;
        }

        .hint code {
          background: #2a2a2a;
          padding: 2px 8px;
          border-radius: 4px;
          color: #3b82f6;
          font-family: monospace;
        }

        @media (max-width: 768px) {
          .file-system-loader {
            padding: 20px;
          }

          .drop-zone {
            padding: 40px 20px;
          }
        }
      `}</style>
        </div>
    );
};