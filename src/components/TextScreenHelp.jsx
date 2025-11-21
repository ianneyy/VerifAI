import React, {useState, useContext} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {ThemeContext} from '../../App';






const Help = ({visible, onClose}) =>{

    const {theme} = useContext(ThemeContext);

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
  // Verification levels with descriptions
  const verificationLevels = {
    100: {
      label: 'High Credibility',
      color: '#4CD964', // Green
      description:
        'Writing style is credible and multiple trustworthy related news sources support the claim.',
      range: '100',
    },
    75: {
      label: 'Generally Credible',
      color: '#a3e635', // Light green
      description:
        'Writing appears credible and the claim is supported by one or more moderately reliable news sources.',
      range: '75-99',
    },
    60: {
      label: 'Credible with Exceptions',
      color: '#FFCC00', // Yellow
      description:
        'Writing may be credible, but little to no supporting news exists—or the related news lacks reliability.',
      range: '60-74',
    },
    40: {
      label: 'Questionnable',
      color: '#fb923c', // Orange
      description:
        'Writing style may not appear fake, but there are no credible related news sources backing the claim.',
      range: '40-59',
    },
    0: {
      label: 'Likely Fake',
      color: '#FF3B30', // Red
      description:
        'Both writing style and related news sources fail to support the claim. Content is likely fabricated.',
      range: '0-39',
    },
  };

  return (
    <View>
      {/* Help Modal */}
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        onRequestClose={onClose}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={[styles.modalContent, {backgroundColor}]}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Verification Levels Explained
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="x" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              {Object.entries(verificationLevels).map(
                ([level, {label, color, description, range}]) => (
                  <View
                    key={level}
                    style={[
                      styles.levelContainer,
                      {backgroundColor: `${color}20`}, // Using opacity for background
                    ]}>
                    <View style={styles.levelInfo}>
                      <Text style={[styles.levelTitle, {color}]}>
                        {range}% - {label}
                      </Text>
                      <Text style={styles.levelDescription}>{description}</Text>
                    </View>
                  </View>
                ),
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
};
export default Help;

const styles = StyleSheet.create({
  helpButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: StatusBar.currentHeight || 0,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 12,
    padding: 12,

    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalBody: {
    padding: 16,
  },
  levelContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 14,
    color: '#666',
  },
});
