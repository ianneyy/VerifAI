/* eslint-disable react/self-closing-comp */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable no-trailing-spaces */
'use client';

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

import Icon from 'react-native-vector-icons/Feather';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
// Import the ThemeContext from App.tsx
import {ThemeContext} from '../../App';
import FloatingButtonModule from './FloatingButtonModule';
import InstructionModal from './InstructionModal';


const AssistantScreen = () => {
  // Initialize both states to false
  const [visible, setVisible] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);
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

  const toggleSwitch = async () => {
    try {
      const newState = !isEnabled;

      // Perform the actual action before updating local state
      if (newState) {
        await FloatingButtonModule.showBubble();
      } else {
        await FloatingButtonModule.hideBubble();
      }

      // Update local state after successful action
      setIsEnabled(newState);
      setVisible(newState);

      // Show the alert after action is completed
      Alert.alert(
        newState ? 'Assistant Enabled' : 'Assistant Disabled',
        newState
          ? 'The VerifAI assistant will now help you fact-check content.'
          : 'You can re-enable the assistant at any time.',
        [{text: 'OK'}],
      );
    } catch (error) {
      console.error('Error toggling floating button:', error);
      Alert.alert(
        'Error',
        'Failed to toggle the floating button. Please try again.',
        [{text: 'OK'}],
      );
    }
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
      <View style={[styles.header, {borderBottomColor: borderColor}]}>
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
      <View style={{alignItems: 'center',  flex: 1, marginTop: 26}}>
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

          <TouchableOpacity
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
          </TouchableOpacity>
          {/* <Text style={[styles.statusText, {color: textColor}]}>
            VerifAI Assistant is {isEnabled ? 'on' : 'off'}
          </Text> */}
        </View>
      </View>
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
