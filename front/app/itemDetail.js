import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View, Alert, Platform, Pressable
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import TopHeader from "../components/TopHeader";
import { API_BASE_URL } from "../config/apiConfig";
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// 수량 조절 컴포넌트
const QuantityStepper = ({ label, value, onIncrease, onDecrease, unit = "개" }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <View style={styles.stepperBox}>
      <TouchableOpacity onPress={onDecrease} style={styles.stepperButton}>
        <Text style={styles.stepperText}>-</Text>
      </TouchableOpacity>
      <Text style={styles.stepperValue}>{value}</Text>
      <TouchableOpacity onPress={onIncrease} style={styles.stepperButton}>
        <Text style={styles.stepperText}>+</Text>
      </TouchableOpacity>
      <Text style={styles.stepperUnit}> {unit}</Text>
    </View>
  </View>
);

export default function ItemDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { itemId } = params;

  // 상태 관리
  const [itemName, setItemName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [quantity, setQuantity] = useState(0);
  
  // [수정] 날짜 관련 상태
  const [expiryDate, setExpiryDate] = useState(""); // 서버용 문자열 (YYYY-MM-DD)
  const [dateObj, setDateObj] = useState(new Date()); // 달력 UI용 날짜 객체
  const [showDatePicker, setShowDatePicker] = useState(false); // 달력 표시 여부

  const [alertQuantity, setAlertQuantity] = useState(0);
  const [isAlertOn, setIsAlertOn] = useState(true);

  useEffect(() => {
    if (itemId) fetchItemDetail();
  }, [itemId]);

  // [API] 물품 상세 조회
  const fetchItemDetail = async () => {
      try {
          if (!itemId) {
              Alert.alert("오류", "물품 ID가 없습니다.");
              return;
          }
          const token = await AsyncStorage.getItem("userToken");
          const res = await axios.get(`${API_BASE_URL}/api/v1/items/${itemId}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          const data = res.data.data;

          if (!data) return;

          setItemName(data.name || data.itemName || ""); 
          setQuantity(data.quantity || 0);
          
          // [수정] 날짜 데이터 처리
          if (data.expiryDate) {
            setExpiryDate(data.expiryDate); 
            setDateObj(new Date(data.expiryDate)); 
          } else {
            setExpiryDate("");
            setDateObj(new Date());
          }

          setAlertQuantity(data.minThreshold || data.alertQuantity || 0);    
          setIsAlertOn(data.isAlertOn ?? true);       

      } catch (error) {
          console.log("상세 조회 실패", error);
          Alert.alert("조회 실패", "데이터를 불러오지 못했습니다.");
      }
  };

  const triggerLocalNotification = async (name, currentQty) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ 재고 부족 알림",
        body: `"${name}"의 재고가 ${currentQty}개 남았습니다. 확인해주세요!`,
      },
      trigger: null,
    });
  };

  // [API] 저장
  const handleSave = async () => {
      try {
          const token = await AsyncStorage.getItem("userToken");
          
          const body = {
              name: itemName,
              quantity: quantity,
              expiryDate: expiryDate,
              minThreshold: isAlertOn ? alertQuantity : 0, 
              isAlertOn: isAlertOn
          };

          await axios.put(`${API_BASE_URL}/api/v1/items/${itemId}`, body, {
              headers: { Authorization: `Bearer ${token}` }
          });

          if (isAlertOn && quantity <= alertQuantity) {
            triggerLocalNotification(itemName, quantity).catch(e => console.log(e));
          }

          Alert.alert("성공", "수정되었습니다.");
          router.back(); 
      } catch (error) {
          console.log("수정 실패", error);
          Alert.alert("오류", "수정에 실패했습니다.");
      }
  };

  const handleDelete = () => {
    Alert.alert("삭제", "정말 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      { text: "삭제", style: "destructive", onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${API_BASE_URL}/api/v1/items/${itemId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            router.back();
          } catch (e) { Alert.alert("오류", "삭제 실패"); }
        }},
    ]);
  };

  // 날짜 변경 핸들러
  const onChangeDate = (event, selectedDate) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    
    if (selectedDate) {
        setDateObj(selectedDate); // 달력 UI 상태
        
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        setExpiryDate(`${year}-${month}-${day}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader title="물품 상세" showBack={true} showIcons={false} onBackPress={() => router.back()} />

      <ScrollView style={styles.container}>
        {/* 이름 수정 섹션 */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="camera-outline" size={40} color="#8e8e8e" />
          </TouchableOpacity>
          <View style={styles.nameContainer}>
            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                value={itemName}
                onChangeText={setItemName}
                autoFocus
                onBlur={() => setIsEditingName(false)}
              />
            ) : (
              <Text style={styles.nameText}>{itemName}</Text>
            )}
            <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)}>
              <MaterialCommunityIcons name="pencil-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.dashedLine} />

        {/* 수량 조절 */}
        <QuantityStepper
          label="수량"
          value={quantity}
          onIncrease={() => setQuantity((q) => q + 1)}
          onDecrease={() => setQuantity((q) => (q > 0 ? q - 1 : 0))}
        />

        {/* 유통기한 (달력 입력 방식) */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>유통기한</Text>
          
          <TouchableOpacity 
            style={styles.dateInputBox} 
            onPress={() => setShowDatePicker(true)} // 누르면 달력 뜸
          >
             <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#5AC8FA" style={{ marginRight: 10 }}/>
             <Text style={[styles.dateText, !expiryDate && styles.placeholderText]}>
                {expiryDate || "날짜를 선택해주세요"}
             </Text>
          </TouchableOpacity>

          {/* 달력 컴포넌트 */}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dateObj}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'} // 안드로이드는 달력 팝업, iOS는 룰렛
              onChange={onChangeDate}
              textColor="black"
            />
          )}
        </View>

        {/* 알림 설정 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>재고 알림 설정</Text>
          <View style={styles.alertRow}>
            <View style={styles.stepperBoxSmall}>
              <TouchableOpacity onPress={() => setAlertQuantity((q) => (q > 0 ? q - 1 : 0))} style={styles.stepperButtonSmall}>
                <Text style={styles.stepperTextSmall}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValueSmall}>{alertQuantity}</Text>
              <TouchableOpacity onPress={() => setAlertQuantity((q) => q + 1)} style={styles.stepperButtonSmall}>
                <Text style={styles.stepperTextSmall}>+</Text>
              </TouchableOpacity>
              <Text style={styles.alertUnit}> 개 이하일 때</Text>
            </View>
            <Switch
              trackColor={{ false: "#767577", true: "#5AC8FA" }}
              thumbColor={"#f4f3f4"}
              onValueChange={setIsAlertOn}
              value={isAlertOn}
            />
          </View>
        </View>

        {/* 버튼 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
            <Text style={[styles.actionButtonText, styles.saveButtonText]}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// 스타일
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1, paddingHorizontal: 20 },
  
  // 프로필 섹션
  profileSection: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  profileImageContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e9e9e9", justifyContent: "center", alignItems: "center", marginRight: 20 },
  nameContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
  nameText: { fontSize: 24, fontWeight: "bold", marginRight: 10 },
  nameInput: { flex: 1, fontSize: 24, fontWeight: "bold", borderBottomWidth: 1, borderColor: "#5AC8FA" },
  dashedLine: { borderBottomWidth: 1, borderColor: "#ccc", borderStyle: "dashed", marginBottom: 20 },
  
  // 입력 공통
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 8 },
  
  // 수량 스테퍼
  stepperBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, height: 50 },
  stepperButton: { padding: 10 },
  stepperText: { fontSize: 24, color: "#555" },
  stepperValue: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  stepperUnit: { marginRight: 15, color: "#555" },
  
  // [추가] 날짜 입력 버튼 스타일
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 15,
  },
  dateText: {
      fontSize: 16,
      color: '#000',
  },
  placeholderText: {
      color: '#999',
  },

  // 알림 설정
  alertRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepperBoxSmall: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 5 },
  stepperButtonSmall: { padding: 5 },
  stepperTextSmall: { fontSize: 18 },
  stepperValueSmall: { fontSize: 16, fontWeight: "bold", marginHorizontal: 10 },
  alertUnit: { fontSize: 14, marginRight: 5 },
  
  // 하단 버튼
  buttonContainer: { marginTop: 20, marginBottom: 50 },
  actionButton: { height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 10, borderWidth: 1 },
  actionButtonText: { fontSize: 16, fontWeight: "bold" },
  deleteButton: { backgroundColor: "#fff", borderColor: "#ccc" },
  deleteButtonText: { color: "#e74c3c" },
  saveButton: { backgroundColor: "#5AC8FA", borderColor: "#5AC8FA" },
  saveButtonText: { color: "#fff" },
});