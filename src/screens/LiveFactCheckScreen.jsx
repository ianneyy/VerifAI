import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function LiveFactCheckScreen() {
  const [isEnabled, setIsEnabled] = useState(false);
  const toggleSwitch = () => setIsEnabled(previousState => !previousState);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>Live Fact-Check</Text>
        
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleText}>Floating Fact-Check Button</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#a882ff" }}
            thumbColor={isEnabled ? "#6200ee" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        
        <Text style={styles.description}>
          When enabled, a floating button will appear on your screen that allows you to fact-check content in real-time while using other apps
        </Text>
        
        <View style={styles.demoContainer}>
          <Text style={styles.demoTitle}>Preview</Text>
          <View style={styles.phoneFrame}>
            <View style={styles.phoneContent}>
              <Text style={styles.demoText}>Social Media App</Text>
              {isEnabled && (
                <View style={styles.floatingButton}>
                  <Icon name="fact-check" size={24} color="#fff" />
                </View>
              )}
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginHorizontal: 20,
    lineHeight: 20,
  },
  demoContainer: {
    flex: 1,
    marginTop: 20,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 16,
    color: '#333',
  },
  phoneFrame: {
    width: 220,
    height: 400,
    backgroundColor: '#333',
    borderRadius: 24,
    padding: 12,
    overflow: 'hidden',
  },
  phoneContent: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    position: 'relative',
  },
  demoText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 20,
  },
  floatingButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6200ee',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
  },
});