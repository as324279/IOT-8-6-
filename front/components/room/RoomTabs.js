// components/home/RoomTabs.js

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const CATEGORIES = ['전체', '거실', '주방', '욕실'];

// 부모(inventory.js)로부터 '현재 선택된 탭'과 '탭 변경 함수'를 props로 받음
export default function RoomTabs({ selectedCategory, onSelectCategory }) {
  return (
    <View style={styles.categoryContainer}>
      {CATEGORIES.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.categoryButton,
            selectedCategory === category && styles.categoryButtonActive,
          ]}
          onPress={() => onSelectCategory(category)} // 탭 클릭 시 부모의 state 변경
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category && styles.categoryTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// 카테고리 탭에만 필요한 스타일
const styles = StyleSheet.create({
  categoryContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  categoryButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryButtonActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#5AC8FA',
  },
  categoryText: {
    fontSize: 16,
    color: '#8e8e8e',
  },
  categoryTextActive: {
    fontSize: 16,
    color: '#333',
    fontWeight: 'bold',
  },
});