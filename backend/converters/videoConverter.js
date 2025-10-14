const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs-extra');
const path = require('path');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Video converter module for ZELL
 * Handles conversion between different video formats and compression
 */
class VideoConverter {
  
  /**
   * Convert video to target format
   * @param {string} inputPath - Path to input video file
   * @param {string} outputPath - Path for output video file
   * @param {string} targetFormat - Target format (mp4, mov, avi, mkv)
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Conversion result with file info
   */
  async convert(inputPath, outputPath, targetFormat, compressionLevel = 'medium') {
    return new Promise((resolve, reject) => {
      try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        const videoSettings = this.getVideoSettings(targetFormat, compressionLevel);
        
        let command = ffmpeg(inputPath);

        // Video settings
        command = command.videoCodec(videoSettings.videoCodec)
                        .videoBitrate(videoSettings.videoBitrate)
                        .size(videoSettings.resolution)
                        .fps(videoSettings.fps);

        // Audio settings
        command = command.audioCodec(videoSettings.audioCodec)
                        .audioBitrate(videoSettings.audioBitrate)
                        .audioChannels(videoSettings.audioChannels);

        // Add format-specific options
        if (videoSettings.options) {
          Object.entries(videoSettings.options).forEach(([key, value]) => {
            command = command.addOption(`-${key}`, value);
          });
        }

        command
          .format(targetFormat)
          .output(outputPath)
          .on('progress', (progress) => {
            console.log(`Processing: ${progress.percent}% done`);
          })
          .on('end', async () => {
            try {
              const outputStats = fs.statSync(outputPath);
              const compressedSize = outputStats.size;
              const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

              resolve({
                outputPath,
                originalSize,
                compressedSize,
                compressionRatio: parseFloat(compressionRatio)
              });
            } catch (error) {
              reject(new Error(`Failed to get output file stats: ${error.message}`));
            }
          })
          .on('error', (error) => {
            reject(new Error(`Video conversion failed: ${error.message}`));
          })
          .run();

      } catch (error) {
        reject(new Error(`Video conversion setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Compress video without changing format
   * @param {string} inputPath - Path to input video file
   * @param {string} outputPath - Path for output video file
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Compression result with file info
   */
  async compress(inputPath, outputPath, compressionLevel = 'medium') {
    return new Promise((resolve, reject) => {
      try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        // Get original format from file extension
        const originalFormat = path.extname(inputPath).toLowerCase().slice(1);
        
        const videoSettings = this.getVideoSettings(originalFormat, compressionLevel);
        
        let command = ffmpeg(inputPath);

        // Video settings
        command = command.videoCodec(videoSettings.videoCodec)
                        .videoBitrate(videoSettings.videoBitrate)
                        .size(videoSettings.resolution)
                        .fps(videoSettings.fps);

        // Audio settings
        command = command.audioCodec(videoSettings.audioCodec)
                        .audioBitrate(videoSettings.audioBitrate)
                        .audioChannels(videoSettings.audioChannels);

        // Add format-specific options
        if (videoSettings.options) {
          Object.entries(videoSettings.options).forEach(([key, value]) => {
            command = command.addOption(`-${key}`, value);
          });
        }

        command
          .format(originalFormat)
          .output(outputPath)
          .on('progress', (progress) => {
            console.log(`Compressing: ${progress.percent}% done`);
          })
          .on('end', async () => {
            try {
              const outputStats = fs.statSync(outputPath);
              const compressedSize = outputStats.size;
              const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);

              resolve({
                outputPath,
                originalSize,
                compressedSize,
                compressionRatio: parseFloat(compressionRatio)
              });
            } catch (error) {
              reject(new Error(`Failed to get output file stats: ${error.message}`));
            }
          })
          .on('error', (error) => {
            reject(new Error(`Video compression failed: ${error.message}`));
          })
          .run();

      } catch (error) {
        reject(new Error(`Video compression setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Get video settings based on format and compression level
   * @param {string} format - Video format
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Video settings
   */
  getVideoSettings(format, compressionLevel) {
    const settings = {
      mp4: {
        low: {
          videoCodec: 'libx264',
          videoBitrate: '2000k',
          resolution: '1920x1080',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '128k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '18' }
        },
        medium: {
          videoCodec: 'libx264',
          videoBitrate: '1000k',
          resolution: '1280x720',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '96k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '23' }
        },
        high: {
          videoCodec: 'libx264',
          videoBitrate: '500k',
          resolution: '854x480',
          fps: 24,
          audioCodec: 'aac',
          audioBitrate: '64k',
          audioChannels: 2,
          options: { preset: 'slow', crf: '28' }
        }
      },
      mov: {
        low: {
          videoCodec: 'libx264',
          videoBitrate: '2000k',
          resolution: '1920x1080',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '128k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '18' }
        },
        medium: {
          videoCodec: 'libx264',
          videoBitrate: '1000k',
          resolution: '1280x720',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '96k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '23' }
        },
        high: {
          videoCodec: 'libx264',
          videoBitrate: '500k',
          resolution: '854x480',
          fps: 24,
          audioCodec: 'aac',
          audioBitrate: '64k',
          audioChannels: 2,
          options: { preset: 'slow', crf: '28' }
        }
      },
      avi: {
        low: {
          videoCodec: 'libx264',
          videoBitrate: '2000k',
          resolution: '1920x1080',
          fps: 30,
          audioCodec: 'mp3',
          audioBitrate: '128k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '18' }
        },
        medium: {
          videoCodec: 'libx264',
          videoBitrate: '1000k',
          resolution: '1280x720',
          fps: 30,
          audioCodec: 'mp3',
          audioBitrate: '96k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '23' }
        },
        high: {
          videoCodec: 'libx264',
          videoBitrate: '500k',
          resolution: '854x480',
          fps: 24,
          audioCodec: 'mp3',
          audioBitrate: '64k',
          audioChannels: 2,
          options: { preset: 'slow', crf: '28' }
        }
      },
      mkv: {
        low: {
          videoCodec: 'libx264',
          videoBitrate: '2000k',
          resolution: '1920x1080',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '128k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '18' }
        },
        medium: {
          videoCodec: 'libx264',
          videoBitrate: '1000k',
          resolution: '1280x720',
          fps: 30,
          audioCodec: 'aac',
          audioBitrate: '96k',
          audioChannels: 2,
          options: { preset: 'medium', crf: '23' }
        },
        high: {
          videoCodec: 'libx264',
          videoBitrate: '500k',
          resolution: '854x480',
          fps: 24,
          audioCodec: 'aac',
          audioBitrate: '64k',
          audioChannels: 2,
          options: { preset: 'slow', crf: '28' }
        }
      }
    };

    return settings[format]?.[compressionLevel] || settings.mp4.medium;
  }

  /**
   * Get video metadata
   * @param {string} inputPath - Path to video file
   * @returns {Object} Video metadata
   */
  async getMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (error, metadata) => {
        if (error) {
          reject(new Error(`Failed to get video metadata: ${error.message}`));
        } else {
          const videoStream = metadata.streams.find(stream => stream.codec_type === 'video');
          const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
          
          resolve({
            duration: metadata.format.duration,
            bitrate: metadata.format.bit_rate,
            format: metadata.format.format_name,
            video: videoStream ? {
              codec: videoStream.codec_name,
              width: videoStream.width,
              height: videoStream.height,
              fps: eval(videoStream.r_frame_rate),
              bitrate: videoStream.bit_rate
            } : null,
            audio: audioStream ? {
              codec: audioStream.codec_name,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels,
              bitrate: audioStream.bit_rate
            } : null
          });
        }
      });
    });
  }

  /**
   * Extract thumbnail from video
   * @param {string} inputPath - Path to video file
   * @param {string} outputPath - Path for thumbnail image
   * @param {number} timeOffset - Time offset in seconds (default: 1)
   * @returns {Object} Thumbnail extraction result
   */
  async extractThumbnail(inputPath, outputPath, timeOffset = 1) {
    return new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .screenshots({
          timestamps: [timeOffset],
          filename: path.basename(outputPath),
          folder: path.dirname(outputPath),
          size: '320x240'
        })
        .on('end', () => {
          resolve({ outputPath });
        })
        .on('error', (error) => {
          reject(new Error(`Thumbnail extraction failed: ${error.message}`));
        });
    });
  }
}

module.exports = new VideoConverter();


