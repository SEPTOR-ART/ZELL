const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

/**
 * Image converter module for ZELL
 * Handles conversion between different image formats and compression
 */
class ImageConverter {
  
  /**
   * Convert image to target format
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path for output image
   * @param {string} targetFormat - Target format (jpg, png, webp, gif)
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Conversion result with file info
   */
  async convert(inputPath, outputPath, targetFormat, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      let sharpInstance = sharp(inputPath);

      // Apply format-specific settings based on compression level
      const quality = this.getQualityFromLevel(compressionLevel);
      
      switch (targetFormat.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            compressionLevel: this.getPngCompressionLevel(compressionLevel),
            progressive: true
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality,
            effort: 6
          });
          break;
        case 'gif':
          // Note: Sharp doesn't support GIF output, would need additional library
          throw new Error('GIF conversion not supported in this version');
        default:
          throw new Error(`Unsupported target format: ${targetFormat}`);
      }

      await sharpInstance.toFile(outputPath);

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
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  /**
   * Compress image without changing format
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path for output image
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Compression result with file info
   */
  async compress(inputPath, outputPath, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      const image = sharp(inputPath);
      const metadata = await image.metadata();
      const format = metadata.format;

      let sharpInstance = image;

      // Apply compression based on original format
      const quality = this.getQualityFromLevel(compressionLevel);
      
      switch (format) {
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true
          });
          break;
        case 'png':
          sharpInstance = sharpInstance.png({ 
            compressionLevel: this.getPngCompressionLevel(compressionLevel),
            progressive: true
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ 
            quality,
            effort: 6
          });
          break;
        default:
          // For other formats, convert to JPEG with compression
          sharpInstance = sharpInstance.jpeg({ 
            quality,
            progressive: true,
            mozjpeg: true
          });
      }

      await sharpInstance.toFile(outputPath);

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
      throw new Error(`Image compression failed: ${error.message}`);
    }
  }

  /**
   * Get quality value from compression level
   * @param {string} level - Compression level
   * @returns {number} Quality value (0-100)
   */
  getQualityFromLevel(level) {
    switch (level.toLowerCase()) {
      case 'low':
        return 90;
      case 'medium':
        return 75;
      case 'high':
        return 50;
      default:
        return 75;
    }
  }

  /**
   * Get PNG compression level from compression level
   * @param {string} level - Compression level
   * @returns {number} PNG compression level (0-9)
   */
  getPngCompressionLevel(level) {
    switch (level.toLowerCase()) {
      case 'low':
        return 3;
      case 'medium':
        return 6;
      case 'high':
        return 9;
      default:
        return 6;
    }
  }

  /**
   * Get image metadata
   * @param {string} inputPath - Path to image file
   * @returns {Object} Image metadata
   */
  async getMetadata(inputPath) {
    try {
      const metadata = await sharp(inputPath).metadata();
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: metadata.size,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels
      };
    } catch (error) {
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }

  /**
   * Resize image while maintaining aspect ratio
   * @param {string} inputPath - Path to input image
   * @param {string} outputPath - Path for output image
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @param {string} fit - Fit mode (cover, contain, fill, inside, outside)
   * @returns {Object} Resize result
   */
  async resize(inputPath, outputPath, width, height, fit = 'inside') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      await sharp(inputPath)
        .resize(width, height, { fit })
        .toFile(outputPath);

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
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }
}

module.exports = new ImageConverter();


