import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Button, Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { OCR_API_URL } from "../../config/apiConfig"; // [수정] 중앙 설정 파일에서 URL 가져오기
import { TextInput } from "react-native-paper";

const ReceiptOCR = () => { // (컴포넌트 이름은 ReceiptOCR로 둬도 됨)
  const [imageUri, setImageUri] = useState(null);
  // const [textResult, setTextResult] = useState("");
  const [items,setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      await analyzeImage(uri);
    }
  };

  const analyzeImage = async (uri) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", {
        uri,
        name: "receipt.jpg",
        type: "image/jpeg",
      });

      // [수정] OCR_API_URL 사용
      const response = await fetch(OCR_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });

      
    const data = await response.json();

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

  return (
    <View style={styles.container}>
        <View style = {styles.B}>
            <Button title="영수증 이미지 선택" onPress={pickImage} color="#7DBCE9" />
        </View>
      
      
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

        <KeyboardAvoidingView style = {{flex:1}} behavior={Platform.select({ ios : 'padding', android : 'undefined'})}>
        <ScrollView style={styles.scrollBox}>
          <Text style={styles.sectionTitle}>🧾 OCR 추출 결과</Text>
          
          {items.length > 0 ?  (
            items.map( (item,idx) => (
              <View key = {idx} style = {styles.inputContainer}>
                <Text style = {styles.name}>상품명</Text>
                <TextInput 
                  style = {styles.input}
                  value = {item.ItemName}
                  onChangeText={(text) => updateItem(idx, "ItemName", text)}
                />

                <Text style = {styles.price}>가격</Text>
                  <TextInput 
                  style = {styles.input}
                  value={item.ItemPrice}
                  onChangeText={(text) => updateItem(idx, "ItemPrice", text)}
                  keyboardType="numeric"
                />

                <Text style = {styles.count}>수량</Text>
                <TextInput 
                style = {styles.input}
                value = {item.ItemCount}
                onChangeText={(text) => updateItem(idx, "ItemCount", text)}
                />
              </View>
            ))
            ) : (
          <Text>상품 정보가 없습니다.</Text>
        )}

        <Pressable style = {styles.button}>
          <Text style = {styles.buttontext}>등록</Text>
        </Pressable>

        </ScrollView>
        </KeyboardAvoidingView>

        
      
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
    width: 300,
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#CCC",
  },
  B:{marginTop:50},
  scrollBox: {
    flex: 1,
    width: "100%",
    maxHeight: 400,
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
  itemBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F0F6FC",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  itemText: {
    fontSize: 14,
    color: "#333",
  },
  priceText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#7DBCE9",
  },
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


