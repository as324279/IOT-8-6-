import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import TopHeader from "../components/TopHeader";
import { useLocalSearchParams } from "expo-router";
import {
  Alert, Modal, TextInput, ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import RoomTabs from "../components/room/RoomTabs";
import axios from "axios";
import { API_BASE_URL } from "../config/apiConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
// import { Item } from "react-native-paper/lib/typescript/components/Drawer/Drawer";


// 샘플 데이터
// const ALL_ITEMS = [
//   { id: 1, name: "콩나물", location: "주방" },
//   { id: 2, name: "햇반", location: "주방" },
//   { id: 3, name: "샴푸", location: "욕실" },
//   { id: 4, name: "물티슈", location: "거실" },
//   { id: 5, name: "두부", location: "주방" },
//   { id: 6, name: "휴지", location: "거실" },
//   { id: 7, name: "치약", location: "욕실" },
// ];

 const ItemCard = ({ item }) => {
   const router = useRouter();
  
   const handlePress = () => {
     router.push({
       pathname:`/itemDetail?id=${item.id}`
     });
   };

  
   return (
     <TouchableOpacity style={styles.itemCard}>
       <View style={styles.itemImagePlaceholder} />
       <Text style={styles.itemText}>{item.name}</Text>

       <TouchableOpacity onPress={handlePress}>
         <MaterialCommunityIcons name="dots-vertical" size={24} color="#555" />
       </TouchableOpacity>
     </TouchableOpacity>
   );
 };

const InventoryScreen = () =>  {
  const router = useRouter();

  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({name: "전체", locationId:null});
  const {group_id} = useLocalSearchParams();
  const [items, setItems] = useState([]);
  const [openMenu, setOpenMenu] = useState(false);

  useEffect( () => {
  console.log("그룹 아이디 확인",group_id);
}, [group_id]);

  useEffect( () => {
    getlocation();
  }, []);

  useEffect( () => {
    getItems();
  }, [selectedCategory]);
  

  // [추가] 장소 추가 모달 상태
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

// 모달 추가
  const ModalMenu = () => {
    setOpenMenu(prev => !prev);
  }
  // [추가] 장소 추가 함수
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      Alert.alert("오류", "장소 이름을 입력해주세요.");
      return;
    }
    if (categories.includes(newCategoryName)) {
      Alert.alert("오류", "이미 존재하는 장소입니다.");
      return;
    }

    try{
      const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const res = await axios.post(`${API_BASE_URL}/api/v1/groups/${group_id}/locations`, 
        {name: newCategoryName.trim()},
        {headers: { Authorization: `Bearer ${token}` }
      });

      console.log("장소 생성 완료",res.data);
      await getlocation();

      setNewCategoryName("");
      setIsAddModalVisible(false);
    } catch (error) {
      console.log("장소 생성 에러:",error.response?.data || error);
    }
  };

  //  const filteredItems = useMemo(() => {
  //    // '전체' 탭이면 모든 아이템 반환
  //    if (selectedCategory === "전체") {
  //      return ALL_ITEMS;
  //    }
  // //   // 장소에 있는 물품만
  //    return ALL_ITEMS.filter((item) => item.location === selectedCategory);
  //  }, [selectedCategory]);

  const handleAddItemPress = () => {
    // 물품추가 페이지
    router.push({
      pathname:"/RecieptOCR",
      params:{
        group_id,
        locationId:selectedCategory.locationId
      }
    });
  };
//저장된 물품 조회
  const getItems = async () => {
    try{
      const token = await AsyncStorage.getItem("userToken");
      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const url =
      selectedCategory.locationId === null
        ? `${API_BASE_URL}/api/v1/groups/${group_id}/items`
        : `${API_BASE_URL}/api/v1/groups/${group_id}/items?locationId=${selectedCategory.locationId}`;

      const get = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("물품 조회:",get.data);

      const list = get.data.data;
      setItems(list);
      
    } catch (error){
      console.log("물품 조회 오류:",error.response?.data || error);
    }
  }
//location 조회
  const getlocation = async () => {
    try{
    const token = await AsyncStorage.getItem("userToken");

      if (!token) {
        Alert.alert("사용자 정보가 필요해요!");
        return;
      }

      const get = await axios.get(`${API_BASE_URL}/api/v1/groups/${group_id}/locations`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("location조회", get.data);

      const locationList = get.data.data;

      const formindex = [
        {name: "전체",locationId:null},
        ...locationList.map(loc => ({
          name:loc.name,
          locationId:loc.locationId,
        }))
      ];
      setCategories(formindex);

    } catch (error) {
      console.log("위치 조회 오류!", error.response?.data || error);
    }
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <TopHeader
        showBack={true}
        showIcons={true}
        title="채움" 
      />

      <View style={styles.container}>
        <RoomTabs
          categories={categories} 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onAddCategory={() => setIsAddModalVisible(true)} 
        />

         <ScrollView
          style={styles.listContainer}
          contentContainerStyle={{ paddingBottom: 100 }}
        >
          {items.length === 0 ? (
            <Text>등록된 물품이 없어요</Text>
          ) : (
            items.map(item => (
              <ItemCard key = {item.itemId} item = {item}/>
            ))
          )}
        </ScrollView> 

        <TouchableOpacity style={styles.fab} onPress={ModalMenu}>
          <MaterialCommunityIcons name="plus" size={30} color="#fff" />
        </TouchableOpacity>

        {openMenu && (
          <View style={styles.fabMenuBox}>
            <TouchableOpacity 
              style={styles.fabMenuItem}
              onPress={() => {
              setOpenMenu(false);
              router.push({
              pathname: "/recieptOCR",
              params: { group_id, locationId: selectedCategory.locationId }
          });
        }}
        >
        <MaterialCommunityIcons name="camera" size={22} color="#333" />
          <Text style={styles.fabMenuText}>영수증 촬영하기</Text>
      </TouchableOpacity>

    <TouchableOpacity 
      style={styles.fabMenuItem}
      onPress={() => {
        setOpenMenu(false);
        router.push({ pathname: "/inputScreen" , params: {group_id,locationId:selectedCategory.locationId}} );
      }}
    >
      <MaterialCommunityIcons name="pencil" size={22} color="#333" />
      <Text style={styles.fabMenuText}>직접 입력하기</Text>
    </TouchableOpacity>
  </View>
)}


        <Modal
          transparent={true}
          visible={isAddModalVisible}
          onRequestClose={() => setIsAddModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>새 장소 추가</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="예: 베란다, 서재"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setIsAddModalVisible(false)} style={styles.cancelButton}>
                  <Text>취소</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddCategory} style={styles.addButton}>
                  <Text style={{color: 'white'}}>추가</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}
export default InventoryScreen;

// 스타일 시트
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    backgroundColor: "#F5F6FA",
  },
  // 물품 목록
  listContainer: {
    flex: 1,
    paddingTop: 8,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,

    elevation: 3,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e9e9e9",
    marginRight: 16,
  },
  itemText: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
  },
  // 물품 추가 버튼
  fab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#5AC8FA",
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  modalInput: {
    borderBottomWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
    fontSize: 16,
    padding: 5,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: 10,
    marginRight: 10,
  },
  addButton: {
    padding: 10,
    backgroundColor: '#5AC8FA',
    borderRadius: 5,
  },
  //물품 추가 스타일
  fabMenuBox: {
  position: "absolute",
  bottom: 95,
  right: 20,
  backgroundColor: "#FFFFFF",
  borderRadius: 12,
  paddingVertical: 10,
  width: 180,

  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 3 },
  elevation: 6,

  zIndex: 100,
},

fabMenuItem: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 10,
  paddingHorizontal: 14,
},

fabMenuText: {
  marginLeft: 10,
  fontSize: 15,
  color: "#333",
  fontWeight: "500",
},

});
