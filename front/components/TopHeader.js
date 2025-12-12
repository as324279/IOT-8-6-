import { useRouter, usePathname } from 'expo-router';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

// 아까 만든 키 값과 동일해야 합니다.
const NOTI_SETTINGS_KEY = 'notificationSettings';

const TopHeader = ({ showBack = false, showIcons = true, title, onBackPress }) => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [hasNew, setHasNew] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (showIcons) {
      const timer = setTimeout(() => {
        if (isMounted) checkUnread();
      }, 500); 
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }
  }, [pathname]);

  const checkUnread = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      // 1. 서버에서 알림 목록 가져오기
      const res = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifications = res.data.data || [];

      // 2. 내 알림 설정 가져오기
      const storedSettings = await AsyncStorage.getItem(NOTI_SETTINGS_KEY);
      let settings = { all: true, stock: true, expiry: true, member: true, purchase: true }; // 기본값

      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      }

      // 3. [핵심] 설정에 따라 필터링하고, 안 읽은 게 있는지 확인
      const hasUnreadItem = notifications.some(n => {
        // 이미 읽은 건 패스
        if (n.read === true || n.isRead === true) return false;

        // 전체 알림이 꺼져있으면 무조건 무시 (빨간불 X)
        if (settings.all === false) return false;

        // 주제(Topic)별 필터링
        // 백엔드에서 오는 topic 값(예: "STOCK")에 따라 설정을 확인합니다.
        // 백엔드 코드를 못 봤지만 보통 대문자로 옵니다. 상황에 맞게 수정하세요.
        const topic = n.topic ? n.topic.toUpperCase() : "";

        if (topic === "STOCK" && settings.stock === false) return false;
        if (topic === "EXPIRY" && settings.expiry === false) return false;
        if (topic === "MEMBER" && settings.member === false) return false; // 혹은 "GROUP"
        if (topic === "PURCHASE" && settings.purchase === false) return false;

        // 위 조건에 안 걸렸다면(설정이 켜져있다면), 유효한 안 읽은 알림임!
        return true;
      });

      setHasNew(hasUnreadItem);
      
    } catch (error) {
      console.log("알림 체크 실패:", error);
    }
  };

  const BackButton = () => (
      <Pressable style={styles.actionButtonContainer} onPress={onBackPress || (() => router.back())}>
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
      </Pressable>
  );

  const NotificationButton = () => (
      <Pressable 
          style={styles.actionButtonContainer} 
          onPress={() => {
            setHasNew(false); 
            router.push('/notification');
          }} 
      >
          <View>
            <MaterialIcons name="notifications" size={24} color="#000000" />
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 2, paddingHorizontal: 8, backgroundColor: '#53ACD9', width: '100%', height: 60 },
  leftContent: { width: 40, alignItems: 'flex-start' },
  rightContent: { width: 40, alignItems: 'flex-end' },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptySpace: { width: 40, height: 40 },
  actionButtonContainer: { padding: 8 },
  appName: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center' },
  badge: { position: 'absolute', right: 2, top: 2, width: 8, height: 8, borderRadius: 4, backgroundColor: 'red', borderWidth: 1, borderColor: '#53ACD9' }
});