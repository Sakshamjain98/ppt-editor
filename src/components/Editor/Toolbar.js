// components/Editor/Toolbar.js
import { useCallback } from 'react';
import { usePresentation } from '../../context/PresentationContext';
import * as fabric from 'fabric';

export default function Toolbar() {
  const { currentSlide, updateCurrentSlide } = usePresentation();
  const canvasRef = typeof window !== 'undefined' ? window.fabricCanvas : null;

  const getActiveCanvas = useCallback(() => {
    if (typeof window !== 'undefined' && window.fabricCanvas) {
      return window.fabricCanvas;
    }
    return null;
  }, []);

  // Text operations
  const addText = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const text = new fabric.IText('Enter text here', {
      left: 100,
      top: 100,
      fontFamily: 'Arial',
      fontSize: 24,
      fill: '#000000'
    });
    
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    updateCurrentSlide(canvas.toJSON());
  };
  
  const setBold = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
      activeObject.set('fontWeight', activeObject.fontWeight === 'bold' ? 'normal' : 'bold');
      canvas.renderAll();
      updateCurrentSlide(canvas.toJSON());
    }
  };
  
  const setItalic = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
      activeObject.set('fontStyle', activeObject.fontStyle === 'italic' ? 'normal' : 'italic');
      canvas.renderAll();
      updateCurrentSlide(canvas.toJSON());
    }
  };
  
  const setUnderline = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
      activeObject.set('underline', !activeObject.underline);
      canvas.renderAll();
      updateCurrentSlide(canvas.toJSON());
    }
  };
  
  // Alignment operations
  const setAlignment = (align) => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject && activeObject.type.includes('text')) {
      activeObject.set('textAlign', align);
      canvas.renderAll();
      updateCurrentSlide(canvas.toJSON());
    }
  };
  
  // Image operations
  const addImage = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (f) => {
          const data = f.target.result;
          fabric.Image.fromURL(data, (img) => {
            const canvas = getActiveCanvas();
            if (!canvas) return;
            
            // Scale image to fit within the canvas
            const maxWidth = canvas.width * 0.8;
            const maxHeight = canvas.height * 0.8;
            const scale = Math.min(maxWidth / img.width, maxHeight / img.height);
            
            img.scale(scale);
            img.set({
              left: 100,
              top: 100
            });
            
            canvas.add(img);
            canvas.setActiveObject(img);
            canvas.renderAll();
            updateCurrentSlide(canvas.toJSON());
          });
        };
        reader.readAsDataURL(file);
      }
    };
    fileInput.click();
  };
  
  // Delete selected object
  const deleteSelected = () => {
    const canvas = getActiveCanvas();
    if (!canvas) return;
    
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      canvas.remove(activeObject);
      canvas.renderAll();
      updateCurrentSlide(canvas.toJSON());
    }
  };
  
  if (!currentSlide) {
    return null;
  }
  
  return (
    <div className="bg-white border-b p-2 flex flex-wrap gap-2">
      {/* Text tools */}
      <div className="border-r pr-2 flex gap-1">
        <button 
          onClick={addText} 
          className="p-2 hover:bg-gray-100 rounded"
          title="Add Text"
        >
          <span className="text-lg">T</span>
        </button>
        <button 
          onClick={setBold} 
          className="p-2 hover:bg-gray-100 rounded font-bold"
          title="Bold"
        >
          B
        </button>
        <button 
          onClick={setItalic} 
          className="p-2 hover:bg-gray-100 rounded italic"
          title="Italic"
        >
          I
        </button>
        <button 
          onClick={setUnderline} 
          className="p-2 hover:bg-gray-100 rounded underline"
          title="Underline"
        >
          U
        </button>
      </div>
      
      {/* Alignment tools */}
      <div className="border-r pr-2 flex gap-1">
        <button 
          onClick={() => setAlignment('left')} 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Left"
        >
          ←
        </button>
        <button 
          onClick={() => setAlignment('center')} 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Center"
        >
          ↔
        </button>
        <button 
          onClick={() => setAlignment('right')} 
          className="p-2 hover:bg-gray-100 rounded"
          title="Align Right"
        >
          →
        </button>
      </div>
      
      {/* Image tools */}
      <div className="border-r pr-2">
        <button 
          onClick={addImage} 
          className="p-2 hover:bg-gray-100 rounded"
          title="Add Image"
        >
          🖼️
        </button>
      </div>
      
      {/* Delete tool */}
      <div>
        <button 
          onClick={deleteSelected} 
          className="p-2 hover:bg-gray-100 hover:text-red-500 rounded"
          title="Delete Selected"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}