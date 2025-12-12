import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 키 값 상수화
export const NOTI_SETTINGS_KEY = 'notificationSettings';

const SettingRow = ({ title, value, onValueChange, disabled = false }) => {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, disabled && styles.disabledText]}>{title}</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#53ACD9' }} 
        thumbColor={'#f4f3f4'}
        ios_backgroundColor="#3e3e3e"
        onValueChange={onValueChange}
        value={value}
        disabled={disabled}
      />
    </View>
  );
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  
  const [isAllEnabled, setIsAllEnabled] = useState(true);
  const [isStockEnabled, setIsStockEnabled] = useState(true);
  const [isExpiryEnabled, setIsExpiryEnabled] = useState(true);
  const [isMemberEnabled, setIsMemberEnabled] = useState(true);
  const [isPurchaseEnabled, setIsPurchaseEnabled] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem(NOTI_SETTINGS_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setIsAllEnabled(settings.all ?? true);
        setIsStockEnabled(settings.stock ?? true);
        setIsExpiryEnabled(settings.expiry ?? true);
        setIsMemberEnabled(settings.member ?? true);
        setIsPurchaseEnabled(settings.purchase ?? true);
      }
    } catch (e) {
      console.log('설정 로드 실패', e);
    }
  };

  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem(NOTI_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (e) {
      console.log('설정 저장 실패', e);
    }
  };

  // ▼▼▼ [수정] 전체 알림 제어 (켜면 다 켜지고, 끄면 다 꺼짐) ▼▼▼
  const toggleAllNotifications = (value) => {
    // 1. 전체 스위치 상태 변경
    setIsAllEnabled(value);

    // 2. 하위 스위치들도 '전체'와 똑같은 값으로 변경
    setIsStockEnabled(value);
    setIsExpiryEnabled(value);
    setIsMemberEnabled(value);
    setIsPurchaseEnabled(value);

    // 3. 변경된 모든 값을 저장
    saveSettings({
      all: value,
      stock: value,
      expiry: value,
      member: value,
      purchase: value,
    });
  };
  // ▲▲▲

  // 개별 토글 핸들러
  const handleToggle = (setter, key, value) => {
    setter(value);
    
    // 주의: 개별 토글을 켰다고 해서 '전체 알림' 스위치까지 자동으로 켜지게 할지는 선택 사항입니다.
    // 보통은 개별 동작은 독립적으로 두고, 전체 스위치는 '마스터 키' 역할만 합니다.
    saveSettings({
      all: isAllEnabled,
      stock: key === 'stock' ? value : isStockEnabled,
      expiry: key === 'expiry' ? value : isExpiryEnabled,
      member: key === 'member' ? value : isMemberEnabled,
      purchase: key === 'purchase' ? value : isPurchaseEnabled,
    });
  };

  return (    
      <View style={styles.container}>
        <SettingRow
          title="전체 알림 받기"
          value={isAllEnabled}
          onValueChange={toggleAllNotifications}
        />

        <View style={styles.divider} />

        <SettingRow
          title="재고 부족 알림"
          value={isStockEnabled}
          onValueChange={(val) => handleToggle(setIsStockEnabled, 'stock', val)}
          disabled={!isAllEnabled} 
        />
        <SettingRow
          title="유통기한 임박 알림"
          value={isExpiryEnabled}
          onValueChange={(val) => handleToggle(setIsExpiryEnabled, 'expiry', val)}
          disabled={!isAllEnabled} 
        />
        <SettingRow
          title="멤버 입장 알림"
          value={isMemberEnabled}
          onValueChange={(val) => handleToggle(setIsMemberEnabled, 'member', val)}
          disabled={!isAllEnabled} 
        />
        <SettingRow
          title="구매 완료 알림"
          value={isPurchaseEnabled}
          onValueChange={(val) => handleToggle(setIsPurchaseEnabled, 'purchase', val)}
          disabled={!isAllEnabled} 
        />
      </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 20, backgroundColor: 'white' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 20, backgroundColor: '#fff' },
  rowText: { fontSize: 16, color: '#333' },
  disabledText: { color: '#aaa' },
  divider: { height: 1, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', borderStyle: 'dashed', marginHorizontal: 20, marginVertical: 10 },
});