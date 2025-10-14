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
 * Audio Editor Component
 * Provides editing tools for audio files
 */
const AudioEditor = ({ file, mode, onApply }) => {
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
      <Title>Trim Audio</Title>
      <Surface style={styles.paramSurface}>
        <Text>Start Time: {editParams.startTime || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={300}
          value={editParams.startTime || 0}
          onValueChange={(value) => handleParamChange('startTime', value)}
        />
        
        <Text>End Time: {editParams.endTime || 60}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={300}
          value={editParams.endTime || 60}
          onValueChange={(value) => handleParamChange('endTime', value)}
        />
        
        <Text>Duration: {(editParams.endTime || 60) - (editParams.startTime || 0)}s</Text>
      </Surface>
    </View>
  );

  /**
   * Render merge editor
   */
  const renderMergeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Merge Audio Files</Title>
      <Surface style={styles.paramSurface}>
        <Text>Crossfade Duration: {editParams.crossfade || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={5}
          value={editParams.crossfade || 0}
          onValueChange={(value) => handleParamChange('crossfade', value)}
        />
        
        <Text>Gap Between Files: {editParams.gap || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={editParams.gap || 0}
          onValueChange={(value) => handleParamChange('gap', value)}
        />
        
        <Text>Normalize Volume</Text>
        <SegmentedButtons
          value={editParams.normalize ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('normalize', value === 'true')}
          buttons={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render fade editor
   */
  const renderFadeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Fade In/Out</Title>
      <Surface style={styles.paramSurface}>
        <Text>Fade In Duration: {editParams.fadeIn || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={editParams.fadeIn || 0}
          onValueChange={(value) => handleParamChange('fadeIn', value)}
        />
        
        <Text>Fade Out Duration: {editParams.fadeOut || 0}s</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={10}
          value={editParams.fadeOut || 0}
          onValueChange={(value) => handleParamChange('fadeOut', value)}
        />
        
        <Text>Fade Type</Text>
        <SegmentedButtons
          value={editParams.fadeType || 'linear'}
          onValueChange={(value) => handleParamChange('fadeType', value)}
          buttons={[
            { value: 'linear', label: 'Linear' },
            { value: 'exponential', label: 'Exponential' },
            { value: 'logarithmic', label: 'Logarithmic' },
          ]}
        />
      </Surface>
    </View>
  );

  /**
   * Render volume editor
   */
  const renderVolumeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Adjust Volume</Title>
      <Surface style={styles.paramSurface}>
        <Text>Volume: {editParams.volume || 100}%</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={200}
          value={editParams.volume || 100}
          onValueChange={(value) => handleParamChange('volume', value)}
        />
        
        <Text>Volume Change Type</Text>
        <SegmentedButtons
          value={editParams.volumeType || 'multiply'}
          onValueChange={(value) => handleParamChange('volumeType', value)}
          buttons={[
            { value: 'multiply', label: 'Multiply' },
            { value: 'add', label: 'Add' },
            { value: 'set', label: 'Set' },
          ]}
        />
        
        <Text>Quick Presets</Text>
        <View style={styles.quickButtons}>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('volume', 50)}
            style={styles.quickButton}
          >
            Quiet (50%)
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('volume', 100)}
            style={styles.quickButton}
          >
            Normal (100%)
          </Button>
          <Button
            mode="outlined"
            onPress={() => handleParamChange('volume', 150)}
            style={styles.quickButton}
          >
            Loud (150%)
          </Button>
        </View>
      </Surface>
    </View>
  );

  /**
   * Render normalize editor
   */
  const renderNormalizeEditor = () => (
    <View style={styles.editorContainer}>
      <Title>Normalize Audio</Title>
      <Surface style={styles.paramSurface}>
        <Text>Target Level: {editParams.targetLevel || -3}dB</Text>
        <Slider
          style={styles.slider}
          minimumValue={-20}
          maximumValue={0}
          value={editParams.targetLevel || -3}
          onValueChange={(value) => handleParamChange('targetLevel', value)}
        />
        
        <Text>Normalization Type</Text>
        <SegmentedButtons
          value={editParams.normalizeType || 'peak'}
          onValueChange={(value) => handleParamChange('normalizeType', value)}
          buttons={[
            { value: 'peak', label: 'Peak' },
            { value: 'rms', label: 'RMS' },
            { value: 'lufs', label: 'LUFS' },
          ]}
        />
        
        <Text>Prevent Clipping</Text>
        <SegmentedButtons
          value={editParams.preventClipping ? 'true' : 'false'}
          onValueChange={(value) => handleParamChange('preventClipping', value === 'true')}
          buttons={[
            { value: 'true', label: 'Yes' },
            { value: 'false', label: 'No' },
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
      case 'merge':
        return renderMergeEditor();
      case 'fade':
        return renderFadeEditor();
      case 'volume':
        return renderVolumeEditor();
      case 'normalize':
        return renderNormalizeEditor();
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

export default AudioEditor;


