import React, { useCallback, useState } from "react";
import { View, Text, TouchableOpacity, Modal, TextInput, ScrollView, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as ImagePicker from "expo-image-picker";

import TopHeader from "../components/TopHeader";
import RoomTabs from "../components/room/RoomTabs";
import ItemCard from "../components/ItemCard";
import { useInventoryLogic } from "../hooks/useInventoryLogic";


const InventoryScreen = () => {
  const router = useRouter();
  const { group_id } = useLocalSearchParams();

  const {
    categories,
    selectedCategory,
    setSelectedCategory,
    items,
    getLocations,
    getItems,
    addCategory,
    updateQuantity,
    deleteCategory // 삭제 함수 가져오기
  } = useInventoryLogic(group_id);

  const [openMenu, setOpenMenu] = useState(false);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  useFocusEffect(
    useCallback(() => {
      getLocations();
      getItems();
    }, [selectedCategory])
  );

  const onConfirmAddCategory = async () => {
    const success = await addCategory(newCategoryName);
    if (success) {
      setNewCategoryName("");
      setIsAddModalVisible(false);
    }
  };

  const cameraImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return alert("카메라 권한이 필요합니다.");
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      router.push({
        pathname: "/loading",
        params: { imageUri: result.assets[0].uri, group_id, locationId: selectedCategory.locationId },
      });
    }
  };

  const handleLongPressCategory = (category) => {
    // 전체 탭 삭제 불가
    if (!category.locationId) return;

    Alert.alert(
      "방 삭제", 
      `'${category.name}'을(를) 삭제하시겠습니까?\n이 방에 들어있는 모든 물품도 함께 삭제됩니다.`,
      [
        { text: "취소", style: "cancel" },
        { 
          text: "삭제", 
          style: "destructive",
          onPress: async () => {
            await deleteCategory(category.locationId);
          }
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopHeader showBack={true} showIcons={true} title="채움" />

      <View style={styles.container}>
        {/* RoomTabs에 onLongPressCategory 전달 */}
        <RoomTabs
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={() => setIsAddModalVisible(true)}
          onLongPressCategory={handleLongPressCategory} 
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 100 }} style={styles.listContainer}>
          {items.length === 0 ? (
            <Text style={styles.emptyText}>등록된 물품이 없어요</Text>
          ) : (
            items.map((item) => (
              <ItemCard 
                key={item.itemId} 
                item={item} 
                onUpdateQuantity={updateQuantity} 
              />
            ))
          )}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => setOpenMenu(!openMenu)}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        {openMenu && (
          <View style={styles.fabMenuBox}>
            <TouchableOpacity style={styles.fabMenuItem} onPress={() => { setOpenMenu(false); cameraImage(); }}>
              <MaterialCommunityIcons name="camera" size={22} color="#333" />
              <Text style={styles.fabMenuText}>영수증 촬영하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setOpenMenu(false);
                router.push({ pathname: "/inputScreen", params: { group_id, locationId: selectedCategory.locationId } });
              }}
            >
              <MaterialCommunityIcons name="pencil" size={22} color="#333" />
              <Text style={styles.fabMenuText}>직접 입력하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 장소 추가 모달 */}
        <Modal visible={isAddModalVisible} transparent={true} onRequestClose={() => setIsAddModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>새 장소 추가</Text>
              <TextInput style={styles.modalInput} placeholder="예: 베란다" value={newCategoryName} onChangeText={setNewCategoryName} />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.cancelButton}>
                  <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onConfirmAddCategory} style={styles.addButton}>
                  <Text style={{ color: "white" }}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default InventoryScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: "#fff" },
  container: { flex: 1, backgroundColor: "#F5F6FA" },
  listContainer: { flex: 1, paddingTop: 8 },
  emptyText: { textAlign: "center", marginTop: 20, color: "#999" },
  fab: { position: "absolute", bottom: 20, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: "#5AC8FA", justifyContent: "center", alignItems: "center", elevation: 5 },
  fabMenuBox: { position: "absolute", bottom: 90, right: 20, backgroundColor: "#fff", borderRadius: 12, padding: 10, elevation: 6, width: 160 },
  fabMenuItem: { flexDirection: "row", alignItems: "center", padding: 10 },
  fabMenuText: { marginLeft: 10, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: "80%", backgroundColor: "white", padding: 20, borderRadius: 10, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  modalInput: { borderBottomWidth: 1, borderColor: "#ccc", marginBottom: 20, fontSize: 16, padding: 5 },
  modalButtons: { flexDirection: "row", justifyContent: "flex-end" },
  cancelButton: { padding: 10, marginRight: 10 },
  addButton: { padding: 10, backgroundColor: "#5AC8FA", borderRadius: 5 },
});
