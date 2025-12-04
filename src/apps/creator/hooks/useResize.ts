import { useState, useCallback } from 'react';
import { useEditor } from '../store/editorStore';

export const useResize = () => {
  const { state, dispatch } = useEditor();
  const [isResizing, setIsResizing] = useState(false);
  const [handle, setHandle] = useState<string | null>(null);

  const startResize = useCallback((e: React.MouseEvent, handleId: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setHandle(handleId);
  }, []);

  const onResize = useCallback((e: React.MouseEvent) => {
    if (!isResizing || !handle) return;

    // Calculate new dimensions based on handle and mouse position
    // dispatch({ type: 'UPDATE_LAYER_DIMENSIONS', ... });
  }, [isResizing, handle]);

  const endResize = useCallback(() => {
    setIsResizing(false);
    setHandle(null);
  }, []);

  return {
    isResizing,
    startResize,
    onResize,
    endResize
  };
};
