/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext} from 'react';
import Icon from 'react-native-vector-icons/Feather';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  StatusBar,
  Image,
  // TextInput,
  Modal,
} from 'react-native';
import {ThemeContext} from '../../App';
import {useNavigation} from '@react-navigation/native';
import {Button, TextInput} from 'react-native-paper';
import NetInfo from '@react-native-community/netinfo';




const UrlScreen = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  const [invalidUrlModalVisible, setInvalidUrlModalVisible] = useState(false);
  const [newsText, setNewsText] = useState('');
  const accentColor = '#6C63FF';
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
  const mutedTextColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#334155';

  const submit = async () => {


    try {
       const state = await NetInfo.fetch();

       if (!state.isConnected || !state.isInternetReachable) {
         navigation.navigate('NoInternetScreen', {redirectTo: 'Url'});
         return;
       }


      const urlPattern =
        /^(https?:\/\/)([\w\-]+\.)+[\w\-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/;
      if (!urlPattern.test(newsText)) {
        setInvalidUrlModalVisible(true);
        return;
      }
      navigation.navigate('UrlResultScreen', {resultUrl: newsText});
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

      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Home')}>
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>
          VerifAI URL
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
          {/* <Globe color="#6C63FF" size={98} style={{marginBottom: 36}} /> */}
          <Image
            source={require('../assets/images/illustrations/url.png')}
            style={styles.image}
          />
        </View>
        {/* <Text
          style={{
            color: textColor,
            marginLeft: 24,
            fontWeight: 'bold',
            marginBottom: 5,
          }}>
          Enter the news URL you want to verify
        </Text> */}
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
          placeholder="Enter or paste a URL"
          multiline
          placeholderTextColor={mutedTextColor}
          value={newsText}
          onChangeText={setNewsText}
        /> */}

        <TextInput
          mode="outlined"
          label="URL Input"
          value={newsText}
          onChangeText={setNewsText}
          multiline
          placeholder="Paste or type a news link"
          activeOutlineColor="#6C63FF" // color when focused
          textColor={textColor}
          style={{
            backgroundColor: backgroundColor,
            width: '90%',
            alignSelf: 'center',
            marginBottom: 12,
          }}
          contentStyle={{
            textAlignVertical: 'center', // Move this here
          }}
          left={<TextInput.Icon icon="link" />}
          theme={{
            roundness: 12,
            colors: {
              placeholder: mutedTextColor,
            },
          }}
        />
        {/* <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: accentColor,
              width: '90%', // 🔹 full-width button
              alignSelf: 'center',
              elevation: 0,
            },
          ]}
          activeOpacity={0.8}
          onPress={submit}>
          <Text style={styles.buttonText}>Verify</Text>
        </TouchableOpacity> */}
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
        visible={invalidUrlModalVisible}
        onRequestClose={() => setInvalidUrlModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, {backgroundColor}]}>
            <Text style={[styles.modalTitle, {color: textColor}]}>
              Invalid URL
            </Text>
            <Text style={[styles.modalMessage, {color: mutedTextColor}]}>
              Please enter a valid URL starting with http:// or https://
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
              onPress={() => setInvalidUrlModalVisible(false)}>
              <Text style={styles.modalButtonText}>Got it</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  image: {
    width: 300,
    height: 300,
    resizeMode: 'contain',
  },
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
export default UrlScreen;
