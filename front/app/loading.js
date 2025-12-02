import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { OCR_API_URL } from "../config/apiConfig"; 

const SERVER_URL = OCR_API_URL; 

const Loading = () => {
    const {imageUri, group_id, locationId} = useLocalSearchParams();

    useEffect(() => {
        console.log("그룹 아이디 확인", group_id);
    }, [group_id]);

    useEffect(() => {
        console.log("장소 아이디 확인", locationId);
    }, [locationId]);
    
    const [items, setItems] = useState([]);
    const router = useRouter();

    useEffect(() => {
        const analyz = async () => { 
            try {
                const formData = new FormData();
                formData.append("image", {
                    uri: imageUri,
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
                    pathname: "/recieptScreen",
                    params: {
                        imageUri,
                        items: JSON.stringify(data.parsed),
                        rawText: data.rawText,
                        group_id,
                        locationId
                    }
                });

                const parsed = Array.isArray(data.parsed) ? data.parsed : typeof data.parsed === "object" && data.parsed != null ? [data.parsed] : [];
                setItems(parsed);
            
            } catch (error) {
                console.error("❌ OCR 요청 중 오류:", error);
                console.log("요청한 주소:", SERVER_URL); 
                setItems("[처리 중 오류 발생]");
            }
        };
        analyz();
    }, []);

    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#5DADE2" />
            <Text style={styles.text}>이미지 분석중입니다..</Text>
        </View>
    )
}
export default Loading;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center', 
        alignItems: 'center'
    },
    text: {
        marginTop: 20,
        fontSize: 16 // fontsize -> fontSize (오타 수정됨)
    }
})