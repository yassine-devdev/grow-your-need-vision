import React from 'react';
import { OwnerIcon } from '../../../../components/shared/OwnerIcons';

export const AssetsPanel: React.FC = () => {
    const assets = [
        { id: 'a1', type: 'image', src: 'https://picsum.photos/200/200?random=1', label: 'Nature' },
        { id: 'a2', type: 'image', src: 'https://picsum.photos/200/200?random=2', label: 'City' },
        { id: 'a3', type: 'image', src: 'https://picsum.photos/200/200?random=3', label: 'Tech' },
        { id: 'a4', type: 'image', src: 'https://picsum.photos/200/200?random=4', label: 'Abstract' },
    ];

    const handleDragStart = (e: React.DragEvent, asset: any) => {
        e.dataTransfer.setData('application/json', JSON.stringify(asset));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#27272a] space-y-3">
                <div className="relative">
                    <OwnerIcon name="MagnifyingGlass" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search assets..."
                        className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg py-2 pl-9 pr-4 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
                    />
                </div>
                <button className="w-full py-2 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] rounded-lg text-xs font-bold text-gray-300 flex items-center justify-center gap-2 transition-colors">
                    <OwnerIcon name="ArrowUpTrayIcon" className="w-4 h-4" />
                    Upload Asset
                </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3">
                {assets.map(asset => (
                    <div
                        key={asset.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, asset)}
                        className="aspect-square bg-[#27272a] rounded-lg border border-[#3f3f46] hover:border-purple-500 cursor-grab active:cursor-grabbing transition-colors flex items-center justify-center group relative overflow-hidden"
                    >
                        <img src={asset.src} alt={asset.label} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                            <span className="text-[10px] text-white font-medium truncate w-full">{asset.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
