import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuth } from '../../components/AuthProvider';
import { API_BASE_URL } from '../../config/apiConfig';

export default function PasswordChangeScreen() {
  const router = useRouter();
  const { token, signOut } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const isMismatch = newPassword && confirmPassword && newPassword !== confirmPassword;
  const isButtonEnabled = currentPassword && newPassword && confirmPassword && !isMismatch;

  const handleChangePassword = async () => {
    if (isMismatch) {
        Alert.alert("오류", "새 비밀번호가 일치하지 않습니다.");
        return;
    }

    try {
        await axios.put(
            `${API_BASE_URL}/api/v1/users/me/password`,
            {
                currentPassword: currentPassword,
                newPassword: newPassword
            },
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );

        Alert.alert(
            "변경 성공", 
            "비밀번호가 변경되었습니다.\n보안을 위해 다시 로그인해주세요.",
            [
                {
                    text: "확인",
                    onPress: async () => {
                        await signOut(); 
                        router.replace('/login'); 
                    }
                }
            ]
        );

    } catch (error) {
        const msg = error.response?.data?.message || "현재 비밀번호가 틀렸거나 오류가 발생했습니다.";
        Alert.alert("변경 실패", msg);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          본인 확인을 위해 비밀번호를 입력해주세요
        </Text>

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="현재 비밀번호"
                placeholderTextColor={'#888'} 
                secureTextEntry={!showCurrent}
                value={currentPassword}
                onChangeText={setCurrentPassword}
            />
            <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeIcon}>
                <Ionicons name={showCurrent ? "eye-off" : "eye"} size={20} color="gray" />
            </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="변경할 비밀번호"
                placeholderTextColor={'#888'}
                secureTextEntry={!showNew}
                value={newPassword}
                onChangeText={setNewPassword}
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
                <Ionicons name={showNew ? "eye-off" : "eye"} size={20} color="gray" />
            </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder="변경할 비밀번호 확인"
                placeholderTextColor={'#888'}
                secureTextEntry={!showConfirm}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeIcon}>
                <Ionicons name={showConfirm ? "eye-off" : "eye"} size={20} color="gray" />
            </TouchableOpacity>
        </View>

        <View style={styles.errorContainer}>
            {isMismatch && <Text style={styles.errorText}>새 비밀번호가 일치하지 않습니다.</Text>}
        </View>

        <Pressable
          style={[styles.button, !isButtonEnabled && styles.disabledButton]}
          onPress={handleChangePassword}
          disabled={!isButtonEnabled}
        >
          <Text style={styles.buttonText}>변경하기</Text>
        </Pressable>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: 30, 
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5FFF5', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    marginBottom: 15,
    height: 50,
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    height: '100%',
  },
  eyeIcon: {
      padding: 5,
  },
  errorContainer: {
      height: 20,
      marginBottom: 10,
  },
  errorText: {
      color: '#F44336',
      fontSize: 13,
      fontWeight: 'bold',
  },
  button: {
    width: '100%',
    height: 50,
    backgroundColor: '#7DBCE9', 
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10, 
  },
  disabledButton: {
      backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});