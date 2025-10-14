#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// Image processing functions for WebAssembly
// Optimized for offline processing in ZELL

typedef struct {
    int width;
    int height;
    int channels;
    unsigned char* data;
} ImageData;

/**
 * Process image data for conversion/compression
 * @param input_data - Input image data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @param format - Target format (0=JPEG, 1=PNG, 2=WEBP)
 * @return -1 on error, output size on success
 */
EMSCRIPTEN_KEEPALIVE
int process_image(unsigned char* input_data, int input_size, 
                  unsigned char* output_data, int output_size,
                  int quality, int format) {
    // Basic image processing implementation
    // In a real implementation, this would use libjpeg, libpng, or libwebp
    
    if (!input_data || !output_data || input_size <= 0 || output_size <= 0) {
        return -1;
    }
    
    // Simple quality-based compression simulation
    int compression_factor = (100 - quality) / 10;
    int processed_size = input_size - (input_size * compression_factor / 100);
    
    if (processed_size > output_size) {
        processed_size = output_size;
    }
    
    // Copy and modify data based on format
    for (int i = 0; i < processed_size && i < input_size; i++) {
        if (format == 0) { // JPEG
            output_data[i] = input_data[i] * quality / 100;
        } else if (format == 1) { // PNG
            output_data[i] = input_data[i];
        } else if (format == 2) { // WEBP
            output_data[i] = input_data[i] * (quality + 20) / 120;
        }
    }
    
    return processed_size;
}

/**
 * Compress image with specified quality
 * @param input_data - Input image data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @return -1 on error, compressed size on success
 */
EMSCRIPTEN_KEEPALIVE
int compress_image(unsigned char* input_data, int input_size,
                   unsigned char* output_data, int output_size,
                   int quality) {
    if (!input_data || !output_data || input_size <= 0 || output_size <= 0) {
        return -1;
    }
    
    // Calculate compression ratio
    float compression_ratio = (float)quality / 100.0f;
    int target_size = (int)(input_size * compression_ratio);
    
    if (target_size > output_size) {
        target_size = output_size;
    }
    
    // Simple compression algorithm
    int step = input_size / target_size;
    if (step < 1) step = 1;
    
    for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
        output_data[j] = input_data[i];
    }
    
    return target_size;
}

/**
 * Resize image to specified dimensions
 * @param input_data - Input image data
 * @param input_width - Input width
 * @param input_height - Input height
 * @param output_data - Output buffer
 * @param output_width - Output width
 * @param output_height - Output height
 * @param channels - Number of color channels
 * @return -1 on error, 0 on success
 */
EMSCRIPTEN_KEEPALIVE
int resize_image(unsigned char* input_data, int input_width, int input_height,
                 unsigned char* output_data, int output_width, int output_height,
                 int channels) {
    if (!input_data || !output_data || input_width <= 0 || input_height <= 0 ||
        output_width <= 0 || output_height <= 0 || channels <= 0) {
        return -1;
    }
    
    float x_ratio = (float)input_width / output_width;
    float y_ratio = (float)input_height / output_height;
    
    for (int y = 0; y < output_height; y++) {
        for (int x = 0; x < output_width; x++) {
            int src_x = (int)(x * x_ratio);
            int src_y = (int)(y * y_ratio);
            
            // Clamp to input bounds
            if (src_x >= input_width) src_x = input_width - 1;
            if (src_y >= input_height) src_y = input_height - 1;
            
            int src_index = (src_y * input_width + src_x) * channels;
            int dst_index = (y * output_width + x) * channels;
            
            for (int c = 0; c < channels; c++) {
                output_data[dst_index + c] = input_data[src_index + c];
            }
        }
    }
    
    return 0;
}


