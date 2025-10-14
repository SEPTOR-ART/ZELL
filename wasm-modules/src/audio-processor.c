#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Audio processing functions for WebAssembly
// Optimized for offline processing in ZELL

typedef struct {
    int sample_rate;
    int channels;
    int bits_per_sample;
    int data_size;
    unsigned char* data;
} AudioData;

/**
 * Process audio data for conversion/compression
 * @param input_data - Input audio data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @param format - Target format (0=MP3, 1=WAV, 2=AAC)
 * @return -1 on error, output size on success
 */
EMSCRIPTEN_KEEPALIVE
int process_audio(unsigned char* input_data, int input_size,
                  unsigned char* output_data, int output_size,
                  int quality, int format) {
    if (!input_data || !output_data || input_size <= 0 || output_size <= 0) {
        return -1;
    }
    
    // Calculate compression based on quality
    float compression_ratio = (float)quality / 100.0f;
    int target_size = (int)(input_size * compression_ratio);
    
    if (target_size > output_size) {
        target_size = output_size;
    }
    
    // Simple audio processing based on format
    if (format == 0) { // MP3
        // Simulate MP3 compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i];
        }
    } else if (format == 1) { // WAV
        // WAV is uncompressed, just copy
        int copy_size = (target_size < input_size) ? target_size : input_size;
        memcpy(output_data, input_data, copy_size);
        return copy_size;
    } else if (format == 2) { // AAC
        // Simulate AAC compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i] * quality / 100;
        }
    }
    
    return target_size;
}

/**
 * Compress audio with specified quality
 * @param input_data - Input audio data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @return -1 on error, compressed size on success
 */
EMSCRIPTEN_KEEPALIVE
int compress_audio(unsigned char* input_data, int input_size,
                   unsigned char* output_data, int output_size,
                   int quality) {
    if (!input_data || !output_data || input_size <= 0 || output_size <= 0) {
        return -1;
    }
    
    // Calculate target size based on quality
    float compression_ratio = (float)quality / 100.0f;
    int target_size = (int)(input_size * compression_ratio);
    
    if (target_size > output_size) {
        target_size = output_size;
    }
    
    // Simple audio compression algorithm
    int step = input_size / target_size;
    if (step < 1) step = 1;
    
    for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
        // Average samples for compression
        int sum = 0;
        int count = 0;
        for (int k = 0; k < step && (i + k) < input_size; k++) {
            sum += input_data[i + k];
            count++;
        }
        output_data[j] = (unsigned char)(sum / count);
    }
    
    return target_size;
}

/**
 * Merge multiple audio files into one
 * @param audio_files - Array of audio data pointers
 * @param file_sizes - Array of file sizes
 * @param num_files - Number of files to merge
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @return -1 on error, merged size on success
 */
EMSCRIPTEN_KEEPALIVE
int merge_audio(unsigned char** audio_files, int* file_sizes, int num_files,
                unsigned char* output_data, int output_size) {
    if (!audio_files || !file_sizes || !output_data || num_files <= 0 || output_size <= 0) {
        return -1;
    }
    
    int total_size = 0;
    int offset = 0;
    
    // Calculate total size
    for (int i = 0; i < num_files; i++) {
        total_size += file_sizes[i];
    }
    
    if (total_size > output_size) {
        return -1; // Output buffer too small
    }
    
    // Concatenate audio files
    for (int i = 0; i < num_files; i++) {
        if (audio_files[i] && file_sizes[i] > 0) {
            memcpy(output_data + offset, audio_files[i], file_sizes[i]);
            offset += file_sizes[i];
        }
    }
    
    return total_size;
}

/**
 * Trim audio to specified duration
 * @param input_data - Input audio data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param start_time - Start time in seconds
 * @param duration - Duration in seconds
 * @param sample_rate - Sample rate
 * @param channels - Number of channels
 * @param bits_per_sample - Bits per sample
 * @return -1 on error, trimmed size on success
 */
EMSCRIPTEN_KEEPALIVE
int trim_audio(unsigned char* input_data, int input_size,
               unsigned char* output_data, float start_time, float duration,
               int sample_rate, int channels, int bits_per_sample) {
    if (!input_data || !output_data || input_size <= 0) {
        return -1;
    }
    
    int bytes_per_sample = bits_per_sample / 8;
    int bytes_per_frame = bytes_per_sample * channels;
    
    int start_byte = (int)(start_time * sample_rate * bytes_per_frame);
    int duration_bytes = (int)(duration * sample_rate * bytes_per_frame);
    
    if (start_byte >= input_size) {
        return 0; // Start time beyond audio length
    }
    
    int end_byte = start_byte + duration_bytes;
    if (end_byte > input_size) {
        end_byte = input_size;
    }
    
    int trimmed_size = end_byte - start_byte;
    memcpy(output_data, input_data + start_byte, trimmed_size);
    
    return trimmed_size;
}


