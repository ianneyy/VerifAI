/* eslint-disable react-native/no-inline-styles */
'use client';

import {useContext, useState, useEffect} from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Modal, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
// Import the ThemeContext from App.tsx
import { ThemeContext } from '../../App';
import InstructionModal from './InstructionModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Button } from 'react-native-paper';
// Mode toggle component
const ModeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[styles.modeToggle, { backgroundColor: theme === 'light' ? '#f1f5f9' : '#334155' }]}
      onPress={toggleTheme}
    >
      <Icon name={theme === 'light' ? 'sun' : 'moon'} size={20} color={theme === 'light' ? '#0f172a' : '#f8fafc'} />
    </TouchableOpacity>
  );
};

// Menu item component
const MenuItem = ({ icon, title, description, onPress }) => {
  const { theme } = useContext(ThemeContext);

  return (
    <TouchableOpacity
      style={[
        styles.menuItem,
        {
          backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
          borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
        },
      ]}
      onPress={onPress}>
      <Icon
        name={icon}
        size={20}
        color={theme === 'light' ? '#6C63FF' : '#6C63FF'}
        style={styles.menuIcon}
      />
      <View style={styles.menuTextContainer}>
        <Text
          style={[
            styles.menuTitle,
            {color: theme === 'light' ? '#0f172a' : '#f8fafc'},
          ]}>
          {title}
        </Text>
        <Text
          style={[
            styles.menuDescription,
            {color: theme === 'light' ? '#64748b' : '#94a3b8'},
          ]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);
  const [privacyVisible, setPrivacyVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
useEffect(() => {
  const checkFlags = async () => {
    try {
      const privacyAccepted = await AsyncStorage.getItem('privacyAccepted');
      if (!privacyAccepted) setPrivacyVisible(true);

      const hasLaunched = await AsyncStorage.getItem('hasLaunchedBefore');
      if (!hasLaunched) {
        setModalVisible(true);
        await AsyncStorage.setItem('hasLaunchedBefore', 'true');
      }
    } catch (error) {
      console.log(error);
    }
  };
  checkFlags();
}, []);

const acceptPrivacy = async () => {
  try {
    await AsyncStorage.setItem('privacyAccepted', 'true');
    setPrivacyVisible(false);
  } catch (error) {
    console.log('Error saving privacy acceptance:', error);
  }
};

 
  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: theme === 'light' ? '#f8fafc' : '#0f172a'},
      ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                {
                  color: theme === 'light' ? '#6C63FF' : '#6C63FF', // light blue when dark
                },
              ]}>
              VerifAI
            </Text>
            <ModeToggle />
          </View>
          <InstructionModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
          />
          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Icon
                name="check-circle"
                size={48}
                color={theme === 'light' ? '#6C63FF' : '#6C63FF'}
              />
            </View>
            <Text
              style={[
                styles.heroTitle,
                {color: theme === 'light' ? '#0f172a' : '#f8fafc'},
              ]}>
              Verify Information
            </Text>
            <Text
              style={[
                styles.heroDescription,
                {color: theme === 'light' ? '#64748b' : '#94a3b8'},
              ]}>
              Verify the content from various sources
            </Text>
          </View>

          <View style={styles.menuContainer}>
            <MenuItem
              icon="cpu"
              title="VerifAI Assistant"
              description="Set up your VerifAI Assistant"
              onPress={() => navigation.navigate('Assistant')}
            />
            <MenuItem
              icon="globe"
              title="VerifAI URL"
              description="Submit a link to verify"
              onPress={() => navigation.navigate('Url')}
            />
            {/* <MenuItem
              icon="search"
              title="URL Result Screen"
              description="Submit a link to verify"
              onPress={() => navigation.navigate('UrlResultScreen')}
            /> */}

            <MenuItem
              icon="upload"
              title="VerifAI Image"
              description="Upload a post screenshot to verify"
              onPress={() => navigation.navigate('Upload')}
            />

            <MenuItem
              icon="file-text"
              title="VerifAI Text"
              description="Enter or paste text to verify"
              onPress={() => navigation.navigate('Text')}
            />

            <MenuItem
              icon="clock"
              title="History"
              description="View your past verifications"
              onPress={() => navigation.navigate('History')}
            />
          </View>
        </View>
      </ScrollView>

     <Modal
  visible={privacyVisible}
  animationType="slide"
  transparent={true}
>
  <View style={{
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  }}>
    <View style={{
      backgroundColor: theme === 'light' ? '#fff' : '#1e293b',
      borderRadius: 12,
      maxHeight: '80%',
      width: '100%',
      padding: 16,
    }}>
      <ScrollView>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          Privacy Notice
        </Text>

      

        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          VerifAI (“we”, “our”, “the system”) is a mobile fact-checking assistant that analyzes text, screenshots, and online content to help users detect misinformation. This Privacy Notice explains how we collect, use, store, and protect your data.
        </Text>

        {/* 1. Data We Collect */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          1. Data We Collect
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          VerifAI may temporarily process:
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          • Screenshots or images submitted for fact-checking{"\n"}
          • Text extracted using OCR{"\n"}
          • Page names or post details detected in screenshots{"\n"}
          • Source credibility information{"\n"}
          • App usage information (local only)
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16, fontStyle: 'italic' }}>
          Important: All processed data is temporary and automatically removed after analysis unless stored locally in your device’s history.
        </Text>

        {/* 2. Local Storage Only */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          2. Local Storage Only
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          VerifAI does not upload your data to any cloud server. The only data saved is your fact-checking history, stored locally on your device. You may delete your entire history anytime inside the app. No screenshots or personal information are stored on any remote server.
        </Text>

        {/* 3. How We Use Your Data */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          3. How We Use Your Data
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          • Analyze screenshots and detect possible misinformation{"\n"}
          • Detect credentials of pages (e.g., verified badges){"\n"}
          • Provide fact-checking results{"\n"}
          • Improve app functionality (local-only){"\n"}
          We do not sell, share, or use your data for advertising.
        </Text>

        {/* 4. Data Retention */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          4. Data Retention
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          • Temporary data (screenshots, OCR text) is deleted immediately after analysis{"\n"}
          • Your local history remains only on your device until you manually delete it
        </Text>

        {/* 5. Data Sharing */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          5. Data Sharing
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          We do not share your data with advertisers, third-party analytics services, or external servers. Data stays completely inside your device.
        </Text>

        {/* 6. Your Rights */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 8 }}>
          6. Your Rights
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          • Delete your local history{"\n"}
          • Stop using the app anytime{"\n"}
          • Refuse permissions (which may limit app features){"\n"}
          No personal data is stored remotely, so no deletion request to servers is needed.
        </Text>

        {/* 7. Security Measures */}
        <Text style={{ fontWeight: 'bold', color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          7. Security Measures
        </Text>
        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          • No remote database or cloud storage is used{"\n"}
          • All processing happens locally or temporarily{"\n"}
          • No facial recognition data or biometrics are stored{"\n"}
          • History is kept only within the app local storage
        </Text>

       

        <Text style={{ color: theme === 'light' ? '#0f172a' : '#f8fafc', marginBottom: 16 }}>
          By using VerifAI, you agree to this Privacy Notice and understand that all data stays on your device unless you choose to save or delete it.
        </Text>

      </ScrollView>

     <View
  style={{
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12, // works in RN 0.71+
  }}
>
   <Button
    mode="outlined"
    onPress={() => BackHandler.exitApp()}
    style={{ flex: 1, borderRadius: 50, borderColor: theme === 'light' ? '#6C63FF' : '#6C63FF' }}
    textColor={theme === 'light' ? '#6C63FF' : '#6C63FF'}
  >
    Disagree
  </Button>
  <Button
    mode="contained"
    onPress={acceptPrivacy}
    style={{ flex: 1, borderRadius: 50, backgroundColor: '#6C63FF' }}
  >
    Accept
  </Button>

 
</View>

    </View>
  </View>
</Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  modeToggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  heroDescription: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  menuContainer: {
    width: '100%',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    height: 64,
  },
  menuIcon: {
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
  },
});

export default HomeScreen;

