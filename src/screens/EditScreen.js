import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  Dimensions,
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
  SegmentedButtons,
  IconButton,
  Menu,
  Divider,
} from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// Import components
import FilePreview from '../components/FilePreview';
import ImageEditor from '../components/ImageEditor';
import AudioEditor from '../components/AudioEditor';
import VideoEditor from '../components/VideoEditor';
import DocumentEditor from '../components/DocumentEditor';
import ArchiveEditor from '../components/ArchiveEditor';
import ShareButton from '../components/ShareButton';
import OfflineProcessor from '../services/OfflineProcessor';

const { width: screenWidth } = Dimensions.get('window');

const EditScreen = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [editMode, setEditMode] = useState('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [editResult, setEditResult] = useState(null);
  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

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
        setEditMode('none');
        setEditResult(null);
        setProcessingProgress(0);
        setUndoStack([]);
        setRedoStack([]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select file: ' + error.message);
    }
  }, []);

  /**
   * Get file type and available edit modes
   */
  const getFileTypeAndModes = useCallback(() => {
    if (!selectedFile) return { type: null, modes: [] };

    const extension = selectedFile.name.split('.').pop().toLowerCase();
    
    const typeMap = {
      // Images
      'jpg': { type: 'image', modes: ['crop', 'resize', 'rotate', 'filters', 'text', 'watermark'] },
      'jpeg': { type: 'image', modes: ['crop', 'resize', 'rotate', 'filters', 'text', 'watermark'] },
      'png': { type: 'image', modes: ['crop', 'resize', 'rotate', 'filters', 'text', 'watermark'] },
      'webp': { type: 'image', modes: ['crop', 'resize', 'rotate', 'filters', 'text', 'watermark'] },
      'gif': { type: 'image', modes: ['crop', 'resize', 'rotate', 'filters'] },
      
      // Audio
      'mp3': { type: 'audio', modes: ['trim', 'merge', 'fade', 'volume', 'normalize'] },
      'wav': { type: 'audio', modes: ['trim', 'merge', 'fade', 'volume', 'normalize'] },
      'aac': { type: 'audio', modes: ['trim', 'merge', 'fade', 'volume', 'normalize'] },
      
      // Video
      'mp4': { type: 'video', modes: ['trim', 'crop', 'merge', 'subtitles', 'watermark', 'text'] },
      'mov': { type: 'video', modes: ['trim', 'crop', 'merge', 'subtitles', 'watermark', 'text'] },
      'avi': { type: 'video', modes: ['trim', 'crop', 'merge', 'subtitles', 'watermark', 'text'] },
      'mkv': { type: 'video', modes: ['trim', 'crop', 'merge', 'subtitles', 'watermark', 'text'] },
      
      // Documents
      'pdf': { type: 'document', modes: ['text', 'merge', 'split', 'annotate', 'watermark'] },
      'docx': { type: 'document', modes: ['text', 'format', 'merge', 'split'] },
      'txt': { type: 'document', modes: ['text', 'format', 'find_replace'] },
      'pptx': { type: 'document', modes: ['text', 'format', 'merge', 'split'] },
      
      // Archives
      'zip': { type: 'archive', modes: ['extract', 'add', 'remove', 'rename'] },
      'rar': { type: 'archive', modes: ['extract', 'add', 'remove', 'rename'] },
      '7z': { type: 'archive', modes: ['extract', 'add', 'remove', 'rename'] },
    };

    return typeMap[extension] || { type: 'unknown', modes: [] };
  }, [selectedFile]);

  /**
   * Handle edit mode selection
   */
  const handleEditModeSelection = useCallback((mode) => {
    setEditMode(mode);
    setEditResult(null);
  }, []);

  /**
   * Apply edit to file
   */
  const applyEdit = useCallback(async (editData) => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Save current state for undo
      setUndoStack(prev => [...prev, { file: selectedFile, result: editResult }]);
      setRedoStack([]);

      // Simulate processing
      const progressInterval = setInterval(() => {
        setProcessingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Apply edit based on file type and mode
      const { type } = getFileTypeAndModes();
      let result;

      switch (type) {
        case 'image':
          result = await applyImageEdit(selectedFile, editMode, editData);
          break;
        case 'audio':
          result = await applyAudioEdit(selectedFile, editMode, editData);
          break;
        case 'video':
          result = await applyVideoEdit(selectedFile, editMode, editData);
          break;
        case 'document':
          result = await applyDocumentEdit(selectedFile, editMode, editData);
          break;
        case 'archive':
          result = await applyArchiveEdit(selectedFile, editMode, editData);
          break;
        default:
          throw new Error('Unsupported file type for editing');
      }

      clearInterval(progressInterval);
      setProcessingProgress(100);
      setEditResult(result);

      Alert.alert('Edit Complete', 'File has been edited successfully!');

    } catch (error) {
      Alert.alert('Edit Failed', error.message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFile, editMode, editResult, getFileTypeAndModes]);

  /**
   * Apply image edit
   */
  const applyImageEdit = async (file, mode, editData) => {
    // Simulate image editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputPath: file.uri, // In real implementation, this would be the edited file path
      originalSize: file.size,
      editedSize: file.size,
      editType: mode,
      editData,
    };
  };

  /**
   * Apply audio edit
   */
  const applyAudioEdit = async (file, mode, editData) => {
    // Simulate audio editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputPath: file.uri,
      originalSize: file.size,
      editedSize: file.size,
      editType: mode,
      editData,
    };
  };

  /**
   * Apply video edit
   */
  const applyVideoEdit = async (file, mode, editData) => {
    // Simulate video editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputPath: file.uri,
      originalSize: file.size,
      editedSize: file.size,
      editType: mode,
      editData,
    };
  };

  /**
   * Apply document edit
   */
  const applyDocumentEdit = async (file, mode, editData) => {
    // Simulate document editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputPath: file.uri,
      originalSize: file.size,
      editedSize: file.size,
      editType: mode,
      editData,
    };
  };

  /**
   * Apply archive edit
   */
  const applyArchiveEdit = async (file, mode, editData) => {
    // Simulate archive editing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      outputPath: file.uri,
      originalSize: file.size,
      editedSize: file.size,
      editType: mode,
      editData,
    };
  };

  /**
   * Undo last edit
   */
  const undoEdit = useCallback(() => {
    if (undoStack.length > 0) {
      const lastState = undoStack[undoStack.length - 1];
      setRedoStack(prev => [...prev, { file: selectedFile, result: editResult }]);
      setSelectedFile(lastState.file);
      setEditResult(lastState.result);
      setUndoStack(prev => prev.slice(0, -1));
    }
  }, [undoStack, selectedFile, editResult]);

  /**
   * Redo last undone edit
   */
  const redoEdit = useCallback(() => {
    if (redoStack.length > 0) {
      const lastState = redoStack[redoStack.length - 1];
      setUndoStack(prev => [...prev, { file: selectedFile, result: editResult }]);
      setSelectedFile(lastState.file);
      setEditResult(lastState.result);
      setRedoStack(prev => prev.slice(0, -1));
    }
  }, [redoStack, selectedFile, editResult]);

  /**
   * Download edited file
   */
  const downloadEditedFile = useCallback(async (result) => {
    try {
      if (Platform.OS === 'web') {
        const link = document.createElement('a');
        link.href = result.outputPath;
        link.download = `edited_${selectedFile.name}`;
        link.click();
      } else {
        await Sharing.shareAsync(result.outputPath);
      }
    } catch (error) {
      Alert.alert('Download Failed', error.message);
    }
  }, [selectedFile]);

  /**
   * Clear selection
   */
  const clearSelection = useCallback(() => {
    setSelectedFile(null);
    setEditMode('none');
    setEditResult(null);
    setProcessingProgress(0);
    setUndoStack([]);
    setRedoStack([]);
  }, []);

  const { type: fileType, modes: availableModes } = getFileTypeAndModes();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>File Editor</Title>
          <Paragraph>
            Edit your files with powerful offline tools. Crop, resize, trim, merge, and more.
          </Paragraph>
        </Card.Content>
      </Card>

      {/* File Selection */}
      <Card style={styles.card}>
        <Card.Content>
          <Title>1. Select File to Edit</Title>
          {selectedFile ? (
            <View>
              <FilePreview file={selectedFile} />
              <View style={styles.fileActions}>
                <Button
                  mode="outlined"
                  onPress={clearSelection}
                  style={styles.actionButton}
                >
                  Clear
                </Button>
                {undoStack.length > 0 && (
                  <Button
                    mode="outlined"
                    onPress={undoEdit}
                    icon="undo"
                    style={styles.actionButton}
                  >
                    Undo
                  </Button>
                )}
                {redoStack.length > 0 && (
                  <Button
                    mode="outlined"
                    onPress={redoEdit}
                    icon="redo"
                    style={styles.actionButton}
                  >
                    Redo
                  </Button>
                )}
              </View>
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

      {/* Edit Mode Selection */}
      {selectedFile && availableModes.length > 0 && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>2. Choose Edit Mode</Title>
            <Text style={styles.fileTypeText}>
              File Type: {fileType?.toUpperCase()}
            </Text>
            <View style={styles.modesContainer}>
              {availableModes.map((mode) => (
                <Chip
                  key={mode}
                  selected={editMode === mode}
                  onPress={() => handleEditModeSelection(mode)}
                  style={styles.modeChip}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Chip>
              ))}
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Edit Interface */}
      {selectedFile && editMode !== 'none' && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>3. Edit {editMode.charAt(0).toUpperCase() + editMode.slice(1)}</Title>
            
            {fileType === 'image' && (
              <ImageEditor
                file={selectedFile}
                mode={editMode}
                onApply={applyEdit}
              />
            )}
            
            {fileType === 'audio' && (
              <AudioEditor
                file={selectedFile}
                mode={editMode}
                onApply={applyEdit}
              />
            )}
            
            {fileType === 'video' && (
              <VideoEditor
                file={selectedFile}
                mode={editMode}
                onApply={applyEdit}
              />
            )}
            
            {fileType === 'document' && (
              <DocumentEditor
                file={selectedFile}
                mode={editMode}
                onApply={applyEdit}
              />
            )}
            
            {fileType === 'archive' && (
              <ArchiveEditor
                file={selectedFile}
                mode={editMode}
                onApply={applyEdit}
              />
            )}
          </Card.Content>
        </Card>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Processing...</Title>
            <ProgressBar
              progress={processingProgress / 100}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {processingProgress.toFixed(0)}% Complete
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* Edit Result */}
      {editResult && (
        <Card style={styles.card}>
          <Card.Content>
            <Title>Edit Complete</Title>
            <Surface style={styles.resultSurface}>
              <Text>Edit Type: {editResult.editType}</Text>
              <Text>Original Size: {formatFileSize(editResult.originalSize)}</Text>
              <Text>Edited Size: {formatFileSize(editResult.editedSize)}</Text>
            </Surface>
            <View style={styles.resultActions}>
              <Button
                mode="contained"
                onPress={() => downloadEditedFile(editResult)}
                icon="download"
                style={styles.actionButton}
              >
                Download
              </Button>
              <ShareButton
                file={{
                  uri: editResult.outputPath,
                  name: `edited_${selectedFile?.name || 'file'}`,
                  size: editResult.editedSize,
                  mimeType: selectedFile?.mimeType,
                }}
                mode="button"
                style={styles.actionButton}
                onShareSuccess={(file) => {
                  console.log('Edited file shared successfully:', file);
                }}
                onShareError={(error) => {
                  console.error('Share error:', error);
                }}
              />
            </View>
          </Card.Content>
        </Card>
      )}

      {/* Unsupported File Type */}
      {selectedFile && availableModes.length === 0 && (
        <Card style={[styles.card, styles.warningCard]}>
          <Card.Content>
            <Title>File Type Not Supported</Title>
            <Paragraph>
              This file type does not support editing. Please select an image, audio, video, document, or archive file.
            </Paragraph>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
};

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
  fileActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  actionButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  fileTypeText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#666',
  },
  modesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  modeChip: {
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
});

export default EditScreen;
