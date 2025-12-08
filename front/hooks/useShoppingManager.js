import { useState, useCallback, useMemo } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams, useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";

export const useShoppingManager = () => {
  const params = useLocalSearchParams();

  // 상태 관리
  const [currentGroupId, setCurrentGroupId] = useState(params.group_id || null);
  const [currentGroupName, setCurrentGroupName] = useState(params.name || null);
  const [myRooms, setMyRooms] = useState([]);
  const [items, setItems] = useState([]);
  const [active, setActive] = useState("need"); // 'need' or 'buy'
  const [newInput, setNewInput] = useState(false);

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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 데이터 매핑
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

  // [API] 수량 변경 (낙관적 업데이트)
  const handleQuantityChange = async (id, amount) => {
    const currentItem = items.find((i) => i.id === id);
    const newQuantity = Math.max(1, currentItem.quantity + amount);

    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );

    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.patch(
        `${API_BASE_URL}/api/v1/shopping-items/${id}`,
        { count: newQuantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.log("수량 변경 통신 실패");
    }
  };

  // [API] 일괄 구매 완료
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
      await fetchShoppingList();
    } catch (error) {
      Alert.alert("오류", "구매 처리에 실패했습니다.");
    }
  };

  // 로컬 상태 변경 핸들러들
  const handleSelectRoom = (room) => {
    setCurrentGroupId(room.groupId);
    setCurrentGroupName(room.name);
  };

  const handleBackToRoomSelect = () => {
    setCurrentGroupId(null);
    setCurrentGroupName(null);
    setItems([]);
    setActive("need");
  };

  const handleToggleSelect = (id) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    );
  };

  // 계산된 값 (Computed)
  const filteredItems = useMemo(() => {
    return active === "need"
      ? items.filter((i) => !i.isCompleted)
      : items.filter((i) => i.isCompleted);
  }, [items, active]);

  const selectedCount = useMemo(
    () => items.filter((i) => i.isSelected && !i.isCompleted).length,
    [items]
  );

  return {
    // State
    currentGroupId,
    currentGroupName,
    myRooms,
    items,
    active,
    newInput,
    filteredItems,
    selectedCount,
    // Setters
    setActive,
    setNewInput,
    // Actions
    handleSelectRoom,
    handleBackToRoomSelect,
    addItem,
    handleQuantityChange,
    handleToggleSelect,
    handleBatchComplete,
  };
};
