import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import ConvertScreen from './src/screens/ConvertScreen';
import CompressScreen from './src/screens/CompressScreen';
import EditScreen from './src/screens/EditScreen';
import CompileScreen from './src/screens/CompileScreen';
import HistoryScreen from './src/screens/HistoryScreen';

// Import theme
import { lightTheme, darkTheme } from './src/theme/theme';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={theme}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName;

              if (route.name === 'Convert') {
                iconName = focused ? 'swap-horizontal' : 'swap-horizontal-outline';
              } else if (route.name === 'Compress') {
                iconName = focused ? 'compress' : 'compress-outline';
              } else if (route.name === 'Edit') {
                iconName = focused ? 'create' : 'create-outline';
              } else if (route.name === 'Compile') {
                iconName = focused ? 'layers' : 'layers-outline';
              } else if (route.name === 'History') {
                iconName = focused ? 'time' : 'time-outline';
              }

              return <Ionicons name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
            tabBarStyle: {
              backgroundColor: theme.colors.surface,
              borderTopColor: theme.colors.outline,
            },
            headerStyle: {
              backgroundColor: theme.colors.surface,
            },
            headerTintColor: theme.colors.onSurface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          })}
        >
          <Tab.Screen 
            name="Convert" 
            component={ConvertScreen}
            options={{ title: 'Convert Files' }}
          />
          <Tab.Screen 
            name="Compress" 
            component={CompressScreen}
            options={{ title: 'Compress Files' }}
          />
          <Tab.Screen 
            name="Edit" 
            component={EditScreen}
            options={{ title: 'Edit Files' }}
          />
          <Tab.Screen 
            name="Compile" 
            component={CompileScreen}
            options={{ title: 'Compile Files' }}
          />
          <Tab.Screen 
            name="History" 
            component={HistoryScreen}
            options={{ title: 'History' }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
