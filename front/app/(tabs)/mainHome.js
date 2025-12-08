import React from "react";
import { ScrollView, View, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

// 컴포넌트 & 스타일
import TopHeader from "../../components/TopHeader";
import RoomList from "../../components/home/RoomList";
import {
  InputModal,
  ResultModal,
  MenuModal,
  RenameModal,
} from "../../components/home/GroupModals"; // 💡 추가된 모달 import
import { styles } from "../../components/home/HomeStyles";

// 💡 로직 분리한 Hook 가져오기
import { useGroupManager } from "../../hooks/useGroupManager";

const MainHome = () => {
  const router = useRouter();

  // Hook에서 모든 기능과 상태를 꺼내옴
  const {
    rooms,
    userId,
    isLoading,
    modals,
    inputs,
    selectedRoom,
    setSelectedRoom,
    setMenuVisible,
    setRenameVisible,
    setInputText,
    setRenameText,
    openModal,
    closeModal,
    handleCreateGroup,
    handleJoinGroup,
    handleCopyInvite,
    handleRename,
    handleLeave,
    handleCopyResultCode,
  } = useGroupManager();

  // 방 클릭 시 이동
  const handleRoomPress = (room) => {
    router.push({
      pathname: "/inventory",
      params: { group_id: room.id, name: room.name },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <TopHeader showBack={false} showIcons={true} title="채움" />

      <ScrollView
        style={styles.contentContainer}
        contentContainerStyle={{ paddingBottom: 150 }}
      >
        <View style={styles.sectionHeader}>
          
          <Text style={styles.sectionTitle}>참여방</Text>
          
        </View>

        {/* 방 목록 */}
        <RoomList
          rooms={rooms}
          onRoomPress={handleRoomPress}
          onMenuPress={(room) => {
            setSelectedRoom(room);
            setMenuVisible(true);
          }}
          currentUserId={userId}
        />
      </ScrollView>

      {/* 하단 고정 버튼 */}
      <View style={styles.fixedButtonContainer}>
        <Pressable
          style={[styles.Button, styles.groupButton]}
          onPress={() => openModal("create")}
        >
          <Text style={styles.ButtonText}>새로운 그룹 생성</Text>
        </Pressable>
        <Pressable
          style={[styles.Button2, styles.codeButton]}
          onPress={() => openModal("invite")}
        >
          <Text style={styles.ButtonText}>초대 코드로 입장하기</Text>
        </Pressable>
      </View>

      {/* 1. 생성/입장 입력창 */}
      <InputModal
        visible={modals.input}
        onClose={closeModal}
        isLoading={isLoading}
        type={modals.type}
        value={inputs.modalValue}
        onChangeText={setInputText}
        onAction={
          modals.type === "create" ? handleCreateGroup : handleJoinGroup
        }
      />

      {/* 2. 생성 결과창 */}
      <ResultModal
        visible={modals.result}
        onClose={closeModal}
        groupName={inputs.groupName}
        inviteCode={inputs.inviteCode}
        onCopy={handleCopyResultCode}
      />

      {/* 3. 하단 관리 메뉴 */}
      <MenuModal
        visible={modals.menu}
        onClose={closeModal}
        selectedRoom={selectedRoom}
        currentUserId={userId}
        onCopyInvite={handleCopyInvite}
        onRename={() => setRenameVisible(true)}
        onLeave={handleLeave}
      />

      {/* 4. 이름 변경창 */}
      <RenameModal
        visible={modals.rename}
        onClose={closeModal}
        value={inputs.renameValue}
        onChangeText={setRenameText}
        onConfirm={handleRename}
      />
    </SafeAreaView>
  );
};

export default MainHome;
