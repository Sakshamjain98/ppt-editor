// app/api/convert-to-json/route.js
import { NextResponse } from 'next/server';
import PPTXCompose from 'pptx-compose';
import { writeFile, unlink } from 'fs/promises'; // Added the unlink import
import { join } from 'path';
import os from 'os';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request) {
  let tempFilePath = null;
  
  try {
    // Handle form data
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    // Create a temporary file
    const buffer = Buffer.from(await file.arrayBuffer());
    tempFilePath = join(os.tmpdir(), `upload-${uuidv4()}.pptx`);
    await writeFile(tempFilePath, buffer);
    
    // Initialize pptx-compose
    const composer = new PPTXCompose();
    
    // Parse PPTX to JSON using the library with file path
    const slides = await composer.toJSON(tempFilePath);
    
    return NextResponse.json({ slides });
  } catch (error) {
    console.error('Conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert file', details: error.message },
      { status: 500 }
    );
  } finally {
    // Clean up the temporary file if it was created
    if (tempFilePath) {
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.error('Failed to delete temporary file:', err);
      }
    }
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};