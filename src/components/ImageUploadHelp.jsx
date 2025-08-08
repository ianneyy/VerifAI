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
    label: 'High Credibility',
    color: '#4CD964', // Green
    description:
      'Matches trusted sources in style, facts, and multiple articles. Adheres to all major credibility and transparency standards.',
    range: '100',
  },
  75: {
    label: 'Generally Credible',
    color: '#a3e635', // Light green
    description:
      'Mostly credible and aligns with reliable sources, though some details or coverage may be incomplete.',
    range: '75-99',
  },
  60: {
    label: 'Credible with Exceptions',
    color: '#FFCC00', // Yellow
    description:
      'Generally credible but with notable issues — such as writing inconsistencies, questionable sources, or contextual mismatches.',
    range: '60-74',
  },
  40: {
    label: 'Proceed with Caution',
    color: '#fb923c', // Orange
    description:
      'Contains multiple questionable elements or factual inconsistencies that undermine reliability.',
    range: '40-59',
  },
  0: {
    label: 'Proceed with Maximum Caution',
    color: '#FF3B30', // Red
    description:
      'Confirmed false, misleading, or shows severe disregard for credibility standards.',
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
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Verification Levels Explained
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="x" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              {Object.entries(verificationLevels).reverse().map(
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
    backgroundColor: '#0f172a',
    borderRadius: 12,
    overflow: 'hidden',
    paddingBottom: 16,
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
    color: '#fff',
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
    color: '#d4d4d4',
  },
});
