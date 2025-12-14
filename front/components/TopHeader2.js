import { useRouter, usePathname } from 'expo-router'; // usePathname 추가 (화면 이동 감지용)
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig'; // 경로가 맞는지 확인해주세요

const TopHeader = ({ showBack = false, showIcons = true, title, onBackPress }) => {
  const router = useRouter();
  const pathname = usePathname(); // 현재 화면 경로 확인
  const [hasNew, setHasNew] = useState(false);

  // 화면이 바뀔 때마다(특히 다른 탭 갔다가 돌아올 때) 알림 체크
  useEffect(() => {
    if (showIcons) {
      checkUnread();
    }
  }, [pathname]); // pathname이 변경될 때마다 실행

const checkUnread = async () => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (!token) return;

    const res = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const notifications = res.data.data || [];
    
    const hasUnreadItem = notifications.some(n => {
        return (n.read === false) || (n.isRead === false);
    });
    
    setHasNew(hasUnreadItem);
    
  } catch (error) {
    console.log("알림 체크 실패:", error);
  }
};

  const BackButton = () => (
      <Pressable
          style={styles.actionButtonContainer}
          onPress={onBackPress || (() => router.back())} 
      >
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
      </Pressable>
  );

  const NotificationButton = () => (
      <Pressable 
          style={styles.actionButtonContainer} 
          onPress={() => {
            setHasNew(false); // 누르면 즉시 빨간 점 끄기 (사용자 경험상 좋음)
            router.push('/notification');
          }} 
      >
          <View>
            <MaterialIcons name="notifications" size={24} color="#000000" />
            {/* 빨간 점 (Badge) */}
            {hasNew && <View style={styles.badge} />}
          </View>
      </Pressable>
  );

  return (
    <>
      <StatusBar backgroundColor="#53ACD9" barStyle="dark-content" />
      <View style={styles.header}>
            <View style={styles.leftContent}>
                {showBack ? <BackButton /> : <View style={styles.emptySpace} />} 
            </View>

            <View style={styles.centerContent}>
                <Text style={styles.appName}>{title || '채움'}</Text>
            </View>

            <View style={styles.rightContent}>
                {showIcons ? <NotificationButton /> : <View style={styles.emptySpace} />}
            </View>
      </View>
    </>
  );
}

export default TopHeader;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: '#53ACD9',
    width: '100%',
    height: 60,
  },
  leftContent: { width: 40, alignItems: 'flex-start' },
  rightContent: { width: 40, alignItems: 'flex-end' },
  centerContent: {
    flex: 1, 
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySpace: { width: 40, height: 40 },
  actionButtonContainer: { padding: 8 },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    right: -2, // 아이콘 위치에 따라 미세 조정
    top: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'red',
    zIndex: 10,
  }
});