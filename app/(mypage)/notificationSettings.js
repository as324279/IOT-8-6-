import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';

const SettingRow = ({ title, value, onValueChange, disabled = false }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.rowText}>{title}</Text>
      <Switch
        trackColor={{ false: '#767577', true: '#81b0ff' }} 
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
  const [isAllEnabled, setIsAllEnabled] = useState(true);
  const [isStockEnabled, setIsStockEnabled] = useState(true);
  const [isExpiryEnabled, setIsExpiryEnabled] = useState(true);
  const [isMemberEnabled, setIsMemberEnabled] = useState(true);

  // '전체 알림 받기' 토글 시 모든 하위 알림을 제어
  const toggleAllNotifications = (value) => {
    setIsAllEnabled(value);
    setIsStockEnabled(value);
    setIsExpiryEnabled(value);
    setIsMemberEnabled(value);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TopHeader
        title="알림 설정"
        showBack={true} // 뒤로가기 버튼 표시
        onBackPress={() => router.back()} // 뒤로가기 기능
        showIcons={false} // 우측 아이콘 숨김
      />
      <View style={styles.container}>
        <SettingRow
          title="전체 알림 받기"
          value={isAllEnabled}
          onValueChange={toggleAllNotifications}
        />

        {/* 이미지의 점선 */}
        <View style={styles.divider} />

        <SettingRow
          title="재고 부족 알림"
          value={isStockEnabled}
          onValueChange={setIsStockEnabled}
          disabled={!isAllEnabled} 
        />
        <SettingRow
          title="유통기한 임박 알림"
          value={isExpiryEnabled}
          onValueChange={setIsExpiryEnabled}
          disabled={!isAllEnabled} 
        />
        <SettingRow
          title="멤버 입장 알림"
          value={isMemberEnabled}
          onValueChange={setIsMemberEnabled}
          disabled={!isAllEnabled} 
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingTop: 20, // TopHeader가 있으므로 paddingTop 조정
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
  },
  divider: {
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderStyle: 'dashed', // 점선
    marginHorizontal: 20,
    marginVertical: 10,
  },
});