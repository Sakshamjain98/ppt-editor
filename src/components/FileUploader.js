// components/FileUploader.js
import { useState } from 'react';
import { usePresentation } from '../context/PresentationContext';

export default function FileUploader() {
  const [dragActive, setDragActive] = useState(false);
  const { setIsLoading, loadPresentation } = usePresentation();
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };
  
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleChange = async (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      await handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = async (file) => {
    if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
      setIsLoading(true);
      try {
        // Send the file to our API route for conversion and storage
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch('/api/upload-and-convert', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error('Failed to upload and convert file');
        }
        
        const data = await response.json();
        loadPresentation(data.slides, file.name);
        
        // Notify user of successful upload
        console.log('File uploaded successfully:', data.filePath);
      } catch (error) {
        console.error('Error processing file:', error);
        alert('Failed to process the file. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      alert('Please upload a .pptx or .ppt file');
    }
  };
  
  return (
    <div 
      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <label className="flex flex-col items-center justify-center cursor-pointer">
        <svg 
          className="w-12 h-12 text-gray-400 mb-3" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth="2" 
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <span className="text-lg font-medium text-gray-700">
          Drag & drop your PPT or PPTX file here
        </span>
        <span className="text-sm text-gray-500 mt-1">
          or click to browse
        </span>
        <input 
          type="file" 
          accept=".ppt,.pptx" 
          className="hidden" 
          onChange={handleChange} 
        />
        <button 
          type="button" 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          onClick={() => document.querySelector('input[type="file"]').click()}
        >
          Select File
        </button>
      </label>
    </div>
  );
}