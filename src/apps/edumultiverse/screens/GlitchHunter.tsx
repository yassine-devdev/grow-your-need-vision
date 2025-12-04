import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { multiverseService } from '../services/multiverseService';
import { Glitch } from '../types';

export const GlitchHunter: React.FC = () => {
    const [glitches, setGlitches] = useState<Glitch[]>([]);
    const [activeGlitch, setActiveGlitch] = useState<Glitch | null>(null);
    const [fixedCount, setFixedCount] = useState(0);

    useEffect(() => {
        // Mock load
        setGlitches(MOCK_GLITCHES);
    }, []);

    const handleFix = (glitch: Glitch) => {
        // Animation logic would go here
        setFixedCount(prev => prev + 1);
        setGlitches(prev => prev.filter(g => g.id !== glitch.id));
        setActiveGlitch(null);
    };

    return (
        <div className="min-h-screen bg-black text-green-400 font-mono p-8 relative overflow-hidden">
            {/* CRT Effect Overlay */}
            <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-50 bg-[length:100%_2px,3px_100%]"></div>
            
            <header className="flex justify-between items-center mb-12 border-b border-green-900 pb-4">
                <div>
                    <h1 className="text-4xl font-bold glitch-text">GLITCH HUNTER_</h1>
                    <p className="text-sm opacity-70">SYSTEM INTEGRITY: {Math.min(100, 60 + fixedCount * 10)}%</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold">{fixedCount} FIXED</div>
                    <div className="text-xs">PATCHES APPLIED</div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {glitches.map((glitch) => (
                        <motion.div
                            key={glitch.id}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0, rotate: 20 }}
                            onClick={() => setActiveGlitch(glitch)}
                            className="border border-green-500/50 bg-green-900/10 p-6 rounded cursor-pointer hover:bg-green-900/20 hover:border-green-400 transition-all group"
                        >
                            <div className="flex justify-between mb-4">
                                <span className="text-xs border border-green-500/30 px-2 py-1 rounded">
                                    ERR_CODE_{glitch.id.toUpperCase()}
                                </span>
                                <span className="text-red-500 animate-pulse">⚠ UNSTABLE</span>
                            </div>
                            <h3 className="text-xl font-bold mb-2 group-hover:underline">{glitch.title}</h3>
                            <div className="bg-black/50 p-3 rounded text-sm font-mono text-red-300 mb-4">
                                {glitch.brokenContent}
                            </div>
                            <button className="w-full py-2 bg-green-900/30 border border-green-500/50 hover:bg-green-500 hover:text-black transition-colors uppercase text-sm font-bold">
                                Initialize Patch
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {activeGlitch && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-green-500 p-8 max-w-2xl w-full rounded-lg shadow-[0_0_50px_rgba(0,255,0,0.2)]">
                        <h2 className="text-2xl font-bold mb-6 text-white">PATCHING REALITY...</h2>
                        
                        <div className="grid grid-cols-2 gap-8 mb-8">
                            <div>
                                <h4 className="text-red-400 text-sm mb-2">CORRUPTED DATA</h4>
                                <div className="bg-red-900/20 border border-red-500/30 p-4 rounded text-red-200">
                                    {activeGlitch.brokenContent}
                                </div>
                            </div>
                            <div>
                                <h4 className="text-green-400 text-sm mb-2">EXPECTED OUTPUT</h4>
                                <div className="bg-green-900/20 border border-green-500/30 p-4 rounded text-green-200">
                                    {activeGlitch.correctContent}
                                </div>
                            </div>
                        </div>

                        <div className="flex space-x-4">
                            <button 
                                onClick={() => setActiveGlitch(null)}
                                className="flex-1 py-3 border border-slate-600 text-slate-400 hover:bg-slate-800"
                            >
                                ABORT
                            </button>
                            <button 
                                onClick={() => handleFix(activeGlitch)}
                                className="flex-1 py-3 bg-green-600 text-white font-bold hover:bg-green-500 shadow-[0_0_20px_rgba(0,255,0,0.4)]"
                            >
                                APPLY PATCH
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const MOCK_GLITCHES: Glitch[] = [
    {
        id: 'g1',
        title: 'Historical Anomaly',
        universe: 'hist-anc',
        brokenContent: 'Julius Caesar was the first President of the United States in 1776.',
        correctContent: 'George Washington was the first President of the United States in 1789.',
        difficulty: 1
    },
    {
        id: 'g2',
        title: 'Biological Error',
        universe: 'sci-bio',
        brokenContent: 'Mitochondria is the powerhouse of the nucleus.',
        correctContent: 'Mitochondria is the powerhouse of the cell.',
        difficulty: 1
    },
    {
        id: 'g3',
        title: 'Physics Violation',
        universe: 'sci-phys',
        brokenContent: 'Gravity pushes objects away from the center of mass.',
        correctContent: 'Gravity pulls objects towards the center of mass.',
        difficulty: 2
    }
];
