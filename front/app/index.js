import { useRouter } from 'expo-router';
import { Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

const FirstScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        -
        <Image
          source={require('../assets/images/projectlogo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        -
        <Pressable
          style={[styles.Button, styles.loginButton]}
          onPress={() => router.push('./(auth)/login')}
        >
          <Text style={styles.ButtonText}>로그인</Text>
        </Pressable>

        -
        <Pressable
          style={[styles.Button, styles.signButton]}
          onPress={() => router.push('./(auth)/signupScreen')}
        >
          <Text style={styles.ButtonText}>회원가입</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
};

export default FirstScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center', 
    paddingHorizontal: width * 0.1, 
  },
  logo: {
    width: width * 0.4, 
    height: height * 0.2, 
    marginBottom: height * 0.05, 
  },
  Button: {
    width: '100%',
    height: height * 0.050, 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: height * 0.015, 
  },
  ButtonText: {
    color: 'white',
    fontSize: width * 0.045, 
    fontWeight: 'bold',
  },
  loginButton: { backgroundColor: '#9CCC65' },
  signButton: { backgroundColor: '#5DADE2' },
});
