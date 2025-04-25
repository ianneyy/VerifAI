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

const ClaimText = ({
  cleanText,
  textColor,
}) => {
  return (
    <View style={styles.textContainer}>
      <Text style={[styles.sectionTitle, {color: textColor}]}>
        {cleanText || 'No text extracted yet.'}
      </Text>
    </View>

  );
};
export default ClaimText;

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
