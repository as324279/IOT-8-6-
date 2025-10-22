import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const MenuButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity style={styles.menuButton} onPress={onPress}>
      <Text style={styles.menuText}>{title}</Text>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#8e8e8e" />
    </TouchableOpacity>
  );
};

export default function MyPageScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      
      <Stack.Screen options={{ title: '마이페이지' }} />

      <View style={styles.profileSection}>
        <TouchableOpacity style={styles.profileImageContainer}>
          <MaterialCommunityIcons name="camera-outline" size={40} color="#8e8e8e" />
        </TouchableOpacity>
        
        <Text style={styles.nickname}>닉네임</Text>
        
        <TouchableOpacity>
          <MaterialCommunityIcons name="pencil-outline" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.menuGroup}>
        <MenuButton 
          title="비밀번호 변경" 
          onPress={() => router.push('./passwordChange')} 
        />
        <MenuButton 
          title="알림 설정" 
          onPress={() => router.push('./notificationSettings')} 
        />
        <MenuButton title="공지사항" onPress={() => console.log('공지사항 클릭')} />
        <MenuButton title="서비스 문의" onPress={() => console.log('서비스 문의 클릭')} />
      </View>

      <View style={styles.logoutSection}>
        <TouchableOpacity style={styles.logoutButton} onPress={() => console.log('로그아웃 클릭')}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.deleteAccountContainer} onPress={() => console.log('계정 탈퇴 클릭')}>
        <Text style={styles.deleteAccountText}>계정 탈퇴</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// styles는 기존과 동일합니다.
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e9e9e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  menuGroup: {
    marginTop: 10,
    backgroundColor: '#fff',
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuText: {
    flex: 1,
    fontSize: 16,
  },
  logoutSection: {
    marginTop: 20,
    backgroundColor: '#fff',
  },
  logoutButton: {
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutText: {
    fontSize: 16,
    color: '#e74c3c',
  },
  deleteAccountContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'flex-end',
    paddingBottom: 40,
  },
  deleteAccountText: {
    fontSize: 12,
    color: '#8e8e8e',
    textDecorationLine: 'underline',
  },
});