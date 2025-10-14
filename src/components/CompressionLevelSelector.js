import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, Card } from 'react-native-paper';

// Import theme colors
import { compressionColors } from '../theme/theme';

const CompressionLevelSelector = ({ value, onChange }) => {
  const compressionLevels = [
    {
      key: 'low',
      label: 'Low',
      description: 'High Quality',
      color: compressionColors.low,
    },
    {
      key: 'medium',
      label: 'Medium',
      description: 'Balanced',
      color: compressionColors.medium,
    },
    {
      key: 'high',
      label: 'High',
      description: 'Small Size',
      color: compressionColors.high,
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Compression Level:</Text>
      <View style={styles.chipContainer}>
        {compressionLevels.map((level) => (
          <Chip
            key={level.key}
            selected={value === level.key}
            onPress={() => onChange(level.key)}
            style={[
              styles.chip,
              value === level.key && { backgroundColor: level.color }
            ]}
            textStyle={[
              styles.chipText,
              value === level.key && { color: 'white' }
            ]}
          >
            {level.label}
          </Chip>
        ))}
      </View>
      <View style={styles.descriptionContainer}>
        {compressionLevels.map((level) => (
          <View key={level.key} style={styles.descriptionRow}>
            <View 
              style={[
                styles.colorIndicator, 
                { backgroundColor: level.color }
              ]} 
            />
            <Text style={styles.descriptionText}>
              {level.label}: {level.description}
            </Text>
          </View>
        ))}
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
  chipContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  chip: {
    marginRight: 8,
    minWidth: 80,
  },
  chipText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  descriptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  colorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#757575',
  },
});

export default CompressionLevelSelector;


