import React, { useState } from 'react';
import { Button, StyleSheet, TextInput, View } from 'react-native';

export default function NewItemForm({ onAdd, onCancel }) {

  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");

  const handleAddItem = () => {
    if (!newName.trim()) return; 
    

    onAdd(newName, newNote);
    
    setNewName("");
    setNewNote("");
  };

  return (
    <View style={styles.newContainer}>
      <TextInput
        label="이름"
        value={newName}
        onChangeText={setNewName}
        style={styles.input}
        placeholder='이름'
        placeholderTextColor={"#888"}
        autoFocus={true}
      />
      <TextInput
        label="메모"
        value={newNote}
        onChangeText={setNewNote}
        style={styles.input}
        placeholder='메모 (선택)'
        placeholderTextColor={"#888"}
      />
      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={onCancel} 
          style={[styles.addButton, styles.cancelButton]}
          color="#888"
          title="취소"
        />
        <Button
          mode="contained"
          onPress={handleAddItem} 
          style={styles.addButton}
          color="#53ACD9"
          title="추가"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fafafa',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 8,
  },
  addButton: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 4,
  },
  cancelButton: {
    backgroundColor: '#eee',
  },
  newContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  }
});