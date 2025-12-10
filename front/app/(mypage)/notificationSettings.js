import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import { StyleSheet, Switch, Text, View, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // 추가

const SettingRow = ({ title, value, onValueChange, disabled = false }) => {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowText, disabled && styles.disabledText]}>{title}</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#53ACD9' }} 
        thumbColor={value ? '#f4f3f4' : '#f4f3f4'}
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
  
  // 초기값은 모두 true로 설정
  const [isAllEnabled, setIsAllEnabled] = useState(true);
  const [isStockEnabled, setIsStockEnabled] = useState(true);
  const [isExpiryEnabled, setIsExpiryEnabled] = useState(true);
  const [isMemberEnabled, setIsMemberEnabled] = useState(true);
  const [isPurchaseEnabled, setIsPurchaseEnabled] = useState(true); // [추가] 구매 완료

  // 1. 화면 진입 시 저장된 설정 불러오기
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedSettings = await AsyncStorage.getItem('notificationSettings');
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        setIsAllEnabled(settings.all);
        setIsStockEnabled(settings.stock);
        setIsExpiryEnabled(settings.expiry);
        setIsMemberEnabled(settings.member);
        setIsPurchaseEnabled(settings.purchase ?? true); // 없으면 기본 true
      }
    } catch (e) {
      console.log('설정 로드 실패', e);
    }
  };

  // 2. 설정이 바뀔 때마다 저장하는 함수
  const saveSettings = async (newSettings) => {
    try {
      await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
    } catch (e) {
      console.log('설정 저장 실패', e);
    }
  };

  // 전체 알림 제어
  const toggleAllNotifications = (value) => {
    setIsAllEnabled(value);
    // UI상으로는 개별 토글을 굳이 안 꺼도 되지만, 
    // UX상 전체를 끄면 나머지도 꺼진 것처럼 보이게 하거나 유지할 수 있습니다.
    // 여기서는 값 자체는 유지하되 UI에서 disabled 처리하는 방식을 씁니다.
    // 저장
    saveSettings({
      all: value,
      stock: isStockEnabled,
      expiry: isExpiryEnabled,
      member: isMemberEnabled,
      purchase: isPurchaseEnabled,
    });
  };

  // 개별 알림 제어 핸들러 생성기
  const handleToggle = (setter, key, value) => {
    setter(value);
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

        {/* 점선 구분선 */}
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
        {/* [추가] 구매 완료 알림 */}
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
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  disabledText: {
    color: '#aaa', // 비활성화 시 흐리게
  },
  divider: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderStyle: 'dashed',
    marginHorizontal: 20,
    marginVertical: 10,
  },
});