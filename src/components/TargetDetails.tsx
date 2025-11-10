import React, { useState } from 'react';
import type { TargetData } from '../types/types';


interface TargetDetailsProps {
    targetData: TargetData;
}

export const TargetDetails: React.FC<TargetDetailsProps> = ({ targetData }) => {
    const [selectedFrame, setSelectedFrame] = useState(0);
    const { target, frames, leftEyeImages, rightEyeImages } = targetData;
    const frame = frames[selectedFrame];

    return (
        <div className="target-details" style={{ padding: '20px', color: '#fff' }}>
            {/* Target Summary */}
            <div className="summary-card" style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
                <h3>Target #{target.targetID}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '14px' }}>
                    <div>
                        <strong>Position:</strong> ({target.screenX.toFixed(1)}, {target.screenY.toFixed(1)})
                    </div>
                    <div>
                        <strong>Region:</strong> {target.region}
                    </div>
                    <div>
                        <strong>Frames:</strong> {target.usableFrames}/{target.capturedFrames}
                    </div>
                    <div>
                        <strong>Quality:</strong>{' '}
                        <span style={{ color: target.usableFrames / target.capturedFrames >= 0.9 ? '#22c55e' : '#eab308' }}>
                            {((target.usableFrames / target.capturedFrames) * 100).toFixed(1)}%
                        </span>
                    </div>
                    <div>
                        <strong>Avg Lid Gap:</strong> {target.averageLidGap.toFixed(3)}
                    </div>
                    <div>
                        <strong>Avg Distance:</strong> {target.averageDistanceProxy.toFixed(3)}
                    </div>
                </div>
            </div>

            {/* Frame Selector */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Frame:</span>
                    <input
                        type="range"
                        min="0"
                        max={frames.length - 1}
                        value={selectedFrame}
                        onChange={(e) => setSelectedFrame(parseInt(e.target.value))}
                        style={{ flex: 1 }}
                    />
                    <span style={{ fontSize: '14px', minWidth: '80px' }}>
                        {selectedFrame + 1} / {frames.length}
                    </span>
                </div>

                {/* Frame thumbnails */}
                <div style={{ display: 'flex', gap: '5px', overflowX: 'auto', padding: '5px 0' }}>
                    {frames.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setSelectedFrame(idx)}
                            style={{
                                width: '40px',
                                height: '40px',
                                background: selectedFrame === idx ? '#3b82f6' : '#374151',
                                border: frames[idx].usable ? '2px solid #22c55e' : '2px solid #ef4444',
                                borderRadius: '4px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: 'bold',
                            }}
                        >
                            {idx}
                        </div>
                    ))}
                </div>
            </div>

            {/* Eye Images */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Eye Crops</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#999' }}>Left Eye</div>
                        <img
                            src={leftEyeImages[selectedFrame]}
                            alt="Left eye"
                            style={{
                                width: '100%',
                                height: 'auto',
                                background: '#000',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                imageRendering: 'pixelated',
                            }}
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', marginBottom: '5px', color: '#999' }}>Right Eye</div>
                        <img
                            src={rightEyeImages[selectedFrame]}
                            alt="Right eye"
                            style={{
                                width: '100%',
                                height: 'auto',
                                background: '#000',
                                border: '1px solid #444',
                                borderRadius: '4px',
                                imageRendering: 'pixelated',
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Frame Metadata */}
            <div className="metadata-card" style={{ padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>Frame {selectedFrame} Metadata</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px', fontSize: '13px' }}>
                    <div><strong>Timestamp:</strong> {frame.timestamp.toFixed(3)}</div>
                    <div>
                        <strong>Usable:</strong>{' '}
                        <span style={{ color: frame.usable ? '#22c55e' : '#ef4444' }}>
                            {frame.usable ? 'Yes' : 'No'}
                        </span>
                    </div>
                    <div><strong>Lid Gap:</strong> {frame.lidGap.toFixed(3)}</div>
                    <div><strong>IPD:</strong> {frame.interPupilDistance.toFixed(2)} px</div>
                    <div><strong>Distance Proxy:</strong> {frame.distanceProxy.toFixed(3)}</div>
                    <div><strong>Blur Score:</strong> {frame.blurScore.toFixed(3)}</div>
                </div>

                <div style={{ marginTop: '10px' }}>
                    <strong>Pose Features:</strong>
                    <div style={{ fontSize: '11px', fontFamily: 'monospace', marginTop: '5px', color: '#999' }}>
                        [{frame.poseFeatures.map(f => f.toFixed(4)).join(', ')}]
                    </div>
                </div>
            </div>
        </div>
    );
};