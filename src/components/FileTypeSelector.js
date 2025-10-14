import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Chip, Card } from 'react-native-paper';

// Import theme colors
import { fileTypeColors } from '../theme/theme';

const FileTypeSelector = ({ selectedFormat, onFormatSelect, supportedFormats }) => {
  const formatCategories = [
    {
      title: 'Images',
      formats: ['jpg', 'png', 'webp', 'gif'],
      color: fileTypeColors.image,
    },
    {
      title: 'Audio',
      formats: ['mp3', 'wav', 'aac'],
      color: fileTypeColors.audio,
    },
    {
      title: 'Video',
      formats: ['mp4', 'mov', 'avi', 'mkv'],
      color: fileTypeColors.video,
    },
    {
      title: 'Documents',
      formats: ['pdf', 'docx', 'txt', 'pptx'],
      color: fileTypeColors.document,
    },
    {
      title: 'Archives',
      formats: ['zip', 'rar', '7z'],
      color: fileTypeColors.archive,
    },
  ];

  /**
   * Check if format is supported
   */
  const isFormatSupported = (format) => {
    return supportedFormats.includes(format);
  };

  /**
   * Get format color
   */
  const getFormatColor = (format) => {
    for (const category of formatCategories) {
      if (category.formats.includes(format)) {
        return category.color;
      }
    }
    return fileTypeColors.text;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select Target Format:</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {formatCategories.map((category) => (
          <Card key={category.title} style={styles.categoryCard}>
            <Card.Content style={styles.categoryContent}>
              <Text style={[styles.categoryTitle, { color: category.color }]}>
                {category.title}
              </Text>
              <View style={styles.formatsContainer}>
                {category.formats.map((format) => {
                  const isSupported = isFormatSupported(format);
                  const isSelected = selectedFormat === format;
                  
                  return (
                    <Chip
                      key={format}
                      selected={isSelected}
                      onPress={() => isSupported && onFormatSelect(format)}
                      style={[
                        styles.formatChip,
                        isSelected && { backgroundColor: category.color },
                        !isSupported && styles.disabledChip
                      ]}
                      textStyle={[
                        styles.formatChipText,
                        isSelected && { color: 'white' },
                        !isSupported && styles.disabledChipText
                      ]}
                      disabled={!isSupported}
                    >
                      {format.toUpperCase()}
                    </Chip>
                  );
                })}
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      {/* Quick Selection */}
      <View style={styles.quickSelection}>
        <Text style={styles.quickLabel}>Quick Selection:</Text>
        <View style={styles.quickChips}>
          {supportedFormats.map((format) => (
            <Chip
              key={format}
              selected={selectedFormat === format}
              onPress={() => onFormatSelect(format)}
              style={[
                styles.quickChip,
                selectedFormat === format && { 
                  backgroundColor: getFormatColor(format) 
                }
              ]}
              textStyle={[
                styles.quickChipText,
                selectedFormat === format && { color: 'white' }
              ]}
            >
              {format.toUpperCase()}
            </Chip>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  scrollView: {
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 16,
  },
  categoryCard: {
    marginRight: 12,
    minWidth: 120,
    elevation: 1,
  },
  categoryContent: {
    paddingVertical: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  formatsContainer: {
    alignItems: 'center',
  },
  formatChip: {
    marginBottom: 4,
    minWidth: 60,
  },
  formatChipText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  disabledChip: {
    opacity: 0.3,
  },
  disabledChipText: {
    color: '#999',
  },
  quickSelection: {
    marginTop: 8,
  },
  quickLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  quickChip: {
    marginRight: 8,
    marginBottom: 8,
  },
  quickChipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default FileTypeSelector;


