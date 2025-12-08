import { useState, useEffect } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import * as Clipboard from "expo-clipboard";
import { API_BASE_URL } from "../config/apiConfig";

export const useGroupManager = () => {
  const [rooms, setRooms] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // 모달 상태 관리
  const [modals, setModals] = useState({
    input: false, // 생성/입장 입력창
    result: false, // 결과창
    menu: false, // 하단 메뉴
    rename: false, // 이름 변경
    type: "", // 'create' or 'invite'
  });

  // 입력값 상태
  const [inputs, setInputs] = useState({
    modalValue: "", // 생성/입장 입력값
    renameValue: "", // 이름 변경 입력값
    inviteCode: "", // 결과창 코드
    groupName: "", // 결과창 이름
  });

  const [selectedRoom, setSelectedRoom] = useState(null);

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    const token = await AsyncStorage.getItem("userToken");
    const myId = await AsyncStorage.getItem("userId");
    setUserId(myId);
    if (token) fetchRooms(token);
  };

  // 방 목록 조회
  const fetchRooms = async (token) => {
    try {
      if (!token) token = await AsyncStorage.getItem("userToken");
      const res = await axios.get(`${API_BASE_URL}/api/v1/groups`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRooms(
        res.data.data.map((g) => ({
          id: g.groupId,
          name: g.name,
          memberCount: g.memberCount ?? 1,
          ownerId: g.createdBy?.userId,
        }))
      );
    } catch (e) {
      console.log("조회 에러", e);
    }
  };

  // 모달 제어 헬퍼
  const openModal = (type) =>
    setModals((prev) => ({ ...prev, input: true, type }));
  const closeModal = () => {
    setModals((prev) => ({
      ...prev,
      input: false,
      menu: false,
      rename: false,
      result: false,
    }));
    setInputs((prev) => ({ ...prev, modalValue: "", renameValue: "" }));
  };

  // --- 기능 핸들러들 (기존 MainHome 로직 이동) ---

  // 1. 그룹 생성
  const handleCreateGroup = async () => {
    if (!inputs.modalValue.trim()) return Alert.alert("오류", "이름 입력 필요");
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      const myId = await AsyncStorage.getItem("userId");

      // 그룹 생성
      const res1 = await axios.post(
        `${API_BASE_URL}/api/v1/groups`,
        { name: inputs.modalValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const newGroup = res1.data.data;

      // 초대코드 생성
      const res2 = await axios.post(
        `${API_BASE_URL}/api/v1/groups/${newGroup.groupId}/invites`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 목록 수동 업데이트
      setRooms((prev) => [
        ...prev,
        {
          id: newGroup.groupId,
          name: newGroup.name,
          memberCount: 1,
          ownerId: myId,
        },
      ]);

      // 결과창 세팅
      setInputs((prev) => ({
        ...prev,
        groupName: newGroup.name,
        inviteCode: res2.data.data.code,
      }));
      setModals((prev) => ({ ...prev, input: false, result: true }));
    } catch (e) {
      Alert.alert("오류", "생성 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 그룹 입장
  const handleJoinGroup = async () => {
    if (!inputs.modalValue.trim()) return Alert.alert("오류", "코드 입력 필요");
    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.post(
        `${API_BASE_URL}/api/v1/groups/join`,
        { code: inputs.modalValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRooms(token); // 목록 갱신
      closeModal();
      Alert.alert("성공", "입장 완료");
    } catch (e) {
      Alert.alert("오류", "입장 실패");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. 초대코드 복사
  const handleCopyInvite = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const res = await axios.post(
        `${API_BASE_URL}/api/v1/groups/${selectedRoom.id}/invites`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await Clipboard.setStringAsync(res.data.data.code);
      closeModal();
      Alert.alert("완료", "초대 코드가 복사되었습니다.");
    } catch (e) {
      Alert.alert("오류", "실패");
    }
  };

  // 4. 이름 변경
  const handleRename = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.patch(
        `${API_BASE_URL}/api/v1/groups/${selectedRoom.id}`,
        { name: inputs.renameValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await fetchRooms(token);
      closeModal();
      Alert.alert("성공", "변경되었습니다.");
    } catch (e) {
      Alert.alert("오류", "변경 실패");
    }
  };

  // 5. 나가기/삭제 핸들러
  const handleLeave = async () => {
    const isOwner = selectedRoom.ownerId === userId;

    Alert.alert(
      isOwner ? "그룹 삭제" : "나가기",
      isOwner
        ? "그룹을 완전히 삭제하시겠습니까?"
        : "정말 이 그룹에서 나가시겠습니까?",
      [
        { text: "취소", style: "cancel" },
        {
          text: "확인",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("userToken");

              // [수정 핵심] 방장 여부에 따라 API 주소 분기 처리
              const url = isOwner
                ? `${API_BASE_URL}/api/v1/groups/${selectedRoom.id}` // 방장: 그룹 삭제
                : `${API_BASE_URL}/api/v1/groups/${selectedRoom.id}/members/me`; // 멤버: 그룹 탈퇴

              await axios.delete(url, {
                headers: { Authorization: `Bearer ${token}` },
              });

              await fetchRooms(token);
              closeModal();
              Alert.alert(
                "성공",
                isOwner ? "그룹이 삭제되었습니다." : "그룹에서 나갔습니다."
              );
            } catch (e) {
              console.error("나가기/삭제 실패:", e);
              Alert.alert("오류", "요청을 처리하지 못했습니다.");
            }
          },
        },
      ]
    );
  };

  const handleCopyResultCode = async () => {
    if (!inputs.inviteCode) return;
    await Clipboard.setStringAsync(inputs.inviteCode);
    Alert.alert("복사 완료", "초대 코드가 클립보드에 복사되었습니다.");
  };

  return {
    // State
    rooms,
    userId,
    isLoading,
    modals,
    inputs,
    selectedRoom,
    // Setters (필요한 것만)
    setSelectedRoom,
    setMenuVisible: (visible) =>
      setModals((prev) => ({ ...prev, menu: visible })),
    setRenameVisible: (visible) => {
      setModals((prev) => ({ ...prev, menu: false, rename: visible }));
      if (visible)
        setInputs((prev) => ({ ...prev, renameValue: selectedRoom.name }));
    },
    setInputText: (text) =>
      setInputs((prev) => ({ ...prev, modalValue: text })),
    setRenameText: (text) =>
      setInputs((prev) => ({ ...prev, renameValue: text })),
    // Actions
    openModal,
    closeModal,
    handleCreateGroup,
    handleJoinGroup,
    handleCopyInvite,
    handleRename,
    handleLeave,
    handleCopyResultCode,
  };
};
