import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function ShoppingListItem({ item, onToggleSelect, onQuantityChange, onDelete }) {

  const itemContainerStyle = [
    styles.List,
    item.isCompleted && styles.listCompleted,
    item.isSelected && styles.listSelected
  ];
  
  const itemNameStyle = [
    styles.Name,
    item.isCompleted && styles.nameCompleted
  ];

  return (
    <View style={itemContainerStyle}>
      <View style={styles.ListLeft}>
        <Checkbox
          status={item.isSelected ? 'checked' : 'unchecked'}
          onPress={onToggleSelect} 
          color="#5DADE2"
        />
        <View style={styles.textContainer}>
          <Text style={itemNameStyle} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.note ? <Text style={styles.Note} numberOfLines={1}>{item.note}</Text> : null}
        </View>
      </View>

      {/* 구매 완료가 아닐 때만 수량 변경 */}
      {!item.isCompleted && (
        <View style={styles.ListRight}>
          <TouchableOpacity 
            onPress={() => onQuantityChange(-1)} 
            style={styles.qtyButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="remove" size={16} color="#555" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            onPress={() => onQuantityChange(1)} 
            style={styles.qtyButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}
          >
            <Ionicons name="add" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      )}

      {/* ❌ 삭제 버튼 */}
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Ionicons name="close" size={22} color="#D9534F" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  List: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listSelected: {
    borderColor: '#5DADE2',
    backgroundColor: '#F0F9FF',
  },
  listCompleted: {
    opacity: 0.6,
    backgroundColor: '#f9f9f9',
  },
  ListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textContainer: {
    marginLeft: 8,
    flex: 1,
  },
  ListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 8,
  },
  Name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  nameCompleted: {
    textDecorationLine: 'line-through',
    color: '#aaa',
  },
  Note: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  qtyButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 1,
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 4,
  },

  /** 삭제 버튼 */
  deleteButton: {
    padding: 6,
  },
});
