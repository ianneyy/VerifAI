/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import {View, Text} from 'react-native';
import {ProgressBar, MD3Colors} from 'react-native-paper';
import React, {useState, useContext} from 'react';
import {ThemeContext} from '../../App';

export default function VerifyProgress({message, progress}) {
  const {theme} = useContext(ThemeContext);

  const accentColor = '#6C63FF';
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';

  const mutedTextColor = theme === 'light' ? '#737373' : '#a3a3a3';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#334155';
  return (
    <View style={{padding: 20, width: '100%'}}>
      <Text style={{fontSize: 12, color: mutedTextColor}}>
        Verification Progress
      </Text>

      <Text style={{fontSize: 16, marginBottom: 20}}>
        <Text style={{fontWeight: 'bold', fontSize: 24, color: textColor}}>
          {Math.round(progress * 100)}%
        </Text>{' '}
        <Text style={{color: textColor}}>Completed</Text>
      </Text>

      <ProgressBar
        progress={progress}
        color={MD3Colors.primary50}
        style={{flex: 1, height: 16, borderRadius: 50}}
      />
      <Text
        style={{
          marginTop: 10,
          color: mutedTextColor,
          fontSize: 12,
          marginLeft: 6,
        }}>
        {message}
      </Text>
    </View>
  );
}
