// app/intro.js
import { View, Text, StyleSheet, ImageBackground, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function IntroScreen() {
  const router = useRouter();

  

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/images/architecture-1171462_1280.jpg')}  // 배경 이미지
        style={styles.bg}
        resizeMode="cover"
      >
        {/* 어두운 그라데이션 레이어 */}
        <LinearGradient
          colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.8)']}
          style={styles.overlay}
        >
          {/* 상단 로고 / 타이틀 영역 */}
          <View style={styles.topArea}>
            <Text style={styles.logoText}>채움</Text>
            <Text style={styles.subtitle}>
              우리 집 장바구니, 한 번에 채우기
            </Text>
          </View>

          {/* 하단 버튼 영역 */}
          <View style={styles.bottomArea}>
            <Pressable style={styles.mainButton} onPress={() => router.push('./(auth)/login')}>
              <Text style={styles.mainButtonText}>로그인</Text>
            </Pressable>

            <Pressable style={styles.mainButton} onPress={() => router.push('./(auth)/signupScreen')}>
              <Text style={styles.mainButtonText}>회원가입</Text>
            </Pressable>

            <Pressable onPress={() => router.push('/login')}>
              <Text style={styles.subButtonText}>이미 계정이 있다면 로그인</Text>
            </Pressable>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  bg: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  topArea: {
    marginTop: 40,
  },
  logoText: {
    fontSize: 40,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 3,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 16,
    color: '#f5f5f5',
  },
  bottomArea: {
    marginBottom: 40,
  },
  mainButton: {
    backgroundColor: '#FFB300', // 채움 포인트 컬러 느낌으로 변경해도 됨
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom:20
  },
  mainButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  subButtonText: {
    marginTop: 16,
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});