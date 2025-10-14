import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
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

/**
 * Video Editor Component
 * Provides editing tools for video files
 */
const VideoEditor = ({ file, mode, onApply }) => {
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
   * Render trim editor
   */
  const renderTrimEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Trim Video</Title>
      <Surface style={styles.paramSurface}>
        <Text>Start Time: {editParams.startTime || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={600}
          value={editParams.startTime || 0}
          onValueChange={(value) => handleParamChange('startTime', value)}
        />
        
        <Text>End Time: {editParams.endTime || 60}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={600}
          value={editParams.endTime || 60}
          onValueChange={(value) => handleParamChange('endTime', value)}
        />
        
        <Text>Duration: {(editParams.endTime || 60) - (editParams.startTime || 0)}s</Text>
        
        <Text>Trim Mode</Text>
        <SegmentedButtons
          value={editParams.trimMode || 'time'}
          onValueChange={(value) => handleParamChange('trimMode', value)}
          buttons={[
            { value: 'time', label: 'Time' },
            { value: 'frames', label: 'Frames' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render crop editor
   */
  const renderCropEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Crop Video</Title>
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
        
        <Text>Quick Presets</Text>
        <View style={styles.quickButtons}>
          <Button
            mode="outlined"
            onPress={() => {
              handleParamChange('cropX', 0);
              handleParamChange('cropY', 0);
              handleParamChange('cropWidth', 50);
              handleParamChange('cropHeight', 50);
            }}
            style={styles.quickButton}
          >
            Top Left
          </Button>
          <Button
            mode="outlined"
            onPress={() => {
              handleParamChange('cropX', 50);
              handleParamChange('cropY', 0);
              handleParamChange('cropWidth', 50);
              handleParamChange('cropHeight', 50);
            }}
            style={styles.quickButton}
          >
            Top Right
          </Button>
        </View>
      </Surface>
    </View>
  );

  /**
   * Render merge editor
   */
  const renderMergeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Merge Video Clips</Title>
      <Surface style={styles.paramSurface}>
        <Text>Transition Duration: {editParams.transitionDuration || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5}
          value={editParams.transitionDuration || 0}
          onValueChange={(value) => handleParamChange('transitionDuration', value)}
        />
        
        <Text>Transition Type</Text>
        <SegmentedButtons
          value={editParams.transitionType || 'cut'}
          onValueChange={(value) => handleParamChange('transitionType', value)}
          buttons={[
            { value: 'cut', label: 'Cut' },
            { value: 'fade', label: 'Fade' },
            { value: 'dissolve', label: 'Dissolve' },
            { value: 'wipe', label: 'Wipe' },
          ]}
        />
        
        <Text>Audio Mixing</Text>
        <SegmentedButtons
          value={editParams.audioMixing || 'replace'}
          onValueChange={(value) => handleParamChange('audioMixing', value)}
          buttons={[
            { value: 'replace', label: 'Replace' },
            { value: 'mix', label: 'Mix' },
            { value: 'mute', label: 'Mute' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render subtitles editor
   */
  const renderSubtitlesEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Subtitles</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Subtitle Text"
          value={editParams.subtitleText || ''}
          onChangeText={(value) => handleParamChange('subtitleText', value)}
          style={styles.textInput}
          multiline
        />
        
        <Text>Start Time: {editParams.subtitleStart || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={600}
          value={editParams.subtitleStart || 0}
          onValueChange={(value) => handleParamChange('subtitleStart', value)}
        />
        
        <Text>Duration: {editParams.subtitleDuration || 3}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          value={editParams.subtitleDuration || 3}
          onValueChange={(value) => handleParamChange('subtitleDuration', value)}
        />
        
        <Text>Font Size: {editParams.subtitleFontSize || 24}</Text>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={48}
          value={editParams.subtitleFontSize || 24}
          onValueChange={(value) => handleParamChange('subtitleFontSize', value)}
        />
        
        <Text>Position</Text>
        <SegmentedButtons
          value={editParams.subtitlePosition || 'bottom'}
          onValueChange={(value) => handleParamChange('subtitlePosition', value)}
          buttons={[
            { value: 'top', label: 'Top' },
            { value: 'center', label: 'Center' },
            { value: 'bottom', label: 'Bottom' },
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
        
        <Text>Animation</Text>
        <SegmentedButtons
          value={editParams.watermarkAnimation || 'none'}
          onValueChange={(value) => handleParamChange('watermarkAnimation', value)}
          buttons={[
            { value: 'none', label: 'None' },
            { value: 'fade', label: 'Fade' },
            { value: 'slide', label: 'Slide' },
            { value: 'pulse', label: 'Pulse' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render text overlay editor
   */
  const renderTextEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Add Text Overlay</Title>
      <Surface style={styles.paramSurface}>
        <TextInput
          label="Text Content"
          value={editParams.textContent || ''}
          onChangeText={(value) => handleParamChange('textContent', value)}
          style={styles.textInput}
          multiline
        />
        
        <Text>Start Time: {editParams.textStart || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={600}
          value={editParams.textStart || 0}
          onValueChange={(value) => handleParamChange('textStart', value)}
        />
        
        <Text>Duration: {editParams.textDuration || 5}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={30}
          value={editParams.textDuration || 5}
          onValueChange={(value) => handleParamChange('textDuration', value)}
        />
        
        <Text>Font Size: {editParams.textFontSize || 32}</Text>
        <Slider
          style={styles.slider}
          minimumValue={12}
          maximumValue={72}
          value={editParams.textFontSize || 32}
          onValueChange={(value) => handleParamChange('textFontSize', value)}
        />
        
        <Text>Text Color</Text>
        <SegmentedButtons
          value={editParams.textColor || 'white'}
          onValueChange={(value) => handleParamChange('textColor', value)}
          buttons={[
            { value: 'white', label: 'White' },
            { value: 'black', label: 'Black' },
            { value: 'red', label: 'Red' },
            { value: 'blue', label: 'Blue' },
            { value: 'yellow', label: 'Yellow' },
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
      case 'trim':
        return renderTrimEditor();
      case 'crop':
        return renderCropEditor();
      case 'merge':
        return renderMergeEditor();
      case 'subtitles':
        return renderSubtitlesEditor();
      case 'watermark':
        return renderWatermarkEditor();
      case 'text':
        return renderTextEditor();
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

export default VideoEditor;


