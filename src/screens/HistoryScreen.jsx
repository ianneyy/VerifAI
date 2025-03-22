import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HistoryScreen() {
  const historyData = [
    { id: '1', title: 'Climate change article', source: 'cnn.com', date: '2 hours ago', result: 'Reliable' },
    { id: '2', title: 'Political statement image', source: 'Upload', date: 'Yesterday', result: 'Misleading' },
    { id: '3', title: 'COVID-19 statistics', source: 'who.int', date: '3 days ago', result: 'Reliable' },
    { id: '4', title: 'Celebrity news', source: 'dailynews.com', date: '1 week ago', result: 'False' },
  ];

  const renderItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View style={styles.historyContent}>
        <Text style={styles.historyTitle}>{item.title}</Text>
        <Text style={styles.historySource}>Source: {item.source}</Text>
        <Text style={styles.historyDate}>{item.date}</Text>
      </View>
      <View style={[
        styles.resultBadge, 
        item.result === 'Reliable' ? styles.reliableBadge : 
        item.result === 'Misleading' ? styles.misleadingBadge : 
        styles.falseBadge
      ]}>
        <Text style={styles.resultText}>{item.result}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        <Text style={styles.title}>History</Text>
        <FlatList
          data={historyData}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          style={styles.list}
        />
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
  list: {
    flex: 1,
  },
  historyItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  historySource: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  historyDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  resultBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  reliableBadge: {
    backgroundColor: '#e6f7ed',
  },
  misleadingBadge: {
    backgroundColor: '#fff3e0',
  },
  falseBadge: {
    backgroundColor: '#ffebee',
  },
  resultText: {
    fontSize: 12,
    fontWeight: '600',
  },
});