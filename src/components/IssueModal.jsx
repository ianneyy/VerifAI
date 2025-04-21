import React from 'react';
import { Modal, View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

const IssueModal = ({ visible, onClose, title, message, reason1, reason2 }) => (
  <Modal
    transparent
    animationType="fade"
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{title}</Text>
       <View style={styles.modalText}>
        <Text>{message}</Text>
         </View>

        <Text style={styles.modalOtherReasons}>Other Possible Reasons:</Text>
        <Text style={styles.modalOtherReasons1}>1. {reason1}</Text>
        <Text style={styles.modalOtherReasons1}>2. {reason2}</Text>

        <TouchableOpacity onPress={onClose} style={styles.modalButton}>
          <Text style={styles.modalButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default IssueModal;

const styles = StyleSheet.create({
   modalText: {
    borderLeftWidth: 3,
    borderLeftColor: '#FF797B',
    padding: 5,
    marginVertical: 5,
   },
   modalOtherReasons: {
    fontSize: 15,
   },
   modalOtherReasons1: {
    fontSize: 13,
   },
  modalOverlay: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'rgba(0,0,0,0.5)',
},
modalButton: {
     alignSelf: 'flex-end', // pushes the button to the right
  paddingHorizontal: 12,
  paddingVertical: 8,
//   backgroundColor: '#3ead6f',
  borderRadius: 8,
  marginTop: 16,
},
modalContent: {
  backgroundColor: '#fff',
  padding: 20,
  borderRadius: 10,
  width: '80%',
},
modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  marginBottom: 10,
},
modalReason: {
  fontSize: 16,
  marginBottom: 20,
  color: '#333',
},
closeButton: {
  backgroundColor: '#3ead6f',
  padding: 10,
  borderRadius: 5,
  alignItems: 'center',
},
closeButtonText: {
  color: '#fff',
  fontWeight: 'bold',
},

});
