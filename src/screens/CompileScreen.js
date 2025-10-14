import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  FlatList,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  ProgressBar,
  Surface,
  TextInput,
  IconButton,
  Menu,
  Divider,
  FAB,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Import components
import FilePreview from '../components/FilePreview';
import CompilePreview from '../components/CompilePreview';
import ShareButton from '../components/ShareButton';
import OfflineProcessor from '../services/OfflineProcessor';

const CompileScreen = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [outputFormat, setOutputFormat] = useState('');
  const [isCompiling, setIsCompiling] = useState(false);
  const [compileProgress, setCompileProgress] = useState(0);
  const [compileResult, setCompileResult] = useState(null);
  const [fileOrder, setFileOrder] = useState([]);

  /**
   * Handle file selection
   */
  const handleFileSelection = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFiles = result.assets.map(file => ({
          id: Date.now() + Math.random(),
          uri: file.uri,
          name: file.name,
          size: file.size,
          mimeType: file.mimeType,
        }));

        setSelectedFiles(prev => [...prev, ...newFiles]);
        setFileOrder(prev => [...prev, ...newFiles.map(f => f.id)]);
        setCompileResult(null);
        setCompileProgress(0);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select files: ' + error.message);
    }
  }, []);

  /**
   * Remove file from selection
   */
  const removeFile = useCallback((fileId) => {
    setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
    setFileOrder(prev => prev.filter(id => id !== fileId));
  }, []);

  /**
   * Move file up in order
   */
  const moveFileUp = useCallback((fileId) => {
    setFileOrder(prev => {
      const currentIndex = prev.indexOf(fileId);
      if (currentIndex > 0) {
        const newOrder = [...prev];
        [newOrder[currentIndex], newOrder[currentIndex - 1]] = 
        [newOrder[currentIndex - 1], newOrder[currentIndex]];
        return newOrder;
      }
      return prev;
    });
  }, []);

  /**
   * Move file down in order
   */
  const moveFileDown = useCallback((fileId) => {
    setFileOrder(prev => {
      const currentIndex = prev.indexOf(fileId);
      if (currentIndex < prev.length - 1) {
        const newOrder = [...prev];
        [newOrder[currentIndex], newOrder[currentIndex + 1]] = 
        [newOrder[currentIndex + 1], newOrder[currentIndex]];
        return newOrder;
      }
      return prev;
    });
  }, []);

  /**
   * Get supported output formats based on selected files
   */
  const getSupportedOutputFormats = useCallback(() => {
    if (selectedFiles.length === 0) return [];

    const fileTypes = selectedFiles.map(file => {
      const extension = file.name.split('.').pop().toLowerCase();
      return extension;
    });

    const uniqueTypes = [...new Set(fileTypes)];
    
    // Determine common output formats based on file types
    const formatMap = {
      // All images
      allImages: ['pdf', 'gif', 'zip'],
      // All audio
      allAudio: ['mp3', 'wav', 'aac'],
      // All video
      allVideo: ['mp4', 'mov', 'avi', 'mkv'],
      // All documents
      allDocuments: ['pdf', 'docx', 'txt'],
      // All archives
      allArchives: ['zip', 'rar', '7z'],
      // Mixed types
      mixed: ['zip', 'pdf'],
    };

    // Check if all files are the same type
    if (uniqueTypes.length === 1) {
      const fileType = uniqueTypes[0];
      
      if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(fileType)) {
        return formatMap.allImages;
      } else if (['mp3', 'wav', 'aac'].includes(fileType)) {
        return formatMap.allAudio;
      } else if (['mp4', 'mov', 'avi', 'mkv'].includes(fileType)) {
        return formatMap.allVideo;
      } else if (['pdf', 'docx', 'txt', 'pptx'].includes(fileType)) {
        return formatMap.allDocuments;
      } else if (['zip', 'rar', '7z'].includes(fileType)) {
        return formatMap.allArchives;
      }
    }

    // Mixed file types
    return formatMap.mixed;
  }, [selectedFiles]);

  /**
   * Get files in correct order
   */
  const getOrderedFiles = useCallback(() => {
    return fileOrder.map(id => selectedFiles.find(file => file.id === id)).filter(Boolean);
  }, [selectedFiles, fileOrder]);

  /**
   * Handle compilation
   */
  const handleCompilation = useCallback(async () => {
    if (selectedFiles.length === 0) {
      Alert.alert('Error', 'Please select files to compile');
      return;
    }

    if (!outputFormat) {
      Alert.alert('Error', 'Please select an output format');
      return;
    }

    setIsCompiling(true);
    setCompileProgress(0);
    setCompileResult(null);

    try {
      const orderedFiles = getOrderedFiles();
      
      const result = await OfflineProcessor.mergeFiles(
        orderedFiles,
        outputFormat,
        (progress) => {
          setCompileProgress(progress);
        }
      );

      setCompileResult(result);

      Alert.alert(
        'Compilation Complete',
        `Files compiled successfully!\nOutput format: ${outputFormat.toUpperCase()}\nTotal size: ${formatFileSize(result.totalSize)}\nFiles merged: ${result.fileCount}`,
        [
          {
            text: 'Download',
            onPress: () => downloadCompiledFile(result),
          },
          { text: 'OK' },
        ]
      );

    } catch (error) {
      Alert.alert('Compilation Failed', error.message);
    } finally {
      setIsCompiling(false);
    }
  }, [selectedFiles, outputFormat, getOrderedFiles]);

  /**
   * Download compiled file
   */
  const downloadCompiledFile = useCallback(async (result) => {
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = result.outputPath;
        link.download = `compiled_${Date.now()}.${outputFormat}`;
        link.click();
      } else {
        await Sharing.shareAsync(result.outputPath);
      }
    } catch (error) {
      Alert.alert('Download Failed', error.message);
    }
  }, [outputFormat]);

  /**
   * Clear all files
   */
  const clearAllFiles = useCallback(() => {
    setSelectedFiles([]);
    setFileOrder([]);
    setOutputFormat('');
    setCompileResult(null);
    setCompileProgress(0);
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

  const supportedFormats = getSupportedOutputFormats();
  const orderedFiles = getOrderedFiles();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title>File Compiler</Title>
            <Paragraph>
              Merge multiple files into a single file. Combine documents, images, audio, video, or archives.
            </Paragraph>
          </Card.Content>
        </Card>

        {/* File Selection */}
        <Card style={styles.card}>
          <Card.Content>
            <Title>1. Select Files to Compile</Title>
            {selectedFiles.length > 0 ? (
              <View>
                <Text style={styles.fileCountText}>
                  {selectedFiles.length} file(s) selected
                </Text>
                <Button
                  mode="outlined"
                  onPress={clearAllFiles}
                  style={styles.clearButton}
                >
                  Clear All
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={handleFileSelection}
                icon="file-upload"
                style={styles.selectButton}
              >
                Choose Files
              </Button>
            )}
          </Card.Content>
        </Card>

        {/* Selected Files List */}
        {selectedFiles.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Selected Files (Drag to reorder)</Title>
              <FlatList
                data={orderedFiles}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item, index }) => (
                  <View style={styles.fileItem}>
                    <View style={styles.fileInfo}>
                      <Text style={styles.fileIndex}>{index + 1}</Text>
                      <FilePreview file={item} />
                    </View>
                    <View style={styles.fileActions}>
                      {index > 0 && (
                        <IconButton
                          icon="chevron-up"
                          size={20}
                          onPress={() => moveFileUp(item.id)}
                        />
                      )}
                      {index < orderedFiles.length - 1 && (
                        <IconButton
                          icon="chevron-down"
                          size={20}
                          onPress={() => moveFileDown(item.id)}
                        />
                      )}
                      <IconButton
                        icon="close"
                        size={20}
                        onPress={() => removeFile(item.id)}
                      />
                    </View>
                  </View>
                )}
                style={styles.filesList}
              />
            </Card.Content>
          </Card>
        )}

        {/* Output Format Selection */}
        {selectedFiles.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>2. Choose Output Format</Title>
              <View style={styles.formatContainer}>
                {supportedFormats.map((format) => (
                  <Chip
                    key={format}
                    selected={outputFormat === format}
                    onPress={() => setOutputFormat(format)}
                    style={styles.formatChip}
                  >
                    {format.toUpperCase()}
                  </Chip>
                ))}
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Compilation Preview */}
        {selectedFiles.length > 0 && outputFormat && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>3. Compilation Preview</Title>
              <CompilePreview
                files={orderedFiles}
                outputFormat={outputFormat}
              />
            </Card.Content>
          </Card>
        )}

        {/* Compilation Progress */}
        {isCompiling && (
          <Card style={styles.card}>
            <Card.Content>
              <Title>Compiling Files...</Title>
              <ProgressBar
                progress={compileProgress / 100}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>
                {compileProgress.toFixed(0)}% Complete
              </Text>
            </Card.Content>
          </Card>
        )}

      {/* Compilation Result */}
      {compileResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Compilation Complete</Title>
            <Surface style={styles.resultSurface}>
              <Text>Output Format: {outputFormat.toUpperCase()}</Text>
              <Text>Total Size: {formatFileSize(compileResult.totalSize)}</Text>
              <Text>Files Merged: {compileResult.fileCount}</Text>
            </Surface>
            <View style={styles.resultActions}>
              <Button
                mode="contained"
                onPress={() => downloadCompiledFile(compileResult)}
                icon="download"
                style={styles.actionButton}
              >
                Download
              </Button>
              <ShareButton
                file={{
                  uri: compileResult.outputPath,
                  name: `compiled_${Date.now()}.${outputFormat}`,
                  size: compileResult.totalSize,
                  mimeType: `application/${outputFormat}`,
                }}
                mode="button"
                style={styles.actionButton}
                onShareSuccess={(file) => {
                  console.log('Compiled file shared successfully:', file);
                }}
                onShareError={(error) => {
                  console.error('Share error:', error);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={handleFileSelection}
        label="Add Files"
      />

      {/* Compile Button */}
      {selectedFiles.length > 0 && outputFormat && !isCompiling && (
        <Button
          mode="contained"
          onPress={handleCompilation}
          icon="layers"
          style={styles.compileButton}
          contentStyle={styles.compileButtonContent}
        >
          Compile Files
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
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
  fileCountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  filesList: {
    maxHeight: 300,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  fileInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fileIndex: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
    minWidth: 24,
    textAlign: 'center',
  },
  fileActions: {
    flexDirection: 'row',
  },
  formatContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  formatChip: {
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
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  compileButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
  },
  compileButtonContent: {
    paddingVertical: 8,
  },
});

export default CompileScreen;
