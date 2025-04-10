// app/page.js
'use client';

import { usePresentation } from '../context/PresentationContext';
import FileUploader from '../components/FileUploader';
import Editor from '../components/Editor';

export default function Home() {
  const { slides, isLoading } = usePresentation();

  return (
    <main className="min-h-screen flex flex-col">
      <header className="bg-white p-4 shadow-sm border-b">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-700">PowerPoint Editor</h1>
        </div>
      </header>

      <div className="flex-1 container mx-auto p-4 flex flex-col">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Processing...</p>
            </div>
          </div>
        ) : slides.length > 0 ? (
          <div className="flex-1 flex flex-col h-[calc(100vh-8rem)]">
            <Editor />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <FileUploader />
              <p className="text-center mt-4 text-gray-500">
                Upload a PowerPoint file to get started
              </p>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-white p-4 border-t">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          PowerPoint Editor - Built with Next.js, Tailwind CSS, and Fabric.js
        </div>
      </footer>
    </main>
  );
}