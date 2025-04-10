// app/api/upload-and-convert/route.js
import { NextResponse } from 'next/server';
import { convertPptxToJson } from '../../../lib/convertPptxToJson';
import fs from 'fs';

export async function POST(request) {
    try {
      const formData = await request.formData();
      const file = formData.get('file');
      
      if (!file) {
        return new Response(JSON.stringify({ error: 'No file uploaded' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }
  
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      const { slides, filePath, jsonPath } = await convertPptxToJson(
        buffer,
        file.name
      );
      
      return new Response(JSON.stringify({ 
        success: true,
        slides,
        fileName: file.name,
        filePath,
        jsonPath
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
      
    } catch (error) {
      console.error('Error handling file upload:', error);
      return new Response(JSON.stringify({ 
        error: 'Failed to convert PPTX',
        details: error.message 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }