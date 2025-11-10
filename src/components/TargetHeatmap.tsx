import React, { useMemo, useState } from 'react';
import type { CalibrationTarget } from '../types/types';


interface TargetHeatmapProps {
    targets: CalibrationTarget[];
    selectedTargetId: number | null;
    onTargetClick: (targetId: number) => void;
    width?: number;
    height?: number;
}

export const TargetHeatmap: React.FC<TargetHeatmapProps> = ({
    targets,
    selectedTargetId,
    onTargetClick,
    width = 800,
    height = 600,
}) => {
    const [hoveredTarget, setHoveredTarget] = useState<CalibrationTarget | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const { normalizedTargets, } = useMemo(() => {
        if (targets.length === 0) return { normalizedTargets: [], scale: { x: 1, y: 1 } };

        // Find screen bounds
        const maxX = Math.max(...targets.map(t => t.screenX));
        const maxY = Math.max(...targets.map(t => t.screenY));

        return {
            normalizedTargets: targets.map(t => ({
                ...t,
                x: (t.screenX / maxX) * width,
                y: (t.screenY / maxY) * height,
            })),
            scale: { x: width / maxX, y: height / maxY },
        };
    }, [targets, width, height]);

    const getQualityColor = (target: CalibrationTarget): string => {
        const quality = target.usableFrames / target.capturedFrames;
        if (quality >= 0.9) return '#22c55e'; // green
        if (quality >= 0.7) return '#eab308'; // yellow
        return '#ef4444'; // red
    };

    const getQualityPercent = (target: CalibrationTarget): number => {
        return (target.usableFrames / target.capturedFrames) * 100;
    };

    const handleMouseMove = (e: React.MouseEvent, target: CalibrationTarget) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
        setHoveredTarget(target);
    };

    return (
        <div
            className="heatmap-container"
            style={{ position: 'relative', width, height, background: '#1a1a1a' }}
            onMouseLeave={() => setHoveredTarget(null)}
        >
            <svg width={width} height={height}>
                {/* Grid lines */}
                <g opacity="0.2">
                    {[0, 0.25, 0.5, 0.75, 1].map(frac => (
                        <React.Fragment key={`grid-${frac}`}>
                            <line x1={0} y1={frac * height} x2={width} y2={frac * height} stroke="#666" strokeWidth="1" />
                            <line x1={frac * width} y1={0} x2={frac * width} y2={height} stroke="#666" strokeWidth="1" />
                        </React.Fragment>
                    ))}
                </g>

                {/* Targets */}
                {normalizedTargets.map(target => {
                    const isSelected = target.targetID === selectedTargetId;
                    const isHovered = hoveredTarget?.targetID === target.targetID;
                    const color = getQualityColor(target);

                    return (
                        <g
                            key={target.targetID}
                            onClick={() => onTargetClick(target.targetID)}
                            onMouseMove={(e) => handleMouseMove(e, target)}
                            style={{ cursor: 'pointer' }}
                        >
                            <circle
                                cx={target.x}
                                cy={target.y}
                                r={isSelected ? 12 : isHovered ? 10 : 8}
                                fill={color}
                                stroke={isSelected ? '#fff' : isHovered ? '#fff' : color}
                                strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                                opacity={isSelected || isHovered ? 1 : 0.7}
                            />
                            <text
                                x={target.x}
                                y={target.y - (isSelected ? 18 : isHovered ? 16 : 15)}
                                textAnchor="middle"
                                fill="#fff"
                                fontSize={isSelected || isHovered ? "11" : "10"}
                                fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                            >
                                {target.targetID}
                            </text>
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredTarget && (
                <div
                    style={{
                        position: 'absolute',
                        left: mousePos.x + 15,
                        top: mousePos.y + 15,
                        background: '#1a1a1a',
                        border: `2px solid ${getQualityColor(hoveredTarget)}`,
                        borderRadius: '8px',
                        padding: '12px',
                        pointerEvents: 'none',
                        zIndex: 1000,
                        minWidth: '200px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                    }}
                >
                    <div style={{ color: '#fff', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
                        Target #{hoveredTarget.targetID}
                    </div>
                    <div style={{ fontSize: '12px', color: '#ccc', lineHeight: '1.6' }}>
                        <div style={{ marginBottom: '4px' }}>
                            <strong style={{ color: getQualityColor(hoveredTarget) }}>
                                Quality: {getQualityPercent(hoveredTarget).toFixed(1)}%
                            </strong>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                            Frames: {hoveredTarget.usableFrames}/{hoveredTarget.capturedFrames}
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                            Region: <span style={{ color: '#3b82f6' }}>{hoveredTarget.region}</span>
                        </div>
                        <div style={{ marginBottom: '4px' }}>
                            Position: ({hoveredTarget.screenX.toFixed(0)}, {hoveredTarget.screenY.toFixed(0)})
                        </div>
                        <div style={{ fontSize: '11px', marginTop: '8px', color: '#999', fontStyle: 'italic' }}>
                            Click to view details
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};