/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList, StyleSheet, Button} from 'react-native';

 import {
   initDB,
   insertFactCheck,
   insertRelatedNews,
   getAllFactChecks,
   getRelatedNews,
 } from '../js/database';

const History = () => {
    const [factChecks, setFactChecks] = useState([]);

    useEffect(() => {
    const setup = async () => {
        console.log('📦 Initializing database...');

        await initDB();

        const all = await getAllFactChecks();
        setFactChecks(all);
    };

    setup();
    }, []);
  

    const renderItem = ({item}) => (
      <View style={styles.card}>
        <View
          style={{
            backgroundColor: 'blue',
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            overflow: 'hidden',
            gap: 12,
            padding: 12,
          }}>
          <Text style={{color: 'white', textAlign: 'center'}}>
            {item.verdict}
          </Text>

          <Text style={{overflow: 'hidden'}}>{item.claim}</Text>
        </View>
        {/* <Text style={styles.title}>Claim:</Text>
        <Text>{item.claim}</Text>
        <Text>Gauge Score: {item.verdict}</Text>
        <Text> Source Score: {item.source_score}</Text>
        <Text>Source: {item.source}</Text>
        <Text>Writing Style: {item.writing_style}</Text>
        <Text>Matched Article: {item.matched_article}</Text>
        <Text>Face Recognition: {item.face_recognition}</Text>
        <Text>Matched person: {item.matched_person}</Text> */}
      </View>
    );
    return (
      <View style={styles.container}>
        <Text style={styles.header}>History</Text>
        <FlatList
          data={factChecks}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      </View>
    );
};

export default History;

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20},
  header: {fontSize: 24, fontWeight: 'bold', marginBottom: 10},
  card: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    marginVertical: 8,
    borderRadius: 10,
  },
  title: {fontWeight: 'bold', marginTop: 5},
});