/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import React, {useEffect, useState} from 'react';

export default function Loading(accentColor, subtitleColor) {
  const messages = [
    'Verifying...',
    'Analyzing the facts...',
    'Cross-checking sources...',
    'Looking for similar news...',
    'Detecting credibility...',
    'Double-checking context...',
    'Almost there...',
  ];
   const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
   useEffect(() => {
     const interval = setInterval(() => {
       setCurrentMessageIndex(prevIndex => (prevIndex + 1) % messages.length);
     }, 8000); // Change message every 2 seconds

     return () => clearInterval(interval); // Clean up on unmount
   }, []);
  return (
    <View style={styles.loadingSectionContainer}>
      <ActivityIndicator size="large" color={accentColor} />
      <Text style={[styles.loadingSectionText, {color: subtitleColor}]}>
        {messages[currentMessageIndex]}
      </Text>
    </View>
  );
};
const styles = StyleSheet.create({
  loadingSectionContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSectionText: {
    marginTop: 8,
    fontSize: 14,
  },
});