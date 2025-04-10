import { useEffect, useRef, useState } from 'react';
import { usePresentation } from '../../context/PresentationContext';

export default function CanvasEditor() {
  const canvasRef = useRef(null);
  const [fabricCanvas, setFabricCanvas] = useState(null);
  const { currentSlide, updateCurrentSlide } = usePresentation();

  // Initialize Fabric canvas
  useEffect(() => {
    const initFabric = async () => {
      try {
        const fabricModule = await import('fabric');
        const fabric = fabricModule.default || fabricModule.fabric;
        
        if (!fabric || !canvasRef.current) return;
        
        const canvas = new fabric.Canvas(canvasRef.current, {
          width: 960,
          height: 540,
          backgroundColor: 'white'
        });
        
        setFabricCanvas(canvas);
        window.fabricCanvas = canvas; // Make available globally
        
        // Set up event handlers
        canvas.on('object:modified', () => {
          updateCurrentSlide(canvas.toJSON());
        });
        
        canvas.on('object:added', () => {
          updateCurrentSlide(canvas.toJSON());
        });
        
        canvas.on('object:removed', () => {
          updateCurrentSlide(canvas.toJSON());
        });
        
      } catch (error) {
        console.error('Error initializing Fabric:', error);
      }
    };
    
    initFabric();
    
    return () => {
      if (fabricCanvas) {
        fabricCanvas.dispose();
      }
    };
  }, []);

  // Load slide content
  useEffect(() => {
    if (!fabricCanvas || !currentSlide) return;
    
    console.log("Loading slide content:", currentSlide);

    try {
      fabricCanvas.clear();
      
      // Set canvas dimensions
      if (currentSlide.fabricJson.width && currentSlide.fabricJson.height) {
        fabricCanvas.setDimensions({
          width: currentSlide.fabricJson.width,
          height: currentSlide.fabricJson.height
        });
      }
      
      // Set background
      fabricCanvas.backgroundColor = currentSlide.fabricJson.background || 'white';
      fabricCanvas.renderAll(); // Render after setting background
      
      // Load objects one by one to ensure they're created properly
      if (currentSlide.fabricJson.objects && Array.isArray(currentSlide.fabricJson.objects)) {
        const loadObjects = async () => {
          const fabric = (await import('fabric')).fabric;
          
          for (const object of currentSlide.fabricJson.objects) {
            if (object.type === 'textbox' || object.type === 'i-text') {
              const textObj = new fabric.Textbox(object.text || '', {
                left: object.left,
                top: object.top,
                width: object.width,
                height: object.height,
                fill: object.fill,
                fontSize: object.fontSize,
                fontFamily: object.fontFamily,
                textAlign: object.textAlign,
                fontWeight: object.fontWeight,
                fontStyle: object.fontStyle,
                underline: object.underline
              });
              fabricCanvas.add(textObj);
            } else if (object.type === 'image') {
              fabric.Image.fromURL(object.src, (img) => {
                img.set({
                  left: object.left,
                  top: object.top,
                  width: object.width,
                  height: object.height,
                  scaleX: object.scaleX,
                  scaleY: object.scaleY
                });
                fabricCanvas.add(img);
                fabricCanvas.renderAll();
              });
            } else if (object.type === 'rect') {
              const rect = new fabric.Rect({
                left: object.left,
                top: object.top,
                width: object.width,
                height: object.height,
                fill: object.fill
              });
              fabricCanvas.add(rect);
            }
            // Add more object types as needed
          }
          fabricCanvas.renderAll();
        };
        
        loadObjects();
      } else {
        console.warn("No objects found in slide or invalid structure:", currentSlide);
      }
    } catch (error) {
      console.error('Error loading slide content:', error, currentSlide);
    }
  }, [currentSlide, fabricCanvas]);

  return (
    <div className="canvas-editor">
      <div className="canvas-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}