import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

const RoomTabs = ({ categories, selectedCategory, onSelectCategory, onAddCategory }) => {
  
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {categories.map((category) => (
          <TouchableOpacity
            key={category}
            style={[
              styles.tab,
              selectedCategory === category && styles.selectedTab
            ]}
            onPress={() => onSelectCategory(category)}
          >
            <Text style={[
              styles.tabText,
              selectedCategory === category && styles.selectedTabText
            ]}>
              {category}
            </Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={[styles.tab, styles.addTab]} onPress={onAddCategory}>
           <MaterialIcons name="add" size={20} color="#555" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
      height: 50,
      marginTop: 10,
      marginBottom: 10,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: '#f0f0f0', 
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // 추가버튼 
  addTab: {
      paddingHorizontal: 12, 
      backgroundColor: '#e0e0e0', 
  },
  selectedTab: {
    backgroundColor: '#5DADE2',
  },
  // 기본 탭 글자
  tabText: {
    fontSize: 16,
    color: '#555',
    fontWeight: '600',
  },
  // 선택된 탭 글자
  selectedTabText: {
    color: '#fff',
  },
});

export default RoomTabs;