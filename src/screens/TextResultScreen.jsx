/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */

import React, {useState, useContext, useEffect} from 'react';
import {ThemeContext} from '../../App';
import {submitText} from '../services/newsCall';
import {useNavigation, useRoute} from '@react-navigation/native';

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
import TextGauge from '../components/TextGauge';
import InstructionModal from '../components/InstructionModal';
import IssueModal from '../components/IssueModal';
import ExtractedText from '../components/ExtractedText';
import TextResultOverview from '../components/TextResultOverview';
import Loading from '../components/Loading';
import Help from '../components/TextScreenHelp';
import ClaimText from '../components/ClaimText';

const TextResultScreen = () => {
  const route = useRoute();
  const {resultText} = route.params;

  const [modalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation();
  const {theme} = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  const [contentLoading, setContentLoading] = useState(false);
  const [resultLoading, setResultLoading] = useState(false);

  const [text, setText] = useState('');
  const [news, setNews] = useState([]);
  const [matchedArticleScore, setMatchedArticleScore] = useState(0);
  const [prediction, setPrediction] = useState('');
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
    const processText = async () => {
      try {
        if (!resultText) {
          return;
        }
        setLoading(true);
        const textResult = await submitText(resultText);

        if (textResult) {
          setContentLoading(false);
          setNews(textResult.matchedArticles);
          setText(textResult.text);
          setPrediction(textResult.prediction);
          setGauge(textResult.score);
          setMatchedArticleScore(textResult.matchedArticleScore);

          if (!textResult.matchedArticles.length) {
            console.warn('⚠️ No matched articles found!');
          }
        } else {
          console.warn('⚠️ No data returned from text processing!');
        }
      } catch (error) {
        console.error('❌ Error processing text:', error);
      } finally {
        setLoading(false);
        setContentLoading(false);
        setResultLoading(false);
      }
    };
    processText();
  }, [resultText]);

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
          Text Result
        </Text>
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => setHelpVisible(true)}>
          <Icon name="help-circle" size={24} color={textColor} />
        </TouchableOpacity>
      </View>
      <Help visible={isHelpVisible} onClose={() => setHelpVisible(false)} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={{marginTop: 300, justifyContent: 'center', alignItems: 'center'}}>
            <Loading accentColor={accentColor} subtitleColor={subtitleColor} />
          </View>
        ) : (
          <>
            {/* EXTRACTED TEXT */}

            <ClaimText
              cleanText={text}
              textColor={textColor}
            />

            {/* GAUGE */}
            <View style={styles.textContainer}>
              <TextGauge confidence={gauge} recognizedText={recognizedTextColor} />
            </View>

            {/* PANEL RESULT OVERVIEW AND RELATED NEWS */}
            <TextResultOverview
              activeContent={activeContent}
              setActiveContent={setActiveContent}
              prediction={prediction}
              matchedArticleScore={matchedArticleScore}
              loading={loading}
              accentColor={accentColor}
              subtitleColor={subtitleColor}
              placeholderTextColor={placeholderTextColor}
              textColor={textColor}
              theme={theme}
              cleanText={text}
              news={news}
              setIssueModalTitle={setIssueModalTitle}
              setIssueModalMessage={setIssueModalMessage}
              setIssueModalReason1={setIssueModalReason1}
              setIssueModalReason2={setIssueModalReason2}
              setIssueModalVisible={setIssueModalVisible}
              // styles={styles}
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
export default TextResultScreen;
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
