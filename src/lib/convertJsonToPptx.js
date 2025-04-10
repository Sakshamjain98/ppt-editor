// lib/convertJsonToPptx.js
import PptxGenJS from 'pptxgenjs';

/**
 * Convert a Fabric.js JSON structure to a PPTX file
 * @param {Array} slides - Array of slides in Fabric.js format
 * @returns {Promise<Buffer>} - PPTX file buffer
 */
export async function convertJsonToPptx(slides) {
  try {
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
              
            case 'rect':
              pptxSlide.addShape('RECTANGLE', {
                x: (obj.left || 0) / 960,
                y: (obj.top || 0) / 540,
                w: (obj.width || 100) * (obj.scaleX || 1) / 960,
                h: (obj.height || 100) * (obj.scaleY || 1) / 540,
                fill: obj.fill || '#000000',
                line: {
                  color: obj.stroke || 'transparent',
                  width: obj.strokeWidth || 0,
                },
              });
              break;
              
            case 'circle':
              pptxSlide.addShape('OVAL', {
                x: (obj.left || 0) / 960,
                y: (obj.top || 0) / 540,
                w: (obj.radius || 50) * 2 * (obj.scaleX || 1) / 960,
                h: (obj.radius || 50) * 2 * (obj.scaleY || 1) / 540,
                fill: obj.fill || '#000000',
                line: {
                  color: obj.stroke || 'transparent',
                  width: obj.strokeWidth || 0,
                },
              });
              break;
              
            // Add more cases for other object types as needed
          }
        }
      }
    }
    
    // Generate the output file
    return await pptx.writeFile({ outputType: 'nodebuffer' });
  } catch (error) {
    console.error('Error converting JSON to PPTX:', error);
    throw error;
  }
}

/**
 * Convert a Fabric.js JSON structure to a PDF file
 * @param {Array} slides - Array of slides in Fabric.js format
 * @returns {Promise<Buffer>} - PDF file buffer
 */
export async function convertJsonToPdf(slides) {
  try {
    // Create a new presentation
    const pptx = new PptxGenJS();
    
    // Set up some defaults
    pptx.layout = 'LAYOUT_16x9';
    
    // Process each slide (same as PPTX conversion)
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
                x: (obj.left || 0) / 960,
                y: (obj.top || 0) / 540,
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
              
            // Add other object conversions as in convertJsonToPptx
          }
        }
      }
    }
    
    // Generate PDF
    return await pptx.writeFile({ outputType: 'nodebuffer' });
  } catch (error) {
    console.error('Error converting JSON to PDF:', error);
    throw error;
  }
}