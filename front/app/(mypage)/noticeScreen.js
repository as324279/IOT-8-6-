import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function NoticeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>공지사항 준비중입니다.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    color: '#555',
  },
});