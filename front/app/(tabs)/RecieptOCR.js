import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { ActivityIndicator, Button, Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { OCR_API_URL } from "../../config/apiConfig"; // [수정] 중앙 설정 파일에서 URL 가져오기

const ReceiptOCR = () => { // (컴포넌트 이름은 ReceiptOCR로 둬도 됨)
  const [imageUri, setImageUri] = useState(null);
  const [textResult, setTextResult] = useState("");
  const [parsedResult, setParsedResult] = useState(null);
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
      setTextResult(data.rawText || "인식된 텍스트 없음");
      setParsedResult(data.parsed || []);
    } catch (error) {
      console.error("❌ OCR 요청 중 오류:", error);
      setTextResult("처리 중 오류 발생 (IP 주소 및 OCR 서버 실행 확인)");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
        <View style = {styles.B}>
            <Button title="영수증 이미지 선택" onPress={pickImage} color="#7DBCE9" />
        </View>
      
      
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}

      
        <ScrollView style={styles.scrollBox}>
          <Text style={styles.sectionTitle}>🧾 OCR 추출 결과</Text>
          {Array.isArray(textResult) ? (
            textResult.map((Items,idx) => (
              <Text key = {idx}>
                {Items.ItemName} - {Items.ItemPrice}
              </Text>
            ))
          ) : ( <Text style={styles.resultText}>{textResult}</Text>
          )}
          


        </ScrollView>
      
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
});
