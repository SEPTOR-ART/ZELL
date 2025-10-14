import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

// Custom color palette for ZELL
const zellColors = {
  primary: '#2196F3',
  primaryContainer: '#BBDEFB',
  secondary: '#FF9800',
  secondaryContainer: '#FFE0B2',
  tertiary: '#4CAF50',
  tertiaryContainer: '#C8E6C9',
  surface: '#FFFFFF',
  surfaceVariant: '#F5F5F5',
  background: '#FAFAFA',
  error: '#F44336',
  errorContainer: '#FFCDD2',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#1976D2',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#F57C00',
  onTertiary: '#FFFFFF',
  onTertiaryContainer: '#388E3C',
  onSurface: '#212121',
  onSurfaceVariant: '#757575',
  onBackground: '#212121',
  onError: '#FFFFFF',
  onErrorContainer: '#D32F2F',
  outline: '#E0E0E0',
  outlineVariant: '#F0F0F0',
  shadow: '#000000',
  scrim: '#000000',
  inverseSurface: '#2F2F2F',
  inverseOnSurface: '#FFFFFF',
  inversePrimary: '#90CAF9',
  elevation: {
    level0: 'transparent',
    level1: '#FFFFFF',
    level2: '#FFFFFF',
    level3: '#FFFFFF',
    level4: '#FFFFFF',
    level5: '#FFFFFF',
  },
};

// Light theme
export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    ...zellColors,
  },
  roundness: 12,
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#90CAF9',
    primaryContainer: '#1976D2',
    secondary: '#FFB74D',
    secondaryContainer: '#F57C00',
    tertiary: '#81C784',
    tertiaryContainer: '#388E3C',
    surface: '#121212',
    surfaceVariant: '#1E1E1E',
    background: '#0D0D0D',
    error: '#F44336',
    errorContainer: '#D32F2F',
    onPrimary: '#000000',
    onPrimaryContainer: '#FFFFFF',
    onSecondary: '#000000',
    onSecondaryContainer: '#FFFFFF',
    onTertiary: '#000000',
    onTertiaryContainer: '#FFFFFF',
    onSurface: '#FFFFFF',
    onSurfaceVariant: '#B0B0B0',
    onBackground: '#FFFFFF',
    onError: '#FFFFFF',
    onErrorContainer: '#FFFFFF',
    outline: '#3A3A3A',
    outlineVariant: '#2A2A2A',
    shadow: '#000000',
    scrim: '#000000',
    inverseSurface: '#E0E0E0',
    inverseOnSurface: '#000000',
    inversePrimary: '#1976D2',
    elevation: {
      level0: 'transparent',
      level1: '#1E1E1E',
      level2: '#232323',
      level3: '#252525',
      level4: '#272727',
      level5: '#2C2C2C',
    },
  },
  roundness: 12,
};

// File type colors for UI
export const fileTypeColors = {
  document: '#2196F3',
  image: '#4CAF50',
  audio: '#FF9800',
  video: '#9C27B0',
  archive: '#607D8B',
  text: '#795548',
};

// Compression level colors
export const compressionColors = {
  low: '#4CAF50',
  medium: '#FF9800',
  high: '#F44336',
};


