import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { multiverseService } from '../services/multiverseService';
import { Timeline, Mission } from '../types';

export const ParallelClassrooms: React.FC = () => {
    const { universeId } = useParams<{ universeId: string }>();
    const navigate = useNavigate();
    const [timelines, setTimelines] = useState<Timeline[]>([]);
    const [missions, setMissions] = useState<Record<string, Mission[]>>({});

    useEffect(() => {
        if (universeId) {
            loadData(universeId);
        }
    }, [universeId]);

    const loadData = async (id: string) => {
        try {
            // Mock data fallback
            const tData = await multiverseService.getTimelines(id);
            const finalTimelines = tData.length ? tData : MOCK_TIMELINES;
            setTimelines(finalTimelines);

            const missionMap: Record<string, Mission[]> = {};
            for (const t of finalTimelines) {
                // In real app, fetch by timeline ID
                missionMap[t.id] = MOCK_MISSIONS.filter(m => m.timeline === t.id);
            }
            setMissions(missionMap);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur sticky top-0 z-50">
                <button onClick={() => navigate(-1)} className="text-slate-400 hover:text-white">
                    &larr; Back to Map
                </button>
                <h2 className="text-2xl font-bold tracking-widest">PARALLEL TIMELINES</h2>
                <div className="w-8"></div>
            </div>

            <div className="flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden">
                {timelines.map((timeline) => (
                    <TimelineTrack 
                        key={timeline.id} 
                        timeline={timeline} 
                        missions={missions[timeline.id] || []}
                    />
                ))}
            </div>
        </div>
    );
};

const TimelineTrack: React.FC<{ timeline: Timeline; missions: Mission[] }> = ({ timeline, missions }) => {
    const getTheme = (diff: string) => {
        switch(diff) {
            case 'Easy': return 'border-green-500/30 bg-green-900/10';
            case 'Medium': return 'border-blue-500/30 bg-blue-900/10';
            case 'Hard': return 'border-red-500/30 bg-red-900/10';
            default: return 'border-slate-500/30';
        }
    };

    return (
        <div className={`flex-1 border-r ${getTheme(timeline.difficulty)} p-4 overflow-y-auto min-w-[300px]`}>
            <div className="mb-8 text-center">
                <h3 className="text-xl font-bold uppercase tracking-wider mb-1">{timeline.name}</h3>
                <span className={`text-xs px-2 py-1 rounded bg-slate-800 text-slate-300`}>
                    {timeline.difficulty} MODE
                </span>
            </div>

            <div className="space-y-6 relative">
                {/* Vertical Line */}
                <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-slate-700 -z-10 transform -translate-x-1/2"></div>

                {missions.map((mission, idx) => (
                    <MissionNode key={mission.id} mission={mission} index={idx} />
                ))}
            </div>
        </div>
    );
};

const MissionNode: React.FC<{ mission: Mission; index: number }> = ({ mission, index }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-800 p-4 rounded-lg border border-slate-700 hover:border-cyan-500 transition-colors cursor-pointer relative z-10"
        >
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-cyan-400">{mission.type}</span>
                <span className="text-xs font-bold text-yellow-400">+{mission.xpReward} XP</span>
            </div>
            <h4 className="font-bold text-sm mb-1">{mission.title}</h4>
            <p className="text-xs text-slate-400 line-clamp-2">{mission.description}</p>
        </motion.div>
    );
};

// Mock Data
const MOCK_TIMELINES: Timeline[] = [
    { id: 't-chill', name: 'Chill Timeline', universe: 'math-101', difficulty: 'Easy', color: '#4ade80' },
    { id: 't-prime', name: 'Prime Timeline', universe: 'math-101', difficulty: 'Medium', color: '#60a5fa' },
    { id: 't-hard', name: 'Hardcore Timeline', universe: 'math-101', difficulty: 'Hard', color: '#f87171' },
];

const MOCK_MISSIONS: Mission[] = [
    { id: 'm1', title: 'Basic Algebra', description: 'Solve for X in simple equations.', type: 'ParallelClass', universe: 'math-101', timeline: 't-chill', xpReward: 100, content: {} },
    { id: 'm2', title: 'Graphing Lines', description: 'Plot points on the coordinate plane.', type: 'ParallelClass', universe: 'math-101', timeline: 't-chill', xpReward: 150, content: {} },
    { id: 'm3', title: 'Quadratic Functions', description: 'Find the roots of the equation.', type: 'ParallelClass', universe: 'math-101', timeline: 't-prime', xpReward: 300, content: {} },
    { id: 'm4', title: 'Complex Numbers', description: 'Operations with imaginary units.', type: 'ParallelClass', universe: 'math-101', timeline: 't-hard', xpReward: 500, content: {} },
];
