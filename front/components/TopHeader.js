import { useRouter } from 'expo-router';
import { Image, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'; 

// [수정] onNotificationPress와 onBackPress 속성 추가
const TopHeader = ({ showBack = false, showIcons = true, title, onNotificationPress, onBackPress }) =>{
  const router = useRouter();

  // [추가] 뒤로가기 버튼 컴포넌트
  const BackButton = () => (
      <Pressable
          style={styles.actionButtonContainer}
          // [핵심] onBackPress 속성이 전달되면 그 함수를 사용하고, 아니면 router.back()을 기본으로 사용합니다.
          // 이 부분이 mypage 레이아웃의 오류를 해결합니다.
          onPress={onBackPress || (() => router.back())} 
      >
          <MaterialIcons name="arrow-back" size={24} color="#000000" />
      </Pressable>
  );

  // [추가] 알림 버튼 컴포넌트 (기존 로직 유지)
  const NotificationButton = () => (
      <Pressable 
          style={styles.actionButtonContainer} 
          onPress={onNotificationPress} 
      >
          <MaterialIcons name="notifications" size={24} color="#000000" />
      </Pressable>
  );

  return (
    <>
      <StatusBar backgroundColor="#53ACD9" barStyle="dark-content" />
      <View style={styles.header}>

            {/* LEFT SECTION: 뒤로가기 버튼 */}
            <View style={styles.leftContent}>
                {/* [수정] showBack이 true일 때만 BackButton 표시 */}
                {showBack ? <BackButton /> : <View style={styles.emptySpace} />} 
            </View>

            {/* CENTER SECTION: 제목 (로고 컨테이너 제거 후 중앙 제목만 남김) */}
            <View style={styles.centerContent}>
                <Text style={styles.appName}>{title || '채움'}</Text>
            </View>

            {/* RIGHT SECTION: 알림 버튼 */}
            <View style={styles.rightContent}>
                {/* [수정] showIcons가 true일 때만 NotificationButton 표시 */}
                {showIcons ? <NotificationButton /> : <View style={styles.emptySpace} />}
            </View>

      </View>
    </>
  );
}
export default TopHeader;

// [수정] 스타일을 3분할 Flexbox 레이아웃으로 변경 (오류 방지 및 중앙 정렬)
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
  
  // [추가] 3분할 레이아웃 스타일
  leftContent: {
    width: 40, // 뒤로가기 버튼 공간 확보
    alignItems: 'flex-start',
  },
  rightContent: {
    width: 40, // 알림 버튼 공간 확보
    alignItems: 'flex-end',
  },
  centerContent: {
    flex: 1, // 중앙이 공간을 최대한 차지하여 제목을 중앙에 유지
    alignItems: 'center',
    justifyContent: 'center',
  },
  // [추가] 버튼이 없을 때 빈 공간을 채워 제목을 중앙에 고정
  emptySpace: {
    width: 40, 
    height: 40, 
  },
  // [추가] 버튼 자체의 스타일
  actionButtonContainer: {
    padding: 8,
  },
  appName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  // [삭제] 기존의 absolute position 관련 스타일들은 모두 제거됨
});