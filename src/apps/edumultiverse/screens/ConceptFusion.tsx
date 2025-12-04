import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Fragment {
    id: string;
    name: string;
    type: 'Math' | 'Science' | 'History' | 'Art';
    rarity: 'Common' | 'Rare' | 'Legendary';
}

interface Recipe {
    id: string;
    name: string;
    ingredients: string[]; // List of Fragment names/types
    resultDescription: string;
    xpReward: number;
}

export const ConceptFusion: React.FC = () => {
    const [inventory, setInventory] = useState<Fragment[]>(MOCK_INVENTORY);
    const [selectedFragments, setSelectedFragments] = useState<Fragment[]>([]);
    const [isFusing, setIsFusing] = useState(false);
    const [fusionResult, setFusionResult] = useState<Recipe | null>(null);

    const toggleSelection = (fragment: Fragment) => {
        if (selectedFragments.find(f => f.id === fragment.id)) {
            setSelectedFragments(prev => prev.filter(f => f.id !== fragment.id));
        } else {
            if (selectedFragments.length < 3) {
                setSelectedFragments(prev => [...prev, fragment]);
            }
        }
    };

    const handleFuse = () => {
        setIsFusing(true);
        setTimeout(() => {
            setIsFusing(false);
            // Mock logic: if Math + Science = Physics
            const types = selectedFragments.map(f => f.type);
            if (types.includes('Math') && types.includes('Science')) {
                setFusionResult({
                    id: 'r1',
                    name: 'Quantum Physics Core',
                    ingredients: ['Math', 'Science'],
                    resultDescription: 'You combined abstract numbers with empirical observation!',
                    xpReward: 500
                });
            } else {
                setFusionResult({
                    id: 'r-fail',
                    name: 'Unstable Matter',
                    ingredients: [],
                    resultDescription: 'The concepts refused to merge. Try a different combination.',
                    xpReward: 50
                });
            }
            // Remove used items
            setInventory(prev => prev.filter(item => !selectedFragments.find(s => s.id === item.id)));
            setSelectedFragments([]);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8 relative overflow-hidden">
            {/* Background Particles */}
            <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div 
                        key={i}
                        className="absolute rounded-full bg-cyan-500/10 blur-xl"
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            width: `${Math.random() * 300}px`,
                            height: `${Math.random() * 300}px`,
                            animation: `float ${10 + Math.random() * 20}s infinite linear`
                        }}
                    />
                ))}
            </div>

            <header className="relative z-10 mb-12 text-center">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-violet-500">
                    CONCEPT FUSION LAB
                </h1>
                <p className="text-slate-400">Combine knowledge fragments to create new artifacts.</p>
            </header>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 relative z-10">
                {/* Inventory Panel */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-2xl p-6">
                    <h2 className="text-xl font-bold mb-4 flex justify-between">
                        <span>FRAGMENT STORAGE</span>
                        <span className="text-sm text-slate-400">{inventory.length} ITEMS</span>
                    </h2>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                        {inventory.map(fragment => (
                            <motion.div
                                key={fragment.id}
                                layoutId={fragment.id}
                                onClick={() => toggleSelection(fragment)}
                                className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer p-2 text-center transition-all ${
                                    selectedFragments.find(f => f.id === fragment.id)
                                        ? 'border-cyan-400 bg-cyan-900/30 shadow-[0_0_15px_rgba(34,211,238,0.3)]'
                                        : 'border-slate-600 bg-slate-700/50 hover:border-slate-400'
                                }`}
                            >
                                <span className="text-2xl mb-1">{getIcon(fragment.type)}</span>
                                <span className="text-xs font-bold truncate w-full">{fragment.name}</span>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Fusion Chamber */}
                <div className="flex flex-col items-center justify-center">
                    <div className="relative w-80 h-80 mb-8">
                        {/* Chamber Circle */}
                        <div className={`absolute inset-0 rounded-full border-4 border-dashed transition-all duration-1000 ${
                            isFusing ? 'border-cyan-400 animate-spin-slow' : 'border-slate-700'
                        }`}></div>
                        
                        {/* Slots */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <AnimatePresence>
                                {selectedFragments.map((frag, i) => {
                                    const angle = (i / selectedFragments.length) * 2 * Math.PI - Math.PI / 2;
                                    const radius = 100;
                                    const x = Math.cos(angle) * radius;
                                    const y = Math.sin(angle) * radius;
                                    
                                    return (
                                        <motion.div
                                            key={frag.id}
                                            initial={{ scale: 0, x: 0, y: 0 }}
                                            animate={isFusing ? { x: 0, y: 0, scale: 0 } : { x, y, scale: 1 }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            className="absolute w-16 h-16 bg-slate-800 rounded-full border-2 border-cyan-500 flex items-center justify-center shadow-lg z-10"
                                        >
                                            {getIcon(frag.type)}
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            
                            {/* Core */}
                            <div className={`w-32 h-32 rounded-full bg-slate-900 border-4 flex items-center justify-center z-0 ${
                                isFusing ? 'border-cyan-400 shadow-[0_0_50px_rgba(34,211,238,0.5)]' : 'border-slate-600'
                            }`}>
                                {isFusing ? (
                                    <span className="text-4xl animate-pulse">⚡</span>
                                ) : (
                                    <span className="text-slate-600 text-sm font-bold">FUSION CORE</span>
                                )}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleFuse}
                        disabled={selectedFragments.length < 2 || isFusing}
                        className={`px-12 py-4 rounded-full font-bold text-xl tracking-widest transition-all ${
                            selectedFragments.length >= 2 && !isFusing
                                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:scale-105 shadow-lg text-white'
                                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                    >
                        {isFusing ? 'FUSING...' : 'INITIATE FUSION'}
                    </button>
                </div>
            </div>

            {/* Result Modal */}
            <AnimatePresence>
                {fusionResult && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                        onClick={() => setFusionResult(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.5, y: 50 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-slate-900 border-2 border-cyan-500 rounded-2xl p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(34,211,238,0.3)]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-6xl mb-4">✨</div>
                            <h2 className="text-3xl font-bold text-cyan-400 mb-2">{fusionResult.name}</h2>
                            <p className="text-slate-300 mb-6">{fusionResult.resultDescription}</p>
                            <div className="inline-block bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full font-bold mb-8">
                                +{fusionResult.xpReward} XP
                            </div>
                            <button
                                onClick={() => setFusionResult(null)}
                                className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 rounded-lg font-bold"
                            >
                                COLLECT ARTIFACT
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

function getIcon(type: string) {
    switch(type) {
        case 'Math': return '📐';
        case 'Science': return '🧪';
        case 'History': return '🏛';
        case 'Art': return '🎨';
        default: return '📦';
    }
}

const MOCK_INVENTORY: Fragment[] = [
    { id: 'f1', name: 'Algebra Basics', type: 'Math', rarity: 'Common' },
    { id: 'f2', name: 'Scientific Method', type: 'Science', rarity: 'Common' },
    { id: 'f3', name: 'Roman Empire', type: 'History', rarity: 'Common' },
    { id: 'f4', name: 'Color Theory', type: 'Art', rarity: 'Common' },
    { id: 'f5', name: 'Calculus Shard', type: 'Math', rarity: 'Rare' },
    { id: 'f6', name: 'Quantum Dust', type: 'Science', rarity: 'Legendary' },
];
