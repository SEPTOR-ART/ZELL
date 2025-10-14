import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Chip, IconButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

// Import theme colors
import { fileTypeColors } from '../theme/theme';

const FilePreview = ({ file, onRemove }) => {
  /**
   * Get file type from extension
   */
  const getFileType = (fileName) => {
    const extension = fileName.split('.').pop().toLowerCase();
    return extension;
  };

  /**
   * Get file category
   */
  const getFileCategory = (extension) => {
    const categories = {
      // Images
      'jpg': 'image', 'jpeg': 'image', 'png': 'image', 'webp': 'image', 'gif': 'image',
      // Audio
      'mp3': 'audio', 'wav': 'audio', 'aac': 'audio',
      // Video
      'mp4': 'video', 'mov': 'video', 'avi': 'video', 'mkv': 'video',
      // Documents
      'pdf': 'document', 'docx': 'document', 'txt': 'document', 'pptx': 'document',
      // Archives
      'zip': 'archive', 'rar': 'archive', '7z': 'archive',
    };
    return categories[extension] || 'text';
  };

  /**
   * Get file icon
   */
  const getFileIcon = (category) => {
    switch (category) {
      case 'image':
        return 'image';
      case 'audio':
        return 'musical-notes';
      case 'video':
        return 'videocam';
      case 'document':
        return 'document-text';
      case 'archive':
        return 'archive';
      default:
        return 'document';
    }
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
   * Get file type color
   */
  const getFileTypeColor = (category) => {
    return fileTypeColors[category] || fileTypeColors.text;
  };

  const fileType = getFileType(file.name);
  const fileCategory = getFileCategory(fileType);
  const fileIcon = getFileIcon(fileCategory);
  const fileTypeColor = getFileTypeColor(fileCategory);

  return (
    <Card style={[styles.container, { borderLeftColor: fileTypeColor }]}>
      <Card.Content style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons 
              name={fileIcon} 
              size={32} 
              color={fileTypeColor} 
            />
          </View>
          <View style={styles.fileInfo}>
            <Title numberOfLines={1} style={styles.fileName}>
              {file.name}
            </Title>
            <Paragraph style={styles.fileSize}>
              {formatFileSize(file.size)}
            </Paragraph>
          </View>
          {onRemove && (
            <IconButton
              icon="close"
              size={20}
              onPress={onRemove}
              style={styles.removeButton}
            />
          )}
        </View>
        
        <View style={styles.details}>
          <Chip 
            style={[styles.typeChip, { backgroundColor: fileTypeColor }]}
            textStyle={styles.typeChipText}
          >
            {fileType.toUpperCase()}
          </Chip>
          <Chip 
            style={styles.categoryChip}
            textStyle={styles.categoryChipText}
          >
            {fileCategory.charAt(0).toUpperCase() + fileCategory.slice(1)}
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    borderLeftWidth: 4,
    elevation: 2,
  },
  content: {
    paddingVertical: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#757575',
  },
  removeButton: {
    margin: 0,
  },
  details: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeChip: {
    marginRight: 8,
    height: 28,
  },
  typeChipText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  categoryChip: {
    height: 28,
  },
  categoryChipText: {
    fontSize: 10,
  },
});

export default FilePreview;


