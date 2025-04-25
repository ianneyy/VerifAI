import React, {useState} from 'react';
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


const Help = ({visible, onClose}) =>{

  // Verification levels with descriptions
  const verificationLevels = {
    100: {
      label: 'Real',
      color: '#4CD964', // Green
      description: 'Writing style is credible and multiple trustworthy related news sources support the claim.',
      range: '75-100',
    },
    75: {
      label: 'Likely Real',
      color: '#a3e635', // Light green
      description:
        'Writing appears credible and the claim is supported by one or more moderately reliable news sources.',
      range: '60-74',
    },
    50: {
      label: 'Suspicious',
      color: '#FFCC00', // Yellow
      description:
        'Writing may be credible, but little to no supporting news exists—or the related news lacks reliability.',
      range: '40-59',
    },
    25: {
      label: 'Likely False',
      color: '#fb923c', // Orange
      description: 'Writing style may not appear fake, but there are no credible related news sources backing the claim.',
      range: '20-39',
    },
    0: {
      label: 'Fake',
      color: '#FF3B30', // Red
      description:
        'Both writing style and related news sources fail to support the claim. Content is likely fabricated.',
      range: '0-19',
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
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Verification Levels Explained
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="x" size={24} color="#000" />
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
    backgroundColor: 'white',
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
    fontSize: 18,
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
