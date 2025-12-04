import React from 'react';
import { useEditor } from '../../store/editorStore';
import { ToolButton } from './ToolButton';

export const Toolbar: React.FC = () => {
    const { state, dispatch } = useEditor();

    const tools = [
        { id: 'select', icon: 'CursorArrowRays', label: 'Select' },
        { id: 'text', icon: 'Type', label: 'Text' },
        { id: 'shape', icon: 'Square2Stack', label: 'Shapes' },
        { id: 'image', icon: 'Photo', label: 'Image' },
        { id: 'pen', icon: 'Pencil', label: 'Pen' },
        { id: 'hand', icon: 'HandRaised', label: 'Pan' },
    ] as const;

    return (
        <div className="w-16 bg-[#1f1f22] border-r border-[#27272a] flex flex-col items-center py-4 gap-2 z-10 shadow-xl">
            {tools.map((tool) => (
                <ToolButton
                    key={tool.id}
                    icon={tool.icon}
                    label={tool.label}
                    isActive={state.activeTool === tool.id}
                    onClick={() => dispatch({ type: 'SET_TOOL', payload: tool.id })}
                />
            ))}
            
            <div className="flex-1" />
            
            <ToolButton
                icon="CogIcon"
                label="Settings"
                isActive={false}
                onClick={() => {}}
            />
        </div>
    );
};
