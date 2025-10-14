import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  ProgressBar,
  Surface,
  Chip,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';

// Import components
import FilePreview from '../components/FilePreview';
import CompressionLevelSelector from '../components/CompressionLevelSelector';
import ShareButton from '../components/ShareButton';
import CompressionService from '../services/CompressionService';

const CompressScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isCompressing, setIsCompressing] = useState(false);
  const [compressionProgress, setCompressionProgress] = useState(0);
  const [compressionResult, setCompressionResult] = useState(null);

  /**
   * Handle file selection
   */
  const handleFileSelection = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        });
        setCompressionResult(null);
        setCompressionProgress(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file: ' + error.message);
    }
  }, []);

  /**
   * Handle compression level change
   */
  const handleCompressionLevelChange = useCallback((level) => {
    setCompressionLevel(level);
  }, []);

  /**
   * Check if file type supports compression
   */
  const isCompressible = useCallback(() => {
    if (!selectedFile) return false;
    
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    const compressibleTypes = [
      'jpg', 'jpeg', 'png', 'webp', 'gif', // Images
      'mp3', 'wav', 'aac', // Audio
      'mp4', 'mov', 'avi', 'mkv', // Video
      'pdf', 'docx', 'txt', // Documents
      'zip', 'rar', '7z', // Archives
    ];
    
    return compressibleTypes.includes(extension);
  }, [selectedFile]);

  /**
   * Get estimated compression ratio
   */
  const getEstimatedCompression = useCallback(() => {
    if (!selectedFile) return null;
    
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    const estimates = {
      low: {
        'jpg': 15, 'jpeg': 15, 'png': 10, 'webp': 20,
        'mp3': 5, 'wav': 30, 'aac': 8,
        'mp4': 20, 'mov': 20, 'avi': 25, 'mkv': 20,
        'pdf': 10, 'docx': 15, 'txt': 5,
        'zip': 5, 'rar': 5, '7z': 5,
      },
      medium: {
        'jpg': 25, 'jpeg': 25, 'png': 20, 'webp': 35,
        'mp3': 10, 'wav': 50, 'aac': 15,
        'mp4': 35, 'mov': 35, 'avi': 40, 'mkv': 35,
        'pdf': 20, 'docx': 25, 'txt': 10,
        'zip': 10, 'rar': 10, '7z': 10,
      },
      high: {
        'jpg': 40, 'jpeg': 40, 'png': 35, 'webp': 50,
        'mp3': 20, 'wav': 70, 'aac': 25,
        'mp4': 50, 'mov': 50, 'avi': 55, 'mkv': 50,
        'pdf': 30, 'docx': 35, 'txt': 15,
        'zip': 15, 'rar': 15, '7z': 15,
      },
    };
    
    return estimates[compressionLevel]?.[extension] || 0;
  }, [selectedFile, compressionLevel]);

  /**
   * Handle compression
   */
  const handleCompression = useCallback(async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file to compress');
      return;
    }

    if (!isCompressible()) {
      Alert.alert('Error', 'This file type does not support compression');
      return;
    }

    setIsCompressing(true);
    setCompressionProgress(0);
    setCompressionResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setCompressionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await CompressionService.compressFile(
        selectedFile,
        compressionLevel,
        (progress) => {
          setCompressionProgress(progress);
        }
      );

      clearInterval(progressInterval);
      setCompressionProgress(100);
      setCompressionResult(result);

      Alert.alert(
        'Compression Complete',
        `File compressed successfully!\nOriginal size: ${formatFileSize(result.originalSize)}\nCompressed size: ${formatFileSize(result.compressedSize)}\nCompression ratio: ${result.compressionRatio.toFixed(1)}%`,
        [
          {
            text: 'Download',
            onPress: () => downloadCompressedFile(result),
          },
          { text: 'OK' },
        ]
      );

    } catch (error) {
      Alert.alert('Compression Failed', error.message);
    } finally {
      setIsCompressing(false);
    }
  }, [selectedFile, compressionLevel, isCompressible]);

  /**
   * Download compressed file
   */
  const downloadCompressedFile = useCallback(async (result) => {
    try {
      if (Platform.OS === 'web') {
        // For web, create download link
        const link = document.createElement('a');
        link.href = result.downloadUrl;
        link.download = result.fileName;
        link.click();
      } else {
        // For mobile, use sharing
        await Sharing.shareAsync(result.downloadUrl);
      }
    } catch (error) {
      Alert.alert('Download Failed', error.message);
    }
  }, []);

  /**
   * Format file size for display
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setCompressionResult(null);
    setCompressionProgress(0);
  }, []);

  const estimatedCompression = getEstimatedCompression();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>File Compressor</Title>
          <Paragraph>
            Reduce file sizes while maintaining quality. Supports images, audio, video, documents, and archives.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* File Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>1. Select File</Title>
          {selectedFile ? (
            <View>
              <FilePreview file={selectedFile} />
              <Button
                mode="outlined"
                onPress={clearSelection}
                style={styles.clearButton}
              >
                Clear Selection
              </Button>
            </View>
          ) : (
            <Button
              mode="contained"
              onPress={handleFileSelection}
              icon="file-upload"
              style={styles.selectButton}
            >
              Choose File
            </Button>
          )}
        </Card.Content>
      </Card>

      {/* Compression Level */}
      {selectedFile && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>2. Compression Level</Title>
            <CompressionLevelSelector
              value={compressionLevel}
              onChange={handleCompressionLevelChange}
            />
          </Card.Content>
        </Card>
      )}

      {/* Compression Info */}
      {selectedFile && isCompressible() && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Compression Info</Title>
            <Surface style={styles.infoSurface}>
              <Text>File Type: {selectedFile.name.split('.').pop().toUpperCase()}</Text>
              <Text>Original Size: {formatFileSize(selectedFile.size)}</Text>
              {estimatedCompression && (
                <Text>Estimated Compression: ~{estimatedCompression}%</Text>
              )}
              <Text>Quality: {compressionLevel === 'low' ? 'High' : compressionLevel === 'medium' ? 'Medium' : 'Lower'}</Text>
            </Surface>
          </Card.Content>
        </Card>
      )}

      {/* Not Compressible Warning */}
      {selectedFile && !isCompressible() && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Title>File Type Not Supported</Title>
            <Paragraph>
              This file type does not support compression. Please select an image, audio, video, document, or archive file.
            </Paragraph>
          </Card.Content>
        </Card>
      )}

      {/* Compression Progress */}
      {isCompressing && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Compressing...</Title>
            <ProgressBar
              progress={compressionProgress / 100}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {compressionProgress.toFixed(0)}% Complete
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Compression Result */}
      {compressionResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Compression Complete</Title>
            <Surface style={styles.resultSurface}>
              <Text>Original Size: {formatFileSize(compressionResult.originalSize)}</Text>
              <Text>Compressed Size: {formatFileSize(compressionResult.compressedSize)}</Text>
              <Text>Compression Ratio: {compressionResult.compressionRatio.toFixed(1)}%</Text>
              <Text>Space Saved: {formatFileSize(compressionResult.originalSize - compressionResult.compressedSize)}</Text>
            </Surface>
            <View style={styles.resultActions}>
              <Button
                mode="contained"
                onPress={() => downloadCompressedFile(compressionResult)}
                icon="download"
                style={styles.actionButton}
              >
                Download
              </Button>
              <ShareButton
                file={{
                  uri: compressionResult.outputPath,
                  name: compressionResult.fileName,
                  size: compressionResult.compressedSize,
                  mimeType: selectedFile?.mimeType,
                }}
                mode="button"
                style={styles.actionButton}
                onShareSuccess={(file) => {
                  console.log('Compressed file shared successfully:', file);
                }}
                onShareError={(error) => {
                  console.error('Share error:', error);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Compress Button */}
      {selectedFile && isCompressible() && !isCompressing && (
        <Button
          mode="contained"
          onPress={handleCompression}
          icon="compress"
          style={styles.compressButton}
          contentStyle={styles.compressButtonContent}
        >
          Compress File
        </Button>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderColor: '#ffeaa7',
    borderWidth: 1,
  },
  selectButton: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  infoSurface: {
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  progressBar: {
    marginTop: 16,
    marginBottom: 8,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
  },
  resultSurface: {
    padding: 16,
    marginVertical: 16,
    borderRadius: 8,
  },
  resultActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  compressButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  compressButtonContent: {
    paddingVertical: 8,
  },
});

export default CompressScreen;
