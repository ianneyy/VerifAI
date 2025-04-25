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


const ImageUploadHelp = ({visible, onClose}) =>{

  // Verification levels with descriptions
  const verificationLevels = {
    100: {
      label: 'Real',
      color: '#4CD964', // Green
      description: 'Content matches writing style, and multiple articles.',
      range: '75-100',
    },
    75: {
      label: 'Likely Real',
      color: '#a3e635', // Light green
      description:
        'Content appears authentic but may have minor inconsistencies.',
      range: '60-74',
    },
    50: {
      label: 'Suspicious',
      color: '#FFCC00', // Yellow
      description:
        'Content has several red flags that question its authenticity.',
      range: '40-59',
    },
    25: {
      label: 'Likely False',
      color: '#fb923c', // Orange
      description: 'Content contains multiple elements that appear fabricated.',
      range: '20-39',
    },
    0: {
      label: 'Fake',
      color: '#FF3B30', // Red
      description:
        'Content is confirmed to be false or deliberately misleading.',
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
export default ImageUploadHelp;

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
