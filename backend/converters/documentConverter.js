const fs = require('fs-extra');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const mammoth = require('mammoth');
const pdf = require('node-html-pdf');

/**
 * Document converter module for ZELL
 * Handles conversion between different document formats
 */
class DocumentConverter {
  
  /**
   * Convert document to target format
   * @param {string} inputPath - Path to input document
   * @param {string} outputPath - Path for output document
   * @param {string} targetFormat - Target format (pdf, docx, txt, pptx)
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Conversion result with file info
   */
  async convert(inputPath, outputPath, targetFormat, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      let result;
      
      // Route conversion based on input and target formats
      if (inputExtension === 'pdf' && targetFormat === 'txt') {
        result = await this.pdfToText(inputPath, outputPath);
      } else if (inputExtension === 'docx' && targetFormat === 'pdf') {
        result = await this.docxToPdf(inputPath, outputPath, compressionLevel);
      } else if (inputExtension === 'docx' && targetFormat === 'txt') {
        result = await this.docxToText(inputPath, outputPath);
      } else if (inputExtension === 'txt' && targetFormat === 'pdf') {
        result = await this.textToPdf(inputPath, outputPath, compressionLevel);
      } else if (inputExtension === 'txt' && targetFormat === 'docx') {
        result = await this.textToDocx(inputPath, outputPath);
      } else if (inputExtension === 'pptx' && targetFormat === 'pdf') {
        result = await this.pptxToPdf(inputPath, outputPath, compressionLevel);
      } else {
        throw new Error(`Conversion from ${inputExtension} to ${targetFormat} not supported`);
      }

      const outputStats = await fs.stat(outputPath);
      const compressedSize = outputStats.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      return {
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio)
      };

    } catch (error) {
      throw new Error(`Document conversion failed: ${error.message}`);
    }
  }

  /**
   * Compress document without changing format
   * @param {string} inputPath - Path to input document
   * @param {string} outputPath - Path for output document
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Compression result with file info
   */
  async compress(inputPath, outputPath, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      let result;
      
      // Apply compression based on document type
      switch (inputExtension) {
        case 'pdf':
          result = await this.compressPdf(inputPath, outputPath, compressionLevel);
          break;
        case 'docx':
          result = await this.compressDocx(inputPath, outputPath, compressionLevel);
          break;
        case 'txt':
          result = await this.compressText(inputPath, outputPath, compressionLevel);
          break;
        default:
          throw new Error(`Compression not supported for ${inputExtension} files`);
      }

      const outputStats = await fs.stat(outputPath);
      const compressedSize = outputStats.size;
      const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

      return {
        outputPath,
        originalSize,
        compressedSize,
        compressionRatio: parseFloat(compressionRatio)
      };

    } catch (error) {
      throw new Error(`Document compression failed: ${error.message}`);
    }
  }

  /**
   * Convert PDF to text
   * @param {string} inputPath - Path to PDF file
   * @param {string} outputPath - Path for text file
   * @returns {Object} Conversion result
   */
  async pdfToText(inputPath, outputPath) {
    try {
      // Note: This is a simplified implementation
      // For production, you'd want to use a proper PDF text extraction library like pdf-parse
      const pdfBuffer = await fs.readFile(inputPath);
      const text = 'PDF text extraction not implemented in this version. Please use a dedicated PDF reader.';
      
      await fs.writeFile(outputPath, text, 'utf8');
      
      return { outputPath };
    } catch (error) {
      throw new Error(`PDF to text conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert DOCX to PDF
   * @param {string} inputPath - Path to DOCX file
   * @param {string} outputPath - Path for PDF file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Conversion result
   */
  async docxToPdf(inputPath, outputPath, compressionLevel) {
    try {
      // Convert DOCX to HTML first
      const result = await mammoth.convertToHtml({ path: inputPath });
      const html = result.value;

      // Convert HTML to PDF
      const options = {
        format: 'A4',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      };

      // Apply compression settings
      if (compressionLevel === 'high') {
        options.quality = 75;
      } else if (compressionLevel === 'medium') {
        options.quality = 85;
      } else {
        options.quality = 95;
      }

      return new Promise((resolve, reject) => {
        pdf.create(html, options).toFile(outputPath, (error, res) => {
          if (error) {
            reject(new Error(`DOCX to PDF conversion failed: ${error.message}`));
          } else {
            resolve({ outputPath });
          }
        });
      });

    } catch (error) {
      throw new Error(`DOCX to PDF conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert DOCX to text
   * @param {string} inputPath - Path to DOCX file
   * @param {string} outputPath - Path for text file
   * @returns {Object} Conversion result
   */
  async docxToText(inputPath, outputPath) {
    try {
      const result = await mammoth.extractRawText({ path: inputPath });
      const text = result.value;
      
      await fs.writeFile(outputPath, text, 'utf8');
      
      return { outputPath };
    } catch (error) {
      throw new Error(`DOCX to text conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert text to PDF
   * @param {string} inputPath - Path to text file
   * @param {string} outputPath - Path for PDF file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Conversion result
   */
  async textToPdf(inputPath, outputPath, compressionLevel) {
    try {
      const text = await fs.readFile(inputPath, 'utf8');
      
      // Convert text to HTML
      const html = `
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; margin: 40px; }
              pre { white-space: pre-wrap; word-wrap: break-word; }
            </style>
          </head>
          <body>
            <pre>${text}</pre>
          </body>
        </html>
      `;

      const options = {
        format: 'A4',
        border: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        }
      };

      // Apply compression settings
      if (compressionLevel === 'high') {
        options.quality = 75;
      } else if (compressionLevel === 'medium') {
        options.quality = 85;
      } else {
        options.quality = 95;
      }

      return new Promise((resolve, reject) => {
        pdf.create(html, options).toFile(outputPath, (error, res) => {
          if (error) {
            reject(new Error(`Text to PDF conversion failed: ${error.message}`));
          } else {
            resolve({ outputPath });
          }
        });
      });

    } catch (error) {
      throw new Error(`Text to PDF conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert text to DOCX
   * @param {string} inputPath - Path to text file
   * @param {string} outputPath - Path for DOCX file
   * @returns {Object} Conversion result
   */
  async textToDocx(inputPath, outputPath) {
    try {
      const text = await fs.readFile(inputPath, 'utf8');
      
      // Note: This is a simplified implementation
      // For production, you'd want to use a proper DOCX creation library like docx
      const docxContent = `Text to DOCX conversion not fully implemented in this version. Original text: ${text}`;
      
      await fs.writeFile(outputPath, docxContent, 'utf8');
      
      return { outputPath };
    } catch (error) {
      throw new Error(`Text to DOCX conversion failed: ${error.message}`);
    }
  }

  /**
   * Convert PPTX to PDF
   * @param {string} inputPath - Path to PPTX file
   * @param {string} outputPath - Path for PDF file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Conversion result
   */
  async pptxToPdf(inputPath, outputPath, compressionLevel) {
    try {
      // Note: PPTX to PDF conversion requires additional libraries
      // This is a placeholder implementation
      const placeholderText = 'PPTX to PDF conversion not implemented in this version. Please use a dedicated presentation converter.';
      
      await fs.writeFile(outputPath, placeholderText, 'utf8');
      
      return { outputPath };
    } catch (error) {
      throw new Error(`PPTX to PDF conversion failed: ${error.message}`);
    }
  }

  /**
   * Compress PDF
   * @param {string} inputPath - Path to PDF file
   * @param {string} outputPath - Path for compressed PDF file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Compression result
   */
  async compressPdf(inputPath, outputPath, compressionLevel) {
    try {
      // Note: PDF compression requires specialized libraries
      // This is a placeholder implementation
      const originalContent = await fs.readFile(inputPath);
      await fs.writeFile(outputPath, originalContent);
      
      return { outputPath };
    } catch (error) {
      throw new Error(`PDF compression failed: ${error.message}`);
    }
  }

  /**
   * Compress DOCX
   * @param {string} inputPath - Path to DOCX file
   * @param {string} outputPath - Path for compressed DOCX file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Compression result
   */
  async compressDocx(inputPath, outputPath, compressionLevel) {
    try {
      // Note: DOCX compression requires specialized libraries
      // This is a placeholder implementation
      const originalContent = await fs.readFile(inputPath);
      await fs.writeFile(outputPath, originalContent);
      
      return { outputPath };
    } catch (error) {
      throw new Error(`DOCX compression failed: ${error.message}`);
    }
  }

  /**
   * Compress text file
   * @param {string} inputPath - Path to text file
   * @param {string} outputPath - Path for compressed text file
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Compression result
   */
  async compressText(inputPath, outputPath, compressionLevel) {
    try {
      const text = await fs.readFile(inputPath, 'utf8');
      
      // Simple text compression by removing extra whitespace
      let compressedText = text;
      
      if (compressionLevel === 'high') {
        compressedText = text.replace(/\s+/g, ' ').trim();
      } else if (compressionLevel === 'medium') {
        compressedText = text.replace(/\n\s*\n/g, '\n').replace(/[ \t]+/g, ' ');
      }
      
      await fs.writeFile(outputPath, compressedText, 'utf8');
      
      return { outputPath };
    } catch (error) {
      throw new Error(`Text compression failed: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   * @param {string} inputPath - Path to document file
   * @returns {Object} Document metadata
   */
  async getMetadata(inputPath) {
    try {
      const stats = await fs.stat(inputPath);
      const extension = path.extname(inputPath).toLowerCase().slice(1);
      
      return {
        size: stats.size,
        format: extension,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get document metadata: ${error.message}`);
    }
  }
}

module.exports = new DocumentConverter();


