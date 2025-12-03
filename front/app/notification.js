import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

// [임시 데이터]
const INITIAL_NOTIFICATIONS = [
    { id: '1', type: 'STOCK', title: '재고 부족', body: '햇반이 2개 남았습니다', time: '2시간 전' },
    { id: '2', type: 'EXPIRY', title: '유통기한 임박', body: '콩나물 유통기한 D-3일', time: '7시간 전' },
    { id: '3', type: 'MEMBER', title: '그룹 멤버 참여', body: '"홍길동"님이 참여했습니다', time: '2일 전' },
    { id: '4', type: 'NOTICE', title: '공지사항', body: '서버 점검 안내 (00:00 ~ 02:00)', time: '3일 전' },
];

const NotificationScreen = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);

    // 1. 전체 삭제 핸들러
    const handleDeleteAll = () => {
        if (notifications.length === 0) return;
        
        Alert.alert("전체 삭제", "모든 알림을 삭제하시겠습니까?", [
            { text: "취소", style: "cancel" },
            { 
                text: "삭제", 
                style: "destructive", 
                onPress: () => setNotifications([]) // API 필요
            }
        ]);
    };

    // 2. 개별 삭제 핸들러 (밀어서 삭제)
    const handleDeleteItem = (id) => {
        setNotifications(prev => prev.filter(item => item.id !== id));
        // TODO: 백엔드 개별 삭제 API
    };

    // 3. 타입별 아이콘 가져오기
    const getIconByType = (type) => {
        switch (type) {
            case 'STOCK': // 재고 부족 (노란색 주의)
                return <MaterialCommunityIcons name="alert" size={28} color="#FFC107" />;
            case 'EXPIRY': // 유통기한 (빨간색 시계)
                return <MaterialCommunityIcons name="clock-alert-outline" size={28} color="#FF5252" />;
            case 'MEMBER': // 멤버 (파란색 사람)
                return <Ionicons name="person-add-outline" size={28} color="#5DADE2" />;
            default: // 기타
                return <MaterialCommunityIcons name="bell-outline" size={28} color="#999" />;
        }
    };

    // 4. 스와이프 삭제
    const renderRightActions = (progress, dragX, id) => {
        const trans = dragX.interpolate({
            inputRange: [0, 50, 100, 101],
            outputRange: [-20, 0, 0, 1],
        });
        
        return (
            <TouchableOpacity onPress={() => handleDeleteItem(id)} style={styles.deleteAction}>
                <View style={styles.deleteActionContent}>
                    <MaterialCommunityIcons name="trash-can-outline" size={30} color="white" />
                    <Text style={styles.deleteText}>삭제</Text>
                </View>
            </TouchableOpacity>
        );
    };

    // 5. 알림 아이템 렌더링
    const renderItem = ({ item }) => (
        <Swipeable renderRightActions={(progress, dragX) => renderRightActions(progress, dragX, item.id)}>
            <View style={styles.itemContainer}>
                {/* 왼쪽 아이콘 */}
                <View style={styles.iconBox}>
                    {getIconByType(item.type)}
                </View>
                
                <View style={styles.textBox}>
                    <Text style={styles.itemTitle}>{item.title}</Text>
                    <Text style={styles.itemBody} numberOfLines={1}>{item.body}</Text>
                    <Text style={styles.itemTime}>{item.time}</Text>
                </View>
            </View>
        </Swipeable>
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
                    keyExtractor={item => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialCommunityIcons name="bell-sleep-outline" size={60} color="#ccc" />
                            <Text style={styles.emptyText}>새로운 알림이 없습니다.</Text>
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
    itemContainer: {
        flexDirection: 'row',
        padding: 20,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        alignItems: 'center',
    },
    iconBox: {
        marginRight: 15,
        width: 40,
        alignItems: 'center',
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

    // 스와이프 삭제 버튼 스타일
    deleteAction: {
        backgroundColor: '#FF5252',
        justifyContent: 'center',
        alignItems: 'center',
        width: 80,
        height: '100%',
    },
    deleteActionContent: {
        alignItems: 'center',
    },
    deleteText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 12,
        marginTop: 2,
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