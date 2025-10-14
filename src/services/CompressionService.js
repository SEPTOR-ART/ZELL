import * as FileSystem from 'expo-file-system';

/**
 * Compression Service for ZELL
 * Handles file compression operations with the backend API
 */
class CompressionService {
  static BASE_URL = 'http://localhost:3001/api';

  /**
   * Compress file
   * @param {Object} file - File object with uri, name, size, mimeType
   * @param {string} compressionLevel - Compression level
   * @param {Function} onProgress - Progress callback
   * @returns {Promise<Object>} Compression result
   */
  static async compressFile(file, compressionLevel = 'medium', onProgress) {
    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add file to form data
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.mimeType,
      } as any);
      
      // Add compression parameters
      formData.append('compressionLevel', compressionLevel);

      // Make compression request
      const response = await fetch(`${this.BASE_URL}/compress`, {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Compression failed');
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
        compressionLevel,
      };

    } catch (error) {
      console.error('Compression error:', error);
      throw new Error(`Compression failed: ${error.message}`);
    }
  }

  /**
   * Check if file type supports compression
   * @param {string} fileExtension - File extension
   * @returns {boolean} Whether compression is supported
   */
  static isCompressionSupported(fileExtension) {
    const compressibleTypes = [
      // Images
      'jpg', 'jpeg', 'png', 'webp', 'gif',
      // Audio
      'mp3', 'wav', 'aac',
      // Video
      'mp4', 'mov', 'avi', 'mkv',
      // Documents
      'pdf', 'docx', 'txt',
      // Archives
      'zip', 'rar', '7z',
    ];

    return compressibleTypes.includes(fileExtension.toLowerCase());
  }

  /**
   * Get estimated compression ratio
   * @param {string} fileExtension - File extension
   * @param {string} compressionLevel - Compression level
   * @returns {number} Estimated compression ratio percentage
   */
  static getEstimatedCompressionRatio(fileExtension, compressionLevel) {
    const estimates = {
      // Images
      'jpg': { low: 15, medium: 25, high: 40 },
      'jpeg': { low: 15, medium: 25, high: 40 },
      'png': { low: 10, medium: 20, high: 35 },
      'webp': { low: 20, medium: 35, high: 50 },
      'gif': { low: 5, medium: 10, high: 15 },
      
      // Audio
      'mp3': { low: 5, medium: 10, high: 20 },
      'wav': { low: 30, medium: 50, high: 70 },
      'aac': { low: 8, medium: 15, high: 25 },
      
      // Video
      'mp4': { low: 20, medium: 35, high: 50 },
      'mov': { low: 20, medium: 35, high: 50 },
      'avi': { low: 25, medium: 40, high: 55 },
      'mkv': { low: 20, medium: 35, high: 50 },
      
      // Documents
      'pdf': { low: 10, medium: 20, high: 30 },
      'docx': { low: 15, medium: 25, high: 35 },
      'txt': { low: 5, medium: 10, high: 15 },
      
      // Archives
      'zip': { low: 5, medium: 10, high: 15 },
      'rar': { low: 5, medium: 10, high: 15 },
      '7z': { low: 5, medium: 10, high: 15 },
    };

    return estimates[fileExtension.toLowerCase()]?.[compressionLevel] || 0;
  }

  /**
   * Get estimated compression time
   * @param {Object} file - File object
   * @param {string} compressionLevel - Compression level
   * @returns {number} Estimated time in seconds
   */
  static getEstimatedCompressionTime(file, compressionLevel) {
    const fileSizeMB = file.size / (1024 * 1024);
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // Base time estimates by file type and size
    const timeEstimates = {
      image: fileSizeMB * 0.3, // 0.3 seconds per MB
      audio: fileSizeMB * 1.5, // 1.5 seconds per MB
      video: fileSizeMB * 3,   // 3 seconds per MB
      document: fileSizeMB * 0.05, // 0.05 seconds per MB
      archive: fileSizeMB * 0.8, // 0.8 seconds per MB
    };

    const fileCategory = this.getFileCategory(fileExtension);
    const baseTime = timeEstimates[fileCategory] || 0.5;
    
    // Add complexity factor for compression level
    const complexityFactors = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    };
    
    const complexityFactor = complexityFactors[compressionLevel] || 1.0;
    
    return Math.max(3, Math.round(baseTime * complexityFactor));
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
      'pdf': 'document', 'docx': 'document', 'txt': 'document',
      'zip': 'archive', 'rar': 'archive', '7z': 'archive',
    };
    return categories[extension] || 'text';
  }

  /**
   * Get compression quality description
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Quality description
   */
  static getCompressionQuality(compressionLevel) {
    const qualities = {
      low: {
        name: 'High Quality',
        description: 'Minimal compression, best quality',
        color: '#4CAF50',
      },
      medium: {
        name: 'Balanced',
        description: 'Good balance of size and quality',
        color: '#FF9800',
      },
      high: {
        name: 'Small Size',
        description: 'Maximum compression, smaller size',
        color: '#F44336',
      },
    };

    return qualities[compressionLevel] || qualities.medium;
  }

  /**
   * Validate file for compression
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

    // Check if compression is supported
    if (!this.isCompressionSupported(extension)) {
      errors.push(`Compression not supported for .${extension} files`);
    }

    // Add warnings for large files
    if (file.size > 50 * 1024 * 1024) { // 50MB
      warnings.push('Large file may take longer to compress');
    }

    // Add warnings for already compressed files
    const alreadyCompressed = ['jpg', 'jpeg', 'mp3', 'mp4', 'zip', 'rar', '7z'];
    if (alreadyCompressed.includes(extension)) {
      warnings.push('File is already compressed, further compression may reduce quality');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Get compression recommendations
   * @param {Object} file - File object
   * @returns {Object} Compression recommendations
   */
  static getCompressionRecommendations(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    const fileSizeMB = file.size / (1024 * 1024);

    const recommendations = {
      recommendedLevel: 'medium',
      reason: '',
      alternatives: [],
    };

    // Size-based recommendations
    if (fileSizeMB < 1) {
      recommendations.recommendedLevel = 'low';
      recommendations.reason = 'Small file, use low compression to maintain quality';
    } else if (fileSizeMB > 20) {
      recommendations.recommendedLevel = 'high';
      recommendations.reason = 'Large file, use high compression to reduce size significantly';
    } else {
      recommendations.recommendedLevel = 'medium';
      recommendations.reason = 'Medium file, balanced compression recommended';
    }

    // Format-specific recommendations
    if (['png', 'gif'].includes(extension)) {
      recommendations.alternatives.push('Consider converting to JPEG for better compression');
    }

    if (['wav'].includes(extension)) {
      recommendations.alternatives.push('Consider converting to MP3 for significant size reduction');
    }

    if (['avi'].includes(extension)) {
      recommendations.alternatives.push('Consider converting to MP4 for better compression');
    }

    return recommendations;
  }
}

export default CompressionService;


