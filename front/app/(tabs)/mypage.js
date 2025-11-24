import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
//import { useAuth } from '../../components/AuthProvider';
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView
} from "react-native";
import TopHeader from "../../components/TopHeader";

const MenuButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#8e8e8e" />
    </TouchableOpacity>
  );
};

export default function MyPageScreen() {
  const router = useRouter();
  // 닉네임 수정 기능
  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("닉네임");

  const handleSaveNickname = () => {
    setIsEditing(false);
    console.log("새 닉네임 저장:", nickname);
  };

  //const { signOut } = useAuth();

  const handleLogout = async () => {
    //await signOut();
    console.log("로그아웃 임시 처리");
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* [추가] TopHeader 삽입 */}
      {/* 마이페이지는 탭 화면이므로 showBack={false}가 맞지만, 원하시면 true로 하셔도 됩니다. */}
      <TopHeader
        title="마이페이지"
        showBack={false}
        showIcons={true}
        onNotificationPress={() => console.log("알림 클릭")}
      />

      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          <TouchableOpacity style={styles.profileImageContainer}>
            <MaterialCommunityIcons
              name="camera-outline"
              size={40}
              color="#8e8e8e"
            />
          </TouchableOpacity>

          {isEditing ? (
            <TextInput
              style={styles.nicknameInput}
              value={nickname}
              onChangeText={setNickname}
              autoFocus={true}
            />
          ) : (
            <Text style={styles.nickname}>{nickname}</Text>
          )}

          {isEditing ? (
            <TouchableOpacity onPress={handleSaveNickname}>
              <MaterialCommunityIcons name="check" size={24} color="#3498db" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color="#333"
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.menuGroup}>
          <MenuButton
            title="비밀번호 변경"
            onPress={() => router.push("/(mypage)/passwordChange")}
          />
          <MenuButton
            title="알림 설정"
            onPress={() => router.push("/(mypage)/notificationSettings")}
          />
          <MenuButton
            title="공지사항"
            onPress={() => router.push("/(mypage)/noticeScreen")}
          />
          <MenuButton
            title="서비스 문의"
            onPress={() => router.push("/(mypage)/inquiryScreen")}
          />
        </View>

        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.deleteAccountContainer}
          onPress={() => console.log("계정 탈퇴 클릭")}
        >
          <Text style={styles.deleteAccountText}>계정 탈퇴</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e9e9e9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  nickname: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    marginHorizontal: 5,
  },
  nicknameInput: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 5,
    paddingVertical: 0,
  },
  menuGroup: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  logoutSection: {
    marginTop: 20,
    backgroundColor: "#fff",
  },
  logoutButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    color: "#e74c3c",
  },
  deleteAccountContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: "flex-end",
    paddingBottom: 40,
  },
  deleteAccountText: {
    fontSize: 12,
    color: "#8e8e8e",
    textDecorationLine: "underline",
  },
});
