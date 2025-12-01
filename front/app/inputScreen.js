import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { OCR_API_URL } from "../config/apiConfig";
import { API_BASE_URL } from '../config/apiConfig';
import AsyncStorage from "@react-native-async-storage/async-storage";

const SERVER_URL = OCR_API_URL; 


const InputScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [items,setItems] = useState([]);
    const {group_id,locationId} = useLocalSearchParams();

    

    const [itemList, setItemList] = useState([
      {ItemName:"", ItemCount: "", expiry_date: ""}
    ]);

    const addItem = () => {
      setItemList([
        ...itemList,
        {ItemName:"", ItemCount: "", expiry_date: ""}
      ]);
    };

    const updateItem = (index, field, value) => {
          const updated = [...itemList];
          updated[index][field] = value;
          setItemList(updated);
      };

      const cameraImage = async (index) => {
          
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
          
              if (!result.canceled) {
               
              }
            }

    

    const back = () => {
      setItemList([{ItemName:"", ItemCount: "", expiry_date: ""} ])
      router.push("./mainHome");
    }

    const SaveDB = async () => {
  try {
    setLoading(true);
    const token = await AsyncStorage.getItem("userToken");
    const gid = Array.isArray(group_id) ? group_id[0] : group_id;

    for (const item of itemList){
      const response = await fetch(`${API_BASE_URL}/api/v1/groups/${gid}/items`, {
        method: "POST",
        headers : {
          "Authorization":`Bearer ${token}`,
          "Content-Type" : "application/json",
        },
        body: JSON.stringify({
          name: item.ItemName,
          quantity: item.ItemCount,
          expiry_date: item.expiry_date || null,
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
                
                <KeyboardAvoidingView style = {{flex:1}} behavior={Platform.select({ ios : 'padding', android : 'undefined'})}>
                <ScrollView style={styles.scrollBox}>
                  <Text style={styles.sectionTitle}>🧾 인식 상품 등록</Text>
    
                  
                  
                  {itemList.map( (item,idx) => (
                      <View key = {idx} style = {styles.inputContainer}>

                        <TouchableOpacity onPress={cameraImage}>
                          <Ionicons name = "camera" size ={30} color = "black"></Ionicons>
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
                        
                        <View style = {styles.mini}>
                          <Text style = {styles.title}>유통기한</Text>
                        <TextInput 
                          style = {styles.input}
                          value = {item.expiry_date}
                          onChangeText={(text) => updateItem(idx, "expiry_date", text)}
                          underlineColor='transparent'
                          activeUnderlineColor='transparent'
                        />
                        </View>

                      </View>
                  ))}
                      
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
        
                
              
            </View>
          );
        
}
export default InputScreen;

const styles = StyleSheet.create({
    container:{
    flex: 1,
    backgroundColor: "#F8F9FB",
    padding: 50,

  },
  addButton: {

  },
  addContainer: {

  },
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
  }
});