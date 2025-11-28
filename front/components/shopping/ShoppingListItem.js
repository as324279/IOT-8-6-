import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Checkbox } from 'react-native-paper';

export default function ShoppingListItem({ item, onToggleSelect, onQuantityChange }) {

  const itemContainerStyle = [
    styles.List,
    item.isCompleted && styles.listCompleted, // [수정] 완료된 항목 스타일 (투명도 등)
    item.isSelected && styles.listSelected    // [수정] 선택된 항목 스타일 (테두리 색상 등)
  ];
  
  const itemNameStyle = [
    styles.Name,
    item.isCompleted && styles.nameCompleted // [수정] 완료된 항목 취소선
  ];

  return (
    <View style={itemContainerStyle}>
      <View style={styles.ListLeft}>
        {/* 체크박스는 선택 여부(isSelected)를 제어 */}
        <Checkbox
          status={item.isSelected ? 'checked' : 'unchecked'}
          onPress={onToggleSelect} 
          color="#5DADE2" // 메인 컬러와 통일
        />
        <View style={styles.textContainer}>
          <Text style={itemNameStyle} numberOfLines={1} ellipsizeMode="tail">
            {item.name}
          </Text>
          {item.note ? <Text style={styles.Note} numberOfLines={1}>{item.note}</Text> : null}
        </View>
      </View>

      {/* [수정] 구매 완료된 항목이 아닐 때만 수량 조절 버튼 표시 */}
      {!item.isCompleted && (
        <View style={styles.ListRight}>
          <TouchableOpacity 
            onPress={() => onQuantityChange(-1)} 
            style={styles.qtyButton} // 스타일 추가
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // 터치 영역 확장
          >
            <Ionicons name="remove" size={16} color="#555" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            onPress={() => onQuantityChange(1)} 
            style={styles.qtyButton} // 스타일 추가
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}} // 터치 영역 확장
          >
            <Ionicons name="add" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  List: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12, // 조금 더 둥글게
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f0f0f0', // 연한 테두리
    elevation: 1, // 살짝 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  listSelected: {
    borderColor: '#5DADE2', // 선택 시 파란 테두리
    backgroundColor: '#F0F9FF', // 아주 연한 파란 배경
  },
  listCompleted: {
    opacity: 0.6, // 완료된 항목은 흐리게
    backgroundColor: '#f9f9f9',
  },
  ListLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // 이름이 길어지면 공간 차지하도록
  },
  textContainer: {
    marginLeft: 8,
    flex: 1, // 텍스트가 길어지면 줄바꿈 혹은 자르기 위해
  },
  ListRight: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5', // 수량 조절 배경색
    borderRadius: 20,
    paddingHorizontal: 6,
    paddingVertical: 4,
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
    elevation: 1, // 버튼 그림자
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    minWidth: 24,
    textAlign: 'center',
    marginHorizontal: 4,
  },
});