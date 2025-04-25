/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

const Gauge = ({confidence, textColor}) => {
  const verificationLevels = {
    '75-100': {
      label: 'Real',
      description:
        'Matches trusted sources, writing style, and multiple articles.',
    },
    '60-74': {
      label: 'Likely Real',
      description:
        'Mostly credible but may lack full source or match coverage.',
    },
    '40-59': {
      label: 'Suspicious',
      description:
        'Some red flags in writing, source, or article consistency. May have contextual mismatches (e.g., celebrity or personality misalignment).',
    },
    '20-39': {
      label: 'Likely False',
      description: 'Content contains multiple elements that appear fabricated.',
    },
    '0-19': {
      label: 'Fake',
      description:
        'Content is confirmed to be false or deliberately misleading.',
    },
  };

  const getVerificationLevel = (value) => {
    if (value >= 80) {return verificationLevels['75-100'];}
    if (value >= 60) {return verificationLevels['60-74'];}
    if (value >= 40) {return verificationLevels['40-59'];}
    if (value >= 20) {return verificationLevels['20-39'];}
    return verificationLevels['0-19'];
  };

  const {description} = getVerificationLevel(confidence);

  return (
    <View style={{alignItems: 'center', marginTop: 50}}>
      <AnimatedCircularProgress
        size={200}
        width={15}
        fill={confidence}
        tintColor={
          confidence >= 75
            ? '#4CD964' // Green - Very Legit
            : confidence >= 60
            ? '#a3e635' // Yellow - Suspicious
            : confidence >= 40
            ? '#FFCC00' // Orange - Likely Fake
            : confidence >= 20
            ? '#fb923c'
            : '#FF3B30' // Red - Fake
        }
        backgroundColor="#E0E0E0"
        rotation={0}
        duration={800}>
        {fill => {
          const color =
            fill >= 75
              ? '#4CD964'
              : fill >= 60
              ? '#a3e635'
              : fill >= 40
              ? '#FFCC00'
              : fill >= 20
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
