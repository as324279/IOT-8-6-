import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// 컴포넌트
import TopHeader from "../../components/TopHeader";
import NewItemForm from "../../components/shopping/NewItemForm";
import ShoppingListItem from "../../components/shopping/ShoppingListItem";
import RoomSelectView from "../../components/shopping/RoomSelectView";
import { API_BASE_URL } from "../../config/apiConfig";

const ShoppingHome = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 상태 관리
  const [currentGroupId, setCurrentGroupId] = useState(params.group_id || null);
  const [currentGroupName, setCurrentGroupName] = useState(params.name || null);
  const [myRooms, setMyRooms] = useState([]); // 방 목록
  const [items, setItems] = useState([]); // 쇼핑 아이템
  const [active, setActive] = useState("need");
  const [newInput, setNewInput] = useState(false); // 입력창 표시 여부

  // 화면 포커스 시 데이터 갱신
  useFocusEffect(
    useCallback(() => {
      if (currentGroupId) {
        fetchShoppingList();
      } else {
        fetchMyRooms();
      }
    }, [currentGroupId])
  );

  // [API] 내 방 목록 조회
  const fetchMyRooms = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;
      const res = await axios.get(`${API_BASE_URL}/api/v1/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMyRooms(res.data.data);
    } catch (error) {
      console.log("방 목록 조회 실패", error);
    }
  };

  // [API] 쇼핑리스트 조회
  const fetchShoppingList = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const response = await axios.get(
        `${API_BASE_URL}/api/v1/groups/${currentGroupId}/shopping-items`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // 데이터 매핑 (백엔드 변수명 -> 프론트 변수명)
      const serverData = response.data.data.map((item) => ({
        id: item.itemRowId,
        name: item.itemName,
        note: item.note,
        quantity: item.desiredQty,
        isCompleted: item.status === "PURCHASED",
        isSelected: false,
      }));
      setItems(serverData);
    } catch (error) {
      console.log("쇼핑리스트 조회 실패", error);
    }
  };

  // [API] 아이템 추가
  const addItem = async (itemNameText, itemNote) => {
    if (!itemNameText.trim()) {
      Alert.alert("알림", "물품 이름을 입력해주세요.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      const body = {
        itemName: itemNameText,
        note: itemNote,
        desiredQty: 1,
        unit: "개",
      };

      await axios.post(
        `${API_BASE_URL}/api/v1/groups/${currentGroupId}/shopping-items`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await fetchShoppingList();
      setNewInput(false);
    } catch (error) {
      console.log("추가 실패:", error.response?.data || error);
      Alert.alert("오류", "항목 추가에 실패했습니다.");
    }
  };

  // 방 선택
  const handleSelectRoom = (room) => {
    setCurrentGroupId(room.groupId);
    setCurrentGroupName(room.name);
  };

  // 방 선택 취소 (뒤로가기)
  const handleBackToRoomSelect = () => {
    setCurrentGroupId(null);
    setCurrentGroupName(null);
    setItems([]);
    setActive("need"); // 탭 초기화
  };

  // 💡 [복구됨] 수량 변경 함수
  const handleQuantityChange = async (id, amount) => {
    // 1. UI 먼저 업데이트 (반응속도 향상)
    const currentItem = items.find((i) => i.id === id);
    const newQuantity = Math.max(1, currentItem.quantity + amount);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    // 2. 서버 통신
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.patch(
        `${API_BASE_URL}/api/v1/shopping-items/${id}`,
        { count: newQuantity }, // 백엔드 DTO에 맞게 필드명 확인 필요 (desiredQty일 수도 있음)
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("수량 변경 통신 실패 (백엔드 API 확인 필요)");
    }
  };

  const handleToggleSelect = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  // 일괄 구매 완료 처리
  const handleBatchComplete = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const selectedItems = items.filter((item) => item.isSelected);

      if (selectedItems.length === 0) return;

      const requests = selectedItems.map((item) =>
        axios.patch(
          `${API_BASE_URL}/api/v1/shopping-items/${item.id}/purchase`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        )
      );

      await Promise.all(requests);

      Alert.alert("완료", `${selectedItems.length}개 구매 완료!`);
      await fetchShoppingList(); // 목록 갱신
    } catch (error) {
      Alert.alert("오류", "구매 처리에 실패했습니다.");
      console.log(error);
    }
  };

  // 필터링 로직
  const filteredItems = useMemo(() => {
    return active === "need"
      ? items.filter((i) => !i.isCompleted)
      : items.filter((i) => i.isCompleted);
  }, [items, active]);

  const selectedCount = useMemo(
    () => items.filter((i) => i.isSelected && !i.isCompleted).length,
    [items]
  );

  // ==========================================
  // [화면 1] 방이 선택되지 않았을 때 (방 목록 보여주기)
  // ==========================================
  if (!currentGroupId) {
    return <RoomSelectView rooms={myRooms} onSelect={handleSelectRoom} />;
  }

  // ==========================================
  // [화면 2] 쇼핑 리스트 화면
  // ==========================================
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "undefined" })}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* 헤더 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleBackToRoomSelect}
            style={{ padding: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentGroupName} 장보기</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 탭 */}
        <View style={styles.Tab}>
          <TouchableOpacity
            style={[styles.tab1, active === "need" && styles.activeTab]}
            onPress={() => setActive("need")}
          >
            <Text
              style={[styles.tabText, active === "need" && styles.activeText]}
            >
              구매 필요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab1, active === "buy" && styles.activeTab]}
            onPress={() => setActive("buy")}
          >
            <Text
              style={[styles.tabText, active === "buy" && styles.activeText]}
            >
              구매 완료
            </Text>
          </TouchableOpacity>
        </View>

        {/* 목록 */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ShoppingListItem
              item={item}
              onToggleSelect={() => handleToggleSelect(item.id)}
              onQuantityChange={(amount) =>
                handleQuantityChange(item.id, amount)
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              물품이 없습니다.
            </Text>
          }
        />

        {/* 하단 버튼들 */}
        {selectedCount > 0 && active === "need" && !newInput && (
          <TouchableOpacity
            style={styles.batchButton}
            onPress={handleBatchComplete}
          >
            <Text style={styles.batchButtonText}>
              {selectedCount}개 항목 구매 완료
            </Text>
          </TouchableOpacity>
        )}

        {!newInput && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setNewInput(true)}
          >
            <FontAwesome5 name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* 물품 추가 폼 */}
        {newInput && (
          <NewItemForm onAdd={addItem} onCancel={() => setNewInput(false)} />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ShoppingHome;

// 스타일
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  Tab: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  tab1: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#E9F2FF" },
  tabText: { fontSize: 14, color: "#999" },
  activeText: { color: "#4A90E2", fontWeight: "bold" },
  icon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#53ACD9",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  batchButton: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  batchButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
