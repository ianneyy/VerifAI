/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Button } from 'react-native-paper';

const EulaModal = ({ visible, onAgree, onCancel, theme }) => {
  const textColor = theme === 'light' ? '#0f172a' : '#f1f5f9';
  const bgColor = theme === 'light' ? '#ffffff' : '#1e293b';

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={[styles.container, {backgroundColor: bgColor}]}>
          <Text style={[styles.title, {color: textColor}]}>End-User License Agreement</Text>

          <ScrollView style={{maxHeight: 300}}>
            <Text style={[styles.content, {color: textColor}]}>
              By enabling the VerifAI Assistant, you agree that the app may analyze
              text content on your screen to provide fact-checking insights. No
              screenshots or personal data are stored. The assistant only processes
              text temporarily for analysis.
              {'\n\n'}
              You acknowledge that this tool provides suggestions and may not be
              100% accurate. Always verify important information manually.
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
              onPress={onCancel}
              style={{ flex: 1, borderRadius: 50, borderColor: theme === 'light' ? '#6C63FF' : '#6C63FF' }}
              textColor={theme === 'light' ? '#6C63FF' : '#6C63FF'}
            >
              Disagree
            </Button>
            <Button

              mode="contained"
              onPress={onAgree}
              style={{ flex: 1, borderRadius: 50, backgroundColor: '#6C63FF' }}
            >
              Accept
            </Button>
          
           
          </View>

          

        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  container: {
    width: '90%',
    borderRadius: 16,
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  cancelBtn: {
    padding: 10,
    marginRight: 10,
  },
  cancelText: {
    color: '#64748b',
    fontWeight: '600',
  },
  agreeBtn: {
    padding: 10,
    backgroundColor: '#6C63FF',
    borderRadius: 8,
  },
  agreeText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default EulaModal;
