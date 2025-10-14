import * as FileSystem from 'expo-file-system';

/**
 * Conversion Service for ZELL
 * Handles file conversion operations with the backend API
 */
class ConversionService {
  static BASE_URL = 'http://localhost:3001/api';

  /**
   * Convert file to target format
   * @param {Object} file - File object with uri, name, size, mimeType
   * @param {string} targetFormat - Target format
   * @param {string} compressionLevel - Compression level
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Conversion result
   */
  static async convertFile(file, targetFormat, compressionLevel = 'medium', onProgress) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add file to form data
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
      
      // Add conversion parameters
      formData.append('targetFormat', targetFormat);
      formData.append('compressionLevel', compressionLevel);

      // Make conversion request
      const response = await fetch(`${this.BASE_URL}/convert`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const result = await response.json();

      // Simulate progress updates
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          onProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Generate download URL
      const downloadUrl = `${this.BASE_URL}/download/${result.fileName}`;

      return {
        ...result,
        downloadUrl,
        originalFile: file,
        targetFormat,
        compressionLevel,
      };

    } catch (error) {
      console.error('Conversion error:', error);
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }

  /**
   * Batch convert multiple files
   * @param {Array} files - Array of file objects
   * @param {string} targetFormat - Target format
   * @param {string} compressionLevel - Compression level
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Array>} Array of conversion results
   */
  static async batchConvertFiles(files, targetFormat, compressionLevel = 'medium', onProgress) {
    try {
      const formData = new FormData();
      
      // Add all files to form data
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.mimeType,
        } as any);
      });
      
      // Add conversion parameters
      formData.append('targetFormat', targetFormat);
      formData.append('compressionLevel', compressionLevel);

      // Make batch conversion request
      const response = await fetch(`${this.BASE_URL}/batch-convert`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Batch conversion failed');
      }

      const result = await response.json();

      // Simulate progress updates
      if (onProgress) {
        for (let i = 0; i <= 100; i += 10) {
          onProgress(i);
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Add download URLs to results
      const resultsWithUrls = result.results.map(item => ({
        ...item,
        downloadUrl: item.success ? `${this.BASE_URL}/download/${item.outputFileName}` : null,
        targetFormat,
        compressionLevel,
      }));

      return resultsWithUrls;

    } catch (error) {
      console.error('Batch conversion error:', error);
      throw new Error(`Batch conversion failed: ${error.message}`);
    }
  }

  /**
   * Get supported formats
   * @returns {Promise<Object>} Supported formats by category
   */
  static async getSupportedFormats() {
    try {
      const response = await fetch(`${this.BASE_URL}/formats`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch supported formats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching supported formats:', error);
      // Return default formats if API is not available
      return {
        documents: ['pdf', 'docx', 'txt', 'pptx'],
        images: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
        audio: ['mp3', 'wav', 'aac'],
        video: ['mp4', 'mov', 'avi', 'mkv'],
        archives: ['zip', 'rar', '7z']
      };
    }
  }

  /**
   * Check if conversion is supported
   * @param {string} fromFormat - Source format
   * @param {string} toFormat - Target format
   * @returns {boolean} Whether conversion is supported
   */
  static isConversionSupported(fromFormat, toFormat) {
    const conversionMap = {
      // Images
      'jpg': ['png', 'webp'],
      'jpeg': ['png', 'webp'],
      'png': ['jpg', 'webp'],
      'webp': ['jpg', 'png'],
      'gif': ['jpg', 'png', 'webp'],
      
      // Audio
      'mp3': ['wav', 'aac'],
      'wav': ['mp3', 'aac'],
      'aac': ['mp3', 'wav'],
      
      // Video
      'mp4': ['mov', 'avi', 'mkv'],
      'mov': ['mp4', 'avi', 'mkv'],
      'avi': ['mp4', 'mov', 'mkv'],
      'mkv': ['mp4', 'mov', 'avi'],
      
      // Documents
      'pdf': ['docx', 'txt'],
      'docx': ['pdf', 'txt'],
      'txt': ['pdf', 'docx'],
      'pptx': ['pdf'],
      
      // Archives
      'zip': ['rar', '7z'],
      'rar': ['zip', '7z'],
      '7z': ['zip', 'rar'],
    };

    return conversionMap[fromFormat]?.includes(toFormat) || false;
  }

  /**
   * Get estimated conversion time
   * @param {Object} file - File object
   * @param {string} targetFormat - Target format
   * @returns {number} Estimated time in seconds
   */
  static getEstimatedConversionTime(file, targetFormat) {
    const fileSizeMB = file.size / (1024 * 1024);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Base time estimates by file type and size
    const timeEstimates = {
      image: fileSizeMB * 0.5, // 0.5 seconds per MB
      audio: fileSizeMB * 2,   // 2 seconds per MB
      video: fileSizeMB * 5,   // 5 seconds per MB
      document: fileSizeMB * 0.1, // 0.1 seconds per MB
      archive: fileSizeMB * 1, // 1 second per MB
    };

    const fileCategory = this.getFileCategory(fileExtension);
    const baseTime = timeEstimates[fileCategory] || 1;
    
    // Add complexity factor for cross-format conversions
    const complexityFactor = this.isConversionSupported(fileExtension, targetFormat) ? 1 : 1.5;
    
    return Math.max(5, Math.round(baseTime * complexityFactor));
  }

  /**
   * Get file category
   * @param {string} extension - File extension
   * @returns {string} File category
   */
  static getFileCategory(extension) {
    const categories = {
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'webp': 'image', 'gif': 'image',
      'mp3': 'audio', 'wav': 'audio', 'aac': 'audio',
      'mp4': 'video', 'mov': 'video', 'avi': 'video', 'mkv': 'video',
      'pdf': 'document', 'docx': 'document', 'txt': 'document', 'pptx': 'document',
      'zip': 'archive', 'rar': 'archive', '7z': 'archive',
    };
    return categories[extension] || 'text';
  }

  /**
   * Validate file for conversion
   * @param {Object} file - File object
   * @returns {Object} Validation result
   */
  static validateFile(file) {
    const errors = [];
    const warnings = [];

    // Check file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      errors.push('File size exceeds 100MB limit');
    }

    // Check file extension
    const extension = file.name.split('.').pop().toLowerCase();
    if (!extension) {
      errors.push('File must have an extension');
    }

    // Check if format is supported
    const supportedFormats = [
      'jpg', 'jpeg', 'png', 'webp', 'gif', // Images
      'mp3', 'wav', 'aac', // Audio
      'mp4', 'mov', 'avi', 'mkv', // Video
      'pdf', 'docx', 'txt', 'pptx', // Documents
      'zip', 'rar', '7z', // Archives
    ];

    if (!supportedFormats.includes(extension)) {
      errors.push(`File format .${extension} is not supported`);
    }

    // Add warnings for large files
    if (file.size > 50 * 1024 * 1024) { // 50MB
      warnings.push('Large file may take longer to process');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

export default ConversionService;


