/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';

const TextGauge = ({confidence, recognizedText}) => {
  const verificationLevels = {
    '75-100': {
      label: 'Real',
      description:
        'Writing style is credible and multiple trustworthy related news sources support the claim.',
    },
    '60-74': {
      label: 'Likely Real',
      description:
        'MWriting appears credible and the claim is supported by one or more moderately reliable news sources.',
    },
    '40-59': {
      label: 'Suspicious',
      description:
        'Writing may be credible, but little to no supporting news exists—or the related news lacks reliability.',
    },
    '20-39': {
      label: 'Likely False',
      description:
        'Writing style may not appear fake, but there are no credible related news sources backing the claim.',
    },
    '0-19': {
      label: 'Fake',
      description:
        'Both writing style and related news sources fail to support the claim. Content is likely fabricated.',
    },
  };
  const getVerificationLevel = value => {
    if (value >= 80) {
      return verificationLevels['75-100'];
    }
    if (value >= 60) {
      return verificationLevels['60-74'];
    }
    if (value >= 40) {
      return verificationLevels['40-59'];
    }
    if (value >= 20) {
      return verificationLevels['20-39'];
    }
    return verificationLevels['0-19'];
  };
  const {description} = getVerificationLevel(confidence);

  return (
    <View style={{alignItems: 'center', marginTop: 50}}>
      <AnimatedCircularProgress
        size={200}
        width={15}
        fill={confidence} // your AI confidence % (0–100)
        tintColor={
          confidence >= 75
            ? '#4CD964' // Green - Very Legit
            : confidence >= 50
            ? '#FFCC00' // Yellow - Suspicious
            : '#FF3B30' // Red - Fake
        }
        backgroundColor="#E0E0E0"
        rotation={0}
        duration={800}>
        {fill => {
          const color =
            fill >= 75 ? '#4CD964' : fill >= 50 ? '#FFCC00' : '#FF3B30';

          const label =
            fill >= 75 ? 'Real' : fill >= 50 ? 'Suspicious' : 'Fake';

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
      <Text style={[styles.descriptionText, {color: recognizedText}]}>
        {description}
      </Text>
    </View>
  );
};

export default TextGauge;

const styles = StyleSheet.create({
  descriptionText: {
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 20,
    color: '#666',
    marginTop: 12,
  },
});
