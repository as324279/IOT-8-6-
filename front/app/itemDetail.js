import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// TopHeader 컴포넌트를 import 합니다. (경로 확인!)
import TopHeader from '../components/TopHeader';

// --- 수량 조절기 (Stepper) 컴포넌트 ---
const QuantityStepper = ({ label, value, onIncrease, onDecrease, unit = "개" }) => {
  return (
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
};

// --- 메인 상세 화면 ---
export default function ItemDetailScreen() {
  const router = useRouter();

  // 1. 상세 화면의 상태 관리
  const [itemName, setItemName] = useState('상품명');
  const [isEditingName, setIsEditingName] = useState(false);
  const [location, setLocation] = useState(null); // 드롭다운 선택값
  const [quantity, setQuantity] = useState(0);
  const [expiryDate, setExpiryDate] = useState('2025년 10월 20일');
  const [alertQuantity, setAlertQuantity] = useState(0);
  const [isAlertOn, setIsAlertOn] = useState(true);

  // 2. 이름 수정 완료 처리
  const handleSaveName = () => {
    setIsEditingName(false);
    console.log("새 이름 저장:", itemName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* 3. TopHeader에 뒤로가기 버튼 추가 */}
      <TopHeader
        title="물품 상세"
        showBack={true} // 뒤로가기 버튼 표시
        showIcons={false} // 알림 아이콘 숨김
        onBackPress={() => router.back()} // 뒤로가기 기능 실행
      />
      
      <ScrollView style={styles.container}>
        {/* --- 1. 물품 사진 및 이름 --- */}
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <MaterialCommunityIcons name="camera-outline" size={40} color="#8e8e8e" />
            <Text style={styles.profileImageLabel}>물품 사진</Text>
          </TouchableOpacity>
          
          <View style={styles.nameContainer}>
            {isEditingName ? (
              <TextInput
                style={styles.nameInput}
                value={itemName}
                onChangeText={setItemName}
                autoFocus={true}
                onBlur={handleSaveName} // 포커스 잃으면 저장
              />
            ) : (
              <Text style={styles.nameText}>{itemName}</Text>
            )}
            <TouchableOpacity onPress={() => setIsEditingName(!isEditingName)}>
              <MaterialCommunityIcons 
                name={isEditingName ? "check" : "pencil-outline"} 
                size={24} 
                color="#333" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* --- 2. 점선 구분선 --- */}
        <View style={styles.dashedLine} />

        {/* --- 3. 보관 장소 (드롭다운) --- */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>보관 장소</Text>
          <TouchableOpacity style={styles.dropdownBox}>
            <Text style={styles.dropdownText}>{location || '보관 장소 드롭다운'}</Text>
            <Ionicons name="chevron-down" size={20} color="#8e8e8e" />
          </TouchableOpacity>
        </View>

        {/* --- 4. 수량 --- */}
        <QuantityStepper
          label="수량"
          value={quantity}
          onIncrease={() => setQuantity(q => q + 1)}
          onDecrease={() => setQuantity(q => (q > 0 ? q - 1 : 0))}
        />

        {/* --- 5. 유통기한 (날짜 선택) --- */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>유통기한</Text>
          <TouchableOpacity style={styles.inputBox}>
            <Text style={styles.inputText}>{expiryDate}</Text>
            <MaterialCommunityIcons name="calendar" size={24} color="#8e8e8e" />
          </TouchableOpacity>
        </View>

        {/* --- 6. 재고 알림 설정 --- */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>재고 알림 설정</Text>
          <View style={styles.alertRow}>
            {/* 알림 설정용 Stepper */}
            <View style={styles.stepperBoxSmall}>
              <TouchableOpacity onPress={() => setAlertQuantity(q => (q > 0 ? q - 1 : 0))} style={styles.stepperButtonSmall}>
                <Text style={styles.stepperTextSmall}>-</Text>
              </TouchableOpacity>
              <Text style={styles.stepperValueSmall}>{alertQuantity}</Text>
              <TouchableOpacity onPress={() => setAlertQuantity(q => q + 1)} style={styles.stepperButtonSmall}>
                <Text style={styles.stepperTextSmall}>+</Text>
              </TouchableOpacity>
              <Text style={styles.alertUnit}> 개 이하일때 알림받기</Text>
            </View>
            {/* 토글 스위치 */}
            <Switch
              trackColor={{ false: "#767577", true: "#5AC8FA" }}
              thumbColor={"#f4f3f4"}
              onValueChange={() => setIsAlertOn(prev => !prev)}
              value={isAlertOn}
            />
          </View>
        </View>

        {/* --- 7. 삭제/저장 버튼 --- */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]}>
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>삭제하기</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.saveButton]}>
            <Text style={[styles.actionButtonText, styles.saveButtonText]}>저장하기</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// --- 스타일 시트 ---
const styles = StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: '#f9f9f9' // 이미지와 유사한 연한 회색 배경
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  profileImageLabel: {
    position: 'absolute',
    top: 10,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#555',
  },
  nameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
  },
  nameInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    marginRight: 10,
    borderBottomWidth: 1,
    borderColor: '#5AC8FA',
    paddingVertical: 5,
  },
  dashedLine: {
    borderBottomWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  dropdownBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  dropdownText: {
    fontSize: 16,
    color: '#333',
  },
  inputBox: { 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  inputText: {
    fontSize: 16,
    color: '#333',
  },
  stepperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 10,
  },
  stepperButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  stepperText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#555',
  },
  stepperValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
  stepperUnit: {
    fontSize: 16,
    color: '#333',
    marginLeft: 5,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 50,
  },
  stepperBoxSmall: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepperButtonSmall: {
     paddingHorizontal: 8,
  },
  stepperTextSmall: {
    fontSize: 20,
    color: '#555',
  },
  stepperValueSmall: {
     fontSize: 16,
     fontWeight: 'bold',
     marginHorizontal: 12,
  },
  alertUnit: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
    marginRight: 10,
  },
  buttonContainer: {
    marginTop: 30,
    paddingBottom: 40,
  },
  actionButton: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
  },
  deleteButtonText: {
    color: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#5AC8FA',
    borderColor: '#5AC8FA',
  },
  saveButtonText: {
    color: '#fff',
  },
});