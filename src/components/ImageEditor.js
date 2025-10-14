import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import {
  Text,
  Button,
  TextInput,
  Slider,
  SegmentedButtons,
  Surface,
  Card,
  Title,
} from 'react-native-paper';

const { width: screenWidth } = Dimensions.get('window');

/**
 * Image Editor Component
 * Provides editing tools for image files
 */
const ImageEditor = ({ file, mode, onApply }) => {
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
   * Render crop editor
   */
  const renderCropEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Crop Image</Title>
      <Surface style={styles.paramSurface}>
        <Text>X Position: {editParams.cropX || 0}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={editParams.cropX || 0}
          onValueChange={(value) => handleParamChange('cropX', value)}
        />
        
        <Text>Y Position: {editParams.cropY || 0}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={editParams.cropY || 0}
          onValueChange={(value) => handleParamChange('cropY', value)}
        />
        
        <Text>Width: {editParams.cropWidth || 100}</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          value={editParams.cropWidth || 100}
          onValueChange={(value) => handleParamChange('cropWidth', value)}
        />
        
        <Text>Height: {editParams.cropHeight || 100}</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          value={editParams.cropHeight || 100}
          onValueChange={(value) => handleParamChange('cropHeight', value)}
        />
      </Surface>
    </View>
  );

  /**
   * Render resize editor
   */
  const renderResizeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Resize Image</Title>
      <Surface style={styles.paramSurface}>
        <Text>Width: {editParams.width || 800}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={2000}
          value={editParams.width || 800}
          onValueChange={(value) => handleParamChange('width', value)}
        />
        
        <Text>Height: {editParams.height || 600}</Text>
        <Slider
          style={styles.slider}
          minimumValue={100}
          maximumValue={2000}
          value={editParams.height || 600}
          onValueChange={(value) => handleParamChange('height', value)}
        />
        
        <Text>Maintain Aspect Ratio</Text>
        <SegmentedButtons
          value={editParams.maintainAspect ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('maintainAspect', value === 'true')}
          buttons={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render rotate editor
   */
  const renderRotateEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Rotate Image</Title>
      <Surface style={styles.paramSurface}>
        <Text>Rotation Angle: {editParams.angle || 0}°</Text>
        <Slider
          style={styles.slider}
          minimumValue={-180}
          maximumValue={180}
          value={editParams.angle || 0}
          onValueChange={(value) => handleParamChange('angle', value)}
        />
        
        <Text>Quick Rotate</Text>
        <View style={styles.quickButtons}>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('angle', -90)}
            style={styles.quickButton}
          >
            -90°
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('angle', 90)}
            style={styles.quickButton}
          >
            +90°
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('angle', 180)}
            style={styles.quickButton}
          >
            180°
          </Button>
        </View>
      </Surface>
    </View>
  );

  /**
   * Render filters editor
   */
  const renderFiltersEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Apply Filters</Title>
      <Surface style={styles.paramSurface}>
        <Text>Brightness: {editParams.brightness || 0}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-100}
          maximumValue={100}
          value={editParams.brightness || 0}
          onValueChange={(value) => handleParamChange('brightness', value)}
        />
        
        <Text>Contrast: {editParams.contrast || 0}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-100}
          maximumValue={100}
          value={editParams.contrast || 0}
          onValueChange={(value) => handleParamChange('contrast', value)}
        />
        
        <Text>Saturation: {editParams.saturation || 0}</Text>
        <Slider
          style={styles.slider}
          minimumValue={-100}
          maximumValue={100}
          value={editParams.saturation || 0}
          onValueChange={(value) => handleParamChange('saturation', value)}
        />
        
        <Text>Filter Type</Text>
        <SegmentedButtons
          value={editParams.filterType || 'none'}
          onValueChange={(value) => handleParamChange('filterType', value)}
          buttons={[
            { value: 'none', label: 'None' },
            { value: 'grayscale', label: 'Grayscale' },
            { value: 'sepia', label: 'Sepia' },
            { value: 'blur', label: 'Blur' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render text editor
   */
  const renderTextEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Text</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Text Content"
          value={editParams.text || ''}
          onChangeText={(value) => handleParamChange('text', value)}
          style={styles.textInput}
        />
        
        <Text>Font Size: {editParams.fontSize || 24}</Text>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={72}
          value={editParams.fontSize || 24}
          onValueChange={(value) => handleParamChange('fontSize', value)}
        />
        
        <Text>X Position: {editParams.textX || 50}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={editParams.textX || 50}
          onValueChange={(value) => handleParamChange('textX', value)}
        />
        
        <Text>Y Position: {editParams.textY || 50}</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={100}
          value={editParams.textY || 50}
          onValueChange={(value) => handleParamChange('textY', value)}
        />
        
        <Text>Text Color</Text>
        <SegmentedButtons
          value={editParams.textColor || 'black'}
          onValueChange={(value) => handleParamChange('textColor', value)}
          buttons={[
            { value: 'black', label: 'Black' },
            { value: 'white', label: 'White' },
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
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
        
        <Text>Opacity: {editParams.watermarkOpacity || 50}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={10}
          maximumValue={100}
          value={editParams.watermarkOpacity || 50}
          onValueChange={(value) => handleParamChange('watermarkOpacity', value)}
        />
        
        <Text>Position</Text>
        <SegmentedButtons
          value={editParams.watermarkPosition || 'bottom-right'}
          onValueChange={(value) => handleParamChange('watermarkPosition', value)}
          buttons={[
            { value: 'top-left', label: 'Top Left' },
            { value: 'top-right', label: 'Top Right' },
            { value: 'bottom-left', label: 'Bottom Left' },
            { value: 'bottom-right', label: 'Bottom Right' },
            { value: 'center', label: 'Center' },
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
      case 'crop':
        return renderCropEditor();
      case 'resize':
        return renderResizeEditor();
      case 'rotate':
        return renderRotateEditor();
      case 'filters':
        return renderFiltersEditor();
      case 'text':
        return renderTextEditor();
      case 'watermark':
        return renderWatermarkEditor();
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
  slider: {
    marginVertical: 8,
  },
  textInput: {
    marginBottom: 16,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  quickButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  applyButton: {
    marginTop: 16,
  },
});

export default ImageEditor;


