import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const TimeLoopMission: React.FC = () => {
    const [loopCount, setLoopCount] = useState(1);
    const [timeLeft, setTimeLeft] = useState(60);
    const [isActive, setIsActive] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0) {
            handleLoopReset();
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const handleLoopReset = () => {
        setIsActive(false);
        setLoopCount(prev => prev + 1);
        setTimeLeft(60);
        setScore(0);
        // Trigger visual reset effect
    };

    const startLoop = () => {
        setIsActive(true);
    };

    return (
        <div className="min-h-screen bg-indigo-950 text-white flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Spiral Effect */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] border-[40px] border-indigo-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>
                <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border-[30px] border-purple-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 animate-spin-reverse"></div>
            </div>

            <div className="z-10 text-center max-w-2xl w-full p-8 bg-white/5 backdrop-blur-lg rounded-3xl border border-white/10 shadow-2xl">
                <div className="mb-8">
                    <span className="inline-block px-4 py-1 rounded-full bg-indigo-500/30 border border-indigo-400 text-indigo-200 text-sm font-bold mb-4">
                        TEMPORAL ANOMALY DETECTED
                    </span>
                    <h1 className="text-5xl font-bold mb-2">TIME LOOP #{loopCount}</h1>
                    <p className="text-indigo-200">Complete the objective before the timeline resets.</p>
                </div>

                <div className="flex justify-center mb-12">
                    <div className="relative w-40 h-40 flex items-center justify-center">
                        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="80" cy="80" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="none" />
                            <circle 
                                cx="80" cy="80" r="70" 
                                stroke="#a855f7" 
                                strokeWidth="8" 
                                fill="none" 
                                strokeDasharray="440"
                                strokeDashoffset={440 - (440 * timeLeft) / 60}
                                className="transition-all duration-1000 ease-linear"
                            />
                        </svg>
                        <div className="text-4xl font-mono font-bold">{timeLeft}s</div>
                    </div>
                </div>

                {!isActive ? (
                    <button 
                        onClick={startLoop}
                        className="px-12 py-4 bg-white text-indigo-900 font-bold rounded-full text-xl hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                    >
                        {loopCount > 1 ? 'RESTART LOOP' : 'ENTER LOOP'}
                    </button>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-indigo-900/50 p-6 rounded-xl border border-indigo-500/30">
                            <h3 className="text-xl font-bold mb-4">Mission: Factorize the Equation</h3>
                            <div className="text-3xl font-mono mb-6">x² - 5x + 6 = 0</div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    '(x-2)(x-3)', 
                                    '(x+2)(x+3)', 
                                    '(x-1)(x-6)', 
                                    '(x+1)(x-6)'
                                ].map((opt, i) => (
                                    <button 
                                        key={i}
                                        onClick={() => {
                                            if (i === 0) {
                                                // Success
                                                alert("TIMELINE STABILIZED!");
                                                setIsActive(false);
                                            } else {
                                                // Fail -> Reset
                                                handleLoopReset();
                                            }
                                        }}
                                        className="p-4 bg-white/10 hover:bg-white/20 rounded-lg font-mono text-lg transition-colors"
                                    >
                                        {opt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
