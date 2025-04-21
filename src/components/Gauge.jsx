/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text } from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';

const Gauge = ({ confidence }) => {
  return (
    <View style={{ alignItems: 'center', marginTop: 50 }}>
      <AnimatedCircularProgress
        size={200}
        width={15}
        fill={confidence} // your AI confidence % (0–100)
        tintColor={
          confidence > 90 ? '#4CD964' : // Green - Very Legit
          confidence > 70 ? '#FFCC00' : // Yellow - Suspicious
          confidence > 40 ? '#FF9500' : // Orange - Likely Fake
                            '#FF3B30'   // Red - Fake
        }
        backgroundColor="#E0E0E0"
        rotation={0}
        duration={800}
      >
        {(fill) => {
          const color =
            fill >= 100  ? '#4CD964' :
            fill >= 70 ? '#FFCC00' :
            fill >= 50 ? '#FF9500' :
            fill >= 25 ? '#FF3B30' :
                '#8E8E93';

          const label =
            fill >= 100 ? 'Real' :
            fill >= 70 ? 'Likely Real' :
            fill >= 50 ? 'Suspicious' :
             fill >= 25 ? 'Likely False' :
             'Fake';

          return (
            <Text style={{ fontSize: 20, fontWeight: 'bold', textAlign: 'center', color }}>
              {Math.round(fill)}%{'\n'}
              {label}
            </Text>
          );
        }}
      </AnimatedCircularProgress>
    </View>
  );
};

export default Gauge;
