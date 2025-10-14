import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  Surface,
  Card,
  Title,
  List,
  IconButton,
  Divider,
} from 'react-native-paper';

/**
 * Archive Editor Component
 * Provides editing tools for archive files
 */
const ArchiveEditor = ({ file, mode, onApply }) => {
  const [editParams, setEditParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [archiveContents, setArchiveContents] = useState([]);

  /**
   * Handle parameter change
   */
  const handleParamChange = useCallback((param, value) => {
    setEditParams(prev => ({
      ...prev,
      [param]: value,
    }));
  }, []);

  /**
   * Apply edit
   */
  const applyEdit = useCallback(async () => {
    setIsProcessing(true);
    try {
      await onApply({
        mode,
        params: editParams,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [mode, editParams, onApply]);

  /**
   * Load archive contents
   */
  const loadArchiveContents = useCallback(async () => {
    // Simulate loading archive contents
    const mockContents = [
      { name: 'document1.pdf', size: 1024000, type: 'file' },
      { name: 'image1.jpg', size: 512000, type: 'file' },
      { name: 'folder1/', size: 0, type: 'folder' },
      { name: 'folder1/subfolder/', size: 0, type: 'folder' },
      { name: 'folder1/subfolder/file.txt', size: 1024, type: 'file' },
    ];
    setArchiveContents(mockContents);
  }, []);

  /**
   * Remove file from archive
   */
  const removeFile = useCallback((fileName) => {
    setArchiveContents(prev => prev.filter(item => item.name !== fileName));
  }, []);

  /**
   * Rename file in archive
   */
  const renameFile = useCallback((oldName, newName) => {
    setArchiveContents(prev => 
      prev.map(item => 
        item.name === oldName ? { ...item, name: newName } : item
      )
    );
  }, []);

  /**
   * Render extract editor
   */
  const renderExtractEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Extract Files from Archive</Title>
      <Surface style={styles.paramSurface}>
        <Text>Extraction Options</Text>
        <SegmentedButtons
          value={editParams.extractMode || 'selected'}
          onValueChange={(value) => handleParamChange('extractMode', value)}
          buttons={[
            { value: 'all', label: 'All Files' },
            { value: 'selected', label: 'Selected Files' },
            { value: 'folder', label: 'Specific Folder' },
          ]}
        />
        
        {editParams.extractMode === 'folder' && (
          <TextInput
            label="Folder Path"
            value={editParams.folderPath || ''}
            onChangeText={(value) => handleParamChange('folderPath', value)}
            style={styles.textInput}
            placeholder="e.g., documents/images/"
          />
        )}
        
        <Text>Extract To</Text>
        <SegmentedButtons
          value={editParams.extractTo || 'current'}
          onValueChange={(value) => handleParamChange('extractTo', value)}
          buttons={[
            { value: 'current', label: 'Current Folder' },
            { value: 'new', label: 'New Folder' },
            { value: 'custom', label: 'Custom Path' },
          ]}
        />
        
        {editParams.extractTo === 'new' && (
          <TextInput
            label="New Folder Name"
            value={editParams.newFolderName || ''}
            onChangeText={(value) => handleParamChange('newFolderName', value)}
            style={styles.textInput}
            placeholder="extracted_files"
          />
        )}
        
        {editParams.extractTo === 'custom' && (
          <TextInput
            label="Custom Path"
            value={editParams.customPath || ''}
            onChangeText={(value) => handleParamChange('customPath', value)}
            style={styles.textInput}
            placeholder="/path/to/extract"
          />
        )}
        
        <Text>Overwrite Existing Files</Text>
        <SegmentedButtons
          value={editParams.overwrite ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('overwrite', value === 'true')}
          buttons={[
            { value: 'false', label: 'Skip' },
            { value: 'true', label: 'Overwrite' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render add editor
   */
  const renderAddEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Files to Archive</Title>
      <Surface style={styles.paramSurface}>
        <Text>Add Mode</Text>
        <SegmentedButtons
          value={editParams.addMode || 'files'}
          onValueChange={(value) => handleParamChange('addMode', value)}
          buttons={[
            { value: 'files', label: 'Files' },
            { value: 'folder', label: 'Folder' },
            { value: 'url', label: 'From URL' },
          ]}
        />
        
        <Text>Compression Level</Text>
        <SegmentedButtons
          value={editParams.compressionLevel || 'medium'}
          onValueChange={(value) => handleParamChange('compressionLevel', value)}
          buttons={[
            { value: 'low', label: 'Low' },
            { value: 'medium', label: 'Medium' },
            { value: 'high', label: 'High' },
          ]}
        />
        
        <Text>Archive Format</Text>
        <SegmentedButtons
          value={editParams.archiveFormat || 'zip'}
          onValueChange={(value) => handleParamChange('archiveFormat', value)}
          buttons={[
            { value: 'zip', label: 'ZIP' },
            { value: 'rar', label: 'RAR' },
            { value: '7z', label: '7Z' },
          ]}
        />
        
        <Text>Password Protection</Text>
        <SegmentedButtons
          value={editParams.passwordProtection ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('passwordProtection', value === 'true')}
          buttons={[
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' },
          ]}
        />
        
        {editParams.passwordProtection && (
          <TextInput
            label="Password"
            value={editParams.password || ''}
            onChangeText={(value) => handleParamChange('password', value)}
            style={styles.textInput}
            secureTextEntry
            placeholder="Enter password"
          />
        )}
      </Surface>
    </View>
  );

  /**
   * Render remove editor
   */
  const renderRemoveEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Remove Files from Archive</Title>
      <Surface style={styles.paramSurface}>
        <Button
          mode="outlined"
          onPress={loadArchiveContents}
          style={styles.loadButton}
        >
          Load Archive Contents
        </Button>
        
        {archiveContents.length > 0 && (
          <View style={styles.contentsContainer}>
            <Text style={styles.contentsTitle}>Archive Contents:</Text>
            <FlatList
              data={archiveContents}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <List.Item
                  title={item.name}
                  description={`${item.type} - ${formatFileSize(item.size)}`}
                  left={(props) => (
                    <List.Icon
                      {...props}
                      icon={item.type === 'folder' ? 'folder' : 'file'}
                    />
                  )}
                  right={(props) => (
                    <IconButton
                      {...props}
                      icon="delete"
                      size={20}
                      onPress={() => removeFile(item.name)}
                    />
                  )}
                />
              )}
              style={styles.contentsList}
            />
          </View>
        )}
        
        <Text>Remove Options</Text>
        <SegmentedButtons
          value={editParams.removeMode || 'selected'}
          onValueChange={(value) => handleParamChange('removeMode', value)}
          buttons={[
            { value: 'selected', label: 'Selected Files' },
            { value: 'pattern', label: 'By Pattern' },
            { value: 'type', label: 'By File Type' },
          ]}
        />
        
        {editParams.removeMode === 'pattern' && (
          <TextInput
            label="File Pattern"
            value={editParams.filePattern || ''}
            onChangeText={(value) => handleParamChange('filePattern', value)}
            style={styles.textInput}
            placeholder="e.g., *.tmp, temp_*"
          />
        )}
        
        {editParams.removeMode === 'type' && (
          <TextInput
            label="File Extension"
            value={editParams.fileExtension || ''}
            onChangeText={(value) => handleParamChange('fileExtension', value)}
            style={styles.textInput}
            placeholder="e.g., .tmp, .log"
          />
        )}
      </Surface>
    </View>
  );

  /**
   * Render rename editor
   */
  const renderRenameEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Rename Files in Archive</Title>
      <Surface style={styles.paramSurface}>
        <Button
          mode="outlined"
          onPress={loadArchiveContents}
          style={styles.loadButton}
        >
          Load Archive Contents
        </Button>
        
        {archiveContents.length > 0 && (
          <View style={styles.contentsContainer}>
            <Text style={styles.contentsTitle}>Archive Contents:</Text>
            <FlatList
              data={archiveContents}
              keyExtractor={(item) => item.name}
              renderItem={({ item }) => (
                <View style={styles.renameItem}>
                  <List.Item
                    title={item.name}
                    description={`${item.type} - ${formatFileSize(item.size)}`}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={item.type === 'folder' ? 'folder' : 'file'}
                      />
                    )}
                  />
                  <TextInput
                    label="New Name"
                    value={editParams[`newName_${item.name}`] || ''}
                    onChangeText={(value) => handleParamChange(`newName_${item.name}`, value)}
                    style={styles.renameInput}
                    placeholder="Enter new name"
                  />
                </View>
              )}
              style={styles.contentsList}
            />
          </View>
        )}
        
        <Text>Rename Options</Text>
        <SegmentedButtons
          value={editParams.renameMode || 'individual'}
          onValueChange={(value) => handleParamChange('renameMode', value)}
          buttons={[
            { value: 'individual', label: 'Individual' },
            { value: 'batch', label: 'Batch Rename' },
            { value: 'pattern', label: 'Pattern Replace' },
          ]}
        />
        
        {editParams.renameMode === 'batch' && (
          <>
            <TextInput
              label="Find Pattern"
              value={editParams.findPattern || ''}
              onChangeText={(value) => handleParamChange('findPattern', value)}
              style={styles.textInput}
              placeholder="e.g., old_prefix"
            />
            <TextInput
              label="Replace With"
              value={editParams.replacePattern || ''}
              onChangeText={(value) => handleParamChange('replacePattern', value)}
              style={styles.textInput}
              placeholder="e.g., new_prefix"
            />
          </>
        )}
      </Surface>
    </View>
  );

  /**
   * Render editor based on mode
   */
  const renderEditor = () => {
    switch (mode) {
      case 'extract':
        return renderExtractEditor();
      case 'add':
        return renderAddEditor();
      case 'remove':
        return renderRemoveEditor();
      case 'rename':
        return renderRenameEditor();
      default:
        return <Text>Unknown edit mode: {mode}</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {renderEditor()}
      
      <Button
        mode="contained"
        onPress={applyEdit}
        loading={isProcessing}
        disabled={isProcessing}
        style={styles.applyButton}
      >
        Apply {mode.charAt(0).toUpperCase() + mode.slice(1)}
      </Button>
    </View>
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
    marginTop: 16,
  },
  editorContainer: {
    marginBottom: 16,
  },
  paramSurface: {
    padding: 16,
    marginTop: 8,
    borderRadius: 8,
  },
  textInput: {
    marginBottom: 16,
  },
  loadButton: {
    marginBottom: 16,
  },
  contentsContainer: {
    marginTop: 16,
  },
  contentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentsList: {
    maxHeight: 200,
  },
  renameItem: {
    marginBottom: 8,
  },
  renameInput: {
    marginTop: 8,
  },
  applyButton: {
    marginTop: 16,
  },
});

export default ArchiveEditor;


