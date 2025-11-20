/* eslint-disable react-native/no-inline-styles */
import {View, Text, Image, StyleSheet} from 'react-native';
import React, {useContext} from 'react';
import {Button} from 'react-native-paper';
import {ThemeContext} from '../../App';
import {useNavigation, useRoute} from '@react-navigation/native';


const NoInternetScreen = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  const route = useRoute();
const {redirectTo} = route.params || {};
  const accentColor = '#6C63FF';
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
  const mutedTextColor = theme === 'light' ? '#737373' : '#a3a3a3';

  return (
    <View style={[styles.container, {backgroundColor}]}>
      {/* Centered content */}
      <View style={styles.centerContent}>
        <Image
          source={require('../assets/images/illustrations/no_signal.png')}
          style={styles.image}
        />
        <Text style={[styles.title, {color: textColor}]}>
          Something went wrong
        </Text>
        <Text style={[styles.subtitle, {color: mutedTextColor}]}>
          Make sure wifi or cellular data is turned on and then try again
        </Text>
      </View>

      {/* Button at the bottom */}
      <View style={styles.buttonContainer}>
        <Button
          style={{backgroundColor: accentColor, paddingVertical: 3}}
          mode="contained"
          onPress={() => navigation.navigate(redirectTo)}>
          Try Again
        </Button>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between', // separates center content & button
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    textAlign: 'center',
    fontWeight: '600',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    marginBottom: 20,
  },
});

export default NoInternetScreen;
