import { useState, useCallback } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { API_BASE_URL } from "../config/apiConfig";

export const useInventoryLogic = (groupId) => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({ name: "전체", locationId: null });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. 장소(Category) 목록 조회
  const getLocations = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/v1/groups/${groupId}/locations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const locationList = res.data.data;
      const formatted = [
        { name: "전체", locationId: null },
        ...locationList.map((loc) => ({
          name: loc.name,
          locationId: loc.locationId,
        })),
      ];
      setCategories(formatted);
    } catch (error) {
      console.log("장소 조회 실패:", error);
    }
  }, [groupId]);

  // 2. 물품 목록 조회
  const getItems = useCallback(async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      let url =
        selectedCategory.locationId === null
          ? `${API_BASE_URL}/api/v1/groups/${groupId}/items`
          : `${API_BASE_URL}/api/v1/locations/${selectedCategory.locationId}/items`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data.data);
    } catch (error) {
      console.log("물품 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  }, [groupId, selectedCategory]);

  // 3. 장소 추가
  const addCategory = async (newCategoryName) => {
    if (!newCategoryName.trim()) {
      Alert.alert("오류", "장소 이름을 입력해주세요.");
      return false;
    }
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${API_BASE_URL}/api/v1/groups/${groupId}/locations`,
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await getLocations(); 
      return true; 
    } catch (error) {
      console.log("장소 생성 에러:", error);
      Alert.alert("오류", "장소 추가 실패");
      return false;
    }
  };

  // 4. 수량 변경
  const updateQuantity = async (itemId, newQty) => {
    try {
       setItems(prev => prev.map(item => 
         item.itemId === itemId ? { ...item, quantity: newQty } : item
       ));
       
       const token = await AsyncStorage.getItem("userToken");
       await axios.put(`${API_BASE_URL}/api/v1/items/${itemId}`, 
          { quantity: newQty }, 
          { headers: { Authorization: `Bearer ${token}` } }
       );
    } catch (e) {
       console.error(e);
       Alert.alert("오류", "수량 변경 실패");
       getItems(); 
    }
  };

  // ▼▼▼ [5. 방 삭제 기능 추가] ▼▼▼
  const deleteCategory = async (locationId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      // 백엔드 API: DELETE /api/v1/locations/{locationId}
      await axios.delete(`${API_BASE_URL}/api/v1/locations/${locationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // 삭제 후 현재 보고 있던 방이 삭제된 방이라면 '전체'로 이동
      if (selectedCategory.locationId === locationId) {
        setSelectedCategory({ name: "전체", locationId: null });
      }
      
      await getLocations(); // 목록 갱신
      return true;
    } catch (error) {
      console.log("장소 삭제 실패:", error);
      Alert.alert("오류", "장소 삭제에 실패했습니다.");
      return false;
    }
  };
  // ▲▲▲ [추가 끝] ▲▲▲

  return {
    categories,
    selectedCategory,
    setSelectedCategory,
    items,
    loading,
    getLocations,
    getItems,
    addCategory,
    updateQuantity,
    deleteCategory, // 내보내기
  };
};