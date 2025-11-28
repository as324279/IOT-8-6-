import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  SafeAreaView,
  Alert,
  Modal,
  Pressable,
  // Platform 제거됨
} from "react-native";
import axios from "axios";
import TopHeader from "../../components/TopHeader";
import { useAuth } from "../../components/AuthProvider";
import { API_BASE_URL } from "../../config/apiConfig";

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
  const { token, signOut } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [nickname, setNickname] = useState("");

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // 1. 내 정보 불러오기 (DB의 'name' 컬럼을 가져옴)
  useEffect(() => {
    const fetchMyInfo = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // 백엔드 응답 구조 확인 (DB 컬럼이 name이므로 name을 찾습니다)
        const userData = response.data.data || response.data;

        if (userData.name) {
          setNickname(userData.name);
        } else if (userData.nickname) {
          // 혹시 DTO에서 nickname으로 변환해서 줄 수도 있으니 대비
          setNickname(userData.nickname);
        }
      } catch (error) {
        console.log("내 정보 불러오기 실패:", error);
      }
    };

    fetchMyInfo();
  }, [token]);

  // 2. 닉네임 변경 (DB의 'name'을 수정)
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert("오류", "닉네임을 입력해주세요.");
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/api/v1/users/me`,
        { name: nickname }, // DTO에 맞춰 'name'으로 전송
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      Alert.alert("성공", "닉네임이 변경되었습니다.");
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      Alert.alert("오류", "닉네임 변경에 실패했습니다.");
    }
  };

  // 3. 로그아웃 (앱 전용 깔끔 버전)
  const handleLogout = async () => {
    Alert.alert("로그아웃", "정말 로그아웃 하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "로그아웃",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  };

  // 4. 회원 탈퇴
  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      Alert.alert("오류", "비밀번호를 입력해주세요.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/v1/users/me/withdraw`,
        { password: deletePassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setIsDeleteModalVisible(false);

      Alert.alert("탈퇴 완료", "계정이 삭제되었습니다.", [
        {
          text: "확인",
          onPress: async () => {
            await signOut();
            router.replace("/login");
          },
        },
      ]);
    } catch (error) {
      console.error("탈퇴 실패:", error.response?.data);
      const msg =
        error.response?.data?.message ||
        "비밀번호가 일치하지 않거나 오류가 발생했습니다.";
      Alert.alert("탈퇴 실패", msg);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
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
            <Text style={styles.nickname}>{nickname || "닉네임"}</Text>
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

        {/* 탈퇴 버튼 영역 (클릭 범위 수정됨) */}
        <View style={styles.deleteAccountContainer}>
          <TouchableOpacity
            onPress={() => {
              setDeletePassword("");
              setIsDeleteModalVisible(true);
            }}
            style={{ padding: 5 }}
          >
            <Text style={styles.deleteAccountText}>계정 탈퇴</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 탈퇴 모달 */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isDeleteModalVisible}
        onRequestClose={() => setIsDeleteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>계정 탈퇴</Text>
            <Text style={styles.modalSubTitle}>
              탈퇴를 위해 현재 비밀번호를 입력해주세요.{"\n"}
              탈퇴 시 모든 데이터는 삭제됩니다.
            </Text>

            <TextInput
              style={styles.modalInput}
              placeholder="비밀번호 입력"
              secureTextEntry={true}
              value={deletePassword}
              onChangeText={setDeletePassword}
            />

            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsDeleteModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.deleteButton]}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.deleteButtonText}>탈퇴하기</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9f9f9" },
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
  nickname: { fontSize: 22, fontWeight: "bold", flex: 1, marginHorizontal: 5 },
  nicknameInput: {
    fontSize: 22,
    fontWeight: "bold",
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginHorizontal: 5,
    paddingVertical: 0,
  },
  menuGroup: { marginTop: 10, backgroundColor: "#fff" },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  menuText: { flex: 1, fontSize: 16 },
  logoutSection: {
    marginTop: 20,
    backgroundColor: "#fff",
  },
  logoutButton: { paddingVertical: 18, paddingHorizontal: 20 },
  logoutText: { fontSize: 16, color: "#e74c3c" },

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

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#e74c3c",
  },
  modalSubTitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 20,
  },
  modalInput: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  modalButtonRow: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: "center",
    marginHorizontal: 5,
  },
  cancelButton: { backgroundColor: "#f0f0f0" },
  deleteButton: { backgroundColor: "#e74c3c" },
  cancelButtonText: { color: "#333", fontWeight: "bold" },
  deleteButtonText: { color: "white", fontWeight: "bold" },
});
