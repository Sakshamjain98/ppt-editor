import JSZip from 'jszip';
import { DOMParser } from 'xmldom';
import fs from 'fs';
import path from 'path';

// Helper function to extract text from XML nodes
function getTextContent(node, tagName) {
  const elements = node.getElementsByTagName(tagName);
  return elements.length > 0 ? elements[0].textContent : '';
}

// Convert PowerPoint color to hex
function pptColorToHex(color) {
  if (!color) return '#000000';
  if (color.startsWith('#')) return color;
  // Simple conversion - actual PPT colors are more complex
  return `#${color.substring(3)}`;
}

export async function ensureUploadDir(uploadDir) {
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
  } catch (error) {
    console.error('Error creating upload directory:', error);
    throw error;
  }
}

export async function saveFile(fileData, fileName) {
  const uploadDir = path.join(process.cwd(), 'uploads');
  await ensureUploadDir(uploadDir);
  
  const timestamp = Date.now();
  const uniqueFileName = `${timestamp}-${fileName}`;
  const filePath = path.join(uploadDir, uniqueFileName);
  
  return new Promise((resolve, reject) => {
    fs.writeFile(filePath, fileData, (err) => {
      if (err) reject(err);
      else resolve(filePath);
    });
  });
}

export async function convertPptxToJson(fileInput, originalFilename) {
  try {
    // Save the original file
    const fileData = fileInput instanceof Buffer ? fileInput : Buffer.from(await fileInput.arrayBuffer());
    const savedFilePath = await saveFile(fileData, originalFilename);

    // Extract PPTX content
    const zip = await JSZip.loadAsync(fileData);
    const slideFiles = [];
    const themeFiles = [];
    const mediaFiles = {};

    // Find all slides and themes
    zip.forEach((relativePath, file) => {
      if (relativePath.startsWith('ppt/slides/slide') && relativePath.endsWith('.xml')) {
        slideFiles.push(relativePath);
      } else if (relativePath.startsWith('ppt/theme/theme') && relativePath.endsWith('.xml')) {
        themeFiles.push(relativePath);
      } else if (relativePath.startsWith('ppt/media/')) {
        mediaFiles[relativePath] = file;
      }
    });

    // Process themes (simplified)
    const themes = {};
    for (const themePath of themeFiles) {
      const themeContent = await zip.file(themePath).async('text');
      const themeXml = new DOMParser().parseFromString(themeContent);
      const colorSchemes = themeXml.getElementsByTagName('a:clrScheme');
      if (colorSchemes.length > 0) {
        themes[themePath] = {
          colors: {
            dark1: pptColorToHex(getTextContent(colorSchemes[0], 'a:dk1')),
            light1: pptColorToHex(getTextContent(colorSchemes[0], 'a:lt1')),
            accent1: pptColorToHex(getTextContent(colorSchemes[0], 'a:accent1')),
          }
        };
      }
    }

    // Process slides
    const slides = [];
    for (const slidePath of slideFiles) {
      const slideContent = await zip.file(slidePath).async('text');
      const slideXml = new DOMParser().parseFromString(slideContent);
      
      const objects = [];
      const shapes = slideXml.getElementsByTagName('p:sp');
      
      for (let i = 0; i < shapes.length; i++) {
        const shape = shapes[i];
        
        // Get shape properties
        const txBody = shape.getElementsByTagName('p:txBody')[0];
        const spPr = shape.getElementsByTagName('p:spPr')[0];
        const xfrm = spPr?.getElementsByTagName('a:xfrm')[0];
        const off = xfrm?.getElementsByTagName('a:off')[0];
        const ext = xfrm?.getElementsByTagName('a:ext')[0];
        
        if (txBody) {
          // Text shape
          const paragraphs = txBody.getElementsByTagName('a:p');
          let textContent = '';
          
          for (let p = 0; p < paragraphs.length; p++) {
            const textRuns = paragraphs[p].getElementsByTagName('a:r');
            for (let r = 0; r < textRuns.length; r++) {
              textContent += getTextContent(textRuns[r], 'a:t') + ' ';
            }
            textContent += '\n';
          }
          
          objects.push({
            type: 'textbox',
            text: textContent.trim(),
            left: parseInt(off?.getAttribute('x') || '100'),
            top: parseInt(off?.getAttribute('y') || '100'),
            width: parseInt(ext?.getAttribute('cx') || '200'),
            height: parseInt(ext?.getAttribute('cy') || '50'),
            fill: pptColorToHex(spPr?.getElementsByTagName('a:solidFill')[0]?.firstChild?.nodeName === 'a:srgbClr' 
              ? spPr.getElementsByTagName('a:solidFill')[0].firstChild.getAttribute('val') : '#000000'),
            fontSize: 12, // Default, would need to parse from XML
            fontFamily: 'Arial' // Default, would need to parse from XML
          });
        } else {
          // Non-text shape
          objects.push({
            type: 'rect',
            left: parseInt(off?.getAttribute('x') || '100'),
            top: parseInt(off?.getAttribute('y') || '100'),
            width: parseInt(ext?.getAttribute('cx') || '200'),
            height: parseInt(ext?.getAttribute('cy') || '100'),
            fill: pptColorToHex(spPr?.getElementsByTagName('a:solidFill')[0]?.firstChild?.nodeName === 'a:srgbClr' 
              ? spPr.getElementsByTagName('a:solidFill')[0].firstChild.getAttribute('val') : '#ffffff'),
            stroke: pptColorToHex(spPr?.getElementsByTagName('a:ln')[0]?.firstChild?.firstChild?.nodeName === 'a:srgbClr'
              ? spPr.getElementsByTagName('a:ln')[0].firstChild.firstChild.getAttribute('val') : '#000000'),
            strokeWidth: 1
          });
        }
      }

      // Add images
      const picElements = slideXml.getElementsByTagName('p:pic');
      for (let i = 0; i < picElements.length; i++) {
        const pic = picElements[i];
        const blip = pic.getElementsByTagName('a:blip')[0];
        const embedId = blip?.getAttribute('r:embed');
        const xfrm = pic.getElementsByTagName('a:xfrm')[0];
        const off = xfrm?.getElementsByTagName('a:off')[0];
        const ext = xfrm?.getElementsByTagName('a:ext')[0];

        if (embedId) {
          const imagePath = `ppt/media/${embedId.substring(3)}`; // Remove 'rId'
          if (mediaFiles[imagePath]) {
            const imageData = await mediaFiles[imagePath].async('base64');
            objects.push({
              type: 'image',
              src: `data:image/png;base64,${imageData}`,
              left: parseInt(off?.getAttribute('x') || '100'),
              top: parseInt(off?.getAttribute('y') || '100'),
              width: parseInt(ext?.getAttribute('cx') || '200'),
              height: parseInt(ext?.getAttribute('cy') || '200'),
              originX: 'left',
              originY: 'top'
            });
          }
        }
      }

      slides.push({
        fabricJson: {
          objects,
          width: 960, // Default slide width
          height: 540, // Default slide height
          background: '#ffffff' // Default background
        }
      });
    }

    // Save JSON output
    const jsonOutputPath = savedFilePath.replace(/\.(pptx|ppt)$/i, '.json');
    await fs.promises.writeFile(jsonOutputPath, JSON.stringify(slides, null, 2));

    return {
      slides,
      filePath: savedFilePath,
      jsonPath: jsonOutputPath
    };

  } catch (error) {
    console.error('Error converting PPTX to JSON:', error);
    throw error;
  }
}