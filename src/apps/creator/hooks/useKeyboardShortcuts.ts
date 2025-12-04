import { useEffect } from 'react';
import { useEditor } from '../store/editorStore';

export const useKeyboardShortcuts = () => {
  const { state, dispatch } = useEditor();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key.toLowerCase()) {
        case 'v':
          dispatch({ type: 'SET_TOOL', payload: 'select' });
          break;
        case 'r':
          dispatch({ type: 'SET_TOOL', payload: 'rect' });
          break;
        case 't':
          dispatch({ type: 'SET_TOOL', payload: 'text' });
          break;
        case 'delete':
        case 'backspace':
          // Dispatch delete action (need to add to reducer)
          // dispatch({ type: 'DELETE_SELECTED' });
          break;
        case 'z':
          if (e.ctrlKey || e.metaKey) {
            if (e.shiftKey) {
              // Redo
            } else {
              // Undo
            }
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, dispatch]);
};
