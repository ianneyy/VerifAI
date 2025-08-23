/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

const InstructionModal = ({ visible, onClose }) => {
  return (
    <Modal animationType="fade" transparent={true} visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>How to Use VeriFAI</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Icon name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            contentContainerStyle={styles.scrollContent} 
            showsVerticalScrollIndicator={false}
          >
            {/* How it works section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>How it works</Text>
              <View style={styles.stepContainer}>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>1</Text>
                  </View>
                  <Text style={styles.stepText}>Upload a post screenshot</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>2</Text>
                  </View>
                  <Text style={styles.stepText}>Extract and analyze text content</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>3</Text>
                  </View>
                  <Text style={styles.stepText}>Find matching articles and verify sources</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>4</Text>
                  </View>
                  <Text style={styles.stepText}>Analyze writing style patterns</Text>
                </View>
                <View style={styles.step}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>5</Text>
                  </View>
                  <Text style={styles.stepText}>Identify public figures when present</Text>
                </View>
              </View>
            </View>

            {/* Best practices section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Best practices</Text>
              
              <View style={styles.practiceCard}>
                <Text style={styles.practiceTitle}>Recommended</Text>
                <Text style={styles.practiceItem}>Use high-quality screenshots</Text>
                <Text style={styles.practiceItem}>Include complete post content</Text>
                <Text style={styles.practiceItem}>Keep publisher names visible</Text>
                <Text style={styles.practiceItem}>Upload social media posts</Text>
              </View>

              <View style={styles.avoidCard}>
                <Text style={styles.avoidTitle}>Avoid</Text>
                <Text style={styles.avoidItem}>Cropping out important details</Text>
                <Text style={styles.avoidItem}>Uploading unrelated images</Text>
                <Text style={styles.avoidItem}>Using blurry screenshots</Text>
              </View>
            </View>

            {/* Content types section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Ideal content types</Text>
              <View style={styles.contentTypes}>
                <View style={styles.contentType}>
                  <Text style={styles.contentTypeTitle}>Social Posts</Text>
                  <Text style={styles.contentTypeDesc}>Facebook, Twitter, Instagram posts</Text>
                </View>
                <View style={styles.contentType}>
                  <Text style={styles.contentTypeTitle}>Shared News</Text>
                  <Text style={styles.contentTypeDesc}>Articles shared on social feeds</Text>
                </View>
                <View style={styles.contentType}>
                  <Text style={styles.contentTypeTitle}>Fact Claims</Text>
                  <Text style={styles.contentTypeDesc}>Posts claiming facts or events</Text>
                </View>
                <View style={styles.contentType}>
                  <Text style={styles.contentTypeTitle}>Trending Topics</Text>
                  <Text style={styles.contentTypeDesc}>Viral or questionable claims</Text>
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer button */}
          <TouchableOpacity style={styles.primaryButton} onPress={onClose}>
            <Text style={styles.primaryButtonText}>Get Started</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  stepContainer: {
    gap: 12,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    paddingTop: 2,
  },
  practiceCard: {
    backgroundColor: '#f0fdf4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#22c55e',
  },
  practiceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
    marginBottom: 8,
  },
  practiceItem: {
    fontSize: 13,
    color: '#166534',
    marginBottom: 4,
    paddingLeft: 8,
  },
  avoidCard: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  avoidTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  avoidItem: {
    fontSize: 13,
    color: '#991b1b',
    marginBottom: 4,
    paddingLeft: 8,
  },
  contentTypes: {
    gap: 12,
  },
  contentType: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#94a3b8',
  },
  contentTypeTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 2,
  },
  contentTypeDesc: {
    fontSize: 12,
    color: '#64748b',
    lineHeight: 16,
  },
  primaryButton: {
    backgroundColor: '#6C63FF',
    marginHorizontal: 24,
    marginVertical: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#6C63FF',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
    letterSpacing: -0.2,
  },
});