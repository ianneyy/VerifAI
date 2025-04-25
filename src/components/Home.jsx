/* eslint-disable react-native/no-inline-styles */
'use client';

import { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
// Import the ThemeContext from App.tsx
import { ThemeContext } from '../../App';

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
      onPress={onPress}
    >
      <Icon name={icon} size={20} color="#1e3a8a" style={styles.menuIcon} />
      <View style={styles.menuTextContainer}>
        <Text style={[styles.menuTitle, { color: theme === 'light' ? '#0f172a' : '#f8fafc' }]}>{title}</Text>
        <Text style={[styles.menuDescription, { color: theme === 'light' ? '#64748b' : '#94a3b8' }]}>
          {description}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = () => {
  const navigation = useNavigation();
  const { theme } = useContext(ThemeContext);

  return (
    <SafeAreaView
      style={[
        styles.container,
        {backgroundColor: theme === 'light' ? '#f8fafc' : '#0f172a'},
      ]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, {color: '#1e3a8a'}]}>VerifAI</Text>
            <ModeToggle />
          </View>

          <View style={styles.heroSection}>
            <View style={styles.iconCircle}>
              <Icon name="check-circle" size={48} color="#1e3a8a" />
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
              icon="search"
              title="Check URL"
              description="Submit a link to verify"
              onPress={() => navigation.navigate('Url')}
            />

            <MenuItem
              icon="upload"
              title="Upload Image"
              description="Verify in an image"
              onPress={() => navigation.navigate('Upload')}
            />

            <MenuItem
              icon="file-text"
              title="Text Verification"
              description="Verify in text content"
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

