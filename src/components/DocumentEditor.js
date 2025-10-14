import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  SegmentedButtons,
  Surface,
  Card,
  Title,
  Divider,
} from 'react-native-paper';

/**
 * Document Editor Component
 * Provides editing tools for document files
 */
const DocumentEditor = ({ file, mode, onApply }) => {
  const [editParams, setEditParams] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

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
   * Render text editor
   */
  const renderTextEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Edit Text Content</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Document Content"
          value={editParams.content || ''}
          onChangeText={(value) => handleParamChange('content', value)}
          style={styles.textInput}
          multiline
          numberOfLines={10}
        />
        
        <Text>Text Formatting</Text>
        <View style={styles.formattingRow}>
          <Button
            mode={editParams.bold ? 'contained' : 'outlined'}
            onPress={() => handleParamChange('bold', !editParams.bold)}
            style={styles.formatButton}
          >
            Bold
          </Button>
          <Button
            mode={editParams.italic ? 'contained' : 'outlined'}
            onPress={() => handleParamChange('italic', !editParams.italic)}
            style={styles.formatButton}
          >
            Italic
          </Button>
          <Button
            mode={editParams.underline ? 'contained' : 'outlined'}
            onPress={() => handleParamChange('underline', !editParams.underline)}
            style={styles.formatButton}
          >
            Underline
          </Button>
        </View>
        
        <Text>Font Size</Text>
        <SegmentedButtons
          value={editParams.fontSize || 'medium'}
          onValueChange={(value) => handleParamChange('fontSize', value)}
          buttons={[
            { value: 'small', label: 'Small' },
            { value: 'medium', label: 'Medium' },
            { value: 'large', label: 'Large' },
          ]}
        />
        
        <Text>Alignment</Text>
        <SegmentedButtons
          value={editParams.alignment || 'left'}
          onValueChange={(value) => handleParamChange('alignment', value)}
          buttons={[
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
            { value: 'justify', label: 'Justify' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render format editor
   */
  const renderFormatEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Format Document</Title>
      <Surface style={styles.paramSurface}>
        <Text>Document Style</Text>
        <SegmentedButtons
          value={editParams.documentStyle || 'normal'}
          onValueChange={(value) => handleParamChange('documentStyle', value)}
          buttons={[
            { value: 'normal', label: 'Normal' },
            { value: 'formal', label: 'Formal' },
            { value: 'casual', label: 'Casual' },
            { value: 'academic', label: 'Academic' },
          ]}
        />
        
        <Text>Line Spacing</Text>
        <SegmentedButtons
          value={editParams.lineSpacing || 'single'}
          onValueChange={(value) => handleParamChange('lineSpacing', value)}
          buttons={[
            { value: 'single', label: 'Single' },
            { value: '1.5', label: '1.5x' },
            { value: 'double', label: 'Double' },
          ]}
        />
        
        <Text>Margins</Text>
        <SegmentedButtons
          value={editParams.margins || 'normal'}
          onValueChange={(value) => handleParamChange('margins', value)}
          buttons={[
            { value: 'narrow', label: 'Narrow' },
            { value: 'normal', label: 'Normal' },
            { value: 'wide', label: 'Wide' },
          ]}
        />
        
        <Text>Page Orientation</Text>
        <SegmentedButtons
          value={editParams.orientation || 'portrait'}
          onValueChange={(value) => handleParamChange('orientation', value)}
          buttons={[
            { value: 'portrait', label: 'Portrait' },
            { value: 'landscape', label: 'Landscape' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render merge editor
   */
  const renderMergeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Merge Documents</Title>
      <Surface style={styles.paramSurface}>
        <Text>Merge Order</Text>
        <SegmentedButtons
          value={editParams.mergeOrder || 'append'}
          onValueChange={(value) => handleParamChange('mergeOrder', value)}
          buttons={[
            { value: 'append', label: 'Append' },
            { value: 'prepend', label: 'Prepend' },
            { value: 'insert', label: 'Insert' },
          ]}
        />
        
        <Text>Page Breaks</Text>
        <SegmentedButtons
          value={editParams.pageBreaks ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('pageBreaks', value === 'true')}
          buttons={[
            { value: 'true', label: 'Add Breaks' },
            { value: 'false', label: 'No Breaks' },
          ]}
        />
        
        <Text>Table of Contents</Text>
        <SegmentedButtons
          value={editParams.tableOfContents ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('tableOfContents', value === 'true')}
          buttons={[
            { value: 'true', label: 'Generate' },
            { value: 'false', label: 'Skip' },
          ]}
        />
        
        <Text>Header/Footer</Text>
        <SegmentedButtons
          value={editParams.headersFooters || 'none'}
          onValueChange={(value) => handleParamChange('headersFooters', value)}
          buttons={[
            { value: 'none', label: 'None' },
            { value: 'page-numbers', label: 'Page Numbers' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render split editor
   */
  const renderSplitEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Split Document</Title>
      <Surface style={styles.paramSurface}>
        <Text>Split Method</Text>
        <SegmentedButtons
          value={editParams.splitMethod || 'pages'}
          onValueChange={(value) => handleParamChange('splitMethod', value)}
          buttons={[
            { value: 'pages', label: 'By Pages' },
            { value: 'sections', label: 'By Sections' },
            { value: 'size', label: 'By Size' },
          ]}
        />
        
        {editParams.splitMethod === 'pages' && (
          <>
            <Text>Pages per Document: {editParams.pagesPerDoc || 10}</Text>
            <TextInput
              label="Pages per Document"
              value={editParams.pagesPerDoc?.toString() || '10'}
              onChangeText={(value) => handleParamChange('pagesPerDoc', parseInt(value) || 10)}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </>
        )}
        
        {editParams.splitMethod === 'size' && (
          <>
            <Text>Max Size per Document: {editParams.maxSize || 5}MB</Text>
            <TextInput
              label="Max Size (MB)"
              value={editParams.maxSize?.toString() || '5'}
              onChangeText={(value) => handleParamChange('maxSize', parseInt(value) || 5)}
              keyboardType="numeric"
              style={styles.numberInput}
            />
          </>
        )}
        
        <Text>File Naming</Text>
        <SegmentedButtons
          value={editParams.fileNaming || 'numbered'}
          onValueChange={(value) => handleParamChange('fileNaming', value)}
          buttons={[
            { value: 'numbered', label: 'Numbered' },
            { value: 'original', label: 'Original + Number' },
            { value: 'custom', label: 'Custom' },
          ]}
        />
        
        {editParams.fileNaming === 'custom' && (
          <TextInput
            label="Custom Name Pattern"
            value={editParams.customName || ''}
            onChangeText={(value) => handleParamChange('customName', value)}
            style={styles.textInput}
            placeholder="e.g., Document_Part_{n}"
          />
        )}
      </Surface>
    </View>
  );

  /**
   * Render annotate editor
   */
  const renderAnnotateEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Annotations</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Annotation Text"
          value={editParams.annotationText || ''}
          onChangeText={(value) => handleParamChange('annotationText', value)}
          style={styles.textInput}
          multiline
        />
        
        <Text>Annotation Type</Text>
        <SegmentedButtons
          value={editParams.annotationType || 'note'}
          onValueChange={(value) => handleParamChange('annotationType', value)}
          buttons={[
            { value: 'note', label: 'Note' },
            { value: 'highlight', label: 'Highlight' },
            { value: 'comment', label: 'Comment' },
            { value: 'stamp', label: 'Stamp' },
          ]}
        />
        
        <Text>Position</Text>
        <SegmentedButtons
          value={editParams.annotationPosition || 'top-right'}
          onValueChange={(value) => handleParamChange('annotationPosition', value)}
          buttons={[
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
            { value: 'center', label: 'Center' },
          ]}
        />
        
        <Text>Color</Text>
        <SegmentedButtons
          value={editParams.annotationColor || 'yellow'}
          onValueChange={(value) => handleParamChange('annotationColor', value)}
          buttons={[
            { value: 'yellow', label: 'Yellow' },
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'green', label: 'Green' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render watermark editor
   */
  const renderWatermarkEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Watermark</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Watermark Text"
          value={editParams.watermarkText || ''}
          onChangeText={(value) => handleParamChange('watermarkText', value)}
          style={styles.textInput}
        />
        
        <Text>Opacity: {editParams.watermarkOpacity || 30}%</Text>
        <SegmentedButtons
          value={editParams.watermarkOpacity?.toString() || '30'}
          onValueChange={(value) => handleParamChange('watermarkOpacity', parseInt(value))}
          buttons={[
            { value: '10', label: '10%' },
            { value: '30', label: '30%' },
            { value: '50', label: '50%' },
            { value: '70', label: '70%' },
          ]}
        />
        
        <Text>Position</Text>
        <SegmentedButtons
          value={editParams.watermarkPosition || 'center'}
          onValueChange={(value) => handleParamChange('watermarkPosition', value)}
          buttons={[
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'center', label: 'Center' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
          ]}
        />
        
        <Text>Rotation</Text>
        <SegmentedButtons
          value={editParams.watermarkRotation || '0'}
          onValueChange={(value) => handleParamChange('watermarkRotation', parseInt(value))}
          buttons={[
            { value: '0', label: '0°' },
            { value: '45', label: '45°' },
            { value: '90', label: '90°' },
            { value: '135', label: '135°' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render find and replace editor
   */
  const renderFindReplaceEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Find and Replace</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Find Text"
          value={editParams.findText || ''}
          onChangeText={(value) => handleParamChange('findText', value)}
          style={styles.textInput}
        />
        
        <TextInput
          label="Replace With"
          value={editParams.replaceText || ''}
          onChangeText={(value) => handleParamChange('replaceText', value)}
          style={styles.textInput}
        />
        
        <Text>Replace Options</Text>
        <SegmentedButtons
          value={editParams.replaceAll ? 'all' : 'first'}
          onValueChange={(value) => handleParamChange('replaceAll', value === 'all')}
          buttons={[
            { value: 'first', label: 'First Only' },
            { value: 'all', label: 'All' },
          ]}
        />
        
        <Text>Case Sensitive</Text>
        <SegmentedButtons
          value={editParams.caseSensitive ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('caseSensitive', value === 'true')}
          buttons={[
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' },
          ]}
        />
        
        <Text>Whole Words Only</Text>
        <SegmentedButtons
          value={editParams.wholeWords ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('wholeWords', value === 'true')}
          buttons={[
            { value: 'false', label: 'No' },
            { value: 'true', label: 'Yes' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render editor based on mode
   */
  const renderEditor = () => {
    switch (mode) {
      case 'text':
        return renderTextEditor();
      case 'format':
        return renderFormatEditor();
      case 'merge':
        return renderMergeEditor();
      case 'split':
        return renderSplitEditor();
      case 'annotate':
        return renderAnnotateEditor();
      case 'watermark':
        return renderWatermarkEditor();
      case 'find_replace':
        return renderFindReplaceEditor();
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
  numberInput: {
    marginBottom: 16,
  },
  formattingRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  formatButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  applyButton: {
    marginTop: 16,
  },
});

export default DocumentEditor;


