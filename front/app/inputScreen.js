import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { OCR_API_URL } from "../config/apiConfig";
import { API_BASE_URL } from '../config/apiConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from '@react-native-community/datetimepicker';

const SERVER_URL = OCR_API_URL; 


const InputScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items,setItems] = useState([]);
    const {group_id,locationId} = useLocalSearchParams();
    const [currentPickerIndex, setCurrentPickerIndex] = useState(null);
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);


  //상품 이미지 업로드
  const uploadImageToServer = async (uri) => {
  const token = await AsyncStorage.getItem("userToken");

  const fileName = uri.split("/").pop();
  const fileType = "image/jpeg";

  const formData = new FormData();
  formData.append("file", {
    uri,
    type: fileType,
    name: fileName,
  });

  const response = await fetch(`${API_BASE_URL}/api/v1/images/upload`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      // ❗ 절대 multipart/form-data 직접 넣지 않기!
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    console.log("이미지 업로드 오류:", err);
    throw new Error("업로드 실패");
  }

  const data = await response.json();

  return data.data.imageUrl;
};


    const [itemList, setItemList] = useState([
      {ItemName:"", ItemCount: "", expiry_date: "", minThreshold: "", unit: "",showPicker: false,
    dateObj: new Date()}
    ]);

    const addItem = () => {
      setItemList([
        ...itemList,
        {ItemName:"", ItemCount: "", expiry_date: "",minThreshold: "", unit: "",showPicker: false,
    dateObj: new Date()}
      ]);
    };

    const updateItem = (index, field, value) => {
          const updated = [...itemList];
          updated[index][field] = value;
          setItemList(updated);
      };
    //물품 삭제
      const deleteItem = (index) => {
        setItemList((prevList) => prevList.filter((_, i) => i !== index));
      };

      const cameraImage = async (index) => {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    alert("카메라 권한이 필요합니다.");
    return;
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.7,
  });

  if (!result.canceled) {
    const uri = result.assets[0].uri;

    try {
      const url = await uploadImageToServer(uri);
      updateItem(index, "photoUrl", url);   // 🔥 필수: item에 photoUrl 저장
      console.log("업로드 성공:", url);

    } catch (e) {
      console.log("업로드 실패:", e);
      Alert.alert("이미지 업로드 실패");
    }
  }
};


    

    const back = () => {
      setItemList([{ItemName:"", ItemCount: "", expiry_date: "", minThreshold: "", unit: "",dateObj: new Date(), 
      showPicker: false, } ])
      router.push("./mainHome");
    }

                const onChangeDate = (index, event, selectedDate) => {
                if (!selectedDate) return;

                const updated = [...itemList];
                updated[index].expiry_date = selectedDate.toISOString().split("T")[0];
                updated[index].dateObj = selectedDate;

                setItemList(updated);

                if (Platform.OS === "android") {
                  setIsDateModalVisible(false);
                }
              };


    const SaveDB = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const gid = Array.isArray(group_id) ? group_id[0] : group_id;

    for (const item of itemList){
      let url;


      if (!locationId || locationId=== null) {
        url = `${API_BASE_URL}/api/v1/groups/${gid}/items`;
      }else {
        url = `${API_BASE_URL}/api/v1/locations/${locationId}/items`;
      } 
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: item.ItemName,
          quantity: item.ItemCount,
          expiryDate: item.expiry_date || null,
          minThreshold: item.minThreshold || null,
          unit:item.unit || null,
          photoUrl: item.photoUrl || null,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.log("스프링 응답 오류:", errorBody);
        throw new Error("Spring 저장 실패");
      }

      const dataItem = await response.json();
      console.log("저장 결과:", dataItem);
    }

    Alert.alert("등록이 완료되었습니다.");
    router.push({ pathname: "mainHome" });

  } catch (error) {
    console.log("스프링저장 오류", error);
  } finally {
    setLoading(false);
  }
};



    return (
    <View style={styles.container}>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView style={styles.scrollBox}>

          <Text style={styles.sectionTitle}>🧾 상품 등록</Text>

          {itemList.map((item, idx) => (
            <View key={idx} style={styles.inputContainer}>

              {/* 삭제 버튼 */}
              <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(idx)}>
                <Ionicons name="trash" size={22} color="red" />
              </TouchableOpacity>

              {/* 카메라 */}
              <TouchableOpacity onPress={() => cameraImage(idx)}>
                  <Ionicons name="camera" size={30} color="black" />
              </TouchableOpacity>

              {/* 수량 */}
              <View style={styles.mini}>
                <Text style={styles.title}>수량</Text>
                <TextInput
                  style={styles.input}
                  value={item.ItemCount}
                  onChangeText={(text) => updateItem(idx, "ItemCount", text)}
                />
              </View>

              <View style={styles.spec} />

              {/* 상품명 */}
              <View style={styles.mini}>
                <Text style={styles.title}>상품명</Text>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={item.ItemName}
                  onChangeText={(text) => updateItem(idx, "ItemName", text)}
                />
              </View>

              <View style={styles.spec} />

              {/* 유통기한 */}
              <View style={styles.mini}>
                <Text style={styles.title}>유통기한</Text>

                <TouchableOpacity
                  style={[styles.input, { flexDirection: "row", alignItems: "center", paddingVertical: 10 }]}
                  onPress={() => {
                    setCurrentPickerIndex(idx);
                    setIsDateModalVisible(true);
                  }}
                >
                  <Ionicons name="calendar-outline" size={20} color="#5AC8FA" style={{ marginRight: 6 }} />
                  <Text style={{ fontSize: 15, color: item.expiry_date ? "#000" : "#999" }}>
                    {item.expiry_date || "날짜 선택"}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.spec} />

              {/* 최소 수량 */}
              <View style={styles.mini}>
                <Text style={styles.title}>최소 수량</Text>
                <TextInput
                  style={styles.input}
                  value={item.minThreshold}
                  onChangeText={(text) => updateItem(idx, "minThreshold", text)}
                />
              </View>

              <View style={styles.spec} />

              {/* 단위 */}
              <View style={styles.mini}>
                <Text style={styles.title}>단위</Text>
                <TextInput
                  style={styles.input}
                  value={item.unit}
                  onChangeText={(text) => updateItem(idx, "unit", text)}
                />
              </View>

              <View style={styles.spec} />

            </View>
          ))}

          <Pressable style={styles.addContainer} onPress={addItem}>
            <Text style={styles.addButton}> + 상품 추가</Text>
          </Pressable>

          <View style={styles.ButtonContainer}>
            <Pressable style={styles.button1} onPress={back}>
              <Text style={styles.buttontext1}>취소</Text>
            </Pressable>

            <Pressable style={styles.button} onPress={SaveDB}>
              <Text style={styles.buttontext}>등록</Text>
            </Pressable>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>

      {/* ------------------------ */}
      {/* 📌 Modal DatePicker (iOS + Android) */}
      {/* ------------------------ */}
            {currentPickerIndex !== null && (
        <View style={styles.pickerWrapper}>
          <DateTimePicker
            value={itemList[currentPickerIndex].dateObj}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={(event, selectedDate) =>
              onChangeDate(currentPickerIndex, event, selectedDate)
            }
            themeVariant="light"   // iOS 배경 버그 방지
          />
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={() => setCurrentPickerIndex(null)}
          >
            <Text style={styles.confirmText}>확인</Text>
          </TouchableOpacity>
        </View>

      )}

        

    </View>
  );
};

export default InputScreen;



// ----------------------------
// 스타일
// ----------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 50,
  },

  scrollBox: {
    flex: 1,
    width: 290,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#DDD",
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#444",
    marginBottom: 8,
    marginTop: 12,
  },

  inputContainer: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },

  spec: {
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 10,
  },

  mini: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  title: {
    fontSize: 15,
    fontWeight: "500",
    width: 80,
  },

  input: {
    backgroundColor: "transparent",
    fontSize: 15,
    paddingVertical: 2,
    width: "100%",
  },

  ButtonContainer: {
    flexDirection: "row",
  },

  button1: {
    backgroundColor: '#bee344',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
    width: 120,
    height: 45,
    justifyContent: "center",
    alignContent: "center",
  },

  button: {
    backgroundColor: '#5DADE2',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 20,
    width: 120,
    height: 45,
    marginLeft: 20,
    justifyContent: "center",
    alignContent: "center",
  },

  buttontext: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: "center",
  },

  buttontext1: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: "center",
  },

  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
    zIndex: 10,
  },

  // ---------------------
  // Modal DatePicker 스타일
  // ---------------------
  modalBackdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },

  modalContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },

  modalCloseButton: {
    marginTop: 10,
    alignSelf: "center",
  },
  pickerWrapper: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "white",   // 🔥 필수
  padding: 10,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
},

confirmButton: {
  padding: 15,
  alignItems: "center",
},

confirmText: {
  fontSize: 16,
  color: "#007AFF",
}

});