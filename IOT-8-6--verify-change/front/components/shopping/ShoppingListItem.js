import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function ShoppingListItem({ item, onToggleSelect, onQuantityChange }) {

  const itemContainerStyle = [
    styles.List,
    item.isSelected && styles.listSelected 
  ];
  const itemNameStyle = [
    styles.Name,
    item.isSelected && styles.nameSelected 
  ];

  return (
    <View style={itemContainerStyle}>
      <View style={styles.ListLeft}>
        <Checkbox
          status={item.isSelected ? 'checked' : 'unchecked'}
          onPress={onToggleSelect} 
          color="#7DBCE9"
        />
        <View>
          <Text style={itemNameStyle}>{item.name}</Text>
          <Text style={styles.Note}>{item.note}</Text>
        </View>
      </View>

      <View style={styles.ListRight}>
        <TouchableOpacity onPress={() => onQuantityChange(-1)}>
          <Ionicons name="remove-outline" size={20} color="#666" />
        </TouchableOpacity>
        <Text style={styles.quantityText}>{item.quantity}</Text>
        <TouchableOpacity onPress={() => onQuantityChange(1)}>
          <Ionicons name="add-outline" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  List: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#eee',
  },
  listSelected: { // 물품 반투명
    opacity: 0.6,
  },
  ListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  ListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  Name: {
    fontWeight: 'bold',
    color: '#333'
  },
  nameSelected: { // 물품 취소선
    textDecorationLine: 'line-through',
    color: '#888',
  },
  Note: {
    fontSize: 12,
    color: '#888'
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
});