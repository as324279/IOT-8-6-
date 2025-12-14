import { useRouter, usePathname, useFocusEffect } from 'expo-router';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 
import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const NOTI_SETTINGS_KEY = 'notificationSettings';

const TopHeader = ({ showBack = false, showIcons = true, title, onBackPress, onNotificationPress }) => {
  const router = useRouter();
  const pathname = usePathname(); 
  const [hasNew, setHasNew] = useState(false);

  // 화면이 포커스될 때마다 실행
  useFocusEffect(
    useCallback(() => {
      if (showIcons) {
        checkUnread();
      }
    }, [pathname])
  );

  const checkUnread = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      if (!token) return;

      const res = await axios.get(`${API_BASE_URL}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notifications = res.data.data || [];

      // 설정 가져오기
      const storedSettings = await AsyncStorage.getItem(NOTI_SETTINGS_KEY);
      let settings = { all: true, stock: true, expiry: true, member: true, purchase: true }; 
      if (storedSettings) {
        settings = JSON.parse(storedSettings);
      }

      console.log("=== [알림 체크 시작] ===");
      console.log("현재 설정 상태:", settings);

      // 필터링 로직
      const hasUnreadItem = notifications.some(n => {
        // 1. 이미 읽은 건 패스
        if (n.read === true || n.isRead === true) return false;

        const topic = n.topic ? n.topic.toUpperCase() : "없음";

        // 2. 로그 찍어보기 (범인 색출)
        console.log(`알림 발견! 제목: ${n.title}, 토픽: ${topic}, 설정값: ${settings.member}`);

        // 전체 끄기
        if (settings.all === false) return false;

        // 토픽별 필터링
        if ((topic === "STOCK" || topic === "LOW_STOCK") && settings.stock === false) {
            console.log("-> 재고 알림이라 무시함");
            return false;
        }
        if ((topic === "EXPIRY" || topic === "EXPIRY_SOON") && settings.expiry === false) {
            console.log("-> 유통기한 알림이라 무시함");
            return false;
        }
        if ((topic === "MEMBER" || topic === "NEW_MEMBER" || topic === "GROUP") && settings.member === false) {
            console.log("-> 멤버 알림이라 무시함");
            return false;
        }
        if ((topic === "PURCHASE" || topic === "PURCHASE_DONE") && settings.purchase === false) {
            console.log("-> 구매 알림이라 무시함");
            return false;
        }

        // 여기까지 왔으면 살아남은 알림!
        console.log("🚨 범인 검거! 빨간불 킨 알림:", n.title);
        return true;
      });

      console.log("최종 결과(빨간불 켜짐?):", hasUnreadItem);
      setHasNew(hasUnreadItem);
      
    } catch (error) {
      console.log("헤더 알림 체크 실패:", error);
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
            if (onNotificationPress) {
                onNotificationPress();
            } else {
                setHasNew(false); 
                router.push('/notification');
            }
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