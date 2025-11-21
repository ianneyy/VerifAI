/* eslint-disable react/no-unstable-nested-components */
import {ScrollView, View, Text, StyleSheet, Linking} from 'react-native';
import {List} from 'react-native-paper';
import {ThemeContext} from '../../App';
import React, {useContext} from 'react';

const TextAccordion = () => {
  const [expandedCriteria, setExpandedCriteria] = React.useState(false);
  const [expandedVerification, setExpandedVerification] = React.useState(false);
 const {theme} = useContext(ThemeContext);

  const darkCardBackground = '#090e1a';
  const darkTextColor = '#f8fafc';
  const darkSubtitleColor = '#AAAAAA';

  // Get the appropriate colors based on the theme
  const cardBackground = theme === 'light' ? '#e5e5e5' : darkCardBackground;
  const textColor = theme === 'light' ? '#0f172a' : darkTextColor;
  const subtitleColor = theme === 'light' ? '#64748b' : darkSubtitleColor;

  const accordionContentColor = theme === 'light' ? '#ffffff' : '#1E293B';

  return (
    <>
      <View style={{paddingHorizontal: 16, paddingVertical: 8}}>
        <Text style={{fontSize: 14, color: subtitleColor}}>
          Verification Details
        </Text>
      </View>
      <List.Section>
        {/* Criteria Accordion */}

        <List.Accordion
          title="Criteria"
          left={props => (
            <List.Icon
              {...props}
              icon="check-circle-outline"
              color={textColor}
            />
          )}
          expanded={expandedCriteria}
          titleStyle={{color: textColor}}
          style={{backgroundColor: accordionContentColor}}
          onPress={() => setExpandedCriteria(!expandedCriteria)}>
          <View
            style={[
              styles.accordionContent,
              {backgroundColor: cardBackground},
            ]}>
            <View>
              <Text style={[styles.text, {marginBottom: 26, color: '#64748b'}]}>
                The verification score is broken down into three main criteria.
                Each criterion evaluates a specific aspect of the claim to help
                determine its overall credibility.
              </Text>

              {/* Writing Style */}
              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#6C63FF'}]}>10%</Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  Writing Style
                </Text>
              </View>
              <Text style={[styles.text, {marginBottom: 12, color: '#64748b'}]}>
                Measures the credibility of the text based on writing patterns
                and language consistency.
              </Text>

              {/* Face Matching */}
              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#6C63FF'}]}>90%</Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  Matched Article
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Check if other trusted sources have published similar news
              </Text>
            </View>
          </View>
        </List.Accordion>

        {/* Verification Levels Accordion */}
        {/* <List.Accordion
          title="Verification Levels"
          left={props => (
            <List.Icon {...props} icon="gauge" color={textColor} />
          )}
          titleStyle={{color: textColor}}
          style={{backgroundColor: accordionContentColor}}
          expanded={expandedVerification}
          onPress={() => setExpandedVerification(!expandedVerification)}>
          <View
            style={[
              styles.accordionContent,
              {backgroundColor: cardBackground},
            ]}>
            <View>
              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#4CD964'}]}>
                  100%
                </Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  High Credibility
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Matches trusted sources in style, facts, and multiple articles.
                Adheres to all major credibility and transparency standards.
                {'\n\n'}
              </Text>

              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#A3E635'}]}>
                  75-99%
                </Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  High Credibility
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Mostly credible and aligns with reliable sources, though some
                details or coverage may be incomplete.{'\n\n'}
              </Text>
              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#FFCC00'}]}>
                  60-74%
                </Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  Credible with Exceptions
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Generally credible but with notable issues — such as writing
                inconsistencies, questionable sources, or contextual mismatches.
                {'\n\n'}
              </Text>
              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#FB923C'}]}>
                  40-59%
                </Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  Questionable
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Contains multiple questionable elements or factual
                inconsistencies that undermine reliability.{'\n\n'}
              </Text>

              <View style={{flexDirection: 'row', marginBottom: 8}}>
                <Text style={[styles.percentage, {color: '#FF3B30'}]}>
                  0-39%
                </Text>
                <Text style={[styles.text, {color: textColor}]}>
                  {' '}
                  Likely Fake
                </Text>
              </View>
              <Text style={[styles.text, {color: '#64748b'}]}>
                Confirmed false, misleading, or shows severe disregard for
                credibility standards.
              </Text>
            </View>
          </View>
        </List.Accordion> */}
      </List.Section>
    </>
  );
};

const styles = StyleSheet.create({
  accordionContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e5e5e5',
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },

  percentage: {
    fontSize: 16, // bigger than normal text
    fontWeight: 'bold',
  },
});

export default TextAccordion;
