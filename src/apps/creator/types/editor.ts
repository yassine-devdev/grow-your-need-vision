export type EditorMode = 'design' | 'prototype' | 'code';

export type ActiveTool = 'select' | 'text' | 'image' | 'rect' | 'circle' | 'pen' | 'hand' | 'shape';

export interface Layer {
    id: string;
    name: string;
    type: 'text' | 'image' | 'rect' | 'circle' | 'group';
    x: number;
    y: number;
    width: number;
    height: number;
    rotation: number;
    opacity: number;
    visible: boolean;
    locked: boolean;
    index: number;
    
    // Style props
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    borderRadius?: number;
    
    // Text props
    text?: string;
    fontSize?: number;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    textAlign?: 'left' | 'center' | 'right' | 'justify';
    textDecoration?: string;
    
    // Image props
    src?: string;
    
    // Effects
    shadowEnabled?: boolean;
    shadowColor?: string;
    shadowBlur?: number;
    shadowOffsetX?: number;
    shadowOffsetY?: number;
    blur?: number;
    grayscale?: number;

    children?: Layer[];
}

export interface EditorState {
    mode: EditorMode;
    activeTool: ActiveTool;
    zoom: number;
    selectedIds: string[];
    layers: Layer[];
    isDragging: boolean;
    canvasSize: { width: number; height: number };
}
