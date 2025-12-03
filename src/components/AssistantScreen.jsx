/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
'use client';
import {Button, Snackbar} from 'react-native-paper';
import React, {useState, useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Image,
} from 'react-native';
import EulaModal from './EulaModal';
import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
// Import the ThemeContext from App.tsx
import {ThemeContext} from '../../App';
import FloatingButtonModule from './FloatingButtonModule';
import InstructionModal from './InstructionModal';

import {NativeEventEmitter, NativeModules} from 'react-native';
const {FloatingButtonEventModule} = NativeModules;



const AssistantScreen = () => {
  // Initialize both states to false
  const [visible, setVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
const [eulaVisible, setEulaVisible] = useState(false);
  const navigation = useNavigation();
  const {theme} = useContext(ThemeContext);

  // Only initialize on first mount
  useEffect(() => {
    const initializeState = async () => {
      try {
        const isVisible = await FloatingButtonModule.isFloatingButtonVisible();
        console.log('Initial button state:', isVisible);
        if (!isVisible) {
          // Only hide if not already hidden
          await FloatingButtonModule.hideBubble();
        }
        // Set states to match current visibility
        setVisible(isVisible);
        setIsEnabled(isVisible);
      } catch (error) {
        console.error('Error initializing state:', error);
        setVisible(false);
        setIsEnabled(false);
      }
    };
    initializeState();
  }, []);


  // Check state when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const checkState = async () => {
        try {
          const isVisible =
            await FloatingButtonModule.isFloatingButtonVisible();
          console.log('Focus check - button state:', isVisible);
          // Always update states to match actual button visibility
          setVisible(isVisible);
          setIsEnabled(isVisible);
        } catch (error) {
          console.error('Error checking state on focus:', error);
        }
      };
      checkState();
    }, []),
  );
  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(FloatingButtonEventModule);

    const subscription = eventEmitter.addListener('onCancel', async () => {
      console.log('User canceled, hiding floating button');
      setIsEnabled(false);
      setVisible(false);
      await FloatingButtonModule.hideBubble();
    });

    return () => subscription.remove();
  }, []);

  const toggleSwitch = async () => {
    try {
     

      // // Perform the actual action before updating local state
      // if (newState) {
      //   await FloatingButtonModule.showBubble();
      // } else {
      //   await FloatingButtonModule.hideBubble();
      // }
         // user is turning ON — show EULA first
      if (!isEnabled) {
      // user is turning ON — show EULA first
      setEulaVisible(true);
      return;
    }
      await FloatingButtonModule.hideBubble();
      // Update local state after successful action
      setIsEnabled(!isEnabled);
      // setVisible(newState);

      // Show snackbar instead of alert
      setSnackbarMessage(
        !isEnabled ? 'VerifAI Assistant Enabled' : 'VerifAI Assistant Disabled',
      );
      setSnackbarVisible(true);
    } catch (error) {
      console.error('Error toggling floating button:', error);
      setSnackbarMessage('Error: Failed to toggle the floating button.');
      setSnackbarVisible(true);
    }
  };

  const handleAgree = async () => {
  setEulaVisible(false);

  try {
    await FloatingButtonModule.showBubble();
    setIsEnabled(true);
    setSnackbarMessage('VerifAI Assistant Enabled');
    setSnackbarVisible(true);
  } catch (error) {
    console.error('Error enabling assistant:', error);
  }
};

const handleCancel = () => {
  setEulaVisible(false);
};

  // Get the appropriate colors based on the theme
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
  const mutedTextColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#334155';
  const cardColor = theme === 'light' ? '#ffffff' : '#1e293b';
  const primaryColor = '#6C63FF'; // Navy blue - consistent with the app

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <View style={[styles.header, {borderBottomColor: 'transparent'}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          VerifAI Assistant
        </Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              'About VerifAI Assistant',
              'The VerifAI Assistant helps you verify information by providing real-time fact-checking suggestions and insights.',
              [{text: 'Got it'}],
            )
          }>
          <Icon name="help-circle" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={{alignItems: 'center', flex: 1, marginTop: 26}}>
        {/* <Icon name="cpu" size={64} color="#6C63FF" style={{marginBottom: 36}} /> */}
        {/* <ScanText color="#6C63FF" size={98} style={{marginBottom: 36}} /> */}
        <Image
          source={require('../assets/images/illustrations/assistant_1.png')}
          style={styles.image}
        />
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
          {/* <Switch
            trackColor={{
              false: theme === 'light' ? '#e2e8f0' : '#334155',
              true: '#93c5fd',
            }}
            thumbColor={
              isEnabled
                ? primaryColor
                : theme === 'light'
                ? '#ffffff'
                : '#94a3b8'
            }
            ios_backgroundColor={theme === 'light' ? '#e2e8f0' : '#334155'}
            onValueChange={toggleSwitch}
            value={isEnabled}
            style={styles.switch}
          /> */}
          {/* <Button title="Turn on" /> */}

          {/* <TouchableOpacity
            style={[
              styles.button,
              {
                width: '90%',
                alignItems: 'center',
                backgroundColor: isEnabled
                  ? primaryColor
                  : theme === 'light'
                  ? '#e2e8f0'
                  : '#334155',
              },
            ]}
            onPress={toggleSwitch}>
            <Text
              style={{
                color: isEnabled
                  ? '#fff'
                  : theme === 'light'
                  ? '#000'
                  : '#94a3b8',
                fontWeight: '600',
              }}>
              {isEnabled ? 'Turn Off' : 'Turn On'}
            </Text>
          </TouchableOpacity> */}
          <Button
            mode="contained"
            onPress={toggleSwitch}
            style={{
              width: '90%',
              alignSelf: 'center',
              backgroundColor: isEnabled
                ? primaryColor
                : theme === 'light'
                ? '#e2e8f0'
                : '#334155',
              borderRadius: 50, // optional for rounded corners
              paddingVertical: 3,
            }}
            labelStyle={{
              color: isEnabled
                ? '#fff'
                : theme === 'light'
                ? '#000'
                : '#94a3b8',
              fontWeight: '600',
            }}>
            {isEnabled ? 'Turn Off' : 'Turn On'}
          </Button>
          {/* Snackbar */}

          {/* <Text style={[styles.statusText, {color: textColor}]}>
            VerifAI Assistant is {isEnabled ? 'on' : 'off'}
          </Text> */}
        </View>
      </View>
      <View style={{position: 'absolute', bottom: 0, width: '100%'}}>
        <Snackbar
          visible={snackbarVisible}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: 'Close',
            onPress: () => setSnackbarVisible(false),
          }}>
          {snackbarMessage}
        </Snackbar>
      </View>
      <EulaModal
  visible={eulaVisible}
  onAgree={handleAgree}
  onCancel={handleCancel}
  theme={theme}
/>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {width: 200, height: 200, resizeMode: 'contain'},

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  switch: {
    transform: [{scaleX: 1.5}, {scaleY: 1.5}],
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 100,
    width: '90%',
    borderRadius: 50,
  },
});

export default AssistantScreen;
