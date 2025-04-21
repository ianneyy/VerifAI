/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useContext } from 'react';
import {
  View, Text, Image, TouchableOpacity
  , ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { ThemeContext } from '../../App';
import InstructionModal from './InstructionModal';


const ImagePickerExample = () => {
   const [modalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const { theme } = useContext(ThemeContext);


  const darkBackground = '#0f172a';
  const darkCardBackground = '#090e1a';
  const darkBorderColor = '#334155';
  const darkTextColor = '#f8fafc';
  const darkSubtitleColor = '#AAAAAA';
  const accentColor = '#6C63FF';

  // Get the appropriate colors based on the theme
  const backgroundColor = theme === 'light' ? '#f8fafc' : darkBackground;
  const cardBackground = theme === 'light' ? '#ffffff' : darkCardBackground;
  const borderColor = theme === 'light' ? '#e2e8f0' : darkBorderColor;
  const textColor = theme === 'light' ? '#0f172a' : darkTextColor;
  const subtitleColor = theme === 'light' ? '#64748b' : darkSubtitleColor;
  const placeholderTextColor = theme === 'light' ? '#94a3b8' : '#777777';
  const recognizedTextColor = theme === 'light' ? '#334155' : '#DDDDDD';


  // Function to pick an image
  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaTypes: 'photo',
      allowsEditing: false,
      quality: 1,
    });

    if (result.didCancel || !result.assets) {
      return;
    }

    const uri = result.assets[0].uri;
    setImageUri(uri);

    // Navigate to ResultScreen with the image URI
    navigation.navigate('ResultScreen', { imageUri: uri });
  };



 

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />

      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          VerifAI Image Scan
        </Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              'About VerifAI Image Scan',
              'The VerifAI Image Scan helps you verify information by extracting text from uploaded image providing hassle-free verification',
              [{text: 'Got it'}],
            )
          }>
          <Icon name="help-circle" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <InstructionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.pickButton, {backgroundColor: accentColor}]}
          onPress={pickImage}
          activeOpacity={0.8}>
          <Text style={styles.pickButtonText}>Select Image</Text>
        </TouchableOpacity>

        {imageUri ? (
          <View
            style={[styles.imageContainer, {backgroundColor: cardBackground}]}>
            <Image source={{uri: imageUri}} style={styles.image} />
          </View>
        ) : (
          <View
            style={[
              styles.placeholderContainer,
              {backgroundColor: cardBackground, borderColor},
            ]}>
            <Icon name="image" size={48} color={placeholderTextColor} />
            <Text
              style={[styles.placeholderText, {color: placeholderTextColor}]}>
              No image selected
            </Text>
          </View>
        )}


      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
 

  
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
        paddingVertical: 12,
    borderBottomWidth: 1,

  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerRight: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  pickButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
  },
  pickButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  imageContainer: {
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'contain',
  },
  placeholderContainer: {
    height: 200,
    margin: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
  },
  textContainer: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  recognizedTextBox: {
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
  },
  recognizedText: {
    fontSize: 14,
    lineHeight: 20,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
  },
  
  
});

export default ImagePickerExample;
