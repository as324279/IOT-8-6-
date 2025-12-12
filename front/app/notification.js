import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig";

// 설정 키 (설정 파일과 동일해야 함)
const NOTI_SETTINGS_KEY = 'notificationSettings';

const NotificationScreen = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    // [API] 내 알림 목록 조회 (필터링 로직 추가됨)
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            if (!token) return;

            // 1. 서버에서 데이터 가져오기
            const response = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data.data || [];

            // 2. 내 설정 가져오기
            const storedSettings = await AsyncStorage.getItem(NOTI_SETTINGS_KEY);
            let settings = { all: true, stock: true, expiry: true, member: true, purchase: true }; // 기본값

            if (storedSettings) {
                settings = JSON.parse(storedSettings);
            }

            // 3. 설정에 따라 필터링 (OFF된 주제는 목록에서 제외)
            const filteredData = data.filter(item => {
                // 전체 끄기면 목록도 싹 비움
                if (settings.all === false) return false;

                const topic = item.topic ? item.topic.toUpperCase() : "";

                if (topic === "LOW_STOCK" && settings.stock === false) return false; // STOCK? LOW_STOCK? 확인필요
                if (topic === "STOCK" && settings.stock === false) return false; 
                
                if (topic === "EXPIRY_SOON" && settings.expiry === false) return false;
                if (topic === "EXPIRY" && settings.expiry === false) return false;

                if (topic === "NEW_MEMBER" && settings.member === false) return false;
                if (topic === "MEMBER" && settings.member === false) return false;

                if (topic === "PURCHASE_DONE" && settings.purchase === false) return false;
                if (topic === "PURCHASE" && settings.purchase === false) return false;

                return true; // 살아남은 알림
            });

            setNotifications(filteredData);

        } catch (error) {
            console.error("알림 조회 실패:", error);
        } finally {
            setLoading(false);
        }
    };

    // ... (나머지 삭제 핸들러 및 렌더링 코드는 기존과 동일하므로 그대로 사용)
    const handleDeleteAll = () => {
        if (notifications.length === 0) return;
        Alert.alert("전체 삭제", "모든 알림을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { 
                text: "삭제", style: "destructive", 
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("userToken");
                        await axios.delete(`${API_BASE_URL}/api/v1/notifications`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setNotifications([]); 
                        Alert.alert("성공", "모든 알림이 삭제되었습니다.");
                    } catch (e) {
                        console.error("전체 삭제 실패:", e);
                        Alert.alert("오류", "삭제에 실패했습니다.");
                    }
                }
            }
        ]);
    };

    const handleDeleteItem = async (id) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            await axios.delete(`${API_BASE_URL}/api/v1/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifications(prev => prev.filter(item => item.notifId !== id));
        } catch (e) {
            console.error("개별 삭제 실패:", e);
            Alert.alert("오류", "삭제하지 못했습니다.");
        }
    };

    const getIconByType = (type) => {
        switch (type) {
            case 'LOW_STOCK': return <MaterialCommunityIcons name="alert" size={28} color="#FFC107" />;
            case 'EXPIRY_SOON': return <MaterialCommunityIcons name="clock-alert-outline" size={28} color="#FF5252" />;
            case 'NEW_MEMBER': return <Ionicons name="person-add-outline" size={28} color="#5DADE2" />;
            case 'PURCHASE_DONE': return <MaterialCommunityIcons name="shopping-outline" size={28} color="#4CAF50" />;
            default: return <MaterialCommunityIcons name="bell-outline" size={28} color="#999" />;
        }
    };

    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    const renderItem = ({ item }) => (
        <View style={styles.itemContainer}>
            <View style={styles.leftContent}>
                <View style={styles.iconBox}>
                    {getIconByType(item.topic)} 
                </View>
                <View style={styles.textBox}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody} numberOfLines={2}>{item.body}</Text>
                    <Text style={styles.itemTime}>{formatTime(item.sentAt)}</Text>
                </View>
            </View>
            <TouchableOpacity 
                onPress={() => handleDeleteItem(item.notifId)} 
                style={styles.deleteBtn}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialCommunityIcons name="close" size={20} color="#aaa" />
            </TouchableOpacity>
        </View>
    );

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>알림 목록</Text>
                    <TouchableOpacity onPress={handleDeleteAll} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={28} color="#555" />
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={notifications}
                    keyExtractor={item => item.notificationId || item.notifId} 
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="bell-sleep-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>
                                {loading ? "알림을 불러오는 중..." : "새로운 알림이 없습니다."}
                            </Text>
                        </View>
                    }
                />
            </SafeAreaView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15, paddingVertical: 15, backgroundColor: '#5DADE2' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    headerBtn: { padding: 5 },
    listContent: { paddingBottom: 50 },
    itemContainer: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', alignItems: 'flex-start' },
    leftContent: { flexDirection: 'row', flex: 1, marginRight: 10 },
    iconBox: { marginRight: 15, width: 30, alignItems: 'center', marginTop: 2 },
    textBox: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
    itemBody: { fontSize: 15, color: '#555', marginBottom: 6 },
    itemTime: { fontSize: 12, color: '#999' },
    deleteBtn: { padding: 5, marginTop: -5 },
    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 15, fontSize: 16, color: '#999' }
});

export default NotificationScreen;