import { useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useRef, useState,useEffect } from "react";
import { Button, StyleSheet, View } from "react-native";
import { OCR_API_URL } from "../config/apiConfig";

const SERVER_URL = OCR_API_URL; 


const ReceiptOCR = () => {
  const router = useRouter();
  const [imageUri, setImageUri] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [items,setItems] = useState([]);
  const {group_id,locationId} = useLocalSearchParams();

  useEffect( () => {
    console.log("그룹 아이디 확인",group_id);
  }, [group_id]);

  useEffect( () => {
    console.log("장소 아이디 확인",locationId);
  }, [locationId]);

  useEffect( () => {
    cameraImage();
  }, []);
  
  const handleInput = () => {
    router.push({
      pathname:"inputScreen"
    })
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      analyzeImage(result.assets[0].uri);
    }
  };

  const cameraImage = async () => {

      const permission = await ImagePicker.requestCameraPermissionsAsync();
        if (!permission.granted) {
        alert("카메라 권한이 필요합니다.");
        return;
     }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images,
        quality:1,
        base64:false
      });

      const uri = result.assets[0].uri;

    
    
      if (!result.canceled) {
        router.push({
          pathname:"/loading",
          params:{imageUri:uri,group_id,locationId}
        })
      }
    
  }

  
  const analyzeImage = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "receipt.jpg",
        type: "image/jpeg",
      });

      const response = await fetch(SERVER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      const data = await response.json();

      router.push({
        pathname:"recieptScreen",
        params: {
          imageUri:uri,
          items:JSON.stringify(data.parsed),
          rawText:data.rawText,
          group_id,
          created_by
        }
      });

      const parsed = Array.isArray(data.parsed) ? data.parsed : typeof data.parsed === "object" && data.parsed != null ?[data.parsed] : [];
      setItems(parsed);

      
    } catch (error) {
      console.error("❌ OCR 요청 중 오류:", error);
      setItems("[처리 중 오류 발생]");
    } finally {
      setLoading(false);
    }

  };
  const updateItem = (index, field, value) => {
      const updated = [...items];
      updated[index][field] = value;
      setItems(updated);
  };

  const SaveDB = async () => {
    try {
      setLoading(true);

      const saveUrl = OCR_API_URL.replace('/ocr', '/save-item');

      const response = await fetch(saveUrl, {
        method: "POST",
        headers : {
          "Content-Type" : "application/json",
        },
        body:JSON.stringify({items, group_id , 
                              created_by}),
      });

    const dataItem = await response.json();
    console.log("저장 결과:",dataItem);

    } catch (error) {
      console.log("DB저장 오류");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <View style = {styles.B}>
            <Button title="영수증 이미지 선택" onPress={pickImage} color="#7DBCE9" />
            <View style = {{height:10}}/>
            <Button title = "영수증 촬영" onPress={cameraImage} color= "#7DBCE9"/>
<           View style = {{height:10}}/>
            <Button title = "직접 입력" onPress={handleInput} color= "#7DBCE9"/>
        </View>
    </View>
  );
};

export default ReceiptOCR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F8F9FB",
  },
  image: {
    width: 150,
    height: 150,
    marginVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  B:{marginTop:50},
  scrollBox: {
    flex: 1,
    width: 300,
    height:400,
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
  resultText: {
    fontSize: 13,
    color: "#333",
    lineHeight: 18,
  },
  // itemBox: {
  //   flexDirection: "row",
  //   justifyContent: "space-between",
  //   backgroundColor: "#F0F6FC",
  //   borderRadius: 8,
  //   padding: 10,
  //   marginBottom: 6,
  // },
  // itemText: {
  //   fontSize: 14,
  //   color: "#333",
  // },
  // priceText: {
  //   fontSize: 14,
  //   fontWeight: "bold",
  //   color: "#7DBCE9",
  // },
  inputContainer:{
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  name : {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  price:{
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  input : {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: "#FFF",
  },
  button : {
    backgroundColor: '#5DADE2',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop:20,

  },
  buttontext : {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  }
});