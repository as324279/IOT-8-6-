import React from 'react';
import { View, Text, Pressable, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const RoomList = ({ rooms, onRoomPress, onMenuPress, currentUserId }) => {
    return (
        <View style={styles.listContainer}>
            {rooms.map((room) => {
                // 방장 여부 확인 (백엔드 데이터 구조에 따라 room.createdBy.userId 등으로 수정 필요)
                // 현재는 로직 구현을 위해 임시로 '내가 만든 방'이라고 가정하거나,
                // room 객체 안에 isOwner 필드가 있다고 가정하는 것이 좋습니다.
                // 여기서는 일단 모든 방에 대해 메뉴를 보여주고, MainHome에서 권한 처리를 합니다.
                
                return (
                    <Pressable 
                        key={room.id} 
                        style={({ pressed }) => [
                            styles.roomCard,
                            pressed && styles.pressedCard // 눌렀을 때 살짝 어두워지는 효과
                        ]}
                        onPress={() => onRoomPress(room)}
                    >
                        {/* 1. 왼쪽: 방 아이콘 */}
                        <View style={styles.iconBox}>
                            <MaterialCommunityIcons name="home-variant" size={28} color="#5DADE2" />
                        </View>

                        {/* 2. 가운데: 방 정보 */}
                        <View style={styles.infoBox}>
                            <View style={styles.titleRow}>
                                <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
                            </View>
                            <Text style={styles.memberCount}>멤버 {room.memberCount}명</Text>
                        </View>

                        {/* 3. 오른쪽: 메뉴 버튼 (점 3개) */}
                        <TouchableOpacity 
                            style={styles.menuButton}
                            onPress={(e) => {
                                e.stopPropagation(); // 카드 클릭 이벤트 방지
                                onMenuPress(room, 'menu');
                            }}
                        >
                            <MaterialCommunityIcons name="dots-vertical" size={24} color="#888" />
                        </TouchableOpacity>
                    </Pressable>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    listContainer: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    roomCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'white',
        marginBottom: 15,
        borderRadius: 16, // 둥근 모서리
        padding: 16,
        
        // 그림자 효과 (카드 느낌)
        elevation: 3, // 안드로이드 그림자
        shadowColor: '#000', // iOS 그림자
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    pressedCard: {
        backgroundColor: '#F5F5F5', // 눌렀을 때 피드백
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#EAF6FD', // 연한 파란 배경
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    infoBox: {
        flex: 1,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    roomName: {
        fontSize: 17,
        fontWeight: 'bold',
        color: '#333',
        maxWidth: '90%', // 이름이 길면 ... 처리
    },
    memberCount: {
        fontSize: 13,
        color: '#888',
    },
    menuButton: {
        padding: 8,
        marginRight: -8, // 터치 영역 확보하면서 위치 조정
    },
});

export default RoomList;