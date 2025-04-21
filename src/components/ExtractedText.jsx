/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext} from 'react';

import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

const ExtractedText = ({
  cleanText,
  SourceName,
  textColor,
  recognizedTextColor,
}) => {
  return (
    <View style={styles.textContainer}>
      <Text style={[styles.sectionTitle, {color: textColor}]}>
        {cleanText || 'No text extracted yet.'}
      </Text>

      <Text
        style={[
          styles.recognizedText,
          {color: recognizedTextColor, fontStyle: 'italic'},
        ]}>
        Source: {SourceName || 'No Source Name.'}
      </Text>
    </View>
    
  );
};
export default ExtractedText;

const styles = StyleSheet.create({
  textContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
