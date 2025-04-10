// components/Editor/index.js
import { useEffect } from 'react';
import { fabric } from 'fabric';
import { usePresentation } from '../../context/PresentationContext';
import CanvasEditor from './CanvasEditor';
import SlideNavigator from './SlideNavigator';
import Toolbar from './Toolbar';
import ExportControls from '../ExportControls';

export default function Editor() {
  const { slides } = usePresentation();
  
  // Store the fabric canvas in the window object for access across components
  useEffect(() => {
    // Will be set inside CanvasEditor when it initializes
    if (typeof window !== 'undefined') {
      window.fabricCanvas = null;
    }
  }, []);

  if (!slides.length) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      <Toolbar />
      <div className="flex flex-1 overflow-hidden">
        <SlideNavigator />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto p-4">
            <CanvasEditor />
          </div>
          <div className="p-4 border-t flex justify-end">
            <ExportControls />
          </div>
        </div>
      </div>
    </div>
  );
}