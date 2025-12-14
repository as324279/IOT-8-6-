import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import TopHeader from "../TopHeader2"; // 경로 확인 필요 (components/TopHeader)

const RoomSelectView = ({ rooms, onSelect }) => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* TopHeader가 공통 컴포넌트라면 여기서도 사용 */}
      <TopHeader showBack={false} showIcons={false} title="장보기 방 선택" />

      <View style={{ padding: 20, flex: 1 }}>
        <Text style={styles.title}>어떤 방의 장보기를 할까요?</Text>

        <FlatList
          data={rooms}
          keyExtractor={(item) => item.groupId.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.roomItem}
              onPress={() => onSelect(item)}
            >
              <View style={styles.iconBox}>
                <MaterialCommunityIcons
                  name="home-variant-outline"
                  size={24}
                  color="#555"
                />
              </View>
              <Text style={styles.roomName}>{item.name}</Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#ccc"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>참여 중인 방이 없습니다.</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  roomItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    backgroundColor: "#eee",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  roomName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  emptyContainer: {
    marginTop: 50,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
  },
});

export default RoomSelectView;
