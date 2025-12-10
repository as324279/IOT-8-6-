import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons'; 

// onLongPressCategory prop 추가
const RoomTabs = ({ categories, selectedCategory, onSelectCategory, onAddCategory, onLongPressCategory }) => {
  
  return (
    <View style={styles.wrapper}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={category.locationId ?? `all-${index}`}
            style={[
              styles.tab,
              selectedCategory?.locationId === category.locationId && styles.selectedTab
            ]}
            onPress={() => onSelectCategory(category)}
            // ▼▼▼ 꾹 누르기 연결 (전체 탭이 아닐 때만) ▼▼▼
            onLongPress={() => {
              // category.locationId가 있는 경우(전체가 아닌 경우)에만 동작
              if (category.locationId && onLongPressCategory) {
                onLongPressCategory(category);
              }
            }}
            delayLongPress={500} 
            // ▲▲▲
          >
            <Text
              style={[
                styles.tabText,
                selectedCategory?.locationId === category.locationId && styles.selectedTabText
              ]}
            >
              {category.name}
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
  wrapper: { height: 50, marginTop: 10, marginBottom: 10 },
  container: { flex: 1 },
  contentContainer: { paddingHorizontal: 15, alignItems: 'center' },
  tab: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, backgroundColor: '#FFFFFF', marginRight: 10, justifyContent: 'center', alignItems: 'center' },
  addTab: { paddingHorizontal: 12, backgroundColor: '#FFFFFF' },
  selectedTab: { backgroundColor: '#5DADE2' },
  tabText: { fontSize: 16, color: '#555', fontWeight: '600' },
  selectedTabText: { color: '#fff' },
});

export default RoomTabs;