import React from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Surface,
  Card,
  Title,
  Chip,
} from 'react-native-paper';

/**
 * Compile Preview Component
 * Shows preview of file compilation process
 */
const CompilePreview = ({ files, outputFormat }) => {
  /**
   * Calculate total size
   */
  const getTotalSize = () => {
    return files.reduce((total, file) => total + file.size, 0);
  };

  /**
   * Get file type distribution
   */
  const getFileTypeDistribution = () => {
    const typeCount = {};
    files.forEach(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      typeCount[extension] = (typeCount[extension] || 0) + 1;
    });
    return typeCount;
  };

  /**
   * Get estimated output size
   */
  const getEstimatedOutputSize = () => {
    const totalSize = getTotalSize();
    const typeDistribution = getFileTypeDistribution();
    
    // Estimate compression based on file types and output format
    let compressionRatio = 1.0;
    
    if (outputFormat === 'zip' || outputFormat === 'rar' || outputFormat === '7z') {
      // Archive compression
      compressionRatio = 0.7; // 30% compression
    } else if (outputFormat === 'pdf') {
      // PDF compilation
      compressionRatio = 0.9; // 10% compression
    } else if (outputFormat === 'mp3' || outputFormat === 'wav' || outputFormat === 'aac') {
      // Audio merging
      compressionRatio = 1.0; // No compression for audio merging
    } else if (outputFormat === 'mp4' || outputFormat === 'mov' || outputFormat === 'avi' || outputFormat === 'mkv') {
      // Video merging
      compressionRatio = 1.0; // No compression for video merging
    }
    
    return Math.round(totalSize * compressionRatio);
  };

  /**
   * Format file size
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Get compilation type description
   */
  const getCompilationType = () => {
    const typeDistribution = getFileTypeDistribution();
    const uniqueTypes = Object.keys(typeDistribution);
    
    if (uniqueTypes.length === 1) {
      const fileType = uniqueTypes[0];
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType)) {
        return 'Image Sequence';
      } else if (['mp3', 'wav', 'aac'].includes(fileType)) {
        return 'Audio Track';
      } else if (['mp4', 'mov', 'avi', 'mkv'].includes(fileType)) {
        return 'Video Compilation';
      } else if (['pdf', 'docx', 'txt', 'pptx'].includes(fileType)) {
        return 'Document Collection';
      } else if (['zip', 'rar', '7z'].includes(fileType)) {
        return 'Archive Bundle';
      }
    }
    
    return 'Mixed File Collection';
  };

  const totalSize = getTotalSize();
  const estimatedOutputSize = getEstimatedOutputSize();
  const typeDistribution = getFileTypeDistribution();
  const compilationType = getCompilationType();

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>Compilation Preview</Title>
          
          <Surface style={styles.infoSurface}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Compilation Type:</Text>
              <Text style={styles.infoValue}>{compilationType}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Output Format:</Text>
              <Chip style={styles.formatChip}>
                {outputFormat.toUpperCase()}
              </Chip>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Files:</Text>
              <Text style={styles.infoValue}>{files.length}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Total Input Size:</Text>
              <Text style={styles.infoValue}>{formatFileSize(totalSize)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Estimated Output Size:</Text>
              <Text style={styles.infoValue}>{formatFileSize(estimatedOutputSize)}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Space Saved:</Text>
              <Text style={[styles.infoValue, styles.spaceSaved]}>
                {formatFileSize(totalSize - estimatedOutputSize)}
              </Text>
            </View>
          </Surface>
          
          <View style={styles.fileTypesContainer}>
            <Text style={styles.fileTypesTitle}>File Types:</Text>
            <View style={styles.fileTypesList}>
              {Object.entries(typeDistribution).map(([type, count]) => (
                <Chip
                  key={type}
                  style={styles.fileTypeChip}
                  textStyle={styles.fileTypeChipText}
                >
                  {type.toUpperCase()} ({count})
                </Chip>
              ))}
            </View>
          </View>
          
          <View style={styles.processingInfo}>
            <Text style={styles.processingTitle}>Processing Information:</Text>
            <Text style={styles.processingText}>
              • Files will be processed in the order shown
            </Text>
            <Text style={styles.processingText}>
              • Estimated processing time: {Math.max(5, Math.round(files.length * 2))} seconds
            </Text>
            <Text style={styles.processingText}>
              • All processing is done offline on your device
            </Text>
            <Text style={styles.processingText}>
              • Original files will remain unchanged
            </Text>
          </View>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  card: {
    elevation: 2,
  },
  infoSurface: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  spaceSaved: {
    color: '#4CAF50',
  },
  formatChip: {
    height: 28,
  },
  fileTypesContainer: {
    marginTop: 16,
  },
  fileTypesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  fileTypesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  fileTypeChip: {
    marginRight: 8,
    marginBottom: 8,
    height: 28,
  },
  fileTypeChipText: {
    fontSize: 10,
  },
  processingInfo: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  processingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  processingText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
});

export default CompilePreview;


