import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { multiverseService } from '../services/multiverseService';
import { Universe } from '../types';
import { useNavigate } from 'react-router-dom';

export const MultiverseMap: React.FC = () => {
    const [universes, setUniverses] = useState<Universe[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        loadUniverses();
    }, []);

    const loadUniverses = async () => {
        try {
            // In a real app, we'd fetch from API. For now, if empty, use mock data for demo
            const data = await multiverseService.getUniverses();
            if (data.length === 0) {
                setUniverses(MOCK_UNIVERSES);
            } else {
                setUniverses(data);
            }
        } catch (e) {
            console.error("Failed to load universes", e);
            setUniverses(MOCK_UNIVERSES);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
            <header className="mb-12 text-center">
                <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-500 mb-4">
                    MULTIVERSE MAP
                </h1>
                <p className="text-slate-400 text-lg">Select a reality to explore</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
                {universes.map((universe) => (
                    <UniverseCard 
                        key={universe.id} 
                        universe={universe} 
                        onClick={() => navigate(`/apps/edumultiverse/universe/${universe.id}`)}
                    />
                ))}
            </div>

            <div className="max-w-7xl mx-auto">
                <h2 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-2">SPECIAL ANOMALIES</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div 
                        onClick={() => navigate('/apps/edumultiverse/glitch-hunter')}
                        className="bg-green-900/20 border border-green-500/30 p-6 rounded-xl cursor-pointer hover:bg-green-900/40 transition-colors group"
                    >
                        <h3 className="text-xl font-bold text-green-400 mb-2 group-hover:translate-x-2 transition-transform">
                            👾 GLITCH HUNTER
                        </h3>
                        <p className="text-slate-400">Reality is fracturing. Find and fix the errors in the database before they spread.</p>
                    </div>

                    <div 
                        onClick={() => navigate('/apps/edumultiverse/time-loop')}
                        className="bg-indigo-900/20 border border-indigo-500/30 p-6 rounded-xl cursor-pointer hover:bg-indigo-900/40 transition-colors group"
                    >
                        <h3 className="text-xl font-bold text-indigo-400 mb-2 group-hover:translate-x-2 transition-transform">
                            ⏳ TIME LOOP
                        </h3>
                        <p className="text-slate-400">Trapped in a temporal anomaly. Master the concept to break the cycle.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const UniverseCard: React.FC<{ universe: Universe; onClick: () => void }> = ({ universe, onClick }) => {
    return (
        <motion.div 
            whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.4)" }}
            whileTap={{ scale: 0.95 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 cursor-pointer relative overflow-hidden group"
            onClick={onClick}
        >
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <span className="text-6xl">{universe.icon}</span>
            </div>
            
            <div className="relative z-10">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                    universe.type === 'SchoolClass' ? 'bg-blue-900 text-blue-300' : 'bg-emerald-900 text-emerald-300'
                }`}>
                    {universe.type === 'SchoolClass' ? 'CLASS REALITY' : 'SOLO TRACK'}
                </span>
                
                <h3 className="text-2xl font-bold mb-2">{universe.name}</h3>
                <p className="text-slate-400 mb-6">{universe.description}</p>
                
                <div className="flex items-center justify-between mt-4">
                    <div className="flex space-x-2">
                        <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                        <span className="text-xs text-slate-500">TIMELINES STABLE</span>
                    </div>
                    <span className="text-cyan-400 text-sm font-bold group-hover:translate-x-1 transition-transform">
                        ENTER &rarr;
                    </span>
                </div>
            </div>
        </motion.div>
    );
};

// Mock Data for Fallback
const MOCK_UNIVERSES: Universe[] = [
    {
        id: 'math-101',
        name: 'Quantum Mathematics',
        subject: 'Math',
        type: 'SchoolClass',
        description: 'Master the language of the cosmos through algebra and geometry.',
        icon: '📐'
    },
    {
        id: 'sci-bio',
        name: 'Bio-Genesis Realm',
        subject: 'Biology',
        type: 'SchoolClass',
        description: 'Explore the building blocks of life and evolution.',
        icon: '🧬'
    },
    {
        id: 'hist-anc',
        name: 'Chronos History',
        subject: 'History',
        type: 'SoloTrack',
        description: 'Travel back to ancient civilizations and fix the timeline.',
        icon: '⏳'
    },
    {
        id: 'lit-fict',
        name: 'Narrative Nexus',
        subject: 'Literature',
        type: 'SchoolClass',
        description: 'Weave stories and analyze texts from across dimensions.',
        icon: '📚'
    }
];
