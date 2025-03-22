import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PermissionsAndroid  } from 'react-native';
import FloatingButtonModule from './FloatingButtonModule';

const FloatingButton = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    async function requestOverlayPermission() {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.SYSTEM_ALERT_WINDOW
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Overlay permission granted');
        } else {
          console.log('Overlay permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
      requestOverlayPermission();
  }, []);


  const toggleFloatingButton = () => {
    if (visible) {
      FloatingButtonModule.hideBubble();
    } else {
      FloatingButtonModule.showBubble();
    }
    setVisible(!visible);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={toggleFloatingButton}>
        <Text style={styles.buttonText}>
          {visible ? 'Hide Floating Button' : 'Show Floating Button'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007BFF',
    padding: 12,
    borderRadius: 25,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
  },
});

export default FloatingButton;
