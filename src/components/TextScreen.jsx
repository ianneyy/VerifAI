/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext, useEffect} from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  ScrollView,
  // TextInput,
  Image,
  Modal,
} from 'react-native';
import {ThemeContext} from '../../App';
import {useNavigation} from '@react-navigation/native';
import {Button, TextInput} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';

import Accordion from './Accordion';
const TextScreen = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  // const [resultText, setResultText] = useState('');
  const [newsText, setNewsText] = useState('');
  const [invalidTextModalVisible, setInvalidTextModalVisible] = useState(false);


  const accentColor = '#6C63FF';
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
  const mutedTextColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#334155';

  const submit = async () => {
  try {
     const state = await NetInfo.fetch();

     if (!state.isConnected || !state.isInternetReachable) {
      navigation.navigate('NoInternetScreen', {redirectTo: 'Text'});
      return;
    }
    const cleanedText = newsText.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, '');
    const words = cleanedText.trim().split(/\s+/); 
    const hasVowel = /[aeiouAEIOU]/.test(cleanedText);
    const isTooRandom = words.length === 1 && words[0].length > 20; 
    const isTooShort = cleanedText.trim().length < 10;
    // 1️⃣ No spaces at all (e.g., "hahahahahaha", "thisislongtextwithoutspaces")
    const noSpaces = !cleanedText.includes(' ');


    if (!hasVowel || isTooRandom || isTooShort || noSpaces)
    { setInvalidTextModalVisible(true);
         return;
    }

    navigation.navigate('TextResultScreen', { resultText: newsText });

  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />
      <ScrollView
        contentContainerStyle={{flexGrow: 1, justifyContent: 'space-between'}}>
        <View style={[styles.header, {borderBottomColor: borderColor}]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate('Home')}>
            <Icon name="arrow-left" size={24} color={textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, {color: textColor}]}>
            VerifAI Text
          </Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() =>
              Alert.alert(
                'About Text Verification',
                'The VerifAI Image Scan helps you verify information by extracting text from uploaded image providing hassle-free verification',
                [{text: 'Got it'}],
              )
            }>
            <Icon name="help-circle" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <View style={{alignItems: 'center', flex: 1}}>
          <View>
            {/* <TextSearch color="#94a3b8" size={98} style={{marginBottom: 36}} /> */}
            <Image
              source={require('../assets/images/illustrations/text.png')}
              style={styles.image}
            />
          </View>
          {/* <TextInput
          style={[
            styles.input,
            {
              backgroundColor: backgroundColor,
              borderColor: '#6C63FF',
              color: textColor,
              width: '90%',
              alignSelf: 'center',
            },
          ]}
          placeholder="Enter or paste the news text you want to verify"
          multiline
          placeholderTextColor={mutedTextColor}
          value={newsText}
          onChangeText={setNewsText}
        /> */}
          <TextInput
            mode="outlined"
            label="Text Input"
            value={newsText}
            onChangeText={setNewsText}
            multiline
            placeholder="Write or paste your text here"
            activeOutlineColor="#6C63FF" // color when focused
            textColor={textColor}
            style={{
              backgroundColor: backgroundColor,
              width: '90%',
              alignSelf: 'center',
              marginBottom: 12,
              paddingVertical: 0,
            }}
            contentStyle={{
              textAlignVertical: 'center', // Move this here
            }}
            left={<TextInput.Icon icon="text" />}
            theme={{
              roundness: 12,
              colors: {
                placeholder: mutedTextColor,
              },
              fonts: {
                bodyLarge: {
                  fontSize: 14, // adjust placeholder text size
                },
              },
            }}
          />
          <Button
            mode="contained"
            onPress={submit}
            style={{
              backgroundColor: accentColor,
              width: '90%',
              alignSelf: 'center',
              elevation: 0,
              paddingVertical: 3,
              borderRadius: 50,
            }}
            labelStyle={styles.buttonText}>
            Verify
          </Button>
        </View>
        <Modal
          animationType="fade"
          transparent={true}
          visible={invalidTextModalVisible}
          onRequestClose={() => setInvalidTextModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, {backgroundColor}]}>
              <Text style={[styles.modalTitle, {color: textColor}]}>
                Invalid Text
              </Text>
              <Text style={[styles.modalMessage, {color: mutedTextColor}]}>
                Please enter a valid sentence. Avoid random characters or
                gibberish.
              </Text>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  {
                    backgroundColor: '#6C63FF',
                    width: '100%',
                    alignSelf: 'center',
                    justifyContent: 'center', // ✅ centers vertically
                    alignItems: 'center',
                  },
                ]}
                onPress={() => setInvalidTextModalVisible(false)}>
                <Text style={styles.modalButtonText}>Got it</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        {/* <View style={{flex: 1, justifyContent: 'flex-end', width: '100%'}}>
          <Accordion />
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    paddingVertical: 10,

    borderRadius: 50,
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
  },

  container: {
    flex: 1,
  },
  image: {width: 300, height: 300, resizeMode: 'contain'},
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 50,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 600,
    fontSize: 16,
  },
  input: {
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 10,

    // height: 200,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlignVertical: 'top', // For multiline text to start at the top
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  helpButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  switch: {
    transform: [{scaleX: 1.5}, {scaleY: 1.5}],
    marginBottom: 24,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
export default TextScreen;
