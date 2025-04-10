// components/Editor/SlideNavigator.js
import { usePresentation } from '../../context/PresentationContext';

export default function SlideNavigator() {
  const { slides, currentSlideIndex, goToSlide, nextSlide, prevSlide } = usePresentation();

  if (!slides.length) {
    return null;
  }

  return (
    <div className="flex flex-col w-48 h-full bg-gray-100 border-r overflow-hidden">
      {/* Thumbnails */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {slides.map((slide, index) => (
          <div 
            key={index}
            className={`cursor-pointer transition-all p-1 border ${
              currentSlideIndex === index 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onClick={() => goToSlide(index)}
          >
            <div className="aspect-video bg-white relative flex items-center justify-center text-xs text-gray-500">
              {/* If we have a thumbnail, we'd display it here */}
              {/* For now, just display the slide number */}
              Slide {index + 1}
            </div>
          </div>
        ))}
      </div>
      
      {/* Navigation controls */}
      <div className="border-t p-2 flex justify-between">
        <button 
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={prevSlide}
          disabled={currentSlideIndex === 0}
        >
          ←
        </button>
        <span className="px-3 py-1">
          {currentSlideIndex + 1} / {slides.length}
        </span>
        <button 
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={nextSlide}
          disabled={currentSlideIndex === slides.length - 1}
        >
          →
        </button>
      </div>
    </div>
  );
}