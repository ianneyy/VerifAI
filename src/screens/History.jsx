/* eslint-disable no-trailing-spaces */
/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState, useContext} from 'react';
import {View, Text, FlatList, StyleSheet, Button, SafeAreaView, TouchableOpacity, StatusBar} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {ThemeContext} from '../../App';
import Icon from 'react-native-vector-icons/Feather';
import dayjs from 'dayjs';
import {
  initDB,
  insertFactCheck,
  insertRelatedNews,
  getAllFactChecks,
  getRelatedNews,
} from '../js/database';
import {fetchKotlinResult} from '../assets/fetchKotlinResult';


const History = () => {
  const [factChecks, setFactChecks] = useState([]);
  const {theme} = useContext(ThemeContext);
  const navigation = useNavigation();
const [kotlinResult, setKotlinResult] = useState(null);
  console.log(factChecks);
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
    const setup = async () => {
      console.log('📦 Initializing database...');
      await initDB();
      const all = await getAllFactChecks();
      setFactChecks(all);
    };

    setup();
  }, []);

  const verificationLevels = {
    '100': {
      label: 'High Credibility',
      color: '#4CD964',
    },
    '75-99': {
      label: 'Generally Credible',
      color: '#a3e635',

    },
    '60-74': {
      label: 'Credible with Exceptions',
      color: '#FFCC00',

    },
    '40-59': {
      label: 'Proceed with Caution',
      color: '#fb923c',

    },
    '0-39': {
      label: 'Proceed with Maximum Caution',
      color: '#FF3B30',

    },
  };

  const getVerificationLevel = value => {
    if (value === 100) {
      return verificationLevels['100'];
    }
    if (value >= 75) {
      return verificationLevels['75-99'];
    }
    if (value >= 60) {
      return verificationLevels['60-74'];
    }
    if (value >= 40) {
      return verificationLevels['40-59'];
    }
    return verificationLevels['0-39'];
  };

  console.log(factChecks.length);

  const renderItem = ({item}) => {
    const verificationLevel = getVerificationLevel(item.verdict);
    return (
      <View style={[styles.card, {backgroundColor: backgroundColor}]}>
        <View
          style={{
            gap: 12,
            padding: 16,
            backgroundColor: backgroundColor,
          }}>
          <View style={{gap: 12}}>
            <Text
              style={{
                flex: 1,
                fontSize: 14,
                fontWeight: '600',
                color: accentColor,
              }}>
              Method: {item.method}
            </Text>

            <Text style={{flex: 1, fontSize: 14, color: textColor}}>
              {item.claim}
            </Text>
            {item.source ? (
              <Text
                style={{
                  flex: 1,
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: textColor,
                }}>
                Source: {item.source}
              </Text>
            ) : null}
          </View>
         <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center', // vertical alignment
    gap: 12,
  }}>
            <Text
              style={{
                color: '#737373',
                textAlign: 'center',
               fontSize: 12,
                fontWeight: '400',
              }}>
              {dayjs(item.created_at).format('MMM D, YYYY • h:mm A')}
            </Text>
            <Text
              style={{
                color: textColor,
                textAlign: 'center',
                borderLeftWidth: 4,
                borderLeftColor: verificationLevel.color,
                backgroundColor: `${verificationLevel.color}50`,
                paddingHorizontal: 12,
                fontWeight: '400',
              }}>
              {item.verdict}% - {verificationLevel.label}
            </Text>
          </View>
        </View>
        <View
          style={{
            borderBottomColor: '#ccc',
            borderBottomWidth: 1,
            marginVertical: 10,
          }}
        />
      </View>
    );
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
          History
        </Text>
        <Text style={[styles.headerTitle, {color: 'transparent'}]}>Result</Text>
        
        
      </View>
    <View style={styles.wrap}>
      {/* <Text style={styles.header}>History</Text> */}
      <FlatList
        data={factChecks}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
      />
    </View>
    </SafeAreaView>
  );
};

export default History;

const styles = StyleSheet.create({
  container: {flex: 1},
  // header: {fontSize: 24, fontWeight: 'bold', marginBottom: 10},
  card: {
    // backgroundColor: '#f4f4f4',
    marginVertical: 8,
    borderRadius: 10,
  },
  wrap: {
    padding: 16,
    marginBottom: 20,
  },
  title: {fontWeight: 'bold', marginTop: 5},
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
});
