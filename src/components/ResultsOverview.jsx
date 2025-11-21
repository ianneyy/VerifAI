/* eslint-disable no-cond-assign */
/* eslint-disable react-native/no-inline-styles */
import React, {useState, useContext} from 'react';

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

const ResultsOverview = ({
  activeContent,
  setActiveContent,
  sourceScore,
  prediction,
  matchedPerson,
  faceRecognition,
  loading,
  accentColor,
  subtitleColor,
  placeholderTextColor,
  textColor,
  theme,
  cleanText,
  news,
  setIssueModalTitle,
  setIssueModalMessage,
  setIssueModalReason1,
  setIssueModalReason2,
  setIssueModalVisible,
}) => {
  const openReasonModal = (title, message, reason1, reason2) => {
    setIssueModalTitle(title);
    setIssueModalMessage(message);
    setIssueModalReason1(reason1);
    setIssueModalReason2(reason2);
    setIssueModalVisible(true);
  };
  return (
    <>
      <View style={styles.panel}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              activeContent === 'content1' && styles.active,
            ]}
            onPress={() => setActiveContent('content1')}>
            <Text
              style={[
                styles.buttonText,
                activeContent === 'content1' && styles.activeText,
              ]}>
              Results Overview
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              activeContent === 'content3' && styles.active,
              {borderTopRightRadius: 6, borderBottomRightRadius: 6},
            ]}
            onPress={() => setActiveContent('content3')}>
            <Text
              style={[
                styles.buttonText,
                activeContent === 'content3' && styles.activeText,
              ]}>
              Related News
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      {activeContent === 'content1' && (
        // SOURCE CREDIBILITY

        <View style={styles.content}>
          <TouchableOpacity
            onPress={() => {
              if (sourceScore <= 2) {
                openReasonModal(
                  'Source Credibility',
                  'The post came from an unknown or unverified page, and no trusted news organization was linked.',
                  'No profile name, page name, or media outlet detected. The image may be cropped.',
                  'The page is not listed in our trusted sources database.',
                );
              }
            }}>
            <View
              style={[
                styles.resultFlex,
                {
                  borderLeftWidth: 3,
                  borderLeftColor: sourceScore >= 3 ? '#4CD964' : '#FF797B',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={[
                    styles.recognizedText,
                    {color: textColor, fontWeight: 'bold'},
                  ]}>
                  Source Credibility
                </Text>
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: sourceScore >= 3 ? '#4CD964' : '#FF797B',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {sourceScore}%
                  <Text
                    style={{
                      color: '#A1A1A1',
                      fontWeight: 'normal',
                      fontSize: 10,
                    }}>
                    {' '}
                    out of 72%
                  </Text>
                </Text>
              </View>
              <Text
                style={[
                  styles.recognizedText,
                  {color: subtitleColor, fontSize: 12},
                ]}>
                Checks if the news comes from a trusted and reliable source.
              </Text>
              {sourceScore <= 2 && (
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: subtitleColor,
                      fontSize: 12,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    },
                  ]}>
                  Click to see possible issues
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* CONTENT AUTHENTICITY */}
          <TouchableOpacity
            onPress={() => {
              if (prediction !== 'Credible') {
                openReasonModal(
                  'Writing Style',
                  'The writing style do not match how real news is usually written.',
                  'The tone is too emotional, biased, or exaggerated',
                  'The text contains too many spelling or grammar issues.',
                );
              }
            }}>
            <View
              style={[
                styles.resultFlex,
                {
                  borderLeftWidth: 3,
                  borderLeftColor:
                    prediction === 'Credible' ? '#4CD964' : '#FF797B',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={[
                    styles.recognizedText,
                    {color: textColor, fontWeight: 'bold'},
                  ]}>
                  Writing Style
                </Text>
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: prediction === 'Credible' ? '#4CD964' : '#FF797B',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {prediction === 'Credible' ? '19%' : '0%'}
                  <Text
                    style={{
                      color: '#A1A1A1',
                      fontWeight: 'normal',
                      fontSize: 10,
                    }}>
                    {' '}
                    out of 19%
                  </Text>
                </Text>
              </View>
              <Text
                style={[
                  styles.recognizedText,
                  {color: subtitleColor, fontSize: 12},
                ]}>
                Checks if the news sounds real or fake based on how accurate
                news are written.
              </Text>
              {prediction !== 'Credible' && (
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: subtitleColor,
                      fontSize: 12,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    },
                  ]}>
                  Click to see possible issues
                </Text>
              )}
            </View>
          </TouchableOpacity>

          {/* MATCHED ARTICLE */}

          {/* <TouchableOpacity
            onPress={() => {
              if (matchedArticleScore <= 0) {
                openReasonModal(
                  'Matched Article',
                  'No similar news was found from any trusted sources.',
                  'The claim might be new, made-up, or not widely reported.',
                  'The topic lacks coverage from major outlets.',
                );
              }
            }}>
            <View
              style={[
                styles.resultFlex,
                {
                  borderLeftWidth: 3,
                  borderLeftColor:
                    matchedArticleScore >= 1 ? '#4CD964' : '#FF797B',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={[
                    styles.recognizedText,
                    {color: textColor, fontWeight: 'bold'},
                  ]}>
                  Matched Article
                </Text>
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: matchedArticleScore >= 1 ? '#4CD964' : '#FF797B',
                      fontWeight: 'bold',
                    },
                  ]}>
                 
                  +{matchedArticleScore}%
                </Text>
              </View>
              <Text
                style={[
                  styles.recognizedText,
                  {color: subtitleColor, fontSize: 12},
                ]}>
                Check if other trusted sources have published similar news
              </Text>

              {matchedArticleScore <= 0 && (
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: subtitleColor,
                      fontSize: 12,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    },
                  ]}>
                  Click to see possible issues
                </Text>
              )}
            </View>
          </TouchableOpacity> */}
          {/* FACE CONTEXT MATCHING */}
          <TouchableOpacity
            onPress={() => {
              const faceNotDetected =
                faceRecognition.trim().toLowerCase() !== 'no face detected';
              const noMatchedPerson = !matchedPerson;

              if (faceNotDetected || noMatchedPerson) {
                openReasonModal(
                  'Face - Content Matching',
                  'No face was detected in the uploaded image, or the name mentioned in the post doesn’t match any known identity from the image.',
                  'Name in post doesn’t appear in known public databases.',
                  'The person in the image may be misidentified due to limited reference data.',
                );
              }
            }}>
            <View
              style={[
                styles.resultFlex,
                {
                  borderLeftWidth: 3,
                  borderLeftColor:
                    faceRecognition.trim().toLowerCase() ===
                      'no face detected' || matchedPerson
                      ? '#4CD964'
                      : '#FF797B',
                },
              ]}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                }}>
                <Text
                  style={[
                    styles.recognizedText,
                    {color: textColor, fontWeight: 'bold'},
                  ]}>
                  Face-Content Matching {matchedPerson}
                </Text>
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color:
                        faceRecognition.trim().toLowerCase() ===
                          'no face detected' || matchedPerson
                          ? '#4CD964'
                          : '#FF797B',
                      fontWeight: 'bold',
                    },
                  ]}>
                  {faceRecognition.trim().toLowerCase() ===
                    'no face detected' || matchedPerson
                    ? '9%'
                    : '0%'}
                  <Text
                    style={{
                      color: '#A1A1A1',
                      fontWeight: 'normal',
                      fontSize: 10,
                    }}>
                    {' '}
                    out of 9%
                  </Text>
                </Text>
              </View>
              <Text
                style={[
                  styles.recognizedText,
                  {color: subtitleColor, fontSize: 12},
                ]}>
                If a person is present in the image, checks if the name
                mentioned in the news is actually the person in the attached
                post.
              </Text>
              {!(
                faceRecognition.trim().toLowerCase() === 'no face detected' ||
                matchedPerson
              ) && (
                <Text
                  style={[
                    styles.recognizedText,
                    {
                      color: subtitleColor,
                      fontSize: 12,
                      textAlign: 'right',
                      fontWeight: 'bold',
                    },
                  ]}>
                  Click to see possible issues
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}
      {activeContent === 'content3' && (
        <View style={styles.content}>
          {/* RELATED NEWS */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={accentColor} />
              <Text style={[styles.loadingText, {color: subtitleColor}]}>
                Processing...
              </Text>
            </View>
          ) : news.length > 0 ? (
            <View style={styles.newsContainer}>
              {/* <Text style={[styles.sectionTitle, { color: textColor }]}>Related News</Text> */}
              {news.map((item, index) => (
                <TouchableOpacity
                  key={index.toString()}
                  style={[styles.newsCard]}
                  onPress={() => Linking.openURL(item.link)}
                  activeOpacity={0.7}>
                  {item.thumbnail ? (
                    <Image
                      source={{uri: item.thumbnail}}
                      style={styles.newsImage}
                    />
                  ) : (
                    <View
                      style={[
                        styles.newsImagePlaceholder,
                        {
                          backgroundColor:
                            theme === 'light' ? '#f1f5f9' : '#2A2A2A',
                        },
                      ]}>
                      <Text
                        style={[
                          styles.newsImagePlaceholderText,
                          {color: placeholderTextColor},
                        ]}>
                        No Image
                      </Text>
                    </View>
                  )}
                  <View style={styles.newsContent}>
                    <Text
                      style={[styles.newsTitle, {color: textColor}]}
                      numberOfLines={2}>
                      {item.title}
                    </Text>
                    <View
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <Text
                        style={[
                          styles.newsSource,
                          {color: accentColor, flexShrink: 1},
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail">
                        Source: {item.source}
                      </Text>
                      <Text
                        style={[
                          styles.newsSource,
                          {color: '#22c55e', fontWeight: 'bold'},
                        ]}>
                        Similarity: {item.similarity}%
                      </Text>
                    </View>
                    <Text
                      style={[styles.newsSnippet, {color: subtitleColor}]}
                      numberOfLines={3}>
                      {item.snippet}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : cleanText ? (
            <View style={styles.emptyNewsContainer}>
              <Text
                style={[styles.emptyNewsText, {color: placeholderTextColor}]}>
                No related news found
              </Text>
            </View>
          ) : null}
        </View>
      )}
    </>
  );
};

export default ResultsOverview;

const styles = StyleSheet.create({
  activeText: {
    color: '#6C63FF',
  },
  active: {
    // backgroundColor: '#007AFF', // Blue background
    borderBottomWidth: 3, // ✅ border thickness
    borderBottomColor: '#6C63FF', // ✅ your accent color
  },
  panel: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    paddingTop: 16,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  buttonContainer: {
    alignItems: 'center',
    width: '50%',
  },
  button: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    paddingHorizontal: 12,
    height: 40,
    borderBottomWidth: 2, // ✅ border thickness
    borderBottomColor: '#edebebff',
    // borderRadius: 6,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#858585ff',
    fontWeight: 'bold',
  },
  content: {
    // marginTop: 8,
    // backgroundColor: '#eee',
    padding: 10,
    borderRadius: 6,
    marginLeft: 12,
    marginRight: 12,
    paddingBottom: 100,
  },
  loadingContainer: {
    marginTop: 30,
    alignItems: 'center',
  },
  newsContent: {
    padding: 15,
  },
  resultFlex: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 15,
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  newsSource: {
    fontSize: 12,
    color: '#6C63FF',
    marginBottom: 8,
  },
  newsSnippet: {
    fontSize: 14,
    color: '#AAAAAA',
    lineHeight: 20,
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
