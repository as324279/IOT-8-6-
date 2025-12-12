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
  Alert,
  Modal,
  Pressable,
  Image, // [추가] 이미지 표시용
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; 
import * as ImagePicker from "expo-image-picker"; // [추가] 이미지 선택 라이브러리

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
  const [profileImage, setProfileImage] = useState(null); // [추가] 프로필 사진 상태

  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");

  // 1. 내 정보 불러오기
  useEffect(() => {
    const fetchMyInfo = async () => {
      if (!token) return;

      try {
        const response = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.data || response.data;

        if (userData.name) {
          setNickname(userData.name);
        } else if (userData.nickname) {
          setNickname(userData.nickname);
        }
        
        // [추가] 프로필 사진 URL이 있으면 설정
        // 백엔드 필드명이 photoUrl 이라고 가정합니다. (Item과 동일)
        if (userData.profileImage) {  // 기존: userData.photoUrl
          setProfileImage(userData.profileImage);
        }
      } catch (error) {
        console.log("내 정보 불러오기 실패:", error);
      }
    };

    fetchMyInfo();
  }, [token]);

  // [추가] 이미지 서버 업로드 함수 (InputScreen.js에서 가져옴)
  const uploadImageToServer = async (uri) => {
    try {
      const fileName = uri.split("/").pop();
      const fileType = "image/jpeg";

      const formData = new FormData();
      formData.append("file", {
        uri,
        type: fileType,
        name: fileName,
      });

      const response = await fetch(`${API_BASE_URL}/api/v1/images/upload`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          // multipart/form-data는 Content-Type 헤더를 직접 설정하지 않음 (fetch가 알아서 함)
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("이미지 업로드 실패");
      }

      const data = await response.json();
      return data.data.imageUrl; // 서버가 돌려준 이미지 URL

    } catch (error) {
      console.log("이미지 업로드 오류:", error);
      throw error;
    }
  };

  // [추가] 프로필 사진 변경 핸들러
  const handleUpdateProfileImage = () => {
    Alert.alert("프로필 사진 변경", "사진을 가져올 방법을 선택하세요.", [
      { text: "취소", style: "cancel" },
      { 
        text: "카메라 촬영", 
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("권한 필요", "카메라 권한이 필요합니다.");
            return;
          }
          const result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // 프로필이니 편집(크롭) 허용
            aspect: [1, 1],      // 1:1 정사각형 비율
            quality: 0.7,
          });
          processImageSelection(result);
        }
      },
      { 
        text: "앨범에서 선택", 
        onPress: async () => {
          const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!permission.granted) {
            Alert.alert("권한 필요", "앨범 접근 권한이 필요합니다.");
            return;
          }
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          processImageSelection(result);
        }
      }
    ]);
  };

  // [추가] 선택된 이미지 처리 및 서버 저장
  const processImageSelection = async (result) => {
    if (!result.canceled) {
      try {
        const uri = result.assets[0].uri;
        
        // 1. 이미지 서버에 업로드
        const uploadedUrl = await uploadImageToServer(uri);
        
        // 2. 내 정보 업데이트 (PATCH)
        await axios.patch(
          `${API_BASE_URL}/api/v1/users/me`,
          // ▼▼▼ [수정 2] 여기를 'profileImage'로 변경! ▼▼▼
          { profileImage: uploadedUrl }, // 기존: photoUrl: uploadedUrl
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // 3. 화면 갱신
        setProfileImage(uploadedUrl);
        Alert.alert("성공", "프로필 사진이 변경되었습니다.");

      } catch (e) {
        console.error("프로필 변경 실패", e);
        Alert.alert("실패", "사진 등록에 실패했습니다.");
      }
    }
  };


  // 2. 닉네임 변경
  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert("오류", "닉네임을 입력해주세요.");
      return;
    }
    try {
      await axios.patch(
        `${API_BASE_URL}/api/v1/users/me`,
        { name: nickname }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditing(false);
      Alert.alert("성공", "닉네임이 변경되었습니다.");
    } catch (error) {
      console.error("닉네임 변경 실패:", error);
      Alert.alert("오류", "닉네임 변경에 실패했습니다.");
    }
  };

  // 3. 로그아웃
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }} edges={["top"]}>
      <TopHeader
        title="마이페이지"
        showBack={false}
        showIcons={true}
        onNotificationPress={() => console.log("알림 클릭")}
      />

      <ScrollView style={styles.container}>
        <View style={styles.profileSection}>
          
          {/* [수정] 프로필 이미지 영역에 클릭 이벤트 추가 */}
          <TouchableOpacity 
            style={styles.profileImageContainer}
            onPress={handleUpdateProfileImage} // 클릭 시 팝업
          >
            {profileImage ? (
              // 사진이 있으면 이미지 표시
              <Image 
                source={{ uri: `${API_BASE_URL}${profileImage}` }} 
                style={styles.fullImage}
                resizeMode="cover"
              />
            ) : (
              // 없으면 기존 아이콘 표시
              <MaterialCommunityIcons
                name="camera-outline"
                size={40}
                color="#8e8e8e"
              />
            )}
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
    overflow: 'hidden',
  },
  // [추가] 이미지 꽉 채우기
  fullImage: {
    width: "100%",
    height: "100%",
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