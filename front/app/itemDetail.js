import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { API_BASE_URL } from "../config/apiConfig";

// 분리한 컴포넌트 & 훅 가져오기
import TopHeader from "../components/TopHeader";
import LocationPickerModal from "../components/LocationPickerModal"; // 모달
import { useItemDetailLogic } from "../hooks/useItemDetailLogic"; // 로직

// 수량 조절용 작은 컴포넌트 (내부 사용)
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
  const { itemId } = useLocalSearchParams();

  // 1. 커스텀 훅에서 모든 데이터와 함수 꺼내오기
  const {
    itemName, setItemName,
    quantity, setQuantity,
    locations, selectedLocation, setSelectedLocation,
    expiryDate, dateObj,
    alertQuantity, setAlertQuantity,
    isAlertOn, photoUrl, setIsAlertOn,
    handleSave, handleDelete, onChangeDate, 
  } = useItemDetailLogic(itemId);

  // UI용 State (모달, 편집모드, 달력표시)
  const [isEditingName, setIsEditingName] = useState(false);
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // 달력 핸들러 래퍼 (UI 제어 포함)
  const handleDateChange = (event, selectedDate) => {
    const shouldClose = onChangeDate(event, selectedDate);
    if (shouldClose || Platform.OS === 'android') {
        setShowDatePicker(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TopHeader title="물품 상세" showBack={true} showIcons={false} onBackPress={() => router.back()} />

      <ScrollView style={styles.container}>
        {/* 1. 이름 섹션 */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            {photoUrl ? (
              <Image 
                source={{ uri: `${API_BASE_URL}${photoUrl}` }} 
                style={styles.fullImage} 
                resizeMode="cover"
              />
            ) : (
              <MaterialCommunityIcons name="camera-outline" size={40} color="#8e8e8e" />
            )}
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

        {/* 2. 장소 선택 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>보관 장소</Text>
          <TouchableOpacity
            style={styles.dropdownBox}
            onPress={() => setIsLocationModalVisible(true)}
          >
            <Text style={styles.dropdownText}>
              {selectedLocation ? selectedLocation.name : "장소 선택"}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        {/* 3. 수량 조절 */}
        <QuantityStepper
          label="수량"
          value={quantity}
          onIncrease={() => setQuantity((q) => q + 1)}
          onDecrease={() => setQuantity((q) => (q > 0 ? q - 1 : 0))}
        />

        {/* 4. 유통기한 */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>유통기한</Text>
          <TouchableOpacity
            style={styles.dateInputBox}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialCommunityIcons name="calendar-month-outline" size={24} color="#5AC8FA" style={{ marginRight: 10 }} />
            <Text style={[styles.dateText, !expiryDate && styles.placeholderText]}>
              {expiryDate || "날짜를 선택해주세요"}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={dateObj}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDateChange}
              textColor="black"
            />
          )}
        </View>

        {/* 5. 알림 설정 */}
        <View style={styles.inputContainer}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <Text style={styles.label}>재고 알림 설정</Text>
            <Switch
              trackColor={{ false: "#767577", true: "#5AC8FA" }}
              thumbColor={"#f4f3f4"}
              onValueChange={setIsAlertOn}
              value={isAlertOn}
            />
          </View>
          {isAlertOn && (
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
            </View>
          )}
        </View>

        {/* 6. 버튼들 */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSave}>
            <Text style={[styles.actionButtonText, styles.saveButtonText]}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 모달 컴포넌트 */}
      <LocationPickerModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        locations={locations}
        selectedLocation={selectedLocation}
        onSelect={setSelectedLocation}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f9f9f9" },
  container: { flex: 1, paddingHorizontal: 20 },
  
  // 프로필 섹션
  profileSection: { flexDirection: "row", alignItems: "center", paddingVertical: 20 },
  
  profileImageContainer: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: "#e9e9e9", 
    justifyContent: "center", 
    alignItems: "center", 
    marginRight: 20,
    overflow: 'hidden'
  },
  fullImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  nameContainer: { flex: 1, flexDirection: "row", alignItems: "center" },
  nameText: { fontSize: 24, fontWeight: "bold", marginRight: 10 },
  nameInput: { flex: 1, fontSize: 24, fontWeight: "bold", borderBottomWidth: 1, borderColor: "#5AC8FA" },
  
  dashedLine: { borderBottomWidth: 1, borderColor: "#ccc", borderStyle: "dashed", marginBottom: 20 },
  
  // 입력 공통
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 8 },
  
  // 드롭다운 & 날짜
  dropdownBox: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, height: 50, paddingHorizontal: 15 },
  dropdownText: { fontSize: 16, color: "#333" },
  dateInputBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, height: 50, paddingHorizontal: 15 },
  dateText: { fontSize: 16, color: "#000" },
  placeholderText: { color: "#999" },

  // 스테퍼
  stepperBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, height: 50 },
  stepperButton: { padding: 10 },
  stepperText: { fontSize: 24, color: "#555" },
  stepperValue: { fontSize: 18, fontWeight: "bold", flex: 1, textAlign: "center" },
  stepperUnit: { marginRight: 15, color: "#555" },

  // 알림
  alertRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  stepperBoxSmall: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 5 },
  stepperButtonSmall: { padding: 5 },
  stepperTextSmall: { fontSize: 18 },
  stepperValueSmall: { fontSize: 16, fontWeight: "bold", marginHorizontal: 10 },
  alertUnit: { fontSize: 14, marginRight: 5 },

  // 버튼
  buttonContainer: { marginTop: 20, marginBottom: 50 },
  actionButton: { height: 50, borderRadius: 8, justifyContent: "center", alignItems: "center", marginBottom: 10, borderWidth: 1 },
  actionButtonText: { fontSize: 16, fontWeight: "bold" },
  deleteButton: { backgroundColor: "#fff", borderColor: "#ccc" },
  deleteButtonText: { color: "#e74c3c" },
  saveButton: { backgroundColor: "#5AC8FA", borderColor: "#5AC8FA" },
  saveButtonText: { color: "#fff" },
});