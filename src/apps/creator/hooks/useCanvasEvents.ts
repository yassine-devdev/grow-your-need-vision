import { useCallback } from 'react';
import { useEditor } from '../store/editorStore';
import { useSelection } from './useSelection';
import { useDragMove } from './useDragMove';

export const useCanvasEvents = () => {
  const { state, dispatch } = useEditor();
  const { clearSelection } = useSelection();
  const { onDrag, endDrag } = useDragMove();

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    // If clicking on empty canvas, clear selection
    if (e.target === e.currentTarget) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    onDrag(e);
  }, [onDrag]);

  const handleMouseUp = useCallback(() => {
    endDrag();
  }, [endDrag]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey) {
      e.preventDefault();
      const delta = -e.deltaY;
      const newZoom = Math.max(0.1, Math.min(5, state.zoom + delta * 0.001));
      dispatch({ type: 'SET_ZOOM', payload: newZoom });
    }
  }, [state.zoom, dispatch]);

  return {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel
  };
};
