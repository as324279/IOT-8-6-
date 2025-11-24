import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopHeader from "../components/TopHeader";
import {
  Alert, Modal, TextInput, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RoomTabs from "../components/room/RoomTabs";

// 샘플 데이터
const ALL_ITEMS = [
  { id: 1, name: "콩나물", location: "주방" },
  { id: 2, name: "햇반", location: "주방" },
  { id: 3, name: "샴푸", location: "욕실" },
  { id: 4, name: "물티슈", location: "거실" },
  { id: 5, name: "두부", location: "주방" },
  { id: 6, name: "휴지", location: "거실" },
  { id: 7, name: "치약", location: "욕실" },
];

const ItemCard = ({ item }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/itemDetail?id=${item.id}`);
  };
  return (
    <TouchableOpacity style={styles.itemCard}>
      <View style={styles.itemImagePlaceholder} />
      <Text style={styles.itemText}>{item.name}</Text>

      <TouchableOpacity onPress={handlePress}>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

export default function InventoryScreen() {
  const router = useRouter();

  const [categories, setCategories] = useState([
    "전체",
    "거실",
    "주방",
    "욕실",
  ]);
  const [selectedCategory, setSelectedCategory] = useState("전체");

  // [추가] 장소 추가 모달 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  // [추가] 장소 추가 함수
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      Alert.alert("오류", "장소 이름을 입력해주세요.");
      return;
    }
    if (categories.includes(newCategoryName)) {
      Alert.alert("오류", "이미 존재하는 장소입니다.");
      return;
    }

    setCategories([...categories, newCategoryName]); // 목록에 추가
    setSelectedCategory(newCategoryName); // 추가된 장소 선택
    setNewCategoryName("");
    setIsAddModalVisible(false);
  };

  const filteredItems = useMemo(() => {
    // '전체' 탭이면 모든 아이템 반환
    if (selectedCategory === "전체") {
      return ALL_ITEMS;
    }
    // 장소에 있는 물품만
    return ALL_ITEMS.filter((item) => item.location === selectedCategory);
  }, [selectedCategory]);

  const handleAddItemPress = () => {
    // 물품추가 페이지
    console.log("물품 추가 페이지로 이동");
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopHeader
        showBack={true}
        showIcons={true}
        title="채움" 
      />

      <View style={styles.container}>
        <RoomTabs
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={() => setIsAddModalVisible(true)} 
        />

        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {filteredItems.map((item) => (
            <ItemCard key={item.id} item={item} />
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={handleAddItemPress}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        <Modal
          transparent={true}
          visible={isAddModalVisible}
          onRequestClose={() => setIsAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>새 장소 추가</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="예: 베란다, 서재"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.cancelButton}>
                  <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddCategory} style={styles.addButton}>
                  <Text style={{color: 'white'}}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// 스타일 시트
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  // 물품 목록
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9F0",
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 16,
    borderRadius: 10,

    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e9e9e9",
    marginRight: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
  },
  // 물품 추가 버튼
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5AC8FA",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    padding: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#5AC8FA',
    borderRadius: 5,
  },
});
