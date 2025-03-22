/* eslint-disable react-native/no-inline-styles */
'use client'

import React, { useState, useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Switch, Alert } from 'react-native'
import Icon from 'react-native-vector-icons/Feather'
import { useNavigation } from '@react-navigation/native'

// Import the ThemeContext from HomeScreen (in a real app, this would be in a separate file)
const ThemeContext = React.createContext({
  theme: 'light',
  toggleTheme: () => {},
})

// Setting item component with toggle
const SettingToggle = ({ icon, title, description, value, onValueChange }) => {
  const { theme } = useContext(ThemeContext)

  return (
    <View
      style={[
        styles.settingItem,
        {
          backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
          borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
        },
      ]}
    >
      <View style={styles.settingContent}>
        <Icon name={icon} size={20} color="#1e3a8a" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme === 'light' ? '#0f172a' : '#f8fafc' }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: theme === 'light' ? '#64748b' : '#94a3b8' }]}>
            {description}
          </Text>
        </View>
      </View>
      <Switch
        trackColor={{ false: '#cbd5e1', true: '#93c5fd' }}
        thumbColor={value ? '#1e3a8a' : '#f1f5f9'}
        ios_backgroundColor="#cbd5e1"
        onValueChange={onValueChange}
        value={value}
      />
    </View>
  )
}

// Setting item component with action
const SettingAction = ({ icon, title, description, onPress }) => {
  const { theme } = useContext(ThemeContext)

  return (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: theme === 'light' ? '#ffffff' : '#1e293b',
          borderColor: theme === 'light' ? '#e2e8f0' : '#334155',
        },
      ]}
      onPress={onPress}
    >
      <View style={styles.settingContent}>
        <Icon name={icon} size={20} color="#1e3a8a" style={styles.settingIcon} />
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, { color: theme === 'light' ? '#0f172a' : '#f8fafc' }]}>{title}</Text>
          <Text style={[styles.settingDescription, { color: theme === 'light' ? '#64748b' : '#94a3b8' }]}>
            {description}
          </Text>
        </View>
      </View>
      <Icon name="chevron-right" size={20} color={theme === 'light' ? '#64748b' : '#94a3b8'} />
    </TouchableOpacity>
  )
}

// Section header component
const SectionHeader = ({ title }) => {
  const { theme } = useContext(ThemeContext)

  return <Text style={[styles.sectionHeader, { color: theme === 'light' ? '#64748b' : '#94a3b8' }]}>{title}</Text>
}

const SettingsScreen = () => {
  const navigation = useNavigation()
  const { theme } = useContext(ThemeContext)

  // State for toggles
  const [aiAssistantEnabled, setAiAssistantEnabled] = useState(true)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [dataCollectionEnabled, setDataCollectionEnabled] = useState(true)

  // Handle AI assistant toggle
  const handleAiAssistantToggle = (value) => {
    setAiAssistantEnabled(value)
    if (value) {
      Alert.alert(
        'AI Assistant Enabled',
        'The AI assistant will now provide real-time fact-checking suggestions and insights.',
      )
    } else {
      Alert.alert('AI Assistant Disabled', 'You can re-enable the AI assistant at any time from settings.')
    }
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'light' ? '#f8fafc' : '#0f172a' }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme === 'light' ? '#0f172a' : '#f8fafc'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme === 'light' ? '#0f172a' : '#f8fafc' }]}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          {/* AI Features Section */}
          <SectionHeader title="AI FEATURES" />

          <SettingToggle
            icon="cpu"
            title="AI Assistant"
            description="Enable AI-powered fact-checking assistant"
            value={aiAssistantEnabled}
            onValueChange={handleAiAssistantToggle}
          />

          <SettingAction
            icon="sliders"
            title="Assistant Preferences"
            description="Customize AI assistant behavior"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />

          <SettingAction
            icon="database"
            title="Knowledge Sources"
            description="Manage trusted fact-checking sources"
            onPress={() => Alert.alert('Coming Soon', 'This feature will be available in a future update.')}
          />

          {/* App Settings Section */}
          <SectionHeader title="APP SETTINGS" />

          <SettingToggle
            icon="bell"
            title="Notifications"
            description="Receive alerts about fact checks"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
          />

          <SettingToggle
            icon="bar-chart-2"
            title="Data Collection"
            description="Help improve our fact-checking accuracy"
            value={dataCollectionEnabled}
            onValueChange={setDataCollectionEnabled}
          />

          <SettingAction
            icon="hard-drive"
            title="Storage & Cache"
            description="Manage app data and storage usage"
            onPress={() => Alert.alert('Storage Info', 'App is currently using 24MB of storage.')}
          />

          {/* Account Section */}
          <SectionHeader title="ACCOUNT" />

          <SettingAction
            icon="user"
            title="Account Information"
            description="Manage your profile and preferences"
            onPress={() => Alert.alert('Account Info', 'You are signed in as a guest user.')}
          />

          <SettingAction
            icon="shield"
            title="Privacy & Security"
            description="Manage your data and security settings"
            onPress={() => Alert.alert('Privacy Settings', 'Your data is secure and private.')}
          />

          <SettingAction
            icon="help-circle"
            title="Help & Support"
            description="Get assistance with using the app"
            onPress={() => Alert.alert('Help & Support', 'Contact us at support@factcheck.app')}
          />

          <SettingAction
            icon="info"
            title="About"
            description="App version and legal information"
            onPress={() => Alert.alert('About FactCheck', 'Version 1.0.0\n© 2025 FactCheck Inc.')}
          />

          <TouchableOpacity
            style={[styles.signOutButton, { backgroundColor: theme === 'light' ? '#fee2e2' : '#7f1d1d' }]}
            onPress={() =>
              Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive' },
              ])
            }
          >
            <Text style={[styles.signOutText, { color: theme === 'light' ? '#b91c1c' : '#fecaca' }]}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: theme === 'light' ? '#94a3b8' : '#64748b' }]}>
            FactCheck v1.0.0
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

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
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  signOutButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 16,
  },
  signOutText: {
    fontWeight: '600',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  },
})

export default SettingsScreen

