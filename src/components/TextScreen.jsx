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
  TextInput,
} from 'react-native';
import {ThemeContext} from '../../App';
import {useNavigation, useFocusEffect} from '@react-navigation/native';

const TextScreen = () => {
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
  // const [resultText, setResultText] = useState('');
  const [newsText, setNewsText] = useState('');
  // const [text, setText] = useState('');
  // const [prediction, setPrediction] = useState('');
  // const [news, setNews] = useState([]);

  const darkBackground = '#0f172a';
  const darkCardBackground = '#090e1a';
  const darkBorderColor = '#334155';
  const darkTextColor = '#f8fafc';
  const darkSubtitleColor = '#AAAAAA';
  const accentColor = '#6C63FF';
  const backgroundColor = theme === 'light' ? '#f8fafc' : '#0f172a';
  const textColor = theme === 'light' ? '#0f172a' : '#f8fafc';
  const mutedTextColor = theme === 'light' ? '#64748b' : '#94a3b8';
  const borderColor = theme === 'light' ? '#e2e8f0' : '#334155';
  const cardColor = theme === 'light' ? '#ffffff' : '#1e293b';
  const primaryColor = '#1e3a8a'; // Navy blue - consistent with the app

  const submit = async () => {
    try {
      //    const result = await submitTextToApi(newsText);

      navigation.navigate('TextResultScreen', {resultText: newsText});
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
          Text Verification
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
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: backgroundColor,
              borderColor: borderColor,
              color: textColor,
            },
          ]}
          placeholder="Paste news text here..."
          multiline
          placeholderTextColor={mutedTextColor}
          value={newsText}
          onChangeText={setNewsText}
        />
        <TouchableOpacity
          style={[styles.button, {backgroundColor: accentColor}]}
          activeOpacity={0.8}
          onPress={submit}>
          <Text style={styles.buttonText}>Verify News</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 30,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginHorizontal: 20,
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  input: {
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 10,

    height: 200,
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
