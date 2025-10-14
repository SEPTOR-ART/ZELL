#include <emscripten.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

// PDF processing functions for WebAssembly
// Optimized for offline processing in ZELL

typedef struct {
    int page_count;
    int file_size;
    unsigned char* data;
} PDFData;

/**
 * Process PDF data for conversion/compression
 * @param input_data - Input PDF data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @param quality - Compression quality (0-100)
 * @param format - Target format (0=PDF, 1=TXT, 2=DOCX)
 * @return -1 on error, output size on success
 */
EMSCRIPTEN_KEEPALIVE
int process_pdf(unsigned char* input_data, int input_size,
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
    
    // Simple PDF processing based on format
    if (format == 0) { // PDF to PDF (compression)
        // Simulate PDF compression
        int step = input_size / target_size;
        if (step < 1) step = 1;
        
        for (int i = 0, j = 0; i < input_size && j < target_size; i += step, j++) {
            output_data[j] = input_data[i];
        }
    } else if (format == 1) { // PDF to TXT
        // Extract text content (simplified)
        int text_size = 0;
        for (int i = 0; i < input_size && text_size < target_size; i++) {
            if (input_data[i] >= 32 && input_data[i] <= 126) { // Printable ASCII
                output_data[text_size++] = input_data[i];
            }
        }
        return text_size;
    } else if (format == 2) { // PDF to DOCX
        // Convert to DOCX format (simplified)
        int docx_size = 0;
        // Add DOCX header
        const char* docx_header = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
        int header_len = strlen(docx_header);
        if (docx_size + header_len < target_size) {
            memcpy(output_data + docx_size, docx_header, header_len);
            docx_size += header_len;
        }
        
        // Add content
        for (int i = 0; i < input_size && docx_size < target_size; i++) {
            if (input_data[i] >= 32 && input_data[i] <= 126) {
                output_data[docx_size++] = input_data[i];
            }
        }
        return docx_size;
    }
    
    return target_size;
}

/**
 * Merge multiple PDFs into one
 * @param pdf_files - Array of PDF data pointers
 * @param file_sizes - Array of file sizes
 * @param num_files - Number of files to merge
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @return -1 on error, merged size on success
 */
EMSCRIPTEN_KEEPALIVE
int merge_pdfs(unsigned char** pdf_files, int* file_sizes, int num_files,
               unsigned char* output_data, int output_size) {
    if (!pdf_files || !file_sizes || !output_data || num_files <= 0 || output_size <= 0) {
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
    
    // Add PDF header
    const char* pdf_header = "%PDF-1.4\n";
    int header_len = strlen(pdf_header);
    if (offset + header_len < output_size) {
        memcpy(output_data + offset, pdf_header, header_len);
        offset += header_len;
    }
    
    // Concatenate PDF files (simplified - real implementation would need proper PDF merging)
    for (int i = 0; i < num_files; i++) {
        if (pdf_files[i] && file_sizes[i] > 0) {
            // Skip PDF header from subsequent files
            int skip_header = 0;
            if (i > 0 && file_sizes[i] > 8) {
                if (memcmp(pdf_files[i], "%PDF-", 5) == 0) {
                    skip_header = 8; // Skip header
                }
            }
            
            int copy_size = file_sizes[i] - skip_header;
            if (offset + copy_size < output_size) {
                memcpy(output_data + offset, pdf_files[i] + skip_header, copy_size);
                offset += copy_size;
            }
        }
    }
    
    // Add PDF footer
    const char* pdf_footer = "\n%%EOF\n";
    int footer_len = strlen(pdf_footer);
    if (offset + footer_len < output_size) {
        memcpy(output_data + offset, pdf_footer, footer_len);
        offset += footer_len;
    }
    
    return offset;
}

/**
 * Extract text from PDF
 * @param input_data - Input PDF data
 * @param input_size - Size of input data
 * @param output_data - Output buffer
 * @param output_size - Size of output buffer
 * @return -1 on error, extracted text size on success
 */
EMSCRIPTEN_KEEPALIVE
int extract_text(unsigned char* input_data, int input_size,
                 unsigned char* output_data, int output_size) {
    if (!input_data || !output_data || input_size <= 0 || output_size <= 0) {
        return -1;
    }
    
    int text_size = 0;
    int in_text_object = 0;
    
    for (int i = 0; i < input_size && text_size < output_size - 1; i++) {
        // Look for text objects in PDF
        if (i < input_size - 4) {
            if (memcmp(input_data + i, "BT", 2) == 0) {
                in_text_object = 1;
                i += 1; // Skip 'T'
                continue;
            } else if (memcmp(input_data + i, "ET", 2) == 0) {
                in_text_object = 0;
                i += 1; // Skip 'T'
                continue;
            }
        }
        
        // Extract text content
        if (in_text_object) {
            if (input_data[i] == '(') {
                // Start of text string
                i++;
                while (i < input_size && input_data[i] != ')' && text_size < output_size - 1) {
                    if (input_data[i] >= 32 && input_data[i] <= 126) {
                        output_data[text_size++] = input_data[i];
                    }
                    i++;
                }
                if (text_size < output_size - 1) {
                    output_data[text_size++] = ' '; // Add space between text strings
                }
            }
        }
    }
    
    // Null terminate
    if (text_size < output_size) {
        output_data[text_size] = '\0';
    }
    
    return text_size;
}

/**
 * Split PDF into multiple pages
 * @param input_data - Input PDF data
 * @param input_size - Size of input data
 * @param page_data - Array of output buffers for each page
 * @param page_sizes - Array of page sizes
 * @param max_pages - Maximum number of pages
 * @param page_count - Number of pages to split
 * @return -1 on error, 0 on success
 */
EMSCRIPTEN_KEEPALIVE
int split_pdf(unsigned char* input_data, int input_size,
              unsigned char** page_data, int* page_sizes, int max_pages,
              int page_count) {
    if (!input_data || !page_data || !page_sizes || input_size <= 0 || 
        max_pages <= 0 || page_count <= 0 || page_count > max_pages) {
        return -1;
    }
    
    // Simple PDF splitting (in real implementation, would need proper PDF parsing)
    int page_size = input_size / page_count;
    
    for (int i = 0; i < page_count; i++) {
        int start_offset = i * page_size;
        int end_offset = (i + 1) * page_size;
        if (i == page_count - 1) {
            end_offset = input_size; // Last page gets remaining data
        }
        
        int current_page_size = end_offset - start_offset;
        if (current_page_size > page_sizes[i]) {
            current_page_size = page_sizes[i];
        }
        
        memcpy(page_data[i], input_data + start_offset, current_page_size);
        page_sizes[i] = current_page_size;
    }
    
    return 0;
}


