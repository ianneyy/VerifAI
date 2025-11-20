/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import { useState, createContext,useEffect } from 'react';

import UploadScreen from './src/components/ImagePickerExample';
import Home from './src/components/Home';
import AssistantScreen from './src/components/AssistantScreen';
// import AssistantScreen from './src/components/AssistantScreen';
import TextScreen from './src/components/TextScreen';
import ResultScreen from './src/screens/ResultScreen';
import TextResultScreen from './src/screens/TextResultScreen';
import History from './src/screens/History';
import UrlScreen from './src/screens/UrlScreen';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UrlResultScreen from './src/screens/UrlResultScreen';
import NoInternetScreen from './src/screens/NoInternetScreen';
import BootSplash from "react-native-bootsplash";

// const ResultScreen = () => null;
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
  useEffect(() => {
    const init = async () => {
      // Wait for React Native bridge to be fully initialized
      // This ensures the app is ready before hiding splash screen
      return new Promise((resolve) => {
        // Use requestAnimationFrame to ensure the UI is ready
        requestAnimationFrame(() => {
          // Add a small delay to ensure everything is initialized
          setTimeout(resolve, 100);
        });
      });
    };

    init()
      .then(async () => {
        await BootSplash.hide({ fade: true });
        console.log("BootSplash has been hidden successfully");
      })
      .catch((error) => {
        console.error("Error during initialization:", error);
        // Still try to hide splash even if there's an error
        BootSplash.hide({ fade: true }).catch(console.error);
      });
  }, []);
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Url" component={UrlScreen} />
          <Stack.Screen name="Assistant" component={AssistantScreen} />
          <Stack.Screen name="Upload" component={UploadScreen} />
          <Stack.Screen name="Text" component={TextScreen} />
          <Stack.Screen name="Gauge" component={ResultScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen name="TextResultScreen" component={TextResultScreen} />
          <Stack.Screen name="UrlResultScreen" component={UrlResultScreen} />
          <Stack.Screen name="NoInternetScreen" component={NoInternetScreen} />
          <Stack.Screen name="History" component={History} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}


export default App;
