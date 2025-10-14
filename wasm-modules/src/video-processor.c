#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Video processing functions for WebAssembly
// Optimized for offline processing in ZELL

typedef struct {
    int width;
    int height;
    int frame_rate;
    int duration; // in frames
    unsigned char* data;
} VideoData;

/**
 * Process video data for conversion/compression
 * @param input_data - Input video data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @param format - Target format (0=MP4, 1=MOV, 2=AVI, 3=MKV)
 * @return -1 on error, output size on success
 */
EMSCRIPTEN_KEEPALIVE
int process_video(unsigned char* input_data, int input_size,
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
    
    // Simple video processing based on format
    if (format == 0) { // MP4
        // Simulate MP4 compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i];
        }
    } else if (format == 1) { // MOV
        // Similar to MP4
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i];
        }
    } else if (format == 2) { // AVI
        // AVI compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i] * quality / 100;
        }
    } else if (format == 3) { // MKV
        // MKV compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i];
        }
    }
    
    return target_size;
}

/**
 * Compress video with specified quality
 * @param input_data - Input video data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @return -1 on error, compressed size on success
 */
EMSCRIPTEN_KEEPALIVE
int compress_video(unsigned char* input_data, int input_size,
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
    
    // Simple video compression algorithm
    int step = input_size / target_size;
    if (step < 1) step = 1;
    
    for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
        // Average frames for compression
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
 * Merge multiple video files into one
 * @param video_files - Array of video data pointers
 * @param file_sizes - Array of file sizes
 * @param num_files - Number of files to merge
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @return -1 on error, merged size on success
 */
EMSCRIPTEN_KEEPALIVE
int merge_video(unsigned char** video_files, int* file_sizes, int num_files,
                unsigned char* output_data, int output_size) {
    if (!video_files || !file_sizes || !output_data || num_files <= 0 || output_size <= 0) {
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
    
    // Concatenate video files
    for (int i = 0; i < num_files; i++) {
        if (video_files[i] && file_sizes[i] > 0) {
            memcpy(output_data + offset, video_files[i], file_sizes[i]);
            offset += file_sizes[i];
        }
    }
    
    return total_size;
}

/**
 * Trim video to specified duration
 * @param input_data - Input video data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param start_frame - Start frame
 * @param duration_frames - Duration in frames
 * @param frame_size - Size of each frame in bytes
 * @return -1 on error, trimmed size on success
 */
EMSCRIPTEN_KEEPALIVE
int trim_video(unsigned char* input_data, int input_size,
               unsigned char* output_data, int start_frame, int duration_frames,
               int frame_size) {
    if (!input_data || !output_data || input_size <= 0 || frame_size <= 0) {
        return -1;
    }
    
    int start_byte = start_frame * frame_size;
    int duration_bytes = duration_frames * frame_size;
    
    if (start_byte >= input_size) {
        return 0; // Start frame beyond video length
    }
    
    int end_byte = start_byte + duration_bytes;
    if (end_byte > input_size) {
        end_byte = input_size;
    }
    
    int trimmed_size = end_byte - start_byte;
    memcpy(output_data, input_data + start_byte, trimmed_size);
    
    return trimmed_size;
}

/**
 * Resize video frames
 * @param input_data - Input video data
 * @param input_width - Input width
 * @param input_height - Input height
 * @param output_data - Output buffer
 * @param output_width - Output width
 * @param output_height - Output height
 * @param num_frames - Number of frames
 * @return -1 on error, 0 on success
 */
EMSCRIPTEN_KEEPALIVE
int resize_video_frames(unsigned char* input_data, int input_width, int input_height,
                        unsigned char* output_data, int output_width, int output_height,
                        int num_frames) {
    if (!input_data || !output_data || input_width <= 0 || input_height <= 0 ||
        output_width <= 0 || output_height <= 0 || num_frames <= 0) {
        return -1;
    }
    
    int input_frame_size = input_width * input_height * 3; // RGB
    int output_frame_size = output_width * output_height * 3;
    
    float x_ratio = (float)input_width / output_width;
    float y_ratio = (float)input_height / output_height;
    
    for (int frame = 0; frame < num_frames; frame++) {
        unsigned char* input_frame = input_data + (frame * input_frame_size);
        unsigned char* output_frame = output_data + (frame * output_frame_size);
        
        for (int y = 0; y < output_height; y++) {
            for (int x = 0; x < output_width; x++) {
                int src_x = (int)(x * x_ratio);
                int src_y = (int)(y * y_ratio);
                
                // Clamp to input bounds
                if (src_x >= input_width) src_x = input_width - 1;
                if (src_y >= input_height) src_y = input_height - 1;
                
                int src_index = (src_y * input_width + src_x) * 3;
                int dst_index = (y * output_width + x) * 3;
                
                for (int c = 0; c < 3; c++) {
                    output_frame[dst_index + c] = input_frame[src_index + c];
                }
            }
        }
    }
    
    return 0;
}


