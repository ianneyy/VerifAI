/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

const Gauge = ({confidence, textColor}) => {
  const verificationLevels = {
  '100': {
    label: 'High Credibility',
    description:
      'This source matches trusted outlets in style, facts, and coverage. Adheres to all major credibility and transparency standards.',
  },
  '75-99': {
    label: 'Generally Credible',
    description:
      'Mostly credible and aligns with reliable sources, though some details or coverage may be incomplete.',
  },
  '60-74': {
    label: 'Credible with Exceptions',
    description:
      'Generally credible but with notable issues — such as writing inconsistencies, questionable sources, or contextual mismatches (e.g., personality or topic misalignment).',
  },
  '40-59': {
    label: 'Questionable',
    description:
      'Contains multiple questionable elements or factual inconsistencies that undermine reliability.',
  },
  '0-39': {
    label: 'Likely Fake',
    description:
      'Content is confirmed false, misleading, or shows severe disregard for credibility standards.',
  },
};


  const getVerificationLevel = (value) => {
    if (value === 100) {return verificationLevels['100'];}
    if (value >= 75) {return verificationLevels['75-99'];}
    if (value >= 60) {return verificationLevels['60-74'];}
    if (value >= 40) {return verificationLevels['40-59'];}
    return verificationLevels['0-39'];
  };

  const {description} = getVerificationLevel(confidence);

  return (
    <View style={{alignItems: 'center', marginTop: 50}}>
      <AnimatedCircularProgress
        size={250}
        width={25}
        fill={confidence}
        tintColor={
          confidence === 100
            ? '#4CD964' // Green - Very Legit
            : confidence >= 75
            ? '#a3e635' // Yellow - Suspicious
            : confidence >= 60
            ? '#FFCC00' // Orange - Likely Fake
            : confidence >= 40
            ? '#fb923c'
            : '#FF3B30' // Red - Fake
        }
        backgroundColor="#E0E0E0"
        rotation={0}
        duration={800}>
        {fill => {
          const color =
            fill === 100
              ? '#4CD964'
              : fill >= 75
              ? '#a3e635'
              : fill >= 60
              ? '#FFCC00'
              : fill >= 40
              ? '#fb923c'
              : '#FF3B30';

          const {label} = getVerificationLevel(fill);

          return (
            <Text
              style={{
                fontSize: 20,
                fontWeight: 'bold',
                textAlign: 'center',
                color,
              }}>
              {Math.round(fill)}%{'\n'}
              {label}
            </Text>
          );
        }}
      </AnimatedCircularProgress>
      <Text
        style={
          (
          {
            color: textColor,
            marginTop: 12,
            marginHorizontal: 20,
            textAlign: 'center',
            fontSize: 14,
          })
        }>
        {description}
      </Text>
    </View>
  );
};

export default Gauge;
