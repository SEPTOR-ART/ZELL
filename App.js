import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import ConvertScreen from './src/screens/ConvertScreen';
import CompressScreen from './src/screens/CompressScreen';
import EditScreen from './src/screens/EditScreen';
import CompileScreen from './src/screens/CompileScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RibbonToolbar from './src/components/RibbonToolbar';

import { lightTheme, darkTheme } from './src/theme/theme';
import { supabase, isSupabaseEnabled } from './src/config/supabase';

const Tab = createBottomTabNavigator();

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? darkTheme : lightTheme;
  const [activeRibbon, setActiveRibbon] = useState('home');
  const [supabaseConnected, setSupabaseConnected] = useState(false);

  useEffect(() => {
    checkSupabaseConnection();
  }, []);

  const checkSupabaseConnection = async () => {
    if (isSupabaseEnabled()) {
      try {
        setSupabaseConnected(true);
        console.log('Supabase configured and ready');
      } catch (err) {
        console.log('Supabase not available, using local storage');
        setSupabaseConnected(false);
      }
    }
  };

  const handleRibbonAction = (actionId) => {
    console.log('Ribbon action:', actionId);
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.container}>
        <RibbonToolbar
          activeTab={activeRibbon}
          onTabChange={setActiveRibbon}
          onActionPress={handleRibbonAction}
        />
        <NavigationContainer theme={theme}>
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
                height: 60,
                paddingBottom: 8,
                paddingTop: 4,
              },
              headerStyle: {
                backgroundColor: theme.colors.surface,
                elevation: 0,
                shadowOpacity: 0,
              },
              headerTintColor: theme.colors.onSurface,
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 18,
              },
              tabBarLabelStyle: {
                fontSize: 12,
                fontWeight: '600',
              },
            })}
          >
            <Tab.Screen
              name="Convert"
              component={ConvertScreen}
              options={{
                title: 'Convert Files',
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="Compress"
              component={CompressScreen}
              options={{
                title: 'Compress Files',
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="Edit"
              component={EditScreen}
              options={{
                title: 'Edit Files',
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="Compile"
              component={CompileScreen}
              options={{
                title: 'Compile Files',
                headerShown: false,
              }}
            />
            <Tab.Screen
              name="History"
              component={HistoryScreen}
              options={{
                title: 'History',
                headerShown: false,
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
