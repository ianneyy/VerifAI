/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import { useState, createContext } from 'react';
import {
  ScrollView,
  View,
  Text,
} from 'react-native';
import UploadScreen from './src/components/ImagePickerExample';
import FloatingButton from './src/components/FloatingButton';
import Home from './src/components/Home';
import SettingScreen from './src/components/SettingScreen';
import AssistantScreen from './src/components/AssistantScreen';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


const UrlScreen = () => null;
const TextScreen = () => null;
const HistoryScreen = () => null;
const ResultScreen = () => null;
export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
});
export const ThemeProvider = ({ children }) => {
  const deviceTheme = useColorScheme();
  const [theme, setTheme] = useState(deviceTheme || 'light');

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};
const Stack = createNativeStackNavigator();

function App() {

  return (
    <ThemeProvider>
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Url" component={UrlScreen} />
        <Stack.Screen name="Assistant" component={AssistantScreen} />
        <Stack.Screen name="Upload" component={UploadScreen} />
        <Stack.Screen name="Text" component={TextScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Result" component={ResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
}


export default App;
