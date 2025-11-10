/* eslint-disable eol-last */
/* eslint-disable react-native/no-inline-styles */

import React, {useState, useContext, useEffect} from 'react';
import {ThemeContext} from '../../App';
import {submitUrlWithProgress} from '../services/newsCall';
import {useNavigation, useRoute} from '@react-navigation/native';
import VerifyProgress from '../components/TextLoading';

import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import Gauge from '../components/Gauge';
import IssueModal from '../components/IssueModal';
import ResultsOverview from '../components/ResultsOverview';
import Loading from '../components/Loading';
import ImageUploadHelp from '../components/ImageUploadHelp';
import ClaimText from '../components/ClaimText';
import {insertFactCheck, initDB} from '../js/database';

const UrlResultScreen = () => {
  const route = useRoute();
  const {resultUrl} = route.params;

  // const [modalVisible, setModalVisible] = useState(true);
  const navigation = useNavigation();
  const {theme} = useContext(ThemeContext);
  const [loading, setLoading] = useState(false);
  // const [contentLoading, setContentLoading] = useState(false);
  // const [resultLoading, setResultLoading] = useState(false);

  // const [text, setText] = useState('');
  // const [isClaim, setIsClaim] = useState(true);

  const [news, setNews] = useState([]);
  // const [matchedArticleScore, setMatchedArticleScore] = useState(0);
  const [prediction, setPrediction] = useState('');
  const [gauge, setGauge] = useState('');

  const [activeContent, setActiveContent] = useState(null);
  const [issueModalVisible, setIssueModalVisible] = useState(false);
  const [issueModalTitle, setIssueModalTitle] = useState('');
  const [issueModalMessage, setIssueModalMessage] = useState('');
  const [issueModalReason1, setIssueModalReason1] = useState('');
  const [issueModalReason2, setIssueModalReason2] = useState('');

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState('');
  const [thumbnail, setThumbnail] = useState('');

  const [isHelpVisible, setHelpVisible] = useState(false);
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const [faceRecognition, setfaceRecognition] = useState('');
  const [cleanText, setCleanText] = useState('');
  // const [SourceName, setSourceName] = useState('');
  const [sourceScore, setSourceScore] = useState(0);
  const [matchedPerson, setMatchedPerson] = useState(null);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');


  const darkBackground = '#0f172a';
  // const darkCardBackground = '#090e1a';
  const darkBorderColor = '#334155';
  const darkTextColor = '#f8fafc';
  const darkSubtitleColor = '#AAAAAA';
  const accentColor = '#6C63FF';

  // Get the appropriate colors based on the theme
  const backgroundColor = theme === 'light' ? '#f8fafc' : darkBackground;
  // const cardBackground = theme === 'light' ? '#ffffff' : darkCardBackground;
  const borderColor = theme === 'light' ? '#e2e8f0' : darkBorderColor;
  const textColor = theme === 'light' ? '#0f172a' : darkTextColor;
  const subtitleColor = theme === 'light' ? '#64748b' : darkSubtitleColor;
  const placeholderTextColor = theme === 'light' ? '#94a3b8' : '#777777';
  const recognizedTextColor = theme === 'light' ? '#334155' : '#DDDDDD';

  // useEffect(() => {
  //   const processUrl = async () => {
  //     try {
  //       if (!resultUrl) {
  //         return;
  //       }
  //       await initDB();
  //       setLoading(true);
  //       const urlResult = await submitUrl(resultUrl);

  //       if (urlResult) {
  //         // setIsModalVisible(false);
  //         // setContentLoading(false);

  //         setNews(urlResult.matchedArticles);
  //         // setText(urlResult.text);
  //         setfaceRecognition(urlResult.face_recognition.artist);
  //         setCleanText(urlResult.description);
  //         // setArticleCount(extractedData.matchedArticles.length);
  //         // setSourceName(urlResult.sourceName);
  //         setSourceScore(urlResult.sourceScore);
  //         setMatchedPerson(urlResult.matchedPerson);
  //         setPrediction(urlResult.prediction);

  //         setSource(urlResult.sourceName);
  //         setTitle(urlResult.title);
  //         setUrl(urlResult.url);
  //         setDate(urlResult.date);
  //         setThumbnail(urlResult.thumbnail);

  //         setGauge(urlResult.score);
  //         // setMatchedArticleScore(urlResult.matchedArticleScore);
  //         const factCheckData = {
  //           claim: urlResult.description,
  //           source: urlResult.sourceName,
  //           verdict: urlResult.score,
  //           source_score: urlResult.sourceScore,
  //           writing_style: urlResult.prediction,
  //           matched_person: urlResult.matchedPerson,
  //           face_recognition: urlResult.face_recognition.artist,
  //           method: 'Url Verification',
  //         };

  //         console.log('📝 Inserting fact check:', factCheckData);
  //         await insertFactCheck(factCheckData);
  //         console.log('✅ Fact check inserted.');
  //       } else {
  //         console.warn('⚠️ No data returned from text processing!');
  //       }
  //     } catch (error) {
  //       console.error('❌ Error processing text:', error);
  //     } finally {
  //       setLoading(false);
  //       // setContentLoading(false);
  //       // setResultLoading(false);
  //     }
  //   };
  //   processUrl();
  // }, [resultUrl]);

useEffect(() => {
  const processUrl = async () => {
    try {
      if (!resultUrl) {
        return;
      }

      await initDB();
      setLoading(true);

      // SSE-based URL submission
      submitUrlWithProgress(
        resultUrl,
        (p, msg) => {
          setProgress(p);
          setMessage(msg);
        },
        async urlResult => {
          setLoading(false);
          if (urlResult) {
            // Update state with the result
            setNews(urlResult.matched_articles);
            setfaceRecognition(urlResult.face_recognition.artist);
            setCleanText(urlResult.description);
            setSourceScore(urlResult.source_score);
            setMatchedPerson(urlResult.match_person);
            setPrediction(urlResult.prediction);

            setSource(urlResult.source_name);
            setTitle(urlResult.title);
            setUrl(urlResult.url);
            setDate(urlResult.date);
            setThumbnail(urlResult.thumbnail);

            setGauge(urlResult.score);

            const factCheckData = {
              claim: urlResult.description,
              source: urlResult.source_name,
              verdict: urlResult.score,
              source_score: urlResult.source_score,
              writing_style: urlResult.prediction,
              matched_person: urlResult.matched_person,
              face_recognition: urlResult.face_recognition.artist,
              method: 'Url Verification',
            };

            console.log('📝 Inserting fact check:', factCheckData);
            await insertFactCheck(factCheckData);
            console.log('✅ Fact check inserted.');
          } else {
            console.warn('⚠️ No data returned from URL processing!');
          }

          
        },
        err => {
          console.error('❌ SSE Error processing URL:', err);
          setLoading(false);
        },
      );
    } catch (error) {
      console.error('❌ Error processing URL:', error);
      setLoading(false);
    }
  };

  processUrl();
}, [resultUrl]);

  useEffect(() => {
    setCleanText(
      'This is placeholder text for redesign. This is placeholder text for redesign. This is placeholder text for redesign. This is placeholder text for redesign.',
    );
    setGauge(75);
    setNews([{title: 'Dummy article', url: '#'}]);
  }, []);



  return (
    <SafeAreaView style={[styles.container, {backgroundColor}]}>
      <StatusBar
        barStyle={theme === 'light' ? 'dark-content' : 'light-content'}
        backgroundColor={backgroundColor}
      />

      <View style={[styles.header, {borderBottomColor: borderColor}]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.navigate('Url')}>
          <Icon name="arrow-left" size={24} color={textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, {color: textColor}]}>Url Result</Text>
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
          <View
                     style={{
                       marginTop: 200,
                       justifyContent: 'center',
                       alignItems: 'center',
                     }}>
                     <VerifyProgress
                       message={message}
                       progress={progress}
                       textColor={textColor}
                       subtitleColor={subtitleColor}
                     />
                   </View>
        ) : (
          <>
            {/* Preview URL*/}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                if (url) {
                  Linking.openURL(url).catch(err =>
                    console.error('Failed to open URL:', err),
                  );
                }
              }}
              style={{
                borderWidth: 1,
                borderRadius: 8,
                borderColor: '#e5e7eb',
                marginTop: 12,
                marginHorizontal: 12,
              }}>
              <View style={styles.imageContainer}>
                <Image
                  source={{uri: thumbnail}}
                  style={styles.image}
                  resizeMode="contain"
                />
              </View>
              <View style={{marginHorizontal: 12, marginVertical: 8}}>
                <View>
                  <Text
                    style={{fontWeight: 'bold', fontSize: 16}}
                    numberOfLines={1}
                    ellipsizeMode="tail">
                    {title || 'No title available'}
                  </Text>
                  <ClaimText cleanText={cleanText} textColor={'#71717a'} />
                </View>
                <View
                  style={{
                    justifyContent: 'space-between',
                    flexDirection: 'row',

                    marginTop: 6,
                  }}>
                  <Text style={{color: '#71717a', fontSize: 12}}>
                    {source || 'No source available'}
                  </Text>
                  <Text style={{color: '#71717a', fontSize: 12}}>
                    {date || 'No date available'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
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
export default UrlResultScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageContainer: {
    width: '100%', // full width of parent
    height: 100, // or any fixed height you want
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%', // fills width of container
    height: '100%', // fills height of container
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
