// app/api/export/route.js
import { NextResponse } from 'next/server';
import PptxGenJS from 'pptxgenjs';

export async function POST(request) {
  try {
    const { slides, format } = await request.json();
    
    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json({ error: 'Invalid slides data' }, { status: 400 });
    }
    
    // Create a new presentation
    const pptx = new PptxGenJS();
    
    // Set up some defaults
    pptx.layout = 'LAYOUT_16x9';
    
    // Process each slide
    for (const slide of slides) {
      const pptxSlide = pptx.addSlide();
      
      // Convert Fabric.js objects to PPTX elements
      if (slide.fabricJson && slide.fabricJson.objects) {
        for (const obj of slide.fabricJson.objects) {
          switch (obj.type) {
            case 'textbox':
            case 'i-text':
            case 'text':
              // Convert text objects
              pptxSlide.addText(obj.text || '', {
                x: (obj.left || 0) / 960, // Convert from pixels to percentage (0-1)
                y: (obj.top || 0) / 540,  // Convert from pixels to percentage (0-1)
                w: (obj.width || 200) / 960,
                h: (obj.height || 50) / 540,
                fontSize: obj.fontSize || 14,
                fontFace: obj.fontFamily || 'Arial',
                color: obj.fill || '#000000',
                bold: obj.fontWeight === 'bold',
                italic: obj.fontStyle === 'italic',
                underline: obj.underline,
                align: obj.textAlign || 'left',
              });
              break;
              
            case 'image':
              // For images, we'd need to extract the image data
              // This is a simplified version
              if (obj.src && obj.src.startsWith('data:image')) {
                const imgData = obj.src.split(',')[1]; // Get base64 data
                pptxSlide.addImage({
                  data: imgData,
                  x: (obj.left || 0) / 960,
                  y: (obj.top || 0) / 540,
                  w: (obj.width * obj.scaleX || 200) / 960,
                  h: (obj.height * obj.scaleY || 200) / 540,
                });
              }
              break;
              
            // Add more cases for other object types as needed
          }
        }
      }
      
      // If the slide is empty, add a placeholder
      if (!slide.fabricJson || !slide.fabricJson.objects || slide.fabricJson.objects.length === 0) {
        pptxSlide.addText('Empty Slide', {
          x: 0.5,
          y: 0.5,
          w: 5,
          h: 1,
          fontSize: 24,
          align: 'center',
        });
      }
    }
    
    // Generate the output file
    const fileBuffer = await pptx.writeFile({ outputType: format === 'pdf' ? 'nodebuffer' : 'nodebuffer' });
    
    // Set the appropriate content type
    const contentType = format === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    
    // Return the file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="presentation.${format}"`,
      },
    });
  } catch (error) {
    console.error('Error exporting presentation:', error);
    return NextResponse.json({ error: 'Failed to export presentation' }, { status: 500 });
  }
}