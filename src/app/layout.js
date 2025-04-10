// app/layout.js
import './globals.css';
import PresentationWrapper from '@/components/PresentationWrapper';

export const metadata = {
  title: 'PowerPoint Editor',
  description: 'A web-based PowerPoint editor built with Next.js, Tailwind CSS, and Fabric.js',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <PresentationWrapper>
          {children}
        </PresentationWrapper>
      </body>
    </html>
  );
}
