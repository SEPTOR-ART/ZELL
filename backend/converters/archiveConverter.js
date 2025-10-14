const archiver = require('archiver');
const unzipper = require('unzipper');
const fs = require('fs-extra');
const path = require('path');

/**
 * Archive converter module for ZELL
 * Handles conversion between different archive formats and compression
 */
class ArchiveConverter {
  
  /**
   * Convert archive to target format
   * @param {string} inputPath - Path to input archive
   * @param {string} outputPath - Path for output archive
   * @param {string} targetFormat - Target format (zip, rar, 7z)
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Conversion result with file info
   */
  async convert(inputPath, outputPath, targetFormat, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      // Extract the input archive first
      const tempDir = path.join(path.dirname(outputPath), `temp_${Date.now()}`);
      await fs.ensureDir(tempDir);
      
      await this.extractArchive(inputPath, tempDir);
      
      // Create new archive in target format
      const result = await this.createArchive(tempDir, outputPath, targetFormat, compressionLevel);
      
      // Clean up temp directory
      await fs.remove(tempDir);

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
      throw new Error(`Archive conversion failed: ${error.message}`);
    }
  }

  /**
   * Compress archive without changing format
   * @param {string} inputPath - Path to input archive
   * @param {string} outputPath - Path for output archive
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Compression result with file info
   */
  async compress(inputPath, outputPath, compressionLevel = 'medium') {
    try {
      const originalStats = await fs.stat(inputPath);
      const originalSize = originalStats.size;

      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      // Extract the input archive
      const tempDir = path.join(path.dirname(outputPath), `temp_${Date.now()}`);
      await fs.ensureDir(tempDir);
      
      await this.extractArchive(inputPath, tempDir);
      
      // Create new archive with higher compression
      const result = await this.createArchive(tempDir, outputPath, inputExtension, compressionLevel);
      
      // Clean up temp directory
      await fs.remove(tempDir);

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
      throw new Error(`Archive compression failed: ${error.message}`);
    }
  }

  /**
   * Extract archive to directory
   * @param {string} inputPath - Path to archive file
   * @param {string} outputDir - Directory to extract to
   * @returns {Promise} Extraction promise
   */
  async extractArchive(inputPath, outputDir) {
    return new Promise((resolve, reject) => {
      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      if (inputExtension === 'zip') {
        fs.createReadStream(inputPath)
          .pipe(unzipper.Extract({ path: outputDir }))
          .on('close', () => resolve())
          .on('error', (error) => reject(new Error(`ZIP extraction failed: ${error.message}`)));
      } else {
        // For RAR and 7Z, we would need additional libraries
        reject(new Error(`Extraction of ${inputExtension} files not supported in this version`));
      }
    });
  }

  /**
   * Create archive from directory
   * @param {string} inputDir - Directory to archive
   * @param {string} outputPath - Path for output archive
   * @param {string} format - Archive format (zip, rar, 7z)
   * @param {string} compressionLevel - Compression level
   * @returns {Promise} Archive creation promise
   */
  async createArchive(inputDir, outputPath, format, compressionLevel) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      let archive;

      // Create archive based on format
      switch (format.toLowerCase()) {
        case 'zip':
          archive = archiver('zip', {
            zlib: { level: this.getCompressionLevel(compressionLevel) }
          });
          break;
        case 'tar':
          archive = archiver('tar', {
            gzip: true,
            gzipOptions: { level: this.getCompressionLevel(compressionLevel) }
          });
          break;
        default:
          reject(new Error(`Archive format ${format} not supported`));
          return;
      }

      output.on('close', () => {
        resolve({ outputPath });
      });

      archive.on('error', (error) => {
        reject(new Error(`Archive creation failed: ${error.message}`));
      });

      archive.pipe(output);
      archive.directory(inputDir, false);
      archive.finalize();
    });
  }

  /**
   * Get compression level value
   * @param {string} level - Compression level
   * @returns {number} Compression level value
   */
  getCompressionLevel(level) {
    switch (level.toLowerCase()) {
      case 'low':
        return 1;
      case 'medium':
        return 6;
      case 'high':
        return 9;
      default:
        return 6;
    }
  }

  /**
   * Create archive from multiple files
   * @param {Array} filePaths - Array of file paths to archive
   * @param {string} outputPath - Path for output archive
   * @param {string} format - Archive format
   * @param {string} compressionLevel - Compression level
   * @returns {Promise} Archive creation promise
   */
  async createArchiveFromFiles(filePaths, outputPath, format, compressionLevel) {
    return new Promise((resolve, reject) => {
      const output = fs.createWriteStream(outputPath);
      let archive;

      // Create archive based on format
      switch (format.toLowerCase()) {
        case 'zip':
          archive = archiver('zip', {
            zlib: { level: this.getCompressionLevel(compressionLevel) }
          });
          break;
        case 'tar':
          archive = archiver('tar', {
            gzip: true,
            gzipOptions: { level: this.getCompressionLevel(compressionLevel) }
          });
          break;
        default:
          reject(new Error(`Archive format ${format} not supported`));
          return;
      }

      output.on('close', () => {
        resolve({ outputPath });
      });

      archive.on('error', (error) => {
        reject(new Error(`Archive creation failed: ${error.message}`));
      });

      archive.pipe(output);

      // Add files to archive
      filePaths.forEach(filePath => {
        if (fs.existsSync(filePath)) {
          const fileName = path.basename(filePath);
          archive.file(filePath, { name: fileName });
        }
      });

      archive.finalize();
    });
  }

  /**
   * List archive contents
   * @param {string} inputPath - Path to archive file
   * @returns {Promise<Array>} Array of file entries
   */
  async listArchiveContents(inputPath) {
    return new Promise((resolve, reject) => {
      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      if (inputExtension === 'zip') {
        const entries = [];
        
        fs.createReadStream(inputPath)
          .pipe(unzipper.Parse())
          .on('entry', (entry) => {
            entries.push({
              fileName: entry.path,
              size: entry.vars.uncompressedSize,
              compressedSize: entry.vars.compressedSize,
              isDirectory: entry.type === 'Directory'
            });
            entry.autodrain();
          })
          .on('end', () => resolve(entries))
          .on('error', (error) => reject(new Error(`Failed to list archive contents: ${error.message}`)));
      } else {
        reject(new Error(`Listing contents of ${inputExtension} files not supported in this version`));
      }
    });
  }

  /**
   * Extract specific files from archive
   * @param {string} inputPath - Path to archive file
   * @param {string} outputDir - Directory to extract to
   * @param {Array} fileNames - Array of file names to extract
   * @returns {Promise} Extraction promise
   */
  async extractSpecificFiles(inputPath, outputDir, fileNames) {
    return new Promise((resolve, reject) => {
      const inputExtension = path.extname(inputPath).toLowerCase().slice(1);
      
      if (inputExtension === 'zip') {
        let extractedCount = 0;
        const totalFiles = fileNames.length;
        
        fs.createReadStream(inputPath)
          .pipe(unzipper.Parse())
          .on('entry', (entry) => {
            if (fileNames.includes(entry.path)) {
              const outputPath = path.join(outputDir, entry.path);
              entry.pipe(fs.createWriteStream(outputPath));
              extractedCount++;
              
              if (extractedCount === totalFiles) {
                resolve();
              }
            } else {
              entry.autodrain();
            }
          })
          .on('end', () => {
            if (extractedCount < totalFiles) {
              reject(new Error('Some files were not found in the archive'));
            } else {
              resolve();
            }
          })
          .on('error', (error) => reject(new Error(`Selective extraction failed: ${error.message}`)));
      } else {
        reject(new Error(`Selective extraction of ${inputExtension} files not supported in this version`));
      }
    });
  }

  /**
   * Get archive metadata
   * @param {string} inputPath - Path to archive file
   * @returns {Object} Archive metadata
   */
  async getMetadata(inputPath) {
    try {
      const stats = await fs.stat(inputPath);
      const extension = path.extname(inputPath).toLowerCase().slice(1);
      
      const contents = await this.listArchiveContents(inputPath);
      const totalSize = contents.reduce((sum, entry) => sum + (entry.size || 0), 0);
      const fileCount = contents.filter(entry => !entry.isDirectory).length;
      
      return {
        size: stats.size,
        format: extension,
        fileCount,
        totalUncompressedSize: totalSize,
        compressionRatio: ((stats.size - totalSize) / totalSize * 100).toFixed(2),
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      throw new Error(`Failed to get archive metadata: ${error.message}`);
    }
  }
}

module.exports = new ArchiveConverter();


