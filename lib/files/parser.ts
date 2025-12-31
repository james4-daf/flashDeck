// Use dynamic imports for CommonJS modules to ensure they work in production builds
// These are loaded lazily to avoid issues with Next.js bundling
interface PdfParseResult {
  text: string;
  numpages: number;
  info: Record<string, unknown>;
  metadata: Record<string, unknown>;
}

let pdfParse: ((buffer: Buffer) => Promise<PdfParseResult>) | null = null;
let mammothModule: typeof import('mammoth') | null = null;

async function getPdfParse() {
  if (!pdfParse) {
    const pdfParseModule = await import('pdf-parse');
    // pdf-parse is a CommonJS module - handle both default and namespace exports
    // In production, it might be the module itself or module.default
    type PdfParseModule = typeof pdfParseModule & { default?: (buffer: Buffer) => Promise<PdfParseResult> };
    const pdfParseFn = (pdfParseModule as PdfParseModule).default || pdfParseModule;
    if (typeof pdfParseFn !== 'function') {
      throw new Error('pdf-parse module is not callable');
    }
    pdfParse = pdfParseFn as (buffer: Buffer) => Promise<PdfParseResult>;
  }
  return pdfParse;
}

async function getMammoth() {
  if (!mammothModule) {
    mammothModule = await import('mammoth');
  }
  return mammothModule;
}

/**
 * Validates that a file buffer does not exceed the maximum size
 * @param buffer - The file buffer to validate
 * @param maxSizeMB - Maximum size in megabytes
 * @throws Error if file size exceeds the limit
 */
export function validateFileSize(buffer: Buffer, maxSizeMB: number): void {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (buffer.length > maxSizeBytes) {
    throw new Error(`File size exceeds ${maxSizeMB}MB limit`);
  }
}

/**
 * Parses a document (PDF or DOCX) and extracts text content
 * @param buffer - The file buffer
 * @param mimeType - The MIME type of the file
 * @param fileName - The name of the file (for error messages)
 * @returns Object containing extracted text and page count
 * @throws Error if file type is unsupported or parsing fails
 */
export async function parseDocument(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<{ text: string; pageCount: number }> {
  // Determine file type
  const isPDF = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
  const isDOCX =
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.toLowerCase().endsWith('.docx');

  if (!isPDF && !isDOCX) {
    throw new Error(`Unsupported file type: ${mimeType}. Only PDF and DOCX files are supported.`);
  }

  try {
    if (isPDF) {
      // Parse PDF - use dynamic import to ensure it works in production
      const pdfParseFn = await getPdfParse();
      const pdfData = await pdfParseFn(buffer);
      return {
        text: pdfData.text,
        pageCount: pdfData.numpages,
      };
    } else {
      // Parse DOCX - use dynamic import to ensure it works in production
      const mammoth = await getMammoth();
      const result = await mammoth.extractRawText({ buffer });
      // Mammoth doesn't provide page count for DOCX, so we estimate based on text length
      // Average ~500 words per page, or ~2500 characters
      const estimatedPageCount = Math.max(1, Math.ceil(result.value.length / 2500));
      return {
        text: result.value,
        pageCount: estimatedPageCount,
      };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to parse ${fileName}: ${errorMessage}`);
  }
}
