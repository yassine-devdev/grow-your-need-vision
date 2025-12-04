import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { EditorState, ActiveTool, EditorMode, Layer } from '../types/editor';

type Action = 
    | { type: 'SET_TOOL'; payload: ActiveTool }
    | { type: 'SET_MODE'; payload: EditorMode }
    | { type: 'SET_ZOOM'; payload: number }
    | { type: 'SET_SELECTION'; payload: string[] }
    | { type: 'ADD_LAYER'; payload: Layer }
    | { type: 'UPDATE_LAYER'; payload: { id: string; updates: Partial<Layer> } }
    | { type: 'DELETE_LAYERS'; payload: string[] };

const initialState: EditorState = {
    mode: 'design',
    activeTool: 'select',
    zoom: 1,
    selectedIds: [],
    layers: [],
    isDragging: false,
    canvasSize: { width: 1920, height: 1080 }
};

const EditorContext = createContext<{
    state: EditorState;
    dispatch: React.Dispatch<Action>;
} | undefined>(undefined);

function editorReducer(state: EditorState, action: Action): EditorState {
    switch (action.type) {
        case 'SET_TOOL':
            return { ...state, activeTool: action.payload };
        case 'SET_MODE':
            return { ...state, mode: action.payload };
        case 'SET_ZOOM':
            return { ...state, zoom: action.payload };
        case 'SET_SELECTION':
            return { ...state, selectedIds: action.payload };
        case 'ADD_LAYER':
            return { ...state, layers: [...state.layers, action.payload] };
        case 'UPDATE_LAYER':
            return {
                ...state,
                layers: state.layers.map(layer => 
                    layer.id === action.payload.id 
                        ? { ...layer, ...action.payload.updates }
                        : layer
                )
            };
        case 'DELETE_LAYERS':
            return {
                ...state,
                layers: state.layers.filter(layer => !action.payload.includes(layer.id)),
                selectedIds: state.selectedIds.filter(id => !action.payload.includes(id))
            };
        default:
            return state;
    }
}

export const EditorProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(editorReducer, initialState);
    return React.createElement(EditorContext.Provider, { value: { state, dispatch } }, children);
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor must be used within an EditorProvider');
    }
    return context;
};
