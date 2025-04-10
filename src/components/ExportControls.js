// components/ExportControls.js
import { usePresentation } from '../context/PresentationContext';
import { saveAs } from 'file-saver';

export default function ExportControls() {
  const { slides, fileName, isLoading, setIsLoading } = usePresentation();
  
  const exportToPptx = async () => {
    if (!slides.length) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides,
          format: 'pptx',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export presentation');
      }
      
      const blob = await response.blob();
      saveAs(blob, fileName.replace('.pptx', '') + '_edited.pptx');
    } catch (error) {
      console.error('Error exporting presentation:', error);
      alert('Failed to export presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const exportToPdf = async () => {
    if (!slides.length) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slides,
          format: 'pdf',
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to export presentation');
      }
      
      const blob = await response.blob();
      saveAs(blob, fileName.replace('.pptx', '') + '.pdf');
    } catch (error) {
      console.error('Error exporting presentation:', error);
      alert('Failed to export presentation. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!slides.length) {
    return null;
  }
  
  return (
    <div className="flex gap-2">
      <button
        onClick={exportToPptx}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:bg-blue-300"
      >
        {isLoading ? 'Processing...' : 'Export as PPTX'}
      </button>
      <button
        onClick={exportToPdf}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-green-300"
      >
        {isLoading ? 'Processing...' : 'Export as PDF'}
      </button>
    </div>
  );
}