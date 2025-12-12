import { useState, useEffect } from "react";
import { Alert, Platform } from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useLocalSearchParams } from "expo-router"; // 👈 [수정] useLocalSearchParams 추가
import * as Notifications from "expo-notifications";
import { API_BASE_URL } from "../config/apiConfig";
import * as ImagePicker from "expo-image-picker";

export const useItemDetailLogic = (itemId) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const group_id = params.group_id; 

  // 기본 정보 State
  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState(0);

  // 장소 관련 State
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [groupId, setGroupId] = useState(null);

  // 날짜 관련 State
  const [expiryDate, setExpiryDate] = useState("");
  const [dateObj, setDateObj] = useState(new Date());

  // 알림 관련 State
  const [alertQuantity, setAlertQuantity] = useState(0);
  const [isAlertOn, setIsAlertOn] = useState(false);

  // 로딩 State
  const [loading, setLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(null);

  useEffect(() => {
    if (itemId) fetchItemDetail();
  }, [itemId]);

  // ▼▼▼ [추가] group_id가 감지되면 즉시 장소 목록을 불러옵니다.
  useEffect(() => {
    const initLocations = async () => {
      // 1. 넘어온 group_id가 있으면 그걸로 조회
      if (group_id) {
        setGroupId(group_id); // 나중을 위해 state에도 저장
        const token = await AsyncStorage.getItem("userToken");
        fetchLocations(group_id, token);
      }
    };
    initLocations();
  }, [group_id]);
  // ▲▲▲

  // 1. 상세 정보 조회
  const fetchItemDetail = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.get(`${API_BASE_URL}/api/v1/items/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.data;

      if (!data) return;

      setItemName(data.name || data.itemName || "");
      setQuantity(data.quantity || 0);
      setPhotoUrl(data.photoUrl);

      // [수정] 백엔드 ItemResponse에는 groupId가 없습니다! 
      // 하지만 우리가 params로 group_id를 받아왔으므로 그걸 믿고 씁니다.
      if (group_id && locations.length === 0) {
          fetchLocations(group_id, token);
      }
      
      // ▼▼▼ [핵심 수정] 변수명을 백엔드(ItemResponse)와 똑같이 맞춤 ▼▼▼
      if (data.locationId) { 
        setSelectedLocation({
          locationId: data.locationId,    // 기존 storageLocationId -> locationId
          name: data.locationName || "이름 없음", // 기존 storageLocationName -> locationName
        });
      } else {
        setSelectedLocation(null);
      }
      // ▲▲▲

      // 날짜 세팅
      if (data.expiryDate) {
        setExpiryDate(data.expiryDate);
        setDateObj(new Date(data.expiryDate));
      }

      setAlertQuantity(data.minThreshold || 0);
      setIsAlertOn(data.isAlertOn ?? true);
    } catch (error) {
      console.log("상세 조회 실패", error);
      Alert.alert("조회 실패", "데이터를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 2. 장소 목록 조회
  const fetchLocations = async (gId, token) => {
    try {
      const res = await axios.get(
        `${API_BASE_URL}/api/v1/groups/${gId}/locations`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLocations(res.data.data || []);
    } catch (error) {
      console.log("장소 목록 조회 실패", error);
    }
  };

  

  // 3. 로컬 푸시 알림 트리거
  const triggerLocalNotification = async (name, currentQty) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ 재고 부족 알림",
        body: `"${name}"의 재고가 ${currentQty}개 남았습니다. 확인해주세요!`,
      },
      trigger: null,
    });
  };

  // 4. 저장 (수정)
  const handleSave = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      
      const body = {
        name: itemName,
        quantity: quantity,
        expiryDate: expiryDate,
        minThreshold: isAlertOn ? alertQuantity : 0,
        isAlertOn: isAlertOn,
        locationId: selectedLocation?.locationId,
        photoUrl: photoUrl, 
      };

      await axios.put(`${API_BASE_URL}/api/v1/items/${itemId}`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (isAlertOn && quantity <= alertQuantity) {
        triggerLocalNotification(itemName, quantity).catch((e) =>
          console.log(e)
        );
      }

      Alert.alert("성공", "수정되었습니다.");
      router.back();
    } catch (error) {
      console.log("수정 실패", error);
      Alert.alert("오류", "수정에 실패했습니다.");
    }
  };

  // 5. 삭제
  const handleDelete = () => {
    Alert.alert("삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${API_BASE_URL}/api/v1/items/${itemId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            router.back();
          } catch (e) {
            Alert.alert("오류", "삭제 실패");
          }
        },
      },
    ]);
  };

  // 6. 날짜 변경 핸들러
  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || dateObj;
    setDateObj(currentDate);

    if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
        const day = String(selectedDate.getDate()).padStart(2, "0");
        setExpiryDate(`${year}-${month}-${day}`);
    }
    return Platform.OS === 'android'; 
  };

  // ▼▼▼ [추가] 이미지 업로드 및 변경 로직 ▼▼▼
  const uploadImageToServer = async (uri) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const fileName = uri.split("/").pop();
      const formData = new FormData();
      formData.append("file", { uri, type: "image/jpeg", name: fileName });

      const response = await fetch(`${API_BASE_URL}/api/v1/images/upload`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!response.ok) throw new Error("업로드 실패");
      const data = await response.json();
      return data.data.imageUrl;
    } catch (error) {
      console.log(error);
      return null;
    }
  };

  const handleUpdateImage = () => {
    Alert.alert("사진 변경", "방법을 선택하세요.", [
      { text: "취소", style: "cancel" },
      { text: "카메라", onPress: () => pickImage("camera") },
      { text: "앨범", onPress: () => pickImage("gallery") },
    ]);
  };

  const pickImage = async (type) => {
    const perm = type === "camera" 
      ? await ImagePicker.requestCameraPermissionsAsync() 
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!perm.granted) return Alert.alert("권한 필요", "카메라/앨범 권한이 필요합니다.");

    const result = type === "camera"
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 })
      : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.7 });

    if (!result.canceled) {
      const url = await uploadImageToServer(result.assets[0].uri);
      if (url) setPhotoUrl(url); // 업로드 성공 시 화면 갱신
    }
  };
  // ▲▲▲

  return {
    itemName, setItemName,
    quantity, setQuantity,
    locations, selectedLocation, setSelectedLocation,
    expiryDate, dateObj,
    alertQuantity, setAlertQuantity,
    isAlertOn, setIsAlertOn,
    loading,
    photoUrl,
    handleSave,
    handleDelete,
    onChangeDate,
    handleUpdateImage,
  };
};