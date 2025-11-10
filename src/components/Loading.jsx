  /* eslint-disable react-hooks/exhaustive-deps */
  import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
  import React, {useEffect, useState} from 'react';
  import { ProgressBar, MD3Colors } from 'react-native-paper';
  export default function Loading(accentColor, subtitleColor) {
    const messages = [
      'Understanding the statement...',
      'Extracting key entities and topics...',
      'Searching for related news articles...',
      'Analyzing retrieved sources...',
      'Comparing claim with article embeddings...',
      'Checking for factual similarities...',
      'Evaluating overall credibility...',
      'Calculating reliability score...',
      'Finalizing verification results...',
    ];
    const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentMessageIndex(prevIndex => {
          if (prevIndex < messages.length - 1) {
            return prevIndex + 1;
          } else {
            clearInterval(interval); // stop when last message is reached
            return prevIndex; // keep showing the final message
          }
        });
      }, 2000); // change message every 2 seconds

      return () => clearInterval(interval);
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