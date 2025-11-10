import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { CalibrationSession, CalibrationTarget } from '../types/types';

interface SessionStatsProps {
    session: CalibrationSession;
    targets: CalibrationTarget[];
}

export const SessionStats: React.FC<SessionStatsProps> = ({ session, targets }) => {
    const stats = React.useMemo(() => {
        if (targets.length === 0) return null;

        const totalFrames = targets.reduce((sum, t) => sum + t.capturedFrames, 0);
        const usableFrames = targets.reduce((sum, t) => sum + t.usableFrames, 0);
        const avgQuality = (usableFrames / totalFrames) * 100;

        const regionCounts = targets.reduce((acc, t) => {
            acc[t.region] = (acc[t.region] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const qualityDistribution = targets.map(t => ({
            targetId: t.targetID,
            quality: (t.usableFrames / t.capturedFrames) * 100,
            region: t.region,
        }));

        const avgLidGap = targets.reduce((sum, t) => sum + t.averageLidGap, 0) / targets.length;
        const avgDistance = targets.reduce((sum, t) => sum + t.averageDistanceProxy, 0) / targets.length;

        return {
            totalTargets: targets.length,
            totalFrames,
            usableFrames,
            avgQuality,
            regionCounts,
            qualityDistribution,
            avgLidGap,
            avgDistance,
        };
    }, [targets]);

    if (!stats) return <div>No data available</div>;

    const regionData = Object.entries(stats.regionCounts).map(([region, count]) => ({
        region,
        count,
    }));

    return (
        <div className="session-stats" style={{ padding: '20px', color: '#fff' }}>
            {/* Session Info */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '15px' }}>Session: {session.sessionID}</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', fontSize: '14px' }}>
                    <div>
                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Device</div>
                        <div>{session.deviceModel}</div>
                    </div>
                    <div>
                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Camera</div>
                        <div>{session.cameraResolution.width}x{session.cameraResolution.height} @ {session.cameraFPS}fps</div>
                    </div>
                    <div>
                        <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>Screen</div>
                        <div>{session.screenResolution.width}x{session.screenResolution.height}</div>
                    </div>
                </div>
            </div>

            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
                <StatCard title="Targets" value={stats.totalTargets} color="#3b82f6" />
                <StatCard title="Total Frames" value={stats.totalFrames} color="#8b5cf6" />
                <StatCard title="Usable Frames" value={stats.usableFrames} color="#22c55e" />
                <StatCard title="Avg Quality" value={`${stats.avgQuality.toFixed(1)}%`} color="#eab308" />
            </div>

            {/* Aggregate Metrics */}
            <div style={{ marginBottom: '20px', padding: '15px', background: '#2a2a2a', borderRadius: '8px' }}>
                <h4 style={{ marginBottom: '10px' }}>Aggregate Metrics</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '14px' }}>
                    <div>
                        <strong>Avg Lid Gap:</strong> {stats.avgLidGap.toFixed(3)}
                    </div>
                    <div>
                        <strong>Avg Distance Proxy:</strong> {stats.avgDistance.toFixed(3)}
                    </div>
                </div>
            </div>

            {/* Region Distribution */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '10px' }}>Region Distribution</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={regionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="region" stroke="#999" />
                        <YAxis stroke="#999" />
                        <Tooltip
                            contentStyle={{ background: '#1a1a1a', border: '1px solid #444' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="count" fill="#3b82f6" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Quality Distribution */}
            <div>
                <h4 style={{ marginBottom: '10px' }}>Quality by Target</h4>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={stats.qualityDistribution}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="targetId" stroke="#999" />
                        <YAxis stroke="#999" domain={[0, 100]} />
                        <Tooltip
                            contentStyle={{ background: '#1a1a1a', border: '1px solid #444' }}
                            labelStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="quality" fill="#22c55e" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

interface StatCardProps {
    title: string;
    value: string | number;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, color }) => (
    <div style={{ padding: '15px', background: '#2a2a2a', borderRadius: '8px', borderLeft: `4px solid ${color}` }}>
        <div style={{ color: '#999', fontSize: '12px', marginBottom: '5px' }}>{title}</div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color }}>{value}</div>
    </div>
);