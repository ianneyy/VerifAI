/* eslint-disable react-native/no-inline-styles */
import React, { useState, useContext } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  Linking, ActivityIndicator, ScrollView, StyleSheet,
  SafeAreaView, StatusBar, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { launchImageLibrary } from 'react-native-image-picker';
import { fetchRSSNews } from '../services/newsCall';
import { uploadImage } from '../services/newsCall';
import { ThemeContext } from '../../App';

const ImagePickerExample = () => {
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const { theme } = useContext(ThemeContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cleanText, setCleanText] = useState('');
  const [articleCount, setArticleCount] = useState(0);
  const [sourceCredible, setsourceCredible] = useState('');

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

    if (result.didCancel || !result.assets) {return;}

    const uri = result.assets[0].uri;
    setImageUri(uri);
    setNews([]);  // Reset news results
    setsourceCredible('');

    try {
      setLoading(true);
      const extractedText = await uploadImage(uri);

      if (extractedText) {
        console.log('🔍 Extracted Text:', extractedText);
        searchRelatedNews(extractedText);
      } else {
        console.warn('⚠️ No text detected in image!');
      }
    } catch (error) {
      console.error('❌ Error processing image:', error);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch news based on extracted text
  const searchRelatedNews = async (query) => {
    console.log('🔎 Searching News for:', query);
    setLoading(true);

    try {
      const result = await fetchRSSNews(query);
    setCleanText(result.cleanedText);
    setNews(result.matchedArticles);
    setArticleCount(result.matchedArticles.length);
    setsourceCredible(result.sourceCredibility);

       if (!result.matchedArticles.length) {
        console.warn('⚠️ No matched articles found!');

      }
    } catch (error) {
      console.error('❌ Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={theme === 'light' ? 'dark-content' : 'light-content'} backgroundColor={backgroundColor} />

     <View style={[styles.header, { borderBottomColor: borderColor }]}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Icon name="arrow-left" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: textColor }]}>VerifAI Image Scan</Text>
                    <TouchableOpacity
                        style={styles.helpButton}
                        onPress={() =>
                            Alert.alert(
                                'About VerifAI Image Scan',
                                'The VerifAI Image Scan helps you verify information by extracting text from uploaded image providing hassle-free verification',
                                [{ text: 'Got it' }],
                            )
                        }
                    >
                        <Icon name="help-circle" size={24} color={textColor} />
                    </TouchableOpacity>
                </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={[styles.pickButton, { backgroundColor: accentColor }]}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Text style={styles.pickButtonText}>Select Image</Text>
        </TouchableOpacity>

        {imageUri ? (
          <View style={[styles.imageContainer, { backgroundColor: cardBackground }]}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>
        ) : (
          <View style={[styles.placeholderContainer, { backgroundColor: cardBackground, borderColor }]}>
            <Icon name="image" size={48} color={placeholderTextColor} />
            <Text style={[styles.placeholderText, { color: placeholderTextColor }]}>No image selected</Text>
          </View>
        )}

        <View style={styles.textContainer}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Content</Text>
          <View style={[styles.recognizedTextBox, { backgroundColor: cardBackground, borderColor, marginBottom: 25  }]}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>
              {cleanText || 'No text extracted yet.'}
            </Text>
          </View>
        </View>
        <View style={styles.textContainer}>
           <Text style={[styles.sectionTitle, { color: textColor }]}>Result</Text>
          <View style={[styles.recognizedTextBox, { backgroundColor: cardBackground, borderColor, marginBottom: 25 }]}>
          <View style={styles.resultFlex}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Matched Article</Text>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>
              {articleCount || 0} matching {articleCount === 1 || articleCount === 0 ? 'article' : 'articles'}
            </Text>
          </View>
           <View style={styles.resultFlex}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Content Authenticity</Text>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Uncertain</Text>
          </View>
           <View style={styles.resultFlex}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Source Credibility</Text>
            <Text style={[styles.recognizedText, { color: sourceCredible === 'Credible' ? '#36AE7C' : '#EB5353'  }]}>
               {sourceCredible || ''}
            </Text>
          </View>
           <View style={styles.resultFlex}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Face Detected</Text>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Daniel Padilla</Text>
          </View>
           <View style={styles.resultFlex}>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>Credibility Score</Text>
            <Text style={[styles.recognizedText, { color: recognizedTextColor }]}>80%</Text>
          </View>
          </View>
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={accentColor} />
            <Text style={[styles.loadingText, { color: subtitleColor }]}>Processing...</Text>
          </View>
        ) : news.length > 0 ? (
          <View style={styles.newsContainer}>
            <Text style={[styles.sectionTitle, { color: textColor }]}>Related News</Text>
            {news.map((item, index) => (
              <TouchableOpacity
                key={index.toString()}
                style={[styles.newsCard, { backgroundColor: cardBackground }]}
                onPress={() => Linking.openURL(item.link)}
                activeOpacity={0.7}
              >
                {item.thumbnail ? (
                  <Image source={{ uri: item.thumbnail }} style={styles.newsImage} />
                ) : (
                  <View
                    style={[
                      styles.newsImagePlaceholder,
                      { backgroundColor: theme === 'light' ? '#f1f5f9' : '#2A2A2A' },
                    ]}
                  >
                    <Text style={[styles.newsImagePlaceholderText, { color: placeholderTextColor }]}>No Image</Text>
                  </View>
                )}
                <View style={styles.newsContent}>
                  <Text style={[styles.newsTitle, { color: textColor }]} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <Text style={[styles.newsSource, { color: accentColor }]}>Source: {item.source}</Text>
                  <Text style={[styles.newsSnippet, { color: subtitleColor }]} numberOfLines={3}>
                    {item.snippet}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : cleanText ? (
          <View style={styles.emptyNewsContainer}>
            <Text style={[styles.emptyNewsText, { color: placeholderTextColor }]}>No related news found</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  newsContent:{
    padding: 15,
  },
  resultFlex:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  newsSource:{
    fontSize:12,
    color : '#6C63FF',
    marginBottom:8,
  },
  newsSnippet:{
    fontSize:14,
    color:'#AAAAAA',
    lineHeight:20,
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
  newsContainer: {
    marginHorizontal: 20,
    marginTop: 30,
  },
  emptyNewsContainer: {
    marginTop: 30,
    alignItems: 'center',
    padding: 20,
  },
  emptyNewsText: {
    fontSize: 16,
  },
});

export default ImagePickerExample;
