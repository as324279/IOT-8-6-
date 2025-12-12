import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native"; // Image 추가
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../config/apiConfig"; // API URL 가져오기

const ItemCard = ({ item, onUpdateQuantity, groupId }) => {
  const router = useRouter();

  const handlePress = () => {
    router.push({
      pathname: "/itemDetail",
      params: { itemId: item.itemId, group_id: groupId },
    });
  };

  const handleIncrease = () => onUpdateQuantity(item.itemId, item.quantity + 1);
  const handleDecrease = () => {
    if (item.quantity > 0) onUpdateQuantity(item.itemId, item.quantity - 1);
  };

  // ▼▼▼ [팀원 기능 병합] 이미지 URL 처리 로직 ▼▼▼
  const hasImage = item.photoUrl && item.photoUrl.length > 1;
  const fullImageUrl = hasImage ? `${API_BASE_URL}${item.photoUrl}` : null;
  // ▲▲▲

  return (
    <View style={styles.itemCard}>
      {/* 이미지 및 이름 영역 (클릭 시 상세 이동) */}
      <TouchableOpacity onPress={handlePress} style={styles.contentRow}>
        
        {/* ▼▼▼ [팀원 기능 병합] 이미지가 있으면 보여주고, 없으면 회색 박스 ▼▼▼ */}
        {fullImageUrl ? (
          <Image
            source={{ uri: fullImageUrl }}
            style={styles.itemImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.itemImagePlaceholder} />
        )}
        {/* ▲▲▲ */}

        <Text style={styles.itemText}>{item.name}</Text>
      </TouchableOpacity>

      {/* 빠른 수량 조절 버튼 (작성자님 기능 유지) */}
      <View style={styles.quickQtyBox}>
        <TouchableOpacity onPress={handleDecrease} style={styles.qtyBtn}>
          <MaterialCommunityIcons name="minus" size={16} color="#555" />
        </TouchableOpacity>
        <Text style={styles.qtyText}>{item.quantity}</Text>
        <TouchableOpacity onPress={handleIncrease} style={styles.qtyBtn}>
          <MaterialCommunityIcons name="plus" size={16} color="#555" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    marginVertical: 6,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  // ▼▼▼ [스타일 병합] 이미지 스타일 추가 ▼▼▼
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#e9e9e9", // 로딩 전 배경색
  },
  // ▲▲▲
  itemImagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#e9e9e9",
    marginRight: 12,
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  quickQtyBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 20,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  qtyBtn: { padding: 5 },
  qtyText: {
    fontSize: 14,
    fontWeight: "bold",
    marginHorizontal: 8,
    minWidth: 15,
    textAlign: "center",
  },
});

export default ItemCard;