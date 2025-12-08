import React, { useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Keyboard } from 'react-native';

export default function NewItemForm({ onAdd, onCancel }) {

  const [newName, setNewName] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newCount, setNewCount] = useState("");

  const handleAddItem = () => {
    if (!newName.trim()) return; 
    
    onAdd(newName, newNote,parseInt(newCount,10));
    setNewName("");
    setNewNote("");
    setNewCount("");
    Keyboard.dismiss(); // 키보드 내리기
  };

  return (
    <View style={styles.overlay}>
        <View style={styles.newContainer}>
        <Text style={styles.title}>새 물품 추가</Text>
        
        <TextInput
            value={newName}
            onChangeText={setNewName}
            style={styles.input}
            placeholder='구매할 물품 이름 (예: 우유)'
            placeholderTextColor={"#aaa"}
            autoFocus={true}
        />

        <TextInput
            value={newCount}
            onChangeText={setNewCount}
            style={[styles.input, styles.noteInput]}
            placeholder='수량'
            placeholderTextColor={"#aaa"}
        />

        <TextInput
            value={newNote}
            onChangeText={setNewNote}
            style={[styles.input, styles.noteInput]}
            placeholder='메모 (선택사항)'
            placeholderTextColor={"#aaa"}
        />


        
        <View style={styles.buttonRow}>
            {/* 취소 버튼 */}
            <TouchableOpacity onPress={onCancel} style={[styles.button, styles.cancelButton]}>
                <Text style={styles.cancelText}>취소</Text>
            </TouchableOpacity>

            {/* 추가 버튼 */}
            <TouchableOpacity 
                onPress={handleAddItem} 
                style={[styles.button, styles.addButton, !newName.trim() && styles.disabledButton]}
                disabled={!newName.trim()}
            >
                <Text style={styles.addText}>추가</Text>
            </TouchableOpacity>
        </View>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // 배경을 살짝 어둡게 처리하는 옵션 (필요하면 사용)
  // overlay: { ...Styles.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' }, 
  
  newContainer: {
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 30, // 하단 여백 확보
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  title: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333',
  },
  input: {
    borderBottomWidth: 1, // 밑줄 스타일로 변경 (더 깔끔함)
    borderBottomColor: '#ddd',
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 15,
    color: '#333',
  },
  noteInput: {
      fontSize: 14,
      marginBottom: 25,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // 오른쪽 정렬
    gap: 15,
  },
  button: {
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      minWidth: 70,
      alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelText: {
      color: '#666',
      fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#5DADE2',
  },
  disabledButton: {
      backgroundColor: '#ccc',
  },
  addText: {
      color: '#fff',
      fontWeight: 'bold',
  },
});