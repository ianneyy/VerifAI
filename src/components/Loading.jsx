import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';
import React from 'react';

export default function Loading(accentColor, subtitleColor) {
  return (
    <View style={styles.loadingSectionContainer}>
      <ActivityIndicator size="large" color={accentColor} />
      <Text style={[styles.loadingSectionText, {color: subtitleColor}]}>
        Verifying...
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