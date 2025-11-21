import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { styles } from './HomeStyles';

const RoomList = ({ rooms, onRoomPress }) => {
    return (
        <View style={styles.roomList}>
            {rooms.map((room) => (
                <Pressable 
                    key={room.id} 
                    style={styles.roomCard}
                    onPress={() => onRoomPress(room.name)}
                >
                    <View style={styles.roomIconBox}>
                        <MaterialCommunityIcons name="home-variant-outline" size={32} color="#555" />
                        <Text style={styles.iconText}>방 아이콘</Text>
                    </View>

                    <View style={styles.roomInfo}>
                        <Text style={styles.roomName}>{room.name}</Text>
                        <Text style={styles.memberCount}>멤버 수 : {room.memberCount}명</Text>
                    </View>
                </Pressable>
            ))}
        </View>
    );
};

export default RoomList;