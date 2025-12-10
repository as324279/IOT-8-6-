import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { APIConnectionError } from 'openai';
import { API_BASE_URL } from '../config/apiConfig';
import DateTimePicker from '@react-native-community/datetimepicker';


const RecieptScreen = () => {
    const router = useRouter();
    const { imageUri, items, rawText, group_id, created_by,locationId } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [currentPickerIndex, setCurrentPickerIndex] = useState(null);
    const [isDateModalVisible, setIsDateModalVisible] = useState(false);


    const parsedItems = JSON.parse(items).map(item => ({
      ...item,
      expiry_date: item.expiry_date ?? "",
      dateObj: item.expiry_date ? new Date(item.expiry_date) : new Date(),
      photoBytes: item.photoBytes ?? null,
    }));

    const [itemList, setItemList] = useState(parsedItems);

    useEffect ( () => {
      if(!items) return;
      const updated = JSON.parse(items);
      setItemList(updated);

    } , [items]);

    useEffect( () => {
    console.log("그룹 아이디 확인",group_id);
    }, [group_id]);

    const back = () => {
      router.push("./mainHome");
    }
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
      // 절대 직접 multipart/form-data 넣지 말기!!
    },
    body: formData,
  });

  if (!response.ok) {
    const err = await response.text();
    console.log("이미지 업로드 오류:", err);
    throw new Error("업로드 실패");
  }

  const data = await response.json();

  // ApiResponse 구조 때문에 data.data.imageUrl 사용
  return data.data.imageUrl;
};


  // 카메라 촬영 + 업로드
  const cameraImage = async (index) => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("카메라 권한이 필요합니다.");
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
        updateItem(index, "photoUrl", url);
      } catch (e) {
        console.log("업로드 실패", e);
        Alert.alert("이미지 업로드 실패");
      }
    }
  };

  const onChangeDate = (index, event, selectedDate) => {
  if (!selectedDate) return;

  const updated = [...itemList];
  updated[index].expiry_date = selectedDate.toISOString().split("T")[0];
  updated[index].dateObj = selectedDate;
  setItemList(updated);

  if (Platform.OS === "android") {
    setCurrentPickerIndex(null); // Android는 닫기
  }
};
//물품 수정
const updateItem = (index, field, value) => {
  setItemList((prevList) => {
    if (!prevList || !prevList[index]) return prevList;

    const updated = [...prevList];
    updated[index] = { ...updated[index], [field]: value };
    return updated;
  });
};
//물품 추가
  const addItem = () => {
    setItemList([
      ...itemList,
      { ItemName: "", ItemCount: "", expiry_date: "", photoUrl: null }
    ]);
  };
//물품 삭제
const deleteItem = (index) => {
  setItemList((prevList) => prevList.filter((_, i) => i !== index));
};


  const SaveDB = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("userToken");
      const gid = Array.isArray(group_id) ? group_id[0] : group_id;

      for (const item of itemList) {
        const url = !locationId
          ? `${API_BASE_URL}/api/v1/groups/${gid}/items`
          : `${API_BASE_URL}/api/v1/locations/${locationId}/items`;

        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: item.ItemName?.trim(),
            quantity: Number(item.ItemCount),
            expiryDate: item.expiry_date?.trim() || null,
            photoUrl: item.photoUrl || null,
          }),
        });

        if (!response.ok) {
          const err = await response.text();
          console.log("저장 오류:", err);
          throw new Error("저장 실패");
        }
      }

      Alert.alert("등록 완료!");
      router.push("mainHome");
    } catch (e) {
      console.log("SaveDB 오류:", e);
    } finally {
      setLoading(false);
    }
  };
    
      return (
        <View style={styles.container}>
            
            <KeyboardAvoidingView style = {{flex:1}} behavior={Platform.select({ ios : 'padding', android : 'undefined'})}>
            <ScrollView style={styles.scrollBox}>
              <Text style={styles.sectionTitle}>🧾 상품 등록</Text>

              <Text style = {styles.label}>상품 수: ({itemList.length}) </Text>
              
              {itemList.length > 0 &&  (
                itemList.map( (item,idx) => (
                  <View key={idx} style={styles.inputContainer}>

                    {/* 우측 상단 삭제 버튼 */}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => deleteItem(idx)}
                    >
                      <Ionicons name="trash" size={22} color="red" />
                    </TouchableOpacity>

                    {/* 기존 카메라 버튼 */}
                    <TouchableOpacity onPress={() => cameraImage(idx)}>
                      <Ionicons name="camera" size={30} color="black" />
                    </TouchableOpacity>


                    <View style = {styles.mini}>
                      <Text style = {styles.title}>수량</Text>
                      <TextInput 
                      style = {styles.input}
                      value = {item.ItemCount}
                      onChangeText={(text) => updateItem(idx, "ItemCount", text)}
                      underlineColor='transparent'
                      activeUnderlineColor='transparent'
                      />
                    </View>
                    <View style = {styles.spec} />
                    
                    <View style = {styles.mini}>
                      <Text style = {styles.title}>상품명</Text>
                    <TextInput 
                      style = {[styles.input, {flex:1}]}
                      value = {item.ItemName}
                      onChangeText={(text) => updateItem(idx, "ItemName", text)}
                      underlineColor='transparent'
                      activeUnderlineColor='transparent'
                     
                    />
                    </View>
    
                    <View style = {styles.spec} />
                    
                    <View style={styles.mini}>
                    <Text style={styles.title}>유통기한</Text>

                    <TouchableOpacity
                      style={[styles.input, { flexDirection: "row", alignItems: "center", paddingVertical: 10 }]}
                      onPress={() => setCurrentPickerIndex(idx)}
                    >
                      <Ionicons name="calendar-outline" size={20} color="#5AC8FA" style={{ marginRight: 6 }} />

                      <Text style={{ fontSize: 15, color: item.expiry_date ? "#000" : "#999" }}>
                        {item.expiry_date || "날짜 선택"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  </View>
                    
                  
                ))
              )}

            <Pressable style = {styles.addContainer} onPress={addItem}>
              <Text style = {styles.addButton}> + 상품 추가</Text>
            </Pressable> 
    
            <View style = {styles.ButtonContainer}>
              <Pressable style = {styles.button1} onPress={back}>
              <Text style = {styles.buttontext1}>취소</Text>
            </Pressable>

            <Pressable style = {styles.button} onPress={SaveDB}>
              <Text style = {styles.buttontext}>등록</Text>
            </Pressable>
            </View>
    
            </ScrollView>
            </KeyboardAvoidingView>
    
                      {currentPickerIndex !== null && (
            <View style={styles.pickerWrapper}>
              <DateTimePicker
                value={itemList[currentPickerIndex].dateObj || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(event, date) => onChangeDate(currentPickerIndex, event, date)}
                themeVariant="light"
              />

              {Platform.OS === "ios" && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => setCurrentPickerIndex(null)}
                >
                  <Text style={styles.confirmText}>확인</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          
        </View>
      );
    };

export default RecieptScreen;

const styles = StyleSheet.create({
  
  container:{
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 50,

  },
  addContainer:{},
  addButton:{},
   scrollBox: {
     flex: 1,
     width: 290,
     height: 200,
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
  
  label:{
    fontSize:15,
    color :"#777",
    marginTop:20,
    marginBottom:20
  },
  
  inputContainer:{
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  spec:{
    height: 1,
    backgroundColor: "#E8E8E8",
    marginVertical: 10,
  },
  mini:{
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 15,
    fontWeight: "500",
    width: 80,
  },
  input : {
    backgroundColor: "transparent",
    fontSize: 15,
    paddingVertical: 2,
    width:"100%",

  },
  ButtonContainer:{
    flexDirection:"row"
  },
  button1:{
  backgroundColor: '#bee344',
    paddingVertical: 15,
    paddingHorizontal:15,
    borderRadius: 8,
    marginTop:20,
    width:120,
    height:45,
    justifyContent:"center",
    alignContent:"center",  
  },
  button : {
    backgroundColor: '#5DADE2',
    paddingVertical: 15,
    paddingHorizontal:15,
    borderRadius: 8,
    marginTop:20,
    width:120,
    height:45,
    marginLeft:20,
    justifyContent:"center",
    alignContent:"center",
  },
  buttontext : {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign:"center"
  },
  buttontext1:{
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign:"center"
  },
  deleteButton: {
  position: "absolute",
  top: 10,
  right: 10,
  padding: 5,
  zIndex: 10,
},
pickerWrapper: {
  position: "absolute",
  bottom: 0,
  left: 0,
  right: 0,
  backgroundColor: "#fff",
  padding: 12,
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
},

});
