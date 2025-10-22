import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TopHeader from '../../components/TopHeader';

export default function PasswordChangeScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <TopHeader
        title="비밀번호 변경"
        showBack={true} 
        onBackPress={() => router.back()} 
        showIcons={false} 
      />
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          본인 확인을 위해 비밀번호를 입력해주세요
        </Text>

        <TextInput
          style={styles.input}
          placeholder="현재 비밀번호"
          placeholderTextColor={'#888'} 
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="변경할 비밀번호"
          placeholderTextColor={'#888'}
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
        />

        <TextInput
          style={styles.input}
          placeholder="변경할 비밀번호 확인"
          placeholderTextColor={'#888'}
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />

        <Pressable
          style={styles.button}
          onPress={() => console.log('변경하기 클릭')}
        >
          <Text style={styles.buttonText}>변경하기</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// (auth) 폴더의 스타일을 기반으로 재구성
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingTop: 30, // TopHeader가 있으므로 paddingTop 조정
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    backgroundColor: '#F5FFF5', // (auth) 스타일
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 20, // 간격 추가
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#7DBCE9', // (auth) 스타일
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20, // 인풋과의 간격
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});