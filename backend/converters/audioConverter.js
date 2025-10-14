const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const fs = require('fs-extra');
const path = require('path');

// Set ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

/**
 * Audio converter module for ZELL
 * Handles conversion between different audio formats and compression
 */
class AudioConverter {
  
  /**
   * Convert audio to target format
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for output audio file
   * @param {string} targetFormat - Target format (mp3, wav, aac)
   * @param {string} compressionLevel - Compression level (low, medium, high)
   * @returns {Object} Conversion result with file info
   */
  async convert(inputPath, outputPath, targetFormat, compressionLevel = 'medium') {
    return new Promise((resolve, reject) => {
      try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        let command = ffmpeg(inputPath);

        // Apply format-specific settings based on compression level
        const audioSettings = this.getAudioSettings(targetFormat, compressionLevel);
        
        command = command.audioCodec(audioSettings.codec)
                        .audioBitrate(audioSettings.bitrate)
                        .audioChannels(audioSettings.channels)
                        .audioFrequency(audioSettings.sampleRate);

        // Add format-specific options
        if (audioSettings.options) {
          Object.entries(audioSettings.options).forEach(([key, value]) => {
            command = command.addOption(`-${key}`, value);
          });
        }

        command
          .format(targetFormat)
          .output(outputPath)
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
            reject(new Error(`Audio conversion failed: ${error.message}`));
          })
          .run();

      } catch (error) {
        reject(new Error(`Audio conversion setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Compress audio without changing format
   * @param {string} inputPath - Path to input audio file
   * @param {string} outputPath - Path for output audio file
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
        
        let command = ffmpeg(inputPath);

        // Apply compression settings based on original format
        const audioSettings = this.getAudioSettings(originalFormat, compressionLevel);
        
        command = command.audioCodec(audioSettings.codec)
                        .audioBitrate(audioSettings.bitrate)
                        .audioChannels(audioSettings.channels)
                        .audioFrequency(audioSettings.sampleRate);

        // Add format-specific options
        if (audioSettings.options) {
          Object.entries(audioSettings.options).forEach(([key, value]) => {
            command = command.addOption(`-${key}`, value);
          });
        }

        command
          .format(originalFormat)
          .output(outputPath)
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
            reject(new Error(`Audio compression failed: ${error.message}`));
          })
          .run();

      } catch (error) {
        reject(new Error(`Audio compression setup failed: ${error.message}`));
      }
    });
  }

  /**
   * Get audio settings based on format and compression level
   * @param {string} format - Audio format
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Audio settings
   */
  getAudioSettings(format, compressionLevel) {
    const settings = {
      mp3: {
        low: { codec: 'libmp3lame', bitrate: '320k', channels: 2, sampleRate: 44100, options: { q: '0' } },
        medium: { codec: 'libmp3lame', bitrate: '192k', channels: 2, sampleRate: 44100, options: { q: '2' } },
        high: { codec: 'libmp3lame', bitrate: '128k', channels: 2, sampleRate: 44100, options: { q: '4' } }
      },
      wav: {
        low: { codec: 'pcm_s16le', bitrate: '1411k', channels: 2, sampleRate: 44100 },
        medium: { codec: 'pcm_s16le', bitrate: '705k', channels: 2, sampleRate: 22050 },
        high: { codec: 'pcm_s16le', bitrate: '352k', channels: 1, sampleRate: 22050 }
      },
      aac: {
        low: { codec: 'aac', bitrate: '256k', channels: 2, sampleRate: 44100, options: { profile: 'aac_low' } },
        medium: { codec: 'aac', bitrate: '128k', channels: 2, sampleRate: 44100, options: { profile: 'aac_low' } },
        high: { codec: 'aac', bitrate: '96k', channels: 2, sampleRate: 44100, options: { profile: 'aac_low' } }
      }
    };

    return settings[format]?.[compressionLevel] || settings.mp3.medium;
  }

  /**
   * Get audio metadata
   * @param {string} inputPath - Path to audio file
   * @returns {Object} Audio metadata
   */
  async getMetadata(inputPath) {
    return new Promise((resolve, reject) => {
      ffmpeg.ffprobe(inputPath, (error, metadata) => {
        if (error) {
          reject(new Error(`Failed to get audio metadata: ${error.message}`));
        } else {
          const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
          if (audioStream) {
            resolve({
              duration: metadata.format.duration,
              bitrate: metadata.format.bit_rate,
              sampleRate: audioStream.sample_rate,
              channels: audioStream.channels,
              codec: audioStream.codec_name,
              format: metadata.format.format_name
            });
          } else {
            reject(new Error('No audio stream found'));
          }
        }
      });
    });
  }

  /**
   * Extract audio from video file
   * @param {string} inputPath - Path to video file
   * @param {string} outputPath - Path for output audio file
   * @param {string} targetFormat - Target audio format
   * @param {string} compressionLevel - Compression level
   * @returns {Object} Extraction result
   */
  async extractAudio(inputPath, outputPath, targetFormat = 'mp3', compressionLevel = 'medium') {
    return new Promise((resolve, reject) => {
      try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        const audioSettings = this.getAudioSettings(targetFormat, compressionLevel);
        
        ffmpeg(inputPath)
          .noVideo()
          .audioCodec(audioSettings.codec)
          .audioBitrate(audioSettings.bitrate)
          .audioChannels(audioSettings.channels)
          .audioFrequency(audioSettings.sampleRate)
          .format(targetFormat)
          .output(outputPath)
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
            reject(new Error(`Audio extraction failed: ${error.message}`));
          })
          .run();

      } catch (error) {
        reject(new Error(`Audio extraction setup failed: ${error.message}`));
      }
    });
  }
}

module.exports = new AudioConverter();


