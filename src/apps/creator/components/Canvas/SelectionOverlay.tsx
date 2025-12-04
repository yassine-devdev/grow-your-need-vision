import React from 'react';

interface SelectionOverlayProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({ x, y, width, height }) => {
    return (
        <div 
            className="absolute border-2 border-purple-500 bg-purple-500/10 pointer-events-none"
            style={{
                left: x,
                top: y,
                width,
                height
            }}
        >
            {/* Resize Handles */}
            <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-purple-500 pointer-events-auto cursor-nw-resize" />
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-purple-500 pointer-events-auto cursor-ne-resize" />
            <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-purple-500 pointer-events-auto cursor-sw-resize" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-purple-500 pointer-events-auto cursor-se-resize" />
        </div>
    );
};
