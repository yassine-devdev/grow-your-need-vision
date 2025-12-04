import { useCallback } from 'react';
import { useEditor } from '../store/editorStore';

// This hook would interface with a history stack
export const useHistory = () => {
  const { dispatch } = useEditor();

  const undo = useCallback(() => {
    // dispatch({ type: 'UNDO' });
    console.log('Undo');
  }, [dispatch]);

  const redo = useCallback(() => {
    // dispatch({ type: 'REDO' });
    console.log('Redo');
  }, [dispatch]);

  const pushState = useCallback((newState: any) => {
    // Add to history stack
  }, []);

  return {
    undo,
    redo,
    pushState
  };
};
