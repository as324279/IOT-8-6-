import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopHeader from "../components/TopHeader";
import { useLocalSearchParams } from "expo-router";
import {
  Alert,
  Modal,
  TextInput,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import RoomTabs from "../components/room/RoomTabs";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";

const ItemCard = ({ item }) => {
  const router = useRouter();

  const handlePress = () => {
    console.log("클릭한 아이템 정보:", item);
    router.push({
      pathname: "/itemDetail",
      params: { itemId: item.itemId },
    });
  };

  // photoUrl 체크
  const hasImage = item.photoUrl && item.photoUrl.length > 1;

  // 풀 이미지 URL 생성
  const fullImageUrl = hasImage
    ? `${API_BASE_URL}${item.photoUrl}` // 핵심!
    : null;

  return (
    <TouchableOpacity style={styles.itemCard} onPress={handlePress}>
      {/* URL 이미지 표시 */}
      {fullImageUrl ? (
        <Image
          source={{ uri: fullImageUrl }}
          style={styles.itemImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.itemImagePlaceholder} />
      )}

      <Text style={styles.itemText}>{item.name}</Text>

      <TouchableOpacity onPress={handlePress}>
        <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
};


const InventoryScreen = () => {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    name: "전체",
    locationId: null,
  });
  const { group_id } = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect(() => {
    console.log("그룹 아이디 확인", group_id);
  }, [group_id]);

  useEffect(() => {
    getlocation();
  }, []);

  useEffect(() => {
    getItems();
  }, [selectedCategory]);

  // [추가] 장소 추가 모달 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  //카메라 찍기 기능
  const cameraImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      alert("카메라 권한이 필요합니다.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      base64: false,
    });

    const uri = result.assets[0].uri;

    if (!result.canceled) {
      router.push({
        pathname: "/loading",
        params: {
          imageUri: uri,
          group_id,
          locationId: selectedCategory.locationId,
        },
      });
    }
  };

  // 모달 추가
  const ModalMenu = () => {
    setOpenMenu((prev) => !prev);
  };

  // [추가] 장소 추가 함수
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("오류", "장소 이름을 입력해주세요.");
      return;
    }
    if (categories.includes(newCategoryName)) {
      Alert.alert("오류", "이미 존재하는 장소입니다.");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const res = await axios.post(
        `${API_BASE_URL}/api/v1/groups/${group_id}/locations`,
        { name: newCategoryName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("장소 생성 완료", res.data);
      await getlocation();

      setNewCategoryName("");
      setIsAddModalVisible(false);
    } catch (error) {
      console.log("장소 생성 에러:", error.response?.data || error);
    }
  };

  //저장된 물품 조회
  const getItems = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      let url;

      if (selectedCategory.locationId === null) {
        url = `${API_BASE_URL}/api/v1/groups/${group_id}/items`;
      } else {
        url = `${API_BASE_URL}/api/v1/locations/${selectedCategory.locationId}/items`;
      }

      const get = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("물품 조회:", get.data);

      const list = get.data.data;
      setItems(list);
    } catch (error) {
      console.log("물품 조회 오류:", error.response?.data || error);
    }
  };
  //location 조회
  const getlocation = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const get = await axios.get(
        `${API_BASE_URL}/api/v1/groups/${group_id}/locations`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("location조회", get.data);

      const locationList = get.data.data;

      const formindex = [
        { name: "전체", locationId: null },
        ...locationList.map((loc) => ({
          name: loc.name,
          locationId: loc.locationId,
        })),
      ];
      setCategories(formindex);
    } catch (error) {
      console.log("위치 조회 오류!", error.response?.data || error);
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopHeader showBack={true} showIcons={true} title="채움" />

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
          {items.length === 0 ? (
            <Text>등록된 물품이 없어요</Text>
          ) : (
            items.map((item) => <ItemCard key={item.itemId} item={item} />)
          )}
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={ModalMenu}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.fab} onPress={ModalMenu}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        {openMenu && (
          <View style={styles.fabMenuBox}>
            {/* 영수증 촬영 */}
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setOpenMenu(false);
                cameraImage();
              }}
            >
              <MaterialCommunityIcons name="camera" size={22} color="#333" />
              <Text style={styles.fabMenuText}>영수증 촬영하기</Text>
            </TouchableOpacity>

            {/* 직접 입력 */}
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => {
                setOpenMenu(false);
                router.push({
                  pathname: "/inputScreen",
                  params: {
                    group_id,
                    locationId: selectedCategory.locationId,
                  },
                });
              }}
            >
              <MaterialCommunityIcons name="pencil" size={22} color="#333" />
              <Text style={styles.fabMenuText}>직접 입력하기</Text>
            </TouchableOpacity>
          </View>
        )}

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
                <TouchableOpacity
                  onPress={() => setIsAddModalVisible(false)}
                  style={styles.cancelButton}
                >
                  <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleAddCategory}
                  style={styles.addButton}
                >
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

// 스타일 시트
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  // 물품 목록
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,

    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 20,
    fontSize: 16,
    padding: 5,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    padding: 10,
    backgroundColor: "#5AC8FA",
    borderRadius: 5,
  },
  //물품 추가 스타일
  fabMenuBox: {
    position: "absolute",
    bottom: 95,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 10,
    width: 180,

    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,

    zIndex: 100,
  },

  fabMenuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  fabMenuText: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333",
    fontWeight: "500",
  },
  itemImage: {
  width: 40,
  height: 40,
  borderRadius: 8,
  marginRight: 16,
},

itemImagePlaceholder: {
  width: 40,
  height: 40,
  borderRadius: 8,
  backgroundColor: "#e9e9e9",
  marginRight: 16,
},
});
