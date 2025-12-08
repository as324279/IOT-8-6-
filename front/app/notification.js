import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiConfig"; // API 주소 설정 파일

const NotificationScreen = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // 1. 화면에 들어올 때마다 서버에서 알림 목록 새로고침
    useFocusEffect(
        useCallback(() => {
            fetchNotifications();
        }, [])
    );

    // [API] 내 알림 목록 조회
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("userToken");
            if (!token) {
                // 로그인 안 된 상태면 무시 혹은 로그인 화면으로
                return;
            }

            const response = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // 백엔드 응답: { status: "OK", data: [...] }
            // 최신 알림이 위로 오도록(이미 정렬되어 올 수도 있지만) 확인
            const data = response.data.data;
            setNotifications(data); 

        } catch (error) {
            console.error("알림 조회 실패:", error);
            // Alert.alert("오류", "알림을 불러오지 못했습니다.");
        } finally {
            setLoading(false);
        }
    };

    // [API] 전체 삭제 핸들러
    const handleDeleteAll = () => {
        if (notifications.length === 0) return;
        
        Alert.alert("전체 삭제", "모든 알림을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { 
                text: "삭제", 
                style: "destructive", 
                onPress: async () => {
                    try {
                        const token = await AsyncStorage.getItem("userToken");
                        await axios.delete(`${API_BASE_URL}/api/v1/notifications`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        setNotifications([]); // 화면에서도 즉시 비움
                        Alert.alert("성공", "모든 알림이 삭제되었습니다.");
                    } catch (e) {
                        console.error("전체 삭제 실패:", e);
                        Alert.alert("오류", "삭제에 실패했습니다.");
                    }
                }
            }
        ]);
    };

// [API] 개별 삭제 핸들러
    const handleDeleteItem = async (id) => {
        try {
            const token = await AsyncStorage.getItem("userToken");
            // URL은 그대로 /notifications/{id} 형식이면 id만 넘기면 됩니다.
            await axios.delete(`${API_BASE_URL}/api/v1/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            // ✅ 수정됨: 목록에서 지울 때도 notifId로 비교
            setNotifications(prev => prev.filter(item => item.notifId !== id));
        } catch (e) {
            console.error("개별 삭제 실패:", e);
            Alert.alert("오류", "삭제하지 못했습니다.");
        }
    };

    // 3. 타입별 아이콘 가져오기 (백엔드 Topic 기준)
    const getIconByType = (type) => {
        switch (type) {
            case 'LOW_STOCK': // 재고 부족 (기존 유지)
                return <MaterialCommunityIcons name="alert" size={28} color="#FFC107" />;
            
            case 'EXPIRY_SOON': // ✅ 유통기한 임박 (이름 변경됨)
                return <MaterialCommunityIcons name="clock-alert-outline" size={28} color="#FF5252" />;
            
            case 'NEW_MEMBER': // ✅ 새 멤버 가입 (이름 변경됨)
                return <Ionicons name="person-add-outline" size={28} color="#5DADE2" />;
            
            case 'PURCHASE_DONE': // ✅ 구매 완료 (새로 추가됨)
                return <MaterialCommunityIcons name="shopping-outline" size={28} color="#4CAF50" />;
                
            default: // 기타
                return <MaterialCommunityIcons name="bell-outline" size={28} color="#999" />;
        }
    };

    // 날짜 포맷팅 함수 (예: 2024-05-20T10:00... -> 2024-05-20 10:00)
    const formatTime = (isoString) => {
        if (!isoString) return "";
        const date = new Date(isoString);
        return date.toLocaleString(); // 간단하게 기기 설정에 맞는 시간 표시
        // 또는 원하는 포맷으로 커스텀 가능
    };


// 5. 알림 아이템 렌더링
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

            {/* 오른쪽 삭제 버튼 */}
            <TouchableOpacity 
                // ✅ 수정됨: item.id 대신 item.notifId 사용
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
                {/* --- 헤더 (파란색 배경) --- */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="arrow-left" size={28} color="black" />
                    </TouchableOpacity>
                    
                    <Text style={styles.headerTitle}>알림 목록</Text>
                    
                    {/* 전체 삭제 버튼 (휴지통 아이콘) */}
                    <TouchableOpacity onPress={handleDeleteAll} style={styles.headerBtn}>
                        <MaterialCommunityIcons name="trash-can-outline" size={28} color="#555" />
                    </TouchableOpacity>
                </View>

                {/* --- 알림 리스트 --- */}
                <FlatList
                    data={notifications}
                    // 백엔드 DTO에 따라 고유 ID가 notificationId 일 확률이 높습니다.
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
    
    // 헤더 스타일
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: '#5DADE2', 
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000', 
    },
    headerBtn: {
        padding: 5,
    },

    // 리스트 스타일
    listContent: { paddingBottom: 50 },
    
    // [수정] 아이템 컨테이너 (X 버튼 배치를 위해 수정)
    itemContainer: {
        flexDirection: 'row', // 가로 배치
        justifyContent: 'space-between', // 내용물과 X 버튼 사이 벌리기
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'flex-start', // 위쪽 정렬
    },
    // [추가] 왼쪽 내용물 묶음 (아이콘 + 텍스트)
    leftContent: {
        flexDirection: 'row',
        flex: 1, // 남은 공간 다 차지
        marginRight: 10, // X 버튼과 간격
    },
    iconBox: {
        marginRight: 15,
        width: 30,
        alignItems: 'center',
        marginTop: 2, // 텍스트 줄맞춤 보정
    },
    textBox: {
        flex: 1,
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    itemBody: {
        fontSize: 15,
        color: '#555',
        marginBottom: 6,
    },
    itemTime: {
        fontSize: 12,
        color: '#999',
    },

    // [추가] 개별 삭제(X) 버튼 스타일
    deleteBtn: {
        padding: 5,
        marginTop: -5, // 살짝 위로
    },

    // 빈 화면 스타일
    emptyContainer: {
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        marginTop: 15,
        fontSize: 16,
        color: '#999',
    }
});
export default NotificationScreen;