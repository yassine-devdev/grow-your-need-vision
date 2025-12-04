import React from 'react';
import { OwnerIcon } from '../../../../components/shared/OwnerIcons';

export const AssetsPanel: React.FC = () => {
    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#27272a]">
                <div className="relative">
                    <OwnerIcon name="MagnifyingGlass" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search assets..." 
                        className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="aspect-square bg-[#27272a] rounded-lg border border-[#3f3f46] hover:border-purple-500 cursor-grab active:cursor-grabbing transition-colors flex items-center justify-center group relative overflow-hidden">
                        <OwnerIcon name="Photo" className="w-8 h-8 text-gray-600 group-hover:text-gray-400" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-medium truncate w-full">Asset {i}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
