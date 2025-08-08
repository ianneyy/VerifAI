/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext, useEffect} from 'react';
import {ThemeContext} from '../../App';
import { uploadImage } from '../services/newsCall';
import {useNavigation, useRoute} from '@react-navigation/native';
import SQLite from 'react-native-sqlite-storage';

import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Button,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Gauge from '../components/Gauge';
import InstructionModal from '../components/InstructionModal';
import IssueModal from '../components/IssueModal';
import ExtractedText from '../components/ExtractedText';
import ResultsOverview from '../components/ResultsOverview';
import Loading from '../components/Loading';
import ImageUploadHelp from '../components/ImageUploadHelp';
import {
  initDB,
  insertFactCheck,
  insertRelatedNews,
  getAllFactChecks,
  getRelatedNews,
} from '../js/database';


const ResultScreen = () => {
  const route = useRoute();
  const { imageUri } = route.params;
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);
  const [cleanText, setCleanText] = useState('');
  const [articleCount, setArticleCount] = useState(0);
  const [sourceScore, setSourceScore] = useState(0);
  const [matchedArticleScore, setMatchedArticleScore] = useState(0);
  const [matchedPerson, setMatchedPerson] = useState(null);
  const [prediction, setPrediction] = useState('');
  const [SourceName, setSourceName] = useState('');
  const [faceRecognition, setfaceRecognition] = useState('');
  const [gauge, setGauge] = useState('');
  const [activeContent, setActiveContent] = useState(null);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueModalTitle, setIssueModalTitle] = useState('');
  const [issueModalMessage, setIssueModalMessage] = useState('');
  const [issueModalReason1, setIssueModalReason1] = useState('');
  const [issueModalReason2, setIssueModalReason2] = useState('');
  const [isHelpVisible, setHelpVisible] = useState(false);


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


  useEffect(() => {
    const processImage = async () => {
      try {
        if (!imageUri) {
          return;
        }
        // await initDB();

        setLoading(true);
        const extractedData = await uploadImage(imageUri);
        if (extractedData) {
          setContentLoading(false);
          if (extractedData.extracted_text) {
            setNews(extractedData.matchedArticles);
            setfaceRecognition(extractedData.face_recognition.artist);
            setCleanText(extractedData.cleanedText);
            setArticleCount(extractedData.matchedArticles.length);
            // setsourceCredible(extractedData.sourceCredibility);
            setPrediction(extractedData.prediction);
            setGauge(extractedData.score);
            setSourceName(extractedData.sourceName);
            setSourceScore(extractedData.sourceScore);
            setMatchedPerson(extractedData.matchedPerson);
            // setMatchedArticleScore(extractedData.matchedArticleScore);

            const factCheckData = {
              claim: extractedData.cleanedText,
              source: extractedData.sourceName,
              verdict: extractedData.score,
              source_score: extractedData.sourceScore,
              writing_style: extractedData.prediction,
              matched_article: extractedData.matchedArticleScore,
              matched_person: extractedData.matchedPerson,
              face_recognition: extractedData.face_recognition.artist,
              method: 'Image Upload',
            };

            console.log('📝 Inserting fact check:', factCheckData);
            await insertFactCheck(factCheckData);
            console.log('✅ Fact check inserted.');


            if (!extractedData.matchedArticles.length) {
              console.warn('⚠️ No matched articles found!');
            }
          } else {
            console.warn('⚠️ No text detected in image!');
          }
        } else {
          console.warn('⚠️ No data returned from image processing!');
        }
      } catch (error) {
        console.error('❌ Error processing image:', error);
      } finally {
        setLoading(false);
        setContentLoading(false);
        setResultLoading(false);
      }
    };

    processImage();
  }, [imageUri]);






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
          <Text style={[styles.headerTitle, {color: textColor}]}>Result</Text>
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => setHelpVisible(true)}>
            <Icon name="help-circle" size={24} color={textColor} />
          </TouchableOpacity>
        </View>
        <ImageUploadHelp
          visible={isHelpVisible}
          onClose={() => setHelpVisible(false)}
        />
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <View style={{marginTop: 30}}>
              <Loading
                accentColor={accentColor}
                subtitleColor={subtitleColor}
              />
            </View>
          ) : (
            <>
              {/* EXTRACTED TEXT */}

              <ExtractedText
                cleanText={cleanText}
                SourceName={SourceName}
                textColor={textColor}
                recognizedTextColor={recognizedTextColor}
              />

              {/* GAUGE */}
              <View style={styles.textContainer}>
                <Gauge confidence={gauge} textColor={recognizedTextColor} />
              </View>

              {/* PANEL RESULT OVERVIEW AND RELATED NEWS */}
              <ResultsOverview
                activeContent={activeContent}
                setActiveContent={setActiveContent}
                sourceScore={sourceScore}
                prediction={prediction}
                matchedPerson={matchedPerson}
                faceRecognition={faceRecognition}
                loading={loading}
                accentColor={accentColor}
                subtitleColor={subtitleColor}
                placeholderTextColor={placeholderTextColor}
                textColor={textColor}
                theme={theme}
                cleanText={cleanText}
                news={news}
                setIssueModalTitle={setIssueModalTitle}
                setIssueModalMessage={setIssueModalMessage}
                setIssueModalReason1={setIssueModalReason1}
                setIssueModalReason2={setIssueModalReason2}
                setIssueModalVisible={setIssueModalVisible}
              
              />
              <IssueModal
                visible={issueModalVisible}
                onClose={() => setIssueModalVisible(false)}
                title={issueModalTitle}
                message={issueModalMessage}
                reason1={issueModalReason1}
                reason2={issueModalReason2}
              />
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
};

export default ResultScreen;

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
});
