"use client";


// context/PresentationContext.js
import { createContext, useContext, useState } from 'react';

const PresentationContext = createContext();

export function PresentationProvider({ children }) {
  const [slides, setSlides] = useState([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [fileName, setFileName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Get current slide
  const currentSlide = slides[currentSlideIndex] || null;

  // Navigate between slides
  const nextSlide = () => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  };

  const goToSlide = (index) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };

  // Update slide data
  const updateCurrentSlide = (fabricJson) => {
    const updatedSlides = [...slides];
    updatedSlides[currentSlideIndex] = {
      ...updatedSlides[currentSlideIndex],
      fabricJson
    };
    setSlides(updatedSlides);
  };

  // Set presentation data from JSON
  const loadPresentation = (presentationData, name) => {
    try {
      console.log('Loading presentation:', presentationData, name);
      
      // Transform the pptx-compose JSON to Fabric.js format
      const fabricSlides = presentationData.map(slide => {
        return {
          fabricJson: {
            objects: slide.fabricJson.objects.map(element => {
              // Convert position and size values to appropriate scale
              // Dividing by a factor of 12700 (common in PowerPoint EMU to pixels)
              return {
                ...element,
                left: typeof element.left === 'number' ? element.left / 12700 : element.left,
                top: typeof element.top === 'number' ? element.top / 12700 : element.top,
                width: typeof element.width === 'number' ? element.width / 12700 : element.width,
                height: typeof element.height === 'number' ? element.height / 12700 : element.height,
                // Ensure fontSize is also converted if it's a numeric value
                fontSize: typeof element.fontSize === 'number' ? element.fontSize : element.fontSize
              };
            }),
            background: slide.fabricJson.background || '#ffffff',
            width: slide.fabricJson.width || 960,
            height: slide.fabricJson.height || 540
          }
        };
      });
  
      setSlides(fabricSlides);
      setFileName(name);
      setCurrentSlideIndex(0);
    } catch (error) {
      console.error('Error loading presentation:', error);
      // Handle error appropriately
    }
  };
  // Clear presentation
  const clearPresentation = () => {
    setSlides([]);
    setFileName('');
    setCurrentSlideIndex(0);
  };

  return (
    <PresentationContext.Provider
      value={{
        slides,
        currentSlide,
        currentSlideIndex,
        fileName,
        isLoading,
        setIsLoading,
        nextSlide,
        prevSlide,
        goToSlide,
        updateCurrentSlide,
        loadPresentation,
        clearPresentation
      }}
    >
      {children}
    </PresentationContext.Provider>
  );
}

export const usePresentation = () => useContext(PresentationContext);