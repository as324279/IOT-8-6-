import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { TextInput } from "react-native-paper";
import { styles } from "./HomeStyles";
import { MaterialCommunityIcons } from "@expo/vector-icons";

// 입력 모달 (생성/입장)
export const InputModal = ({
  visible,
  onClose,
  type,
  value,
  onChangeText,
  onAction,
  isLoading,
}) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.moadlView}>
        <View style={styles.viewContainer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={type === "create" ? "#5DADE2" : "#9CCC65"}
              />
              <Text style={styles.loadingText}>
                {type === "create" ? "그룹 생성 중..." : "그룹 입장 중..."}
              </Text>
            </View>
          ) : (
            <>
              <Text
                style={[
                  styles.viewText,
                  { color: type === "create" ? "#5DADE2" : "#9CCC65" },
                ]}
              >
                {type === "create"
                  ? "생성할 그룹 이름을 입력하세요"
                  : "초대 코드를 입력하세요"}
              </Text>
              <View style={styles.Row}>
                <TextInput
                  value={value}
                  onChangeText={onChangeText}
                  style={styles.input}
                  placeholder={type === "create" ? "그룹 이름" : "초대 코드"}
                  mode="outlined"
                  dense
                />
                <Pressable
                  style={[
                    styles.modalbutton,
                    {
                      backgroundColor:
                        type === "create" ? "#5DADE2" : "#9CCC65",
                    },
                  ]}
                  onPress={onAction}
                >
                  <Text style={styles.buttontext}>
                    {type === "create" ? "생성" : "입장"}
                  </Text>
                </Pressable>
              </View>
              <Pressable onPress={onClose} style={styles.closeButton}>
                <Text style={styles.modalText}>닫기</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

// 결과 모달 (초대코드 표시)
export const ResultModal = ({
  visible,
  onClose,
  groupName,
  inviteCode,
  onCopy,
}) => {
  return (
    <Modal
      animationType="slide"
      visible={visible}
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.moadlView}>
        <View style={styles.viewContainer}>
          <Text style={styles.resultTitle}>🎉 그룹 생성 완료!</Text>
          <Text style={styles.resultSubTitle}>
            {groupName} 그룹이 만들어졌습니다.
          </Text>
          <Text style={styles.resultInfo}>
            아래 코드를 복사해 그룹원들에게 공유하세요.
          </Text>

          <Pressable onPress={onCopy} style={styles.codeContainer}>
            <Text style={styles.codeText}>{inviteCode}</Text>
            <Text style={styles.copyText}>(클릭하여 복사)</Text>
          </Pressable>

          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.modalText}>닫기</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
};

// ✅ [추가] 하단 관리 메뉴 모달 (점 3개 눌렀을 때)
export const MenuModal = ({
  visible,
  onClose,
  selectedRoom,
  currentUserId,
  onCopyInvite,
  onRename,
  onLeave,
}) => {
  // 방장 여부 확인
  const isOwner = selectedRoom?.ownerId === currentUserId;

  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="fade"
    >
      <TouchableOpacity
        style={localStyles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={localStyles.menuSheet}>
          <Text style={localStyles.menuTitle}>{selectedRoom?.name} 관리</Text>

          {/* 초대 코드 복사 */}
          <TouchableOpacity style={localStyles.menuItem} onPress={onCopyInvite}>
            <MaterialCommunityIcons
              name="content-copy"
              size={24}
              color="#555"
            />
            <Text style={localStyles.menuText}>새 초대 코드 복사</Text>
          </TouchableOpacity>

          {/* 이름 변경 (방장만) */}
          {isOwner && (
            <TouchableOpacity style={localStyles.menuItem} onPress={onRename}>
              <MaterialCommunityIcons
                name="pencil-outline"
                size={24}
                color="#555"
              />
              <Text style={localStyles.menuText}>그룹 이름 변경</Text>
            </TouchableOpacity>
          )}

          {/* 나가기/삭제 */}
          <TouchableOpacity
            style={[localStyles.menuItem, { borderBottomWidth: 0 }]}
            onPress={onLeave}
          >
            <MaterialCommunityIcons
              name={isOwner ? "trash-can-outline" : "exit-to-app"}
              size={24}
              color="#FF5252"
            />
            <Text style={[localStyles.menuText, { color: "#FF5252" }]}>
              {isOwner ? "그룹 삭제 (방장)" : "그룹 나가기"}
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// ✅ [추가] 이름 변경 입력 모달
export const RenameModal = ({
  visible,
  onClose,
  value,
  onChangeText,
  onConfirm,
}) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      animationType="slide"
    >
      <View style={localStyles.modalOverlay}>
        <View style={localStyles.renameBox}>
          <Text style={localStyles.renameTitle}>그룹 이름 변경</Text>
          <TextInput
            style={localStyles.renameInput}
            value={value}
            onChangeText={onChangeText}
            placeholder="새 이름을 입력하세요"
          />
          <View style={localStyles.renameButtons}>
            <TouchableOpacity onPress={onClose} style={localStyles.cancelBtn}>
              <Text style={{ color: "#666" }}>취소</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onConfirm}
              style={localStyles.confirmBtn}
            >
              <Text style={{ color: "white", fontWeight: "bold" }}>변경</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// 모달 전용 스타일 (기존 MainHome.js에 있던 localStyles 가져옴)
const localStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  menuSheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
    textAlign: "center",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: { fontSize: 16, marginLeft: 15, color: "#333" },
  renameBox: {
    backgroundColor: "white",
    width: "80%",
    borderRadius: 15,
    padding: 20,
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto",
    elevation: 5,
  },
  renameTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15 },
  renameInput: {
    borderBottomWidth: 1,
    borderColor: "#5DADE2",
    fontSize: 16,
    padding: 5,
    marginBottom: 20,
  },
  renameButtons: { flexDirection: "row", justifyContent: "flex-end" },
  cancelBtn: { padding: 10, marginRight: 10 },
  confirmBtn: {
    backgroundColor: "#5DADE2",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
});
