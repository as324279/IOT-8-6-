import { useRouter } from 'expo-router';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 

// [수정] onNotificationPress 제거 (컴포넌트 내부에서 처리)
const TopHeader = ({ showBack = false, showIcons = true, title, onBackPress }) =>{
  const router = useRouter();

  // 뒤로가기 버튼
  const BackButton = () => (
      <Pressable
          style={styles.actionButtonContainer}
          onPress={onBackPress || (() => router.back())} 
      >
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
      </Pressable>
  );

  // [수정] 알림 버튼: 직접 페이지 이동
  const NotificationButton = () => (
      <Pressable 
          style={styles.actionButtonContainer} 
          onPress={() => router.push('/notification')} // 👈 바로 이동!
      >
          <MaterialIcons name="notifications" size={24} color="#000000" />
          {/* (나중에 안 읽은 알림 있으면 여기에 빨간 점 Badge 추가 가능) */}
      </Pressable>
  );

  return (
    <>
      <StatusBar backgroundColor="#53ACD9" barStyle="dark-content" />
      <View style={styles.header}>
            {/* LEFT: 뒤로가기 */}
            <View style={styles.leftContent}>
                {showBack ? <BackButton /> : <View style={styles.emptySpace} />} 
            </View>

            {/* CENTER: 제목 */}
            <View style={styles.centerContent}>
                <Text style={styles.appName}>{title || '채움'}</Text>
            </View>

            {/* RIGHT: 알림 버튼 */}
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
});