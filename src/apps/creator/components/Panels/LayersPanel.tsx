import React from 'react';
import { useEditor } from '../../store/editorStore';
import { OwnerIcon } from '../../../../components/shared/OwnerIcons';

export const LayersPanel: React.FC = () => {
    const { state, dispatch } = useEditor();
    const { layers, selectedIds } = state;

    const toggleVisibility = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const layer = layers.find(l => l.id === id);
        if (layer) {
            dispatch({
                type: 'UPDATE_LAYER',
                payload: { id, updates: { visible: !layer.visible } }
            });
        }
    };

    const toggleLock = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const layer = layers.find(l => l.id === id);
        if (layer) {
            dispatch({
                type: 'UPDATE_LAYER',
                payload: { id, updates: { locked: !layer.locked } }
            });
        }
    };

    const handleSelect = (id: string) => {
        dispatch({ type: 'SET_SELECTION', payload: [id] });
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-[#27272a] flex justify-between items-center">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Layers</h3>
                <button type="button" className="text-gray-500 hover:text-white"><OwnerIcon name="Plus" className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {[...layers].reverse().map(layer => (
                    <div
                        key={layer.id}
                        onClick={() => handleSelect(layer.id)}
                        className={`flex items-center gap-3 p-2 rounded hover:bg-[#27272a] group cursor-pointer transition-colors ${selectedIds.includes(layer.id) ? 'bg-[#27272a] border border-purple-500/30' : 'border border-transparent'}`}
                    >
                        <button
                            type="button"
                            onClick={(e) => toggleVisibility(e, layer.id)}
                            className={`text-gray-500 hover:text-white ${!layer.visible && 'opacity-50'}`}
                        >
                            <OwnerIcon name={layer.visible ? 'Eye' : 'EyeSlash'} className="w-4 h-4" />
                        </button>
                        <OwnerIcon name={layer.type === 'text' ? 'Type' : layer.type === 'image' ? 'Photo' : 'Square2Stack'} className="w-4 h-4 text-purple-400" />
                        <span className="text-sm text-gray-300 flex-1 truncate">{layer.name || layer.type}</span>
                        <button
                            type="button"
                            onClick={(e) => toggleLock(e, layer.id)}
                            className={`text-gray-500 hover:text-white ${layer.locked ? 'text-yellow-500' : 'opacity-0 group-hover:opacity-100'}`}
                        >
                            <OwnerIcon name={layer.locked ? 'LockClosed' : 'LockOpen'} className="w-3 h-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
