import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../../config/apiConfig";
import { useAuth } from "../AuthProvider"

export default function CommentModal({ visible, onClose, listId }) {
  const [comments, setComments] = useState([]);
  const [input, setInput] = useState("");
  const [MyName, setMyName] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    if (visible && listId) {
      fetchComments();
    }
  }, [visible, listId]);

  useEffect(() => {
    const fetchMyInfo = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    const res = await axios.get(`${API_BASE_URL}/api/v1/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const userData = res.data.data;
    setMyName(userData.name);   // 🔥 사용자 이름 저장
  } catch (err) {
    console.log("내 정보 조회 실패:", err);
  }
};

    fetchMyInfo();
  }, [token]);


  const fetchComments = async () => {
    if (!listId) return;

    try {
      const token = await AsyncStorage.getItem("userToken");

      const res = await axios.get(
        `${API_BASE_URL}/api/v1/shopping-lists/${listId}/comments`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("🔥 서버 댓글 응답:", res.data.data);

      setComments(res.data.data);
    } catch (e) {
      console.log("댓글 조회 실패:", e);
    }
  };

  const handleAdd = async () => {
    if (!input.trim() || !listId) return;

    try {
      const token = await AsyncStorage.getItem("userToken");

      await axios.post(
        `${API_BASE_URL}/api/v1/shopping-lists/${listId}/comments`,
        { body: input },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInput("");
      fetchComments();
    } catch (e) {
      console.log("댓글 작성 실패:", e);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      await axios.delete(
        `${API_BASE_URL}/api/v1/shopping-comments/${commentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchComments();
    } catch (e) {
      console.log("댓글 삭제 실패:", e);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.overlay}>
          <View style={styles.container}>
            {/* 헤더 */}
            <View style={styles.header}>
              <Text style={styles.headerText}>댓글</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={26} color="#333" />
              </TouchableOpacity>
            </View>

            {/* 댓글 목록 */}
            <FlatList
              data={comments}
              keyExtractor={(item) => String(item.commentId)}
              renderItem={({ item }) => (
                <View style={styles.commentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentUser}>{item.authorName}</Text>
                    <Text style={styles.commentBody}>{item.body}</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleDelete(item.commentId)}
                    style={styles.deleteBtn}
                  >
                    <Ionicons name="trash-outline" size={20} color="#ff4d4f" />
                  </TouchableOpacity>
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>아직 댓글이 없습니다.</Text>
              }
            />

            {/* 댓글 입력창 */}
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="댓글을 입력하세요..."
                value={input}
                onChangeText={setInput}
              />
              <TouchableOpacity style={styles.sendBtn} onPress={handleAdd}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "70%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  headerText: { fontSize: 18, fontWeight: "bold" },
  commentRow: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  commentUser: { fontWeight: "bold", color: "#333" },
  commentBody: { color: "#555", marginTop: 3 },
  deleteBtn: { padding: 8 },
  emptyText: {
    textAlign: "center",
    color: "#aaa",
    paddingVertical: 20,
  },
  inputRow: {
    flexDirection: "row",
    marginTop: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  sendBtn: {
    backgroundColor: "#5DADE2",
    padding: 12,
    borderRadius: 25,
    marginLeft: 10,
  },
});
