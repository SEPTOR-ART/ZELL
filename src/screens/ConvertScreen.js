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
  Chip,
  ProgressBar,
  ActivityIndicator,
  Divider,
  Surface,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Import components
import FileTypeSelector from '../components/FileTypeSelector';
import CompressionLevelSelector from '../components/CompressionLevelSelector';
import FilePreview from '../components/FilePreview';
import ShareButton from '../components/ShareButton';
import ConversionService from '../services/ConversionService';

const ConvertScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [compressionLevel, setCompressionLevel] = useState('medium');
  const [isConverting, setIsConverting] = useState(false);
  const [conversionProgress, setConversionProgress] = useState(0);
  const [conversionResult, setConversionResult] = useState(null);

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
        setConversionResult(null);
        setConversionProgress(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file: ' + error.message);
    }
  }, []);

  /**
   * Handle format selection
   */
  const handleFormatSelection = useCallback((format) => {
    setTargetFormat(format);
    setConversionResult(null);
  }, []);

  /**
   * Handle compression level change
   */
  const handleCompressionLevelChange = useCallback((level) => {
    setCompressionLevel(level);
  }, []);

  /**
   * Get supported formats for selected file
   */
  const getSupportedFormats = useCallback(() => {
    if (!selectedFile) return [];

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    const formatMap = {
      // Images
      'jpg': ['png', 'webp'],
      'jpeg': ['png', 'webp'],
      'png': ['jpg', 'webp'],
      'webp': ['jpg', 'png'],
      'gif': ['jpg', 'png', 'webp'],
      
      // Audio
      'mp3': ['wav', 'aac'],
      'wav': ['mp3', 'aac'],
      'aac': ['mp3', 'wav'],
      
      // Video
      'mp4': ['mov', 'avi', 'mkv'],
      'mov': ['mp4', 'avi', 'mkv'],
      'avi': ['mp4', 'mov', 'mkv'],
      'mkv': ['mp4', 'mov', 'avi'],
      
      // Documents
      'pdf': ['docx', 'txt'],
      'docx': ['pdf', 'txt'],
      'txt': ['pdf', 'docx'],
      'pptx': ['pdf'],
      
      // Archives
      'zip': ['rar', '7z'],
      'rar': ['zip', '7z'],
      '7z': ['zip', 'rar'],
    };

    return formatMap[extension] || [];
  }, [selectedFile]);

  /**
   * Handle conversion
   */
  const handleConversion = useCallback(async () => {
    if (!selectedFile || !targetFormat) {
      Alert.alert('Error', 'Please select a file and target format');
      return;
    }

    setIsConverting(true);
    setConversionProgress(0);
    setConversionResult(null);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setConversionProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await ConversionService.convertFile(
        selectedFile,
        targetFormat,
        compressionLevel,
        (progress) => {
          setConversionProgress(progress);
        }
      );

      clearInterval(progressInterval);
      setConversionProgress(100);
      setConversionResult(result);

      Alert.alert(
        'Conversion Complete',
        `File converted successfully!\nOriginal size: ${formatFileSize(result.originalSize)}\nNew size: ${formatFileSize(result.compressedSize)}\nCompression ratio: ${result.compressionRatio.toFixed(1)}%`,
        [
          {
            text: 'Download',
            onPress: () => downloadConvertedFile(result),
          },
          { text: 'OK' },
        ]
      );

    } catch (error) {
      Alert.alert('Conversion Failed', error.message);
    } finally {
      setIsConverting(false);
    }
  }, [selectedFile, targetFormat, compressionLevel]);

  /**
   * Download converted file
   */
  const downloadConvertedFile = useCallback(async (result) => {
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
    setTargetFormat('');
    setConversionResult(null);
    setConversionProgress(0);
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>File Converter</Title>
          <Paragraph>
            Convert your files between different formats with high quality and fast processing.
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

      {/* Format Selection */}
      {selectedFile && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>2. Choose Target Format</Title>
            <View style={styles.chipContainer}>
              {getSupportedFormats().map((format) => (
                <Chip
                  key={format}
                  selected={targetFormat === format}
                  onPress={() => handleFormatSelection(format)}
                  style={styles.chip}
                >
                  {format.toUpperCase()}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Compression Level */}
      {selectedFile && targetFormat && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>3. Compression Level</Title>
            <CompressionLevelSelector
              value={compressionLevel}
              onChange={handleCompressionLevelChange}
            />
          </Card.Content>
        </Card>
      )}

      {/* Conversion Progress */}
      {isConverting && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Converting...</Title>
            <ProgressBar
              progress={conversionProgress / 100}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {conversionProgress.toFixed(0)}% Complete
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Conversion Result */}
      {conversionResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Conversion Complete</Title>
            <Surface style={styles.resultSurface}>
              <Text>Original Size: {formatFileSize(conversionResult.originalSize)}</Text>
              <Text>New Size: {formatFileSize(conversionResult.compressedSize)}</Text>
              <Text>Compression Ratio: {conversionResult.compressionRatio.toFixed(1)}%</Text>
            </Surface>
            <View style={styles.resultActions}>
              <Button
                mode="contained"
                onPress={() => downloadConvertedFile(conversionResult)}
                icon="download"
                style={styles.actionButton}
              >
                Download
              </Button>
              <ShareButton
                file={{
                  uri: conversionResult.outputPath,
                  name: conversionResult.fileName,
                  size: conversionResult.compressedSize,
                  mimeType: `application/${targetFormat}`,
                }}
                mode="button"
                style={styles.actionButton}
                onShareSuccess={(file) => {
                  console.log('File shared successfully:', file);
                }}
                onShareError={(error) => {
                  console.error('Share error:', error);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Convert Button */}
      {selectedFile && targetFormat && !isConverting && (
        <Button
          mode="contained"
          onPress={handleConversion}
          icon="swap-horizontal"
          style={styles.convertButton}
          contentStyle={styles.convertButtonContent}
        >
          Convert File
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
  selectButton: {
    marginTop: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
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
  convertButton: {
    marginTop: 16,
    marginBottom: 32,
  },
  convertButtonContent: {
    paddingVertical: 8,
  },
});

export default ConvertScreen;
