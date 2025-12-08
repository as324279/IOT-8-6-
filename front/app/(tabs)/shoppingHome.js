import React from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

// 컴포넌트
import TopHeader from "../../components/TopHeader";
import NewItemForm from "../../components/shopping/NewItemForm";
import ShoppingListItem from "../../components/shopping/ShoppingListItem";
import RoomSelectView from "../../components/shopping/RoomSelectView";

// Hook 가져오기
import { useShoppingManager } from "../../hooks/useShoppingManager";

const ShoppingHome = () => {
  const {
    currentGroupId,
    currentGroupName,
    myRooms,
    active,
    newInput,
    filteredItems,
    selectedCount,
    setActive,
    setNewInput,
    handleSelectRoom,
    handleBackToRoomSelect,
    addItem,
    handleQuantityChange,
    handleToggleSelect,
    handleBatchComplete,
  } = useShoppingManager();

  // 방이 선택되지 않았을 때 방 목록 보여주기
  if (!currentGroupId) {
    return <RoomSelectView rooms={myRooms} onSelect={handleSelectRoom} />;
  }

  //쇼핑 리스트 화면
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: "undefined" })}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        {/* 헤더 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            onPress={handleBackToRoomSelect}
            style={{ padding: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{currentGroupName} 장보기</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 탭 */}
        <View style={styles.Tab}>
          <TouchableOpacity
            style={[styles.tab1, active === "need" && styles.activeTab]}
            onPress={() => setActive("need")}
          >
            <Text
              style={[styles.tabText, active === "need" && styles.activeText]}
            >
              구매 필요
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab1, active === "buy" && styles.activeTab]}
            onPress={() => setActive("buy")}
          >
            <Text
              style={[styles.tabText, active === "buy" && styles.activeText]}
            >
              구매 완료
            </Text>
          </TouchableOpacity>
        </View>

        {/* 목록 */}
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <ShoppingListItem
              item={item}
              onToggleSelect={() => handleToggleSelect(item.id)}
              onQuantityChange={(amount) =>
                handleQuantityChange(item.id, amount)
              }
            />
          )}
          contentContainerStyle={{ paddingBottom: 150 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 50, color: "#999" }}>
              물품이 없습니다.
            </Text>
          }
        />

        {/* 하단 버튼들 */}
        {selectedCount > 0 && active === "need" && !newInput && (
          <TouchableOpacity
            style={styles.batchButton}
            onPress={handleBatchComplete}
          >
            <Text style={styles.batchButtonText}>
              {selectedCount}개 항목 구매 완료
            </Text>
          </TouchableOpacity>
        )}

        {!newInput && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setNewInput(true)}
          >
            <FontAwesome5 name="plus" size={24} color="#fff" />
          </TouchableOpacity>
        )}

        {/* 물품 추가 */}
        {newInput && (
          <NewItemForm onAdd={addItem} onCancel={() => setNewInput(false)} />
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default ShoppingHome;

// 스타일
const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold" },
  Tab: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  tab1: { flex: 1, paddingVertical: 12, alignItems: "center" },
  activeTab: { backgroundColor: "#E9F2FF" },
  tabText: { fontSize: 14, color: "#999" },
  activeText: { color: "#4A90E2", fontWeight: "bold" },
  icon: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#53ACD9",
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  batchButton: {
    position: "absolute",
    bottom: 90,
    left: 20,
    right: 20,
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    elevation: 5,
  },
  batchButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
