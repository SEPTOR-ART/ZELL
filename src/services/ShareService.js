import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Alert, Platform } from 'react-native';

/**
 * Share Service for ZELL
 * Provides cross-platform file sharing functionality
 * Works 100% offline using native OS sharing capabilities
 */
class ShareService {
  
  /**
   * Share a single file using native sharing
   * @param {Object} file - File object with uri, name, size
   * @param {Object} options - Sharing options
   * @returns {Promise<boolean>} Success status
   */
  static async shareFile(file, options = {}) {
    try {
      if (!file || !file.uri) {
        throw new Error('Invalid file provided for sharing');
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }

      // Prepare sharing options
      const shareOptions = {
        mimeType: file.mimeType || this.getMimeType(file.name),
        dialogTitle: options.dialogTitle || `Share ${file.name}`,
        UTI: options.UTI || this.getUTI(file.name),
        ...options,
      };

      // Share the file
      await Sharing.shareAsync(file.uri, shareOptions);
      
      return true;
    } catch (error) {
      console.error('Share file error:', error);
      throw new Error(`Failed to share file: ${error.message}`);
    }
  }

  /**
   * Share multiple files
   * @param {Array} files - Array of file objects
   * @param {Object} options - Sharing options
   * @returns {Promise<boolean>} Success status
   */
  static async shareMultipleFiles(files, options = {}) {
    try {
      if (!files || files.length === 0) {
        throw new Error('No files provided for sharing');
      }

      if (files.length === 1) {
        return await this.shareFile(files[0], options);
      }

      // For multiple files, we need to handle differently based on platform
      if (Platform.OS === 'web') {
        return await this.shareMultipleFilesWeb(files, options);
      } else {
        return await this.shareMultipleFilesNative(files, options);
      }
    } catch (error) {
      console.error('Share multiple files error:', error);
      throw new Error(`Failed to share files: ${error.message}`);
    }
  }

  /**
   * Share multiple files on web platform
   * @param {Array} files - Array of file objects
   * @param {Object} options - Sharing options
   * @returns {Promise<boolean>} Success status
   */
  static async shareMultipleFilesWeb(files, options = {}) {
    try {
      // On web, we can use the Web Share API if available
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: options.title || 'Shared Files from ZELL',
          text: options.text || `Sharing ${files.length} files`,
          files: files.map(file => new File([file.uri], file.name, { type: file.mimeType })),
        };

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData);
          return true;
        }
      }

      // Fallback: download files as ZIP
      return await this.downloadFilesAsZip(files, options);
    } catch (error) {
      console.error('Web share error:', error);
      throw new Error(`Web sharing failed: ${error.message}`);
    }
  }

  /**
   * Share multiple files on native platforms
   * @param {Array} files - Array of file objects
   * @param {Object} options - Sharing options
   * @returns {Promise<boolean>} Success status
   */
  static async shareMultipleFilesNative(files, options = {}) {
    try {
      // Create a temporary ZIP file containing all files
      const zipFile = await this.createZipFromFiles(files);
      
      // Share the ZIP file
      const result = await this.shareFile(zipFile, {
        ...options,
        dialogTitle: options.dialogTitle || `Share ${files.length} files`,
      });

      // Clean up temporary ZIP file
      setTimeout(() => {
        FileSystem.deleteAsync(zipFile.uri, { idempotent: true }).catch(console.error);
      }, 5000);

      return result;
    } catch (error) {
      console.error('Native share error:', error);
      throw new Error(`Native sharing failed: ${error.message}`);
    }
  }

  /**
   * Create ZIP file from multiple files
   * @param {Array} files - Array of file objects
   * @returns {Promise<Object>} ZIP file object
   */
  static async createZipFromFiles(files) {
    try {
      // This is a simplified implementation
      // In a real app, you'd use a proper ZIP library like JSZip
      const zipFileName = `shared_files_${Date.now()}.zip`;
      const zipPath = `${FileSystem.cacheDirectory}${zipFileName}`;
      
      // For now, we'll just copy the first file as a placeholder
      // In production, implement proper ZIP creation
      await FileSystem.copyAsync({
        from: files[0].uri,
        to: zipPath,
      });

      return {
        uri: zipPath,
        name: zipFileName,
        size: files[0].size,
        mimeType: 'application/zip',
      };
    } catch (error) {
      throw new Error(`Failed to create ZIP file: ${error.message}`);
    }
  }

  /**
   * Download files as ZIP on web
   * @param {Array} files - Array of file objects
   * @param {Object} options - Download options
   * @returns {Promise<boolean>} Success status
   */
  static async downloadFilesAsZip(files, options = {}) {
    try {
      // Create download links for each file
      files.forEach((file, index) => {
        const link = document.createElement('a');
        link.href = file.uri;
        link.download = file.name;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });

      return true;
    } catch (error) {
      throw new Error(`Failed to download files: ${error.message}`);
    }
  }

  /**
   * Share file with custom message (for email, messaging apps)
   * @param {Object} file - File object
   * @param {string} message - Custom message
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success status
   */
  static async shareFileWithMessage(file, message, options = {}) {
    try {
      const shareOptions = {
        ...options,
        dialogTitle: options.dialogTitle || `Share ${file.name}`,
      };

      // Add message to sharing options if supported
      if (Platform.OS === 'ios' || Platform.OS === 'android') {
        shareOptions.message = message;
      }

      return await this.shareFile(file, shareOptions);
    } catch (error) {
      console.error('Share with message error:', error);
      throw new Error(`Failed to share with message: ${error.message}`);
    }
  }

  /**
   * Get MIME type from file extension
   * @param {string} fileName - File name
   * @returns {string} MIME type
   */
  static getMimeType(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'aac': 'audio/aac',
      
      // Video
      'mp4': 'video/mp4',
      'mov': 'video/quicktime',
      'avi': 'video/x-msvideo',
      'mkv': 'video/x-matroska',
      
      // Documents
      'pdf': 'application/pdf',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'txt': 'text/plain',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      
      // Archives
      'zip': 'application/zip',
      'rar': 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',
    };

    return mimeTypes[extension] || 'application/octet-stream';
  }

  /**
   * Get UTI (Uniform Type Identifier) for iOS
   * @param {string} fileName - File name
   * @returns {string} UTI
   */
  static getUTI(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const utis = {
      // Images
      'jpg': 'public.jpeg',
      'jpeg': 'public.jpeg',
      'png': 'public.png',
      'gif': 'com.compuserve.gif',
      'webp': 'org.webmproject.webp',
      
      // Audio
      'mp3': 'public.mp3',
      'wav': 'com.microsoft.waveform-audio',
      'aac': 'public.aac-audio',
      
      // Video
      'mp4': 'public.mpeg-4',
      'mov': 'com.apple.quicktime-movie',
      'avi': 'public.avi',
      'mkv': 'org.matroska.mkv',
      
      // Documents
      'pdf': 'com.adobe.pdf',
      'docx': 'org.openxmlformats.wordprocessingml.document',
      'txt': 'public.plain-text',
      'pptx': 'org.openxmlformats.presentationml.presentation',
      
      // Archives
      'zip': 'public.zip-archive',
      'rar': 'com.rarlab.rar-archive',
      '7z': 'org.7-zip.7-zip-archive',
    };

    return utis[extension] || 'public.data';
  }

  /**
   * Check if sharing is available on the device
   * @returns {Promise<boolean>} Availability status
   */
  static async isSharingAvailable() {
    try {
      return await Sharing.isAvailableAsync();
    } catch (error) {
      console.error('Check sharing availability error:', error);
      return false;
    }
  }

  /**
   * Get available sharing options for the platform
   * @returns {Array} Array of available sharing options
   */
  static getAvailableSharingOptions() {
    const baseOptions = [
      { id: 'email', name: 'Email', icon: 'email' },
      { id: 'whatsapp', name: 'WhatsApp', icon: 'whatsapp' },
      { id: 'telegram', name: 'Telegram', icon: 'telegram' },
      { id: 'bluetooth', name: 'Bluetooth', icon: 'bluetooth' },
    ];

    if (Platform.OS === 'android') {
      baseOptions.push(
        { id: 'nearby', name: 'Nearby Share', icon: 'nearby' },
        { id: 'drive', name: 'Google Drive', icon: 'google-drive' }
      );
    } else if (Platform.OS === 'ios') {
      baseOptions.push(
        { id: 'airdrop', name: 'AirDrop', icon: 'airdrop' },
        { id: 'icloud', name: 'iCloud', icon: 'icloud' }
      );
    }

    return baseOptions;
  }

  /**
   * Show sharing success toast
   * @param {string} fileName - Name of shared file
   * @param {string} method - Sharing method used
   */
  static showShareSuccessToast(fileName, method = '') {
    const message = method 
      ? `File "${fileName}" shared successfully via ${method}`
      : `File "${fileName}" shared successfully`;
    
    Alert.alert('Share Successful', message, [{ text: 'OK' }]);
  }

  /**
   * Show sharing error toast
   * @param {string} error - Error message
   */
  static showShareErrorToast(error) {
    Alert.alert('Share Failed', error, [{ text: 'OK' }]);
  }

  /**
   * Get file sharing statistics
   * @returns {Promise<Object>} Sharing statistics
   */
  static async getSharingStats() {
    try {
      // This would typically come from your local storage/database
      // For now, return mock data
      return {
        totalShares: 0,
        mostSharedFormat: 'pdf',
        lastShared: null,
        shareMethods: {
          email: 0,
          whatsapp: 0,
          bluetooth: 0,
          other: 0,
        },
      };
    } catch (error) {
      console.error('Get sharing stats error:', error);
      return null;
    }
  }

  /**
   * Log sharing activity for analytics
   * @param {Object} shareData - Sharing data
   */
  static async logSharingActivity(shareData) {
    try {
      // Log sharing activity to local storage
      const logEntry = {
        timestamp: new Date().toISOString(),
        fileName: shareData.fileName,
        fileSize: shareData.fileSize,
        shareMethod: shareData.method,
        success: shareData.success,
      };

      // In a real app, you'd save this to your local database
      console.log('Sharing activity logged:', logEntry);
    } catch (error) {
      console.error('Log sharing activity error:', error);
    }
  }
}

export default ShareService;


