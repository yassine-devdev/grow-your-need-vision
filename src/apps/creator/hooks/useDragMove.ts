import { useState, useCallback } from 'react';
import { useEditor } from '../store/editorStore';

export const useDragMove = () => {
  const { state, dispatch } = useEditor();
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const startDrag = useCallback((e: React.MouseEvent, layerId: string) => {
    e.stopPropagation();
    setIsDragging(true);
    setStartPos({ x: e.clientX, y: e.clientY });
    
    if (!state.selectedIds.includes(layerId)) {
      dispatch({ type: 'SET_SELECTION', payload: [layerId] });
    }
  }, [state.selectedIds, dispatch]);

  const onDrag = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;

    const dx = (e.clientX - startPos.x) / state.zoom;
    const dy = (e.clientY - startPos.y) / state.zoom;

    // Update layer positions (would need a UPDATE_LAYERS action)
    // dispatch({ type: 'UPDATE_LAYERS', payload: { ids: state.selectedIds, dx, dy } });
    
    setStartPos({ x: e.clientX, y: e.clientY });
  }, [isDragging, startPos, state.zoom, state.selectedIds, dispatch]);

  const endDrag = useCallback(() => {
    setIsDragging(false);
  }, []);

  return {
    isDragging,
    startDrag,
    onDrag,
    endDrag
  };
};
