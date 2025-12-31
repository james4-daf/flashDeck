import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export interface ParsedDocument {
  text: string;
  pageCount?: number;
}

/**
 * Parse a PDF file and extract text content
 */
export async function parsePDF(file: Buffer): Promise<ParsedDocument> {
  try {
    // PDFParse is a class that needs to be instantiated
    const parser = new PDFParse({ data: new Uint8Array(file) });
    const textResult = await parser.getText();
    const info = await parser.getInfo();
    await parser.destroy();
    
    return {
      text: textResult.text,
      pageCount: info.total,
    };
  } catch (error) {
    throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a DOCX file and extract text content
 */
export async function parseDOCX(file: Buffer): Promise<ParsedDocument> {
  try {
    const result = await mammoth.extractRawText({ buffer: file });
    return {
      text: result.value,
    };
  } catch (error) {
    throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse a file based on its MIME type or extension
 */
export async function parseDocument(
  file: Buffer,
  mimeType: string,
  filename?: string,
): Promise<ParsedDocument> {
  // Determine file type
  if (mimeType === 'application/pdf' || filename?.endsWith('.pdf')) {
    return parsePDF(file);
  }

  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    filename?.endsWith('.docx')
  ) {
    return parseDOCX(file);
  }

  throw new Error(`Unsupported file type: ${mimeType}. Supported types: PDF, DOCX`);
}

/**
 * Validate file size (max 10MB)
 */
export function validateFileSize(file: Buffer, maxSizeMB: number = 10): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.length > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
}

