/* eslint-disable react-native/no-inline-styles */
/* eslint-disable jsx-quotes */
import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const InstructionModal = ({ visible, onClose }) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>How to Use VeriFAI Image Scan</Text>

            <Text style={styles.sectionTitle}>How VeriFAI Works</Text>
            <Text style={styles.bullet}>1. You upload a post screenshot.</Text>
            <Text style={styles.bullet}>
              2. VeriFAI extracts and analyzes the text.
            </Text>
            <Text style={styles.bullet}>
              3. It finds matching articles and checks source credibility
            </Text>
            <Text style={styles.bullet}>
              4. It analyzes the writing style to see if it matches how real
              news is usually written.
            </Text>
            <Text style={styles.bullet}>
              5. If there's a face, it attempts recognition of public figures.
            </Text>

            <Text style={styles.sectionTitle}>Quick Do's & Don'ts</Text>

            <View
              style={{
                borderLeftWidth: 5,
                borderLeftColor: '#69fa92',
                gap: 10,
                marginBottom: 12,
                padding: 5,
                backgroundColor: '#dcf5e3',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Upload public social media post screenshots.
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Use high-quality screenshots.
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Include all relevant parts of the post.
                </Text>
              </View>
            </View>
            <View
              style={{
                borderLeftWidth: 5,
                borderLeftColor: '#FF797B',
                backgroundColor: '#f7d0d0',
                gap: 10,
                padding: 5,
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Crop out names, publisher, or page name.
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Upload random memes or photos not related to news or facts
                </Text>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Ideal Content Types</Text>
            <View
              style={{
                borderLeftWidth: 5,
                borderLeftColor: '#69fa92',
                gap: 10,
                marginBottom: 12,
                padding: 5,
                backgroundColor: '#dcf5e3',
              }}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Social media posts (FB, X, IG).
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  News shared on social feeds.
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Posts claiming facts, events, or news stories.
                </Text>
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={[styles.bullet]}>
                  Screenshots of questionnable claims or trending topics
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default InstructionModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },
  scrollContent: {
    paddingBottom: 20,

  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 15,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
  },
  bullet: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
