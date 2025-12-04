
import React, { useState } from 'react';
import { OwnerIcon } from '../components/shared/OwnerIcons';
import { DesignEditor } from './creator/DesignEditor';
import { VideoEditor } from './media/VideoEditor';
import { AIContentGeneratorModal } from '../components/shared/modals/AIContentGeneratorModal';

interface CreatorStudioProps {
    activeTab: string;
    activeSubNav: string;
}

const CreatorStudio: React.FC<CreatorStudioProps> = ({ activeTab, activeSubNav }) => {
    const [mode, setMode] = useState<'design' | 'video'>('design');
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);

    return (
        <div className="h-full flex flex-col bg-[#18181b] text-white overflow-hidden animate-fadeIn">
            {/* Top Menu Bar */}
            <div className="h-12 border-b border-[#27272a] bg-[#1f1f22] flex items-center justify-between px-4 shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-purple-400 font-bold tracking-wider text-xs uppercase">
                        <OwnerIcon name="StudioIcon3D" className="w-5 h-5" />
                        <span className="font-machina">Studio</span>
                    </div>
                    <div className="h-4 w-[1px] bg-[#3f3f46]"></div>

                    {/* Mode Switcher */}
                    <div className="flex bg-[#18181b] rounded-lg p-1 border border-[#27272a]">
                        <button
                            type="button"
                            onClick={() => setMode('design')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'design' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Design
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('video')}
                            className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${mode === 'video' ? 'bg-[#3f3f46] text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            Video
                        </button>
                    </div>

                    <div className="h-4 w-[1px] bg-[#3f3f46]"></div>

                    <div className="flex items-center space-x-1">
                        {['File', 'Edit', 'View', 'Insert', 'Format', 'Tools'].map(item => (
                            <button type="button" key={item} className="px-3 py-1.5 rounded hover:bg-[#3f3f46] text-xs text-gray-400 hover:text-white transition-colors">
                                {item}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <span className="text-xs text-gray-500">Auto-saved</span>
                    <button type="button" className="bg-white text-black px-4 py-1.5 rounded-md text-xs font-bold hover:bg-gray-200 transition-colors">
                        Share
                    </button>
                    <button type="button" className="bg-purple-600 text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-purple-500 shadow-lg shadow-purple-900/20 transition-all">
                        Export
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Toolbar - Only show for Design mode as Video has its own or doesn't need this specific one */}
                {mode === 'design' && (
                    <div className="w-14 bg-[#1f1f22] border-r border-[#27272a] flex flex-col items-center py-4 gap-4 z-10 shadow-lg">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <button type="button" key={i} className={`p-2.5 rounded-lg transition-all relative group ${i === 1 ? 'bg-[#3f3f46] text-white' : 'text-gray-500 hover:text-white hover:bg-[#27272a]'}`}>
                                <OwnerIcon name="Grid" className="w-5 h-5" />
                                {/* Tooltip */}
                                <span className="absolute left-14 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                    Tool {i}
                                </span>
                            </button>
                        ))}
                        <div className="flex-1"></div>
                        <button type="button" className="p-2.5 text-gray-500 hover:text-white"><OwnerIcon name="CogIcon" className="w-5 h-5" /></button>
                    </div>
                )}

                {/* Main Content Area */}
                <div className="flex-1 bg-[#121214] relative flex flex-col overflow-hidden">
                    {mode === 'design' ? (
                        <div className="w-full h-full p-8 overflow-auto bg-grid-pattern flex items-center justify-center">
                            <div className="w-full h-full max-w-6xl shadow-2xl">
                                <DesignEditor />
                            </div>
                        </div>
                    ) : (
                        <div className="w-full h-full p-4">
                            <VideoEditor />
                        </div>
                    )}
                </div>

                {/* Right Properties Panel - Only for Design mode for now */}
                {mode === 'design' && (
                    <div className="w-72 bg-[#1f1f22] border-l border-[#27272a] flex flex-col z-10 shadow-lg">
                        <div className="p-4 border-b border-[#27272a]">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Properties</h3>
                        </div>
                        <div className="p-4 space-y-6 overflow-y-auto flex-1">

                            {/* Property Group 1 */}
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 flex justify-between">
                                    <span>Layout</span>
                                    <OwnerIcon name="ChevronRight" className="w-3 h-3 rotate-90" />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mb-2">
                                    <div className="bg-[#27272a] rounded p-2 text-xs text-gray-400 border border-[#3f3f46]">X: 1024</div>
                                    <div className="bg-[#27272a] rounded p-2 text-xs text-gray-400 border border-[#3f3f46]">Y: 768</div>
                                </div>
                                <div className="bg-[#27272a] rounded p-2 text-xs text-gray-400 border border-[#3f3f46] flex justify-between">
                                    <span>Opacity</span>
                                    <span>100%</span>
                                </div>
                            </div>

                            {/* Property Group 2 */}
                            <div>
                                <div className="text-xs font-bold text-gray-500 mb-3 flex justify-between">
                                    <span>Fill</span>
                                    <OwnerIcon name="PlusCircleIcon" className="w-3 h-3 hover:text-white cursor-pointer" />
                                </div>
                                <div className="flex items-center gap-2 bg-[#27272a] p-2 rounded border border-[#3f3f46]">
                                    <div className="w-4 h-4 bg-white rounded border border-gray-400"></div>
                                    <span className="text-xs text-gray-300">#FFFFFF</span>
                                    <span className="text-xs text-gray-500 ml-auto">100%</span>
                                </div>
                            </div>

                            {/* AI Assistant */}
                            <div className="mt-auto p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/30">
                                <div className="flex items-center gap-2 mb-2 text-purple-400 text-xs font-bold uppercase">
                                    <OwnerIcon name="Sparkles" className="w-3 h-3" />
                                    AI Copilot
                                </div>
                                <p className="text-[10px] text-gray-400 leading-relaxed mb-3">
                                    Generate layouts or suggestions based on your current selection.
                                </p>
                                <button 
                                    type="button"
                                    onClick={() => setIsAIModalOpen(true)}
                                    className="w-full py-1.5 bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/50 rounded text-xs font-bold transition-colors"
                                >
                                    Generate Ideas
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AIContentGeneratorModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                onSuccess={(content) => {
                    console.log("AI Generated Content:", content);
                    setIsAIModalOpen(false);
                    // In a real app, this would apply the layout or add elements
                    alert("AI Suggestions Generated! (Check console for details)");
                }}
                title="AI Design Assistant"
                promptTemplate="Suggest 3 creative layout ideas for a [Project Type] targeting [Audience]. Include color palette suggestions (Hex codes) and typography pairings."
                contextData={{ mode, activeTool: 'Layout' }}
            />
        </div>
    );
};

export default CreatorStudio;